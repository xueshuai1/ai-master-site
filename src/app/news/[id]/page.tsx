import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { marked } from "marked";
import { news } from "@/data/news";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import JsonLd from "@/components/JsonLd";
import { articleSchema, breadcrumbSchema, SITE_URL } from "@/lib/structured-data";

export function generateStaticParams() {
  return news.map((n) => ({ id: n.id }));
}

export function generateMetadata({ params }: { params: { id: string } }): Metadata {
  const item = news.find((n) => n.id === params.id);
  if (!item) return {};
  return {
    title: `${item.title}`,
    description: item.summary,
    keywords: item.tag,
    alternates: {
      canonical: `https://www.ai-master.cc/news/${item.id}`,
    },
    openGraph: {
      type: "article",
      title: item.title,
      description: item.summary,
      locale: "zh_CN",
      siteName: "AI Master",
    },
    twitter: {
      card: "summary_large_image",
      title: item.title,
      description: item.summary,
    },
  };
}

function MarkdownContent({ content }: { content: string }) {
  const html = marked.parse(content) as string;
  return (
    <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
    <div
      className="prose prose-invert prose-lg max-w-none
        prose-h2:text-xl prose-h2:font-bold prose-h2:text-brand-300 prose-h2:mt-8 prose-h2:mb-4
        prose-h3:text-lg prose-h3:font-semibold prose-h3:text-white prose-h3:mt-6 prose-h3:mb-3
        prose-p:text-slate-300 prose-p:leading-relaxed prose-p:my-4
        prose-strong:text-white prose-strong:font-semibold
        prose-a:text-brand-400 prose-a:no-underline hover:prose-a:underline
        prose-code:text-pink-300 prose-code:bg-white/5 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded
        prose-pre:bg-slate-800/50 prose-pre:border prose-pre:border-white/10 prose-pre:p-4 prose-pre:max-h-[400px] prose-pre:overflow-auto
        prose-ul:text-slate-300 prose-ol:text-slate-300
        prose-li:my-1
        [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-2
        [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:space-y-2
        [&_blockquote]:border-l-4 [&_blockquote]:border-brand-500 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-slate-400
        [&_table]:w-full [&_table]:border-collapse [&_table]:my-6
        [&_th]:bg-white/5 [&_th]:px-4 [&_th]:py-2 [&_th]:text-left [&_th]:font-semibold [&_th]:border-b [&_th]:border-white/10
        [&_td]:px-4 [&_td]:py-2 [&_td]:border-b [&_td]:border-white/5
        [&_hr]:border-white/10 [&_hr]:my-8 [&_table]:text-sm [&_th]:px-3 [&_th]:py-1.5 [&_td]:px-3 [&_td]:py-1.5 [&_table]:whitespace-nowrap [&_table]:w-auto"
      dangerouslySetInnerHTML={{ __html: html }}
    />
    </div>
  );
}

export default function NewsDetailPage({ params }: { params: { id: string } }) {
  const item = news.find((n) => n.id === params.id);
  if (!item) notFound();

  const relatedNews = news.filter((n) => n.id !== item.id).slice(0, 3);

  const newsUrl = `${SITE_URL}/news/${item.id}`;
  const structured = [
    articleSchema({
      type: "NewsArticle",
      url: newsUrl,
      title: item.title,
      summary: item.summary,
      datePublished: item.date,
      keywords: [item.tag],
      author: item.source,
      section: item.tag,
    }),
    breadcrumbSchema([
      { name: "首页", url: SITE_URL },
      { name: "AI 资讯", url: `${SITE_URL}/news` },
      { name: item.title, url: newsUrl },
    ]),
  ];

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-brand-950 text-white">
      <JsonLd data={structured} />
      <Navbar activePath="/news" />

      {/* Hero */}
      <section className="pt-28 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 text-sm text-slate-400">
            <Link href="/" className="hover:text-brand-300 transition-colors">
              ← 首页
            </Link>
            <span>/</span>
            <Link href="/news" className="hover:text-brand-300 transition-colors">
              AI 资讯
            </Link>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <span className={`px-3 py-1 ${item.tagColor || "bg-brand-500/10 text-brand-300"} rounded-full text-sm font-medium`}>
              {item.tag}
            </span>
            <span className="text-slate-500 text-sm">{item.date}</span>
            <span className="text-slate-500">·</span>
            <span className="text-slate-500 text-sm">{item.source}</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mt-6 leading-tight">
            {item.title}
          </h1>

          <p className="text-lg text-slate-400 mt-8 leading-relaxed">
            {item.summary}
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <MarkdownContent content={item.content} />

          {/* Source Link */}
          <div className="mt-12 p-6 rounded-2xl bg-white/5 border border-white/5">
            <p className="text-sm text-slate-400 mb-3">📰 原始来源</p>
            <a
              href={item.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand-400 hover:text-brand-300 transition-colors break-all text-sm"
            >
              {item.sourceUrl}
            </a>
          </div>

          {/* Prev/Next Navigation */}
          {(() => {
            const sorted = [...news].sort((a, b) => b.date.localeCompare(a.date));
            const idx = sorted.findIndex(n => n.id === item.id);
            const prev = idx > 0 ? sorted[idx - 1] : null;
            const next = idx < sorted.length - 1 ? sorted[idx + 1] : null;
            if (!prev && !next) return null;
            return (
              <div className="mt-8 pt-8 border-t border-white/5">
                <div className="flex flex-col sm:flex-row gap-4">
                  {prev ? (
                    <Link href={prev.href} className="flex-1 group p-4 rounded-xl bg-white/5 border border-white/10 hover:border-brand-500/30 transition-all">
                      <p className="text-xs text-slate-500 mb-1">← 上一篇</p>
                      <p className="text-sm font-medium group-hover:text-brand-300 transition-colors line-clamp-1">{prev.title}</p>
                    </Link>
                  ) : <div className="flex-1" />}
                  {next ? (
                    <Link href={next.href} className="flex-1 group p-4 rounded-xl bg-white/5 border border-white/10 hover:border-brand-500/30 transition-all text-right">
                      <p className="text-xs text-slate-500 mb-1">下一篇 →</p>
                      <p className="text-sm font-medium group-hover:text-brand-300 transition-colors line-clamp-1">{next.title}</p>
                    </Link>
                  ) : <div className="flex-1" />}
                </div>
              </div>
            );
          })()}
        </div>
      </section>

      {/* Related News */}
      {relatedNews.length > 0 && (
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-slate-900/50">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold mb-8">📰 更多动态</h2>
            <div className="space-y-4">
              {relatedNews.map((n) => (
                <Link
                  key={n.id}
                  href={n.href}
                  className="group block p-5 rounded-xl bg-white/5 border border-white/5 hover:border-brand-500/30 transition-all"
                >
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <span className={`shrink-0 px-3 py-1 ${n.tagColor || "bg-brand-500/10 text-brand-300"} rounded-full text-sm font-medium`}>
                      {n.tag}
                    </span>
                    <span className="shrink-0 text-slate-500 text-sm whitespace-nowrap">{n.date}</span>
                  </div>
                  <h3 className="text-lg font-medium group-hover:text-brand-300 transition-colors">
                    {n.title}
                  </h3>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <Footer />
    </main>
  );
}
