import { Link } from "@tanstack/react-router";
import { useCartCount } from "./hooks/use-cart";

export function CartPageStub() {
  const count = useCartCount();
  return (
    <section className="mx-auto w-full max-w-[1200px] px-4 py-10 sm:px-6 xl:px-0">
      <div className="rounded-lg bg-card p-8">
        <h1 className="text-title font-bold">Carrinho de NFTs</h1>
        <p className="mt-2 text-small text-muted-foreground">
          {count === 0 ? "Seu carrinho está vazio." : `Você tem ${count} ${count === 1 ? "item" : "itens"} no carrinho.`}
        </p>
        <p className="mt-4 text-small text-muted-foreground">A tela completa do carrinho chega na próxima etapa.</p>
        <Link to="/" className="mt-6 inline-block rounded-lg bg-primary px-6 py-3 text-small font-bold text-primary-foreground">
          Continuar explorando
        </Link>
      </div>
    </section>
  );
}
