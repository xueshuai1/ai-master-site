"use client";

import Link from "next/link";
import { useState } from "react";

// Lucide 风格 SVG 图标组件
function BookIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </svg>
  );
}

function BriefcaseIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="14" x="2" y="7" rx="2" ry="2" />
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
    </svg>
  );
}

function MapIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21" />
      <line x1="9" x2="9" y1="3" y2="18" />
      <line x1="15" x2="15" y1="6" y2="21" />
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

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
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

// 分类数据
const CATEGORIES = [
  { id: "ML", name: "机器学习基础", icon: CpuIcon, href: "/categories/ML", description: "监督学习、无监督学习、模型评估" },
  { id: "DL", name: "深度学习", icon: BrainIcon, href: "/categories/DL", description: "神经网络、CNN、RNN、Transformer" },
  { id: "NLP", name: "自然语言处理", icon: BookIcon, href: "/categories/NLP", description: "词向量、语言模型、文本生成" },
  { id: "CV", name: "计算机视觉", icon: LayersIcon, href: "/categories/CV", description: "图像分类、目标检测、分割" },
  { id: "LLM", name: "大语言模型", icon: ZapIcon, href: "/categories/LLM", description: "Prompt、RAG、Fine-tuning、Agent" },
  { id: "RecSys", name: "推荐系统", icon: UsersIcon, href: "/categories/RecSys", description: "召回排序、协同过滤、深度学习" },
  { id: "RL", name: "强化学习", icon: CodeIcon, href: "/categories/RL", description: "MDP、Q-Learning、Policy Gradient" },
  { id: "System", name: "系统设计", icon: LayersIcon, href: "/categories/System", description: "ML 系统设计、架构设计" },
  { id: "Coding", name: "编程算法", icon: CodeIcon, href: "/categories/Coding", description: "LeetCode、数据结构、算法" },
];

// 非 AI 岗位（6 个）- 学习 AI 提升竞争力
const NON_AI_ROLES = [
  { id: "frontend", name: "前端开发", icon: CodeIcon, href: "/roles/frontend", subRoles: ["AI 应用集成", "智能 UI/UX", "Copilot 提效"] },
  { id: "backend", name: "后端开发", icon: CpuIcon, href: "/roles/backend", subRoles: ["模型服务化", "AI API 设计", "系统架构"] },
  { id: "fullstack", name: "全栈开发", icon: ZapIcon, href: "/roles/fullstack", subRoles: ["AI 全栈项目", "快速原型", "独立开发"] },
  { id: "mobile", name: "移动端开发", icon: CodeIcon, href: "/roles/mobile", subRoles: ["iOS + AI", "Android + AI", "跨平台 + AI"] },
  { id: "test", name: "测试工程师", icon: CheckIcon, href: "/roles/test", subRoles: ["AI 测试", "自动化测试", "质量保障"] },
  { id: "data", name: "数据开发", icon: LayersIcon, href: "/roles/data", subRoles: ["数据工程", "数据 pipeline", "特征工程"] },
];

// AI 专业岗位（2 个）- 深入 AI 技术
const AI_PRO_ROLES = [
  { id: "algorithm", name: "算法工程师", icon: BrainIcon, href: "/roles/algorithm", subRoles: ["机器学习", "深度学习", "CV", "NLP"] },
  { id: "product", name: "产品经理", icon: BriefcaseIcon, href: "/roles/product", subRoles: ["AI 产品设计", "场景分析", "商业化"] },
];

// 技术专区数据
const ZONES = [
  { id: "openclaw", name: "OpenClaw 专区", icon: ZapIcon, href: "/zones/openclaw", topics: ["OpenClaw 技术", "技能开发", "节点控制"] },
  { id: "agent-dev", name: "Agent 开发", icon: CpuIcon, href: "/zones/agent-dev", topics: ["子 Agent", "多 Agent 协作"] },
  { id: "methodology", name: "开发方法论", icon: BookIcon, href: "/zones/methodology", topics: ["SDD", "TDD", "ATDD", "OMO"] },
  { id: "toolchain", name: "工具链", icon: CodeIcon, href: "/zones/toolchain", topics: ["OpenCode", "Cursor", "Windsurf"] },
  { id: "frontier", name: "前沿技术", icon: ZapIcon, href: "/zones/frontier", topics: ["最新论文", "技术趋势"] },
];

type TrackType = "non-ai" | "ai-pro";

