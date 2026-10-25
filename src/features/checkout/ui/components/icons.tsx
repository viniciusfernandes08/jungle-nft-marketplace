import { cn } from "@/lib/utils";

export function ChevronDownIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("size-4", className)}
    >
      <path d="m3 6 5 5 5-5" />
    </svg>
  );
}

export function CloseIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      className={cn("size-4", className)}
    >
      <path d="m3 3 10 10M13 3 3 13" />
    </svg>
  );
}

export function WalletGlyph({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.3"
      strokeLinejoin="round"
      className={cn("size-4", className)}
    >
      <path d="M3 6.5A1.5 1.5 0 0 1 4.5 5h10A1.5 1.5 0 0 1 16 6.5v8a1.5 1.5 0 0 1-1.5 1.5h-10A1.5 1.5 0 0 1 3 14.5z" />
      <path d="M3 7h11.5a1.5 1.5 0 0 1 1.5 1.5v2a1.5 1.5 0 0 1-1.5 1.5H3" />
      <circle cx="13" cy="10" r="0.8" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function Spinner({ className }: { className?: string }) {
  return (
    <span
      role="status"
      aria-label="Carregando"
      className={cn(
        "inline-block size-4 animate-spin rounded-full border-2 border-current border-t-transparent",
        className,
      )}
    />
  );
}

/** Selo do recibo: envelope no sucesso, ampulheta no pendente e X no recusado. */
export function StatusSeal({ status }: { status: "confirmed" | "pending" | "declined" }) {
  const label = status === "confirmed" ? "THANK YOU" : status === "pending" ? "PROCESSANDO" : "NÃO CONCLUÍDO";
  const color = status === "declined" ? "text-destructive" : "text-[#c27f46]";

  return (
    <div className={cn("flex flex-col items-center gap-2", color)}>
      {status === "confirmed" && (
        <svg
          aria-hidden="true"
          viewBox="0 0 96 76"
          className="h-[76px] w-[96px]"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinejoin="round"
        >
          <rect x="6" y="10" width="84" height="58" rx="5" />
          <path d="M8 14l40 30 40-30" />
          <text
            x="48"
            y="56"
            textAnchor="middle"
            fontSize="8"
            fontWeight="700"
            letterSpacing="1.2"
            fill="currentColor"
            stroke="none"
          >
            {label}
          </text>
        </svg>
      )}
      {status === "pending" && (
        <span className="grid size-[76px] place-items-center rounded-full border-2 border-current">
          <Spinner className="size-8 border-[3px]" />
        </span>
      )}
      {status === "declined" && (
        <span className="grid size-[76px] place-items-center rounded-full border-2 border-current">
          <CloseIcon className="size-9" />
        </span>
      )}
      {status !== "confirmed" && (
        <span className="text-micro font-bold tracking-[0.18em]">{label}</span>
      )}
    </div>
  );
}
