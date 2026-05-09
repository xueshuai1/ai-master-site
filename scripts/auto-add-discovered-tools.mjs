#!/usr/bin/env node
/**
 * 自动收录内容研究员发现的新工具到 tools.ts
 * 
 * 工作流：
 * 1. 读取 reports/latest-content-findings.md（研究员最新发现）
 * 2. 解析「🆕 新工具」区块中的所有工具推荐
 * 3. 对比 tools.ts 已有项目，过滤已收录的
 * 4. 对未收录的工具，生成 tools.ts 条目代码
 * 5. 输出插入建议到 reports/tool-auto-insert-suggestions.md
 * 
 * 运行：node scripts/auto-add-discovered-tools.mjs
 * 
 * ⚠️ 这是建议生成脚本，不会直接修改 tools.ts
 *    由开发 Agent 审查后决定是否插入
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const REPORT_PATH = path.join(ROOT, 'reports/latest-content-findings.md');
const TOOLS_FILE = path.join(ROOT, 'src/data/tools.ts');
const OUTPUT_PATH = path.join(ROOT, 'reports/tool-auto-insert-suggestions.md');

// ─── 提取 tools.ts 已有的 GitHub 仓库 ───
function extractExistingRepos() {
  const content = fs.readFileSync(TOOLS_FILE, 'utf8');
  const urlRegex = /url:\s*"https:\/\/github\.com\/([^/"]+)\/([^/"]+)"/g;
  const repos = new Set();
  let m;
  while ((m = urlRegex.exec(content)) !== null) {
    repos.add(`${m[1].toLowerCase()}/${m[2].toLowerCase()}`);
  }
  return repos;
}

// ─── 从研究员报告中解析新工具（支持两种格式）───
function parseNewTools(reportPath) {
  if (!fs.existsSync(reportPath)) {
    console.error(`⚠️ 报告文件不存在: ${reportPath}`);
    return [];
  }

  const content = fs.readFileSync(reportPath, 'utf8');
  const tools = [];

  // ══ 格式 A：### 工具名称 ⭐ 新增（详细报告）══
  const toolSectionRegex = /###\s+(.+?)\s+(?:—\s*(.+?))?\s*⭐\s*新增\s*\n([\s\S]*?)(?=###|\n---|\n$)/g;
  let match;
  while ((match = toolSectionRegex.exec(content)) !== null) {
    const namePart = match[1].trim();
    const descHint = match[2]?.trim() || '';
    const body = match[3];

    const introMatch = body.match(/\*\*简介\*\*[：:]\s*(.+?)(?=\n\*\*|\n$)/s);
    const intro = introMatch ? introMatch[1].trim().replace(/\n/g, ' ').slice(0, 200) : descHint;
    const starsMatch = body.match(/\*\*Stars\*\*[：:]\s*([\d,]+)/);
    const stars = starsMatch ? parseInt(starsMatch[1].replace(/,/g, '')) : 0;
    const urlMatch = body.match(/\*\*URL\*\*[：:]\s*(https:\/\/[^\s]+)/);
    const url = urlMatch ? urlMatch[1] : '';
    const highlightMatch = body.match(/\*\*亮点\*\*[：:]\s*(.+?)(?=\n\*\*|\n$)/s);
    const highlight = highlightMatch ? highlightMatch[1].trim() : '';

    let repo = '';
    if (url.includes('github.com')) {
      const rm = url.match(/github\.com\/([^/]+)\/([^/]+)/);
      if (rm) repo = `${rm[1].toLowerCase()}/${rm[2].toLowerCase()}`;
    }

    tools.push({
      name: namePart.replace(/\s*⭐\s*新增\s*/, '').trim(),
      description: intro, url, stars, repo, highlight,
      tags: extractTags(`${intro} ${highlight}`),
      category: suggestCategory(intro, highlight),
    });
  }

  // ══ 格式 B：1. [name] description → https://...（简洁格式）══
  const newToolsSection = content.match(/🆕\s*新工具[^\n]*：?\s*\n([\s\S]*?)(?=\n\n|\n💡|\n#|$)/);
  if (newToolsSection) {
    const lines = newToolsSection[1].split('\n').filter(l => l.trim());
    for (const line of lines) {
      const itemMatch = line.match(/^\d+\.\s+\[([^\]]+)\]\s+(.+?)→\s*(https:\/\/[^\s]+)/);
      if (!itemMatch) continue;

      const name = itemMatch[1].trim();
      const desc = itemMatch[2].trim();
      const url = itemMatch[3].trim();

      const starsStr = desc.match(/([\d.]+)\s*[Kk]?星/);
      let stars = 0;
      if (starsStr) {
        const num = parseFloat(starsStr[1]);
        stars = desc.toLowerCase().includes('k') ? Math.round(num * 1000) : desc.includes('万') ? Math.round(num * 10000) : num;
      }

      let repo = '';
      if (url.includes('github.com')) {
        const rm = url.match(/github\.com\/([^/]+)\/([^\s/]+)/);
        if (rm) repo = `${rm[1].toLowerCase()}/${rm[2].toLowerCase()}`;
      }

      const alreadyAdded = tools.some(t => t.repo === repo && repo);
      if (!alreadyAdded) {
        tools.push({
          name,
          description: desc.replace(/,\s*[\d.]+\s*[Kk]?星.*/, '').slice(0, 200),
          url, stars, repo, highlight: '',
          tags: extractTags(desc),
          category: suggestCategory(desc, ''),
        });
      }
    }
  }

  return tools;
}

