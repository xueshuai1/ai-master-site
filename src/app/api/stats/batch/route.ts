import { NextRequest, NextResponse } from "next/server";
import { redis, keys } from "@/lib/redis";

export const runtime = "edge";

// GET /api/stats/batch?ids=article:id1,blog:id2,tool:id3
// Returns: { "article:id1": { views, likes, dislikes }, ... }
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const raw = searchParams.get("ids");
  if (!raw) return NextResponse.json({});

  const items = raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) => {
      const colon = s.indexOf(":");
      return colon > 0
        ? { type: s.slice(0, colon), id: s.slice(colon + 1) }
        : null;
    })
    .filter((x): x is { type: string; id: string } => x !== null);

  if (items.length === 0) return NextResponse.json({});

  // Fetch all keys in parallel using mget
  const viewKeys = items.map((x) => keys.views(x.type, x.id));
  const likeKeys = items.map((x) => keys.likes(x.type, x.id));
  const dislikeKeys = items.map((x) => keys.dislikes(x.type, x.id));

  const [viewVals, likeVals, dislikeVals] = await Promise.all([
    redis.mget<number>(...viewKeys),
    redis.mget<number>(...likeKeys),
    redis.mget<number>(...dislikeKeys),
  ]);

  const result: Record<string, { views: number; likes: number; dislikes: number }> = {};
  items.forEach(({ type, id }, i) => {
    result[`${type}:${id}`] = {
      views: viewVals[i] ?? 0,
      likes: likeVals[i] ?? 0,
      dislikes: dislikeVals[i] ?? 0,
    };
  });

  return NextResponse.json(result);
}
