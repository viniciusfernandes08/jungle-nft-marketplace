/**
 * Dados do colecionador exibidos em "Meu perfil".
 * `id` é o id do usuário dono do perfil.
 */
export type Profile = {
  id: string;
  displayName: string;
  username: string;
  email: string;
  ensName: string;
  walletNickname: string;
  avatarUrl: string | null;
  updatedAt: string;
};

export type UpdateProfileInput = {
  displayName: string;
  username: string;
  email: string;
  ensName: string;
  walletNickname: string;
};

export type ChangePasswordInput = {
  currentPassword: string;
  newPassword: string;
};

export interface ProfileRepository {
  get(signal?: AbortSignal): Promise<Profile>;
  update(input: UpdateProfileInput): Promise<Profile>;
  updateAvatar(avatarDataUrl: string | null): Promise<Profile>;
  changePassword(input: ChangePasswordInput): Promise<void>;
}
