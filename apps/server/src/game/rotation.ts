import { GamePhase } from "@chameleon/types/events";
import { createRound } from "@/game/round";
import type { StoredLobby } from "@/game/state";

export function nextConnectedPlayerId(
  lobby: StoredLobby,
  afterId: string,
): string {
  const count = lobby.players.length;
  if (count === 0) {
    return "";
  }

  const startIndex = lobby.players.findIndex((player) => player.id === afterId);

  for (let step = 1; step <= count; step++) {
    const candidate = lobby.players[(startIndex + step) % count];
    if (
      candidate !== undefined &&
      !lobby.disconnectedIds.includes(candidate.id)
    ) {
      return candidate.id;
    }
  }

  const firstConnected = lobby.players.find(
    (player) => !lobby.disconnectedIds.includes(player.id),
  );

  return firstConnected?.id ?? afterId;
}

export function removePlayer(
  lobby: StoredLobby,
  playerId: string,
): StoredLobby {
  const players = lobby.players.filter((player) => player.id !== playerId);
  const creatorId =
    playerId === lobby.creatorId ? (players[0]?.id ?? "") : lobby.creatorId;
  return { ...lobby, players, creatorId };
}

export function applyActiveDisconnect(
  lobby: StoredLobby,
  playerId: string,
): StoredLobby {
  let next: StoredLobby = lobby.disconnectedIds.includes(playerId)
    ? lobby
    : { ...lobby, disconnectedIds: [...lobby.disconnectedIds, playerId] };

  if (playerId === next.creatorId) {
    next = { ...next, creatorId: nextConnectedPlayerId(next, playerId) };
  }

  const round = next.round;
  if (round !== null) {
    let updatedRound = round;

    if (round.gameMasterId === playerId) {
      updatedRound = {
        ...updatedRound,
        gameMasterId: nextConnectedPlayerId(next, playerId),
      };
    }

    if (
      next.phase === GamePhase.Answering &&
      playerId !== updatedRound.gameMasterId
    ) {
      updatedRound = {
        ...updatedRound,
        answers: { ...updatedRound.answers, [playerId]: "" },
        readyPlayerIds: updatedRound.readyPlayerIds.includes(playerId)
          ? updatedRound.readyPlayerIds
          : [...updatedRound.readyPlayerIds, playerId],
      };
    }

    next = { ...next, round: updatedRound };
  }

  return next;
}

export function pruneDisconnected(lobby: StoredLobby): StoredLobby {
  if (lobby.disconnectedIds.length === 0) {
    return lobby;
  }

  const players = lobby.players.filter(
    (player) => !lobby.disconnectedIds.includes(player.id),
  );

  const creatorId = lobby.disconnectedIds.includes(lobby.creatorId)
    ? (players[0]?.id ?? "")
    : lobby.creatorId;

  return { ...lobby, players, creatorId, disconnectedIds: [] };
}

export function hasWinner(lobby: StoredLobby): boolean {
  return lobby.players.some((player) => player.score >= lobby.targetScore);
}

export function advanceRound(lobby: StoredLobby): StoredLobby {
  const round = lobby.round;
  if (round === null) {
    return lobby;
  }

  if (hasWinner(lobby)) {
    return { ...lobby, phase: GamePhase.GameOver, lastOutcome: null };
  }

  return {
    ...lobby,
    phase: GamePhase.QuestionInput,
    round: createRound(nextConnectedPlayerId(lobby, round.gameMasterId)),
    lastOutcome: null,
  };
}
