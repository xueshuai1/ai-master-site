import fs from 'fs';
import path from 'path';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { MDXRemote } from 'next-mdx-remote/rsc';
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
  const filePath = path.join(KNOWLEDGE_BASE_DIR, category, `${articleId}.md`);
  
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
    .filter(file => file.endsWith('.md'))
    .sort();
  
  return files.map(file => {
    const id = file.replace('.md', '');
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
  const renderStructuredContent = () => {
    // 如果有 sections，使用结构化渲染
    if (article.sections && article.sections.length > 0) {
      return (
        <div className="space-y-8">
          {article.abstract && (
            <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-r-lg">
              <h3 className="text-lg font-semibold text-blue-900 mb-3">📖 摘要</h3>
              <p className="text-blue-800">{article.abstract}</p>
            </div>
          )}

          {article.sections.map((section) => (
            <div key={section.id} className="scroll-mt-24" id={section.id}>
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                  {section.title}
                </h2>
                <div className="prose prose-lg max-w-none">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    rehypePlugins={[rehypeHighlight]}
                    components={{
                      code({ node, inline, className, children, ...props }: any) {
                        const match = /language-(\w+)/.exec(className || '');
                        return !inline && match ? (
                          <pre className="bg-gray-50 rounded-lg p-4 overflow-x-auto my-4">
                            <code className={className} {...props}>
                              {children}
                            </code>
                          </pre>
                        ) : (
                          <code className="bg-gray-100 rounded px-1.5 py-0.5 text-sm" {...props}>
                            {children}
                          </code>
                        );
                      }
                    }}
                  >
                    {section.content}
                  </ReactMarkdown>
                </div>
              </div>

              {section.subsections && section.subsections.length > 0 && (
                <div className="ml-6 space-y-6">
                  {section.subsections.map((subsec) => (
                    <div key={subsec.id} className="bg-gray-50 rounded-xl p-6">
                      <h3 className="text-xl font-semibold text-gray-800 mb-3">
                        {subsec.title}
                      </h3>
                      <div className="prose">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {subsec.content}
                        </ReactMarkdown>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}

          {article.keyTakeaways && article.keyTakeaways.length > 0 && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-green-900 mb-4 flex items-center gap-2">
                <span>✅</span>
                关键要点
              </h3>
              <ul className="space-y-2">
                {article.keyTakeaways.map((point, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <span className="text-green-600 font-bold mt-1">•</span>
                    <span className="text-green-800">{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {article.prerequisites && article.prerequisites.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-amber-900 mb-4 flex items-center gap-2">
                <span>📚</span>
                前置知识
              </h3>
              <ul className="space-y-2">
                {article.prerequisites.map((prereq, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <span className="text-amber-600 font-bold mt-1">•</span>
                    <span className="text-amber-800">{prereq}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {article.codeExamples && article.codeExamples.length > 0 && (
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <span>💻</span>
                代码示例
              </h3>
              {article.codeExamples.map((example) => (
                <div key={example.id} className="bg-gray-900 rounded-xl overflow-hidden">
                  <div className="bg-gray-800 px-4 py-3 flex items-center justify-between">
                    <h4 className="text-white font-medium">{example.title}</h4>
                    {example.language && (
                      <span className="px-2 py-1 bg-gray-700 text-gray-300 text-xs rounded font-mono">
                        {example.language}
                      </span>
                    )}
                  </div>
                  <pre className="p-4 overflow-x-auto text-sm">
                    <code className="text-gray-100">{example.code}</code>
                  </pre>
                  {example.explanation && (
                    <div className="bg-gray-800 px-4 py-3">
                      <p className="text-gray-300 text-sm">
                        <ReactMarkdown>{example.explanation}</ReactMarkdown>
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {article.diagrams && article.diagrams.length > 0 && (
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <span>📊</span>
                图表
              </h3>
              {article.diagrams.map((diagram) => (
                <div key={diagram.id} className="bg-white border border-gray-200 rounded-xl p-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">{diagram.title}</h4>
                  <p className="text-gray-600 text-sm mb-4">{diagram.description}</p>
                  <div className="bg-gray-50 rounded-lg p-4 font-mono text-sm overflow-x-auto">
                    <pre className="text-gray-800">{diagram.content}</pre>
                  </div>
                </div>
              ))}
            </div>
          )}

          {article.references && article.references.length > 0 && (
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <span>🔗</span>
                参考资料
              </h3>
              <ul className="space-y-2">
                {article.references.map((ref, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <span className="text-gray-400 font-bold mt-1">{index + 1}.</span>
                    <div>
                      <a
                        href={ref.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline font-medium"
                      >
                        {ref.title}
                      </a>
                      {ref.type && (
                        <span className="ml-2 px-2 py-0.5 bg-gray-200 text-gray-600 text-xs rounded">
                          {ref.type}
                        </span>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      );
    }

    // 统一使用 MDX 渲染
    return (
      <div className="prose prose-lg max-w-none">
        <MDXRemote
          source={article.content}
          components={components}
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
      {renderStructuredContent()}

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
