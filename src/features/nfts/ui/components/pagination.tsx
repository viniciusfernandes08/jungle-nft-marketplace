import { Link } from "@tanstack/react-router";
import { Icon } from "@/components/icon";
import { cn } from "@/lib/utils";
import { compactSearch } from "../catalog-search";

function pageWindow(current: number, total: number, size = 5): number[] {
  const start = Math.max(1, Math.min(current - Math.floor(size / 2), total - size + 1));
  return Array.from({ length: Math.min(size, total) }, (_, i) => start + i);
}

const base = "grid size-9 place-items-center rounded-lg bg-card text-small";

export function Pagination({ page, totalPages }: { page: number; totalPages: number }) {
  if (totalPages <= 1) return null;

  return (
    <nav aria-label="Paginação" className="mt-10 flex justify-center gap-2 lg:justify-end">
      {page > 1 && (
        <Link
          from="/"
          to="/"
          search={(prev) => compactSearch({ ...prev, page: page - 1 })}
          aria-label="Página anterior"
          className={base}
        >
          <Icon name="chevron-right" className="rotate-180" />
        </Link>
      )}
      {pageWindow(page, totalPages).map((n) => (
        <Link
          key={n}
          from="/"
          to="/"
          search={(prev) => compactSearch({ ...prev, page: n })}
          aria-label={`Página ${n}`}
          aria-current={n === page ? "page" : undefined}
          className={cn(base, n === page && "bg-primary font-bold text-primary-foreground")}
        >
          {n}
        </Link>
      ))}
      {page < totalPages && (
        <Link
          from="/"
          to="/"
          search={(prev) => compactSearch({ ...prev, page: page + 1 })}
          aria-label="Próxima página"
          className={base}
        >
          <Icon name="chevron-right" />
        </Link>
      )}
    </nav>
  );
}
