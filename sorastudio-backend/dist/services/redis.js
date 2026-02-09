"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/services/redis.ts
const ioredis_1 = __importDefault(require("ioredis"));
const redisUrl = process.env.REDIS_URL;
const redis = new ioredis_1.default(redisUrl, {
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
exports.default = redis;
