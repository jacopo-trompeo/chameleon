import type {
  ClientToServerEvents,
  ServerToClientEvents,
} from "@chameleon/types/socket-events";
import { Server } from "socket.io";
import { config } from "@/config";
import { logger } from "@/lib/logger";
import { registerDisconnectHandler } from "@/socket/handlers/disconnect";
import { registerLobbyHandlers } from "@/socket/handlers/lobby";
import { registerRoundHandlers } from "@/socket/handlers/round";
import type { AppServer, SocketData } from "@/socket/types";

export const io: AppServer = new Server<
  ClientToServerEvents,
  ServerToClientEvents,
  Record<string, never>,
  SocketData
>({
  cors: { origin: config.corsOrigin },
});

io.on("connection", (socket) => {
  logger.info({ socketId: socket.id }, "Socket connected");
  registerLobbyHandlers(io, socket);
  registerRoundHandlers(io, socket);
  registerDisconnectHandler(io, socket);
});
