"use client";

import Link from "next/link";
import { useState, useMemo } from "react";
import { blogs } from "@/data/blogs";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import CategoryFilter from "@/components/CategoryFilter";

const blogPosts = blogs
  .map((b) => ({
    id: b.id,
    title: b.title,
    summary: b.summary,
    date: b.date,
    author: b.author,
    readTime: `${b.readTime} min`,
    category: b.tags.length > 0 ? b.tags[0] : "行业洞察",
    tags: b.tags,
  }))
  .sort((a, b) => (b.date > a.date ? 1 : b.date < a.date ? -1 : 0));

// Build categories with icons (map from tag name)
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

export default function BlogPage() {
  const [activeCategory, setActiveCategory] = useState("全部");
  const [currentPage, setCurrentPage] = useState(1);

  const filteredPosts = useMemo(() => {
    if (activeCategory === "全部") return blogPosts;
    return blogPosts.filter((p) => p.category === activeCategory);
  }, [activeCategory]);

  const handleCategoryChange = (cat: string) => {
    setActiveCategory(cat);
    setCurrentPage(1);
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
          {/* Filter Bar */}
          <div className="flex items-center justify-between mb-6">
            <p className="text-sm text-slate-500">
              找到 <span className="text-brand-400 font-medium">{filteredPosts.length}</span> 篇文章
            </p>
            <CategoryFilter
              categories={blogCategoryData}
              activeCategory={activeCategory}
              onChange={handleCategoryChange}
            />
          </div>

          <div className="space-y-6">
            {paginatedPosts.map((post, index) => (
              <Link
                key={post.id}
                href={`/blog/${post.id}`}
                className={`group block p-6 rounded-2xl bg-white/5 border border-white/5 hover:border-brand-500/30 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-brand-500/5 ${
                  index === 0 ? "sm:col-span-2" : ""
                }`}
              >
                <div className="flex items-center gap-2 mb-3 flex-wrap">
                  <span className="px-3 py-1 bg-brand-500/10 text-brand-300 rounded-full text-xs font-medium">
                    {post.category}
                  </span>
                  <span className="text-xs text-slate-500">{post.date}</span>
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

                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">✍️ {post.author}</span>
                  <div className="flex gap-2 flex-wrap">
                    {post.tags.map((tag: string) => (
                      <span key={tag} className="px-2 py-0.5 bg-white/5 rounded text-xs text-slate-400">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              </Link>
            ))}
          </div>

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
