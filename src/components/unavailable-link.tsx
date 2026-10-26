import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { useAnnounce } from "./announcer-context";

const DEFAULT_MESSAGE = "Esta página não está disponível nesta versão.";

export function UnavailableLink({
  children,
  className,
  message = DEFAULT_MESSAGE,
}: {
  children: ReactNode;
  className?: string;
  message?: string;
}) {
  const announce = useAnnounce();
  return (
    <button
      type="button"
      aria-disabled="true"
      onClick={() => announce(message)}
      className={cn("cursor-not-allowed text-left", className)}
    >
      {children}
    </button>
  );
}
