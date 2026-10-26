export interface FavoriteRepository {
  list(signal?: AbortSignal): Promise<string[]>;
  add(nftId: string): Promise<string[]>;
  remove(nftId: string): Promise<string[]>;
}
