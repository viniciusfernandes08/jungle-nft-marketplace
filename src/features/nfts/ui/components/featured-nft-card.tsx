import { Link } from "@tanstack/react-router";
import { Skeleton } from "@/components/ui/skeleton";
import { FEATURED_QUERY } from "../featured";
import { useNftList } from "../hooks/use-nft-list";

export function FeaturedNftCard() {
  const { data, isPending } = useNftList(FEATURED_QUERY);
  const nft = data?.items[1] ?? data?.items[0];

  return (
    <section aria-labelledby="destaque-titulo" className="overflow-hidden rounded-lg bg-card">
      <div className="p-6 pb-4">
        <h2 id="destaque-titulo" className="text-heading font-bold uppercase text-highlight">
          NFT em destaque
        </h2>
        <p className="mt-2 text-center text-subheading font-bold uppercase">Oferta limitada</p>
      </div>
      {isPending || !nft ? (
        <Skeleton className="aspect-square w-full !rounded-none" />
      ) : (
        <Link to="/nfts/$nftId" params={{ nftId: nft.id }} className="block">
          <img
            src={nft.imageUrl}
            alt={nft.name}
            width={280}
            height={280}
            loading="lazy"
            decoding="async"
            className="aspect-square w-full rounded-lg object-cover"
          />
        </Link>
      )}
    </section>
  );
}
