export type ErrorKind =
  | "validation"
  | "unauthorized"
  | "session_expired"
  | "forbidden"
  | "not_found"
  | "conflict"
  | "transient";

export type FieldErrors = Record<string, string>;

export type ApiErrorBody = {
  code: string;
  message: string;
  fieldErrors?: FieldErrors;
};

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

export function isRetryable(error: DomainError): boolean {
  return error.kind === "transient";
}

export const ConflictCode = {
  EmailTaken: "EMAIL_TAKEN",
  OutOfStock: "OUT_OF_STOCK",
  PriceChanged: "PRICE_CHANGED",
  IdempotencyKeyReused: "IDEMPOTENCY_KEY_REUSED",
} as const;
