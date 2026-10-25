import type { NetworkId } from "@/shared/domain/network";
import type { CartRepository } from "../domain/cart-repository";
import type { CouponStatus, QuoteInput, QuoteRepository } from "../domain/quote";

export const makeGetQuote = (repo: QuoteRepository) => (input: QuoteInput, signal?: AbortSignal) =>
  repo.get(input, signal);

/**
 * O cupom só é salvo no carrinho depois que a cotação o aceita;
 * inválido ou expirado devolve o status e não altera nada.
 */
export const makeApplyCoupon =
  (quotes: QuoteRepository, cart: CartRepository) =>
  async (couponCode: string, network?: NetworkId): Promise<{ status: CouponStatus }> => {
    const { items } = await cart.get();
    const quote = await quotes.get({ items, couponCode, network });
    const status = quote.couponStatus ?? "invalid";
    if (status === "applied") await cart.setCoupon(couponCode);
    return { status };
  };
