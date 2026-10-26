import { useMemo } from "react";
import { DEFAULT_NFT_QUERY } from "@/features/nfts/domain/nft-query";
import { NftCardSkeleton } from "@/features/nfts/ui/components/nft-card";
import { NftCarousel } from "@/features/nfts/ui/components/detail/nft-carousel";
import { useNftList } from "@/features/nfts/ui/hooks/use-nft-list";

const QUERY = { ...DEFAULT_NFT_QUERY, pageSize: 12 };

export function SuggestedNfts({ excludeIds }: { excludeIds: readonly string[] }) {
  const { data, isPending } = useNftList(QUERY);
  const items = useMemo(
    () => data?.items.filter((nft) => !excludeIds.includes(nft.id)) ?? [],
    [data, excludeIds],
  );

  if (!isPending && items.length === 0) return null;

  return (
    <section aria-labelledby="sugestoes-titulo" className="mt-16 hidden lg:block">
      <h2 id="sugestoes-titulo" className="border-b border-b-hairline border-b-primary pb-3 text-body font-bold text-primary">
        Colecionadores também viram
      </h2>
      <div className="mt-6">
        {isPending ? (
          <div className="grid grid-cols-5 gap-6">
            {Array.from({ length: 5 }, (_, i) => (
              <NftCardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <NftCarousel items={items} label="Colecionadores também viram" />
        )}
      </div>
    </section>
  );
}
