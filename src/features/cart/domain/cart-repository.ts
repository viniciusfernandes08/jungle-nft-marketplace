import type { Cart, CartItem } from "./cart";

export interface CartRepository {
  get(signal?: AbortSignal): Promise<Cart>;
  addItem(item: CartItem): Promise<Cart>;
  updateItem(item: CartItem): Promise<Cart>;
  removeItem(nftId: string, editionId: string): Promise<Cart>;
  setCoupon(couponCode: string | undefined): Promise<Cart>;
  merge(items: readonly CartItem[]): Promise<Cart>;
}

export interface GuestCartRepository extends CartRepository {
  clear(): void;
}
