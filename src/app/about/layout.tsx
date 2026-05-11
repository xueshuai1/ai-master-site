import { Metadata } from 'next';
import { aboutSeoDescription, aboutSeoTitle } from '@/data/site-stats';

export const metadata: Metadata = {
  title: aboutSeoTitle,
  description: aboutSeoDescription,
  alternates: {
    canonical: 'https://www.ai-master.cc/about',
  },
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
