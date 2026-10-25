import { isDomainError } from "@/shared/domain/errors";
import type { AuthRepository } from "../domain/auth-repository";
import { isSessionExpired, type LoginInput, type RegisterInput, type Session } from "../domain/session";
import type { TokenStore } from "../domain/token-store";

export const makeRegister =
  (repo: AuthRepository, tokens: TokenStore) =>
  async (input: RegisterInput): Promise<Session> => {
    const { session, token } = await repo.register(input);
    tokens.set(token);
    return session;
  };

export const makeLogin =
  (repo: AuthRepository, tokens: TokenStore) =>
  async (input: LoginInput): Promise<Session> => {
    const { session, token } = await repo.login(input);
    tokens.set(token);
    return session;
  };

/** Sair sempre funciona localmente, mesmo que a API esteja fora do ar. */
export const makeLogout = (repo: AuthRepository, tokens: TokenStore) => async (): Promise<void> => {
  try {
    await repo.logout();
  } catch {
    // melhor esforço: a sessão local é descartada de qualquer forma
  } finally {
    tokens.clear();
  }
};

/**
 * Recupera a sessão após refresh. Sem token ou com sessão vencida/inválida, devolve null
 * (e descarta o token). Falhas transitórias são propagadas para o usuário tentar de novo.
 */
export const makeRestoreSession =
  (repo: AuthRepository, tokens: TokenStore) =>
  async (signal?: AbortSignal): Promise<Session | null> => {
    if (!tokens.get()) return null;
    try {
      const session = await repo.getSession(signal);
      if (isSessionExpired(session)) {
        tokens.clear();
        return null;
      }
      return session;
    } catch (error) {
      if (isDomainError(error) && (error.kind === "unauthorized" || error.kind === "session_expired")) {
        tokens.clear();
        return null;
      }
      throw error;
    }
  };
