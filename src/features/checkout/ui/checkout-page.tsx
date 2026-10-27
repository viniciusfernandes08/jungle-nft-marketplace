import { Link, useCanGoBack, useNavigate, useRouter } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useRef, useState } from "react";
import { container } from "@/app/container";
import { useAnnounce } from "@/components/announcer-context";
import { useSession } from "@/features/auth/ui/hooks/use-session";
import { useCart } from "@/features/cart/ui/hooks/use-cart";
import { useCartQuote } from "@/features/cart/ui/hooks/use-cart-quote";
import { hasQuoteChanged, type Quote } from "@/features/cart/domain/quote";
import type { Session } from "@/features/auth/domain/session";
import type { Collector, CreateOrderInput } from "@/features/orders/domain/order";
import { orderKeys } from "@/features/orders/ui/constants/order-keys";
import type { Wallet, WalletProviderId } from "@/features/wallets/domain/wallet";
import { useWalletConnection } from "@/features/wallets/ui/hooks/use-wallet-connection";
import { useWallets } from "@/features/wallets/ui/hooks/use-wallets";
import { DESKTOP_QUERY, useMediaQuery } from "@/lib/use-media-query";
import { errorMessage } from "@/lib/error-message";
import { ConflictCode, isDomainError } from "@/shared/domain/errors";
import type { NetworkId } from "@/shared/domain/network";
import { sanitizeEnsLabel, sanitizeUsername } from "./format";
import { DesktopCheckout, type SubmitOrderResult } from "./components/desktop-checkout";
import { MobileCheckout } from "./components/mobile-checkout";
import { OrderConfirmationScreen } from "./components/order-confirmation";
import { PriceChangeDialog } from "./components/price-change-dialog";
import { Spinner } from "./components/icons";

const shell =
  "mx-auto w-full max-w-[1200px] px-4 pb-16 pt-4 sm:px-6 lg:pt-8 xl:px-0";

type ReviewState = {
  collector: Collector;
  walletId: string;
  current: Quote;
  next: Quote;
};

type RetryAttempt = {
  signature: string;
  input: CreateOrderInput;
  key: string;
};

export function CheckoutPage({ orderId }: { orderId?: string }) {
  if (orderId) return <OrderConfirmationScreen orderId={orderId} />;
  return <CheckoutFlow />;
}

