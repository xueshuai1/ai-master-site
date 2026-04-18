'use client';

import { useState, useRef, useEffect } from 'react';
import dynamic from 'next/dynamic';

// 动态导入 MermaidChartWithActions（不阻塞首屏）
const MermaidChartWithActions = dynamic(() => import('./MermaidChartWithActions'), { ssr: false });

interface LazyMermaidProps {
  chart: string;
}

export default function LazyMermaid({ chart }: LazyMermaidProps) {
  const [inView, setInView] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: '400px' } // 提前 400px 开始渲染
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref}>
      {inView ? (
        <MermaidChartWithActions chart={chart} />
      ) : (
        <div className="flex items-center justify-center h-48 text-slate-500 animate-pulse">
          正在加载图表...
        </div>
      )}
    </div>
  );
}
