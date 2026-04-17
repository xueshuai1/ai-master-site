"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { NewsItem } from "@/data/news";

/**
 * 无缝新闻滚动条 — requestAnimationFrame 逐帧像素控制
 * 
 * 弃用 CSS translateX(-50%)（百分比基于元素自身宽度不稳定）
 * 每帧用 getBoundingClientRect() 精确测量第一组 items 的像素宽度
 */
export default function NewsTicker({ items }: { items: NewsItem[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const posRef = useRef(0);
  const lastRef = useRef(0);
  const rafRef = useRef<number>(0);
  const speed = 200;
  const [visible, setVisible] = useState(false);
  const [paused, setPaused] = useState(false);

  const loop = useCallback(() => {
    if (paused) {
      rafRef.current = requestAnimationFrame(loop);
      return;
    }
    const track = trackRef.current;
    const container = containerRef.current;
    if (!track || !container) {
      rafRef.current = requestAnimationFrame(loop);
      return;
    }

    // ★ 精确测量第一组 items 的像素宽度
    const halfCount = Math.floor(track.children.length / 2);
    let singleW = 0;
    if (halfCount >= 1 && track.children[0] && track.children[halfCount - 1]) {
      const first = track.children[0].getBoundingClientRect();
      const last = track.children[halfCount - 1].getBoundingClientRect();
      singleW = last.right - first.left;
    }

    const containerW = container.offsetWidth;

    if (singleW <= containerW + 10 || singleW <= 0) {
      posRef.current = 0;
      track.style.transform = "translateX(0)";
      lastRef.current = 0;
      rafRef.current = requestAnimationFrame(loop);
      return;
    }

    if (lastRef.current === 0) lastRef.current = performance.now();
    const now = performance.now();
    const dt = Math.min((now - lastRef.current) / 1000, 0.1);
    lastRef.current = now;

    posRef.current += speed * dt;
    if (posRef.current >= singleW) {
      posRef.current -= singleW;
    }

    track.style.transform = `translateX(${-posRef.current}px)`;
    rafRef.current = requestAnimationFrame(loop);
  }, [speed]);

  useEffect(() => {
    posRef.current = 0;
    lastRef.current = 0;
    setVisible(false);
    if (trackRef.current) trackRef.current.style.transform = "translateX(0)";

    Promise.all([
      document.fonts?.ready ?? Promise.resolve(),
      new Promise<void>(r => setTimeout(r, 1500)),
    ]).then(() => {
      setVisible(true);
      rafRef.current = requestAnimationFrame(loop);
    });

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [loop, items.length]);

  if (!items.length) return null;

  const displayItems = [...items, ...items, ...items, ...items];

  return (
    <div className="mt-8 max-w-3xl mx-auto">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-sm text-brand-400 font-medium">🔥 最新动态</span>
        <span className="flex-1 h-px bg-white/10" />
      </div>
      <div
        ref={containerRef}
        className="relative overflow-hidden rounded-xl bg-white/[0.03] border border-white/5 cursor-pointer"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        <div
          ref={trackRef}
          className="flex gap-8 py-3 px-4"
          style={{ width: "max-content", opacity: visible ? 1 : 0, transition: "opacity 0.3s" }}
        >
          {displayItems.map((item, i) => (
            <Link
              key={`news-${item.id}-${i}`}
              href={item.href}
              className="flex items-center gap-2 shrink-0 group"
            >
              <span
                className={`px-2 py-0.5 ${item.tagColor || "bg-brand-500/10 text-brand-300"} rounded-full text-[10px] font-medium whitespace-nowrap`}
              >
                {item.tag}
              </span>
              <span className="text-sm text-slate-300 group-hover:text-brand-300 transition-colors whitespace-nowrap">
                {item.title}
              </span>
            </Link>
          ))}
        </div>
        <div className="absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-slate-900/90 to-transparent pointer-events-none" />
        <div className="absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-slate-900/90 to-transparent pointer-events-none" />
      </div>
    </div>
  );
}
