import { cn } from "@/lib/utils";

/** Bloco de carregamento com shimmer. Defina sempre as dimensões para não deslocar o layout. */
export function Skeleton({ className }: { className?: string }) {
  return <div aria-hidden="true" className={cn("skeleton", className)} />;
}
