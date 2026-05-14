"use client";

import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { toolCategories } from "@/data/tools";
import { enrichedTools } from "@/lib/tools-helpers";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import CategoryFilter from "@/components/CategoryFilter";
import ToolCard from "@/components/ToolCard";
import Paginator from "@/components/Paginator";
import { useDebounced } from "@/lib/use-debounced";
import { useStatsBatch } from "@/hooks/useStatsBatch";

const TOOLS_PER_PAGE = 21;
const SEARCH_DEBOUNCE_MS = 200;

type SortKey = "stars" | "newest" | "hottest" | "most-liked" | "best-rated";

export default function ToolsListClient() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [activeCategory, setActiveCategory] = useState(searchParams.get("cat") || "all");
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get("page") || "1") || 1);
  const [sortBy, setSortBy] = useState<SortKey>((searchParams.get("sort") as SortKey) || "stars");
  const { statsMap, loading: statsLoading, fetchStats } = useStatsBatch();

  // debounce 搜索框，避免每个按键都 router.replace + 全表过滤
  const debouncedSearch = useDebounced(searchQuery, SEARCH_DEBOUNCE_MS);
  const isInitialMount = useRef(true);

  /** 同步当前 filter 状态到 URL（保留其他参数语义） */
  const syncUrl = useCallback(
    (params: { cat?: string; q?: string; sort?: SortKey; page?: number }) => {
      const u = new URLSearchParams();
      if (params.cat && params.cat !== "all") u.set("cat", params.cat);
      if (params.q) u.set("q", params.q);
      if (params.sort && params.sort !== "stars") u.set("sort", params.sort);
      if (params.page && params.page > 1) u.set("page", String(params.page));
      const query = u.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    [pathname, router],
  );

  // filter 改变 → 重置页码 + 同步 URL
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    setCurrentPage(1);
    syncUrl({ cat: activeCategory, q: debouncedSearch, sort: sortBy, page: 1 });
  }, [activeCategory, debouncedSearch, sortBy, syncUrl]);

  const goToPage = useCallback(
    (page: number) => {
      setCurrentPage(page);
      syncUrl({ cat: activeCategory, q: debouncedSearch, sort: sortBy, page });
      if (typeof window !== "undefined") window.scrollTo({ top: 0 });
    },
    [activeCategory, debouncedSearch, sortBy, syncUrl],
  );

  // Prefetch stats on mount so stats-sort is instant
  useEffect(() => {
    fetchStats(enrichedTools.map((t) => `tool:${t.id}`));
  }, [fetchStats]);

  const filteredTools = useMemo(() => {
    const q = debouncedSearch.toLowerCase().trim();
    let result = enrichedTools.filter((t) => {
      const matchCategory = activeCategory === "all" || t.category === activeCategory;
      if (!matchCategory) return false;
      if (!q) return true;
      return (
        t.name.toLowerCase().includes(q) ||
        t.tags.some((tag) => tag.toLowerCase().includes(q)) ||
        t.description.toLowerCase().includes(q)
      );
    });
    if (sortBy === "stars") {
      result = [...result].sort((a, b) => (b.githubStars ?? 0) - (a.githubStars ?? 0));
    } else if (sortBy === "newest") {
      result = [...result].sort((a, b) => {
        const aDate = a.createdAt ?? "";
        const bDate = b.createdAt ?? "";
        if (!aDate && !bDate) return 0;
        if (!aDate) return 1;
        if (!bDate) return -1;
        return bDate.localeCompare(aDate);
      });
    } else if (sortBy === "hottest") {
      result = [...result].sort((a, b) => (b.delta ?? 0) - (a.delta ?? 0));
    } else if (sortBy === "most-liked") {
      result = [...result].sort((a, b) => {
        const diff = (statsMap[`tool:${b.id}`]?.likes ?? 0) - (statsMap[`tool:${a.id}`]?.likes ?? 0);
        if (diff !== 0) return diff;
        // 相同时按 stars 兜底
        return (b.githubStars ?? 0) - (a.githubStars ?? 0);
      });
    } else if (sortBy === "best-rated") {
      result = [...result].sort((a, b) => {
        const sa = statsMap[`tool:${a.id}`];
        const sb = statsMap[`tool:${b.id}`];
        const scoreB = (sb?.likes ?? 0) - (sb?.dislikes ?? 0);
        const scoreA = (sa?.likes ?? 0) - (sa?.dislikes ?? 0);
        const diff = scoreB - scoreA;
        if (diff !== 0) return diff;
        return (b.githubStars ?? 0) - (a.githubStars ?? 0);
      });
    }
    return result;
  }, [activeCategory, debouncedSearch, sortBy, statsMap]);

  const totalPages = Math.max(1, Math.ceil(filteredTools.length / TOOLS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedTools = filteredTools.slice(
    (safePage - 1) * TOOLS_PER_PAGE,
    safePage * TOOLS_PER_PAGE,
  );

  const categoryData = toolCategories.map((c) => ({
    key: c.key,
    icon: c.icon,
    label: c.label,
    count:
      c.key === "all"
        ? enrichedTools.length
        : enrichedTools.filter((t) => t.category === c.key).length,
  }));

  const resetFilters = () => {
    setSearchQuery("");
    setActiveCategory("all");
    setSortBy("stars");
    setCurrentPage(1);
    syncUrl({ cat: "all", q: "", sort: "stars", page: 1 });
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-brand-950 text-white">
      <Navbar activePath="/tools" />

      <section className="pt-28 pb-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">
            🛠️ <span className="text-gradient">AI 工具</span>
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            精选最实用的 GitHub 开源 AI 项目，发现优质框架、模型与工具
          </p>
        </div>
      </section>

      <section className="px-4 sm:px-6 lg:px-8 pb-6">
        <div className="max-w-5xl mx-auto">
          <div className="relative">
            <svg
              className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="搜索项目、标签..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-brand-500/50 focus:ring-1 focus:ring-brand-500/25 transition-all"
              aria-label="搜索工具"
            />
          </div>
        </div>
      </section>

      <section className="hidden lg:block px-4 sm:px-6 lg:px-8 pb-4">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-wrap gap-2">
            {categoryData.map((c) => {
              const isActive = activeCategory === c.key;
              return (
                <button
                  key={c.key}
                  onClick={() => setActiveCategory(c.key)}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-sm border transition-all cursor-pointer ${
                    isActive
                      ? "bg-brand-500/15 border-brand-500/40 text-brand-300 shadow-sm shadow-brand-500/10"
                      : "bg-white/5 border-white/10 text-slate-400 hover:border-brand-500/30 hover:text-white"
                  }`}
                >
                  <span>{c.icon}</span>
                  <span className="font-medium">{c.label}</span>
                  <span className="text-xs opacity-60">{c.count}</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <section className="px-4 sm:px-6 lg:px-8 pb-20">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <p className="hidden lg:flex items-center gap-2 text-sm text-slate-500">
              收录 <span className="text-brand-400 font-medium">{filteredTools.length}</span> 个开源项目
              {statsLoading && <span className="text-xs text-slate-500 animate-pulse">加载排行…</span>}
            </p>
            <div className="flex items-center gap-2">
              <div className="lg:hidden flex items-center gap-2">
                <div className="flex items-center gap-1 bg-white/5 border border-white/10 rounded-lg p-0.5">
                  {(
                    [
                      ["stars", "⭐ 最多"],
                      ["newest", "🕐 最新"],
                      ["hottest", "🔥 最火"],
                      ["most-liked", "👍 点赞"],
                      ["best-rated", "🏆 口碑"],
                    ] as [SortKey, string][]
                  ).map(([key, label]) => (
                    <button
                      key={key}
                      onClick={() => setSortBy(key)}
                      className={`px-2 py-1 rounded-md text-xs font-medium transition-all whitespace-nowrap ${
                        sortBy === key ? "bg-brand-500/20 text-brand-300" : "text-slate-400 hover:text-white"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                <CategoryFilter
                  categories={categoryData}
                  activeCategory={activeCategory}
                  onChange={(key) => setActiveCategory(key)}
                />
              </div>
              <div className="hidden lg:flex items-center gap-1 bg-white/5 border border-white/10 rounded-lg p-0.5">
                {(
                  [
                    ["stars", "⭐ Stars 最多"],
                    ["newest", "🕐 最新上线"],
                    ["hottest", "🔥 增长最快"],
                    ["most-liked", "👍 最多点赞"],
                    ["best-rated", "🏆 口碑最佳"],
                  ] as [SortKey, string][]
                ).map(([key, label]) => (
                  <button
                    key={key}
                    onClick={() => setSortBy(key)}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all whitespace-nowrap ${
                      sortBy === key ? "bg-brand-500/20 text-brand-300" : "text-slate-400 hover:text-white"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {filteredTools.length > 0 ? (
            <>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 overflow-hidden">
                {paginatedTools.map((tool) => (
                  <ToolCard key={tool.id} tool={tool} />
                ))}
              </div>
              <Paginator
                currentPage={safePage}
                totalPages={totalPages}
                onChange={goToPage}
              />
            </>
          ) : (
            <div className="text-center py-20">
              <div className="text-5xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold text-slate-300 mb-2">没有找到相关项目</h3>
              <p className="text-slate-500">试试其他关键词或切换分类</p>
              <button
                onClick={resetFilters}
                className="mt-4 px-6 py-2 bg-brand-600 hover:bg-brand-500 rounded-lg font-medium transition-all"
              >
                重置筛选
              </button>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </main>
  );
}
