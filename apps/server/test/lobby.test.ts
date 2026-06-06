import { describe, expect, test } from "bun:test";
import { GamePhase } from "@chameleon/types/events";
import {
  addPlayer,
  canStart,
  createLobby,
  returnToLobby,
  setPlayerReady,
  startGame,
} from "@/game/lobby";
import { makeLobby, makePlayer } from "./fixtures";

describe("createLobby", () => {
  test("starts empty in the lobby phase", () => {
    const lobby = createLobby("ABC234", 7);
    expect(lobby.players).toHaveLength(0);
    expect(lobby.creatorId).toBe("");
    expect(lobby.phase).toBe(GamePhase.Lobby);
    expect(lobby.targetScore).toBe(7);
    expect(lobby.round).toBeNull();
  });
});

describe("addPlayer", () => {
  test("first joiner becomes the creator", () => {
    const lobby = addPlayer(createLobby("ABC234", 5), "p1", "Alice");
    expect(lobby.creatorId).toBe("p1");
    expect(lobby.players).toHaveLength(1);
  });

  test("later joiners do not become creator", () => {
    const lobby = addPlayer(
      addPlayer(createLobby("ABC234", 5), "p1", "Alice"),
      "p2",
      "Bob",
    );
    expect(lobby.creatorId).toBe("p1");
    expect(lobby.players).toHaveLength(2);
  });

  test("is idempotent for a repeated id", () => {
    const once = addPlayer(createLobby("ABC234", 5), "p1", "Alice");
    const twice = addPlayer(once, "p1", "Alice");
    expect(twice.players).toHaveLength(1);
  });

  test("rejects joining a game in progress", () => {
    expect(() =>
      addPlayer(makeLobby({ phase: GamePhase.Answering }), "p5", "Eve"),
    ).toThrow();
  });
});

describe("setPlayerReady", () => {
  test("updates only the target player", () => {
    const lobby = setPlayerReady(
      makeLobby({
        players: [makePlayer("p1", 0, false), makePlayer("p2", 0, false)],
      }),
      "p1",
      true,
    );
    expect(lobby.players.find((p) => p.id === "p1")?.isReady).toBe(true);
    expect(lobby.players.find((p) => p.id === "p2")?.isReady).toBe(false);
  });
});

describe("canStart", () => {
  test("true for creator with at least four ready players", () => {
    expect(canStart(makeLobby(), "p1")).toBe(true);
  });

  test("false when the requester is not the creator", () => {
    expect(canStart(makeLobby(), "p2")).toBe(false);
  });

  test("false with fewer than four players", () => {
    const lobby = makeLobby({
      players: [makePlayer("p1"), makePlayer("p2"), makePlayer("p3")],
    });
    expect(canStart(lobby, "p1")).toBe(false);
  });

  test("false when a player is not ready", () => {
    const lobby = makeLobby({
      players: [
        makePlayer("p1"),
        makePlayer("p2", 0, false),
        makePlayer("p3"),
        makePlayer("p4"),
      ],
    });
    expect(canStart(lobby, "p1")).toBe(false);
  });
});

describe("startGame", () => {
  test("enters QuestionInput with the creator as game master", () => {
    const lobby = startGame(makeLobby());
    expect(lobby.phase).toBe(GamePhase.QuestionInput);
    expect(lobby.round?.gameMasterId).toBe("p1");
    expect(lobby.players.every((p) => p.score === 0)).toBe(true);
  });
});

describe("returnToLobby", () => {
  test("resets scores and readiness, clears round, prunes disconnected", () => {
    const lobby = returnToLobby(
      makeLobby({
        phase: GamePhase.GameOver,
        players: [
          makePlayer("p1", 5),
          makePlayer("p2", 2),
          makePlayer("p3", 1),
          makePlayer("p4", 0),
        ],
        disconnectedIds: ["p4"],
      }),
    );
    expect(lobby.phase).toBe(GamePhase.Lobby);
    expect(lobby.players).toHaveLength(3);
    expect(lobby.players.every((p) => p.score === 0 && !p.isReady)).toBe(true);
    expect(lobby.disconnectedIds).toHaveLength(0);
    expect(lobby.round).toBeNull();
  });
});
