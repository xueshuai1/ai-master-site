import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const GITHUB_TOKEN = process.env.GITHUB_TOKEN || '';
const TOOLS_PATH = join(process.cwd(), 'src/data/tools.ts');
const TOPICS_PATH = join(process.cwd(), 'data/ai-topics.json');

// AI topic keywords for matching
const AI_KEYWORDS = [
  'ai', 'ml', 'dl', 'llm', 'nlp', 'cv', 'agent', 'robot', 'robots', 'robotics',
  'vision', 'language', 'neural', 'learning', 'generative', 'prompt', 'chatbot',
  'deep-learning', 'machine-learning', 'transformer', 'gpt', 'diffusion', 'rag',
  'embedding', 'inference', 'fine-tuning', 'llmops', 'mlops', 'model-serving',
  'vector-search', 'semantic-search', 'knowledge-graph', 'multimodal', 'speech',
  'text-to-speech', 'image-generation', 'video-generation', 'code-generation',
  'autonomous', 'embodied-ai', 'world-models', 'foundation-models',
  'large-language-models', 'retrieval-augmented', 'instruction-tuning', 'rlhf',
  'alignment'
];

// Extract tools from the file content
function parseTools(content) {
  const tools = [];
  // Match each tool object by finding id and url pairs
  // Split by tool boundaries: lines containing "id:" 
  const lines = content.split('\n');
  
  let currentTool = {};
  let inToolsArray = false;
  
  for (const line of lines) {
    if (line.includes('export const tools: Tool[] = [')) {
      inToolsArray = true;
      continue;
    }
    if (inToolsArray && line.trim() === '];') {
      // Save last tool if has url
      if (currentTool.id && currentTool.url) {
        tools.push(currentTool);
      }
      break;
    }
    
    if (inToolsArray) {
      const idMatch = line.match(/id:\s*["']([^"']+)["']/);
      const nameMatch = line.match(/name:\s*["']([^"']+)["']/);
      const urlMatch = line.match(/url:\s*["']([^"']+)["']/);
      const starsMatch = line.match(/githubStars:\s*(\d+)/);
      const updatedAtMatch = line.match(/updatedAt:\s*["']([^"']+)["']/);
      const forksMatch = line.match(/forks:\s*(\d+)/);
      const langMatch = line.match(/language:\s*["']([^"']+)["']/);
      const createdAtMatch = line.match(/createdAt:\s*["']([^"']+)["']/);
      
      if (idMatch) {
        // Save previous tool if it has a GitHub URL
        if (currentTool.id && currentTool.url && currentTool.url.includes('github.com')) {
          tools.push(currentTool);
        }
        currentTool = { id: idMatch[1] };
      }
      if (nameMatch) currentTool.name = nameMatch[1];
      if (urlMatch) currentTool.url = urlMatch[1];
      if (starsMatch) currentTool.githubStars = parseInt(starsMatch[1]);
      if (updatedAtMatch) currentTool.updatedAt = updatedAtMatch[1];
      if (forksMatch) currentTool.forks = parseInt(forksMatch[1]);
      if (langMatch) currentTool.language = langMatch[1];
      if (createdAtMatch) currentTool.createdAt = createdAtMatch[1];
    }
  }
  
  return tools;
}

