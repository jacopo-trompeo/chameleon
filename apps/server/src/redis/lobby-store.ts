import { config } from "@/config";
import type { StoredLobby } from "@/game/state";
import { LobbyConflictError, LobbyNotFoundError } from "@/lib/errors";
import { storedLobbySchema } from "@/lib/validation";
import { redis } from "@/redis/client";

function lobbyKey(code: string): string {
  return `lobby:${code}`;
}

function readyKey(code: string): string {
  return `lobby:${code}:round:ready`;
}

const MARK_READY_SCRIPT = `
local added = redis.call('SADD', KEYS[1], ARGV[1])
redis.call('EXPIRE', KEYS[1], ARGV[3])
if added == 1 and redis.call('SCARD', KEYS[1]) == tonumber(ARGV[2]) then
  return 1
end
return 0
`;

function parseLobby(raw: string): StoredLobby {
  return storedLobbySchema.parse(JSON.parse(raw));
}

export async function getLobby(code: string): Promise<StoredLobby | null> {
  const raw = await redis.get(lobbyKey(code));
  if (raw === null) {
    return null;
  }

  return parseLobby(raw);
}

export async function setLobby(lobby: StoredLobby): Promise<void> {
  await redis.set(
    lobbyKey(lobby.code),
    JSON.stringify(lobby),
    "EX",
    config.lobby.ttlSeconds,
  );
}

export async function deleteLobby(code: string): Promise<void> {
  await redis.del(lobbyKey(code), readyKey(code));
}

export async function mutateLobby(
  code: string,
  mutator: (lobby: StoredLobby) => StoredLobby,
): Promise<StoredLobby> {
  const key = lobbyKey(code);

  for (let attempt = 0; attempt < config.lobby.maxMutateRetries; attempt++) {
    await redis.watch(key);

    const raw = await redis.get(key);
    if (raw === null) {
      await redis.unwatch();
      throw new LobbyNotFoundError(code);
    }

    let next: StoredLobby;
    try {
      next = mutator(parseLobby(raw));
    } catch (error) {
      await redis.unwatch();
      throw error;
    }

    const result = await redis
      .multi()
      .set(key, JSON.stringify(next), "EX", config.lobby.ttlSeconds)
      .exec();
    if (result !== null) {
      return next;
    }
  }
  throw new LobbyConflictError(code);
}

export async function markPlayerReady(
  code: string,
  playerId: string,
  expectedCount: number,
): Promise<boolean> {
  const result = await redis.eval(
    MARK_READY_SCRIPT,
    1,
    readyKey(code),
    playerId,
    expectedCount,
    config.lobby.ttlSeconds,
  );

  return result === 1;
}

export async function unmarkPlayerReady(
  code: string,
  playerId: string,
): Promise<void> {
  await redis.srem(readyKey(code), playerId);
}

export async function clearReadySet(code: string): Promise<void> {
  await redis.del(readyKey(code));
}
