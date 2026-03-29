import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data', 'knowledge');
const KNOWLEDGE_BASE_DIR = path.join(process.cwd(), '..', 'ai-knowledge-base');

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
  version: string;
  sections?: any[];
  content?: string;
  summary?: string;
  keyPoints?: string[];
}

function loadArticle(category: string, id: string) {
  // 从 JSON 加载
  const categoryDir = path.join(DATA_DIR, category);
  if (fs.existsSync(categoryDir)) {
    const filePath = path.join(categoryDir, `${id}.json`);
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(content);
    }
    
    const files = fs.readdirSync(categoryDir);
    for (const file of files) {
      if (!file.endsWith('.json')) continue;
      const filePath = path.join(categoryDir, file);
      const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      if (data.id === id) {
        return data;
      }
    }
  }
  
  // 从 MD 加载
  const mdCategoryDir = path.join(KNOWLEDGE_BASE_DIR, category);
  if (fs.existsSync(mdCategoryDir)) {
    const filePath = path.join(mdCategoryDir, `${id}.md`);
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf-8');
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
      
      const body = content.replace(/^---\n[\s\S]*?\n---\n/, '');
      return {
        id,
        title: frontmatter.title || id,
        category,
        content: body,
        summary: frontmatter.summary || '',
        keyPoints: frontmatter.keyPoints || []
      };
    }
  }
  
  return null;
}

function loadArticlesByCategory(category: string): KnowledgeArticle[] {
  const articles: KnowledgeArticle[] = [];
  
  // 从 JSON 加载
  const categoryDir = path.join(DATA_DIR, category);
  if (fs.existsSync(categoryDir)) {
    const files = fs.readdirSync(categoryDir);
    
    for (const file of files) {
      if (!file.endsWith('.json')) continue;
      
      const filePath = path.join(categoryDir, file);
      const content = fs.readFileSync(filePath, 'utf-8');
      const data = JSON.parse(content);
      
      if (data.category === category) {
        articles.push(data);
      }
    }
  }
  
  // 从 MD 加载（向后兼容）
  const mdCategoryDir = path.join(KNOWLEDGE_BASE_DIR, category);
  if (fs.existsSync(mdCategoryDir) && articles.length === 0) {
    const files = fs.readdirSync(mdCategoryDir);
    
    for (const file of files) {
      if (!file.endsWith('.md')) continue;
      
      const filePath = path.join(mdCategoryDir, file);
      const content = fs.readFileSync(filePath, 'utf-8');
      
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
      
      const wordCount = content.length / 3;
      const readTime = Math.ceil(wordCount / 300);
      
      articles.push({
        id: file.replace('.md', ''),
        title: frontmatter.title || file.replace('.md', ''),
        category,
        difficulty: frontmatter.difficulty || '⭐⭐',
        tags: Array.isArray(frontmatter.tags) ? frontmatter.tags : [],
        author: frontmatter.author || '',
        createdAt: frontmatter.createdAt || new Date().toISOString(),
        updatedAt: frontmatter.updatedAt || new Date().toISOString(),
        readTime,
        abstract: content.slice(0, 300).replace(/[#*`\n]/g, '') + '...',
        keyTakeaways: [],
        version: 'v1.0'
      });
    }
  }
  
  return articles;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ category: string }> }
) {
  try {
    const { category } = await params;
    const decodedCategory = decodeURIComponent(category);
    
    const articles = loadArticlesByCategory(decodedCategory);
    
    if (articles.length === 0) {
      return NextResponse.json({
        success: true,
        data: {
          category: decodedCategory,
          articles: [],
          total: 0
        }
      });
    }
    
    // 按更新时间排序
    articles.sort((a, b) => {
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });
    
    // 添加字段映射，兼容前端期望的格式
    const mappedArticles = articles.map(article => ({
      id: article.id,
      title: article.title,
      summary: article.abstract || article.keyTakeaways?.join(' ') || '',
      keyPoints: article.tags || [],
      estimatedTime: `${article.readTime || 10}分钟`,
      order: 0,
      difficulty: article.difficulty === '⭐' ? 1 : article.difficulty === '⭐⭐' ? 2 : article.difficulty === '⭐⭐⭐' ? 3 : 4
    }));
    
    return NextResponse.json({
      success: true,
      data: {
        category,
        articles: mappedArticles,
        total: mappedArticles.length
      }
    });
  } catch (error) {
    console.error('Error loading category articles:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to load category articles'
    }, { status: 500 });
  }
}
