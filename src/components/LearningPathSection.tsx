"use client";

import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { articles } from "@/data/knowledge";
import ArticleCard from "@/components/ArticleCard";

interface PhaseDef {
  id: string;
  title: string;
  emoji: string;
  duration: string;
  description: string;
  categoryKeys: string[];
  borderColor: string;
  bgGradient: string;
  dotColor: string;
  subPaths?: { emoji: string; label: string; categoryKeys: string[] }[];
}

interface RouteDef {
  id: string;
  name: string;
  emoji: string;
  duration: string;
  description: string;
  target: string;
  badgeColor: string;
  borderColor: string;
  phases: PhaseDef[];
}

const MAX_SHOW = 6;

// ==================== 路线定义 ====================

// 🚀 速成路线
const fastRoute: RouteDef = {
  id: "fast", name: "速成路线", emoji: "🚀", duration: "2-4 周",
  description: "先学会用，再补基础 — 适合想快速上手 AI 应用的开发者",
  target: "适合有编程基础，想快速使用 AI 工具的人",
  badgeColor: "bg-cyan-500/20 text-cyan-300", borderColor: "border-cyan-500/20",
  phases: [
    { id: "f1", title: "认识 AI", emoji: "🌍", duration: "30 分钟", description: "了解 AI 全景和应用场景", categoryKeys: ["practice"], borderColor: "border-l-white", bgGradient: "from-white/5 to-transparent", dotColor: "bg-white" },
    { id: "f2", title: "Prompt Engineering", emoji: "✏️", duration: "1-2 天", description: "学会和 AI 高效沟通", categoryKeys: ["prompt"], borderColor: "border-l-cyan-500", bgGradient: "from-cyan-500/5 to-transparent", dotColor: "bg-cyan-500" },
    { id: "f3", title: "大语言模型应用", emoji: "🤖", duration: "3-5 天", description: "LLM 原理、API 调用、RAG 搭建", categoryKeys: ["llm"], borderColor: "border-l-blue-500", bgGradient: "from-blue-500/5 to-transparent", dotColor: "bg-blue-500" },
    { id: "f4", title: "AI Agent 实战", emoji: "🦾", duration: "1 周", description: "搭建 AI Agent、工具调用、Multi-Agent", categoryKeys: ["agent"], borderColor: "border-l-purple-500", bgGradient: "from-purple-500/5 to-transparent", dotColor: "bg-purple-500" },
    { id: "f5", title: "AI 工程化", emoji: "🚀", duration: "1-2 周", description: "部署、MLOps、实战项目", categoryKeys: ["aieng", "practice"], borderColor: "border-l-emerald-500", bgGradient: "from-emerald-500/5 to-transparent", dotColor: "bg-emerald-500" },
  ],
};

