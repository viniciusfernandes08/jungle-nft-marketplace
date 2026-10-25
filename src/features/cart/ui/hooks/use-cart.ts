import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { container } from "@/app/container";
import { useSession } from "@/features/auth/ui/hooks/use-session";
import { cartItemCount, type CartItem } from "../../domain/cart";

/** Chave por escopo (id do usuário ou "guest"): o carrinho de uma sessão nunca vaza para outra. */
export const cartKeys = {
  all: ["cart"] as const,
  scope: (scope: string) => [...cartKeys.all, scope] as const,
};

export function useCartScope(): string | null {
  const { data: session } = useSession();
  if (session === undefined) return null; // sessão ainda carregando
  return session?.user.id ?? "guest";
}

export function useCart() {
  const scope = useCartScope();
  return useQuery({
    queryKey: cartKeys.scope(scope ?? "pending"),
    queryFn: ({ signal }) => container.cart.get(signal),
    enabled: scope !== null,
  });
}

export function useCartCount(): number {
  return cartItemCount(useCart().data);
}

export function useAddToCart() {
  const queryClient = useQueryClient();
  const scope = useCartScope();
  return useMutation({
    mutationFn: (item: CartItem) => container.cart.addItem(item),
    onSuccess: (cart) => queryClient.setQueryData(cartKeys.scope(scope ?? "guest"), cart),
  });
}
