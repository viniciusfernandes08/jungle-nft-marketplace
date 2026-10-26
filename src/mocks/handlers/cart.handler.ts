import { http, HttpResponse } from "msw";
import { z } from "zod";
import type { Cart, CartItem } from "@/features/cart/domain/cart";
import { mergeCartItems } from "@/features/cart/domain/cart-rules";
import { MAX_QUANTITY_PER_ORDER, maxPurchasableQuantity } from "@/features/nfts/domain/nft-rules";
import { ConflictCode } from "@/shared/domain/errors";
import { getDb, saveDb, type MockDb } from "../db/store";
import { authenticate, unauthorizedResponse } from "../lib/auth";
import { apiError, readJson, withScenario } from "../lib/respond";

const itemSchema = z.object({
  nftId: z.string().min(1),
  editionId: z.string().min(1),
  quantity: z.number().int("A quantidade deve ser inteira.").min(1, "A quantidade mínima é 1.").max(MAX_QUANTITY_PER_ORDER),
});
const mergeSchema = z.object({ items: z.array(itemSchema).max(100) });
const couponSchema = z.object({ couponCode: z.string().trim().max(40).optional() });

const emptyCart = (): Cart => ({ items: [], updatedAt: new Date().toISOString() });
const touch = (cart: Cart, items: CartItem[]): Cart => ({ ...cart, items, updatedAt: new Date().toISOString() });

function findEdition(db: MockDb, nftId: string, editionId: string) {
  const nft = db.nfts.find((n) => n.id === nftId);
  return nft?.editions.find((e) => e.id === editionId);
}

function checkStock(db: MockDb, item: CartItem) {
  const edition = findEdition(db, item.nftId, item.editionId);
  if (!edition) return apiError(404, "NOT_FOUND", "NFT ou edição não encontrados.");
  const limit = maxPurchasableQuantity(edition);
  if (limit === 0) return apiError(409, ConflictCode.OutOfStock, "Esta edição está esgotada.");
  if (item.quantity > limit) {
    return apiError(
      409,
      ConflictCode.OutOfStock,
      limit === 1 ? "Só resta 1 unidade desta edição." : `Só restam ${limit} unidades desta edição.`,
    );
  }
  return null;
}

export const cartHandlers = [
  http.get(
    "/api/cart",
    withScenario(async ({ request }) => {
      const auth = await authenticate(request);
      if (!auth.ok) return unauthorizedResponse(auth.reason);
      const db = await getDb();
      return HttpResponse.json(db.carts[auth.user.id] ?? emptyCart());
    }),
  ),

  http.post(
    "/api/cart/items",
    withScenario(async ({ request }) => {
      const auth = await authenticate(request);
      if (!auth.ok) return unauthorizedResponse(auth.reason);
      const body = await readJson(request, itemSchema);
      if (!body.ok) return body.response;

      const db = await getDb();
      const cart = db.carts[auth.user.id] ?? emptyCart();
      const [merged] = mergeCartItems(cart.items, [body.data]).filter(
        (i) => i.nftId === body.data.nftId && i.editionId === body.data.editionId,
      );
      const error = checkStock(db, merged);
      if (error) return error;

      db.carts[auth.user.id] = touch(cart, mergeCartItems(cart.items, [body.data]));
      saveDb(db);
      return HttpResponse.json(db.carts[auth.user.id], { status: 201 });
    }),
  ),

  http.patch(
    "/api/cart/items",
    withScenario(async ({ request }) => {
      const auth = await authenticate(request);
      if (!auth.ok) return unauthorizedResponse(auth.reason);
      const body = await readJson(request, itemSchema);
      if (!body.ok) return body.response;

      const db = await getDb();
      const cart = db.carts[auth.user.id] ?? emptyCart();
      if (!cart.items.some((i) => i.nftId === body.data.nftId && i.editionId === body.data.editionId)) {
        return apiError(404, "NOT_FOUND", "Item não está no carrinho.");
      }
      const error = checkStock(db, body.data);
      if (error) return error;

      db.carts[auth.user.id] = touch(
        cart,
        cart.items.map((i) =>
          i.nftId === body.data.nftId && i.editionId === body.data.editionId ? body.data : i,
        ),
      );
      saveDb(db);
      return HttpResponse.json(db.carts[auth.user.id]);
    }),
  ),

  http.delete(
    "/api/cart/items/:nftId/:editionId",
    withScenario(async ({ request, params }) => {
      const auth = await authenticate(request);
      if (!auth.ok) return unauthorizedResponse(auth.reason);
      const db = await getDb();
      const cart = db.carts[auth.user.id] ?? emptyCart();
      db.carts[auth.user.id] = touch(
        cart,
        cart.items.filter((i) => !(i.nftId === params.nftId && i.editionId === params.editionId)),
      );
      saveDb(db);
      return HttpResponse.json(db.carts[auth.user.id]);
    }),
  ),

  http.post(
    "/api/cart/merge",
    withScenario(async ({ request }) => {
      const auth = await authenticate(request);
      if (!auth.ok) return unauthorizedResponse(auth.reason);
      const body = await readJson(request, mergeSchema);
      if (!body.ok) return body.response;

      const db = await getDb();
      const cart = db.carts[auth.user.id] ?? emptyCart();
      const usable = body.data.items.flatMap((item) => {
        const edition = findEdition(db, item.nftId, item.editionId);
        const limit = edition ? maxPurchasableQuantity(edition) : 0;
        return limit > 0 ? [{ ...item, quantity: Math.min(item.quantity, limit) }] : [];
      });
      const merged = mergeCartItems(cart.items, usable).map((item) => {
        const edition = findEdition(db, item.nftId, item.editionId);
        return edition ? { ...item, quantity: Math.min(item.quantity, maxPurchasableQuantity(edition)) } : item;
      });
      db.carts[auth.user.id] = touch(cart, merged);
      saveDb(db);
      return HttpResponse.json(db.carts[auth.user.id]);
    }),
  ),

  http.put(
    "/api/cart/coupon",
    withScenario(async ({ request }) => {
      const auth = await authenticate(request);
      if (!auth.ok) return unauthorizedResponse(auth.reason);
      const body = await readJson(request, couponSchema);
      if (!body.ok) return body.response;
      const db = await getDb();
      const cart = db.carts[auth.user.id] ?? emptyCart();
      db.carts[auth.user.id] = { ...touch(cart, cart.items), couponCode: body.data.couponCode || undefined };
      saveDb(db);
      return HttpResponse.json(db.carts[auth.user.id]);
    }),
  ),
];
