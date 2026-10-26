import type { Cart, CartItem } from "../domain/cart";
import type { GuestCartRepository } from "../domain/cart-repository";
import { mergeCartItems } from "../domain/cart-rules";
import { MAX_QUANTITY_PER_ORDER } from "@/features/nfts/domain/nft-rules";

const KEY = "kurio:guest-cart";

const empty = (): Cart => ({ items: [], updatedAt: new Date(0).toISOString() });

function read(): Cart {
  try {
    const parsed = JSON.parse(localStorage.getItem(KEY) ?? "null") as Cart | null;
    if (parsed && Array.isArray(parsed.items)) return parsed;
  } catch {}
  return empty();
}

function write(cart: Cart): Cart {
  const next = { ...cart, updatedAt: new Date().toISOString() };
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {}
  return next;
}

export function createLocalCartRepository(): GuestCartRepository {
  return {
    get: async () => read(),
    addItem: async (item) => {
      const cart = read();
      return write({ ...cart, items: mergeCartItems(cart.items, [item]) });
    },
    updateItem: async (item: CartItem) => {
      const cart = read();
      const quantity = Math.min(Math.max(Math.trunc(item.quantity), 1), MAX_QUANTITY_PER_ORDER);
      return write({
        ...cart,
        items: cart.items.map((i) =>
          i.nftId === item.nftId && i.editionId === item.editionId ? { ...i, quantity } : i,
        ),
      });
    },
    removeItem: async (nftId, editionId) => {
      const cart = read();
      return write({
        ...cart,
        items: cart.items.filter((i) => !(i.nftId === nftId && i.editionId === editionId)),
      });
    },
    setCoupon: async (couponCode) => write({ ...read(), couponCode: couponCode || undefined }),
    merge: async (items) => {
      const cart = read();
      return write({ ...cart, items: mergeCartItems(cart.items, items) });
    },
    clear: () => {
      try {
        localStorage.removeItem(KEY);
      } catch {}
    },
  };
}
