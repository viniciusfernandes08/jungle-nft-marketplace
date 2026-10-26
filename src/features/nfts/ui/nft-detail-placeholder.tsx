import { Link } from "@tanstack/react-router";
import { Skeleton } from "@/components/ui/skeleton";
import { errorMessage } from "@/lib/error-message";
import { formatEth } from "@/shared/domain/eth";
import { useNft } from "./hooks/use-nft";

export function NftDetailPlaceholder({ nftId }: { nftId: string }) {
  const { data, error, isPending, refetch } = useNft(nftId);

  return (
    <section className="mx-auto w-full max-w-[1200px] px-4 py-10 sm:px-6 xl:px-0">
      {isPending ? (
        <Skeleton className="h-64 w-full" />
      ) : error ? (
        <div role="alert" className="rounded-lg bg-card p-8 text-center">
          <h1 className="text-heading font-bold">
            {error.kind === "not_found" ? "NFT não encontrado" : "Não foi possível carregar o NFT"}
          </h1>
          <p className="mt-2 text-small text-muted-foreground">{errorMessage(error)}</p>
          <div className="mt-6 flex justify-center gap-3">
            {error.kind !== "not_found" && (
              <button type="button" onClick={() => refetch()} className="rounded-lg bg-primary px-6 py-3 text-small font-bold text-primary-foreground">
                Tentar novamente
              </button>
            )}
            <Link to="/" className="rounded-lg bg-secondary px-6 py-3 text-small font-bold">
              Voltar ao catálogo
            </Link>
          </div>
        </div>
      ) : (
        <div className="rounded-lg bg-card p-8">
          <h1 className="text-title font-bold">{data.name}</h1>
          <p className="mt-2 font-bold text-primary">{formatEth(data.priceEth)} ETH</p>
          <p className="mt-4 text-small text-muted-foreground">A tela completa de detalhes chega na próxima etapa.</p>
        </div>
      )}
    </section>
  );
}
