import type { WalletProviderId } from "./wallet";

export type WalletConnectionResult =
  | { status: "connected"; providerId: WalletProviderId; connectedAt: string }
  | { status: "refused"; providerId: WalletProviderId; reason: string };

export interface WalletConnectionRepository {
  /** Simula a conexão com o provedor; pode ser recusada pela carteira. */
  connect(providerId: WalletProviderId, signal?: AbortSignal): Promise<WalletConnectionResult>;
  disconnect(signal?: AbortSignal): Promise<void>;
}
