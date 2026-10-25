import { http, HttpResponse } from "msw";
import { z } from "zod";
import { walletProviderIds } from "@/features/wallets/domain/wallet";
import type { WalletConnectionResult } from "@/features/wallets/domain/wallet-connection";
import { authenticate, unauthorizedResponse } from "../lib/auth";
import { readJson, withScenario } from "../lib/respond";
import { getScenarioName } from "../scenarios";

const connectSchema = z.object({ providerId: z.enum(walletProviderIds) });

/** Simulação de conexão: o cenário "wallet-refused" faz a carteira recusar. */
export const walletConnectionHandlers = [
  http.post(
    "/api/wallet-connection/connect",
    withScenario(async ({ request }) => {
      const auth = await authenticate(request);
      if (!auth.ok) return unauthorizedResponse(auth.reason);

      const body = await readJson(request, connectSchema);
      if (!body.ok) return body.response;

      const result: WalletConnectionResult =
        getScenarioName() === "wallet-refused"
          ? {
              status: "refused",
              providerId: body.data.providerId,
              reason: "A conexão foi recusada na carteira. Tente novamente ou escolha outro provedor.",
            }
          : {
              status: "connected",
              providerId: body.data.providerId,
              connectedAt: new Date().toISOString(),
            };

      return HttpResponse.json(result);
    }),
  ),

  http.post(
    "/api/wallet-connection/disconnect",
    withScenario(async ({ request }) => {
      const auth = await authenticate(request);
      if (!auth.ok) return unauthorizedResponse(auth.reason);
      return HttpResponse.json(null);
    }),
  ),
];
