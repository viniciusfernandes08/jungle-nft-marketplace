import { useEffect, useRef, type ReactNode } from "react";
import { useNavigate } from "@tanstack/react-router";
import type { Order } from "@/features/orders/domain/order";
import { useOrder } from "@/features/orders/ui/hooks/use-order";
import { walletProviderLabels } from "@/features/wallets/domain/wallet";
import { errorMessage } from "@/lib/error-message";
import { formatEth } from "@/shared/domain/eth";
import { networkLabels } from "@/shared/domain/network";
import {
  explorerName,
  formatOrderDate,
  shortenTransactionRef,
} from "../format";
import { CloseIcon, Spinner, StatusSeal } from "./icons";

const TITLE_ID = "order-confirmation-title";

type FrameProps = {
  onClose: () => void;
  children: ReactNode;
};

/** Estrutura do recibo: modal no desktop, tela cheia no mobile, com barra inferior. */
function ConfirmationFrame({ onClose, children }: FrameProps) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onCloseRef.current();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-background lg:grid lg:place-items-center lg:bg-black/70 lg:p-6"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={TITLE_ID}
        className="relative flex min-h-svh w-full flex-col bg-card text-foreground lg:min-h-0 lg:max-w-[578px] lg:rounded-lg lg:border lg:border-primary/30"
      >
        <button
          ref={closeRef}
          type="button"
          aria-label="Fechar"
          onClick={onClose}
          className="absolute right-3 top-3 z-10 grid size-9 place-items-center rounded-full text-primary outline-offset-2 hover:bg-secondary/60 focus-visible:ring-2 focus-visible:ring-ring"
        >
          <CloseIcon className="size-5" />
        </button>

        <div className="flex flex-1 flex-col px-5 pb-8 pt-10 lg:px-11 lg:pb-10 lg:pt-12">
          {children}
        </div>

        <div aria-hidden="true" className="h-2.5 w-full shrink-0 bg-primary" />
      </div>
    </div>
  );
}

function EmptyState({
  title,
  description,
  action,
  onClose,
}: {
  title: string;
  description: string;
  action?: { label: string; onClick: () => void };
  onClose: () => void;
}) {
  return (
    <ConfirmationFrame onClose={onClose}>
      <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
        <h1 id={TITLE_ID} className="text-subheading font-bold">
          {title}
        </h1>
        <p className="max-w-sm text-small text-muted-foreground">{description}</p>
        {action && (
          <button
            type="button"
            onClick={action.onClick}
            className="mt-4 w-full rounded-lg bg-primary py-3 text-small font-bold text-primary-foreground"
          >
            {action.label}
          </button>
        )}
      </div>
    </ConfirmationFrame>
  );
}

/** Rota de confirmação: restaura o pedido pelo id (refresh) e acompanha a confirmação. */
export function OrderConfirmationScreen({ orderId }: { orderId: string }) {
  const navigate = useNavigate();
  const query = useOrder(orderId);
  const order = query.data;

  if (!order && query.isPending) {
    return (
      <ConfirmationFrame onClose={() => navigate({ to: "/" })}>
        <div className="flex flex-1 flex-col items-center justify-center gap-4">
          <h1 id={TITLE_ID} className="text-subheading font-bold">
            Carregando pedido
          </h1>
          <Spinner className="size-6 text-primary" />
        </div>
      </ConfirmationFrame>
    );
  }

  if (!order) {
    return (
      <EmptyState
        title="Não foi possível carregar o pedido"
        description={query.error ? errorMessage(query.error) : "O pedido não foi encontrado."}
        onClose={() => navigate({ to: "/cart" })}
        action={{ label: "Voltar ao carrinho", onClick: () => navigate({ to: "/cart" }) }}
      />
    );
  }

  const onClose = () => navigate({ to: order.status === "declined" ? "/cart" : "/" });
  return <OrderConfirmation order={order} onClose={onClose} />;
}

type Props = {
  order: Order;
  onClose: () => void;
};

