import type { CartItem } from "../domain/cart";
import type { CartRepository, GuestCartRepository } from "../domain/cart-repository";

export const makeGetCart = (repo: CartRepository) => (signal?: AbortSignal) => repo.get(signal);
export const makeAddCartItem = (repo: CartRepository) => (item: CartItem) => repo.addItem(item);
export const makeUpdateCartItem = (repo: CartRepository) => (item: CartItem) => repo.updateItem(item);
export const makeRemoveCartItem = (repo: CartRepository) => (nftId: string, editionId: string) =>
  repo.removeItem(nftId, editionId);
export const makeSetCoupon = (repo: CartRepository) => (couponCode: string | undefined) =>
  repo.setCoupon(couponCode);

export const makeMergeGuestCart =
  (guest: GuestCartRepository, account: CartRepository) => async (): Promise<void> => {
    const { items } = await guest.get();
    if (items.length === 0) return;
    await account.merge(items);
    guest.clear();
  };
