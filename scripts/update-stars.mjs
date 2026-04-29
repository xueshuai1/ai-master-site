#!/usr/bin/env node
/**
 * Batch update GitHub stars/forks/language in tools.ts + discover new AI topics
 */
import { readFileSync, writeFileSync } from 'fs';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

const __dir = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dir, '..');
const TOOLS = resolve(ROOT, 'src/data/tools.ts');
const TOPICS = resolve(ROOT, 'data/ai-topics.json');
const SUMMARY = resolve(ROOT, 'scripts/summary.json');
const TOKEN_LINE = readFileSync(resolve(ROOT, '.env.local'), 'utf-8').match(/GITHUB_TOKEN=(.+)/)?.[1]?.trim();
if (!TOKEN_LINE) { console.error('No GITHUB_TOKEN'); process.exit(1); }
const TOKEN = TOKEN_LINE;

// Extract repos from url lines
const content = readFileSync(TOOLS, 'utf-8');
const lines = content.split('\n');

// Map: id -> ownerRepo (parse from url lines after id lines)
const repos = new Map();
let curId = null;
for (const line of lines) {
  const idM = line.match(/id:\s*["']([^"']+)["']/);
  if (idM) curId = idM[1];
  const urlM = line.match(/url:\s*["']https?:\/\/github\.com\/([^/]+\/[^/]+)["']/);
  if (urlM && curId) repos.set(curId, urlM[1]);
}
console.log(`Found ${repos.size} repos\n`);

// Load existing topics
const topicsData = JSON.parse(readFileSync(TOPICS, 'utf-8'));
const existingTopics = new Set(topicsData.topics.map(t => t.topic.toLowerCase()));

// Fetch all repos
const repoData = new Map();
const allTopics = new Map();
let i = 0;

for (const [id, ownerRepo] of repos) {
  i++;
  try {
    const resp = await fetch(`https://api.github.com/repos/${ownerRepo}`, {
      headers: {
        'Authorization': `Bearer ${TOKEN}`,
        'Accept': 'application/vnd.github+json',
        'User-Agent': 'ai-master-bot'
      }
    });
    if (!resp.ok) {
      console.log(`[${i}/${repos.size}] ${id} ❌ ${resp.status}`);
      repoData.set(id, null);
      await new Promise(r => setTimeout(r, 1000));
      continue;
    }
    const json = await resp.json();
    const info = {
      stars: json.stargazers_count,
      pushed_at: json.pushed_at,
      forks: json.forks_count ?? 0,
      language: json.language,
      topics: (json.topics || []).map(t => t.toLowerCase())
    };
    repoData.set(id, info);
    for (const t of info.topics) allTopics.set(t, (allTopics.get(t) || 0) + 1);
    console.log(`[${i}/${repos.size}] ${id} ⭐${info.stars} 🍴${info.forks} ${info.language || '—'}`);
  } catch (e) {
    console.log(`[${i}/${repos.size}] ${id} ❌ ${e.message}`);
    repoData.set(id, null);
  }
  await new Promise(r => setTimeout(r, 1000));
}

// Build update map: find current values in file and compare
// Strategy: for each tool, find the line indices and build a replacement map
const updates = new Map(); // id -> {stars?, forks?, language?, pushed_at?}
const starsChanges = [];

// First pass: extract old values per tool
const oldValues = new Map();
let tid = null, blockStart = null;
let inTool = false;

for (let li = 0; li < lines.length; li++) {
  const line = lines[li];
  const idM = line.match(/id:\s*["']([^"']+)["']/);
  if (idM) { tid = idM[1]; blockStart = li; }
  
  if (tid) {
    const starsM = line.match(/githubStars:\s*(\d+)/);
    if (starsM && !oldValues.has(tid)) oldValues.set(tid, { lineIdx: li, stars: parseInt(starsM[1]) });
    
    const forksM = line.match(/^\s*forks:\s*(\d+)/);
    if (forksM && oldValues.has(tid)) {
      const ov = oldValues.get(tid);
      ov.forksLine = li;
      ov.forks = parseInt(forksM[1]);
    }
    
    const langM = line.match(/language:\s*["']([^"']+)["']/);
    if (langM && oldValues.has(tid)) {
      const ov = oldValues.get(tid);
      ov.langLine = li;
      ov.language = langM[1];
    }
    
    const updatedM = line.match(/updatedAt:\s*["']([^"']+)["']/);
    if (updatedM && oldValues.has(tid)) {
      const ov = oldValues.get(tid);
      ov.updatedLine = li;
      ov.updatedAt = updatedM[1];
    }
  }
}

// Second pass: compute updates
for (const [id, info] of repoData) {
  if (!info) continue;
  const ov = oldValues.get(id);
  if (!ov) continue;
  
  const up = {};
  
  if (info.stars !== ov.stars) {
    up.stars = { line: ov.lineIdx, new: info.stars, old: ov.stars };
    starsChanges.push({ id, old: ov.stars, new: info.stars, delta: info.stars - ov.stars });
  }
  if (info.forks !== ov.forks) {
    up.forks = { line: ov.forksLine ?? -1, new: info.forks, old: ov.forks };
  }
  const cleanOldLang = (ov.language && ov.language !== 'null' && ov.language !== 'None' && ov.language !== 'N/A') ? ov.language : null;
  const cleanNewLang = (info.language && info.language !== 'null' && info.language !== 'None') ? info.language : null;
  if (cleanNewLang && cleanNewLang !== cleanOldLang) {
    up.language = { line: ov.langLine ?? -1, new: cleanNewLang };
  }
  if (info.pushed_at) {
    const newDate = info.pushed_at.split('T')[0];
    if (ov.updatedAt && ov.updatedAt !== newDate) {
      up.pushed_at = { line: ov.updatedLine ?? -1, new: newDate };
    }
  }
  
  if (Object.keys(up).length > 0) updates.set(id, up);
}

// Apply updates
let starsCount = 0, forksCount = 0, langCount = 0;
for (const [id, up] of updates) {
  if (up.stars) { lines[up.stars.line] = lines[up.stars.line].replace(/githubStars:\s*\d+/, `githubStars: ${up.stars.new}`); starsCount++; }
  if (up.forks) {
    if (up.forks.line >= 0) {
      lines[up.forks.line] = lines[up.forks.line].replace(/forks:\s*\d+/, `forks: ${up.forks.new}`);
    } else {
      // Insert forks - find the line with githubStars and insert after
      const ov = oldValues.get(id);
      if (ov) lines.splice(ov.lineIdx + 1, 0, `    forks: ${up.forks.new},`);
    }
    forksCount++;
  }
  if (up.language) {
    if (up.language.line >= 0) {
      lines[up.language.line] = lines[up.language.line].replace(/language:\s*["'][^"']*["']/, `language: "${up.language.new}"`);
    } else {
      const ov = oldValues.get(id);
      if (ov) lines.splice(ov.lineIdx + 1, 0, `    language: "${up.language.new}",`);
    }
    langCount++;
  }
  if (up.pushed_at) {
    lines[up.pushed_at.line] = lines[up.pushed_at.line].replace(/updatedAt:\s*["'][^"']+["']/, `updatedAt: "${up.pushed_at.new}"`);
  }
}

if (updates.size > 0) {
  writeFileSync(TOOLS, lines.join('\n'));
  console.log(`\n✅ tools.ts updated: ${starsCount} stars, ${forksCount} forks, ${langCount} language`);
}

// Topic discovery
const AI_KW = new Set([
  'ai','ml','dl','llm','nlp','cv','agent','robot','robots','robotics',
  'vision','language','neural','learning','generative','prompt','chatbot',
  'deep-learning','machine-learning','transformer','gpt','diffusion','rag',
  'embedding','inference','fine-tuning','llmops','mlops','model-serving',
  'vector-search','semantic-search','knowledge-graph','multimodal','speech',
  'text-to-speech','image-generation','video-generation','code-generation',
  'autonomous','embodied-ai','world-models','foundation-models',
  'large-language-models','retrieval-augmented','instruction-tuning',
  'rlhf','alignment'
]);

function isAI(t) {
  const s = t.toLowerCase();
  if (AI_KW.has(s)) return true;
  for (const kw of AI_KW) {
    if (s.startsWith(kw+'-') || s.endsWith('-'+kw) || s.includes('-'+kw+'-')) return true;
  }
  return false;
}

const DESC = {
  'agentic':'Agentic 模式','agents':'Agents（智能体）',
  'ai-agent':'AI Agent','ai-agents':'AI Agents',
  'genai':'生成式 AI','generative-ai':'生成式 AI',
  'conversational-ai':'对话式 AI','llm-app':'LLM 应用',
  'ai-tooling':'AI 工具链','llm-security':'LLM 安全',
  'llm-gateway':'LLM 网关','llm-serving':'LLM 服务化部署',
  'llm-local':'本地 LLM','local-llm':'本地 LLM',
  'on-device-ai':'端侧 AI','terminal-ai':'终端 AI',
  'ai-coding':'AI 编程','coding-agent':'编码智能体',
  'coding-agents':'编码智能体','ai-assistant':'AI 助手',
  'ai-native':'AI 原生','ai-memory':'AI 记忆系统',
  'llm-memory':'LLM 记忆','agent-memory':'Agent 记忆',
  'agent-collaboration':'智能体协作','multi-agent':'多智能体',
  'multiagent':'多智能体系统','multi-agent-systems':'多智能体系统',
  'agentic-workflow':'智能体工作流','agentic-framework':'智能体框架',
  'agentic-engineering':'Agentic 工程','agentic-coding':'Agentic 编码',
  'agentic-skills':'Agentic 技能','agentic-rag':'Agentic RAG',
  'agentic-agi':'Agentic AGI','agent-framework':'Agent 框架',
  'agent-protocol':'Agent 协议','agent-development':'Agent 开发',
  'agent-skills':'Agent 技能','agent-infrastructure':'Agent 基础设施',
  'agent-evolution':'Agent 进化','agent-native':'Agent 原生',
  'llm-agent':'LLM Agent','llm-tools':'LLM 工具',
  'llm-observability':'LLM 可观测性','llm-eval':'LLM 评估',
  'llm-evaluation':'LLM 评估','ai-runtime':'AI 运行时环境',
  'ai-gateway':'AI 网关','ai-workflows':'AI 工作流',
  'ai-workflow-optimization':'AI 工作流优化',
  'ai-governance':'AI 治理','ai-observability':'AI 可观测性',
  'ai-monitoring':'AI 监控','ai-integration':'AI 集成',
  'ai-application':'AI 应用','ai-framework':'AI 框架',
  'ai-frameworks':'AI 框架','aiengineering':'AI 工程',
  'ai-infrastructure':'AI 基础设施','ai-search':'AI 搜索',
  'ai-art':'AI 艺术创作','ai-art-generator':'AI 艺术生成',
  'ai-image-generation':'AI 图像生成','ai-video-generation':'AI 视频生成',
  'ai-deep-fake':'AI Deepfake','ai-face':'AI 人脸技术',
  'ai-webcam':'AI 摄像头','ai-chatbot':'AI 聊天机器人',
  'ai-crawler':'AI 爬虫','ai-scraping':'AI 数据采集',
  'ai-tutor':'AI 导师','ai-companion':'AI 伴侣',
  'ai-vtuber':'AI VTuber','ai-waifu':'AI 伴侣',
  'ai-sre':'AI SRE','ai4science':'AI for Science',
  'generative-ui':'生成式 UI','voice-ai':'语音 AI',
  'spatial-ai':'空间 AI','edge-ai':'边缘 AI',
  'ai-chip':'AI 芯片','federated-learning':'联邦学习',
  'distributed-ml':'分布式 ML','distributed-training':'分布式训练',
  'mllm':'多模态大语言模型','graphrag':'Graph RAG',
  'deep-research':'深度研究','multimodal-learning':'多模态学习',
  'speech-processing':'语音处理','speech-synthesis':'语音合成',
  'speech-recognition':'语音识别','speech-to-text':'语音转文字',
  'robot-learning':'机器人学习','robotic':'机器人',
  'embodied':'具身智能','autonomous-agents':'自主智能体',
  'autonomous-agent':'自主智能体','autonomous-navigation':'自主导航',
  'autonomous-vehicles':'自动驾驶',
  'computer-use-agent':'计算机使用 Agent',
  'agent-computer-interface':'Agent 计算机接口',
  'gui-agents':'GUI 智能体','deepagents':'深度智能体',
  'context-engineering':'上下文工程','retrieval':'检索',
  'retrieval-systems':'检索系统','context-retrieval':'上下文检索',
  'information-retrieval':'信息检索','knowledge-curation':'知识策展',
  'knowledge-base':'知识库','knowledgebase':'知识库',
  'search':'搜索','search-engine':'搜索引擎','search-api':'搜索 API',
  'deep-neural-networks':'深度神经网络','neural-nets':'神经网络',
  'neural-network':'神经网络','neural-networks':'神经网络',
  'graph-neural-network':'图神经网络','deeplearning':'深度学习',
  'machinelearning':'机器学习','machinelearning-python':'Python 机器学习',
  'machine-learning-algorithms':'机器学习算法',
  'reinforcement-learning-algorithms':'强化学习算法',
  'interactive-learning':'交互学习','agents-sdk':'Agents SDK',
  'agentscope':'AgentScope','agentscope-runtime':'AgentScope 运行时',
  'multi-agents':'多智能体','multi-agents-collaboration':'多智能体协作',
  'agentops':'AgentOps','mcp-server':'MCP 服务器',
  'mcp-servers':'MCP 服务器','mcp-tools':'MCP 工具',
  'mcp-clients':'MCP 客户端','mcp-client':'MCP 客户端',
  'mcp-gateway':'MCP 网关','mcp-inspector':'MCP 检查器',
  'mcp-apps':'MCP 应用','mcp-host':'MCP 宿主','mcp-ui':'MCP UI',
  'mcp-security':'MCP 安全','modelcontextprotocol':'Model Context Protocol',
  'open-ai':'Open AI','openai-api':'OpenAI API',
  'openai-chatgpt':'OpenAI ChatGPT','anthropic-claude':'Anthropic Claude',
  'claude-ai':'Claude AI','claude-code':'Claude Code',
  'claude-agents':'Claude Agents','claude-agent-sdk':'Claude Agent SDK',
  'claude-code-agents':'Claude Code Agents',
  'claude-code-skills':'Claude Code 技能',
  'google-gemini':'Google Gemini','gemini-api':'Gemini API',
  'vertex-ai':'Vertex AI','vertex-ai-gemini-api':'Vertex AI Gemini API',
  'vertexai':'Vertex AI','deepseek':'DeepSeek','deepseek-r1':'DeepSeek R1',
  'llama-index':'LlamaIndex','llamaindex':'LlamaIndex',
  'langchain4j':'LangChain4J','langchaingo':'LangChain Go',
  'langchain-for-go':'LangChain Go','llamacpp':'llama.cpp',
  'coreml':'CoreML','mlx':'MLX',
  'llama2':'LLaMA 2','llama3':'LLaMA 3','chatglm':'ChatGLM',
  'xinference':'Xinference','fastchat':'FastChat','pgvector':'pgVector',
  'txtai':'txtAI','sentence-embeddings':'句子嵌入',
  'text-semantic-similarity':'文本语义相似度',
  'embedding-database':'嵌入数据库','embedding-similarity':'嵌入相似度',
  'embedding-store':'嵌入存储','embedding':'嵌入','embeddings':'嵌入',
  'vectors':'向量','vector':'向量',
  'multi-modal-rag':'多模态 RAG',
  'small-specialized-models':'小型专用模型',
  'data-pipelines':'数据管道','datasets':'数据集',
  'evaluation':'评估','prompt-testing':'提示测试',
  'prompt-management':'提示管理','prompt-governance':'提示治理',
  'llm-prompting':'LLM 提示','gen-ai':'生成式 AI',
  'generativeai':'生成式 AI','generative-ai-tools':'生成式 AI 工具',
  'voice-clone':'语音克隆','voice-cloneai':'语音克隆',
  'deep-fake':'Deepfake','deepfake':'Deepfake',
  'deepfake-webcam':'Deepfake 摄像头',
  'real-time-deepfake':'实时 Deepfake','realtime-deepfake':'实时 Deepfake',
  'video-deepfake':'视频 Deepfake','deep-face-swap':'Deep 换脸',
  'face-recognition':'人脸识别','ocr':'OCR',
  'document-image-analysis':'文档图像分析',
  'document-image-processing':'文档图像处理',
  'image-processing':'图像处理','image-recognition':'图像识别',
  'object-detection':'目标检测','segmentation':'分割',
  'tensorrt':'TensorRT','video-processing':'视频处理',
  'video-analytics':'视频分析','headless-browser':'无头浏览器',
  'workflow-orchestration':'工作流编排',
  'background-agents':'后台 Agent','custom-ai-agents':'自定义 AI Agent',
  'ai-agents-framework':'AI Agent 框架','ai-agents-automation':'AI Agent 自动化',
  'agency-agents':'Agency Agent','agentgpt':'AgentGPT',
  'agi':'AGI','autogpt':'AutoGPT','baby-agi':'Baby AGI',
  'superagent':'SuperAgent','pi-agent':'Pi Agent',
  'llms':'LLMs','gpt-oss':'GPT 开源模型','gpt-4':'GPT-4',
  'gpt-4o':'GPT-4o','gpt-5':'GPT-5','gpt4':'GPT4','gpt4-api':'GPT4 API',
  'gpt-engineer':'GPT Engineer','gpt-3':'GPT-3',
  'gpt-35-turbo':'GPT-3.5 Turbo','chatgpt':'ChatGPT',
  'chat-gpt':'ChatGPT','chatgpt-4':'ChatGPT-4','chatgpt4':'ChatGPT4',
  'chatgpt3':'ChatGPT3','chatgpt35-turbo':'ChatGPT 3.5 Turbo',
  'chatgpt-api':'ChatGPT API','chatgpt-free':'免费 ChatGPT',
  'chatgpt-prompts':'ChatGPT 提示词',
  'chatgpt-on-wechat':'ChatGPT on WeChat',
  'openai-proxy':'OpenAI 代理','litellm':'LiteLLM',
  'azure-openai':'Azure OpenAI','whatsapp-ai':'WhatsApp AI',
  'cursorai':'Cursor AI','trae-ai':'Trae AI','windsurf-ai':'Windsurf AI',
  'firecrawl-ai':'Firecrawl AI','voyage-ai':'Voyage AI',
  'higgsfield-ai':'Higgsfield AI','kling-ai':'Kling AI',
  'auditable-ai':'可审计 AI','videogames':'视频游戏',
  'chinese-language':'中文','english-language':'英文',
  'ollama':'Ollama','streamlit':'Streamlit',
  'fine-tune':'微调','retrieval-augmented':'检索增强生成',
  'model-context-protocol-servers':'MCP 服务器',
  'autogen':'AutoGen','smolagents':'SmolAgents',
  'hermes-agent':'Hermes Agent','open-ai':'Open AI',
  'prompt-governance':'提示词治理','deep-live-cam':'Deep 实时摄像头',
  'llm-course':'LLM 课程','model':'模型','models':'模型',
  'model-management':'模型管理','model-router':'模型路由',
  'pretrained-models':'预训练模型','prompts':'提示词工程',
  'prompts-chat':'Prompts Chat','system-prompts':'System Prompt 设计',
  'interfaces':'接口','interface':'接口','context':'上下文',
  'localstorage':'本地存储','privacy':'隐私','orchestration':'编排',
  'gemini':'Gemini','chat':'聊天','image':'图像',
  'ts':'TypeScript','html':'HTML','yaml':'YAML',
};

function desc(t) { return DESC[t] || `（自动发现）${t}`; }

const newTopics = [];
for (const [topic, count] of allTopics) {
  if (existingTopics.has(topic)) continue;
  if (!isAI(topic)) continue;
  if (count === 1) {
    const maxS = Math.max(...Array.from(repoData.entries())
      .filter(([,v]) => v && v.topics?.includes(topic))
      .map(([,v]) => v.stars));
    if (maxS < 1000) continue;
  }
  let minS = 5000;
  if (count >= 3) minS = 2000;
  else if (count >= 2) minS = 3000;
  newTopics.push({ topic, url: `https://github.com/topics/${topic}`, minStars: minS, description: desc(topic) });
}

newTopics.sort((a, b) => a.topic.localeCompare(b.topic));

if (newTopics.length > 0) {
  topicsData.topics.push(...newTopics);
  topicsData.lastUpdated = new Date().toISOString();
  writeFileSync(TOPICS, JSON.stringify(topicsData, null, 2));
  console.log(`🆕 Added ${newTopics.length} new AI topics`);
}

// Summary
const summary = {
  reposScanned: repos.size,
  starsUpdated: starsCount,
  forksUpdated: forksCount,
  langUpdated: langCount,
  starsChanges: starsChanges.sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta)).slice(0, 5),
  newTopics,
  totalTopics: topicsData.topics.length,
  anyChanges: starsCount + forksCount + langCount + newTopics.length > 0
};
writeFileSync(SUMMARY, JSON.stringify(summary, null, 2));
console.log(`\n📊 Summary: ${JSON.stringify(summary, null, 2).slice(0, 500)}`);
