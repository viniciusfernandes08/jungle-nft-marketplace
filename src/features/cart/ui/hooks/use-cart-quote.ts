import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { container } from "@/app/container";
import type { NetworkId } from "@/shared/domain/network";
import { useCart, useCartScope } from "./use-cart";

export const quoteKeys = {
  all: ["quote"] as const,
};

/**
 * Cotação do carrinho atual. A chave inclui os itens, o cupom e a rede, então cada alteração
 * gera uma nova consulta; a anterior é cancelada e o resumo anterior fica visível (esmaecido).
 */
export function useCartQuote(network?: NetworkId) {
  const scope = useCartScope();
  const { data: cart } = useCart();
  const items = cart?.items ?? [];
  const couponCode = cart?.couponCode;

  return useQuery({
    queryKey: [...quoteKeys.all, scope ?? "pending", items, couponCode, network ?? "ethereum"] as const,
    queryFn: ({ signal }) => container.quote.get({ items, couponCode, network }, signal),
    enabled: scope !== null && cart !== undefined && items.length > 0,
    placeholderData: keepPreviousData,
  });
}
