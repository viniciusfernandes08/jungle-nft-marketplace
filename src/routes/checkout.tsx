import { createFileRoute } from "@tanstack/react-router";
import { requireAuth } from "@/features/auth/ui/guards";
import { CheckoutPage } from "@/features/checkout/ui/checkout-page";

export type CheckoutSearch = { order?: string };

export const Route = createFileRoute("/checkout")({
  validateSearch: (search: Record<string, unknown>): CheckoutSearch => ({
    order: typeof search.order === "string" && search.order.length > 0 ? search.order : undefined,
  }),
  beforeLoad: ({ context, location }) =>
    requireAuth({ queryClient: context.queryClient, href: location.href }),
  component: CheckoutRoute,
});

function CheckoutRoute() {
  const { order } = Route.useSearch();
  return <CheckoutPage orderId={order} />;
}
