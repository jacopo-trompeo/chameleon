import type { Player } from "@chameleon/types/game";
import { Check, Crown } from "lucide-react";

interface PlayerListItemProps {
  player: Player;
  isCreator: boolean;
  isLocal: boolean;
  showScore?: boolean;
}

export function PlayerListItem(props: PlayerListItemProps) {
  const { player, isCreator, isLocal, showScore = false } = props;

  return (
    <li className="flex items-center justify-between rounded-2xl border border-border bg-muted px-4 py-3">
      <span className="flex items-center gap-2 font-medium">
        <span>{player.name}</span>
        {isCreator ? (
          <Crown className="size-4 text-primary" role="img" aria-label="Host" />
        ) : null}
        {isLocal ? (
          <span className="text-muted-foreground text-xs">(you)</span>
        ) : null}
      </span>
      {showScore ? (
        <span className="font-display text-lg tabular-nums">
          {player.score}
        </span>
      ) : player.isReady ? (
        <span className="flex items-center gap-1 font-medium text-primary text-sm">
          <Check className="size-4" aria-hidden="true" />
          Ready
        </span>
      ) : (
        <span className="text-muted-foreground text-sm">Not ready</span>
      )}
    </li>
  );
}
