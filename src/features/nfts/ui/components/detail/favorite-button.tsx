import { useLocation, useNavigate } from "@tanstack/react-router";
import { Icon } from "@/components/icon";
import { useSession } from "@/features/auth/ui/hooks/use-session";
import { useFavorites, useToggleFavorite } from "@/features/favorites/ui/hooks/use-favorites";
import { cn } from "@/lib/utils";

type Props = { nftId: string; variant: "button" | "icon"; className?: string };

/** Sem sessão leva ao login e volta para esta página; com sessão alterna com atualização otimista. */
export function FavoriteButton({ nftId, variant, className }: Props) {
  const { data: session } = useSession();
  const { data: favorites } = useFavorites();
  const toggle = useToggleFavorite();
  const navigate = useNavigate();
  const href = useLocation({ select: (location) => location.href });
  const isFavorite = favorites?.includes(nftId) ?? false;

  function onClick() {
    if (!session) {
      void navigate({ to: "/login", search: { redirect: href } });
      return;
    }
    toggle.mutate({ nftId, favorite: !isFavorite });
  }

  const icon = <Icon name={isFavorite ? "heart-filled" : "heart"} className="size-5" />;

  if (variant === "icon") {
    return (
      <button
        type="button"
        aria-label="Favoritar"
        aria-pressed={isFavorite}
        disabled={toggle.isPending}
        onClick={onClick}
        className={cn("grid size-10 place-items-center rounded-full bg-card text-primary", className)}
      >
        {icon}
      </button>
    );
  }

  return (
    <button
      type="button"
      aria-pressed={isFavorite}
      disabled={toggle.isPending}
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-2 rounded-lg border border-primary px-4 py-2.5 text-small font-bold text-primary disabled:opacity-60",
        className,
      )}
    >
      {icon} {isFavorite ? "Favoritado" : "Favoritar"}
    </button>
  );
}