function CheckoutFlow() {
  const router = useRouter();
  const canGoBack = useCanGoBack();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const announce = useAnnounce();
  const sessionQuery = useSession();
  const session = sessionQuery.data;

  const cartQuery = useCart();
  const walletsQuery = useWallets();
  const wallets = useMemo(() => walletsQuery.data ?? [], [walletsQuery.data]);
  const isDesktop = useMediaQuery(DESKTOP_QUERY);

  const [quoteNetwork, setQuoteNetwork] = useState<NetworkId>("ethereum");
  const quoteQuery = useCartQuote(quoteNetwork);
  const quote = quoteQuery.data;

  const connection = useWalletConnection();
  const connectRef = useRef(connection.connect);
  useEffect(() => {
    connectRef.current = connection.connect;
  }, [connection.connect]);

  const [provider, setProvider] = useState<WalletProviderId>("metamask");
  const [selectedWalletId, setSelectedWalletId] = useState<string>();
  const [review, setReview] = useState<ReviewState>();
  const [dialogBusy, setDialogBusy] = useState(false);
  const [dialogError, setDialogError] = useState<string>();
  const [quoteBanner, setQuoteBanner] = useState<string>();
  const [mobileSubmitting, setMobileSubmitting] = useState(false);
  const [mobileError, setMobileError] = useState<string>();

  const retryRef = useRef<RetryAttempt | null>(null);
  const initializedMobileRef = useRef(false);
  const initializedDesktopRef = useRef(false);

  const selectedWallet = wallets.find((wallet) => wallet.id === selectedWalletId);
  const cart = cartQuery.data;

  useEffect(() => {
    if (!session || isDesktop || initializedMobileRef.current || wallets.length === 0) return;
    initializedMobileRef.current = true;
    const preferred =
      wallets.find((wallet) => wallet.ensName) ??
      wallets.find((wallet) => wallet.kind === "primary") ??
      wallets[0];
    setSelectedWalletId(preferred.id);
    setQuoteNetwork(preferred.network);
    const nextProvider = preferred.provider ?? "metamask";
    setProvider(nextProvider);
    connectRef.current(nextProvider);
  }, [session, isDesktop, wallets]);

  useEffect(() => {
    if (!session || !isDesktop || initializedDesktopRef.current) return;
    initializedDesktopRef.current = true;
    connectRef.current(provider);
  }, [session, isDesktop, provider]);

  const quoteRefreshing = quoteQuery.isFetching;
  const quoteReady = Boolean(
    quote && !quoteQuery.isFetching && !quoteQuery.isPlaceholderData && !quoteQuery.isError,
  );

  function selectProvider(next: WalletProviderId) {
    setQuoteBanner(undefined);
    setProvider(next);
    const active = connection.state;
    const alreadyConnected = active.status === "connected" && active.providerId === next;
    if (!alreadyConnected) connectRef.current(next);
  }

  function selectWallet(wallet: Wallet) {
    setQuoteBanner(undefined);
    setSelectedWalletId(wallet.id);
    setQuoteNetwork(wallet.network);
    const nextProvider = wallet.provider ?? provider;
    setProvider(nextProvider);
    const active = connection.state;
    const sameConnected = active.status === "connected" && active.providerId === nextProvider;
    const sameConnecting = active.status === "connecting" && active.providerId === nextProvider;
    if (!sameConnected && !sameConnecting) connectRef.current(nextProvider);
  }

  function swapWallet() {
    if (wallets.length < 2) {
      announce("Você tem apenas uma carteira cadastrada.");
      return;
    }
    const index = wallets.findIndex((wallet) => wallet.id === selectedWalletId);
    const next = wallets[(index + 1 + wallets.length) % wallets.length] ?? wallets[0];
    selectWallet(next);
  }

  function changeNetwork(next: NetworkId) {
    setQuoteNetwork(next);
  }

  function goBack() {
    if (canGoBack) router.history.back();
    else void navigate({ to: "/cart" });
  }

  function buildInput(confirmed: Quote, collector: Collector, walletId: string): CreateOrderInput {
    return {
      quoteId: confirmed.id,
      quoteVersion: confirmed.version,
      expectedTotalEth: confirmed.totalEth,
      walletId,
      network: collector.network,
      collector,
      couponCode: cart?.couponCode,
    };
  }

  async function createOrder(input: CreateOrderInput, key: string, signature: string) {
    try {
      const order = await container.orders.create(input, key);
      retryRef.current = null;
      queryClient.setQueryData(orderKeys.detail(order.id), order);
      void queryClient.invalidateQueries({ queryKey: ["cart"] });
      await navigate({ to: "/checkout", search: { order: order.id }, replace: true });
    } catch (error) {
      if (isDomainError(error) && error.kind === "transient") {
        retryRef.current = { signature, input, key };
      }
      if (isDomainError(error) && error.code === ConflictCode.PriceChanged) {
        retryRef.current = null;
      }
      throw error;
    }
  }

  async function submitOrder(
    collector: Collector,
    walletId: string,
  ): Promise<SubmitOrderResult> {
    setQuoteBanner(undefined);
    setDialogError(undefined);

    const signature = JSON.stringify({ collector, walletId });
    const retry = retryRef.current;
    if (retry && retry.signature === signature) {
      await createOrder(retry.input, retry.key, signature);
      return "created";
    }

    if (!quote) throw new Error("A cotação ainda não está pronta. Aguarde e tente novamente.");
    if (quote.issues.length > 0) {
      throw new Error("Resolva os itens indisponíveis no carrinho antes de continuar.");
    }

    const refreshed = await quoteQuery.refetch();
    if (refreshed.error) throw refreshed.error;
    const fresh = refreshed.data;
    if (!fresh) throw new Error("Não foi possível atualizar a cotação. Tente novamente.");
    if (fresh.issues.length > 0) {
      setQuoteBanner("Os itens do carrinho mudaram. Revise o resumo antes de continuar.");
      return "review";
    }

    if (hasQuoteChanged(quote, fresh)) {
      setQuoteBanner("A cotação foi atualizada. Confira o resumo antes de confirmar.");
      setReview({ collector, walletId, current: quote, next: fresh });
      return "review";
    }

    try {
      await createOrder(buildInput(fresh, collector, walletId), crypto.randomUUID(), signature);
      return "created";
    } catch (error) {
      if (isDomainError(error) && error.code === ConflictCode.PriceChanged) {
        const next = await quoteQuery.refetch();
        if (next.data && next.data.issues.length === 0 && hasQuoteChanged(fresh, next.data)) {
          setQuoteBanner("Os valores mudaram novamente. Confira o novo total.");
          setReview({
            collector,
            walletId,
            current: fresh,
            next: next.data,
          });
          return "review";
        }
        setQuoteBanner("Os valores mudaram. Revise o resumo antes de continuar.");
        return "review";
      }
      throw error;
    }
  }

  async function confirmReview() {
    if (!review) return;
    setDialogBusy(true);
    setDialogError(undefined);
    setQuoteBanner(undefined);

    const signature = JSON.stringify({
      collector: review.collector,
      walletId: review.walletId,
    });

    try {
      const retry = retryRef.current;
      if (retry && retry.signature === signature) {
        await createOrder(retry.input, retry.key, signature);
      } else {
        await createOrder(
          buildInput(review.next, review.collector, review.walletId),
          crypto.randomUUID(),
          signature,
        );
      }
      setReview(undefined);
    } catch (error) {
      if (isDomainError(error) && error.code === ConflictCode.PriceChanged) {
        setReview(undefined);
        setQuoteBanner("Os valores mudaram novamente. Revise o resumo antes de continuar.");
        await quoteQuery.refetch();
      } else {
        setDialogError(errorMessage(error));
      }
    } finally {
      setDialogBusy(false);
    }
  }

  function cancelReview() {
    setReview(undefined);
    setDialogError(undefined);
  }

  async function confirmMobile() {
    if (!session || !selectedWallet) return;
    setMobileSubmitting(true);
    setMobileError(undefined);
    const collector = buildMobileCollector(session, selectedWallet, provider);
    try {
      await submitOrder(collector, selectedWallet.id);
    } catch (error) {
      setMobileError(errorMessage(error));
    } finally {
      setMobileSubmitting(false);
    }
  }

  if (!session) return <CheckoutLoading />;

  if (cartQuery.isPending || walletsQuery.isPending) return <CheckoutLoading />;

  if (cartQuery.error) {
    return (
      <CheckoutFallback
        title="Não foi possível carregar o carrinho"
        description={errorMessage(cartQuery.error)}
        actionLabel="Tentar novamente"
        onAction={() => void cartQuery.refetch()}
      />
    );
  }

  if (walletsQuery.error) {
    return (
      <CheckoutFallback
        title="Não foi possível carregar as carteiras"
        description={errorMessage(walletsQuery.error)}
        actionLabel="Tentar novamente"
        onAction={() => void walletsQuery.refetch()}
      />
    );
  }

  if (!cart || cart.items.length === 0) return <EmptyCheckout />;

  const dialog = review ? (
    <PriceChangeDialog
      previousTotalEth={review.current.totalEth}
      nextTotalEth={review.next.totalEth}
      busy={dialogBusy}
      error={dialogError}
      onConfirm={() => void confirmReview()}
      onCancel={cancelReview}
    />
  ) : null;

  if (!isDesktop) {
    return (
      <>
        <MobileCheckout
          session={session}
          wallets={wallets}
          selectedWallet={selectedWallet}
          provider={provider}
          connection={connection.state}
          quote={quote}
          quoteError={quoteQuery.error}
          quoteRefreshing={quoteRefreshing}
          quoteReady={quoteReady}
          quoteBanner={quoteBanner}
          submitError={mobileError}
          submitting={mobileSubmitting}
          onBack={goBack}
          onSelectWallet={selectWallet}
          onSwapWallet={swapWallet}
          onProviderChange={selectProvider}
          onRetryConnection={() => connectRef.current(provider)}
          onDisconnect={connection.disconnect}
          onRetryQuote={() => void quoteQuery.refetch()}
          onConfirm={() => void confirmMobile()}
        />
        {dialog}
      </>
    );
  }

  return (
    <>
      <div className={shell}>
        <h1 className="sr-only">Pagamento</h1>
        <nav aria-label="Você está em" className="mb-5 hidden text-small font-bold lg:block">
          <ol className="flex gap-2">
            <li>
              <Link to="/">Início</Link>
            </li>
            <li aria-hidden="true">/</li>
            <li>
              <Link to="/" hash="catalogo">
                Mercado
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li aria-current="page">Pagamento</li>
          </ol>
        </nav>

        <DesktopCheckout
          session={session}
          wallets={wallets}
          quote={quote}
          quoteError={quoteQuery.error}
          quoteRefreshing={quoteRefreshing}
          quoteReady={quoteReady}
          quoteBanner={quoteBanner}
          onRetryQuote={() => void quoteQuery.refetch()}
          provider={provider}
          connection={connection.state}
          onSelectWallet={selectWallet}
          onNetworkChange={changeNetwork}
          onProviderChange={selectProvider}
          onRetryConnection={() => connectRef.current(provider)}
          onDisconnect={connection.disconnect}
          submitOrder={submitOrder}
        />
      </div>
      {dialog}
    </>
  );
}

