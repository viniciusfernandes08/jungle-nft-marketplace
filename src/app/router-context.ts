import type { QueryClient } from "@tanstack/react-query";

/** Disponível em beforeLoad/loader. Guards de auth entram aqui na etapa de sessão. */
export type RouterContext = {
  queryClient: QueryClient;
};
