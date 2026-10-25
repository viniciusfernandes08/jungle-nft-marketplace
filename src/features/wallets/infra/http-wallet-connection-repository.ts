import type { AxiosInstance } from "axios";
import { request } from "@/shared/infra/map-http-error";
import type { WalletProviderId } from "../domain/wallet";
import type { WalletConnectionRepository, WalletConnectionResult } from "../domain/wallet-connection";

export function createHttpWalletConnectionRepository(
  client: AxiosInstance,
): WalletConnectionRepository {
  return {
    connect: (providerId: WalletProviderId, signal) =>
      request(() =>
        client.post<WalletConnectionResult>("/wallet-connection/connect", { providerId }, { signal }),
      ),
    disconnect: async (signal) => {
      await request(() => client.post<null>("/wallet-connection/disconnect", undefined, { signal }));
    },
  };
}
