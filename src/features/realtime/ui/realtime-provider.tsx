import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, type ReactNode } from "react";
import { container } from "@/app/container";
import { useSession } from "@/features/auth/ui/hooks/use-session";
import { nftKeys } from "@/features/nfts/ui/hooks/nft-keys";
import type { Nft } from "@/features/nfts/domain/nft";
import type { Order } from "@/features/orders/domain/order";
import { orderKeys } from "@/features/orders/ui/hooks/order-keys";
import { rememberEvent, shouldApplyEvent } from "../domain/event-rules";

/**
 * Assina o canal em tempo real uma única vez por sessão.
 * Eventos privados de outro usuário e duplicatas/versões antigas são descartados.
 */
export function RealtimeProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const { data: session } = useSession();
  const sessionUserId = session?.user.id;
  const sessionUserIdRef = useRef(sessionUserId);
  const seenRef = useRef<string[]>([]);
  useEffect(() => {
    sessionUserIdRef.current = sessionUserId;
  }, [sessionUserId]);

  useEffect(() => {
    container.realtime.connect({ token: container.auth.tokens.get() ?? undefined });
    return () => container.realtime.disconnect();
  }, [sessionUserId]);

  useEffect(
    () =>
      container.realtime.subscribe((event) => {
        if (event.type === "order.updated") {
          const key = orderKeys.detail(event.resource.id);
          const current = queryClient.getQueryData<Order>(key);
          if (
            !shouldApplyEvent({
              event,
              currentVersion: current?.version,
              seenEventIds: seenRef.current,
              sessionUserId: sessionUserIdRef.current,
            })
          ) {
            return;
          }
          seenRef.current = rememberEvent(seenRef.current, event.eventId);

          if (current) {
            queryClient.setQueryData<Order>(key, {
              ...current,
              status: event.data.status,
              version: event.version,
              updatedAt: event.occurredAt,
              ...(event.data.transactionRef
                ? { transactionRef: event.data.transactionRef }
                : {}),
              ...(event.data.declineReason
                ? { declineReason: event.data.declineReason }
                : {}),
            });
          } else {
            void queryClient.invalidateQueries({ queryKey: key });
          }
          // O carrinho muda quando o pedido é confirmado (as linhas compradas saem).
          void queryClient.invalidateQueries({ queryKey: ["cart"] });
          return;
        }

        const key = nftKeys.detail(event.resource.id);
        const current = queryClient.getQueryData<Nft>(key);
        if (
          !shouldApplyEvent({
            event,
            currentVersion: current?.version,
            seenEventIds: seenRef.current,
            sessionUserId: sessionUserIdRef.current,
          })
        ) {
          return;
        }
        seenRef.current = rememberEvent(seenRef.current, event.eventId);

        if (current) {
          queryClient.setQueryData<Nft>(key, {
            ...current,
            priceEth: event.data.priceEth,
            version: event.version,
            editions: current.editions.map((edition) => ({
              ...edition,
              available:
                event.data.editions.find((next) => next.id === edition.id)?.available ??
                edition.available,
            })),
          });
        }
        void queryClient.invalidateQueries({ queryKey: nftKeys.lists() });
        void queryClient.invalidateQueries({ queryKey: nftKeys.facets() });
        void queryClient.invalidateQueries({ queryKey: ["quote"] });
      }),
    [queryClient],
  );

  return children;
}
