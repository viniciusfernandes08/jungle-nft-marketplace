/** Onde a credencial da sessão fica guardada entre recarregamentos. */
export interface TokenStore {
  get(): string | null;
  set(token: string): void;
  clear(): void;
}
