"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { tools, toolCategories, Tool } from "@/data/tools";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";

const priceColors: Record<string, string> = {
  免费: "bg-emerald-500/10 text-emerald-300",
  开源: "bg-blue-500/10 text-blue-300",
  付费: "bg-amber-500/10 text-amber-300",
  "免费+付费": "bg-purple-500/10 text-purple-300",
};

function ToolCard({ tool }: { tool: Tool }) {
  return (
    <a
      href={tool.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group block p-5 rounded-2xl bg-white/5 border border-white/5 hover:border-brand-500/30 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-brand-500/5"
    >
      {/* Header */}
      <div className="flex items-start gap-3 mb-3">
        <span className="text-3xl">{tool.icon}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-lg font-semibold group-hover:text-brand-300 transition-colors">
              {tool.name}
            </h3>
            <span
              className={`px-2 py-0.5 rounded-full text-xs font-medium ${priceColors[tool.price]}`}
            >
              {tool.price}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5 truncate">{tool.url.replace("https://", "")}</p>
        </div>
        <svg className="w-5 h-5 text-slate-600 group-hover:text-brand-400 transition-colors shrink-0 mt-1" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
        </svg>
      </div>

      {/* Description */}
      <p className="text-slate-400 text-sm leading-relaxed mb-4 line-clamp-2">
        {tool.description}
      </p>

      {/* Tags */}
      <div className="flex flex-wrap gap-1.5 overflow-hidden">
        {tool.tags.slice(0, 4).map((tag) => (
          <span key={tag} className="px-2 py-0.5 bg-white/5 rounded-md text-xs text-slate-400 whitespace-nowrap">
            #{tag}
          </span>
        ))}
        {tool.tags.length > 4 && (
          <span className="px-2 py-0.5 bg-white/5 rounded-md text-xs text-slate-500">
            +{tool.tags.length - 4}
          </span>
        )}
      </div>
    </a>
  );
}

export default function ToolsPage() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"default" | "recent">("default");

  const filteredTools = useMemo(() => {
    let result = tools.filter((t) => {
      const matchCategory = activeCategory === "all" || t.category === activeCategory;
      const matchSearch =
        !searchQuery ||
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase())) ||
        t.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCategory && matchSearch;
    });
    if (sortBy === "recent") {
      result = [...result].sort((a, b) => {
        const da = a.updatedAt || "2024-01-01";
        const db = b.updatedAt || "2024-01-01";
        return db.localeCompare(da);
      });
    }
    return result;
  }, [activeCategory, searchQuery, sortBy]);

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-brand-950 text-white">
      {/* Navigation */}
      <Navbar activePath="/tools" />

      {/* Hero */}
      <section className="pt-28 pb-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">
            🛠️ AI <span className="text-gradient">工具集</span>
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            精选最实用的 AI 工具与框架，提升你的开发效率
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="px-4 sm:px-6 lg:px-8 pb-8">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            {toolCategories.filter((c) => c.key !== "all").map((c) => (
              <div
                key={c.key}
                className="text-center p-4 rounded-xl bg-white/5 border border-white/5 hover:border-brand-500/20 transition-all"
              >
                <div className="text-2xl mb-1">{c.icon}</div>
                <div className="text-sm font-medium text-slate-300">{c.label}</div>
                <div className="text-xs text-slate-500 mt-0.5">
                  {tools.filter((t) => t.category === c.key).length} 个
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Search & Filter */}
      <section className="px-4 sm:px-6 lg:px-8 pb-6">
        <div className="max-w-5xl mx-auto">
          <div className="relative mb-6">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="搜索工具、标签..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-brand-500/50 focus:ring-1 focus:ring-brand-500/25 transition-all"
            />
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap sm:justify-center">
            {toolCategories.map((c) => {
              const count = c.key === "all" ? tools.length : tools.filter((t) => t.category === c.key).length;
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
                  <span className={`text-xs ${isActive ? "text-brand-200" : "text-slate-600"}`}>{count}</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Tools Grid */}
      <section className="px-4 sm:px-6 lg:px-8 pb-20">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <p className="text-sm text-slate-500">
              找到 <span className="text-brand-400 font-medium">{filteredTools.length}</span> 个工具
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSortBy("default")}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  sortBy === "default" ? "bg-brand-600 text-white" : "bg-white/5 text-slate-400 hover:bg-white/10"
                }`}
              >
                默认排序
              </button>
              <button
                onClick={() => setSortBy("recent")}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  sortBy === "recent" ? "bg-brand-600 text-white" : "bg-white/5 text-slate-400 hover:bg-white/10"
                }`}
              >
                🕒 最近更新
              </button>
            </div>
          </div>

          {filteredTools.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredTools.map((tool) => (
                <ToolCard key={tool.id} tool={tool} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="text-5xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold text-slate-300 mb-2">没有找到相关工具</h3>
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
