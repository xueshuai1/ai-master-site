#!/usr/bin/env node
// GitHub Stars + Topics Update Script
// Usage: node scripts/update-stars.mjs

import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, '..');

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
if (!GITHUB_TOKEN) {
  console.error('GITHUB_TOKEN not set');
  process.exit(1);
}

// Sleep helper
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

// Fetch with rate limit protection
async function fetchRepo(owner, repo) {
  const url = `https://api.github.com/repos/${owner}/${repo}?access_token=${GITHUB_TOKEN}`;
  const resp = await fetch(url, {
    headers: {
      'Authorization': `token ${GITHUB_TOKEN}`,
      'User-Agent': 'ai-master-site-updater'
    }
  });
  
  if (resp.status === 404) return { error: 'not_found' };
  if (resp.status === 403) {
    const reset = resp.headers.get('x-ratelimit-reset');
    const waitMs = (parseInt(reset) - Math.floor(Date.now()/1000) + 1) * 1000;
    console.error(`  ⏳ Rate limited, waiting ${Math.round(waitMs/1000)}s`);
    await sleep(waitMs);
    return fetchRepo(owner, repo); // retry
  }
  if (!resp.ok) {
    return { error: `HTTP ${resp.status}` };
  }
  return await resp.json();
}

// Extract GitHub repos from tools.ts
function extractRepos(toolsContent) {
  const repos = [];
  // Match url: "https://github.com/{owner}/{repo}"
  const urlRegex = /url:\s*"(https:\/\/github\.com\/([^"\/]+)\/([^"\/\s]+))"/g;
  let match;
  while ((match = urlRegex.exec(toolsContent)) !== null) {
    const fullUrl = match[1];
    const owner = match[2];
    const repo = match[3];
    // Skip non-repo URLs like features pages
    if (owner === 'features') continue;
    repos.push({ url: fullUrl, owner, repo });
  }
  // Deduplicate
  const seen = new Set();
  return repos.filter(r => {
    const key = `${r.owner}/${r.repo}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

// Extract tool blocks with their stars from tools.ts
function extractToolBlocks(toolsContent) {
  const blocks = [];
  // Find each tool block (from { id: ... to the closing })
  const toolRegex = /\{\s*id:\s*"([^"]+)"[\s\S]*?url:\s*"[^"]*github\.com\/([^"\/]+)\/([^"\/\s]+)"[\s\S]*?githubStars:\s*(\d+)/g;
  let match;
  while ((match = toolRegex.exec(toolsContent)) !== null) {
    blocks.push({
      id: match[1],
      owner: match[2],
      repo: match[3],
      currentStars: parseInt(match[4]),
      fullMatch: match[0],
      startIndex: match.index,
    });
  }
  return blocks;
}

// Check if a topic is AI-related
function isAiTopic(topic) {
  const aiKeywords = [
    'ai', 'ml', 'dl', 'llm', 'nlp', 'cv', 'agent', 'robot', 'robots', 'robotics',
    'vision', 'language', 'neural', 'learning', 'generative', 'prompt', 'chatbot',
    'deep-learning', 'machine-learning', 'transformer', 'gpt', 'diffusion', 'rag',
    'embedding', 'inference', 'fine-tuning', 'llmops', 'mlops', 'model-serving',
    'vector-search', 'semantic-search', 'knowledge-graph', 'multimodal', 'speech',
    'text-to-speech', 'image-generation', 'video-generation', 'code-generation',
    'autonomous', 'embodied-ai', 'world-models', 'foundation-models',
    'large-language-models', 'retrieval-augmented', 'instruction-tuning', 'rlhf',
    'alignment', 'deep', 'model', 'llm', 'neural', 'genai', 'agi', 'agi',
    'coding', 'code', 'chat', 'bot', 'tts', 'stt', 'ocr', 'gpu', 'tensor',
    'quantization', 'search', 'retrieval', 'memory', 'context', 'orchestrat',
    'workflow', 'automation', 'framework', 'pipeline', 'dataset', 'training',
    'fine-tun', 'evaluation', 'benchmark', 'inference', 'serving', 'deployment',
    'multi-agent', 'multiagent', 'agent', 'harness', 'skill', 'evolution',
    'evolving', 'self-', 'autonomous', 'intelligent', 'smart', 'cognitive',
    'brain', 'compute', 'compute-use', 'computer-use', 'gui', 'mcp',
    'deepseek', 'claude', 'llama', 'openai', 'anthropic', 'huggingface',
    'hugging', 'pytorch', 'tensorflow', 'keras', 'jax', 'onnx', 'coreml',
    'rag', 'vector', 'embed', 'semantic', 'knowledge', 'graph', 'neural',
    'diffusion', 'gan', 'vae', 'transformer', 'attention', 'bert', 'gpt',
    'chatgpt', 'gemini', 'mistral', 'codex', 'stable-diffusion', 'comfyui',
    'webui', 'llamacpp', 'vllm', 'unsloth', 'gradio', 'streamlit', 'langchain',
    'langgraph', 'smolagents', 'autogen', 'crewai', 'metagpt', 'dify', 'n8n',
    'langflow', 'flowise', 'localai', 'ollama', 'anythingllm', 'chatbox',
    'open-webui', 'lobehub', 'cherry-studio', 'khoj', 'mem0', 'fabric',
    'browser-use', 'generative', 'creative', 'art', 'image', 'video',
    'audio', 'voice', 'face', 'deepfake', 'deep-fake', 'restoration',
    'super-resolution', 'upscale', 'segmentation', 'detection', 'classification',
    'recognition', 'pose', 'densepose', 'yolo', 'mobilenet', 'imagenet',
    'pretrain', 'fine-tun', 'hyperparam', 'distributed', 'parallel',
    'quant', 'fp8', 'gemm', 'cuda', 'tensorrt', 'on-device', 'edge',
    'mobile', 'web', 'desktop', 'app', 'tool', 'tools', 'plugin', 'extension',
    'api', 'sdk', 'library', 'package', 'module', 'component', 'service',
    'platform', 'infrastructure', 'system', 'engine', 'runtime', 'server',
    'cloud', 'saas', 'paas', 'iaas', 'devops', 'mlops', 'llmops',
    'observability', 'monitoring', 'logging', 'tracing', 'profiling',
    'security', 'safety', 'governance', 'compliance', 'privacy', 'audit',
    'responsible', 'ethics', 'bias', 'fairness', 'transparency', 'explainable',
    'interpretable', 'causal', 'reinforcement', 'meta', 'few-shot',
    'zero-shot', 'in-context', 'prompt', 'instruction', 'feedback',
    'preference', 'alignment', 'human', 'reward', 'policy', 'value',
    'actor', 'critic', 'ppo', 'dpo', 'rlhf', 'sft', 'pretrain',
    'continual', 'lifelong', 'incremental', 'transfer', 'domain',
    'multitask', 'multimodal', 'cross-modal', 'fusion', 'joint',
    'contrastive', 'self-supervised', 'unsupervised', 'supervised',
    'semi-supervised', 'weakly-supervised', 'active', 'meta', 'one-shot',
    'few-shot', 'zero-shot', 'prompt', 'instruction', 'chain-of-thought',
    'reasoning', 'planning', 'execution', 'tool-use', 'function-calling',
    'retrieval', 'search', 'browse', 'crawl', 'scrape', 'extract',
    'parse', 'summarize', 'translate', 'generate', 'synthesize',
    'compose', 'create', 'design', 'prototype', 'iterate', 'refine',
    'optimize', 'improve', 'enhance', 'augment', 'boost', 'accelerate',
    'fast', 'efficient', 'lightweight', 'compact', 'minimal', 'simple',
    'clean', 'elegant', 'beautiful', 'intuitive', 'user-friendly',
    'accessible', 'inclusive', 'diverse', 'global', 'universal',
    'standard', 'open', 'free', 'public', 'community', 'collaborative',
    'crowd', 'crowdsourced', 'wiki', 'knowledge', 'information',
    'data', 'dataset', 'database', 'warehouse', 'lake', 'stream',
    'batch', 'real-time', 'online', 'offline', 'edge', 'cloud',
    'hybrid', 'federated', 'distributed', 'decentralized', 'peer-to-peer',
    'blockchain', 'crypto', 'nft', 'defi', 'dao', 'web3', 'metaverse',
    'virtual', 'augmented', 'mixed', 'extended', 'spatial', '3d',
    '4d', '5d', '6d', '7d', '8d', '9d', '10d'
  ];
  
  const t = topic.toLowerCase().replace(/_/g, '-');
  return aiKeywords.some(kw => t.includes(kw.toLowerCase().replace(/_/g, '-')));
}

// Generate Chinese description for a topic
function genDescription(topic) {
  const descMap = {
    'self-evolving': '自进化 AI 系统',
    'self-evolution': '自进化机制',
    'coding-agents': 'AI 编程智能体',
    'agentic-coding': 'Agentic 编程',
    'agentic-code': 'Agentic 代码生成',
    'agentic-skills': 'Agentic 技能系统',
    'agentic-retrieval': 'Agentic 检索',
    'agentic-search': 'Agentic 搜索',
    'agent-infrastructure': 'Agent 基础设施',
    'agent-context': 'Agent 上下文管理',
    'agent-memory': 'Agent 记忆系统',
    'memory-agent': '记忆 Agent',
    'memory-retrieval': '记忆检索',
    'memory-engine': '记忆引擎',
    'memory-system': '记忆系统',
    'context-engine': '上下文引擎',
    'context-management': '上下文管理',
    'llm-memory': 'LLM 记忆',
    'llm-inference': 'LLM 推理',
    'llm-ops': 'LLM 运维',
    'llm-apps': 'LLM 应用',
    'coding-assistant': 'AI 编程助手',
    'coding-assistants': 'AI 编程助手',
    'coding-agent': 'AI 编程 Agent',
    'browser-automation': '浏览器自动化（AI 驱动）',
    'task-automation': '任务自动化（AI）',
    'terminal-automation': '终端自动化',
    'workflow-automation': '工作流自动化',
    'deepresearch': '深度研究（AI 自动）',
    'deep-search': '深度搜索',
    'codebase-generation': '代码库生成',
    'code-analysis': '代码分析',
    'code-execution': '代码执行',
    'code-interpreter': '代码解释器',
    'codegen': '代码生成',
    'code-search': '语义代码搜索',
    'vector-store': '向量存储',
    'vector-index': '向量索引',
    'vector-similarity': '向量相似度',
    'vector-database': '向量数据库',
    'hybrid-search': '混合搜索',
    'app-search': '应用搜索',
    'enterprise-search': '企业搜索',
    'full-text-search': '全文搜索',
    'image-to-video': '图生视频',
    'image-upscaling': '图像超分',
    'image-classification': '图像分类',
    'image-recognition': '图像识别',
    'image-restoration': '图像修复',
    'image-search': '图像搜索',
    'image-processing': '图像处理',
    'audio-generation': '音频生成',
    'text-generation': '文本生成',
    'object-detection': '目标检测',
    'face-restoration': '人脸修复',
    'densepose': 'DensePose 姿态估计',
    'pose-estimation': '姿态估计',
    'instance-segmentation': '实例分割',
    'super-resolution': '超分辨率',
    'quantization': '模型量化',
    'llm-eval': 'LLM 评估',
    'llm-evaluation': 'LLM 评估',
    'multi-agent-system': '多智能体系统',
    'multi-agent-simulation': '多智能体仿真',
    'multi-agents-collaboration': '多智能体协作',
    'agent-framework': 'Agent 框架',
    'agent-evolution': 'Agent 进化',
    'agent-protocol': 'Agent 协议',
    'agent-development': 'Agent 开发',
    'agent-skills': 'Agent 技能',
    'agent-native': 'Agent 原生',
    'agent-development': 'Agent 开发',
    'long-term-memory': '长期记忆',
    'on-device-ai': '端侧 AI',
    'ai-native': 'AI 原生',
    'ai-monitoring': 'AI 监控',
    'ai-observability': 'AI 可观测性',
    'ai-integration': 'AI 集成',
    'ai-framework': 'AI 框架',
    'ai-frameworks': 'AI 框架',
    'ai-application': 'AI 应用',
    'ai-infrastructure': 'AI 基础设施',
    'ai-governance': 'AI 治理',
    'ai-transparency': 'AI 透明度',
    'ai-skills': 'AI 技能',
    'aiengineering': 'AI 工程化',
    'aiagent': 'AI Agent',
    'aiagents': 'AI Agents',
    'llm-application': 'LLM 应用',
    'large-language-model': '大语言模型',
    'interactive-learning': '交互式学习',
    'distributed-training': '分布式训练',
    'model-parallelism': '模型并行',
    'hyperparameter-search': '超参数搜索',
    'normalization-free-training': '免归一化训练',
    'pretrained-weights': '预训练权重',
    'vision-transformer-models': '视觉 Transformer 模型',
    'mobile-deep-learning': '移动端深度学习',
    'mobilenet-v2': 'MobileNet V2',
    'mobilenetv3': 'MobileNet V3',
    'zero-shot-tts': '零样本语音合成',
    'multi-speaker-tts': '多说话人语音合成',
    'speech-processing': '语音处理',
    'text-classification': '文本分类',
    'semantic-parsing': '语义解析',
    'natural-language-understanding': '自然语言理解',
    'knowledge-management': '知识管理',
    'knowledge-management-graph': '知识图谱管理',
    'world-model': '世界模型',
    'multi-agent-systems': '多智能体系统',
    'system-prompt': '系统提示词',
    'pipeline-parallelism': '流水线并行',
  };
  return descMap[topic] || `（自动发现）${topic}`;
}

// Main
async function main() {
  const toolsContent = readFileSync(join(projectRoot, 'src/data/tools.ts'), 'utf-8');
  const topicsContent = readFileSync(join(projectRoot, 'data/ai-topics.json'), 'utf-8');
  const topicsData = JSON.parse(topicsContent);
  
  // Existing topics (lowercase)
  const existingTopics = new Set(topicsData.topics.map(t => t.topic.toLowerCase()));
  
  // Extract repos
  const repos = extractRepos(toolsContent);
  console.log(`Found ${repos.length} GitHub repos to check`);
  
  // Track changes
  const updates = { stars: [], forks: [], languages: [], topics: [] };
  let totalFetched = 0;
  let allRepoTopics = [];
  
  // Fetch each repo sequentially with 1.2s delay
  for (const repo of repos) {
    totalFetched++;
    console.log(`[${totalFetched}/${repos.length}] Fetching ${repo.owner}/${repo.repo}...`);
    
    const data = await fetchRepo(repo.owner, repo.repo);
    
    if (data.error) {
      console.error(`  ❌ ${data.error}`);
      await sleep(1200);
      continue;
    }
    
    // Collect topics
    if (data.topics && Array.isArray(data.topics)) {
      allRepoTopics.push(...data.topics.map(t => t.toLowerCase()));
    }
    
    const newStars = data.stargazers_count;
    const newForks = data.forks_count;
    const newLanguage = data.language;
    const newPushedAt = data.pushed_at;
    const updatedAt = newPushedAt ? newPushedAt.split('T')[0] : null;
    
    // Check for changes (we'll apply them later via text replacement)
    const changes = [];
    
    if (newStars !== undefined) {
      changes.push({ field: 'stars', old: null, new: newStars, updatedAt });
      updates.stars.push({ id: null, repo: `${repo.owner}/${repo.repo}`, newStars });
    }
    if (newForks !== undefined) {
      changes.push({ field: 'forks', old: null, new: newForks });
      updates.forks.push({ repo: `${repo.owner}/${repo.repo}`, newForks });
    }
    if (newLanguage) {
      changes.push({ field: 'language', old: null, new: newLanguage });
      updates.languages.push({ repo: `${repo.owner}/${repo.repo}`, newLanguage });
    }
    
    await sleep(1200);
  }
  
  console.log(`\nFetched ${totalFetched} repos, collected ${allRepoTopics.length} topic mentions`);
  
  // Deduplicate topics and find new ones
  const uniqueTopics = [...new Set(allRepoTopics)];
  console.log(`Unique topics: ${uniqueTopics.length}`);
  
  // Find new AI-related topics not already in the database
  const newTopics = [];
  for (const topic of uniqueTopics) {
    const normalized = topic.toLowerCase().replace(/\s+/g, '-');
    if (existingTopics.has(normalized)) continue;
    if (isAiTopic(normalized)) {
      newTopics.push(normalized);
    }
  }
  
  console.log(`New AI topics found: ${newTopics.length}`);
  if (newTopics.length > 0) {
    console.log('New topics:', newTopics.slice(0, 30).join(', '));
  }
  
  // Output results as JSON for the next step
  const result = {
    updates,
    newTopics,
    existingTopicCount: topicsData.topics.length,
    repoCount: repos.length,
  };
  
  writeFileSync(
    join(projectRoot, 'scripts/.update-result.json'),
    JSON.stringify(result, null, 2)
  );
  
  console.log('\nResult written to scripts/.update-result.json');
  console.log(JSON.stringify({ 
    repos: repos.length, 
    newTopics: newTopics.length,
    existingTopics: topicsData.topics.length
  }, null, 2));
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
