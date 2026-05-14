import { NextRequest, NextResponse } from "next/server";
import { redis, keys } from "@/lib/redis";

export const runtime = "edge";

// For articles and blogs: only like (no dislike). One action per UUID, toggle-able.
export async function POST(req: NextRequest) {
  const { type, id, uuid } = await req.json();

  if (!type || !id || !uuid) {
    return NextResponse.json({ error: "Missing type, id, or uuid" }, { status: 400 });
  }

  const voteKey = keys.userVote(uuid, type, id);
  const likeKey = keys.likes(type, id);

  const existing = await redis.get<string>(voteKey);

  let likes: number;

  if (existing === "like") {
    // Toggle off
    await Promise.all([
      redis.del(voteKey),
      redis.decr(likeKey),
    ]);
    likes = (await redis.get<number>(likeKey)) ?? 0;
    return NextResponse.json({ likes, userVote: null });
  } else {
    // Set like
    await Promise.all([
      redis.set(voteKey, "like"),
      redis.incr(likeKey),
    ]);
    likes = (await redis.get<number>(likeKey)) ?? 0;
    return NextResponse.json({ likes, userVote: "like" });
  }
}
