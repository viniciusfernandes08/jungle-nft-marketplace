import type { RealtimeEvent } from "./events";

const SEEN_LIMIT = 200;

export type ApplyCheck = {
  event: RealtimeEvent;
  currentVersion: number | undefined;
  seenEventIds: readonly string[];
  sessionUserId: string | undefined;
};

export function shouldApplyEvent({ event, currentVersion, seenEventIds, sessionUserId }: ApplyCheck): boolean {
  if (seenEventIds.includes(event.eventId)) return false;
  if (event.userId !== undefined && event.userId !== sessionUserId) return false;
  if (currentVersion !== undefined && event.version <= currentVersion) return false;
  return true;
}

export function rememberEvent(seen: readonly string[], eventId: string): string[] {
  return [...seen, eventId].slice(-SEEN_LIMIT);
}
