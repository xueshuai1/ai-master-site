import fs from 'fs';
import path from 'path';
import Link from 'next/link';
import { notFound } from 'next/navigation';

// Lucide 风格 SVG 图标组件
function BookIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </svg>
  );
}

function CpuIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="4" width="16" height="16" rx="2" />
      <rect x="9" y="9" width="6" height="6" />
      <path d="M15 2v2" /><path d="M15 20v2" /><path d="M2 15h2" /><path d="M2 9h2" /><path d="M20 15h2" /><path d="M20 9h2" /><path d="M9 2v2" /><path d="M9 20v2" />
    </svg>
  );
}

function BrainIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z" />
      <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z" />
    </svg>
  );
}

function LayersIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z" />
      <path d="m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65" />
      <path d="m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65" />
    </svg>
  );
}

function CodeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
    </svg>
  );
}

function UsersIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function ZapIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  );
}

function ArrowLeftIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 12H5" />
      <path d="m12 19-7-7 7-7" />
    </svg>
  );
}

// 分类数据
const CATEGORIES: Record<string, { name: string; description: string; icon: React.ComponentType<{ className?: string }>; iconChar: string }> = {
  ML: { name: "机器学习基础", description: "监督学习、无监督学习、模型评估", icon: CpuIcon, iconChar: "📊" },
  DL: { name: "深度学习", description: "神经网络、CNN、RNN、Transformer", icon: BrainIcon, iconChar: "🧠" },
  NLP: { name: "自然语言处理", description: "词向量、语言模型、文本生成", icon: BookIcon, iconChar: "📝" },
  CV: { name: "计算机视觉", description: "图像分类、目标检测、分割", icon: LayersIcon, iconChar: "👁️" },
  LLM: { name: "大语言模型", description: "Prompt、RAG、Fine-tuning、Agent", icon: ZapIcon, iconChar: "🤖" },
  RecSys: { name: "推荐系统", description: "召回排序、协同过滤、深度学习", icon: UsersIcon, iconChar: "🎯" },
  RL: { name: "强化学习", description: "MDP、Q-Learning、Policy Gradient", icon: CodeIcon, iconChar: "🎮" },
  System: { name: "AI 工程化", description: "模型部署、MLOps、系统设计", icon: LayersIcon, iconChar: "⚙️" },
};

interface Article {
  id: string;
  title: string;
  summary: string;
  keyPoints: string[];
  estimatedTime: string;
}

const KNOWLEDGE_BASE_DIR = path.join(process.cwd(), 'content', 'knowledge');

// ISR 增量更新：每小时重新生成一次
export const revalidate = 3600;

// 解析 Markdown 文件
function parseMarkdown(content: string) {
  const frontmatter: Record<string, any> = {};
  
  // 尝试行内格式
  const lines = content.split('\n');
  const secondLine = lines[1] || '';
  
  if (secondLine.startsWith('>')) {
    const categoryMatch = secondLine.match(/\*\*分类\*\*:\s*([^|]+)/);
    const numberMatch = secondLine.match(/\*\*编号\*\*:\s*([^|]+)/);
    const updateMatch = secondLine.match(/\*\*更新时间\*\*:\s*([^|]+)/);
    const difficultyMatch = secondLine.match(/\*\*难度\*\*:\s*(⭐+)/);
    
    if (categoryMatch) frontmatter.category = categoryMatch[1].trim();
    if (numberMatch) frontmatter.number = numberMatch[1].trim();
    if (updateMatch) frontmatter.updateTime = updateMatch[1].trim();
    if (difficultyMatch) frontmatter.difficulty = difficultyMatch[1].trim();
  }
  
  // 解析标签
  const tagsLine = lines[4] || '';
  if (tagsLine.startsWith('`')) {
    const tagMatches = tagsLine.match(/`([^`]+)`/g);
    if (tagMatches) {
      frontmatter.tags = tagMatches.map(tag => tag.replace(/`/g, '').trim());
    }
  }
  
  return { frontmatter };
}

// 获取分类下的所有文章
function getArticlesByCategory(category: string): Article[] {
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
    
    let summary = '';
    const summaryMatch = content.match(/^>\s*\*\*分类\*\*.*\n\n(.+?)(?:\n|$)/);
    if (summaryMatch) {
      summary = summaryMatch[1].trim();
    } else {
      summary = content.slice(0, 100).replace(/[#*`\n]/g, '').trim() + '...';
    }
    
    const keyPoints = frontmatter.tags || [];
    const wordCount = content.length / 3;
    const estimatedTime = `${Math.ceil(wordCount / 300)}分钟`;
    
    return {
      id,
      title,
      summary,
      keyPoints,
      estimatedTime,
    };
  });
}

interface CategoryPageProps {
  params: Promise<{ category: string }>;
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { category } = await params;
  const decodedCategory = decodeURIComponent(category);
  const categoryData = CATEGORIES[decodedCategory];
  
  if (!categoryData) {
    notFound();
  }
  
  const articles = getArticlesByCategory(decodedCategory);
  const Icon = categoryData.icon;

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Google Fonts */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&family=Open+Sans:wght@300;400;500;600;700&display=swap');
        
        * {
          font-family: 'Open Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }
        
        h1, h2, h3, h4, h5, h6 {
          font-family: 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }
      `}</style>

      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-6">
          <Link href="/knowledge" className="text-gray-600 hover:text-gray-900 transition-colors inline-flex items-center gap-2 mb-4">
            <ArrowLeftIcon className="w-5 h-5" />
            返回知识库
          </Link>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gray-100 rounded-xl flex items-center justify-center text-3xl">
              {categoryData.iconChar}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{categoryData.name}</h1>
              <p className="text-gray-600 mt-1">{categoryData.description}（共 {articles.length} 篇文章）</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        {articles.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center text-5xl">
              📚
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">暂无文章</h2>
            <p className="text-gray-600 mb-6">该分类下还没有文章，敬请期待！</p>
            <Link
              href="/knowledge"
              className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all inline-flex items-center gap-2"
            >
              <BookIcon className="w-5 h-5" />
              返回知识库
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((article) => (
              <Link
                key={article.id}
                href={`/knowledge/${decodedCategory}/${article.id}`}
                className="group block p-6 bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-200 hover:border-blue-300"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Icon className="w-5 h-5 text-blue-600" />
                    <span className="text-sm font-medium text-blue-600">{decodedCategory}</span>
                  </div>
                  {article.keyPoints.length > 0 && (
                    <span className="text-sm text-gray-500">
                      {article.keyPoints[0]}
                    </span>
                  )}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
                  {article.title}
                </h3>
                <p className="text-gray-600 mb-4 line-clamp-2 leading-relaxed">
                  {article.summary}
                </p>
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    📝 {article.keyPoints.slice(0, 2).join(' · ')}
                  </span>
                  <span>⏱️ {article.estimatedTime}</span>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Bottom Navigation */}
        <div className="flex gap-4 mt-12 pt-6 border-t border-gray-200">
          <Link
            href={`/knowledge/${decodedCategory}`}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all"
          >
            刷新当前分类
          </Link>
          <Link
            href="/knowledge"
            className="px-6 py-3 bg-white text-blue-600 border border-blue-600 rounded-xl hover:bg-blue-50 transition-all"
          >
            返回知识库
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 text-center text-gray-500 border-t border-gray-200 mt-12">
        <p className="text-sm">© 2026 AI 学习与面试大全 | Built with Next.js & Vercel</p>
      </footer>
    </div>
  );
}
