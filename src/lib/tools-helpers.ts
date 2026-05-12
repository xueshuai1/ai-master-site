import type { Tool, GitHubStarsData } from "@/data/tools";
import { tools } from "@/data/tools";
import githubStarsRaw from "@/data/github-stars.json";

// 通过 unknown 中转避免 TS 对 JSON 字面量类型的过严匹配
// （JSON 里的 null 字段在我们的接口里都是 nullable）
const githubStars = githubStarsRaw as unknown as GitHubStarsData;

/**
 * 把 src/data/tools.ts 的静态条目和 github-stars.json 的运行时数据合并。
 * 在多处（列表页、详情页、JSON-LD）共用，避免重复 enrichment。
 */
export function enrichTool(t: Tool): Tool {
  const gh = githubStars.stars?.[t.id];
  const alt = githubStars.alternativeTo?.[t.id];
  return {
    ...t,
    githubStars: gh?.stars ?? t.githubStars,
    forks: gh?.forks ?? t.forks,
    language: gh?.language ?? t.language,
    createdAt: gh?.createdAt ?? t.createdAt,
    updatedAt: gh?.updatedAt ?? t.updatedAt,
    previousStars: gh?.previousStars ?? t.previousStars,
    delta: gh?.delta ?? t.delta,
    watchers: gh?.watchers ?? t.watchers,
    license: gh?.license ?? t.license,
    homepage: gh?.homepage ?? t.homepage,
    openIssues: gh?.openIssues ?? t.openIssues,
    topics: gh?.topics ?? t.topics,
    altToLikes: alt?.likes ?? t.altToLikes,
  };
}

/** 全量增强后的工具数组（模块级缓存，仅 import 一次评估） */
export const enrichedTools: Tool[] = tools.map(enrichTool);

/** 按 id 取增强后的工具 */
export function getEnrichedTool(id: string): Tool | undefined {
  return enrichedTools.find((t) => t.id === id);
}

/**
 * 找「相关工具」：
 * 1. 同分类 + 标签重叠数排序
 * 2. 排除自己
 * 3. 最多返回 limit 条
 */
export function getRelatedTools(tool: Tool, limit = 6): Tool[] {
  return enrichedTools
    .filter((t) => t.id !== tool.id)
    .map((t) => {
      const sameCategory = t.category === tool.category ? 1 : 0;
      const tagOverlap = t.tags.filter((tag) => tool.tags.includes(tag)).length;
      return { tool: t, score: sameCategory * 3 + tagOverlap };
    })
    .filter((entry) => entry.score > 0)
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return (b.tool.githubStars ?? 0) - (a.tool.githubStars ?? 0);
    })
    .slice(0, limit)
    .map((entry) => entry.tool);
}

/**
 * 把 category key 解码为中文 label。
 * 与 src/data/tools.ts 的 toolCategories 严格对齐。
 */
export function categoryLabel(key: string): string {
  const map: Record<string, string> = {
    app: "AI 应用",
    coding: "编程助手",
    agent: "AI Agent",
    framework: "开发框架",
    workflow: "工作流自动化",
    rag: "RAG & 检索",
    multimodal: "多模态 & 视觉",
    mcp: "MCP & 浏览器自动化",
    training: "训练 & 微调",
    data: "数据处理",
    mlops: "推理 & 评测",
    model: "LLM 运行时",
    learn: "学习资源",
  };
  return map[key] ?? key;
}

/** 把 stars 数格式化为 1.2k / 12k 之类的紧凑字符串 */
export function formatStars(n: number | null | undefined): string {
  if (n == null || n <= 0) return "";
  if (n >= 10000) return `${Math.round(n / 1000)}k`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return n.toString();
}

/**
 * 按 stars 数分层的色彩 token，让一眼能区分明星项目。
 * - 50k+：传奇 gold + 加重边框
 * - 10k+：日常人气 amber
 * - 1k+：稳健 yellow
 * - <1k：低饱和 slate
 */
export function starsBadgeClass(stars: number | null | undefined): string {
  if (stars == null || stars <= 0) return "bg-white/5 text-slate-400";
  if (stars >= 50000) return "bg-amber-400/20 text-amber-200 border border-amber-400/30 shadow-sm shadow-amber-400/10";
  if (stars >= 10000) return "bg-amber-500/15 text-amber-300 border border-amber-500/20";
  if (stars >= 1000) return "bg-yellow-500/10 text-yellow-300";
  return "bg-white/5 text-slate-400";
}

/**
 * 工具是否最近上架？
 * 优先用 GitHub createdAt（仓库创建时间，反映工具上线时间），
 * 落空则用 updatedAt（手工维护时间）。
 * 注：开源工具 createdAt 通常是仓库初始 commit 日期，远早于本站收录，
 * 因此「NEW」更倾向以「上次抓取到的 delta」是否处于活跃增长来判断。
 * 简化版：以 createdAt 距今 < 60 天作为「新工具」。
 */
export function isNewTool(t: Tool, withinDays = 60): boolean {
  const dateStr = t.createdAt;
  if (!dateStr) return false;
  const created = new Date(dateStr).getTime();
  if (Number.isNaN(created)) return false;
  const now = Date.now();
  return now - created <= withinDays * 24 * 60 * 60 * 1000;
}
