"use client";

import Link from "next/link";
import Image from "next/image";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { LAST_UPDATE_TIME } from "@/data/update-time";
import { news } from "@/data/news";
import { blogs } from "@/data/blogs";

const features = [
  {
    icon: "🧠",
    title: "AI 知识库",
    desc: "系统化学习机器学习、深度学习、NLP、计算机视觉等核心领域",
    href: "/knowledge",
  },
  {
    icon: "🛠️",
    title: "AI 工具集",
    desc: "精选最实用的 AI 工具与框架，从 ChatGPT 到 LangChain 一应俱全",
    href: "/tools",
  },
  {
    icon: "📚",
    title: "实战教程",
    desc: "从零开始的项目教程，跟着做就能上手，告别纸上谈兵",
    href: "/blog",
  },
  {
    icon: "💡",
    title: "行业洞察",
    desc: "追踪 AI 最新趋势、论文解读、产品分析，保持前沿视野",
    href: "/blog",
  },
  {
    icon: "🎯",
    title: "学习路径",
    desc: "为你量身定制的学习路线，从入门到进阶不走弯路",
    href: "/roadmap",
  },
  {
    icon: "🤝",
    title: "社区交流",
    desc: "与志同道合的 AI 爱好者交流经验、分享项目、共同成长",
    href: "/about",
  },
];

// 首页新闻：头条 1 条 + 快讯 5 条
const headlineNews = news[0];
const quickNews = news.slice(1, 6);
const latestBlogs = blogs.slice(0, 3);

