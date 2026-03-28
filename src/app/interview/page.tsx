"use client";

import Link from "next/link";
import { useState } from "react";

// Lucide 风格 SVG 图标组件
function BriefcaseIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="14" x="2" y="7" rx="2" ry="2" />
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
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

function CodeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
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

function ZapIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
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

function BookIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </svg>
  );
}

function ArrowRightIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  );
}

// 分类数据
const CATEGORIES = [
  { id: "ML", name: "机器学习基础", icon: CpuIcon, href: "/categories/ML", description: "监督学习、无监督学习、模型评估" },
  { id: "DL", name: "深度学习", icon: BrainIcon, href: "/categories/DL", description: "神经网络、CNN、RNN、Transformer" },
  { id: "NLP", name: "自然语言处理", icon: BookIcon, href: "/categories/NLP", description: "词向量、语言模型、文本生成" },
  { id: "CV", name: "计算机视觉", icon: LayersIcon, href: "/categories/CV", description: "图像分类、目标检测、分割" },
  { id: "LLM", name: "大语言模型", icon: ZapIcon, href: "/categories/LLM", description: "Prompt、RAG、Fine-tuning、Agent" },
  { id: "RecSys", name: "推荐系统", icon: UsersIcon, href: "/categories/RecSys", description: "召回排序、协同过滤、深度学习" },
  { id: "RL", name: "强化学习", icon: CodeIcon, href: "/categories/RL", description: "MDP、Q-Learning、Policy Gradient" },
  { id: "System", name: "系统设计", icon: LayersIcon, href: "/categories/System", description: "ML 系统设计、架构设计" },
  { id: "Coding", name: "编程算法", icon: CodeIcon, href: "/categories/Coding", description: "LeetCode、数据结构、算法" },
];

// 岗位数据
const ROLES = [
  { id: "frontend", name: "前端开发", icon: CodeIcon, href: "/roles/frontend" },
  { id: "backend", name: "后端开发", icon: CpuIcon, href: "/roles/backend" },
  { id: "fullstack", name: "全栈开发", icon: ZapIcon, href: "/roles/fullstack" },
  { id: "mobile", name: "移动端开发", icon: CodeIcon, href: "/roles/mobile" },
  { id: "test-engineer", name: "测试工程师", icon: BriefcaseIcon, href: "/roles/test-engineer" },
  { id: "data-engineer", name: "数据开发", icon: LayersIcon, href: "/roles/data-engineer" },
  { id: "algorithm", name: "算法工程师", icon: BrainIcon, href: "/roles/algorithm" },
  { id: "product", name: "产品经理", icon: BriefcaseIcon, href: "/roles/product" },
];

// 示例题目
const FEATURED_QUESTIONS = [
  { id: "q-001", title: "什么是过拟合？如何防止过拟合？", category: "ML", difficulty: "⭐⭐", role: "algorithm" },
  { id: "q-002", title: "解释 Transformer 的自注意力机制", category: "DL", difficulty: "⭐⭐⭐", role: "algorithm" },
  { id: "q-003", title: "什么是 Prompt Engineering？", category: "LLM", difficulty: "⭐", role: "frontend" },
  { id: "q-004", title: "设计一个模型推理 API", category: "System", difficulty: "⭐⭐⭐", role: "backend" },
  { id: "q-005", title: "解释 RAG 的工作原理", category: "LLM", difficulty: "⭐⭐", role: "fullstack" },
  { id: "q-006", title: "如何实现智能表单验证？", category: "Coding", difficulty: "⭐⭐", role: "frontend" },
];

