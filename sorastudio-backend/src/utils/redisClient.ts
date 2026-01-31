import Redis from 'ioredis';

// 基于 .env 中 REDIS_HOST/REDIS_PORT/REDIS_PASSWORD 初始化 ioredis 客户端
const redisClient = new Redis({
  host: process.env.REDIS_HOST || '127.0.0.1',
  port: parseInt(process.env.REDIS_PORT || '6379', 10),
  password: process.env.REDIS_PASSWORD || undefined,
});

redisClient.on('error', (err) => {
  console.error('Redis error:', err);
});

export default redisClient;
export { redisClient };
