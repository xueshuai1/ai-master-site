"use client";

import Link from "next/link";
import { useState } from "react";
// 难度级别配置
const DIFFICULTIES = [
  { level: 1, label: "⭐", name: "基础入门", description: "概念理解、基础原理", color: "green" },
  { level: 2, label: "⭐⭐", name: "中级进阶", description: "深入理解、应用能力", color: "blue" },
  { level: 3, label: "⭐⭐⭐", name: "高级精通", description: "复杂问题、系统设计", color: "orange" },
  { level: 4, label: "⭐⭐⭐⭐", name: "专家研究", description: "前沿技术、创新思考", color: "purple" },
];

// 知识分类
const CATEGORIES = [
  { id: "ML", name: "机器学习基础", icon: "📊", href: "/knowledge/ML", description: "监督学习、无监督学习、模型评估" },
  { id: "DL", name: "深度学习", icon: "🧠", href: "/knowledge/DL", description: "神经网络、CNN、RNN、Transformer" },
  { id: "NLP", name: "自然语言处理", icon: "📝", href: "/knowledge/NLP", description: "词向量、语言模型、文本生成" },
  { id: "CV", name: "计算机视觉", icon: "👁️", href: "/knowledge/CV", description: "图像分类、目标检测、分割" },
  { id: "LLM", name: "大语言模型", icon: "🤖", href: "/knowledge/LLM", description: "Prompt、RAG、Fine-tuning、Agent" },
  { id: "RecSys", name: "推荐系统", icon: "🎯", href: "/knowledge/RecSys", description: "召回排序、协同过滤、深度学习" },
  { id: "RL", name: "强化学习", icon: "🎮", href: "/knowledge/RL", description: "MDP、Q-Learning、Policy Gradient" },
  { id: "System", name: "AI 工程化", icon: "⚙️", href: "/knowledge/System", description: "模型部署、MLOps、系统设计" },
];

// 示例文章数据 - 使用真实存在的文章 ID
const SAMPLE_ARTICLES = [
  {
    id: "LLM-KB-001",
    title: "RAG 系统架构与工程实践",
    category: "LLM",
    difficulty: 3,
    tags: ["RAG", "系统架构", "工程实践"],
    description: "详细介绍 RAG 系统的完整架构和工程实践",
    readTime: "15 分钟",
  },
  {
    id: "LLM-KB-002",
    title: "RAG 检索优化策略",
    category: "LLM",
    difficulty: 3,
    tags: ["RAG", "检索优化", "向量数据库"],
    description: "RAG 检索优化的完整指南",
    readTime: "12 分钟",
  },
  {
    id: "LLM-001-RAG 基础概念与工作原理",
    title: "RAG 基础概念与工作原理",
    category: "LLM",
    difficulty: 2,
    tags: ["RAG", "基础概念"],
    description: "RAG 技术的基础概念和工作原理",
    readTime: "10 分钟",
  },
  {
    id: "LLM-002-RAG 系统架构与工程实践",
    title: "RAG 系统架构与工程实践",
    category: "LLM",
    difficulty: 3,
    tags: ["RAG", "系统架构"],
    description: "RAG 系统架构设计指南",
    readTime: "15 分钟",
  },
  {
    id: "LLM-003-MoE 架构原理与工作机制",
    title: "MoE 架构原理与工作机制",
    category: "LLM",
    difficulty: 3,
    tags: ["MoE", "模型架构"],
    description: "混合专家模型架构详解",
    readTime: "18 分钟",
  },
  {
    id: "LLM-⭐⭐⭐-explain-transformer-self-attention",
    title: "Transformer 自注意力机制详解",
    category: "LLM",
    difficulty: 3,
    tags: ["Transformer", "自注意力"],
    description: "Transformer 自注意力机制完整解析",
    readTime: "20 分钟",
  },
  {
    id: "LLM-⭐⭐⭐-rag-retrieval-augmented-generation",
    title: "检索增强生成 (RAG) 技术",
    category: "LLM",
    difficulty: 3,
    tags: ["RAG", "检索增强"],
    description: "RAG 技术原理与应用",
    readTime: "15 分钟",
  },
];

