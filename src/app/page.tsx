"use client";

import Link from "next/link";

// 分类数据
const CATEGORIES = [
  { id: "ML", name: "机器学习基础", icon: "📊", href: "/categories/ML", description: "监督学习、无监督学习、模型评估" },
  { id: "DL", name: "深度学习", icon: "🧠", href: "/categories/DL", description: "神经网络、CNN、RNN、Transformer" },
  { id: "NLP", name: "自然语言处理", icon: "📝", href: "/categories/NLP", description: "词向量、语言模型、文本生成" },
  { id: "CV", name: "计算机视觉", icon: "👁️", href: "/categories/CV", description: "图像分类、目标检测、分割" },
  { id: "LLM", name: "大语言模型", icon: "🤖", href: "/categories/LLM", description: "Prompt、RAG、Fine-tuning、Agent" },
  { id: "RecSys", name: "推荐系统", icon: "🎯", href: "/categories/RecSys", description: "召回排序、协同过滤、深度学习" },
  { id: "RL", name: "强化学习", icon: "🎮", href: "/categories/RL", description: "MDP、Q-Learning、Policy Gradient" },
  { id: "System", name: "系统设计", icon: "🏗️", href: "/categories/System", description: "ML 系统设计、架构设计" },
  { id: "Coding", name: "编程算法", icon: "💻", href: "/categories/Coding", description: "LeetCode、数据结构、算法" },
];

// 岗位角色数据
const ROLES = [
  { id: "frontend", name: "前端开发", icon: "🎨", href: "/roles/frontend", subRoles: ["AI 应用开发", "前端工程化+AI", "智能 UI/UX"] },
  { id: "backend", name: "后端开发", icon: "⚙️", href: "/roles/backend", subRoles: ["模型服务化", "API 设计", "系统架构"] },
  { id: "fullstack", name: "全栈开发", icon: "🚀", href: "/roles/fullstack", subRoles: ["前端 + 后端+AI 集成", "快速原型开发", "独立项目开发"] },
  { id: "algorithm", name: "算法工程师", icon: "🔬", href: "/roles/algorithm", subRoles: ["模型原理与优化", "训练与调参", "论文解读"] },
  { id: "test-ops", name: "测试/运维工程师", icon: "🛠️", href: "/roles/test-ops", subRoles: ["AI 系统测试", "MLOps", "部署与监控"] },
  { id: "product", name: "产品经理", icon: "📋", href: "/roles/product", subRoles: ["AI 产品设计", "场景分析", "商业化"] },
];

