import { DEFAULT_NFT_QUERY, type NftListQuery } from "../domain/nft-query";

export const FEATURED_QUERY: NftListQuery = { ...DEFAULT_NFT_QUERY, tab: "trending", pageSize: 4 };
