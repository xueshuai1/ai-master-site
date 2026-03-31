import fs from 'fs';
import path from 'path';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { MDXRemote } from 'next-mdx-remote/rsc';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeHighlight from 'rehype-highlight';
import rehypeKatex from 'rehype-katex';
import 'highlight.js/styles/github.css';
import 'katex/dist/katex.min.css';
import ContentLayout from '@/components/ContentLayout';
import ArticleNav from '@/components/ArticleNav';
import ProgressPanel from '@/components/ProgressPanel';
import components from '@/lib/mdx-components';

// 客户端组件：处理学习进度
import LearningProgress from './LearningProgress';

const KNOWLEDGE_BASE_DIR = path.join(process.cwd(), 'content', 'knowledge');

// ISR 增量更新：每小时重新生成一次
export const revalidate = 3600;

interface Article {
  id: string;
  title: string;
  category: string;
  summary: string;
  keyPoints: string[];
  estimatedTime: string;
  content: string;
  abstract?: string;
  sections?: Array<{
    id: string;
    title: string;
    level: number;
    content: string;
    subsections?: Array<{
      id: string;
      title: string;
      level: number;
      content: string;
    }>;
  }>;
  keyTakeaways?: string[];
  prerequisites?: string[];
  codeExamples?: Array<{
    id: string;
    title: string;
    language: string;
    code: string;
    explanation?: string;
  }>;
  diagrams?: Array<{
    id: string;
    title: string;
    description: string;
    type: string;
    content: string;
  }>;
  references?: Array<{
    title: string;
    url: string;
    type: string;
  }>;
}

interface AdjacentArticles {
  prev: { id: string; title: string; summary: string; keyPoints: string[]; estimatedTime: string } | null;
  next: { id: string; title: string; summary: string; keyPoints: string[]; estimatedTime: string } | null;
}

interface ArticlePageProps {
  params: Promise<{ category: string; articleId: string }>;
}

