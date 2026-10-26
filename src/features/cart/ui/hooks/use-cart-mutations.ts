import { useMutation, useQueryClient, type QueryClient } from "@tanstack/react-query";
import { container } from "@/app/container";
import { useAnnounce } from "@/components/announcer-context";
import { sameCartLine, type Cart, type CartItem } from "../../domain/cart";
import { cartKeys, useCartScope } from "./use-cart";

const MUTATION_KEY = ["cart", "line"] as const;

function settle(queryClient: QueryClient, key: readonly unknown[]) {
  if (queryClient.isMutating({ mutationKey: MUTATION_KEY }) === 1) {
    void queryClient.invalidateQueries({ queryKey: key });
  }
}

function useCartKey() {
  return cartKeys.scope(useCartScope() ?? "guest");
}

export function useUpdateCartItem() {
  const queryClient = useQueryClient();
  const announce = useAnnounce();
  const key = useCartKey();

  return useMutation({
    mutationKey: MUTATION_KEY,
    mutationFn: (item: CartItem) => container.cart.updateItem(item),
    onMutate: async (item) => {
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<Cart>(key);
      queryClient.setQueryData<Cart>(key, (old) =>
        old && { ...old, items: old.items.map((i) => (sameCartLine(i, item) ? { ...i, quantity: item.quantity } : i)) },
      );
      return { previous };
    },
    onError: (error, _item, context) => {
      queryClient.setQueryData(key, context?.previous);
      announce(error.message);
    },
    onSettled: () => settle(queryClient, key),
  });
}

export function useRemoveCartItem() {
  const queryClient = useQueryClient();
  const announce = useAnnounce();
  const key = useCartKey();

  return useMutation({
    mutationKey: MUTATION_KEY,
    mutationFn: ({ nftId, editionId }: { nftId: string; editionId: string; name: string }) =>
      container.cart.removeItem(nftId, editionId),
    onMutate: async (item) => {
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<Cart>(key);
      queryClient.setQueryData<Cart>(key, (old) =>
        old && { ...old, items: old.items.filter((i) => !(i.nftId === item.nftId && i.editionId === item.editionId)) },
      );
      return { previous };
    },
    onSuccess: (_cart, item) => announce(`${item.name} removido do carrinho.`),
    onError: (error, _item, context) => {
      queryClient.setQueryData(key, context?.previous);
      announce(`Não foi possível remover o item. ${error.message}`);
    },
    onSettled: () => settle(queryClient, key),
  });
}

export function useApplyCoupon() {
  const queryClient = useQueryClient();
  const key = useCartKey();
  return useMutation({
    mutationFn: (code: string) => container.quote.applyCoupon(code),
    onSuccess: ({ status }) => {
      if (status === "applied") void queryClient.invalidateQueries({ queryKey: key });
    },
  });
}

export function useRemoveCoupon() {
  const queryClient = useQueryClient();
  const key = useCartKey();
  return useMutation({
    mutationFn: () => container.cart.setCoupon(undefined),
    onSuccess: (cart) => queryClient.setQueryData(key, cart),
  });
}
