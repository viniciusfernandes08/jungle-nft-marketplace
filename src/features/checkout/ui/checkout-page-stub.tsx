import { Link } from "@tanstack/react-router";

/** Provisório até a etapa de Pagamento. Já é uma rota privada: exige sessão. */
export function CheckoutPageStub() {
  return (
    <section className="mx-auto w-full max-w-[1200px] px-4 py-10 sm:px-6 xl:px-0">
      <div className="rounded-lg bg-card p-8">
        <h1 className="text-title font-bold">Pagamento</h1>
        <p className="mt-2 text-small text-muted-foreground">A tela de pagamento chega na próxima etapa.</p>
        <Link to="/cart" className="mt-6 inline-block rounded-lg bg-primary px-6 py-3 text-small font-bold text-primary-foreground">
          Voltar ao carrinho
        </Link>
      </div>
    </section>
  );
}
