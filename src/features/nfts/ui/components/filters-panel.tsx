import { Skeleton } from "@/components/ui/skeleton";
import type { NftSort } from "../../domain/nft-query";
import type { FacetItem, NftFacets } from "../../domain/nft-repository";
import type { CatalogSearch } from "../catalog-search";
import { PriceRange } from "./price-range";
import { SORT_OPTIONS } from "@/features/nfts/ui/constants/sort-options";

type Props = {
  facets: NftFacets | undefined;
  search: CatalogSearch;
  onChange: (patch: Partial<Omit<CatalogSearch, "page">>) => void;
  idPrefix: string;
  showSort?: boolean;
};

const toggle = <T extends string>(list: readonly T[] | undefined, value: T): T[] => {
  const current = list ?? [];
  return current.includes(value) ? current.filter((v) => v !== value) : [...current, value];
};

function CheckList<T extends string>({
  legend,
  items,
  selected,
  onToggle,
  idPrefix,
}: {
  legend: string;
  items: FacetItem<T>[];
  selected: readonly T[] | undefined;
  onToggle: (id: T) => void;
  idPrefix: string;
}) {
  return (
    <fieldset className="min-w-0">
      <legend className="mb-3 text-subheading font-bold">{legend}</legend>
      <ul className="flex flex-col gap-3">
        {items.map((item) => {
          const id = `${idPrefix}-${legend}-${item.id}`;
          return (
            <li key={item.id}>
              <label htmlFor={id} className="flex cursor-pointer items-center gap-3 text-small text-muted-foreground">
                <input
                  id={id}
                  type="checkbox"
                  className="size-4 shrink-0 accent-primary"
                  checked={selected?.includes(item.id) ?? false}
                  onChange={() => onToggle(item.id)}
                />
                <span className="flex-1">{item.name}</span>
                <span className="font-bold text-primary">({item.count})</span>
              </label>
            </li>
          );
        })}
      </ul>
    </fieldset>
  );
}

function FiltersSkeleton() {
  return (
    <div aria-hidden="true" className="flex flex-col gap-3">
      {Array.from({ length: 9 }, (_, i) => (
        <Skeleton key={i} className="h-5 w-full !rounded-sm" />
      ))}
      <Skeleton className="mt-4 h-5 w-full !rounded-sm" />
      <Skeleton className="h-9 w-24" />
    </div>
  );
}

export function FiltersPanel({ facets, search, onChange, idPrefix, showSort }: Props) {
  if (!facets) return <FiltersSkeleton />;

  const bounds = { min: Number(facets.priceRange.minEth), max: Number(facets.priceRange.maxEth) };
  const applied = {
    min: search.min ? Number(search.min) : undefined,
    max: search.max ? Number(search.max) : undefined,
  };

  return (
    <div className="flex flex-col gap-8">
      {showSort && (
        <div>
          <label htmlFor={`${idPrefix}-sort`} className="mb-2 block text-subheading font-bold">
            Ordenar por
          </label>
          <select
            id={`${idPrefix}-sort`}
            value={search.sort ?? "recent"}
            onChange={(e) => onChange({ sort: e.target.value as NftSort })}
            className="w-full rounded-lg bg-secondary px-4 py-3 text-small"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
      )}
      <CheckList
        legend="Coleções"
        items={facets.collections}
        selected={search.collection}
        onToggle={(id) => onChange({ collection: toggle(search.collection, id) })}
        idPrefix={idPrefix}
      />
      <section aria-labelledby={`${idPrefix}-price`}>
        <h3 id={`${idPrefix}-price`} className="mb-3 text-subheading font-bold">
          Faixa de preço
        </h3>
        <PriceRange
          key={`${search.min}-${search.max}-${bounds.min}-${bounds.max}`}
          bounds={bounds}
          applied={applied}
          onApply={({ min, max }) => onChange({ min, max })}
        />
      </section>
      <CheckList
        legend="Rede"
        items={facets.networks}
        selected={search.network}
        onToggle={(id) => onChange({ network: toggle(search.network, id) })}
        idPrefix={idPrefix}
      />
    </div>
  );
}
