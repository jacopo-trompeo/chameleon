import { ImpostorCard } from "@/components/game/ImpostorCard";
import { PlayerList } from "@/components/lobby/PlayerList";
import { useGameStore } from "@/store/game-store";
import { useLobbyStore } from "@/store/lobby-store";

export function GameMasterView() {
  const impostorId = useGameStore((state) => state.impostorId);
  const lobby = useLobbyStore((state) => state.lobby);
  const localPlayerId = useLobbyStore((state) => state.localPlayerId);
  const players = lobby?.players ?? [];
  const impostor = players.find((player) => player.id === impostorId);

  return (
    <div className="flex flex-1 flex-col gap-6">
      <header>
        <h1 className="font-display text-3xl sm:text-4xl">
          Players are answering
        </h1>
        <p className="mt-2 text-muted-foreground" aria-live="polite">
          Sit tight while everyone writes their answer.
        </p>
      </header>
      <ImpostorCard
        name={impostor?.name ?? "--"}
        label="The impostor this round is"
      />
      <div className="flex flex-col gap-2">
        <h2 className="font-medium text-muted-foreground text-sm">Scores</h2>
        <PlayerList
          players={players}
          creatorId={lobby?.creatorId ?? ""}
          localPlayerId={localPlayerId}
          showScores
        />
      </div>
    </div>
  );
}
