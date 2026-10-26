import { useQuery } from "@tanstack/react-query";
import { sessionQueryOptions } from "../session-cache";

export function useSession() {
  return useQuery(sessionQueryOptions());
}
