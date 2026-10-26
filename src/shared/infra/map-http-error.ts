import axios, { isAxiosError } from "axios";
import type { ApiErrorBody, DomainError, ErrorKind } from "@/shared/domain/errors";

function kindFromStatus(status: number, code?: string): ErrorKind {
  if (status === 401) return code === "SESSION_EXPIRED" ? "session_expired" : "unauthorized";
  if (status === 403) return "forbidden";
  if (status === 404) return "not_found";
  if (status === 409) return "conflict";
  if (status === 408 || status === 429 || status >= 500) return "transient";
  return "validation";
}

const FALLBACK_MESSAGE: Record<ErrorKind, string> = {
  validation: "Revise os dados informados.",
  unauthorized: "Faça login para continuar.",
  session_expired: "Sua sessão expirou. Entre novamente.",
  forbidden: "Você não tem permissão para fazer isso.",
  not_found: "Não encontramos o que você procura.",
  conflict: "Não foi possível concluir por causa de um conflito.",
  transient: "Algo deu errado no servidor. Tente novamente.",
};

export function toDomainError(error: unknown): unknown {
  if (axios.isCancel(error)) return error;
  if (!isAxiosError<ApiErrorBody>(error)) return error;

  if (!error.response) {
    const timedOut = error.code === "ECONNABORTED" || error.code === "ETIMEDOUT";
    return {
      kind: "transient",
      code: timedOut ? "TIMEOUT" : "NETWORK_ERROR",
      message: timedOut
        ? "A requisição demorou demais. Tente novamente."
        : "Não foi possível conectar. Verifique sua conexão e tente novamente.",
    } satisfies DomainError;
  }

  const { status, data } = error.response;
  const kind = kindFromStatus(status, data?.code);
  return {
    kind,
    status,
    code: data?.code,
    message: data?.message ?? FALLBACK_MESSAGE[kind],
    fieldErrors: data?.fieldErrors,
  } satisfies DomainError;
}

export async function request<T>(call: () => Promise<{ data: T }>): Promise<T> {
  try {
    return (await call()).data;
  } catch (error) {
    throw toDomainError(error);
  }
}
