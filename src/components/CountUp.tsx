"use client";

import { useEffect, useRef, useState } from "react";

interface CountUpProps {
  /** 目标数值（display 非空时此值忽略） */
  value: number;
  /** 动画时长（毫秒） */
  duration?: number;
  /** 前缀，如 "$" */
  prefix?: string;
  /** 后缀，如 "+" */
  suffix?: string;
  /**
   * 非数字模式：直接展示该字符串（不做动画）。
   * 适合 "100%"、"∞" 这种数值之外的展示。
   */
  display?: string;
  className?: string;
}

/**
 * SEO-friendly count-up：
 * ─────────────────────────────────────────────
 * - SSR / 首次 hydration → 直接输出最终值（爬虫看到的就是真实数字）
 * - 客户端进入视口后才重置到 0 并 ease-out 动画回到最终值
 * - 用户偏好「减少动效」(prefers-reduced-motion) 时跳过动画
 * - `aria-label` 始终为最终值，便于无障碍 / 不执行 JS 的抓取器读取
 */
export default function CountUp({
  value,
  duration = 1500,
  prefix = "",
  suffix = "",
  display,
  className,
}: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);
  /**
   * null 表示「尚未进入动画状态」，渲染时回退到最终 value。
   * 这样 SSR / hydration / prefers-reduced-motion / 视口外 都显示真实数字。
   */
  const [animated, setAnimated] = useState<number | null>(null);
  const startedRef = useRef(false);

  useEffect(() => {
    if (display) return;
    if (typeof window === "undefined") return;

    // 尊重系统的「减少动效」偏好
    const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    const el = ref.current;
    if (!el) return;

    const start = () => {
      if (startedRef.current) return;
      startedRef.current = true;
      setAnimated(0);
      const startTs = performance.now();
      const animate = (ts: number) => {
        const t = Math.min(1, (ts - startTs) / duration);
        const eased = 1 - Math.pow(1 - t, 3); // easeOutCubic
        setAnimated(Math.round(eased * value));
        if (t < 1) requestAnimationFrame(animate);
      };
      requestAnimationFrame(animate);
    };

    if (typeof IntersectionObserver === "undefined") {
      start();
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            start();
            io.disconnect();
            break;
          }
        }
      },
      { threshold: 0.3 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [value, duration, display]);

  if (display) {
    return (
      <span ref={ref} className={className}>
        {display}
      </span>
    );
  }

  const shown = animated ?? value;
  const finalText = `${prefix}${value.toLocaleString("zh-CN")}${suffix}`;

  return (
    <span ref={ref} className={className} aria-label={finalText}>
      {prefix}
      {shown.toLocaleString("zh-CN")}
      {suffix}
    </span>
  );
}
