import type { NftListQuery } from "../../domain/nft-query";

export const nftKeys = {
  all: ["nfts"] as const,
  lists: () => [...nftKeys.all, "list"] as const,
  list: (query: NftListQuery) => [...nftKeys.lists(), query] as const,
  detail: (id: string) => [...nftKeys.all, "detail", id] as const,
  facets: () => [...nftKeys.all, "facets"] as const,
};