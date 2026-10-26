import { queryOptions, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { container } from "@/app/container";
import type { Session } from "@/features/auth/domain/session";
import { sessionKey } from "@/features/auth/ui/session-cache";
import { useSession } from "@/features/auth/ui/hooks/use-session";
import type { Profile } from "../../domain/profile";

export const profileKeys = {
  all: ["profile"] as const,
  details: (userId: string) => [...profileKeys.all, userId] as const,
};

export function profileQueryOptions(userId: string) {
  return queryOptions({
    queryKey: profileKeys.details(userId),
    queryFn: ({ signal }) => container.profile.get(signal),
    staleTime: 30_000,
  });
}

export function useProfile() {
  const { data: session } = useSession();
  const userId = session?.user.id;
  return useQuery({
    ...profileQueryOptions(userId ?? "anonymous"),
    enabled: Boolean(userId),
  });
}

function syncProfileCaches(queryClient: ReturnType<typeof useQueryClient>, profile: Profile) {
  queryClient.setQueryData(profileKeys.details(profile.id), profile);
  queryClient.setQueryData<Session | null>(sessionKey, (session) =>
    session
      ? {
          ...session,
          user: {
            ...session.user,
            fullName: profile.displayName,
            email: profile.email,
            avatarUrl: profile.avatarUrl ?? undefined,
          },
        }
      : session,
  );
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: container.profile.update,
    onSuccess: (profile) => {
      syncProfileCaches(queryClient, profile);
      void queryClient.invalidateQueries({ queryKey: ["wallets"] });
    },
  });
}

export function useUpdateAvatar() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: container.profile.updateAvatar,
    onSuccess: (profile) => syncProfileCaches(queryClient, profile),
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: container.profile.changePassword,
  });
}
