"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

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
  { id: "AI-Engineering", name: "AI 工程与实践", icon: "🛠️", href: "/knowledge/AI-Engineering", description: "Agent 开发、工具链、方法论" },
];

interface Article {
  id: string;
  title: string;
  category: string;
  difficulty: number;
  tags: string[];
  description: string;
  readTime: string;
}

export default function KnowledgePage() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  // 从 API 加载文章数据
  useEffect(() => {
    async function loadArticles() {
      try {
        const response = await fetch('/api/knowledge');
        if (response.ok) {
          const data = await response.json();
          // API 返回格式：{success: true, data: {articles: [...]}}
          setArticles(data.data?.articles || data.articles || []);
        }
      } catch (error) {
        console.error('Failed to load articles:', error);
      } finally {
        setLoading(false);
      }
    }
    
    loadArticles();
  }, []);

  const filteredArticles = articles.filter((article) => {
    if (selectedCategory && article.category !== selectedCategory) return false;
    if (selectedDifficulty && article.difficulty !== selectedDifficulty) return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return article.title.toLowerCase().includes(query) || 
             article.description.toLowerCase().includes(query) ||
             article.tags.some(tag => tag.toLowerCase().includes(query));
    }
    return true;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2563EB] mx-auto mb-4"></div>
          <p className="text-[#64748B]">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Header */}
      <header className="bg-white border-b border-[#E2E8F0]">
        <div className="container mx-auto px-4 py-6">
          <Link href="/" className="text-[#64748B] hover:text-[#2563EB] transition-colors mb-4 inline-block">
            ← 返回首页
          </Link>
          <h1 className="text-3xl font-bold text-[#1E293B]">📚 知识库</h1>
          <p className="text-[#64748B] mt-2">系统化学习 AI 技术知识，从基础到进阶</p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* 搜索和筛选 */}
        <div className="mb-8">
          <input
            type="text"
            placeholder="搜索文章标题、描述或标签..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-3 border border-[#E2E8F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2563EB] text-[#1E293B] placeholder-[#64748B]"
          />
        </div>

        {/* 分类筛选 */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-[#1E293B] mb-4">按分类筛选</h2>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-4 py-2 rounded-xl transition ${
                selectedCategory === null
                  ? "bg-[#2563EB] text-white"
                  : "bg-white text-[#64748B] border border-[#E2E8F0] hover:bg-[#F1F5F9]"
              }`}
            >
              全部
            </button>
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-xl transition ${
                  selectedCategory === cat.id
                    ? "bg-[#2563EB] text-white"
                    : "bg-white text-[#64748B] border border-[#E2E8F0] hover:bg-[#F1F5F9]"
                }`}
              >
                {cat.icon} {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* 难度筛选 */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-[#1E293B] mb-4">按难度筛选</h2>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setSelectedDifficulty(null)}
              className={`px-4 py-2 rounded-xl transition ${
                selectedDifficulty === null
                  ? "bg-[#2563EB] text-white"
                  : "bg-white text-[#64748B] border border-[#E2E8F0] hover:bg-[#F1F5F9]"
              }`}
            >
              全部
            </button>
            {DIFFICULTIES.map((diff) => (
              <button
                key={diff.level}
                onClick={() => setSelectedDifficulty(diff.level)}
                className={`px-4 py-2 rounded-xl transition ${
                  selectedDifficulty === diff.level
                    ? "bg-[#2563EB] text-white"
                    : "bg-white text-[#64748B] border border-[#E2E8F0] hover:bg-[#F1F5F9]"
                }`}
              >
                {diff.label} {diff.name}
              </button>
            ))}
          </div>
        </div>

        {/* 文章列表 */}
        <div>
          <h2 className="text-2xl font-bold text-[#1E293B] mb-6">
            {filteredArticles.length > 0 ? "推荐文章" : "暂无匹配文章"}
          </h2>
          
          {filteredArticles.length === 0 ? (
            <div className="bg-white rounded-2xl border border-[#E2E8F0] p-12 text-center">
              <p className="text-[#64748B]">暂无匹配的文章，请尝试其他筛选条件</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredArticles.map((article) => (
                <Link
                  key={article.id}
                  href={`/knowledge/${article.category}/${encodeURIComponent(article.id)}`}
                  className="block bg-white rounded-2xl border border-[#E2E8F0] p-6 hover:shadow-lg transition-all hover:border-[#2563EB]/20"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-2xl">{CATEGORIES.find(c => c.id === article.category)?.icon || '📄'}</span>
                    <span className="px-2 py-1 bg-[#DBEAFE] text-[#1E40AF] text-xs rounded font-medium">
                      {article.category}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-[#1E293B] mb-3 line-clamp-2">{article.title}</h3>
                  <p className="text-[#64748B] text-sm mb-4 line-clamp-2">{article.description}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex flex-wrap gap-1">
                      {article.tags.slice(0, 3).map((tag, index) => (
                        <span key={index} className="px-2 py-1 bg-[#F1F5F9] text-[#475569] text-xs rounded">
                          #{tag}
                        </span>
                      ))}
                    </div>
                    <span className="text-xs text-[#64748B]">{article.readTime}</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>

      <footer className="container mx-auto px-4 py-8 text-center text-[#94A3B8] border-t border-[#E2E8F0] mt-8">
        <p className="text-sm">© 2026 AI 学习与面试大全 | Built with Next.js & Vercel</p>
      </footer>
    </div>
  );
}
// ISR 增量更新：每小时重新生成一次
export const revalidate = 3600;
