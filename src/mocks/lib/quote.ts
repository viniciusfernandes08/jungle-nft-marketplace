import type { Quote, QuoteInput, QuoteIssue, QuoteLine } from "@/features/cart/domain/quote";
import { computeQuoteTotals } from "@/features/cart/domain/quote";
import { maxPurchasableQuantity } from "@/features/nfts/domain/nft-rules";
import type { Nft } from "@/features/nfts/domain/nft";
import { mulEthByInt, type EthString } from "@/shared/domain/eth";
import type { NetworkId } from "@/shared/domain/network";
import { resolveCoupon } from "../fixtures/coupons";

export const NETWORK_FEES: Record<NetworkId, EthString> = {
  ethereum: "0.016",
  polygon: "0.004",
  solana: "0.001",
};

/** Constrói a cotação a partir do catálogo atual. Usada pela API e pela revalidação do pedido. */
export function buildQuote(nfts: readonly Nft[], input: QuoteInput): Quote {
  const lines: QuoteLine[] = [];
  const issues: QuoteIssue[] = [];
  let version = 0;

  for (const item of input.items) {
    const nft = nfts.find((n) => n.id === item.nftId);
    const edition = nft?.editions.find((e) => e.id === item.editionId);
    if (!nft || !edition) continue;

    version += nft.version;
    lines.push({
      nftId: nft.id,
      editionId: edition.id,
      name: nft.name,
      tokenId: nft.tokenId,
      editionLabel: edition.label,
      imageUrl: nft.imageUrl,
      quantity: item.quantity,
      unitPriceEth: nft.priceEth,
      lineTotalEth: mulEthByInt(nft.priceEth, item.quantity),
      available: edition.available,
    });

    const limit = maxPurchasableQuantity(edition);
    const ref = { nftId: nft.id, editionId: edition.id };
    if (limit === 0) issues.push({ code: "OUT_OF_STOCK", ...ref });
    else if (item.quantity > limit) issues.push({ code: "INSUFFICIENT_STOCK", ...ref });
  }

  const coupon = resolveCoupon(input.couponCode);
  const network = input.network ?? "ethereum";
  const fee = lines.length > 0 ? NETWORK_FEES[network] : "0";
  const totals = computeQuoteTotals(lines, coupon?.status === "applied" ? coupon.basisPoints : 0, fee);

  return {
    id: `quote-${crypto.randomUUID()}`,
    version,
    quotedAt: new Date().toISOString(),
    lines,
    couponCode: coupon ? input.couponCode?.trim().toUpperCase() : undefined,
    couponStatus: coupon?.status,
    ...totals,
    issues,
  };
}
