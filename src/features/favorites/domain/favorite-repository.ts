/** Favoritos são ids de NFT, por usuário autenticado. Cada operação devolve a lista atualizada. */
export interface FavoriteRepository {
  list(signal?: AbortSignal): Promise<string[]>;
  add(nftId: string): Promise<string[]>;
  remove(nftId: string): Promise<string[]>;
}
