import { create } from "zustand";

type NotificationStore = {
  message: string | null;
  notify: (message: string) => void;
  clear: () => void;
};

export const useNotificationStore = create<NotificationStore>((set) => ({
  message: null,
  notify(message) {
    set({ message });
  },
  clear() {
    set({ message: null });
  },
}));
