"use client";

import Link from "next/link";
import { useParams } from "next/navigation";

export default function KnowledgeArticlePage() {
  const params = useParams();
  const category = params.category as string;
  const articleId = params.articleId as string;

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
            <Link href={`/knowledge/${category}`} className="text-gray-600 hover:text-gray-900">
              ← 返回 {category.toUpperCase()}
            </Link>
            <Link href="/knowledge" className="text-gray-600 hover:text-gray-900">
              ← 返回知识库
            </Link>
            <Link href="/" className="text-gray-600 hover:text-gray-900">
              ← 返回首页
            </Link>
          </div>
        </div>
      </header>

      {/* 文章内容 */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
          <div className="mb-6">
            <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full font-medium">
              {category.toUpperCase()}
            </span>
            <span className="ml-3 text-sm text-gray-500">文章 ID: {articleId}</span>
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            文章内容页面
          </h1>
          
          <div className="prose prose-lg max-w-none">
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
              <p className="text-yellow-800">
                <strong>🚧 建设中</strong> - 文章详情页面正在开发中
              </p>
            </div>
            
            <p className="text-gray-600 mb-4">
              该页面将展示完整的学习文章内容，包括：
            </p>
            
            <ul className="list-disc list-inside text-gray-600 space-y-2 mb-6">
              <li>详细的概念讲解</li>
              <li>代码示例和图解</li>
              <li>实践练习</li>
              <li>相关资源链接</li>
            </ul>
            
            <div className="flex gap-4 mt-8">
              <Link
                href={`/knowledge/${category}`}
                className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all font-medium"
              >
                浏览该分类其他文章
              </Link>
              <Link
                href="/knowledge"
                className="px-6 py-3 bg-white text-blue-600 border border-blue-600 rounded-xl hover:bg-blue-50 transition-all font-medium"
              >
                返回知识库
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 text-center text-gray-500 border-t border-gray-200 mt-8">
        <p className="text-sm">© 2026 AI 学习与面试大全 | Built with Next.js & Vercel</p>
      </footer>
    </div>
  );
}
