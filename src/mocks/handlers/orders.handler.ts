import { http, HttpResponse } from "msw";
import { z } from "zod";
import type { Quote } from "@/features/cart/domain/quote";
import type { Order, OrderItem } from "@/features/orders/domain/order";
import {
  isValidEnsName,
  isValidWalletAddress,
  walletProviderIds,
} from "@/features/wallets/domain/wallet";
import { isEthString, type EthString } from "@/shared/domain/eth";
import { ConflictCode, type FieldErrors } from "@/shared/domain/errors";
import { networkIds, type NetworkId } from "@/shared/domain/network";
import { getDb, saveDb } from "../db/store";
import { authenticate, unauthorizedResponse } from "../lib/auth";
import { buildQuote } from "../lib/quote";
import {
  maybeFinalizeOrder,
  ORDER_CONFIRM_DELAY_MS,
  scheduleOrderFinalization,
} from "../lib/realtime";
import { apiError, readJson, withScenario } from "../lib/respond";
import { stableStringify } from "../lib/stable-json";
import { getScenarioName } from "../scenarios";

const collectorSchema = z
  .object({
    displayName: z.string().trim().min(2, "Informe o nome de exibição.").max(80),
    username: z
      .string()
      .trim()
      .min(3, "O nome de usuário deve ter ao menos 3 caracteres.")
      .max(40)
      .regex(/^[a-zA-Z0-9._-]+$/, "Use apenas letras, números, ponto, hífen ou sublinhado."),
    profileName: z.string().trim().min(2, "Informe o nome do perfil.").max(80),
    email: z.string().trim().pipe(z.email("Informe um e-mail válido.")),
    ensName: z
      .string()
      .trim()
      .max(80)
      .refine((value) => isValidEnsName(value), "Informe um nome ENS válido (ex.: nova.kurio.eth)."),
    network: z.enum(networkIds),
    walletAddress: z.string().trim().min(1, "Informe o endereço da carteira."),
    walletType: z.enum(walletProviderIds),
    referralCode: z.string().trim().max(40).optional(),
    secondaryAddress: z.string().trim().max(120).optional(),
    useAnotherWallet: z.boolean(),
    note: z.string().trim().max(500, "A observação deve ter no máximo 500 caracteres.").optional(),
  })
  .superRefine((value, ctx) => {
    if (!isValidWalletAddress(value.network, value.walletAddress)) {
      ctx.addIssue({
        code: "custom",
        path: ["walletAddress"],
        message: "Endereço inválido para a rede selecionada.",
      });
    }
    if (
      value.secondaryAddress &&
      !isValidEnsName(value.secondaryAddress) &&
      !isValidWalletAddress(value.network, value.secondaryAddress)
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["secondaryAddress"],
        message: "Informe um ENS (.eth) ou um endereço válido.",
      });
    }
  });

const createOrderSchema = z.object({
  quoteId: z.string().min(1),
  quoteVersion: z.number().int().nonnegative(),
  expectedTotalEth: z.string().refine(isEthString, "Total inválido."),
  walletId: z.string().min(1),
  network: z.enum(networkIds),
  collector: collectorSchema,
  couponCode: z.string().trim().max(40).optional(),
});

const EXPLORERS: Record<NetworkId, string> = {
  ethereum: "https://etherscan.io/tx/",
  polygon: "https://polygonscan.com/tx/",
  solana: "https://solscan.io/tx/",
};

function simulateTransactionRef(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(28));
  const middle = Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
  return `0xa91f${middle}e82c`;
}

function priceChanged(message = "Os valores do pedido mudaram. Revise antes de confirmar.") {
  return apiError(409, ConflictCode.PriceChanged, message);
}

function quoteChanged(confirmed: Quote, current: Quote): boolean {
  if (confirmed.totalEth !== current.totalEth) return true;
  if (current.issues.length > 0) return true;
  if (confirmed.lines.length !== current.lines.length) return true;
  return confirmed.lines.some((line, index) => {
    const next = current.lines[index];
    return (
      next.nftId !== line.nftId ||
      next.editionId !== line.editionId ||
      next.quantity !== line.quantity ||
      next.unitPriceEth !== line.unitPriceEth
    );
  });
}

function sameCart(
  cart: readonly { nftId: string; editionId: string; quantity: number }[],
  quoteItems: readonly { nftId: string; editionId: string; quantity: number }[],
): boolean {
  if (cart.length !== quoteItems.length) return false;
  return quoteItems.every((item) =>
    cart.some(
      (line) =>
        line.nftId === item.nftId &&
        line.editionId === item.editionId &&
        line.quantity === item.quantity,
    ),
  );
}

function snapshotItems(quote: Quote): OrderItem[] {
  return quote.lines.map((line) => ({
    nftId: line.nftId,
    editionId: line.editionId,
    name: line.name,
    tokenId: line.tokenId,
    editionLabel: line.editionLabel,
    imageUrl: line.imageUrl,
    quantity: line.quantity,
    unitPriceEth: line.unitPriceEth as EthString,
    lineTotalEth: line.lineTotalEth,
  }));
}

