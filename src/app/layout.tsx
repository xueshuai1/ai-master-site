import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";
import BackToTop from "@/components/BackToTop";
import { articles } from "@/data/knowledge";
import { blogs } from "@/data/blogs";
import { tools } from "@/data/tools";
import { news } from "@/data/news";

const inter = Inter({ subsets: ["latin"] });

// ─── 构建时动态统计（每次构建自动反映最新数据） ───
const articleCount = articles.length;
const blogCount = blogs.length;
const toolCount = tools.length;
const newsCount = news.length;

const seoDescription = `AI Master 是专业的人工智能学习与实践平台。提供 ${articleCount}+ 篇 AI 知识库文章、${blogCount}+ 篇深度技术博客、${toolCount}+ AI 工具推荐、${newsCount}+ 条 AI 前沿动态。从入门到精通，探索大语言模型、AI Agent、RAG、机器学习等热门技术。`;
const shortSeoDescription = `专业的人工智能学习与实践平台。${articleCount}+ 知识库文章，${blogCount}+ 深度博客，${toolCount}+ AI 工具推荐，每日 AI 前沿动态。`;

export const metadata: Metadata = {
  title: {
    default: "AI Master - 精通人工智能 | AI学习平台",
    template: "%s | AI Master",
  },
  description: seoDescription,
  keywords: ["AI", "人工智能", "机器学习", "深度学习", "大语言模型", "LLM", "AI Agent", "RAG", "Transformer", "GPT", "Claude", "AI教程", "AI工具", "AI新闻", "神经网络", "自然语言处理", "计算机视觉"],
  authors: [{ name: "AI Master", url: "https://www.ai-master.cc" }],
  creator: "AI Master",
  publisher: "AI Master",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "https://www.ai-master.cc",
  },
  verification: {
    google: "替换为你的 Google Search Console 验证代码",
  },
  openGraph: {
    type: "website",
    locale: "zh_CN",
    url: "https://www.ai-master.cc",
    siteName: "AI Master",
    title: "AI Master - 精通人工智能",
    description: shortSeoDescription,
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Master - 精通人工智能",
    description: shortSeoDescription,
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-64.png", sizes: "64x64", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180" },
    ],
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  colorScheme: "dark",
  themeColor: "#0f172a",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className={inter.className}>
        {children}
        <BackToTop />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
