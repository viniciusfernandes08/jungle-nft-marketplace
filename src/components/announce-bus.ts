type Listener = (message: string) => void;
let listener: Listener | undefined;

/** Permite anunciar de fora da árvore React (ex.: expiração de sessão no interceptor HTTP). */
export const announceBus = {
  emit(message: string) {
    listener?.(message);
  },
  subscribe(next: Listener) {
    listener = next;
    return () => {
      if (listener === next) listener = undefined;
    };
  },
};