// 📚 基础路线
const foundationRoute: RouteDef = {
  id: "foundation", name: "基础路线", emoji: "📚", duration: "6-12 月",
  description: "循序渐进，系统学习 — 适合零基础或转行建立完整知识体系",
  target: "适合想深入理解 AI 原理的学习者",
  badgeColor: "bg-emerald-500/20 text-emerald-300", borderColor: "border-emerald-500/20",
  phases: [
    { id: "b1", title: "认识 AI", emoji: "🌍", duration: "30 分钟", description: "AI 全景导览", categoryKeys: ["practice"], borderColor: "border-l-white", bgGradient: "from-white/5 to-transparent", dotColor: "bg-white" },
    { id: "b2", title: "入门基础", emoji: "📐", duration: "4-6 周", description: "数学 + 编程 + ML 基础", categoryKeys: ["math", "ml"], borderColor: "border-l-emerald-500", bgGradient: "from-emerald-500/5 to-transparent", dotColor: "bg-emerald-500", subPaths: [{ emoji: "📐", label: "数学", categoryKeys: ["math"] }, { emoji: "📊", label: "机器学习", categoryKeys: ["ml"] }] },
    { id: "b3", title: "机器学习进阶", emoji: "📊", duration: "6-8 周", description: "经典算法、模型评估、集成学习", categoryKeys: ["ml"], borderColor: "border-l-blue-500", bgGradient: "from-blue-500/5 to-transparent", dotColor: "bg-blue-500" },
    { id: "b4", title: "深度学习", emoji: "🧠", duration: "8-10 周", description: "CNN、RNN、Transformer", categoryKeys: ["dl"], borderColor: "border-l-violet-500", bgGradient: "from-violet-500/5 to-transparent", dotColor: "bg-violet-500" },
    { id: "b5", title: "专业方向", emoji: "🎯", duration: "8-12 周", description: "NLP / CV / 强化学习 / 生成式 AI", categoryKeys: ["nlp", "cv", "rl", "genai"], borderColor: "border-l-amber-500", bgGradient: "from-amber-500/5 to-transparent", dotColor: "bg-amber-500", subPaths: [{ emoji: "💬", label: "NLP", categoryKeys: ["nlp"] }, { emoji: "👁️", label: "CV", categoryKeys: ["cv"] }, { emoji: "🎮", label: "强化学习", categoryKeys: ["rl"] }] },
    { id: "b6", title: "大语言模型", emoji: "🤖", duration: "6-8 周", description: "LLM 训练、SFT、RLHF、微调", categoryKeys: ["llm"], borderColor: "border-l-rose-500", bgGradient: "from-rose-500/5 to-transparent", dotColor: "bg-rose-500" },
    { id: "b7", title: "AI Agent 与前沿", emoji: "🦾", duration: "持续学习", description: "Agent 架构、Multi-Agent、MCP", categoryKeys: ["agent"], borderColor: "border-l-brand-500", bgGradient: "from-brand-500/5 to-transparent", dotColor: "bg-brand-500" },
  ],
};

// 👨‍💻 AI 应用开发工程师
const aiDevRoute: RouteDef = {
  id: "ai-dev", name: "AI 应用开发工程师", emoji: "👨‍💻", duration: "3-6 月",
  description: "掌握 AI API 集成、RAG 系统、Agent 开发 — 构建 AI 驱动的应用",
  target: "有后端/前端基础，想转 AI 应用开发的工程师",
  badgeColor: "bg-blue-500/20 text-blue-300", borderColor: "border-blue-500/20",
  phases: [
    { id: "d1", title: "LLM 基础", emoji: "🤖", duration: "1-2 周", description: "Transformer、主流模型对比、Prompt", categoryKeys: ["llm", "prompt"], borderColor: "border-l-blue-500", bgGradient: "from-blue-500/5 to-transparent", dotColor: "bg-blue-500" },
    { id: "d2", title: "API 集成实战", emoji: "🔌", duration: "2-3 周", description: "API 调用、流式输出、成本优化", categoryKeys: ["llm", "practice"], borderColor: "border-l-cyan-500", bgGradient: "from-cyan-500/5 to-transparent", dotColor: "bg-cyan-500" },
    { id: "d3", title: "RAG 系统开发", emoji: "📚", duration: "3-4 周", description: "向量数据库、Embedding、检索策略", categoryKeys: ["llm"], borderColor: "border-l-emerald-500", bgGradient: "from-emerald-500/5 to-transparent", dotColor: "bg-emerald-500" },
    { id: "d4", title: "AI Agent 开发", emoji: "🦾", duration: "4-6 周", description: "Agent 组件、Function Calling、MCP、Multi-Agent", categoryKeys: ["agent"], borderColor: "border-l-purple-500", bgGradient: "from-purple-500/5 to-transparent", dotColor: "bg-purple-500" },
    { id: "d5", title: "工程化与部署", emoji: "🚀", duration: "2-4 周", description: "服务化部署、监控评估", categoryKeys: ["aieng", "mlops"], borderColor: "border-l-amber-500", bgGradient: "from-amber-500/5 to-transparent", dotColor: "bg-amber-500" },
  ],
};

