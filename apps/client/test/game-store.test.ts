import { describe, expect, test } from "bun:test";
import { GamePhase, ResolutionVerdict } from "@chameleon/types/events";
import { useGameStore } from "../src/store/game-store";

describe("game-store", () => {
  test("starts in the lobby phase with empty state", () => {
    const state = useGameStore.getState();

    expect(state.phase).toBe(GamePhase.Lobby);
    expect(state.gameMasterId).toBeNull();
    expect(state.myQuestion).toBeNull();
    expect(state.hasAnswered).toBe(false);
    expect(state.answers).toBeNull();
    expect(state.leaderboard).toEqual({});
    expect(state.impostorId).toBeNull();
    expect(state.roundOutcome).toBeNull();
  });

  test("setRoundStarted populates round state", () => {
    const { setRoundStarted } = useGameStore.getState();
    setRoundStarted({
      question: "What is your favourite colour?",
      gameMasterId: "p1",
      leaderboard: { p1: 2, p2: 1 },
      impostorId: "p3",
    });

    const state = useGameStore.getState();

    expect(state.gameMasterId).toBe("p1");
    expect(state.myQuestion).toBe("What is your favourite colour?");
    expect(state.leaderboard).toEqual({ p1: 2, p2: 1 });
    expect(state.impostorId).toBe("p3");
    expect(state.myAnswer).toBe("");
    expect(state.hasAnswered).toBe(false);
  });

  test("setRoundStarted treats missing impostorId as null", () => {
    const { setRoundStarted } = useGameStore.getState();
    setRoundStarted({
      question: "test",
      gameMasterId: "p1",
      leaderboard: {},
    });

    expect(useGameStore.getState().impostorId).toBeNull();
  });

  test("setMyAnswer updates the local answer", () => {
    const { setMyAnswer } = useGameStore.getState();
    setMyAnswer("blue");

    expect(useGameStore.getState().myAnswer).toBe("blue");
  });

  test("markAnswered sets hasAnswered to true", () => {
    const { markAnswered } = useGameStore.getState();
    markAnswered();

    expect(useGameStore.getState().hasAnswered).toBe(true);
  });

  test("setAllAnswersReady stores the answers map", () => {
    const { setAllAnswersReady } = useGameStore.getState();
    setAllAnswersReady({ p2: "red", p3: "green" });

    expect(useGameStore.getState().answers).toEqual({ p2: "red", p3: "green" });
  });

  test("setRoundResolved updates outcome and leaderboard", () => {
    const { setRoundResolved } = useGameStore.getState();
    setRoundResolved({
      impostorFound: ResolutionVerdict.Caught,
      impostorId: "p2",
      scores: { p1: 3, p2: 0, p3: 2, p4: 2 },
    });

    const state = useGameStore.getState();

    expect(state.roundOutcome?.impostorFound).toBe(ResolutionVerdict.Caught);
    expect(state.roundOutcome?.impostorId).toBe("p2");
    expect(state.leaderboard).toEqual({ p1: 3, p2: 0, p3: 2, p4: 2 });
  });

  test("setGameOver updates the final scores", () => {
    const { setGameOver } = useGameStore.getState();
    setGameOver({ p1: 5, p2: 2 });

    expect(useGameStore.getState().leaderboard).toEqual({ p1: 5, p2: 2 });
  });

  test("reset restores the initial state", () => {
    const { setPhase, setMyAnswer, markAnswered, reset } =
      useGameStore.getState();

    setPhase(GamePhase.Answering);
    setMyAnswer("foo");
    markAnswered();
    reset();

    const state = useGameStore.getState();

    expect(state.phase).toBe(GamePhase.Lobby);
    expect(state.myAnswer).toBe("");
    expect(state.hasAnswered).toBe(false);
    expect(state.gameMasterId).toBeNull();
  });
});
