import type { CheckoutFormValues } from "../schemas";

export const FORM_FIELDS = [
  "displayName",
  "username",
  "network",
  "profileName",
  "walletId",
  "secondaryAddress",
  "walletType",
  "referralCode",
  "email",
  "ensLabel",
  "note",
] as const satisfies readonly (keyof CheckoutFormValues)[];