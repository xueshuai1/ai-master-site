/**
 * Schema.org JSON-LD 构造工具
 * ─────────────────────────────────────────────────────────────
 * 集中维护所有结构化数据模板，方便统一风格 / 调整字段。
 * 输出的对象会被 <JsonLd> 组件序列化为 <script type="application/ld+json">。
 *
 * 参考：
 * - https://schema.org/Article
 * - https://schema.org/BlogPosting
 * - https://schema.org/NewsArticle
 * - https://schema.org/WebSite + SearchAction
 * - https://schema.org/BreadcrumbList
 */

export const SITE_URL = "https://www.ai-master.cc";
export const SITE_NAME = "AI Master";
export const SITE_LOGO = `${SITE_URL}/favicon-64.png`;
export const ORG_DESCRIPTION =
  "AI Master 是一个专业的人工智能学习与实践平台，提供 AI 知识库、技术博客、AI 工具集与前沿动态。";

type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };
type Schema = Record<string, JsonValue>;

/** 网站根节点：Organization */
export function organizationSchema(): Schema {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${SITE_URL}#organization`,
    name: SITE_NAME,
    url: SITE_URL,
    logo: SITE_LOGO,
    description: ORG_DESCRIPTION,
  };
}

/** 网站根节点：WebSite + SearchAction（让 Google 显示站内搜索框） */
export function websiteSchema(): Schema {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}#website`,
    url: SITE_URL,
    name: SITE_NAME,
    description: ORG_DESCRIPTION,
    publisher: { "@id": `${SITE_URL}#organization` },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/knowledge?search={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

/** 通用面包屑 */
export function breadcrumbSchema(
  items: { name: string; url: string }[],
): Schema {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, idx) => ({
      "@type": "ListItem",
      position: idx + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

interface ArticleSchemaInput {
  /** 文章 URL */
  url: string;
  /** 标题 */
  title: string;
  /** 摘要 / description */
  summary: string;
  /** 发布日期，ISO 字符串或 YYYY-MM-DD */
  datePublished: string;
  /** 更新日期（可选） */
  dateModified?: string;
  /** 标签（关键词） */
  keywords?: string[];
  /** 作者名（可选；默认站点名） */
  author?: string;
  /** 主题分类（可选） */
  section?: string;
  /** 文章类型：默认 Article，可指定 BlogPosting / NewsArticle */
  type?: "Article" | "BlogPosting" | "NewsArticle";
}

/** 通用文章 schema（Article / BlogPosting / NewsArticle 共用结构） */
export function articleSchema(input: ArticleSchemaInput): Schema {
  const {
    url,
    title,
    summary,
    datePublished,
    dateModified,
    keywords,
    author,
    section,
    type = "Article",
  } = input;

  return {
    "@context": "https://schema.org",
    "@type": type,
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    headline: title,
    description: summary,
    datePublished: toIso(datePublished),
    dateModified: toIso(dateModified || datePublished),
    author: {
      "@type": "Person",
      name: author || SITE_NAME,
    },
    publisher: { "@id": `${SITE_URL}#organization` },
    ...(keywords && keywords.length > 0 ? { keywords: keywords.join(", ") } : {}),
    ...(section ? { articleSection: section } : {}),
    inLanguage: "zh-CN",
  };
}

interface SoftwareSchemaInput {
  /** 站内详情页 URL */
  url: string;
  /** 工具名 */
  name: string;
  /** 描述 */
  description: string;
  /** 类别（如「LLM」「Agent 框架」） */
  applicationCategory?: string;
  /** 「免费」/「开源」/「付费」/「免费+付费」 */
  price?: string;
  /** 主要编程语言（用于 keywords 增强） */
  programmingLanguage?: string;
  /** 标签 */
  keywords?: string[];
  /** GitHub stars 用作 aggregateRating（避免无依据评分） */
  stars?: number;
  /** 项目首页 / 仓库地址 */
  sameAs?: string[];
}

/** 单个工具的 SoftwareApplication schema */
export function softwareApplicationSchema(input: SoftwareSchemaInput): Schema {
  const {
    url,
    name,
    description,
    applicationCategory,
    price,
    programmingLanguage,
    keywords,
    stars,
    sameAs,
  } = input;

  const isFree = price === "免费" || price === "开源" || price === "免费+付费";

  const schema: Schema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    name,
    description,
    url,
    ...(applicationCategory ? { applicationCategory } : {}),
    operatingSystem: "Web / Cross-Platform",
    ...(isFree
      ? {
          offers: {
            "@type": "Offer",
            price: "0",
            priceCurrency: "USD",
          },
        }
      : {}),
    ...(programmingLanguage ? { programmingLanguage } : {}),
    ...(keywords && keywords.length > 0 ? { keywords: keywords.join(", ") } : {}),
    ...(sameAs && sameAs.length > 0 ? { sameAs } : {}),
    publisher: { "@id": `${SITE_URL}#organization` },
    inLanguage: "zh-CN",
  };

  // GitHub stars 数 ≥ 100 时映射为 aggregateRating（仅作为「人气」可视化，标 reviewCount=stars）
  if (stars != null && stars >= 100) {
    schema.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: starsToRating(stars),
      reviewCount: stars,
      bestRating: 5,
      worstRating: 1,
    };
  }

  return schema;
}

/** GitHub stars → 1~5 评分（对数缩放） */
function starsToRating(stars: number): number {
  const r = 1 + Math.log10(Math.max(1, stars)) / 1.2;
  return Math.min(5, Math.round(r * 10) / 10);
}

/**
 * 列表聚合页的 ItemList schema。
 * 告知 Google：这是一组排好序的实体集合。
 */
export function itemListSchema(items: { url: string; name: string }[]): Schema {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: items.slice(0, 100).map((item, idx) => ({
      "@type": "ListItem",
      position: idx + 1,
      url: item.url,
      name: item.name,
    })),
    numberOfItems: items.length,
  };
}

/**
 * 把 "YYYY-MM-DD" / "YYYY-MM-DD HH:mm" 转为符合 schema.org 的 ISO 字符串。
 * 已有完整 ISO 时直接返回。
 */
function toIso(dateStr: string): string {
  if (!dateStr) return new Date().toISOString();
  // YYYY-MM-DD HH:mm
  const m = dateStr.match(/^(\d{4}-\d{2}-\d{2})[\sT](\d{2}:\d{2})(:\d{2})?/);
  if (m) {
    return `${m[1]}T${m[2]}${m[3] || ":00"}+08:00`;
  }
  // YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return `${dateStr}T00:00:00+08:00`;
  }
  // 已经是 ISO 字符串
  if (/T/.test(dateStr) || /Z$/.test(dateStr)) {
    return dateStr;
  }
  // 兜底：尽力解析
  try {
    return new Date(dateStr).toISOString();
  } catch {
    return new Date().toISOString();
  }
}
