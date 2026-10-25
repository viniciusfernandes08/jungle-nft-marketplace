import { Link, useLocation } from "@tanstack/react-router";
import { Icon } from "@/components/icon";
import { UnavailableLink } from "@/components/unavailable-link";
import type { IconName } from "@/config/assets";
import { useLogout } from "@/features/auth/ui/hooks/use-auth-mutations";
import { cn } from "@/lib/utils";

type AccountItem = {
  label: string;
  icon: IconName;
  to?: "/profile" | "/wallets";
};

const ACCOUNT_ITEMS: AccountItem[] = [
  { label: "Dados do perfil", icon: "user", to: "/profile" },
  { label: "Carteiras", icon: "wallet", to: "/wallets" },
  { label: "Atividade", icon: "cart" },
  { label: "Lista de interesse", icon: "heart-filled" },
  { label: "Ofertas", icon: "tag" },
  { label: "Arquivos baixados", icon: "download" },
  { label: "Suporte", icon: "support" },
];

const itemClass =
  "flex h-[45px] w-full items-center gap-2.5 border-l-[6px] border-transparent pl-3.5 pr-3 text-small text-muted-foreground transition-colors";

function isActive(pathname: string, to: AccountItem["to"]): boolean {
  if (!to) return false;
  if (to === "/wallets") return pathname.startsWith("/wallets");
  return pathname === "/profile";
}

function LogoutButton({ className }: { className?: string }) {
  const logout = useLogout();

  return (
    <button
      type="button"
      onClick={() => logout.mutate()}
      disabled={logout.isPending}
      className={cn(
        "flex items-center gap-3.5 text-small text-muted-foreground transition-colors hover:text-primary disabled:opacity-60",
        className,
      )}
    >
      <Icon name="logout" className="size-4" />
      {logout.isPending ? "Saindo..." : "Sair"}
    </button>
  );
}

function DesktopSidebar() {
  const pathname = useLocation({ select: (location) => location.pathname });

  return (
    <aside className="hidden self-start bg-card lg:sticky lg:top-20 lg:block">
      <p className="px-3 pb-1.5 pt-3.5 text-body font-bold">Meu perfil</p>
      <nav aria-label="Menu da conta">
        {ACCOUNT_ITEMS.map((accountItem) =>
          accountItem.to ? (
            <Link
              key={accountItem.label}
              to={accountItem.to}
              className={cn(
                itemClass,
                isActive(pathname, accountItem.to) && "border-primary font-bold text-primary",
                !isActive(pathname, accountItem.to) && "hover:text-primary",
              )}
            >
              <Icon name={accountItem.icon} className="size-4" />
              {accountItem.label}
            </Link>
          ) : (
            <UnavailableLink
              key={accountItem.label}
              message={`${accountItem.label} não está disponível nesta versão.`}
              className={cn(itemClass, "text-muted-foreground/75")}
            >
              <Icon name={accountItem.icon} className="size-4" />
              {accountItem.label}
            </UnavailableLink>
          ),
        )}
      </nav>
      <div className="border-t border-primary/15 px-3.5 pb-4 pt-1.5">
        <LogoutButton />
      </div>
    </aside>
  );
}

function MobileAccountNav() {
  const pathname = useLocation({ select: (location) => location.pathname });

  return (
    <div className="min-w-0 max-w-full bg-card p-4 lg:hidden">
      <div className="flex items-center justify-between gap-4">
        <p className="min-w-0 truncate text-body font-bold">Meu perfil</p>
        <LogoutButton />
      </div>
      <nav
        aria-label="Menu da conta"
        className="mt-4 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {ACCOUNT_ITEMS.map((accountItem) =>
          accountItem.to ? (
            <Link
              key={accountItem.label}
              to={accountItem.to}
              className={cn(
                "inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded-[4px] border border-primary/25 px-3 py-2 text-small text-muted-foreground",
                isActive(pathname, accountItem.to) &&
                  "border-primary bg-primary font-bold text-primary-foreground",
              )}
            >
              <Icon name={accountItem.icon} className="size-4" />
              {accountItem.label}
            </Link>
          ) : (
            <UnavailableLink
              key={accountItem.label}
              message={`${accountItem.label} não está disponível nesta versão.`}
              className="inline-flex shrink-0 cursor-not-allowed items-center gap-2 whitespace-nowrap rounded-[4px] border border-primary/15 px-3 py-2 text-small text-muted-foreground/60"
            >
              <Icon name={accountItem.icon} className="size-4" />
              {accountItem.label}
            </UnavailableLink>
          ),
        )}
      </nav>
    </div>
  );
}

export function AccountShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto min-h-[70svh] w-full max-w-[1200px] px-4 pb-16 pt-6 sm:px-6 lg:pt-11 xl:px-0">
      <div className="grid gap-8 lg:grid-cols-[310px_minmax(0,1fr)] lg:gap-[30px]">
        <MobileAccountNav />
        <DesktopSidebar />
        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}
