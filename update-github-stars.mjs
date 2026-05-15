#!/usr/bin/env node
/**
 * 批量更新 tools.ts 的 GitHub stars + 仓库信息 + 收集 topics
 * 使用 curl 带 Authorization header 访问 GitHub API
 */
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const TOOLS_PATH = path.resolve('src/data/tools.ts');
const TOPICS_PATH = path.resolve('data/ai-topics.json');
const ENV_PATH = path.resolve('.env.local');

// Read GitHub token
const envContent = fs.readFileSync(ENV_PATH, 'utf-8');
const GITHUB_TOKEN = envContent.match(/GITHUB_TOKEN=(.+)/)?.[1]?.trim().replace(/["']/g, '');
if (!GITHUB_TOKEN) {
  console.error('ERROR: GITHUB_TOKEN not found in .env.local');
  process.exit(1);
}

// Read tools.ts
const toolsContent = fs.readFileSync(TOOLS_PATH, 'utf-8');
const fileLines = toolsContent.split('\n');

// Parse tool blocks
const tools = [];
let currentTool = null;
let braceDepth = 0;

for (let i = 0; i < fileLines.length; i++) {
  const line = fileLines[i];
  
  const idMatch = line.match(/^\s+id:\s*"([^"]+)"/);
  if (idMatch && !currentTool) {
    currentTool = { id: idMatch[1], startLine: i, endLine: i };
    braceDepth = 0;
  }
  
  if (currentTool) {
    const urlMatch = line.match(/url:\s*"https:\/\/github\.com\/([^"]+)"/);
    if (urlMatch) {
      currentTool.repo = urlMatch[1];
    }
    
    const starsMatch = line.match(/githubStars:\s*(\d+)/);
    if (starsMatch) {
      currentTool.currentStars = parseInt(starsMatch[1]);
      currentTool.starsLine = i;
    }
    
    const forksMatch = line.match(/\bforks:\s*(\d+)/);
    if (forksMatch) {
      currentTool.currentForks = parseInt(forksMatch[1]);
      currentTool.forksLine = i;
    }
    
    const langMatch = line.match(/\blanguage:\s*"([^"]+)"/);
    if (langMatch) {
      currentTool.currentLanguage = langMatch[1];
      currentTool.langLine = i;
    }
    
    const updatedMatch = line.match(/updatedAt:\s*"([^"]+)"/);
    if (updatedMatch) {
      currentTool.currentUpdatedAt = updatedMatch[1];
      currentTool.updatedLine = i;
    }
    
    // Track braces
    for (const ch of line) {
      if (ch === '{') braceDepth++;
      if (ch === '}') braceDepth--;
    }
    
    currentTool.endLine = i;
    
    if (braceDepth <= 0 && currentTool.repo) {
      tools.push({ ...currentTool });
      currentTool = null;
    }
  }
}

console.log(`Found ${tools.length} tools with GitHub URLs`);

// Load existing topics
const existingTopics = JSON.parse(fs.readFileSync(TOPICS_PATH, 'utf-8'));
const existingTopicSet = new Set(existingTopics.topics.map(t => t.topic.toLowerCase()));
console.log(`Existing topics: ${existingTopicSet.size}`);

// Batch fetch: use curl with proper auth
function fetchRepo(repo) {
  try {
    const cmd = `curl -s -H "Authorization: token ${GITHUB_TOKEN}" "https://api.github.com/repos/${repo}"`;
    const output = execSync(cmd, { encoding: 'utf-8', timeout: 15000 });
    const data = JSON.parse(output);
    if (data.message && data.message.includes('rate limit')) {
      console.log(`  Rate limited, waiting...`);
      execSync('sleep 60', { encoding: 'utf-8' });
      return fetchRepo(repo); // retry
    }
    return data;
  } catch (err) {
    console.error(`  Error fetching ${repo}: ${err.message}`);
    return null;
  }
}

const results = [];
const allTopics = new Map();
const batchSize = 5; // fetch 5 at a time with 1s delay between batches

