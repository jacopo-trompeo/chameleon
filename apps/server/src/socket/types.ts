import type {
  ClientToServerEvents,
  ServerToClientEvents,
} from "@chameleon/types/socket-events";
import type { Server, Socket } from "socket.io";

export type SocketData = { lobbyCode?: string; clientId?: string };

export type AppServer = Server<
  ClientToServerEvents,
  ServerToClientEvents,
  Record<string, never>,
  SocketData
>;

export type AppSocket = Socket<
  ClientToServerEvents,
  ServerToClientEvents,
  Record<string, never>,
  SocketData
>;
