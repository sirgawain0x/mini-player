import { Redis } from "@upstash/redis";

if (!process.env.REDIS_URL || !process.env.KV_REST_API_TOKEN) {
  console.warn(
    "REDIS_URL or KV_REST_API_TOKEN environment variable is not defined, please add to enable background notifications and webhooks."
  );
}

export const redis =
  process.env.REDIS_URL && process.env.KV_REST_API_TOKEN
    ? new Redis({
        url: process.env.REDIS_URL,
        token: process.env.KV_REST_API_TOKEN,
      })
    : null;