export default function KnowledgePage() {
  const [selectedDifficulty, setSelectedDifficulty] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const filteredArticles = SAMPLE_ARTICLES.filter((article) => {
    if (selectedDifficulty && article.difficulty !== selectedDifficulty) return false;
    if (selectedCategory && article.category !== selectedCategory) return false;
    
    // 搜索过滤
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchTitle = article.title.toLowerCase().includes(query);
      const matchDesc = article.description.toLowerCase().includes(query);
      const matchTags = article.tags.some(tag => tag.toLowerCase().includes(query));
      if (!matchTitle && !matchDesc && !matchTags) return false;
    }
    
    // 标签筛选
    
    
    
    
    return true;
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-3 mb-4">
            <Link href="/" className="text-gray-600 hover:text-gray-900">
              ← 返回首页
            </Link>
            </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
            📚 知识库
          </h1>
          <p className="text-gray-600 text-base sm:text-lg mb-6">
            系统化学习 AI 知识，按难度分级，从入门到精通
          </p>
          
          {/* 搜索框 */}
          <div className="max-w-2xl">
            <div className="relative">
              <input
                type="text"
                placeholder="搜索文章标题、描述或标签..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-3 pl-12 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none text-gray-700"
              />
              <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>
      </header>

      {/* 主要内容 */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* 左侧：筛选器 - 移动端隐藏，桌面端显示 */}
          <div className="lg:col-span-1 space-y-6 hidden lg:block">
            {/* 难度筛选 */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">按难度筛选</h2>
              <div className="space-y-2">
                <button
                  onClick={() => setSelectedDifficulty(null)}
                  className={`w-full text-left px-3 py-2 rounded-lg transition ${
                    selectedDifficulty === null
                      ? "bg-blue-500 text-white"
                      : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  全部
                </button>
                {DIFFICULTIES.map((diff) => (
                  <button
                    key={diff.level}
                    onClick={() => setSelectedDifficulty(diff.level)}
                    className={`w-full text-left px-3 py-2 rounded-lg transition ${
                      selectedDifficulty === diff.level
                        ? "bg-blue-500 text-white"
                        : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <span className="font-semibold">{diff.label}</span>
                    <span className="ml-2 text-sm opacity-80">{diff.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 标签筛选 */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">🏷️ 标签筛选</h2></div>
          </div>
          
          {/* 移动端筛选按钮 */}
          <div className="lg:hidden mb-4">
            <details className="bg-white rounded-xl border border-gray-200">
              <summary className="px-5 py-3 cursor-pointer font-semibold text-gray-700 flex items-center justify-between">
                <span>🔍 筛选条件</span>
                <span className="text-gray-400">▼</span>
              </summary>
              <div className="p-5 border-t border-gray-200 space-y-6">
                {/* 难度筛选 */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">按难度筛选</h3>
                  <div className="space-y-2">
                    <button
                      onClick={() => setSelectedDifficulty(null)}
                      className={`w-full text-left px-3 py-2 rounded-lg transition ${
                        selectedDifficulty === null
                          ? "bg-blue-500 text-white"
                          : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      全部
                    </button>
                    {DIFFICULTIES.map((diff) => (
                      <button
                        key={diff.level}
                        onClick={() => setSelectedDifficulty(diff.level)}
                        className={`w-full text-left px-3 py-2 rounded-lg transition ${
                          selectedDifficulty === diff.level
                            ? "bg-blue-500 text-white"
                            : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                        }`}
                      >
                        <span className="font-semibold">{diff.label}</span>
                        <span className="ml-2 text-sm opacity-80">{diff.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
                
                {/* 标签筛选 */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">🏷️ 标签筛选</h3></div>
              </div>
            </details>
          </div>

          {/* 右侧：内容 */}
          <div className="lg:col-span-3">
            {/* 分类导航 */}
            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">按分类浏览</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {CATEGORIES.map((cat) => (
                  <Link
                    key={cat.id}
                    href={cat.href}
                    className={`p-4 rounded-xl border transition hover:shadow-md ${
                      selectedCategory === cat.id
                        ? "bg-blue-50 border-blue-500"
                        : "bg-white border-gray-200 hover:border-blue-300"
                    }`}
                  >
                    <div className="text-2xl mb-2">{cat.icon}</div>
                    <h3 className="font-semibold text-gray-900 text-sm">{cat.name}</h3>
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">{cat.description}</p>
                  </Link>
                ))}
              </div>
            </section>

            {/* 文章列表 */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  {selectedDifficulty || selectedCategory  ? "筛选结果" : "推荐文章"}
                </h2>
                <span className="text-sm text-gray-500">
                  共 {filteredArticles.length} 篇
                </span>
              </div>
              
              {filteredArticles.length === 0 ? (
                <div className="text-center py-12 text-gray-500 bg-white rounded-xl border border-gray-200">
                  暂无符合条件的文章
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredArticles.map((article) => (
                    <ArticleCard key={article.id} article={article} />
                  ))}
                </div>
              )}
            </section>
          </div>
        </div>

        {/* 学习路径提示 */}
        <section className="mt-12 bg-gradient-to-r from-green-50 to-blue-50 py-8 rounded-2xl">
          <div className="container mx-auto px-4">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">💡 学习建议</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {DIFFICULTIES.map((diff) => (
                <div key={diff.level} className="bg-white p-4 rounded-lg shadow-sm">
                  <div className="text-lg font-semibold mb-1">
                    {diff.label} {diff.name}
                  </div>
                  <p className="text-sm text-gray-600">{diff.description}</p>
                  <p className="text-xs text-gray-500 mt-2">
                    适合：{diff.level === 1 ? "零基础入门" : diff.level === 2 ? "1-3 年经验" : diff.level === 3 ? "3-5 年经验" : "5 年 + 经验"}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 text-center text-gray-500 border-t border-gray-200 mt-8">
        <p className="text-sm">
          学完知识后，前往{" "}
          <Link href="/interview" className="text-blue-600 hover:underline font-medium">
            💼 面试题库
          </Link>{" "}
          进行实战练习
        </p>
      </footer>
    </div>
  );
}

function ArticleCard({ article }: { article: typeof SAMPLE_ARTICLES[0] }) {
  const difficulty = DIFFICULTIES.find((d) => d.level === article.difficulty);
  
  return (
    <Link
      href={`/knowledge/${article.category}/${article.id}`}
      className="block p-5 bg-white rounded-xl shadow-sm hover:shadow-md transition border border-gray-100"
    >
      <div className="flex items-start justify-between mb-3">
        <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded font-medium">
          {article.category}
        </span>
        {difficulty && (
          <span className="text-sm" title={difficulty.name}>
            {difficulty.label}
          </span>
        )}
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{article.title}</h3>
      <p className="text-sm text-gray-600 mb-3 line-clamp-2">{article.description}</p><div className="flex items-center text-xs text-gray-500">
        <span>⏱️ {article.readTime}</span>
        <span className="mx-2">·</span>
        <span className="text-blue-600 font-medium flex items-center gap-1">
          阅读全文 
          <svg className="w-[14px] h-[14px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </span>
      </div>
    </Link>
  );
}
