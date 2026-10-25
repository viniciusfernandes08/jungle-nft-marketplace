import type { NftSort } from "@/features/nfts/domain/nft-query";

export const SORT_OPTIONS: { value: NftSort; label: string }[] = [
  { value: "recent", label: "Listados recentemente" },
  { value: "price-asc", label: "Menor preço" },
  { value: "price-desc", label: "Maior preço" },
  { value: "name", label: "Nome (A-Z)" },
];