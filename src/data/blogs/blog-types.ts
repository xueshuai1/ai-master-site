export interface ArticleSection {
  title: string;
  body?: string;
  code?: { lang: string; code: string; filename?: string; title?: string }[];
  table?: { headers: string[]; rows: string[][] };
  mermaid?: string;
  list?: string[];
  tip?: string;
  warning?: string;
}

export interface BlogPost {
  id: string;
  title: string;
  category?: string;
  summary: string;
  content: ArticleSection[];
  date: string;          // 创建日期
  updatedAt?: string;    // 更新日期（仅当文章被更新时存在）
  author: string;
  tags: string[];
  readTime: number;
}
