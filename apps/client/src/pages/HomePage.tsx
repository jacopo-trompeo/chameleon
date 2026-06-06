import {
  DEFAULT_TARGET_SCORE,
  LOBBY_CODE_LENGTH,
} from "@chameleon/types/constants";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { TargetScoreControl } from "@/components/lobby/TargetScoreControl";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { NameInput } from "@/components/ui/name-input";
import { Screen } from "@/components/ui/screen";
import { createLobbyRequest } from "@/lib/api";
import { socket } from "@/socket/client";
import { joinLobby } from "@/socket/connect";
import { useGameStore } from "@/store/game-store";
import { useLobbyStore } from "@/store/lobby-store";
import { useNotificationStore } from "@/store/notification-store";

export function HomePage() {
  const navigate = useNavigate();
  const setLocalPlayerId = useLobbyStore((state) => state.setLocalPlayerId);
  const notify = useNotificationStore((state) => state.notify);
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [targetScore, setTargetScore] = useState(DEFAULT_TARGET_SCORE);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    socket.disconnect();
    useLobbyStore.getState().reset();
    useGameStore.getState().reset();
  }, []);

  const trimmedName = name.trim();

  function enterLobby(lobbyCode: string) {
    setLocalPlayerId(joinLobby(lobbyCode, trimmedName));
    navigate(`/lobby/${lobbyCode}`);
  }

  async function handleCreate(event: React.SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();

    if (busy) {
      return;
    }

    if (trimmedName === "") {
      document.getElementById("player-name")?.focus();
      notify("Enter your name to play.");
      return;
    }

    setBusy(true);
    try {
      const lobbyCode = await createLobbyRequest(targetScore);
      enterLobby(lobbyCode);
    } catch {
      notify("Could not create a game. Please try again.");
      setBusy(false);
    }
  }

  async function handleJoin(event: React.SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();

    const normalizedCode = code.trim().toUpperCase();
    if (busy || normalizedCode.length !== LOBBY_CODE_LENGTH) {
      return;
    }

    if (trimmedName === "") {
      document.getElementById("player-name")?.focus();
      notify("Enter your name to play.");
      return;
    }

    setBusy(true);
    try {
      enterLobby(normalizedCode);
    } catch {
      notify("Could not join the game. Please try again.");
      setBusy(false);
    }
  }

  return (
    <Screen className="gap-7">
      <header className="text-center">
        <h1 className="font-display text-6xl text-primary tracking-tight sm:text-7xl">
          Chameleon
        </h1>
        <p className="mt-2 text-muted-foreground">
          Blend in, or sniff out the impostor.
        </p>
      </header>

      <NameInput value={name} onChange={setName} />

      <Card>
        <form onSubmit={handleCreate} className="flex flex-col gap-4">
          <h2 className="font-display text-xl">Create a game</h2>
          <TargetScoreControl
            value={targetScore}
            onChange={setTargetScore}
            disabled={busy}
          />
          <Button type="submit" size="lg" disabled={busy}>
            Create game
          </Button>
        </form>
      </Card>

      <div className="flex items-center gap-3 text-muted-foreground text-xs">
        <span className="h-px flex-1 bg-border" />
        OR
        <span className="h-px flex-1 bg-border" />
      </div>

      <Card>
        <form onSubmit={handleJoin} className="flex flex-col gap-4">
          <h2 className="font-display text-xl">Join a game</h2>
          <div className="flex flex-col gap-2">
            <label htmlFor="lobby-code" className="font-medium text-sm">
              Lobby code
            </label>
            <Input
              id="lobby-code"
              value={code}
              onChange={(event) => setCode(event.target.value.toUpperCase())}
              maxLength={LOBBY_CODE_LENGTH}
              placeholder="ABC234"
              autoCapitalize="characters"
              autoComplete="off"
              className="text-center font-display text-2xl tracking-[0.3em]"
            />
          </div>
          <Button
            type="submit"
            size="lg"
            variant="secondary"
            disabled={busy || code.trim().length !== LOBBY_CODE_LENGTH}
          >
            Join game
          </Button>
        </form>
      </Card>
    </Screen>
  );
}
