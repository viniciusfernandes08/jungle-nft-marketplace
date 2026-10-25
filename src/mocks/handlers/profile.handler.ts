import { http, HttpResponse } from "msw";
import { z } from "zod";
import type { Profile, UpdateProfileInput } from "@/features/profile/domain/profile";
import { isValidEnsName } from "@/features/wallets/domain/wallet";
import { ConflictCode } from "@/shared/domain/errors";
import { getDb, saveDb, type MockDb } from "../db/store";
import { createProfileForUser } from "../fixtures/profiles";
import { hashPassword, type MockUser } from "../fixtures/users";
import { authenticate, unauthorizedResponse } from "../lib/auth";
import { apiError, readJson, withScenario } from "../lib/respond";

const profileSchema = z
  .object({
    displayName: z.string().trim().min(2, "Informe o nome de exibição.").max(60),
    username: z
      .string()
      .trim()
      .min(3, "O nome de usuário deve ter ao menos 3 caracteres.")
      .max(30, "O nome de usuário deve ter no máximo 30 caracteres.")
      .regex(/^[a-zA-Z0-9_]+$/, "Use apenas letras, números e sublinhado."),
    email: z.string().trim().pipe(z.email("Informe um e-mail válido.")),
    ensName: z.string().trim().max(80).optional().default(""),
    walletNickname: z.string().trim().min(1, "Informe um apelido para a carteira.").max(40),
  })
  .superRefine((value, ctx) => {
    if (value.ensName && !isValidEnsName(value.ensName)) {
      ctx.addIssue({
        code: "custom",
        path: ["ensName"],
        message: "Informe um ENS válido (ex.: nome.eth).",
      });
    }
  });

const avatarSchema = z.object({
  avatarDataUrl: z
    .string()
    .max(3_000_000, "A imagem deve ter no máximo 2 MB.")
    .regex(/^data:image\/(png|jpeg|webp);base64,/, "Use uma imagem PNG, JPEG ou WebP.")
    .nullable(),
});

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Informe sua senha atual."),
    newPassword: z
      .string()
      .min(8, "A nova senha deve ter ao menos 8 caracteres.")
      .regex(/[A-Za-z]/, "A nova senha deve ter ao menos uma letra.")
      .regex(/\d/, "A nova senha deve ter ao menos um número.")
      .regex(/[^A-Za-z0-9]/, "A nova senha deve ter ao menos um símbolo."),
  })
  .superRefine((value, ctx) => {
    if (value.currentPassword === value.newPassword) {
      ctx.addIssue({
        code: "custom",
        path: ["newPassword"],
        message: "A nova senha deve ser diferente da atual.",
      });
    }
  });

function ensureProfile(db: MockDb, user: MockUser): Profile {
  const existing = db.profiles[user.id];
  if (existing) return existing;
  const profile = createProfileForUser(user);
  db.profiles[user.id] = profile;
  return profile;
}

function syncPrimaryWallet(db: MockDb, userId: string, walletNickname: string): void {
  const primary = db.wallets[userId]?.find((wallet) => wallet.kind === "primary");
  if (!primary) return;
  primary.label = walletNickname;
  primary.nickname = walletNickname;
}

function publicProfile(profile: Profile): Profile {
  return profile;
}

export const profileHandlers = [
  http.get(
    "/api/profile",
    withScenario(async ({ request }) => {
      const auth = await authenticate(request);
      if (!auth.ok) return unauthorizedResponse(auth.reason);
      const db = await getDb();
      const profile = ensureProfile(db, auth.user);
      saveDb(db);
      return HttpResponse.json(publicProfile(profile));
    }),
  ),

  http.patch(
    "/api/profile",
    withScenario(async ({ request }) => {
      const auth = await authenticate(request);
      if (!auth.ok) return unauthorizedResponse(auth.reason);

      const body = await readJson(request, profileSchema);
      if (!body.ok) return body.response;

      const db = await getDb();
      const email = body.data.email.toLowerCase();
      if (db.users.some((user) => user.id !== auth.user.id && user.email === email)) {
        return apiError(409, ConflictCode.EmailTaken, "Este e-mail já está cadastrado.", {
          email: "Este e-mail já está cadastrado.",
        });
      }

      const profile = ensureProfile(db, auth.user);
      const input: UpdateProfileInput = {
        displayName: body.data.displayName,
        username: body.data.username,
        email,
        ensName: body.data.ensName ?? "",
        walletNickname: body.data.walletNickname,
      };
      const nextProfile: Profile = {
        ...profile,
        ...input,
        updatedAt: new Date().toISOString(),
      };
      db.profiles[auth.user.id] = nextProfile;

      // A sessão e o cabeçalho usam estes campos.
      auth.user.fullName = input.displayName;
      auth.user.email = input.email;
      syncPrimaryWallet(db, auth.user.id, input.walletNickname);

      saveDb(db);
      return HttpResponse.json(publicProfile(nextProfile));
    }),
  ),

  http.patch(
    "/api/profile/avatar",
    withScenario(async ({ request }) => {
      const auth = await authenticate(request);
      if (!auth.ok) return unauthorizedResponse(auth.reason);

      const body = await readJson(request, avatarSchema);
      if (!body.ok) return body.response;

      const db = await getDb();
      const profile = ensureProfile(db, auth.user);
      const nextProfile: Profile = {
        ...profile,
        avatarUrl: body.data.avatarDataUrl,
        updatedAt: new Date().toISOString(),
      };
      db.profiles[auth.user.id] = nextProfile;
      auth.user.avatarUrl = body.data.avatarDataUrl ?? undefined;

      saveDb(db);
      return HttpResponse.json(publicProfile(nextProfile));
    }),
  ),

  http.patch(
    "/api/profile/password",
    withScenario(async ({ request }) => {
      const auth = await authenticate(request);
      if (!auth.ok) return unauthorizedResponse(auth.reason);

      const body = await readJson(request, passwordSchema);
      if (!body.ok) return body.response;

      const db = await getDb();
      const user = db.users.find((candidate) => candidate.id === auth.user.id);
      if (!user) return unauthorizedResponse("unauthorized");

      const currentHash = await hashPassword(body.data.currentPassword, user.id);
      if (user.passwordHash !== currentHash) {
        return apiError(422, "INVALID_PASSWORD", "A senha atual está incorreta.", {
          currentPassword: "A senha atual está incorreta.",
        });
      }

      user.passwordHash = await hashPassword(body.data.newPassword, user.id);
      saveDb(db);
      return new HttpResponse(null, { status: 204 });
    }),
  ),
];
