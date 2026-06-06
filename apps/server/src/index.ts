import { Server as Engine, type WebSocketData } from "@socket.io/bun-engine";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { config } from "@/config";
import { createLobby } from "@/game/lobby";
import { generateLobbyCode } from "@/lib/lobby-code";
import { logger } from "@/lib/logger";
import { createLobbySchema } from "@/lib/validation";
import { getLobby, setLobby } from "@/redis/lobby-store";
import { io } from "@/socket";

const app = new Hono();
app.use("*", cors({ origin: config.corsOrigin }));

app.get("/health", (c) => c.json({ status: "ok" }));

app.post("/lobbies", async (c) => {
  const body: unknown = await c.req.json().catch(() => ({}));
  const parsed = createLobbySchema.safeParse(body);

  if (!parsed.success) {
    return c.json({ error: "Invalid lobby configuration" }, 400);
  }

  for (let attempt = 0; attempt < config.lobby.maxCodeAttempts; attempt++) {
    const code = generateLobbyCode();
    if ((await getLobby(code)) === null) {
      await setLobby(createLobby(code, parsed.data.targetScore));
      return c.json({ code }, 201);
    }
  }

  return c.json({ error: "Could not allocate a lobby code" }, 503);
});

app.get("/lobbies/:code", async (c) => {
  const lobby = await getLobby(c.req.param("code").toUpperCase());
  if (lobby === null) {
    return c.json({ error: "Lobby not found" }, 404);
  }

  return c.json({ code: lobby.code, phase: lobby.phase });
});

const engine = new Engine({
  path: config.socket.path,
  cors: { origin: config.corsOrigin },
});
io.bind(engine);

const handler = engine.handler();

Bun.serve({
  port: config.port,
  idleTimeout: config.socket.idleTimeoutSeconds,
  fetch(request, server: Bun.Server<WebSocketData>) {
    const url = new URL(request.url);
    if (url.pathname.startsWith(config.socket.path)) {
      return handler.fetch(request, server);
    }
    return app.fetch(request);
  },
  websocket: handler.websocket,
});

logger.info({ port: config.port }, "Chameleon server listening");
