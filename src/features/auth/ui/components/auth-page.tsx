import { useCanGoBack, useRouter } from "@tanstack/react-router";
import { HomePage } from "@/features/home/ui/home-page";
import { DESKTOP_QUERY, useMediaQuery } from "@/lib/use-media-query";
import { AuthDialog } from "./auth-dialog";
import { AuthView, type AuthMode } from "./auth-view";

export function AuthPage({ mode, redirectTo }: { mode: AuthMode; redirectTo?: string }) {
  const isDesktop = useMediaQuery(DESKTOP_QUERY);
  const router = useRouter();
  const canGoBack = useCanGoBack();

  if (!isDesktop) return <AuthView mode={mode} variant="screen" redirectTo={redirectTo} />;

  const close = () => (canGoBack ? router.history.back() : void router.navigate({ to: "/" }));

  return (
    <>
      <HomePage />
      <AuthDialog onClose={close}>
        <AuthView mode={mode} variant="modal" redirectTo={redirectTo} />
      </AuthDialog>
    </>
  );
}
