import type { AxiosInstance } from "axios";
import { request } from "@/shared/infra/map-http-error";
import type { AuthRepository } from "../domain/auth-repository";
import type { AuthResult, Session } from "../domain/session";

export function createHttpAuthRepository(client: AxiosInstance): AuthRepository {
  return {
    register: (input) => request(() => client.post<AuthResult>("/auth/register", input)),
    login: (input) => request(() => client.post<AuthResult>("/auth/login", input)),
    getSession: (signal) => request(() => client.get<Session>("/auth/session", { signal })),
    logout: async () => {
      await request(() => client.post<void>("/auth/logout"));
    },
  };
}
