import Redis from "ioredis";
const redisClient = new Redis(process.env.REDIS_URL, {
    tls: process.env.REDIS_TLS === "true" ? {} : undefined
});
redisClient.on("connect", () => {
    console.log("Redis connected");
});
redisClient.on("error", (err) => {
    console.error("Redis error:", err);
});
export default redisClient;
export { redisClient };
