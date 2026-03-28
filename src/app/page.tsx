import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-5xl font-bold text-gray-900 mb-4">
          AI 面试题大全
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          专注 AI 领域的面试题库，助你拿到理想 Offer
        </p>
        <div className="flex justify-center gap-4">
          <Link
            href="/questions"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            开始刷题
          </Link>
          <Link
            href="/categories"
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
          >
            浏览分类
          </Link>
        </div>
      </section>

      {/* Categories Preview */}
      <section className="container mx-auto px-4 py-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
          热门分类
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <CategoryCard
            title="🤖 机器学习基础"
            count={120}
            href="/categories/machine-learning"
            description="监督学习、无监督学习、模型评估等核心概念"
          />
          <CategoryCard
            title="🧠 深度学习"
            count={98}
            href="/categories/deep-learning"
            description="神经网络、CNN、RNN、Transformer 架构"
          />
          <CategoryCard
            title="📝 自然语言处理"
            count={85}
            href="/categories/nlp"
            description="词向量、语言模型、文本分类、生成任务"
          />
          <CategoryCard
            title="👁️ 计算机视觉"
            count={76}
            href="/categories/computer-vision"
            description="图像分类、目标检测、分割、生成模型"
          />
          <CategoryCard
            title="🚀 大模型 LLM"
            count={64}
            href="/categories/llm"
            description="Prompt Engineering、RAG、Fine-tuning、Agent"
          />
          <CategoryCard
            title="💻 编程与算法"
            count={150}
            href="/categories/coding"
            description="LeetCode、数据结构、算法题、手撕代码"
          />
        </div>
      </section>

      {/* Features */}
      <section className="bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            为什么选择我们
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Feature
              icon="📚"
              title="全面覆盖"
              description="从基础到进阶，覆盖 AI 全领域面试知识点"
            />
            <Feature
              icon="🎯"
              title="精准分类"
              description="按主题、难度、公司分类，快速定位目标"
            />
            <Feature
              icon="✨"
              title="持续更新"
              description="紧跟 AI 前沿，定期更新大模型等热门话题"
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 text-center text-gray-500">
        <p>© 2026 AI 面试题大全 | Built with Next.js & Vercel</p>
      </footer>
    </div>
  );
}

function CategoryCard({
  title,
  count,
  href,
  description,
}: {
  title: string;
  count: number;
  href: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="block p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition border border-gray-100"
    >
      <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 mb-3">{description}</p>
      <span className="text-sm text-blue-600 font-medium">
        {count} 道题目 →
      </span>
    </Link>
  );
}

function Feature({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <div className="text-center">
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}
