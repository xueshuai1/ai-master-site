export interface ArticleSection {
  title: string;
  body?: string;
  code?: { lang: string; code: string; filename?: string }[];
  table?: { headers: string[]; rows: string[][] };
  mermaid?: string;
  list?: string[];
  tip?: string;
  warning?: string;
}

export interface BlogPost {
  id: string;
  title: string;
  summary: string;
  content: ArticleSection[];
  date: string;
  author: string;
  tags: string[];
  readTime: number;
}
