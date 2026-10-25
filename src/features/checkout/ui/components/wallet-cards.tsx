import { useAnnounce } from "@/components/announcer-context";
import { cn } from "@/lib/utils";
import { walletDisplayName, type Wallet } from "@/features/wallets/domain/wallet";
import { networkDisplay } from "../format";

type Props = {
  wallets: Wallet[];
  selectedId: string | undefined;
  onSelect: (wallet: Wallet) => void;
  onSwap: () => void;
};

/**
 * Cartões de carteira do checkout mobile. O menu de opções ainda não existe
 * nesta versão: avisa e não finge abrir nada.
 */
export function WalletCards({ wallets, selectedId, onSelect, onSwap }: Props) {
  const announce = useAnnounce();

  return (
    <section aria-labelledby="wallets-title" className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-4">
        <h2 id="wallets-title" className="text-small font-bold">
          Carteira conectada
        </h2>
        <button
          type="button"
          onClick={onSwap}
          aria-disabled={wallets.length < 2 || undefined}
          className={cn(
            "text-small text-primary underline underline-offset-2",
            wallets.length < 2 && "cursor-not-allowed opacity-60",
          )}
        >
          Trocar carteira
        </button>
      </div>

      <div role="radiogroup" aria-label="Carteira para pagamento" className="flex flex-col gap-3">
        {wallets.map((wallet) => {
          const selected = wallet.id === selectedId;
          return (
            <div
              key={wallet.id}
              className={cn(
                "flex items-start gap-3 rounded-lg border bg-card p-4 transition-colors",
                selected ? "border-primary" : "border-primary/20",
              )}
            >
              <button
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => onSelect(wallet)}
                className="flex min-w-0 flex-1 items-start gap-3 text-left"
              >
                <span
                  aria-hidden="true"
                  className={cn(
                    "mt-0.5 grid size-4 shrink-0 place-items-center rounded-full border",
                    selected ? "border-primary" : "border-muted-foreground",
                  )}
                >
                  {selected && <span className="size-2 rounded-full bg-primary" />}
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-small font-bold">{wallet.label}</span>
                  <span className="block truncate text-small">{walletDisplayName(wallet)}</span>
                  <span className="block text-micro text-muted-foreground">
                    {networkDisplay(wallet.network)}
                  </span>
                </span>
              </button>

              <button
                type="button"
                aria-label={`Opções da carteira ${wallet.label}`}
                onClick={() => announce("As opções da carteira estarão disponíveis em breve.")}
                className="grid size-8 shrink-0 place-items-center rounded text-small text-muted-foreground hover:text-foreground"
              >
                <span aria-hidden="true">⋮</span>
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
}
