"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import CodeBlock from "@/components/CodeBlock";
import Callout from "@/components/Callout";
import Collapsible from "@/components/Collapsible";

// Lucide 风格 SVG 图标组件
function BriefcaseIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="14" x="2" y="7" rx="2" ry="2" />
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
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

interface Question {
  id: string;
  title: string;
  category: string;
  difficulty: string;
  tags: string[];
  source: string;
  sourceUrl: string;
  collectedAt: string;
}

// 分类数据
const CATEGORIES = [
  { id: "ML", name: "机器学习基础", href: "/categories/ML", description: "监督学习、无监督学习、模型评估" },
  { id: "DL", name: "深度学习", href: "/categories/DL", description: "神经网络、CNN、RNN、Transformer" },
  { id: "NLP", name: "自然语言处理", href: "/categories/NLP", description: "词向量、语言模型、文本生成" },
  { id: "CV", name: "计算机视觉", href: "/categories/CV", description: "图像分类、目标检测、分割" },
  { id: "LLM", name: "大语言模型", href: "/categories/LLM", description: "Prompt、RAG、Fine-tuning、Agent" },
  { id: "RecSys", name: "推荐系统", href: "/categories/RecSys", description: "召回排序、协同过滤、深度学习" },
  { id: "RL", name: "强化学习", href: "/categories/RL", description: "MDP、Q-Learning、Policy Gradient" },
  { id: "System", name: "系统设计", href: "/categories/System", description: "ML 系统设计、架构设计" },
  { id: "Coding", name: "编程算法", href: "/categories/Coding", description: "LeetCode、数据结构、算法" },
];

// 岗位映射（根据标签推断）
const ROLE_KEYWORDS: Record<string, string[]> = {
  "algorithm": ["algorithm", "bigtech", "interview"],
  "frontend": ["frontend", "exam"],
  "backend": ["backend"],
  "fullstack": ["fullstack"],
  "ml-engineer": ["ml"],
};

function inferRole(tags: string[]): string {
  for (const [role, keywords] of Object.entries(ROLE_KEYWORDS)) {
    if (tags.some(tag => keywords.includes(tag.toLowerCase()))) {
      return role;
    }
  }
  return "algorithm"; // 默认
}

// 岗位数据
const AI_ROLES = [
  { id: "algorithm", name: "算法工程师", href: "/roles/algorithm" },
  { id: "llm-engineer", name: "大模型工程师", href: "/roles/llm-engineer" },
  { id: "cv-engineer", name: "CV 工程师", href: "/roles/cv-engineer" },
  { id: "nlp-engineer", name: "NLP 工程师", href: "/roles/nlp-engineer" },
  { id: "recsys-engineer", name: "推荐算法工程师", href: "/roles/recsys-engineer" },
  { id: "ml-engineer", name: "ML 工程师", href: "/roles/ml-engineer" },
];

const NON_AI_ROLES = [
  { id: "frontend", name: "前端开发", href: "/roles/frontend" },
  { id: "backend", name: "后端开发", href: "/roles/backend" },
  { id: "fullstack", name: "全栈开发", href: "/roles/fullstack" },
  { id: "mobile", name: "移动端开发", href: "/roles/mobile" },
  { id: "test-engineer", name: "测试工程师", href: "/roles/test-engineer" },
  { id: "data-engineer", name: "数据开发", href: "/roles/data-engineer" },
  { id: "designer", name: "设计师", href: "/roles/designer" },
  { id: "product", name: "产品经理", href: "/roles/product" },
  { id: "devops", name: "运维/DevOps", href: "/roles/devops" },
];

const ROLES = [...AI_ROLES, ...NON_AI_ROLES];

