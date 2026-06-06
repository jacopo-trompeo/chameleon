import {
  DEFAULT_TARGET_SCORE,
  LOBBY_CODE_LENGTH,
  MAX_PLAYER_NAME_LENGTH,
  MAX_TARGET_SCORE,
  MIN_TARGET_SCORE,
} from "@chameleon/types/constants";
import { GamePhase, ResolutionVerdict } from "@chameleon/types/events";
import { z } from "zod";

export const lobbyCodeSchema = z
  .string()
  .trim()
  .toUpperCase()
  .length(LOBBY_CODE_LENGTH)
  .regex(/^[A-Z0-9]+$/);

export const createLobbySchema = z.object({
  targetScore: z
    .number()
    .int()
    .min(MIN_TARGET_SCORE)
    .max(MAX_TARGET_SCORE)
    .default(DEFAULT_TARGET_SCORE),
});

export const joinLobbySchema = z.object({
  lobbyCode: lobbyCodeSchema,
  playerName: z.string().trim().min(1).max(MAX_PLAYER_NAME_LENGTH),
  clientId: z.string().min(1).max(64),
});

export const submitQuestionsSchema = z.object({
  normalQuestion: z.string().trim().min(1),
  impostorQuestion: z.string().trim().min(1),
});

export const answerSchema = z.string();

export const booleanSchema = z.boolean();

const playerSchema = z.object({
  id: z.string(),
  name: z.string(),
  score: z.number(),
  isReady: z.boolean(),
});

const roundStateSchema = z.object({
  gameMasterId: z.string(),
  impostorId: z.string(),
  normalQuestion: z.string(),
  impostorQuestion: z.string(),
  answers: z.record(z.string(), z.string()),
  readyPlayerIds: z.array(z.string()),
});

const roundOutcomeSchema = z.object({
  impostorFound: z.nativeEnum(ResolutionVerdict),
  impostorId: z.string(),
  scores: z.record(z.string(), z.number()),
});

export const storedLobbySchema = z.object({
  code: z.string(),
  creatorId: z.string(),
  targetScore: z.number(),
  players: z.array(playerSchema),
  phase: z.nativeEnum(GamePhase),
  round: roundStateSchema.nullable(),
  disconnectedIds: z.array(z.string()),
  lastOutcome: roundOutcomeSchema.nullable(),
});

export type StoredLobbyData = z.infer<typeof storedLobbySchema>;

export const lobbyCodeResponseSchema = z.object({
  code: z.string(),
});
