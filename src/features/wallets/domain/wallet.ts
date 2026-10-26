import type { NetworkId } from "@/shared/domain/network";

export type WalletKind = "primary" | "secondary";

export const walletProviderIds = ["walletconnect", "metamask", "coinbase"] as const;
export type WalletProviderId = (typeof walletProviderIds)[number];

export const walletProviderLabels: Record<WalletProviderId, string> = {
  walletconnect: "WalletConnect",
  metamask: "MetaMask",
  coinbase: "Coinbase Wallet",
};

export type Wallet = {
  id: string;
  kind: WalletKind;
  label: string;
  address: string;
  network: NetworkId;
  ensName?: string;
  provider?: WalletProviderId;
  displayName?: string;
  nickname?: string;
  profileName?: string;
  email?: string;
  referralCode?: string;
  secondaryAddress?: string;
};

export type WalletInput = Omit<Wallet, "id">;

export interface WalletRepository {
  list(signal?: AbortSignal): Promise<Wallet[]>;
  create(input: WalletInput): Promise<Wallet>;
  update(id: string, input: WalletInput): Promise<Wallet>;
}

const EVM_ADDRESS = /^0x[0-9a-fA-F]{40}$/;
const SOLANA_ADDRESS = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;
const ENS_NAME = /^[a-z0-9-]+(\.[a-z0-9-]+)*\.eth$/i;

export function isValidWalletAddress(network: NetworkId, address: string): boolean {
  return network === "solana" ? SOLANA_ADDRESS.test(address) : EVM_ADDRESS.test(address);
}

export function isValidEnsName(value: string): boolean {
  return ENS_NAME.test(value.trim());
}

export function shortenAddress(address: string): string {
  return address.length > 12 ? `${address.slice(0, 6)}...${address.slice(-4)}` : address;
}

export function walletDisplayName(wallet: Wallet): string {
  return wallet.ensName ?? shortenAddress(wallet.address);
}
