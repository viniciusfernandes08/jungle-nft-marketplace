import { useQuery } from "@tanstack/react-query";
import { container } from "@/app/container";
import { nftKeys } from "@/features/nfts/ui/constants/nft-keys";

export function useNft(id: string) {
  return useQuery({
    queryKey: nftKeys.detail(id),
    queryFn: ({ signal }) => container.nfts.get(id, signal),
  });
}
