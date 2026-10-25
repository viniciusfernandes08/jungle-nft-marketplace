import { http, HttpResponse } from "msw";
import { z } from "zod";
import type { AuthResult, Session } from "@/features/auth/domain/session";
import { ConflictCode, type FieldErrors } from "@/shared/domain/errors";
import { getDb, saveDb } from "../db/store";
import { createProfileForUser } from "../fixtures/profiles";
import { hashPassword, type MockUser } from "../fixtures/users";
import { authenticate } from "../lib/auth";
import { apiError, withScenario } from "../lib/respond";

const SESSION_TTL_MS = 2 * 60 * 60 * 1000;

const registerSchema = z.object({
  fullName: z.string().trim().min(3, "Informe seu nome completo."),
  email: z.email("Informe um e-mail válido."),
  password: z
    .string()
    .min(8, "A senha deve ter ao menos 8 caracteres.")
    .regex(/[A-Za-z]/, "A senha deve ter ao menos uma letra.")
    .regex(/\d/, "A senha deve ter ao menos um número."),
});

const loginSchema = z.object({
  email: z.email("Informe um e-mail válido."),
  password: z.string().min(1, "Informe sua senha."),
});

function toFieldErrors(error: z.ZodError): FieldErrors {
  const fieldErrors: FieldErrors = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    fieldErrors[key] ??= issue.message;
  }
  return fieldErrors;
}

const toSession = (user: MockUser, expiresAt: string): Session => ({
  user: { id: user.id, email: user.email, fullName: user.fullName, avatarUrl: user.avatarUrl },
  expiresAt,
});

async function openSession(user: MockUser): Promise<AuthResult> {
  const db = await getDb();
  const token = `tok_${crypto.randomUUID()}`;
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS).toISOString();
  db.sessions.push({ token, userId: user.id, expiresAt });
  saveDb(db);
  return { token, session: toSession(user, expiresAt) };
}

export const authHandlers = [
  http.post(
    "/api/auth/register",
    withScenario(async ({ request }) => {
      const parsed = registerSchema.safeParse(await request.json().catch(() => null));
      if (!parsed.success) {
        return apiError(422, "VALIDATION_ERROR", "Revise os campos informados.", toFieldErrors(parsed.error));
      }
      const { fullName, email, password } = parsed.data;
      const db = await getDb();
      const normalized = email.toLowerCase();

      if (db.users.some((u) => u.email === normalized)) {
        return apiError(409, ConflictCode.EmailTaken, "Este e-mail já está cadastrado.", {
          email: "Este e-mail já está cadastrado.",
        });
      }
      const id = `user-${crypto.randomUUID()}`;
      const user: MockUser = {
        id,
        email: normalized,
        fullName,
        passwordHash: await hashPassword(password, id),
      };
      db.users.push(user);
      db.profiles[id] = createProfileForUser(user);
      saveDb(db);
      return HttpResponse.json(await openSession(user), { status: 201 });
    }),
  ),

  http.post(
    "/api/auth/login",
    withScenario(async ({ request }) => {
      const parsed = loginSchema.safeParse(await request.json().catch(() => null));
      if (!parsed.success) {
        return apiError(422, "VALIDATION_ERROR", "Revise os campos informados.", toFieldErrors(parsed.error));
      }
      const db = await getDb();
      const user = db.users.find((u) => u.email === parsed.data.email.toLowerCase());
      const valid = user && user.passwordHash === (await hashPassword(parsed.data.password, user.id));
      if (!user || !valid) return apiError(401, "INVALID_CREDENTIALS", "E-mail ou senha incorretos.");
      return HttpResponse.json(await openSession(user));
    }),
  ),

  http.get(
    "/api/auth/session",
    withScenario(async ({ request }) => {
      const auth = await authenticate(request);
      if (!auth.ok) {
        return auth.reason === "expired"
          ? apiError(401, "SESSION_EXPIRED", "Sua sessão expirou.")
          : apiError(401, "UNAUTHORIZED", "Faça login para continuar.");
      }
      const db = await getDb();
      const session = db.sessions.find((s) => s.token === auth.token)!;
      return HttpResponse.json(toSession(auth.user, session.expiresAt));
    }),
  ),

  http.post(
    "/api/auth/logout",
    withScenario(async ({ request }) => {
      const auth = await authenticate(request);
      if (auth.ok) {
        const db = await getDb();
        db.sessions = db.sessions.filter((s) => s.token !== auth.token);
        saveDb(db);
      }
      return new HttpResponse(null, { status: 204 });
    }),
  ),
];
