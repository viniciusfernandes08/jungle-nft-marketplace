import { cn } from "@/lib/utils";
import {
  walletProviderLabels,
  type WalletProviderId,
} from "@/features/wallets/domain/wallet";
import type { WalletConnectionState } from "@/features/wallets/ui/hooks/use-wallet-connection";
import { providerOrder } from "../provider-order";
import { Spinner, WalletGlyph } from "./icons";

type Props = {
  provider: WalletProviderId;
  onChange: (provider: WalletProviderId) => void;
  connection: WalletConnectionState;
  onRetry: () => void;
  onDisconnect: () => void;
  /** Desktop: sem logos, com a legenda de provedores. Mobile: logos e radios à direita. */
  compact?: boolean;
};

function ProviderBadge({ provider }: { provider: WalletProviderId }) {
  return (
    <span
      aria-hidden="true"
      className="grid size-7 shrink-0 place-items-center rounded-full bg-secondary text-micro font-bold text-foreground"
    >
      {provider === "coinbase" ? <WalletGlyph /> : provider === "walletconnect" ? "W" : "M"}
    </span>
  );
}

function Radio({ selected }: { selected: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "grid size-4 shrink-0 place-items-center rounded-full border",
        selected ? "border-primary" : "border-muted-foreground",
      )}
    >
      {selected && <span className="size-2 rounded-full bg-primary" />}
    </span>
  );
}

/**
 * Provedores simulados. A conexão é automática ao selecionar; recusa e queda
 * ficam visíveis e têm ação de nova tentativa/desconexão.
 */
export function ProviderList({
  provider,
  onChange,
  connection,
  onRetry,
  onDisconnect,
  compact = false,
}: Props) {
  const active =
    connection.status !== "idle" && connection.providerId === provider
      ? connection
      : ({ status: "idle" } as const);

  return (
    <section aria-labelledby="providers-title" className="flex flex-col gap-2.5">
      <h3 id="providers-title" className="font-bold text-center">
        Carteira e rede
      </h3>

      <div role="radiogroup" aria-label="Provedor da carteira" className="flex flex-col gap-2">
        {providerOrder.map((id) => {
          const selected = provider === id;
          return (
            <button
              key={id}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => {
                if (!selected) return onChange(id);
                if (active.status === "refused" || active.status === "idle") onRetry();
              }}
              className={cn(
                "flex min-h-11 w-full items-center gap-3 rounded-[3px] border px-3 py-2 text-left transition-colors",
                selected
                  ? "border-primary bg-secondary/50"
                  : "border-primary/20 bg-transparent hover:border-primary/50",
              )}
            >
              {compact ? (
                <>
                  <ProviderBadge provider={id} />
                  <span className="flex-1 text-small">{walletProviderLabels[id]}</span>
                  <Radio selected={selected} />
                </>
              ) : (
                <>
                  <Radio selected={selected} />
                  <span className="flex-1 text-small">{walletProviderLabels[id]}</span>
                </>
              )}
            </button>
          );
        })}
      </div>

      <ConnectionStatus
        state={active}
        onRetry={onRetry}
        onDisconnect={onDisconnect}
        compact={compact}
      />
    </section>
  );
}

function ConnectionStatus({
  state,
  onRetry,
  onDisconnect,
  compact,
}: {
  state: WalletConnectionState;
  onRetry: () => void;
  onDisconnect: () => void;
  compact: boolean;
}) {
  if (state.status === "connecting") {
    return (
      <p role="status" className="flex items-center gap-2 text-micro text-muted-foreground">
        <Spinner className="size-3 border-2" />
        Conectando à carteira...
      </p>
    );
  }

  if (state.status === "connected") {
    return (
      <div className="flex items-center justify-between gap-3">
        <p role="status" className="text-micro text-primary">
          Carteira conectada
        </p>
        <button
          type="button"
          onClick={onDisconnect}
          className="text-micro text-muted-foreground underline underline-offset-2 hover:text-foreground"
        >
          Desconectar
        </button>
      </div>
    );
  }

  if (state.status === "refused") {
    return (
      <div className="flex flex-col gap-1">
        <p role="alert" className="text-micro text-destructive">
          {state.reason}
        </p>
        <button
          type="button"
          onClick={onRetry}
          className="self-start text-micro font-bold text-primary underline"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  return (
    <p className="text-micro text-muted-foreground">
      {compact ? "Selecione uma carteira para continuar." : "Conecte uma carteira para continuar."}
    </p>
  );
}
