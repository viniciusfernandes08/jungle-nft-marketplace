import { queryOptions, type QueryClient } from "@tanstack/react-query";
import { container } from "@/app/container";
import type { Session } from "../domain/session";

export const sessionKey = ["session"] as const;

export function sessionQueryOptions() {
  return queryOptions({
    queryKey: sessionKey,
    queryFn: () => container.auth.restoreSession(),
    staleTime: 60_000,
  });
}

const PUBLIC_ROOTS = new Set<unknown>(["nfts", sessionKey[0]]);

export function clearPrivateCache(queryClient: QueryClient) {
  queryClient.removeQueries({ predicate: (query) => !PUBLIC_ROOTS.has(query.queryKey[0]) });
}

export function establishSession(queryClient: QueryClient, session: Session) {
  clearPrivateCache(queryClient);
  queryClient.setQueryData(sessionKey, session);
}

export function endSession(queryClient: QueryClient) {
  clearPrivateCache(queryClient);
  queryClient.setQueryData(sessionKey, null);
}
