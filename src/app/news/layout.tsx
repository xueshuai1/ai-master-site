import { Metadata } from 'next';
import { newsSeoDescription, newsSeoTitle } from '@/data/site-stats';

export const metadata: Metadata = {
  title: newsSeoTitle,
  description: newsSeoDescription,
  keywords: ['AI 新闻', 'AI 动态', 'AI 前沿', 'AI 资讯', '大语言模型新闻', 'AI 行业动态'],
  alternates: {
    canonical: 'https://www.ai-master.cc/news',
  },
};

export default function NewsListLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
