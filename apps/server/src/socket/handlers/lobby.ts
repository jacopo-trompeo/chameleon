import { ClientEvent, ServerEvent } from "@chameleon/types/events";
import { booleanSchema, joinLobbySchema } from "@/lib/validation";
import {
  beginGame,
  goToLobby,
  joinLobby,
  toggleReady,
} from "@/services/lobby-service";
import { emitError } from "@/socket/emit-error";
import type { AppServer, AppSocket } from "@/socket/types";

export function registerLobbyHandlers(io: AppServer, socket: AppSocket): void {
  socket.on(ClientEvent.JoinLobby, async (payload) => {
    const parsed = joinLobbySchema.safeParse(payload);
    if (!parsed.success) {
      socket.emit(ServerEvent.Error, "Invalid join request");
      return;
    }

    const { lobbyCode, playerName, clientId } = parsed.data;
    try {
      await joinLobby(io, socket, lobbyCode, clientId, playerName);
    } catch (error) {
      emitError(socket, error);
    }
  });

  socket.on(ClientEvent.SetReady, async (isReady) => {
    const currentCode = socket.data.lobbyCode;
    const clientId = socket.data.clientId;

    if (
      currentCode === undefined ||
      clientId === undefined ||
      !booleanSchema.safeParse(isReady).success
    ) {
      return;
    }

    try {
      await toggleReady(io, currentCode, clientId, isReady);
    } catch (error) {
      emitError(socket, error);
    }
  });

  socket.on(ClientEvent.StartGame, async () => {
    const currentCode = socket.data.lobbyCode;
    const clientId = socket.data.clientId;

    if (currentCode === undefined || clientId === undefined) {
      return;
    }

    try {
      await beginGame(io, currentCode, clientId);
    } catch (error) {
      emitError(socket, error);
    }
  });

  socket.on(ClientEvent.ReturnToLobby, async () => {
    const currentCode = socket.data.lobbyCode;
    if (currentCode === undefined) {
      return;
    }

    try {
      await goToLobby(io, currentCode);
    } catch (error) {
      emitError(socket, error);
    }
  });
}
