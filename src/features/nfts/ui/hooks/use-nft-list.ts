import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { container } from "@/app/container";
import type { NftListQuery } from "../../domain/nft-query";
import { nftKeys } from "@/features/nfts/ui/constants/nft-keys";

export function useNftList(query: NftListQuery) {
  return useQuery({
    queryKey: nftKeys.list(query),
    queryFn: ({ signal }) => container.nfts.list(query, signal),
    placeholderData: keepPreviousData,
  });
}
