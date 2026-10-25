import { useRef, useState } from "react";
import { useAnnounce } from "@/components/announcer-context";
import { Icon } from "@/components/icon";
import { useSession } from "@/features/auth/ui/hooks/use-session";
import { AccountShell } from "@/features/profile/ui/components/account-sidebar";
import { networkLabels } from "@/shared/domain/network";
import { shortenAddress, walletProviderLabels, type Wallet } from "../domain/wallet";
import { useWallets } from "./hooks/use-wallets";
import { WalletForm } from "./components/wallet-form";

type WalletsNotice = { type: "success" | "error"; message: string };

function WalletsSkeleton() {
  return (
    <AccountShell>
      <div aria-busy="true" aria-label="Carregando carteiras" className="space-y-8">
        <div className="skeleton h-6 w-56 rounded-[4px]" />
        <div className="grid gap-x-[34px] gap-y-8 md:grid-cols-2">
          <div className="skeleton h-16" />
          <div className="skeleton h-16" />
          <div className="skeleton h-16" />
          <div className="skeleton h-16" />
          <div className="skeleton h-16" />
          <div className="skeleton h-16" />
        </div>
      </div>
    </AccountShell>
  );
}

function WalletsError({ onRetry }: { onRetry: () => void }) {
  return (
    <AccountShell>
      <section role="alert" className="bg-card p-8 text-center">
        <h1 className="text-body font-bold">Não foi possível carregar suas carteiras</h1>
        <p className="mt-2 text-small text-muted-foreground">
          Verifique a conexão e tente novamente.
        </p>
        <button
          type="button"
          onClick={onRetry}
          className="mt-6 h-10 rounded-[6px] bg-primary px-6 text-small font-bold text-primary-foreground"
        >
          Tentar novamente
        </button>
      </section>
    </AccountShell>
  );
}

function SecondaryWalletCard({
  wallet,
  onEdit,
}: {
  wallet: Wallet;
  onEdit: () => void;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 border border-primary/20 px-4 py-3">
      <div className="min-w-0">
        <p className="truncate text-small font-bold">
          {wallet.nickname || wallet.label}
        </p>
        <p className="truncate text-micro text-muted-foreground">
          {walletDisplayName(wallet)} · {networkLabels[wallet.network]}
          {wallet.provider ? ` · ${walletProviderLabels[wallet.provider]}` : ""}
        </p>
      </div>
      <button
        type="button"
        onClick={onEdit}
        className="text-small text-primary transition-colors hover:text-highlight"
      >
        Editar
      </button>
    </div>
  );
}

export function WalletsPage() {
  const announce = useAnnounce();
  const { data: session } = useSession();
  const walletsQuery = useWallets();
  const secondarySectionRef = useRef<HTMLElement>(null);
  const [notice, setNotice] = useState<WalletsNotice | null>(null);
  const [sameAsPrimary, setSameAsPrimary] = useState(false);
  const [secondaryEditor, setSecondaryEditor] = useState<{ walletId: string | null } | null>(
    null,
  );

  if (!session) return null;
  if (walletsQuery.isPending) return <WalletsSkeleton />;
  if (walletsQuery.isError || !walletsQuery.data) {
    return <WalletsError onRetry={() => void walletsQuery.refetch()} />;
  }

  const wallets = walletsQuery.data;
  const primaryWallet = wallets.find((wallet) => wallet.kind === "primary") ?? wallets[0] ?? null;
  const secondaryWallets = wallets.filter((wallet) => wallet.kind === "secondary");
  const editingWallet = secondaryEditor?.walletId
    ? (secondaryWallets.find((wallet) => wallet.id === secondaryEditor.walletId) ?? null)
    : null;
  const fallback = { fullName: session.user.fullName, email: session.user.email };

  function saveNotice(message: string) {
    setNotice({ type: "success", message });
    announce(message);
  }

  function startAddSecondary() {
    setNotice(null);
    setSecondaryEditor((current) => current?.walletId === null ? current : { walletId: null });
    requestAnimationFrame(() => {
      secondarySectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  function startEditSecondary(walletId: string) {
    setNotice(null);
    setSecondaryEditor({ walletId });
    requestAnimationFrame(() => {
      secondarySectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  function handlePrimarySaved() {
    saveNotice("Carteira principal atualizada com sucesso.");
  }

  function handleSecondarySaved() {
    saveNotice("Carteira secundária salva com sucesso.");
    setSecondaryEditor(null);
  }

  return (
    <AccountShell>
      <section aria-labelledby="wallets-title">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 id="wallets-title" className="text-body font-bold">
              Carteira Principal
            </h1>
            <p className="mt-1 text-small text-muted-foreground">
              Estas carteiras ficam disponíveis no pagamento e para receber NFTs comprados.
            </p>
          </div>
          <button
            type="button"
            onClick={startAddSecondary}
            className="inline-flex items-center gap-2 text-small font-bold text-primary transition-colors hover:text-highlight"
          >
            <Icon name="plus" className="size-4" />
            Adicionar
          </button>
        </div>

        {notice && (
          <p
            role={notice.type === "error" ? "alert" : "status"}
            className={
              notice.type === "error"
                ? "mt-5 text-small text-destructive"
                : "mt-5 text-small text-primary"
            }
          >
            {notice.message}
          </p>
        )}

        <div className="mt-[26px]">
          <WalletForm
            key={primaryWallet?.id ?? "new-primary"}
            wallet={primaryWallet}
            kind="primary"
            fallback={fallback}
            onSaved={handlePrimarySaved}
          />
        </div>

        <section
          ref={secondarySectionRef}
          aria-labelledby="secondary-wallets-title"
          className="mt-7 scroll-mt-24"
        >
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h2 id="secondary-wallets-title" className="text-body font-bold">
              Carteira secundária
            </h2>
            <div className="flex flex-wrap items-center gap-5">
              <label className="flex cursor-pointer items-center gap-2 text-small text-muted-foreground">
                <input
                  type="checkbox"
                  checked={sameAsPrimary}
                  disabled={!primaryWallet || Boolean(editingWallet)}
                  onChange={(event) => setSameAsPrimary(event.target.checked)}
                  className="size-4 accent-primary disabled:cursor-not-allowed rounded-full border border-primary"
                />
                Igual à carteira principal
              </label>
              <button
                type="button"
                onClick={startAddSecondary}
                className="text-small font-bold text-primary transition-colors hover:text-highlight"
              >
                Adicionar
              </button>
            </div>
          </div>

          {secondaryEditor ? (
            <div className="mt-6">
              <WalletForm
                key={`${editingWallet?.id ?? "new-secondary"}-${sameAsPrimary ? "same" : "own"}`}
                wallet={editingWallet}
                kind="secondary"
                fallback={fallback}
                sameAsPrimary={!editingWallet && sameAsPrimary ? primaryWallet : null}
                onSaved={handleSecondarySaved}
                onCancel={() => setSecondaryEditor(null)}
              />
            </div>
          ) : secondaryWallets.length > 0 ? (
            <div className="mt-5 grid gap-3">
              {secondaryWallets.map((wallet) => (
                <SecondaryWalletCard
                  key={wallet.id}
                  wallet={wallet}
                  onEdit={() => startEditSecondary(wallet.id)}
                />
              ))}
            </div>
          ) : (
            <p className="mt-1 text-small text-muted-foreground">
              Você ainda não adicionou uma carteira secundária.
            </p>
          )}
        </section>
      </section>
    </AccountShell>
  );
}

function walletDisplayName(wallet: Wallet): string {
  return wallet.ensName ?? shortenAddress(wallet.address);
}
