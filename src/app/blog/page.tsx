"use client";

import Link from "next/link";
import { useState, useMemo } from "react";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";

const blogCategories = ["全部", "行业洞察", "论文解读", "实战经验", "技术对比", "实战教程"];

const blogPosts = [
  {
    id: "blog-001",
    title: "2026 年 AI 领域十大趋势预测",
    summary: "从多模态大模型到 AI Agent 普及，从边缘 AI 到具身智能，盘点今年最值得关注的技术方向",
    date: "2026-04-10",
    author: "AI Master 团队",
    readTime: "10 min",
    category: "行业洞察",
    tags: ["趋势", "2026", "多模态"],
    cover: "🔮",
  },
  {
    id: "blog-002",
    title: "GPT-5 技术报告深度解读",
    summary: "OpenAI 最新发布的 GPT-5 在多模态推理、长上下文理解和代码生成方面实现了显著突破",
    date: "2026-04-08",
    author: "AI Master 团队",
    readTime: "15 min",
    category: "论文解读",
    tags: ["GPT-5", "OpenAI", "多模态"],
    cover: "📄",
  },
  {
    id: "blog-003",
    title: "AI Agent 在软件开发中的最佳实践",
    summary: "从代码审查到自动修复，从需求分析到架构设计，AI Agent 正在重塑软件开发流程",
    date: "2026-04-05",
    author: "AI Master 团队",
    readTime: "12 min",
    category: "实战经验",
    tags: ["AI Agent", "开发效率", "自动化"],
    cover: "🤖",
  },
  {
    id: "blog-004",
    title: "RAG vs Fine-tuning：如何选择？",
    summary: "检索增强生成和微调是增强 LLM 能力的两大主流方案，本文对比它们的适用场景和优缺点",
    date: "2026-04-02",
    author: "AI Master 团队",
    readTime: "14 min",
    category: "技术对比",
    tags: ["RAG", "Fine-tuning", "LLM"],
    cover: "⚖️",
  },
  {
    id: "blog-005",
    title: "从 0 到 1：用 LangChain 构建你的第一个 AI 应用",
    summary: "手把手教你使用 LangChain 框架搭建一个完整的 RAG 应用，包含文档加载、向量存储和问答接口",
    date: "2026-03-28",
    author: "AI Master 团队",
    readTime: "20 min",
    category: "实战教程",
    tags: ["LangChain", "RAG", "实战"],
    cover: "🛠️",
  },
  {
    id: "blog-006",
    title: "AI 安全与伦理：不可忽视的议题",
    summary: "随着 AI 能力的飞速提升，安全性、偏见、隐私保护等伦理问题变得越来越重要",
    date: "2026-03-25",
    author: "AI Master 团队",
    readTime: "10 min",
    category: "行业洞察",
    tags: ["安全", "伦理", "治理"],
    cover: "🛡️",
  },
  {
    id: "blog-007",
    title: "MoE 混合专家架构详解：从原理到实践",
    summary: "深入解析 Mixture of Experts 架构如何通过稀疏激活实现模型规模与推理效率的双赢，附 PyTorch 实战代码",
    date: "2026-04-12",
    author: "AI Master 团队",
    readTime: "18 min",
    category: "论文解读",
    tags: ["MoE", "稀疏激活", "架构设计"],
    cover: "🧬",
  },
  {
    id: "blog-008",
    title: "Speculative Decoding：LLM 推理加速新范式",
    summary: "用小模型草稿 + 大模型验证的策略，实现 LLM 推理 2-3 倍加速，深入理解其原理与实现细节",
    date: "2026-04-11",
    author: "AI Master 团队",
    readTime: "16 min",
    category: "技术对比",
    tags: ["推理加速", "投机解码", "LLM优化"],
    cover: "⚡",
  },
  {
    id: "blog-009",
    title: "DPO vs RLHF：大模型对齐方法全面对比",
    summary: "从 PPO-RLHF 到 Direct Preference Optimization，对比两大对齐范式的技术原理、优劣势与选型指南",
    date: "2026-04-10",
    author: "AI Master 团队",
    readTime: "15 min",
    category: "技术对比",
    tags: ["DPO", "RLHF", "模型对齐"],
    cover: "🎯",
  },
  {
    id: "blog-010",
    title: "AI Agent 能搞定日常任务吗？ClawBench 基准测试深度解读",
    summary: "从网购下单到预约医生，从投简历到订机票——153 个真实任务、144 个在线平台，全面评估当前 AI Agent 的实际能力边界",
    date: "2026-04-12",
    author: "AI Master 团队",
    readTime: "18 min",
    category: "论文解读",
    tags: ["AI Agent", "基准测试", "ClawBench", "任务自动化"],
    cover: "🐾",
  },
];

const POSTS_PER_PAGE = 3;

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
                <div className={`flex items-center justify-center rounded-xl bg-gradient-to-br from-brand-500/10 to-accent-500/10 shrink-0 ${
                  index === 0 ? "sm:w-48 sm:h-48" : "sm:w-32 sm:h-32"
                } w-full h-32 sm:h-auto`}>
                  <span className={index === 0 ? "text-6xl" : "text-4xl"}>{post.cover}</span>
                </div>

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
