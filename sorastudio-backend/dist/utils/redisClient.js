"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.redisClient = void 0;
const ioredis_1 = __importDefault(require("ioredis"));
const redisClient = new ioredis_1.default(process.env.REDIS_URL, {
    tls: process.env.REDIS_TLS === "true" ? {} : undefined
});
exports.redisClient = redisClient;
redisClient.on("connect", () => {
    console.log("Redis connected");
});
redisClient.on("error", (err) => {
    console.error("Redis error:", err);
});
exports.default = redisClient;
