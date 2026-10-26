import type { WalletProviderId } from "./wallet";

export type WalletConnectionResult =
  | { status: "connected"; providerId: WalletProviderId; connectedAt: string }
  | { status: "refused"; providerId: WalletProviderId; reason: string };

export interface WalletConnectionRepository {
  connect(providerId: WalletProviderId, signal?: AbortSignal): Promise<WalletConnectionResult>;
  disconnect(signal?: AbortSignal): Promise<void>;
}
