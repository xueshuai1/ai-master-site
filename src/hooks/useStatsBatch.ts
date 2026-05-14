"use client";

import { useState, useCallback, useRef } from "react";

export interface ItemStats {
  views: number;
  likes: number;
  dislikes: number;
}

export type StatsMap = Record<string, ItemStats>;

/**
 * Fetches batch stats from /api/stats/batch on demand.
 * Caches the result so repeated calls for the same set are instant.
 */
export function useStatsBatch() {
  const [statsMap, setStatsMap] = useState<StatsMap>({});
  const [loading, setLoading] = useState(false);
  const cachedKey = useRef<string>("");

  const fetchStats = useCallback(async (ids: string[]) => {
    if (ids.length === 0) return;
    const key = ids.slice().sort().join(",");
    if (key === cachedKey.current) return; // already have these
    setLoading(true);
    try {
      const res = await fetch(`/api/stats/batch?ids=${encodeURIComponent(ids.join(","))}`);
      const data: StatsMap = await res.json();
      setStatsMap(data);
      cachedKey.current = key;
    } catch {
      // silently fail - fall back to default sort
    } finally {
      setLoading(false);
    }
  }, []);

  return { statsMap, loading, fetchStats };
}
