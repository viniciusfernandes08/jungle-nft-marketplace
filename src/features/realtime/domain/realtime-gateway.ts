import type { RealtimeEvent } from "./events";

export type ConnectionState = "connecting" | "connected" | "disconnected";

export interface RealtimeGateway {
  connect(auth: { token?: string }): void;
  disconnect(): void;
  subscribe(handler: (event: RealtimeEvent) => void): () => void;
  onConnectionChange(handler: (state: ConnectionState) => void): () => void;
}
