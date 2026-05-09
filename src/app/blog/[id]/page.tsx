import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { blogs } from "@/data/blogs";
import BlogDetailContent from "@/components/BlogDetailContent";

// Only allow routes that exist in the blogs data; unknown slugs → 404
export const dynamicParams = false;

export function generateStaticParams() {
  return blogs.map((blog) => ({ id: blog.id }));
}

export function generateMetadata({ params }: { params: { id: string } }): Metadata {
  const post = blogs.find((b) => b.id === params.id);
  if (!post) {
    return { title: "页面未找到 - AI Master", robots: "noindex" };
  }
  return {
    title: `${post.title}`,
    description: post.summary,
    keywords: post.tags.join(", "),
    alternates: {
      canonical: `https://www.ai-master.cc/blog/${post.id}`,
    },
    openGraph: {
      type: "article",
      title: post.title,
      description: post.summary,
      locale: "zh_CN",
      siteName: "AI Master",
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.summary,
    },
  };
}

export default function BlogDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const post = blogs.find((b) => b.id === params.id);

  if (!post) {
    notFound();
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
