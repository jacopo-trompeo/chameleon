import type { GamePhase, ResolutionVerdict } from "./events";

export type Player = {
  id: string;
  name: string;
  score: number;
  isReady: boolean;
};

export type LobbyState = {
  code: string;
  creatorId: string;
  targetScore: number;
  players: Player[];
  phase: GamePhase;
};

export type RoundState = {
  gameMasterId: string;
  impostorId: string;
  normalQuestion: string;
  impostorQuestion: string;
  answers: Record<string, string>;
  readyPlayerIds: string[];
};

export type RoundOutcome = {
  impostorFound: ResolutionVerdict;
  impostorId: string;
  scores: Record<string, number>;
};

export type JoinLobbyPayload = {
  lobbyCode: string;
  playerName: string;
  clientId: string;
};

export type SubmitQuestionsPayload = {
  normalQuestion: string;
  impostorQuestion: string;
};

export type RoundStartedPayload = {
  question: string;
  gameMasterId: string;
  impostorId?: string;
  leaderboard: Record<string, number>;
};
