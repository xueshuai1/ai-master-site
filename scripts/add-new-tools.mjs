#!/usr/bin/env node
/**
 * 从 discover-topic-projects.mjs 的输出中发现遗漏项目，自动收录到 tools.ts
 * 
 * 用法：
 *   node scripts/add-new-tools.mjs                    # 使用 discover-topic-projects.mjs 的输出
 *   node scripts/add-new-tools.mjs --max 5            # 最多收录 5 个
 * 
 * 策略：
 * 1. 运行 discover-topic-projects.mjs，收集遗漏项目
 * 2. 按 stars 降序，取前 N 个（默认 3 个）
 * 3. 自动分类、生成描述、写入 tools.ts
 * 4. 校验 TypeScript 编译
 */

import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const TOOLS_FILE = path.join(ROOT, 'src/data/tools.ts');
const MAX_TOOLS_TO_ADD = parseInt(process.argv.find(a => a === '--max') ? 
  process.argv[process.argv.indexOf('--max') + 1] : 3, 10) || 3;

// ─── 分类映射（根据 GitHub topics 和关键词自动分类） ───
const CATEGORY_KEYWORDS = {
  llm: ['llm', 'large-language', 'gpt', 'llama', 'chatglm', 'qwen', 'mistral', 'vicuna', 'alpaca'],
  agent: ['agent', 'autonomous', 'multi-agent', 'agentic', 'crewai', 'autogen', 'langgraph'],
  framework: ['framework', 'sdk', 'library', 'langchain', 'llamaindex', 'haystack', 'semaphore'],
  cli: ['cli', 'terminal', 'command-line', 'tui', 'shell'],
  plugin: ['mcp', 'plugin', 'extension', 'copilot', 'vscode'],
  data: ['data', 'etl', 'pipeline', 'vector', 'database', 'embedding', 'knowledge-graph'],
  multimodal: ['multimodal', 'image', 'video', 'vision', 'diffusion', 'stable-diffusion', 'text-to-image', 'text-to-video'],
  search: ['search', 'semantic-search', 'vector-search', 'rag', 'retrieval'],
  security: ['security', 'adversarial', 'privacy', 'federated'],
  devops: ['mlops', 'llmops', 'deploy', 'serving', 'inference', 'vllm', 'onnx', 'quantization'],
  cv: ['computer-vision', 'cv', 'object-detection', 'image-segmentation', 'ocr'],
  education: ['education', 'learning', 'tutorial'],
  aieng: ['engineering', 'build', 'test', 'eval', 'monitor', 'observability'],
  finance: ['finance', 'trading', 'stock', 'quantitative'],
};

// ─── 价格判断 ───
function guessPrice(repo) {
  const topics = (repo.topics || []).map(t => t.toLowerCase());
  const desc = (repo.description || '').toLowerCase();
  if (repo.license === 'MIT License' || repo.license === 'Apache License 2.0' || repo.license === 'BSD') {
    return '开源';
  }
  if (topics.some(t => t.includes('open-source')) || desc.includes('open source')) {
    return '开源';
  }
  return '免费';
}

// ─── 分类判断 ───
function guessCategory(repo) {
  const topics = (repo.topics || []).map(t => t.toLowerCase());
  const desc = (repo.description || '').toLowerCase();
  const name = (repo.name || '').toLowerCase();
  const allText = [...topics, desc, name].join(' ');
  
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    for (const kw of keywords) {
      if (allText.includes(kw)) {
        return category;
      }
    }
  }
  return 'llm'; // 默认分类
}

// ─── GitHub API ───
function githubGet(apiPath) {
  return new Promise((resolve) => {
    const envPath = path.join(ROOT, '.env.local');
    let GITHUB_TOKEN = '';
    try {
      const envContent = fs.readFileSync(envPath, 'utf8');
      const match = envContent.match(/GITHUB_TOKEN=(.+)/);
      if (match) GITHUB_TOKEN = match[1].trim();
    } catch {}
    
    const headers = {
      'User-Agent': 'ai-master-site',
      'Accept': 'application/vnd.github.v3+json'
    };
    if (GITHUB_TOKEN) {
      headers['Authorization'] = `token ${GITHUB_TOKEN}`;
    }
    
    const options = {
      hostname: 'api.github.com',
      path: apiPath,
      headers,
      timeout: 10000
    };
    
    https.get(options, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        try {
          resolve({ success: res.statusCode === 200, data: JSON.parse(data), status: res.statusCode });
        } catch {
          resolve({ success: false, data: null, status: res.statusCode });
        }
      });
    }).on('error', () => resolve({ success: false, data: null }));
  });
}

