import { createContext, useContext } from "react";

export const AnnouncerContext = createContext<(message: string) => void>(() => {});

/** Anuncia uma mensagem Ex: "A página de criadores não está disponível nesta versão" */
export const useAnnounce = () => useContext(AnnouncerContext);
