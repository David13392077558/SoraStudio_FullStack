// 引入 Redis 客户端
import { createClient } from "redis";

// 创建 Redis 连接（Render 或本地都用这个 URL）
export const redis = createClient({
  url: process.env.REDIS_URL, // 从环境变量读取 Redis 地址
});

// 监听 Redis 错误（方便调试）
redis.on("error", (err) => console.error("Redis Error:", err));

// 连接 Redis（必须 await）
await redis.connect();
