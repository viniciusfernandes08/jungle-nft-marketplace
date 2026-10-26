import type { Profile } from "@/features/profile/domain/profile";
import type { MockUser } from "./users";

const SEEDED_AT = "2026-01-15T12:00:00.000Z";

export function buildSeedProfiles(): Record<string, Profile> {
  return {
    "user-ana": {
      id: "user-ana",
      displayName: "Ana Souza",
      username: "anasouza",
      email: "ana@kurio.test",
      ensName: "ana.kurio.eth",
      walletNickname: "Principal",
      avatarUrl: null,
      updatedAt: SEEDED_AT,
    },
    "user-bruno": {
      id: "user-bruno",
      displayName: "Bruno Lima",
      username: "brunolima",
      email: "bruno@kurio.test",
      ensName: "bruno.kurio.eth",
      walletNickname: "Principal",
      avatarUrl: null,
      updatedAt: SEEDED_AT,
    },
  };
}

function usernameFromEmail(email: string): string {
  const base = email.split("@")[0]?.replace(/[^a-zA-Z0-9_]/g, "") || "colecionador";
  return base.slice(0, 30);
}

export function createProfileForUser(user: MockUser): Profile {
  return {
    id: user.id,
    displayName: user.fullName,
    username: usernameFromEmail(user.email),
    email: user.email,
    ensName: "",
    walletNickname: "Principal",
    avatarUrl: user.avatarUrl ?? null,
    updatedAt: new Date().toISOString(),
  };
}
