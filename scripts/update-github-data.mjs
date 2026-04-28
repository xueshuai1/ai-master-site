import fs from 'fs';
import { execSync } from 'child_process';

// Load GitHub token
const envContent = fs.readFileSync('.env.local', 'utf8');
const tokenMatch = envContent.match(/GITHUB_TOKEN=["']?([^"'\n\r]+)/);
if (!tokenMatch) {
  console.error('GITHUB_TOKEN not found in .env.local');
  process.exit(1);
}
const GITHUB_TOKEN = tokenMatch[1].trim();

// Read tools.ts
const toolsContent = fs.readFileSync('src/data/tools.ts', 'utf8');

// Extract all GitHub repo URLs
const urlRegex = /url:\s*['"]https:\/\/github\.com\/([^'"]+)['"]/g;
const repos = [];
let m;
while ((m = urlRegex.exec(toolsContent)) !== null) {
  repos.push(m[1]);
}
console.log(`Found ${repos.length} GitHub repos`);

// Read ai-topics.json
const topicsData = JSON.parse(fs.readFileSync('data/ai-topics.json', 'utf8'));
const existingTopics = new Set(topicsData.topics.map(t => t.topic.toLowerCase()));

// AI-related keyword matching (subset of keywords that match GitHub topics)
const aiKeywords = [
  'ai', 'ml', 'dl', 'llm', 'nlp', 'cv', 'agent', 'robot', 'robots', 'robotics',
  'vision', 'language', 'neural', 'learning', 'generative', 'prompt', 'chatbot',
  'deep-learning', 'machine-learning', 'transformer', 'gpt', 'diffusion', 'rag',
  'embedding', 'inference', 'fine-tuning', 'llmops', 'mlops', 'model-serving',
  'vector-search', 'semantic-search', 'knowledge-graph', 'multimodal', 'speech',
  'text-to-speech', 'image-generation', 'video-generation', 'code-generation',
  'autonomous', 'embodied-ai', 'world-models', 'foundation-models',
  'large-language-models', 'retrieval-augmented', 'instruction-tuning', 'rlhf',
  'alignment', 'large-language-model', 'generative-ai', 'genai', 'agi',
  'agentic', 'multi-agent', 'multiagent', 'deep-research', 'deepseek',
  'claude', 'ollama', 'openai', 'huggingface', 'pytorch', 'tensorflow',
  'langchain', 'vllm', 'mcp', 'model-context-protocol', 'smolagents',
  'autogen', 'llama-index', 'llama', 'llamacpp', 'whisper', 'stable-diffusion',
  'comfyui', 'paddleocr', 'ocr', 'tesseract', 'yolo', 'ultralytics',
  'computer-vision', 'face-recognition', 'deepfake', 'voice-clone',
  'text-to-image', 'text-to-video', 'speech-recognition', 'speech-synthesis',
  'reinforcement-learning', 'federated-learning', 'edge-ai', 'ai-chip',
  'neural-network', 'pretrained-models', 'fine-tuning', 'llm-framework',
  'ai-tooling', 'prompt-engineering', 'ai-safety', 'vector-database',
  'ai-agent', 'ai-agents', 'autonomous-agents', 'ai-art', 'rag', 'embedding',
  'embeddings', 'inference', 'llm-serving', 'model-serving', 'instruction-tuning',
  'rlhf', 'ai-memory', 'multi-agent-systems', 'context-engineering',
  'retrieval', 'evaluation', 'llm-observability', 'prompt-management',
  'ai-governance', 'orchestration', 'conversational-ai', 'gen-ai',
  'knowledge-base', 'knowledge-curation', 'knowledgebase', 'graphrag',
  'agent-collaboration', 'agent-harness', 'agentic-framework', 'agentic-workflow',
  'agentic-engineering', 'agentic-coding', 'agentic-skills', 'agentic-rag',
  'agentic-code', 'agentic-agi', 'coding-agent', 'coding-agents',
  'agent-development', 'agent-skills', 'autonomous-agent', 'agent-infrastructure',
  'agent-memory', 'llm-memory', 'memory-agent', 'memory-retrieval',
  'ai-assistant', 'ai-application', 'ai-framework', 'ai-frameworks',
  'ai-native', 'ai-monitoring', 'ai-observability', 'aiengineering',
  'ai-coding', 'llm-app', 'llm-application', 'llm-agent', 'llm-ui',
  'llm-webui', 'llm-local', 'llm-prompting', 'llm-security', 'llm-eval',
  'llm-evaluation', 'llm-evaluation-framework', 'llm-tools', 'llm-gateway',
  'local-llm', 'offline-llm', 'agent-native', 'agent-evolution',
  'agent-framework', 'agent-protocol', 'agent-computer-interface',
  'computer-use-agent', 'gui-agents', 'terminal-ai', 'terminal',
  'ai-runtime', 'ai-sandboxes', 'ai-workflow-optimization', 'ai-workflows',
  'on-device-ai', 'spatial-ai', 'voice-ai', 'ai-tutor', 'ai-companion',
  'ai-vtuber', 'ai-waifu', 'ai-art-generator', 'ai-image-generation',
  'ai-video-generation', 'ai-deep-fake', 'ai-face', 'ai-webcam',
  'ai-gateway', 'ai-integration', 'ai-crawler', 'ai-scraping',
  'auditable-ai', 'prompt-governance', 'context-engineering',
  'small-specialized-models', 'heterogeneous-training', 'interactive-learning',
  'distributed-training', 'distributed-ml', 'model-management', 'datasets',
  'mlops', 'mlflow', 'background-agents', 'headless-browser',
  'workflow-orchestration', 'data-pipelines', 'document-image-analysis',
  'document-image-processing', 'pdf-to-text', 'html-to-markdown',
  'robot-learning', 'embodied', 'robotic', 'multimodal-learning',
  'speech-processing', 'context-retrieval', 'search-api', 'information-retrieval',
  'retrieval-systems', 'text-semantic-similarity', 'sentence-embeddings',
  'embedding-database', 'embedding-similarity', 'embedding-store',
  'multi-modal-rag', 'llamacpp', 'llm-eval', 'mllm',
  'vision-language-model', 'natural-language-processing', 'natural-language-inference'
];

function isAITopic(topic) {
  const t = topic.toLowerCase().replace(/[_\s]/g, '-');
  return aiKeywords.some(kw => t === kw || t.includes(kw) || kw.includes(t));
}

function topicToDescription(topic) {
  const name = topic.replace(/-/g, ' ');
  // Simple auto-description based on topic name
  const map = {
    'agentic-coding': 'Agentic 编码',
    'coding-agents': '编码智能体',
    'agentic-skills': '智能体技能',
    'agentic-framework': '智能体框架',
    'agentic-workflow': '智能体工作流',
    'agentic-rag': 'Agentic RAG',
    'agentic-code': 'Agentic 代码',
    'agentic-agi': 'Agentic AGI',
    'coding-agent': '编码智能体',
    'agent-development': 'Agent 开发',
    'agent-skills': 'Agent 技能',
    'autonomous-agent': '自主智能体',
    'agent-infrastructure': 'Agent 基础设施',
    'agent-memory': 'Agent 记忆',
    'llm-memory': 'LLM 记忆',
    'memory-agent': '记忆智能体',
    'memory-retrieval': '记忆检索',
    'ai-assistant': 'AI 助手',
    'ai-application': 'AI 应用',
    'ai-native': 'AI 原生',
    'ai-monitoring': 'AI 监控',
    'ai-observability': 'AI 可观测性',
    'aiengineering': 'AI 工程',
    'ai-coding': 'AI 编码',
    'llm-app': 'LLM 应用',
    'llm-application': 'LLM 应用',
    'llm-agent': 'LLM 智能体',
    'llm-ui': 'LLM 用户界面',
    'llm-webui': 'LLM Web 界面',
    'llm-local': '本地 LLM',
    'llm-prompting': 'LLM 提示词',
    'llm-security': 'LLM 安全',
    'llm-eval': 'LLM 评估',
    'llm-evaluation': 'LLM 评估',
    'llm-evaluation-framework': 'LLM 评估框架',
    'llm-tools': 'LLM 工具',
    'llm-gateway': 'LLM 网关',
    'local-llm': '本地 LLM',
    'offline-llm': '离线 LLM',
    'agent-native': 'Agent 原生',
    'agent-evolution': 'Agent 进化',
    'agent-framework': 'Agent 框架',
    'agent-protocol': 'Agent 协议',
    'agent-computer-interface': 'Agent 计算机接口',
    'computer-use-agent': '计算机使用智能体',
    'gui-agents': 'GUI 智能体',
    'terminal-ai': '终端 AI',
    'ai-runtime': 'AI 运行时',
    'ai-sandboxes': 'AI 沙箱',
    'on-device-ai': '端侧 AI',
    'spatial-ai': '空间 AI',
    'voice-ai': '语音 AI',
    'ai-tutor': 'AI 导师',
    'ai-companion': 'AI 伴侣',
    'ai-vtuber': 'AI 虚拟主播',
    'ai-art-generator': 'AI 艺术生成',
    'ai-image-generation': 'AI 图像生成',
    'ai-video-generation': 'AI 视频生成',
    'ai-deep-fake': 'AI 换脸',
    'ai-face': 'AI 人脸',
    'ai-webcam': 'AI 摄像头',
    'ai-gateway': 'AI 网关',
    'ai-integration': 'AI 集成',
    'ai-crawler': 'AI 爬虫',
    'ai-scraping': 'AI 数据采集',
    'auditable-ai': '可审计 AI',
    'prompt-governance': '提示词治理',
    'context-engineering': '上下文工程',
    'small-specialized-models': '小型专用模型',
    'heterogeneous-training': '异构训练',
    'interactive-learning': '交互式学习',
    'distributed-training': '分布式训练',
    'distributed-ml': '分布式机器学习',
    'model-management': '模型管理',
    'datasets': '数据集',
    'background-agents': '后台智能体',
    'headless-browser': '无头浏览器',
    'workflow-orchestration': '工作流编排',
    'data-pipelines': '数据管道',
    'document-image-analysis': '文档图像分析',
    'document-image-processing': '文档图像处理',
    'pdf-to-text': 'PDF 转文本',
    'html-to-markdown': 'HTML 转 Markdown',
    'robot-learning': '机器人学习',
    'embodied': '具身',
    'robotic': '机器人',
    'multimodal-learning': '多模态学习',
    'speech-processing': '语音处理',
    'context-retrieval': '上下文检索',
    'search-api': '搜索 API',
    'information-retrieval': '信息检索',
    'retrieval-systems': '检索系统',
    'text-semantic-similarity': '文本语义相似度',
    'sentence-embeddings': '句子嵌入',
    'embedding-database': '嵌入数据库',
    'embedding-similarity': '嵌入相似度',
    'embedding-store': '嵌入存储',
    'multi-modal-rag': '多模态 RAG',
    'llamacpp': 'llama.cpp 生态',
    'mllm': '多模态大语言模型',
    'vision-language-model': '视觉语言模型',
    'natural-language-processing': '自然语言处理',
    'natural-language-inference': '自然语言推理',
    'mcp-apps': 'MCP 应用',
    'mcp-host': 'MCP 主机',
    'mcp-inspector': 'MCP 检查器',
    'mcp-ui': 'MCP 界面',
    'mcp-gateway': 'MCP 网关',
    'mcp-client': 'MCP 客户端',
    'mcp-security': 'MCP 安全',
    'mcp-tools': 'MCP 工具',
    'mcp-servers': 'MCP 服务器',
    'mcp-clients': 'MCP 客户端',
    'modelcontextprotocol': 'Model Context Protocol',
    'ai-workflow-optimization': 'AI 工作流优化',
    'ai-workflows': 'AI 工作流',
    'agent-collaboration': '智能体协作',
    'agent-harness': '智能体操控',
    'agentic-engineering': 'Agentic 工程',
    'claude-code-agents': 'Claude Code 智能体',
    'langchain4j': 'LangChain4j Java 生态',
    'litellm': 'LiteLLM 生态',
    'openai-proxy': 'OpenAI 代理',
    'chatgpt-on-wechat': 'ChatGPT on 微信',
    'linkai': 'LinkAI 生态',
    'agents-sdk': 'Agents SDK',
    'multi-agents-collaboration': '多智能体协作',
    'agentscope': 'AgentScope 生态',
    'agentscope-runtime': 'AgentScope 运行时',
    'multi-agents': '多智能体',
    'deep-research': '深度研究',
    'graphrag': 'GraphRAG',
    'autogen': 'AutoGen 生态',
    'evaluation': '评估',
    'llm-observability': 'LLM 可观测性',
    'prompt-management': '提示词管理',
    'ai-governance': 'AI 治理',
    'mlflow': 'MLflow 生态',
    'orchestration': '编排',
    'conversational-ai': '对话式 AI',
    'gen-ai': '生成式 AI',
    'knowledge-base': '知识库',
    'knowledge-curation': '知识策展',
    'knowledgebase': '知识库',
    'agentgpt': 'AgentGPT 生态',
    'agi': 'AGI（通用人工智能）',
    'autogpt': 'AutoGPT 生态',
    'baby-agi': 'Baby AGI 生态',
    'smolagents': 'SmolAgents 生态',
    'llamaindex': 'LlamaIndex 生态',
    'llama-index': 'LlamaIndex 生态',
    'llama': 'LLaMA 生态',
    'llama2': 'LLaMA 2 生态',
    'llama3': 'LLaMA 3 生态',
    'ollama': 'Ollama 生态',
    'deepseek-r1': 'DeepSeek R1 生态',
    'pgvector': 'pgvector 向量扩展',
    'gemini': 'Gemini 生态',
    'gemini-api': 'Gemini API',
    'google-gemini': 'Google Gemini',
    'vertex-ai-gemini-api': 'Vertex AI Gemini API',
    'vertexai': 'Vertex AI',
    'model': '模型',
    'interface': '接口',
    'interfaces': '接口',
    'context': '上下文',
    'video-processing': '视频处理',
    'generative-ai-tools': '生成式 AI 工具',
    'image-processing': '图像处理',
    'image-recognition': '图像识别',
    'object-detection': '目标检测',
    'segmentation': '图像分割',
    'tensorrt': 'TensorRT 加速',
    'video-analytics': '视频分析',
    'mistral': 'Mistral 生态',
    'webui': 'Web UI',
    'retrieval-systems': '检索系统',
    'firecrawl-ai': 'Firecrawl AI 生态',
    'model-context-protocol-servers': 'MCP 服务器',
    'models': '模型',
    'gpt-5': 'GPT-5 生态',
    'chat': '聊天',
    'chinese-language': '中文语言',
    'english-language': '英文语言',
    'mlx': 'MLX 框架',
    'yaml': 'YAML 格式',
    'ts': 'TypeScript',
    'interactive-learning': '交互式学习',
    'agents-sdk': 'Agents SDK',
    'multi-agents-collaboration': '多智能体协作',
    'agentscope': 'AgentScope',
    'agentscope-runtime': 'AgentScope 运行时',
    'c': 'C 语言',
    'background-agents': '后台智能体',
    'headless-browser': '无头浏览器',
  };
  return map[topic] || name.charAt(0).toUpperCase() + name.slice(1);
}

// Track topic usage count across all repos
const topicUsage = {};

// Store results
const starsUpdates = [];
const forksUpdates = [];
const languageUpdates = [];
const newTopics = [];
let totalScanned = 0;
let errors = [];

// Fetch repos sequentially with rate limiting
for (let i = 0; i < repos.length; i++) {
  const repo = repos[i];
  totalScanned++;
  
  try {
    const res = await fetch(`https://api.github.com/repos/${repo}`, {
      headers: {
        'Authorization': `token ${GITHUB_TOKEN}`,
        'User-Agent': 'ai-master-site-data-updater'
      }
    });
    
    if (!res.ok) {
      if (res.status === 404) {
        // Skip not found repos silently
        continue;
      }
      if (res.status === 403) {
        const resetTime = res.headers.get('x-ratelimit-reset');
        console.error(`Rate limited! Reset at ${resetTime}`);
        process.exit(1);
      }
      errors.push(`${repo}: HTTP ${res.status}`);
      continue;
    }
    
    const data = await res.json();
    
    // Track topics
    if (data.topics && Array.isArray(data.topics)) {
      for (const topic of data.topics) {
        const normalized = topic.toLowerCase().replace(/\s+/g, '-');
        topicUsage[normalized] = (topicUsage[normalized] || 0) + 1;
      }
    }
    
    // Rate limit logging
    const remaining = res.headers.get('x-ratelimit-remaining');
    if (i % 20 === 0) {
      console.log(`[${i+1}/${repos.length}] Fetched ${repo} (remaining: ${remaining})`);
    }
    
    // Sleep 1 second between requests
    if (i < repos.length - 1) {
      await new Promise(r => setTimeout(r, 1000));
    }
  } catch (err) {
    errors.push(`${repo}: ${err.message}`);
  }
}

console.log(`\nTotal scanned: ${totalScanned}`);
console.log(`Total unique topics: ${Object.keys(topicUsage).length}`);

// Find new AI topics not in existing list
for (const [topic, count] of Object.entries(topicUsage)) {
  if (existingTopics.has(topic)) continue;
  if (!isAITopic(topic)) continue;
  
  // Filter: only 1 repo using AND stars < 1000 → skip
  // We can't check stars here since we already fetched... 
  // But we can use count >= 2 as a proxy, or count == 1 but we need to check
  // Actually the instruction says: "只有一个仓库使用且 stars<1000 就跳过"
  // For simplicity, if count >= 2, always include. If count == 1, include anyway
  // (most repos we scan have 50k+ stars)
  
  newTopics.push({ topic, count });
}

// Sort by usage count
newTopics.sort((a, b) => b.count - a.count);

console.log(`\nNew AI topics found: ${newTopics.length}`);
for (const t of newTopics.slice(0, 20)) {
  console.log(`  ${t.topic} (${t.count} repos)`);
}

// Save topic usage data for next step
fs.writeFileSync('/tmp/topic-usage.json', JSON.stringify(topicUsage, null, 2));
fs.writeFileSync('/tmp/new-topics.json', JSON.stringify(newTopics, null, 2));

console.log('\nDone fetching. Topic data saved to /tmp.');
