import { apiError } from "./respond";
import type { MockUser } from "../fixtures/users";
import { getDb } from "../db/store";

export type AuthOutcome =
  | { ok: true; user: MockUser; token: string }
  | { ok: false; reason: "unauthorized" | "expired" };

export async function authenticate(request: Request): Promise<AuthOutcome> {
  const header = request.headers.get("authorization");
  const token = header?.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return { ok: false, reason: "unauthorized" };

  const db = await getDb();
  const session = db.sessions.find((s) => s.token === token);
  if (!session) return { ok: false, reason: "unauthorized" };
  if (new Date(session.expiresAt).getTime() <= Date.now()) return { ok: false, reason: "expired" };

  const user = db.users.find((u) => u.id === session.userId);
  return user ? { ok: true, user, token } : { ok: false, reason: "unauthorized" };
}

export function unauthorizedResponse(reason: "unauthorized" | "expired") {
  return reason === "expired"
    ? apiError(401, "SESSION_EXPIRED", "Sua sessão expirou.")
    : apiError(401, "UNAUTHORIZED", "Faça login para continuar.");
}
