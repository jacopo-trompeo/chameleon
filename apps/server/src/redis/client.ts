import { Redis } from "ioredis";
import { config } from "@/config";
import { logger } from "@/lib/logger";

export const redis = new Redis(config.redisUrl);

redis.on("error", (error) => {
  logger.error({ error }, "Redis client error");
});

redis.on("connect", () => {
  logger.info("Redis connected");
});
