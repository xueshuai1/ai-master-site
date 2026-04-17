"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { articles, categories } from "@/data/knowledge";
import { LAST_UPDATE_TIME } from "@/data/update-time";
import ArticleCard from "@/components/ArticleCard";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import CategoryFilter from "@/components/CategoryFilter";
import LearningPathSection from "@/components/LearningPathSection";

const PAGE_SIZE = 9;
const levelOrder: Record<string, number> = { 入门: 1, 进阶: 2, 高级: 3 };

export default function KnowledgePage() {
  const [mode, setMode] = useState<"all" | "path">("all");
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"default" | "level-asc" | "level-desc">("level-asc");
  const [currentPage, setCurrentPage] = useState(1);

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
    }
    return result;
  }, [activeCategory, searchQuery, sortBy]);

  const handleFilterChange = (setter: (v: string) => void, value: string) => {
    setter(value);
    setCurrentPage(1);
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
                onClick={() => setMode("all")}
                className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${
                  mode === "all"
                    ? "bg-brand-600 text-white shadow-lg shadow-brand-500/25"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                📋 全部文章
              </button>
              <button
                onClick={() => setMode("path")}
                className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${
                  mode === "path"
                    ? "bg-brand-600 text-white shadow-lg shadow-brand-500/25"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                📖 学习路线
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
        </>
      )}

      {/* Articles Grid (all mode) */}
      {mode === "all" && (
      <section className="px-4 sm:px-6 lg:px-8 pb-20">
        <div className="max-w-5xl mx-auto">
          {/* Filter Bar */}
          <div className="flex items-center justify-between mb-6">
            <p className="text-sm text-slate-500">
              找到 <span className="text-brand-400 font-medium">{filteredArticles.length}</span> 篇文章
            </p>
            <div className="flex items-center gap-2">
              <CategoryFilter
                categories={categoryData}
                activeCategory={activeCategory}
                onChange={(key) => handleFilterChange(setActiveCategory, key)}
              />
              <select
                value={sortBy}
                onChange={(e) => { setSortBy(e.target.value as typeof sortBy); setCurrentPage(1); }}
                className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-sm text-slate-400 focus:outline-none focus:border-brand-500/50 appearance-none cursor-pointer"
              >
                <option value="default">排序</option>
                <option value="level-asc">难度 ↑</option>
                <option value="level-desc">难度 ↓</option>
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
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
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
                          onClick={() => setCurrentPage(page)}
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
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
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
