import type { AxiosInstance } from "axios";
import { request } from "@/shared/infra/map-http-error";
import type { Wallet, WalletInput, WalletRepository } from "../domain/wallet";

export function createHttpWalletRepository(client: AxiosInstance): WalletRepository {
  return {
    list: (signal) => request(() => client.get<Wallet[]>("/wallets", { signal })),
    create: (input: WalletInput) => request(() => client.post<Wallet>("/wallets", input)),
    update: (id: string, input: WalletInput) =>
      request(() => client.put<Wallet>(`/wallets/${encodeURIComponent(id)}`, input)),
  };
}
