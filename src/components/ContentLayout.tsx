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
  showSidebar = true,
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
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              {breadcrumbs.map((crumb, index) => (
                <div key={index} className="flex items-center gap-2">
                  {index > 0 && <span className="text-gray-400">/</span>}
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
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Sidebar - TOC */}
          {showTOC && (
            <div className="lg:col-span-2 hidden lg:block">
              <TableOfContents />
            </div>
          )}

          {/* Main Content Area */}
          <div className={`lg:col-span-${showTOC && showSidebar ? "8" : showTOC ? "10" : showSidebar ? "10" : "12"}`}>
            <article className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
              {/* Header */}
              <header className="mb-8 pb-6 border-b border-gray-100">
                {category && (
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full font-medium">
                    {category.toUpperCase()}
                  </span>
                )}
                
                <h1 className="text-3xl font-bold text-gray-900 mt-4 mb-3">
                  {title}
                </h1>
                
                {subtitle && (
                  <p className="text-lg text-gray-600 mb-4">
                    {subtitle}
                  </p>
                )}
                
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-2.5 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </header>

              {/* Content */}
              <div className="prose prose-lg max-w-none prose-headings:font-semibold prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline">
                {children}
              </div>
            </article>
          </div>

          {/* Right Sidebar - Progress/Recommendations */}
          {showSidebar && sidebarContent && (
            <div className="lg:col-span-2 hidden lg:block">
              {sidebarContent}
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 text-center text-gray-500 border-t border-gray-200 mt-8">
        <p className="text-sm">© 2026 AI 学习与面试大全 | Built with Next.js & Vercel</p>
      </footer>
    </div>
  );
}
