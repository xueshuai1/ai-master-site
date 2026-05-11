"use client";

import { useState, useEffect } from "react";

/**
 * 「回到顶部」按钮：
 * - 滚过 400 px 后淡入；从下方 16 px 处缓缓上滑
 * - 环形进度条显示页面阅读进度（已读 / 总长）
 * - 渐变背景 + 阴影发光，悬浮时上移、放大、加亮
 * - 点击 = smooth scroll 到顶部
 */
export default function BackToTop() {
  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const scrolled = window.scrollY;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const pct = max > 0 ? Math.min(1, Math.max(0, scrolled / max)) : 0;
      setProgress(pct);
      setVisible(scrolled > 400);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  // 环形进度条参数（与按钮 48 px 直径匹配）
  const size = 48;
  const stroke = 2;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - progress);

  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label="回到顶部"
      title="回到顶部"
      className={`group fixed bottom-6 right-6 z-50 flex h-12 w-12 items-center justify-center rounded-full
        bg-gradient-to-br from-brand-500 via-brand-600 to-accent-600
        shadow-[0_10px_30px_-8px_rgba(53,127,255,0.55)]
        ring-1 ring-white/15
        transition-[opacity,transform,box-shadow] duration-300 ease-out
        hover:-translate-y-1 hover:scale-105
        hover:shadow-[0_18px_40px_-8px_rgba(139,92,246,0.65)]
        hover:ring-white/30
        active:scale-95
        ${visible ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-4 opacity-0"}`}
    >
      {/* 阅读进度环 */}
      <svg
        className="pointer-events-none absolute inset-0 -rotate-90"
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        aria-hidden
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.18)"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.9)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          style={{ transition: "stroke-dashoffset 120ms linear" }}
        />
      </svg>

      {/* 箭头图标 */}
      <svg
        className="relative h-5 w-5 text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.25)]
          transition-transform duration-300 group-hover:-translate-y-0.5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <path d="M12 19V5M5 12l7-7 7 7" />
      </svg>

      {/* 悬浮时的发光光晕（位于按钮之下） */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 rounded-full bg-gradient-to-br from-brand-500 to-accent-600
          opacity-0 blur-xl transition-opacity duration-300 group-hover:opacity-60"
      />
    </button>
  );
}