export default function Home() {
  const [activeTrack, setActiveTrack] = useState<TrackType>("non-ai");

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
            <BriefcaseIcon className="w-6 h-6" />
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

      {/* 技术分类 */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-[#1E293B] mb-4 text-center">
          按技术分类
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

      {/* 双岗位分类体系 - Tab 切换 */}
      <section className="bg-white py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl sm:text-4xl font-bold text-[#1E293B] mb-4 text-center">
            按岗位学习
          </h2>
          <p className="text-[#64748B] text-center mb-10 max-w-2xl mx-auto text-lg">
            根据你的目标岗位，选择对应的学习路径和题目集合
          </p>

          {/* Tab 切换 */}
          <div className="flex justify-center mb-10">
            <div className="inline-flex bg-[#F1F5F9] rounded-xl p-1.5 shadow-sm">
              <button
                onClick={() => setActiveTrack("non-ai")}
                className={`px-6 py-3 rounded-lg text-base font-medium transition-all duration-200 cursor-pointer min-h-[48px] ${
                  activeTrack === "non-ai"
                    ? "bg-[#2563EB] text-white shadow-md"
                    : "text-[#64748B] hover:bg-[#E2E8F0]"
                }`}
              >
                我想学 AI 提升 <span className="hidden sm:inline font-normal opacity-90">（6 个岗位）</span>
              </button>
              <button
                onClick={() => setActiveTrack("ai-pro")}
                className={`px-6 py-3 rounded-lg text-base font-medium transition-all duration-200 cursor-pointer min-h-[48px] ${
                  activeTrack === "ai-pro"
                    ? "bg-[#475569] text-white shadow-md"
                    : "text-[#64748B] hover:bg-[#E2E8F0]"
                }`}
              >
                AI 专业深入 <span className="hidden sm:inline font-normal opacity-90">（2 个岗位）</span>
              </button>
            </div>
          </div>

          {/* 岗位列表 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeTrack === "non-ai" ? (
              NON_AI_ROLES.map((role) => (
                <RoleCard key={role.id} {...role} />
              ))
            ) : (
              AI_PRO_ROLES.map((role) => (
                <RoleCard key={role.id} {...role} />
              ))
            )}
          </div>

          {/* Track 描述 */}
          <div className="mt-8 text-center">
            <p className="text-sm text-[#94A3B8]">
              {activeTrack === "non-ai"
                ? "适合传统开发/测试/数据人员，学习 AI 提升竞争力"
                : "适合 AI 算法和产品经理，深入学习 AI 技术"}
            </p>
          </div>
        </div>
      </section>

      {/* 技术专区 */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-[#1E293B] mb-4 text-center">
          技术专区
        </h2>
        <p className="text-[#64748B] text-center mb-12 max-w-2xl mx-auto text-lg">
          聚焦特定技术领域，深入学习和实践
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {ZONES.map((zone) => (
            <ZoneCard key={zone.id} {...zone} />
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="bg-[#F1F5F9] py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl sm:text-4xl font-bold text-[#1E293B] mb-4 text-center">
            为什么选择我们
          </h2>
          <p className="text-[#64748B] text-center mb-12 max-w-2xl mx-auto text-lg">
            全面覆盖，持续更新，助你快速成长
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Feature
              icon={LayersIcon}
              title="8 岗位分类体系"
              description="6 个非 AI 岗位 + 2 个 AI 专业岗位，全面覆盖技术角色"
            />
            <Feature
              icon={ZapIcon}
              title="持续更新"
              description="自动收集最新 AI 知识和面试真题，紧跟前沿技术"
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 text-center text-[#94A3B8] border-t border-[#E2E8F0]">
        <p className="text-sm">© 2026 AI 学习与面试大全 | Built with Next.js & Vercel</p>
        <div className="mt-4 flex flex-wrap justify-center gap-4 text-sm">
          <Link href="/about" className="text-[#64748B] hover:text-[#2563EB] transition-colors">
            关于
          </Link>
          <span className="text-[#E2E8F0]">|</span>
          <Link href="/docs" className="text-[#64748B] hover:text-[#2563EB] transition-colors">
            文档
          </Link>
          <span className="text-[#E2E8F0]">|</span>
          <a href="https://github.com/xueshuai1/ai-interview-questions" className="text-[#64748B] hover:text-[#2563EB] transition-colors" target="_blank" rel="noopener noreferrer">
            GitHub
          </a>
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
        浏览题目
        <ArrowRightIcon className="w-4 h-4" />
      </span>
    </Link>
  );
}

function RoleCard({
  id,
  name,
  icon: Icon,
  href,
  subRoles,
}: {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  subRoles: string[];
}) {
  return (
    <Link
      href={href}
      className="group block p-6 bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-[#E2E8F0] hover:border-[#475569]/20 cursor-pointer"
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 bg-[#F1F5F9] rounded-xl flex items-center justify-center group-hover:bg-[#475569]/10 transition-colors duration-300">
          <Icon className="w-6 h-6 text-[#475569] group-hover:text-[#475569] transition-colors duration-300" />
        </div>
        <h3 className="text-xl font-semibold text-[#1E293B]">{name}</h3>
      </div>
      <div className="flex flex-wrap gap-2">
        {subRoles.map((sub) => (
          <span
            key={sub}
            className="px-3 py-1.5 bg-[#DCFCE7] text-[#166534] text-sm rounded-lg font-medium"
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
  icon: Icon,
  href,
  topics,
}: {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  topics: string[];
}) {
  return (
    <Link
      href={href}
      className="group block p-6 bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-[#E2E8F0] hover:border-[#2563EB]/20 cursor-pointer"
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 bg-[#F1F5F9] rounded-xl flex items-center justify-center group-hover:bg-[#2563EB]/10 transition-colors duration-300">
          <Icon className="w-6 h-6 text-[#475569] group-hover:text-[#2563EB] transition-colors duration-300" />
        </div>
        <h3 className="text-xl font-semibold text-[#1E293B]">{name}</h3>
      </div>
      <div className="flex flex-wrap gap-2">
        {topics.map((topic) => (
          <span
            key={topic}
            className="px-3 py-1.5 bg-[#F3E8FF] text-[#7E22CE] text-sm rounded-lg font-medium"
          >
            {topic}
          </span>
        ))}
      </div>
    </Link>
  );
}

function Feature({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}) {
  return (
    <div className="text-center p-6">
      <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mx-auto mb-5">
        <Icon className="w-8 h-8 text-[#2563EB]" />
      </div>
      <h3 className="text-xl font-semibold text-[#1E293B] mb-3">{title}</h3>
      <p className="text-[#64748B] leading-relaxed">{description}</p>
    </div>
  );
}
