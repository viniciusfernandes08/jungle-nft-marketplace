import type { FieldValues, Path, UseFormSetError } from "react-hook-form";
import type { DomainError } from "@/shared/domain/errors";

/** Erros de campo vindos da API (ex.: e-mail já cadastrado) aparecem no próprio campo. */
export function applyFieldErrors<T extends FieldValues>(
  error: DomainError,
  setError: UseFormSetError<T>,
  fields: readonly Path<T>[],
) {
  for (const [field, message] of Object.entries(error.fieldErrors ?? {})) {
    if (fields.includes(field as Path<T>)) setError(field as Path<T>, { type: "server", message });
  }
}