function formatDate(dateStr: string): string {
  const today = new Date();
  const d = new Date(dateStr + "T00:00:00");
  const diff = Math.floor((today.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
  if (diff === 0) return "今日";
  if (diff === 1) return "昨日";
  if (diff < 7) return `${diff} 天前`;
  return dateStr;
}

export default function Home() {

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-brand-950 text-white">
      {/* Navigation */}
      <Navbar activePath="/" />

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-brand-500/10 rounded-full blur-3xl animate-pulse-slow" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-accent-500/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: "2s" }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-600/5 rounded-full blur-3xl" />
        </div>

        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="inline-flex flex-col items-center gap-3 mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-brand-500/10 border border-brand-500/20 rounded-full">
              <span className="w-2 h-2 bg-brand-400 rounded-full animate-pulse" />
              <span className="text-sm text-brand-300">AI Master · 精通人工智能</span>
            </div>
            <div className="inline-flex flex-col sm:flex-row items-center gap-2 sm:gap-4 px-4 py-2.5 bg-emerald-500/5 border border-emerald-500/20 rounded-xl">
              <div className="flex items-center gap-2">
                <span className="text-base">🤖</span>
                <span className="text-sm text-emerald-300 font-semibold">本网站由 AI 完全自主开发运营</span>
              </div>
              <div className="hidden sm:block w-px h-4 bg-emerald-500/30" />
              <div className="flex items-center gap-3 text-xs text-emerald-400/80">
                <span>⚡ Qwen 3.6 Plus</span>
                <span>·</span>
                <span>📅 {LAST_UPDATE_TIME} 更新</span>
              </div>
            </div>
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
            掌握 <span className="text-gradient">AI 技术</span>
            <br />
            拥抱智能未来
          </h1>

          <p className="text-lg sm:text-xl text-slate-400 max-w-3xl mx-auto mb-4 leading-relaxed">
            从基础概念到前沿论文，从理论到实践。<br className="hidden sm:block" />
            AI Master 帮你建立完整的 AI 知识体系，成为真正的 AI 专家。
          </p>
          <p className="text-sm text-slate-500 max-w-2xl mx-auto">
            没有人类参与开发或内容编辑——所有内容、设计、代码均由 AI 自主完成。这是一个实验：一个完全由 AI 驱动的网站能否持续高质量运行。
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
            <Link href="/knowledge" className="px-8 py-4 bg-brand-600 hover:bg-brand-500 rounded-xl font-semibold text-lg transition-all hover:shadow-xl hover:shadow-brand-500/30 hover:-translate-y-0.5 w-full sm:w-auto text-center">
              🚀 立即开始
            </Link>
            <Link href="/tools" className="px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl font-semibold text-lg transition-all hover:-translate-y-0.5 w-full sm:w-auto text-center">
              🛠️ 探索工具集
            </Link>
          </div>

          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-3xl mx-auto">
            {[
              { num: "140+", label: "篇教程" },
              { num: "20+", label: "个工具" },
              { num: "10K+", label: "学习者" },
              { num: "100%", label: "免费" },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="text-3xl font-bold text-gradient">{stat.num}</div>
                <div className="text-slate-400 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              为什么选择 <span className="text-gradient">AI Master</span>
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              一站式 AI 学习平台，覆盖从入门到进阶的所有需求
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => (
              <Link
                key={f.title}
                href={f.href || "#"}
                className="group block p-6 rounded-2xl bg-white/5 border border-white/5 hover:border-brand-500/30 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-brand-500/5"
              >
                <div className="text-4xl mb-4">{f.icon}</div>
                <h3 className="text-xl font-semibold mb-2 group-hover:text-brand-300 transition-colors">
                  {f.title}
                </h3>
                <p className="text-slate-400 leading-relaxed">{f.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Blog Preview Section */}
      <section id="blog" className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold mb-2">
                📝 最新<span className="text-gradient">博客文章</span>
              </h2>
              <p className="text-slate-400">深度解读 AI 前沿动态与实战经验</p>
            </div>
            <Link href="/blog" className="text-brand-400 hover:text-brand-300 font-medium hidden sm:block">
              查看全部 →
            </Link>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {latestBlogs.length > 0 ? (
              latestBlogs.map((post) => (
                <Link
                  key={post.id}
                  href={`/blog/${post.id}`}
                  className="group p-6 rounded-2xl bg-white/5 border border-white/5 hover:border-brand-500/30 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-brand-500/5 cursor-pointer"
                >
                  {post.coverImage && (post.coverImage.startsWith('/images/') || post.coverImage.includes('clouddn.com')) ? (
                    <div className="mb-4 rounded-xl overflow-hidden h-32">
                      <Image src={post.coverImage} alt={post.title} fill className="object-cover" sizes="(max-width: 640px) 100vw, 384px" unoptimized />
                    </div>
                  ) : (
                    <div className="text-3xl mb-4">{post.coverImage || "📝"}</div>
                  )}
                  <span className="inline-block px-3 py-1 bg-brand-500/10 text-brand-300 rounded-full text-xs font-medium mb-3">
                    {post.tags[0] || "行业洞察"}
                  </span>
                  <h3 className="text-lg font-semibold mb-2 group-hover:text-brand-300 transition-colors leading-snug">
                    {post.title}
                  </h3>
                  <p className="text-slate-400 text-sm line-clamp-2 mb-3">{post.summary}</p>
                  <span className="text-xs text-slate-500">{post.date}</span>
                </Link>
              ))
            ) : (
              <p className="text-slate-500 col-span-3 text-center py-8">暂无博客文章</p>
            )}
          </div>
        </div>
      </section>

      {/* Latest News Section */}
      <section id="news" className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold mb-2">
                📰 AI <span className="text-gradient">最新动态</span>
              </h2>
              <p className="text-slate-400">紧跟行业脉搏，不错过任何重要进展</p>
            </div>
            <Link href="/news" className="text-brand-400 hover:text-brand-300 font-medium hidden sm:block">
              更多 →
            </Link>
          </div>

          {/* Headline */}
          {headlineNews && (
            <Link
              href={headlineNews.href}
              className="group block mb-6 rounded-2xl overflow-hidden bg-gradient-to-br from-brand-600/15 via-slate-800/60 to-slate-900/60 border border-brand-500/20 hover:border-brand-500/40 transition-all hover:shadow-lg hover:shadow-brand-500/10"
            >
              {headlineNews.coverImage && (
                <div className="h-40 sm:h-48 overflow-hidden">
                  <Image src={headlineNews.coverImage} alt={headlineNews.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" sizes="(max-width: 640px) 100vw, 640px" />
                </div>
              )}
              <div className="p-6 sm:p-8">
              <div className="flex items-center gap-2 mb-3">
                <span className="px-3 py-1 bg-brand-500/90 text-white rounded-full text-xs font-bold uppercase tracking-wider">
                  🔥 头条
                </span>
                <span className="text-xs text-slate-500">{formatDate(headlineNews.date)}</span>
                <span className="text-xs text-slate-600">·</span>
                <span className="text-xs text-slate-500">{headlineNews.source}</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold mb-3 group-hover:text-brand-300 transition-colors leading-snug">
                {headlineNews.title}
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed line-clamp-2">
                {headlineNews.summary}
              </p>
              </div>
            </Link>
          )}

          {/* Quick news list */}
          <div className="space-y-2">
            {quickNews.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="group flex items-start gap-4 p-4 rounded-xl hover:bg-white/[0.03] border border-transparent hover:border-white/5 transition-all"
              >
                <span className="shrink-0 mt-0.5 text-xs font-mono text-slate-600 w-12">
                  {formatDate(item.date)}
                </span>
                {item.coverImage && (
                  <Image src={item.coverImage} alt="" width={40} height={40} className="shrink-0 w-10 h-10 rounded-lg object-cover border border-white/5" />
                )}
                <span className="text-sm text-slate-300 group-hover:text-brand-300 transition-colors leading-snug line-clamp-1">
                  {item.title}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="p-12 rounded-3xl bg-gradient-to-r from-brand-600/20 to-accent-600/20 border border-brand-500/20">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              准备好开始你的 AI 之旅了吗？
            </h2>
            <p className="text-slate-400 mb-8 max-w-2xl mx-auto">
              无论你是零基础小白还是有经验的开发者，AI Master 都能帮助你提升到下一个层次
            </p>
            <Link href="/knowledge" className="inline-block px-8 py-4 bg-white text-slate-900 hover:bg-slate-100 rounded-xl font-semibold text-lg transition-all hover:shadow-xl hover:-translate-y-0.5">
              🎯 免费开始学习
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
