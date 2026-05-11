import { Metadata } from 'next';
import { toolsSeoDescription, toolsSeoTitle } from '@/data/site-stats';

export const metadata: Metadata = {
  title: toolsSeoTitle,
  description: toolsSeoDescription,
  keywords: ['AI 工具', 'AI 工具推荐', '大语言模型工具', 'AI Agent 框架', 'AI 开发工具', 'AI 评测'],
  alternates: {
    canonical: 'https://www.ai-master.cc/tools',
  },
};

export default function ToolsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
