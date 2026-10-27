import type { NftTab } from "../../domain/nft-query";

export const TABS: { value: NftTab; label: string }[] = [
  { value: "all", label: "Todos os NFTs" },
  { value: "new", label: "Novos lançamentos" },
  { value: "trending", label: "Em alta" },
];