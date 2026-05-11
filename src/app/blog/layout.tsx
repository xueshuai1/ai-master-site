import { Metadata } from 'next';
import { blogSeoDescription, blogSeoTitle } from '@/data/site-stats';

export const metadata: Metadata = {
  title: blogSeoTitle,
  description: blogSeoDescription,
  keywords: ['AI 博客', 'AI 技术博客', 'AI 前沿', 'AI 论文解读', 'AI 趋势', '大语言模型', 'AI Agent'],
  alternates: {
    canonical: 'https://www.ai-master.cc/blog',
  },
};

export default function BlogListLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
