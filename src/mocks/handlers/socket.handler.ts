import { toSocketIo } from "@mswjs/socket.io-binding";
import { ws } from "msw";
import { env } from "@/config/env";
import type { RealtimeEvent } from "@/features/realtime/domain/events";
import { addRealtimeClient, removeRealtimeClient } from "../lib/realtime";

function socketLinkPath(): string {
  const base = typeof location === "undefined" ? "http://localhost" : location.href;
  const url = new URL(env.socketPath, base);
  return `*/${url.pathname.replace(/^\//, "")}`;
}

export const realtimeLink = ws.link(socketLinkPath());

export const socketHandlers = [
  realtimeLink.addEventListener("connection", (connection) => {
    const { client } = toSocketIo(connection);
    const subscriber = {
      emit: (event: string, payload: RealtimeEvent) => client.emit(event, payload),
    };
    addRealtimeClient(subscriber);

    const ping = setInterval(() => {
      try {
        connection.client.send("2");
      } catch {}
    }, 20_000);

    connection.client.addEventListener("close", () => {
      clearInterval(ping);
      removeRealtimeClient(subscriber);
    });
  }),
];
