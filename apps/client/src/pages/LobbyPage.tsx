import { MIN_PLAYERS } from "@chameleon/types/constants";
import { ClientEvent, GamePhase } from "@chameleon/types/events";
import { useEffect, useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router";
import { LobbyCode } from "@/components/lobby/LobbyCode";
import { PlayerList } from "@/components/lobby/PlayerList";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CenteredMessage } from "@/components/ui/centered-message";
import { NameInput } from "@/components/ui/name-input";
import { Screen } from "@/components/ui/screen";
import { lobbyExists } from "@/lib/api";
import { socket } from "@/socket/client";
import { joinLobby } from "@/socket/connect";
import { useGameStore } from "@/store/game-store";
import { useLobbyStore } from "@/store/lobby-store";

export function LobbyPage() {
  const params = useParams();
  const code = params.code ?? "";
  const navigate = useNavigate();
  const lobby = useLobbyStore((state) => state.lobby);
  const localPlayerId = useLobbyStore((state) => state.localPlayerId);
  const setLocalPlayerId = useLobbyStore((state) => state.setLocalPlayerId);
  const phase = useGameStore((state) => state.phase);
  const [name, setName] = useState("");

  const hasIdentity = localPlayerId !== null;
  const joined = hasIdentity && lobby !== null && lobby.code === code;

  useEffect(() => {
    if (hasIdentity) {
      return;
    }

    let active = true;
    void lobbyExists(code).then((exists) => {
      if (active && !exists) {
        navigate("/");
      }
    });

    return () => {
      active = false;
    };
  }, [hasIdentity, code, navigate]);

  if (joined && phase !== GamePhase.Lobby) {
    return <Navigate to={`/game/${code}`} replace />;
  }

  function handleJoin(event: React.SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();

    if (name.trim() === "") {
      return;
    }

    setLocalPlayerId(joinLobby(code, name.trim()));
  }

  if (!joined) {
    if (hasIdentity) {
      return <CenteredMessage title="Joining lobby..." />;
    }
    return (
      <Screen>
        <h1 className="text-center font-display text-3xl sm:text-4xl">
          Join lobby {code}
        </h1>
        <Card>
          <form onSubmit={handleJoin} className="flex flex-col gap-4">
            <NameInput value={name} onChange={setName} id="join-name" />
            <Button type="submit" size="lg" disabled={name.trim() === ""}>
              Join game
            </Button>
          </form>
        </Card>
      </Screen>
    );
  }

  const me = lobby.players.find((player) => player.id === localPlayerId);
  const isCreator = lobby.creatorId === localPlayerId;
  const everyoneReady = lobby.players.every((player) => player.isReady);
  const enoughPlayers = lobby.players.length >= MIN_PLAYERS;
  const canStart = isCreator && enoughPlayers && everyoneReady;
  const playerCount = lobby.players.length;

  function toggleReady() {
    socket.emit(ClientEvent.SetReady, !(me?.isReady ?? false));
  }

  function startGame() {
    socket.emit(ClientEvent.StartGame);
  }

  return (
    <Screen>
      <header className="flex flex-col items-center gap-3 pt-2">
        <LobbyCode code={lobby.code} />
        <p
          className="text-center text-muted-foreground text-sm"
          aria-live="polite"
        >
          {playerCount} player{playerCount === 1 ? "" : "s"} · first to{" "}
          {lobby.targetScore} wins
        </p>
      </header>

      <PlayerList
        players={lobby.players}
        creatorId={lobby.creatorId}
        localPlayerId={localPlayerId}
      />

      <div className="mt-auto flex flex-col gap-3">
        <Button
          variant={me?.isReady ? "outline" : "default"}
          size="lg"
          onClick={toggleReady}
        >
          {me?.isReady ? "Not ready" : "I'm ready"}
        </Button>
        {isCreator ? (
          <Button size="lg" onClick={startGame} disabled={!canStart}>
            Start game
          </Button>
        ) : null}
        {isCreator && !canStart ? (
          <p className="text-center text-muted-foreground text-sm">
            {enoughPlayers
              ? "Waiting for everyone to be ready"
              : `Need at least ${MIN_PLAYERS} players`}
          </p>
        ) : null}
      </div>
    </Screen>
  );
}
