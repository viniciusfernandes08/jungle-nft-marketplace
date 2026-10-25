import { isEthString } from "@/shared/domain/eth";
import { networkIds, type NetworkId } from "@/shared/domain/network";
import { DEFAULT_NFT_QUERY, type NftListQuery, type NftSort, type NftTab } from "../domain/nft-query";

/** Parâmetros da URL do catálogo. Valores padrão são omitidos para manter a URL limpa. */
export type CatalogSearch = {
  q?: string;
  collection?: string[];
  network?: NetworkId[];
  min?: string;
  max?: string;
  tab?: NftTab;
  sort?: NftSort;
  page?: number;
};

const TABS: readonly NftTab[] = ["all", "new", "trending"];
const SORTS: readonly NftSort[] = ["recent", "price-asc", "price-desc", "name"];

// O parser do router converte "123" em número; aceitamos os dois formatos.
function text(value: unknown): string | undefined {
  return typeof value === "string" || typeof value === "number" ? String(value) : undefined;
}

function list(value: unknown): string[] {
  const items = Array.isArray(value) ? value : value === undefined ? [] : [value];
  return items.map(text).filter((item): item is string => Boolean(item));
}

export function compactSearch(search: CatalogSearch): CatalogSearch {
  const out: CatalogSearch = {};
  if (search.q) out.q = search.q;
  if (search.collection?.length) out.collection = search.collection;
  if (search.network?.length) out.network = search.network;
  if (search.min) out.min = search.min;
  if (search.max) out.max = search.max;
  if (search.tab && search.tab !== "all") out.tab = search.tab;
  if (search.sort && search.sort !== "recent") out.sort = search.sort;
  if (search.page && search.page > 1) out.page = search.page;
  return out;
}

/** Valida a URL: o que for inválido é descartado, nunca quebra a tela. */
export function validateCatalogSearch(raw: Record<string, unknown>): CatalogSearch {
  const min = text(raw.min);
  const max = text(raw.max);
  const tab = text(raw.tab) as NftTab | undefined;
  const sort = text(raw.sort) as NftSort | undefined;
  const page = Number(raw.page);

  return compactSearch({
    q: text(raw.q)?.trim(),
    collection: list(raw.collection),
    network: list(raw.network).filter((n): n is NetworkId => (networkIds as readonly string[]).includes(n)),
    min: min && isEthString(min) ? min : undefined,
    max: max && isEthString(max) ? max : undefined,
    tab: tab && TABS.includes(tab) ? tab : undefined,
    sort: sort && SORTS.includes(sort) ? sort : undefined,
    page: Number.isInteger(page) && page > 1 ? page : undefined,
  });
}

/** Qualquer mudança de filtro reinicia a paginação. */
export function patchSearch(
  prev: CatalogSearch,
  patch: Partial<Omit<CatalogSearch, "page">>,
): CatalogSearch {
  return compactSearch({ ...prev, ...patch, page: undefined });
}

export function searchToQuery(search: CatalogSearch): NftListQuery {
  return {
    ...DEFAULT_NFT_QUERY,
    search: search.q ?? "",
    collections: search.collection ?? [],
    networks: search.network ?? [],
    minPriceEth: search.min,
    maxPriceEth: search.max,
    tab: search.tab ?? DEFAULT_NFT_QUERY.tab,
    sort: search.sort ?? DEFAULT_NFT_QUERY.sort,
    page: search.page ?? 1,
  };
}
