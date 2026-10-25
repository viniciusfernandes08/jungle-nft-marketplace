/** Só caminhos internos; nunca URLs externas, e nunca as próprias telas de acesso (evita laço). */
export function isSafeRedirect(value: string): boolean {
  return (
    value.startsWith("/") &&
    !value.startsWith("//") &&
    !value.startsWith("/\\") &&
    !/^\/(login|register)(\/|\?|#|$)/.test(value)
  );
}

export function safeRedirect(value: string | undefined): string {
  return value && isSafeRedirect(value) ? value : "/";
}

export type AuthSearch = { redirect?: string };

export function validateAuthSearch(raw: Record<string, unknown>): AuthSearch {
  const value = typeof raw.redirect === "string" ? raw.redirect : undefined;
  return value && isSafeRedirect(value) ? { redirect: value } : {};
}
