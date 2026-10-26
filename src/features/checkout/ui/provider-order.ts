import type { WalletProviderId } from "@/features/wallets/domain/wallet";

export const providerOrder: readonly WalletProviderId[] = [
  "metamask",
  "walletconnect",
  "coinbase",
];