// 🧠 AI 算法工程师
const algoRoute: RouteDef = {
  id: "algo", name: "AI 算法工程师", emoji: "🧠", duration: "6-12 月",
  description: "深入 ML/DL 理论，掌握模型训练与调优",
  target: "有数学和编程基础，想深入 AI 算法原理的工程师",
  badgeColor: "bg-violet-500/20 text-violet-300", borderColor: "border-violet-500/20",
  phases: [
    { id: "a1", title: "数学与编程基础", emoji: "📐", duration: "4-6 周", description: "线性代数、概率统计、Python", categoryKeys: ["math"], borderColor: "border-l-violet-500", bgGradient: "from-violet-500/5 to-transparent", dotColor: "bg-violet-500" },
    { id: "a2", title: "经典机器学习", emoji: "📊", duration: "6-8 周", description: "监督/无监督学习、模型评估", categoryKeys: ["ml"], borderColor: "border-l-blue-500", bgGradient: "from-blue-500/5 to-transparent", dotColor: "bg-blue-500" },
    { id: "a3", title: "深度学习", emoji: "🧠", duration: "8-10 周", description: "神经网络、CNN、Transformer、PyTorch", categoryKeys: ["dl"], borderColor: "border-l-rose-500", bgGradient: "from-rose-500/5 to-transparent", dotColor: "bg-rose-500" },
    { id: "a4", title: "大语言模型", emoji: "🤖", duration: "6-8 周", description: "预训练、SFT、RLHF、高效微调", categoryKeys: ["llm"], borderColor: "border-l-amber-500", bgGradient: "from-amber-500/5 to-transparent", dotColor: "bg-amber-500" },
    { id: "a5", title: "强化学习", emoji: "🎮", duration: "4-6 周", description: "MDP、策略梯度、PPO", categoryKeys: ["rl"], borderColor: "border-l-emerald-500", bgGradient: "from-emerald-500/5 to-transparent", dotColor: "bg-emerald-500" },
  ],
};

// 🎨 AI 产品经理
const pmRoute: RouteDef = {
  id: "pm", name: "AI 产品经理", emoji: "🎨", duration: "2-4 周",
  description: "理解 AI 能力边界，掌握 AI 产品设计方法论",
  target: "产品经理、创业者、业务负责人",
  badgeColor: "bg-pink-500/20 text-pink-300", borderColor: "border-pink-500/20",
  phases: [
    { id: "p1", title: "AI 全景认知", emoji: "🌍", duration: "1 周", description: "AI 能力边界、主流模型对比、2026 趋势", categoryKeys: ["practice"], borderColor: "border-l-pink-500", bgGradient: "from-pink-500/5 to-transparent", dotColor: "bg-pink-500" },
    { id: "p2", title: "AI 产品设计方法论", emoji: "💡", duration: "1 周", description: "Prompt Engineering、AI 产品模式、UX 设计", categoryKeys: ["prompt", "agent"], borderColor: "border-l-purple-500", bgGradient: "from-purple-500/5 to-transparent", dotColor: "bg-purple-500" },
    { id: "p3", title: "AI 商业化实战", emoji: "💰", duration: "1-2 周", description: "Token 经济学、合规与伦理、案例研究", categoryKeys: ["ethics", "practice"], borderColor: "border-l-amber-500", bgGradient: "from-amber-500/5 to-transparent", dotColor: "bg-amber-500" },
  ],
};

