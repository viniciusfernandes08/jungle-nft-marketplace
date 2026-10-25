import { useRef, useState, type KeyboardEvent } from "react";
import { cn } from "@/lib/utils";
import type { Nft } from "../../../domain/nft";

type TabId = "details" | "reviews";

export function NftTabs({ nft }: { nft: Nft }) {
  const [active, setActive] = useState<TabId>("details");
  const refs = useRef<Partial<Record<TabId, HTMLButtonElement | null>>>({});
  const tabs: { id: TabId; label: string }[] = [
    { id: "details", label: "Detalhes do NFT" },
    { id: "reviews", label: `Avaliações de colecionadores (${nft.ratingCount})` },
  ];

  function onKeyDown(event: KeyboardEvent) {
    if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
    const next: TabId = active === "details" ? "reviews" : "details";
    setActive(next);
    refs.current[next]?.focus();
  }

  return (
    <section className="mt-12 lg:mt-16">
      <div role="tablist" aria-label="Informações do NFT" onKeyDown={onKeyDown} className="flex flex-wrap gap-x-8 border-b border-hairline border-primary">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            ref={(el) => {
              refs.current[tab.id] = el;
            }}
            id={`tab-${tab.id}`}
            type="button"
            role="tab"
            aria-selected={active === tab.id}
            aria-controls={`panel-${tab.id}`}
            tabIndex={active === tab.id ? 0 : -1}
            onClick={() => setActive(tab.id)}
            className={cn(
              "-mb-px border-b-2 border-transparent pb-2 text-small lg:text-body",
              active === tab.id && "border-primary font-bold text-primary",
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div id="panel-details" role="tabpanel" aria-labelledby="tab-details" hidden={active !== "details"} className="space-y-4 pt-4 text-small text-muted-foreground">
        {nft.details.paragraphs.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
        <dl className="space-y-4">
          <div>
            <dt className="font-bold text-foreground">Rede:</dt>
            <dd>{nft.details.networkNote}</dd>
          </div>
          <div>
            <dt className="font-bold text-foreground">Direitos autorais:</dt>
            <dd>{nft.details.royaltiesNote}</dd>
          </div>
          <div>
            <dt className="font-bold text-foreground">Contrato:</dt>
            <dd>{nft.details.contractNote}</dd>
          </div>
        </dl>
      </div>

      <div id="panel-reviews" role="tabpanel" aria-labelledby="tab-reviews" hidden={active !== "reviews"} className="pt-4">
        <p className="rounded-lg bg-card p-6 text-small text-muted-foreground">
          As avaliações dos colecionadores ainda não estão disponíveis nesta versão. A nota média e o número de
          avaliações acima já refletem a opinião da comunidade.
        </p>
      </div>
    </section>
  );
}
