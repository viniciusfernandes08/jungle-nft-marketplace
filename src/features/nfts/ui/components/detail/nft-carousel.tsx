import { useCallback, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import type { Nft } from "../../../domain/nft";
import { NftCard } from "../nft-card";

/** Rolagem horizontal com snap e pontos de página. Sem autoplay; os cards são links focáveis. */
export function NftCarousel({ items, label }: { items: Nft[]; label: string }) {
  const [view, setView] = useState({ page: 0, pages: 1 });
  const list = useRef<HTMLUListElement | null>(null);

  const attach = useCallback((el: HTMLUListElement | null) => {
    list.current = el;
    if (!el) return;
    const update = () => {
      const pages = Math.max(1, Math.ceil(el.scrollWidth / el.clientWidth - 0.05));
      const page = Math.min(pages - 1, Math.round(el.scrollLeft / el.clientWidth));
      setView((prev) => (prev.page === page && prev.pages === pages ? prev : { page, pages }));
    };
    update();
    el.addEventListener("scroll", update, { passive: true });
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => {
      el.removeEventListener("scroll", update);
      observer.disconnect();
    };
  }, []);

  function goTo(page: number) {
    const el = list.current;
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollTo({ left: page * el.clientWidth, behavior: reduce ? "auto" : "smooth" });
  }

  return (
    <div>
      <ul
        ref={attach}
        aria-label={label}
        className="flex snap-x snap-mandatory gap-6 overflow-x-auto pb-2 [scrollbar-width:none]"
      >
        {items.map((nft) => (
          <li key={nft.id} className="w-[44%] shrink-0 snap-start sm:w-[30%] lg:w-[calc((100%-6rem)/5)]">
            <NftCard nft={nft} />
          </li>
        ))}
      </ul>
      {view.pages > 1 && (
        <div role="group" aria-label="Páginas do carrossel" className="mt-6 flex justify-center gap-3">
          {Array.from({ length: view.pages }, (_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Ir para a página ${i + 1}`}
              aria-current={i === view.page}
              onClick={() => goTo(i)}
              className={cn("size-3 rounded-full border border-primary", i === view.page && "bg-primary")}
            />
          ))}
        </div>
      )}
    </div>
  );
}
