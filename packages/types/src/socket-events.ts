import { ClientEvent, type ResolutionVerdict, ServerEvent } from "./events";
import type {
  JoinLobbyPayload,
  LobbyState,
  RoundOutcome,
  RoundStartedPayload,
  SubmitQuestionsPayload,
} from "./game";

export type ServerToClientEvents = {
  [ServerEvent.LobbyUpdated]: (lobby: LobbyState) => void;
  [ServerEvent.GameStarted]: (lobby: LobbyState) => void;
  [ServerEvent.RoundStarted]: (payload: RoundStartedPayload) => void;
  [ServerEvent.AllAnswersReady]: (answers: Record<string, string>) => void;
  [ServerEvent.RoundResolved]: (outcome: RoundOutcome) => void;
  [ServerEvent.GameOver]: (finalScores: Record<string, number>) => void;
  [ServerEvent.Error]: (message: string) => void;
};

export type ClientToServerEvents = {
  [ClientEvent.JoinLobby]: (payload: JoinLobbyPayload) => void;
  [ClientEvent.SetReady]: (isReady: boolean) => void;
  [ClientEvent.StartGame]: () => void;
  [ClientEvent.SubmitQuestions]: (payload: SubmitQuestionsPayload) => void;
  [ClientEvent.SubmitAnswer]: (answer: string) => void;
  [ClientEvent.ResolveRound]: (verdict: ResolutionVerdict) => void;
  [ClientEvent.NextRound]: () => void;
  [ClientEvent.ReturnToLobby]: () => void;
};
