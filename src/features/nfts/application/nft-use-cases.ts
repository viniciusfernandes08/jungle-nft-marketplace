import type { NftListQuery } from "../domain/nft-query";
import type { NftRepository } from "../domain/nft-repository";

export const makeListNfts = (repo: NftRepository) => (query: NftListQuery, signal?: AbortSignal) =>
  repo.list(query, signal);
export const makeGetNft = (repo: NftRepository) => (id: string, signal?: AbortSignal) =>
  repo.getById(id, signal);
export const makeGetNftFacets = (repo: NftRepository) => (signal?: AbortSignal) =>
  repo.getFacets(signal);
