import type {
  LobbyState,
  RoundOutcome,
  RoundState,
} from "@chameleon/types/game";

export type StoredLobby = LobbyState & {
  round: RoundState | null;
  disconnectedIds: string[];
  lastOutcome: RoundOutcome | null;
};

export function toLobbyState(lobby: StoredLobby): LobbyState {
  return {
    code: lobby.code,
    creatorId: lobby.creatorId,
    targetScore: lobby.targetScore,
    players: lobby.players,
    phase: lobby.phase,
  };
}

export function leaderboardOf(lobby: StoredLobby): Record<string, number> {
  const leaderboard: Record<string, number> = {};
  for (const player of lobby.players) {
    leaderboard[player.id] = player.score;
  }

  return leaderboard;
}
