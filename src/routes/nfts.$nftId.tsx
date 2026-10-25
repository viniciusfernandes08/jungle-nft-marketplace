import { createFileRoute } from "@tanstack/react-router";
import { NftDetailPage } from "@/features/nfts/ui/components/detail/nft-detail-page";

function NftRoute() {
  const { nftId } = Route.useParams();
  return <NftDetailPage nftId={nftId} />;
}

export const Route = createFileRoute("/nfts/$nftId")({
  component: NftRoute,
});
