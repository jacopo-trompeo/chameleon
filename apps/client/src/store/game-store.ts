import { GamePhase } from "@chameleon/types/events";
import type { RoundOutcome, RoundStartedPayload } from "@chameleon/types/game";
import { create } from "zustand";

type GameStoreData = {
  phase: GamePhase;
  gameMasterId: string | null;
  myQuestion: string | null;
  myAnswer: string;
  hasAnswered: boolean;
  answers: Record<string, string> | null;
  leaderboard: Record<string, number>;
  impostorId: string | null;
  roundOutcome: RoundOutcome | null;
};

type GameStoreActions = {
  setPhase: (phase: GamePhase) => void;
  setRoundStarted: (payload: RoundStartedPayload) => void;
  setMyAnswer: (answer: string) => void;
  markAnswered: () => void;
  setAllAnswersReady: (answers: Record<string, string>) => void;
  setRoundResolved: (outcome: RoundOutcome) => void;
  setGameOver: (finalScores: Record<string, number>) => void;
  reset: () => void;
};

type GameStore = GameStoreData & GameStoreActions;

const initialState: GameStoreData = {
  phase: GamePhase.Lobby,
  gameMasterId: null,
  myQuestion: null,
  myAnswer: "",
  hasAnswered: false,
  answers: null,
  leaderboard: {},
  impostorId: null,
  roundOutcome: null,
};

export const useGameStore = create<GameStore>((set) => ({
  ...initialState,
  setPhase(phase) {
    set({ phase });
  },
  setRoundStarted(payload) {
    set({
      gameMasterId: payload.gameMasterId,
      myQuestion: payload.question,
      myAnswer: "",
      hasAnswered: false,
      answers: null,
      leaderboard: payload.leaderboard,
      impostorId: payload.impostorId ?? null,
    });
  },
  setMyAnswer(myAnswer) {
    set({ myAnswer });
  },
  markAnswered() {
    set({ hasAnswered: true });
  },
  setAllAnswersReady(answers) {
    set({ answers });
  },
  setRoundResolved(roundOutcome) {
    set({ roundOutcome, leaderboard: roundOutcome.scores });
  },
  setGameOver(finalScores) {
    set({ leaderboard: finalScores });
  },
  reset() {
    set({ ...initialState });
  },
}));
