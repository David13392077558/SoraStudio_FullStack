// src/services/redis.ts
import Redis from "ioredis";

const redisUrl = process.env.REDIS_URL!;

const redis = new Redis(redisUrl, {
  tls: redisUrl.startsWith("rediss://")
    ? { rejectUnauthorized: false }
    : undefined,
  enableReadyCheck: false,
  maxRetriesPerRequest: null,
  lazyConnect: false,
  retryStrategy: () => 2000,
  reconnectOnError: () => true
});

redis.on("connect", () => {
  console.log("✅ Redis connected (single-connection mode)");
});

redis.on("error", (err) => {
  console.error("❌ Redis error:", err);
});

redis.on("reconnecting", () => {
  console.log("🔄 Redis reconnecting...");
});

export default redis;
