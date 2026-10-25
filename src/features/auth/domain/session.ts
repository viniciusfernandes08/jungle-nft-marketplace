export type User = {
  id: string;
  email: string;
  fullName: string;
  avatarUrl?: string;
};

export type Session = {
  user: User;
  expiresAt: string; // ISO
};

/** `token` é credencial opaca; guardá-la é responsabilidade da infra. */
export type AuthResult = {
  session: Session;
  token: string;
};

export type LoginInput = { email: string; password: string };
export type RegisterInput = { fullName: string; email: string; password: string };

export function isSessionExpired(session: Session, now: Date = new Date()): boolean {
  return new Date(session.expiresAt).getTime() <= now.getTime();
}
