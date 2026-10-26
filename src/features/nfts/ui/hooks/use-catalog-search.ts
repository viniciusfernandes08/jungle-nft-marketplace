import { useNavigate, useSearch } from "@tanstack/react-router";
import { useCallback, useMemo } from "react";
import { patchSearch, searchToQuery, validateCatalogSearch, type CatalogSearch } from "../catalog-search";

export function useCatalogSearch() {
  const raw = useSearch({ strict: false });
  const navigate = useNavigate();
  const search = useMemo(() => validateCatalogSearch(raw as Record<string, unknown>), [raw]);
  const query = useMemo(() => searchToQuery(search), [search]);

  const update = useCallback(
    (patch: Partial<Omit<CatalogSearch, "page">>, options?: { replace?: boolean }) =>
      navigate({
        to: "/",
        search: (prev) => patchSearch(validateCatalogSearch(prev as Record<string, unknown>), patch),
        replace: options?.replace,
      }),
    [navigate],
  );
  const clear = useCallback(() => navigate({ to: "/", search: {} }), [navigate]);

  return { search, query, update, clear };
}
