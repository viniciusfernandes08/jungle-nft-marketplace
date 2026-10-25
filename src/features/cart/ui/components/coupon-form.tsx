import { useId, useState, type FormEvent } from "react";
import { useAnnounce } from "@/components/announcer-context";
import { couponErrorMessage, type CouponStatus } from "../../domain/quote";
import { useApplyCoupon, useRemoveCoupon } from "../hooks/use-cart-mutations";

type Props = {
  appliedCode: string | undefined;
  /** Status atual do cupom salvo, segundo a cotação (pode ter expirado depois). */
  appliedStatus: CouponStatus | undefined;
};

export function CouponForm({ appliedCode, appliedStatus }: Props) {
  const inputId = useId();
  const errorId = `${inputId}-error`;
  const announce = useAnnounce();
  const apply = useApplyCoupon();
  const remove = useRemoveCoupon();
  const [code, setCode] = useState("");
  const [error, setError] = useState<string>();

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    const value = code.trim().toUpperCase();
    if (!value) return setError("Digite um código promocional.");
    setError(undefined);
    apply.mutate(value, {
      onSuccess: ({ status }) => {
        if (status === "applied") {
          setCode("");
          announce(`Cupom ${value} aplicado.`);
        } else {
          setError(couponErrorMessage(status) ?? "Cupom inválido.");
        }
      },
      onError: (e) => setError(e.message),
    });
  }

  if (appliedCode) {
    const broken = appliedStatus === "expired" || appliedStatus === "invalid";
    return (
      <div className="flex items-center justify-between gap-3 rounded-lg bg-secondary px-4 py-3 text-small">
        <p role={broken ? "alert" : "status"}>
          {broken ? `${couponErrorMessage(appliedStatus)} ` : "Cupom "}
          <strong>{appliedCode}</strong>
          {broken ? "" : " aplicado."}
        </p>
        <button
          type="button"
          disabled={remove.isPending}
          onClick={() => remove.mutate()}
          className="font-bold text-primary underline disabled:opacity-60"
        >
          Remover
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate>
      <div className="flex">
        <label htmlFor={inputId} className="sr-only">
          Código promocional
        </label>
        <input
          id={inputId}
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Digite o código promocional..."
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          autoComplete="off"
          className="min-w-0 flex-1 rounded-l-lg border border-primary/30 bg-transparent px-4 py-3 text-micro outline-none placeholder:text-muted-foreground focus:border-primary aria-[invalid=true]:border-destructive lg:rounded-none"
        />
        <button
          type="submit"
          disabled={apply.isPending}
          className="rounded-r-lg bg-primary px-5 text-small font-bold text-primary-foreground disabled:opacity-60 lg:rounded-none"
        >
          {apply.isPending ? "..." : "Aplicar"}
        </button>
      </div>
      {error && (
        <p id={errorId} role="alert" className="mt-1 text-micro text-destructive">
          {error}
        </p>
      )}
    </form>
  );
}