for (let i = 0; i < tools.length; i += batchSize) {
  const batch = tools.slice(i, i + batchSize);
  const batchNum = Math.floor(i / batchSize) + 1;
  const totalBatches = Math.ceil(tools.length / batchSize);
  
  console.log(`\nBatch ${batchNum}/${totalBatches}`);
  
  for (const tool of batch) {
    const data = fetchRepo(tool.repo);
    if (!data || !data.stargazers_count) {
      console.log(`  ${tool.id}: FAILED (${data?.message || 'no data'})`);
      continue;
    }
    
    const newStars = data.stargazers_count;
    const newForks = data.forks_count || 0;
    const newLanguage = data.language || '';
    const newUpdatedAt = data.pushed_at ? new Date(data.pushed_at).toISOString().split('T')[0] : null;
    const topics = (data.topics || []).map(t => t.toLowerCase());
    
    const starsChanged = newStars !== tool.currentStars;
    const forksChanged = newForks !== (tool.currentForks || 0);
    const langChanged = newLanguage && newLanguage !== tool.currentLanguage;
    
    results.push({
      id: tool.id,
      repo: tool.repo,
      oldStars: tool.currentStars,
      newStars,
      oldForks: tool.currentForks || 0,
      newForks,
      oldLanguage: tool.currentLanguage || '',
      newLanguage,
      newUpdatedAt,
      starsChanged, forksChanged, langChanged,
      starsLine: tool.starsLine,
      forksLine: tool.forksLine,
      langLine: tool.langLine,
      updatedLine: tool.updatedLine,
      topics
    });
    
    for (const t of topics) {
      allTopics.set(t, (allTopics.get(t) || 0) + 1);
    }
    
    const status = starsChanged ? `${tool.currentStars}→${newStars}` : `${newStars}`;
    console.log(`  ${tool.id}: ${status} | forks: ${newForks} | lang: ${newLanguage || 'N/A'}`);
  }
  
  // Rate limit protection between batches
  if (i + batchSize < tools.length) {
    await new Promise(r => setTimeout(r, 1200));
  }
}

// Apply changes to fileLines
let starsUpdated = 0, forksUpdated = 0, langUpdated = 0, updatedUpdated = 0;

for (const r of results) {
  if (r.starsChanged && r.starsLine !== undefined) {
    const indent = fileLines[r.starsLine].match(/^(\s+)/)?.[1] || '    ';
    fileLines[r.starsLine] = `${indent}githubStars: ${r.newStars}`;
    starsUpdated++;
  }
  
  if (r.forksLine !== undefined) {
    if (r.forksChanged || r.newForks !== r.oldForks) {
      const indent = fileLines[r.forksLine].match(/^(\s+)/)?.[1] || '    ';
      fileLines[r.forksLine] = `${indent}forks: ${r.newForks}`;
      forksUpdated++;
    }
  } else if (r.newForks > 0) {
    // Insert forks after stars line
    const insertAfter = r.starsLine !== undefined ? r.starsLine : r.updatedLine;
    if (insertAfter !== undefined) {
      const indent = fileLines[insertAfter].match(/^(\s+)/)?.[1] || '    ';
      fileLines.splice(insertAfter + 1, 0, `${indent}forks: ${r.newForks},`);
      forksUpdated++;
      // Adjust subsequent line numbers
      for (const r2 of results) {
        if (r2.starsLine > insertAfter) r2.starsLine++;
        if (r2.forksLine > insertAfter) r2.forksLine++;
        if (r2.langLine > insertAfter) r2.langLine++;
        if (r2.updatedLine > insertAfter) r2.updatedLine++;
      }
    }
  }
  
  if (r.langLine !== undefined) {
    if (r.langChanged || (r.newLanguage && !r.oldLanguage)) {
      const indent = fileLines[r.langLine].match(/^(\s+)/)?.[1] || '    ';
      fileLines[r.langLine] = `${indent}language: "${r.newLanguage}"`;
      langUpdated++;
    }
  } else if (r.newLanguage) {
    const insertAfter = r.forksLine !== undefined ? r.forksLine : (r.starsLine !== undefined ? r.starsLine : r.updatedLine);
    if (insertAfter !== undefined) {
      const indent = fileLines[insertAfter].match(/^(\s+)/)?.[1] || '    ';
      fileLines.splice(insertAfter + 1, 0, `${indent}language: "${r.newLanguage}",`);
      langUpdated++;
    }
  }
  
  if (r.updatedLine !== undefined && r.newUpdatedAt) {
    const indent = fileLines[r.updatedLine].match(/^(\s+)/)?.[1] || '    ';
    fileLines[r.updatedLine] = `${indent}updatedAt: "${r.newUpdatedAt}"`;
    updatedUpdated++;
  }
}

