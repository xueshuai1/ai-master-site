"use client";

import Link from "next/link";
import { useState, useMemo } from "react";
import { news } from "@/data/news";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import CategoryFilter from "@/components/CategoryFilter";

const NEWS_PER_PAGE = 9;

function getLast3DaysNews() {
  const now = new Date();
  const threeDaysAgo = new Date(now);
  threeDaysAgo.setDate(now.getDate() - 2);
  threeDaysAgo.setHours(0, 0, 0, 0);

  return news.filter((n) => {
    const datePart = n.date.split(" ")[0];
    const d = new Date(datePart + "T00:00:00");
    return d >= threeDaysAgo;
  });
}

function formatNewsTime(dateStr: string): string {
  const now = new Date();
  const parts = dateStr.split(" ");
  const d = parts.length === 2
    ? new Date(parts[0] + "T" + parts[1] + ":00")
    : new Date(parts[0] + "T00:00:00");
  const diffMs = now.getTime() - d.getTime();
  const diffMin = Math.floor(diffMs / (1000 * 60));
  const diffHour = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDay = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMin < 1) return "刚刚";
  if (diffMin < 60) return `${diffMin} 分钟前`;
  if (diffHour < 24) return `${diffHour} 小时前`;
  if (diffDay === 1) return `昨天 ${parts[1] || ""}`.trim();
  if (diffDay < 7) return `${diffDay} 天前`;
  return dateStr;
}

// Tag icon mapping
const tagIcons: Record<string, string> = {
  "行业动态": "📡",
  "AI 安全": "🔒",
  "AI 工具": "🛠️",
  "学术研究": "🔬",
  "公司动态": "🏢",
  "产品动态": "📦",
  "模型发布": "🧠",
  "AI 硬件": "🤖",
  "融资": "💰",
  "AI 框架": "🏗️",
  "军事科技": "🎖️",
};

export default function NewsPage() {
  const recentNews = useMemo(() => getLast3DaysNews(), []);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTag, setActiveTag] = useState<string>("全部");

  const allTags = useMemo(() => {
    const tags = Array.from(new Set(recentNews.map(n => n.tag)));
    return ["全部", ...tags.sort()];
  }, [recentNews]);

  const filteredNews = useMemo(() => {
    if (activeTag === "全部") return recentNews;
    return recentNews.filter(n => n.tag === activeTag);
  }, [recentNews, activeTag]);

  const sortedNews = useMemo(
    () => [...filteredNews].sort((a, b) => b.date.localeCompare(a.date)),
    [filteredNews]
  );

  const handleTagChange = (tag: string) => {
    setActiveTag(tag);
    setCurrentPage(1);
  };

  const totalPages = Math.max(1, Math.ceil(sortedNews.length / NEWS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * NEWS_PER_PAGE;
  const paginatedNews = sortedNews.slice(startIndex, startIndex + NEWS_PER_PAGE);

  const tagCategoryData = allTags.map((tag) => ({
    key: tag,
    icon: tag === "全部" ? "🏷️" : (tagIcons[tag] || "📌"),
    label: tag,
    count: tag === "全部" ? recentNews.length : recentNews.filter((n) => n.tag === tag).length,
  }));

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-brand-950 text-white">
      <Navbar activePath="/news" />

      {/* Hero */}
      <section className="pt-28 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">
            📰 AI <span className="text-gradient">最新动态</span>
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            紧跟行业脉搏，不错过任何重要进展
          </p>
          {recentNews.length > 0 && (
            <p className="text-sm text-slate-500 mt-3">
              最近 3 天共 <span className="text-brand-400 font-medium">{recentNews.length}</span> 条动态
            </p>
          )}
        </div>
      </section>

      {/* News List */}
      <section className="px-4 sm:px-6 lg:px-8 pb-20">
        <div className="max-w-5xl mx-auto">
          {/* Filter Bar */}
          <div className="flex items-center justify-between mb-6">
            <p className="text-sm text-slate-500">
              筛选结果 <span className="text-brand-400 font-medium">{filteredNews.length}</span> 条
            </p>
            {allTags.length > 1 && (
              <CategoryFilter
                categories={tagCategoryData}
                activeCategory={activeTag}
                onChange={handleTagChange}
              />
            )}
          </div>

          {paginatedNews.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">📭</div>
              <h2 className="text-xl font-semibold text-slate-400 mb-2">暂无最新动态</h2>
              <p className="text-slate-500">请稍后再来查看</p>
            </div>
          ) : (
            <div className="space-y-6">
              {paginatedNews.map((item, index) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="group flex flex-col sm:flex-row gap-5 p-5 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-brand-500/20 transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-brand-500/5"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className={`px-2.5 py-0.5 ${item.tagColor || "bg-brand-500/10 text-brand-300"} rounded-full text-xs font-medium`}>
                        {item.tag}
                      </span>
                      <span className="text-xs text-slate-500 font-mono">{formatNewsTime(item.date)}</span>
                      <span className="text-xs text-slate-600">·</span>
                      <span className="text-xs text-slate-500 truncate">{item.source}</span>
                    </div>

                    <h3 className="text-lg font-semibold group-hover:text-brand-300 transition-colors leading-snug mb-2">
                      {item.title}
                    </h3>

                    <p className="text-slate-400 text-sm leading-relaxed line-clamp-2">
                      {item.summary}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-12 flex items-center justify-center gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={safePage === 1}
                className="px-3 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white"
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
                className="px-3 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white"
              >
                下一页 →
              </button>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </main>
  );
}
