import { useQuery } from "@tanstack/react-query";
import { container } from "@/app/container";
import { orderKeys } from "./order-keys";

/**
 * O pedido nasce pendente e é confirmado pelo servidor (evento em tempo real).
 * Enquanto pendente, o polling é a rede de segurança caso o evento se perca.
 */
export function useOrder(id: string | undefined) {
  return useQuery({
    queryKey: orderKeys.detail(id ?? ""),
    queryFn: ({ signal }) => container.orders.get(id as string, signal),
    enabled: Boolean(id),
    refetchInterval: (query) => (query.state.data?.status === "pending" ? 2000 : false),
  });
}
