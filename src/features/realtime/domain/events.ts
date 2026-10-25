import type { EthString } from "@/shared/domain/eth";
import type { OrderStatus } from "@/features/orders/domain/order";

/** Identidade estável (eventId), recurso afetado e versão em todo evento. */
type EventBase = {
  eventId: string;
  version: number;
  occurredAt: string;
  /** Presente em eventos privados; o cliente descarta se não for o usuário da sessão atual. */
  userId?: string;
};

export type NftUpdatedEvent = EventBase & {
  type: "nft.updated";
  resource: { type: "nft"; id: string };
  data: {
    priceEth: EthString;
    editions: { id: string; available: number }[];
  };
};

export type OrderUpdatedEvent = EventBase & {
  type: "order.updated";
  resource: { type: "order"; id: string };
  data: {
    status: OrderStatus;
    transactionRef?: string;
    declineReason?: string;
  };
};

export type RealtimeEvent = NftUpdatedEvent | OrderUpdatedEvent;
export type RealtimeEventType = RealtimeEvent["type"];