// Extract owner/repo from github.com URLs
function extractGithubRepos(tools) {
  const repos = new Map();
  for (const tool of tools) {
    if (!tool.url || !tool.url.includes('github.com')) continue;
    // Skip feature pages (like github.com/features/copilot)
    const match = tool.url.match(/github\.com\/([^\/]+)\/([^\/\s#?]+)/);
    if (match) {
      const owner = match[1];
      const repo = match[2];
      // Skip if it looks like a feature/docs page
      if (owner === 'features' || owner === 'docs' || owner === 'orgs') continue;
      const key = `${owner}/${repo}`;
      if (!repos.has(key)) {
        repos.set(key, { owner, repo, toolId: tool.id, toolName: tool.name });
      }
    }
  }
  return repos;
}

// Fetch GitHub API
async function fetchRepo(owner, repo) {
  const url = `https://api.github.com/repos/${owner}/${repo}`;
  try {
    const res = await fetch(url, {
      headers: { 
        'Authorization': `Bearer ${GITHUB_TOKEN}`, 
        'User-Agent': 'ai-master-site',
        'Accept': 'application/vnd.github.v3+json'
      }
    });
    if (!res.ok) {
      console.error(`  ❌ ${owner}/${repo}: HTTP ${res.status} ${res.statusText}`);
      return null;
    }
    return await res.json();
  } catch (err) {
    console.error(`  ❌ ${owner}/${repo}: ${err.message}`);
    return null;
  }
}

// Normalize date
function formatDate(isoStr) {
  if (!isoStr) return undefined;
  return isoStr.split('T')[0];
}

// Check if topic is AI-related
function isAITopic(topic) {
  const t = topic.toLowerCase().replace(/_/g, '-');
  // Too generic - skip
  const skipTopics = ['javascript', 'typescript', 'python', 'rust', 'go', 'java', 'shell',
    'c', 'c-plus-plus', 'cpp', 'html', 'css', 'php', 'ruby', 'swift', 'kotlin',
    'docker', 'kubernetes', 'aws', 'cloud', 'web', 'api', 'cli', 'framework',
    'library', 'tool', 'tools', 'platform', 'service', 'app', 'application',
    'open-source', 'opensource', 'awesome', 'tutorial', 'guide', 'example',
    'demo', 'starter', 'template', 'boilerplate', 'project', 'projects',
    'chat', 'web-app', 'desktop', 'mobile', 'linux', 'macos', 'windows',
    'cross-platform', 'frontend', 'backend', 'full-stack', 'devops',
    'database', 'server', 'client', 'ui', 'ux', 'design', 'graphics',
    'game', 'games', 'music', 'video', 'photo', 'image', 'audio',
    'security', 'privacy', 'testing', 'ci', 'cd', 'build', 'automation',
    'script', 'scripts', 'config', 'configuration', 'setup', 'install',
    'package', 'manager', 'package-manager', 'npm', 'yarn', 'pip',
    'electron', 'react', 'vue', 'angular', 'nextjs', 'nodejs',
    'express', 'fastify', 'django', 'flask', 'spring', 'laravel',
    'tailwindcss', 'bootstrap', 'material-ui', 'antd', 'chakra-ui',
    'markdown', 'yaml', 'json', 'xml', 'csv', 'sql', 'nosql',
    'graphql', 'rest', 'grpc', 'websocket', 'http', 'https',
    'oauth', 'jwt', 'auth', 'authentication', 'authorization',
    'monitoring', 'logging', 'analytics', 'metrics', 'tracing',
    'machinelearning', 'deep-learning', 'neural-network', 'neural-networks',
    'r', 'ts', 'cuda', 'gpu', 'cpu', 'ml', 'dl',
    'data', 'dataset', 'datasets', 'model', 'models',
    'evaluation', 'research', 'paper', 'conference',
    'memory', 'context', 'interface', 'interfaces',
    'search', 'retrieval', 'vector', 'vectors',
    'coding', 'code', 'developer-tools',
    'workflow', 'workflow-automation', 'task-automation',
    'self-hosted', 'self-evolving', 'low-code', 'no-code',
    'webui', 'web-search', 'code-search', 'image-search',
    'tts', 'vision', 'voice', 'speech',
    'text-generation', 'text-classification', 'text-to-image',
    'image-processing', 'image-recognition', 'image-generation',
    'object-detection', 'segmentation', 'pose-estimation',
    'super-resolution', 'face-restoration', 'image-restoration',
    'deepfake', 'deepfakes', 'deep-fake', 'deep-face-swap',
    'quantization', 'distributed-training', 'model-parallelism',
    'hyperparameter-search', 'pipeline-parallelism',
    'multi-agent', 'multi-agents', 'multiagent', 'multi-agent-system',
    'multi-agent-systems', 'multiagent-systems', 'multi-agents-collaboration',
    'agentic', 'agentic-ai', 'agentic-framework', 'agentic-workflow',
    'agentic-coding', 'agentic-code', 'agentic-skills', 'agentic-retrieval',
    'agentic-search', 'agentic-engineering', 'agent-framework', 'agent-protocol',
    'agent-development', 'agent-skills', 'agent-evolution', 'agent-memory',
    'agent-computer-interface', 'agent-infrastructure', 'agent-context',
    'agent-native', 'agent-harness', 'agent-collaboration',
    'computer-use-agent', 'gui-agents', 'coding-agent', 'coding-agents',
    'coding-assistant', 'coding-assistants', 'background-agents',
    'autonomous-agent', 'autonomous-agents', 'autonomous-driving',
    'autonomous-navigation', 'autonomous-vehicles',
    'embodied', 'embodied-ai', 'robotic', 'robot-learning',
    'foundation-models', 'world-models', 'world-model',
    'instruction-tuning', 'fine-tuning', 'rlhf', 'alignment',
    'llm', 'llms', 'llm-app', 'llm-apps', 'llm-ui', 'llm-webui',
    'llm-local', 'llm-prompting', 'llm-security', 'llm-gateway',
    'llm-agent', 'llm-tools', 'llm-eval', 'llm-evaluation',
    'llm-evaluation-framework', 'llm-memory', 'llm-serving',
    'llm-inference', 'llm-ops', 'llm-framework', 'llm-application',
    'large-language-models', 'large-language-model',
    'offline-llm', 'local-llm', 'chatgpt', 'chatgpt-free',
    'chatgpt-4', 'chatgpt4', 'chatgpt-api', 'gpt-4', 'gpt-4o', 'gpt4',
    'gpt4-api', 'gpt-3', 'gpt-35-turbo', 'gpt-5', 'gpt-engineer',
    'openai', 'openai-api', 'openai-chatgpt', 'openai-codex', 'openai-proxy',
    'anthropic', 'anthropic-claude', 'claude', 'claude-ai', 'claude-3',
    'claude-code', 'claude-agents', 'claude-agent-sdk', 'claude-cowork',
    'claude-skills', 'claude-code-skills', 'claude-code-hooks',
    'claude-code-plugins', 'claude-code-plugin', 'claude-code-skill',
    'claude-code-commands', 'claude-code-best-practices',
    'claude-code-agents', 'awesome-claude-code',
    'gemini', 'gemini-ai', 'gemini-pro', 'gemini-flash', 'gemini-ultra',
    'gemini-api', 'gemini-server', 'google-gemini', 'vertex-ai', 'vertexai',
    'vertex-ai-gemini-api',
    'deepseek', 'deepseek-r1', 'deepseek-v3', 'deepseek-api',
    'huggingface', 'transformers', 'transformer', 'pytorch', 'pytorch-transformers',
    'tensorflow', 'keras', 'scikit-learn', 'scikit-learn-python',
    'langchain', 'langchain4j', 'langchain-for-go', 'langchaingo', 'langgraph',
    'llamaindex', 'llama-index', 'llama', 'llama2', 'llama3', 'llama-api',
    'llamacpp', 'llama-factory', 'ollama', 'ollama-webui', 'openmemory',
    'vllm', 'litellm', 'mlx', 'coreml', 'torchaudio',
    'rag', 'retrieval-augmented-generation', 'graphrag',
    'vector-database', 'vector-search', 'vector-store', 'vector-index',
    'vector-similarity', 'embedding', 'embeddings', 'embedding-database',
    'embedding-similarity', 'embedding-store', 'sentence-embeddings',
    'semantic-search', 'semantic-kernel', 'semantic-parsing',
    'retrieval-systems', 'context-retrieval', 'agentic-retrieval',
    'knowledge-graph', 'knowledge-base', 'knowledgebase',
    'knowledge-curation', 'knowledge-management', 'knowledge-management-graph',
    'information-retrieval', 'retrieval',
    'multimodal', 'mllm', 'vision-language-model', 'multi-modal-rag',
    'multimodal-learning', 'multi-model',
    'text-to-speech', 'text-to-video', 'speech-recognition', 'speech-synthesis',
    'speech-processing', 'speech-to-text', 'voice-ai', 'voice-clone', 'voice-cloneai',
    'tts-model', 'multi-speaker-tts', 'zero-shot-tts', 'speaker-encodings',
    'image-to-video', 'audio-generation', 'image2image', 'text2image',
    'wan-video', 'video-analytics', 'video-processing', 'video-generation',
    'ai-video-generation', 'video-deepfake', 'real-time-deepfake', 'realtime-deepfake',
    'stable-diffusion', 'diffusion-models', 'diffusion',
    'text-to-image', 'image-generation', 'ai-image-generation',
    'ai-art', 'ai-art-generator', 'generative-ai', 'generativeai', 'genai',
    'generative-ai-tools', 'generative-ui',
    'computer-vision', 'opencv', 'densepose', 'yolo-world', 'deepface',
    'image-upscaling', 'gigapixel-images', 'topaz', 'mobilenet-v2', 'mobilenetv3',
    'mobile-deep-learning', 'normalization-free-training', 'pretrained-weights',
    'pretrained-models', 'vision-transformer-models',
    'instance-segmentation', 'gan', 'imagenet', 'hanlp',
    'mcp', 'mcp-server', 'mcp-servers', 'mcp-clients', 'mcp-tools',
    'mcp-gateway', 'mcp-client', 'mcp-inspector', 'mcp-ui', 'mcp-apps',
    'mcp-host', 'mcp-security', 'model-context-protocol', 'modelcontextprotocol',
    'model-context-protocol-servers', 'remote-mcp-server', 'fastmcp',
    'browser-automation', 'headless-browser',
    'web-crawler', 'web-scraping', 'ai-crawler', 'ai-scraping',
    'crawl4ai', 'firecrawl-ai', 'html-to-markdown',
    'pdf-extractor-rag', 'pdf-to-json', 'pdf-to-text',
    'document-image-analysis', 'document-image-processing',
    'ocr', 'paddleocr-vl',
    'ai-chatbot', 'ai-chatbots', 'chatbots', 'chat-ui',
    'ai-assistant', 'ai-companion', 'ai-tutor', 'ai-vtuber', 'ai-waifu',
    'conversational-ai', 'ai-native', 'ai-application', 'ai-framework',
    'ai-frameworks', 'ai-tools', 'ai-tooling', 'ai-gateway', 'ai-engineering',
    'aiengineering', 'ai-integration', 'ai-governance', 'ai-transparency',
    'ai-sre', 'ai-runtime', 'ai-sandboxes', 'ai-skills', 'ai-agent-skills',
    'aiagent', 'aiagents', 'aiagentframework',
    'agents-sdk', 'agentscope', 'agentscope-runtime',
    'ai-workflow-optimization', 'ai-workflows', 'ai-observability', 'ai-monitoring',
    'ai-safety', 'prompt-governance', 'auditable-ai',
    'ai4science', 'spatial-ai', 'edge-ai', 'ai-chip',
    'on-device-ai', 'whatsapp-ai', 'wechat', 'wechaty',
    'agentic-agi', 'agi',
    'ai-deep-fake', 'ai-face', 'ai-webcam', 'deepfake-webcam',
    'ai-search', 'search-engine', 'search-api', 'web-search',
    'app-search', 'enterprise-search', 'full-text-search',
    'fuzzy-search', 'hybrid-search', 'search-as-you-type', 'site-search',
    'typo-tolerance', 'nearest-neighbor-search',
    'ai-coding', 'code-generation', 'codegen', 'codegenerator',
    'codebase-generation', 'code-analysis', 'code-execution', 'code-interpreter',
    'code-free', 'code-search',
    'terminal-ai', 'terminal-automation', 'desktop-automation', 'desktop-app',
    'cli-tool', 'desktop-control', 'no-code', 'low-code', 'low-code-platform',
    'workflow-orchestration', 'data-orchestrator',
    'data-pipelines', 'airflow', 'apache-airflow',
    'mlops', 'llmops', 'model-serving', 'model-hub', 'model-management',
    'model-router', 'llm-serving', 'llm-evaluation',
    'inference', 'llm-inference',
    'deep-learning-tutorial', 'interactive-learning', 'interaction',
    'context-engineering', 'context-engine', 'context-management', 'context-mode',
    'context-database', 'system-prompt', 'system-prompts', 'prompts', 'prompts-chat',
    'prompt-engineering', 'prompt-testing', 'prompt-management',
    'deep-research', 'deepresearch', 'deep-search',
    'investment-research', 'research-paper',
    'job-search', 'career-ops',
    'memory-system', 'memory-engine', 'memory-management', 'memory-retrieval',
    'long-term-memory', 'memory-agent', 'supermemory',
    'ai-memory',
    'hermes-agent', 'metagpt', 'autogen', 'autogen-ecosystem', 'autogen-extension',
    'smolagents', 'openhands', 'openmanus', 'genericagent',
    'crewai', 'langchain', 'langgraph', 'dify', 'n8n', 'flowise', 'langflow',
    'composio', 'copilotkit', 'copilot-chat', 'open-agents',
    'openclaw', 'openhands', 'oh-my-openagent', 'openmanus',
    'browser-use', 'agent-browser',
    'calclaude', 'gemini-cli', 'openai-codex', 'codex', 'codex-cli', 'codex-skills',
    'cursor-ai', 'cursorai', 'trae-ai', 'trae-ide', 'windsurf-ai',
    'opencode', 'openharness', 'openhands',
    'chatchat', 'chatglm', 'fastchat', 'xinference', 'agentgpt',
    'baby-agi', 'autogpt', 'deepagents', 'superagent',
    'nous-research', 'emnlp2024',
    'quant-models', 'auto-quant',
    'heterogeneous-training', 'model-parallelism', 'pipeline-parallelism',
    'naive-bayes-classifier', 'naivebayes', 'support-vector-machines',
    'xai', 'explainable-ai', 'ai-transparency',
    'in-context-reinforcement-learning', 'reinforcement-learning-algorithms',
    'self-evolution', 'self-evolving', 'evolution',
    'harness', 'harness-builder',
    'brain-computer-interface',
    'vibe-coding', 'agentic-coding',
    'tokens', 'token-optimization',
    'feedgenerator', 'julia-language', 'programming-language',
    'multi-speaker-tts'
  ];
  
  if (skipTopics.includes(t)) return false;
  
  for (const kw of AI_KEYWORDS) {
    if (t.includes(kw) || kw.includes(t)) return true;
  }
  
  return false;
}

// Main
async function main() {
  // Read tools.ts
  const toolsContent = readFileSync(TOOLS_PATH, 'utf-8');
  
  // Parse tools
  const tools = parseTools(toolsContent);
  console.log(`Found ${tools.length} tools with url field`);
  
  // Extract GitHub repos
  const repos = extractGithubRepos(tools);
  console.log(`Found ${repos.size} unique GitHub repos`);
  
  if (repos.size === 0) {
    console.log('No GitHub repos found - checking parse...');
    // Debug: show first few tools with GitHub URLs
    for (const t of tools.slice(0, 5)) {
      console.log(`  ${t.id}: ${t.url}`);
    }
    process.exit(0);
  }

  // Load existing topics
  const existingTopics = JSON.parse(readFileSync(TOPICS_PATH, 'utf-8'));
  const existingTopicSet = new Set(existingTopics.topics.map(t => t.topic.toLowerCase()));
  console.log(`Existing topics: ${existingTopicSet.size}`);

  // Build tool lookup map
  const toolMap = new Map();
  for (const t of tools) {
    toolMap.set(t.id, t);
  }

  // Fetch GitHub data with rate limiting
  const results = [];
  let idx = 0;
  for (const [key, info] of repos) {
    idx++;
    console.log(`[${idx}/${repos.size}] Fetching ${key}...`);
    const data = await fetchRepo(info.owner, info.repo);
    if (data) {
      results.push({ key, info, data });
    }
    // Rate limit: 1 second between requests
    if (idx < repos.size) {
      await new Promise(r => setTimeout(r, 1100));
    }
  }

  console.log(`\nSuccessfully fetched ${results.length} repos`);

  // Track changes
  const starsUpdates = [];
  const forksUpdates = [];
  const languageUpdates = [];
  const updatedAtUpdates = [];
  const allTopics = new Map();

  // Process results
  for (const { key, info, data } of results) {
    const tool = toolMap.get(info.toolId);
    if (!tool) continue;

    const newStars = data.stargazers_count;
    const newForks = data.forks_count;
    const newLanguage = data.language || undefined;
    const newUpdatedAt = formatDate(data.pushed_at);

    // Check stars change
    if (tool.githubStars !== undefined && newStars !== tool.githubStars) {
      starsUpdates.push({
        toolId: info.toolId,
        toolName: info.toolName,
        old: tool.githubStars,
        new: newStars,
        delta: newStars - tool.githubStars
      });
    }

    // Check forks change or missing
    if (newForks !== undefined) {
      if (tool.forks !== undefined && newForks !== tool.forks) {
        forksUpdates.push({ toolId: info.toolId, toolName: info.toolName, old: tool.forks, new: newForks });
      } else if (tool.forks === undefined) {
        forksUpdates.push({ toolId: info.toolId, toolName: info.toolName, old: 'N/A', new: newForks });
      }
    }

    // Check language change or missing
    if (newLanguage) {
      if (tool.language !== newLanguage) {
        languageUpdates.push({ toolId: info.toolId, toolName: info.toolName, old: tool.language || 'N/A', new: newLanguage });
      }
    }

    // Check updatedAt change
    if (newUpdatedAt && tool.updatedAt !== newUpdatedAt) {
      updatedAtUpdates.push({ toolId: info.toolId, toolName: info.toolName, old: tool.updatedAt || 'N/A', new: newUpdatedAt });
    }

    // Collect topics
    if (data.topics && Array.isArray(data.topics)) {
      for (const t of data.topics) {
        const normalized = t.toLowerCase().replace(/_/g, '-');
        allTopics.set(normalized, (allTopics.get(normalized) || 0) + 1);
      }
    }
  }

  // Find new AI topics
  const newTopics = [];
  for (const [topic, count] of allTopics) {
    if (existingTopicSet.has(topic)) continue;
    if (!isAITopic(topic)) continue;
    // Skip if only 1 repo and stars < 1000
    if (count === 1) {
      const repoWithTopic = results.find(r => r.data.topics && r.data.topics.map(tt => tt.toLowerCase().replace(/_/g, '-')).includes(topic));
      if (repoWithTopic && repoWithTopic.data.stargazers_count < 1000) continue;
    }

    let minStars = 5000;
    if (count >= 3) minStars = 2000;
    else if (count >= 2) minStars = 3000;

    newTopics.push({
      topic,
      url: `https://github.com/topics/${topic}`,
      minStars,
      description: `（自动发现）${topic.replace(/-/g, ' ')}`
    });
  }

  // Now update tools.ts content
  let updatedContent = toolsContent;
  let hasToolChanges = false;
  
  // We need to update the file. Rather than complex regex, let's do line-by-line replacement
  const lines = updatedContent.split('\n');
  const outputLines = [];
  
  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    
    // Check if this line has a field we need to update
    // We need to find which tool this line belongs to
    // Track current tool context
  }
  
  // Better approach: use targeted replacements per tool
  for (const { key, info, data } of results) {
    const newStars = data.stargazers_count;
    const newForks = data.forks_count;
    const newLanguage = data.language || undefined;
    const newUpdatedAt = formatDate(data.pushed_at);
    const tool = toolMap.get(info.toolId);
    if (!tool) continue;
    
    // Build update map for this tool
    const updates = {};
    if (newStars !== undefined && tool.githubStars !== newStars) updates.githubStars = newStars;
    if (newForks !== undefined && tool.forks !== newForks) updates.forks = newForks;
    if (newForks !== undefined && tool.forks === undefined) updates.forks = newForks;
    if (newLanguage && tool.language !== newLanguage) updates.language = newLanguage;
    if (newUpdatedAt && tool.updatedAt !== newUpdatedAt) updates.updatedAt = newUpdatedAt;
    
    if (Object.keys(updates).length === 0) continue;
    
    // Find this tool's block and update fields
    // Pattern: find lines between the tool's id line and the closing brace
    let inTool = false;
    let toolStartIdx = -1;
    let toolEndIdx = -1;
    let braceCount = 0;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (!inTool && line.includes(`id: "${info.toolId}"`) || (!inTool && line.includes(`id: '${info.toolId}'`))) {
        inTool = true;
        toolStartIdx = i;
        braceCount = 0;
      }
      if (inTool) {
        braceCount += (line.match(/\{/g) || []).length;
        braceCount -= (line.match(/\}/g) || []).length;
        if (braceCount === 0 && toolStartIdx !== i) {
          toolEndIdx = i;
          break;
        }
      }
    }
    
    if (toolStartIdx === -1 || toolEndIdx === -1) continue;
    
    // Update fields within the tool block
    for (let i = toolStartIdx; i <= toolEndIdx; i++) {
      const line = lines[i];
      for (const [field, value] of Object.entries(updates)) {
        const fieldPattern = new RegExp(`(\\s*)(${field}:\\s*)([^,\\n]+)`);
        const match = line.match(fieldPattern);
        if (match) {
          lines[i] = line.replace(fieldPattern, `$1$2${JSON.stringify(value)}`);
          hasToolChanges = true;
        }
      }
      // Add missing fields
      if (i === toolEndIdx - 1 || (i === toolEndIdx && lines[i].trim() === '}')) {
        for (const [field, value] of Object.entries(updates)) {
          const fieldPattern = new RegExp(`${field}:\\s*`);
          if (!fieldPattern.test(lines.slice(toolStartIdx, toolEndIdx + 1).join('\n'))) {
            // Field doesn't exist, add it
            const indent = lines[i].match(/^(\s+)/)?.[1] || '    ';
            if (lines[i].trim() === '}') {
              // Insert before closing brace
              const lastLine = lines[i];
              const prevLine = i > toolStartIdx ? lines[i-1] : '';
              const hasTrailingComma = prevLine.trim().endsWith(',');
              if (!hasTrailingComma && i > toolStartIdx) {
                lines[i-1] = prevLine.replace(/(\s*)$/, ',');
              }
              lines.splice(i, 0, `${indent}${field}: ${JSON.stringify(value)},`);
              toolEndIdx++;
              hasToolChanges = true;
            }
          }
        }
      }
    }
  }
  
  updatedContent = lines.join('\n');
  
  // Write updated tools.ts if changed
  if (hasToolChanges) {
    writeFileSync(TOOLS_PATH, updatedContent);
    console.log('✅ tools.ts updated');
  } else {
    console.log('✅ tools.ts: no changes needed');
  }

  // Update ai-topics.json if new topics found
  if (newTopics.length > 0) {
    existingTopics.topics.push(...newTopics);
    existingTopics.lastUpdated = new Date().toISOString();
    writeFileSync(TOPICS_PATH, JSON.stringify(existingTopics, null, 2));
    console.log(`✅ ai-topics.json: added ${newTopics.length} new topics`);
  } else {
    console.log('✅ ai-topics.json: no new topics');
  }

  // Summary
  const summary = {
    totalRepos: repos.size,
    fetchedRepos: results.length,
    starsUpdates: starsUpdates.length,
    starsDetails: starsUpdates.slice(0, 10),
    forksUpdates: forksUpdates.length,
    languageUpdates: languageUpdates.length,
    updatedAtUpdates: updatedAtUpdates.length,
    newTopics: newTopics.length,
    newTopicsDetails: newTopics.slice(0, 20),
    existingTopicsCount: existingTopicSet.size,
    hasToolChanges,
    topicsChanged: newTopics.length > 0
  };

  console.log('\n=== SUMMARY ===');
  console.log(JSON.stringify(summary, null, 2));
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
