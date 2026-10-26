import { http, HttpResponse } from "msw";
import { z } from "zod";
import {
  isValidEnsName,
  isValidWalletAddress,
  walletProviderIds,
  type Wallet,
} from "@/features/wallets/domain/wallet";
import { networkIds } from "@/shared/domain/network";
import { getDb, saveDb } from "../db/store";
import { createProfileForUser } from "../fixtures/profiles";
import type { MockUser } from "../fixtures/users";
import { authenticate, unauthorizedResponse } from "../lib/auth";
import { apiError, readJson, withScenario } from "../lib/respond";

const walletSchema = z
  .object({
    kind: z.enum(["primary", "secondary"]),
    label: z.string().trim().max(40).optional(),
    nickname: z.string().trim().max(40).optional(),
    displayName: z.string().trim().max(80).optional(),
    profileName: z.string().trim().max(80).optional(),
    email: z.string().trim().pipe(z.email("Informe um e-mail válido.")).optional(),
    address: z.string().trim().min(1, "Informe o endereço da carteira."),
    secondaryAddress: z.string().trim().max(120).optional(),
    network: z.enum(networkIds),
    ensName: z.string().trim().max(80).optional(),
    provider: z.enum(walletProviderIds).optional(),
    referralCode: z.string().trim().max(40).optional(),
  })
  .superRefine((value, ctx) => {
    if (!isValidWalletAddress(value.network, value.address)) {
      ctx.addIssue({
        code: "custom",
        path: ["address"],
        message: "Endereço inválido para a rede selecionada.",
      });
    }
    if (value.ensName && !isValidEnsName(value.ensName)) {
      ctx.addIssue({
        code: "custom",
        path: ["ensName"],
        message: "Informe um ENS válido (ex.: nome.eth).",
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
        message: "Informe um ENS ou um endereço válido para a rede.",
      });
    }
  });

function normalize(input: z.infer<typeof walletSchema>): Omit<Wallet, "id"> {
  const nickname = input.nickname || input.label || (input.kind === "primary" ? "Principal" : "Carteira");
  const displayName = input.displayName || nickname;
  return {
    kind: input.kind,
    label: input.label || nickname,
    nickname,
    displayName,
    profileName: input.profileName || displayName,
    email: input.email,
    address: input.address,
    secondaryAddress: input.secondaryAddress || undefined,
    network: input.network,
    ensName: input.ensName || undefined,
    provider: input.provider,
    referralCode: input.referralCode || undefined,
  };
}

function keepSinglePrimary(wallets: Wallet[], primaryId: string): void {
  for (const wallet of wallets) {
    if (wallet.id !== primaryId && wallet.kind === "primary") wallet.kind = "secondary";
  }
}

function ensureSeedWallet(wallets: Wallet[], user: MockUser, profile?: { displayName: string; email: string; walletNickname: string }): boolean {
  if (wallets.length > 0) return false;
  const bytes = crypto.getRandomValues(new Uint8Array(20));
  const address = `0x${Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("")}`;
  const nickname = profile?.walletNickname || "Principal";
  wallets.push({
    id: `wallet-${crypto.randomUUID()}`,
    kind: "primary",
    label: nickname,
    nickname,
    displayName: profile?.displayName ?? user.fullName,
    profileName: profile?.displayName ?? user.fullName,
    email: profile?.email ?? user.email,
    address,
    network: "ethereum",
    provider: "metamask",
  });
  return true;
}

function syncProfileWalletNickname(
  db: Awaited<ReturnType<typeof getDb>>,
  userId: string,
  wallet: Wallet,
): void {
  if (wallet.kind !== "primary") return;
  const profile = db.profiles[userId];
  if (!profile) return;
  const nickname = wallet.nickname || wallet.label;
  profile.walletNickname = nickname;
  profile.updatedAt = new Date().toISOString();
}

export const walletHandlers = [
  http.get(
    "/api/wallets",
    withScenario(async ({ request }) => {
      const auth = await authenticate(request);
      if (!auth.ok) return unauthorizedResponse(auth.reason);
      const db = await getDb();
      const profile = db.profiles[auth.user.id] ?? createProfileForUser(auth.user);
      db.profiles[auth.user.id] = profile;
      const wallets = (db.wallets[auth.user.id] ??= []);
      if (ensureSeedWallet(wallets, auth.user, profile)) saveDb(db);
      return HttpResponse.json(wallets);
    }),
  ),

  http.post(
    "/api/wallets",
    withScenario(async ({ request }) => {
      const auth = await authenticate(request);
      if (!auth.ok) return unauthorizedResponse(auth.reason);

      const body = await readJson(request, walletSchema);
      if (!body.ok) return body.response;

      const db = await getDb();
      db.profiles[auth.user.id] ??= createProfileForUser(auth.user);
      const wallets = (db.wallets[auth.user.id] ??= []);
      const wallet: Wallet = { id: `wallet-${crypto.randomUUID()}`, ...normalize(body.data) };
      wallets.push(wallet);
      if (wallet.kind === "primary") keepSinglePrimary(wallets, wallet.id);
      syncProfileWalletNickname(db, auth.user.id, wallet);
      saveDb(db);
      return HttpResponse.json(wallet, { status: 201 });
    }),
  ),

  http.put(
    "/api/wallets/:id",
    withScenario(async ({ request, params }) => {
      const auth = await authenticate(request);
      if (!auth.ok) return unauthorizedResponse(auth.reason);

      const body = await readJson(request, walletSchema);
      if (!body.ok) return body.response;

      const db = await getDb();
      db.profiles[auth.user.id] ??= createProfileForUser(auth.user);
      const wallets = db.wallets[auth.user.id] ?? [];
      const index = wallets.findIndex((wallet) => wallet.id === String(params.id));
      if (index < 0) return apiError(404, "WALLET_NOT_FOUND", "Carteira não encontrada.");

      const wallet: Wallet = {
        ...wallets[index],
        id: wallets[index].id,
        ...normalize(body.data),
      };
      wallets[index] = wallet;
      if (wallet.kind === "primary") keepSinglePrimary(wallets, wallet.id);
      syncProfileWalletNickname(db, auth.user.id, wallet);
      saveDb(db);
      return HttpResponse.json(wallet);
    }),
  ),
];
