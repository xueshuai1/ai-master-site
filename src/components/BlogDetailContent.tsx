"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { marked } from "marked";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import MermaidChartWithActions from "@/components/MermaidChartWithActions";
import CopyButton from "@/components/CopyButton";
import PythonCodeBlock from "@/components/PythonCodeBlock";
import { BlogPost, ArticleSection } from "@/data/blogs/blog-types";
import { blogs } from "@/data/blogs";

marked.setOptions({ breaks: true, gfm: true });

function extractToc(sections: ArticleSection[]) {
  return sections.map((s, i) => ({ id: `section-${i}`, text: s.title }));
}

/** 完全复用知识库的 ArticleSectionContent 渲染逻辑 */
function ArticleSectionContent({ section, headingId }: { section: ArticleSection; headingId: string }) {
  const numMatch = section.title.match(/^(\d+)[.、]\s*/);
  const badgeNum = numMatch ? numMatch[1] : '';
  const cleanTitle = numMatch ? section.title.replace(/^\d+[.、]\s*/, '') : section.title;

  return (
    <div className="mb-10">
      <h2 id={headingId} className="text-2xl font-bold mb-4 flex items-center gap-3 scroll-mt-24">
        {badgeNum && (
          <span className="w-8 h-8 rounded-lg bg-brand-500/10 text-brand-400 flex items-center justify-center text-sm font-bold">
            {badgeNum}
          </span>
        )}
        {cleanTitle}
      </h2>

      {section.body && (
        <div className="prose prose-invert max-w-none text-base sm:text-lg mb-4 overflow-x-auto
          prose-p:text-slate-300 prose-p:leading-relaxed prose-p:my-3
          prose-strong:text-amber-400 prose-strong:font-bold
          prose-code:text-pink-300 prose-code:bg-white/10 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:before:content-none prose-code:after:content-none
          prose-a:text-brand-400 hover:prose-a:underline
          [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1.5 [&_ul]:text-slate-300
          [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:space-y-1.5 [&_ol]:text-slate-300
          [&_li]:leading-relaxed
          [&_p]:break-words [&_p]:whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: marked.parse(section.body) as string }} />
      )}

      {section.body2 && (
        <div className="prose prose-invert max-w-none text-base sm:text-lg mb-4 overflow-x-auto
          prose-p:text-slate-300 prose-p:leading-relaxed prose-p:my-3
          prose-strong:text-amber-400 prose-strong:font-bold
          prose-code:text-pink-300 prose-code:bg-white/10 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:before:content-none prose-code:after:content-none
          prose-a:text-brand-400 hover:prose-a:underline
          [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1.5 [&_ul]:text-slate-300
          [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:space-y-1.5 [&_ol]:text-slate-300
          [&_li]:leading-relaxed
          [&_p]:break-words [&_p]:whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: marked.parse(section.body2) as string }} />
      )}

      {section.code && section.code.length > 0 && (
        <div className="space-y-4 my-6">
          {section.code.map((block, idx) => {
            const isPython = block.lang === 'python' || block.lang === 'py';
            if (isPython) {
              return (
                <PythonCodeBlock
                  key={idx}
                  code={block.code}
                  lang={block.lang}
                  filename={block.filename}
                  CopyButtonComponent={CopyButton}
                />
              );
            }
            return (
              <div key={idx} className="rounded-xl overflow-hidden bg-slate-900/80 border border-white/10">
                <div className="flex items-center justify-between px-4 py-2 bg-white/5 text-sm text-slate-400">
                  <span className="font-mono">{block.lang}</span>
                  <div className="flex items-center gap-2">
                    {block.filename && <span>{block.filename}</span>}
                    <CopyButton text={block.code} />
                  </div>
                </div>
                <pre className="p-4 overflow-auto max-h-[400px] text-sm">
                  <code className="text-slate-300 font-mono whitespace-pre">{block.code}</code>
                </pre>
              </div>
            );
          })}
        </div>
      )}

      {section.mermaid && (
        <div className="my-6 p-6 rounded-xl bg-white/5 border border-white/10">
          <MermaidChartWithActions chart={section.mermaid} />
        </div>
      )}

      {section.table && (
        <div className="my-6 overflow-x-auto rounded-xl border border-white/10">
          <table className="w-full text-sm">
            <thead className="bg-white/5">
              <tr>
                {section.table.headers.map((h, i) => (
                  <th key={i} className="px-4 py-3 text-left font-semibold text-slate-200 border-b border-white/10">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {section.table.rows.map((row, ri) => (
                <tr key={ri} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  {row.map((cell, ci) => (
                    <td key={ci} className="px-4 py-3 text-slate-300 prose prose-invert prose-sm max-w-none
                      prose-strong:text-amber-400 prose-strong:font-bold
                      prose-code:text-pink-300 prose-code:bg-white/5 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:before:content-none prose-code:after:content-none
                      [&_p]:my-0 [&_p]:inline" dangerouslySetInnerHTML={{ __html: marked.parse(cell) as string }} />
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {section.list && section.list.length > 0 && (
        <ul className="my-4 space-y-2">
          {section.list.map((item, i) => (
            <li key={i} className="flex items-start gap-2 text-slate-300 leading-relaxed">
              <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-brand-400 flex-shrink-0" />
              <span dangerouslySetInnerHTML={{ __html: marked.parse(item) as string }} />
            </li>
          ))}
        </ul>
      )}

      {section.tip && (
        <div className="my-4 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-sm prose prose-invert max-w-none
          prose-strong:text-amber-400 prose-strong:font-bold
          prose-code:text-pink-300 prose-code:bg-white/5 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:before:content-none prose-code:after:content-none
          [&_p]:my-0 [&_p]:text-emerald-300" dangerouslySetInnerHTML={{ __html: marked.parse(section.tip) as string }} />
      )}

      {section.warning && (
        <div className="my-4 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-sm prose prose-invert max-w-none
          prose-strong:text-amber-400 prose-strong:font-bold
          prose-code:text-pink-300 prose-code:bg-white/5 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:before:content-none prose-code:after:content-none
          [&_p]:my-0 [&_p]:text-amber-300" dangerouslySetInnerHTML={{ __html: marked.parse(section.warning) as string }} />
      )}
    </div>
  );
}

export default function BlogDetailContent({ post, relatedPosts }: { post: BlogPost; relatedPosts: BlogPost[] }) {
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
      const scrolled = Math.max(0, scrollY - articleTop + viewportHeight * 0.3);
      const progress = Math.min(100, Math.max(0, (scrolled / articleHeight) * 100));
      setScrollProgress(progress);

      const headings = article.querySelectorAll("h2, h3");
      let found = false;
      for (let i = headings.length - 1; i >= 0; i--) {
        const h = headings[i] as HTMLElement;
        if (h.id && h.getBoundingClientRect().top <= 100) {
          setActiveToc(h.id);
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

      {scrollProgress > 0 && (
        <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-transparent">
          <div className="h-full bg-gradient-to-r from-brand-500 to-brand-300 transition-all duration-150" style={{ width: `${scrollProgress}%` }} />
        </div>
      )}

      {/* Header */}
      <section className="pt-28 pb-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-2 text-sm text-slate-500 mb-6">
            <Link href="/" className="hover:text-slate-300 transition-colors">首页</Link>
            <span>/</span>
            <Link href="/blog" className="hover:text-slate-300 transition-colors">博客</Link>
            <span>/</span>
            <span className="text-slate-400 truncate">{post.title}</span>
          </div>

          <div className="flex items-center gap-3 mb-4 flex-wrap justify-center">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-brand-500/10 text-brand-300 rounded-full text-sm font-medium">
              {post.tags[0] || "行业洞察"}
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6 leading-tight text-center">
            {post.title}
          </h1>

          <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-slate-400 mb-8 pb-8 border-b border-white/5">
            <span>✍️ {post.author}</span>
            <span>📅 创建 {post.date}</span>
            {post.updatedAt && (
              <span className="text-amber-400">🔄 更新 {post.updatedAt}</span>
            )}
            <span>📖 {post.readTime} min 阅读</span>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="px-4 sm:px-6 lg:px-8 pb-16">
        <div className="max-w-6xl mx-auto">
          <div className="p-6 rounded-2xl bg-brand-500/5 border border-brand-500/20 mb-12">
            <div className="flex items-start gap-3">
              <span className="text-2xl">💡</span>
              <div>
                <h3 className="font-semibold text-brand-300 mb-2">文章摘要</h3>
                <p className="text-slate-300 leading-relaxed">{post.summary}</p>
              </div>
            </div>
          </div>

          <div className="flex gap-8">
            {/* Main Content */}
            <div className={showToc ? "flex-1 min-w-0" : "max-w-4xl mx-auto w-full"}>
              <article>
                {post.content.map((section, i) => (
                  <ArticleSectionContent key={i} section={section} headingId={`section-${i}`} />
                ))}
              </article>

              {/* Tags */}
              <div className="mt-12 pt-8 border-t border-white/5">
                <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">标签</h3>
                <div className="flex flex-wrap gap-2">
                  {post.tags.map((tag) => (
                    <span key={tag} className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/5 rounded-full text-sm text-slate-300 transition-colors cursor-pointer">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Prev/Next Navigation */}
              {(() => {
                const sorted = [...blogs].sort((a, b) => b.date.localeCompare(a.date));
                const idx = sorted.findIndex(b => b.id === post.id);
                const prev = idx > 0 ? sorted[idx - 1] : null;
                const next = idx < sorted.length - 1 ? sorted[idx + 1] : null;
                if (!prev && !next) return null;
                return (
                  <div className="mt-8 pt-8 border-t border-white/5">
                    <div className="flex flex-col sm:flex-row gap-4">
                      {prev ? (
                        <Link href={`/blog/${prev.id}`} className="flex-1 group p-4 rounded-xl bg-white/5 border border-white/10 hover:border-brand-500/30 transition-all">
                          <p className="text-xs text-slate-500 mb-1">← 上一篇</p>
                          <p className="text-sm font-medium group-hover:text-brand-300 transition-colors line-clamp-1">{prev.title}</p>
                        </Link>
                      ) : <div className="flex-1" />}
                      {next ? (
                        <Link href={`/blog/${next.id}`} className="flex-1 group p-4 rounded-xl bg-white/5 border border-white/10 hover:border-brand-500/30 transition-all text-right">
                          <p className="text-xs text-slate-500 mb-1">下一篇 →</p>
                          <p className="text-sm font-medium group-hover:text-brand-300 transition-colors line-clamp-1">{next.title}</p>
                        </Link>
                      ) : <div className="flex-1" />}
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* TOC Sidebar */}
            {showToc && (
              <aside className="hidden lg:block w-64 shrink-0">
                <div className="sticky top-24">
                  <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">📑 目录</h3>
                  <nav className="space-y-1">
                    {toc.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => scrollToToc(item.id)}
                        className={`block w-full text-left py-1.5 text-sm transition-all rounded-md px-2 ${
                          activeToc === item.id
                            ? "text-brand-300 bg-brand-500/10 font-medium"
                            : "text-slate-500 hover:text-slate-300"
                        } ${item.text.startsWith("  ") ? "pl-6" : "pl-2"}`}
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
                  <p className="text-slate-400 text-sm line-clamp-2">{rel.summary}</p>
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
            <h2 className="text-2xl sm:text-3xl font-bold mb-4">继续探索更多 AI 内容</h2>
            <p className="text-slate-400 mb-8 max-w-lg mx-auto">浏览更多博客文章，或者深入学习 AI 核心知识</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/blog" className="px-8 py-3 bg-brand-600 hover:bg-brand-500 rounded-xl font-semibold transition-all hover:shadow-lg hover:shadow-brand-500/25 hover:-translate-y-0.5">
                📝 浏览更多博客
              </Link>
              <Link href="/knowledge" className="px-8 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl font-semibold transition-all hover:-translate-y-0.5">
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