// 🔬 数据科学家
const dsRoute: RouteDef = {
  id: "data-scientist", name: "数据科学家", emoji: "🔬", duration: "4-8 月",
  description: "从数据分析到 AI 建模 — 用数据和 AI 驱动业务决策",
  target: "数据分析师转型、统计学背景、想深入 AI 建模的人",
  badgeColor: "bg-cyan-500/20 text-cyan-300", borderColor: "border-cyan-500/20",
  phases: [
    { id: "s1", title: "数据科学基础", emoji: "📊", duration: "4-6 周", description: "Python 数据分析、统计推断、ML 入门", categoryKeys: ["math", "ml"], borderColor: "border-l-cyan-500", bgGradient: "from-cyan-500/5 to-transparent", dotColor: "bg-cyan-500" },
    { id: "s2", title: "深度学习应用", emoji: "🧠", duration: "6-8 周", description: "神经网络、NLP 实战、CV 实战", categoryKeys: ["dl", "nlp", "cv"], borderColor: "border-l-violet-500", bgGradient: "from-violet-500/5 to-transparent", dotColor: "bg-violet-500" },
    { id: "s3", title: "LLM 与生成式 AI", emoji: "🤖", duration: "4-6 周", description: "LLM 原理、RAG 实战、Diffusion、GAN", categoryKeys: ["llm", "genai"], borderColor: "border-l-rose-500", bgGradient: "from-rose-500/5 to-transparent", dotColor: "bg-rose-500" },
    { id: "s4", title: "MLOps 与生产化", emoji: "🚀", duration: "4-6 周", description: "模型部署、实验管理", categoryKeys: ["mlops"], borderColor: "border-l-amber-500", bgGradient: "from-amber-500/5 to-transparent", dotColor: "bg-amber-500" },
  ],
};

// 🎯 大模型开发工程师
const llmEngRoute: RouteDef = {
  id: "llm-eng", name: "大模型开发工程师", emoji: "🎯", duration: "4-8 月",
  description: "深入 LLM 训练、微调、推理优化 — 成为大模型基础设施工程师",
  target: "有深度学习基础，想深入大模型底层技术的工程师",
  badgeColor: "bg-amber-500/20 text-amber-300", borderColor: "border-amber-500/20",
  phases: [
    { id: "l1", title: "Transformer 深度", emoji: "⚡", duration: "4-6 周", description: "Attention、模型架构演进、推理优化", categoryKeys: ["llm", "dl"], borderColor: "border-l-amber-500", bgGradient: "from-amber-500/5 to-transparent", dotColor: "bg-amber-500" },
    { id: "l2", title: "预训练实战", emoji: "🏗️", duration: "6-8 周", description: "数据管线、分布式训练、训练稳定性", categoryKeys: ["llm"], borderColor: "border-l-blue-500", bgGradient: "from-blue-500/5 to-transparent", dotColor: "bg-blue-500" },
    { id: "l3", title: "对齐与微调", emoji: "🎯", duration: "4-6 周", description: "SFT、RLHF、LoRA、QLoRA", categoryKeys: ["llm"], borderColor: "border-l-emerald-500", bgGradient: "from-emerald-500/5 to-transparent", dotColor: "bg-emerald-500" },
    { id: "l4", title: "推理与部署", emoji: "🚀", duration: "4-6 周", description: "vLLM、量化部署", categoryKeys: ["mlops"], borderColor: "border-l-purple-500", bgGradient: "from-purple-500/5 to-transparent", dotColor: "bg-purple-500" },
  ],
};

// 🛡️ AI 安全工程师
const securityRoute: RouteDef = {
  id: "security", name: "AI 安全工程师", emoji: "🛡️", duration: "2-4 月",
  description: "AI 伦理、对抗攻击、隐私保护 — 守护 AI 世界的安全底线",
  target: "安全工程师、AI 产品经理、关注 AI 伦理的开发者",
  badgeColor: "bg-red-500/20 text-red-300", borderColor: "border-red-500/20",
  phases: [
    { id: "e1", title: "AI 伦理与公平性", emoji: "⚖️", duration: "1-2 周", description: "偏见、可解释性、伦理框架", categoryKeys: ["ethics"], borderColor: "border-l-red-500", bgGradient: "from-red-500/5 to-transparent", dotColor: "bg-red-500" },
    { id: "e2", title: "隐私保护 ML", emoji: "🔒", duration: "2-3 周", description: "差分隐私、联邦学习", categoryKeys: ["ethics"], borderColor: "border-l-orange-500", bgGradient: "from-orange-500/5 to-transparent", dotColor: "bg-orange-500" },
    { id: "e3", title: "对抗攻击与防御", emoji: "🛡️", duration: "2-3 周", description: "对抗样本、防御策略", categoryKeys: ["ethics"], borderColor: "border-l-yellow-500", bgGradient: "from-yellow-500/5 to-transparent", dotColor: "bg-yellow-500" },
    { id: "e4", title: "LLM 安全", emoji: "🤖", duration: "2-3 周", description: "Prompt 注入、对齐与红队测试", categoryKeys: ["ethics", "llm"], borderColor: "border-l-violet-500", bgGradient: "from-violet-500/5 to-transparent", dotColor: "bg-violet-500" },
  ],
};

