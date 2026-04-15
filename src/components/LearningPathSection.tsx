"use client";

import { useState, useMemo } from "react";
import { articles, categories } from "@/data/knowledge";
import ArticleCard from "@/components/ArticleCard";

interface PhaseConfig {
  id: string;
  title: string;
  emoji: string;
  duration: string;
  description: string;
  categoryKeys: string[];
  levels: string[];
  borderColor: string;
  bgGradient: string;
  dotColor: string;
  subPaths?: { emoji: string; label: string; categoryKeys: string[] }[];
}

// 🚀 速成路线 — 先学会用起来（1-2 周就能上手）
const fastTrackPhases: PhaseConfig[] = [
  {
    id: "fast-prompt",
    title: "Prompt Engineering",
    emoji: "✏️",
    duration: "1-2 天",
    description: "学会和 AI 对话，掌握提示词编写技巧，这是使用 AI 的第一步",
    categoryKeys: ["llm"],
    levels: ["入门"],
    borderColor: "border-l-cyan-500",
    bgGradient: "from-cyan-500/5 to-transparent",
    dotColor: "bg-cyan-500",
    subPaths: [
      { emoji: "✏️", label: "提示词工程", categoryKeys: ["llm"] },
    ],
  },
  {
    id: "fast-llm",
    title: "大语言模型应用",
    emoji: "🤖",
    duration: "3-5 天",
    description: "了解大语言模型原理，学会搭建 RAG 系统、调用 API 开发 AI 应用",
    categoryKeys: ["llm"],
    levels: ["入门", "进阶"],
    borderColor: "border-l-blue-500",
    bgGradient: "from-blue-500/5 to-transparent",
    dotColor: "bg-blue-500",
    subPaths: [
      { emoji: "🤖", label: "LLM 原理", categoryKeys: ["llm"] },
      { emoji: "🔍", label: "RAG 实战", categoryKeys: ["llm"] },
    ],
  },
  {
    id: "fast-agent",
    title: "AI Agent 实战",
    emoji: "🦾",
    duration: "1 周",
    description: "搭建自己的 AI Agent，学会工具调用、多 Agent 协作，让 AI 帮你自动化工作",
    categoryKeys: ["agent"],
    levels: ["入门", "进阶"],
    borderColor: "border-l-purple-500",
    bgGradient: "from-purple-500/5 to-transparent",
    dotColor: "bg-purple-500",
    subPaths: [
      { emoji: "🦾", label: "Agent 入门", categoryKeys: ["agent"] },
    ],
  },
  {
    id: "fast-project",
    title: "AI 工程化与实践",
    emoji: "🚀",
    duration: "1-2 周",
    description: "将 AI 应用部署到生产环境，学习 AI 工程化最佳实践和真实项目案例",
    categoryKeys: ["aieng", "practice"],
    levels: ["入门", "进阶"],
    borderColor: "border-l-emerald-500",
    bgGradient: "from-emerald-500/5 to-transparent",
    dotColor: "bg-emerald-500",
    subPaths: [
      { emoji: "🔧", label: "AI 工程化", categoryKeys: ["aieng"] },
      { emoji: "🌍", label: "实践应用", categoryKeys: ["practice"] },
    ],
  },
];