export default function InterviewPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    async function loadQuestions() {
      try {
        const response = await fetch('/api/questions');
        if (response.ok) {
          const data = await response.json();
          // API 返回结构：{ success: true, data: { questions: [...], pagination: {...}, facets: {...} } }
          setQuestions(data.data?.questions || data.questions || []);
        }
      } catch (error) {
        console.error('Failed to load questions:', error);
      } finally {
        setLoading(false);
      }
    }
    
    loadQuestions();
  }, []);

  const filteredQuestions = questions.filter((q) => {
    if (selectedCategory && q.category !== selectedCategory) return false;
    if (selectedRole) {
      const role = inferRole(q.tags);
      if (role !== selectedRole) return false;
    }
    if (searchQuery && !q.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2563EB] mx-auto mb-4"></div>
          <p className="text-[#64748B]">加载题目中...</p>
        </div>
      </div>
    );
  }

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
          <div className="flex items-center gap-4 mb-4">
            <Link
              href="/"
              className="text-[#64748B] hover:text-[#2563EB] transition-colors"
            >
              ← 返回首页
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-[#F1F5F9] rounded-xl flex items-center justify-center">
              <BriefcaseIcon className="w-8 h-8 text-[#475569]" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-[#1E293B]">💼 面试题库</h1>
              <p className="text-[#64748B]">精选 AI 领域面试题目，助你轻松应对技术面试（共 {questions.length} 道）</p>
            </div>
          </div>
        </div>
      </header>

      {/* 主要内容 */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* 左侧：筛选器 */}
          <div className="lg:col-span-1 space-y-6 max-w-md lg:max-w-none">
            {/* 搜索框 */}
            <div className="bg-white rounded-xl border border-[#E2E8F0] p-5">
              <h2 className="text-lg font-semibold text-[#1E293B] mb-3">🔍 搜索题目</h2>
              <input
                type="text"
                placeholder="输入关键词搜索..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB] text-[#1E293B] placeholder-[#64748B]"
              />
            </div>

            {/* 分类筛选 */}
            <div className="bg-white rounded-xl border border-[#E2E8F0] p-5">
              <h2 className="text-lg font-semibold text-[#1E293B] mb-3">按技术分类</h2>
              <div className="space-y-2">
                <button
                  onClick={() => setSelectedCategory(null)}
                  className={`w-full text-left px-3 py-2 rounded-lg transition ${
                    selectedCategory === null
                      ? "bg-[#2563EB] text-white"
                      : "bg-[#F1F5F9] text-[#64748B] hover:bg-[#E2E8F0]"
                  }`}
                >
                  全部
                </button>
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`w-full text-left px-3 py-2 rounded-lg transition ${
                      selectedCategory === cat.id
                        ? "bg-[#2563EB] text-white"
                        : "bg-[#F1F5F9] text-[#64748B] hover:bg-[#E2E8F0]"
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            {/* 岗位筛选 */}
            <div className="bg-white rounded-xl border border-[#E2E8F0] p-5">
              <h2 className="text-lg font-semibold text-[#1E293B] mb-3">按岗位筛选</h2>
              <div className="space-y-4">
                <button
                  onClick={() => setSelectedRole(null)}
                  className={`w-full px-3 py-2 rounded-lg transition ${
                    selectedRole === null
                      ? "bg-[#2563EB] text-white"
                      : "bg-[#F1F5F9] text-[#64748B] hover:bg-[#E2E8F0]"
                  }`}
                >
                  全部岗位
                </button>
                
                {/* AI 类岗位 */}
                <div>
                  <h3 className="text-xs font-semibold text-purple-600 mb-2 uppercase tracking-wider">AI 类岗位</h3>
                  <div className="space-y-1">
                    {AI_ROLES.map((role) => (
                      <button
                        key={role.id}
                        onClick={() => setSelectedRole(role.id)}
                        className={`w-full text-left px-3 py-1.5 rounded-md text-sm transition ${
                          selectedRole === role.id
                            ? "bg-[#9333EA] text-white"
                            : "bg-[#F3E8FF] text-purple-700 hover:bg-[#E9D5FF]"
                        }`}
                      >
                        {role.name}
                      </button>
                    ))}
                  </div>
                </div>
                
                {/* 非 AI 类岗位 */}
                <div>
                  <h3 className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wider">非 AI 类岗位</h3>
                  <div className="space-y-1">
                    {NON_AI_ROLES.map((role) => (
                      <button
                        key={role.id}
                        onClick={() => setSelectedRole(role.id)}
                        className={`w-full text-left px-3 py-1.5 rounded-md text-sm transition ${
                          selectedRole === role.id
                            ? "bg-[#475569] text-white"
                            : "bg-[#F1F5F9] text-[#64748B] hover:bg-[#E2E8F0]"
                        }`}
                      >
                        {role.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 右侧：题目列表 */}
          <div className="lg:col-span-3">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-[#1E293B]">
                {filteredQuestions.length > 0 ? "精选题目" : "暂无匹配题目"}
              </h2>
              <span className="text-sm text-[#64748B]">
                共 {filteredQuestions.length} 道
              </span>
            </div>
            
            {filteredQuestions.length === 0 ? (
              <div className="bg-white rounded-2xl border border-[#E2E8F0] p-12 text-center">
                <p className="text-[#64748B]">暂无匹配的题目，请尝试其他筛选条件</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredQuestions.map((q) => (
                  <Link
                    key={q.id}
                    href={`/questions/${q.id}`}
                    className="bg-white rounded-xl border border-[#E2E8F0] p-5 hover:shadow-md transition-shadow cursor-pointer block"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <span className="px-2 py-1 bg-[#F1F5F9] text-[#475569] text-xs rounded font-medium truncate max-w-[120px]">
                        {q.category}
                      </span>
                      <span className="text-sm">{q.difficulty}</span>
                    </div>
                    <h3 className="text-lg font-semibold text-[#1E293B] mb-3 line-clamp-2">{q.title}</h3>
                    
                    <div className="flex flex-wrap gap-2">
                      <span className="px-2 py-1 bg-[#DBEAFE] text-[#1E40AF] text-xs rounded">
                        {q.category}
                      </span>
                      {q.tags.slice(0, 3).map((tag, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 bg-[#DCFCE7] text-[#166534] text-xs rounded"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 快速入口 */}
        <section className="mt-12 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8">
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
        </section>
      </main>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 text-center text-[#94A3B8] border-t border-[#E2E8F0] mt-12">
        <p className="text-sm">© 2026 AI 学习与面试大全 | Built with Next.js & Vercel</p>
      </footer>
    </div>
  );
}
