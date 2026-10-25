import { http, HttpResponse } from "msw";
import { getDb, saveDb } from "../db/store";
import { authenticate, unauthorizedResponse } from "../lib/auth";
import { apiError, withScenario } from "../lib/respond";

export const favoriteHandlers = [
  http.get(
    "/api/favorites",
    withScenario(async ({ request }) => {
      const auth = await authenticate(request);
      if (!auth.ok) return unauthorizedResponse(auth.reason);
      const db = await getDb();
      return HttpResponse.json(db.favorites[auth.user.id] ?? []);
    }),
  ),

  http.put(
    "/api/favorites/:nftId",
    withScenario(async ({ request, params }) => {
      const auth = await authenticate(request);
      if (!auth.ok) return unauthorizedResponse(auth.reason);
      const db = await getDb();
      if (!db.nfts.some((n) => n.id === params.nftId)) return apiError(404, "NOT_FOUND", "NFT não encontrado.");
      const current = db.favorites[auth.user.id] ?? [];
      db.favorites[auth.user.id] = [...new Set([...current, String(params.nftId)])];
      saveDb(db);
      return HttpResponse.json(db.favorites[auth.user.id]);
    }),
  ),

  http.delete(
    "/api/favorites/:nftId",
    withScenario(async ({ request, params }) => {
      const auth = await authenticate(request);
      if (!auth.ok) return unauthorizedResponse(auth.reason);
      const db = await getDb();
      db.favorites[auth.user.id] = (db.favorites[auth.user.id] ?? []).filter((id) => id !== params.nftId);
      saveDb(db);
      return HttpResponse.json(db.favorites[auth.user.id]);
    }),
  ),
];
