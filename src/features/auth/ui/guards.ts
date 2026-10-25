import type { QueryClient } from "@tanstack/react-query";
import { redirect } from "@tanstack/react-router";
import { safeRedirect } from "./redirect";
import { sessionQueryOptions } from "./session-cache";

/** Rotas privadas: sem sessão, vai para o login e volta para cá depois. */
export async function requireAuth({ queryClient, href }: { queryClient: QueryClient; href: string }) {
  const session = await queryClient.ensureQueryData(sessionQueryOptions());
  if (!session) throw redirect({ to: "/login", search: { redirect: href } });
  return session;
}

/** Login e cadastro não fazem sentido para quem já está autenticado. */
export async function redirectIfAuthenticated(queryClient: QueryClient, redirectTo: string | undefined) {
  const session = await queryClient.ensureQueryData(sessionQueryOptions());
  if (session) throw redirect({ href: safeRedirect(redirectTo) });
}
