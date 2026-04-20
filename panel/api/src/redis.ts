import Redis from "ioredis";

const redisUrl = process.env.REDIS_URL ?? "redis://127.0.0.1:6379";

export const publisher = new Redis(redisUrl);
export const subscriber = new Redis(redisUrl);

publisher.on("error", (err) => console.error("[Redis publisher]", err.message));
subscriber.on("error", (err) => console.error("[Redis subscriber]", err.message));
