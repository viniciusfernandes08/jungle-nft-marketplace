import { useEffect, useRef } from "react";
import { formatEth } from "@/shared/domain/eth";
import { CloseIcon, Spinner } from "./icons";

type Props = {
  previousTotalEth: string;
  nextTotalEth: string;
  busy: boolean;
  error: string | undefined;
  onConfirm: () => void;
  onCancel: () => void;
};

export function PriceChangeDialog({
  previousTotalEth,
  nextTotalEth,
  busy,
  error,
  onConfirm,
  onCancel,
}: Props) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (dialog && !dialog.open) dialog.showModal();
  }, []);

  return (
    <dialog
      ref={ref}
      aria-labelledby="price-change-title"
      onClose={onCancel}
      onClick={(event) => event.target === ref.current && ref.current?.close()}
      className="m-auto w-[440px] max-w-[calc(100vw-2rem)] rounded-lg border border-primary/30 bg-card p-0 text-foreground backdrop:bg-black/70"
    >
      <div className="relative flex flex-col gap-4 p-6">
        <button
          type="button"
          aria-label="Fechar"
          onClick={() => ref.current?.close()}
          className="absolute right-3 top-3 grid size-8 place-items-center rounded text-primary"
        >
          <CloseIcon />
        </button>

        <h2 id="price-change-title" className="pr-8 text-body font-bold">
          Os valores do pedido mudaram
        </h2>
        <p className="text-small text-muted-foreground">
          A cotação foi atualizada. Confira o novo total antes de confirmar a compra.
        </p>

        <dl className="flex flex-col gap-2 rounded-md bg-secondary/60 p-3">
          <div className="flex items-baseline justify-between gap-3">
            <dt className="text-small text-muted-foreground">Total anterior</dt>
            <dd className="text-small line-through">{formatEth(previousTotalEth)} ETH</dd>
          </div>
          <div className="flex items-baseline justify-between gap-3">
            <dt className="text-small font-bold">Novo total</dt>
            <dd className="text-body font-bold text-primary">{formatEth(nextTotalEth)} ETH</dd>
          </div>
        </dl>

        {error && (
          <p role="alert" className="text-small text-destructive">
            {error}
          </p>
        )}

        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={() => ref.current?.close()}
            disabled={busy}
            className="rounded-md border border-primary/40 px-4 py-2 text-small text-primary disabled:opacity-50"
          >
            Voltar e revisar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={busy}
            className="flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-small font-bold text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50"
          >
            {busy && <Spinner className="size-3 border-2 text-primary-foreground" />}
            {busy ? "Confirmando..." : "Aceitar e confirmar"}
          </button>
        </div>
      </div>
    </dialog>
  );
}
