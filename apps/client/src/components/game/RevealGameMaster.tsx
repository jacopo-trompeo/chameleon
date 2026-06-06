import { ClientEvent, ResolutionVerdict } from "@chameleon/types/events";
import { ImpostorCard } from "@/components/game/ImpostorCard";
import { Button } from "@/components/ui/button";
import { socket } from "@/socket/client";
import { useGameStore } from "@/store/game-store";
import { useLobbyStore } from "@/store/lobby-store";

export function RevealGameMaster() {
  const impostorId = useGameStore((state) => state.impostorId);
  const players = useLobbyStore((state) => state.lobby?.players) ?? [];
  const impostor = players.find((player) => player.id === impostorId);

  return (
    <div className="flex flex-1 flex-col gap-6">
      <header>
        <h1 className="font-display text-3xl sm:text-4xl">Time to decide</h1>
        <p className="mt-2 text-muted-foreground">
          Everyone has answered. Talk it out, then call it.
        </p>
      </header>
      <ImpostorCard name={impostor?.name ?? "--"} label="The impostor was" />
      <div className="mt-auto flex flex-col gap-3">
        <Button
          size="lg"
          onClick={() =>
            socket.emit(ClientEvent.ResolveRound, ResolutionVerdict.Caught)
          }
        >
          The impostor was caught
        </Button>
        <Button
          size="lg"
          variant="outline"
          onClick={() =>
            socket.emit(ClientEvent.ResolveRound, ResolutionVerdict.Fooled)
          }
        >
          The impostor was not caught
        </Button>
      </div>
    </div>
  );
}
