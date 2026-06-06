import type { Player } from "@chameleon/types/game";
import { useGameStore } from "@/store/game-store";
import { useLobbyStore } from "@/store/lobby-store";

export function useGameMaster(): Player | null {
  const gameMasterId = useGameStore((state) => state.gameMasterId);
  const players = useLobbyStore((state) => state.lobby?.players);

  if (players === undefined) {
    return null;
  }

  return players.find((player) => player.id === gameMasterId) ?? null;
}
