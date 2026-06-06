import { GamePhase, ServerEvent } from "@chameleon/types/events";
import {
  addPlayer,
  canStart,
  returnToLobby,
  setPlayerReady,
  startGame,
} from "@/game/lobby";
import { InvalidPhaseError, NotAuthorizedError } from "@/lib/errors";
import { clearReadySet, getLobby, mutateLobby } from "@/redis/lobby-store";
import {
  broadcastGameStarted,
  broadcastLobby,
  broadcastRoundStarted,
} from "@/socket/broadcast";
import type { AppServer, AppSocket } from "@/socket/types";

export async function joinLobby(
  io: AppServer,
  socket: AppSocket,
  lobbyCode: string,
  clientId: string,
  playerName: string,
): Promise<void> {
  const existing = await getLobby(lobbyCode);
  if (existing === null) {
    socket.emit(ServerEvent.Error, "Lobby not found");
    return;
  }

  socket.data.lobbyCode = lobbyCode;
  socket.data.clientId = clientId;
  await socket.join(lobbyCode);
  await socket.join(clientId);

  const lobby = await mutateLobby(lobbyCode, (current) =>
    addPlayer(current, clientId, playerName),
  );

  broadcastLobby(io, lobby);
}

export async function toggleReady(
  io: AppServer,
  lobbyCode: string,
  clientId: string,
  isReady: boolean,
): Promise<void> {
  const lobby = await mutateLobby(lobbyCode, (current) =>
    setPlayerReady(current, clientId, isReady),
  );

  broadcastLobby(io, lobby);
}

export async function beginGame(
  io: AppServer,
  lobbyCode: string,
  clientId: string,
): Promise<void> {
  const lobby = await mutateLobby(lobbyCode, (current) => {
    if (!canStart(current, clientId)) {
      throw new NotAuthorizedError("The game cannot start yet");
    }
    return startGame(current);
  });

  await clearReadySet(lobbyCode);

  broadcastRoundStarted(io, lobby);
  broadcastGameStarted(io, lobby);
}

export async function goToLobby(
  io: AppServer,
  lobbyCode: string,
): Promise<void> {
  const lobby = await mutateLobby(lobbyCode, (current) => {
    if (current.phase !== GamePhase.GameOver) {
      throw new InvalidPhaseError("The game is still in progress");
    }
    return returnToLobby(current);
  });

  await clearReadySet(lobbyCode);
  broadcastLobby(io, lobby);
}
