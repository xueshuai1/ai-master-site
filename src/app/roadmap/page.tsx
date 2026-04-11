"use client";

import Link from "next/link";
import { useState } from "react";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";

const roadmapPhases = [
  {
    phase: 1,
    title: "入门基础",
    duration: "4-6 周",
    icon: "🌱",
    color: "from-emerald-500/20 to-teal-500/20",
    borderColor: "border-emerald-500/30",
    badgeColor: "bg-emerald-500/10 text-emerald-300",
    steps: [
      { title: "Python 编程基础", desc: "语法、数据结构、函数、面向对象", tags: ["Python", "编程基础"] },
      { title: "数学基础复习", desc: "线性代数、概率论、微积分核心概念", tags: ["数学", "线性代数", "概率"] },
      { title: "机器学习概述", desc: "什么是机器学习、监督/无监督学习、基本流程", tags: ["ML 概述", "概念"] },
      { title: "第一个 ML 项目", desc: "用 scikit-learn 完成鸢尾花分类或房价预测", tags: ["scikit-learn", "实战"] },
    ],
  },
  {
    phase: 2,
    title: "机器学习进阶",
    duration: "6-8 周",
    icon: "📊",
    color: "from-blue-500/20 to-cyan-500/20",
    borderColor: "border-blue-500/30",
    badgeColor: "bg-blue-500/10 text-blue-300",
    steps: [
      { title: "经典算法深入", desc: "线性回归、逻辑回归、决策树、随机森林、SVM", tags: ["算法", "原理"] },
      { title: "模型评估与优化", desc: "交叉验证、偏差-方差权衡、正则化、超参数调优", tags: ["评估", "调参"] },
      { title: "特征工程", desc: "特征选择、特征提取、数据预处理 Pipeline", tags: ["特征", "数据清洗"] },
      { title: "集成学习", desc: "Bagging、Boosting、Stacking、XGBoost 实战", tags: ["XGBoost", "集成"] },
    ],
  },
  {
    phase: 3,
    title: "深度学习",
    duration: "8-10 周",
    icon: "🧠",
    color: "from-violet-500/20 to-purple-500/20",
    borderColor: "border-violet-500/30",
    badgeColor: "bg-violet-500/10 text-violet-300",
    steps: [
      { title: "神经网络基础", desc: "感知机、反向传播、激活函数、梯度消失", tags: ["神经网络", "BP"] },
      { title: "PyTorch 框架", desc: "Tensor 操作、自动求导、Module 搭建训练流程", tags: ["PyTorch", "框架"] },
      { title: "CNN 卷积神经网络", desc: "LeNet、AlexNet、VGG、ResNet 架构演进", tags: ["CNN", "图像"] },
      { title: "RNN 与序列模型", desc: "RNN、LSTM、GRU 及其在 NLP 中的应用", tags: ["RNN", "LSTM", "序列"] },
      { title: "Transformer 架构", desc: "Self-Attention、Multi-Head、编码器-解码器", tags: ["Transformer", "Attention"] },
    ],
  },
  {
    phase: 4,
    title: "专业方向",
    duration: "8-12 周",
    icon: "🎯",
    color: "from-amber-500/20 to-orange-500/20",
    borderColor: "border-amber-500/30",
    badgeColor: "bg-amber-500/10 text-amber-300",
    steps: [
      { title: "NLP 方向", desc: "词嵌入、BERT 微调、文本分类、命名实体识别", tags: ["NLP", "BERT"] },
      { title: "CV 方向", desc: "目标检测 (YOLO)、图像分割、数据增强", tags: ["CV", "YOLO"] },
      { title: "强化学习", desc: "MDP、Q-Learning、策略梯度、DQN", tags: ["RL", "DQN"] },
      { title: "生成模型", desc: "VAE、GAN、Diffusion Model 原理与应用", tags: ["GAN", "Diffusion"] },
    ],
  },
  {
    phase: 5,
    title: "大语言模型",
    duration: "6-8 周",
    icon: "🤖",
    color: "from-rose-500/20 to-pink-500/20",
    borderColor: "border-rose-500/30",
    badgeColor: "bg-rose-500/10 text-rose-300",
    steps: [
      { title: "LLM 训练管线", desc: "预训练、SFT、RLHF 完整流程解析", tags: ["预训练", "RLHF"] },
      { title: "Prompt Engineering", desc: "CoT、Few-shot、ReAct 等设计模式", tags: ["Prompt", "技巧"] },
      { title: "RAG 架构", desc: "向量数据库、检索策略、上下文增强生成", tags: ["RAG", "向量库"] },
      { title: "Fine-tuning 实战", desc: "LoRA/QLoRA 微调开源大模型", tags: ["LoRA", "微调"] },
    ],
  },
  {
    phase: 6,
    title: "AI Agent 与前沿",
    duration: "持续学习",
    icon: "🚀",
    color: "from-brand-500/20 to-accent-500/20",
    borderColor: "border-brand-500/30",
    badgeColor: "bg-brand-500/10 text-brand-300",
    steps: [
      { title: "AI Agent 基础", desc: "感知、规划、记忆、工具调用核心组件", tags: ["Agent", "规划"] },
      { title: "Multi-Agent 系统", desc: "角色分工、通信协议、协作与竞争", tags: ["Multi-Agent", "协作"] },
      { title: "MCP 与工具生态", desc: "Model Context Protocol 与 Agent 工具集成", tags: ["MCP", "工具"] },
      { title: "前沿论文追踪", desc: "arXiv 论文精读、复现 SOTA 模型", tags: ["论文", "SOTA"] },
    ],
  },
];

