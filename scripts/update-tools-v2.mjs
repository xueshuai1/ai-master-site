#!/usr/bin/env node
/**
 * Cleanly update tools.ts:
 * 1. Update stars/forks for existing repos
 * 2. Append new repos before the closing ];
 * 
 * Uses line-by-line processing to avoid regex issues.
 */
import fs from 'fs';

const TOOLS_PATH = 'src/data/tools.ts';
let lines = fs.readFileSync(TOOLS_PATH, 'utf-8').split('\n');

// ── Config ──
const STAR_UPDATES = {
  'ollama/ollama': { githubStars: 171542, forks: 16151 },
  'openclaw/openclaw': { githubStars: 372423, forks: 77170 },
  'n8n-io/n8n': { githubStars: 188189, forks: 57697 },
  'Significant-Gravitas/AutoGPT': { githubStars: 184354, forks: 46233 },
  'langgenius/dify': { githubStars: 141601, forks: 22238 },
  'NousResearch/hermes-agent': { githubStars: 153333, forks: 24439 },
  'browser-use/browser-use': { githubStars: 94192, forks: 10642 },
  'karpathy/autoresearch': { githubStars: 81390, forks: 11836 },
  'OpenHands/OpenHands': { githubStars: 73758, forks: 9333 },
  'FoundationAgents/MetaGPT': { githubStars: 68025, forks: 8674 },
  'bytedance/deer-flow': { githubStars: 68003, forks: 9056 },
  'virattt/ai-hedge-fund': { githubStars: 58878, forks: 10350 },
  'mem0ai/mem0': { githubStars: 55867, forks: 6358 },
  'crewAIInc/crewAI': { githubStars: 51533, forks: 7128 },
  'huggingface/transformers': { githubStars: 160665, forks: 33232 },
  'langchain-ai/langchain': { githubStars: 136897, forks: 22645 },
  'langflow-ai/langflow': { githubStars: 148254, forks: 9002 },
  'vllm-project/vllm': { githubStars: 80202, forks: 16857 },
  'BerriAI/litellm': { githubStars: 47225, forks: 8105 },
  'anthropics/claude-code': { githubStars: 124145, forks: 20450 },
  'google-gemini/gemini-cli': { githubStars: 104133, forks: 13678 },
  'openai/codex': { githubStars: 83087, forks: 12044 },
  'ComposioHQ/composio': { githubStars: 28281, forks: 4565 },
  'CopilotKit/CopilotKit': { githubStars: 31460, forks: 4066 },
  'supabase/supabase': { githubStars: 102461, forks: 12421 },
  'farion1231/cc-switch': { githubStars: 72618, forks: 4705 },
  'open-webui/open-webui': { githubStars: 137350, forks: 19601 },
  'affaan-m/everything-claude-code': { githubStars: 184523, forks: 28494 },
  'mintplex-labs/anything-llm': { githubStars: 60130, forks: 6503 },
  'lencx/ChatGPT': { githubStars: 54375, forks: 6172 },
  'upstash/context7': { githubStars: 55446, forks: 2632 },
  'jingyaogong/minimind': { githubStars: 49983, forks: 6357 },
  'mudler/LocalAI': { githubStars: 46292, forks: 4084 },
  'danielmiessler/Fabric': { githubStars: 41734, forks: 4140 },
};

// Normalize repo slug for matching
function normalizeRepo(url) {
  const m = url.match(/github\.com\/(.+?)['",]/);
  if (!m) return null;
  return m[1].toLowerCase();
}

// Parse tool blocks from lines
// Find where tools array starts (export const tools) and ends (];)
let toolsStartLine = -1;
let toolsEndLine = -1;

for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('export const tools: Tool[] = [')) {
    toolsStartLine = i;
  }
}

// Find the last ];
for (let i = lines.length - 1; i >= 0; i--) {
  if (lines[i].trim() === '];') {
    toolsEndLine = i;
    break;
  }
}

console.log(`Tools array: lines ${toolsStartLine} to ${toolsEndLine}`);

// Parse individual tool blocks (each starts with { and ends with },)
const blocks = [];
let inTools = false;
let currentBlock = [];
let blockStartLine = -1;

for (let i = toolsStartLine; i <= toolsEndLine; i++) {
  const line = lines[i];
  
  if (line.trim() === '{') {
    if (currentBlock.length === 0) {
      inTools = true;
      blockStartLine = i;
      currentBlock = [line];
    }
  } else if (inTools && line.trim() === '},') {
    currentBlock.push(line);
    blocks.push({
      start: blockStartLine,
      end: i,
      lines: [...currentBlock],
    });
    currentBlock = [];
    inTools = false;
  } else if (inTools) {
    currentBlock.push(line);
  }
}

console.log(`Parsed ${blocks.length} tool blocks`);

// Now process each block
let updatesApplied = 0;
const newLines = [...lines];

