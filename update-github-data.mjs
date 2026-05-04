#!/usr/bin/env node
/**
 * GitHub data updater for ai-master.cc
 * - Fetches stars/forks/language/topics for all repos in tools.ts
 * - Updates tools.ts with fresh data
 * - Discovers new AI topics for ai-topics.json
 */

import { readFileSync, writeFileSync } from 'fs';
import { execSync } from 'child_process';

const TOKEN = execSync(
  "grep GITHUB_TOKEN /Users/xueshuai/.openclaw/workspace/ai-master-site/.env.local | cut -d= -f2"
).toString().trim();

// ── Parse tools.ts to extract repo info ──
const toolsRaw = readFileSync('src/data/tools.ts', 'utf-8');

// Extract {id, url, githubStars, forks, language} for each tool
const toolBlocks = toolsRaw.match(/\{\s*id:\s*"[^"]+"[\s\S]*?\n\s*\}(?=,|\s*\])/g) || [];

const tools = [];
for (const block of toolBlocks) {
  const idMatch = block.match(/id:\s*"([^"]+)"/);
  const nameMatch = block.match(/name:\s*"[^"]+"/);
  const urlMatch = block.match(/url:\s*"https:\/\/github\.com\/([^"]+)"/);
  const starsMatch = block.match(/githubStars:\s*(\d+)/);
  const forksMatch = block.match(/forks:\s*(\d+)/);
  const langMatch = block.match(/language:\s*"[^"]+"/);

  if (idMatch && urlMatch) {
    tools.push({
      id: idMatch[1],
      name: nameMatch ? nameMatch[0].match(/"([^"]+)"/)[1] : idMatch[1],
      repo: urlMatch[1].replace(/\/$/, ''),
      githubStars: starsMatch ? parseInt(starsMatch[1]) : null,
      forks: forksMatch ? parseInt(forksMatch[1]) : null,
      language: langMatch ? langMatch[0].match(/"([^"]+)"/)[1] : null,
      blockText: block
    });
  }
}

console.log(`Found ${tools.length} tools with GitHub repos\n`);

// ── Read existing topics ──
const topicsData = JSON.parse(readFileSync('data/ai-topics.json', 'utf-8'));
const existingTopicsSet = new Set(topicsData.topics.map(t => t.topic.toLowerCase()));

// ── AI keyword matching ──
const AI_KEYWORDS = [
  'ai','ml','dl','llm','nlp','cv','agent','robot','robots','robotics','vision',
  'language','neural','learning','generative','prompt','chatbot','deep-learning',
  'machine-learning','transformer','gpt','diffusion','rag','embedding','inference',
  'fine-tuning','llmops','mlops','model-serving','vector-search','semantic-search',
  'knowledge-graph','multimodal','speech','text-to-speech','image-generation',
  'video-generation','code-generation','autonomous','embodied-ai','world-models',
  'foundation-models','large-language-models','retrieval-augmented','instruction-tuning',
  'rlhf','alignment'
];

function isAITopic(topic) {
  const t = topic.toLowerCase().replace(/_/g, '-');
  return AI_KEYWORDS.some(kw => t.includes(kw));
}

