import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import { LoginForm } from "./login-form";
import { RegisterForm } from "./register-form";
import { SocialButtons } from "./social-buttons";

export type AuthMode = "login" | "register";
export type AuthVariant = "modal" | "screen";

type Props = { mode: AuthMode; variant: AuthVariant; redirectTo?: string };

function Divider() {
  return (
    <div className="my-5 flex items-center gap-3 text-micro">
      <span className="h-px flex-1 bg-primary/30" />
      Ou continue com
      <span className="h-px flex-1 bg-primary/30" />
    </div>
  );
}

export function AuthView({ mode, variant, redirectTo }: Props) {
  const search = redirectTo ? { redirect: redirectTo } : {};
  const isLogin = mode === "login";

  const form = isLogin ? (
    <LoginForm redirectTo={redirectTo} />
  ) : (
    <RegisterForm redirectTo={redirectTo} submitLabel={variant === "modal" ? "Criar conta" : "Criar perfil"} />
  );

  if (variant === "modal") {
    return (
      <div className="px-8 pb-10 pt-8">
        <h2 id="auth-title" className="sr-only">
          {isLogin ? "Entrar" : "Criar conta"}
        </h2>
        <nav aria-label="Acesso" className="flex items-center justify-center gap-3 text-subheading font-medium">
          <Link to="/login" search={search} aria-current={isLogin ? "page" : undefined} className={cn(isLogin && "text-primary")}>
            Entrar
          </Link>
          <span aria-hidden="true" className="h-5 w-px bg-primary" />
          <Link to="/register" search={search} aria-current={!isLogin ? "page" : undefined} className={cn(!isLogin && "text-primary")}>
            Criar conta
          </Link>
        </nav>
        <p className="mx-auto mb-6 mt-6 max-w-sm text-center text-micro">
          {isLogin
            ? "Entre para gerenciar sua carteira, coleção e perfil de criador."
            : "Crie seu perfil de colecionador e conecte uma carteira quando quiser."}
        </p>
        <div className="mx-auto max-w-[340px]">
          {form}
          <Divider />
          <SocialButtons />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-[414px] flex-col px-7 pb-10 pt-16">
      <p className="text-center text-title font-bold tracking-[0.2em]">KURIO</p>
      <h1 className="mb-8 mt-16 text-center text-body font-bold">
        {isLogin ? "Entrar" : "Criar perfil de colecionador"}
      </h1>
      {form}
      <Divider />
      <SocialButtons />
      <p className="mt-10 text-center text-small text-muted-foreground">
        {isLogin ? (
          <>
            Novo na Kurio?{" "}
            <Link to="/register" search={search} className="underline">
              Crie uma conta
            </Link>
          </>
        ) : (
          <>
            Já tem uma conta?{" "}
            <Link to="/login" search={search} className="underline">
              Entre
            </Link>
          </>
        )}
      </p>
    </div>
  );
}
