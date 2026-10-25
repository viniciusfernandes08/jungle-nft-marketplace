import { useQuery } from "@tanstack/react-query";
import { container } from "@/app/container";
import { nftKeys } from "./nft-keys";

export function useNftFacets() {
  return useQuery({
    queryKey: nftKeys.facets(),
    queryFn: ({ signal }) => container.nfts.facets(signal),
    staleTime: 5 * 60_000,
  });
}
