import type { CreateOrderInput, Order } from "./order";

export interface OrderRepository {
  create(input: CreateOrderInput, idempotencyKey: string, signal?: AbortSignal): Promise<Order>;
  getById(id: string, signal?: AbortSignal): Promise<Order>;
}
