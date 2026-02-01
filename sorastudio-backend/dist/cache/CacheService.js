"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cacheService = exports.CacheService = void 0;
const redisClient_1 = require("../utils/redisClient");
class CacheService {
    constructor() {
        this.redis = redisClient_1.redisClient;
        this.defaultTTL = 3600; // 1小时
        this.redis.on("error", (error) => {
            console.error("Redis cache error:", error);
        });
    }
    // 设置缓存
    async set(key, value, ttl) {
        try {
            const serializedValue = JSON.stringify(value);
            await this.redis.setex(key, ttl || this.defaultTTL, serializedValue);
        }
        catch (error) {
            console.error("Cache set error:", error);
        }
    }
    // 获取缓存
    async get(key) {
        try {
            const value = await this.redis.get(key);
            return value ? JSON.parse(value) : null;
        }
        catch (error) {
            console.error("Cache get error:", error);
            return null;
        }
    }
    // 删除缓存
    async del(key) {
        try {
            await this.redis.del(key);
        }
        catch (error) {
            console.error("Cache del error:", error);
        }
    }
    // 设置哈希缓存
    async hset(key, field, value) {
        try {
            const serializedValue = JSON.stringify(value);
            await this.redis.hset(key, field, serializedValue);
        }
        catch (error) {
            console.error("Cache hset error:", error);
        }
    }
    // 获取哈希缓存
    async hget(key, field) {
        try {
            const value = await this.redis.hget(key, field);
            return value ? JSON.parse(value) : null;
        }
        catch (error) {
            console.error("Cache hget error:", error);
            return null;
        }
    }
    // 获取哈希所有字段
    async hgetall(key) {
        try {
            const result = await this.redis.hgetall(key);
            const parsed = {};
            for (const [field, value] of Object.entries(result)) {
                try {
                    parsed[field] = JSON.parse(value);
                }
                catch {
                    parsed[field] = value;
                }
            }
            return parsed;
        }
        catch (error) {
            console.error("Cache hgetall error:", error);
            return null;
        }
    }
    // 缓存任务结果
    async cacheTaskResult(taskId, result) {
        await this.set(`task:${taskId}`, result, 7200); // 2小时
    }
    // 获取缓存的任务结果
    async getCachedTaskResult(taskId) {
        return await this.get(`task:${taskId}`);
    }
    // 缓存用户生成历史
    async cacheUserHistory(userId, taskType, result) {
        const historyKey = `user:${userId}:history`;
        const historyItem = {
            taskType,
            result,
            timestamp: new Date().toISOString(),
        };
        const existingHistory = await this.get(historyKey) || [];
        existingHistory.unshift(historyItem);
        if (existingHistory.length > 50) {
            existingHistory.splice(50);
        }
        await this.set(historyKey, existingHistory, 86400); // 24小时
    }
    // 获取用户历史记录
    async getUserHistory(userId) {
        return await this.get(`user:${userId}:history`) || [];
    }
    // 缓存模型响应
    async cacheModelResponse(modelName, inputHash, response) {
        const cacheKey = `model:${modelName}:${inputHash}`;
        await this.set(cacheKey, response, 1800); // 30分钟
    }
    // 获取缓存的模型响应
    async getCachedModelResponse(modelName, inputHash) {
        const cacheKey = `model:${modelName}:${inputHash}`;
        return await this.get(cacheKey);
    }
    // 清理过期缓存
    async cleanup() {
        try {
            console.log("Cache cleanup completed");
        }
        catch (error) {
            console.error("Cache cleanup error:", error);
        }
    }
    // 关闭连接
    async close() {
        await this.redis.quit();
    }
}
exports.CacheService = CacheService;
// 全局缓存服务实例
exports.cacheService = new CacheService();
