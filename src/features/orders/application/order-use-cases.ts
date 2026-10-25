import type { CreateOrderInput } from "../domain/order";
import type { OrderRepository } from "../domain/order-repository";

export const makeCreateOrder =
  (repo: OrderRepository) => (input: CreateOrderInput, idempotencyKey: string, signal?: AbortSignal) =>
    repo.create(input, idempotencyKey, signal);

export const makeGetOrder = (repo: OrderRepository) => (id: string, signal?: AbortSignal) =>
  repo.getById(id, signal);
