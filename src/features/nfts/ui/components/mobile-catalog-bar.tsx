import { useCatalogSearch } from "../hooks/use-catalog-search";
import { useNftFacets } from "../hooks/use-nft-facets";
import { useNftList } from "../hooks/use-nft-list";
import { FiltersDialog } from "./filters-dialog";
import { FiltersPanel } from "./filters-panel";
import { SearchField } from "./search-field";

/** Busca e filtros no topo do mobile/tablet (no desktop vivem no header e na sidebar). */
export function MobileCatalogBar() {
  const { search, query, update } = useCatalogSearch();
  const facets = useNftFacets();
  const list = useNftList(query);

  return (
    <div className="mx-auto flex w-full max-w-[1200px] items-center gap-3 px-4 pt-6 sm:px-6 lg:hidden">
      <SearchField
        value={search.q}
        onSearch={(q) => update({ q: q || undefined }, { replace: true })}
        className="flex-1"
      />
      <FiltersDialog total={list.data?.total}>
        <FiltersPanel facets={facets.data} search={search} onChange={update} idPrefix="drawer" showSort />
      </FiltersDialog>
    </div>
  );
}
