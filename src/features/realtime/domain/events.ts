import type { EthString } from "@/shared/domain/eth";
import type { OrderStatus } from "@/features/orders/domain/order";

type EventBase = {
  eventId: string;
  version: number;
  occurredAt: string;
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