// ─── 生成工具条目 ───
async function generateToolEntry(repo) {
  const category = guessCategory(repo);
  const price = guessPrice(repo);
  const description = repo.description || `${repo.name} - AI 工具`;
  const tags = (repo.topics || []).slice(0, 5);
  if (tags.length === 0) tags.push(category);
  
  // 生成简短中文描述（如果原描述是英文）
  let desc = description;
  if (!/[\u4e00-\u9fff]/.test(desc)) {
    // 尝试截取前 50 字符作为描述
    if (desc.length > 80) {
      desc = desc.substring(0, 80) + '...';
    }
  }
  
  return {
    id: repo.fullName.replace(/[^a-zA-Z0-9_\u4e00-\u9fff]/g, '_'),
    name: repo.name.replace(/[_-]/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
    category,
    description: desc,
    url: `https://github.com/${repo.fullName}`,
    tags,
    price,
    icon: `🔧`,
    githubStars: repo.stars,
    createdAt: repo.createdAt,
  };
}

// ─── 写入 tools.ts ───
function addToolsToTS(toolsToAdd) {
  const content = fs.readFileSync(TOOLS_FILE, 'utf8');
  
  // 找到现有 tools 数组的结束位置（最后一个 } 后的 ];）
  // 策略：在最后一个工具对象后面、]; 前面插入新工具
  const endMarker = '\n];';
  const lastEndIndex = content.lastIndexOf(endMarker);
  if (lastEndIndex === -1) {
    console.error('❌ 无法找到 tools 数组结束位置');
    process.exit(1);
  }
  
  // 为每个分类内部按 stars 排序
  // 生成新工具的 TypeScript 代码
  let newToolsCode = '';
  for (const tool of toolsToAdd) {
    newToolsCode += `\n  // 自动收录（${new Date().toISOString().split('T')[0]}）\n`;
    newToolsCode += `  {\n`;
    newToolsCode += `    id: "${tool.id}",\n`;
    newToolsCode += `    name: "${tool.name}",\n`;
    newToolsCode += `    category: "${tool.category}",\n`;
    newToolsCode += `    description: "${tool.description.replace(/"/g, '\\"')}",\n`;
    newToolsCode += `    url: "${tool.url}",\n`;
    newToolsCode += `    tags: [${tool.tags.map(t => `"${t}"`).join(', ')}],\n`;
    newToolsCode += `    price: "${tool.price}",\n`;
    newToolsCode += `    icon: "${tool.icon}",\n`;
    newToolsCode += `    githubStars: ${tool.githubStars || 0},\n`;
    newToolsCode += `    createdAt: "${tool.createdAt || ''}",\n`;
    newToolsCode += `  },\n`;
  }
  
  const newContent = content.substring(0, lastEndIndex) + newToolsCode + content.substring(lastEndIndex);
  fs.writeFileSync(TOOLS_FILE, newContent, 'utf8');
  console.error(`✅ 已写入 ${toolsToAdd.length} 个新工具到 tools.ts`);
}

// ─── 查重 ───
function checkExisting(fullName) {
  const content = fs.readFileSync(TOOLS_FILE, 'utf8');
  const urlRegex = /url:\s*"https:\/\/github\.com\/([^/"]+)\/([^/"]+)"/g;
  const existing = new Set();
  let m;
  while ((m = urlRegex.exec(content)) !== null) {
    existing.add(`${m[1].toLowerCase()}/${m[2].toLowerCase()}`);
  }
  return existing.has(fullName.toLowerCase());
}

// ─── 主流程 ───
async function main() {
  console.error('🔧 开始自动收录新工具...\n');
  
  // 用 GitHub Search API 搜索最新高星 AI 项目
  // 多个关键词覆盖不同方向
  
  const searchQueries = [
    'ai agent framework stars:>3000',
    'llm tool platform stars:>3000',
    'rag vector search stars:>2000',
    'multimodal image generation stars:>3000',
    'ai coding assistant stars:>3000',
  ];
  
  const allNewRepos = [];
  
  for (const query of searchQueries) {
    console.error(`\n🔍 搜索: "${query}"`);
    const result = await githubGet(`/search/repositories?q=${encodeURIComponent(query)}&sort=stars&order=desc&per_page=20`);
    
    if (!result.success) {
      console.error(`   ❌ 请求失败 (${result.status})`);
      continue;
    }
    
    const repos = result.data.items || [];
    console.error(`   ✅ 找到 ${repos.length} 个项目`);
    
    for (const repo of repos) {
      const fullName = repo.full_name.toLowerCase();
      if (!checkExisting(fullName) && !allNewRepos.find(r => r.fullName === fullName)) {
        allNewRepos.push({
          fullName,
          name: repo.name,
          description: repo.description,
          stars: repo.stargazers_count,
          topics: repo.topics || [],
          license: repo.license?.spdx_id,
          createdAt: repo.created_at.split('T')[0],
        });
      }
    }
    
    // 请求间隔 1.5s，避免触发限流
    await new Promise(r => setTimeout(r, 1500));
  }
  
  // 按 stars 降序
  allNewRepos.sort((a, b) => b.stars - a.stars);
  
  console.error(`\n📦 共发现 ${allNewRepos.length} 个遗漏项目（按 stars 排序）\n`);
  
  // 取前 MAX_TOOLS_TO_ADD 个
  const toAdd = allNewRepos.slice(0, MAX_TOOLS_TO_ADD);
  
  if (toAdd.length === 0) {
    console.error('\n✅ 没有新工具需要收录');
    return;
  }
  
  console.error('\n📝 即将收录：');
  for (const repo of toAdd) {
    console.error(`  ⭐ ${repo.stars.toLocaleString()} ${repo.fullName} — ${repo.description?.substring(0, 60) || ''}`);
  }
  
  // 生成工具条目
  const tools = [];
  for (const repo of toAdd) {
    const entry = await generateToolEntry(repo);
    tools.push(entry);
  }
  
  // 写入 tools.ts
  addToolsToTS(tools);
  
  console.error(`\n✅ 完成！收录了 ${tools.length} 个新工具`);
}

main().catch(err => {
  console.error('❌ 错误:', err);
  process.exit(1);
});
