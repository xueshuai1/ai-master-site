"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";

// Extract TOC items from markdown content
function extractToc(content: string) {
  const headingRegex = /^(#{2,3})\s+(.+)$/gm;
  const toc: { level: number; text: string; id: string }[] = [];
  let match;
  while ((match = headingRegex.exec(content)) !== null) {
    const level = match[1].length;
    const text = match[2].trim();
    // Generate the same ID that ReactMarkdown generates
    const id = text
      .toLowerCase()
      .replace(/[\s]+/g, '-')
      .replace(/[^\w\-]/g, '');
    if (id) {
      toc.push({ level, text, id });
    }
  }
  return toc;
}

interface BlogPost {
  id: string;
  title: string;
  summary: string;
  content: string;
  author: string;
  date: string;
  readTime: number;
  tags: string[];
}

export default function BlogDetailContent({
  post,
  relatedPosts,
}: {
  post: BlogPost;
  relatedPosts: BlogPost[];
}) {
  // Reading progress
  const [scrollProgress, setScrollProgress] = useState(0);
  const [activeToc, setActiveToc] = useState("");

  useEffect(() => {
    const handleScroll = () => {
      const article = document.querySelector("article");
      if (!article) return;
      const rect = article.getBoundingClientRect();
      const articleTop = rect.top + window.scrollY;
      const articleHeight = rect.height;
      const scrollY = window.scrollY;
      const viewportHeight = window.innerHeight;
      const scrolled = Math.max(
        0,
        scrollY - articleTop + viewportHeight * 0.3
      );
      const progress = Math.min(
        100,
        Math.max(0, (scrolled / articleHeight) * 100)
      );
      setScrollProgress(progress);

      // Active TOC item - only highlight one
      const headings = article.querySelectorAll("h2, h3");
      let found = false;
      for (let i = headings.length - 1; i >= 0; i--) {
        const h = headings[i] as HTMLElement;
        const headingId = h.id || "";
        if (headingId && h.getBoundingClientRect().top <= 100) {
          setActiveToc(headingId);
          found = true;
          break;
        }
      }
      if (!found) setActiveToc("");
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toc = useMemo(() => extractToc(post.content), [post.content]);
  const showToc = toc.length > 2;

  const scrollToToc = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - 96;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  };



  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-brand-950 text-white">
      <Navbar activePath="/blog" />

      {/* Reading Progress Bar */}
      {scrollProgress > 0 && (
        <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-transparent">
          <div
            className="h-full bg-gradient-to-r from-brand-500 to-brand-300 transition-all duration-150"
            style={{ width: `${scrollProgress}%` }}
          />
        </div>
      )}

      {/* Article Header */}
      <section className="pt-28 pb-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-slate-500 mb-6">
            <Link href="/" className="hover:text-slate-300 transition-colors">
              首页
            </Link>
            <span>/</span>
            <Link
              href="/blog"
              className="hover:text-slate-300 transition-colors"
            >
              博客
            </Link>
            <span>/</span>
            <span className="text-slate-400 truncate">{post.title}</span>
          </div>

          {/* Category badge */}
          <div className="flex items-center gap-3 mb-4 flex-wrap justify-center">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-brand-500/10 text-brand-300 rounded-full text-sm font-medium">
              {post.tags[0] || "行业洞察"}
            </span>
          </div>

          {/* Title */}
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6 leading-tight text-center">
            {post.title}
          </h1>

          {/* Meta info */}
          <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-slate-400 mb-8 pb-8 border-b border-white/5">
            <span>✍️ {post.author}</span>
            <span>📅 {post.date}</span>
            <span>📖 {post.readTime} min 阅读</span>
          </div>
        </div>
      </section>

      {/* Article Content */}
      <section className="px-4 sm:px-6 lg:px-8 pb-16">
        <div className="max-w-6xl mx-auto">
          {/* Summary block */}
          <div className="p-6 rounded-2xl bg-brand-500/5 border border-brand-500/20 mb-12">
            <div className="flex items-start gap-3">
              <span className="text-2xl">💡</span>
              <div>
                <h3 className="font-semibold text-brand-300 mb-2">
                  文章摘要
                </h3>
                <p className="text-slate-300 leading-relaxed">
                  {post.summary}
                </p>
              </div>
            </div>
          </div>

          <div className="flex gap-8">
            {/* Main Content */}
            <div
              className={
                showToc ? "flex-1 min-w-0" : "max-w-4xl mx-auto w-full"
              }
            >
              {/* Markdown Content */}
              <article
                className="prose prose-lg prose-invert max-w-none
            prose-headings:font-bold prose-headings:text-white
            prose-h1:text-3xl prose-h1:mb-6 prose-h1:mt-10
            prose-h2:text-2xl prose-h2:mb-4 prose-h2:mt-10
            prose-h3:text-xl prose-h3:mb-3 prose-h3:mt-8
            prose-p:text-slate-300 prose-p:leading-relaxed prose-p:mb-4
            prose-strong:text-white prose-strong:font-semibold
            prose-a:text-brand-400 prose-a:no-underline hover:prose-a:text-brand-300
            prose-ul:text-slate-300 prose-ol:text-slate-300
            prose-li:marker:text-brand-400
            prose-blockquote:border-l-brand-500 prose-blockquote:text-slate-400 prose-blockquote:bg-white/5 prose-blockquote:px-4 prose-blockquote:py-2 prose-blockquote:rounded-r-lg
            prose-code:text-pink-300 prose-code:bg-white/10 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded
            prose-pre:bg-white/5 prose-pre:border prose-pre:border-white/10 prose-pre:rounded-xl
            prose-table:text-slate-300 prose-th:text-white prose-td:text-slate-300
            prose-hr:border-white/10
          "
              >
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    h2: ({ children, ...props }: any) => {
                      const id = props.id;
                      if (id) return <h2 id={id} {...props}>{children}</h2>;
                      const text = typeof children === 'string' ? children : '';
                      const headingId = text.toLowerCase().replace(/[\s]+/g, '-').replace(/[^\w\-]/g, '');
                      return headingId ? <h2 id={headingId} {...props}>{children}</h2> : <h2 {...props}>{children}</h2>;
                    },
                    h3: ({ children, ...props }: any) => {
                      const id = props.id;
                      if (id) return <h3 id={id} {...props}>{children}</h3>;
                      const text = typeof children === 'string' ? children : '';
                      const headingId = text.toLowerCase().replace(/[\s]+/g, '-').replace(/[^\w\-]/g, '');
                      return headingId ? <h3 id={headingId} {...props}>{children}</h3> : <h3 {...props}>{children}</h3>;
                    },
                    table: ({ children, ...props }: any) => (
                      <div className="overflow-x-auto my-6 rounded-xl border border-white/10">
                        <table className="w-full text-sm" {...props}>{children}</table>
                      </div>
                    ),
                    th: ({ children, ...props }: any) => (
                      <th className="px-4 py-3 text-left font-semibold text-brand-300 border-b border-white/10 whitespace-nowrap bg-white/5" {...props}>{children}</th>
                    ),
                    td: ({ children, ...props }: any) => (
                      <td className="px-4 py-3 text-slate-300 border-b border-white/5" {...props}>{children}</td>
                    ),
                  }}
                >{post.content}</ReactMarkdown>
              </article>

              {/* Tags */}
              <div className="mt-12 pt-8 border-t border-white/5">
                <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">
                  标签
                </h3>
                <div className="flex flex-wrap gap-2">
                  {post.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/5 rounded-full text-sm text-slate-300 transition-colors cursor-pointer"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* TOC Sidebar (PC only) */}
            {showToc && (
              <aside className="hidden lg:block w-64 shrink-0">
                <div className="sticky top-24">
                  <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">
                    📑 目录
                  </h3>
                  <nav className="space-y-1">
                    {toc.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => scrollToToc(item.id)}
                        className={`block w-full text-left py-1.5 text-sm transition-all rounded-md px-2 ${
                          activeToc === item.id
                            ? "text-brand-300 bg-brand-500/10 font-medium"
                            : "text-slate-500 hover:text-slate-300"
                        } ${item.level === 3 ? "pl-6" : "pl-2"}`}
                      >
                        {item.text}
                      </button>
                    ))}
                  </nav>
                </div>
              </aside>
            )}
          </div>
        </div>
      </section>

      {/* Related Posts */}
      {relatedPosts.length > 0 && (
        <section className="px-4 sm:px-6 lg:px-8 pb-20">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-2xl font-bold mb-8">📚 相关文章推荐</h2>
            <div className="grid sm:grid-cols-2 gap-5">
              {relatedPosts.map((rel) => (
                <Link
                  key={rel.id}
                  href={`/blog/${rel.id}`}
                  className="group p-5 rounded-2xl bg-white/5 border border-white/5 hover:border-brand-500/30 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-brand-500/5"
                >
                  <div className="text-2xl mb-2">📝</div>
                  <span className="inline-block px-2 py-0.5 bg-brand-500/10 text-brand-300 rounded-full text-xs font-medium mb-2">
                    {rel.tags[0]}
                  </span>
                  <h3 className="text-base font-semibold group-hover:text-brand-300 transition-colors leading-snug line-clamp-2 mb-2">
                    {rel.title}
                  </h3>
                  <p className="text-slate-400 text-sm line-clamp-2">
                    {rel.summary}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="px-4 sm:px-6 lg:px-8 pb-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center p-10 rounded-3xl bg-gradient-to-r from-brand-600/10 to-accent-600/10 border border-brand-500/20">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4">
              继续探索更多 AI 内容
            </h2>
            <p className="text-slate-400 mb-8 max-w-lg mx-auto">
              浏览更多博客文章，或者深入学习 AI 核心知识
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/blog"
                className="px-8 py-3 bg-brand-600 hover:bg-brand-500 rounded-xl font-semibold transition-all hover:shadow-lg hover:shadow-brand-500/25 hover:-translate-y-0.5"
              >
                📝 浏览更多博客
              </Link>
              <Link
                href="/knowledge"
                className="px-8 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl font-semibold transition-all hover:-translate-y-0.5"
              >
                📚 探索知识库
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
