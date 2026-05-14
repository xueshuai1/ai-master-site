import { Redis } from "@upstash/redis";

export const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
});

// Key helpers
export const keys = {
  views: (type: string, id: string) => `views:${type}:${id}`,
  likes: (type: string, id: string) => `likes:${type}:${id}`,
  dislikes: (type: string, id: string) => `dislikes:${type}:${id}`,
  userVote: (uuid: string, type: string, id: string) => `user:${uuid}:vote:${type}:${id}`,
};