// 📚 基础路线 — 系统学习（建议 2-3 个月）
const foundationPhases: PhaseConfig[] = [
  {
    id: "foundation",
    title: "入门基础",
    emoji: "📚",
    duration: "建议 2-3 周",
    description: "打好 AI 学习的数学和机器学习基础，理解核心概念与常用算法",
    categoryKeys: ["math", "ml"],
    levels: ["入门"],
    borderColor: "border-l-emerald-500",
    bgGradient: "from-emerald-500/5 to-transparent",
    dotColor: "bg-emerald-500",
    subPaths: [
      { emoji: "📐", label: "数学基础", categoryKeys: ["math"] },
      { emoji: "📊", label: "机器学习基础", categoryKeys: ["ml"] },
    ],
  },
  {
    id: "core",
    title: "核心技术",
    emoji: "🧠",
    duration: "建议 3-4 周",
    description: "掌握深度学习、NLP 和计算机视觉三大核心技术方向",
    categoryKeys: ["dl", "nlp", "cv"],
    levels: ["入门"],
    borderColor: "border-l-blue-500",
    bgGradient: "from-blue-500/5 to-transparent",
    dotColor: "bg-blue-500",
    subPaths: [
      { emoji: "🧠", label: "深度学习", categoryKeys: ["dl"] },
      { emoji: "💬", label: "NLP", categoryKeys: ["nlp"] },
      { emoji: "👁️", label: "计算机视觉", categoryKeys: ["cv"] },
    ],
  },
  {
    id: "advanced",
    title: "进阶提升",
    emoji: "🚀",
    duration: "建议 4-5 周",
    description: "深入学习大语言模型和 AI Agent，理解前沿技术架构与应用",
    categoryKeys: ["llm", "agent"],
    levels: ["入门", "进阶"],
    borderColor: "border-l-purple-500",
    bgGradient: "from-purple-500/5 to-transparent",
    dotColor: "bg-purple-500",
    subPaths: [
      { emoji: "🤖", label: "大语言模型", categoryKeys: ["llm"] },
      { emoji: "🦾", label: "AI Agent", categoryKeys: ["agent"] },
    ],
  },
  {
    id: "specialization",
    title: "专业方向",
    emoji: "🎯",
    duration: "按兴趣选择",
    description: "选择感兴趣的专业方向深入学习，构建完整 AI 技术栈",
    categoryKeys: ["rl", "genai", "multimodal", "aieng", "practice"],
    levels: ["入门"],
    borderColor: "border-l-amber-500",
    bgGradient: "from-amber-500/5 to-transparent",
    dotColor: "bg-amber-500",
    subPaths: [
      { emoji: "🎮", label: "强化学习", categoryKeys: ["rl"] },
      { emoji: "🎨", label: "生成式 AI", categoryKeys: ["genai"] },
      { emoji: "🔗", label: "多模态", categoryKeys: ["multimodal"] },
      { emoji: "🔧", label: "AI 工程化", categoryKeys: ["aieng"] },
      { emoji: "🌍", label: "实践应用", categoryKeys: ["practice"] },
    ],
  },
];

const MAX_ARTICLES_DEFAULT = 6;

