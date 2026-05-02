#!/usr/bin/env node
// Update GitHub stars, forks, language, updatedAt, and discover new AI topics

import { readFileSync, writeFileSync } from 'fs';

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const TOOLS_FILE = 'src/data/tools.ts';
const TOPICS_FILE = 'data/ai-topics.json';

const AI_KEYWORDS = [
  'ai','ml','dl','llm','nlp','cv','agent','robot','robots','robotics',
  'vision','language','neural','learning','generative','prompt','chatbot',
  'deep-learning','machine-learning','transformer','gpt','diffusion','rag',
  'embedding','inference','fine-tuning','llmops','mlops','model-serving',
  'vector-search','semantic-search','knowledge-graph','multimodal','speech',
  'text-to-speech','image-generation','video-generation','code-generation',
  'autonomous','embodied-ai','world-models','foundation-models',
  'large-language-models','retrieval-augmented','instruction-tuning','rlhf',
  'alignment'
];

function extractRepos(content) {
  const repos = [];
  const seen = new Set();
  for (const m of content.matchAll(/url:\s*"https:\/\/github\.com\/([^"]+)"/g)) {
    const full = m[1];
    if (full.includes('/features/') || full.split('/').length < 3) continue;
    const key = full.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    repos.push(full);
  }
  return repos;
}

// Parse tool blocks with brace-aware tracking
function parseTools(content) {
  const tools = [];
  // Find each { id: "..." block start
  const idRegex = /\{\s*\n\s*id:\s*["']([^"']+)["']/g;
  let idMatch;
  while ((idMatch = idRegex.exec(content)) !== null) {
    const id = idMatch[1];
    const startIdx = idMatch.index;
    
    // Find the matching closing } at depth 0 relative to this block
    let depth = 0;
    let endIdx = startIdx;
    let inString = false;
    let escapeNext = false;
    let found = false;
    
    for (let i = startIdx; i < content.length; i++) {
      const ch = content[i];
      
      if (escapeNext) { escapeNext = false; continue; }
      
      if (ch === '\\' && inString) { escapeNext = true; continue; }
      if (ch === '"' && !escapeNext) { inString = !inString; continue; }
      if (inString) continue;
      
      if (ch === '{') { depth++; if (depth === 1) endIdx = i; }
      else if (ch === '}') {
        depth--;
        if (depth === 0) {
          endIdx = i + 1;
          found = true;
          break;
        }
      }
    }
    
    if (!found) continue;
    
    const block = content.substring(startIdx, endIdx);
    
    // Check if this block has a GitHub URL
    const urlMatch = block.match(/url:\s*"https:\/\/github\.com\/([^"]+)"/);
    if (!urlMatch) continue;
    const rawRepo = urlMatch[1];
    // Skip non-repo URLs (features pages, org pages)
    if (rawRepo.includes('/features/') || rawRepo.split('/').length < 2) continue;
    const starsMatch = block.match(/githubStars:\s*(\d+)/);
    const forksMatch = block.match(/forks:\s*(\d+)/);
    const langMatch = block.match(/language:\s*["']([^"']+)["']/);
    const updatedMatch = block.match(/updatedAt:\s*["']([^"']+)["']/);
    const nameMatch = block.match(/name:\s*["']([^"']+)["']/);
    
    tools.push({
      id,
      name: nameMatch ? nameMatch[1] : rawRepo,
      repo: rawRepo,
      block,
      startIndex: startIdx,
      endIndex: endIdx,
      stars: starsMatch ? parseInt(starsMatch[1]) : null,
      forks: forksMatch ? parseInt(forksMatch[1]) : null,
      language: langMatch ? langMatch[1] : null,
      updatedAt: updatedMatch ? updatedMatch[1] : null,
    });
  }
  return tools;
}

