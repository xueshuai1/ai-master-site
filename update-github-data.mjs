import fs from 'fs';
import { readFileSync, writeFileSync } from 'fs';

import { execSync } from 'child_process';
const TOKEN = execSync('grep GITHUB_TOKEN /Users/xueshuai/.openclaw/workspace/ai-master-site/.env.local | cut -d= -f2', { encoding: 'utf-8' }).trim();
if (!TOKEN) {
  console.error('GITHUB_TOKEN not set');
  process.exit(1);
}

// --- Step 1: Extract repos from tools.ts ---
const toolsContent = readFileSync('src/data/tools.ts', 'utf-8');
const urlMatches = toolsContent.matchAll(/url:\s*["`](https:\/\/github\.com\/[^\s"`]+)/g);
const repos = [...new Set([...urlMatches].map(m => m[1].replace('https://github.com/', '').replace(/\/$/, '')))];
console.log(`Found ${repos.length} repos`);

// --- Step 2: Load existing topics ---
const topicsData = JSON.parse(readFileSync('data/ai-topics.json', 'utf-8'));
const existingTopics = new Set(topicsData.topics.map(t => t.topic.toLowerCase()));
console.log(`Existing topics: ${existingTopics.size}`);

// --- Step 3: AI keyword list ---
const aiKeywords = [
  'ai','ml','dl','llm','nlp','cv','agent','robot','robots','robotics','vision','language',
  'neural','learning','generative','prompt','chatbot','deep-learning','machine-learning',
  'transformer','gpt','diffusion','rag','embedding','inference','fine-tuning','llmops',
  'mlops','model-serving','vector-search','semantic-search','knowledge-graph','multimodal',
  'speech','text-to-speech','image-generation','video-generation','code-generation','autonomous',
  'embodied-ai','world-models','foundation-models','large-language-models','retrieval-augmented',
  'instruction-tuning','rlhf','alignment','agi','deep-learning','machine-learning','deepseek',
  'openai','claude','gemini','langchain','llamaindex','mcp','llama','copilot','coding-agent',
  'agentgpt','autogpt','llamacpp','genai','llm-app','multi-agent','ai-agent','agentic',
  'rag','retrieval','embedding','chatgpt','whisper','stable-diffusion','comfyui','huggingface',
  'pytorch','tensorflow','keras','vllm','deepspeed','unsloth','gradio','colossalai',
  'langgraph','smolagents','gpt-researcher','autogen','flowise','litellm','deepfake',
  'face-recognition','voice-clone','speech-synthesis','text-classification','semantic-parsing',
  'knowledge-base','knowledge-graph','knowledge-management','knowledge-curation',
  'vector-database','vector-index','vector-store','vector-search','semantic-search',
  'semantic-kernel','search','search-api','web-search','deep-search','agentic-search',
  'agent-memory','agent-development','agent-framework','agent-infrastructure','agent-ops',
  'context-engineering','context-management','context-mode','context-engine',
  'self-evolving','self-evolution','self-hosted','multi-modal','multimodal-learning',
  'reinforcement-learning','fine-tuning','quantization','distributed-training','hyperparameter',
  'image-processing','image-generation','image-classification','image-recognition',
  'text-generation','audio-generation','video-generation','video-processing',
  'computer-vision','computer-use','ocr','pose-estimation','instance-segmentation',
  'super-resolution','image-restoration','face-restoration','deepfake','deep-fake',
  'deep-learning-tutorial','deep-neural-networks','deep-research','deep-search',
  'tts','text-to-speech','speech-recognition','speech-synthesis','speech-processing',
  'voice-ai','voice-clone','multi-speaker-tts','zero-shot-tts','speaker-encodings',
  'world-model','world-models','embodied','embodied-ai','robot','robotic','robotics',
  'robot-learning','autonomous-driving','autonomous-vehicles','autonomous-navigation',
  'autonomous-agents','autonomous-agent','brain-computer-interface',
  'foundation-models','foundation-model','llama-index','llama-stack','llama-factory',
  'llama-cookbook','llama-api','llama2','llama3','llamacpp',
  'openai-api','openai-cookbook','openai-codex','openai-agents',
  'claude-code','claude-ai','claude-agent','claude-agents','claude-skills',
  'gemini-api','gemini-pro','gemini-ultra','gemini-flash','gemini-server','gemini-ai',
  'deepseek','deepseek-r1','deepseek-v3','deepseek-api',
  'ragflow','rag-anything','graphrag','multi-modal-rag','agentic-rag',
  'langchain','langchain4j','langchain-chatglm','langchaingo',
  'prompt-engineering','prompt-testing','prompt-management','prompt-governance','system-prompt',
  'system-prompts','chatgpt-prompts','llm-prompting','prompts',
  'inference','llm-inference','llm-serving','llm-eval','llm-evaluation','llm-ops',
  'llm-local','offline-llm','local-llm','llm-memory','llm-app','llm-apps','llm-tools',
  'mlops','llmops','model-management','model-hub','model-serving','model-serving',
  'model-parallelism','model-context-protocol','modelcontextprotocol','model-router',
  'knowledge-graph','knowledge-base','knowledge-management','knowledge-curation','knowledgebase',
  'multi-agent','multi-agents','multi-agent-systems','multi-agent-system','multi-agent-simulation',
  'multi-agents-collaboration','multiagent','multiagent-systems',
  'agentic-ai','agentic-coding','agentic-engineering','agentic-framework','agentic-workflow',
  'agentic-skills','agentic-code','agentic-retrieval','agentic-search','agentic',
  'code-generation','code-gen','codegen','coding-agent','coding-agents','coding-assistant',
  'coding-assistants','code-search','code-analysis','code-execution','code-interpreter',
  'agent-browser','agent-development','agent-evolution','agent-framework','agent-harness',
  'agent-infrastructure','agent-memory','agent-native','agent-protocol','agent-skills',
  'computer-use-agent','gui-agents','agent-computer-interface',
  'generative-ai','generative-ui','genai','gen-ai','generativeai','generative-ai-tools',
  'large-language-model','large-language-models','llm','llms',
  'vibe-coding','ai-coding','ai-native','ai-application','ai-framework','ai-frameworks',
  'aiengineering','ai-engineering','ai-governance','ai-safety','ai-security','llm-security',
  'ai-gateway','ai-gateway','llm-gateway',
  'terminal-ai','on-device-ai','edge-ai','ai-sre','ai-infrastructure',
  'ai-assistant','ai-agent-skills','ai-agents','ai-agents-framework','ai-agents-automation',
  'ai-chatbot','ai-crawler','ai-scraping','ai-art','ai-art-generator',
  'ai-image-generation','ai-video-generation','ai-deep-fake','ai-face','ai-webcam',
  'ai-tutor','ai-companion','ai-vtuber','ai-waifu',
  'ai-monitoring','ai-observability',
  'ai-integration','ai-tools','ai-tooling','ai-runtime','ai-sandboxes',
  'ai-workflow','ai-workflows','ai-workflow-optimization',
  'memory','memory-agent','memory-engine','memory-management','memory-system','memory-retrieval',
  'long-term-memory','openmemory','supermemory','llm-memory','agent-memory',
  'agentops','context','context-database','context-retrieval',
  'deepresearch','deep-research','information-retrieval','retrieval-systems','retrieval',
  'web-search','deep-search','agentic-search',
  'chat-ui','chat-gpt','chatbot','chatbots','chatchat','chatglm','conversational-ai',
  'wechat','wechaty','telegram-bot','discord-bot','slack-bot',
  'fastmcp','fastchat','xinference','txtai','langfuse',
  'workflow-automation','workflow-orchestration',
  'browser-automation','headless-browser',
  'task-automation','desktop-automation','terminal-automation',
  'no-code','low-code','low-code-platform',
  'rag','pdf-extractor-rag','pdf-to-json',
  'quantization','quant-models','auto-quant',
  'speculative-decoding','speculative','flash-attention','paged-attention',
  'fp8','gemm','cuda',
  'swe-bench','gaia','benchmark','evaluation'
];

function isAITopic(topic) {
  if (!topic) return false;
  const lower = topic.toLowerCase();
  return aiKeywords.some(kw => lower === kw || lower.includes(kw.replace(/-/g, '')) || kw.replace(/-/g, '').includes(lower.replace(/-/g, '')));
}

// --- Step 4: Fetch repos with rate limiting ---
const sleep = ms => new Promise(r => setTimeout(r, ms));

async function fetchRepo(repo) {
  const url = `https://api.github.com/repos/${repo}`;
  try {
    const res = await fetch(url, { headers: { 'Authorization': `token ${TOKEN}` } });
    if (res.status === 404) {
      return { repo, error: 'not-found' };
    }
    if (!res.ok) {
      const text = await res.text();
      return { repo, error: `HTTP ${res.status}: ${text.slice(0, 100)}` };
    }
    return await res.json();
  } catch (e) {
    return { repo, error: e.message };
  }
}

const results = [];
for (let i = 0; i < repos.length; i++) {
  if (i > 0 && i % 10 === 0) {
    console.log(`  Progress: ${i}/${repos.length}`);
  }
  const data = await fetchRepo(repos[i]);
  results.push(data);
  if (i < repos.length - 1) await sleep(1200);
}

console.log(`\nFetched ${results.length} repos`);

// --- Step 5: Analyze results ---
const allTopics = {};
const repoUpdates = {};

for (const r of results) {
  if (r.error) continue;
  const repoPath = r.full_name.toLowerCase();
  
  // Track topics
  if (r.topics && r.topics.length > 0) {
    for (const t of r.topics) {
      const tl = t.toLowerCase();
      if (!allTopics[tl]) allTopics[tl] = { repos: [], stars: r.stargazers_count };
      allTopics[tl].repos.push(repoPath);
      allTopics[tl].stars = Math.max(allTopics[tl].stars, r.stargazers_count);
    }
  }
  
  // Track repo updates
  const pushedDate = r.pushed_at ? new Date(r.pushed_at).toISOString().split('T')[0] : null;
  repoUpdates[repoPath] = {
    stars: r.stargazers_count,
    forks: r.forks_count,
    language: r.language,
    updatedAt: pushedDate,
    topics: r.topics || []
  };
}

// --- Step 6: Find new AI topics ---
const newAITopics = [];
for (const [topic, info] of Object.entries(allTopics)) {
  if (existingTopics.has(topic)) continue;
  if (!isAITopic(topic)) continue;
  if (info.repos.length < 1) continue;
  // Skip if only 1 repo and stars < 1000
  if (info.repos.length === 1 && info.stars < 1000) continue;
  
  let minStars = 5000;
  if (info.repos.length >= 3) minStars = 2000;
  else if (info.repos.length >= 2) minStars = 3000;
  
  newAITopics.push({
    topic: topic,
    url: `https://github.com/topics/${topic}`,
    minStars,
    description: `（自动发现）${topic.replace(/-/g, ' ')}`
  });
}

newAITopics.sort((a, b) => b.minStars - a.minStars);
console.log(`New AI topics found: ${newAITopics.length}`);

// --- Step 7: Generate updates report ---
const starsChanges = [];
const forksChanges = [];
const languageChanges = [];
const updatedAtChanges = [];

// Parse tools.ts to find current data
const toolPattern = /\{\s*id:\s*["']([^"']+)["'][\s\S]*?name:\s*["']([^"']+)["'][\s\S]*?url:\s*["`](https:\/\/github\.com\/[^\s"`]+)["`][\s\S]*?githubStars:\s*(\d+)/g;

const toolsMap = {};
let m;
const contentStr = toolsContent;
while ((m = toolPattern.exec(contentStr)) !== null) {
  const [_, id, name, url, stars] = m;
  const repo = url.replace('https://github.com/', '').replace(/\/$/, '').toLowerCase();
  toolsMap[repo] = { id, name, stars: parseInt(stars), url };
}

// Compare
for (const [repo, info] of Object.entries(repoUpdates)) {
  if (!toolsMap[repo]) continue;
  const current = toolsMap[repo];
  if (info.stars !== current.stars) {
    starsChanges.push({ name: current.name, old: current.stars, new: info.stars, diff: info.stars - current.stars });
  }
  // We can check forks/language/updatedAt separately by reading the file
}

starsChanges.sort((a, b) => Math.abs(b.diff) - Math.abs(a.diff));

// --- Step 8: Update tools.ts ---
let updatedTools = toolsContent;
let starsUpdated = 0;
let forksUpdated = 0;
let languageUpdated = 0;
let updatedAtUpdated = 0;

// For each tool, update githubStars, forks, language, updatedAt
for (const [repo, info] of Object.entries(repoUpdates)) {
  // Find the tool entry in the file
  // Look for the url pattern and update nearby fields
  
  // githubStars
  if (info.stars !== undefined) {
    // Find this tool's githubStars in the file
    const repoForRegex = repo.replace(/[-\/]/g, (m) => m === '/' ? '\\/' : m.replace(/[-]/g, '[-_]'));
    
    // We need to find the tool entry by URL and update githubStars
    // This is complex with regex, let's use a different approach
  }
}

// Better approach: parse and reconstruct
// Let's use line-by-line processing
const lines = toolsContent.split('\n');
let inTool = false;
let currentToolRepo = '';
let toolStartIdx = -1;
let changes = [];

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  
  // Detect URL line
  const urlMatch = line.match(/url:\s*["`](https:\/\/github\.com\/(.+?))["`]/);
  if (urlMatch) {
    currentToolRepo = urlMatch[2].toLowerCase().replace(/\/$/, '');
  }
  
  if (currentToolRepo && repoUpdates[currentToolRepo]) {
    const info = repoUpdates[currentToolRepo];
    
    // Update githubStars
    const starsMatch = line.match(/^(.*githubStars:\s*)(\d+)(.*)/);
    if (starsMatch) {
      const newStars = info.stars;
      const oldStars = parseInt(starsMatch[2]);
      if (newStars !== oldStars) {
        lines[i] = starsMatch[1] + newStars + starsMatch[3];
        starsUpdated++;
      }
    }
    
    // Update forks
    const forksMatch = line.match(/^(.*forks:\s*)(\d+)(.*)/);
    if (forksMatch && info.forks) {
      const newForks = info.forks;
      const oldForks = parseInt(forksMatch[2]);
      if (newForks !== oldForks) {
        lines[i] = forksMatch[1] + newForks + forksMatch[3];
        forksUpdated++;
      }
    }
    
    // Update language
    const langMatch = line.match(/^(.*language:\s*["'])([^"']+)(["'].*)/);
    if (langMatch && info.language && langMatch[2] !== 'None') {
      if (langMatch[2] !== info.language) {
        lines[i] = langMatch[1] + info.language + langMatch[3];
        languageUpdated++;
      }
    }
    
    // Update updatedAt
    const dateMatch = line.match(/^(.*updatedAt:\s*["'])(\d{4}-\d{2}-\d{2})(["'].*)/);
    if (dateMatch && info.updatedAt) {
      const oldDate = dateMatch[2];
      const newDate = info.updatedAt;
      if (newDate > oldDate) {
        lines[i] = dateMatch[1] + newDate + dateMatch[3];
        updatedAtUpdated++;
      }
    }
  }
}

// Add missing forks/language fields
// This is harder, let's just focus on what we have

const newToolsContent = lines.join('\n');

// --- Step 9: Update ai-topics.json ---
if (newAITopics.length > 0) {
  topicsData.topics.push(...newAITopics);
  topicsData.lastUpdated = new Date().toISOString();
}

// --- Step 10: Write files ---
if (newToolsContent !== toolsContent) {
  writeFileSync('src/data/tools.ts', newToolsContent, 'utf-8');
  console.log(`tools.ts updated: ${starsUpdated} stars, ${forksUpdated} forks, ${languageUpdated} languages, ${updatedAtUpdated} dates`);
} else {
  console.log('tools.ts: no changes');
}

if (newAITopics.length > 0) {
  writeFileSync('data/ai-topics.json', JSON.stringify(topicsData, null, 2), 'utf-8');
  console.log(`ai-topics.json: added ${newAITopics.length} new topics (total: ${topicsData.topics.length})`);
} else {
  console.log('ai-topics.json: no new topics');
}

// --- Output summary for reporting ---
const summary = {
  totalRepos: repos.length,
  fetchErrors: results.filter(r => r.error).length,
  starsUpdated,
  forksUpdated,
  languageUpdated,
  updatedAtUpdated,
  starsChanges: starsChanges.slice(0, 10),
  newTopics: newAITopics.length,
  newTopicsList: newAITopics.slice(0, 20).map(t => `${t.topic} (${t.minStars}⭐)`)
};

console.log('\n=== SUMMARY ===');
console.log(JSON.stringify(summary, null, 2));

// Save summary for the caller
writeFileSync('data/github-update-summary.json', JSON.stringify(summary, null, 2), 'utf-8');

// Also save detailed changes
writeFileSync('data/github-detailed-changes.json', JSON.stringify({
  starsChanges,
  newAITopics: newAITopics
}, null, 2), 'utf-8');