export const orderHandlers = [
  http.post(
    "/api/orders",
    withScenario(async ({ request }) => {
      const auth = await authenticate(request);
      if (!auth.ok) return unauthorizedResponse(auth.reason);

      const idempotencyKey = request.headers.get("idempotency-key")?.trim();
      if (!idempotencyKey) {
        return apiError(400, "IDEMPOTENCY_KEY_REQUIRED", "Envie a chave de idempotência.");
      }
      if (idempotencyKey.length > 120) {
        return apiError(422, "VALIDATION_ERROR", "Chave de idempotência inválida.");
      }

      const body = await readJson(request, createOrderSchema);
      if (!body.ok) return body.response;

      const db = await getDb();
      const payload = stableStringify({ userId: auth.user.id, ...body.data });

      const existing = db.idempotency[idempotencyKey];
      if (existing) {
        if (existing.userId !== auth.user.id || existing.payload !== payload) {
          return apiError(
            409,
            ConflictCode.IdempotencyKeyReused,
            "Esta chave de idempotência já foi usada com outro pedido.",
          );
        }
        const record = db.orders[existing.orderId];
        if (record) {
          await maybeFinalizeOrder(record.order.id);
          return HttpResponse.json((await getDb()).orders[record.order.id].order);
        }
        return apiError(409, ConflictCode.IdempotencyKeyReused, "Pedido anterior não encontrado.");
      }

      const stored = db.quotes[body.data.quoteId];
      if (!stored || stored.userId !== auth.user.id) {
        return priceChanged("A cotação expirou. Revise o pedido antes de confirmar.");
      }

      const quote = stored.quote;
      const couponCode = body.data.couponCode?.trim().toUpperCase() || undefined;
      if (
        quote.version !== body.data.quoteVersion ||
        quote.totalEth !== body.data.expectedTotalEth ||
        (quote.couponCode ?? undefined) !== couponCode ||
        stored.input.network !== body.data.network
      ) {
        return priceChanged();
      }

      const current = buildQuote(db.nfts, stored.input);
      if (quoteChanged(quote, current)) return priceChanged();

      const cart = db.carts[auth.user.id];
      if (cart && !sameCart(cart.items, stored.input.items)) {
        return priceChanged("O carrinho mudou. Revise o pedido antes de confirmar.");
      }

      const wallet = (db.wallets[auth.user.id] ?? []).find(
        (candidate) => candidate.id === body.data.walletId,
      );
      if (!wallet) return apiError(404, "WALLET_NOT_FOUND", "Carteira não encontrada.");

      const fieldErrors: FieldErrors = {};
      if (wallet.address.toLowerCase() !== body.data.collector.walletAddress.toLowerCase()) {
        fieldErrors["collector.walletAddress"] = "O endereço não corresponde à carteira selecionada.";
      }
      if (wallet.network !== body.data.collector.network) {
        fieldErrors["collector.network"] = "A rede não corresponde à carteira selecionada.";
      }
      if (wallet.network !== body.data.network) {
        fieldErrors.network = "A rede do pagamento não corresponde à carteira selecionada.";
      }
      if (Object.keys(fieldErrors).length > 0) {
        return apiError(422, "VALIDATION_ERROR", "Revise os dados do pedido.", fieldErrors);
      }

      const now = new Date().toISOString();
      const orderId = `order-${crypto.randomUUID()}`;
      const transactionRef = simulateTransactionRef();
      const network = body.data.network;
      const scenario = getScenarioName();
      const outcome =
        scenario === "order-declined"
          ? "declined"
          : scenario === "order-pending"
            ? "pending"
            : "confirmed";
      const confirmAt = new Date(
        Date.now() + (outcome === "pending" ? 60 * 60_000 : ORDER_CONFIRM_DELAY_MS),
      ).toISOString();

      const order: Order = {
        id: orderId,
        status: "pending",
        version: 1,
        items: snapshotItems(quote),
        couponCode: quote.couponCode,
        subtotalEth: quote.subtotalEth,
        discountEth: quote.discountEth,
        networkFeeEth: quote.networkFeeEth,
        totalEth: quote.totalEth,
        network,
        walletAddress: wallet.address,
        walletLabel: wallet.label,
        collector: body.data.collector,
        transactionRef,
        explorerUrl: `${EXPLORERS[network]}${transactionRef}`,
        createdAt: now,
        updatedAt: now,
      };

      db.orders[orderId] = { userId: auth.user.id, order, outcome, confirmAt };
      db.idempotency[idempotencyKey] = { userId: auth.user.id, payload, orderId };
      saveDb(db);

      if (outcome !== "pending") scheduleOrderFinalization(orderId);

      return HttpResponse.json(order, { status: 201 });
    }),
  ),

  http.get(
    "/api/orders/:id",
    withScenario(async ({ request, params }) => {
      const auth = await authenticate(request);
      if (!auth.ok) return unauthorizedResponse(auth.reason);

      const orderId = String(params.id);
      const record = (await getDb()).orders[orderId];
      if (!record || record.userId !== auth.user.id) {
        return apiError(404, "ORDER_NOT_FOUND", "Pedido não encontrado.");
      }

      await maybeFinalizeOrder(orderId);
      return HttpResponse.json((await getDb()).orders[orderId].order);
    }),
  ),
];
