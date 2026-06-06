import type { LobbyState } from "@chameleon/types/game";
import { create } from "zustand";

type LobbyStore = {
  lobby: LobbyState | null;
  localPlayerId: string | null;
  setLobby: (lobby: LobbyState) => void;
  setLocalPlayerId: (id: string) => void;
  reset: () => void;
};

export const useLobbyStore = create<LobbyStore>((set) => ({
  lobby: null,
  localPlayerId: null,
  setLobby(lobby) {
    set({ lobby });
  },
  setLocalPlayerId(localPlayerId) {
    set({ localPlayerId });
  },
  reset() {
    set({ lobby: null, localPlayerId: null });
  },
}));
