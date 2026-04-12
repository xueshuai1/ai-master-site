"use client";

import Link from "next/link";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { LAST_UPDATE_TIME } from "@/data/update-time";

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

const news = [
  {
    tag: "前沿",
    title: "Anthropic 发布 Claude Cowork 企业版 + Project Glasswing 安全框架",
    date: "2026-04-10",
    href: "/blog",
  },
  {
    tag: "重磅",
    title: "Nvidia GTC 2026：Agent Toolkit 开源平台，17 家巨头企业加入",
    date: "2026-04-09",
    href: "/blog",
  },
  {
    tag: "商业",
    title: "Anthropic 年化营收突破 300 亿美元，签 Google TPU 大单",
    date: "2026-04-08",
    href: "/blog",
  },
  {
    tag: "工具",
    title: "Google 发布 AI Edge Eloquent：免费离线 AI 语音转录",
    date: "2026-04-07",
    href: "/blog",
  },
  {
    tag: "开源",
    title: "Meta 新一代开源 AI 模型即将发布，Alexandr Wang 主导",
    date: "2026-04-06",
    href: "/blog",
  },
];

export default function Home() {

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-brand-950 text-white">
      {/* Navigation */}
      <Navbar activePath="/" />

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Animated background elements */}
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
            {[
              {
                icon: "🔮",
                category: "行业洞察",
                title: "2026 年 AI 领域十大趋势预测",
                summary: "从多模态大模型到 AI Agent 普及，盘点今年最值得关注的技术方向",
                date: "2026-04-10",
              },
              {
                icon: "📄",
                category: "论文解读",
                title: "GPT-5 技术报告深度解读",
                summary: "OpenAI 最新发布的 GPT-5 在多模态推理方面实现了显著突破",
                date: "2026-04-08",
              },
              {
                icon: "🤖",
                category: "实战经验",
                title: "AI Agent 在软件开发中的最佳实践",
                summary: "从代码审查到自动修复，AI Agent 正在重塑软件开发流程",
                date: "2026-04-05",
              },
            ].map((post) => (
              <Link
                key={post.title}
                href="/blog"
                className="group p-6 rounded-2xl bg-white/5 border border-white/5 hover:border-brand-500/30 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-brand-500/5 cursor-pointer"
              >
                <div className="text-3xl mb-4">{post.icon}</div>
                <span className="inline-block px-3 py-1 bg-brand-500/10 text-brand-300 rounded-full text-xs font-medium mb-3">
                  {post.category}
                </span>
                <h3 className="text-lg font-semibold mb-2 group-hover:text-brand-300 transition-colors leading-snug">
                  {post.title}
                </h3>
                <p className="text-slate-400 text-sm line-clamp-2 mb-3">{post.summary}</p>
                <span className="text-xs text-slate-500">{post.date}</span>
              </Link>
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
              <Link
                key={item.title}
                href={item.href || "/blog"}
                className="group flex flex-col sm:flex-row sm:items-center justify-between p-5 rounded-xl bg-white/5 border border-white/5 hover:border-brand-500/30 transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-brand-500/5"
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
