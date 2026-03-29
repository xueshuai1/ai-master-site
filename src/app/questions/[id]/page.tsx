"use client";

import Link from "next/link";
import { useParams } from "next/navigation";

export default function QuestionDetailPage() {
  const params = useParams();
  const id = params.id as string;

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <header className="bg-white border-b border-[#E2E8F0]">
        <div className="container mx-auto px-4 py-6">
          <Link href="/interview" className="text-[#64748B] hover:text-[#2563EB] transition-colors mb-4 inline-block">
            ← 返回题库
          </Link>
          <h1 className="text-3xl font-bold text-[#1E293B]">题目详情：{id}</h1>
          <p className="text-[#64748B] mt-2">页面正在建设中...</p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-8">
          <div className="prose max-w-none">
            <p className="text-lg text-[#64748B]">
              题目详情页面正在开发中，敬请期待！
            </p>
            <p className="text-sm text-[#94A3B8] mt-4">
              当前题目 ID: <code className="px-2 py-1 bg-gray-100 rounded">{id}</code>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