export function OrderConfirmation({ order, onClose }: Props) {
  const confirmed = order.status === "confirmed";
  const pending = order.status === "pending";
  const network = networkLabels[order.network];

  const title = confirmed
    ? "Seus NFTs agora estão na sua carteira"
    : pending
      ? "Estamos confirmando sua transação"
      : "A compra não foi concluída";

  const message = confirmed
    ? `Transação confirmada na ${network}. A propriedade foi transferida para sua carteira conectada e registrada na rede.`
    : pending
      ? `Estamos aguardando a confirmação da rede ${network}. Esta tela atualiza automaticamente.`
      : (order.declineReason ?? "A transação foi recusada. Nenhum valor foi cobrado.");

  const explorer = order.explorerUrl ? explorerName(order.network) : undefined;

  return (
    <ConfirmationFrame onClose={onClose}>
      <div className="flex flex-col items-center gap-3 text-center">
        <StatusSeal status={order.status} />
        <h1 id={TITLE_ID} className="text-subheading font-bold leading-tight">
          {title}
        </h1>
      </div>

      <hr className="my-6 border-0 border-t border-primary/30" />

      <dl className="grid grid-cols-2 gap-4 text-left min-[440px]:grid-cols-4">
        <div className="min-w-0">
          <dt className="text-micro uppercase tracking-wider text-muted-foreground">
            ID da transação
          </dt>
          <dd className="mt-1 truncate text-small">
            {pending || confirmed
              ? order.transactionRef
                ? shortenTransactionRef(order.transactionRef)
                : "—"
              : "—"}
          </dd>
        </div>
        <div className="min-w-0">
          <dt className="text-micro uppercase tracking-wider text-muted-foreground">Data</dt>
          <dd className="mt-1 text-small">{formatOrderDate(order.createdAt)}</dd>
        </div>
        <div className="min-w-0">
          <dt className="text-micro uppercase tracking-wider text-muted-foreground">Total</dt>
          <dd className="mt-1 text-small text-primary">{formatEth(order.totalEth)} ETH</dd>
        </div>
        <div className="min-w-0">
          <dt className="text-micro uppercase tracking-wider text-muted-foreground">Carteira</dt>
          <dd className="mt-1 truncate text-small">
            {walletProviderLabels[order.collector.walletType]}
          </dd>
        </div>
      </dl>

      <hr className="my-6 border-0 border-t border-primary/30" />

      <h2 className="text-small font-bold">Detalhes da transação</h2>

      <div className="mt-3">
        <div className="grid grid-cols-[minmax(0,1fr)_64px_88px] gap-2 border-b border-primary/30 pb-2 text-micro uppercase tracking-wider text-muted-foreground">
          <span>NFTs</span>
          <span className="text-center">Edições</span>
          <span className="text-right">Subtotal</span>
        </div>

        <ul className="flex flex-col gap-3 pt-3">
          {order.items.map((item) => (
            <li
              key={`${item.nftId}:${item.editionId}`}
              className="grid grid-cols-[minmax(0,1fr)_64px_88px] items-center gap-2"
            >
              <div className="flex min-w-0 items-center gap-3">
                <img
                  src={item.imageUrl}
                  alt=""
                  width={48}
                  height={48}
                  loading="lazy"
                  decoding="async"
                  className="size-12 shrink-0 rounded-md bg-secondary object-cover"
                />
                <div className="min-w-0">
                  <p className="truncate text-small font-bold">{item.name}</p>
                  <p className="text-micro text-muted-foreground">
                    ID do token: #{item.tokenId}
                  </p>
                </div>
              </div>
              <p className="text-center text-small text-muted-foreground">(× {item.quantity})</p>
              <p className="text-right text-small text-primary">
                {formatEth(item.lineTotalEth)} ETH
              </p>
            </li>
          ))}
        </ul>
      </div>

      <div className="ml-auto mt-4 flex w-full max-w-[260px] flex-col gap-2 border-t border-primary/30 pt-3">
        <div className="flex items-baseline justify-between gap-3">
          <span className="text-small">Taxa de rede</span>
          <span className="text-small">{formatEth(order.networkFeeEth)} ETH</span>
        </div>
        <div className="flex items-baseline justify-between gap-3">
          <span className="text-small font-bold">Total</span>
          <span className="text-body font-bold text-primary">{formatEth(order.totalEth)} ETH</span>
        </div>
      </div>

      <p className="mt-5 text-center text-small text-muted-foreground">{message}</p>

      <div className="mt-auto pt-8">
        {confirmed && explorer && order.explorerUrl ? (
          <a
            href={order.explorerUrl}
            target="_blank"
            rel="noreferrer"
            className="flex w-full items-center justify-center rounded-lg bg-primary py-3 text-small font-bold text-primary-foreground"
          >
            Ver no {explorer}
          </a>
        ) : pending ? (
          <button
            type="button"
            disabled
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-3 text-small font-bold text-primary-foreground opacity-60"
          >
            <Spinner className="size-3 border-2 text-primary-foreground" />
            Aguardando confirmação
          </button>
        ) : (
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-lg bg-primary py-3 text-small font-bold text-primary-foreground"
          >
            Voltar ao carrinho
          </button>
        )}
      </div>
    </ConfirmationFrame>
  );
}
