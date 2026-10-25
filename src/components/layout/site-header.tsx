import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Icon } from "@/components/icon";
import { UnavailableLink } from "@/components/unavailable-link";
import { HeaderAuthControl } from "@/features/auth/ui/components/header-auth-control";
import { CartLink } from "@/features/cart/ui/components/cart-link";
import { SearchField } from "@/features/nfts/ui/components/search-field";
import { cn } from "@/lib/utils";

const navItem = "border-b-2 border-transparent pb-3.5 lg:pt-4 text-small";
const active = "border-primary font-bold text-primary";

export function SiteHeader() {
  const navigate = useNavigate();
  const [searching, setSearching] = useState(false);
  const pathname = useLocation({ select: (location) => location.pathname });
  const onMarket = pathname.startsWith("/nfts") || pathname.startsWith("/cart");
  const onHome = pathname === "/" || pathname === "/login" || pathname === "/register";

  return (
    <header className="hidden border-b border-b-primary lg:block border-b-hairline mx-20 lg:pt-2">
      <div className="mx-auto grid h-14 w-full max-w-300 grid-cols-[1fr_auto_1fr] items-center xl:px-0">
        <Link to="/" className="w-fit text-sm font-bold tracking-widest" aria-label="Kurio, página inicial">
          KURIO
        </Link>

        <nav aria-label="Principal" className="flex items-end gap-10">
          <Link to="/" aria-current={onHome ? "page" : undefined} className={cn(navItem, onHome && active)}>
            Início
          </Link>
          <Link to="/" hash="catalogo" aria-current={onMarket ? "page" : undefined} className={cn(navItem, onMarket && active)}>
            Mercado
          </Link>
          <UnavailableLink className={navItem} message="A página de criadores não está disponível nesta versão.">
            Criadores
          </UnavailableLink>
          <UnavailableLink className={navItem} message="A área Aprenda não está disponível nesta versão.">
            Aprenda
          </UnavailableLink>
        </nav>

        <div className="flex items-center justify-end gap-5">
          {searching && (
            <SearchField
              value={undefined}
              placeholder="Buscar NFTs"
              onSearch={(q) => navigate({ to: "/", search: q ? { q } : {} })}
              className="w-56"
            />
          )}
          <button
            type="button"
            aria-label={searching ? "Fechar busca" : "Abrir busca"}
            aria-expanded={searching}
            onClick={() => setSearching((s) => !s)}
            className="grid size-8 place-items-center"
          >
            <Icon name="search" />
          </button>
          <CartLink />
          <HeaderAuthControl />
        </div>
      </div>
    </header>
  );
}
