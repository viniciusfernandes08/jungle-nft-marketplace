import { Link } from "@tanstack/react-router";
import { Icon } from "@/components/icon";
import { cn } from "@/lib/utils";
import { useCartCount } from "../hooks/use-cart";

export function CartLink({ className, iconClassName }: { className?: string; iconClassName?: string }) {
  const count = useCartCount();
  return (
    <Link
      to="/cart"
      aria-label={count > 0 ? `Carrinho, ${count} ${count === 1 ? "item" : "itens"}` : "Carrinho"}
      className={cn("relative grid size-8 place-items-center", className)}
    >
      <Icon name="cart" className={iconClassName} />
      {count > 0 && (
        <span
          aria-hidden="true"
          className="absolute -right-1 -top-1 grid min-w-4 place-items-center rounded-full bg-primary px-1 text-micro font-bold text-primary-foreground"
        >
          {count}
        </span>
      )}
    </Link>
  );
}
