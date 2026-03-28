"use client";

import Link from "next/link";
import TagCloud from "@/components/TagCloud";
import TagFilter from "@/components/TagFilter";

export default function TagsPage() {
  // 模拟标签使用统计（实际应从数据中计算）
  const tagCounts = {
    LLM: 45,
    Transformer: 32,
    RAG: 28,
    Agent: 25,
    ML: 50,
    DL: 40,
    NLP: 35,
    CV: 30,
    "1": 60,
    "2": 55,
    "3": 40,
    "4": 20,
    interview: 80,
    bigtech: 45,
    frontend: 35,
    backend: 40,
  };

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
            🏷️ 标签云
          </h1>
          <p className="text-gray-600 text-base sm:text-lg">
            通过标签快速定位感兴趣的内容，支持多维度组合筛选
          </p>
        </div>
      </header>

      {/* 主要内容 */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 左侧：标签筛选器 */}
          <div className="lg:col-span-1">
            <div className="sticky top-4">
              <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">🔍 标签筛选</h2>
                <TagFilter compact={false} />
              </div>

              {/* 搜索提示 */}
              <div className="mt-4 bg-blue-50 rounded-xl p-4 border border-blue-200">
                <h3 className="font-semibold text-blue-900 mb-2">💡 搜索技巧</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• 输入 <code className="bg-white px-1 rounded">#</code> 自动提示标签</li>
                  <li>• 多个标签组合精确筛选</li>
                  <li>• 点击标签查看相关内容</li>
                </ul>
              </div>
            </div>
          </div>

          {/* 右侧：标签云 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 热门标签 */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">🔥 热门标签</h2>
              <div className="bg-white rounded-2xl border border-gray-200 p-6">
                <div className="flex flex-wrap gap-3">
                  {Object.entries(tagCounts)
                    .sort(([, a], [, b]) => b - a)
                    .slice(0, 10)
                    .map(([tagId, count]) => (
                      <Link
                        key={tagId}
                        href={`/tags/${tagId}`}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 text-white font-medium hover:shadow-lg transition-all"
                      >
                        <span>#{tagId}</span>
                        <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">{count}</span>
                      </Link>
                    ))}
                </div>
              </div>
            </section>

            {/* 完整标签云 */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">📊 完整标签体系</h2>
              <TagCloud tagCounts={tagCounts} group="all" />
            </section>

            {/* 标签关联推荐 */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">🔗 标签关联推荐</h2>
              <div className="bg-white rounded-2xl border border-gray-200 p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <h3 className="font-semibold text-gray-900 mb-2">LLM 学习路径</h3>
                    <div className="flex flex-wrap gap-2">
                      <Link href="/tags/LLM" className="text-blue-600 hover:underline">#LLM</Link>
                      <span className="text-gray-400">→</span>
                      <Link href="/tags/Transformer" className="text-blue-600 hover:underline">#Transformer</Link>
                      <span className="text-gray-400">→</span>
                      <Link href="/tags/RAG" className="text-blue-600 hover:underline">#RAG</Link>
                      <span className="text-gray-400">→</span>
                      <Link href="/tags/Agent" className="text-blue-600 hover:underline">#Agent</Link>
                    </div>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <h3 className="font-semibold text-gray-900 mb-2">面试准备组合</h3>
                    <div className="flex flex-wrap gap-2">
                      <Link href="/tags/interview" className="text-blue-600 hover:underline">#面试真题</Link>
                      <span className="text-gray-400">+</span>
                      <Link href="/tags/bigtech" className="text-blue-600 hover:underline">#大厂真题</Link>
                      <span className="text-gray-400">+</span>
                      <Link href="/tags/2" className="text-blue-600 hover:underline">#中级进阶</Link>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 text-center text-gray-500 border-t border-gray-200 mt-8">
        <p className="text-sm">
          浏览标签后，前往{" "}
          <Link href="/knowledge" className="text-blue-600 hover:underline font-medium">
            📚 知识库
          </Link>{" "}
          或{" "}
          <Link href="/interview" className="text-blue-600 hover:underline font-medium">
            💼 面试题库
          </Link>{" "}
          深入学习
        </p>
      </footer>
    </div>
  );
}
