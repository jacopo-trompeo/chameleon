import { MIN_PLAYERS } from "@chameleon/types/constants";
import { GamePhase } from "@chameleon/types/events";
import type { Player } from "@chameleon/types/game";
import { pruneDisconnected } from "@/game/rotation";
import { createRound } from "@/game/round";
import type { StoredLobby } from "@/game/state";
import { InvalidPhaseError } from "@/lib/errors";

export function createLobby(code: string, targetScore: number): StoredLobby {
  return {
    code,
    creatorId: "",
    targetScore,
    players: [],
    phase: GamePhase.Lobby,
    round: null,
    disconnectedIds: [],
    lastOutcome: null,
  };
}

export function addPlayer(
  lobby: StoredLobby,
  id: string,
  name: string,
): StoredLobby {
  if (lobby.phase !== GamePhase.Lobby) {
    throw new InvalidPhaseError("Cannot join a game that is in progress");
  }

  if (lobby.players.some((player) => player.id === id)) {
    return lobby;
  }

  const player: Player = { id, name, score: 0, isReady: false };
  const creatorId = lobby.creatorId === "" ? id : lobby.creatorId;

  return { ...lobby, creatorId, players: [...lobby.players, player] };
}

export function setPlayerReady(
  lobby: StoredLobby,
  id: string,
  isReady: boolean,
): StoredLobby {
  return {
    ...lobby,
    players: lobby.players.map((player) =>
      player.id === id ? { ...player, isReady } : player,
    ),
  };
}

export function canStart(lobby: StoredLobby, requesterId: string): boolean {
  return (
    lobby.phase === GamePhase.Lobby &&
    requesterId === lobby.creatorId &&
    lobby.players.length >= MIN_PLAYERS &&
    lobby.players.every((player) => player.isReady)
  );
}

export function startGame(lobby: StoredLobby): StoredLobby {
  return {
    ...lobby,
    phase: GamePhase.QuestionInput,
    players: lobby.players.map((player) => ({ ...player, score: 0 })),
    round: createRound(lobby.creatorId),
    disconnectedIds: [],
    lastOutcome: null,
  };
}

export function returnToLobby(lobby: StoredLobby): StoredLobby {
  const pruned = pruneDisconnected(lobby);

  return {
    ...pruned,
    phase: GamePhase.Lobby,
    players: pruned.players.map((player) => ({
      ...player,
      score: 0,
      isReady: false,
    })),
    round: null,
    lastOutcome: null,
  };
}
