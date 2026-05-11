/**
 * 全站内容规模（构建期常量）— 供各路由 metadata 与文案统一引用，避免手写「180+」「250+」等与数据脱节。
 */
import { articles, categories } from "./knowledge";
import { blogs } from "./blogs";
import { tools, toolCategories } from "./tools";
import { news } from "./news";

export const siteArticleCount = articles.length;
export const siteBlogCount = blogs.length;
export const siteToolCount = tools.length;
export const siteNewsCount = news.length;

/** 知识库侧边分类数（不含「全部」） */
export const siteKnowledgeCategoryCount = categories.filter((c) => c.key !== "all").length;

/** 工具集分类数（不含「全部」） */
export const siteToolCategoryCount = toolCategories.filter((c) => c.key !== "all").length;

export const siteSeoDescription = `AI Master 是专业的人工智能学习与实践平台。提供 ${siteArticleCount}+ 篇 AI 知识库文章、${siteBlogCount}+ 篇深度技术博客、${siteToolCount}+ AI 工具推荐、${siteNewsCount}+ 条 AI 前沿动态。从入门到精通，探索大语言模型、AI Agent、RAG、机器学习等热门技术。`;

export const siteShortSeoDescription = `专业的人工智能学习与实践平台。${siteArticleCount}+ 知识库文章，${siteBlogCount}+ 深度博客，${siteToolCount}+ AI 工具推荐，每日 AI 前沿动态。`;

export const knowledgeSeoTitle = `AI 知识库 - ${siteArticleCount}+ 篇系统知识文章`;
export const knowledgeSeoDescription = `AI Master 知识库，涵盖机器学习、深度学习、大语言模型、AI Agent、RAG、强化学习、计算机视觉、自然语言处理等 ${siteKnowledgeCategoryCount} 个分类，${siteArticleCount}+ 篇系统性知识文章，从入门到精通。`;

export const blogSeoTitle = "AI 技术博客 - 深度解读前沿热点";
export const blogSeoDescription = `AI Master 技术博客，${siteBlogCount}+ 篇深度技术文章，紧跟 AI 前沿热点，涵盖最新论文解读、技术趋势分析与工具实战指南。`;

export const newsSeoTitle = "AI 最新动态 - 每日前沿资讯";
export const newsSeoDescription = `AI Master AI 动态频道，收录 ${siteNewsCount}+ 条 AI 前沿资讯，持续更新，覆盖 OpenAI、Anthropic、Google DeepMind、arXiv 论文、GitHub 开源项目等权威来源。`;

export const toolsSeoTitle = `AI 工具集 - ${siteToolCount}+ AI 工具推荐`;
export const toolsSeoDescription = `AI Master 工具集，收录 ${siteToolCount}+ 精选 AI 工具，涵盖大语言模型、AI Agent、开发框架、数据处理、多模态等 ${siteToolCategoryCount} 大类，含详细评测、优缺点对比和使用建议。`;

export const aboutSeoTitle = "关于 AI Master";
export const aboutSeoDescription = `AI Master 是专业的人工智能学习与实践平台，当前收录 ${siteArticleCount}+ 篇知识库文章、${siteBlogCount}+ 篇技术博客、${siteToolCount}+ 个 AI 工具与 ${siteNewsCount}+ 条行业动态，帮助开发者从入门到精通。`;
