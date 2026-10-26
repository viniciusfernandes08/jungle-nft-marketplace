import { useEffect, useRef, type ReactNode } from "react";
import { Icon } from "@/components/icon";

export function AuthDialog({ children, onClose }: { children: ReactNode; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (dialog && !dialog.open) dialog.showModal();
  }, []);

  return (
    <dialog
      ref={ref}
      aria-labelledby="auth-title"
      onClose={onClose}
      onClick={(e) => e.target === ref.current && ref.current?.close()}
      className="m-auto w-[500px] max-w-[calc(100vw-2rem)] border-0 border-b-8 border-primary bg-card p-0 text-foreground backdrop:bg-black/60"
    >
      <button
        type="button"
        aria-label="Fechar"
        onClick={() => ref.current?.close()}
        className="absolute right-3 top-3 grid size-8 place-items-center rounded text-primary"
      >
        <Icon name="close" className="size-5" />
      </button>
      {children}
    </dialog>
  );
}
