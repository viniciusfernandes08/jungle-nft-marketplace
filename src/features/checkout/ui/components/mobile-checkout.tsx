import type { Session } from "@/features/auth/domain/session";
import type { Quote } from "@/features/cart/domain/quote";
import type { Wallet } from "@/features/wallets/domain/wallet";
import { errorMessage } from "@/lib/error-message";
import { formatEth } from "@/shared/domain/eth";
import type { WalletProviderId } from "@/features/wallets/domain/wallet";
import type { WalletConnectionState } from "@/features/wallets/ui/hooks/use-wallet-connection";
import { ProviderList } from "./provider-list";
import { WalletCards } from "./wallet-cards";

type Props = {
  session: Session;
  wallets: Wallet[];
  selectedWallet: Wallet | undefined;
  provider: WalletProviderId;
  connection: WalletConnectionState;
  quote: Quote | undefined;
  quoteError: unknown;
  quoteRefreshing: boolean;
  quoteReady: boolean;
  quoteBanner: string | undefined;
  submitError: string | undefined;
  submitting: boolean;
  onBack: () => void;
  onSelectWallet: (wallet: Wallet) => void;
  onSwapWallet: () => void;
  onProviderChange: (provider: WalletProviderId) => void;
  onRetryConnection: () => void;
  onDisconnect: () => void;
  onRetryQuote: () => void;
  onConfirm: () => void;
};

function BackIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="size-4"
    >
      <path d="M10 3 5 8l5 5" />
    </svg>
  );
}

export function MobileCheckout({
  session,
  wallets,
  selectedWallet,
  provider,
  connection,
  quote,
  quoteError,
  quoteRefreshing,
  quoteReady,
  quoteBanner,
  submitError,
  submitting,
  onBack,
  onSelectWallet,
  onSwapWallet,
  onProviderChange,
  onRetryConnection,
  onDisconnect,
  onRetryQuote,
  onConfirm,
}: Props) {
  const activeConnection =
    connection.status !== "idle" && connection.providerId === provider
      ? connection
      : ({ status: "idle" } as const);
  const connected = activeConnection.status === "connected";
  const blocked = Boolean(quote && quote.issues.length > 0);
  const canConfirm =
    Boolean(selectedWallet) &&
    Boolean(quote) &&
    !blocked &&
    !quoteError &&
    quoteReady &&
    connected &&
    !submitting;

  return (
    <>
      <div className="mx-auto w-full max-w-[480px] px-6 pb-48 pt-4">
        <header className="flex items-center gap-4">
          <button
            type="button"
            onClick={onBack}
            aria-label="Voltar"
            className="grid size-10 shrink-0 place-items-center rounded-full border border-primary/30 text-primary"
          >
            <BackIcon />
          </button>
          <h1 className="text-body font-bold">Pagamento com carteira</h1>
        </header>

        <div className="mt-6 flex flex-col gap-6">
          {wallets.length > 0 ? (
            <WalletCards
              wallets={wallets}
              selectedId={selectedWallet?.id}
              onSelect={onSelectWallet}
              onSwap={onSwapWallet}
            />
          ) : (
            <p className="rounded-lg bg-card p-4 text-small text-muted-foreground">
              Nenhuma carteira cadastrada. Cadastre uma carteira para continuar.
            </p>
          )}

          <ProviderList
            provider={provider}
            onChange={onProviderChange}
            connection={connection}
            onRetry={onRetryConnection}
            onDisconnect={onDisconnect}
            compact
          />

          {quoteBanner && (
            <p role="status" className="rounded-md bg-secondary px-3 py-2 text-small text-primary">
              {quoteBanner}
            </p>
          )}

          {submitError && (
            <p role="alert" className="rounded-md bg-secondary px-3 py-2 text-small text-destructive">
              {submitError}
            </p>
          )}

          {Boolean(quoteError) && !quote && (
            <div role="alert" className="rounded-lg bg-card p-4 text-small">
              <p>{errorMessage(quoteError)}</p>
              <button
                type="button"
                onClick={onRetryQuote}
                className="mt-2 font-bold text-primary underline"
              >
                Tentar novamente
              </button>
            </div>
          )}

          {blocked && (
            <p role="status" className="text-small text-destructive">
              Resolva os itens indisponíveis no carrinho para continuar.
            </p>
          )}

          <p className="text-micro text-muted-foreground">
            Pagamento simulado para {session.user.email}. Os dados do colecionador são usados
            somente neste pedido.
          </p>
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-40 rounded-t-2xl border-t border-hairline border-primary/30 bg-card px-6 pb-[max(1rem,env(safe-area-inset-bottom))] pt-4 lg:hidden">
        <div className="mx-auto flex w-full max-w-[480px] flex-col gap-3">
          <div className="flex items-baseline justify-between gap-4">
            <span className="text-small">Total:</span>
            <span
              aria-busy={quoteRefreshing}
              className={`text-subheading font-bold text-primary ${quoteRefreshing ? "opacity-60" : ""}`}
            >
              {quote ? `${formatEth(quote.totalEth)} ETH` : "—"}
            </span>
          </div>
          <button
            type="button"
            onClick={onConfirm}
            disabled={!canConfirm}
            className="w-full rounded-lg bg-primary py-3 text-small font-bold text-primary-foreground transition-opacity disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? "Processando..." : "Confirmar compra"}
          </button>
        </div>
      </div>
    </>
  );
}
