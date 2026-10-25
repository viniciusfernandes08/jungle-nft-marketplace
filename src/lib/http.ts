import axios, { isAxiosError } from "axios";
import { env } from "@/config/env";

let tokenProvider: () => string | null = () => null;
let unauthorizedHandler: ((code: string | undefined) => void) | undefined;

/** Único cliente HTTP. Toda chamada REST da infra passa por aqui. */
export const http = axios.create({
  baseURL: env.apiUrl,
  timeout: env.httpTimeoutMs,
  headers: { "Content-Type": "application/json" },
});

http.interceptors.request.use((config) => {
  const token = tokenProvider();
  if (token) config.headers.set("Authorization", `Bearer ${token}`);
  return config;
});

http.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    // 401 numa requisição autenticada = sessão expirada/invalidada (exceto no próprio logout).
    if (
      isAxiosError<{ code?: string }>(error) &&
      error.response?.status === 401 &&
      error.config?.headers.has("Authorization") &&
      error.config.url !== "/auth/logout"
    ) {
      unauthorizedHandler?.(error.response.data?.code);
    }
    return Promise.reject(error);
  },
);

export function configureHttpAuth(options: { getToken: () => string | null }) {
  tokenProvider = options.getToken;
}

export function onHttpUnauthorized(handler: (code: string | undefined) => void) {
  unauthorizedHandler = handler;
}
