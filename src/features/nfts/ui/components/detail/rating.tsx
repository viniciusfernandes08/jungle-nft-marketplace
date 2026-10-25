import { Icon } from "@/components/icon";
import { cn } from "@/lib/utils";

export function RatingStars({ rating, className }: { rating: number; className?: string }) {
  const full = Math.round(rating);
  return (
    <span className={cn("inline-flex gap-0.5 text-primary", className)} aria-hidden="true">
      {Array.from({ length: 5 }, (_, i) => (
        <Icon key={i} name="star" className={cn("size-3.5", i >= full && "opacity-30")} />
      ))}
    </span>
  );
}
