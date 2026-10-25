import type { Order, OrderStatus } from "./order";

export function isTerminalStatus(status: OrderStatus): boolean {
  return status === "confirmed" || status === "declined";
}

/** Confirmado e recusado são terminais; nunca regridem nem trocam entre si. */
export function canTransition(from: OrderStatus, to: OrderStatus): boolean {
  return from === "pending" && to !== "pending";
}

/** Decide qual estado vale após receber uma atualização (REST ou evento). */
export function resolveOrderUpdate(current: Order, incoming: Order): Order {
  if (current.id !== incoming.id) return current;
  if (isTerminalStatus(current.status)) return current;
  if (incoming.version <= current.version) return current;
  if (incoming.status !== current.status && !canTransition(current.status, incoming.status)) {
    return current;
  }
  return incoming;
}
