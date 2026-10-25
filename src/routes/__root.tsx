import { createRootRouteWithContext, Outlet, useLocation } from "@tanstack/react-router";
import type { RouterContext } from "@/app/router-context";
import { MobileNav } from "@/components/layout/mobile-nav";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { NotFound } from "@/components/not-found";
import { DESKTOP_QUERY, useMediaQuery } from "@/lib/use-media-query";

function RootLayout() {
  const isDesktop = useMediaQuery(DESKTOP_QUERY);
  const pathname = useLocation({ select: (location) => location.pathname });
  // No mobile, estas telas ocupam a tela toda: sem footer nem bottom nav.
  const focusedRoute =
    pathname === "/login" || pathname === "/register" || pathname.startsWith("/nfts/") || pathname.startsWith("/cart") || pathname.startsWith("/checkout");
  const chromeHidden = !isDesktop && focusedRoute;

  return (
    <div className="flex min-h-svh flex-col">
      <a
        href="#conteudo"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground"
      >
        Pular para o conteúdo
      </a>
      <SiteHeader />
      <main id="conteudo" className={chromeHidden ? "flex-1" : "flex-1 pb-28 lg:pb-0"}>
        <Outlet />
      </main>
      {!chromeHidden && <SiteFooter />}
      {!chromeHidden && <MobileNav />}
    </div>
  );
}

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootLayout,
  notFoundComponent: NotFound,
});
