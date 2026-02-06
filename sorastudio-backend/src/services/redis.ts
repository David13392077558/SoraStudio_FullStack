import { createClient } from "redis";

export const redis = createClient({
  url: process.env.REDIS_URL,
});

redis.on("error", (err: any) => console.error("Redis Error:", err));

export async function initRedis() {
  if (!redis.isOpen) {
    await redis.connect();
  }
}
