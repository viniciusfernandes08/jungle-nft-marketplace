import { createContext, useContext } from "react";

export const AnnouncerContext = createContext<(message: string) => void>(() => {});

/** Anuncia uma mensagem (região aria-live + aviso visual). Use para feedback de ações. */
export const useAnnounce = () => useContext(AnnouncerContext);