// 技术专区数据
const ZONES = [
  { id: "openclaw", name: "OpenClaw 专区", icon: "🦞", href: "/zones/openclaw", topics: ["OpenClaw 技术", "技能开发", "节点控制"] },
  { id: "agent-dev", name: "Agent 开发", icon: "🤖", href: "/zones/agent-dev", topics: ["子 Agent", "多 Agent 协作"] },
  { id: "methodology", name: "开发方法论", icon: "📚", href: "/zones/methodology", topics: ["SDD", "TDD", "ATDD", "OMO"] },
  { id: "toolchain", name: "工具链", icon: "🔧", href: "/zones/toolchain", topics: ["OpenCode", "Cursor", "Windsurf"] },
  { id: "frontier", name: "前沿技术", icon: "🚀", href: "/zones/frontier", topics: ["最新论文", "技术趋势"] },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-12 sm:py-16 text-center">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
          AI 学习与面试大全
        </h1>
        <p className="text-base sm:text-lg lg:text-xl text-gray-600 mb-6 sm:mb-8">
          <span className="hidden sm:inline">专注 AI 领域的知识库和面试准备</span>
          <span className="sm:hidden">专注 AI 领域 · 面试准备</span>
        </p>

        {/* 快捷入口 */}
        <div className="flex justify-center gap-3 sm:gap-4 flex-wrap">
          <Link
            href="/roadmaps"
            className="px-4 sm:px-6 py-2 sm:py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition text-sm sm:text-base min-h-[44px]"
          >
            📚 学习路径
          </Link>
        </div>
      </section>

      {/* 技术分类 */}
      <section className="container mx-auto px-4 py-12">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 sm:mb-8 text-center">
          按技术分类
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {CATEGORIES.map((cat) => (
            <CategoryCard key={cat.id} {...cat} />
          ))}
        </div>
      </section>

      {/* 岗位学习 */}
      <section className="bg-gradient-to-r from-blue-50 to-purple-50 py-10 sm:py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 sm:mb-4 text-center">
            按岗位学习
          </h2>
          <p className="text-gray-600 text-center mb-6 sm:mb-8 max-w-2xl mx-auto px-4 sm:px-0 text-sm sm:text-base">
            根据你的目标岗位，选择对应的学习路径和题目集合
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {ROLES.map((role) => (
              <RoleCard key={role.id} {...role} />
            ))}
          </div>
        </div>
      </section>

      {/* 技术专区 */}
      <section className="container mx-auto px-4 py-12">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 sm:mb-4 text-center">
          技术专区
        </h2>
        <p className="text-gray-600 text-center mb-6 sm:mb-8 max-w-2xl mx-auto px-4 sm:px-0 text-sm sm:text-base">
          聚焦特定技术领域，深入学习和实践
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {ZONES.map((zone) => (
            <ZoneCard key={zone.id} {...zone} />
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="bg-gray-50 py-10 sm:py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 sm:mb-8 text-center">
            为什么选择我们
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6 sm:gap-8">
            <Feature
              icon="📚"
              title="混合分类体系"
              description="技术分类 + 岗位角色 + 技术专区，三维定位学习方向"
            />
            <Feature
              icon="✨"
              title="持续更新"
              description="自动收集最新 AI 知识和面试真题，紧跟前沿技术"
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-6 sm:py-8 text-center text-gray-500 border-t border-gray-200">
        <p className="text-sm sm:text-base">© 2026 AI 学习与面试大全 | Built with Next.js & Vercel</p>
        <p className="text-xs sm:text-sm mt-2 flex flex-wrap justify-center gap-2">
          <Link href="/about" className="hover:underline">关于</Link>
          <span>|</span>
          <Link href="/docs" className="hover:underline">文档</Link>
          <span>|</span>
          <a href="https://github.com/xueshuai/ai-interview-questions" className="hover:underline" target="_blank" rel="noopener noreferrer">
            GitHub
          </a>
        </p>
      </footer>
    </div>
  );
}

function CategoryCard({
  id,
  name,
  icon,
  href,
  description,
}: {
  id: string;
  name: string;
  icon: string;
  href: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="block p-4 sm:p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition border border-gray-100 min-h-[160px] sm:min-h-[180px]"
    >
      <div className="text-2xl sm:text-3xl mb-2 sm:mb-3">{icon}</div>
      <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">{name}</h3>
      <p className="text-sm sm:text-base text-gray-600 mb-3 line-clamp-2">{description}</p>
      <span className="text-xs sm:text-sm text-blue-600 font-medium">
        浏览题目 →
      </span>
    </Link>
  );
}

function RoleCard({
  id,
  name,
  icon,
  href,
  subRoles,
}: {
  id: string;
  name: string;
  icon: string;
  href: string;
  subRoles: string[];
}) {
  return (
    <Link
      href={href}
      className="block p-4 sm:p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition border border-gray-100"
    >
      <div className="flex items-start sm:items-center gap-2 sm:gap-3 mb-2 sm:mb-3 flex-col sm:flex-row">
        <div className="text-2xl sm:text-3xl flex-shrink-0">{icon}</div>
        <h3 className="text-lg sm:text-xl font-semibold text-gray-900">{name}</h3>
      </div>
      <div className="flex flex-wrap gap-1 sm:gap-2">
        {subRoles.map((sub) => (
          <span
            key={sub}
            className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded min-h-[28px]"
          >
            {sub}
          </span>
        ))}
      </div>
    </Link>
  );
}

function ZoneCard({
  id,
  name,
  icon,
  href,
  topics,
}: {
  id: string;
  name: string;
  icon: string;
  href: string;
  topics: string[];
}) {
  return (
    <Link
      href={href}
      className="block p-4 sm:p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition border border-gray-100"
    >
      <div className="flex items-start sm:items-center gap-2 sm:gap-3 mb-2 sm:mb-3 flex-col sm:flex-row">
        <div className="text-2xl sm:text-3xl flex-shrink-0">{icon}</div>
        <h3 className="text-lg sm:text-xl font-semibold text-gray-900">{name}</h3>
      </div>
      <div className="flex flex-wrap gap-1 sm:gap-2">
        {topics.map((topic) => (
          <span
            key={topic}
            className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded min-h-[28px]"
          >
            {topic}
          </span>
        ))}
      </div>
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
    <div className="text-center px-4">
      <div className="text-3xl sm:text-4xl mb-3 sm:mb-4">{icon}</div>
      <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-sm sm:text-base text-gray-600">{description}</p>
    </div>
  );
}
