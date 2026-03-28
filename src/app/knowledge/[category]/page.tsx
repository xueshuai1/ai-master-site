"use client";

import Link from "next/link";
import { useParams } from "next/navigation";

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
const CATEGORIES: Record<string, { name: string; description: string; icon: React.ComponentType<{ className?: string }>; iconChar: string }> = {
  ML: { name: "机器学习基础", description: "监督学习、无监督学习、模型评估", icon: CpuIcon, iconChar: "📊" },
  DL: { name: "深度学习", description: "神经网络、CNN、RNN、Transformer", icon: BrainIcon, iconChar: "🧠" },
  NLP: { name: "自然语言处理", description: "词向量、语言模型、文本生成", icon: BookIcon, iconChar: "📝" },
  CV: { name: "计算机视觉", description: "图像分类、目标检测、分割", icon: LayersIcon, iconChar: "👁️" },
  LLM: { name: "大语言模型", description: "Prompt、RAG、Fine-tuning、Agent", icon: ZapIcon, iconChar: "🤖" },
  RecSys: { name: "推荐系统", description: "召回排序、协同过滤、深度学习", icon: UsersIcon, iconChar: "🎯" },
  RL: { name: "强化学习", description: "MDP、Q-Learning、Policy Gradient", icon: CodeIcon, iconChar: "🎮" },
  System: { name: "AI 工程化", description: "模型部署、MLOps、系统设计", icon: LayersIcon, iconChar: "⚙️" },
};

// 示例文章数据
const SAMPLE_ARTICLES: Record<string, Array<{ id: string; title: string; difficulty: number; description: string; readTime: string }>> = {
  ML: [
    { id: "ml-001", title: "什么是机器学习？", difficulty: 1, description: "机器学习的基础概念和核心思想", readTime: "5 分钟" },
    { id: "ml-002", title: "监督学习详解", difficulty: 2, description: "分类、回归等监督学习方法", readTime: "10 分钟" },
  ],
  LLM: [
    { id: "llm-001", title: "Prompt Engineering 入门", difficulty: 1, description: "学习如何编写有效的 Prompt", readTime: "8 分钟" },
    { id: "llm-002", title: "RAG 实战指南", difficulty: 2, description: "检索增强生成的实现方法", readTime: "12 分钟" },
  ],
};

export default function KnowledgeCategoryPage() {
  const params = useParams();
  const categorySlug = params.category as string;
  const category = CATEGORIES[categorySlug];

  if (!category) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">分类不存在</h1>
          <Link href="/knowledge" className="text-blue-600 hover:underline">
            ← 返回知识库
          </Link>
        </div>
      </div>
    );
  }

  const Icon = category.icon;
  const articles = SAMPLE_ARTICLES[categorySlug] || [];

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
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
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-3 mb-4">
            <Link href="/knowledge" className="text-gray-600 hover:text-gray-900">
              ← 返回知识库
            </Link>
            <Link href="/" className="text-gray-600 hover:text-gray-900">
              ← 返回首页
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gray-100 rounded-xl flex items-center justify-center text-3xl">
              {category.iconChar}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{category.name}</h1>
              <p className="text-gray-600">{category.description}</p>
            </div>
          </div>
        </div>
      </header>

      {/* 文章列表 */}
      <main className="container mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          {articles.length > 0 ? "学习文章" : "敬请期待"}
        </h2>
        
        {articles.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl">
              📚
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              内容正在准备中
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              我们正在为该分类精心准备学习内容，敬请期待！
            </p>
            <Link
              href="/knowledge"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all"
            >
              返回知识库
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((article) => (
              <Link
                key={article.id}
                href={`/knowledge/${categorySlug}/${article.id}`}
                className="block p-5 bg-white rounded-xl shadow-sm hover:shadow-md transition border border-gray-100"
              >
                <div className="flex items-start justify-between mb-3">
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded font-medium">
                    {categorySlug}
                  </span>
                  <span className="text-sm">
                    {"⭐".repeat(article.difficulty)}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{article.title}</h3>
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">{article.description}</p>
                <div className="flex items-center text-xs text-gray-500">
                  <span>⏱️ {article.readTime}</span>
                  <span className="mx-2">·</span>
                  <span className="text-blue-600 font-medium">阅读全文 →</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 text-center text-gray-500 border-t border-gray-200 mt-8">
        <p className="text-sm">© 2026 AI 学习与面试大全 | Built with Next.js & Vercel</p>
      </footer>
    </div>
  );
}
