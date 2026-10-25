import type { RealtimeEvent } from "@/features/realtime/domain/events";
import { getDb, saveDb } from "../db/store";

type RealtimeClient = { emit: (event: string, payload: RealtimeEvent) => void };

const clients = new Set<RealtimeClient>();

export function addRealtimeClient(client: RealtimeClient): void {
  clients.add(client);
}

export function removeRealtimeClient(client: RealtimeClient): void {
  clients.delete(client);
}

/** Entrega o evento a todas as conexões abertas. O cliente filtra por usuário/versão. */
export function broadcastRealtime(event: RealtimeEvent): void {
  for (const client of clients) {
    try {
      client.emit(event.type, event);
    } catch {
      clients.delete(client);
    }
  }
}

/** Tempo entre a criação do pedido e o desfecho simulado da carteira/rede. */
export const ORDER_CONFIRM_DELAY_MS = 1800;

export function scheduleOrderFinalization(
  orderId: string,
  delayMs: number = ORDER_CONFIRM_DELAY_MS,
): void {
  setTimeout(() => {
    void finalizeOrder(orderId);
  }, delayMs);
}

/** Recuperação por REST: se o timeout do mock se perdeu num refresh, o GET conclui o pedido. */
export async function maybeFinalizeOrder(orderId: string): Promise<void> {
  const db = await getDb();
  const record = db.orders[orderId];
  if (!record || record.order.status !== "pending" || record.outcome === "pending") return;
  if (Date.now() < new Date(record.confirmAt).getTime()) return;
  await finalizeOrder(orderId);
}

/**
 * Fecha o pedido uma única vez. Confirmado baixa o estoque e limpa as linhas compradas do carrinho;
 * recusado mantém tudo como estava. Emite order.updated e, se confirmado, nft.updated.
 */
export async function finalizeOrder(orderId: string): Promise<void> {
  const db = await getDb();
  const record = db.orders[orderId];
  if (!record || record.order.status !== "pending" || record.outcome === "pending") return;

  const now = new Date().toISOString();
  const status = record.outcome;
  const order = {
    ...record.order,
    status,
    version: record.order.version + 1,
    updatedAt: now,
    ...(status === "declined" ? { declineReason: "A carteira recusou a transação." } : {}),
  };
  record.order = order;

  const nftEvents: RealtimeEvent[] = [];

  if (status === "confirmed") {
    for (const item of order.items) {
      const nft = db.nfts.find((candidate) => candidate.id === item.nftId);
      if (!nft) continue;
      const edition = nft.editions.find((candidate) => candidate.id === item.editionId);
      if (edition) edition.available = Math.max(0, edition.available - item.quantity);
      nft.version += 1;

      nftEvents.push({
        type: "nft.updated",
        eventId: `evt-nft-${nft.id}-${nft.version}`,
        version: nft.version,
        occurredAt: now,
        resource: { type: "nft", id: nft.id },
        data: {
          priceEth: nft.priceEth,
          editions: nft.editions.map(({ id, available }) => ({ id, available })),
        },
      });
    }

    const cart = db.carts[record.userId];
    if (cart) {
      const purchased = new Set(order.items.map((item) => `${item.nftId}:${item.editionId}`));
      cart.items = cart.items.filter((item) => !purchased.has(`${item.nftId}:${item.editionId}`));
      cart.updatedAt = now;
    }
  }

  saveDb(db);

  broadcastRealtime({
    type: "order.updated",
    eventId: `evt-order-${order.id}-${order.version}`,
    version: order.version,
    occurredAt: now,
    userId: record.userId,
    resource: { type: "order", id: order.id },
    data: {
      status: order.status,
      transactionRef: order.transactionRef,
      declineReason: order.declineReason,
    },
  });

  for (const event of nftEvents) broadcastRealtime(event);
}
