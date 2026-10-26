import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { container } from "@/app/container";
import { useSession } from "@/features/auth/ui/hooks/use-session";
import type { WalletInput } from "../../domain/wallet";

export const walletKeys = {
  all: ["wallets"] as const,
  list: (userId: string) => [...walletKeys.all, userId] as const,
};

export function useWallets() {
  const { data: session } = useSession();
  const userId = session?.user.id;
  return useQuery({
    queryKey: walletKeys.list(userId ?? "anonymous"),
    queryFn: ({ signal }) => container.wallets.list(signal),
    enabled: Boolean(userId),
  });
}

export function useCreateWallet() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: container.wallets.create,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: walletKeys.all });
      void queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
  });
}

export function useUpdateWallet() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: WalletInput }) =>
      container.wallets.update(id, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: walletKeys.all });
      void queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
  });
}
