import { QueryClient } from "@tanstack/react-query";
import { isDomainError, isRetryable, type DomainError } from "@/shared/domain/errors";

declare module "@tanstack/react-query" {
  interface Register {
    defaultError: DomainError;
  }
}

const MAX_RETRIES = 2;

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
    mutations: { retry: 0 },
  },
});
