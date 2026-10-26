import type { Nft, NftEdition } from "./nft";

export const MAX_QUANTITY_PER_ORDER = 10;

export function totalAvailable(nft: Nft): number {
  return nft.editions.reduce((sum, edition) => sum + edition.available, 0);
}

export function isSoldOut(nft: Nft): boolean {
  return totalAvailable(nft) === 0;
}

export function maxPurchasableQuantity(edition: NftEdition): number {
  return Math.max(0, Math.min(edition.available, MAX_QUANTITY_PER_ORDER));
}

export function clampQuantity(requested: number, edition: NftEdition): number {
  const max = maxPurchasableQuantity(edition);
  if (max === 0) return 0;
  const whole = Number.isFinite(requested) ? Math.trunc(requested) : 1;
  return Math.min(Math.max(whole, 1), max);
}
