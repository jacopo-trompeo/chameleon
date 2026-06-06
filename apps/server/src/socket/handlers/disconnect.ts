import { GamePhase } from "@chameleon/types/events";
import { applyActiveDisconnect, removePlayer } from "@/game/rotation";
import { transitionToReveal } from "@/game/round";
import {
  deleteLobby,
  getLobby,
  markPlayerReady,
  mutateLobby,
  unmarkPlayerReady,
} from "@/redis/lobby-store";
import {
  broadcastLobby,
  broadcastReveal,
  emitRoundStartedTo,
} from "@/socket/broadcast";
import { emitError } from "@/socket/emit-error";
import type { AppServer, AppSocket } from "@/socket/types";

export function registerDisconnectHandler(
  io: AppServer,
  socket: AppSocket,
): void {
  socket.on("disconnect", async () => {
    const currentCode = socket.data.lobbyCode;
    const playerId = socket.data.clientId;

    if (currentCode === undefined || playerId === undefined) {
      return;
    }

    try {
      const lobby = await getLobby(currentCode);
      if (lobby === null) {
        return;
      }

      if (lobby.phase === GamePhase.Lobby) {
        const updated = await mutateLobby(currentCode, (current) =>
          removePlayer(current, playerId),
        );

        if (updated.players.length === 0) {
          await deleteLobby(currentCode);
          return;
        }

        broadcastLobby(io, updated);
        return;
      }

      const wasGameMaster = lobby.round?.gameMasterId === playerId;
      const updated = await mutateLobby(currentCode, (current) =>
        applyActiveDisconnect(current, playerId),
      );

      const round = updated.round;
      if (round === null) {
        broadcastLobby(io, updated);
        return;
      }

      if (wasGameMaster) {
        emitRoundStartedTo(io, updated, round.gameMasterId);
      }

      if (updated.phase === GamePhase.Answering) {
        if (wasGameMaster) {
          await unmarkPlayerReady(currentCode, round.gameMasterId);
        }

        const expectedAnswers = updated.players.length - 1;
        const shouldReveal = await markPlayerReady(
          currentCode,
          playerId,
          expectedAnswers,
        );

        if (shouldReveal) {
          const revealed = await mutateLobby(currentCode, (current) =>
            transitionToReveal(current),
          );

          broadcastReveal(io, revealed);
          broadcastLobby(io, revealed);

          return;
        }
      }

      broadcastLobby(io, updated);
    } catch (error) {
      emitError(socket, error);
    }
  });
}
