import type { Socket } from "socket.io-client";
import { env } from "@/config/env";
import type { RealtimeEvent } from "@/features/realtime/domain/events";
import type { ConnectionState, RealtimeGateway } from "@/features/realtime/domain/realtime-gateway";

/**
 * Gateway Socket.IO. Conecta direto em WebSocket para o MSW conseguir interceptar
 * (o fallback de polling do engine.io não é atendido pelo mock).
 *
 * `socket.io-client` é importado sob demanda: o engine.io-client captura
 * `globalThis.WebSocket` no topo do módulo. Se fosse importado junto com o app, essa
 * referência seria a WebSocket nativa, anterior ao patch do MSW, e o mock não veria a conexão.
 */
export function createSocketIoRealtimeGateway(): RealtimeGateway {
  let socket: Socket | null = null;
  let socketPromise: Promise<Socket> | null = null;
  let connectRequest = 0;
  let currentToken: string | undefined;
  const listeners = new Set<(event: RealtimeEvent) => void>();
  const stateListeners = new Set<(state: ConnectionState) => void>();

  const setState = (state: ConnectionState) => {
    for (const listener of stateListeners) listener(state);
  };

  function dispatch(event: RealtimeEvent) {
    for (const listener of listeners) listener(event);
  }

  async function createSocket(): Promise<Socket> {
    const { io } = await import("socket.io-client");
    const instance = io(env.socketUrl || undefined, {
      path: env.socketPath,
      transports: ["websocket"],
      auth: { token: currentToken },
      autoConnect: false,
      reconnection: true,
    });
    instance.on("connect", () => {
      if (instance === socket) setState("connected");
    });
    instance.on("disconnect", () => {
      if (instance === socket) setState("disconnected");
    });
    instance.on("connect_error", () => {
      if (instance === socket) setState("disconnected");
    });
    instance.on("order.updated", (event: RealtimeEvent) => {
      if (instance === socket) dispatch(event);
    });
    instance.on("nft.updated", (event: RealtimeEvent) => {
      if (instance === socket) dispatch(event);
    });
    return instance;
  }

  function getSocket(): Promise<Socket> {
    if (socket) return Promise.resolve(socket);
    socketPromise ??= createSocket().finally(() => {
      socketPromise = null;
    });
    return socketPromise;
  }

  return {
    async connect({ token }) {
      const request = ++connectRequest;
      if (currentToken !== token) currentToken = token;
      if (socket?.connected) {
        setState("connected");
        return;
      }
      setState("connecting");
      try {
        const instance = await getSocket();
        // Um disconnect (StrictMode/troca de sessão) pode ter acontecido durante o import.
        if (request !== connectRequest) return;
        socket = instance;
        if (currentToken !== token) currentToken = token;
        instance.auth = { token: currentToken };
        instance.connect();
      } catch {
        if (request === connectRequest) setState("disconnected");
      }
    },
    disconnect() {
      connectRequest += 1;
      socket?.disconnect();
      socket = null;
      currentToken = undefined;
      setState("disconnected");
    },
    subscribe(handler) {
      listeners.add(handler);
      return () => listeners.delete(handler);
    },
    onConnectionChange(handler) {
      stateListeners.add(handler);
      return () => stateListeners.delete(handler);
    },
  };
}
