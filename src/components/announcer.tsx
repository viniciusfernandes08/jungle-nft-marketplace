import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { announceBus } from "./announce-bus";
import { AnnouncerContext } from "./announcer-context";

const VISIBLE_MS = 4000;

export function AnnouncerProvider({ children }: { children: ReactNode }) {
  const [message, setMessage] = useState("");
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const announce = useCallback((next: string) => {
    clearTimeout(timer.current);
    setMessage(next);
    timer.current = setTimeout(() => setMessage(""), VISIBLE_MS);
  }, []);

  useEffect(() => announceBus.subscribe(announce), [announce]);

  return (
    <AnnouncerContext.Provider value={announce}>
      {children}
      <div
        role="status"
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 bottom-28 z-50 flex justify-center px-4 lg:bottom-8"
      >
        {message && (
          <p className="border-hairline rounded-lg border-primary bg-secondary px-4 py-3 text-small">
            {message}
          </p>
        )}
      </div>
    </AnnouncerContext.Provider>
  );
}
