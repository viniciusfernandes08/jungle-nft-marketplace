import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Icon } from "@/components/icon";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { FEATURED_QUERY } from "@/features/nfts/ui/featured";
import { useNftList } from "@/features/nfts/ui/hooks/use-nft-list";

export function Hero() {
  const { data, isPending } = useNftList(FEATURED_QUERY);
  const slides = data?.items?.slice(0, 3) ?? [];
  const [index, setIndex] = useState(0);
  const active = slides[index];

  return (
    <section aria-labelledby="hero-titulo" className="mx-auto w-full max-w-[1200px] px-4 py-6 sm:px-6 lg:py-10 xl:px-0">
      <div className="relative grid grid-cols-[1fr_auto] items-center gap-4 overflow-hidden rounded-lg bg-card p-5 lg:grid-cols-[1fr_380px] lg:gap-10 lg:overflow-visible lg:bg-transparent lg:p-0 lg:pl-8">
        <div className="relative z-10 flex flex-col gap-4 lg:gap-5">
          <p className="text-small font-medium">Bem-vindo à Kurio</p>
          <h1 id="hero-titulo" className="text-subheading font-bold uppercase leading-tight lg:text-display">
            <span className="lg:hidden">Seja dono da cultura digital</span>
            <span className="hidden lg:inline">Seja dono do futuro da arte digital</span>
          </h1>
          <p className="max-w-[28rem] text-small text-muted-foreground">
            <span className="lg:hidden">Descubra NFTs selecionados de criadores do mundo todo.</span>
            <span className="hidden lg:inline">
              Descubra NFTs selecionados de criadores emergentes e consagrados. Colecione arte digital
              rara, apoie artistas e tenha uma parte da cultura da internet.
            </span>
          </p>
          <Link
            to="/"
            hash="catalogo"
            className="inline-flex w-fit items-center gap-2 rounded-lg bg-primary px-6 py-3 text-small font-bold uppercase text-primary-foreground"
          >
            Explorar <Icon name="arrow-right" className="size-4 lg:hidden" />
          </Link>
        </div>

        <div className="relative aspect-square w-32 sm:w-44 lg:w-full">
          {isPending || !active ? (
            <Skeleton className="size-full" />
          ) : (
            <img
              src={active.imageUrl}
              alt={`Destaque: ${active.name}`}
              width={380}
              height={380}
              fetchPriority="high"
              decoding="async"
              className="size-full rounded-lg object-cover"
            />
          )}
        </div>

        {slides.length > 1 && (
          <div role="group" aria-label="Destaques" className="col-span-2 flex justify-center gap-2 lg:col-span-1 lg:absolute lg:bottom-4 lg:left-[28%]">
            {slides.map((slide, i) => (
              <button
                key={slide.id}
                type="button"
                aria-label={`Mostrar destaque ${i + 1}: ${slide.name}`}
                aria-current={i === index ? "true" : undefined}
                onClick={() => setIndex(i)}
                className="grid size-6 place-items-center"
              >
                <span
                  aria-hidden="true"
                  className={cn(
                    "size-2.5 rounded-full",
                    i === index ? "bg-primary" : "bg-primary/40",
                  )}
                />
              </button>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
