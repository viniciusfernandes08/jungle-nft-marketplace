import type { AxiosInstance } from "axios";
import { request } from "@/shared/infra/map-http-error";
import type { Cart } from "../domain/cart";
import type { CartRepository } from "../domain/cart-repository";

export function createHttpCartRepository(client: AxiosInstance): CartRepository {
  return {
    get: (signal) => request(() => client.get<Cart>("/cart", { signal })),
    addItem: (item) => request(() => client.post<Cart>("/cart/items", item)),
    updateItem: (item) => request(() => client.patch<Cart>("/cart/items", item)),
    removeItem: (nftId, editionId) =>
      request(() =>
        client.delete<Cart>(`/cart/items/${encodeURIComponent(nftId)}/${encodeURIComponent(editionId)}`),
      ),
    setCoupon: (couponCode) => request(() => client.put<Cart>("/cart/coupon", { couponCode })),
    merge: (items) => request(() => client.post<Cart>("/cart/merge", { items })),
  };
}
