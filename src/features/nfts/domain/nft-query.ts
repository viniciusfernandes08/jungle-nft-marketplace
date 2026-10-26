import type { EthString } from "@/shared/domain/eth";
import type { NetworkId } from "@/shared/domain/network";

export type NftTab = "all" | "new" | "trending";
export type NftSort = "recent" | "price-asc" | "price-desc" | "name";

export type NftListQuery = {
  search: string;
  collections: string[];
  networks: NetworkId[];
  minPriceEth?: EthString;
  maxPriceEth?: EthString;
  tab: NftTab;
  sort: NftSort;
  page: number;
  pageSize: number;
};

export const DEFAULT_NFT_QUERY: NftListQuery = {
  search: "",
  collections: [],
  networks: [],
  tab: "all",
  sort: "recent",
  page: 1,
  pageSize: 9,
};

export function applyFilterChange(
  query: NftListQuery,
  patch: Partial<Omit<NftListQuery, "page">>,
): NftListQuery {
  return { ...query, ...patch, page: 1 };
}
