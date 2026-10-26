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
      } catch {}
    },
    clear() {
      try {
        localStorage.removeItem(KEY);
      } catch {}
    },
  };
}
