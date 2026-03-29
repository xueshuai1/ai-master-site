/**
 * 文章索引 API
 * 提供按分类和文章 ID 查询相邻文章的功能
 */

import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

interface ArticleIndex {
  id: string;
  title: string;
  order: number;
  summary: string;
  keyPoints: string[];
  estimatedTime: string;
}

interface CategoryIndex {
  category: string;
  name: string;
  articles: ArticleIndex[];
}

const CONTENT_DIR = path.join(process.cwd(), 'content/knowledge');

function loadCategoryIndex(category: string): CategoryIndex | null {
  const categoryDir = path.join(CONTENT_DIR, category);
  
  if (!fs.existsSync(categoryDir)) {
    return null;
  }
  
  const files = fs.readdirSync(categoryDir)
    .filter(f => f.endsWith('.md'))
    .map(file => {
      const filePath = path.join(categoryDir, file);
      const content = fs.readFileSync(filePath, 'utf-8');
      const { data } = matter(content);
      
      return {
        id: file.replace('.md', ''),
        title: data.title || file.replace('.md', ''),
        order: data.order || 0,
        summary: data.summary || data.description || '',
        keyPoints: data.keyPoints || data.tags || [],
        estimatedTime: data.estimatedTime || data.readTime || ''
      };
    })
    .sort((a, b) => a.order - b.order);
  
  return {
    category,
    name: category,
    articles: files
  };
}

function getAdjacentArticles(category: string, articleId: string) {
  const index = loadCategoryIndex(category);
  
  if (!index) {
    return { prev: null, next: null };
  }
  
  const currentIndex = index.articles.findIndex(a => a.id === articleId);
  
  if (currentIndex === -1) {
    return { prev: null, next: null };
  }
  
  const prev = currentIndex > 0 ? index.articles[currentIndex - 1] : null;
  const next = currentIndex < index.articles.length - 1 ? index.articles[currentIndex + 1] : null;
  
  return { prev, next };
}

export async function GET(
  request: NextRequest
) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');
  const articleId = searchParams.get('articleId');
  
  if (!category || !articleId) {
    return NextResponse.json(
      { error: 'Missing category or articleId parameter' },
      { status: 400 }
    );
  }
  
  const { prev, next } = getAdjacentArticles(category, articleId);
  
  return NextResponse.json({
    category,
    articleId,
    prev,
    next
  });
}
