"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { articles, categories } from "@/data/knowledge";
import { LAST_UPDATE_TIME } from "@/data/update-time";
import ArticleCard from "@/components/ArticleCard";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import CategoryFilter from "@/components/CategoryFilter";
import LearningPathSection from "@/components/LearningPathSection";
import { useStatsBatch } from "@/hooks/useStatsBatch";

const PAGE_SIZE = 9;
const levelOrder: Record<string, number> = { 入门: 1, 进阶: 2, 高级: 3 };

export default function KnowledgePage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  type SortKey = "default" | "level-asc" | "level-desc" | "date-desc" | "date-asc" | "most-viewed" | "most-liked";

  // Use URL param only for SSR-safe initial state (no sessionStorage during render)
  const spMode = (searchParams.get("mode") as "all" | "path") || "path";
  const spCat = searchParams.get("cat") || "all";
  const spQ = searchParams.get("q") || "";
  const rawSort = searchParams.get("sort");
  const spSort = (rawSort === "default" || !rawSort ? "date-desc" : rawSort) as SortKey;
  const spPage = parseInt(searchParams.get("page") || "1") || 1;

  const [mode, setMode] = useState<"all" | "path">(spMode);
  const [activeCategory, setActiveCategory] = useState(spCat);
  const [searchQuery, setSearchQuery] = useState(spQ);
  const [sortBy, setSortBy] = useState<SortKey>(spSort);
  const [currentPage, setCurrentPage] = useState(spPage);
  const { statsMap, loading: statsLoading, fetchStats } = useStatsBatch();

  // After hydration, restore mode from sessionStorage if URL has no explicit mode
  useEffect(() => {
    if (!searchParams.get("mode")) {
      const saved = sessionStorage.getItem('knowledge-mode');
      if (saved) setMode(saved as "all" | "path");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync state whenever searchParams changes
  useEffect(() => {
    const m = (searchParams.get("mode") as "all" | "path") || sessionStorage.getItem('knowledge-mode') || "all";
    setMode(m);
    setActiveCategory(searchParams.get("cat") || "all");
    setSearchQuery(searchParams.get("q") || "");
    setSortBy((searchParams.get("sort") as SortKey) || "date-desc");
    setCurrentPage(parseInt(searchParams.get("page") || "1") || 1);
  }, [searchParams]);

  // Also handle browser back/forward via popstate
  useEffect(() => {
    const onPopState = () => {
      const saved = sessionStorage.getItem('knowledge-mode');
      const p = new URLSearchParams(window.location.search);
      setMode((saved || p.get("mode") || "all") as "all" | "path");
      setActiveCategory(p.get("cat") || "all");
      setSearchQuery(p.get("q") || "");
      setSortBy((p.get("sort") as SortKey) || "date-desc");
      setCurrentPage(parseInt(p.get("page") || "1") || 1);
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  // Sync state → URL (skip first render, we already init from URL)
  const isInitialMount = useRef(true);
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    const params = new URLSearchParams();
    if (mode === "path") params.set("mode", "path");
    if (mode === "all") {
      if (activeCategory !== "all") params.set("cat", activeCategory);
      if (searchQuery) params.set("q", searchQuery);
      if (sortBy !== "date-desc") params.set("sort", sortBy);
      if (currentPage > 1) params.set("page", String(currentPage));
    }

    const query = params.toString();
    const url = query ? `${pathname}?${query}` : pathname;
    window.history.replaceState(null, '', url);
    // Also sync mode to sessionStorage for navigation persistence
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('knowledge-mode', mode);
    }
  }, [mode, activeCategory, searchQuery, sortBy, currentPage, pathname]);

  const syncModeToUrl = (newMode: "all" | "path") => {
    if (typeof window !== 'undefined') window.scrollTo({ top: 0 });
    // Update sessionStorage FIRST so it's available before navigation
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('knowledge-mode', newMode);
    }
    setMode(newMode);
    const params = new URLSearchParams();
    if (newMode === "path") params.set("mode", "path");
    const url = params.toString() ? `${pathname}?${params.toString()}` : pathname;
    router.push(url, { scroll: false });
  };

  // Prefetch stats on mount so stats-sort is instant
  useEffect(() => {
    fetchStats(articles.map((a) => `article:${a.id}`));
  }, [fetchStats]);

  const filteredArticles = useMemo(() => {
    let result = articles.filter((a) => {
      const matchCategory = activeCategory === "all" || a.category === activeCategory;
      const matchSearch =
        !searchQuery ||
        a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())) ||
        a.summary.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCategory && matchSearch;
    });
    if (sortBy === "level-asc") {
      result = [...result].sort((a, b) => levelOrder[a.level] - levelOrder[b.level]);
    } else if (sortBy === "level-desc") {
      result = [...result].sort((a, b) => levelOrder[b.level] - levelOrder[a.level]);
    } else if (sortBy === "date-desc") {
      result = [...result].sort((a, b) => {
        const dateA = a.updatedAt || a.date;
        const dateB = b.updatedAt || b.date;
        const dateDiff = new Date(dateB).getTime() - new Date(dateA).getTime();
        if (dateDiff !== 0) return dateDiff;
        return b.id.localeCompare(a.id);
      });
    } else if (sortBy === "date-asc") {
      result = [...result].sort((a, b) => {
        const dateA = a.updatedAt || a.date;
        const dateB = b.updatedAt || b.date;
        const dateDiff = new Date(dateA).getTime() - new Date(dateB).getTime();
        if (dateDiff !== 0) return dateDiff;
        return a.id.localeCompare(b.id);
      });
    } else if (sortBy === "most-viewed") {
      result = [...result].sort((a, b) => {
        const diff = (statsMap[`article:${b.id}`]?.views ?? 0) - (statsMap[`article:${a.id}`]?.views ?? 0);
        if (diff !== 0) return diff;
        // 相同时按日期倒序兜底
        const dateDiff = new Date(b.date).getTime() - new Date(a.date).getTime();
        return dateDiff !== 0 ? dateDiff : b.id.localeCompare(a.id);
      });
    } else if (sortBy === "most-liked") {
      result = [...result].sort((a, b) => {
        const diff = (statsMap[`article:${b.id}`]?.likes ?? 0) - (statsMap[`article:${a.id}`]?.likes ?? 0);
        if (diff !== 0) return diff;
        const dateDiff = new Date(b.date).getTime() - new Date(a.date).getTime();
        return dateDiff !== 0 ? dateDiff : b.id.localeCompare(a.id);
      });
    }
    return result;
  }, [activeCategory, searchQuery, sortBy, statsMap]);

  const handleFilterChange = (setter: (v: string) => void, value: string) => {
    setter(value);
    setCurrentPage(1);
    if (typeof window !== 'undefined') window.scrollTo({ top: 0 });
  };

  const totalPages = Math.max(1, Math.ceil(filteredArticles.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedArticles = filteredArticles.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE
  );

  const categoryData = categories.map((c) => ({
    key: c.key,
    icon: c.icon,
    label: c.label,
    count: c.key === "all" ? articles.length : articles.filter((a) => a.category === c.key).length,
  }));

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-brand-950 text-white">
      <Navbar activePath="/knowledge" />

      {/* Hero */}
      <section className="pt-28 pb-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">
            📚 AI <span className="text-gradient">知识库</span>
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            系统化学习 AI 核心技术，从基础理论到前沿实践
          </p>
          <p className="text-sm text-slate-500 mt-3">📅 最后更新：{LAST_UPDATE_TIME}</p>
        </div>
      </section>

      {/* Mode Toggle */}
      <section className="px-4 sm:px-6 lg:px-8 pb-4">
        <div className="max-w-5xl mx-auto">
          <div className="flex justify-center">
            <div className="inline-flex rounded-xl bg-white/5 border border-white/10 p-1">
              <button
                onClick={() => syncModeToUrl("path")}
                className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${
                  mode === "path"
                    ? "bg-brand-600 text-white shadow-lg shadow-brand-500/25"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                📖 学习路线
              </button>
              <button
                onClick={() => syncModeToUrl("all")}
                className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${
                  mode === "all"
                    ? "bg-brand-600 text-white shadow-lg shadow-brand-500/25"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                📋 全部文章
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Learning Path Mode */}
      {mode === "path" && <LearningPathSection />}

      {/* All Articles Mode */}
      {mode === "all" && (
        <>
          {/* Search */}
          <section className="px-4 sm:px-6 lg:px-8 pb-6">
            <div className="max-w-5xl mx-auto">
              <div className="relative">
                <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="搜索文章、标签..."
                  value={searchQuery}
                  onChange={(e) => handleFilterChange(setSearchQuery, e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-brand-500/50 focus:ring-1 focus:ring-brand-500/25 transition-all"
                />
              </div>
            </div>
          </section>

          {/* Tiled Category Pills — PC only */}
          <section className="hidden lg:block px-4 sm:px-6 lg:px-8 pb-4">
            <div className="max-w-5xl mx-auto">
              <div className="flex flex-wrap gap-2">
                {categoryData.map((c) => {
                  const isActive = activeCategory === c.key;
                  return (
                    <button
                      key={c.key}
                      onClick={() => handleFilterChange(setActiveCategory, c.key)}
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
        </>
      )}

      {/* Articles Grid (all mode) */}
      {mode === "all" && (
      <section className="px-4 sm:px-6 lg:px-8 pb-20">
        <div className="max-w-5xl mx-auto">
          {/* Filter Bar */}
          <div className="flex items-center justify-between mb-6">
            <p className="text-sm text-slate-500 flex items-center gap-2">
              找到 <span className="text-brand-400 font-medium">{filteredArticles.length}</span> 篇文章
              {statsLoading && <span className="text-xs text-slate-500 animate-pulse">加载排行…</span>}
            </p>
            <div className="flex items-center gap-2">
              <div className="lg:hidden">
                <CategoryFilter
                  categories={categoryData}
                  activeCategory={activeCategory}
                  onChange={(key) => handleFilterChange(setActiveCategory, key)}
                />
              </div>
              <div className="hidden lg:block">
              <select
                value={sortBy}
                onChange={(e) => { setSortBy(e.target.value as typeof sortBy); setCurrentPage(1); if (typeof window !== 'undefined') window.scrollTo({ top: 0 }); }}
                className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-sm text-slate-400 focus:outline-none focus:border-brand-500/50 appearance-none cursor-pointer"
              >
                <option value="date-desc">🕐 最新优先</option>
                <option value="date-asc">🕙 最早优先</option>
                <option value="level-asc">📗 由易到难</option>
                <option value="level-desc">📕 由难到易</option>
                <option value="most-viewed">👁 浏览最多</option>
                <option value="most-liked">👍 点赞最多</option>
              </select>
              </div>
              <select
                value={sortBy}
                onChange={(e) => { setSortBy(e.target.value as typeof sortBy); setCurrentPage(1); if (typeof window !== 'undefined') window.scrollTo({ top: 0 }); }}
                className="lg:hidden px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-sm text-slate-400 focus:outline-none focus:border-brand-500/50 appearance-none cursor-pointer"
              >
                <option value="date-desc">🕐 最新优先</option>
                <option value="date-asc">🕙 最早优先</option>
                <option value="level-asc">📗 由易到难</option>
                <option value="level-desc">📕 由难到易</option>
                <option value="most-viewed">👁 浏览最多</option>
                <option value="most-liked">👍 点赞最多</option>
              </select>
            </div>
          </div>

          {filteredArticles.length > 0 ? (
            <>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {paginatedArticles.map((article) => (
                  <ArticleCard key={article.id} article={article} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-10">
                  <button
                    onClick={() => { setCurrentPage((p) => Math.max(1, p - 1)); if (typeof window !== 'undefined') window.scrollTo({ top: 0 }); }}
                    disabled={safePage === 1}
                    className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-sm font-medium transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/10"
                  >
                    ← 上一页
                  </button>
                  <div className="flex items-center gap-1.5">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                      const show =
                        page === 1 ||
                        page === totalPages ||
                        Math.abs(page - safePage) <= 1;
                      const showEllipsisBefore = page === 2 && safePage > 3;
                      const showEllipsisAfter = page === totalPages - 1 && safePage < totalPages - 2;
                      if (!show) return null;
                      if (showEllipsisBefore) return <span key="eb" className="px-1 text-slate-600">…</span>;
                      if (showEllipsisAfter) return <span key="ea" className="px-1 text-slate-600">…</span>;
                      const isActive = page === safePage;
                      return (
                        <button
                          key={page}
                          onClick={() => { setCurrentPage(page); if (typeof window !== 'undefined') window.scrollTo({ top: 0 }); }}
                          className={`w-9 h-9 rounded-lg text-sm font-medium transition-all ${
                            isActive
                              ? "bg-brand-600 text-white shadow-lg shadow-brand-500/25"
                              : "bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white"
                          }`}
                        >
                          {page}
                        </button>
                      );
                    })}
                  </div>
                  <button
                    onClick={() => { setCurrentPage((p) => Math.min(totalPages, p + 1)); if (typeof window !== 'undefined') window.scrollTo({ top: 0 }); }}
                    disabled={safePage === totalPages}
                    className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-sm font-medium transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/10"
                  >
                    下一页 →
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-20">
              <div className="text-5xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold text-slate-300 mb-2">没有找到相关文章</h3>
              <p className="text-slate-500">试试其他关键词或切换分类</p>
              <button
                onClick={() => { setSearchQuery(""); setActiveCategory("all"); setCurrentPage(1); }}
                className="mt-4 px-6 py-2 bg-brand-600 hover:bg-brand-500 rounded-lg font-medium transition-all"
              >
                重置筛选
              </button>
            </div>
          )}
        </div>
      </section>
      )}

      <Footer />
    </main>
  );
}
