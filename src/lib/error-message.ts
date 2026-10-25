import { isDomainError } from "@/shared/domain/errors";

export function errorMessage(error: unknown): string {
  return isDomainError(error) ? error.message : "Algo deu errado. Tente novamente.";
}
