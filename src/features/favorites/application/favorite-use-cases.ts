import type { FavoriteRepository } from "../domain/favorite-repository";

export const makeListFavorites = (repo: FavoriteRepository) => (signal?: AbortSignal) => repo.list(signal);
export const makeAddFavorite = (repo: FavoriteRepository) => (nftId: string) => repo.add(nftId);
export const makeRemoveFavorite = (repo: FavoriteRepository) => (nftId: string) => repo.remove(nftId);
