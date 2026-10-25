import { useQuery } from "@tanstack/react-query";
import { sessionQueryOptions } from "../session-cache";

/** `undefined` enquanto carrega; `null` sem sessão. */
export function useSession() {
  return useQuery(sessionQueryOptions());
}
