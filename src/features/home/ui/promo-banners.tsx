import { Link } from "@tanstack/react-router";
import { Icon } from "@/components/icon";
import { nftImages } from "@/config/assets";

const cta = "inline-flex w-fit items-center gap-2 rounded-lg bg-primary px-4 py-2 text-small font-bold text-primary-foreground";

export function PromoBanners() {
  return (
    <section aria-label="Destaques da Kurio" className="mx-auto grid w-full max-w-[1200px] gap-6 px-4 py-8 sm:px-6 lg:grid-cols-2 xl:px-0">
      <article className="grid grid-cols-[minmax(0,1fr)_1.2fr] overflow-hidden rounded-lg bg-card">
        <img src={nftImages.emerald} alt="" width={288} height={252} loading="lazy" decoding="async" className="size-full object-cover" />
        <div className="flex flex-col items-end justify-center gap-3 p-5 text-right">
          <h2 className="text-body font-bold lg:text-subheading">Lançamentos gênesis de edição limitada</h2>
          <p className="text-small text-muted-foreground">
            Colecione edições escassas diretamente dos criadores antes da revelação pública.
          </p>
          <Link to="/" search={{ tab: "new" }} hash="catalogo" className={cta}>
            Explorar <Icon name="arrow-right" className="size-4" />
          </Link>
        </div>
      </article>
      <article className="grid grid-cols-[minmax(0,1fr)_1.2fr] overflow-hidden rounded-lg bg-card">
        <img src={nftImages.neon} alt="" width={288} height={252} loading="lazy" decoding="async" className="size-full object-cover" />
        <div className="flex flex-col items-end justify-center gap-3 p-5 text-right">
          <h2 className="text-body font-bold lg:text-subheading">Arte digital selecionada e muito mais</h2>
          <p className="text-small text-muted-foreground">
            Explore novos artistas, coleções verificadas e obras digitais que definem a cultura.
          </p>
          <Link to="/" search={{ collection: ["arte-digital"] }} hash="catalogo" className={cta}>
            Explorar <Icon name="arrow-right" className="size-4" />
          </Link>
        </div>
      </article>
    </section>
  );
}
