import { useState } from "react";

const STEP = 0.01;
const asComma = (n: number) => n.toFixed(2).replace(".", ",");

type Props = {
  bounds: { min: number; max: number };
  applied: { min?: number; max?: number };
  onApply: (range: { min?: string; max?: string }) => void;
};

/** Dois controles nativos sobrepostos: teclado e leitores de tela funcionam sem código extra. */
export function PriceRange({ bounds, applied, onApply }: Props) {
  const [low, setLow] = useState(applied.min ?? bounds.min);
  const [high, setHigh] = useState(applied.max ?? bounds.max);
  const span = bounds.max - bounds.min || 1;
  const left = ((low - bounds.min) / span) * 100;
  const right = ((high - bounds.min) / span) * 100;

  function apply() {
    const full = low <= bounds.min && high >= bounds.max;
    onApply(full ? {} : { min: low.toFixed(2), max: high.toFixed(2) });
  }

  return (
    <div>
      <div className="relative mt-2 h-5">
        <div className="absolute inset-x-2 top-1/2 h-0.5 -translate-y-1/2 rounded bg-secondary" />
        <div
          className="absolute top-1/2 h-0.5 -translate-y-1/2 rounded bg-primary"
          style={{ left: `calc(${left}% * 0.95 + 8px)`, right: `calc(${100 - right}% * 0.95 + 8px)` }}
        />
        <input
          type="range"
          aria-label="Preço mínimo em ETH"
          className="range-thumb"
          min={bounds.min}
          max={bounds.max}
          step={STEP}
          value={low}
          onChange={(e) => setLow(Math.min(Number(e.target.value), high - STEP))}
        />
        <input
          type="range"
          aria-label="Preço máximo em ETH"
          className="range-thumb"
          min={bounds.min}
          max={bounds.max}
          step={STEP}
          value={high}
          onChange={(e) => setHigh(Math.max(Number(e.target.value), low + STEP))}
        />
      </div>
      <p className="mt-3 text-small text-muted-foreground">
        Preço: {asComma(low)} - {asComma(high)} ETH
      </p>
      <button
        type="button"
        onClick={apply}
        className="mt-3 rounded-lg bg-primary px-4 py-1.5 text-small font-bold text-primary-foreground"
      >
        Aplicar
      </button>
    </div>
  );
}
