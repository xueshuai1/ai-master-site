"use client";

import Link from "next/link";
import { useState } from "react";

const features = [
  {
    icon: "🧠",
    title: "AI 知识库",
    desc: "系统化学习机器学习、深度学习、NLP、计算机视觉等核心领域",
  },
  {
    icon: "🛠️",
    title: "AI 工具集",
    desc: "精选最实用的 AI 工具与框架，从 ChatGPT 到 LangChain 一应俱全",
  },
  {
    icon: "📚",
    title: "实战教程",
    desc: "从零开始的项目教程，跟着做就能上手，告别纸上谈兵",
  },
  {
    icon: "💡",
    title: "行业洞察",
    desc: "追踪 AI 最新趋势、论文解读、产品分析，保持前沿视野",
  },
  {
    icon: "🎯",
    title: "学习路径",
    desc: "为你量身定制的学习路线，从入门到进阶不走弯路",
  },
  {
    icon: "🤝",
    title: "社区交流",
    desc: "与志同道合的 AI 爱好者交流经验、分享项目、共同成长",
  },
];

const news = [
  {
    tag: "前沿",
    title: "GPT-5 技术报告：多模态推理能力再突破",
    date: "2026-04-10",
  },
  {
    tag: "开源",
    title: "Llama 4 开源发布，128K 上下文窗口",
    date: "2026-04-09",
  },
  {
    tag: "应用",
    title: "AI Agent 在自动化开发中的最佳实践",
    date: "2026-04-08",
  },
];

export default function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: "知识库", href: "/knowledge" },
    { label: "工具集", href: "/tools" },
    { label: "关于", href: "/about" },
  ];

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
            {/* Desktop nav */}
            <div className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-slate-300 hover:text-white transition-colors"
                >
                  {link.label}
                </Link>
              ))}
              <Link href="/knowledge" className="px-5 py-2 bg-brand-600 hover:bg-brand-500 rounded-lg font-medium transition-all hover:shadow-lg hover:shadow-brand-500/25">
                开始学习
              </Link>
            </div>
            {/* Mobile hamburger button */}
            <button
              className="md:hidden p-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? "关闭菜单" : "打开菜单"}
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
        {/* Mobile menu dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-white/5 bg-slate-950/95 backdrop-blur-md">
            <div className="px-4 py-4 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="block px-4 py-3 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors text-lg"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <Link href="/knowledge" className="block w-full mt-2 text-center px-5 py-3 bg-brand-600 hover:bg-brand-500 rounded-lg font-medium transition-all text-lg">
                开始学习
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-brand-500/10 rounded-full blur-3xl animate-pulse-slow" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-accent-500/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: "2s" }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-600/5 rounded-full blur-3xl" />
        </div>

        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-brand-500/10 border border-brand-500/20 rounded-full mb-8">
            <span className="w-2 h-2 bg-brand-400 rounded-full animate-pulse" />
            <span className="text-sm text-brand-300">AI Master · 精通人工智能</span>
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
            掌握 <span className="text-gradient">AI 技术</span>
            <br />
            拥抱智能未来
          </h1>

          <p className="text-lg sm:text-xl text-slate-400 max-w-3xl mx-auto mb-10 leading-relaxed">
            从基础概念到前沿论文，从理论到实践。<br className="hidden sm:block" />
            AI Master 帮你建立完整的 AI 知识体系，成为真正的 AI 专家。
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/knowledge" className="px-8 py-4 bg-brand-600 hover:bg-brand-500 rounded-xl font-semibold text-lg transition-all hover:shadow-xl hover:shadow-brand-500/30 hover:-translate-y-0.5 w-full sm:w-auto text-center">
              🚀 立即开始
            </Link>
            <Link href="/tools" className="px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl font-semibold text-lg transition-all hover:-translate-y-0.5 w-full sm:w-auto text-center">
              🛠️ 探索工具集
            </Link>
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-3xl mx-auto">
            {[
              { num: "200+", label: "篇教程" },
              { num: "50+", label: "个工具" },
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
            {features.map((f, i) => (
              <div
                key={f.title}
                className="group p-6 rounded-2xl bg-white/5 border border-white/5 hover:border-brand-500/30 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-brand-500/5 cursor-pointer"
              >
                <div className="text-4xl mb-4">{f.icon}</div>
                <h3 className="text-xl font-semibold mb-2 group-hover:text-brand-300 transition-colors">
                  {f.title}
                </h3>
                <p className="text-slate-400 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Latest News Section */}
      <section id="news" className="py-24 px-4 sm:px-6 lg:px-8 bg-slate-900/50">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold mb-2">
                📰 AI <span className="text-gradient">最新动态</span>
              </h2>
              <p className="text-slate-400">紧跟行业脉搏，不错过任何重要进展</p>
            </div>
            <Link href="#" className="text-brand-400 hover:text-brand-300 font-medium hidden sm:block">
              查看全部 →
            </Link>
          </div>

          <div className="space-y-4">
            {news.map((item) => (
              <div
                key={item.title}
                className="group flex flex-col sm:flex-row sm:items-center justify-between p-5 rounded-xl bg-white/5 border border-white/5 hover:border-brand-500/30 transition-all cursor-pointer"
              >
                <div className="flex items-center gap-4 mb-3 sm:mb-0">
                  <span className="px-3 py-1 bg-brand-500/10 text-brand-300 rounded-full text-sm font-medium">
                    {item.tag}
                  </span>
                  <h3 className="text-lg font-medium group-hover:text-brand-300 transition-colors">
                    {item.title}
                  </h3>
                </div>
                <span className="text-slate-500 text-sm">{item.date}</span>
              </div>
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

      {/* Footer */}
      <footer id="about" className="py-12 px-4 sm:px-6 lg:px-8 border-t border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">🍪</span>
                <span className="text-xl font-bold text-gradient">AI Master</span>
              </div>
              <p className="text-slate-400 max-w-md leading-relaxed">
                AI Master 致力于成为最优质的中文 AI 学习平台，让每个人都能掌握人工智能技术。
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">学习资源</h4>
              <ul className="space-y-2 text-slate-400">
                <li><Link href="#" className="hover:text-white transition-colors">机器学习基础</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">深度学习实战</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">NLP 教程</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">计算机视觉</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">关于</h4>
              <ul className="space-y-2 text-slate-400">
                <li><Link href="#" className="hover:text-white transition-colors">关于我们</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">联系方式</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">隐私政策</Link></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-white/5 text-center text-slate-500 text-sm">
            © 2026 AI Master. All rights reserved. Built with ❤️ and AI.
          </div>
        </div>
      </footer>
    </main>
  );
}
