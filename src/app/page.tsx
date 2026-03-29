"use client";

import Link from "next/link";
import { BookIcon, ArrowRightIcon, BrainIcon, LayersIcon, CodeIcon, UsersIcon, ServerIcon, TargetIcon, SparklesIcon, NetworkIcon, ChartIcon } from "@/components/Icons";

// Lucide 风格 SVG 图标组件
function MapIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21" />
      <line x1="9" x2="9" y1="3" y2="18" />
      <line x1="15" x2="15" y1="6" y2="21" />
    </svg>
  );
}

// 8 大技术领域
const CATEGORIES = [
  { id: "ML", name: "机器学习基础", icon: ChartIcon, href: "/categories/ML", description: "监督学习、无监督学习、模型评估" },
  { id: "DL", name: "深度学习", icon: BrainIcon, href: "/categories/DL", description: "神经网络、CNN、RNN、Transformer" },
  { id: "NLP", name: "自然语言处理", icon: LayersIcon, href: "/categories/NLP", description: "词向量、语言模型、文本生成" },
  { id: "CV", name: "计算机视觉", icon: TargetIcon, href: "/categories/CV", description: "图像分类、目标检测、分割" },
  { id: "LLM", name: "大语言模型", icon: SparklesIcon, href: "/categories/LLM", description: "Prompt、RAG、Fine-tuning、Agent" },
  { id: "RecSys", name: "推荐系统", icon: UsersIcon, href: "/categories/RecSys", description: "召回排序、协同过滤、深度学习" },
  { id: "RL", name: "强化学习", icon: NetworkIcon, href: "/categories/RL", description: "MDP、Q-Learning、Policy Gradient" },
  { id: "AI-Engineering", name: "AI 工程与实践", icon: CodeIcon, href: "/categories/AI-Engineering", description: "Agent 开发、方法论、工具链、前沿技术" },
];

