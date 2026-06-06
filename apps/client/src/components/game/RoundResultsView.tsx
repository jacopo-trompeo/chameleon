import { ClientEvent } from "@chameleon/types/events";
import { RoundResult } from "@/components/game/RoundResult";
import { PlayerList } from "@/components/lobby/PlayerList";
import { Button } from "@/components/ui/button";
import { socket } from "@/socket/client";
import { useGameStore } from "@/store/game-store";
import { useLobbyStore } from "@/store/lobby-store";

interface RoundResultsViewProps {
  isGameMaster: boolean;
}

export function RoundResultsView(props: RoundResultsViewProps) {
  const { isGameMaster } = props;

  const outcome = useGameStore((state) => state.roundOutcome);
  const lobby = useLobbyStore((state) => state.lobby);
  const localPlayerId = useLobbyStore((state) => state.localPlayerId);

  function nextRound() {
    socket.emit(ClientEvent.NextRound);
  }

  return (
    <div className="flex flex-1 flex-col gap-6">
      <h1 className="font-display text-3xl sm:text-4xl">Round results</h1>
      {outcome !== null ? (
        <RoundResult outcome={outcome} players={lobby?.players ?? []} />
      ) : null}
      <PlayerList
        players={lobby?.players ?? []}
        creatorId={lobby?.creatorId ?? ""}
        localPlayerId={localPlayerId}
        showScores
      />
      {isGameMaster ? (
        <Button size="lg" className="mt-auto" onClick={nextRound}>
          Next round
        </Button>
      ) : (
        <p
          className="mt-auto text-center text-muted-foreground text-sm"
          aria-live="polite"
        >
          Waiting for the host to start the next round...
        </p>
      )}
    </div>
  );
}
