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
 * 数字滚动动画：
 * - 元素首次进入视口时触发（只触发一次）
 * - easeOutCubic 缓动，~1.5s
 * - 千分位格式化
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
  const [current, setCurrent] = useState(display ? value : 0);
  const startedRef = useRef(false);

  useEffect(() => {
    if (display) return;
    const el = ref.current;
    if (!el) return;

    const start = () => {
      if (startedRef.current) return;
      startedRef.current = true;
      const startTs = performance.now();
      const animate = (ts: number) => {
        const t = Math.min(1, (ts - startTs) / duration);
        const eased = 1 - Math.pow(1 - t, 3); // easeOutCubic
        setCurrent(Math.round(eased * value));
        if (t < 1) requestAnimationFrame(animate);
      };
      requestAnimationFrame(animate);
    };

    // 若浏览器不支持 IO 或元素已在视口内，立即开始
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

  return (
    <span ref={ref} className={className}>
      {prefix}
      {current.toLocaleString("zh-CN")}
      {suffix}
    </span>
  );
}
