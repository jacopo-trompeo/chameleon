import { randomInt } from "node:crypto";
import { GamePhase } from "@chameleon/types/events";
import type { RoundStartedPayload, RoundState } from "@chameleon/types/game";
import { leaderboardOf, type StoredLobby } from "@/game/state";
import { InvalidPhaseError, ValidationError } from "@/lib/errors";

export function createRound(gameMasterId: string): RoundState {
  return {
    gameMasterId,
    impostorId: "",
    normalQuestion: "",
    impostorQuestion: "",
    answers: {},
    readyPlayerIds: [],
  };
}

export function getActiveRound(lobby: StoredLobby): RoundState {
  const round = lobby.round;
  if (round === null) {
    throw new InvalidPhaseError("No active round");
  }
  return round;
}

export function beginAnswering(
  lobby: StoredLobby,
  normalQuestion: string,
  impostorQuestion: string,
): StoredLobby {
  const round = getActiveRound(lobby);

  const candidates = lobby.players.filter(
    (player) =>
      player.id !== round.gameMasterId &&
      !lobby.disconnectedIds.includes(player.id),
  );
  const impostor = candidates[randomInt(Math.max(candidates.length, 1))];

  if (candidates.length === 0 || impostor === undefined) {
    throw new ValidationError("No eligible impostor candidates");
  }

  return {
    ...lobby,
    phase: GamePhase.Answering,
    round: {
      ...round,
      impostorId: impostor.id,
      normalQuestion,
      impostorQuestion,
      answers: {},
      readyPlayerIds: [],
    },
  };
}

export function questionForPlayer(round: RoundState, playerId: string): string {
  return playerId === round.impostorId
    ? round.impostorQuestion
    : round.normalQuestion;
}

export function roundStartedPayloadFor(
  lobby: StoredLobby,
  playerId: string,
): RoundStartedPayload {
  const round = getActiveRound(lobby);

  const isGameMaster = playerId === round.gameMasterId;
  const payload: RoundStartedPayload = {
    question: isGameMaster ? "" : questionForPlayer(round, playerId),
    gameMasterId: round.gameMasterId,
    leaderboard: leaderboardOf(lobby),
  };

  if (isGameMaster && round.impostorId !== "") {
    payload.impostorId = round.impostorId;
  }

  return payload;
}

export function recordAnswer(
  lobby: StoredLobby,
  playerId: string,
  answer: string,
): StoredLobby {
  const round = getActiveRound(lobby);

  return {
    ...lobby,
    round: {
      ...round,
      answers: { ...round.answers, [playerId]: answer },
      readyPlayerIds: round.readyPlayerIds.includes(playerId)
        ? round.readyPlayerIds
        : [...round.readyPlayerIds, playerId],
    },
  };
}

export function transitionToReveal(lobby: StoredLobby): StoredLobby {
  return { ...lobby, phase: GamePhase.Reveal };
}
