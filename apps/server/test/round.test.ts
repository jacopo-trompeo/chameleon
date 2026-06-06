import { describe, expect, test } from "bun:test";
import { GamePhase } from "@chameleon/types/events";
import {
  beginAnswering,
  createRound,
  questionForPlayer,
  recordAnswer,
  roundStartedPayloadFor,
  transitionToReveal,
} from "@/game/round";
import { makeLobby } from "./fixtures";

const questionInput = () =>
  makeLobby({ phase: GamePhase.QuestionInput, round: createRound("p1") });

describe("beginAnswering", () => {
  test("always selects a connected non-game-master as impostor", () => {
    const base = questionInput();
    for (let i = 0; i < 50; i++) {
      const answering = beginAnswering(base, "normal", "impostor");
      expect(answering.phase).toBe(GamePhase.Answering);
      expect(answering.round?.gameMasterId).toBe("p1");
      expect(["p2", "p3", "p4"]).toContain(answering.round?.impostorId ?? "");
    }
  });

  test("excludes disconnected players from impostor selection", () => {
    const base = makeLobby({
      phase: GamePhase.QuestionInput,
      round: createRound("p1"),
      disconnectedIds: ["p2", "p3"],
    });
    for (let i = 0; i < 20; i++) {
      expect(beginAnswering(base, "n", "i").round?.impostorId).toBe("p4");
    }
  });
});

describe("questionForPlayer", () => {
  test("gives the impostor question only to the impostor", () => {
    const round = {
      ...createRound("p1"),
      impostorId: "p3",
      normalQuestion: "normal",
      impostorQuestion: "impostor",
    };
    expect(questionForPlayer(round, "p3")).toBe("impostor");
    expect(questionForPlayer(round, "p2")).toBe("normal");
  });
});

describe("roundStartedPayloadFor", () => {
  test("game master gets no question and the impostor id", () => {
    const lobby = beginAnswering(questionInput(), "normal", "impostor");
    const payload = roundStartedPayloadFor(lobby, "p1");
    expect(payload.question).toBe("");
    expect(payload.gameMasterId).toBe("p1");
    expect(typeof payload.impostorId).toBe("string");
  });

  test("other players get their question and never the impostor id", () => {
    const lobby = beginAnswering(questionInput(), "normal", "impostor");
    const impostorId = lobby.round?.impostorId;
    for (const id of ["p2", "p3", "p4"]) {
      const payload = roundStartedPayloadFor(lobby, id);
      expect(payload.impostorId).toBeUndefined();
      expect(payload.question).toBe(id === impostorId ? "impostor" : "normal");
    }
  });
});

describe("recordAnswer", () => {
  test("stores the answer and marks the player ready once", () => {
    const lobby = beginAnswering(questionInput(), "normal", "impostor");
    const once = recordAnswer(lobby, "p2", "blue");
    const twice = recordAnswer(once, "p2", "blue");
    expect(once.round?.answers.p2).toBe("blue");
    expect(twice.round?.readyPlayerIds).toEqual(["p2"]);
  });
});

describe("transitionToReveal", () => {
  test("moves the lobby into the reveal phase", () => {
    const lobby = beginAnswering(questionInput(), "normal", "impostor");
    expect(transitionToReveal(lobby).phase).toBe(GamePhase.Reveal);
  });
});
