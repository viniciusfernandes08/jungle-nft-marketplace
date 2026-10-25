import { Link, useCanGoBack, useNavigate, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { useAnnounce } from "@/components/announcer-context";
import { Icon } from "@/components/icon";
import { Skeleton } from "@/components/ui/skeleton";
import { useAddToCart, useCart } from "@/features/cart/ui/hooks/use-cart";
import { errorMessage } from "@/lib/error-message";
import { formatEth, mulEthByInt } from "@/shared/domain/eth";
import type { Nft } from "../../../domain/nft";
import { maxPurchasableQuantity } from "../../../domain/nft-rules";
import { useNft } from "../../hooks/use-nft";
import { EditionPicker } from "./edition-picker";
import { FavoriteButton } from "./favorite-button";
import { NftGallery } from "./nft-gallery";
import { NftTabs } from "./nft-tabs";
import { QuantityStepper } from "./quantity-stepper";
import { RatingStars } from "./rating";
import { RelatedNfts } from "./related-nfts";
import { ShareLinks } from "./share-links";

const shell = "mx-auto w-full max-w-[1200px] px-4 pb-52 pt-4 sm:px-6 lg:pb-16 lg:pt-8 xl:px-0";

export function NftDetailPage({ nftId }: { nftId: string }) {
  const { data: nft, error, isPending, refetch } = useNft(nftId);

  if (isPending) return <NftDetailSkeleton />;

  if (error) {
    const missing = error.kind === "not_found";
    return (
      <section className={shell}>
        <div role="alert" className="rounded-lg bg-card p-8 text-center">
          <h1 className="text-heading font-bold">
            {missing ? "NFT não encontrado" : "Não foi possível carregar o NFT"}
          </h1>
          <p className="mt-2 text-small text-muted-foreground">{errorMessage(error)}</p>
          <div className="mt-6 flex justify-center gap-3">
            {!missing && (
              <button type="button" onClick={() => refetch()} className="rounded-lg bg-primary px-6 py-3 text-small font-bold text-primary-foreground">
                Tentar novamente
              </button>
            )}
            <Link to="/" className="rounded-lg bg-secondary px-6 py-3 text-small font-bold">
              Voltar ao catálogo
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return <NftDetailContent nft={nft} />;
}

function NftDetailContent({ nft }: { nft: Nft }) {
  const router = useRouter();
  const canGoBack = useCanGoBack();
  const navigate = useNavigate();
  const announce = useAnnounce();
  const { data: cart } = useCart();
  const addToCart = useAddToCart();

  const [pickedEdition, setPickedEdition] = useState<string>();
  const [pickedQuantity, setPickedQuantity] = useState(1);

  const edition = nft.editions.find((e) => e.id === pickedEdition) ?? nft.editions.find((e) => e.available > 0) ?? nft.editions[0];
  const inCart = cart?.items.find((i) => i.nftId === nft.id && i.editionId === edition.id)?.quantity ?? 0;
  const remaining = Math.max(0, maxPurchasableQuantity(edition) - inCart);
  const quantity = remaining === 0 ? 1 : Math.min(Math.max(pickedQuantity, 1), remaining);
  const canBuy = remaining > 0 && !addToCart.isPending;

  const notice =
    edition.available === 0
      ? "Esta edição está esgotada."
      : remaining === 0
        ? "Você já tem o máximo disponível desta edição no carrinho."
        : undefined;

  function add(thenGoToCart: boolean) {
    addToCart.mutate(
      { nftId: nft.id, editionId: edition.id, quantity },
      {
        onSuccess: () => {
          if (thenGoToCart) void navigate({ to: "/cart" });
          else announce(`${nft.name} adicionado ao carrinho.`);
        },
        onError: (error) => announce(error.message),
      },
    );
  }

  const goBack = () => (canGoBack ? router.history.back() : void navigate({ to: "/" }));
  const total = formatEth(mulEthByInt(nft.priceEth, quantity));

  return (
    <>
      <title>{`${nft.name} | Kurio`}</title>
      <meta name="description" content={nft.summary} />

      <div className={shell}>
        <div className="mb-4 flex items-center justify-between lg:hidden">
          <button type="button" aria-label="Voltar" onClick={goBack} className="grid size-10 place-items-center rounded-full bg-card text-primary">
            <Icon name="chevron-right" className="rotate-180" />
          </button>
          <FavoriteButton nftId={nft.id} variant="icon" />
        </div>

        <nav aria-label="Você está em" className="hidden text-small font-bold lg:block">
          <ol className="flex gap-2">
            <li><Link to="/">Início</Link></li>
            <li aria-hidden="true">/</li>
            <li><Link to="/" hash="catalogo">Mercado</Link></li>
          </ol>
        </nav>

        <div className="grid lg:mt-4 lg:grid-cols-[100px_minmax(0,444px)_1fr] lg:gap-7">
          <NftGallery name={nft.name} images={nft.gallery} />

          <div className="relative -mt-6 flex flex-col gap-4 rounded-t-[32px] bg-card px-5 pb-8 pt-6 lg:mt-0 lg:rounded-none lg:bg-transparent lg:p-0">
            <div className="flex items-start justify-between gap-3">
              <h1 className="text-subheading font-bold lg:text-title">{nft.name}</h1>
              <p className="inline-flex shrink-0 items-center gap-1 rounded-full border border-hairline border-primary px-3 py-1 text-small font-bold lg:hidden">
                <Icon name="star" className="size-3.5 text-primary" />
                <span className="sr-only">Nota </span>
                {nft.rating.toFixed(1)}
                <span className="font-normal text-muted-foreground">({nft.ratingCount})</span>
              </p>
            </div>

            <div className="hidden items-end justify-between gap-4 border-b border-hairline border-primary pb-2 lg:flex">
              <p className="text-subheading font-bold text-primary">{formatEth(nft.priceEth)} ETH</p>
              <p className="flex items-center gap-2 text-small">
                <RatingStars rating={nft.rating} />
                <span className="sr-only">Nota {nft.rating.toFixed(1)} de 5. </span>
                {nft.ratingCount} avaliações de colecionadores
              </p>
            </div>

            <section aria-labelledby="sobre">
              <h2 id="sobre" className="hidden text-small font-bold lg:block">Sobre este NFT:</h2>
              <p className="text-small text-muted-foreground">{nft.summary}</p>
            </section>

            <div className="flex flex-col gap-2">
              <h2 className="text-small font-bold">Edição:</h2>
              <EditionPicker editions={nft.editions} selectedId={edition.id} onSelect={setPickedEdition} />
            </div>

            <div className="hidden items-center justify-between gap-4 lg:flex">
              <QuantityStepper value={quantity} max={remaining} disabled={remaining === 0} onChange={setPickedQuantity} />
              <div className="flex gap-3">
                <button
                  type="button"
                  disabled={!canBuy}
                  onClick={() => add(true)}
                  className="rounded-lg bg-primary px-8 py-2.5 text-small font-bold uppercase text-primary-foreground disabled:opacity-50"
                >
                  Comprar
                </button>
                <FavoriteButton nftId={nft.id} variant="button" />
              </div>
            </div>

            {notice && (
              <p role="status" className="text-small text-destructive">{notice}</p>
            )}

            <ul className="flex flex-col gap-3 text-small text-muted-foreground">
              <li>ID do token: #{nft.tokenId}</li>
              <li>Coleção: {nft.seriesName}</li>
              <li>Atributos: {nft.attributes.join(", ")}</li>
            </ul>

            <div className="hidden lg:block">
              <ShareLinks title={nft.name} />
            </div>
          </div>
        </div>

        <NftTabs nft={nft} />
        <RelatedNfts nft={nft} />
      </div>

      <div className="fixed inset-x-0 bottom-0 z-40 rounded-t-[32px] bg-card px-6 pb-[max(1rem,env(safe-area-inset-bottom))] pt-5 shadow-[0_-8px_24px_rgba(0,0,0,0.4)] lg:hidden">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-small text-muted-foreground">Qtd.</span>
            <QuantityStepper value={quantity} max={remaining} disabled={remaining === 0} onChange={setPickedQuantity} />
          </div>
          <p className="text-subheading font-bold text-primary">
            <span className="sr-only">Total: </span>
            {total} ETH
          </p>
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            disabled={!canBuy}
            onClick={() => add(true)}
            className="flex-1 rounded-full bg-primary py-4 text-small font-bold text-primary-foreground disabled:opacity-50"
          >
            Comprar NFT
          </button>
          <button
            type="button"
            aria-label="Adicionar ao carrinho"
            disabled={!canBuy}
            onClick={() => add(false)}
            className="grid size-14 place-items-center rounded-full bg-secondary text-primary disabled:opacity-50"
          >
            <Icon name="cart" className="size-6" />
          </button>
        </div>
      </div>
    </>
  );
}

/** Mesmas dimensões da página real, para o layout não se deslocar. */
function NftDetailSkeleton() {
  return (
    <div className={shell} aria-busy="true" aria-label="Carregando NFT">
      <div className="grid lg:mt-12 lg:grid-cols-[100px_minmax(0,444px)_1fr] lg:gap-7">
        <div className="hidden flex-col gap-4 lg:flex">
          {Array.from({ length: 4 }, (_, i) => (
            <Skeleton key={i} className="size-[100px]" />
          ))}
        </div>
        <Skeleton className="aspect-square w-full" />
        <div className="mt-6 flex flex-col gap-4 lg:mt-0">
          <Skeleton className="h-9 w-3/4 !rounded-sm" />
          <Skeleton className="h-7 w-1/2 !rounded-sm" />
          <Skeleton className="h-20 w-full !rounded-sm" />
          <Skeleton className="h-8 w-2/3 !rounded-sm" />
          <Skeleton className="h-11 w-full" />
        </div>
      </div>
    </div>
  );
}