const newContent = fileLines.join('\n');
fs.writeFileSync(TOOLS_PATH, newContent, 'utf-8');

console.log(`\n=== Update Summary ===`);
console.log(`Stars updated: ${starsUpdated}`);
console.log(`Forks updated: ${forksUpdated}`);
console.log(`Language updated: ${langUpdated}`);
console.log(`UpdatedAt updated: ${updatedUpdated}`);

// Topic analysis
const aiKeywords = new Set([
  'ai','ml','dl','llm','nlp','cv','agent','robot','robots','robotics','vision',
  'language','neural','learning','generative','prompt','chatbot','deep-learning',
  'machine-learning','transformer','gpt','diffusion','rag','embedding','inference',
  'fine-tuning','llmops','mlops','model-serving','vector-search','semantic-search',
  'knowledge-graph','multimodal','speech','text-to-speech','image-generation',
  'video-generation','code-generation','autonomous','embodied-ai','world-models',
  'foundation-models','large-language-models','retrieval-augmented','instruction-tuning',
  'rlhf','alignment','genai','mcp','claude','codex','huggingface','llama',
  'ollama','chatgpt','openai','anthropic','deepseek','cursor','langchain','langgraph',
  'crewai','autogen','smolagents','metagpt','hermes-agent','openclaw','browser-use',
  'fine-tune','llm-framework','ai-agent','ai-chatbot','prompt-engineering',
  'ai-safety','vision-language','embodied','ai-search','graph-neural',
  'federated-learning','edge-ai','ai-chip','agentic','llms','ai-art','chatgpt-',
  'pretrained-models','multiagent','genai-chatbot','llm-ui','llm-webui','ai-crawler',
  'ai-scraping','generativeai','language-model','embeddings','ai-deep-fake','ai-face',
  'neural-network','ai-tools','opencv','machine-learning-algorithms','machinelearning',
  'llm-app','llm-serving','ai4science','agent-collaboration','agent-harness',
  'openai-api','ai-runtime','ai-sandboxes','claude-ai','ai-memory',
  'claude-agent','metagpt','multi-agent','chatbots','superagent','llm-local',
  'llm-prompting','llm-security','open-ai','agentic-rag','ai-agents-framework',
  'custom-ai-agents','local-llm','localai','agentic-agi','llm-agent','voice-cloneai',
  'agent-development','agent-skills','autonomous-agent','gpt-engineer','deep-neural',
  'deeplearning','neural-nets','speech-to-text','distributed-ml','spring-ai',
  'speech-synthesis','ai-gateway','llm-gateway','vertex-ai','embedding-database',
  'embedding-similarity','embedding-store','ai-workflow','ai-workflows','coding-agent',
  'natural-language-inference','ai-agent-skills','ai-coding','offline-llm','whatsapp-ai',
  'agent-native','ai-assistant','generative-ui','voice-ai','ai-tutor','multi-agent-systems',
  'llm-eval','llm-evaluation','llm-evaluation-framework','prompt-testing','llm-tools',
  'ai-agents-automation','pi-agent','voyage-ai','ai-art-generator','ai-image-generation',
  'ai-video-generation','higgsfield-ai','kling-ai','ai-companion','ai-vtuber','ai-waifu',
  'agent-evolution','agent-framework','agent-protocol','auditable-ai','prompt-governance',
  'terminal-ai','on-device-ai','ai-sre','agentgpt','agi','autogpt','baby-agi','graphrag',
  'agentic-engineering','anthropic-claude','claude-code','claude-code-skills','mcp-server',
  'autonomous-navigation','autonomous-vehicles','robot','llamaindex','deep-research',
  'knowledge-curation','llama-index','evaluation','llm-observability','prompt-management',
  'context-engineering','information-retrieval','retrieval','agentops','ai-governance',
  'mlflow','model-management','gemini','orchestration','fastmcp','mcp-clients','mcp-servers',
  'mcp-tools','conversational-ai','wechat','wechaty','deepseek-r1','knowledgebase','llama3',
  'pgvector','multi-modal-rag','llama2','vllm','gemini-api','gen-ai','google-gemini',
  'modelcontextprotocol','video-processing','generative-ai-tools','llamacpp','data-pipelines',
  'document-image-analysis','document-image-processing','ocr','pdf-to-text','embodied',
  'robotic','reinforcement-learning-algorithms','search-engine','sentence-embeddings',
  'txtai','text-semantic-similarity','mcp-gateway','model-router','image-processing',
  'spatial-ai','agent-computer-interface','computer-use-agent','gui-agents',
  'in-context-reinforcement-learning','mllm','ai-application','ai-framework','langchain-for-go',
  'langchaingo','llm-application','ai-frameworks','aiagent','aiagents','large-language-model',
  'workflow-orchestration','mcp-apps','mcp-host','mcp-inspector','mcp-ui','ai-monitoring',
  'ai-observability','aiengineering','datasets','ai-integration','image-recognition',
  'object-detection','segmentation','tensorrt','video-analytics','agent-memory','llm-memory',
  'memory-agent','memory-retrieval','mistral','retrieval-systems','robot-learning',
  'multimodal-learning','speech-processing','agent-infrastructure','ai-infrastructure',
  'context-retrieval','search-api','firecrawl-ai','ai-native','model-context-protocol-servers',
  'coreml','omo','multiagent-systems','aiagentframework','multi-agents','agentic-coding',
  'claude-code-agents','distributed-training','langchain4j','azure-openai','litellm',
  'openai-proxy','agency-agents','chatgpt-on-wechat','linkai','agentic-code','coding-agents',
  'heterogeneous-training','chinese-language','agentic-skills','mlx','interactive-learning',
  'agents-sdk','multi-agents-collaboration','agentscope','agentscope-runtime',
  'background-agents','headless-browser','voice-clone','deep-fake','deepfake','deepfake-webcam',
  'real-time-deepfake','realtime-deepfake','video-deepfake','semantic-kernel','deep-face-swap',
  'workflow-automation','brain-computer-interface','codex','opencode','browser-automation',
  'deepresearch','task-automation','model-parallelism','desktop-automation','chat-ui',
  'multi-model','multi-platform','deepseek-v3','autogen-ecosystem','copilot-chat',
  'codebase-generation','codegen','claude-code-hooks','claude-code-plugins','claude-code-skill',
  'context-mode','claude-code-plugin','awesome-claude-code','codex-skills','context-database',
  'code-search','terminal-automation','tts-model','audio-generation','text-generation',
  'deepseek-api','model-hub','codegenerator','big-model','large-scale','codex-cli',
  'code-analysis','web-search','pdf-to-json','image-search','nearest-neighbor-search',
  'vector-similarity','vector-store','quant-models','image2image','text2image',
  'image-classification','yolo-world','deepface','deepfakes','gigapixel-images','image-upscaling',
  'torchaudio','creative-tools','image-to-video','wan-video','vector-index','app-search',
  'enterprise-search','full-text-search','fuzzy-search','hybrid-search','search-as-you-type',
  'site-search','typo-tolerance','claude-code-best-practices','claude-code-commands',
  'code-execution','code-interpreter','harness','remote-mcp-server','self-evolution',
  'openai-codex','anti-bot','antigravity-ide','assistant-chat-bots','auto-quant',
  'bot-detection','claude-3','claude-cowork','claude-skills','dall-e','discord-bot',
  'investment-research','llama-api','long-term-memory','memory-engine','memory-management',
  'memory-system','multi-speaker-tts','nous-research','ollama-webui','openmemory',
  'research-paper','scikit-learn','scikit-learn-python','self-evolving','slack-bot',
  'supermemory','telegram-bot','trae-ide','vibe-coding','coding-assistant','coding-assistants',
  'speaker-encodings','agentic-retrieval','agentic-search','llm-apps','autogen-extension',
  'context-engine','context-management','comfyui','calclaude','gemini-pro','gemini-server',
  'gemini-ultra','ai-skills','cursor-ai','mobile-ui','quantization','deep-learning-tutorial',
  'gan','multi-agent-simulation','densepose','pose-estimation','world-model',
  'naive-bayes-classifier','support-vector-machines','feedgenerator','julia-language',
  'programming-language','airflow','apache-airflow','data-orchestrator','llm-ops',
  'hyperparameter-search','llm-inference','pipeline-parallelism','naivebayes','deep-search',
  'multi-agent-system','agent-context','natural-language-understanding','ai-transparency',
  'system-prompt','xai','instance-segmentation','face-restoration','gfpgan','image-restoration',
  'super-resolution','tts','imagenet','mobile-deep-learning','mobilenet','normalization-free-training',
  'pretrained-weights','vision-transformer','chatgpt-clone','librechat','zero-shot-tts',
  'gemini-ai','gemini-flash','hanlp','semantic-parsing','text-classification',
  'knowledge-management','knowledge-management-graph'
]);

