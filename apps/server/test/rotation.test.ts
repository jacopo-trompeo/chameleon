import { describe, expect, test } from "bun:test";
import { GamePhase } from "@chameleon/types/events";
import {
  advanceRound,
  applyActiveDisconnect,
  hasWinner,
  nextConnectedPlayerId,
  pruneDisconnected,
  removePlayer,
} from "@/game/rotation";
import { createRound } from "@/game/round";
import { makeLobby, makePlayer } from "./fixtures";

describe("nextConnectedPlayerId", () => {
  test("returns the next player in join order, wrapping around", () => {
    expect(nextConnectedPlayerId(makeLobby(), "p1")).toBe("p2");
    expect(nextConnectedPlayerId(makeLobby(), "p4")).toBe("p1");
  });

  test("skips disconnected players", () => {
    expect(
      nextConnectedPlayerId(makeLobby({ disconnectedIds: ["p2", "p3"] }), "p1"),
    ).toBe("p4");
  });
});

describe("removePlayer", () => {
  test("removes the player and transfers creator when needed", () => {
    const lobby = removePlayer(makeLobby(), "p1");
    expect(lobby.players).toHaveLength(3);
    expect(lobby.creatorId).toBe("p2");
  });
});

describe("applyActiveDisconnect", () => {
  test("promotes a new game master and transfers creator", () => {
    const lobby = applyActiveDisconnect(
      makeLobby({ phase: GamePhase.QuestionInput, round: createRound("p1") }),
      "p1",
    );
    expect(lobby.disconnectedIds).toContain("p1");
    expect(lobby.creatorId).toBe("p2");
    expect(lobby.round?.gameMasterId).toBe("p2");
  });

  test("during answering, marks the leaver empty and ready", () => {
    const lobby = applyActiveDisconnect(
      makeLobby({
        phase: GamePhase.Answering,
        round: { ...createRound("p1"), impostorId: "p2" },
      }),
      "p3",
    );
    expect(lobby.round?.answers.p3).toBe("");
    expect(lobby.round?.readyPlayerIds).toContain("p3");
  });
});

describe("pruneDisconnected", () => {
  test("drops disconnected players and clears the marker", () => {
    const lobby = pruneDisconnected(
      makeLobby({ disconnectedIds: ["p1", "p3"] }),
    );
    expect(lobby.players.map((p) => p.id)).toEqual(["p2", "p4"]);
    expect(lobby.creatorId).toBe("p2");
    expect(lobby.disconnectedIds).toHaveLength(0);
  });
});

describe("win detection", () => {
  test("hasWinner is true once a score reaches the target", () => {
    expect(hasWinner(makeLobby({ targetScore: 3 }))).toBe(false);
    expect(
      hasWinner(makeLobby({ targetScore: 3, players: [makePlayer("p1", 3)] })),
    ).toBe(true);
  });
});

describe("advanceRound", () => {
  test("ends the game when the target is reached", () => {
    const lobby = advanceRound(
      makeLobby({
        phase: GamePhase.Resolution,
        round: createRound("p1"),
        targetScore: 3,
        players: [
          makePlayer("p1", 3),
          makePlayer("p2"),
          makePlayer("p3"),
          makePlayer("p4"),
        ],
      }),
    );
    expect(lobby.phase).toBe(GamePhase.GameOver);
  });

  test("otherwise rotates the game master into a fresh question phase", () => {
    const lobby = advanceRound(
      makeLobby({ phase: GamePhase.Resolution, round: createRound("p1") }),
    );
    expect(lobby.phase).toBe(GamePhase.QuestionInput);
    expect(lobby.round?.gameMasterId).toBe("p2");
    expect(lobby.round?.impostorId).toBe("");
  });
});
