import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data', 'knowledge');
const KNOWLEDGE_BASE_DIR = path.join(process.cwd(), '..', 'ai-knowledge-base');

function loadArticle(category: string, id: string) {
  // 从 JSON 加载
  const categoryDir = path.join(DATA_DIR, category);
  if (fs.existsSync(categoryDir)) {
    const filePath = path.join(categoryDir, `${id}.json`);
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(content);
    }
    
    // 遍历查找（兼容不同 ID 格式）
    const files = fs.readdirSync(categoryDir);
    for (const file of files) {
      if (!file.endsWith('.json')) continue;
      
      const fileFilePath = path.join(categoryDir, file);
      const content = fs.readFileSync(fileFilePath, 'utf-8');
      const data = JSON.parse(content);
      
      if (data.id === id) {
        return data;
      }
    }
  }
  
  // 从 MD 加载（向后兼容）
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
      const wordCount = content.length / 3;
      const readTime = Math.ceil(wordCount / 300);
      
      return {
        id,
        title: frontmatter.title || id,
        category,
        difficulty: frontmatter.difficulty || '⭐⭐',
        tags: Array.isArray(frontmatter.tags) ? frontmatter.tags : [],
        author: frontmatter.author || '',
        createdAt: frontmatter.createdAt || new Date().toISOString(),
        updatedAt: frontmatter.updatedAt || new Date().toISOString(),
        readTime,
        content: body,
        sections: parseMarkdownSections(body)
      };
    }
  }
  
  return null;
}

function parseMarkdownSections(content: string) {
  const sections: Array<{
    id: string;
    title: string;
    level: number;
    content: string;
  }> = [];
  
  const lines = content.split('\n');
  let currentSection: any = null;
  let currentContent: string[] = [];
  
  for (const line of lines) {
    const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);
    
    if (headingMatch) {
      // 保存之前的 section
      if (currentSection) {
        currentSection.content = currentContent.join('\n').trim();
        sections.push(currentSection);
      }
      
      // 创建新 section
      currentSection = {
        id: `sec-${sections.length + 1}`,
        title: headingMatch[2],
        level: headingMatch[1].length,
        content: ''
      };
      currentContent = [];
    } else if (currentSection) {
      currentContent.push(line);
    }
  }
  
  // 保存最后一个 section
  if (currentSection) {
    currentSection.content = currentContent.join('\n').trim();
    sections.push(currentSection);
  }
  
  return sections;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ category: string; id: string }> }
) {
  try {
    const { category, id } = await params;
    const decodedCategory = decodeURIComponent(category);
    const decodedId = decodeURIComponent(id);
    
    const article = loadArticle(decodedCategory, decodedId);
    
    if (!article) {
      return NextResponse.json({
        success: false,
        error: 'Article not found'
      }, { status: 404 });
    }
    
    // 查找相关文章
    const relatedArticles: string[] = [];
    
    if (article.category) {
      const categoryDir = path.join(DATA_DIR, article.category);
      if (fs.existsSync(categoryDir)) {
        const files = fs.readdirSync(categoryDir);
        for (const file of files) {
          if (!file.endsWith('.json') || file === `${id}.json`) continue;
          
          const filePath = path.join(categoryDir, file);
          const content = fs.readFileSync(filePath, 'utf-8');
          const data = JSON.parse(content);
          
          const commonTags = (article.tags || []).filter((t: string) => 
            data.tags?.includes(t)
          );
          
          if (commonTags.length > 0) {
            relatedArticles.push(data.id);
          }
        }
      }
    }
    
    return NextResponse.json({
      success: true,
      data: {
        ...article,
        relatedArticles: relatedArticles.slice(0, 5)
      }
    });
  } catch (error) {
    console.error('Error loading article:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to load article'
    }, { status: 500 });
  }
}
