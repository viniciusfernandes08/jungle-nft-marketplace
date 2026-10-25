import { useState } from "react";
import { useAnnounce } from "@/components/announcer-context";

const BENEFITS = [
  { letter: "W", title: "Segurança da carteira", text: "Proteja sua carteira e colecione arte digital verificada com confiança." },
  { letter: "C", title: "Criadores em destaque", text: "Conheça artistas, estúdios e comunidades que moldam a cultura digital na rede." },
  { letter: "D", title: "Alertas de lançamentos", text: "Receba calendários de cunhagem, novidades de listas de acesso e análises do mercado." },
] as const;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function BenefitsSection() {
  const announce = useAnnounce();
  const [error, setError] = useState<string>();

  function submit(formData: FormData) {
    const email = String(formData.get("email") ?? "").trim();
    if (!EMAIL.test(email)) return setError("Informe um e-mail válido.");
    setError(undefined);
    // Fora do escopo: valida, mas não finge que se inscreveu.
    announce("A inscrição na newsletter não está disponível nesta versão.");
  }

  return (
    <section aria-label="Benefícios e newsletter" className="mx-auto w-full max-w-[1200px] px-4 py-8 sm:px-6 xl:px-0">
      <div className="grid gap-8 rounded-lg bg-card p-6 sm:grid-cols-2 lg:grid-cols-4 lg:gap-0 lg:divide-x lg:divide-primary/30">
        {BENEFITS.map((b) => (
          <div key={b.title} className="flex flex-col gap-3 lg:px-6">
            <span aria-hidden="true" className="grid size-14 place-items-center rounded-full bg-primary text-subheading font-bold text-primary-foreground">
              {b.letter}
            </span>
            <h3 className="text-body font-bold">{b.title}</h3>
            <p className="text-small text-muted-foreground">{b.text}</p>
          </div>
        ))}
        <form action={submit} noValidate className="flex flex-col gap-3 lg:px-6">
          <h3 className="text-body font-bold">Antecipe-se ao próximo lançamento</h3>
          <div className="flex">
            <label className="min-w-0 flex-1">
              <span className="sr-only">Seu e-mail</span>
              <input
                name="email"
                type="email"
                placeholder="digite seu e-mail..."
                aria-invalid={error ? true : undefined}
                aria-describedby={error ? "newsletter-erro" : undefined}
                className="w-full rounded-l-lg bg-secondary px-4 py-3 text-small outline-none placeholder:text-muted-foreground"
              />
            </label>
            <button type="submit" className="rounded-r-lg bg-primary px-4 text-small font-bold text-primary-foreground">
              Enviar
            </button>
          </div>
          {error && (
            <p id="newsletter-erro" role="alert" className="text-small text-destructive">
              {error}
            </p>
          )}
          <p className="text-small text-muted-foreground">
            Receba lançamentos selecionados, histórias de criadores e novidades do mercado.
          </p>
        </form>
      </div>
    </section>
  );
}
