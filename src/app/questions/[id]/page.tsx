"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import CodeBlock from "@/components/CodeBlock";
import Callout from "@/components/Callout";
import Collapsible from "@/components/Collapsible";

interface Question {
  id: string;
  title: string;
  category: string;
  difficulty: string;
  tags: string[];
  source: string;
  sourceUrl: string;
  collectedAt: string;
  content: string;
  // 结构化数据字段
  description?: string;
  requirements?: string[];
  answer?: {
    summary: string;
    coreFormula?: string;
    sections: Array<{
      title: string;
      content: string;
      code?: {
        language: string;
        content: string;
        explanation?: string;
      };
    }>;
  };
  evaluation?: {
    knowledge?: string;
    ability?: string;
    thinking?: string;
  };
  followUpQuestions?: Array<{
    question: string;
    points: number;
    answerHint?: string;
  }>;
}

export default function QuestionDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [question, setQuestion] = useState<Question | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadQuestion() {
      try {
        const response = await fetch(`/api/questions/${id}`);
        if (response.ok) {
          const data = await response.json();
          setQuestion(data.data);
        } else {
          setError('题目不存在');
        }
      } catch (err) {
        setError('加载失败');
      } finally {
        setLoading(false);
      }
    }
    
    loadQuestion();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2563EB] mx-auto mb-4"></div>
          <p className="text-[#64748B]">加载中...</p>
        </div>
      </div>
    );
  }

  if (error || !question) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-[#1E293B] mb-4">题目不存在</h1>
          <p className="text-[#64748B] mb-6">{error || '题目不存在'}</p>
          <Link
            href="/interview"
            className="px-6 py-3 bg-[#2563EB] text-white rounded-xl hover:bg-[#1D4ED8] transition-all"
          >
            ← 返回题库
          </Link>
        </div>
      </div>
    );
  }

  // 渲染答案部分
  const renderAnswer = () => {
    if (!question.answer) {
      // 兼容旧格式：直接渲染 content
      return (
        <div className="prose prose-lg max-w-none">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {question.content}
          </ReactMarkdown>
        </div>
      );
    }

    return (
      <div className="space-y-8">
        {/* 答案摘要 */}
        {question.answer.summary && (
          <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-r-lg">
            <h3 className="text-lg font-semibold text-blue-900 mb-3">📝 答案摘要</h3>
            <div className="prose prose-blue max-w-none">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {question.answer.summary}
              </ReactMarkdown>
            </div>
          </div>
        )}

        {/* 答案章节 */}
        {question.answer.sections && question.answer.sections.length > 0 && (
          <div className="space-y-6">
            {question.answer.sections.map((section, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <span className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-600 rounded-full text-sm font-bold">
                    {index + 1}
                  </span>
                  {section.title}
                </h3>
                
                <div className="prose prose-lg max-w-none mb-4">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {section.content}
                  </ReactMarkdown>
                </div>

                {/* 代码示例 */}
                {section.code && (
                  <div className="mt-4 bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm font-medium text-gray-600">💻 代码示例</span>
                      {section.code.language && (
                        <span className="px-2 py-0.5 bg-gray-200 text-gray-700 text-xs rounded font-mono">
                          {section.code.language}
                        </span>
                      )}
                    </div>
                    <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
                      <code>{section.code.content}</code>
                    </pre>
                    {section.code.explanation && (
                      <p className="mt-3 text-sm text-gray-600">
                        <ReactMarkdown>{section.code.explanation}</ReactMarkdown>
                      </p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* 考察重点 */}
        {question.evaluation && (question.evaluation.knowledge || question.evaluation.ability || question.evaluation.thinking) && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-amber-900 mb-4 flex items-center gap-2">
              <span>🎯</span>
              考察重点
            </h3>
            <div className="space-y-3">
              {question.evaluation.knowledge && (
                <div className="flex items-start gap-3">
                  <span className="text-amber-600 font-bold mt-1">📚</span>
                  <div>
                    <span className="font-medium text-amber-900">知识理解：</span>
                    <span className="text-amber-800">{question.evaluation.knowledge}</span>
                  </div>
                </div>
              )}
              {question.evaluation.ability && (
                <div className="flex items-start gap-3">
                  <span className="text-amber-600 font-bold mt-1">💪</span>
                  <div>
                    <span className="font-medium text-amber-900">能力要求：</span>
                    <span className="text-amber-800">{question.evaluation.ability}</span>
                  </div>
                </div>
              )}
              {question.evaluation.thinking && (
                <div className="flex items-start gap-3">
                  <span className="text-amber-600 font-bold mt-1">🧠</span>
                  <div>
                    <span className="font-medium text-amber-900">思维能力：</span>
                    <span className="text-amber-800">{question.evaluation.thinking}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 延伸追问 */}
        {question.followUpQuestions && question.followUpQuestions.length > 0 && (
          <div className="bg-purple-50 border border-purple-200 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-purple-900 mb-4 flex items-center gap-2">
              <span>❓</span>
              延伸追问（{question.followUpQuestions.reduce((sum, q) => sum + q.points, 0)} 分）
            </h3>
            <div className="space-y-4">
              {question.followUpQuestions.map((item, index) => (
                <div key={index} className="bg-white rounded-lg p-4 border border-purple-100">
                  <div className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-xs font-bold">
                      {index + 1}
                    </span>
                    <div className="flex-1">
                      <p className="text-gray-900 font-medium">{item.question}</p>
                      <p className="text-sm text-purple-600 mt-1">{item.points} 分</p>
                      {item.answerHint && (
                        <Collapsible title="💡 答案提示">
                          <div className="prose prose-sm mt-2">
                            <ReactMarkdown>{item.answerHint}</ReactMarkdown>
                          </div>
                        </Collapsible>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <header className="bg-white border-b border-[#E2E8F0]">
        <div className="container mx-auto px-4 py-6">
          <Link
            href="/interview"
            className="text-[#64748B] hover:text-[#2563EB] transition-colors mb-4 inline-block"
          >
            ← 返回题库
          </Link>
          
          <div className="flex items-center gap-3 mb-4">
            <span className="px-3 py-1 bg-[#DBEAFE] text-[#1E40AF] text-sm rounded font-medium">
              {question.category}
            </span>
            <span className="text-sm text-[#64748B]">{question.difficulty}</span>
          </div>
          
          <h1 className="text-3xl sm:text-4xl font-bold text-[#1E293B] mb-4 leading-normal">
            {question.title}
          </h1>
          
          {question.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {question.tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-3 py-1.5 bg-gray-100 text-gray-700 text-sm rounded-full font-medium"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
          
          {question.source && (
            <p className="text-sm text-[#64748B]">
              来源：{question.source}
              {question.sourceUrl && (
                <a
                  href={question.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#2563EB] hover:underline ml-2"
                >
                  查看原文 →
                </a>
              )}
            </p>
          )}
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <article className="bg-white rounded-2xl border border-[#E2E8F0] p-8 shadow-sm">
            {renderAnswer()}
          </article>

          {/* 导航 */}
          <div className="flex gap-4 mt-8 pt-6 border-t border-gray-200">
            <Link
              href="/interview"
              className="px-6 py-3 bg-[#2563EB] text-white rounded-xl hover:bg-[#1D4ED8] transition-all font-medium"
            >
              ← 返回题库
            </Link>
            <Link
              href={`/categories/${question.category}`}
              className="px-6 py-3 bg-white text-[#2563EB] border border-[#2563EB] rounded-xl hover:bg-[#F1F5F9] transition-all font-medium"
            >
              浏览该分类
            </Link>
          </div>
        </div>
      </main>

      <footer className="container mx-auto px-4 py-8 text-center text-[#94A3B8] border-t border-[#E2E8F0] mt-8">
        <p className="text-sm">© 2026 AI 学习与面试大全 | Built with Next.js & Vercel</p>
      </footer>
    </div>
  );
}
