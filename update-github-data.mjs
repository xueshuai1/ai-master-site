import fs from 'fs';

const TOKEN = process.env.GITHUB_TOKEN;
const TOOLS_FILE = './src/data/tools.ts';
const TOPICS_FILE = './data/ai-topics.json';

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

// Read ai-topics.json
const topicsData = JSON.parse(fs.readFileSync(TOPICS_FILE, 'utf-8'));
const existingTopics = new Set(topicsData.topics.map(t => t.topic.toLowerCase()));

// AI topic keywords
const AI_KEYWORDS = [
  'ai', 'ml', 'dl', 'llm', 'nlp', 'cv', 'agent', 'robot', 'robots', 'robotics',
  'vision', 'language', 'neural', 'learning', 'generative', 'prompt', 'chatbot',
  'deep-learning', 'machine-learning', 'transformer', 'gpt', 'diffusion', 'rag',
  'embedding', 'inference', 'fine-tuning', 'llmops', 'mlops', 'model-serving',
  'vector-search', 'semantic-search', 'knowledge-graph', 'multimodal', 'speech',
  'text-to-speech', 'image-generation', 'video-generation', 'code-generation',
  'autonomous', 'embodied-ai', 'world-models', 'foundation-models',
  'large-language-models', 'retrieval-augmented', 'instruction-tuning', 'rlhf',
  'alignment', 'generative-ui', 'agentic', 'harness', 'deep-research',
  'mcp', 'coding-agent', 'coding-agents', 'code-gen', 'speculative-decoding',
  'model-eval', 'model-evaluation', 'self-evolution', 'self-improving',
  'multi-agent', 'multiagent', 'agent-harness', 'ai-forge'
];

function isAITopic(topic) {
  const lower = topic.toLowerCase();
  return AI_KEYWORDS.some(kw => {
    if (lower === kw) return true;
    const parts = lower.split('-');
    return parts.some(p => p === kw || p.startsWith(kw));
  });
}

function normalizeTopic(topic) {
  return topic.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

// Extract repos from tools.ts
const content = fs.readFileSync(TOOLS_FILE, 'utf-8');
const urlRegex = /url:\s*["'](https:\/\/github\.com\/([^"',]+))["']/g;
const repos = [];
const seen = new Set();
let m;

while ((m = urlRegex.exec(content)) !== null) {
  const parts = m[2].split('/');
  if (parts.length >= 2) {
    const owner = parts[0];
    const name = parts[1];
    if (name === 'features') continue;
    const key = `${owner}/${name}`;
    if (!seen.has(key)) {
      seen.add(key);
      repos.push({ key, fullUrl: m[1] });
    }
  }
}

const validRepos = repos.filter(r => r.key.split('/').length >= 2 && r.key.split('/')[1].length > 0);
console.log(`Found ${validRepos.length} repos to check`);

// Fetch data with proper Authorization header
const repoData = [];
let rateLimited = false;

for (let i = 0; i < validRepos.length; i++) {
  const repo = validRepos[i];
  const url = `https://api.github.com/repos/${repo.key}`;
  
  try {
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        'Authorization': `Bearer ${TOKEN}`,
        'User-Agent': 'ai-master-site-data-updater'
      }
    });
    
    if (response.status === 404) {
      console.log(`  ${i+1}/${validRepos.length}: ${repo.key} → 404`);
      await sleep(1000);
      continue;
    }
    
    if (response.status === 403) {
      const resetTime = response.headers.get('x-ratelimit-reset');
      const remaining = response.headers.get('x-ratelimit-remaining');
      console.log(`  RATE LIMITED! remaining=${remaining}, reset=${resetTime}`);
      await sleep(60000);
      i--; // retry this one
      continue;
    }
    
    if (!response.ok) {
      console.log(`  ${i+1}/${validRepos.length}: ${repo.key} → HTTP ${response.status}`);
      await sleep(1000);
      continue;
    }
    
    const data = await response.json();
    repoData.push({
      repo: repo.key,
      fullUrl: repo.fullUrl,
      stars: data.stargazers_count,
      pushedAt: data.pushed_at,
      forks: data.forks_count,
      language: data.language,
      topics: data.topics || []
    });
    
    if ((i+1) % 20 === 0) console.log(`  Progress: ${i+1}/${validRepos.length}...`);
  } catch (err) {
    console.log(`  ${i+1}/${validRepos.length}: ${repo.key} → ERROR: ${err.message}`);
  }
  
  if (i < validRepos.length - 1) await sleep(1000);
}