function getChineseDesc(topic) {
  const descs = {
    'agentic-coding': 'Agentic 编程（Agent 驱动编码）',
    'agentic-code': 'Agentic 代码（智能体编码）',
    'agentic-skills': 'Agentic 技能',
    'agentic-engineering': 'Agentic 工程',
    'agentic-agi': 'Agentic AGI',
    'claude-code-agents': 'Claude Code Agent 生态',
    'llm-agent': 'LLM Agent',
    'coding-agents': '编码 Agent',
    'coding-agent': '编码 Agent',
    'llm-local': '本地 LLM',
    'llm-prompting': 'LLM 提示词',
    'llm-app': 'LLM 应用',
    'llm-application': 'LLM 应用',
    'llm-tools': 'LLM 工具',
    'llm-ui': 'LLM 界面',
    'llm-webui': 'LLM Web 界面',
    'llm-eval': 'LLM 评估',
    'llm-evaluation': 'LLM 评估',
    'llm-evaluation-framework': 'LLM 评估框架',
    'llm-memory': 'LLM 记忆系统',
    'llm-gateway': 'LLM 网关',
    'llm-serving': 'LLM 服务化部署',
    'local-llm': '本地 LLM',
    'offline-llm': '离线 LLM',
    'agentic': 'Agentic（智能体化）',
    'agentic-rag': 'Agentic RAG',
    'agentic-workflow': '智能体工作流',
    'agentic-framework': '智能体框架',
    'multi-agent-systems': '多智能体系统',
    'agent-memory': 'Agent 记忆',
    'agent-development': 'Agent 开发',
    'agent-skills': 'Agent 技能',
    'autonomous-agent': '自主 Agent',
    'autonomous-agents': '自主 Agent',
    'agent-evolution': 'Agent 进化',
    'agent-framework': 'Agent 框架',
    'agent-protocol': 'Agent 协议',
    'agent-native': 'Agent 原生',
    'agent-infrastructure': 'Agent 基础设施',
    'agent-collaboration': '智能体协作',
    'agent-harness': 'Agent 操控框架',
    'agent-computer-interface': 'Agent 计算机接口',
    'computer-use-agent': '计算机使用 Agent',
    'gui-agents': 'GUI Agent',
    'deepagents': '深度智能体',
    'custom-ai-agents': '自定义 AI Agent',
    'ai-agents-framework': 'AI Agent 框架',
    'ai-agents-automation': 'AI Agent 自动化',
    'ai-agent-skills': 'AI Agent 技能',
    'agency-agents': 'Agency Agent',
    'background-agents': '后台 Agent',
    'memory-agent': '记忆 Agent',
    'pi-agent': 'Pi Agent',
    'deep-research': '深度研究',
    'deepresearch': '深度研究',
    'context-engineering': '上下文工程',
    'agentic-code': 'Agentic 编码',
    'browser-automation': '浏览器自动化',
    'task-automation': '任务自动化',
    'terminal-ai': '终端 AI',
    'on-device-ai': '端侧 AI',
    'edge-ai': '边缘 AI',
    'ai-native': 'AI 原生',
    'ai-coding': 'AI 编程',
    'ai-application': 'AI 应用',
    'ai-framework': 'AI 框架',
    'ai-frameworks': 'AI 框架',
    'ai-infrastructure': 'AI 基础设施',
    'ai-engineering': 'AI 工程',
    'aiengineering': 'AI 工程',
    'ai-monitoring': 'AI 监控',
    'ai-observability': 'AI 可观测性',
    'ai-integration': 'AI 集成',
    'ai-assistant': 'AI 助手',
    'ai-companion': 'AI 伴侣',
    'ai-tutor': 'AI 导师',
    'ai-workflows': 'AI 工作流',
    'ai-workflow-optimization': 'AI 工作流优化',
    'ai-runtime': 'AI 运行时',
    'ai-sandboxes': 'AI 沙箱',
    'ai-sre': 'AI SRE',
    'ai-gateway': 'AI 网关',
    'llm-observability': 'LLM 可观测性',
    'prompt-management': 'Prompt 管理',
    'prompt-testing': 'Prompt 测试',
    'prompt-governance': 'Prompt 治理',
    'generative-ui': '生成式 UI',
    'voice-ai': '语音 AI',
    'spatial-ai': '空间 AI',
    'multi-agent': '多智能体',
    'multi-agents': '多智能体',
    'multi-agents-collaboration': '多智能体协作',
    'multiagent-systems': '多智能体系统',
    'agentops': 'AgentOps 监控',
    'agents-sdk': 'Agents SDK',
    'agentscope': 'AgentScope 框架',
    'agentscope-runtime': 'AgentScope 运行时',
    'in-context-reinforcement-learning': '上下文内强化学习',
    'mllm': '多模态大语言模型',
    'multimodal-learning': '多模态学习',
    'robot-learning': '机器人学习',
    'embodied': '具身智能',
    'robotic': '机器人',
    'robot': '机器人',
    'reinforcement-learning-algorithms': '强化学习算法',
    'distributed-ml': '分布式 ML',
    'distributed-training': '分布式训练',
    'model-parallelism': '模型并行',
    'heterogeneous-training': '异构训练',
    'mcp-gateway': 'MCP 网关',
    'mcp-security': 'MCP 安全',
    'mcp-apps': 'MCP 应用',
    'mcp-host': 'MCP 主机',
    'mcp-inspector': 'MCP 检查器',
    'mcp-ui': 'MCP 界面',
    'mcp-client': 'MCP 客户端',
    'model-router': '模型路由器',
    'model-context-protocol-servers': 'MCP 服务器',
    'remote-mcp-server': '远程 MCP 服务器',
    'self-evolution': '自进化',
    'context-retrieval': '上下文检索',
    'memory-retrieval': '记忆检索',
    'multi-modal-rag': '多模态 RAG',
    'speech-processing': '语音处理',
    'audio-generation': '音频生成',
    'text-generation': '文本生成',
    'image2image': '图生图',
    'text2image': '文生图',
    'image-to-video': '图生视频',
    'wan-video': 'Wan 视频生成',
    'creative-tools': '创意工具',
    'code-execution': '代码执行',
    'code-interpreter': '代码解释器',
    'code-analysis': '代码分析',
    'code-search': '代码搜索',
    'codebase-generation': '代码库生成',
    'codegen': '代码生成',
    'codegenerator': '代码生成器',
    'terminal-automation': '终端自动化',
    'codex-cli': 'Codex CLI',
    'codex-skills': 'Codex 技能',
    'context-database': '上下文数据库',
    'context-mode': '上下文模式',
    'awesome-claude-code': 'Awesome Claude Code',
    'claude-code-best-practices': 'Claude Code 最佳实践',
    'claude-code-commands': 'Claude Code 命令',
    'claude-code-hooks': 'Claude Code 钩子',
    'claude-code-plugin': 'Claude Code 插件',
    'claude-code-plugins': 'Claude Code 插件',
    'claude-code-skill': 'Claude Code 技能',
    'headless-browser': '无头浏览器',
    'voice-clone': '语音克隆',
    'tts-model': 'TTS 模型',
    'desktop-automation': '桌面自动化',
    'cli-tool': 'CLI 工具',
    'model-hub': '模型中心',
    'big-model': '大模型',
    'large-scale': '大规模模型',
    'tokens': 'Token 优化',
    'harness': 'Harness 框架',
    'interactive-learning': '交互式学习',
    'workflow-automation': '工作流自动化',
    'job-search': '求职自动化',
    'web-search': '网络搜索',
    'image-search': '图像搜索',
    'pdf-to-json': 'PDF 转 JSON',
    'nearest-neighbor-search': '最近邻搜索',
    'vector-similarity': '向量相似度',
    'vector-store': '向量存储',
    'vector-index': '向量索引',
    'app-search': '应用搜索',
    'enterprise-search': '企业搜索',
    'full-text-search': '全文搜索',
    'fuzzy-search': '模糊搜索',
    'hybrid-search': '混合搜索',
    'search-as-you-type': '即时搜索',
    'site-search': '站内搜索',
    'typo-tolerance': '容错搜索',
    'code-free': '无代码',
    'quant-models': '量化模型',
    'image-classification': '图像分类',
    'yolo-world': 'YOLO World 检测',
    'deepface': 'DeepFace 人脸',
    'deepfakes': 'Deepfake',
    'gigapixel-images': '十亿像素图像',
    'image-upscaling': '图像超分',
    'topaz': 'Topaz 图像增强',
    'torchaudio': 'TorchAudio',
    'search-api': '搜索 API',
    'firecrawl-ai': 'Firecrawl AI',
    'langchain4j': 'LangChain4j（Java版）',
    'azure-openai': 'Azure OpenAI',
    'litellm': 'LiteLLM 生态',
    'openai-proxy': 'OpenAI 代理',
    'chatgpt-on-wechat': 'ChatGPT 微信',
    'linkai': 'LinkAI',
    'models': '模型生态',
    'chat': '对话',
    'chinese-language': '中文语言处理',
    'english-language': '英语语言处理',
    'mlx': 'Apple MLX 框架',
    'yaml': 'YAML 配置',
    'ts': 'TypeScript',
    'c': 'C 语言',
    'copilot-chat': 'Copilot Chat',
    'no-code': '无代码平台',
    'low-code': '低代码平台',
    'low-code-platform': '低代码平台',
    'developer-tools': '开发工具',
    'microsoft-for-beginners': '微软初学者教程',
    'deepseek-api': 'DeepSeek API',
    'brain-computer-interface': '脑机接口',
    'deepseek': 'DeepSeek 生态',
    'codex': 'Codex 生态',
    'opencode': 'OpenCode 开源',
    'gpt-5': 'GPT-5 生态',
    'autogen-ecosystem': 'AutoGen 生态',
    'auditable-ai': '可审计 AI',
    'model-serving': '模型服务化',
    'ai-safety': 'AI 安全',
  };
  return descs[topic] || `${topic}（AI 相关）`;
}

