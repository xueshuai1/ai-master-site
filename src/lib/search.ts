/**
 * 搜索功能库 - 支持全文搜索 + 多维度筛选
 * 使用 FlexSearch 实现快速客户端搜索
 */

import { categories as categoryConfig } from "@/content/meta/categories.json";

export interface Question {
  slug: string;
  title: string;
  category: string;
  roles: string[];
  zones: string[];
  difficulty: string;
  tags: string[];
  source: string;
  sourceUrl: string;
  createdAt: string;
  updatedAt: string;
  images: string[];
  content: string;
  excerpt?: string;
}

export interface SearchFilters {
  query?: string;
  category?: string;
  role?: string;
  zone?: string;
  difficulty?: string;
  tags?: string[];
}

export interface SearchResult {
  question: Question;
  score: number;
  highlights: {
    title?: string;
    content?: string;
  };
}

/**
 * 简单的全文搜索实现
 * 生产环境建议集成 FlexSearch 或 Algolia
 */
export class SearchEngine {
  private questions: Question[] = [];
  private index: Map<string, Question> = new Map();

  constructor() {
    this.initialize();
  }

  private async initialize() {
    // 加载所有题目（实际应从文件系统或 API 加载）
    await this.loadQuestions();
  }

  private async loadQuestions() {
    // 这里需要从文件系统加载所有 Markdown 文件
    // 实际实现时可以通过 API 获取
    this.questions = [];
  }

  /**
   * 添加题目到索引
   */
  addQuestion(question: Question) {
    this.questions.push(question);
    this.index.set(question.slug, question);
  }

  /**
   * 执行搜索
   */
  search(filters: SearchFilters): SearchResult[] {
    let results = this.questions;

    // 1. 全文搜索（标题、内容、标签）
    if (filters.query) {
      const query = filters.query.toLowerCase();
      results = results.filter((q) => {
        const titleMatch = q.title.toLowerCase().includes(query);
        const contentMatch = q.content.toLowerCase().includes(query);
        const tagMatch = q.tags.some((tag) => tag.toLowerCase().includes(query));
        return titleMatch || contentMatch || tagMatch;
      });
    }

    // 2. 按分类筛选
    if (filters.category) {
      results = results.filter((q) => q.category === filters.category);
    }

    // 3. 按岗位筛选
    if (filters.role) {
      results = results.filter((q) => q.roles.includes(filters.role!));
    }

    // 4. 按技术专区筛选
    if (filters.zone) {
      results = results.filter((q) => q.zones.includes(filters.zone!));
    }

    // 5. 按难度筛选
    if (filters.difficulty) {
      results = results.filter((q) => q.difficulty.includes(filters.difficulty!));
    }

    // 6. 按标签筛选
    if (filters.tags && filters.tags.length > 0) {
      results = results.filter((q) =>
        filters.tags!.some((tag) => q.tags.includes(tag))
      );
    }

    // 生成搜索结果（带高亮）
    return results.map((question) => ({
      question,
      score: this.calculateScore(question, filters),
      highlights: this.generateHighlights(question, filters),
    }));
  }

  /**
   * 计算相关性分数
   */
  private calculateScore(question: Question, filters: SearchFilters): number {
    let score = 0;

    if (filters.query) {
      const query = filters.query.toLowerCase();
      if (question.title.toLowerCase().includes(query)) score += 10;
      if (question.content.toLowerCase().includes(query)) score += 5;
      if (question.tags.some((tag) => tag.toLowerCase().includes(query))) score += 3;
    }

    // 额外加分：匹配的维度越多，分数越高
    if (filters.category && question.category === filters.category) score += 2;
    if (filters.role && question.roles.includes(filters.role!)) score += 2;
    if (filters.zone && question.zones.includes(filters.zone!)) score += 2;

    return score;
  }

  /**
   * 生成高亮片段
   */
  private generateHighlights(question: Question, filters: SearchFilters): {
    title?: string;
    content?: string;
  } {
    const highlights: { title?: string; content?: string } = {};

    if (filters.query) {
      const query = filters.query;
      
      // 标题高亮
      if (question.title.toLowerCase().includes(query.toLowerCase())) {
        highlights.title = this.highlightText(question.title, query);
      }

      // 内容高亮（截取前 200 字）
      const excerpt = question.content.substring(0, 200);
      if (excerpt.toLowerCase().includes(query.toLowerCase())) {
        highlights.content = this.highlightText(excerpt, query) + "...";
      }
    }

    return highlights;
  }

  /**
   * 高亮文本中的匹配词
   */
  private highlightText(text: string, query: string): string {
    const regex = new RegExp(`(${query})`, "gi");
    return text.replace(regex, "<mark>$1</mark>");
  }

  /**
   * 获取所有分类
   */
  getCategories() {
    return categoryConfig.categories;
  }

  /**
   * 获取所有岗位
   */
  getRoles() {
    return categoryConfig.roles;
  }

  /**
   * 获取所有技术专区
   */
  getZones() {
    return categoryConfig.zones;
  }

  /**
   * 获取所有难度级别
   */
  getDifficulties() {
    return categoryConfig.difficulties;
  }

  /**
   * 获取热门标签
   */
  getPopularTags(limit: number = 20): string[] {
    const tagCount = new Map<string, number>();
    
    this.questions.forEach((q) => {
      q.tags.forEach((tag) => {
        tagCount.set(tag, (tagCount.get(tag) || 0) + 1);
      });
    });

    return Array.from(tagCount.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([tag]) => tag);
  }
}

// 导出单例
export const searchEngine = new SearchEngine();

/**
 * 辅助函数：从文件路径提取 slug
 */
export function extractSlug(filepath: string): string {
  return filepath.replace(/\.md$/, "");
}

/**
 * 辅助函数：解析 Frontmatter
 */
export function parseFrontmatter(content: string): {
  data: Record<string, any>;
  content: string;
} {
  const frontmatterRegex = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/;
  const match = content.match(frontmatterRegex);

  if (!match) {
    return { data: {}, content };
  }

  const data: Record<string, any> = {};
  const lines = match[1].split("\n");

  lines.forEach((line) => {
    const [key, ...valueParts] = line.split(":");
    if (key && valueParts.length > 0) {
      let value = valueParts.join(":").trim();
      
      // 移除引号
      value = value.replace(/^["']|["']$/g, "");
      
      // 解析数组
      if (value.startsWith("[") && value.endsWith("]")) {
        value = value.slice(1, -1).split(",").map((v) => v.trim().replace(/["']/g, ""));
      }
      
      data[key.trim()] = value;
    }
  });

  return { data, content: match[2] };
}
