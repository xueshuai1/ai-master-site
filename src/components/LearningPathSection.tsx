"use client";

import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { articles, Article } from "@/data/knowledge";
import { learningRoutes, isGuideId } from "@/data/learning-paths";
import ArticleCard from "@/components/ArticleCard";
// 注：阶段时长直接显示 learning-paths.ts 中手写的 duration，不再做按 readTime 推算。

const MAX_SHOW = 6;

export default function LearningPathSection() {
  const savedRoute = typeof window !== "undefined" ? sessionStorage.getItem("lp-route") : null;
  const defaultRoute = learningRoutes[0]?.id || "fast";
  const initialRoute = savedRoute && learningRoutes.some((r) => r.id === savedRoute) ? savedRoute : defaultRoute;

  const [activeRoute, setActiveRoute] = useState<string>(initialRoute);
  const [expandedPhases, setExpandedPhases] = useState<Set<string>>(new Set());
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      sessionStorage.setItem("lp-route", activeRoute);
    }
  }, [activeRoute]);

  const scrollToActive = useCallback(() => {
    if (scrollRef.current) {
      const btn = scrollRef.current.querySelector('[data-active="true"]') as HTMLElement | null;
      if (btn) btn.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
    }
  }, []);

  useEffect(() => {
    if (savedRoute && savedRoute !== defaultRoute) {
      requestAnimationFrame(scrollToActive);
    }
  }, [savedRoute, defaultRoute, scrollToActive]);

  const route = learningRoutes.find((r) => r.id === activeRoute) || learningRoutes[0];

  // 文章 ID → Article 的 O(1) 查询表
  const articleById = useMemo(() => {
    const m = new Map<string, Article>();
    for (const a of articles) m.set(a.id, a);
    return m;
  }, []);

  // 编译每条路线的阶段：按 articleIds 顺序解析；同一路线内自动去重；忽略不存在的 ID
  const phaseData = useMemo(() => {
    const seenInRoute = new Set<string>();
    return route.phases.map((phase) => {
      const resolved: Article[] = [];
      for (const id of phase.articleIds) {
        if (seenInRoute.has(id)) continue;
        const article = articleById.get(id);
        if (!article) continue; // 忽略不存在的 ID
        seenInRoute.add(id);
        resolved.push(article);
      }
      return { phase, articles: resolved };
    });
  }, [route, articleById]);

  const toggleExpand = (id: string) => {
    setExpandedPhases((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <section className="px-4 sm:px-6 lg:px-8 pb-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <h2 className="text-2xl sm:text-3xl font-bold mb-2">🗺️ AI 学习路线</h2>
          <p className="text-slate-400 text-sm sm:text-base max-w-xl mx-auto mb-5">
            按目标选择路线，每个阶段都已为你精选文章并按顺序排列
          </p>
        </div>

        {/* Route Selector — 移动端可横向滚动 */}
        <div className="flex justify-center mb-6">
          <div ref={scrollRef} className="flex gap-2 overflow-x-auto pb-2 max-w-full scrollbar-hide">
            {learningRoutes.map((r) => {
              const isActive = activeRoute === r.id;
              return (
                <button
                  key={r.id}
                  data-active={isActive ? "true" : undefined}
                  onClick={() => {
                    setActiveRoute(r.id);
                    setExpandedPhases(new Set());
                  }}
                  className={`shrink-0 px-3 py-2 rounded-xl text-sm font-medium transition-all border whitespace-nowrap ${
                    isActive
                      ? `${r.badgeColor} ${r.borderColor} shadow-lg`
                      : "text-slate-400 border-white/10 hover:text-white hover:border-white/20 hover:bg-white/5"
                  }`}
                >
                  {r.emoji} {r.name}
                  <span className="ml-1 text-xs opacity-60">{r.duration}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Route Description */}
        <div className={`text-center mb-6 px-4 py-3 rounded-xl ${route.borderColor} border bg-white/5`}>
          <p className={`text-sm ${route.badgeColor.split(" ")[1]}`}>💡 {route.description}</p>
          <p className="text-xs text-slate-500 mt-1">🎯 {route.target}</p>
        </div>

        {/* Timeline
            统一中心线在 left-6（24px）：
            - 竖线：left-6 -ml-px w-0.5 → 占据 23-25px，中心 24px
            - 圆点 / 箭头：left-6 -translate-x-1/2 → 自身居中到 24px
        */}
        <div className="relative">
          <div className={`absolute left-6 -ml-px top-0 bottom-0 w-0.5 bg-gradient-to-b ${route.lineGradient}`} />

          {phaseData.map(({ phase, articles: phaseArts }, idx) => {
            const isExpanded = expandedPhases.has(phase.id);

            // 第一篇若为「学习导览」型文章则单独高亮
            const guide = phaseArts.length > 0 && isGuideId(phaseArts[0].id) ? phaseArts[0] : null;
            const rest = guide ? phaseArts.slice(1) : phaseArts;
            const visible = isExpanded ? rest : rest.slice(0, MAX_SHOW);
            const hasMore = rest.length > MAX_SHOW;

            return (
              <div key={phase.id} className="relative pl-14 sm:pl-16 mb-6 last:mb-0">
                <div className={`absolute left-6 -translate-x-1/2 top-6 w-3 h-3 rounded-full ${phase.dotColor} ring-4 ring-slate-900 z-10`} />
                {idx > 0 && (
                  <div className="absolute left-6 -translate-x-1/2 -top-3 leading-none">
                    <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                    </svg>
                  </div>
                )}
                <div className={`rounded-2xl bg-gradient-to-r ${phase.bgGradient} bg-white/5 backdrop-blur-md border border-white/10 border-l-4 ${phase.borderColor} p-5 sm:p-6`}>
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xl">{phase.emoji}</span>
                        <h3 className="text-lg sm:text-xl font-bold">
                          第 {idx + 1} 阶段：{phase.title}
                        </h3>
                      </div>
                      <p className="text-slate-400 text-sm">{phase.description}</p>
                    </div>
                    <span className="shrink-0 px-3 py-1 rounded-full bg-white/10 text-xs font-medium text-slate-300">
                      ⏱ {phase.duration}
                      <span className="opacity-60 ml-1">· {phaseArts.length} 篇</span>
                    </span>
                  </div>

                  {/* 学习导览 */}
                  {guide && (
                    <div className="mb-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm">📖</span>
                        <span className="text-sm font-medium text-brand-300">学习导览</span>
                      </div>
                      <ArticleCard article={guide} />
                    </div>
                  )}

                  {/* 其他文章 */}
                  {rest.length > 0 ? (
                    <>
                      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {visible.map((a) => (
                          <ArticleCard key={a.id} article={a} />
                        ))}
                      </div>
                      {hasMore && (
                        <div className="mt-4 text-center">
                          <button
                            onClick={() => toggleExpand(phase.id)}
                            className="px-5 py-2 rounded-lg bg-white/5 border border-white/10 text-sm font-medium text-slate-300 hover:bg-white/10 hover:text-white transition-all"
                          >
                            {isExpanded ? `收起（${rest.length} 篇）` : `展开全部（${rest.length} 篇）`}
                          </button>
                        </div>
                      )}
                    </>
                  ) : guide ? null : (
                    <div className="text-center py-6">
                      <p className="text-slate-500 text-sm">本阶段文章筹备中，敬请期待</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
