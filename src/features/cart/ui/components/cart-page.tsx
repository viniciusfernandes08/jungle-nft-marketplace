import { Link, useCanGoBack, useNavigate, useRouter } from "@tanstack/react-router";
import { Icon } from "@/components/icon";
import { Skeleton } from "@/components/ui/skeleton";
import { errorMessage } from "@/lib/error-message";
import type { CartItem } from "../../domain/cart";
import { useCartQuote } from "../hooks/use-cart-quote";
import { useRemoveCartItem, useUpdateCartItem } from "../hooks/use-cart-mutations";
import { useCart } from "../hooks/use-cart";
import { CartListItem, CartRowsSkeleton, CartTableRow, type CartRowData } from "./cart-rows";
import { CartSummary } from "./cart-summary";
import { SuggestedNfts } from "./suggested-nfts";

const shell = "mx-auto w-full max-w-[1200px] px-4 pb-[26rem] pt-4 sm:px-6 lg:pb-16 lg:pt-8 xl:px-0";

export function CartPage() {
  const router = useRouter();
  const canGoBack = useCanGoBack();
  const navigate = useNavigate();
  const cartQuery = useCart();
  const quoteQuery = useCartQuote();
  const update = useUpdateCartItem();
  const remove = useRemoveCartItem();

  const cart = cartQuery.data;
  const quote = quoteQuery.data;
  const goBack = () => (canGoBack ? router.history.back() : void navigate({ to: "/" }));

  const onQuantity = (item: CartItem, quantity: number) => update.mutate({ ...item, quantity });
  const onRemove = ({ item, line }: CartRowData) =>
    remove.mutate({ nftId: item.nftId, editionId: item.editionId, name: line.name });

  const rows: CartRowData[] =
    cart?.items.flatMap((item) => {
      const line = quote?.lines.find((l) => l.nftId === item.nftId && l.editionId === item.editionId);
      if (!line) return [];
      const issue = quote?.issues.find((i) => i.nftId === item.nftId && i.editionId === item.editionId);
      return [{ item, line, issue }];
    }) ?? [];

  const header = (
    <>
      <h1 className="sr-only">Carrinho de NFTs</h1>
      <div className="relative mb-5 flex items-center justify-center lg:hidden">
        <button type="button" aria-label="Voltar" onClick={goBack} className="absolute left-0 grid size-10 place-items-center rounded-full bg-card text-primary">
          <Icon name="chevron-right" className="rotate-180" />
        </button>
        <p aria-hidden="true" className="text-body font-bold">Carrinho de NFTs</p>
      </div>
      <nav aria-label="Você está em" className="hidden text-small font-bold lg:block">
        <ol className="flex gap-2">
          <li><Link to="/">Início</Link></li>
          <li aria-hidden="true">/</li>
          <li><Link to="/" hash="catalogo">Mercado</Link></li>
          <li aria-hidden="true">/</li>
          <li aria-current="page">Carrinho</li>
        </ol>
      </nav>
    </>
  );

  if (cartQuery.isPending) {
    return (
      <div className={shell} aria-busy="true" aria-label="Carregando carrinho">
        {header}
        <div className="mt-4 grid gap-8 lg:grid-cols-[minmax(0,1fr)_332px] lg:gap-[86px]">
          <CartRowsSkeleton count={3} />
          <Skeleton className="hidden h-80 w-full lg:block" />
        </div>
      </div>
    );
  }

  if (cartQuery.isError) {
    return (
      <div className={shell}>
        {header}
        <div role="alert" className="mt-4 rounded-lg bg-card p-8 text-center">
          <h2 className="text-heading font-bold">Não foi possível carregar o carrinho</h2>
          <p className="mt-2 text-small text-muted-foreground">{errorMessage(cartQuery.error)}</p>
          <button type="button" onClick={() => cartQuery.refetch()} className="mt-6 rounded-lg bg-primary px-6 py-3 text-small font-bold text-primary-foreground">
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  // `isPending`/`isError` não estreitam `cartQuery.data` para o TypeScript.
  if (!cart) return null;

  if (cart.items.length === 0) {
    return (
      <div className={shell}>
        {header}
        <div className="mt-4 rounded-lg bg-card p-8 text-center">
          <h2 className="text-heading font-bold">Seu carrinho está vazio</h2>
          <p className="mt-2 text-small text-muted-foreground">Explore o catálogo e adicione NFTs para continuar.</p>
          <Link to="/" hash="catalogo" className="mt-6 inline-block rounded-lg bg-primary px-6 py-3 text-small font-bold text-primary-foreground">
            Continuar explorando
          </Link>
        </div>
      </div>
    );
  }

  const summary = (
    <CartSummary
      cart={cart}
      quote={quote}
      quoteError={quoteQuery.error}
      refreshing={quoteQuery.isFetching}
      busy={update.isPending || remove.isPending}
      onRetry={() => quoteQuery.refetch()}
    />
  );

  return (
    <div className={shell}>
      {header}

      <div className="mt-4 grid gap-8 lg:grid-cols-[minmax(0,1fr)_332px] lg:gap-[86px]">
        <section aria-label="Itens do carrinho" aria-busy={quoteQuery.isFetching}>
          {!quote ? (
            quoteQuery.isError ? null : <CartRowsSkeleton count={cart.items.length} />
          ) : (
            <>
              <table className="hidden w-full border-separate border-spacing-y-3 lg:table">
                <caption className="sr-only">Itens do carrinho</caption>
                <thead>
                  <tr className="text-left text-small">
                    <th scope="col" className="px-2 pb-1 font-bold">NFTs</th>
                    <th scope="col" className="px-2 pb-1 font-bold">Preço</th>
                    <th scope="col" className="px-2 pb-1 font-bold">Quantidade</th>
                    <th scope="col" className="px-2 pb-1 font-bold">Total</th>
                    <th scope="col" className="px-2 pb-1"><span className="sr-only">Remover</span></th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <CartTableRow key={`${row.item.nftId}:${row.item.editionId}`} row={row} onQuantity={onQuantity} onRemove={onRemove} />
                  ))}
                </tbody>
              </table>
              <ul className="flex flex-col gap-3 lg:hidden">
                {rows.map((row) => (
                  <CartListItem key={`${row.item.nftId}:${row.item.editionId}`} row={row} onQuantity={onQuantity} onRemove={onRemove} />
                ))}
              </ul>
            </>
          )}
        </section>

        <aside className="hidden lg:block">{summary}</aside>
      </div>

      <SuggestedNfts excludeIds={cart.items.map((i) => i.nftId)} />

      <div className="fixed inset-x-0 bottom-0 z-40 max-h-[80svh] overflow-y-auto rounded-t-[32px] bg-card px-6 pb-[max(1rem,env(safe-area-inset-bottom))] pt-6 shadow-[0_-8px_24px_rgba(0,0,0,0.4)] lg:hidden">
        {summary}
      </div>
    </div>
  );
}
