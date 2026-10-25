import type {
  ChangePasswordInput,
  ProfileRepository,
  UpdateProfileInput,
} from "../domain/profile";

export const makeGetProfile = (repo: ProfileRepository) => (signal?: AbortSignal) =>
  repo.get(signal);

export const makeUpdateProfile =
  (repo: ProfileRepository) => (input: UpdateProfileInput) => repo.update(input);

export const makeUpdateAvatar =
  (repo: ProfileRepository) => (avatarDataUrl: string | null) => repo.updateAvatar(avatarDataUrl);

export const makeChangePassword =
  (repo: ProfileRepository) => (input: ChangePasswordInput) => repo.changePassword(input);
