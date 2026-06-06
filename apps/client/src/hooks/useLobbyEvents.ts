import { ServerEvent } from "@chameleon/types/events";
import type { LobbyState } from "@chameleon/types/game";
import { useEffect } from "react";
import { socket } from "@/socket/client";
import { useGameStore } from "@/store/game-store";
import { useLobbyStore } from "@/store/lobby-store";
import { useNotificationStore } from "@/store/notification-store";

export function useLobbyEvents(): void {
  const setLobby = useLobbyStore((state) => state.setLobby);
  const setPhase = useGameStore((state) => state.setPhase);
  const notify = useNotificationStore((state) => state.notify);

  useEffect(() => {
    const handleLobby = (lobby: LobbyState) => {
      setLobby(lobby);
      setPhase(lobby.phase);
    };

    const handleError = (message: string) => {
      notify(message);
    };

    socket.on(ServerEvent.LobbyUpdated, handleLobby);
    socket.on(ServerEvent.GameStarted, handleLobby);
    socket.on(ServerEvent.Error, handleError);

    return () => {
      socket.off(ServerEvent.LobbyUpdated, handleLobby);
      socket.off(ServerEvent.GameStarted, handleLobby);
      socket.off(ServerEvent.Error, handleError);
    };
  }, [setLobby, setPhase, notify]);
}
