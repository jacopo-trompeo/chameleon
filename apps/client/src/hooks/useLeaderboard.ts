import type { Player } from "@chameleon/types/game";

interface LeaderboardResult {
  sortedPlayers: Player[];
  topScore: number;
  winners: Player[];
  localIsWinner: boolean;
  winnerLabel: string;
}

export function useLeaderboard(
  players: Player[],
  leaderboard: Record<string, number>,
  localPlayerId: string | null,
): LeaderboardResult {
  const sortedPlayers = [...players].sort(
    (a, b) => (leaderboard[b.id] ?? 0) - (leaderboard[a.id] ?? 0),
  );

  const topScore = sortedPlayers.reduce(
    (max, player) => Math.max(max, leaderboard[player.id] ?? 0),
    0,
  );

  const winners = sortedPlayers.filter(
    (player) => (leaderboard[player.id] ?? 0) === topScore,
  );

  const localIsWinner =
    localPlayerId !== null &&
    topScore > 0 &&
    (leaderboard[localPlayerId] ?? 0) === topScore;

  const winnerLabel = winners.map((player) => player.name).join(" & ");

  return { sortedPlayers, topScore, winners, localIsWinner, winnerLabel };
}