function isAITopic(topic) {
  const t = topic.toLowerCase();
  for (const kw of aiKeywords) {
    if (t.includes(kw) || kw.includes(t.replace(/-/g, ''))) return true;
  }
  return false;
}

function normalizeTopic(topic) {
  return topic.toLowerCase().replace(/\s+/g, '-');
}

// Skip too generic topics
const skipTopics = new Set([
  'open-source','python','javascript','typescript','docker','linux','windows',
  'macos','web','api','cli','sdk','library','framework','tool','tools',
  'awesome','tutorial','example','demo','template','boilerplate','starter',
  'vscode','vim','emacs','neovim','shell','bash','zsh','rust','go','java',
  'cpp','c','csharp','dotnet','swift','kotlin','dart','flutter','react',
  'vue','angular','svelte','nodejs','nextjs','nestjs','express','django',
  'flask','fastapi','spring','spring-boot','rails','laravel','php','ruby',
  'chat','html','css','html5','tailwindcss','r','ts','yaml','gpu','tensor',
  'developer-tools','coding','datasets','research','evaluation','orchestration',
  'model','interface','interfaces','context','privacy','search','video-processing',
  'no-code','low-code','interpreter','mail','email','deep-search','xai',
  'programming-language','airflow','apache-airflow','data-orchestrator',
  'data-pipelines','julia-language','feedgenerator','naivebayes',
  'naive-bayes-classifier','support-vector-machines','hyperparameter-search',
  'pipeline-parallelism','normalization-free-training','mobilenet','mobilenetv2','mobilenet-v3',
  'imagenet','torch','torchaudio','tensorrt','coreml','mlx','gpu','gan',
  'harness','image','models','c-plus-plus','coding','developer-tools',
  'webui','chat-ui','web-search','search','search-engine','search-api',
  'site-search','app-search','enterprise-search','fuzzy-search','hybrid-search',
  'search-as-you-type','typo-tolerance','full-text-search','nearest-neighbor-search',
  'vector-similarity','vector-store','vector-index','image-search','image-processing',
  'image-classification','image-recognition','image-restoration','image-upscaling',
  'image2image','text2image','text-generation','audio-generation','text-classification',
  'semantic-parsing','face-restoration','instance-segmentation','object-detection',
  'segmentation','pose-estimation','densepose','deepfakes','deepfake','deep-fake',
  'real-time-deepfake','realtime-deepfake','video-deepfake','deep-face-swap',
  'quantization','auto-quant','quant-models','distributed-ml','distributed-training',
  'model-parallelism','heterogeneous-training','pretrained-weights','vision-transformer',
  'vision-transformer-models','mobile-deep-learning','mobilenet-v2','mobilenetv3',
  'normalization-free-training','yolo-world','deepface','gfpgan','super-resolution',
  'gigapixel-images','image-upscaling','topaz','torchaudio','creative-tools',
  'image-to-video','wan-video','text-to-image','text-to-video','dall-e',
  'discord-bot','slack-bot','telegram-bot','whatsapp-ai','wechat','wechaty',
  'assistant-chat-bots','conversational-ai','bot-detection','anti-bot',
  'investment-research','research-paper','research','evaluation','datasets',
  'orchestration','workflow-orchestration','workflow-automation','task-automation',
  'desktop-automation','terminal-automation','data-orchestrator','data-pipelines',
  'headless-browser','browser-automation','long-term-memory','memory',
  'memory-system','memory-engine','memory-management','openmemory','supermemory',
  'nous-research','scikit-learn','scikit-learn-python','self-evolving','self-hosted',
  'trae-ide','vibe-coding','coding','coding-assistant','coding-assistants',
  'speaker-encodings','multi-speaker-tts','zero-shot-tts','tts','tts-model',
  'speech','speech-to-text','speech-synthesis','speech-processing','voice-ai',
  'voice-clone','voice-cloneai','text-to-speech','audio-generation',
  'deep-learning-tutorial','interactive-learning','robot-learning','robotic',
  'robotics','reinforcement-learning','reinforcement-learning-algorithms',
  'in-context-reinforcement-learning','federated-learning',
  'autonomous','autonomous-agent','autonomous-agents','autonomous-driving',
  'autonomous-navigation','autonomous-vehicles',
  'embodied','embodied-ai','spatial-ai','world-model','world-models',
  'mllm','multimodal','multimodal-learning','vision-language','vision',
  'computer-vision','document-image-analysis','document-image-processing',
  'ocr','pdf-to-text','pdf-to-json','html-to-markdown',
  'graph-neural','graphrag','knowledge-graph','knowledge-base','knowledge-curation',
  'knowledge-management','knowledge-management-graph','knowledgebase',
  'rag','agentic-rag','multi-modal-rag','retrieval','retrieval-systems',
  'memory-retrieval','information-retrieval','context-retrieval',
  'vector-search','vector-database','semantic-search','semantic-kernel',
  'agentic-search','agentic-retrieval','deep-search','deepresearch','deep-research',
  'hybrid-search','full-text-search','fuzzy-search','search-as-you-type',
  'web-search','search-api','site-search','app-search','enterprise-search',
  'typo-tolerance','nearest-neighbor-search','vector-similarity','vector-store',
  'vector-index',
  'deepseek','deepseek-r1','deepseek-v3','deepseek-api',
  'gpt','gpt-5','gpt-4o','gpt-engineer','gpt-4','gpt4','gpt4-api',
  'gpt-3','gpt-35-turbo','chatgpt','chatgpt-on-wechat','chatgpt-clone',
  'chatgpt-free','chatgpt4','chatgpt-4','chatgpt3','chatgpt35-turbo',
  'chatgpt-api',
  'llama','llama2','llama3','llama-index','llamaindex','llama-api',
  'claude','claude-3','claude-ai','claude-code','claude-code-skills',
  'claude-code-plugins','claude-code-hooks','claude-code-skill','claude-code-plugin',
  'claude-code-commands','claude-code-best-practices','claude-code-agents',
  'claude-agent','claude-agent-sdk','claude-agents','claude-skills','claude-cowork',
  'awesome-claude-code','anthropic-claude',
  'gemini','gemini-ai','gemini-pro','gemini-flash','gemini-ultra','gemini-server',
  'google-gemini','gemini-api','vertex-ai-gemini-api','vertexai','vertex-ai',
  'ollama','ollama-webui',
  'openai','openai-api','openai-codex','openai-chatgpt','openai-proxy','open-ai',
  'codex','codex-skills','codex-cli',
  'anthropic',
  'cursor','cursor-ai','cursorai',
  'huggingface','vllm','langchain','langchain4j','langgraph',
  'autogen','autogen-ecosystem','autogen-extension','crewai','smolagents',
  'metagpt','hermes-agent','openclaw','browser-use',
  'mcp','mcp-server','mcp-servers','mcp-client','mcp-clients','mcp-tools',
  'mcp-inspector','mcp-ui','mcp-host','mcp-apps','mcp-gateway','mcp-security',
  'remote-mcp-server','modelcontextprotocol','model-context-protocol-servers',
  'fastmcp','comfyui',
  'composio','litellm','openai-proxy',
  'agentops','llmops','mlops','mlflow',
  'alignment','instruction-tuning','fine-tuning','rlhf',
  'prompt','prompt-engineering','prompt-management','prompt-testing',
  'prompt-governance','system-prompt','system-prompts',
  'foundation-models','large-language-model','large-language-models',
  'pretrained-models','model-management','model-hub','model-router','big-model',
  'embeddings','embedding','embedding-database','embedding-store',
  'embedding-similarity','sentence-embeddings',
  'natural-language-processing','natural-language-understanding','chinese-language',
  'hanlp','text-classification',
  'diffusion','diffusion-models','stable-diffusion',
  'transformer','transformers',
  'neural-network','neural-networks','deep-neural-networks','neural-nets',
  'deep-learning','deeplearning',
  'machine-learning','machinelearning','machine-learning-algorithms',
  'generative-ai','generativeai','genai','gen-ai','genai-chatbot',
  'generative-ui','generative-ai-tools',
  'on-device-ai','edge-ai','ai-chip',
  'terminal-ai',
  'ai-crawler','ai-scraping','firecrawl-ai',
  'ai-governance','ai-safety','ai-transparency','xai',
  'ai-monitoring','ai-observability','aiengineering',
  'ai-integration',
  'ai-skills','ai-tutor','ai-companion','ai-vtuber','ai-waifu',
  'ai-art','ai-art-generator','ai-image-generation','ai-video-generation',
  'higgsfield-ai','kling-ai',
  'on-device-ai','terminal-ai',
  'brain-computer-interface',
  'voyage-ai',
  'llm-inference','llm-ops','llm-observability','llm-security','llm-eval',
  'llm-evaluation','llm-evaluation-framework','llm-tools','llm-app','llm-apps',
  'llm-agent','llm-local','llm-serving','llm-gateway','llm-framework',
  'llm-memory','llm-ui','llm-webui','llm-application','local-llm','offline-llm',
  'model-serving','ai-runtime','ai-sandboxes','ai-gateway',
  'agentic','agentic-code','agentic-coding','agentic-engineering',
  'agentic-rag','agentic-search','agentic-retrieval','agentic-skills','agentic-agi',
  'agentic-workflow',
  'agent','agent-framework','agent-infrastructure','agent-development',
  'agent-skills','agent-memory','agent-evolution','agent-protocol',
  'agent-collaboration','agent-harness','agent-native','agent-context',
  'agent-computer-interface','computer-use-agent','gui-agents',
  'agentgpt','agi','autogpt','baby-agi',
  'ai','ai-agent','ai-agent-skills','ai-agents-framework','custom-ai-agents',
  'ai-agents-automation','aiagents','aiagent',
  'ai-agents-automation','pi-agent',
  'ai-assistant','ai-native','ai-infrastructure','ai-framework','ai-frameworks',
  'ai-application','ai-tooling','ai-tools',
  'multi-agent','multi-agent-system','multi-agent-systems','multi-agent-simulation',
  'multi-agents','multi-agents-collaboration','multiagent','multiagent-systems',
  'deepagents','superagent',
  'agents-sdk','agentscope','agentscope-runtime','background-agents',
  'self-evolving','self-evolution',
  'context-engineering','context-engine','context-management','context-mode',
  'context-database',
  'code-generation','codebase-generation','code-search','code-execution',
  'code-interpreter','code-analysis','coding-agent','coding-agents',
  'coding-assistant','coding-assistants','codegenerator','codegen',
  'ai-coding','agentic-code','agentic-coding',
  'openai-codex','antigravity-ide','awesome-claude-code','codex-skills',
  'claude-code-best-practices','claude-code-commands','awesome-claude-code',
  'llmops','mlops','llm-ops',
  'chat-ui','multi-model','multi-platform',
  'deepgemm','llama-stack','evolver','generic-agent','personaplex',
  'openharness','google-adk','archon','dflash','openhands','karpathy',
  'autoresearch','gpt-researcher','ai-hedge-fund','career-ops','multica',
  'astrbot','agent-browser','rowboat','honker','deep-tutor','oh-my-openagent',
  'cowagent','chatbox','cherry-studio','open-webui','mem0','mem-ai','khoj',
  'lobehub','openmanus','swarm-forge','langflow','flowise','dify','n8n',
  'auto-gpt','anything-llm','openclaw','localai','unsloth','llama-factory',
  'colossalai','deepspeed','keras','scikit-learn','minimind','fabric',
  'transformers','gradio','supabase','jeecgboot','claude-code','github-copilot',
  'gemini-cli','openai-codex','copilotkit','autogen','andrej-karpathy-skills',
  'chatgpt-desktop','context7','minimax-m2-7','nanobot','thunderbolt','glm-5',
  'hermes-web-ui','kronos','copaw','deer-flow','deerflow','eliza','langgraph',
  'smolagents','composio','open-agents','openpilot','gpt4free','gpt-academic',
  'agent-memory','memory-agent','ai-memory','openmemory','supermemory',
  'evaluation','research','investment-research','multi-model','multi-platform',
  'chat','webui','librechat','wan-video','creative-tools','topaz',
  'quant-models','auto-quant','model-parallelism','distributed-training',
  'llm-inference','model-serving','llm-serving','pipeline-parallelism',
  'heterogeneous-training','mobile-deep-learning','reinforcement-learning',
  'federated-learning','interactive-learning','robot-learning','robotic',
  'autonomous','autonomous-driving','embodied','world-model','mllm',
  'multimodal','computer-vision','graph-neural','knowledge-graph','rag',
  'vector-search','semantic-search','retrieval','deep-research','browser-automation',
  'context-engineering','code-generation','code-search','coding-assistant',
  'ai-assistant','ai-native','ai-infrastructure','ai-framework','ai-tooling',
  'ai-safety','ai-governance','ai-transparency','ai-monitoring','aiengineering',
  'ai-integration','ai-skills','ai-tutor','ai-companion','ai-art',
  'on-device-ai','edge-ai','terminal-ai','brain-computer-interface',
  'agentops','alignment','instruction-tuning','fine-tuning','rlhf',
  'prompt-engineering','prompt-management','prompt-testing','prompt-governance',
  'system-prompt','foundation-models','large-language-model','pretrained-models',
  'embeddings','natural-language-processing','diffusion','transformer',
  'neural-network','deep-learning','machine-learning','generative-ai',
  'generative-ui','openai-codex','antigravity-ide'
]);

