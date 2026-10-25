import type { AxiosInstance } from "axios";
import { request } from "@/shared/infra/map-http-error";
import type {
  ChangePasswordInput,
  Profile,
  ProfileRepository,
  UpdateProfileInput,
} from "../domain/profile";

export function createHttpProfileRepository(client: AxiosInstance): ProfileRepository {
  return {
    get: (signal) => request(() => client.get<Profile>("/profile", { signal })),
    update: (input: UpdateProfileInput) =>
      request(() => client.patch<Profile>("/profile", input)),
    updateAvatar: (avatarDataUrl) =>
      request(() => client.patch<Profile>("/profile/avatar", { avatarDataUrl })),
    changePassword: async (input: ChangePasswordInput) => {
      await request(() => client.patch<void>("/profile/password", input));
    },
  };
}
