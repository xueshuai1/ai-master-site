"use client";

import Link from "next/link";
import { useState } from "react";

const techStack = [
  { name: "Next.js 14", icon: "▲", desc: "React 全栈框架" },
  { name: "TypeScript", icon: "🔷", desc: "类型安全开发" },
  { name: "Tailwind CSS", icon: "🎨", desc: "原子化样式" },
  { name: "Vercel", icon: "▲", desc: "云端部署" },
];

const milestones = [
  {
    date: "2026-04",
    title: "项目启动",
    desc: "AI Master 网站正式上线，包含知识库、工具集等核心功能",
  },
  {
    date: "2026-05",
    title: "内容扩充",
    desc: "知识库文章突破 100 篇，覆盖 AI 全领域",
  },
  {
    date: "2026-06",
    title: "社区功能",
    desc: "上线评论区和学习社区，促进 AI 爱好者交流",
  },
  {
    date: "2026-Q3",
    title: "AI 助手",
    desc: "集成 AI 问答助手，为学习者提供个性化学习建议",
  },
];

const teamValues = [
  {
    icon: "🎯",
    title: "高质量内容",
    desc: "每篇文章都经过严格筛选和编辑，确保内容准确、实用、易懂",
  },
  {
    icon: "🆓",
    title: "完全免费",
    desc: "所有学习资源永久免费开放，让知识无边界",
  },
  {
    icon: "🔄",
    title: "持续更新",
    desc: "紧跟 AI 最新发展，定期更新知识库和工具推荐",
  },
  {
    icon: "📱",
    title: "多端适配",
    desc: "完美支持手机、平板、电脑，随时随地学习",
  },
];

export default function AboutPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-brand-950 text-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-950/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-2xl">🍪</span>
              <span className="text-xl font-bold text-gradient">AI Master</span>
            </Link>
            <div className="hidden md:flex items-center gap-8">
              <Link href="/" className="text-slate-300 hover:text-white transition-colors">首页</Link>
              <Link href="/knowledge" className="text-slate-300 hover:text-white transition-colors">知识库</Link>
              <Link href="/tools" className="text-slate-300 hover:text-white transition-colors">工具集</Link>
              <Link href="/about" className="text-brand-400 font-medium">关于</Link>
            </div>
            <button
              className="md:hidden p-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="菜单"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-white/5 bg-slate-950/95 backdrop-blur-md">
            <div className="px-4 py-4 space-y-1">
              <Link href="/" className="block px-4 py-3 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors text-lg" onClick={() => setMobileMenuOpen(false)}>首页</Link>
              <Link href="/knowledge" className="block px-4 py-3 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors text-lg" onClick={() => setMobileMenuOpen(false)}>知识库</Link>
              <Link href="/tools" className="block px-4 py-3 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors text-lg" onClick={() => setMobileMenuOpen(false)}>工具集</Link>
              <Link href="/about" className="block px-4 py-3 rounded-lg text-brand-400 bg-brand-500/10 font-medium text-lg" onClick={() => setMobileMenuOpen(false)}>关于</Link>
            </div>
          </div>
        )}
      </nav>

      {/* Hero */}
      <section className="pt-28 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">
            关于 <span className="text-gradient">AI Master</span>
          </h1>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
            我们致力于成为最优质的中文 AI 学习平台，<br className="hidden sm:block" />
            让每个人都能掌握人工智能技术。
          </p>
        </div>
      </section>

      {/* Mission */}
      <section className="px-4 sm:px-6 lg:px-8 pb-20">
        <div className="max-w-5xl mx-auto">
          {/* What we offer */}
          <div className="mb-20">
            <h2 className="text-2xl sm:text-3xl font-bold mb-8 text-center">
              我们提供什么
            </h2>
            <div className="grid sm:grid-cols-2 gap-5">
              {teamValues.map((v) => (
                <div
                  key={v.title}
                  className="p-6 rounded-2xl bg-white/5 border border-white/5 hover:border-brand-500/20 transition-all"
                >
                  <div className="text-3xl mb-3">{v.icon}</div>
                  <h3 className="text-lg font-semibold mb-2">{v.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{v.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Tech Stack */}
          <div className="mb-20">
            <h2 className="text-2xl sm:text-3xl font-bold mb-8 text-center">
              技术栈
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {techStack.map((t) => (
                <div
                  key={t.name}
                  className="text-center p-5 rounded-xl bg-white/5 border border-white/5"
                >
                  <div className="text-3xl mb-2">{t.icon}</div>
                  <div className="font-semibold text-sm">{t.name}</div>
                  <div className="text-xs text-slate-500 mt-1">{t.desc}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Roadmap */}
          <div className="mb-20">
            <h2 className="text-2xl sm:text-3xl font-bold mb-10 text-center">
              发展路线
            </h2>
            <div className="relative">
              {/* Vertical line */}
              <div className="absolute left-4 sm:left-1/2 top-0 bottom-0 w-px bg-brand-500/20" />

              {milestones.map((m, i) => (
                <div
                  key={m.date}
                  className={`relative flex items-start mb-10 last:mb-0 ${
                    i % 2 === 0 ? "sm:flex-row" : "sm:flex-row-reverse"
                  }`}
                >
                  {/* Dot */}
                  <div className="absolute left-4 sm:left-1/2 w-3 h-3 bg-brand-500 rounded-full -translate-x-1.5 sm:-translate-x-1.5 mt-1.5 ring-4 ring-slate-900" />

                  {/* Content */}
                  <div className={`ml-10 sm:ml-0 sm:w-1/2 ${i % 2 === 0 ? "sm:pr-12 sm:text-right" : "sm:pl-12"}`}>
                    <span className="inline-block px-3 py-1 bg-brand-500/10 text-brand-300 rounded-full text-xs font-medium mb-2">
                      {m.date}
                    </span>
                    <h3 className="text-lg font-semibold mb-1">{m.title}</h3>
                    <p className="text-slate-400 text-sm">{m.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Contact / CTA */}
          <div className="text-center p-10 rounded-3xl bg-gradient-to-r from-brand-600/10 to-accent-600/10 border border-brand-500/20">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4">
              加入我们
            </h2>
            <p className="text-slate-400 mb-8 max-w-lg mx-auto">
              如果你也热爱 AI 技术，欢迎一起建设这个平台。无论是贡献文章、推荐工具还是分享经验，每一份力量都很重要。
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/knowledge"
                className="px-8 py-3 bg-brand-600 hover:bg-brand-500 rounded-xl font-semibold transition-all hover:shadow-lg hover:shadow-brand-500/25 hover:-translate-y-0.5"
              >
                📚 浏览知识库
              </Link>
              <Link
                href="/"
                className="px-8 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl font-semibold transition-all hover:-translate-y-0.5"
              >
                🏠 返回首页
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 px-4 sm:px-6 lg:px-8 border-t border-white/5">
        <div className="max-w-7xl mx-auto text-center text-slate-500 text-sm">
          © 2026 AI Master. All rights reserved. Built with ❤️ and AI.
        </div>
      </footer>
    </main>
  );
}
