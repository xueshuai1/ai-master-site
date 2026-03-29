import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data', 'questions');
const QUESTIONS_DIR = path.join(process.cwd(), 'questions');

/**
 * 从 JSON 文件加载单道题目
 */
function loadQuestionFromJSON(id: string) {
  if (!fs.existsSync(DATA_DIR)) {
    return null;
  }
  
  const categories = fs.readdirSync(DATA_DIR);
  
  for (const category of categories) {
    const categoryDir = path.join(DATA_DIR, category);
    
    if (!fs.statSync(categoryDir).isDirectory()) continue;
    
    // 尝试直接匹配 ID
    const filePath = path.join(categoryDir, `${id}.json`);
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(content);
    }
    
    // 遍历所有文件查找
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
  
  return null;
}

/**
 * 从 MD 文件加载单道题目（向后兼容）
 */
function loadQuestionFromMarkdown(id: string) {
  if (!fs.existsSync(QUESTIONS_DIR)) {
    return null;
  }
  
  const categories = fs.readdirSync(QUESTIONS_DIR);
  
  for (const category of categories) {
    const categoryDir = path.join(QUESTIONS_DIR, category);
    
    if (!fs.statSync(categoryDir).isDirectory()) continue;
    
    const filePath = path.join(categoryDir, `${id}.md`);
    if (fs.existsSync(filePath)) {
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
      
      // 提取正文内容
      const body = content.replace(/^---\n[\s\S]*?\n---\n/, '');
      
      return {
        id,
        title: frontmatter.title || id,
        category: frontmatter.category || category,
        difficulty: frontmatter.difficulty || '⭐⭐',
        tags: Array.isArray(frontmatter.tags) ? frontmatter.tags : [],
        source: frontmatter.source || '',
        sourceUrl: frontmatter.sourceUrl || '',
        collectedAt: frontmatter.collectedAt || '',
        content: body
      };
    }
  }
  
  return null;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const decodedId = decodeURIComponent(id);
    
    // 优先从 JSON 加载
    let question = loadQuestionFromJSON(decodedId);
    
    // 回退到 MD
    if (!question) {
      question = loadQuestionFromMarkdown(decodedId);
    }
    
    if (!question) {
      return NextResponse.json({
        success: false,
        error: 'Question not found'
      }, { status: 404 });
    }
    
    // 查找相关问题（同分类或同标签）
    const relatedQuestions: string[] = [];
    
    if (question.category) {
      const categoryDir = path.join(DATA_DIR, question.category);
      if (fs.existsSync(categoryDir)) {
        const files = fs.readdirSync(categoryDir);
        for (const file of files) {
          if (!file.endsWith('.json') || file === `${id}.json`) continue;
          
          const filePath = path.join(categoryDir, file);
          const content = fs.readFileSync(filePath, 'utf-8');
          const data = JSON.parse(content);
          
          // 检查是否有共同标签
          const commonTags = (question.tags || []).filter((t: string) => 
            data.tags?.includes(t)
          );
          
          if (commonTags.length > 0) {
            relatedQuestions.push(data.id);
          }
        }
      }
    }
    
    return NextResponse.json({
      success: true,
      data: {
        ...question,
        relatedQuestions: relatedQuestions.slice(0, 5)
      }
    });
  } catch (error) {
    console.error('Error loading question:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to load question'
    }, { status: 500 });
  }
}
