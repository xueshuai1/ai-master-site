import type { MetadataRoute } from "next";
import { articles } from "@/data/knowledge";
import { blogs } from "@/data/blogs";
import { news } from "@/data/news";
import { tools } from "@/data/tools";

const SITE_URL = "https://www.ai-master.cc";

/**
 * 自动生成 sitemap.xml（Next.js 14 原生支持）
 * ─────────────────────────────────────────────────────────────
 * 覆盖：
 *   - 6 个核心路由（/、/knowledge、/blog、/tools、/news、/about）
 *   - 所有 article 详情页
 *   - 所有 blog 详情页
 *   - 所有 news 详情页
 *   - tools 是外链，不纳入 sitemap
 *
 * lastModified 优先用 updatedAt，回退到 date；按发布时间倒序。
 * priority / changeFrequency 按内容生命周期设置，避免被搜索引擎当成低质站点。
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  // ── 静态核心路由 ──────────────────────────────────────────
  const coreRoutes: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${SITE_URL}/knowledge`,
      lastModified: latestDate(articles.map((a) => a.updatedAt || a.date)) || now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/blog`,
      lastModified: latestDate(blogs.map((b) => b.updatedAt || b.date)) || now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/news`,
      lastModified: latestDate(news.map((n) => n.date)) || now,
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/tools`,
      lastModified: latestDate(tools.map((t) => t.updatedAt).filter(Boolean) as string[]) || now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/about`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ];

  // ── 文章详情页 ────────────────────────────────────────────
  const articleRoutes: MetadataRoute.Sitemap = articles.map((a) => ({
    url: `${SITE_URL}/article/${a.id}`,
    lastModified: parseDate(a.updatedAt || a.date),
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  // ── 博客详情页 ────────────────────────────────────────────
  const blogRoutes: MetadataRoute.Sitemap = blogs.map((b) => ({
    url: `${SITE_URL}/blog/${b.id}`,
    lastModified: parseDate(b.updatedAt || b.date),
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  // ── 资讯详情页 ────────────────────────────────────────────
  const newsRoutes: MetadataRoute.Sitemap = news.map((n) => ({
    url: `${SITE_URL}/news/${n.id}`,
    lastModified: parseDate(n.date),
    changeFrequency: "yearly", // 新闻发布后基本不再更新
    priority: 0.6,
  }));

  return [...coreRoutes, ...articleRoutes, ...blogRoutes, ...newsRoutes];
}

/** 解析 "YYYY-MM-DD" / "YYYY-MM-DD HH:mm" → Date */
function parseDate(s: string): Date {
  if (!s) return new Date();
  const m = s.match(/^(\d{4})-(\d{2})-(\d{2})(?:[\sT](\d{2}):(\d{2}))?/);
  if (!m) return new Date(s);
  const [, y, mo, d, hh = "0", mm = "0"] = m;
  return new Date(
    Date.UTC(Number(y), Number(mo) - 1, Number(d), Number(hh) - 8, Number(mm)),
  );
}

/** 返回字符串日期列表里最新的那一个；空数组返回 null */
function latestDate(dates: string[]): Date | null {
  if (dates.length === 0) return null;
  const sorted = [...dates].sort().reverse();
  return parseDate(sorted[0]);
}
