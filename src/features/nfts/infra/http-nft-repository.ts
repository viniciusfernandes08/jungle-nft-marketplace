import type { AxiosInstance } from "axios";
import type { Page } from "@/shared/domain/page";
import { request } from "@/shared/infra/map-http-error";
import type { Nft } from "../domain/nft";
import type { NftListQuery } from "../domain/nft-query";
import type { NftFacets, NftRepository } from "../domain/nft-repository";

export function toSearchParams(query: NftListQuery): URLSearchParams {
  const params = new URLSearchParams();
  if (query.search) params.set("search", query.search);
  query.collections.forEach((id) => params.append("collection", id));
  query.networks.forEach((id) => params.append("network", id));
  if (query.minPriceEth) params.set("minPrice", query.minPriceEth);
  if (query.maxPriceEth) params.set("maxPrice", query.maxPriceEth);
  params.set("tab", query.tab);
  params.set("sort", query.sort);
  params.set("page", String(query.page));
  params.set("pageSize", String(query.pageSize));
  return params;
}

export function createHttpNftRepository(client: AxiosInstance): NftRepository {
  return {
    list: (query, signal) =>
      request(() => client.get<Page<Nft>>("/nfts", { params: toSearchParams(query), signal })),
    getById: (id, signal) =>
      request(() => client.get<Nft>(`/nfts/${encodeURIComponent(id)}`, { signal })),
    getFacets: (signal) => request(() => client.get<NftFacets>("/nfts/facets", { signal })),
  };
}
