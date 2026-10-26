import { useRef, useState } from "react";
import { Icon } from "@/components/icon";
import { cn } from "@/lib/utils";

export function NftGallery({ name, images }: { name: string; images: string[] }) {
  const [index, setIndex] = useState(0);
  const zoom = useRef<HTMLDialogElement>(null);
  const current = images[index] ?? images[0];

  return (
    <>
      <ul aria-label="Miniaturas" className="hidden flex-col gap-4 lg:flex">
        {images.map((src, i) => (
          <li key={i}>
            <button
              type="button"
              aria-label={`Ver imagem ${i + 1} de ${images.length}`}
              aria-current={i === index}
              onClick={() => setIndex(i)}
              className={cn("block overflow-hidden rounded-lg border-2 border-transparent", i === index && "border-primary")}
            >
              <img src={src} alt="" width={100} height={100} loading="lazy" decoding="async" className="size-[100px] object-cover" />
            </button>
          </li>
        ))}
      </ul>

      <div className="relative rounded-lg bg-card p-3 lg:p-5">
        <img
          src={current}
          alt={name}
          width={404}
          height={404}
          fetchPriority="high"
          decoding="async"
          className="aspect-square w-full rounded-lg object-cover"
        />
        <button
          type="button"
          aria-label="Ampliar imagem"
          onClick={() => zoom.current?.showModal()}
          className="absolute right-8 top-8 hidden size-8 place-items-center rounded-full bg-card text-primary lg:grid"
        >
          <Icon name="search" className="size-5" />
        </button>
      </div>

      <dialog
        ref={zoom}
        aria-label={`Imagem ampliada de ${name}`}
        onClick={(e) => e.target === zoom.current && zoom.current?.close()}
        className="m-auto max-h-[90svh] w-[min(90vw,720px)] rounded-lg bg-card p-4 text-foreground backdrop:bg-black/70"
      >
        <button
          type="button"
          aria-label="Fechar imagem ampliada"
          onClick={() => zoom.current?.close()}
          className="absolute right-6 top-6 grid size-8 place-items-center rounded-full bg-card text-primary"
        >
          <Icon name="close" className="size-5" />
        </button>
        <img src={current} alt={name} className="aspect-square w-full rounded-lg object-cover" />
      </dialog>
    </>
  );
}
