import { CenteredMessage } from "@/components/ui/centered-message";
import { useGameMaster } from "@/hooks/useGameMaster";

export function WaitingForGameMaster() {
  const gameMaster = useGameMaster();

  return (
    <CenteredMessage
      title="Hang tight"
      subtitle={`${gameMaster?.name ?? "The host"} is writing the questions...`}
    />
  );
}
