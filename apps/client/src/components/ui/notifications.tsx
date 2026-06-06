import { useEffect } from "react";
import { useNotificationStore } from "@/store/notification-store";

const NOTIFICATION_TIMEOUT_MS = 4000;

export function Notifications() {
  const message = useNotificationStore((state) => state.message);
  const clear = useNotificationStore((state) => state.clear);

  useEffect(() => {
    if (message === null) {
      return;
    }

    const timer = setTimeout(clear, NOTIFICATION_TIMEOUT_MS);
    return () => {
      clearTimeout(timer);
    };
  }, [message, clear]);

  return (
    <div
      className="pointer-events-none fixed inset-x-0 bottom-4 z-50 flex min-h-12 justify-center px-4"
      role="alert"
      aria-live="assertive"
    >
      {message !== null ? (
        <output className="pointer-events-auto rounded-xl border border-destructive/40 bg-card px-4 py-2.5 text-card-foreground text-sm shadow-md">
          {message}
        </output>
      ) : null}
    </div>
  );
}