// ── Fetch GitHub API data ──
const fetchResults = [];
let successCount = 0;

for (let i = 0; i < tools.length; i++) {
  const tool = tools[i];
  const url = `https://api.github.com/repos/${tool.repo}`;
  try {
    const resp = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${TOKEN}`,
        'User-Agent': 'ai-master-site-bot',
        'Accept': 'application/vnd.github.v3+json'
      }
    });

    if (resp.status === 403) {
      const resetTime = resp.headers.get('x-ratelimit-reset');
      const waitMs = resetTime ? (parseInt(resetTime) - Math.floor(Date.now() / 1000) + 5) * 1000 : 60000;
      console.log(`⏳ Rate limited, waiting ${Math.round(waitMs / 1000)}s...`);
      await new Promise(r => setTimeout(r, waitMs));
      i--; // retry
      continue;
    }

    if (!resp.ok) {
      console.log(`⚠️  ${tool.repo}: HTTP ${resp.status}`);
      fetchResults.push({ ...tool, error: true });
      continue;
    }

    const data = await resp.json();
    const newStars = data.stargazers_count;
    const newForks = data.forks_count;
    const newLanguage = data.language;
    const newPushedAt = data.pushed_at ? data.pushed_at.split('T')[0] : null;
    const newTopics = data.topics || [];

    const starsChanged = tool.githubStars !== null && newStars !== tool.githubStars;
    const forksChanged = tool.forks !== null && newForks !== tool.forks;
    const langChanged = tool.language !== newLanguage;
    const dateChanged = newPushedAt && tool.blockText.includes('updatedAt') &&
      !tool.blockText.includes(`"${newPushedAt}"`);

    fetchResults.push({
      ...tool,
      newStars,
      newForks,
      newLanguage,
      newPushedAt,
      newTopics,
      starsChanged,
      forksChanged,
      langChanged,
      error: false
    });

    const changes = [];
    if (starsChanged) changes.push(`★ ${tool.githubStars} → ${newStars} (${newStars - tool.githubStars > 0 ? '+' : ''}${newStars - tool.githubStars})`);
    if (forksChanged) changes.push(`forks ${tool.forks} → ${newForks}`);
    if (langChanged) changes.push(`lang ${tool.language} → ${newLanguage}`);
    if (dateChanged) changes.push(`updated ${newPushedAt}`);

    if (changes.length > 0) {
      console.log(`✏️  ${tool.name} (${tool.repo}): ${changes.join(', ')}`);
    } else {
      console.log(`✅ ${tool.name} (${tool.repo}): no changes`);
    }
    successCount++;

  } catch (e) {
    console.log(`❌ ${tool.repo}: ${e.message}`);
    fetchResults.push({ ...tool, error: true });
  }

  // Rate limiting: ~1.2s between requests (5000/hr = ~1.4 req/s, be conservative)
  if (i < tools.length - 1) {
    await new Promise(r => setTimeout(r, 1200));
  }
}

console.log(`\n✅ Fetched ${successCount}/${tools.length} repos successfully\n`);

// ── Analyze topics ──
const allTopics = new Map(); // topic -> count of repos using it

for (const r of fetchResults.filter(x => !x.error)) {
  for (const t of r.newTopics) {
    const normalized = t.toLowerCase().replace(/\s+/g, '-');
    allTopics.set(normalized, (allTopics.get(normalized) || 0) + 1);
  }
}

// Find new AI topics not in existing set
const newAITopics = [];
for (const [topic, count] of allTopics) {
  if (existingTopicsSet.has(topic)) continue;
  if (isAITopic(topic)) {
    // Skip if too obscure: only 1 repo and that repo has <1000 stars
    const repoUsingIt = fetchResults.find(r => !r.error && r.newTopics.map(t => t.toLowerCase().replace(/\s+/g, '-')).includes(topic));
    if (count === 1 && repoUsingIt && repoUsingIt.newStars < 1000) continue;
    newAITopics.push({ topic, count });
  }
}

newAITopics.sort((a, b) => b.count - a.count);

console.log(`📊 Topics analysis:`);
console.log(`   Total unique topics from repos: ${allTopics.size}`);
console.log(`   Already in ai-topics.json: ${topicsData.topics.length}`);
console.log(`   New AI topics discovered: ${newAITopics.length}`);
if (newAITopics.length > 0) {
  for (const t of newAITopics) {
    console.log(`   + ${t.topic} (${t.count} repos)`);
  }
}

// ── Generate updated tools.ts ──
let updatedTools = toolsRaw;
let starsUpdated = 0;
let forksUpdated = 0;
let langUpdated = 0;

for (const r of fetchResults.filter(x => !x.error)) {
  // We need to be careful here - modify the block text
  // Find the block for this tool and update it
}

// Better approach: write a Node script that does string replacement
// But tools.ts is complex with indentation. Let's use a different strategy.

// Save all data for the next step
const updateData = {
  fetchResults: fetchResults.map(r => ({
    id: r.id,
    name: r.name,
    repo: r.repo,
    githubStars: r.githubStars,
    newStars: r.newStars,
    forks: r.forks,
    newForks: r.newForks,
    language: r.language,
    newLanguage: r.newLanguage,
    starsChanged: r.starsChanged,
    forksChanged: r.forksChanged,
    langChanged: r.langChanged,
    newPushedAt: r.newPushedAt,
    newTopics: r.newTopics,
    error: r.error
  })),
  newAITopics,
  allTopics: Object.fromEntries(allTopics),
  existingTopicsCount: topicsData.topics.length
};

writeFileSync('/tmp/github-update-data.json', JSON.stringify(updateData, null, 2));

// Now do the actual file modifications
let toolsContent = readFileSync('src/data/tools.ts', 'utf-8');
const lines = toolsContent.split('\n');

// Track which tools need updating
const starsUpdates = [];
const forksUpdates = [];
const langUpdates = [];
const dateUpdates = [];

for (const r of fetchResults.filter(x => !x.error)) {
  if (r.starsChanged) {
    starsUpdates.push({ id: r.id, old: r.githubStars, new: r.newStars, name: r.name });
  }
  if (r.forksChanged) {
    forksUpdates.push({ id: r.id, old: r.forks, new: r.newForks, name: r.name });
  }
  if (r.langChanged) {
    langUpdates.push({ id: r.id, old: r.language, new: r.newLanguage, name: r.name });
  }
}

// Apply updates line by line
let currentId = null;
const outputLines = [];
let modified = false;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  const idMatch = line.match(/id:\s*"([^"]+)"/);
  if (idMatch) currentId = idMatch[1];

  // Check for githubStars update
  const starsMatch = line.match(/^(\s*)githubStars:\s*(\d+)/);
  if (starsMatch && currentId) {
    const r = fetchResults.find(x => x.id === currentId && !x.error);
    if (r && r.starsChanged) {
      outputLines.push(line.replace(/githubStars:\s*\d+/, `githubStars: ${r.newStars}`));
      modified = true;
      continue;
    }
  }

  // Check for forks update or addition
  const forksMatch = line.match(/^(\s*)forks:\s*(\d+)/);
  if (forksMatch && currentId) {
    const r = fetchResults.find(x => x.id === currentId && !x.error);
    if (r) {
      if (r.forksChanged || (r.forks !== null && r.forks !== r.newForks)) {
        outputLines.push(line.replace(/forks:\s*\d+/, `forks: ${r.newForks}`));
        modified = true;
        continue;
      }
    }
  }

  // Check for language update or addition
  const langMatch = line.match(/^(\s*)language:\s*"[^"]*"/);
  if (langMatch && currentId) {
    const r = fetchResults.find(x => x.id === currentId && !x.error);
    if (r && r.langChanged) {
      outputLines.push(line.replace(/language:\s*"[^"]*"/, `language: "${r.newLanguage}"`));
      modified = true;
      continue;
    }
  }

  // Check for updatedAt update
  const dateMatch = line.match(/^(\s*)updatedAt:\s*"([^"]+)"/);
  if (dateMatch && currentId) {
    const r = fetchResults.find(x => x.id === currentId && !x.error);
    if (r && r.newPushedAt && dateMatch[2] !== r.newPushedAt) {
      outputLines.push(line.replace(/updatedAt:\s*"[^"]+"/, `updatedAt: "${r.newPushedAt}"`));
      modified = true;
      continue;
    }
  }

  outputLines.push(line);
}

// Add missing forks fields
for (const r of fetchResults.filter(x => !x.error && x.forks === null && x.newForks !== null)) {
  // Find the tool's block and add forks after githubStars
  const idx = outputLines.findIndex(l => l.includes(`id: "${r.id}"`));
  if (idx !== -1) {
    // Find the line with githubStars
    const starsIdx = outputLines.findIndex((l, i) => i > idx && l.includes('githubStars'));
    if (starsIdx !== -1) {
      // Insert forks after the githubStars line
      const indent = outputLines[starsIdx].match(/^(\s*)/)[1];
      outputLines.splice(starsIdx + 1, 0, `${indent}forks: ${r.newForks},`);
      modified = true;
      forksUpdates.push({ id: r.id, old: null, new: r.newForks, name: r.name });
    }
  }
}

// Add missing language fields
for (const r of fetchResults.filter(x => !x.error && x.language === null && x.newLanguage !== null)) {
  const idx = outputLines.findIndex(l => l.includes(`id: "${r.id}"`));
  if (idx !== -1) {
    // Find the last field in the block before the closing }
    let insertIdx = -1;
    for (let j = idx; j < outputLines.length; j++) {
      if (outputLines[j].trim().startsWith('}')) {
        insertIdx = j;
        break;
      }
    }
    if (insertIdx !== -1) {
      // Insert before the closing }
      const indent = '    ';
      const prevLine = outputLines[insertIdx - 1];
      if (!prevLine.trim().endsWith(',')) {
        outputLines[insertIdx - 1] = prevLine.trimEnd() + ',';
      }
      outputLines.splice(insertIdx, 0, `${indent}language: "${r.newLanguage}"`);
      modified = true;
      langUpdates.push({ id: r.id, old: null, new: r.newLanguage, name: r.name });
    }
  }
}

if (modified) {
  writeFileSync('src/data/tools.ts', outputLines.join('\n'));
  console.log('✏️  tools.ts updated');
} else {
  console.log('✅ tools.ts: no changes needed');
}

// ── Update ai-topics.json ──
if (newAITopics.length > 0) {
  const now = new Date().toISOString();
  for (const nt of newAITopics) {
    let minStars;
    if (nt.count >= 3) minStars = 2000;
    else if (nt.count >= 2) minStars = 3000;
    else minStars = 5000;

    topicsData.topics.push({
      topic: nt.topic,
      url: `https://github.com/topics/${nt.topic}`,
      minStars,
      description: `（自动发现）${getChineseDesc(nt.topic)}`
    });
  }
  topicsData.lastUpdated = now;
  writeFileSync('data/ai-topics.json', JSON.stringify(topicsData, null, 2));
  console.log(`✏️  ai-topics.json: added ${newAITopics.length} new topics (total: ${topicsData.topics.length})`);
} else {
  console.log('✅ ai-topics.json: no new topics');
}

// ── Summary ──
console.log('\n=== SUMMARY ===');
console.log(`Scanned repos: ${tools.length}`);
console.log(`Stars updated: ${starsUpdates.length}`);
console.log(`Forks updated: ${forksUpdates.length}`);
console.log(`Languages updated: ${langUpdates.length}`);
console.log(`New AI topics: ${newAITopics.length}`);

if (starsUpdates.length > 0) {
  console.log('\nBiggest star changes:');
  starsUpdates.sort((a, b) => Math.abs(b.new - b.old) - Math.abs(a.new - a.old));
  for (const s of starsUpdates.slice(0, 5)) {
    console.log(`  ${s.name}: ${s.old} → ${s.new} (${s.new - s.old > 0 ? '+' : ''}${s.new - s.old})`);
  }
}
