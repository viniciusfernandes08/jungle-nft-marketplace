import { useMemo } from "react";
import type { Nft } from "../../../domain/nft";
import { DEFAULT_NFT_QUERY } from "../../../domain/nft-query";
import { useNftList } from "../../hooks/use-nft-list";
import { NftCardSkeleton } from "../nft-card";
import { NftCarousel } from "./nft-carousel";

export function RelatedNfts({ nft }: { nft: Nft }) {
  const query = useMemo(
    () => ({ ...DEFAULT_NFT_QUERY, collections: [nft.collectionId], pageSize: 12 }),
    [nft.collectionId],
  );
  const { data, isPending } = useNftList(query);
  const items = data?.items.filter((item) => item.id !== nft.id) ?? [];

  if (!isPending && items.length === 0) return null;

  return (
    <section aria-labelledby="related-title" className="mt-14 lg:mt-20">
      <h2 id="related-title" className="border-b border-b-hairline border-b-primary pb-3 text-body font-bold text-primary">
        Mais desta coleção
      </h2>
      <div className="mt-6">
        {isPending ? (
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-5">
            {Array.from({ length: 5 }, (_, i) => (
              <NftCardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <NftCarousel items={items} label="Mais desta coleção" />
        )}
      </div>
    </section>
  );
}
