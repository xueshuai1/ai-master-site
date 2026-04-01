"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

// 知识分类
const CATEGORIES = [
  { id: "ML", name: "机器学习基础", icon: "📊", href: "/knowledge/ML", description: "监督学习、无监督学习、模型评估", color: "from-blue-50 to-indigo-50", borderColor: "border-blue-200" },
  { id: "DL", name: "深度学习", icon: "🧠", href: "/knowledge/DL", description: "神经网络、CNN、RNN、Transformer", color: "from-purple-50 to-pink-50", borderColor: "border-purple-200" },
  { id: "CV", name: "计算机视觉", icon: "👁️", href: "/knowledge/CV", description: "图像分类、目标检测、分割", color: "from-green-50 to-emerald-50", borderColor: "border-green-200" },
  { id: "LLM", name: "大语言模型", icon: "🤖", href: "/knowledge/LLM", description: "Prompt、RAG、Fine-tuning、Agent", color: "from-orange-50 to-amber-50", borderColor: "border-orange-200" },
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
  const [searchQuery, setSearchQuery] = useState("");
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  // 从静态 JSON 文件加载文章数据
  useEffect(() => {
    async function loadArticles() {
      try {
        const response = await fetch('/knowledge-index.json');
        if (response.ok) {
          const data = await response.json();
          setArticles(data.articles || []);
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
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return article.title.toLowerCase().includes(query) || 
             article.description.toLowerCase().includes(query) ||
             article.tags.some(tag => tag.toLowerCase().includes(query));
    }
    return true;
  });

  // 统计每个分类的文章数
  const categoryStats = articles.reduce((acc, article) => {
    acc[article.category] = (acc[article.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">加载知识库...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-8">
          <Link href="/" className="text-gray-600 hover:text-blue-600 transition-colors mb-4 inline-block">
            ← 返回首页
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">📚 知识库</h1>
          <p className="text-gray-600 text-lg">系统化学习 AI 技术知识，从基础到进阶</p>
          <div className="mt-4 flex items-center gap-4 text-sm text-gray-500">
            <span>📊 共 {articles.length} 篇文章</span>
            <span>📁 {Object.keys(categoryStats).length} 个技术领域</span>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* 搜索框 */}
        <div className="mb-8">
          <input
            type="text"
            placeholder="搜索文章标题、描述或标签..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-6 py-4 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-400 shadow-sm"
          />
        </div>

        {/* 分类卡片（默认视图） */}
        {!selectedCategory && !searchQuery && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">选择技术领域</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {CATEGORIES.map((cat) => {
                const count = categoryStats[cat.id] || 0;
                if (count === 0) return null;
                
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`block text-left bg-gradient-to-br ${cat.color} ${cat.borderColor} border-2 rounded-2xl p-6 hover:shadow-lg transition-all hover:scale-105`}
                  >
                    <div className="text-4xl mb-3">{cat.icon}</div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{cat.name}</h3>
                    <p className="text-gray-600 text-sm mb-4">{cat.description}</p>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="px-3 py-1 bg-white/60 rounded-full font-medium text-gray-700">
                        📄 {count} 篇
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* 文章列表（筛选后视图） */}
        {(selectedCategory || searchQuery) && (
          <div>
            {/* 返回按钮和筛选信息 */}
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={() => {
                  setSelectedCategory(null);
                  setSearchQuery("");
                }}
                className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors"
              >
                ← 返回全部分类
              </button>
              <div className="text-gray-600">
                找到 <span className="font-semibold text-gray-900">{filteredArticles.length}</span> 篇文章
              </div>
            </div>

            {/* 文章卡片 */}
            {filteredArticles.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
                <p className="text-gray-600">暂无匹配的文章，请尝试其他搜索条件</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredArticles.map((article) => (
                  <Link
                    key={article.id}
                    href={`/knowledge/${article.category}/${encodeURIComponent(article.id)}`}
                    className="block bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-lg hover:border-blue-200 transition-all"
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-2xl">{CATEGORIES.find(c => c.id === article.category)?.icon || '📄'}</span>
                      <span className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded font-medium">
                        {article.category}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3 line-clamp-2">{article.title}</h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">{article.description}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex flex-wrap gap-1">
                        {article.tags.slice(0, 3).map((tag, index) => (
                          <span key={index} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
                            #{tag}
                          </span>
                        ))}
                      </div>
                      <div className="text-xs text-gray-500">
                        {article.readTime}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="container mx-auto px-4 py-8 text-center text-gray-500">
          <p className="text-sm">© 2026 AI 学习与面试大全 | Built with Next.js</p>
        </div>
      </footer>
    </div>
  );
}