async function fetchRepo(repo) {
  const url = `https://api.github.com/repos/${repo}`;
  try {
    const resp = await fetch(url, {
      headers: {
        'User-Agent': 'ai-master-site-updater',
        'Authorization': `Bearer ${GITHUB_TOKEN}`
      }
    });
    if (!resp.ok) {
      console.error(`  ❌ ${repo}: HTTP ${resp.status}`);
      return null;
    }
    const data = await resp.json();
    return {
      stars: data.stargazers_count ?? 0,
      pushedAt: data.pushed_at ? data.pushed_at.split('T')[0] : null,
      forks: data.forks_count ?? 0,
      language: data.language || null,
      topics: (data.topics || []).map(t => t.toLowerCase())
    };
  } catch (err) {
    console.error(`  ❌ ${repo}: ${err.message}`);
    return null;
  }
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function isAiRelated(topic) {
  const t = topic.toLowerCase();
  return AI_KEYWORDS.some(kw => {
    if (t === kw) return true;
    const parts = t.split(/[-_\s]+/);
    const kwParts = kw.split(/[-_\s]+/);
    return kwParts.some(kp => parts.some(p => p === kp || p.startsWith(kp)));
  });
}

const TOPIC_DESC = {
  'agentic-coding':'Agentic 编程','ai-coding':'AI 编程','code-generation':'代码生成',
  'coding-agent':'编码 Agent','coding-agents':'编码 Agent',
  'llm-eval':'LLM 评估','llm-evaluation':'LLM 评估',
  'deep-research':'深度研究','deepresearch':'深度研究',
  'context-engineering':'上下文工程',
  'agent-memory':'Agent 记忆','llm-memory':'LLM 记忆','memory-agent':'记忆 Agent',
  'llm-application':'LLM 应用','llm-app':'LLM 应用','ai-application':'AI 应用',
  'ai-native':'AI 原生','on-device-ai':'端侧 AI','edge-ai':'边缘 AI',
  'spatial-ai':'空间 AI','generative-ui':'生成式 UI','voice-ai':'语音 AI',
  'ai-tutor':'AI 导师','ai-companion':'AI 伴侣','ai-assistant':'AI 助手',
  'agent-infrastructure':'Agent 基础设施','ai-infrastructure':'AI 基础设施',
  'ai-runtime':'AI 运行时','ai-gateway':'AI 网关','llm-gateway':'LLM 网关',
  'llm-observability':'LLM 可观测性','ai-monitoring':'AI 监控',
  'ai-observability':'AI 可观测性',
  'prompt-management':'提示词管理','prompt-governance':'提示词治理',
  'prompt-testing':'提示词测试','ai-governance':'AI 治理',
  'ai-safety':'AI 安全','llm-security':'LLM 安全','auditable-ai':'可审计 AI',
  'llm-tools':'LLM 工具','ai-tooling':'AI 工具链','ai-tools':'AI 工具',
  'terminal-ai':'终端 AI','cli-tool':'CLI 工具',
  'agentic-engineering':'Agentic 工程','agentic-rag':'Agentic RAG',
  'agentic-workflow':'Agentic 工作流','agent-collaboration':'Agent 协作',
  'agent-framework':'Agent 框架','agent-protocol':'Agent 协议',
  'agent-evolution':'Agent 进化',
  'multi-agent-systems':'多智能体系统','multi-agents-collaboration':'多智能体协作',
  'agents-sdk':'Agent SDK','agentic-skills':'Agentic 技能',
  'agentic-agi':'Agentic AGI','agent-native':'Agent 原生',
  'background-agents':'后台 Agent','computer-use-agent':'计算机使用 Agent',
  'gui-agents':'GUI Agent','llm-agent':'LLM Agent','agent-harness':'Agent Harness',
  'agentscope':'AgentScope 生态','agentscope-runtime':'AgentScope 运行时',
  'workflow-automation':'工作流自动化','task-automation':'任务自动化',
  'agentic-code':'Agentic 代码','agentic-framework':'Agentic 框架',
  'custom-ai-agents':'自定义 AI Agent','ai-agents-framework':'AI Agent 框架',
  'ai-agents-automation':'AI Agent 自动化',
  'browser-automation':'浏览器自动化','ai-crawler':'AI 爬虫',
  'ai-scraping':'AI 数据采集',
  'ai-image-generation':'AI 图像生成','ai-video-generation':'AI 视频生成',
  'ai-art-generator':'AI 艺术生成',
  'deepfake':'Deepfake','deep-fake':'Deepfake',
  'real-time-deepfake':'实时 Deepfake','realtime-deepfake':'实时 Deepfake',
  'video-deepfake':'视频 Deepfake','deep-face-swap':'深度换脸',
  'voice-clone':'语音克隆','tts-model':'TTS 模型',
  'speech-synthesis':'语音合成','speech-to-text':'语音转文字',
  'speech-processing':'语音处理',
  'multi-modal-rag':'多模态 RAG','multimodal-learning':'多模态学习',
  'computer-vision':'计算机视觉','image-recognition':'图像识别',
  'image-processing':'图像处理','object-detection':'目标检测',
  'document-image-analysis':'文档图像分析',
  'document-image-processing':'文档图像处理',
  'brain-computer-interface':'脑机接口',
  'agent-computer-interface':'Agent 计算机界面',
  'multi-model':'多模型统一','offline-llm':'离线 LLM','llm-prompting':'LLM 提示词',
  'agentic':'Agentic','agent-development':'Agent 开发',
  'model-parallelism':'模型并行','distributed-training':'分布式训练',
  'distributed-ml':'分布式 ML','heterogeneous-training':'异构训练',
  'interactive-learning':'交互式学习','robot-learning':'机器人学习',
  'embodied':'具身智能','knowledge-curation':'知识策展',
  'information-retrieval':'信息检索','context-retrieval':'上下文检索',
  'sentence-embeddings':'句子嵌入','text-semantic-similarity':'文本语义相似度',
  'search-engine':'搜索引擎','search-api':'搜索 API','ai-search':'AI 搜索',
  'code-search':'代码搜索','llm-serving':'LLM 服务化','model-serving':'模型服务化',
  'model-router':'模型路由','mcp-gateway':'MCP 网关','mcp-client':'MCP 客户端',
  'mcp-security':'MCP 安全','mcp-apps':'MCP 应用','mcp-host':'MCP 主机',
  'mcp-inspector':'MCP 检查器','mcp-ui':'MCP 界面',
  'model-context-protocol-servers':'MCP 服务器',
  'llm-ui':'LLM UI','llm-webui':'LLM WebUI','chat-ui':'对话界面',
  'generativeai':'生成式 AI','gen-ai':'生成式 AI','genai':'生成式 AI',
  'generative-ai-tools':'生成式 AI 工具',
  'ai-framework':'AI 框架','ai-frameworks':'AI 框架',
  'ai-workflow-optimization':'AI 工作流优化','ai-workflows':'AI 工作流',
  'ai-integration':'AI 集成','llm-framework':'LLM 框架',
  'llmops':'LLMOps','mlops':'MLOps','aiengineering':'AI 工程',
  'ai4science':'AI for Science','ai-sre':'AI SRE',
  'workflow-orchestration':'工作流编排',
  'desktop-automation':'桌面自动化','terminal-automation':'终端自动化',
  'multi-platform':'跨平台','codebase-generation':'代码库生成',
  'codegen':'代码生成','headless-browser':'无头浏览器',
  'no-code':'无代码','low-code':'低代码',
  'chatgpt-on-wechat':'微信 ChatGPT','linkai':'LinkAI',
  'agency-agents':'Agency Agent','small-specialized-models':'小型专用模型',
  'data-pipelines':'数据管道','datasets':'数据集',
  'model-management':'模型管理','orchestration':'编排','evaluation':'评估',
  'tokens':'Token 优化','codex-skills':'Codex 技能',
  'context-database':'上下文数据库',
  'awesome-claude-code':'Awesome Claude Code',
  'claude-code-agents':'Claude Code Agent',
  'claude-code-hooks':'Claude Code 钩子',
  'claude-code-plugins':'Claude Code 插件',
  'claude-code-plugin':'Claude Code 插件',
  'claude-code-skill':'Claude Code 技能','context-mode':'上下文模式',
  'conversational-ai':'对话式 AI','mistral':'Mistral 模型','webui':'WebUI',
  'retrieval-systems':'检索系统','retrieval':'检索',
  'langchain4j':'LangChain4j','azure-openai':'Azure OpenAI',
  'litellm':'LiteLLM','openai-proxy':'OpenAI 代理',
  'llm-local':'本地 LLM','local-llm':'本地 LLM',
  'agent-ops':'Agent 运维','multimodal':'多模态',
  'agent-skills':'Agent 技能','autonomous-agent':'自主 Agent',
};

function describeTopic(topic) {
  return TOPIC_DESC[topic] || `（自动发现）${topic}`;
}

async function main() {
  const content = readFileSync(TOOLS_FILE, 'utf-8');
  const tools = parseTools(content);
  // Deduplicate repos
  const repoMap = new Map();
  for (const t of tools) {
    const key = t.repo.toLowerCase();
    if (!repoMap.has(key)) repoMap.set(key, t.repo);
  }
  const repos = [...repoMap.values()];
  console.log(`📦 共 ${repos.length} 个仓库（${tools.length} 个工具块）`);
  
  const topicsData = JSON.parse(readFileSync(TOPICS_FILE, 'utf-8'));
  const existingTopics = new Set(topicsData.topics.map(t => t.topic.toLowerCase()));
  console.log(`📋 已有 ${existingTopics.size} 个 topic`);
  
  // Fetch all repos sequentially with 1.1s delay
  const results = [];
  for (let i = 0; i < repos.length; i++) {
    if (i > 0) await sleep(700);
    if (i % 10 === 0) console.log(`⏳ ${i}/${repos.length}`);
    const data = await fetchRepo(repos[i]);
    if (data) results.push({ repo: repos[i], ...data });
  }
  
  console.log(`✅ 成功获取 ${results.length}/${repos.length} 个仓库数据\n`);
  
  // Update tool blocks (reverse order to preserve indices)
  const sortedTools = [...tools].sort((a, b) => b.startIndex - a.startIndex);
  let starsUpdated = 0, forksUpdated = 0, languageUpdated = 0, updatedAtUpdated = 0;
  const starChanges = [];
  let oldestUpdate = { name: '', days: 0 };
  let contentChanged = false;
  let newContent = content;
  
  for (const tool of sortedTools) {
    const r = results.find(x => x.repo.toLowerCase() === tool.repo.toLowerCase());
    if (!r) continue;
    
    let block = tool.block;
    
    // Update stars
    if (tool.stars !== null && tool.stars !== r.stars) {
      const diff = r.stars - tool.stars;
      starChanges.push({ name: tool.name, diff, old: tool.stars, new: r.stars });
      block = block.replace(/githubStars:\s*\d+/, `githubStars: ${r.stars}`);
      starsUpdated++;
      contentChanged = true;
    }
    
    // Update forks
    if (r.forks > 0 && tool.forks !== r.forks) {
      if (tool.forks !== null) {
        block = block.replace(/forks:\s*\d+/, `forks: ${r.forks}`);
      } else {
        if (block.includes('language:')) {
          block = block.replace(/(language:\s*"[^"]+")/, `forks: ${r.forks},\n      $1`);
        } else if (block.includes('createdAt:')) {
          block = block.replace(/(createdAt:\s*"[^"]+")/, `forks: ${r.forks},\n      $1`);
        } else {
          block = block.replace(/(githubStars:\s*\d+)/, `$1,\n      forks: ${r.forks}`);
        }
      }
      forksUpdated++;
      contentChanged = true;
    }
    
    // Update language
    if (r.language && r.language !== 'None' && tool.language !== r.language) {
      if (tool.language) {
        block = block.replace(/language:\s*"[^"]*"/, `language: "${r.language}"`);
      } else {
        block = block.replace(/(githubStars:\s*\d+)/, `$1,\n      language: "${r.language}"`);
      }
      languageUpdated++;
      contentChanged = true;
    }
    
    // Update updatedAt
    if (r.pushedAt) {
      if (tool.updatedAt) {
        block = block.replace(/updatedAt:\s*"[^"]*"/, `updatedAt: "${r.pushedAt}"`);
      } else {
        block = block.replace(/(githubStars:\s*\d+)/, `$1,\n      updatedAt: "${r.pushedAt}"`);
      }
      updatedAtUpdated++;
      contentChanged = true;
      
      const daysAgo = Math.floor((Date.now() - new Date(r.pushedAt).getTime()) / 86400000);
      if (daysAgo > oldestUpdate.days) {
        oldestUpdate = { name: tool.name, days: daysAgo };
      }
    }
    
    if (block !== tool.block) {
      newContent = newContent.substring(0, tool.startIndex) + block + newContent.substring(tool.endIndex);
    }
  }
  
  if (contentChanged) {
    writeFileSync(TOOLS_FILE, newContent);
    console.log(`✅ tools.ts 已更新`);
  } else {
    console.log(`✅ tools.ts 无变化`);
  }
  
  // Collect topics
  const allTopics = {};
  for (const r of results) {
    for (const topic of r.topics) {
      const key = topic.toLowerCase().replace(/\s+/g, '-');
      if (!allTopics[key]) allTopics[key] = { count: 0, maxStars: 0, repos: [] };
      allTopics[key].count++;
      allTopics[key].maxStars = Math.max(allTopics[key].maxStars, r.stars);
      allTopics[key].repos.push(r.repo);
    }
  }
  
  // Find new AI topics
  const newTopics = [];
  for (const [key, info] of Object.entries(allTopics)) {
    if (existingTopics.has(key)) continue;
    if (info.count === 1 && info.maxStars < 1000) continue;
    if (isAiRelated(key)) {
      let minStars = info.count >= 3 ? 2000 : info.count >= 2 ? 3000 : 5000;
      newTopics.push({
        topic: key,
        url: `https://github.com/topics/${key}`,
        minStars,
        description: describeTopic(key),
        _count: info.count,
        _maxStars: info.maxStars,
        _repos: info.repos.slice(0, 3)
      });
    }
  }
  
  if (newTopics.length > 0) {
    console.log(`🔍 发现 ${newTopics.length} 个新的 AI Topic`);
    topicsData.topics.push(...newTopics.map(({ _count, _maxStars, _repos, ...rest }) => rest));
    topicsData.lastUpdated = new Date().toISOString();
    writeFileSync(TOPICS_FILE, JSON.stringify(topicsData, null, 2) + '\n');
    console.log(`✅ ai-topics.json → ${topicsData.topics.length} 个 topic`);
  } else {
    console.log(`✅ 未发现新的 AI Topic`);
  }
  
  const summary = {
    totalRepos: repos.length,
    successfulFetches: results.length,
    starsUpdated,
    forksUpdated,
    languageUpdated,
    updatedAtUpdated,
    starChanges: starChanges.sort((a, b) => Math.abs(b.diff) - Math.abs(a.diff)).slice(0, 5),
    oldestUpdate,
    newTopicsCount: newTopics.length,
    newTopics: newTopics.map(t => ({
      topic: t.topic,
      description: t.description,
      repoCount: t._count,
      maxStars: t._maxStars,
      sampleRepos: t._repos
    })),
    existingTopicsCount: existingTopics.size,
    totalTopicsAfter: topicsData.topics.length
  };
  
  console.log('\n📊 SUMMARY_JSON_START');
  console.log(JSON.stringify(summary, null, 2));
  console.log('📊 SUMMARY_JSON_END');
}

main().catch(err => { console.error('Fatal:', err); process.exit(1); });
