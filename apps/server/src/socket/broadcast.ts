import { ServerEvent } from "@chameleon/types/events";
import { roundStartedPayloadFor } from "@/game/round";
import { leaderboardOf, type StoredLobby, toLobbyState } from "@/game/state";
import type { AppServer } from "@/socket/types";

export function broadcastLobby(io: AppServer, lobby: StoredLobby): void {
  io.to(lobby.code).emit(ServerEvent.LobbyUpdated, toLobbyState(lobby));
}

export function broadcastGameStarted(io: AppServer, lobby: StoredLobby): void {
  io.to(lobby.code).emit(ServerEvent.GameStarted, toLobbyState(lobby));
}

export function broadcastRoundStarted(io: AppServer, lobby: StoredLobby): void {
  for (const player of lobby.players) {
    io.to(player.id).emit(
      ServerEvent.RoundStarted,
      roundStartedPayloadFor(lobby, player.id),
    );
  }
}

export function emitRoundStartedTo(
  io: AppServer,
  lobby: StoredLobby,
  playerId: string,
): void {
  io.to(playerId).emit(
    ServerEvent.RoundStarted,
    roundStartedPayloadFor(lobby, playerId),
  );
}

export function broadcastReveal(io: AppServer, lobby: StoredLobby): void {
  const round = lobby.round;
  if (round === null) {
    return;
  }

  for (const player of lobby.players) {
    const ownAnswer = round.answers[player.id] ?? "";
    io.to(player.id).emit(ServerEvent.AllAnswersReady, {
      [player.id]: ownAnswer,
    });
  }
}

export function broadcastResolved(io: AppServer, lobby: StoredLobby): void {
  if (lobby.lastOutcome === null) {
    return;
  }

  io.to(lobby.code).emit(ServerEvent.RoundResolved, lobby.lastOutcome);
}

export function broadcastGameOver(io: AppServer, lobby: StoredLobby): void {
  io.to(lobby.code).emit(ServerEvent.GameOver, leaderboardOf(lobby));
}
