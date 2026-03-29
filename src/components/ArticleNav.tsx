"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

interface Article {
  id: string;
  title: string;
  summary: string;
  keyPoints: string[];
  estimatedTime: string;
}

interface ArticleNavProps {
  category: string;
  articleId: string;
}

export default function ArticleNav({ category, articleId }: ArticleNavProps) {
  const [prev, setPrev] = useState<Article | null>(null);
  const [next, setNext] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 从 API 获取相邻文章
    const url = `/api/knowledge/index?category=${encodeURIComponent(category)}&articleId=${encodeURIComponent(articleId)}`;
    fetch(url)
      .then(res => res.json())
      .then(data => {
        console.log('Article nav data:', data);
        setPrev(data.prev);
        setNext(data.next);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load article nav:', err);
        setLoading(false);
      });
  }, [category, articleId]);

  if (loading) {
    return null;
  }

  if (!prev && !next) {
    return null;
  }

  return (
    <div className="grid md:grid-cols-2 gap-4 mt-8 pt-8 border-t border-gray-200">
      {/* 上一篇 */}
      {prev && (
        <Link
          href={`/knowledge/${category}/${prev.id}`}
          className="group p-6 bg-gradient-to-r from-blue-50 to-white rounded-2xl border border-blue-100 hover:shadow-lg hover:border-blue-300 transition-all"
        >
          <div className="flex items-center gap-2 mb-3">
            <span className="text-blue-600">←</span>
            <span className="text-xs font-medium text-blue-600 uppercase tracking-wider">上一篇</span>
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
            {prev.title}
          </h3>
          <p className="text-sm text-gray-600 mb-3">{prev.summary}</p>
          <div className="flex items-center gap-3 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <span>📝</span>
              {prev.keyPoints.slice(0, 2).join(" · ")}
            </span>
            <span>⏱️ {prev.estimatedTime}</span>
          </div>
        </Link>
      )}

      {/* 下一篇 */}
      {next && (
        <Link
          href={`/knowledge/${category}/${next.id}`}
          className="group p-6 bg-gradient-to-r from-green-50 to-white rounded-2xl border border-green-100 hover:shadow-lg hover:border-green-300 transition-all text-right"
        >
          <div className="flex items-center justify-end gap-2 mb-3">
            <span className="text-xs font-medium text-green-600 uppercase tracking-wider">下一篇</span>
            <span className="text-green-600">→</span>
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-green-600 transition-colors">
            {next.title}
          </h3>
          <p className="text-sm text-gray-600 mb-3">{next.summary}</p>
          <div className="flex items-center justify-end gap-3 text-xs text-gray-500">
            <span>⏱️ {next.estimatedTime}</span>
            <span className="flex items-center gap-1">
              <span>📝</span>
              {next.keyPoints.slice(0, 2).join(" · ")}
            </span>
          </div>
        </Link>
      )}
    </div>
  );
}
