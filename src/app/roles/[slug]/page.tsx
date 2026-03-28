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

function BriefcaseIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="14" x="2" y="7" rx="2" ry="2" />
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
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

function CodeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
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

function ArrowLeftIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 12H5" />
      <path d="m12 19-7-7 7-7" />
    </svg>
  );
}

// 岗位数据
const ROLES: Record<string, { name: string; description: string; icon: React.ComponentType<{ className?: string }>; subRoles: string[] }> = {
  frontend: { name: "前端开发", description: "AI 应用集成、智能 UI/UX、Copilot 提效", icon: CodeIcon, subRoles: ["AI 应用集成", "智能 UI/UX", "Copilot 提效"] },
  backend: { name: "后端开发", description: "模型服务化、AI API 设计、系统架构", icon: CpuIcon, subRoles: ["模型服务化", "AI API 设计", "系统架构"] },
  fullstack: { name: "全栈开发", description: "AI 全栈项目、快速原型、独立开发", icon: ZapIcon, subRoles: ["AI 全栈项目", "快速原型", "独立开发"] },
  mobile: { name: "移动端开发", description: "iOS + AI、Android + AI、跨平台 + AI", icon: CodeIcon, subRoles: ["iOS + AI", "Android + AI", "跨平台 + AI"] },
  "test-engineer": { name: "测试工程师", description: "AI 测试、自动化测试、质量保障", icon: CheckIcon, subRoles: ["AI 测试", "自动化测试", "质量保障"] },
  "data-engineer": { name: "数据开发", description: "数据工程、数据 pipeline、特征工程", icon: LayersIcon, subRoles: ["数据工程", "数据 pipeline", "特征工程"] },
  algorithm: { name: "算法工程师", description: "机器学习、深度学习、CV、NLP", icon: BrainIcon, subRoles: ["机器学习", "深度学习", "CV", "NLP"] },
  "llm-engineer": { name: "大模型工程师", description: "LLM 应用开发、RAG、Fine-tuning、Agent", icon: ZapIcon, subRoles: ["LLM 应用", "RAG 实战", "Fine-tuning", "Agent 开发"] },
  "cv-engineer": { name: "CV 工程师", description: "图像分类、目标检测、图像生成", icon: LayersIcon, subRoles: ["图像分类", "目标检测", "图像生成"] },
  "nlp-engineer": { name: "NLP 工程师", description: "文本理解、文本生成、语言模型", icon: BookIcon, subRoles: ["文本理解", "文本生成", "语言模型"] },
  product: { name: "产品经理", description: "AI 产品设计、场景分析、商业化", icon: BriefcaseIcon, subRoles: ["AI 产品设计", "场景分析", "商业化"] },
};

// 示例题目数据
const SAMPLE_QUESTIONS: Record<string, Array<{ id: string; title: string; difficulty: string; tags: string[] }>> = {
  frontend: [
    { id: "fe-001", title: "如何在 React 中集成 AI 对话组件？", difficulty: "⭐⭐", tags: ["React", "AI 集成"] },
    { id: "fe-002", title: "实现智能表单验证的最佳实践", difficulty: "⭐⭐", tags: ["表单", "验证"] },
  ],
  backend: [
    { id: "be-001", title: "设计一个模型推理 API", difficulty: "⭐⭐⭐", tags: ["API", "架构"] },
    { id: "be-002", title: "如何处理大模型的流式响应？", difficulty: "⭐⭐", tags: ["流式", "性能"] },
  ],
  algorithm: [
    { id: "alg-001", title: "解释 Transformer 的自注意力机制", difficulty: "⭐⭐⭐", tags: ["深度学习", "NLP"] },
    { id: "alg-002", title: "如何优化模型的训练速度？", difficulty: "⭐⭐⭐", tags: ["优化", "训练"] },
  ],
};

export default function RolePage() {
  const params = useParams();
  const slug = params.slug as string;
  const role = ROLES[slug];

  if (!role) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-[#1E293B] mb-4">岗位不存在</h1>
          <Link href="/" className="text-[#2563EB] hover:underline">
            ← 返回首页
          </Link>
        </div>
      </div>
    );
  }

  const Icon = role.icon;
  const questions = SAMPLE_QUESTIONS[slug] || [];

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
              <Icon className="w-8 h-8 text-[#475569]" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-[#1E293B]">{role.name}</h1>
              <p className="text-[#64748B]">{role.description}</p>
            </div>
          </div>
          
          {/* 子角色标签 */}
          <div className="flex flex-wrap gap-2 mt-4">
            {role.subRoles.map((sub) => (
              <span
                key={sub}
                className="px-3 py-1.5 bg-[#DCFCE7] text-[#166534] text-sm rounded-lg font-medium"
              >
                {sub}
              </span>
            ))}
          </div>
        </div>
      </header>

      {/* 题目列表 */}
      <section className="container mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold text-[#1E293B] mb-6">
          {questions.length > 0 ? "面试题目" : "敬请期待"}
        </h2>
        
        {questions.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[#E2E8F0] p-12 text-center">
            <div className="w-20 h-20 bg-[#F1F5F9] rounded-full flex items-center justify-center mx-auto mb-6">
              <BriefcaseIcon className="w-10 h-10 text-[#94A3B8]" />
            </div>
            <h3 className="text-xl font-semibold text-[#1E293B] mb-3">
              题目正在准备中
            </h3>
            <p className="text-[#64748B] mb-6 max-w-md mx-auto">
              我们正在为该岗位精心准备面试题目，敬请期待！
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#2563EB] text-white rounded-xl hover:bg-[#1D4ED8] transition-all"
            >
              浏览其他岗位
              <ArrowLeftIcon className="w-5 h-5 rotate-180" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {questions.map((q) => (
              <div
                key={q.id}
                className="bg-white rounded-xl border border-[#E2E8F0] p-5 hover:shadow-md transition-shadow cursor-pointer"
              >
                <div className="flex items-start justify-between mb-3">
                  <span className="px-2 py-1 bg-[#F1F5F9] text-[#475569] text-xs rounded font-medium">
                    {q.id}
                  </span>
                  <span className="text-sm">{q.difficulty}</span>
                </div>
                <h3 className="text-lg font-semibold text-[#1E293B] mb-3">{q.title}</h3>
                <div className="flex flex-wrap gap-2">
                  {q.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-1 bg-[#DCFCE7] text-[#166534] text-xs rounded"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 学习建议 */}
      <section className="container mx-auto px-4 py-8">
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8">
          <h2 className="text-xl font-bold text-[#1E293B] mb-4">💡 学习建议</h2>
          <p className="text-[#64748B] mb-4">
            作为{role.name}，建议你重点掌握以下技能：
          </p>
          <ul className="space-y-2 text-[#64748B]">
            {role.subRoles.map((sub, idx) => (
              <li key={idx} className="flex items-center gap-2">
                <span className="w-2 h-2 bg-[#2563EB] rounded-full"></span>
                {sub}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 text-center text-[#94A3B8] border-t border-[#E2E8F0] mt-12">
        <p className="text-sm">© 2026 AI 学习与面试大全 | Built with Next.js & Vercel</p>
      </footer>
    </div>
  );
}
