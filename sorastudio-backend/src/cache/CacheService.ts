import { redisClient } from "../utils/redisClient";

export class CacheService {
  private redis = redisClient;
  private defaultTTL = 3600; // 1小时

  constructor() {
    this.redis.on("error", (error) => {
      console.error("Redis cache error:", error);
    });
  }

  // 设置缓存
  async set(key: string, value: any, ttl?: number): Promise<void> {
    try {
      const serializedValue = JSON.stringify(value);
      await this.redis.setex(key, ttl || this.defaultTTL, serializedValue);
    } catch (error) {
      console.error("Cache set error:", error);
    }
  }

  // 获取缓存
  async get<T = any>(key: string): Promise<T | null> {
    try {
      const value = await this.redis.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error("Cache get error:", error);
      return null;
    }
  }

  // 删除缓存
  async del(key: string): Promise<void> {
    try {
      await this.redis.del(key);
    } catch (error) {
      console.error("Cache del error:", error);
    }
  }

  // 设置哈希缓存
  async hset(key: string, field: string, value: any): Promise<void> {
    try {
      const serializedValue = JSON.stringify(value);
      await this.redis.hset(key, field, serializedValue);
    } catch (error) {
      console.error("Cache hset error:", error);
    }
  }

  // 获取哈希缓存
  async hget<T = any>(key: string, field: string): Promise<T | null> {
    try {
      const value = await this.redis.hget(key, field);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error("Cache hget error:", error);
      return null;
    }
  }

  // 获取哈希所有字段
  async hgetall(key: string): Promise<Record<string, any> | null> {
    try {
      const result = await this.redis.hgetall(key);
      const parsed: Record<string, any> = {};
      for (const [field, value] of Object.entries(result)) {
        try {
          parsed[field] = JSON.parse(value);
        } catch {
          parsed[field] = value;
        }
      }
      return parsed;
    } catch (error) {
      console.error("Cache hgetall error:", error);
      return null;
    }
  }

  // 缓存任务结果
  async cacheTaskResult(taskId: string, result: any): Promise<void> {
    await this.set(`task:${taskId}`, result, 7200); // 2小时
  }

  // 获取缓存的任务结果
  async getCachedTaskResult(taskId: string): Promise<any | null> {
    return await this.get(`task:${taskId}`);
  }

  // 缓存用户生成历史
  async cacheUserHistory(userId: string, taskType: string, result: any): Promise<void> {
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
  async getUserHistory(userId: string): Promise<any[]> {
    return await this.get(`user:${userId}:history`) || [];
  }

  // 缓存模型响应
  async cacheModelResponse(modelName: string, inputHash: string, response: any): Promise<void> {
    const cacheKey = `model:${modelName}:${inputHash}`;
    await this.set(cacheKey, response, 1800); // 30分钟
  }

  // 获取缓存的模型响应
  async getCachedModelResponse(modelName: string, inputHash: string): Promise<any | null> {
    const cacheKey = `model:${modelName}:${inputHash}`;
    return await this.get(cacheKey);
  }

  // 清理过期缓存
  async cleanup(): Promise<void> {
    try {
      console.log("Cache cleanup completed");
    } catch (error) {
      console.error("Cache cleanup error:", error);
    }
  }

  // 关闭连接
  async close(): Promise<void> {
    await this.redis.quit();
  }
}

// 全局缓存服务实例
export const cacheService = new CacheService();
