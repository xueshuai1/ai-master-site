"use client";

import Link from "next/link";
import { useState, useEffect, useMemo, useRef } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { blogs } from "@/data/blogs";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import CategoryFilter from "@/components/CategoryFilter";
import dynamic from "next/dynamic";
import { useStatsBatch } from "@/hooks/useStatsBatch";

const CardStats = dynamic(() => import("@/components/CardStats"), { ssr: false });

const blogPosts = blogs
  .map((b) => ({
    id: b.id,
    title: b.title,
    summary: b.summary,
    date: b.date,
    updatedAt: b.updatedAt,
    author: b.author,
    readTime: `${b.readTime} min`,
    category: b.tags.length > 0 ? b.tags[0] : "行业洞察",
    tags: b.tags,
  }))
  .sort((a, b) => {
    if (b.date !== a.date) return b.date > a.date ? 1 : -1;
    // 同日文章：id 倒序（编号越大越新）
    return b.id.localeCompare(a.id);
  });

const categoryIcons: Record<string, string> = {
  "行业洞察": "💡",
  "技术对比": "⚖️",
  "实战经验": "🛠️",
  "前沿动态": "🚀",
  "论文解读": "📄",
  "教程指南": "📖",
};

const blogCategoryData = ["全部", ...Array.from(new Set(blogs.flatMap((b) => b.tags.slice(0, 1))))].map((cat) => ({
  key: cat,
  icon: cat === "全部" ? "🏷️" : (categoryIcons[cat] || "📌"),
  label: cat,
  count: cat === "全部" ? blogPosts.length : blogPosts.filter((p) => p.category === cat).length,
}));

const POSTS_PER_PAGE = 9;
type SortKey = "date-desc" | "most-viewed" | "most-liked";