export default function InterviewPage() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredQuestions = FEATURED_QUESTIONS.filter((q) => {
    if (selectedCategory && q.category !== selectedCategory) return false;
    if (selectedRole && q.role !== selectedRole) return false;
    if (searchQuery && !q.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

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
            ← 返回首页
          </Link>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 bg-[#F1F5F9] rounded-xl flex items-center justify-center">
              <BriefcaseIcon className="w-8 h-8 text-[#475569]" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-[#1E293B]">💼 面试题库</h1>
              <p className="text-[#64748B]">精选 AI 领域面试题目，助你轻松应对技术面试</p>
            </div>
          </div>
        </div>
      </header>

      {/* 搜索框 */}
      <section className="container mx-auto px-4 py-6">
        <div className="max-w-2xl mx-auto">
          <input
            type="text"
            placeholder="搜索题目..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-3 border border-[#E2E8F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent"
          />
        </div>
      </section>

      {/* 分类筛选 */}
      <section className="container mx-auto px-4 py-6">
        <h2 className="text-lg font-semibold text-[#1E293B] mb-3">按技术分类筛选</h2>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-4 py-2 rounded-lg border transition ${
              selectedCategory === null
                ? "bg-[#2563EB] text-white border-[#2563EB]"
                : "bg-white text-[#64748B] border-[#E2E8F0] hover:bg-[#F1F5F9]"
            }`}
          >
            全部
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-lg border transition ${
                selectedCategory === cat.id
                  ? "bg-[#2563EB] text-white border-[#2563EB]"
                  : "bg-white text-[#64748B] border-[#E2E8F0] hover:bg-[#F1F5F9]"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </section>

      {/* 岗位筛选 */}
      <section className="container mx-auto px-4 py-6">
        <h2 className="text-lg font-semibold text-[#1E293B] mb-3">按岗位筛选</h2>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedRole(null)}
            className={`px-4 py-2 rounded-lg border transition ${
              selectedRole === null
                ? "bg-[#475569] text-white border-[#475569]"
                : "bg-white text-[#64748B] border-[#E2E8F0] hover:bg-[#F1F5F9]"
            }`}
          >
            全部
          </button>
          {ROLES.map((role) => (
            <button
              key={role.id}
              onClick={() => setSelectedRole(role.id)}
              className={`px-4 py-2 rounded-lg border transition ${
                selectedRole === role.id
                  ? "bg-[#475569] text-white border-[#475569]"
                  : "bg-white text-[#64748B] border-[#E2E8F0] hover:bg-[#F1F5F9]"
              }`}
            >
              {role.name}
            </button>
          ))}
        </div>
      </section>

      {/* 题目列表 */}
      <section className="container mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold text-[#1E293B] mb-6">
          {filteredQuestions.length > 0 ? "精选题目" : "暂无匹配题目"}
        </h2>
        
        {filteredQuestions.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[#E2E8F0] p-12 text-center">
            <p className="text-[#64748B]">暂无匹配的题目，请尝试其他筛选条件</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredQuestions.map((q) => (
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
                  <span className="px-2 py-1 bg-[#DBEAFE] text-[#1E40AF] text-xs rounded">
                    {q.category}
                  </span>
                  <span className="px-2 py-1 bg-[#DCFCE7] text-[#166534] text-xs rounded">
                    {ROLES.find((r) => r.id === q.role)?.name || q.role}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 快速入口 */}
      <section className="container mx-auto px-4 py-8">
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8">
          <h2 className="text-xl font-bold text-[#1E293B] mb-4">📚 还没有准备好？</h2>
          <p className="text-[#64748B] mb-6">
            先系统学习基础知识，再来挑战面试题目吧！
          </p>
          <div className="flex flex-wrap gap-4">
            <Link
              href="/knowledge"
              className="px-6 py-3 bg-[#2563EB] text-white rounded-xl hover:bg-[#1D4ED8] transition-all inline-flex items-center gap-2"
            >
              <BookIcon className="w-5 h-5" />
              前往知识库
            </Link>
            <Link
              href="/roadmaps"
              className="px-6 py-3 bg-white text-[#2563EB] border border-[#2563EB] rounded-xl hover:bg-[#F1F5F9] transition-all inline-flex items-center gap-2"
            >
              查看学习路径
              <ArrowRightIcon className="w-5 h-5" />
            </Link>
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