const newTopics = [];
for (const [topic, count] of allTopics) {
  const normalized = normalizeTopic(topic);
  if (existingTopicSet.has(normalized)) continue;
  if (skipTopics.has(normalized)) continue;
  if (!isAITopic(normalized)) continue;
  
  if (count < 2) {
    const toolResult = results.find(r => r.topics.map(t => normalizeTopic(t)).includes(normalized));
    if (!toolResult || toolResult.newStars < 5000) continue;
  }
  
  let minStars = count >= 3 ? 2000 : count >= 2 ? 3000 : 5000;
  
  newTopics.push({
    topic: normalized,
    url: `https://github.com/topics/${normalized}`,
    minStars,
    description: `（自动发现）${normalized}`,
    repoCount: count
  });
}

newTopics.sort((a, b) => b.repoCount - a.repoCount);
console.log(`\nNew AI topics found: ${newTopics.length}`);
for (const t of newTopics.slice(0, 30)) {
  console.log(`  - ${t.topic} (${t.repoCount} repos, minStars: ${t.minStars})`);
}

if (newTopics.length > 0) {
  existingTopics.topics.push(...newTopics.map(t => ({
    topic: t.topic, url: t.url, minStars: t.minStars, description: t.description
  })));
  existingTopics.lastUpdated = new Date().toISOString();
  fs.writeFileSync(TOPICS_PATH, JSON.stringify(existingTopics, null, 2) + '\n', 'utf-8');
  console.log(`\nai-topics.json: ${existingTopics.topics.length} topics total`);
} else {
  console.log('\nNo new topics to add');
}

// Save summary
const summary = {
  totalScanned: tools.length,
  successfulQueries: results.length,
  starsUpdated,
  forksUpdated,
  langUpdated,
  updatedUpdated,
  newTopicsCount: newTopics.length,
  totalTopics: existingTopics.topics.length,
  changes: results.filter(r => r.starsChanged).map(r => ({
    id: r.id, old: r.oldStars, new: r.newStars, delta: r.newStars - r.oldStars
  })).sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta)).slice(0, 10),
  newTopics: newTopics.slice(0, 15).map(t => ({
    topic: t.topic, description: t.description, repoCount: t.repoCount
  }))
};

fs.writeFileSync('/tmp/github-update-summary.json', JSON.stringify(summary, null, 2));
console.log('\nSummary written to /tmp/github-update-summary.json');
console.log('DONE');