function buildMobileCollector(
  session: Session,
  wallet: Wallet,
  provider: WalletProviderId,
): Collector {
  const emailPrefix = session.user.email.split("@")[0] ?? "colecionador";
  const username = sanitizeUsername(emailPrefix);
  return {
    displayName: session.user.fullName,
    username,
    profileName: session.user.fullName,
    email: session.user.email,
    ensName: wallet.ensName ?? `${sanitizeEnsLabel(username)}.eth`,
    network: wallet.network,
    walletAddress: wallet.address,
    walletType: provider,
    useAnotherWallet: false,
  };
}

function CheckoutLoading() {
  return (
    <div className="mx-auto flex min-h-[60vh] w-full max-w-[1200px] items-center justify-center px-4">
      <div role="status" aria-label="Carregando pagamento" className="flex flex-col items-center gap-3">
        <Spinner className="size-6 text-primary" />
        <p className="text-small text-muted-foreground">Carregando pagamento...</p>
      </div>
    </div>
  );
}

function EmptyCheckout() {
  return (
    <div className={shell}>
      <div className="mx-auto mt-10 max-w-[480px] rounded-lg bg-card p-8 text-center">
        <h1 className="text-subheading font-bold">Seu carrinho está vazio</h1>
        <p className="mt-2 text-small text-muted-foreground">
          Escolha alguns NFTs no marketplace para iniciar o pagamento.
        </p>
        <Link
          to="/"
          className="mt-6 inline-block rounded-lg bg-primary px-6 py-3 text-small font-bold text-primary-foreground"
        >
          Explorar NFTs
        </Link>
      </div>
    </div>
  );
}

function CheckoutFallback({
  title,
  description,
  actionLabel,
  onAction,
}: {
  title: string;
  description: string;
  actionLabel: string;
  onAction: () => void;
}) {
  return (
    <div className={shell}>
      <div role="alert" className="mx-auto mt-10 max-w-[480px] rounded-lg bg-card p-8 text-center">
        <h1 className="text-subheading font-bold">{title}</h1>
        <p className="mt-2 text-small text-muted-foreground">{description}</p>
        <button
          type="button"
          onClick={onAction}
          className="mt-6 rounded-lg bg-primary px-6 py-3 text-small font-bold text-primary-foreground"
        >
          {actionLabel}
        </button>
      </div>
    </div>
  );
}
