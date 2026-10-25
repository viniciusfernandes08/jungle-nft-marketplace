import { http, HttpResponse } from "msw";
import type { Nft } from "@/features/nfts/domain/nft";
import type { NftSort, NftTab } from "@/features/nfts/domain/nft-query";
import type { NftFacets } from "@/features/nfts/domain/nft-repository";
import { compareEth, ethToWei, isEthString, weiToEth } from "@/shared/domain/eth";
import { networkIds, networkLabels, type NetworkId } from "@/shared/domain/network";
import type { Page } from "@/shared/domain/page";
import { getDb } from "../db/store";
import { collections } from "../fixtures/nfts";
import { apiError, withScenario } from "../lib/respond";
import { getScenario } from "../scenarios";

const NEW_COUNT = 12;
const MAX_PAGE_SIZE = 50;

const sorters: Record<NftSort, (a: Nft, b: Nft) => number> = {
  recent: (a, b) => b.listedAt.localeCompare(a.listedAt),
  "price-asc": (a, b) => compareEth(a.priceEth, b.priceEth),
  "price-desc": (a, b) => compareEth(b.priceEth, a.priceEth),
  name: (a, b) => a.name.localeCompare(b.name),
};

const int = (value: string | null, fallback: number) => {
  const n = Number(value);
  return Number.isInteger(n) && n > 0 ? n : fallback;
};

export const nftHandlers = [
  http.get(
    "/api/nfts/facets",
    withScenario(async () => {
      const { nfts } = await getDb();
      const prices = nfts.map((n) => ethToWei(n.priceEth));
      const facets: NftFacets = {
        collections: collections.map((c) => ({
          id: c.id,
          name: c.name,
          count: nfts.filter((n) => n.collectionId === c.id).length,
        })),
        networks: networkIds.map((id) => ({
          id,
          name: networkLabels[id],
          count: nfts.filter((n) => n.network === id).length,
        })),
        priceRange: {
          minEth: weiToEth(prices.reduce((a, b) => (a < b ? a : b))),
          maxEth: weiToEth(prices.reduce((a, b) => (a > b ? a : b))),
        },
      };
      return HttpResponse.json(facets);
    }),
  ),

  http.get(
    "/api/nfts",
    withScenario(async ({ request }) => {
      const params = new URL(request.url).searchParams;
      const search = (params.get("search") ?? "").trim().toLowerCase();
      const selectedCollections = params.getAll("collection");
      const selectedNetworks = params.getAll("network");
      const min = params.get("minPrice");
      const max = params.get("maxPrice");
      const tab = (params.get("tab") ?? "all") as NftTab;
      const sort = (params.get("sort") ?? "recent") as NftSort;
      const page = int(params.get("page"), 1);
      const pageSize = Math.min(int(params.get("pageSize"), 9), MAX_PAGE_SIZE);

      if ((min && !isEthString(min)) || (max && !isEthString(max))) {
        return apiError(422, "VALIDATION_ERROR", "Faixa de preço inválida.", {
          price: "Informe valores decimais válidos.",
        });
      }
      if (!(sort in sorters)) return apiError(422, "VALIDATION_ERROR", "Ordenação inválida.");

      const { nfts } = await getDb();
      let items = [...nfts].sort(sorters.recent);

      if (tab === "new") items = items.slice(0, NEW_COUNT);
      if (tab === "trending") items = items.filter((n) => n.trending);
      if (search) {
        items = items.filter((n) => `${n.name} ${n.creator}`.toLowerCase().includes(search));
      }
      if (selectedCollections.length) {
        items = items.filter((n) => selectedCollections.includes(n.collectionId));
      }
      if (selectedNetworks.length) {
        items = items.filter((n) => selectedNetworks.includes(n.network as NetworkId));
      }
      if (min) items = items.filter((n) => compareEth(n.priceEth, min) >= 0);
      if (max) items = items.filter((n) => compareEth(n.priceEth, max) <= 0);
      items.sort(sorters[sort]);

      if (getScenario().emptyCatalog) items = [];

      const total = items.length;
      const totalPages = Math.max(1, Math.ceil(total / pageSize));
      const result: Page<Nft> = {
        items: items.slice((page - 1) * pageSize, page * pageSize),
        total,
        page,
        pageSize,
        totalPages,
      };
      return HttpResponse.json(result);
    }),
  ),

  http.get(
    "/api/nfts/:id",
    withScenario(async ({ params }) => {
      const { nfts } = await getDb();
      const nft = nfts.find((n) => n.id === params.id);
      return nft ? HttpResponse.json(nft) : apiError(404, "NOT_FOUND", "NFT não encontrado.");
    }),
  ),
];
