"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useState, useMemo } from "react";
import tagsData from "@/content/meta/tags.json";

export default function TagDetailPage() {
  const params = useParams();
  const router = useRouter();
  const tagId = params.tag as string;

  const tags = tagsData as any;

  // 查找标签信息
  const tagInfo = useMemo(() => {
    // 在技术领域查找
    if (tags.techDomains[tagId as keyof typeof tags.techDomains]) {
      return {
        ...tags.techDomains[tagId as keyof typeof tags.techDomains],
        id: tagId,
        group: "tech",
      };
    }
    // 在难度查找
    if (tags.difficulties[tagId as keyof typeof tags.difficulties]) {
      return {
        ...tags.difficulties[tagId as keyof typeof tags.difficulties],
        id: tagId,
        group: "difficulty",
      };
    }
    // 在场景查找
    if (tags.scenarios[tagId as keyof typeof tags.scenarios]) {
      return {
        ...tags.scenarios[tagId as keyof typeof tags.scenarios],
        id: tagId,
        group: "scenario",
      };
    }
    return null;
  }, [tagId, tags]);

  // 模拟相关内容（实际应从数据中查询）
  const relatedContent = useMemo(() => {
    const mockData = [
      { id: "1", title: `${tagId} 核心概念详解`, type: "knowledge", difficulty: "⭐⭐" },
      { id: "2", title: `${tagId} 实战案例分析`, type: "knowledge", difficulty: "⭐⭐⭐" },
      { id: "3", title: `${tagId} 面试真题精选`, type: "interview", difficulty: "⭐⭐" },
      { id: "4", title: `${tagId} 大厂笔试题目`, type: "interview", difficulty: "⭐⭐⭐" },
    ];
    return mockData;
  }, [tagId]);

  // 相关标签推荐
  const relatedTags = useMemo(() => {
    if (!tagInfo) return [];
    
    const recommendations: Array<{ id: string; name: string; icon?: string }> = [];
    
    if (tagInfo.group === "tech") {
      // 技术领域推荐相关技术
      if (tagId === "LLM") {
        recommendations.push(
          { id: "Transformer", name: "Transformer", icon: tags.techDomains.Transformer?.icon },
          { id: "RAG", name: "RAG", icon: tags.techDomains.RAG?.icon },
          { id: "Agent", name: "Agent", icon: tags.techDomains.Agent?.icon }
        );
      } else if (tagId === "DL") {
        recommendations.push(
          { id: "NLP", name: "NLP", icon: tags.techDomains.NLP?.icon },
          { id: "CV", name: "CV", icon: tags.techDomains.CV?.icon },
          { id: "LLM", name: "大模型", icon: tags.techDomains.LLM?.icon }
        );
      }
    } else if (tagInfo.group === "difficulty") {
      // 难度推荐其他难度
      recommendations.push(
        { id: "1", name: "基础入门", icon: tags.difficulties["1"]?.icon },
        { id: "2", name: "中级进阶", icon: tags.difficulties["2"]?.icon },
        { id: "3", name: "高级精通", icon: tags.difficulties["3"]?.icon }
      );
    } else if (tagInfo.group === "scenario") {
      // 场景推荐相关场景
      if (tagId === "interview") {
        recommendations.push(
          { id: "bigtech", name: "大厂真题", icon: tags.scenarios.bigtech?.icon },
          { id: "exam", name: "笔试题目", icon: tags.scenarios.exam?.icon }
        );
      }
    }
    
    return recommendations;
  }, [tagInfo, tagId, tags]);

  if (!tagInfo) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">标签不存在</h1>
          <p className="text-gray-600 mb-6">找不到标签 "{tagId}"</p>
          <Link
            href="/tags"
            className="px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition"
          >
            返回标签云
          </Link>
        </div>
      </div>
    );
  }

  const groupColors = {
    tech: "from-blue-500 to-blue-600",
    difficulty: "from-yellow-500 to-yellow-600",
    scenario: "from-green-500 to-green-600",
  };

  const groupBgColors = {
    tech: "bg-blue-50",
    difficulty: "bg-yellow-50",
    scenario: "bg-green-50",
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-3 mb-4">
            <Link href="/tags" className="text-gray-600 hover:text-gray-900">
              ← 返回标签云
            </Link>
          </div>
          <div className={`inline-flex items-center gap-3 px-4 py-2 rounded-xl ${groupBgColors[tagInfo.group as keyof typeof groupBgColors]}`}>
            <span className="text-3xl">{tagInfo.icon}</span>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{tagInfo.name}</h1>
              <p className="text-sm text-gray-600">#{tagId}</p>
            </div>
          </div>
        </div>
      </header>

      {/* 主要内容 */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 左侧：相关内容 */}
          <div className="lg:col-span-2">
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">📚 相关内容</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {relatedContent.map((item) => (
                  <Link
                    key={item.id}
                    href={item.type === "knowledge" ? `/knowledge/${tagId}/${item.id}` : `/interview/${tagId}/${item.id}`}
                    className="block p-5 bg-white rounded-xl border border-gray-200 hover:shadow-md transition"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <span className={`px-2 py-1 text-xs rounded font-medium ${
                        item.type === "knowledge" 
                          ? "bg-blue-100 text-blue-700" 
                          : "bg-purple-100 text-purple-700"
                      }`}>
                        {item.type === "knowledge" ? "知识库" : "面试题"}
                      </span>
                      <span className="text-sm">{item.difficulty}</span>
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">{item.title}</h3>
                    <p className="text-sm text-gray-600">点击查看详情 →</p>
                  </Link>
                ))}
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">🔗 相关标签</h2>
              <div className="flex flex-wrap gap-3">
                {relatedTags.map((tag) => (
                  <Link
                    key={tag.id}
                    href={`/tags/${tag.id}`}
                    className={`
                      inline-flex items-center gap-2 px-4 py-2 rounded-full
                      bg-white border border-gray-300 hover:border-blue-500 hover:bg-blue-50
                      transition-all font-medium text-gray-700
                    `}
                  >
                    {tag.icon && <span>{tag.icon}</span>}
                    <span>{tag.name}</span>
                  </Link>
                ))}
              </div>
            </section>
          </div>

          {/* 右侧：标签信息 */}
          <div className="lg:col-span-1">
            <div className="sticky top-4 space-y-6">
              {/* 标签统计 */}
              <div className="bg-white rounded-2xl border border-gray-200 p-6">
                <h3 className="font-semibold text-gray-900 mb-4">📊 标签统计</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">知识库文章</span>
                    <span className="font-semibold text-gray-900">24</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">面试题目</span>
                    <span className="font-semibold text-gray-900">18</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">使用次数</span>
                    <span className="font-semibold text-gray-900">156</span>
                  </div>
                </div>
              </div>

              {/* 快速操作 */}
              <div className="bg-white rounded-2xl border border-gray-200 p-6">
                <h3 className="font-semibold text-gray-900 mb-4">⚡ 快速操作</h3>
                <div className="space-y-3">
                  <button
                    onClick={() => router.push(`/knowledge?tags=${tagId}`)}
                    className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
                  >
                    查看知识库
                  </button>
                  <button
                    onClick={() => router.push(`/interview?tags=${tagId}`)}
                    className="w-full px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition"
                  >
                    查看面试题
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 text-center text-gray-500 border-t border-gray-200 mt-8">
        <p className="text-sm">
          想要探索更多？前往{" "}
          <Link href="/tags" className="text-blue-600 hover:underline font-medium">
            🏷️ 标签云
          </Link>
        </p>
      </footer>
    </div>
  );
}