const levelInfo = [
  { level: "入门", icon: "🌱", desc: "零基础开始，建立编程和数学基础" },
  { level: "进阶", icon: "📈", desc: "深入算法原理，掌握工程实践" },
  { level: "高级", icon: "🔬", desc: "专精特定方向，具备独立研究能力" },
  { level: "专家", icon: "🏆", desc: "前沿技术探索，推动技术发展" },
];

export default function RoadmapPage() {
  const [expandedPhase, setExpandedPhase] = useState<number | null>(1);

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-brand-950 text-white">
      <Navbar activePath="/roadmap" />

      {/* Hero */}
      <section className="pt-28 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-brand-500/10 border border-brand-500/20 rounded-full mb-6">
            <span className="w-2 h-2 bg-brand-400 rounded-full animate-pulse" />
            <span className="text-sm text-brand-300">AI 学习路线图</span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4">
            从 <span className="text-gradient">零基础</span> 到
            <br />
            <span className="text-gradient">AI 专家</span> 的完整路径
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            精心设计的 6 阶段学习计划，每个阶段都有明确的目标、推荐内容和预计时间
          </p>
        </div>
      </section>

      {/* Level Overview */}
      <section className="px-4 sm:px-6 lg:px-8 pb-12">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            {levelInfo.map((level) => (
              <div
                key={level.level}
                className="p-4 sm:p-5 rounded-xl bg-white/5 border border-white/5 text-center"
              >
                <div className="text-2xl sm:text-3xl mb-2">{level.icon}</div>
                <div className="font-semibold text-sm sm:text-base">{level.level}</div>
                <div className="text-xs text-slate-500 mt-1">{level.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="px-4 sm:px-6 lg:px-8 pb-20">
        <div className="max-w-4xl mx-auto">
          {/* Vertical timeline line */}
          <div className="relative">
            {/* Center line - hidden on mobile, shown on md+ */}
            <div className="hidden md:block absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-emerald-500/30 via-violet-500/30 to-brand-500/30" />

            <div className="space-y-4">
              {roadmapPhases.map((phase) => {
                const isExpanded = expandedPhase === phase.phase;
                return (
                  <div
                    key={phase.phase}
                    className={`relative rounded-2xl border transition-all ${
                      isExpanded
                        ? `bg-gradient-to-r ${phase.color} ${phase.borderColor}`
                        : "bg-white/5 border-white/5 hover:border-white/10"
                    }`}
                  >
                    {/* Phase header - always clickable */}
                    <button
                      onClick={() => setExpandedPhase(isExpanded ? null : phase.phase)}
                      className="w-full flex items-center gap-4 p-5 sm:p-6 text-left"
                    >
                      {/* Phase number circle */}
                      <div
                        className={`shrink-0 w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center text-xl sm:text-2xl font-bold border-2 transition-all ${
                          isExpanded
                            ? "bg-brand-600 border-brand-400 text-white scale-110"
                            : "bg-white/5 border-white/10 text-slate-400"
                        }`}
                      >
                        {phase.icon}
                      </div>

                      {/* Phase info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                          <h3 className="text-lg sm:text-xl font-bold">{phase.title}</h3>
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${phase.badgeColor}`}>
                            {phase.duration}
                          </span>
                        </div>
                        <p className="text-sm text-slate-500 mt-0.5">
                          {phase.steps.length} 个学习模块 · 点击展开详情
                        </p>
                      </div>

                      {/* Expand arrow */}
                      <svg
                        className={`w-5 h-5 text-slate-400 shrink-0 transition-transform duration-300 ${
                          isExpanded ? "rotate-180" : ""
                        }`}
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                    {/* Expanded content */}
                    {isExpanded && (
                      <div className="px-5 sm:px-6 pb-5 sm:pb-6">
                        <div className="space-y-3 ml-0 sm:ml-16">
                          {phase.steps.map((step, idx) => (
                            <div
                              key={idx}
                              className="flex items-start gap-4 p-4 rounded-xl bg-white/5 border border-white/5 hover:border-brand-500/20 transition-all"
                            >
                              {/* Step number */}
                              <div className="shrink-0 w-8 h-8 rounded-lg bg-brand-500/10 text-brand-400 flex items-center justify-center text-sm font-bold">
                                {idx + 1}
                              </div>

                              {/* Step content */}
                              <div className="flex-1 min-w-0">
                                <h4 className="font-semibold text-sm sm:text-base mb-1">
                                  {step.title}
                                </h4>
                                <p className="text-sm text-slate-400 leading-relaxed">
                                  {step.desc}
                                </p>
                                <div className="flex flex-wrap gap-1.5 mt-2">
                                  {step.tags.map((tag) => (
                                    <span
                                      key={tag}
                                      className="px-2 py-0.5 bg-white/5 rounded text-xs text-slate-500"
                                    >
                                      #{tag}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 sm:px-6 lg:px-8 pb-20">
        <div className="max-w-4xl mx-auto">
          <div className="text-center p-10 rounded-3xl bg-gradient-to-r from-brand-600/10 to-accent-600/10 border border-brand-500/20">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4">
              选择你的起点，开始学习吧！
            </h2>
            <p className="text-slate-400 mb-8 max-w-lg mx-auto">
              无论你现在处于哪个阶段，都能在这里找到适合的学习内容
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/knowledge"
                className="px-8 py-3 bg-brand-600 hover:bg-brand-500 rounded-xl font-semibold transition-all hover:shadow-lg hover:shadow-brand-500/25 hover:-translate-y-0.5"
              >
                📚 浏览知识库
              </Link>
              <Link
                href="/tools"
                className="px-8 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl font-semibold transition-all hover:-translate-y-0.5"
              >
                🛠️ 探索 AI 工具
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
