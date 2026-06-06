export const config = {
  port: Number(process.env.PORT ?? 3001),
  corsOrigin: process.env.CORS_ORIGIN ?? "http://localhost:5173",
  redisUrl: process.env.REDIS_URL ?? "redis://localhost:6379",
  logLevel: process.env.LOG_LEVEL ?? "info",

  socket: {
    path: "/socket.io/",
    idleTimeoutSeconds: 30,
  },

  lobby: {
    ttlSeconds: 60 * 60 * 24,
    maxCodeAttempts: 10,
    maxMutateRetries: 16,
  },
} as const;
