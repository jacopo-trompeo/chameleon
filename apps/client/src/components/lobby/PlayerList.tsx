import type { Player } from "@chameleon/types/game";
import { PlayerListItem } from "@/components/lobby/PlayerListItem";

interface PlayerListProps {
  players: Player[];
  creatorId: string;
  localPlayerId: string | null;
  showScores?: boolean;
}

export function PlayerList(props: PlayerListProps) {
  const { players, creatorId, localPlayerId, showScores = false } = props;

  return (
    <ul className="flex flex-col gap-2">
      {players.map((player) => (
        <PlayerListItem
          key={player.id}
          player={player}
          isCreator={player.id === creatorId}
          isLocal={player.id === localPlayerId}
          showScore={showScores}
        />
      ))}
    </ul>
  );
}
