import { useQuery } from "@tanstack/react-query";
import { container } from "@/app/container";
import { orderKeys } from "./order-keys";

export function useOrder(id: string | undefined) {
  return useQuery({
    queryKey: orderKeys.detail(id ?? ""),
    queryFn: ({ signal }) => container.orders.get(id as string, signal),
    enabled: Boolean(id),
    refetchInterval: (query) => (query.state.data?.status === "pending" ? 2000 : false),
  });
}
