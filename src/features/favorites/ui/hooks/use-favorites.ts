import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { container } from "@/app/container";
import { useAnnounce } from "@/components/announcer-context";
import { useSession } from "@/features/auth/ui/hooks/use-session";

/** Chave por usuário: favoritos de uma sessão nunca aparecem em outra. */
export const favoriteKeys = {
  all: ["favorites"] as const,
  byUser: (userId: string) => [...favoriteKeys.all, userId] as const,
};

export function useFavorites() {
  const { data: session } = useSession();
  const userId = session?.user.id;
  return useQuery({
    queryKey: favoriteKeys.byUser(userId ?? "none"),
    queryFn: ({ signal }) => container.favorites.list(signal),
    enabled: Boolean(userId),
  });
}

type ToggleInput = { nftId: string; favorite: boolean };

/**
 * Atualização otimista: o coração muda na hora; se a API falhar, o estado volta
 * ao que era e o usuário é avisado. Depois sempre reconcilia com o servidor.
 */
export function useToggleFavorite() {
  const queryClient = useQueryClient();
  const announce = useAnnounce();
  const { data: session } = useSession();
  const key = favoriteKeys.byUser(session?.user.id ?? "none");

  return useMutation({
    mutationFn: ({ nftId, favorite }: ToggleInput) =>
      favorite ? container.favorites.add(nftId) : container.favorites.remove(nftId),
    onMutate: async ({ nftId, favorite }) => {
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<string[]>(key);
      queryClient.setQueryData<string[]>(key, (old = []) =>
        favorite ? [...new Set([...old, nftId])] : old.filter((id) => id !== nftId),
      );
      return { previous };
    },
    onError: (_error, _input, context) => {
      queryClient.setQueryData(key, context?.previous);
      announce("Não foi possível atualizar seus favoritos. Tente novamente.");
    },
    onSuccess: (_data, { favorite }) => {
      announce(favorite ? "Adicionado aos favoritos." : "Removido dos favoritos.");
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: key }),
  });
}
