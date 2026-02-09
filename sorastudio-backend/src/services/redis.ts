// src/services/redis.ts
import Redis from "ioredis";

const redisUrl = process.env.REDIS_URL!;

const redis = new Redis(redisUrl, {
  tls: redisUrl.startsWith("rediss://")
    ? { rejectUnauthorized: false }
    : undefined,

  // ⭐ Render 免费 Redis 必须使用单连接
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
  lazyConnect: false,

  // ⭐ 限制为单连接（关键）
  maxConnections: 1,

  // ⭐ 避免频繁断线
  retryStrategy: () => 2000,
  reconnectOnError: () => true
});

redis.on("connect", () => {
  console.log("✅ Redis connected (single connection mode)");
});

redis.on("error", (err) => {
  console.error("❌ Redis error:", err);
});

redis.on("reconnecting", () => {
  console.log("🔄 Redis reconnecting...");
});

export default redis;
