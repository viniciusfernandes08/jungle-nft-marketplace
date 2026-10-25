export type CartItem = {
  nftId: string;
  editionId: string;
  quantity: number;
};

export type Cart = {
  items: CartItem[];
  /** Cupom aplicado; só é salvo depois que a cotação o aceita. */
  couponCode?: string;
  updatedAt: string; // ISO
};

export const sameCartLine = (a: CartItem, b: CartItem) =>
  a.nftId === b.nftId && a.editionId === b.editionId;

export const cartItemCount = (cart: Cart | undefined): number =>
  cart?.items.reduce((sum, item) => sum + item.quantity, 0) ?? 0;
