import { QueryClient } from "@tanstack/react-query";
import { isDomainError, isRetryable, type DomainError } from "@/shared/domain/errors";

declare module "@tanstack/react-query" {
  interface Register {
    defaultError: DomainError;
  }
}

const MAX_RETRIES = 2;

/**
 * Repete só falhas transitórias (rede, timeout, 5xx, 408, 429), já classificadas pela infra.
 * Erros determinísticos (validação, 401, 403, 404, 409) e bugs não são repetidos.
 */
function shouldRetry(failureCount: number, error: unknown) {
  if (failureCount >= MAX_RETRIES) return false;
  return isDomainError(error) && isRetryable(error);
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      gcTime: 5 * 60_000,
      retry: shouldRetry,
      retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 8000),
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
    },
    // Mutations nunca são repetidas automaticamente: evita operação duplicada.
    // Pedidos usam chave de idempotência e retry explícito, decidido pela feature.
    mutations: { retry: 0 },
  },
});
