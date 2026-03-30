"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import ProgressPanel from "@/components/ProgressPanel";

interface LearningProgressProps {
  category: string;
  articleId: string;
}

export default function LearningProgress({ category, articleId }: LearningProgressProps) {
  const [articleProgress, setArticleProgress] = useState<number>(0);
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('ai-interview-learning-progress');
    if (stored) {
      try {
        const data = JSON.parse(stored);
        const progress = data[category]?.[articleId];
        if (progress) {
          setArticleProgress(progress.progress);
          setIsCompleted(progress.completed);
        }
      } catch (error) {
        console.error('Failed to load progress:', error);
      }
    }
  }, [category, articleId]);

  const handleMarkAsRead = () => {
    const stored = localStorage.getItem('ai-interview-learning-progress');
    let data: any = { stats: { totalArticles: 0, completedArticles: 0, learningStreak: 0 } };
    
    if (stored) {
      try {
        data = JSON.parse(stored);
      } catch (error) {
        console.error('Failed to parse progress:', error);
      }
    }
    
    if (!data[category]) {
      data[category] = {};
    }
    
    const today = new Date().toISOString().split('T')[0];
    data[category][articleId] = {
      completed: true,
      completedAt: today,
      progress: 1,
      lastReadAt: today,
    };
    
    let totalArticles = 0;
    let completedArticles = 0;
    
    Object.keys(data).forEach((key: string) => {
      if (key === 'stats') return;
      const categoryData = data[key];
      totalArticles += Object.keys(categoryData).length;
      completedArticles += Object.values(categoryData).filter((p: any) => p.completed).length;
    });
    
    const lastDate = data.stats.lastStudyDate;
    if (lastDate !== today) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];
      
      if (lastDate === yesterdayStr) {
        data.stats.learningStreak += 1;
      } else if (lastDate !== today) {
        data.stats.learningStreak = 1;
      }
      
      data.stats.lastStudyDate = today;
    }
    
    data.stats.totalArticles = totalArticles;
    data.stats.completedArticles = completedArticles;
    
    localStorage.setItem('ai-interview-learning-progress', JSON.stringify(data));
    
    setArticleProgress(1);
    setIsCompleted(true);
  };

  return (
    <div className="sticky top-6 space-y-4">
      <ProgressPanel />
      
      <button 
        onClick={handleMarkAsRead}
        disabled={isCompleted}
        className={`w-full px-4 py-2 text-sm rounded-lg transition-colors font-medium ${
          isCompleted 
            ? 'bg-green-100 text-green-700 cursor-default' 
            : 'bg-blue-600 text-white hover:bg-blue-700'
        }`}
      >
        {isCompleted ? '✅ 已完成' : '📚 标记为已读'}
      </button>
      
      <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
        <h3 className="font-semibold text-gray-800 mb-3 text-sm flex items-center gap-2">
          <span>📈</span>
          本节进度
        </h3>
        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-gray-600">阅读进度</span>
            <span className="text-blue-600 font-medium">{Math.round(articleProgress * 100)}%</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-300 ${isCompleted ? 'bg-green-500' : 'bg-blue-500'}`}
              style={{ width: `${articleProgress * 100}%` }}
            ></div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
        <h3 className="font-semibold text-gray-800 mb-3 text-sm flex items-center gap-2">
          <span>🔗</span>
          相关推荐
        </h3>
        <ul className="space-y-2 text-xs">
          <li>
            <Link
              href={`/knowledge/${category}`}
              className="text-blue-600 hover:underline block"
            >
              浏览该分类所有文章
            </Link>
          </li>
        </ul>
      </div>
    </div>
  );
}
