import { Link } from "@tanstack/react-router";
import { formatEth } from "@/shared/domain/eth";
import type { Nft } from "../../domain/nft";
import { isSoldOut } from "../../domain/nft-rules";
import { Skeleton } from "@/components/ui/skeleton";

export function NftCard({ nft, priority = false }: { nft: Nft; priority?: boolean }) {
  const soldOut = isSoldOut(nft);
  const badge = soldOut ? "ESGOTADO" : nft.rarity === "rare" ? "RARO" : null;

  return (
    <article>
      <Link
        to="/nfts/$nftId"
        params={{ nftId: nft.id }}
        className="flex flex-col gap-3 rounded-lg outline-offset-4"
      >
        <div className="relative grid aspect-square place-items-center rounded-lg bg-card p-3 sm:p-4">
          {badge && (
            <span className="absolute left-0 top-4 z-10 bg-primary px-3 py-1 text-micro font-bold text-primary-foreground">
              {badge}
            </span>
          )}
          <img
            src={nft.imageUrl}
            alt={nft.name}
            width={320}
            height={320}
            loading={priority ? "eager" : "lazy"}
            fetchPriority={priority ? "high" : "auto"}
            decoding="async"
            className="size-full rounded-lg object-cover"
          />
        </div>
        <div>
          <h3 className="text-small leading-[21px]">{nft.name}</h3>
          <p className="text-body font-bold leading-6 text-primary">
            {formatEth(nft.priceEth)} ETH
            {nft.originalPriceEth && (
              <del className="ml-2 font-normal text-muted-foreground">
                <span className="sr-only">Preço anterior: </span>
                {formatEth(nft.originalPriceEth)} ETH
              </del>
            )}
          </p>
        </div>
      </Link>
    </article>
  );
}

export function NftCardSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      <Skeleton className="aspect-square w-full" />
      <div className="flex flex-col gap-0.5">
        <Skeleton className="h-[21px] w-3/4 !rounded-sm" />
        <Skeleton className="h-6 w-1/3 !rounded-sm" />
      </div>
    </div>
  );
}
