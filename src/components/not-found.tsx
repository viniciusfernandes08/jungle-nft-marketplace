import { Link } from "@tanstack/react-router";

export function NotFound() {
  return (
    <div className="mx-auto flex min-h-svh max-w-md flex-col items-center justify-center gap-4 px-6 text-center">
      <h1 className="text-heading font-bold">Página não encontrada</h1>
      <p className="text-body text-muted-foreground">
        O endereço que você acessou não existe ou foi movido.
      </p>
      <Link
        to="/"
        className="rounded-lg bg-primary px-6 py-3 text-small font-bold text-primary-foreground"
      >
        Voltar ao início
      </Link>
    </div>
  );
}
