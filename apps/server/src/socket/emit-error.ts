import { ServerEvent } from "@chameleon/types/events";
import { AppError } from "@/lib/errors";
import { logger } from "@/lib/logger";
import type { AppSocket } from "@/socket/types";

export function emitError(socket: AppSocket, error: unknown): void {
  const message =
    error instanceof AppError ? error.message : "Something went wrong";
  socket.emit(ServerEvent.Error, message);
  logger.warn(
    { error: error instanceof Error ? error.message : error },
    "Socket handler error",
  );
}
