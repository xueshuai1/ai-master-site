"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useMemo } from "react";
import { blogs } from "@/data/blogs";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";

// 自动从 blogs.ts 生成列表数据
const blogPosts = blogs.map((b) => ({
  id: b.id,
  title: b.title,
  summary: b.summary,
  date: b.date,
  author: b.author,
  readTime: `${b.readTime} min`,
  category: b.tags.length > 0 ? b.tags[0] : "行业洞察",
  tags: b.tags,
  cover: b.coverImage || "📝",
}));

const blogCategories = ["全部", ...Array.from(new Set(blogs.flatMap((b) => b.tags.slice(0, 1))))];

const POSTS_PER_PAGE = 10;

export default function BlogPage() {
  const [activeCategory, setActiveCategory] = useState("全部");
  const [currentPage, setCurrentPage] = useState(1);

  const filteredPosts = useMemo(() => {
    if (activeCategory === "全部") return blogPosts;
    return blogPosts.filter((p) => p.category === activeCategory);
  }, [activeCategory]);

  // Reset to page 1 when category changes
  const handleCategoryChange = (cat: string) => {
    setActiveCategory(cat);
    setCurrentPage(1);
  };

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredPosts.length / POSTS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * POSTS_PER_PAGE;
  const paginatedPosts = filteredPosts.slice(startIndex, startIndex + POSTS_PER_PAGE);

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-brand-950 text-white">
      {/* Navigation */}
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

      {/* Category Filter */}
      <section className="px-4 sm:px-6 lg:px-8 pb-4">
        <div className="max-w-5xl mx-auto">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap sm:justify-center">
            {blogCategories.map((cat) => (
              <button
                key={cat}
                onClick={() => handleCategoryChange(cat)}
                className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
                  activeCategory === cat
                    ? "bg-brand-600 text-white shadow-lg shadow-brand-500/25"
                    : "bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Blog Posts */}
      <section className="px-4 sm:px-6 lg:px-8 pb-20">
        <div className="max-w-5xl mx-auto">
          <p className="text-sm text-slate-500 mb-6">
            找到 <span className="text-brand-400 font-medium">{filteredPosts.length}</span> 篇文章{filteredPosts.length !== paginatedPosts.length ? ` · 第 ${safePage}/${totalPages} 页` : ""}
          </p>
          <div className="space-y-6">
            {paginatedPosts.map((post, index) => (
              <Link
                key={post.id}
                href={`/blog/${post.id}`}
                className={`group flex flex-col sm:flex-row gap-6 p-6 rounded-2xl bg-white/5 border border-white/5 hover:border-brand-500/30 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-brand-500/5 ${
                  index === 0 ? "sm:col-span-2" : ""
                }`}
              >
                {/* Cover */}
                {post.cover && post.cover.startsWith('/images/') ? (
                  <div className={`rounded-xl overflow-hidden bg-gradient-to-br from-brand-500/10 to-accent-500/10 shrink-0 ${
                    index === 0 ? "sm:w-48 sm:h-48" : "sm:w-32 sm:h-32"
                  } w-full h-32 sm:h-auto`}>
                    <Image src={post.cover} alt={post.title} fill className="object-cover" sizes="(max-width: 640px) 100vw, (max-width: 1024px) 128px, 192px" />
                  </div>
                ) : (
                  <div className={`flex items-center justify-center rounded-xl bg-gradient-to-br from-brand-500/10 to-accent-500/10 shrink-0 ${
                    index === 0 ? "sm:w-48 sm:h-48" : "sm:w-32 sm:h-32"
                  } w-full h-32 sm:h-auto`}>
                    <span className={index === 0 ? "text-6xl" : "text-4xl"}>{post.cover || "📝"}</span>
                  </div>
                )}

                {/* Content */}
                <div className="flex-1 min-w-0">
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
                      {post.tags.map((tag) => (
                        <span key={tag} className="px-2 py-0.5 bg-white/5 rounded text-xs text-slate-400">
                          #{tag}
                        </span>
                      ))}
                    </div>
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
// force redeploy 1776020228
