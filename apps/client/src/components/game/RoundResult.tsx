import { ResolutionVerdict } from "@chameleon/types/events";
import type { Player, RoundOutcome } from "@chameleon/types/game";
import { Ghost, PartyPopper } from "lucide-react";

interface RoundResultProps {
  outcome: RoundOutcome;
  players: Player[];
}

export function RoundResult(props: RoundResultProps) {
  const { outcome, players } = props;

  const impostor = players.find((player) => player.id === outcome.impostorId);
  const Icon =
    outcome.impostorFound === ResolutionVerdict.Caught ? PartyPopper : Ghost;

  return (
    <div className="rounded-2xl border border-border bg-card p-5 text-center shadow-sm">
      <Icon className="mx-auto size-9 text-primary" aria-hidden="true" />
      <p className="mt-2 text-muted-foreground text-sm">The impostor was</p>
      <p className="font-display text-3xl">{impostor?.name ?? "-"}</p>
      <p className="mt-3 font-semibold text-primary">
        {outcome.impostorFound === ResolutionVerdict.Caught
          ? "Caught! Everyone else scores a point."
          : "They got away, the impostor scores a point."}
      </p>
    </div>
  );
}
