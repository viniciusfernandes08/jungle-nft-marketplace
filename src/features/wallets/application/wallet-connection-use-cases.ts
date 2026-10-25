import type { WalletConnectionRepository } from "../domain/wallet-connection";
import type { WalletProviderId } from "../domain/wallet";

export const makeConnectWallet =
  (repo: WalletConnectionRepository) => (providerId: WalletProviderId, signal?: AbortSignal) =>
    repo.connect(providerId, signal);

export const makeDisconnectWallet = (repo: WalletConnectionRepository) => (signal?: AbortSignal) =>
  repo.disconnect(signal);
