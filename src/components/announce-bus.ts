type Listener = (message: string) => void;
let listener: Listener | undefined;

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
