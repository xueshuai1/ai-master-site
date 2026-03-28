"use client";

import Link from "next/link";
import { useState } from "react";

// Lucide 风格 SVG 图标组件
function MapIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21" />
      <line x1="9" x2="9" y1="3" y2="18" />
      <line x1="15" x2="15" y1="6" y2="21" />
    </svg>
  );
}

function BookIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </svg>
  );
}

function CpuIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="4" width="16" height="16" rx="2" />
      <rect x="9" y="9" width="6" height="6" />
      <path d="M15 2v2" /><path d="M15 20v2" /><path d="M2 15h2" /><path d="M2 9h2" /><path d="M20 15h2" /><path d="M20 9h2" /><path d="M9 2v2" /><path d="M9 20v2" />
    </svg>
  );
}

function BrainIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z" />
      <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z" />
    </svg>
  );
}

function ZapIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  );
}

function CodeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function ArrowLeftIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 12H5" />
      <path d="m12 19-7-7 7-7" />
    </svg>
  );
}

// 学习路径数据
const ROADMAPS = [
  {
    id: "ml-beginner",
    title: "机器学习入门",
    description: "从零开始学习机器学习，掌握核心概念和算法",
    duration: "8-12 周",
    level: "入门",
    icon: CpuIcon,
    color: "blue",
    steps: [
      { order: 1, title: "Python 基础", description: "掌握 Python 编程和 NumPy、Pandas", duration: "2 周" },
      { order: 2, title: "数学基础", description: "线性代数、概率论、微积分", duration: "2 周" },
      { order: 3, title: "机器学习算法", description: "线性回归、逻辑回归、决策树、SVM", duration: "3 周" },
      { order: 4, title: "模型评估", description: "交叉验证、评估指标、调参", duration: "1 周" },
      { order: 5, title: "实战项目", description: "完成一个完整的 ML 项目", duration: "2-4 周" },
    ],
  },
  {
    id: "dl-intermediate",
    title: "深度学习进阶",
    description: "深入理解神经网络，掌握 CNN、RNN、Transformer",
    duration: "12-16 周",
    level: "进阶",
    icon: BrainIcon,
    color: "purple",
    steps: [
      { order: 1, title: "神经网络基础", description: "感知机、反向传播、激活函数", duration: "2 周" },
      { order: 2, title: "CNN", description: "卷积神经网络、图像分类", duration: "3 周" },
      { order: 3, title: "RNN & LSTM", description: "序列模型、语言建模", duration: "3 周" },
      { order: 4, title: "Transformer", description: "注意力机制、BERT、GPT", duration: "4 周" },
      { order: 5, title: "实战项目", description: "CV 或 NLP 项目", duration: "2-4 周" },
    ],
  },
  {
    id: "llm-advanced",
    title: "大语言模型专家",
    description: "掌握 LLM 应用开发，包括 Prompt、RAG、Fine-tuning",
    duration: "8-12 周",
    level: "高级",
    icon: ZapIcon,
    color: "orange",
    steps: [
      { order: 1, title: "LLM 基础", description: "了解大模型原理和能力边界", duration: "1 周" },
      { order: 2, title: "Prompt Engineering", description: "编写高效 Prompt", duration: "2 周" },
      { order: 3, title: "RAG 实战", description: "检索增强生成、向量数据库", duration: "3 周" },
      { order: 4, title: "Fine-tuning", description: "模型微调、LoRA、QLoRA", duration: "3 周" },
      { order: 5, title: "Agent 开发", description: "构建 AI Agent 应用", duration: "2-3 周" },
    ],
  },
  {
    id: "frontend-ai",
    title: "前端 + AI",
    description: "前端开发者学习 AI，构建智能 Web 应用",
    duration: "6-10 周",
    level: "入门",
    icon: CodeIcon,
    color: "green",
    steps: [
      { order: 1, title: "AI 基础概念", description: "了解 AI/ML 基础", duration: "1 周" },
      { order: 2, title: "API 集成", description: "调用 LLM API", duration: "2 周" },
      { order: 3, title: "智能 UI/UX", description: "设计 AI 友好的交互", duration: "2 周" },
      { order: 4, title: "流式响应", description: "实现打字机效果", duration: "1 周" },
      { order: 5, title: "实战项目", description: "AI 聊天应用", duration: "2-4 周" },
    ],
  },
  {
    id: "backend-ai",
    title: "后端 + AI",
    description: "后端开发者学习 AI，构建模型服务和 AI 系统",
    duration: "10-14 周",
    level: "进阶",
    icon: CpuIcon,
    color: "indigo",
    steps: [
      { order: 1, title: "AI 基础", description: "机器学习、深度学习概述", duration: "2 周" },
      { order: 2, title: "模型部署", description: "FastAPI、模型服务化", duration: "3 周" },
      { order: 3, title: "向量数据库", description: "Pinecone、Milvus、Weaviate", duration: "2 周" },
      { order: 4, title: "系统设计", description: "AI 系统架构设计", duration: "3 周" },
      { order: 5, title: "实战项目", description: "完整的 AI 后端服务", duration: "2-4 周" },
    ],
  },
];

