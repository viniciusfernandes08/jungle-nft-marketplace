import { toSocketIo } from "@mswjs/socket.io-binding";
import { ws } from "msw";
import { env } from "@/config/env";
import type { RealtimeEvent } from "@/features/realtime/domain/events";
import { addRealtimeClient, removeRealtimeClient } from "../lib/realtime";

/**
 * Servidor Socket.IO simulado. O binding responde ao handshake e decodifica os pacotes;
 * a partir daí os eventos do domínio são emitidos para todas as conexões abertas.
 *
 * O MSW resolve paths relativos contra `location.href` (http/https), mas o cliente
 * WebSocket usa ws/wss; o wildcard ignora a origem/protocolo. Também usamos um path
 * dedicado para não capturar o HMR do Vite.
 */
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

    // Mantém a conexão viva: sem ping do "servidor", o engine.io do cliente encerra após ~30s.
    const ping = setInterval(() => {
      try {
        connection.client.send("2");
      } catch {
        // conexão já foi embora
      }
    }, 20_000);

    connection.client.addEventListener("close", () => {
      clearInterval(ping);
      removeRealtimeClient(subscriber);
    });
  }),
];
