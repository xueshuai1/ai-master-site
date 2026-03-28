"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";

// Lucide 风格 SVG 图标组件
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

function LayersIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z" />
      <path d="m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65" />
      <path d="m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65" />
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

function UsersIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
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

function ArrowLeftIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 12H5" />
      <path d="m12 19-7-7 7-7" />
    </svg>
  );
}

// 分类数据
const CATEGORIES: Record<string, { name: string; description: string; icon: React.ComponentType<{ className?: string }> }> = {
  ML: { name: "机器学习基础", description: "监督学习、无监督学习、模型评估", icon: CpuIcon },
  DL: { name: "深度学习", description: "神经网络、CNN、RNN、Transformer", icon: BrainIcon },
  NLP: { name: "自然语言处理", description: "词向量、语言模型、文本生成", icon: BookIcon },
  CV: { name: "计算机视觉", description: "图像分类、目标检测、分割", icon: LayersIcon },
  LLM: { name: "大语言模型", description: "Prompt、RAG、Fine-tuning、Agent", icon: ZapIcon },
  RecSys: { name: "推荐系统", description: "召回排序、协同过滤、深度学习", icon: UsersIcon },
  RL: { name: "强化学习", description: "MDP、Q-Learning、Policy Gradient", icon: CodeIcon },
  System: { name: "系统设计", description: "ML 系统设计、架构设计", icon: LayersIcon },
  Coding: { name: "编程算法", description: "LeetCode、数据结构、算法", icon: CodeIcon },
};

// 示例题目数据
const SAMPLE_QUESTIONS: Record<string, Array<{ id: string; title: string; difficulty: string; tags: string[] }>> = {
  ML: [
    { id: "ml-001", title: "什么是过拟合？如何防止过拟合？", difficulty: "⭐⭐", tags: ["基础", "模型评估"] },
    { id: "ml-002", title: "解释一下偏差 - 方差权衡", difficulty: "⭐⭐", tags: ["基础", "理论"] },
    { id: "ml-003", title: "SVM 的原理是什么？", difficulty: "⭐⭐⭐", tags: ["算法", "分类"] },
  ],
  LLM: [
    { id: "llm-001", title: "什么是 Prompt Engineering？", difficulty: "⭐", tags: ["基础", "应用"] },
    { id: "llm-002", title: "解释 RAG 的工作原理", difficulty: "⭐⭐", tags: ["架构", "检索"] },
    { id: "llm-003", title: "Fine-tuning vs Prompt Engineering 的区别", difficulty: "⭐⭐", tags: ["对比", "实践"] },
  ],
};

export default function CategoryPage() {
  const params = useParams();
  const slug = params.slug as string;
  const category = CATEGORIES[slug];
  const [selectedDifficulty, setSelectedDifficulty] = useState<string | null>(null);

  if (!category) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-[#1E293B] mb-4">分类不存在</h1>
          <Link href="/" className="text-[#2563EB] hover:underline">
            ← 返回首页
          </Link>
        </div>
      </div>
    );
  }

  const Icon = category.icon;
  const questions = SAMPLE_QUESTIONS[slug] || [];

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
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 bg-[#F1F5F9] rounded-xl flex items-center justify-center">
              <Icon className="w-8 h-8 text-[#2563EB]" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-[#1E293B]">{category.name}</h1>
              <p className="text-[#64748B]">{category.description}</p>
            </div>
          </div>
        </div>
      </header>

      {/* 难度筛选 */}
      {questions.length > 0 && (
        <section className="container mx-auto px-4 py-6">
          <h2 className="text-lg font-semibold text-[#1E293B] mb-3">筛选难度</h2>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedDifficulty(null)}
              className={`px-4 py-2 rounded-lg border transition ${
                selectedDifficulty === null
                  ? "bg-[#2563EB] text-white border-[#2563EB]"
                  : "bg-white text-[#64748B] border-[#E2E8F0] hover:bg-[#F1F5F9]"
              }`}
            >
              全部
            </button>
            {["⭐", "⭐⭐", "⭐⭐⭐", "⭐⭐⭐⭐"].map((diff) => (
              <button
                key={diff}
                onClick={() => setSelectedDifficulty(diff)}
                className={`px-4 py-2 rounded-lg border transition ${
                  selectedDifficulty === diff
                    ? "bg-[#2563EB] text-white border-[#2563EB]"
                    : "bg-white text-[#64748B] border-[#E2E8F0] hover:bg-[#F1F5F9]"
                }`}
              >
                {diff}
              </button>
            ))}
          </div>
        </section>
      )}

      {/* 题目列表 */}
      <section className="container mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold text-[#1E293B] mb-6">
          {questions.length > 0 ? "面试题目" : "敬请期待"}
        </h2>
        
        {questions.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[#E2E8F0] p-12 text-center">
            <div className="w-20 h-20 bg-[#F1F5F9] rounded-full flex items-center justify-center mx-auto mb-6">
              <BookIcon className="w-10 h-10 text-[#94A3B8]" />
            </div>
            <h3 className="text-xl font-semibold text-[#1E293B] mb-3">
              题目正在准备中
            </h3>
            <p className="text-[#64748B] mb-6 max-w-md mx-auto">
              我们正在为该分类精心准备面试题目，敬请期待！
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#2563EB] text-white rounded-xl hover:bg-[#1D4ED8] transition-all"
            >
              浏览其他分类
              <ArrowLeftIcon className="w-5 h-5 rotate-180" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {questions.map((q) => (
              <div
                key={q.id}
                className="bg-white rounded-xl border border-[#E2E8F0] p-5 hover:shadow-md transition-shadow cursor-pointer"
              >
                <div className="flex items-start justify-between mb-3">
                  <span className="px-2 py-1 bg-[#F1F5F9] text-[#475569] text-xs rounded font-medium">
                    {q.id}
                  </span>
                  <span className="text-sm">{q.difficulty}</span>
                </div>
                <h3 className="text-lg font-semibold text-[#1E293B] mb-3">{q.title}</h3>
                <div className="flex flex-wrap gap-2">
                  {q.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-1 bg-[#DCFCE7] text-[#166534] text-xs rounded"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 text-center text-[#94A3B8] border-t border-[#E2E8F0] mt-12">
        <p className="text-sm">© 2026 AI 学习与面试大全 | Built with Next.js & Vercel</p>
      </footer>
    </div>
  );
}
