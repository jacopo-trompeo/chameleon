import { GamePhase, ResolutionVerdict } from "@chameleon/types/events";
import type { RoundOutcome } from "@chameleon/types/game";
import { getActiveRound } from "@/game/round";
import { leaderboardOf, type StoredLobby } from "@/game/state";

export function applyResolution(
  lobby: StoredLobby,
  verdict: ResolutionVerdict,
): StoredLobby {
  const round = getActiveRound(lobby);

  const { impostorId, gameMasterId } = round;

  const players = lobby.players.map((player) => {
    if (verdict === ResolutionVerdict.Caught) {
      const earnsPoint = player.id !== gameMasterId && player.id !== impostorId;
      return earnsPoint ? { ...player, score: player.score + 1 } : player;
    }
    return player.id === impostorId
      ? { ...player, score: player.score + 1 }
      : player;
  });

  const resolved: StoredLobby = {
    ...lobby,
    players,
    phase: GamePhase.Resolution,
  };
  return { ...resolved, lastOutcome: buildOutcome(resolved, verdict) };
}

export function buildOutcome(
  lobby: StoredLobby,
  verdict: ResolutionVerdict,
): RoundOutcome {
  return {
    impostorFound: verdict,
    impostorId: lobby.round?.impostorId ?? "",
    scores: leaderboardOf(lobby),
  };
}
