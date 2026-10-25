export const env = {
  apiUrl: import.meta.env.VITE_API_URL ?? "/api",
  socketUrl: import.meta.env.VITE_SOCKET_URL ?? "",
  socketPath: import.meta.env.VITE_SOCKET_PATH ?? "/kurio-socket",
  enableMocks: import.meta.env.VITE_ENABLE_MOCKS === "true",
  httpTimeoutMs: Number(import.meta.env.VITE_HTTP_TIMEOUT_MS ?? 8000),
} as const;
