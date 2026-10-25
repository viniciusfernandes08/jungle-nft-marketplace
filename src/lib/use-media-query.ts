import { useCallback, useSyncExternalStore } from "react";

/** Lê o valor correto já no primeiro render (sem piscar) e acompanha mudanças. */
export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const mql = window.matchMedia(query);
      mql.addEventListener("change", onChange);
      return () => mql.removeEventListener("change", onChange);
    },
    [query],
  );
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => false,
  );
}

/** Mesmo breakpoint `lg` do Tailwind: abaixo disso, mobile e tablet. */
export const DESKTOP_QUERY = "(min-width: 1024px)";