for (const block of blocks) {
  // Find the URL line
  const urlLine = block.lines.find(l => l.includes('url:') && l.includes('github.com'));
  if (!urlLine) continue;
  
  const repo = normalizeRepo(urlLine);
  if (!repo) continue;
  
  const update = STAR_UPDATES[repo];
  if (!update) continue;
  
  // Apply updates to the block's lines
  const updatedLines = block.lines.map(line => {
    // Update githubStars
    if (update.githubStars !== undefined && /githubStars:/.test(line)) {
      return line.replace(/githubStars:\s*\d+/, `githubStars: ${update.githubStars}`);
    }
    // Update forks
    if (update.forks !== undefined && /forks:/.test(line)) {
      return line.replace(/forks:\s*\d+/, `forks: ${update.forks}`);
    }
    return line;
  });
  
  // Replace lines in newLines
  for (let j = 0; j < block.lines.length; j++) {
    newLines[block.start + j] = updatedLines[j];
  }
  
  updatesApplied++;
}

// ── Insert new entries before the closing ]; ──
const NEW_REPOS = [
  {
    id: 'pageindex', name: 'PageIndex', category: 'rag',
    description: '无向量RAG文档索引方案，基于推理的检索替代传统向量数据库。PageIndex利用大模型的推理能力实现精准的文档检索，无需向量数据库即可构建高效的RAG系统。GitHub 31K+ stars，是RAG领域的新突破',
    url: 'https://github.com/VectifyAI/PageIndex',
    tags: ['无向量RAG', '推理检索', '文档索引', '开源'],
    price: '开源', icon: '📑',
    githubStars: 31469, updatedAt: '2026-05-16',
    pros: ['无需向量数据库即可实现RAG', '基于推理的检索更精准', '开源免费', '31K+ stars 社区活跃'],
    cons: ['相对较新项目，生态仍在建设', '大规模文档索引性能待验证', '文档和示例较少'],
    useCase: '企业文档检索、知识库问答、无向量数据库的RAG系统',
    learnMore: 'https://github.com/VectifyAI/PageIndex',
    forks: 2688, language: 'Python', createdAt: '2025-04-01T10:53:54Z',
  },
  {
    id: 'bettafish', name: 'BettaFish', category: 'agent',
    description: '微舆：多Agent舆情分析助手，打破信息茧房，还原舆情原貌，预测未来走向。从0实现，不依赖任何框架。40K+ stars，支持多Agent协作进行舆情分析、情感预测和趋势分析，是中文场景下舆情分析的代表作',
    url: 'https://github.com/666ghj/BettaFish',
    tags: ['舆情分析', '多Agent', '中文优化', '独立实现'],
    price: '开源', icon: '🐟',
    githubStars: 40921, updatedAt: '2026-05-08',
    pros: ['从零实现不依赖框架', '多Agent协作舆情分析', '中文场景深度优化', '40K+ stars 社区活跃'],
    cons: ['主要面向中文舆情场景', '非通用Agent框架', '预测准确性需人工验证'],
    useCase: '舆情监控分析、公共事件趋势预测、市场调研辅助',
    learnMore: 'https://github.com/666ghj/BettaFish',
    forks: 7560, language: 'Python', createdAt: '2024-07-01T13:11:38Z',
  },
  {
    id: 'kilocode', name: 'KiloCode', category: 'coding',
    description: '最受欢迎的开源编程Agent平台。Build, ship, and iterate faster with the most popular open source coding agent。支持 Claude、Gemini、Sonnet 等多模型，VS Code 和 JetBrains 双IDE集成，19K+ stars 增长迅猛',
    url: 'https://github.com/Kilo-Org/kilocode',
    tags: ['编程Agent', '开源', 'VS Code', 'JetBrains', '多模型'],
    price: '开源', icon: '⚡',
    githubStars: 19347, updatedAt: '2026-05-16',
    pros: ['最受欢迎的开源编程Agent', '支持 VS Code 和 JetBrains', '多模型支持 Claude/Gemini/Sonnet', '19K+ stars 增长迅速'],
    cons: ['相对 Claude Code 生态较小', '企业级部署案例较少', '文档仍在完善中'],
    useCase: '日常编程辅助、代码生成与审查、自动化调试',
    learnMore: 'https://github.com/Kilo-Org/kilocode',
    forks: 2541, language: 'TypeScript', createdAt: '2025-03-10T15:34:26Z',
  },
  {
    id: 'serena', name: 'Serena', category: 'mcp',
    description: '为AI Agent打造的MCP编码工具集，提供语义检索和编辑能力。Serena是Agent的IDE，支持 JetBrains 和语言服务器协议，让AI Agent拥有深度理解代码库和精准编辑的能力。24K+ stars',
    url: 'https://github.com/oraios/serena',
    tags: ['MCP', '语义检索', '编码工具', 'JetBrains'],
    price: '开源', icon: '🎵',
    githubStars: 24293, updatedAt: '2026-05-16',
    pros: ['为Agent打造的IDE级编码工具', '语义检索和编辑能力', '支持 JetBrains 和语言服务器', '24K+ stars'],
    cons: ['主要面向Python生态', 'IDE集成需要配置', '复杂项目可能需要额外工具'],
    useCase: 'AI Agent 编码辅助、代码语义检索、大规模代码编辑',
    learnMore: 'https://github.com/oraios/serena',
    forks: 1629, language: 'Python', createdAt: '2025-03-23T22:35:24Z',
  },
  {
    id: 'code-review-graph', name: 'Code Review Graph', category: 'coding',
    description: 'Claude Code的本地知识图谱工具，构建代码库的持久化映射图。让Claude只读取关键代码，代码审查Token消耗降低6.8倍，日常编码降低49倍。16K+ stars，是AI编程效率的关键加速器',
    url: 'https://github.com/tirth8205/code-review-graph',
    tags: ['代码审查', '知识图谱', 'Claude Code', 'Token优化'],
    price: '开源', icon: '🕸️',
    githubStars: 16620, updatedAt: '2026-05-16',
    pros: ['代码库知识图谱持久化', 'Token消耗降低6.8-49倍', '与Claude Code深度集成', '16K+ stars'],
    cons: ['主要针对Claude Code生态', '知识图谱构建需要时间', '大规模代码库性能待验证'],
    useCase: 'AI代码审查加速、代码库理解、日常编码辅助',
    learnMore: 'https://github.com/tirth8205/code-review-graph',
    forks: 1807, language: 'Python', createdAt: '2026-02-26T17:25:13Z',
  },
  {
    id: 'alibaba-deepresearch', name: 'Tongyi Deep Research', category: 'agent',
    description: '通义实验室开源的深度研究Agent，领先的开源深度研究解决方案。支持信息检索、综合分析和结构化报告生成，是AI自主研究能力的前沿探索。18K+ stars',
    url: 'https://github.com/Alibaba-NLP/DeepResearch',
    tags: ['深度研究', '阿里巴巴', '开源', 'Web Agent'],
    price: '开源', icon: '🔬',
    githubStars: 18879, updatedAt: '2026-02-27',
    pros: ['通义实验室出品', '领先的开源深度研究Agent', '信息检索和综合分析能力强', '18K+ stars'],
    cons: ['主要面向英文研究场景', '需要较强的LLM支持', '大规模研究消耗较多token'],
    useCase: '学术深度研究、行业分析报告、信息搜集与综合',
    learnMore: 'https://github.com/Alibaba-NLP/DeepResearch',
    forks: 1455, language: 'Python', createdAt: '2025-01-09T11:07:35Z',
  },
  {
    id: 'aris', name: 'ARIS', category: 'agent',
    description: 'Auto-Research-In-Sleep — 轻量级Markdown技能包，让AI Agent在睡眠中自主进行ML研究。支持跨模型review循环、创意发现和实验自动化。无框架锁定，兼容 Claude Code、Codex、OpenClaw 等任意LLM Agent。9.4K+ stars',
    url: 'https://github.com/wanshuiyin/Auto-claude-code-research-in-sleep',
    tags: ['自主研究', 'Claude Code', 'ML研究', '技能包'],
    price: '开源', icon: '⚔️',
    githubStars: 9485, updatedAt: '2026-05-16',
    pros: ['轻量级Markdown技能包', '跨模型review循环', '无框架锁定兼容多Agent', '9.4K+ stars 快速增长'],
    cons: ['主要面向ML研究场景', '需要Claude Code等Agent平台', '实验自动化需一定ML基础'],
    useCase: '自主ML研究、论文评审自动化、实验创意发现',
    learnMore: 'https://github.com/wanshuiyin/Auto-claude-code-research-in-sleep',
    forks: 906, language: 'Python', createdAt: '2026-03-10T07:31:45Z',
  },
];

function makeEntry(tool) {
  const lines = [];
  lines.push('  {');
  for (const [key, val] of Object.entries(tool)) {
    if (key === 'tags' || key === 'pros' || key === 'cons') {
      lines.push(`    ${key}: ${JSON.stringify(val)},`);
    } else if (typeof val === 'number') {
      lines.push(`    ${key}: ${val},`);
    } else {
      lines.push(`    ${key}: ${JSON.stringify(val)},`);
    }
  }
  lines.push('  },');
  return lines;
}

// Insert new entries before the closing ];
const insertLines = NEW_REPOS.flatMap((t, i) => {
  const entryLines = makeEntry(t);
  // Add blank line between entries (but not after the last one before ])
  if (i < NEW_REPOS.length - 1) {
    return [...entryLines, ''];
  }
  return entryLines;
});

newLines.splice(toolsEndLine, 0, ...insertLines, '');

fs.writeFileSync(TOOLS_PATH, newLines.join('\n'));

console.log(`✅ Applied ${updatesApplied} star updates, added ${NEW_REPOS.length} new repos`);