const allRoutes: RouteDef[] = [
  fastRoute, foundationRoute, aiDevRoute, algoRoute,
  pmRoute, dsRoute, llmEngRoute, securityRoute,
];

export default function LearningPathSection() {
  const savedRoute = typeof window !== 'undefined' ? sessionStorage.getItem('lp-route') : null;
  const [activeRoute, setActiveRoute] = useState<string>(savedRoute || "fast");
  const [expandedPhases, setExpandedPhases] = useState<Set<string>>(new Set());
  const scrollRef = useRef<HTMLDivElement>(null);

  // Persist route to sessionStorage so it survives navigation to article and back
  useEffect(() => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('lp-route', activeRoute);
    }
  }, [activeRoute]);

  // Scroll active route button into view after restore from sessionStorage
  const scrollToActive = useCallback(() => {
    if (scrollRef.current) {
      const activeBtn = scrollRef.current.querySelector('[data-active="true"]') as HTMLElement;
      if (activeBtn) {
        activeBtn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    }
  }, []);

  useEffect(() => {
    if (savedRoute && savedRoute !== 'fast') {
      requestAnimationFrame(scrollToActive);
    }
  }, [savedRoute, scrollToActive]);

  const route = allRoutes.find(r => r.id === activeRoute) || fastRoute;

  const phaseData = useMemo(() => {
    return route.phases.map(phase => {
      const filtered = articles.filter(a =>
        phase.categoryKeys.includes(a.category)
      );
      const levelOrder: Record<string, number> = { 入门: 0, 进阶: 1, 高级: 2 };
      filtered.sort((a, b) => levelOrder[a.level] - levelOrder[b.level] || b.date.localeCompare(a.date));
      return { phase, articles: filtered };
    });
  }, [route]);

  const toggleExpand = (id: string) => {
    setExpandedPhases(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  return (
    <section className="px-4 sm:px-6 lg:px-8 pb-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <h2 className="text-2xl sm:text-3xl font-bold mb-2">🗺️ AI 学习路线</h2>
          <p className="text-slate-400 text-sm sm:text-base max-w-xl mx-auto mb-5">
            根据你的岗位目标，选择最适合的学习路径
          </p>
        </div>

        {/* Route Selector — scrollable on mobile */}
        <div className="flex justify-center mb-6">
          <div ref={scrollRef} className="flex gap-2 overflow-x-auto pb-2 max-w-full scrollbar-hide">
            {allRoutes.map(r => (
              <button
                key={r.id}
                data-active={activeRoute === r.id ? 'true' : undefined}
                onClick={() => { setActiveRoute(r.id); setExpandedPhases(new Set()); }}
                className={`shrink-0 px-3 py-2 rounded-xl text-sm font-medium transition-all border whitespace-nowrap ${
                  activeRoute === r.id
                    ? `${r.badgeColor} ${r.borderColor} shadow-lg`
                    : "text-slate-400 border-white/10 hover:text-white hover:border-white/20 hover:bg-white/5"
                }`}
              >
                {r.emoji} {r.name}
                <span className="ml-1 text-xs opacity-60">{r.duration}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Route Description */}
        <div className={`text-center mb-6 px-4 py-3 rounded-xl ${route.borderColor} border bg-white/5`}>
          <p className={`text-sm ${route.badgeColor.split(" ")[1]}`}>
            💡 {route.description}
          </p>
          <p className="text-xs text-slate-500 mt-1">🎯 {route.target}</p>
        </div>

        {/* Timeline */}
        <div className="relative">
          {/* Vertical line */}
          <div className={`absolute left-5 sm:left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b ${
            route.id === "fast" ? "from-cyan-500/30 via-blue-500/30 to-emerald-500/30" :
            route.id === "foundation" ? "from-emerald-500/30 via-blue-500/30 to-amber-500/30" :
            route.id === "ai-dev" ? "from-blue-500/30 via-purple-500/30 to-amber-500/30" :
            route.id === "algo" ? "from-violet-500/30 via-rose-500/30 to-emerald-500/30" :
            route.id === "pm" ? "from-pink-500/30 via-purple-500/30 to-amber-500/30" :
            route.id === "data-scientist" ? "from-cyan-500/30 via-violet-500/30 to-amber-500/30" :
            route.id === "llm-eng" ? "from-amber-500/30 via-blue-500/30 to-purple-500/30" :
            "from-red-500/30 via-orange-500/30 to-violet-500/30"
          }`} />

          {phaseData.map(({ phase, articles: phaseArts }, idx) => {
            const isExpanded = expandedPhases.has(phase.id);
            const visible = isExpanded ? phaseArts : phaseArts.slice(0, MAX_SHOW);
            const hasMore = phaseArts.length > MAX_SHOW;

            return (
              <div key={phase.id} className="relative pl-12 sm:pl-14 mb-6 last:mb-0">
                <div className={`absolute left-3.5 sm:left-4.5 top-6 w-3 h-3 rounded-full ${phase.dotColor} ring-4 ring-slate-900 z-10`} />
                {idx > 0 && (
                  <div className="absolute left-5 sm:left-6 -top-3">
                    <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                    </svg>
                  </div>
                )}
                <div className={`rounded-2xl bg-gradient-to-r ${phase.bgGradient} bg-white/5 backdrop-blur-md border border-white/10 border-l-4 ${phase.borderColor} p-5 sm:p-6`}>
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xl">{phase.emoji}</span>
                        <h3 className="text-lg sm:text-xl font-bold">第 {idx + 1} 阶段：{phase.title}</h3>
                      </div>
                      <p className="text-slate-400 text-sm">{phase.description}</p>
                    </div>
                    <span className="shrink-0 px-3 py-1 rounded-full bg-white/10 text-xs font-medium text-slate-300">⏱ {phase.duration}</span>
                  </div>

                  {phase.subPaths && (
                    <div className="flex flex-wrap items-center gap-2 mb-4">
                      {phase.subPaths.map((sp, i) => (
                        <span key={sp.label}>
                          {i > 0 && <span className="text-slate-600 mx-1">→</span>}
                          <span className="px-2.5 py-1 rounded-lg bg-white/5 text-xs text-slate-300">{sp.emoji} {sp.label}</span>
                        </span>
                      ))}
                      <span className="text-xs text-slate-500 ml-2">({phaseArts.length} 篇文章)</span>
                    </div>
                  )}

                  {phaseArts.length > 0 ? (
                    <>
                      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {visible.map(a => <ArticleCard key={a.id} article={a} />)}
                      </div>
                      {hasMore && (
                        <div className="mt-4 text-center">
                          <button onClick={() => toggleExpand(phase.id)} className="px-5 py-2 rounded-lg bg-white/5 border border-white/10 text-sm font-medium text-slate-300 hover:bg-white/10 hover:text-white transition-all">
                            {isExpanded ? `收起（${phaseArts.length} 篇）` : `展开全部（${phaseArts.length} 篇）`}
                          </button>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-center py-6">
                      <p className="text-slate-500 text-sm">暂无推荐文章，敬请期待</p>
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
