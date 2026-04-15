import Link from "next/link";
import { blogs } from "@/data/blogs";
import BlogDetailContent from "@/components/BlogDetailContent";

export function generateStaticParams() {
  return blogs.map((blog) => ({ id: blog.id }));
}

export default function BlogDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const post = blogs.find((b) => b.id === params.id);

  if (!post) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-brand-950 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">📝</div>
          <h1 className="text-2xl font-bold mb-2">文章不存在</h1>
          <p className="text-slate-400 mb-6">
            该文章可能已被删除或链接有误
          </p>
          <Link
            href="/blog"
            className="px-6 py-3 bg-brand-600 hover:bg-brand-500 rounded-xl font-medium transition-all"
          >
            返回博客列表
          </Link>
        </div>
      </main>
    );
  }

  const relatedPosts = blogs
    .filter(
      (b) =>
        b.id !== post.id &&
        b.tags.some((t: string) => post.tags.includes(t))
    )
    .slice(0, 2);

  return <BlogDetailContent post={post} relatedPosts={relatedPosts} />;
}
