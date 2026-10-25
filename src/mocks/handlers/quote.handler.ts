import { http, HttpResponse } from "msw";
import { z } from "zod";
import type { QuoteInput } from "@/features/cart/domain/quote";
import { MAX_QUANTITY_PER_ORDER } from "@/features/nfts/domain/nft-rules";
import { networkIds } from "@/shared/domain/network";
import { getDb, saveDb } from "../db/store";
import { authenticate } from "../lib/auth";
import { buildQuote } from "../lib/quote";
import { readJson, withScenario } from "../lib/respond";

const bodySchema = z.object({
  items: z
    .array(
      z.object({
        nftId: z.string().min(1),
        editionId: z.string().min(1),
        quantity: z.number().int().min(1).max(MAX_QUANTITY_PER_ORDER),
      }),
    )
    .max(100),
  couponCode: z.string().trim().max(40).optional(),
  network: z.enum(networkIds).optional(),
});

/** Quantas cotações ficam guardadas para revalidar pedidos. */
const MAX_STORED_QUOTES = 50;

/** Cotação pública: vale para visitante e logado. A cotação da API é a referência do pedido. */
export const quoteHandlers = [
  http.post(
    "/api/quote",
    withScenario(async ({ request }) => {
      const body = await readJson(request, bodySchema);
      if (!body.ok) return body.response;

      const db = await getDb();
      const input: QuoteInput = {
        items: body.data.items,
        couponCode: body.data.couponCode,
        network: body.data.network ?? "ethereum",
      };
      const quote = buildQuote(db.nfts, input);
      const auth = await authenticate(request);

      db.quotes[quote.id] = { quote, userId: auth.ok ? auth.user.id : undefined, input };
      const ids = Object.keys(db.quotes);
      for (const id of ids.slice(0, Math.max(0, ids.length - MAX_STORED_QUOTES))) delete db.quotes[id];
      saveDb(db);

      return HttpResponse.json(quote);
    }),
  ),
];