export default function BlogPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [activeCategory, setActiveCategory] = useState(searchParams.get("cat") || "全部");
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get("page") || "1") || 1);
  const [sortBy, setSortBy] = useState<SortKey>((searchParams.get("sort") as SortKey) || "date-desc");
  const { statsMap, loading: statsLoading, fetchStats } = useStatsBatch();

  const isInitialMount = useRef(true);

  useEffect(() => {
    if (isInitialMount.current) { isInitialMount.current = false; return; }
    const params = new URLSearchParams();
    if (activeCategory !== "全部") params.set("cat", activeCategory);
    if (searchQuery) params.set("q", searchQuery);
    if (currentPage > 1) params.set("page", String(currentPage));
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }, [activeCategory, searchQuery, currentPage, pathname, router]);

  // Prefetch stats on mount so stats-sort is instant
  useEffect(() => {
    fetchStats(blogPosts.map((p) => `blog:${p.id}`));
  }, [fetchStats]);

  const filteredPosts = useMemo(() => {
    let result = activeCategory === "全部" ? blogPosts : blogPosts.filter((p) => p.category === activeCategory);
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(p =>
        p.title.toLowerCase().includes(q) ||
        p.summary.toLowerCase().includes(q) ||
        p.tags.some(t => t.toLowerCase().includes(q))
      );
    }
    if (sortBy === "date-desc") {
      result = [...result].sort((a, b) => {
        const da = a.updatedAt || a.date;
        const db = b.updatedAt || b.date;
        return db > da ? 1 : db < da ? -1 : b.id.localeCompare(a.id);
      });
    } else if (sortBy === "most-viewed") {
      result = [...result].sort((a, b) => {
        const diff = (statsMap[`blog:${b.id}`]?.views ?? 0) - (statsMap[`blog:${a.id}`]?.views ?? 0);
        if (diff !== 0) return diff;
        return b.date > a.date ? 1 : b.date < a.date ? -1 : b.id.localeCompare(a.id);
      });
    } else if (sortBy === "most-liked") {
      result = [...result].sort((a, b) => {
        const diff = (statsMap[`blog:${b.id}`]?.likes ?? 0) - (statsMap[`blog:${a.id}`]?.likes ?? 0);
        if (diff !== 0) return diff;
        return b.date > a.date ? 1 : b.date < a.date ? -1 : b.id.localeCompare(a.id);
      });
    }
    // default: date-desc (blogPosts is already sorted by date)
    return result;
  }, [activeCategory, searchQuery, sortBy, statsMap]);

  const handleCategoryChange = (cat: string) => {
    setActiveCategory(cat);
    setSearchQuery("");
    setCurrentPage(1);
    if (typeof window !== 'undefined') window.scrollTo({ top: 0 });
  };

  const totalPages = Math.max(1, Math.ceil(filteredPosts.length / POSTS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * POSTS_PER_PAGE;
  const paginatedPosts = filteredPosts.slice(startIndex, startIndex + POSTS_PER_PAGE);

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-brand-950 text-white">
      <Navbar activePath="/blog" />

      {/* Hero */}
      <section className="pt-28 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">
            📝 AI <span className="text-gradient">博客</span>
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            深度解读 AI 前沿动态、技术对比、实战经验和行业洞察
          </p>
        </div>
      </section>

      {/* Blog Posts */}
      <section className="px-4 sm:px-6 lg:px-8 pb-20">
        <div className="max-w-5xl mx-auto">
          {/* Search */}
          <section className="mb-6">
            <div className="relative">
              <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="搜索博客标题、标签..."
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-brand-500/50 focus:ring-1 focus:ring-brand-500/25 transition-all"
              />
            </div>
          </section>

          {/* Filter Bar */}
          <div className="flex items-center justify-between mb-6">
            <p className="text-sm text-slate-500 flex items-center gap-2">
              {searchQuery ? "搜索到" : "找到"} <span className="text-brand-400 font-medium">{filteredPosts.length}</span> 篇文章
              {statsLoading && <span className="text-xs text-slate-500 animate-pulse">加载排行…</span>}
            </p>
            <div className="flex items-center gap-2">
              <select
                value={sortBy}
                onChange={(e) => { setSortBy(e.target.value as SortKey); setCurrentPage(1); if (typeof window !== 'undefined') window.scrollTo({ top: 0 }); }}
                className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-sm text-slate-400 focus:outline-none focus:border-brand-500/50 appearance-none cursor-pointer"
              >
                <option value="date-desc">🕐 最新优先</option>
                <option value="most-viewed">👁 浏览最多</option>
                <option value="most-liked">👍 点赞最多</option>
              </select>
              <CategoryFilter
                categories={blogCategoryData}
                activeCategory={activeCategory}
                onChange={handleCategoryChange}
              />
            </div>
          </div>

          <div className="space-y-6">
            {paginatedPosts.map((post, index) => (
              <Link
                key={post.id}
                href={`/blog/${post.id}`}
                className={`group glass-card glass-card-hover block p-6 ${
                  index === 0 ? "sm:col-span-2" : ""
                }`}
              >
                <div className="flex items-center gap-2 mb-3 flex-wrap">
                  <span className="px-3 py-1 bg-brand-500/10 text-brand-300 rounded-full text-xs font-medium">
                    {post.category}
                  </span>
                  <span className="text-xs text-slate-500">{post.date}</span>
                  {post.updatedAt && (
                    <span className="text-xs text-amber-400">🔄 {post.updatedAt}</span>
                  )}
                  <span className="text-xs text-slate-500">📖 {post.readTime}</span>
                </div>

                <h2 className={`font-bold mb-2 group-hover:text-brand-300 transition-colors leading-snug ${
                  index === 0 ? "text-xl sm:text-2xl" : "text-lg"
                }`}>
                  {post.title}
                </h2>

                <p className="text-slate-400 text-sm leading-relaxed mb-3 line-clamp-2">
                  {post.summary}
                </p>

                <div className="flex items-center justify-between gap-3">
                  <span className="text-xs text-slate-500 shrink-0">✍️ {post.author || "AI Master"}</span>
                  <CardStats type="blog" id={post.id} />
                </div>
              </Link>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (() => {
            // 智能分页：显示 1、末页附近、当前页附近，中间用省略号
            const pages: (number | "...")[] = [];
            for (let i = 1; i <= totalPages; i++) {
              if (i === 1 || i === totalPages || (i >= safePage - 1 && i <= safePage + 1)) {
                pages.push(i);
              } else if (pages[pages.length - 1] !== "...") {
                pages.push("...");
              }
            }
            return (
              <div className="mt-12 flex items-center justify-center gap-2 flex-wrap">
                <button
                  onClick={() => { setCurrentPage((p) => Math.max(1, p - 1)); if (typeof window !== 'undefined') window.scrollTo({ top: 0 }); }}
                  disabled={safePage === 1}
                  className="px-3 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white"
                >
                  ← 上一页
                </button>
                {pages.map((page, idx) =>
                  page === "..." ? (
                    <span key={`ellipsis-${idx}`} className="px-2 text-slate-500 select-none">
                      …
                    </span>
                  ) : (
                    <button
                      key={page}
                      onClick={() => { setCurrentPage(page as number); if (typeof window !== 'undefined') window.scrollTo({ top: 0 }); }}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        page === safePage
                          ? "bg-brand-600 text-white shadow-lg shadow-brand-500/25"
                          : "bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white"
                      }`}
                    >
                      {page}
                    </button>
                  )
                )}
                <button
                  onClick={() => { setCurrentPage((p) => Math.min(totalPages, p + 1)); if (typeof window !== 'undefined') window.scrollTo({ top: 0 }); }}
                  disabled={safePage === totalPages}
                  className="px-3 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white"
                >
                  下一页 →
                </button>
              </div>
            );
          })()}
        </div>
      </section>

      <Footer />
    </main>
  );
}
