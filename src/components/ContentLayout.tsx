"use client";

import { ReactNode } from "react";
import TableOfContents from "./TableOfContents";

interface ContentLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
  category?: string;
  tags?: string[];
  showTOC?: boolean;
  showSidebar?: boolean;
  sidebarContent?: ReactNode;
  breadcrumbs?: Array<{ label: string; href?: string }>;
}

export default function ContentLayout({
  children,
  title,
  subtitle,
  category,
  tags = [],
  showTOC = true,
  showSidebar = false,
  sidebarContent,
  breadcrumbs = [],
}: ContentLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
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

      {/* Breadcrumbs */}
      {breadcrumbs.length > 0 && (
        <nav className="bg-white border-b border-gray-200">
          <div className="px-4 lg:px-8 py-3">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              {breadcrumbs.map((crumb, index) => (
                <div key={index} className="flex items-center gap-2">
                  {index > 0 && <span className="text-gray-500">/</span>}
                  {crumb.href ? (
                    <a href={crumb.href} className="hover:text-blue-600 transition-colors">
                      {crumb.label}
                    </a>
                  ) : (
                    <span className="text-gray-900 font-medium">{crumb.label}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </nav>
      )}

      {/* Main Content */}
      <main className="px-4 lg:px-8 py-8">
        <div className="flex gap-6 lg:gap-8">
          {/* Left Sidebar - TOC */}
          {showTOC && (
            <aside className="hidden lg:block w-64 flex-shrink-0">
              <div className="sticky top-8">
                <TableOfContents />
              </div>
            </aside>
          )}

          {/* Main Content Area - 撑满剩余空间 */}
          <article className="flex-1 bg-white rounded-2xl border border-gray-200 p-6 lg:p-10 shadow-sm min-w-0">
            {/* Header - 只显示分类和标签，不显示标题（MDX 内容中已有） */}
            <header className="mb-6 pb-4 border-b border-gray-100 flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-2 flex-wrap">
                {category && (
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full font-medium">
                    {category.toUpperCase()}
                  </span>
                )}
                
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-3 py-1.5 bg-gray-100 text-gray-700 text-sm rounded-full font-medium"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </header>

            {/* Content - 撑满宽度（MDX 内容包含标题） */}
            <div className="prose prose-lg lg:prose-xl max-w-none prose-headings:font-semibold prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline prose-img:rounded-xl prose-code:text-sm prose-pre:bg-gray-50 prose-pre:border prose-pre:border-gray-200">
              {children}
            </div>
          </article>

          {/* Right Sidebar - Progress/Recommendations */}
          {showSidebar && sidebarContent && (
            <aside className="hidden xl:block w-64 flex-shrink-0">
              <div className="sticky top-8 space-y-4">
                {sidebarContent}
              </div>
            </aside>
          )}
        </div>

        {/* 移动端 TOC - 放在文章底部 */}
        {showTOC && (
          <div className="lg:hidden mt-8 pt-6 border-t border-gray-200">
            <TableOfContents />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="px-4 py-8 text-center text-gray-500 border-t border-gray-200 mt-8">
        <p className="text-sm">© 2026 AI 学习与面试大全 | Built with Next.js & Vercel</p>
      </footer>
    </div>
  );
}
