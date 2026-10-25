import type { AuthResult, LoginInput, RegisterInput, Session } from "./session";

export interface AuthRepository {
  register(input: RegisterInput): Promise<AuthResult>;
  login(input: LoginInput): Promise<AuthResult>;
  getSession(signal?: AbortSignal): Promise<Session>;
  logout(): Promise<void>;
}
