import { Link } from "@tanstack/react-router";
import { Skeleton } from "@/components/ui/skeleton";
import { errorMessage } from "@/lib/error-message";
import { compareEth, formatEth } from "@/shared/domain/eth";
import type { Quote } from "@/features/cart/domain/quote";

type Props = {
  quote: Quote | undefined;
  quoteError: unknown;
  refreshing: boolean;
  onRetry: () => void;
};

const row = "flex items-baseline justify-between gap-4";

export function CheckoutSummary({ quote, quoteError, refreshing, onRetry }: Props) {
  const blocked = Boolean(quote && quote.issues.length > 0);
  const noDiscount = quote ? compareEth(quote.discountEth, "0") === 0 : true;

  return (
    <section aria-labelledby="checkout-summary-title" className="flex flex-col gap-4">
      <h2 id="checkout-summary-title" className="text-body font-bold">
        Seus NFTs
      </h2>

      {quoteError && !quote ? (
        <div role="alert" className="rounded-lg bg-card p-4 text-small">
          <p>{errorMessage(quoteError)}</p>
          <button
            type="button"
            onClick={onRetry}
            className="mt-2 font-bold text-primary underline"
          >
            Tentar novamente
          </button>
        </div>
      ) : !quote ? (
        <div className="flex flex-col gap-3" aria-hidden="true">
          {Array.from({ length: 3 }, (_, index) => (
            <div key={index} className="flex items-center gap-3">
              <Skeleton className="size-12 shrink-0 !rounded-md" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-4 w-3/4 !rounded-sm" />
                <Skeleton className="h-3 w-1/2 !rounded-sm" />
              </div>
              <Skeleton className="h-4 w-14 !rounded-sm" />
            </div>
          ))}
        </div>
      ) : (
        <div aria-busy={refreshing} className={refreshing ? "opacity-60" : undefined}>
          <div className="flex items-baseline justify-between border-b border-hairline border-primary/40 pb-1 text-micro text-muted-foreground">
            <span>NFTs</span>
            <span>Subtotal</span>
          </div>

          <ul className="flex flex-col gap-3 pt-3">
            {quote.lines.map((line) => (
              <li
                key={`${line.nftId}:${line.editionId}`}
                className="grid grid-cols-[48px_minmax(0,1fr)_auto] items-center gap-3"
              >
                <img
                  src={line.imageUrl}
                  alt=""
                  width={48}
                  height={48}
                  loading="lazy"
                  decoding="async"
                  className="size-12 rounded-md bg-secondary object-cover"
                />
                <div className="min-w-0">
                  <p className="truncate text-small leading-tight">
                    <span className="font-bold">{line.name}</span>{" "}
                    <span className="text-muted-foreground">(× {line.quantity})</span>
                  </p>
                  <p className="text-micro text-muted-foreground">ID do token: #{line.tokenId}</p>
                </div>
                <p className="text-small text-primary">{formatEth(line.lineTotalEth)} ETH</p>
              </li>
            ))}
          </ul>

          <p className="mt-4 text-small">
            Tem um código promocional?{" "}
            <Link to="/cart" className="text-primary underline">
              Aplique aqui
            </Link>
          </p>

          <dl className="mt-4 flex flex-col gap-3">
            <div className={row}>
              <dt className="text-small">Subtotal</dt>
              <dd className="text-body">{formatEth(quote.subtotalEth)} ETH</dd>
            </div>
            <div className={row}>
              <dt className="text-small">Desconto do lançamento</dt>
              <dd className="text-small">
                (-) {noDiscount ? "00.00" : `${formatEth(quote.discountEth)} ETH`}
              </dd>
            </div>
            <div>
              <div className={row}>
                <dt className="text-small">Taxa de rede</dt>
                <dd className="text-body">{formatEth(quote.networkFeeEth)} ETH</dd>
              </div>
              <p className="text-right text-micro text-primary">Taxa estimada</p>
            </div>
            <div className={`${row} border-t border-hairline border-primary pt-3`}>
              <dt className="text-small font-bold">Total</dt>
              <dd className="text-subheading font-bold text-primary">
                {formatEth(quote.totalEth)} ETH
              </dd>
            </div>
          </dl>
        </div>
      )}

      {Boolean(quoteError) && quote && (
        <p role="status" className="text-micro text-destructive">
          {errorMessage(quoteError)}{" "}
          <button type="button" onClick={onRetry} className="font-bold underline">
            Tentar novamente
          </button>
        </p>
      )}

      {blocked && (
        <p role="status" className="text-small text-destructive">
          Resolva os itens indisponíveis no{" "}
          <Link to="/cart" className="font-bold underline">
            carrinho
          </Link>
          .
        </p>
      )}
    </section>
  );
}
