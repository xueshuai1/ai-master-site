import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { blogs } from "@/data/blogs";
import ReactMarkdown from "react-markdown";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";

export function generateStaticParams() {
  return blogs.map((blog) => ({ id: blog.id }));
}

export default function BlogDetailPage({ params }: { params: { id: string } }) {
  const post = blogs.find((b) => b.id === params.id);

  if (!post) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-brand-950 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">📝</div>
          <h1 className="text-2xl font-bold mb-2">文章不存在</h1>
          <p className="text-slate-400 mb-6">该文章可能已被删除或链接有误</p>
          <Link href="/blog" className="px-6 py-3 bg-brand-600 hover:bg-brand-500 rounded-xl font-medium transition-all">
            返回博客列表
          </Link>
        </div>
      </main>
    );
  }

  // 相关文章
  const relatedPosts = blogs
    .filter((b) => b.id !== post.id && b.tags.some((t) => post.tags.includes(t)))
    .slice(0, 2);

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-brand-950 text-white">
      <Navbar activePath="/blog" />

      {/* Article Header */}
      <section className="pt-28 pb-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-slate-500 mb-6">
            <Link href="/" className="hover:text-slate-300 transition-colors">首页</Link>
            <span>/</span>
            <Link href="/blog" className="hover:text-slate-300 transition-colors">博客</Link>
            <span>/</span>
            <span className="text-slate-400 truncate">{post.title}</span>
          </div>

          {/* Cover Image */}
          {post.coverImage && post.coverImage.startsWith('/images/') ? (
            <div className="mb-8 rounded-2xl overflow-hidden border border-white/10 shadow-2xl shadow-brand-500/10">
              <Image src={post.coverImage} alt={post.title} fill className="object-cover" sizes="(max-width: 640px) 100vw, (max-width: 1024px) 512px, 896px" />
            </div>
          ) : (
            <div className="text-center mb-6">
              <span className="text-6xl">{post.coverImage || "📝"}</span>
            </div>
          )}

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
        <div className="max-w-4xl mx-auto">
          {/* Summary block */}
          <div className="p-6 rounded-2xl bg-brand-500/5 border border-brand-500/20 mb-12">
            <div className="flex items-start gap-3">
              <span className="text-2xl">💡</span>
              <div>
                <h3 className="font-semibold text-brand-300 mb-2">文章摘要</h3>
                <p className="text-slate-300 leading-relaxed">{post.summary}</p>
              </div>
            </div>
          </div>

          {/* Markdown Content */}
          <article className="prose prose-lg prose-invert max-w-none
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
          ">
            <ReactMarkdown>{post.content}</ReactMarkdown>
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
        </div>
      </section>

      {/* Related Posts */}
      {relatedPosts.length > 0 && (
        <section className="px-4 sm:px-6 lg:px-8 pb-20">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold mb-8">📚 相关文章推荐</h2>
            <div className="grid sm:grid-cols-2 gap-5">
              {relatedPosts.map((rel) => (
                <Link
                  key={rel.id}
                  href={`/blog/${rel.id}`}
                  className="group p-5 rounded-2xl bg-white/5 border border-white/5 hover:border-brand-500/30 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-brand-500/5"
                >
                  {rel.coverImage && rel.coverImage.startsWith('/images/') ? (
                    <div className="mb-2 rounded-lg overflow-hidden h-24">
                      <Image src={rel.coverImage} alt={rel.title} fill className="object-cover" sizes="192px" />
                    </div>
                  ) : (
                    <div className="text-2xl mb-2">{rel.coverImage || "📝"}</div>
                  )}
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
        <div className="max-w-4xl mx-auto">
          <div className="text-center p-10 rounded-3xl bg-gradient-to-r from-brand-600/10 to-accent-600/10 border border-brand-500/20">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4">
              继续探索更多 AI 内容
            </h2>
            <p className="text-slate-400 mb-8 max-w-lg mx-auto">
              浏览更多博客文章，或者深入学习 AI 核心知识
            </p>
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
