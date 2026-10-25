import type { EthString } from "@/shared/domain/eth";
import type { NetworkId } from "@/shared/domain/network";
import type { WalletProviderId } from "@/features/wallets/domain/wallet";

export type OrderStatus = "pending" | "confirmed" | "declined";

/**
 * Snapshot dos dados informados no "Perfil do colecionador".
 * Não é o perfil da conta: vale só para este pedido (não é salvo no perfil).
 * A carteira de pagamento é escolhida à parte e vive nos campos do Order.
 */
export type Collector = {
  displayName: string;
  username: string;
  profileName: string;
  email: string;
  /** Nome ENS completo, incluindo o sufixo ".eth". */
  ensName: string;
  network: NetworkId;
  walletAddress: string;
  walletType: WalletProviderId;
  referralCode?: string;
  /** ENS ou endereço de uma carteira secundária. */
  secondaryAddress?: string;
  useAnotherWallet: boolean;
  note?: string;
};

/** Snapshot: alterações posteriores no catálogo não mudam o recibo. */
export type OrderItem = {
  nftId: string;
  editionId: string;
  name: string;
  tokenId: string;
  editionLabel: string;
  imageUrl: string;
  quantity: number;
  unitPriceEth: EthString;
  lineTotalEth: EthString;
};

export type Order = {
  id: string;
  status: OrderStatus;
  version: number;
  items: OrderItem[];
  couponCode?: string;
  subtotalEth: EthString;
  discountEth: EthString;
  networkFeeEth: EthString;
  totalEth: EthString;
  network: NetworkId;
  /** Carteira usada no pagamento (cadastrada no perfil). */
  walletAddress: string;
  walletLabel?: string;
  collector: Collector;
  transactionRef?: string; // simulado
  explorerUrl?: string; // simulado
  declineReason?: string;
  createdAt: string;
  updatedAt: string;
};

export type CreateOrderInput = {
  quoteId: string;
  quoteVersion: number;
  expectedTotalEth: EthString;
  walletId: string;
  network: NetworkId;
  collector: Collector;
  couponCode?: string;
};
