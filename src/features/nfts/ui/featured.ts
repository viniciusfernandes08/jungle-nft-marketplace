import { DEFAULT_NFT_QUERY, type NftListQuery } from "../domain/nft-query";

/** Consulta compartilhada por hero e card de destaque (uma só requisição, via cache). */
export const FEATURED_QUERY: NftListQuery = { ...DEFAULT_NFT_QUERY, tab: "trending", pageSize: 4 };