console.log(`\nFetched data for ${repoData.length} repos`);

// Match repos to tools in the file
const toolsUpdates = [];
for (const rd of repoData) {
  const lines = content.split('\n');
  let urlLineIdx = -1;
  let toolId = null;
  
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes(rd.fullUrl) || lines[i].includes(rd.fullUrl.toLowerCase())) {
      urlLineIdx = i;
      for (let j = i; j >= Math.max(0, i - 20); j--) {
        const idMatch = lines[j].match(/id:\s*["']([^"']+)["']/);
        if (idMatch) { toolId = idMatch[1]; break; }
      }
      break;
    }
  }
  
  if (toolId) toolsUpdates.push({ toolId, ...rd });
}

console.log(`Matched ${toolsUpdates.length} tools`);

// Update tools.ts
let updatedContent = content;
let starsUpdated = 0;
let forksUpdated = 0;
let languageUpdated = 0;
let dateUpdated = 0;

for (const update of toolsUpdates) {
  const { toolId, stars, pushedAt, forks, language } = update;
  const pushedDate = pushedAt ? new Date(pushedAt).toISOString().split('T')[0] : null;
  
  const lines = updatedContent.split('\n');
  let idLineIdx = -1;
  const escapedId = toolId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  
  for (let i = 0; i < lines.length; i++) {
    if (new RegExp(`id:\\s*["']${escapedId}["']`).test(lines[i])) {
      idLineIdx = i; break;
    }
  }
  
  if (idLineIdx === -1) continue;
  
  // Find end of block
  let endLineIdx = idLineIdx;
  let braceCount = 0;
  let foundOpen = false;
  for (let i = idLineIdx; i < lines.length; i++) {
    for (const ch of lines[i]) {
      if (ch === '{') { braceCount++; foundOpen = true; }
      if (ch === '}') { braceCount--; }
    }
    if (foundOpen && braceCount === 0) { endLineIdx = i; break; }
  }
  
  const blockLines = lines.slice(idLineIdx, endLineIdx + 1);
  let block = blockLines.join('\n');
  
  // Update githubStars
  if (block.includes('githubStars:')) {
    const oldVal = block.match(/githubStars:\s*(\d+)/);
    if (oldVal && parseInt(oldVal[1]) !== stars) {
      block = block.replace(/githubStars:\s*\d+/, `githubStars: ${stars}`);
      starsUpdated++;
    }
  } else {
    const lastMatch = block.match(/(createdAt:\s*"[^"]*"|forks:\s*\d+|language:\s*"[^"]*"|updatedAt:\s*"[^"]*")/);
    if (lastMatch) {
      block = block.replace(lastMatch[0], `${lastMatch[0]},\n    githubStars: ${stars}`);
      starsUpdated++;
    }
  }
  
  // Update forks
  if (block.includes('forks:')) {
    const oldVal = block.match(/forks:\s*(\d+)/);
    if (oldVal && parseInt(oldVal[1]) !== forks) {
      block = block.replace(/forks:\s*\d+/, `forks: ${forks}`);
      forksUpdated++;
    }
  } else {
    const lastMatch = block.match(/(createdAt:\s*"[^"]*"|language:\s*"[^"]*"|updatedAt:\s*"[^"]*"|githubStars:\s*\d+)/);
    if (lastMatch) {
      block = block.replace(lastMatch[0], `${lastMatch[0]},\n    forks: ${forks}`);
      forksUpdated++;
    }
  }
  
  // Update language
  if (block.includes('language:')) {
    const oldMatch = block.match(/language:\s*"([^"]+)"/);
    if (oldMatch && language && oldMatch[1] !== language) {
      block = block.replace(/language:\s*"[^"]+"/, `language: "${language}"`);
      languageUpdated++;
    }
  } else if (language) {
    const lastMatch = block.match(/(createdAt:\s*"[^"]*"|updatedAt:\s*"[^"]*"|githubStars:\s*\d+)/);
    if (lastMatch) {
      block = block.replace(lastMatch[0], `${lastMatch[0]},\n    language: "${language}"`);
      languageUpdated++;
    }
  }
  
  // Update updatedAt
  if (block.includes('updatedAt:') && pushedDate) {
    const oldMatch = block.match(/updatedAt:\s*"([^"]+)"/);
    if (oldMatch && pushedDate > oldMatch[1]) {
      block = block.replace(/updatedAt:\s*"[^"]+"/, `updatedAt: "${pushedDate}"`);
      dateUpdated++;
    }
  } else if (pushedDate && !block.includes('updatedAt:')) {
    const lastMatch = block.match(/(createdAt:\s*"[^"]*"|language:\s*"[^"]*")/);
    if (lastMatch) {
      block = block.replace(lastMatch[0], `${lastMatch[0]},\n    updatedAt: "${pushedDate}"`);
      dateUpdated++;
    }
  }
  
  const oldBlock = blockLines.join('\n');
  updatedContent = updatedContent.replace(oldBlock, block);
}

