import type { EthString } from "@/shared/domain/eth";
import type { NetworkId } from "@/shared/domain/network";

export type Rarity = "common" | "rare";

export type Collection = { id: string; name: string };

export type NftEdition = {
  id: string;
  label: string;
  available: number;
};

export type NftDetails = {
  paragraphs: string[];
  networkNote: string;
  royaltiesNote: string;
  contractNote: string;
};

export type Nft = {
  id: string;
  name: string;
  collectionId: string;
  seriesName: string;
  tokenId: string;
  network: NetworkId;
  creator: string;
  summary: string;
  details: NftDetails;
  attributes: string[];
  rating: number;
  ratingCount: number;
  priceEth: EthString;
  originalPriceEth?: EthString;
  rarity: Rarity;
  imageUrl: string;
  gallery: string[];
  editions: NftEdition[];
  trending: boolean;
  listedAt: string; // ISO
  version: number;
};
