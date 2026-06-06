import { describe, expect, test } from "bun:test";
import { GamePhase, ResolutionVerdict } from "@chameleon/types/events";
import { createRound } from "@/game/round";
import { applyResolution, buildOutcome } from "@/game/scoring";
import { makeLobby } from "./fixtures";

const revealLobby = () =>
  makeLobby({
    phase: GamePhase.Reveal,
    round: { ...createRound("p1"), impostorId: "p2" },
  });

describe("applyResolution", () => {
  test("when found, every non-master non-impostor scores", () => {
    const lobby = applyResolution(revealLobby(), ResolutionVerdict.Caught);
    const score = (id: string) => lobby.players.find((p) => p.id === id)?.score;
    expect(score("p1")).toBe(0);
    expect(score("p2")).toBe(0);
    expect(score("p3")).toBe(1);
    expect(score("p4")).toBe(1);
    expect(lobby.phase).toBe(GamePhase.Resolution);
  });

  test("when not found, only the impostor scores", () => {
    const lobby = applyResolution(revealLobby(), ResolutionVerdict.Fooled);
    const score = (id: string) => lobby.players.find((p) => p.id === id)?.score;
    expect(score("p2")).toBe(1);
    expect(score("p1")).toBe(0);
    expect(score("p3")).toBe(0);
    expect(score("p4")).toBe(0);
  });

  test("records the outcome for broadcasting", () => {
    const lobby = applyResolution(revealLobby(), ResolutionVerdict.Caught);
    expect(lobby.lastOutcome?.impostorFound).toBe(ResolutionVerdict.Caught);
    expect(lobby.lastOutcome?.impostorId).toBe("p2");
  });
});

describe("buildOutcome", () => {
  test("reports the impostor, the flag and the scoreboard", () => {
    const outcome = buildOutcome(
      applyResolution(revealLobby(), ResolutionVerdict.Caught),
      ResolutionVerdict.Caught,
    );
    expect(outcome.impostorFound).toBe(ResolutionVerdict.Caught);
    expect(outcome.impostorId).toBe("p2");
    expect(outcome.scores).toEqual({ p1: 0, p2: 0, p3: 1, p4: 1 });
  });
});
