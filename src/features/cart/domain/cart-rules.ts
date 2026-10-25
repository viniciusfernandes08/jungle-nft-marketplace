import { MAX_QUANTITY_PER_ORDER } from "@/features/nfts/domain/nft-rules";
import { sameCartLine, type CartItem } from "./cart";

/**
 * Une o carrinho do visitante ao da conta: soma quantidades das linhas iguais,
 * respeitando o limite por pedido. A disponibilidade real é revalidada pela cotação.
 */
export function mergeCartItems(account: readonly CartItem[], guest: readonly CartItem[]): CartItem[] {
  const merged = account.map((item) => ({ ...item }));
  for (const incoming of guest) {
    const existing = merged.find((item) => sameCartLine(item, incoming));
    if (existing) {
      existing.quantity = Math.min(existing.quantity + incoming.quantity, MAX_QUANTITY_PER_ORDER);
    } else {
      merged.push({ ...incoming, quantity: Math.min(incoming.quantity, MAX_QUANTITY_PER_ORDER) });
    }
  }
  return merged;
}