// Collect topics
const allTopics = new Map();
for (const rd of repoData) {
  for (const topic of rd.topics) {
    const n = normalizeTopic(topic);
    if (n && n.length > 1) {
      allTopics.set(n, (allTopics.get(n) || 0) + 1);
    }
  }
}

const newTopics = [];
for (const [topic, count] of allTopics) {
  if (!existingTopics.has(topic) && isAITopic(topic)) {
    if (topic.length < 3) continue;
    let minStars = count >= 3 ? 2000 : count >= 2 ? 3000 : 5000;
    if (count === 1) {
      const repo = repoData.find(r => r.topics.map(t => normalizeTopic(t)).includes(topic));
      if (repo && repo.stars < 1000) continue;
    }
    newTopics.push({ topic, url: `https://github.com/topics/${topic}`, minStars, description: `（自动发现）${topic}` });
  }
}

// Write files
if (starsUpdated > 0 || forksUpdated > 0 || languageUpdated > 0) {
  fs.writeFileSync(TOOLS_FILE, updatedContent);
  console.log(`✅ tools.ts: ${starsUpdated} stars, ${forksUpdated} forks, ${languageUpdated} languages, ${dateUpdated} dates updated`);
} else {
  console.log('✅ tools.ts: no changes');
}

if (newTopics.length > 0) {
  topicsData.topics.push(...newTopics);
  topicsData.lastUpdated = new Date().toISOString();
  fs.writeFileSync(TOPICS_FILE, JSON.stringify(topicsData, null, 2) + '\n');
  console.log(`✅ ai-topics.json: +${newTopics.length} topics (total: ${topicsData.topics.length})`);
} else {
  console.log('✅ ai-topics.json: no new topics');
}

const summary = {
  reposScanned: repoData.length,
  totalReposFound: validRepos.length,
  starsUpdated, forksUpdated, languageUpdated, dateUpdated,
  topicsFound: allTopics.size,
  newTopics: newTopics.length,
  totalTopics: topicsData.topics.length,
  newTopicDetails: newTopics.slice(0, 20),
  changesMade: starsUpdated > 0 || forksUpdated > 0 || languageUpdated > 0 || newTopics.length > 0
};

fs.writeFileSync('/tmp/github-update-summary.json', JSON.stringify(summary, null, 2));
console.log('\n📋', JSON.stringify(summary, null, 2));
