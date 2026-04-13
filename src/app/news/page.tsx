"use client";

import Link from "next/link";
import { useState, useMemo } from "react";
import { news } from "@/data/news";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";

const NEWS_PER_PAGE = 10;

// 只保留最近 3 天的新闻
function getLast3DaysNews() {
  const now = new Date();
  const threeDaysAgo = new Date(now);
  threeDaysAgo.setDate(now.getDate() - 2); // 包含今天、昨天、前天

  return news.filter((n) => {
    const d = new Date(n.date + "T00:00:00");
    return d >= threeDaysAgo;
  });
}

function formatDate(dateStr: string): string {
  const now = new Date();
  const d = new Date(dateStr + "T00:00:00");
  const diff = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
  if (diff === 0) return "今日";
  if (diff === 1) return "昨日";
  if (diff < 7) return `${diff} 天前`;
  return dateStr;
}

export default function NewsPage() {
  const recentNews = useMemo(() => getLast3DaysNews(), []);
  const [currentPage, setCurrentPage] = useState(1);

  // 按日期倒序
  const sortedNews = useMemo(
    () => [...recentNews].sort((a, b) => b.date.localeCompare(a.date)),
    [recentNews]
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
              最近 3 天共 <span className="text-brand-400 font-medium">{recentNews.length}</span> 条动态
            </p>
          )}
          {/* Hero Cover */}
          {recentNews[0] && recentNews[0].coverImage && (
            <div className="mt-8 rounded-2xl overflow-hidden border border-white/10 shadow-2xl shadow-brand-500/10">
              <img
                src={recentNews[0].coverImage}
                alt={recentNews[0].title}
                className="w-full h-48 sm:h-56 object-cover opacity-80"
              />
            </div>
          )}
        </div>
      </section>

      {/* News List */}
      <section className="px-4 sm:px-6 lg:px-8 pb-20">
        <div className="max-w-5xl mx-auto">
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
                  {/* Cover Image */}
                  {item.coverImage && (
                    <div className="sm:w-40 sm:h-28 rounded-xl overflow-hidden shrink-0 bg-gradient-to-br from-brand-500/10 to-slate-800/50">
                      <img
                        src={item.coverImage}
                        alt=""
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className={`px-2.5 py-0.5 ${item.tagColor || "bg-brand-500/10 text-brand-300"} rounded-full text-xs font-medium`}>
                        {item.tag}
                      </span>
                      <span className="text-xs text-slate-500 font-mono">{formatDate(item.date)}</span>
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
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    page === safePage
                      ? "bg-brand-600 text-white shadow-lg shadow-brand-500/25"
                      : "bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  {page}
                </button>
              ))}
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
