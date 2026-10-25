import type { CouponStatus } from "@/features/cart/domain/quote";

type Coupon = { status: Extract<CouponStatus, "applied" | "expired">; basisPoints: number };

/** KURIO10 e GENESIS20 valem; EXPIRADO10 está vencido; qualquer outro código é inválido. */
const COUPONS: Record<string, Coupon> = {
  KURIO10: { status: "applied", basisPoints: 1000 },
  GENESIS20: { status: "applied", basisPoints: 2000 },
  EXPIRADO10: { status: "expired", basisPoints: 1000 },
};

export function resolveCoupon(code: string | undefined): { status: CouponStatus; basisPoints: number } | null {
  const normalized = code?.trim().toUpperCase();
  if (!normalized) return null;
  const coupon = COUPONS[normalized];
  return coupon ?? { status: "invalid", basisPoints: 0 };
}
