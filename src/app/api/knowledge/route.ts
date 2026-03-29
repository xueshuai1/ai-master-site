import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

interface KnowledgeArticle {
  id: string;
  title: string;
  category: string;
  difficulty: string;
  tags: string[];
  author?: string;
  createdAt: string;
  updatedAt: string;
  readTime: number;
  abstract: string;
  keyTakeaways: string[];
  prerequisites: string[];
  relatedArticles: string[];
  version: string;
}

const DATA_DIR = path.join(process.cwd(), 'data', 'knowledge');
const KNOWLEDGE_BASE_DIR = path.join(process.cwd(), '..', 'ai-knowledge-base');

/**
 * 从 JSON 文件加载知识库文章
 */
function loadArticlesFromJSON(): KnowledgeArticle[] {
  const articles: KnowledgeArticle[] = [];
  
  if (!fs.existsSync(DATA_DIR)) {
    return articles;
  }
  
  const categories = fs.readdirSync(DATA_DIR);
  
  for (const category of categories) {
    const categoryDir = path.join(DATA_DIR, category);
    
    if (!fs.statSync(categoryDir).isDirectory()) continue;
    
    const files = fs.readdirSync(categoryDir);
    
    for (const file of files) {
      if (!file.endsWith('.json')) continue;
      
      const filePath = path.join(categoryDir, file);
      const content = fs.readFileSync(filePath, 'utf-8');
      const data = JSON.parse(content);
      
      articles.push(data);
    }
  }
  
  return articles;
}

/**
 * 从 MD 文件加载知识库文章列表（向后兼容）
 */
function loadArticlesFromMarkdown(): KnowledgeArticle[] {
  const articles: KnowledgeArticle[] = [];
  
  if (!fs.existsSync(KNOWLEDGE_BASE_DIR)) {
    return articles;
  }
  
  const categories = fs.readdirSync(KNOWLEDGE_BASE_DIR);
  
  for (const category of categories) {
    const categoryDir = path.join(KNOWLEDGE_BASE_DIR, category);
    
    if (!fs.statSync(categoryDir).isDirectory()) continue;
    
    const files = fs.readdirSync(categoryDir);
    
    for (const file of files) {
      if (!file.endsWith('.md')) continue;
      
      const filePath = path.join(categoryDir, file);
      const content = fs.readFileSync(filePath, 'utf-8');
      
      // 解析 frontmatter
      const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
      const frontmatter: Record<string, any> = {};
      
      if (frontmatterMatch) {
        const lines = frontmatterMatch[1].split('\n');
        for (const line of lines) {
          const [key, ...valueParts] = line.split(':');
          if (key && valueParts.length > 0) {
            let value = valueParts.join(':').trim();
            if (value.startsWith('[') && value.endsWith(']')) {
              value = value.slice(1, -1).split(',').map(v => v.trim().replace(/"/g, ''));
            }
            if (value.startsWith('"') && value.endsWith('"')) {
              value = value.slice(1, -1);
            }
            frontmatter[key.trim()] = value;
          }
        }
      }
      
      // 估算阅读时长（假设每分钟 300 字）
      const wordCount = content.length / 3;
      const readTime = Math.ceil(wordCount / 300);
      
      articles.push({
        id: file.replace('.md', ''),
        title: frontmatter.title || file.replace('.md', ''),
        category: frontmatter.category || category,
        difficulty: frontmatter.difficulty || '⭐⭐',
        tags: Array.isArray(frontmatter.tags) ? frontmatter.tags : [],
        author: frontmatter.author || '',
        createdAt: frontmatter.createdAt || new Date().toISOString(),
        updatedAt: frontmatter.updatedAt || new Date().toISOString(),
        readTime,
        abstract: content.slice(0, 300).replace(/[#*`\n]/g, '') + '...',
        keyTakeaways: [],
        prerequisites: [],
        relatedArticles: [],
        version: 'v1.0'
      });
    }
  }
  
  return articles;
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get('category');
    const tag = searchParams.get('tag');
    const search = searchParams.get('search');
    
    // 优先从 JSON 加载
    let articles = loadArticlesFromJSON();
    const hasJSONData = articles.length > 0;
    
    if (!hasJSONData) {
      articles = loadArticlesFromMarkdown();
    }
    
    // 筛选
    if (category) {
      articles = articles.filter(a => a.category === category);
    }
    
    if (tag) {
      articles = articles.filter(a => a.tags?.includes(tag));
    }
    
    if (search) {
      const searchLower = search.toLowerCase();
      articles = articles.filter(a => 
        a.title.toLowerCase().includes(searchLower) ||
        a.abstract.toLowerCase().includes(searchLower) ||
        a.tags?.some(t => t.toLowerCase().includes(searchLower))
      );
    }
    
    // 按分类分组
    const categories = Array.from(new Set(articles.map(a => a.category)))
      .map(cat => ({
        name: cat,
        count: articles.filter(a => a.category === cat).length
      }));
    
    return NextResponse.json({
      success: true,
      data: {
        articles,
        categories,
        total: articles.length
      }
    });
  } catch (error) {
    console.error('Error loading knowledge articles:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to load knowledge articles'
    }, { status: 500 });
  }
}