export default function Home() {
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

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 sm:py-20 lg:py-24 text-center">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-[#1E293B] mb-6 tracking-tight">
          AI 学习与面试大全
        </h1>
        <p className="text-lg sm:text-xl text-[#64748B] mb-10 max-w-3xl mx-auto leading-relaxed">
          专注 AI 领域的知识库和面试准备，助你系统性掌握 AI 技术，轻松应对技术面试
        </p>

        {/* 双轨入口 - 知识库 | 面试题 */}
        <div className="flex justify-center gap-4 sm:gap-6 mb-10 flex-wrap">
          <Link
            href="/knowledge"
            className="group px-8 py-4 bg-[#2563EB] text-white rounded-xl hover:bg-[#1D4ED8] transition-all duration-200 shadow-md hover:shadow-lg text-lg min-h-[56px] flex items-center gap-3 cursor-pointer"
          >
            <BookIcon className="w-6 h-6" />
            知识库
            <span className="text-sm opacity-90 font-normal">系统化学习</span>
          </Link>
          <Link
            href="/interview"
            className="group px-8 py-4 bg-[#475569] text-white rounded-xl hover:bg-[#334155] transition-all duration-200 shadow-md hover:shadow-lg text-lg min-h-[56px] flex items-center gap-3 cursor-pointer"
          >
            <BookIcon className="w-6 h-6" />
            面试题库
            <span className="text-sm opacity-90 font-normal">面试准备</span>
          </Link>
        </div>

        {/* 快捷入口 */}
        <div className="flex justify-center gap-4 flex-wrap">
          <Link
            href="/roadmaps"
            className="px-6 py-3 border-2 border-[#CBD5E1] text-[#475569] rounded-xl hover:bg-[#F1F5F9] transition-all duration-200 text-base min-h-[48px] font-medium cursor-pointer"
          >
            <span className="flex items-center gap-2">
              <MapIcon className="w-5 h-5" />
              学习路径
            </span>
          </Link>
        </div>
      </section>

      {/* 技术分类 - 7 大领域 */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-[#1E293B] mb-4 text-center">
          技术分类
        </h2>
        <p className="text-[#64748B] text-center mb-12 max-w-2xl mx-auto text-lg">
          涵盖 AI 核心领域，从基础到进阶
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {CATEGORIES.map((cat) => (
            <CategoryCard key={cat.id} {...cat} />
          ))}
        </div>
      </section>

      {/* 知识库推荐 */}
      <section className="bg-white py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl sm:text-4xl font-bold text-[#1E293B] mb-4 text-center">
            知识库推荐
          </h2>
          <p className="text-[#64748B] text-center mb-10 max-w-2xl mx-auto text-lg">
            系统性学习 AI 技术，从基础到进阶
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <KnowledgeCard
              title="LLM 核心知识"
              description="Transformer、Attention、Fine-tuning、RAG、Agent 等核心技术"
              href="/knowledge/LLM"
              tags={["Transformer", "RAG", "Agent", "Fine-tuning"]}
            />
            <KnowledgeCard
              title="机器学习基础"
              description="监督学习、无监督学习、模型评估、特征工程"
              href="/knowledge/ML"
              tags={["监督学习", "模型评估", "特征工程"]}
            />
            <KnowledgeCard
              title="深度学习"
              description="神经网络、CNN、RNN、注意力机制、优化方法"
              href="/knowledge/DL"
              tags={["CNN", "RNN", "注意力机制"]}
            />
          </div>
        </div>
      </section>

      {/* 面试题推荐 */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-[#1E293B] mb-4 text-center">
          面试题推荐
        </h2>
        <p className="text-[#64748B] text-center mb-10 max-w-2xl mx-auto text-lg">
          精选高频面试题，助你轻松应对技术面试
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <QuestionCard
            title="LLM 高频面试题"
            description="Self-Attention、RoPE、Flash Attention、量化优化等"
            href="/interview?category=LLM"
            tags={["Attention", "位置编码", "推理优化"]}
          />
          <QuestionCard
            title="机器学习基础题"
            description="过拟合、正则化、交叉验证、模型选择等经典问题"
            href="/interview?category=ML"
            tags={["过拟合", "正则化", "模型评估"]}
          />
          <QuestionCard
            title="强化学习核心题"
            description="MDP、Q-Learning、Policy Gradient、Actor-Critic"
            href="/interview?category=RL"
            tags={["MDP", "Q-Learning", "Policy Gradient"]}
          />
        </div>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 text-center text-[#94A3B8] border-t border-[#E2E8F0]">
        <p className="text-sm">© 2026 AI 学习与面试大全 | Built with Next.js & Vercel</p>
        <div className="mt-4 flex flex-wrap justify-center gap-6 text-sm">
          <Link href="/knowledge" className="text-[#64748B] hover:text-[#2563EB] transition-colors">
            知识库
          </Link>
          <span className="text-[#CBD5E1]">|</span>
          <Link href="/interview" className="text-[#64748B] hover:text-[#2563EB] transition-colors">
            面试题库
          </Link>
        </div>
      </footer>
    </div>
  );
}

function CategoryCard({
  id,
  name,
  icon: Icon,
  href,
  description,
}: {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="group block p-6 bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-[#E2E8F0] hover:border-[#2563EB]/20 min-h-[200px] cursor-pointer"
    >
      <div className="w-12 h-12 bg-[#F1F5F9] rounded-xl flex items-center justify-center mb-4 group-hover:bg-[#2563EB]/10 transition-colors duration-300">
        <Icon className="w-6 h-6 text-[#475569] group-hover:text-[#2563EB] transition-colors duration-300" />
      </div>
      <h3 className="text-xl font-semibold text-[#1E293B] mb-3">{name}</h3>
      <p className="text-[#64748B] mb-4 leading-relaxed">{description}</p>
      <span className="text-sm text-[#2563EB] font-medium flex items-center gap-1 group-hover:gap-2 transition-all duration-300">
        浏览内容
        <ArrowRightIcon className="w-4 h-4" />
      </span>
    </Link>
  );
}

function KnowledgeCard({
  title,
  description,
  href,
  tags,
}: {
  title: string;
  description: string;
  href: string;
  tags: string[];
}) {
  return (
    <Link
      href={href}
      className="group block p-6 bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-[#E2E8F0] hover:border-[#2563EB]/20 cursor-pointer"
    >
      <h3 className="text-xl font-semibold text-[#1E293B] mb-3">{title}</h3>
      <p className="text-[#64748B] mb-4 leading-relaxed">{description}</p>
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <span
            key={tag}
            className="px-3 py-1.5 bg-[#F3E8FF] text-[#7E22CE] text-sm rounded-lg font-medium"
          >
            {tag}
          </span>
        ))}
      </div>
    </Link>
  );
}

function QuestionCard({
  title,
  description,
  href,
  tags,
}: {
  title: string;
  description: string;
  href: string;
  tags: string[];
}) {
  return (
    <Link
      href={href}
      className="group block p-6 bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-[#E2E8F0] hover:border-[#475569]/20 cursor-pointer"
    >
      <h3 className="text-xl font-semibold text-[#1E293B] mb-3">{title}</h3>
      <p className="text-[#64748B] mb-4 leading-relaxed">{description}</p>
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <span
            key={tag}
            className="px-3 py-1.5 bg-[#DCFCE7] text-[#166534] text-sm rounded-lg font-medium"
          >
            {tag}
          </span>
        ))}
      </div>
    </Link>
  );
}
