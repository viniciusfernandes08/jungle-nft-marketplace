import type { CreateOrderInput, Order } from "./order";

export interface OrderRepository {
  /** Mesma chave + mesmo conteúdo recupera o mesmo pedido; conteúdo diferente gera conflito. */
  create(input: CreateOrderInput, idempotencyKey: string, signal?: AbortSignal): Promise<Order>;
  getById(id: string, signal?: AbortSignal): Promise<Order>;
}
