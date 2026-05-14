import { NextRequest, NextResponse } from "next/server";
import { redis, keys } from "@/lib/redis";

export const runtime = "edge";

// For tools: like OR dislike, mutually exclusive. Toggle-able.
export async function POST(req: NextRequest) {
  const { id, uuid, action } = await req.json();

  if (!id || !uuid || !action || !["like", "dislike"].includes(action)) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const type = "tool";
  const voteKey = keys.userVote(uuid, type, id);
  const likeKey = keys.likes(type, id);
  const dislikeKey = keys.dislikes(type, id);

  const existing = await redis.get<string>(voteKey);

  const ops: Promise<unknown>[] = [];

  if (existing === action) {
    // Toggle off
    ops.push(redis.del(voteKey));
    if (action === "like") ops.push(redis.decr(likeKey));
    else ops.push(redis.decr(dislikeKey));
    await Promise.all(ops);
  } else {
    // Switch or set new vote
    ops.push(redis.set(voteKey, action));
    if (action === "like") {
      ops.push(redis.incr(likeKey));
      if (existing === "dislike") ops.push(redis.decr(dislikeKey));
    } else {
      ops.push(redis.incr(dislikeKey));
      if (existing === "like") ops.push(redis.decr(likeKey));
    }
    await Promise.all(ops);
  }

  const [likes, dislikes, userVote] = await Promise.all([
    redis.get<number>(likeKey),
    redis.get<number>(dislikeKey),
    redis.get<string>(voteKey),
  ]);

  return NextResponse.json({
    likes: Math.max(0, likes ?? 0),
    dislikes: Math.max(0, dislikes ?? 0),
    userVote: userVote ?? null,
  });
}
