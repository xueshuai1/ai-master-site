import { Metadata } from 'next';
import { knowledgeSeoDescription, knowledgeSeoTitle } from '@/data/site-stats';

export const metadata: Metadata = {
  title: knowledgeSeoTitle,
  description: knowledgeSeoDescription,
  keywords: ['AI 知识库', '机器学习教程', '深度学习', '大语言模型', 'AI Agent', 'RAG', 'Transformer', '强化学习', '计算机视觉', '自然语言处理'],
  alternates: {
    canonical: 'https://www.ai-master.cc/knowledge',
  },
};

export default function KnowledgeLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
