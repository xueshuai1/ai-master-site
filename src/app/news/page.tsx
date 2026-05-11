"use client";

import Link from "next/link";
import { useState, useEffect, useMemo, useRef } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { news } from "@/data/news";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";

const NEWS_PER_PAGE = 9;

function getLast2WeeksNews() {
  const now = new Date();
  const twoWeeksAgo = new Date(now);
  twoWeeksAgo.setDate(now.getDate() - 13);
  twoWeeksAgo.setHours(0, 0, 0, 0);

  return news.filter((n) => {
    const datePart = n.date.split(" ")[0];
    const d = new Date(datePart + "T00:00:00");
    return d >= twoWeeksAgo;
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

export default function NewsPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const recentNews = useMemo(() => getLast2WeeksNews(), []);

  const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get("page") || "1") || 1);
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");

  const isInitialMount = useRef(true);

  useEffect(() => {
    if (isInitialMount.current) { isInitialMount.current = false; return; }
    const params = new URLSearchParams();
    if (searchQuery) params.set("q", searchQuery);
    if (currentPage > 1) params.set("page", String(currentPage));
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }, [searchQuery, currentPage, pathname, router]);

  const filteredNews = useMemo(() => {
    let result = recentNews;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(n =>
        n.title.toLowerCase().includes(q) ||
        n.summary.toLowerCase().includes(q) ||
        n.source.toLowerCase().includes(q) ||
        n.tag.toLowerCase().includes(q)
      );
    }
    return result;
  }, [recentNews, searchQuery]);

  const sortedNews = useMemo(
    () => [...filteredNews].sort((a, b) => {
      const dateDiff = b.date.localeCompare(a.date);
      if (dateDiff !== 0) return dateDiff;
      return b.id.localeCompare(a.id);
    }),
    [filteredNews]
  );

  const totalPages = Math.max(1, Math.ceil(sortedNews.length / NEWS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * NEWS_PER_PAGE;
  const paginatedNews = sortedNews.slice(startIndex, startIndex + NEWS_PER_PAGE);

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
              最近 2 周共 <span className="text-brand-400 font-medium">{recentNews.length}</span> 条动态
            </p>
          )}
        </div>
      </section>

      {/* Search */}
      <section className="px-4 sm:px-6 lg:px-8 pb-6">
        <div className="max-w-5xl mx-auto">
          <div className="relative">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="搜索新闻标题、来源、标签..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-brand-500/50 focus:ring-1 focus:ring-brand-500/25 transition-all"
            />
          </div>
        </div>
      </section>

      {/* News List */}
      <section className="px-4 sm:px-6 lg:px-8 pb-20">
        <div className="max-w-5xl mx-auto">
          {searchQuery && (
            <p className="text-sm text-slate-500 mb-6">
              搜索到 <span className="text-brand-400 font-medium">{filteredNews.length}</span> 条结果
            </p>
          )}

          {paginatedNews.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">📭</div>
              <h2 className="text-xl font-semibold text-slate-400 mb-2">{searchQuery ? "没有匹配的新闻" : "暂无最新动态"}</h2>
              <p className="text-slate-500">{searchQuery ? "试试其他关键词" : "请稍后再来查看"}</p>
              {searchQuery && (
                <button
                  onClick={() => { setSearchQuery(""); setCurrentPage(1); }}
                  className="mt-4 px-6 py-2 bg-brand-600 hover:bg-brand-500 rounded-lg font-medium transition-all"
                >
                  清除搜索
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {paginatedNews.map((item) => (
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
                onClick={() => { setCurrentPage((p) => Math.max(1, p - 1)); if (typeof window !== 'undefined') window.scrollTo({ top: 0 }); }}
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
