import { NextRequest, NextResponse } from "next/server";
import { searchEngine, SearchFilters, SearchResult } from "@/lib/search";
import { parseFrontmatter } from "@/lib/search";
import { promises as fs } from "fs";
import path from "path";

/**
 * GET /api/search
 * 
 * 查询参数:
 * - q: 搜索关键词
 * - category: 分类筛选
 * - role: 岗位筛选
 * - zone: 技术专区筛选
 * - difficulty: 难度筛选
 * - tags: 标签筛选（逗号分隔）
 * - page: 页码（默认 1）
 * - limit: 每页数量（默认 20）
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    const filters: SearchFilters = {
      query: searchParams.get("q") || undefined,
      category: searchParams.get("category") || undefined,
      role: searchParams.get("role") || undefined,
      zone: searchParams.get("zone") || undefined,
      difficulty: searchParams.get("difficulty") || undefined,
      tags: searchParams.get("tags")?.split(",").filter(Boolean),
    };

    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    // 加载题目数据（生产环境应该预加载或缓存）
    const questions = await loadAllQuestions();

    // 执行搜索
    let results: SearchResult[] = questions.map((q) => ({
      question: q,
      score: calculateScore(q, filters),
      highlights: generateHighlights(q, filters),
    }));

    // 应用筛选
    results = applyFilters(results, filters);

    // 按分数排序
    results.sort((a, b) => b.score - a.score);

    // 分页
    const total = results.length;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedResults = results.slice(startIndex, endIndex);

    return NextResponse.json({
      success: true,
      data: {
        results: paginatedResults,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
        filters: {
          applied: filters,
          available: {
            categories: await getCategories(),
            roles: await getRoles(),
            zones: await getZones(),
            difficulties: await getDifficulties(),
          },
        },
      },
    });
  } catch (error) {
    console.error("Search API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Search failed",
      },
      { status: 500 }
    );
  }
}

/**
 * 加载所有题目
 */
async function loadAllQuestions() {
  const questions = [];
  const questionsDir = path.join(process.cwd(), "../../skills/auto-interview-collector/questions");

  try {
    const categories = await fs.readdir(questionsDir);

    for (const category of categories) {
      const categoryPath = path.join(questionsDir, category);
      const stat = await fs.stat(categoryPath);

      if (!stat.isDirectory() || category === ".git") {
        continue;
      }

      const files = await fs.readdir(categoryPath);

      for (const file of files) {
        if (!file.endsWith(".md")) {
          continue;
        }

        const filePath = path.join(categoryPath, file);
        const content = await fs.readFile(filePath, "utf-8");
        const { data, content: body } = parseFrontmatter(content);

        questions.push({
          slug: `${category}/${file.replace(/\.md$/, "")}`,
          title: data.title || file,
          category: data.category || category,
          roles: data.roles || [],
          zones: data.zones || [],
          difficulty: data.difficulty || "⭐⭐",
          tags: data.tags || [],
          source: data.source || "",
          sourceUrl: data.sourceUrl || "",
          createdAt: data.createdAt || "",
          updatedAt: data.updatedAt || "",
          images: data.images || [],
          content: body,
          excerpt: body.substring(0, 200),
        });
      }
    }
  } catch (error) {
    console.error("Failed to load questions:", error);
  }

  return questions;
}

/**
 * 计算相关性分数
 */
function calculateScore(question: any, filters: SearchFilters): number {
  let score = 0;

  if (filters.query) {
    const query = filters.query.toLowerCase();
    if (question.title.toLowerCase().includes(query)) score += 10;
    if (question.content.toLowerCase().includes(query)) score += 5;
    if (question.tags.some((tag: string) => tag.toLowerCase().includes(query))) score += 3;
  }

  if (filters.category && question.category === filters.category) score += 2;
  if (filters.role && question.roles.includes(filters.role)) score += 2;
  if (filters.zone && question.zones.includes(filters.zone)) score += 2;

  return score;
}

/**
 * 生成高亮
 */
function generateHighlights(question: any, filters: SearchFilters) {
  const highlights: { title?: string; content?: string } = {};

  if (filters.query) {
    const query = filters.query;
    if (question.title.toLowerCase().includes(query.toLowerCase())) {
      highlights.title = highlightText(question.title, query);
    }
    const excerpt = question.content.substring(0, 200);
    if (excerpt.toLowerCase().includes(query.toLowerCase())) {
      highlights.content = highlightText(excerpt, query) + "...";
    }
  }

  return highlights;
}

/**
 * 高亮文本
 */
function highlightText(text: string, query: string): string {
  const regex = new RegExp(`(${escapeRegex(query)})`, "gi");
  return text.replace(regex, "<mark>$1</mark>");
}

/**
 * 转义正则特殊字符
 */
function escapeRegex(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * 应用筛选
 */
function applyFilters(results: SearchResult[], filters: SearchFilters): SearchResult[] {
  return results.filter(({ question }) => {
    if (filters.category && question.category !== filters.category) return false;
    if (filters.role && !question.roles.includes(filters.role)) return false;
    if (filters.zone && !question.zones.includes(filters.zone)) return false;
    if (filters.difficulty && !question.difficulty.includes(filters.difficulty)) return false;
    if (filters.tags && filters.tags.length > 0) {
      if (!filters.tags.some((tag) => question.tags.includes(tag))) return false;
    }
    return true;
  });
}

/**
 * 获取可用分类
 */
async function getCategories() {
  try {
    const configPath = path.join(process.cwd(), "content/meta/categories.json");
    const content = await fs.readFile(configPath, "utf-8");
    const config = JSON.parse(content);
    return config.categories;
  } catch {
    return {};
  }
}

/**
 * 获取可用岗位
 */
async function getRoles() {
  try {
    const configPath = path.join(process.cwd(), "content/meta/categories.json");
    const content = await fs.readFile(configPath, "utf-8");
    const config = JSON.parse(content);
    return config.roles;
  } catch {
    return {};
  }
}

/**
 * 获取可用技术专区
 */
async function getZones() {
  try {
    const configPath = path.join(process.cwd(), "content/meta/categories.json");
    const content = await fs.readFile(configPath, "utf-8");
    const config = JSON.parse(content);
    return config.zones;
  } catch {
    return {};
  }
}

/**
 * 获取可用难度
 */
async function getDifficulties() {
  try {
    const configPath = path.join(process.cwd(), "content/meta/categories.json");
    const content = await fs.readFile(configPath, "utf-8");
    const config = JSON.parse(content);
    return config.difficulties;
  } catch {
    return {};
  }
}
