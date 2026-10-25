import { Link, useLocation } from "@tanstack/react-router";
import { Icon } from "@/components/icon";
import { Skeleton } from "@/components/ui/skeleton";
import { useLogout } from "../hooks/use-auth-mutations";
import { useSession } from "../hooks/use-session";

export function HeaderAuthControl() {
  const { data: session, isPending } = useSession();
  const logout = useLogout();
  const href = useLocation({ select: (location) => location.href });

  if (isPending) return <Skeleton className="h-9 w-24" />;

  if (!session) {
    return (
      <Link
        to="/login"
        search={{ redirect: href }}
        className="inline-flex items-center gap-2 rounded-[6px] bg-primary px-4 py-2 text-small font-bold text-primary-foreground"
      >
        <Icon name="login" className="size-4" /> Entrar
      </Link>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <Link
        to="/profile"
        aria-label="Abrir meu perfil"
        className="flex min-w-0 items-center gap-2 text-small transition-colors hover:text-primary"
        title={session.user.email}
      >
        <span className="grid size-7 shrink-0 place-items-center overflow-hidden rounded-full border border-primary/40 bg-secondary">
          {session.user.avatarUrl ? (
            <img src={session.user.avatarUrl} alt="" className="size-full object-cover" />
          ) : (
            <Icon name="user" className="size-4 text-primary" />
          )}
        </span>
        <span className="max-w-36 truncate">{session.user.fullName}</span>
      </Link>
      <button
        type="button"
        disabled={logout.isPending}
        onClick={() => logout.mutate()}
        className="rounded-lg border border-hairline border-primary px-4 py-2 text-small font-bold text-primary disabled:opacity-60"
      >
        Sair
      </button>
    </div>
  );
}
