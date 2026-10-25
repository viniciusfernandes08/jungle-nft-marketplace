import { Icon } from "@/components/icon";
import { cn } from "@/lib/utils";

type Props = {
  value: number;
  max: number;
  onChange: (value: number) => void;
  disabled?: boolean;
  compact?: boolean;
  className?: string;
};

const base = "grid place-items-center rounded-full bg-primary text-primary-foreground disabled:opacity-40";

export function QuantityStepper({ value, max, onChange, disabled, compact, className }: Props) {
  const button = cn(base, compact ? "size-7" : "size-9 lg:size-10");
  return (
    <div role="group" aria-label="Quantidade" className={cn("flex items-center gap-3", className)}>
      <button
        type="button"
        aria-label="Diminuir quantidade"
        disabled={disabled || value <= 1}
        onClick={() => onChange(value - 1)}
        className={button}
      >
        <Icon name="minus" className="size-4" />
      </button>
      <output aria-live="polite" className="min-w-4 text-center text-body">
        {value}
      </output>
      <button
        type="button"
        aria-label="Aumentar quantidade"
        disabled={disabled || value >= max}
        onClick={() => onChange(value + 1)}
        className={button}
      >
        <Icon name="plus" className="size-4" />
      </button>
    </div>
  );
}
