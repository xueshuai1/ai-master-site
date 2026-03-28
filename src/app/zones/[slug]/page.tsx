"use client";

import Link from "next/link";
import { useParams } from "next/navigation";

// Lucide 风格 SVG 图标组件
function ZapIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
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

function BookIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
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

function ArrowLeftIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 12H5" />
      <path d="m12 19-7-7 7-7" />
    </svg>
  );
}

// 专区数据
const ZONES: Record<string, { name: string; description: string; icon: React.ComponentType<{ className?: string }>; topics: string[] }> = {
  openclaw: { 
    name: "OpenClaw 专区", 
    description: "OpenClaw 技术、技能开发、节点控制", 
    icon: ZapIcon,
    topics: ["OpenClaw 技术", "技能开发", "节点控制"]
  },
  "agent-dev": { 
    name: "Agent 开发", 
    description: "子 Agent、多 Agent 协作", 
    icon: CpuIcon,
    topics: ["子 Agent", "多 Agent 协作"]
  },
  methodology: { 
    name: "开发方法论", 
    description: "SDD、TDD、ATDD、OMO", 
    icon: BookIcon,
    topics: ["SDD", "TDD", "ATDD", "OMO"]
  },
  toolchain: { 
    name: "工具链", 
    description: "OpenCode、Cursor、Windsurf", 
    icon: CodeIcon,
    topics: ["OpenCode", "Cursor", "Windsurf"]
  },
  frontier: { 
    name: "前沿技术", 
    description: "最新论文、技术趋势", 
    icon: ZapIcon,
    topics: ["最新论文", "技术趋势"]
  },
};

// 示例内容
const SAMPLE_CONTENT: Record<string, Array<{ id: string; title: string; type: string; date: string }>> = {
  openclaw: [
    { id: "oc-001", title: "OpenClaw 入门指南", type: "教程", date: "2026-03-15" },
    { id: "oc-002", title: "如何开发第一个技能", type: "教程", date: "2026-03-20" },
    { id: "oc-003", title: "节点连接问题排查", type: "FAQ", date: "2026-03-25" },
  ],
  "agent-dev": [
    { id: "ad-001", title: "子 Agent 设计与实现", type: "教程", date: "2026-03-18" },
    { id: "ad-002", title: "多 Agent 协作模式", type: "文章", date: "2026-03-22" },
  ],
};

export default function ZonePage() {
  const params = useParams();
  const slug = params.slug as string;
  const zone = ZONES[slug];

  if (!zone) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-[#1E293B] mb-4">专区不存在</h1>
          <Link href="/" className="text-[#2563EB] hover:underline">
            ← 返回首页
          </Link>
        </div>
      </div>
    );
  }

  const Icon = zone.icon;
  const content = SAMPLE_CONTENT[slug] || [];

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

      {/* Header */}
      <header className="bg-white border-b border-[#E2E8F0]">
        <div className="container mx-auto px-4 py-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-[#64748B] hover:text-[#2563EB] transition-colors mb-4"
          >
            <ArrowLeftIcon className="w-5 h-5" />
            返回首页
          </Link>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 bg-[#F1F5F9] rounded-xl flex items-center justify-center">
              <Icon className="w-8 h-8 text-[#2563EB]" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-[#1E293B]">{zone.name}</h1>
              <p className="text-[#64748B]">{zone.description}</p>
            </div>
          </div>
          
          {/* 主题标签 */}
          <div className="flex flex-wrap gap-2 mt-4">
            {zone.topics.map((topic) => (
              <span
                key={topic}
                className="px-3 py-1.5 bg-[#F3E8FF] text-[#7E22CE] text-sm rounded-lg font-medium"
              >
                {topic}
              </span>
            ))}
          </div>
        </div>
      </header>

      {/* 内容列表 */}
      <section className="container mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold text-[#1E293B] mb-6">
          {content.length > 0 ? "专区内容" : "敬请期待"}
        </h2>
        
        {content.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[#E2E8F0] p-12 text-center">
            <div className="w-20 h-20 bg-[#F1F5F9] rounded-full flex items-center justify-center mx-auto mb-6">
              <BookIcon className="w-10 h-10 text-[#94A3B8]" />
            </div>
            <h3 className="text-xl font-semibold text-[#1E293B] mb-3">
              内容正在准备中
            </h3>
            <p className="text-[#64748B] mb-6 max-w-md mx-auto">
              我们正在为该专区精心准备内容，敬请期待！
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#2563EB] text-white rounded-xl hover:bg-[#1D4ED8] transition-all"
            >
              浏览其他专区
              <ArrowLeftIcon className="w-5 h-5 rotate-180" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {content.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-xl border border-[#E2E8F0] p-5 hover:shadow-md transition-shadow cursor-pointer"
              >
                <div className="flex items-start justify-between mb-3">
                  <span className="px-2 py-1 bg-[#F1F5F9] text-[#475569] text-xs rounded font-medium">
                    {item.id}
                  </span>
                  <span className="text-xs text-[#94A3B8]">{item.date}</span>
                </div>
                <h3 className="text-lg font-semibold text-[#1E293B] mb-3">{item.title}</h3>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-1 bg-[#DBEAFE] text-[#1E40AF] text-xs rounded">
                    {item.type}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 相关专区 */}
      <section className="container mx-auto px-4 py-8">
        <h2 className="text-xl font-bold text-[#1E293B] mb-4">其他专区</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(ZONES)
            .filter(([id]) => id !== slug)
            .slice(0, 3)
            .map(([id, z]) => {
              const ZoneIcon = z.icon;
              return (
                <Link
                  key={id}
                  href={`/zones/${id}`}
                  className="block p-5 bg-white rounded-xl border border-[#E2E8F0] hover:border-[#2563EB] hover:shadow-md transition-all"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-[#F1F5F9] rounded-lg flex items-center justify-center">
                      <ZoneIcon className="w-5 h-5 text-[#2563EB]" />
                    </div>
                    <h3 className="font-semibold text-[#1E293B]">{z.name}</h3>
                  </div>
                  <p className="text-sm text-[#64748B] line-clamp-2">{z.description}</p>
                </Link>
              );
            })}
        </div>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 text-center text-[#94A3B8] border-t border-[#E2E8F0] mt-12">
        <p className="text-sm">© 2026 AI 学习与面试大全 | Built with Next.js & Vercel</p>
      </footer>
    </div>
  );
}
