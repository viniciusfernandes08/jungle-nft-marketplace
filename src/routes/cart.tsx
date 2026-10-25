import { createFileRoute } from "@tanstack/react-router";
import { CartPage } from "@/features/cart/ui/components/cart-page";

export const Route = createFileRoute("/cart")({
  component: CartPage,
});
