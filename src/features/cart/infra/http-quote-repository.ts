import type { AxiosInstance } from "axios";
import { request } from "@/shared/infra/map-http-error";
import type { Quote, QuoteRepository } from "../domain/quote";

export function createHttpQuoteRepository(client: AxiosInstance): QuoteRepository {
  return {
    get: (input, signal) => request(() => client.post<Quote>("/quote", input, { signal })),
  };
}
