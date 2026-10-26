import { Link, useNavigate } from "@tanstack/react-router";
import { Skeleton } from "@/components/ui/skeleton";
import { useSession } from "@/features/auth/ui/hooks/use-session";
import { errorMessage } from "@/lib/error-message";
import { compareEth, formatEth } from "@/shared/domain/eth";
import type { Cart } from "../../domain/cart";
import type { Quote } from "../../domain/quote";
import { CouponForm } from "./coupon-form";

type Props = {
  cart: Cart;
  quote: Quote | undefined;
  quoteError: unknown;
  refreshing: boolean;
  busy: boolean;
  onRetry: () => void;
};

const row = "flex items-baseline justify-between gap-4";

export function CartSummary({ cart, quote, quoteError, refreshing, busy, onRetry }: Props) {
  const navigate = useNavigate();
  const { data: session } = useSession();

  const blocked = Boolean(quote && quote.issues.length > 0);
  const canFinalize = Boolean(quote) && !quoteError && !blocked && !refreshing && !busy;
  const noDiscount = quote ? compareEth(quote.discountEth, "0") === 0 : true;

  function finalize() {
    if (!session) void navigate({ to: "/login", search: { redirect: "/checkout" } });
    else void navigate({ to: "/checkout" });
  }

  return (
    <section aria-labelledby="resumo-titulo" className="flex flex-col gap-5">
      <h2 id="resumo-titulo" className="border-b border-b-hairline border-b-primary pb-2 text-body font-bold">
        Resumo da carteira
      </h2>

      <div className="flex flex-col gap-2">
        <p className="text-small font-bold">Código promocional</p>
        <CouponForm appliedCode={cart.couponCode} appliedStatus={quote?.couponStatus} />
      </div>

      {quoteError && !quote ? (
        <div role="alert" className="rounded-lg bg-card p-4 text-small">
          <p>{errorMessage(quoteError)}</p>
          <button type="button" onClick={onRetry} className="mt-2 font-bold text-primary underline">
            Tentar novamente
          </button>
        </div>
      ) : !quote ? (
        <div aria-hidden="true" className="flex flex-col gap-3">
          {Array.from({ length: 4 }, (_, i) => (
            <Skeleton key={i} className="h-6 w-full !rounded-sm" />
          ))}
        </div>
      ) : (
        <dl aria-busy={refreshing} className={`flex flex-col gap-3 transition-opacity ${refreshing ? "opacity-60" : ""}`}>
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
          <div className={`${row} border-b-hairline border-b-primary pt-3`}>
            <dt className="text-small font-bold">Total</dt>
            <dd className="text-subheading font-bold text-primary">{formatEth(quote.totalEth)} ETH</dd>
          </div>
        </dl>
      )}

      {blocked && (
        <p role="status" className="text-small text-destructive">
          Resolva os itens indisponíveis para continuar.
        </p>
      )}

      <button
        type="button"
        disabled={!canFinalize}
        onClick={finalize}
        className="rounded-lg bg-primary py-3 text-small font-bold text-primary-foreground disabled:opacity-50"
      >
        Conectar e finalizar
      </button>
      <Link to="/" className="text-center text-small text-primary">
        Continuar explorando
      </Link>
    </section>
  );
}
