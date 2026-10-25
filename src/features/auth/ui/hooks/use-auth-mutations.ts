import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { container } from "@/app/container";
import { useAnnounce } from "@/components/announcer-context";
import { endSession, establishSession } from "../session-cache";

export function useLogin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: container.auth.login,
    onSuccess: (session) => establishSession(queryClient, session),
  });
}

export function useRegister() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: container.auth.register,
    onSuccess: (session) => establishSession(queryClient, session),
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const announce = useAnnounce();
  return useMutation({
    mutationFn: container.auth.logout,
    onSettled: () => {
      endSession(queryClient);
      announce("Você saiu da sua conta.");
      // Reavalia os guards: rotas privadas redirecionam para o login.
      void router.invalidate();
    },
  });
}
