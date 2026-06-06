import { ClientEvent, ServerEvent } from "@chameleon/types/events";
import { answerSchema, submitQuestionsSchema } from "@/lib/validation";
import {
  advanceToNextRound,
  resolveRound,
  submitAnswer,
  submitQuestions,
} from "@/services/round-service";
import { emitError } from "@/socket/emit-error";
import type { AppServer, AppSocket } from "@/socket/types";

export function registerRoundHandlers(io: AppServer, socket: AppSocket): void {
  socket.on(ClientEvent.SubmitQuestions, async (payload) => {
    const parsed = submitQuestionsSchema.safeParse(payload);
    if (!parsed.success) {
      socket.emit(ServerEvent.Error, "Invalid questions");
      return;
    }

    const currentCode = socket.data.lobbyCode;
    const clientId = socket.data.clientId;

    if (currentCode === undefined || clientId === undefined) {
      return;
    }

    try {
      await submitQuestions(
        io,
        currentCode,
        clientId,
        parsed.data.normalQuestion,
        parsed.data.impostorQuestion,
      );
    } catch (error) {
      emitError(socket, error);
    }
  });

  socket.on(ClientEvent.SubmitAnswer, async (answer) => {
    const parsed = answerSchema.safeParse(answer);
    if (!parsed.success) {
      socket.emit(ServerEvent.Error, "Invalid answer");
      return;
    }

    const currentCode = socket.data.lobbyCode;
    const clientId = socket.data.clientId;

    if (currentCode === undefined || clientId === undefined) {
      return;
    }

    try {
      await submitAnswer(io, currentCode, clientId, parsed.data);
    } catch (error) {
      emitError(socket, error);
    }
  });

  socket.on(ClientEvent.ResolveRound, async (verdict) => {
    const currentCode = socket.data.lobbyCode;
    const clientId = socket.data.clientId;

    if (currentCode === undefined || clientId === undefined) {
      return;
    }

    try {
      await resolveRound(io, currentCode, clientId, verdict);
    } catch (error) {
      emitError(socket, error);
    }
  });

  socket.on(ClientEvent.NextRound, async () => {
    const currentCode = socket.data.lobbyCode;
    const clientId = socket.data.clientId;

    if (currentCode === undefined || clientId === undefined) {
      return;
    }

    try {
      await advanceToNextRound(io, currentCode, clientId);
    } catch (error) {
      emitError(socket, error);
    }
  });
}
