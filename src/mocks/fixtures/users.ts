export type MockUser = {
  id: string;
  email: string;
  fullName: string;
  avatarUrl?: string;
  passwordHash: string;
};

/** Hash com salt (SHA-256). Os mocks nunca guardam senha em claro. */
export async function hashPassword(password: string, salt: string): Promise<string> {
  const data = new TextEncoder().encode(`${salt}:${password}`);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, "0")).join("");
}

export const SEED_PASSWORD = "Kurio@123";

export async function buildSeedUsers(): Promise<MockUser[]> {
  const seeds = [
    { id: "user-ana", email: "ana@kurio.test", fullName: "Ana Souza" },
    { id: "user-bruno", email: "bruno@kurio.test", fullName: "Bruno Lima" },
  ];
  return Promise.all(
    seeds.map(async (seed) => ({
      ...seed,
      passwordHash: await hashPassword(SEED_PASSWORD, seed.id),
    })),
  );
}
