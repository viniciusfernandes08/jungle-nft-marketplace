import { announceBus } from "@/components/announce-bus";
import { endSession } from "@/features/auth/ui/session-cache";
import { onHttpUnauthorized } from "@/lib/http";
import { container } from "./container";
import { queryClient } from "./query-client";
import { router } from "./router";

/**
 * Qualquer 401 numa requisição autenticada derruba a sessão: limpa token e dados privados,
 * avisa o usuário e reavalia os guards (rotas privadas levam ao login, com retorno).
 */
export function setupSessionExpiry() {
  onHttpUnauthorized(() => {
    if (!container.auth.tokens.get()) return;
    container.auth.tokens.clear();
    endSession(queryClient);
    announceBus.emit("Sua sessão expirou. Entre novamente.");
    void router.invalidate();
  });
}
