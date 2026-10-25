import type { AxiosInstance } from "axios";
import { request } from "@/shared/infra/map-http-error";
import type { CreateOrderInput, Order } from "../domain/order";
import type { OrderRepository } from "../domain/order-repository";

export function createHttpOrderRepository(client: AxiosInstance): OrderRepository {
  return {
    create: (input: CreateOrderInput, idempotencyKey: string, signal) =>
      request(() =>
        client.post<Order>("/orders", input, {
          signal,
          headers: { "Idempotency-Key": idempotencyKey },
        }),
      ),
    getById: (id, signal) =>
      request(() => client.get<Order>(`/orders/${encodeURIComponent(id)}`, { signal })),
  };
}
