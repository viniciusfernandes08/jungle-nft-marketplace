import type { EthString } from "@/shared/domain/eth";
import type { NetworkId } from "@/shared/domain/network";

export type Rarity = "common" | "rare";

export type Collection = { id: string; name: string };

export type NftEdition = {
  id: string;
  /** "1/1", "1/10", "1/50" ou "ABERTA". O preço é o do NFT; a edição define a disponibilidade. */
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
  /** Categoria usada nos filtros (Arte digital, Fotografia...). */
  collectionId: string;
  /** Série do criador exibida na página ("Kurio Apes"). */
  seriesName: string;
  tokenId: string; // "0042"
  network: NetworkId;
  creator: string;
  summary: string;
  details: NftDetails;
  attributes: string[];
  rating: number;
  ratingCount: number;
  priceEth: EthString;
  originalPriceEth?: EthString; // preço riscado quando há desconto
  rarity: Rarity;
  imageUrl: string;
  gallery: string[];
  editions: NftEdition[];
  trending: boolean;
  listedAt: string; // ISO
  /** Incrementa a cada mudança de preço/disponibilidade (usado pelo tempo real). */
  version: number;
};
