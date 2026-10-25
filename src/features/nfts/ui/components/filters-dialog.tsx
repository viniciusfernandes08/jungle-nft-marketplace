import { useRef, type ReactNode } from "react";
import { Icon } from "@/components/icon";

export function FiltersDialog({ children, total }: { children: ReactNode; total?: number }) {
  const ref = useRef<HTMLDialogElement>(null);
  const close = () => ref.current?.close();

  return (
    <>
      <button
        type="button"
        aria-label="Abrir filtros"
        onClick={() => ref.current?.showModal()}
        className="grid size-12 shrink-0 place-items-center rounded-lg bg-primary text-primary-foreground"
      >
        <Icon name="filters" />
      </button>
      <dialog
        ref={ref}
        aria-labelledby="filters-title"
        onClick={(e) => e.target === ref.current && close()}
        className="m-0 mt-auto max-h-[85svh] w-full max-w-none flex-col rounded-b-none rounded-t-lg bg-background p-0 text-foreground backdrop:bg-black/70 open:flex"
      >
        <div className="flex items-center justify-between p-4">
          <h2 id="filters-title" className="text-heading font-bold">
            Filtros
          </h2>
          <button type="button" onClick={close} className="rounded-lg px-3 py-2 text-small text-primary">
            Fechar
          </button>
        </div>
        <div className="overflow-y-auto px-4 pb-4">{children}</div>
        <div className="p-4">
          <button
            type="button"
            onClick={close}
            className="w-full rounded-lg bg-primary py-3 font-bold text-primary-foreground"
          >
            {total === undefined ? "Ver resultados" : `Ver ${total} resultados`}
          </button>
        </div>
      </dialog>
    </>
  );
}
