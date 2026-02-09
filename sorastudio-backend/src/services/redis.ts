// src/services/redis.ts
import Redis from "ioredis";

const redisUrl = process.env.REDIS_URL!;

// ⭐ ioredis 会根据 rediss:// 自动启用 TLS
const redis = new Redis(redisUrl, {
  tls: redisUrl.startsWith("rediss://") ? {
    rejectUnauthorized: false  // ⭐ Render Redis 需要关闭证书验证
  } : undefined,
  maxRetriesPerRequest: 3,
  enableReadyCheck: true,
  connectTimeout: 10000,
  lazyConnect: false
});

redis.on("connect", () => {
  console.log("✅ Redis connected");
});

redis.on("error", (err) => {
  console.error("❌ Redis error:", err);
});

redis.on("reconnecting", () => {
  console.log("🔄 Redis reconnecting...");
});

export default redis;
