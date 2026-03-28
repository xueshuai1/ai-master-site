import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI 面试题大全 - 专注 AI 领域的面试题库",
  description: "全面覆盖机器学习、深度学习、NLP、计算机视觉、大模型等 AI 领域面试题，助你拿到理想 Offer",
  keywords: ["AI 面试", "机器学习", "深度学习", "NLP", "计算机视觉", "大模型", "LLM", "面试题", "刷题"],
  authors: [{ name: "AI Interview Prep" }],
  openGraph: {
    title: "AI 面试题大全",
    description: "专注 AI 领域的面试题库，助你拿到理想 Offer",
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
