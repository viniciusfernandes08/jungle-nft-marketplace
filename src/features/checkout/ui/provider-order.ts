import type { WalletProviderId } from "@/features/wallets/domain/wallet";

/** Mesma ordem do print: MetaMask, WalletConnect, Coinbase. */
export const providerOrder: readonly WalletProviderId[] = [
  "metamask",
  "walletconnect",
  "coinbase",
];
