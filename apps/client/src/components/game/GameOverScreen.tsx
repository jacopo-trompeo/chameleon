import { ClientEvent } from "@chameleon/types/events";
import { useReducedMotion } from "framer-motion";
import { useEffect } from "react";
import { PlayerList } from "@/components/lobby/PlayerList";
import { Button } from "@/components/ui/button";
import { useLeaderboard } from "@/hooks/useLeaderboard";
import { fireConfetti } from "@/lib/confetti";
import { socket } from "@/socket/client";
import { useGameStore } from "@/store/game-store";
import { useLobbyStore } from "@/store/lobby-store";

export function GameOverScreen() {
  const leaderboard = useGameStore((state) => state.leaderboard);
  const lobby = useLobbyStore((state) => state.lobby);
  const localPlayerId = useLobbyStore((state) => state.localPlayerId);
  const players = lobby?.players ?? [];

  const { sortedPlayers, localIsWinner, winnerLabel } = useLeaderboard(
    players,
    leaderboard,
    localPlayerId,
  );
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    if (!localIsWinner || shouldReduceMotion) {
      return;
    }

    const controller = new AbortController();
    void fireConfetti(controller.signal);
    return () => {
      controller.abort();
    };
  }, [localIsWinner, shouldReduceMotion]);

  function backToLobby() {
    socket.emit(ClientEvent.ReturnToLobby);
  }

  return (
    <div className="flex flex-1 flex-col gap-6">
      <header className="text-center">
        <h1 className="font-display text-4xl sm:text-5xl">Game over</h1>
        <p className="mt-2 text-lg" aria-live="polite">
          {localIsWinner ? "You win! 🎉" : `${winnerLabel} wins!`}
        </p>
      </header>
      <PlayerList
        players={sortedPlayers}
        creatorId={lobby?.creatorId ?? ""}
        localPlayerId={localPlayerId}
        showScores
      />
      <Button size="lg" className="mt-auto" onClick={backToLobby}>
        Back to lobby
      </Button>
    </div>
  );
}
