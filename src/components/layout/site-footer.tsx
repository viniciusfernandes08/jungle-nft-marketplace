import { Link } from "@tanstack/react-router";
import { Icon } from "@/components/icon";
import type { IconName } from "@/config/assets";
import { UnavailableLink } from "@/components/unavailable-link";
import { BenefitsSection } from "@/features/home/ui/benefits-section";

const COLUMNS = [
  { title: "Meu perfil", links: ["Meu perfil", "Minha coleção", "Atividade", "Estúdio do criador", "Lista de interesse"] },
  { title: "Central de ajuda", links: ["Central de ajuda", "Como comprar NFTs", "Carteira e segurança", "Política do mercado", "Denunciar item"] },
] as const;

const COLLECTION_LINKS = [
  { id: "arte-digital", name: "Arte digital" },
  { id: "fotografia", name: "Fotografia" },
  { id: "musica", name: "Música" },
  { id: "arte-3d", name: "Arte 3D" },
  { id: "utilidade", name: "Utilidade" },
] as const;

const SOCIAL: { icon: IconName; name: string; href: string }[] = [
  { icon: "facebook", name: "Facebook", href: "https://www.facebook.com" },
  { icon: "instagram", name: "Instagram", href: "https://www.instagram.com" },
  { icon: "twitter", name: "Twitter", href: "https://twitter.com" },
  { icon: "linkedin", name: "LinkedIn", href: "https://www.linkedin.com" },
  { icon: "youtube", name: "YouTube", href: "https://www.youtube.com" },
];

const heading = "mb-4 text-body font-bold";

export function SiteFooter() {
  return (
    <footer className="mx-auto w-full max-w-[1200px] px-4 pb-8 sm:px-6 xl:px-0 pt-8">
      <BenefitsSection />
      <div className="grid gap-4 bg-secondary p-6 text-small sm:grid-cols-2 lg:grid-cols-4 lg:items-center">
        <p className="text-micro font-bold tracking-widest">KURIO</p>
        <p>Feito para colecionadores, criadores e cultura</p>
        <p>contato@email.com</p>
        <p>+55 11 4002 8922</p>
      </div>
      <div className="grid gap-8 bg-card p-6 text-small sm:grid-cols-2 lg:grid-cols-4">
        {COLUMNS.map((col) => (
          <nav key={col.title} aria-label={col.title}>
            <h2 className={heading}>{col.title}</h2>
            <ul className="flex flex-col gap-2">
              {col.links.map((label) => (
                <li key={label}>
                  <UnavailableLink>{label}</UnavailableLink>
                </li>
              ))}
            </ul>
          </nav>
        ))}
        <nav aria-label="Coleções">
          <h2 className={heading}>Coleções</h2>
          <ul className="flex flex-col gap-2">
            {COLLECTION_LINKS.map((c) => (
              <li key={c.id}>
                <Link to="/" search={{ collection: [c.id] }} hash="catalogo">
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div>
          <h2 className={heading}>Redes sociais</h2>
          <ul className="flex gap-3">
            {SOCIAL.map((s) => (
              <li key={s.name}>
                <a
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Kurio no ${s.name} (abre em nova aba)`}
                  className="grid size-8 place-items-center rounded border border-hairline border-primary text-primary"
                >
                  <Icon name={s.icon} className="size-4" />
                </a>
              </li>
            ))}
          </ul>
          <h2 className={`${heading} mt-6`}>Carteiras compatíveis</h2>
          <p className="text-micro text-primary">METAMASK • WALLETCONNECT • COINBASE</p>
        </div>
      </div>
      <p className="mt-6 text-center text-micro text-muted-foreground">
        © 2026 Kurio. Propriedade digital para todos.
      </p>
    </footer>
  );
}
