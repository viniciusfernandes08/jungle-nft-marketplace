import type { TokenStore } from "../domain/token-store";

const KEY = "kurio:auth-token";

export function createLocalTokenStore(): TokenStore {
  return {
    get() {
      try {
        return localStorage.getItem(KEY);
      } catch {
        return null;
      }
    },
    set(token) {
      try {
        localStorage.setItem(KEY, token);
      } catch {
        // sem persistência: a sessão vale só até o refresh
      }
    },
    clear() {
      try {
        localStorage.removeItem(KEY);
      } catch {
        // ignora
      }
    },
  };
}
