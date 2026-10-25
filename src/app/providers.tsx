import { QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { AnnouncerProvider } from "@/components/announcer";
import { RealtimeProvider } from "@/features/realtime/ui/realtime-provider";
import { queryClient } from "./query-client";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <RealtimeProvider>
        <AnnouncerProvider>{children}</AnnouncerProvider>
      </RealtimeProvider>
    </QueryClientProvider>
  );
}
