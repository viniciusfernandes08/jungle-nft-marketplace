import type { CartRepository } from "../domain/cart-repository";

export function createCartGateway(options: {
  guest: CartRepository;
  account: CartRepository;
  isAuthenticated: () => boolean;
}): CartRepository {
  const current = () => (options.isAuthenticated() ? options.account : options.guest);
  return {
    get: (signal) => current().get(signal),
    addItem: (item) => current().addItem(item),
    updateItem: (item) => current().updateItem(item),
    removeItem: (nftId, editionId) => current().removeItem(nftId, editionId),
    setCoupon: (code) => current().setCoupon(code),
    merge: (items) => current().merge(items),
  };
}
