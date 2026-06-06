import { ClientEvent } from "@chameleon/types/events";
import { getClientId } from "@/lib/identity";
import { socket } from "@/socket/client";

export function joinLobby(lobbyCode: string, playerName: string): string {
  if (!socket.connected) {
    socket.connect();
  }

  const clientId = getClientId();
  socket.emit(ClientEvent.JoinLobby, { lobbyCode, playerName, clientId });

  return clientId;
}
