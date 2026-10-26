import type { Order, OrderStatus } from "./order";

export function isTerminalStatus(status: OrderStatus): boolean {
  return status === "confirmed" || status === "declined";
}

export function canTransition(from: OrderStatus, to: OrderStatus): boolean {
  return from === "pending" && to !== "pending";
}

export function resolveOrderUpdate(current: Order, incoming: Order): Order {
  if (current.id !== incoming.id) return current;
  if (isTerminalStatus(current.status)) return current;
  if (incoming.version <= current.version) return current;
  if (incoming.status !== current.status && !canTransition(current.status, incoming.status)) {
    return current;
  }
  return incoming;
}
