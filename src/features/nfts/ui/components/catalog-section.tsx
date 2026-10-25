import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import { errorMessage } from "@/lib/error-message";
import type { NftTab } from "../../domain/nft-query";
import { patchSearch } from "../catalog-search";
import { useCatalogSearch } from "../hooks/use-catalog-search";
import { useNftFacets } from "../hooks/use-nft-facets";
import { useNftList } from "../hooks/use-nft-list";
import { FeaturedNftCard } from "./featured-nft-card";
import { FiltersPanel } from "./filters-panel";
import { SORT_OPTIONS } from "./sort-options";
import { NftCard, NftCardSkeleton } from "./nft-card";
import { Pagination } from "./pagination";
import type { NftSort } from "../../domain/nft-query";

const TABS: { value: NftTab; label: string }[] = [
  { value: "all", label: "Todos os NFTs" },
  { value: "new", label: "Novos lançamentos" },
  { value: "trending", label: "Em alta" },
];

export function CatalogSection() {
  const { search, query, update, clear } = useCatalogSearch();
  const list = useNftList(query);
  const facets = useNftFacets();
  const activeTab = search.tab ?? "all";

  return (
    <section
      id="catalogo"
      aria-labelledby="catalogo-titulo"
      className="mx-auto grid w-full max-w-[1200px] scroll-mt-6 gap-10 px-4 py-8 sm:px-6 lg:grid-cols-[280px_1fr] xl:px-0"
    >
      <h2 id="catalogo-titulo" className="sr-only">
        Catálogo de NFTs
      </h2>

      <aside aria-label="Filtros" className="hidden flex-col gap-6 lg:flex">
        <div className="rounded-lg bg-card p-6">
          <FiltersPanel facets={facets.data} search={search} onChange={update} idPrefix="side" />
        </div>
        <FeaturedNftCard />
      </aside>

      <div className="min-w-0">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
          <nav aria-label="Tipo de listagem" className="flex flex-wrap gap-x-6 gap-y-2">
            {TABS.map((tab) => (
              <Link
                key={tab.value}
                from="/"
                to="/"
                search={(prev) => patchSearch(prev, { tab: tab.value })}
                aria-current={activeTab === tab.value ? "page" : undefined}
                className={cn(
                  "border-b-2 border-transparent pb-1 text-small",
                  activeTab === tab.value && "border-primary font-bold text-primary",
                )}
              >
                {tab.label}
              </Link>
            ))}
          </nav>
          <div className="hidden items-center gap-2 text-small lg:flex">
            <label htmlFor="sort">Ordenar por:</label>
            <select
              id="sort"
              value={search.sort ?? "recent"}
              onChange={(e) => update({ sort: e.target.value as NftSort })}
              className="rounded-lg bg-transparent py-1 pr-2 text-small"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value} className="bg-card">
                  {o.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <p role="status" className="sr-only">
          {list.data ? `${list.data.total} NFTs encontrados` : "Carregando NFTs"}
        </p>

        {list.isPending ? (
          <Grid busy>
            {Array.from({ length: 9 }, (_, i) => (
              <NftCardSkeleton key={i} />
            ))}
          </Grid>
        ) : list.isError ? (
          <div role="alert" className="rounded-lg bg-card p-8 text-center">
            <h3 className="text-heading font-bold">Não foi possível carregar os NFTs</h3>
            <p className="mt-2 text-small text-muted-foreground">{errorMessage(list.error)}</p>
            <button
              type="button"
              onClick={() => list.refetch()}
              className="mt-6 rounded-lg bg-primary px-6 py-3 text-small font-bold text-primary-foreground"
            >
              Tentar novamente
            </button>
          </div>
        ) : list.data.items.length === 0 ? (
          <div className="rounded-lg bg-card p-8 text-center">
            <h3 className="text-heading font-bold">Nenhum NFT encontrado</h3>
            <p className="mt-2 text-small text-muted-foreground">
              Ajuste a busca ou os filtros para ver mais resultados.
            </p>
            <button
              type="button"
              onClick={() => clear()}
              className="mt-6 rounded-lg bg-primary px-6 py-3 text-small font-bold text-primary-foreground"
            >
              Limpar filtros
            </button>
          </div>
        ) : (
          <>
            <Grid busy={list.isPlaceholderData}>
              {list.data.items.map((nft, i) => (
                <NftCard key={nft.id} nft={nft} priority={i < 3} />
              ))}
            </Grid>
            <Pagination page={list.data.page} totalPages={list.data.totalPages} />
          </>
        )}
      </div>
    </section>
  );
}

function Grid({ children, busy }: { children: ReactNode; busy?: boolean }) {
  return (
    <div
      aria-busy={busy}
      className={cn(
        "grid grid-cols-2 gap-x-4 gap-y-6 transition-opacity sm:gap-x-6 md:grid-cols-3 lg:gap-y-10",
        "[&>*:nth-child(even)]:mt-8 md:[&>*:nth-child(even)]:mt-0",
        busy && "opacity-60",
      )}
    >
      {children}
    </div>
  );
}
