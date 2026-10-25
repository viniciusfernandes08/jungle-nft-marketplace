import type { EthString } from "@/shared/domain/eth";
import type { NetworkId } from "@/shared/domain/network";
import type { Page } from "@/shared/domain/page";
import type { Collection, Nft } from "./nft";
import type { NftListQuery } from "./nft-query";

export type FacetItem<T extends string = string> = { id: T; name: string; count: number };

export type NftFacets = {
  collections: FacetItem[];
  networks: FacetItem<NetworkId>[];
  priceRange: { minEth: EthString; maxEth: EthString };
};

export type { Collection };

export interface NftRepository {
  list(query: NftListQuery, signal?: AbortSignal): Promise<Page<Nft>>;
  getById(id: string, signal?: AbortSignal): Promise<Nft>;
  getFacets(signal?: AbortSignal): Promise<NftFacets>;
}
