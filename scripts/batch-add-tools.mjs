/**
 * 批量收录遗漏的 GitHub 高星项目到 tools.ts
 * 读取 missing-projects-report.json，自动添加到 tools.ts
 */

import { readFileSync, writeFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const TOOLS_FILE = path.join(ROOT, 'src/data/tools.ts');
const REPORT_FILE = path.join(ROOT, 'data/missing-projects-report.json');

// 分类映射 —— 必须与 src/data/tools.ts 中 toolCategories 一致
const categoryMap = {
  'llm': 'model',
  'large-language-models': 'model',
  'ai-agent': 'agent',
  'ai-chatbot': 'agent',
  'chatbot': 'agent',
  'langchain': 'framework',
  'llm-framework': 'framework',
  'ai-tooling': 'framework',
  'mcp': 'mcp',
  'model-context-protocol': 'mcp',
  'vector-database': 'rag',
  'knowledge-graph': 'rag',
  'computer-vision': 'multimodal',
  'multimodal': 'multimodal',
  'text-to-image': 'multimodal',
  'text-to-video': 'multimodal',
  'stable-diffusion': 'multimodal',
  'diffusion-models': 'multimodal',
  'vision-language-model': 'multimodal',
  'speech-recognition': 'multimodal',
  'text-to-speech': 'multimodal',
  'ai-search': 'rag',
  'ai-safety': 'mlops',
  'alignment': 'mlops',
  'edge-ai': 'mlops',
  'llmops': 'mlops',
  'fine-tuning': 'training',
  'prompt-engineering': 'learn'
};

function suggestCategory(topics) {
  if (!topics || topics.length === 0) return 'llm';
  for (const topic of topics) {
    if (categoryMap[topic]) return categoryMap[topic];
  }
  return 'llm';
}

// 提取 tools.ts 中已有的 GitHub 仓库
function extractExistingRepos(content) {
  const urlRegex = /url:\s*"https:\/\/github\.com\/([^/"]+)\/([^/"]+)"/g;
  const repos = new Set();
  let m;
  while ((m = urlRegex.exec(content)) !== null) {
    repos.add(`${m[1].toLowerCase()}/${m[2].toLowerCase()}`);
  }
  return repos;
}

// 从项目名称推断图标
function guessIcon(name, category) {
  const n = name.toLowerCase();
  if (n.includes('lang') || n.includes('chat')) return '💬';
  if (n.includes('agent')) return '🦾';
  if (n.includes('rag') || n.includes('retrieval')) return '🔍';
  if (n.includes('vector') || n.includes('db')) return '🔍';
  if (n.includes('vision') || n.includes('image')) return '👁️';
  if (n.includes('speech') || n.includes('voice') || n.includes('tts')) return '🎤';
  if (n.includes('mcp') || n.includes('browser')) return '🔌';
  if (category === 'app') return '💬';
  if (category === 'coding') return '💻';
  if (category === 'agent') return '🦾';
  if (category === 'framework') return '⚙️';
  if (category === 'workflow') return '🔀';
  if (category === 'rag') return '🔍';
  if (category === 'multimodal') return '🎨';
  if (category === 'mcp') return '🔌';
  if (category === 'training') return '🎯';
  if (category === 'data') return '📊';
  if (category === 'mlops') return '🚀';
  if (category === 'model') return '🤖';
  if (category === 'learn') return '📚';
  return '🛠️';
}

function main() {
  // 读取报告
  const report = JSON.parse(readFileSync(REPORT_FILE, 'utf8'));
  const missingProjects = report.missingProjects;
  
  console.log(`📦 报告中有 ${missingProjects.length} 个遗漏项目`);
  
  // 读取现有 tools.ts
  let content = readFileSync(TOOLS_FILE, 'utf8');
  const existingRepos = extractExistingRepos(content);
  
  console.log(`📋 tools.ts 中已有 ${existingRepos.size} 个 GitHub 项目`);
  
  // 过滤掉已经存在的（可能脚本运行期间又添加了）
  const toAdd = missingProjects.filter(p => !existingRepos.has(p.fullName.toLowerCase()));
  
  console.log(`🆕 需要添加 ${toAdd.length} 个新项目\n`);
  
  if (toAdd.length === 0) {
    console.log('✅ 没有需要添加的项目');
    process.exit(0);
  }
  
  // 生成新的工具条目
  const newEntries = toAdd.map(p => {
    const category = p.suggestedCategory || suggestCategory(p.topics);
    const icon = guessIcon(p.name, category);
    const tags = (p.topics || []).slice(0, 5);
    
    return `  {
    id: "${p.fullName.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase()}",
    name: "${p.name}",
    category: "${category}",
    description: "${(p.description || '').replace(/"/g, '\\"').slice(0, 200)}",
    url: "https://github.com/${p.fullName}",
    tags: ${JSON.stringify(tags)},
    price: "开源",
    icon: "${icon}",
    githubStars: ${p.stars},
    forks: ${p.forks},
    language: "${p.language || 'Unknown'}",
    updatedAt: "${new Date().toISOString().split('T')[0]}",
  }`;
  });
  
  // 找到 tools 数组的末尾
  // 可能是 ] as Tool[]; 或者只是 ];
  let endIndex = content.lastIndexOf('] as Tool[];');
  if (endIndex === -1) {
    endIndex = content.lastIndexOf('];');
  }
  if (endIndex === -1) {
    console.error('❌ 无法找到 tools 数组结尾');
    process.exit(1);
  }
  
  // 在 ] 之前插入新条目
  const before = content.slice(0, endIndex);
  const after = content.slice(endIndex);
  
  const newContent = before + ',\n' + newEntries.join(',\n') + '\n' + after;
  
  writeFileSync(TOOLS_FILE, newContent, 'utf8');
  
  console.log(`✅ 成功添加 ${toAdd.length} 个新项目到 tools.ts`);
  console.log('\n新增项目列表：');
  toAdd.forEach((p, i) => {
    console.log(`  ${i + 1}. ${p.fullName} ⭐${p.stars.toLocaleString()}`);
  });
}

main();