function extractTags(text) {
  const lower = text.toLowerCase();
  const tagMap = {
    'claude code': 'Claude Code', 'claude': 'Claude', 'seo': 'SEO',
    'agent': 'AI Agent', 'llm': 'LLM', '语音': '语音 AI',
    '交易': '量化交易', 'protein': 'AI for Science', '蛋白质': 'AI for Science',
    '推理': '推理加速', 'inference': '推理加速', 'coding': 'AI 编程',
    '编程': 'AI 编程', 'workflow': '工作流', '工作流': '工作流',
    'mcp': 'MCP', 'multi-agent': 'Multi-Agent', '多智能体': 'Multi-Agent',
    '编排': 'Agent 编排', 'orchestrat': 'Agent 编排',
    '金融': '金融科技', 'finance': '金融科技', 'trading': '量化交易',
  };

  const tags = [];
  for (const [keyword, tag] of Object.entries(tagMap)) {
    if (lower.includes(keyword.toLowerCase()) && !tags.includes(tag)) {
      tags.push(tag);
    }
  }
  if (tags.length === 0) tags.push('AI 工具');
  return tags.slice(0, 5);
}

function suggestCategory(intro, highlight) {
  const text = `${intro} ${highlight}`.toLowerCase();
  if (text.includes('claude code') || text.includes('claude')) return 'plugin';
  if (text.includes('agent') || text.includes('智能体')) return 'agent';
  if (text.includes('模型') || text.includes('model') || text.includes('llm')) return 'llm';
  if (text.includes('编程') || text.includes('coding') || text.includes('代码')) return 'dev';
  if (text.includes('语音') || text.includes('speech') || text.includes('voice')) return 'multimodal';
  if (text.includes('蛋白质') || text.includes('protein') || text.includes('科学')) return 'science';
  if (text.includes('交易') || text.includes('trading') || text.includes('金融')) return 'finance';
  return 'framework';
}

function generateToolEntry(tool) {
  const tagsStr = tool.tags.map(t => `"${t}"`).join(', ');
  return `  {
    id: "${tool.repo.replace('/', '-').toLowerCase()}",
    name: "${tool.name}",
    category: "${tool.category}",
    description: "${tool.description}",
    url: "${tool.url}",
    tags: [${tagsStr}],
    price: "开源",
    icon: "🔧",
    pros: [],
    cons: [],
    useCase: "${tool.highlight.slice(0, 100)}",
    learnMore: "${tool.url}",
    githubStars: ${tool.stars},
    updatedAt: "${new Date().toISOString().split('T')[0]}",
    forks: 0,
    createdAt: "",
    language: ""
  },`;
}

