import { GamePhase, type ResolutionVerdict } from "@chameleon/types/events";
import { advanceRound } from "@/game/rotation";
import { beginAnswering, recordAnswer, transitionToReveal } from "@/game/round";
import { applyResolution } from "@/game/scoring";
import { InvalidPhaseError, NotAuthorizedError } from "@/lib/errors";
import {
  clearReadySet,
  getLobby,
  markPlayerReady,
  mutateLobby,
} from "@/redis/lobby-store";
import {
  broadcastGameOver,
  broadcastLobby,
  broadcastResolved,
  broadcastReveal,
  broadcastRoundStarted,
} from "@/socket/broadcast";
import type { AppServer } from "@/socket/types";

export async function submitQuestions(
  io: AppServer,
  lobbyCode: string,
  clientId: string,
  normalQuestion: string,
  impostorQuestion: string,
): Promise<void> {
  const lobby = await mutateLobby(lobbyCode, (current) => {
    if (current.phase !== GamePhase.QuestionInput) {
      throw new InvalidPhaseError("Questions are not being accepted now");
    }

    if (current.round === null || current.round.gameMasterId !== clientId) {
      throw new NotAuthorizedError("Only the game master can submit questions");
    }

    return beginAnswering(current, normalQuestion, impostorQuestion);
  });

  await clearReadySet(lobbyCode);

  broadcastRoundStarted(io, lobby);
  broadcastLobby(io, lobby);
}

export async function submitAnswer(
  io: AppServer,
  lobbyCode: string,
  clientId: string,
  answer: string,
): Promise<void> {
  const current = await getLobby(lobbyCode);
  if (
    current === null ||
    current.phase !== GamePhase.Answering ||
    current.round === null
  ) {
    return;
  }

  if (clientId === current.round.gameMasterId) {
    return;
  }

  const lobby = await mutateLobby(lobbyCode, (state) =>
    recordAnswer(state, clientId, answer),
  );

  const expectedAnswers = lobby.players.length - 1;
  const shouldReveal = await markPlayerReady(
    lobbyCode,
    clientId,
    expectedAnswers,
  );

  if (shouldReveal) {
    const revealed = await mutateLobby(lobbyCode, (state) =>
      transitionToReveal(state),
    );

    broadcastReveal(io, revealed);
    broadcastLobby(io, revealed);
  }
}

export async function resolveRound(
  io: AppServer,
  lobbyCode: string,
  clientId: string,
  verdict: ResolutionVerdict,
): Promise<void> {
  const lobby = await mutateLobby(lobbyCode, (current) => {
    if (current.phase !== GamePhase.Reveal) {
      throw new InvalidPhaseError("The round cannot be resolved yet");
    }

    if (current.round === null || current.round.gameMasterId !== clientId) {
      throw new NotAuthorizedError(
        "Only the game master can resolve the round",
      );
    }

    return applyResolution(current, verdict);
  });

  broadcastResolved(io, lobby);
  broadcastLobby(io, lobby);
}

export async function advanceToNextRound(
  io: AppServer,
  lobbyCode: string,
  clientId: string,
): Promise<void> {
  const lobby = await mutateLobby(lobbyCode, (current) => {
    if (current.phase !== GamePhase.Resolution) {
      throw new InvalidPhaseError("The round is not ready to advance");
    }

    if (current.round === null || current.round.gameMasterId !== clientId) {
      throw new NotAuthorizedError(
        "Only the game master can start the next round",
      );
    }

    return advanceRound(current);
  });

  await clearReadySet(lobbyCode);

  if (lobby.phase === GamePhase.GameOver) {
    broadcastGameOver(io, lobby);
  } else {
    broadcastRoundStarted(io, lobby);
  }

  broadcastLobby(io, lobby);
}
