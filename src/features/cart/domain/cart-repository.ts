import type { Cart, CartItem } from "./cart";

export interface CartRepository {
  get(signal?: AbortSignal): Promise<Cart>;
  /** Soma à quantidade existente, respeitando o limite por pedido e a disponibilidade. */
  addItem(item: CartItem): Promise<Cart>;
  updateItem(item: CartItem): Promise<Cart>;
  removeItem(nftId: string, editionId: string): Promise<Cart>;
  setCoupon(couponCode: string | undefined): Promise<Cart>;
  /** Chamado no login para preservar os itens do visitante. */
  merge(items: readonly CartItem[]): Promise<Cart>;
}

/** Carrinho do visitante: vive só neste navegador. */
export interface GuestCartRepository extends CartRepository {
  clear(): void;
}
