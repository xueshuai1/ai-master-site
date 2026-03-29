"use client";

import Link from "next/link";
import { CpuIcon, BrainIcon, BookIcon, LayersIcon, ZapIcon, UsersIcon, CodeIcon } from "@/components/Icons";

const CATEGORIES = [
  { id: "ML", name: "机器学习基础", href: "/categories/ML", description: "监督学习、无监督学习、模型评估", icon: CpuIcon, count: 15 },
  { id: "DL", name: "深度学习", href: "/categories/DL", description: "神经网络、CNN、RNN、Transformer", icon: BrainIcon, count: 23 },
  { id: "NLP", name: "自然语言处理", href: "/categories/NLP", description: "词向量、语言模型、文本生成", icon: BookIcon, count: 18 },
  { id: "CV", name: "计算机视觉", href: "/categories/CV", description: "图像分类、目标检测、分割", icon: LayersIcon, count: 12 },
  { id: "LLM", name: "大语言模型", href: "/categories/LLM", description: "Prompt、RAG、Fine-tuning、Agent", icon: ZapIcon, count: 31 },
  { id: "RecSys", name: "推荐系统", href: "/categories/RecSys", description: "召回排序、协同过滤、深度学习", icon: UsersIcon, count: 9 },
  { id: "RL", name: "强化学习", href: "/categories/RL", description: "MDP、Q-Learning、Policy Gradient", icon: CodeIcon, count: 7 },
  { id: "System", name: "系统设计", href: "/categories/System", description: "ML 系统设计、架构设计", icon: LayersIcon, count: 14 },
  { id: "Coding", name: "编程算法", href: "/categories/Coding", description: "LeetCode、数据结构、算法", icon: CodeIcon, count: 20 },
];

export default function CategoriesPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <header className="bg-white border-b border-[#E2E8F0]">
        <div className="container mx-auto px-4 py-6">
          <Link href="/" className="text-[#64748B] hover:text-[#2563EB] transition-colors mb-4 inline-block">
            ← 返回首页
          </Link>
          <h1 className="text-3xl font-bold text-[#1E293B]">📚 技术专区</h1>
          <p className="text-[#64748B] mt-2">探索 AI 领域各大技术方向的面试题目</p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            return (
              <Link
                key={cat.id}
                href={cat.href}
                className="bg-white rounded-2xl border border-[#E2E8F0] p-6 hover:shadow-lg transition-all hover:border-[#2563EB] group"
              >
                <div className="w-12 h-12 bg-[#F1F5F9] rounded-xl flex items-center justify-center mb-4 group-hover:bg-[#2563EB] transition-colors">
                  <Icon className="w-6 h-6 text-[#2563EB] group-hover:text-white transition-colors" />
                </div>
                <h2 className="text-xl font-bold text-[#1E293B] mb-2">{cat.name}</h2>
                <p className="text-[#64748B] text-sm mb-4">{cat.description}</p>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-1 bg-[#DBEAFE] text-[#1E40AF] text-xs rounded font-medium">
                    {cat.count} 道题目
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </main>
    </div>
  );
}