// 解析 Markdown 文件的 frontmatter 和内容
function parseMarkdown(content: string) {
  const frontmatter: Record<string, any> = {};
  
  // 尝试 YAML frontmatter
  const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
  if (frontmatterMatch) {
    const lines = frontmatterMatch[1].split('\n');
    for (const line of lines) {
      const [key, ...valueParts] = line.split(':');
      if (key && valueParts.length > 0) {
        let value = valueParts.join(':').trim();
        if (typeof value === 'string') {
          if (value.startsWith('[') && value.endsWith(']')) {
            value = value.slice(1, -1).split(',').map((v: string) => v.trim().replace(/"/g, ''));
            frontmatter[key.trim()] = value;
          } else if (value.startsWith('"') && value.endsWith('"')) {
            value = value.slice(1, -1);
            frontmatter[key.trim()] = value;
          } else {
            frontmatter[key.trim()] = value;
          }
        }
      }
    }
  } else {
    // 尝试行内格式
    const lines = content.split('\n');
    const secondLine = lines[1] || '';
    if (secondLine.startsWith('>')) {
      const inlineMatch = secondLine.match(/\*\*([^*]+)\*\*:\s*([^|]+)/g);
      if (inlineMatch) {
        for (const item of inlineMatch) {
          const parts = item.split(':');
          const key = parts[0]?.trim().replace(/\*\*/g, '').toLowerCase();
          const value = parts.slice(1).join(':').trim().replace(/\*\*/g, '');
          if (key && value) {
            frontmatter[key] = value;
          }
        }
      }
    }
  }
  
  // 移除 frontmatter 获取正文
  const body = frontmatterMatch 
    ? content.replace(/^---\n[\s\S]*?\n---\n?/, '')
    : content.replace(/^#\s*[^\n]+\n[^\n]+\n/, '');
  
  return { frontmatter, body };
}

// 加载单篇文章
function loadArticle(category: string, articleId: string): Article | null {
  const filePath = path.join(KNOWLEDGE_BASE_DIR, category, `${articleId}.mdx`);
  
  if (!fs.existsSync(filePath)) {
    return null;
  }
  
  const content = fs.readFileSync(filePath, 'utf-8');
  const { frontmatter, body } = parseMarkdown(content);
  
  // 解析标题
  const titleMatch = content.match(/^#\s+(.+)/);
  const title = frontmatter.title || (titleMatch ? titleMatch[1].trim() : articleId.replace(/[-_]/g, ' '));
  
  // 解析摘要
  let summary = frontmatter.summary || '';
  if (!summary) {
    const summaryMatch = content.match(/^>\s*\*\*分类\*\*.*\n\n(.+?)(?:\n|$)/);
    summary = summaryMatch ? summaryMatch[1].trim() : content.slice(0, 200).replace(/[#*`\n]/g, '').trim() + '...';
  }
  
  // 解析关键要点
  let keyPoints: string[] = [];
  if (frontmatter.keyPoints) {
    keyPoints = Array.isArray(frontmatter.keyPoints) ? frontmatter.keyPoints : [frontmatter.keyPoints];
  }
  if (frontmatter.tags) {
    keyPoints = Array.isArray(frontmatter.tags) ? frontmatter.tags : [frontmatter.tags];
  }
  
  // 估算阅读时间
  const wordCount = content.length / 3;
  const estimatedTime = `${Math.ceil(wordCount / 300)}分钟`;
  
  return {
    id: articleId,
    title,
    category,
    summary,
    keyPoints,
    estimatedTime,
    content: body,
    abstract: frontmatter.abstract,
    keyTakeaways: frontmatter.keyTakeaways,
    prerequisites: frontmatter.prerequisites,
  };
}

// 获取分类下的所有文章
function getArticlesByCategory(category: string): Array<{ id: string; title: string; summary: string; keyPoints: string[]; estimatedTime: string }> {
  const categoryDir = path.join(KNOWLEDGE_BASE_DIR, category);
  
  if (!fs.existsSync(categoryDir)) {
    return [];
  }
  
  const files = fs.readdirSync(categoryDir)
    .filter(file => file.endsWith('.mdx'))
    .sort();
  
  return files.map(file => {
    const id = file.replace('.mdx', '');
    const filePath = path.join(categoryDir, file);
    const content = fs.readFileSync(filePath, 'utf-8');
    const { frontmatter } = parseMarkdown(content);
    
    const titleMatch = content.match(/^#\s+(.+)/);
    const title = frontmatter.title || (titleMatch ? titleMatch[1].trim() : id);
    
    let summary = frontmatter.summary || '';
    if (!summary) {
      const summaryMatch = content.match(/^>\s*\*\*分类\*\*.*\n\n(.+?)(?:\n|$)/);
      summary = summaryMatch ? summaryMatch[1].trim() : content.slice(0, 100).replace(/[#*`\n]/g, '').trim() + '...';
    }
    
    let keyPoints: string[] = [];
    if (frontmatter.keyPoints) {
      keyPoints = Array.isArray(frontmatter.keyPoints) ? frontmatter.keyPoints : [frontmatter.keyPoints];
    }
    if (frontmatter.tags) {
      keyPoints = Array.isArray(frontmatter.tags) ? frontmatter.tags : [frontmatter.tags];
    }
    
    const wordCount = content.length / 3;
    const estimatedTime = `${Math.ceil(wordCount / 300)}分钟`;
    
    return { id, title, summary, keyPoints, estimatedTime };
  });
}

// 生成所有静态路径
export async function generateStaticParams() {
  const params: Array<{ category: string; articleId: string }> = [];
  
  if (!fs.existsSync(KNOWLEDGE_BASE_DIR)) {
    return [];
  }
  
  const categories = fs.readdirSync(KNOWLEDGE_BASE_DIR)
    .filter(item => fs.statSync(path.join(KNOWLEDGE_BASE_DIR, item)).isDirectory());
  
  for (const category of categories) {
    const articles = getArticlesByCategory(category);
    for (const article of articles) {
      params.push({
        category,
        articleId: article.id,
      });
    }
  }
  
  return params;
}

// 服务器组件：文章详情
async function ArticleContent({ params }: ArticlePageProps) {
  const { category, articleId } = await params;
  const decodedCategory = decodeURIComponent(category);
  const decodedArticleId = decodeURIComponent(articleId);  // ✅ 添加 URL 解码
  
  const article = loadArticle(decodedCategory, decodedArticleId);
  
  if (!article) {
    notFound();
  }
  
  // 获取相邻文章
  const articles = getArticlesByCategory(decodedCategory);
  const currentIndex = articles.findIndex(a => a.id === decodedArticleId);
  const adjacentArticles: AdjacentArticles = {
    prev: currentIndex > 0 ? articles[currentIndex - 1] : null,
    next: currentIndex < articles.length - 1 ? articles[currentIndex + 1] : null,
  };

  // 渲染结构化内容

  // 使用 MDXRemote 渲染（支持 MDX 组件和数学公式）
  const renderContent = () => {
    return (
      <div className="prose prose-lg max-w-none">
        <MDXRemote
          source={article.content}
          components={components}
          options={{
            mdxOptions: {
              remarkPlugins: [remarkGfm, remarkMath],
              rehypePlugins: [rehypeHighlight, rehypeKatex],
            },
          }}
        />
      </div>
    );
  };

  const sidebarContent = (
    <LearningProgress category={decodedCategory} articleId={articleId} />
  );

  return (
    <ContentLayout
      title={article.title}
      subtitle={article.summary}
      category={decodedCategory}
      tags={article.keyPoints || []}
      breadcrumbs={[
        { label: "首页", href: "/" },
        { label: "知识库", href: "/knowledge" },
        { label: decodedCategory.toUpperCase(), href: `/knowledge/${decodedCategory}` },
        { label: "文章详情" },
      ]}
      sidebarContent={sidebarContent}
    >
      {renderContent()}

      <ArticleNav 
        category={decodedCategory} 
        articleId={articleId}
        prev={adjacentArticles.prev}
        next={adjacentArticles.next}
      />

      <div className="flex gap-4 mt-8 pt-6 border-t border-gray-200">
        <Link
          href={`/knowledge/${decodedCategory}`}
          className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all font-medium"
        >
          浏览该分类其他文章
        </Link>
        <Link
          href="/knowledge"
          className="px-6 py-3 bg-white text-blue-600 border border-blue-600 rounded-xl hover:bg-blue-50 transition-all font-medium"
        >
          返回知识库
        </Link>
        <Link
          href="/learning-progress"
          className="px-6 py-3 bg-white text-blue-600 border border-blue-600 rounded-xl hover:bg-blue-50 transition-all font-medium"
        >
          查看学习进度
        </Link>
      </div>
    </ContentLayout>
  );
}

export default ArticleContent;
