import { cn } from "@/lib/utils";
import type { NftEdition } from "../../../domain/nft";

type Props = { editions: NftEdition[]; selectedId: string; onSelect: (id: string) => void };

/** Edições esgotadas ficam desabilitadas, riscadas e anunciadas como "esgotada". */
export function EditionPicker({ editions, selectedId, onSelect }: Props) {
  return (
    <div role="radiogroup" aria-label="Edição" className="flex flex-wrap gap-2">
      {editions.map((edition) => {
        const soldOut = edition.available === 0;
        const selected = edition.id === selectedId;
        return (
          <button
            key={edition.id}
            type="button"
            role="radio"
            aria-checked={selected}
            disabled={soldOut}
            title={soldOut ? "Esgotada" : `${edition.available} disponíveis`}
            onClick={() => onSelect(edition.id)}
            className={cn(
              "rounded-full border border-hairline border-primary px-3 py-1 text-micro",
              selected && "border-2 font-bold text-primary",
              soldOut && "cursor-not-allowed line-through opacity-50",
            )}
          >
            {edition.label}
            {soldOut && <span className="sr-only"> (esgotada)</span>}
          </button>
        );
      })}
    </div>
  );
}
