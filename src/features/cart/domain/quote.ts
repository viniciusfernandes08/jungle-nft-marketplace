import { compareEth, mulEthByInt, percentOfEth, subEth, sumEth, type EthString } from "@/shared/domain/eth";
import type { NetworkId } from "@/shared/domain/network";
import type { CartItem } from "./cart";

export type CouponStatus = "applied" | "invalid" | "expired";

export type QuoteIssueCode = "PRICE_CHANGED" | "OUT_OF_STOCK" | "INSUFFICIENT_STOCK";

export type QuoteIssue = {
  code: QuoteIssueCode;
  nftId: string;
  editionId: string;
};

export type QuoteLine = {
  nftId: string;
  editionId: string;
  name: string;
  tokenId: string;
  editionLabel: string;
  imageUrl: string;
  quantity: number;
  unitPriceEth: EthString;
  lineTotalEth: EthString;
  available: number;
};

/** A cotação da API é a referência para finalizar o pedido. */
export type Quote = {
  id: string;
  version: number;
  quotedAt: string; // ISO
  lines: QuoteLine[];
  couponCode?: string;
  couponStatus?: CouponStatus;
  subtotalEth: EthString;
  discountEth: EthString;
  networkFeeEth: EthString;
  totalEth: EthString;
  issues: QuoteIssue[];
};

/** A cotação recebe os itens, então serve para visitante e para usuário logado. */
export type QuoteInput = {
  items: CartItem[];
  couponCode?: string;
  network?: NetworkId;
};

export interface QuoteRepository {
  get(input: QuoteInput, signal?: AbortSignal): Promise<Quote>;
}

export type QuoteTotals = {
  subtotalEth: EthString;
  discountEth: EthString;
  networkFeeEth: EthString;
  totalEth: EthString;
};

/** Cálculo local (ex.: UI otimista). O valor oficial sempre vem da API. */
export function computeQuoteTotals(
  lines: readonly Pick<QuoteLine, "unitPriceEth" | "quantity">[],
  discountBasisPoints: number,
  networkFeeEth: EthString,
): QuoteTotals {
  const subtotalEth = sumEth(lines.map((l) => mulEthByInt(l.unitPriceEth, l.quantity)));
  const rawDiscount = percentOfEth(subtotalEth, discountBasisPoints);
  const discountEth = compareEth(rawDiscount, subtotalEth) > 0 ? subtotalEth : rawDiscount;
  const totalEth = sumEth([subEth(subtotalEth, discountEth), networkFeeEth]);
  return { subtotalEth, discountEth, networkFeeEth, totalEth };
}

/** Verdadeiro se algo que o usuário confirmou deixou de valer. */
export function hasQuoteChanged(confirmed: Quote, current: Quote): boolean {
  if (confirmed.totalEth !== current.totalEth) return true;
  if (current.issues.length > 0) return true;
  if (confirmed.lines.length !== current.lines.length) return true;
  return confirmed.lines.some((line, i) => {
    const next = current.lines[i];
    return (
      next.nftId !== line.nftId ||
      next.editionId !== line.editionId ||
      next.quantity !== line.quantity ||
      next.unitPriceEth !== line.unitPriceEth
    );
  });
}

export function couponErrorMessage(status: CouponStatus | undefined): string | undefined {
  if (status === "expired") return "Este cupom expirou.";
  if (status === "invalid") return "Cupom inválido.";
  return undefined;
}

/** Texto do problema de uma linha da cotação. */
export function describeIssue(issue: QuoteIssue, line: Pick<QuoteLine, "available">): string {
  switch (issue.code) {
    case "OUT_OF_STOCK":
      return "Esta edição esgotou.";
    case "INSUFFICIENT_STOCK":
      return line.available === 1 ? "Só resta 1 unidade desta edição." : `Só restam ${line.available} unidades desta edição.`;
    case "PRICE_CHANGED":
      return "O preço desta edição mudou.";
  }
}
