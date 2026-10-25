import type { NetworkId } from "@/shared/domain/network";

export type WalletKind = "primary" | "secondary";

/** Provedores simulados de conexão (o mesmo conjunto aparece no checkout). */
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
  /** Rótulo curto histórico; equivale a `nickname` (mantido por compatibilidade). */
  label: string;
  address: string;
  network: NetworkId;
  /** Nome ENS associado, quando houver ("nova.kurio.eth"). */
  ensName?: string;
  /** Provedor usado por padrão para conectar esta carteira. */
  provider?: WalletProviderId;
  /** Dados do perfil do colecionador salvos junto da carteira (tela /wallets). */
  displayName?: string;
  nickname?: string;
  profileName?: string;
  email?: string;
  referralCode?: string;
  /** ENS ou endereço secundário informado no cadastro da carteira. */
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

/** Nome curto exibido nos cards: ENS quando existe, senão o endereço abreviado. */
export function walletDisplayName(wallet: Wallet): string {
  return wallet.ensName ?? shortenAddress(wallet.address);
}
