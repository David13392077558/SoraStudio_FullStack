"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/services/redis.ts
const ioredis_1 = __importDefault(require("ioredis"));
const redisUrl = process.env.REDIS_URL;
// ⭐ Render 免费 Redis 最稳定配置（单连接）
const redis = new ioredis_1.default(redisUrl, {
    tls: redisUrl.startsWith("rediss://")
        ? { rejectUnauthorized: false }
        : undefined,
    // ⭐ 禁用 readyCheck，避免额外连接
    enableReadyCheck: false,
    // ⭐ 禁用 pipeline 重试，避免额外连接
    maxRetriesPerRequest: null,
    // ⭐ 避免 ioredis 创建额外连接
    lazyConnect: false,
    // ⭐ 避免频繁重连导致状态不一致
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
exports.default = redis;
