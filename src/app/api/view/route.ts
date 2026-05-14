import { NextRequest, NextResponse } from "next/server";
import { redis, keys } from "@/lib/redis";

export const runtime = "edge";

export async function POST(req: NextRequest) {
  // Skip view counting in development
  if (process.env.NODE_ENV === "development") {
    return NextResponse.json({ views: 0, skipped: true });
  }

  const { type, id } = await req.json();

  if (!type || !id) {
    return NextResponse.json({ error: "Missing type or id" }, { status: 400 });
  }

  const views = await redis.incr(keys.views(type, id));
  return NextResponse.json({ views });
}
