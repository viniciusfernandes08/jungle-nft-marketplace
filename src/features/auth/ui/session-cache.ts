import { queryOptions, type QueryClient } from "@tanstack/react-query";
import { container } from "@/app/container";
import type { Session } from "../domain/session";

export const sessionKey = ["session"] as const;

export function sessionQueryOptions() {
  return queryOptions({
    queryKey: sessionKey,
    // Não usa AbortSignal: o guard das rotas privadas aguarda esta mesma query.
    // Se um unmount (StrictMode/troca de rota) cancelasse o fetch, o guard rejeitaria
    // com CancelledError e a rota cairia no error boundary.
    queryFn: () => container.auth.restoreSession(),
    staleTime: 60_000,
  });
}

/** Dados públicos (catálogo) sobrevivem; qualquer outra chave é privada por padrão. */
const PUBLIC_ROOTS = new Set<unknown>(["nfts", sessionKey[0]]);

export function clearPrivateCache(queryClient: QueryClient) {
  queryClient.removeQueries({ predicate: (query) => !PUBLIC_ROOTS.has(query.queryKey[0]) });
}

/** Login/cadastro/troca de usuário: nada da sessão anterior pode sobrar no cache. */
export function establishSession(queryClient: QueryClient, session: Session) {
  clearPrivateCache(queryClient);
  queryClient.setQueryData(sessionKey, session);
}

/** Logout/expiração. */
export function endSession(queryClient: QueryClient) {
  clearPrivateCache(queryClient);
  queryClient.setQueryData(sessionKey, null);
}