// ─── 主流程 ───
function main() {
  console.error('🔧 开始解析研究员发现的新工具...\n');

  const existingRepos = extractExistingRepos();
  console.error(`📦 tools.ts 中已有 ${existingRepos.size} 个 GitHub 项目\n`);

  const discoveredTools = parseNewTools(REPORT_PATH);
  console.error(`🔍 从研究员报告中解析到 ${discoveredTools.length} 个工具推荐\n`);

  if (discoveredTools.length === 0) {
    console.error('✅ 研究员报告中没有新工具推荐，无需收录');
    return;
  }

  const newTools = discoveredTools.filter(t => !t.repo || !existingRepos.has(t.repo));
  const existingTools = discoveredTools.filter(t => t.repo && existingRepos.has(t.repo));

  console.error(`🆕 待收录: ${newTools.length} 个`);
  console.error(`✅ 已收录: ${existingTools.length} 个\n`);

  if (existingTools.length > 0) {
    console.error('已收录的工具:');
    for (const t of existingTools) console.error(`  ✅ ${t.name} (${t.repo})`);
    console.error('');
  }

  if (newTools.length === 0) {
    console.error('✅ 研究员发现的所有工具都已在 tools.ts 中！');
    return;
  }

  let markdown = `# 🛠️ 自动收录建议 — ${new Date().toISOString().split('T')[0]}\n\n`;
  markdown += `> 由脚本自动解析研究员报告生成，需开发 Agent 审查后插入 tools.ts\n\n`;
  markdown += `## 📊 概况\n\n`;
  markdown += `- 研究员推荐工具: ${discoveredTools.length} 个\n`;
  markdown += `- 已收录: ${existingTools.length} 个\n`;
  markdown += `- **待收录: ${newTools.length} 个**\n\n`;

  for (let i = 0; i < newTools.length; i++) {
    const tool = newTools[i];
    markdown += `### ${i + 1}. ${tool.name} (⭐ ${tool.stars.toLocaleString()})\n\n`;
    markdown += `**描述**: ${tool.description}\n\n`;
    markdown += `**分类**: ${tool.category} | **标签**: ${tool.tags.join(', ')}\n\n`;
    if (tool.highlight) markdown += `**亮点**: ${tool.highlight}\n\n`;
    markdown += `**GitHub**: ${tool.repo ? `https://github.com/${tool.repo}` : tool.url}\n\n`;
    markdown += `**插入代码**:\n\n\`\`\`typescript\n${generateToolEntry(tool)}\n\`\`\`\n\n---\n\n`;
  }

  const jsonOutput = {
    timestamp: new Date().toISOString(),
    source: REPORT_PATH,
    totalDiscovered: discoveredTools.length,
    alreadyExist: existingTools.map(t => ({ name: t.name, repo: t.repo })),
    toAdd: newTools.map(t => ({ ...t, entryCode: generateToolEntry(t) })),
  };

  const jsonPath = path.join(ROOT, 'reports/tool-auto-insert-suggestions.json');
  fs.writeFileSync(jsonPath, JSON.stringify(jsonOutput, null, 2));
  fs.writeFileSync(OUTPUT_PATH, markdown);

  console.error(`📋 插入建议已保存到:`);
  console.error(`  - ${OUTPUT_PATH}`);
  console.error(`  - ${jsonPath}\n`);

  console.log(`🆕 发现 ${newTools.length} 个待收录工具:`);
  for (const tool of newTools) {
    console.log(`  ⭐ ${tool.name} — ${tool.description.slice(0, 80)}`);
    console.log(`     分类: ${tool.category} | GitHub: ${tool.repo || 'N/A'}`);
  }
}

main();
