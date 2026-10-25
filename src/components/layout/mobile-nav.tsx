import { Link, useLocation } from "@tanstack/react-router";
import { Icon } from "@/components/icon";
import type { IconName } from "@/config/assets";
import { useAnnounce } from "@/components/announcer-context";
import { UnavailableLink } from "@/components/unavailable-link";
import { CartLink } from "@/features/cart/ui/components/cart-link";
import { useSession } from "@/features/auth/ui/hooks/use-session";
import { cn } from "@/lib/utils";

const item = "grid size-12 place-items-center rounded-lg";
const activeItem = "text-primary";
const inactiveItem = "text-muted-foreground";

function Unavailable({ icon, label }: { icon: IconName; label: string }) {
  return (
    <UnavailableLink
      message={`${label} não está disponível nesta versão.`}
      className={cn(item, inactiveItem)}
    >
      <Icon name={icon} label={label} className="size-6" />
    </UnavailableLink>
  );
}

export function MobileNav() {
  const announce = useAnnounce();
  const { data: session } = useSession();
  const pathname = useLocation({ select: (location) => location.pathname });
  const onHome = pathname === "/";
  const onAccount = pathname === "/profile" || pathname.startsWith("/wallets");
  const onCart = pathname.startsWith("/cart");

  return (
    <nav
      aria-label="Navegação móvel"
      className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-around rounded-t-4xl bg-card px-4 pb-[max(0.85rem,env(safe-area-inset-bottom))] pt-4 lg:hidden"
    >
      <Link
        to="/"
        aria-label="Início"
        aria-current={onHome ? "page" : undefined}
        className={cn(item, onHome ? activeItem : inactiveItem)}
      >
        <Icon name="home" className="size-6" />
      </Link>
      <Unavailable icon="heart" label="Favoritos" />
      <button
        type="button"
        aria-disabled="true"
        aria-label="Escanear (indisponível)"
        onClick={() => announce("O scanner não está disponível nesta versão.")}
        className="-mt-10 grid size-16 place-items-center rounded-full bg-primary/40 text-foreground shadow-lg ring-12 ring-background"
      >
        <Icon name="scan" className="size-7" />
      </button>
      <CartLink className={cn(item, onCart ? activeItem : inactiveItem)} iconClassName="size-6" />
      {session ? (
        <Link
          to="/profile"
          aria-label="Meu perfil"
          aria-current={onAccount ? "page" : undefined}
          className={cn(item, onAccount ? activeItem : inactiveItem)}
        >
          <Icon name="user" className="size-6" />
        </Link>
      ) : (
        <Link to="/login" aria-label="Entrar" className={cn(item, inactiveItem)}>
          <Icon name="user" className="size-6" />
        </Link>
      )}
    </nav>
  );
}
