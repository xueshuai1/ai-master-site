import { NextRequest, NextResponse } from "next/server";
import { redis, keys } from "@/lib/redis";

export const runtime = "edge";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type");
  const id = searchParams.get("id");
  const uuid = searchParams.get("uuid");

  if (!type || !id) {
    return NextResponse.json({ error: "Missing type or id" }, { status: 400 });
  }

  const [views, likes, dislikes] = await Promise.all([
    redis.get<number>(keys.views(type, id)),
    redis.get<number>(keys.likes(type, id)),
    redis.get<number>(keys.dislikes(type, id)),
  ]);

  let userVote: string | null = null;
  if (uuid) {
    userVote = await redis.get<string>(keys.userVote(uuid, type, id));
  }

  return NextResponse.json({
    views: views ?? 0,
    likes: likes ?? 0,
    dislikes: dislikes ?? 0,
    userVote,
  });
}
