import { useEffect, useState } from "react";
import { Icon } from "@/components/icon";

type Props = {
  value: string | undefined;
  onSearch: (value: string) => void;
  placeholder?: string;
  debounceMs?: number;
  label?: string;
  className?: string;
};

export function SearchField({
  value,
  onSearch,
  placeholder = "Explorar coleções",
  debounceMs = 350,
  label = "Buscar NFTs",
  className,
}: Props) {
  const [draft, setDraft] = useState(value ?? "");
  const [committed, setCommitted] = useState(value);

  if (value !== committed) {
    setCommitted(value);
    setDraft(value ?? "");
  }

  useEffect(() => {
    if (draft.trim() === (committed ?? "")) return;
    const timer = setTimeout(() => {
      const next = draft.trim();
      setCommitted(next || undefined);
      onSearch(next);
    }, debounceMs);
    return () => clearTimeout(timer);
  }, [draft, committed, debounceMs, onSearch]);

  return (
    <form
      role="search"
      className={className}
      onSubmit={(e) => {
        e.preventDefault();
        const next = draft.trim();
        setCommitted(next || undefined);
        onSearch(next);
      }}
    >
      <label className="flex items-center gap-3 rounded-lg bg-card px-4 py-3">
        <Icon name="search" className="text-primary" />
        <span className="sr-only">{label}</span>
        <input
          type="search"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder={placeholder}
          className="w-full bg-transparent text-small text-foreground outline-none placeholder:text-muted-foreground"
        />
      </label>
    </form>
  );
}