export default function LearningPathSection() {
  const [route, setRoute] = useState<"fast" | "foundation">("fast");
  const [expandedPhases, setExpandedPhases] = useState<Set<string>>(new Set());

  const activePhases = route === "fast" ? fastTrackPhases : foundationPhases;

  const phaseArticles = useMemo(() => {
    return activePhases.map((phase) => {
      const filtered = articles.filter(
        (a) =>
          phase.categoryKeys.includes(a.category) &&
          phase.levels.includes(a.level)
      );
      const levelOrder: Record<string, number> = { 入门: 0, 进阶: 1, 高级: 2 };
      filtered.sort(
        (a, b) =>
          levelOrder[a.level] - levelOrder[b.level] ||
          b.date.localeCompare(a.date)
      );
      return { phase, articles: filtered };
    });
  }, [activePhases]);

  const toggleExpand = (phaseId: string) => {
    setExpandedPhases((prev) => {
      const next = new Set(prev);
      if (next.has(phaseId)) {
        next.delete(phaseId);
      } else {
        next.add(phaseId);
      }
      return next;
    });
  };

  return (
    <section className="px-4 sm:px-6 lg:px-8 pb-8">
      <div className="max-w-5xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-6">
          <h2 className="text-2xl sm:text-3xl font-bold mb-2">
            🗺️ AI 学习路线
          </h2>
          <p className="text-slate-400 text-sm sm:text-base max-w-xl mx-auto mb-5">
            选择适合自己的学习路径，从入门到进阶
          </p>

          {/* Route Toggle */}
          <div className="inline-flex items-center gap-2 p-1 rounded-xl bg-white/5 border border-white/10">
            <button
              onClick={() => { setRoute("fast"); setExpandedPhases(new Set()); }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                route === "fast"
                  ? "bg-cyan-500/20 text-cyan-300 shadow-lg shadow-cyan-500/10"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              }`}
            >
              🚀 速成路线
              <span className="ml-1.5 text-xs text-slate-500">1-2 周</span>
            </button>
            <button
              onClick={() => { setRoute("foundation"); setExpandedPhases(new Set()); }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                route === "foundation"
                  ? "bg-emerald-500/20 text-emerald-300 shadow-lg shadow-emerald-500/10"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              }`}
            >
              📚 基础路线
              <span className="ml-1.5 text-xs text-slate-500">2-3 月</span>
            </button>
          </div>
        </div>

        {/* Route Description */}
        <div className={`text-center mb-6 px-4 py-3 rounded-xl ${
          route === "fast"
            ? "bg-cyan-500/5 border border-cyan-500/10"
            : "bg-emerald-500/5 border border-emerald-500/10"
        }`}>
          <p className={`text-sm ${
            route === "fast" ? "text-cyan-300" : "text-emerald-300"
          }`}>
            {route === "fast"
              ? "💡 先学会用，再补基础 — 适合想快速上手 AI 应用的开发者"
              : "📖 循序渐进，系统学习 — 适合想深入理解 AI 原理的学习者"}
          </p>
        </div>

        {/* Timeline */}
        <div className="relative">
          {/* Vertical line */}
          <div className={`absolute left-5 sm:left-6 top-0 bottom-0 w-0.5 ${
            route === "fast"
              ? "bg-gradient-to-b from-cyan-500/30 via-blue-500/30 via-purple-500/30 to-emerald-500/30"
              : "bg-gradient-to-b from-emerald-500/30 via-blue-500/30 via-purple-500/30 to-amber-500/30"
          }`} />

          {phaseArticles.map(({ phase, articles: phaseArts }, idx) => {
            const isExpanded = expandedPhases.has(phase.id);
            const visibleArticles = isExpanded
              ? phaseArts
              : phaseArts.slice(0, MAX_ARTICLES_DEFAULT);
            const hasMore = phaseArts.length > MAX_ARTICLES_DEFAULT;

            return (
              <div key={phase.id} className="relative pl-12 sm:pl-14 mb-6 last:mb-0">
                {/* Timeline dot */}
                <div
                  className={`absolute left-3.5 sm:left-4.5 top-6 w-3 h-3 rounded-full ${phase.dotColor} ring-4 ring-slate-900 z-10`}
                />

                {/* Arrow connector between phases */}
                {idx > 0 && (
                  <div className="absolute left-5 sm:left-6 -top-3 flex flex-col items-center">
                    <svg
                      className="w-4 h-4 text-slate-600"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M19 14l-7 7m0 0l-7-7m7 7V3"
                      />
                    </svg>
                  </div>
                )}

                {/* Phase card */}
                <div
                  className={`rounded-2xl bg-gradient-to-r ${phase.bgGradient} bg-white/5 backdrop-blur-md border border-white/10 border-l-4 ${phase.borderColor} p-5 sm:p-6`}
                >
                  {/* Phase header */}
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xl">{phase.emoji}</span>
                        <h3 className="text-lg sm:text-xl font-bold">
                          第{idx + 1}阶段：{phase.title}
                        </h3>
                      </div>
                      <p className="text-slate-400 text-sm">{phase.description}</p>
                    </div>
                    <span className="shrink-0 px-3 py-1 rounded-full bg-white/10 text-xs font-medium text-slate-300">
                      ⏱ {phase.duration}
                    </span>
                  </div>

                  {/* Sub paths */}
                  {phase.subPaths && (
                    <div className="flex flex-wrap items-center gap-2 mb-4">
                      {phase.subPaths.map((sp, spIdx) => (
                        <span key={sp.label}>
                          {spIdx > 0 && (
                            <span className="text-slate-600 mx-1">→</span>
                          )}
                          <span className="px-2.5 py-1 rounded-lg bg-white/5 text-xs text-slate-300">
                            {sp.emoji} {sp.label}
                          </span>
                        </span>
                      ))}
                      <span className="text-xs text-slate-500 ml-2">
                        ({phaseArts.length} 篇文章)
                      </span>
                    </div>
                  )}

                  {/* Articles */}
                  {phaseArts.length > 0 ? (
                    <>
                      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {visibleArticles.map((article) => (
                          <ArticleCard key={article.id} article={article} />
                        ))}
                      </div>

                      {hasMore && (
                        <div className="mt-4 text-center">
                          <button
                            onClick={() => toggleExpand(phase.id)}
                            className="px-5 py-2 rounded-lg bg-white/5 border border-white/10 text-sm font-medium text-slate-300 hover:bg-white/10 hover:text-white transition-all"
                          >
                            {isExpanded
                              ? `收起（${phaseArts.length} 篇）`
                              : `展开全部（${phaseArts.length} 篇）`}
                          </button>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-center py-6">
                      <p className="text-slate-500 text-sm">
                        暂无推荐文章，敬请期待
                      </p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
