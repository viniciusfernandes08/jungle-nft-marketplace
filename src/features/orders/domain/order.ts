import type { EthString } from "@/shared/domain/eth";
import type { NetworkId } from "@/shared/domain/network";
import type { WalletProviderId } from "@/features/wallets/domain/wallet";

export type OrderStatus = "pending" | "confirmed" | "declined";

export type Collector = {
  displayName: string;
  username: string;
  profileName: string;
  email: string;
  ensName: string;
  network: NetworkId;
  walletAddress: string;
  walletType: WalletProviderId;
  referralCode?: string;
  secondaryAddress?: string;
  useAnotherWallet: boolean;
  note?: string;
};

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
  walletAddress: string;
  walletLabel?: string;
  collector: Collector;
  transactionRef?: string;
  explorerUrl?: string;
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
