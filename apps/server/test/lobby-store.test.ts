import { afterEach, describe, expect, mock, test } from "bun:test";
import { GamePhase } from "@chameleon/types/events";

const mockChain = {
  set: mock(() => mockChain),
  exec: mock(),
};

const mockRedis = {
  get: mock(),
  set: mock(),
  del: mock(),
  watch: mock(),
  unwatch: mock(),
  multi: mock(() => mockChain),
  eval: mock(),
  srem: mock(),
  on: mock(),
};

mock.module("@/redis/client", () => ({
  redis: mockRedis,
}));

mock.module("@/config", () => ({
  config: {
    lobby: { ttlSeconds: 3600, maxMutateRetries: 4 },
    port: 3001,
    corsOrigin: "http://localhost:5173",
    redisUrl: "redis://localhost:6379",
    logLevel: "info",
    socket: { path: "/socket.io/", idleTimeoutSeconds: 30 },
  },
}));

import { LobbyConflictError, LobbyNotFoundError } from "@/lib/errors";
import { makeLobby } from "./fixtures";

const { setLobby, getLobby, deleteLobby, mutateLobby, clearReadySet } =
  await import("@/redis/lobby-store");

afterEach(() => {
  mockRedis.get.mockReset();
  mockRedis.set.mockReset();
  mockRedis.del.mockReset();
  mockRedis.watch.mockReset();
  mockRedis.unwatch.mockReset();
  mockChain.exec.mockReset();
  mockRedis.eval.mockReset();
  mockRedis.srem.mockReset();
});

describe("getLobby", () => {
  test("returns null when the key is missing", async () => {
    mockRedis.get.mockResolvedValue(null);
    expect(await getLobby("ABC234")).toBeNull();
  });

  test("parses and validates stored JSON", async () => {
    const lobby = makeLobby();
    mockRedis.get.mockResolvedValue(JSON.stringify(lobby));
    const result = await getLobby("ABC234");
    expect(result?.code).toBe("ABC234");
    expect(result?.phase).toBe(GamePhase.Lobby);
  });

  test("throws on malformed JSON", async () => {
    mockRedis.get.mockResolvedValue("not valid json");
    expect(getLobby("ABC234")).rejects.toThrow();
  });

  test("throws on data that does not match the schema", async () => {
    mockRedis.get.mockResolvedValue(JSON.stringify({ code: 123 }));
    expect(getLobby("ABC234")).rejects.toThrow();
  });
});

describe("setLobby", () => {
  test("persists the lobby with a TTL", async () => {
    const lobby = makeLobby();
    await setLobby(lobby);
    expect(mockRedis.set).toHaveBeenCalled();
    const calls = mockRedis.set.mock.calls;
    expect(calls).toBeDefined();
    const [key, value, option, ttl] = calls[0] as [
      string,
      string,
      string,
      number,
    ];
    expect(key).toBe("lobby:ABC234");
    expect(JSON.parse(value).code).toBe("ABC234");
    expect(option).toBe("EX");
    expect(ttl).toBe(3600);
  });
});

describe("deleteLobby", () => {
  test("removes both the lobby key and ready set", async () => {
    await deleteLobby("ABC234");
    expect(mockRedis.del).toHaveBeenCalledWith(
      "lobby:ABC234",
      "lobby:ABC234:round:ready",
    );
  });
});

describe("mutateLobby", () => {
  test("applies a mutation and persists the result", async () => {
    const lobby = makeLobby();
    mockRedis.get.mockResolvedValue(JSON.stringify(lobby));
    mockChain.exec.mockResolvedValue([null, "OK"]);

    const result = await mutateLobby("ABC234", (current) => ({
      ...current,
      targetScore: 10,
    }));

    expect(result.targetScore).toBe(10);
    expect(mockRedis.watch).toHaveBeenCalledWith("lobby:ABC234");
  });

  test("throws LobbyNotFoundError when the key is missing", async () => {
    mockRedis.get.mockResolvedValue(null);
    expect(mutateLobby("ABC234", (current) => current)).rejects.toThrow(
      LobbyNotFoundError,
    );
  });

  test("retries on optimistic lock failure", async () => {
    const lobby = makeLobby();
    mockRedis.get.mockResolvedValue(JSON.stringify(lobby));
    mockChain.exec
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce([null, "OK"]);

    const result = await mutateLobby("ABC234", (current) => current);

    expect(result.code).toBe("ABC234");
    expect(mockChain.exec).toHaveBeenCalledTimes(2);
  });

  test("throws LobbyConflictError after max retries", async () => {
    const lobby = makeLobby();
    mockRedis.get.mockResolvedValue(JSON.stringify(lobby));
    mockChain.exec.mockResolvedValue(null);

    expect(mutateLobby("ABC234", (current) => current)).rejects.toThrow(
      LobbyConflictError,
    );
  });
});

describe("clearReadySet", () => {
  test("deletes the ready set key", async () => {
    await clearReadySet("ABC234");
    expect(mockRedis.del).toHaveBeenCalledWith("lobby:ABC234:round:ready");
  });
});
