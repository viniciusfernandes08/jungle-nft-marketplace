export type ErrorKind =
  | "validation"
  | "unauthorized"
  | "session_expired"
  | "forbidden"
  | "not_found"
  | "conflict"
  | "transient";

export type FieldErrors = Record<string, string>;

/** Corpo de erro devolvido pela API (REST e mocks usam este contrato). */
export type ApiErrorBody = {
  code: string;
  message: string;
  fieldErrors?: FieldErrors;
};

/** Erro já classificado, o que application e ui enxergam. A infra faz o mapeamento. */
export type DomainError = {
  kind: ErrorKind;
  message: string;
  code?: string;
  status?: number;
  fieldErrors?: FieldErrors;
};

export function isDomainError(value: unknown): value is DomainError {
  return typeof value === "object" && value !== null && "kind" in value && "message" in value;
}

/** Só falhas transitórias merecem nova tentativa. */
export function isRetryable(error: DomainError): boolean {
  return error.kind === "transient";
}

/** Códigos de conflito usados no contrato. */
export const ConflictCode = {
  EmailTaken: "EMAIL_TAKEN",
  OutOfStock: "OUT_OF_STOCK",
  PriceChanged: "PRICE_CHANGED",
  IdempotencyKeyReused: "IDEMPOTENCY_KEY_REUSED",
} as const;