export default function RoadmapsPage() {
  const [selectedRoadmap, setSelectedRoadmap] = useState<string | null>(null);

  const currentRoadmap = ROADMAPS.find((r) => r.id === selectedRoadmap);

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Google Fonts */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&family=Open+Sans:wght@300;400;500;600;700&display=swap');
        
        * {
          font-family: 'Open Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }
        
        h1, h2, h3, h4, h5, h6 {
          font-family: 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }
      `}</style>

      {/* Header */}
      <header className="bg-white border-b border-[#E2E8F0]">
        <div className="container mx-auto px-4 py-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-[#64748B] hover:text-[#2563EB] transition-colors mb-4"
          >
            <ArrowLeftIcon className="w-5 h-5" />
            返回首页
          </Link>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-[#F1F5F9] rounded-xl flex items-center justify-center">
              <MapIcon className="w-8 h-8 text-[#2563EB]" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-[#1E293B]">🗺️ 学习路径</h1>
              <p className="text-[#64748B]">系统性学习 AI，从入门到精通的完整路线图</p>
            </div>
          </div>
        </div>
      </header>

      {/* 学习路径列表 */}
      <section className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 左侧：路径列表 */}
          <div className="lg:col-span-1 space-y-4">
            <h2 className="text-xl font-bold text-[#1E293B] mb-4">选择学习路径</h2>
            {ROADMAPS.map((roadmap) => {
              const Icon = roadmap.icon;
              return (
                <button
                  key={roadmap.id}
                  onClick={() => setSelectedRoadmap(roadmap.id)}
                  className={`w-full text-left p-5 rounded-xl border transition-all ${
                    selectedRoadmap === roadmap.id
                      ? "bg-[#2563EB] text-white border-[#2563EB] shadow-md"
                      : "bg-white text-[#1E293B] border-[#E2E8F0] hover:border-[#2563EB] hover:shadow-sm"
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      selectedRoadmap === roadmap.id ? "bg-white/20" : "bg-[#F1F5F9]"
                    }`}>
                      <Icon className={`w-5 h-5 ${
                        selectedRoadmap === roadmap.id ? "text-white" : "text-[#2563EB]"
                      }`} />
                    </div>
                    <div>
                      <h3 className="font-semibold">{roadmap.title}</h3>
                      <p className={`text-sm ${
                        selectedRoadmap === roadmap.id ? "text-white/80" : "text-[#64748B]"
                      }`}>
                        {roadmap.duration} · {roadmap.level}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* 右侧：路径详情 */}
          <div className="lg:col-span-2">
            {currentRoadmap ? (
              <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6">
                <div className="flex items-center gap-4 mb-6">
                  <div className={`w-16 h-16 rounded-xl flex items-center justify-center bg-[#F1F5F9]`}>
                    <currentRoadmap.icon className="w-8 h-8 text-[#2563EB]" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-[#1E293B]">{currentRoadmap.title}</h2>
                    <p className="text-[#64748B]">{currentRoadmap.description}</p>
                  </div>
                </div>

                <div className="mb-6 flex gap-4">
                  <span className="px-3 py-1 bg-[#F1F5F9] text-[#475569] text-sm rounded-lg">
                    ⏱️ {currentRoadmap.duration}
                  </span>
                  <span className="px-3 py-1 bg-[#DCFCE7] text-[#166534] text-sm rounded-lg">
                    📊 {currentRoadmap.level}
                  </span>
                </div>

                <h3 className="text-lg font-semibold text-[#1E293B] mb-4">学习步骤</h3>
                <div className="space-y-4">
                  {currentRoadmap.steps.map((step, idx) => (
                    <div
                      key={step.order}
                      className="flex gap-4 p-4 bg-[#F8FAFC] rounded-xl"
                    >
                      <div className="flex-shrink-0 w-8 h-8 bg-[#2563EB] text-white rounded-full flex items-center justify-center font-semibold">
                        {step.order}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-[#1E293B] mb-1">{step.title}</h4>
                        <p className="text-sm text-[#64748B] mb-2">{step.description}</p>
                        <span className="text-xs text-[#94A3B8]">⏱️ {step.duration}</span>
                      </div>
                      {idx < currentRoadmap.steps.length - 1 && (
                        <div className="flex-shrink-0 w-0.5 bg-[#E2E8F0] self-stretch"></div>
                      )}
                    </div>
                  ))}
                </div>

                <div className="mt-8 flex gap-4">
                  <Link
                    href="/knowledge"
                    className="flex-1 px-6 py-3 bg-[#2563EB] text-white text-center rounded-xl hover:bg-[#1D4ED8] transition-all font-medium"
                  >
                    开始学习
                  </Link>
                  <Link
                    href="/interview"
                    className="flex-1 px-6 py-3 bg-white text-[#2563EB] border border-[#2563EB] text-center rounded-xl hover:bg-[#F1F5F9] transition-all font-medium"
                  >
                    面试题目
                  </Link>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-[#E2E8F0] p-12 text-center">
                <div className="w-20 h-20 bg-[#F1F5F9] rounded-full flex items-center justify-center mx-auto mb-6">
                  <MapIcon className="w-10 h-10 text-[#94A3B8]" />
                </div>
                <h3 className="text-xl font-semibold text-[#1E293B] mb-3">
                  选择一条学习路径
                </h3>
                <p className="text-[#64748B] max-w-md mx-auto">
                  从左侧选择适合你的学习路径，查看详细的学习步骤和时间规划
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 学习建议 */}
      <section className="container mx-auto px-4 py-8">
        <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl p-8">
          <h2 className="text-xl font-bold text-[#1E293B] mb-4">💡 学习建议</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-5 rounded-xl">
              <div className="text-2xl mb-2">🎯</div>
              <h3 className="font-semibold text-[#1E293B] mb-2">明确目标</h3>
              <p className="text-sm text-[#64748B]">
                根据你的背景和职业目标选择合适的学习路径
              </p>
            </div>
            <div className="bg-white p-5 rounded-xl">
              <div className="text-2xl mb-2">⏰</div>
              <h3 className="font-semibold text-[#1E293B] mb-2">坚持学习</h3>
              <p className="text-sm text-[#64748B]">
                每天投入 1-2 小时，保持学习的连续性
              </p>
            </div>
            <div className="bg-white p-5 rounded-xl">
              <div className="text-2xl mb-2">🛠️</div>
              <h3 className="font-semibold text-[#1E293B] mb-2">动手实践</h3>
              <p className="text-sm text-[#64748B]">
                完成每个阶段的实战项目，巩固所学知识
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 text-center text-[#94A3B8] border-t border-[#E2E8F0] mt-12">
        <p className="text-sm">© 2026 AI 学习与面试大全 | Built with Next.js & Vercel</p>
      </footer>
    </div>
  );
}
