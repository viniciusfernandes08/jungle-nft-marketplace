import type { AxiosInstance } from "axios";
import { request } from "@/shared/infra/map-http-error";
import type { FavoriteRepository } from "../domain/favorite-repository";

export function createHttpFavoriteRepository(client: AxiosInstance): FavoriteRepository {
  const path = (nftId: string) => `/favorites/${encodeURIComponent(nftId)}`;
  return {
    list: (signal) => request(() => client.get<string[]>("/favorites", { signal })),
    add: (nftId) => request(() => client.put<string[]>(path(nftId))),
    remove: (nftId) => request(() => client.delete<string[]>(path(nftId))),
  };
}
