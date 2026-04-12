"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { articles, categories } from "@/data/knowledge";
import { LAST_UPDATE_TIME } from "@/data/update-time";
import ArticleCard from "@/components/ArticleCard";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";

export default function KnowledgePage() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredArticles = useMemo(() => {
    return articles.filter((a) => {
      const matchCategory =
        activeCategory === "all" || a.category === activeCategory;
      const matchSearch =
        !searchQuery ||
        a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())) ||
        a.summary.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCategory && matchSearch;
    });
  }, [activeCategory, searchQuery]);

  const categoryStats = useMemo(() => {
    return categories
      .filter((c) => c.key !== "all")
      .map((c) => ({
        ...c,
        count: articles.filter((a) => a.category === c.key).length,
      }));
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-brand-950 text-white">
      {/* Navigation */}
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

      {/* Category Stats */}
      <section className="px-4 sm:px-6 lg:px-8 pb-8">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            {categoryStats.map((c) => (
              <div
                key={c.key}
                className="text-center p-4 rounded-xl bg-white/10 border border-white/10 hover:border-brand-500/30 transition-all"
              >
                <div className="text-2xl mb-1">{c.icon}</div>
                <div className="text-sm font-medium text-slate-300">{c.label}</div>
                <div className="text-xs text-slate-500 mt-0.5">{c.count} 篇</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Search & Filter */}
      <section className="px-4 sm:px-6 lg:px-8 pb-6">
        <div className="max-w-5xl mx-auto">
          {/* Search bar */}
          <div className="relative mb-6">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="搜索文章、标签..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-brand-500/50 focus:ring-1 focus:ring-brand-500/25 transition-all"
            />
          </div>

          {/* Category tabs - scrollable on mobile */}
          <div className="flex flex-wrap gap-2 sm:gap-3 justify-start sm:justify-center pb-2 scrollbar-hide">
            {categories.map((c) => {
              const count = c.key === "all"
                ? articles.length
                : articles.filter((a) => a.category === c.key).length;
              const isActive = activeCategory === c.key;
              return (
                <button
                  key={c.key}
                  onClick={() => setActiveCategory(c.key)}
                  className={`shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
                    isActive
                      ? "bg-brand-600 text-white shadow-lg shadow-brand-500/25"
                      : "bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <span>{c.icon}</span>
                  <span>{c.label}</span>
                  <span className={`text-xs ${isActive ? "text-brand-200" : "text-slate-600"}`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Articles Grid */}
      <section className="px-4 sm:px-6 lg:px-8 pb-20">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <p className="text-sm text-slate-500">
              找到 <span className="text-brand-400 font-medium">{filteredArticles.length}</span> 篇文章
            </p>
          </div>

          {filteredArticles.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredArticles.map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="text-5xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold text-slate-300 mb-2">没有找到相关文章</h3>
              <p className="text-slate-500">试试其他关键词或切换分类</p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setActiveCategory("all");
                }}
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
