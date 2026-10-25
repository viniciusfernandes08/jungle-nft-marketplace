import type { RealtimeEvent } from "./events";

const SEEN_LIMIT = 200;

export type ApplyCheck = {
  event: RealtimeEvent;
  /** Versão que o cache já tem para o recurso; undefined se não há nada em cache. */
  currentVersion: number | undefined;
  seenEventIds: readonly string[];
  sessionUserId: string | undefined;
};

/**
 * Aplica só eventos novos, mais recentes que o estado atual e destinados à sessão atual.
 * Duplicatas, eventos antigos e eventos de outro usuário são descartados.
 */
export function shouldApplyEvent({ event, currentVersion, seenEventIds, sessionUserId }: ApplyCheck): boolean {
  if (seenEventIds.includes(event.eventId)) return false;
  if (event.userId !== undefined && event.userId !== sessionUserId) return false;
  if (currentVersion !== undefined && event.version <= currentVersion) return false;
  return true;
}

/** Memoriza ids processados, com janela limitada. */
export function rememberEvent(seen: readonly string[], eventId: string): string[] {
  return [...seen, eventId].slice(-SEEN_LIMIT);
}
