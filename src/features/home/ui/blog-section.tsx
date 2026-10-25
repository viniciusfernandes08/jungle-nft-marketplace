import { UnavailableLink } from "@/components/unavailable-link";
import { nftImages } from "@/config/assets";

const POSTS = [
  { date: "12 de setembro", read: 6, title: "Como funciona a propriedade de NFTs", text: "Aprenda a colecionar, negociar e verificar ativos digitais.", image: nftImages.neon },
  { date: "13 de setembro", read: 2, title: "10 artistas digitais para acompanhar", text: "Conheça criadores que moldam a cultura digital.", image: nftImages.emerald },
  { date: "15 de setembro", read: 3, title: "Raridade, atributos e procedência", text: "Entenda raridade, procedência, direitos autorais e utilidade.", image: nftImages.sage },
  { date: "15 de setembro", read: 2, title: "Como proteger sua carteira", text: "Proteja sua carteira, seus ativos e sua identidade.", image: nftImages.golden },
] as const;

/** Conteúdo editorial: fora do escopo funcional, então "Ler mais" avisa que não está disponível. */
export function BlogSection() {
  return (
    <section aria-labelledby="blog-titulo" className="mx-auto w-full max-w-[1200px] px-4 py-10 sm:px-6 xl:px-0">
      <h2 id="blog-titulo" className="text-center text-title font-bold">Diário da Cunhagem</h2>
      <p className="mt-2 text-center text-small text-muted-foreground">
        Histórias, guias e insights para colecionadores sobre o universo da propriedade digital.
      </p>
      <ul className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {POSTS.map((post) => (
          <li key={post.title}>
            <article className="flex h-full flex-col overflow-hidden rounded-lg bg-card">
              <img src={post.image} alt="" width={288} height={200} loading="lazy" decoding="async" className="aspect-[3/2] w-full object-cover" />
              <div className="flex flex-1 flex-col gap-2 p-4">
                <p className="text-micro text-muted-foreground">
                  {post.date} | Leitura de {post.read} min
                </p>
                <h3 className="text-body font-bold">{post.title}</h3>
                <p className="text-small text-muted-foreground">{post.text}</p>
                <UnavailableLink
                  message="Os artigos do Diário da Cunhagem não estão disponíveis nesta versão."
                  className="mt-auto pt-2 text-micro text-primary"
                >
                  Ler mais →
                </UnavailableLink>
              </div>
            </article>
          </li>
        ))}
      </ul>
    </section>
  );
}
