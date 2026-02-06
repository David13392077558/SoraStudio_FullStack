// src/services/redis.ts
import Redis from "ioredis";

const redis = new Redis(process.env.REDIS_URL!, {
  tls: process.env.REDIS_TLS === "true" ? {} : undefined
});

redis.on("connect", () => {
  console.log("Redis connected");
});

redis.on("error", (err) => {
  console.error("Redis error:", err);
});

export default redis;
