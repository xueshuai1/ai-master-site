"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import { useDeviceId } from "@/hooks/useDeviceId";

interface ArticleStatsProps {
  type: "article" | "blog";
  id: string;
}

export default function ArticleStats({ type, id }: ArticleStatsProps) {
  const deviceId = useDeviceId();
  const [views, setViews] = useState<number | null>(null);
  const [likes, setLikes] = useState<number | null>(null);
  const [userVote, setUserVote] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [justLiked, setJustLiked] = useState(false);
  const viewRecorded = useRef(false);

  // Record view once on mount
  useEffect(() => {
    if (viewRecorded.current) return;
    viewRecorded.current = true;
    fetch("/api/view", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, id }),
    })
      .then((r) => r.json())
      .then((data) => { if (!data.skipped) setViews(data.views ?? 0); })
      .catch(() => {});
  }, [type, id]);

  // Fetch stats once deviceId is ready
  useEffect(() => {
    if (!deviceId) return;
    const url = `/api/stats?type=${type}&id=${encodeURIComponent(id)}&uuid=${encodeURIComponent(deviceId)}`;
    fetch(url)
      .then((r) => r.json())
      .then((data) => {
        setViews((prev) => prev ?? (data.views ?? 0));
        setLikes(data.likes ?? 0);
        setUserVote(data.userVote ?? null);
      })
      .catch(() => {});
  }, [deviceId, type, id]);

  const handleLike = useCallback(async () => {
    if (!deviceId || loading) return;
    setLoading(true);
    try {
      const res = await fetch("/api/like", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, id, uuid: deviceId }),
      });
      const data = await res.json();
      setLikes(data.likes ?? 0);
      const newVote = data.userVote ?? null;
      setUserVote(newVote);
      if (newVote === "like") setJustLiked(true);
    } finally {
      setLoading(false);
    }
  }, [deviceId, loading, type, id]);

  const liked = userVote === "like";

  // Inject compact stats into the header portal slot (same data, no double-fetch)
  const headerPortalEl = typeof document !== "undefined"
    ? document.getElementById("article-header-stats")
    : null;

  const headerStats = (views !== null || likes !== null) && (
    <span className="flex items-center gap-3 text-sm text-slate-400">
      {views !== null && views > 0 && (
        <span className="flex items-center gap-1">
          <svg className="w-4 h-4 opacity-70" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.964-7.178z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          {views.toLocaleString()}
        </span>
      )}
      {likes !== null && likes > 0 && (
        <span className="flex items-center gap-1 text-emerald-400/80">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6.633 10.5c.806 0 1.533-.446 2.031-1.08a9.041 9.041 0 012.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 00.322-1.672V3a.75.75 0 01.75-.75A2.25 2.25 0 0116.5 4.5c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 01-2.649 7.521c-.388.482-.987.729-1.605.729H13.48c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 00-1.423-.23H5.904M14.25 9h2.25M5.904 18.75c.083.205.173.405.27.602.197.4-.078.898-.523.898h-.908c-.889 0-1.713-.518-1.972-1.368a12 12 0 01-.521-3.507c0-1.553.295-3.036.831-4.398C3.387 10.203 4.167 9.75 5 9.75h1.053c.472 0 .745.556.5.96a8.958 8.958 0 00-1.302 4.665c0 1.194.232 2.333.654 3.375z" />
          </svg>
          {likes.toLocaleString()}
        </span>
      )}
    </span>
  );

  return (
    <>
    <div className="mt-12 pt-10 border-t border-white/8">
      <div className="flex flex-col items-center gap-6">
        <p className="text-slate-400 text-sm">
          {liked ? "感谢你的支持！💙" : "这篇文章对你有帮助吗？"}
        </p>

        {/* Big like button */}
        <button
          onClick={handleLike}
          disabled={!deviceId || loading}
          aria-label={liked ? "取消点赞" : "点赞"}
          className={`group relative flex items-center gap-3 px-8 py-4 rounded-2xl border-2 font-semibold text-base transition-all duration-300 ${
            liked
              ? "border-brand-400 bg-brand-500/20 text-brand-300 shadow-lg shadow-brand-500/20"
              : "border-white/15 bg-white/5 text-slate-300 hover:border-brand-400/60 hover:bg-brand-500/10 hover:text-brand-300 hover:shadow-lg hover:shadow-brand-500/10"
          } ${(!deviceId || loading) ? "opacity-60 cursor-not-allowed" : "cursor-pointer hover:-translate-y-0.5"}`}
        >
          {/* Glow on liked */}
          {liked && (
            <span className="absolute inset-0 rounded-2xl bg-brand-500/10 animate-pulse pointer-events-none" />
          )}

          <svg
            className={`w-6 h-6 transition-all duration-300 ${
              liked ? "scale-110 text-brand-400" : "group-hover:scale-105"
            } ${justLiked ? "animate-bounce" : ""}`}
            fill={liked ? "currentColor" : "none"}
            stroke="currentColor"
            strokeWidth={1.5}
            viewBox="0 0 24 24"
            aria-hidden="true"
            onAnimationEnd={() => setJustLiked(false)}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M6.633 10.5c.806 0 1.533-.446 2.031-1.08a9.041 9.041 0 012.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 00.322-1.672V3a.75.75 0 01.75-.75A2.25 2.25 0 0116.5 4.5c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 01-2.649 7.521c-.388.482-.987.729-1.605.729H13.48c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 00-1.423-.23H5.904M14.25 9h2.25M5.904 18.75c.083.205.173.405.27.602.197.4-.078.898-.523.898h-.908c-.889 0-1.713-.518-1.972-1.368a12 12 0 01-.521-3.507c0-1.553.295-3.036.831-4.398C3.387 10.203 4.167 9.75 5 9.75h1.053c.472 0 .745.556.5.96a8.958 8.958 0 00-1.302 4.665c0 1.194.232 2.333.654 3.375z" />
          </svg>
          <span>
            {liked ? "已点赞" : "点个赞"}
            {likes !== null && likes > 0 && (
              <span className={`ml-2 text-sm font-normal ${liked ? "text-brand-400" : "text-slate-500"}`}>
                {likes.toLocaleString()}
              </span>
            )}
          </span>
        </button>

        {/* View count */}
        {views !== null && views > 0 && (
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.964-7.178z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>{views.toLocaleString()} 次浏览</span>
          </div>
        )}
      </div>
    </div>

    {/* Portal: inject same stats into header slot */}
    {headerPortalEl && headerStats && createPortal(headerStats, headerPortalEl)}
    </>
  );
}
