import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI 学习与面试大全 - 专注 AI 领域的知识库",
  description: "全面覆盖机器学习、深度学习、NLP、计算机视觉、大模型等 AI 领域知识，提供系统化学习路径和面试准备",
  keywords: ["AI 学习", "AI 面试", "机器学习", "深度学习", "NLP", "计算机视觉", "大模型", "LLM", "知识库", "学习路径"],
  authors: [{ name: "AI Learning & Interview" }],
  openGraph: {
    title: "AI 学习与面试大全",
    description: "AI 知识库 · 系统化学习 · 面试准备 · 持续更新",
    type: "website",
    locale: "zh_CN",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className="h-full antialiased">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="min-h-full flex flex-col font-body">{children}</body>
    </html>
  );
}
