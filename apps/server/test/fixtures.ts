import { GamePhase } from "@chameleon/types/events";
import type { Player } from "@chameleon/types/game";
import type { StoredLobby } from "@/game/state";

export function makePlayer(id: string, score = 0, isReady = true): Player {
  return { id, name: id.toUpperCase(), score, isReady };
}

export function makeLobby(overrides: Partial<StoredLobby> = {}): StoredLobby {
  const base: StoredLobby = {
    code: "ABC234",
    creatorId: "p1",
    targetScore: 5,
    players: [
      makePlayer("p1"),
      makePlayer("p2"),
      makePlayer("p3"),
      makePlayer("p4"),
    ],
    phase: GamePhase.Lobby,
    round: null,
    disconnectedIds: [],
    lastOutcome: null,
  };

  return { ...base, ...overrides };
}
