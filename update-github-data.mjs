#!/usr/bin/env node
import { readFileSync, writeFileSync } from 'fs';

// Load token
const env = readFileSync('.env.local', 'utf-8');
const GITHUB_TOKEN = env.match(/GITHUB_TOKEN=(.+)/)?.[1]?.trim();
if (!GITHUB_TOKEN) { console.error('No GITHUB_TOKEN found'); process.exit(1); }

// Load tools.ts
const toolsRaw = readFileSync('src/data/tools.ts', 'utf-8');

// Extract github repos from url fields
const urlRegex = /url:\s*"(https:\/\/github\.com\/([^\/"]+\/[^\/"]+))"/g;
const reposMap = new Map();
let match;
while ((match = urlRegex.exec(toolsRaw)) !== null) {
  const [, fullUrl, ownerRepo] = match;
  // Skip non-repo github URLs
  if (ownerRepo.split('/').length !== 2) continue;
  if (fullUrl.includes('features/') || fullUrl.includes('www.')) continue;
  reposMap.set(ownerRepo, fullUrl);
}

const uniqueRepos = [...reposMap.keys()];
console.log(`Found ${uniqueRepos.length} unique GitHub repos`);

// Load existing topics
const topicsData = JSON.parse(readFileSync('data/ai-topics.json', 'utf-8'));
const existingTopics = new Set(topicsData.topics.map(t => t.topic.toLowerCase()));
console.log(`Existing topics: ${existingTopics.size}`);

// AI-related keywords
const aiKeywords = [
  'ai', 'ml', 'dl', 'llm', 'nlp', 'cv', 'agent', 'robot', 'robots', 'robotics',
  'vision', 'language', 'neural', 'learning', 'generative', 'prompt', 'chatbot',
  'deep-learning', 'machine-learning', 'transformer', 'gpt', 'diffusion', 'rag',
  'embedding', 'inference', 'fine-tuning', 'llmops', 'mlops', 'model-serving',
  'vector-search', 'semantic-search', 'knowledge-graph', 'multimodal', 'speech',
  'text-to-speech', 'image-generation', 'video-generation', 'code-generation',
  'autonomous', 'embodied-ai', 'world-models', 'foundation-models', 'large-language-models',
  'retrieval-augmented', 'instruction-tuning', 'rlhf', 'alignment', 'deepseek'
];

function isAITopic(topic) {
  const t = topic.toLowerCase();
  const parts = t.split(/[-_\s]/);
  return aiKeywords.some(kw => {
    const kwParts = kw.split('-');
    if (kwParts.length === 1) return parts.includes(kw);
    // For multi-word keywords, check if all parts are in the topic
    return kwParts.every(p => parts.includes(p));
  });
}

// Fetch GitHub data
const sleep = ms => new Promise(r => setTimeout(r, ms));
const results = [];
const allDiscoveredTopics = new Map();

const headers = {
  'Accept': 'application/vnd.github+json',
  'Authorization': `Bearer ${GITHUB_TOKEN}`,
  'X-GitHub-Api-Version': '2022-11-28',
  'User-Agent': 'ai-master-site-data-updater'
};

for (let i = 0; i < uniqueRepos.length; i++) {
  const ownerRepo = uniqueRepos[i];
  
  try {
    const res = await fetch(`https://api.github.com/repos/${ownerRepo}`, { headers });
    
    if (res.status === 403 || res.status === 429) {
      const resetTime = res.headers.get('x-ratelimit-reset');
      const remaining = res.headers.get('x-ratelimit-remaining');
      console.error(`  Rate limited! Remaining: ${remaining}, Reset: ${resetTime}`);
      if (remaining === '0' && resetTime) {
        const waitMs = Math.max(0, (parseInt(resetTime) * 1000) - Date.now() + 1000);
        console.log(`  Waiting ${Math.ceil(waitMs/1000)}s for rate limit reset...`);
        await sleep(waitMs);
      } else {
        await sleep(60000);
      }
      const retryRes = await fetch(`https://api.github.com/repos/${ownerRepo}`, { headers });
      if (!retryRes.ok) {
        console.error(`  ${ownerRepo}: retry failed HTTP ${retryRes.status}`);
        continue;
      }
      const data = await retryRes.json();
      results.push({ ownerRepo, data });
      collectTopics(ownerRepo, data);
      continue;
    }
    
    if (!res.ok) {
      console.error(`  ${ownerRepo}: HTTP ${res.status}`);
      continue;
    }
    
    const data = await res.json();
    results.push({ ownerRepo, data });
    collectTopics(ownerRepo, data);
    
  } catch (e) {
    console.error(`  ${ownerRepo}: ${e.message}`);
  }
  
  collectTopics(ownerRepo, results.find(r => r.ownerRepo === ownerRepo)?.data);
  
  if ((i + 1) % 20 === 0) {
    console.log(`  Progress: ${i + 1}/${uniqueRepos.length}, fetched: ${results.length}`);
  }
  
  await sleep(1100);
}

function collectTopics(ownerRepo, data) {
  if (!data || !data.topics || !Array.isArray(data.topics)) return;
  for (const topic of data.topics) {
    const normalized = topic.toLowerCase().replace(/\s+/g, '-');
    if (!allDiscoveredTopics.has(normalized)) {
      allDiscoveredTopics.set(normalized, { repos: new Set(), isAI: isAITopic(normalized) });
    }
    allDiscoveredTopics.get(normalized).repos.add(ownerRepo);
  }
}

console.log(`\nFetched ${results.length} repos successfully`);

// Process updates
const starsChanges = [];
const forksChanges = [];
const langChanges = [];
let toolsContent = toolsRaw;

for (const { ownerRepo, data } of results) {
  const escaped = ownerRepo.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const urlPattern = new RegExp(`url:\\s*"https://github\\.com/${escaped}"`);
  const urlIdx = toolsContent.search(urlPattern);
  if (urlIdx === -1) continue;
  
  const blockContent = toolsContent.slice(urlIdx);
  
  // Update stars
  const newStars = data.stargazers_count;
  if (typeof newStars === 'number') {
    const starsMatch = blockContent.match(/githubStars:\s*(\d+)/);
    if (starsMatch) {
      const oldStars = parseInt(starsMatch[1]);
      if (oldStars !== newStars) {
        starsChanges.push({ ownerRepo, old: oldStars, new: newStars, diff: newStars - oldStars });
        const absIdx = urlIdx + starsMatch.index + 'githubStars: '.length;
        toolsContent = toolsContent.slice(0, absIdx) + newStars + toolsContent.slice(absIdx + starsMatch[1].length);
      }
    }
  }
  
  // Update forks
  const newForks = data.forks_count;
  if (typeof newForks === 'number') {
    const forksMatch = blockContent.match(/forks:\s*(\d+)/);
    if (forksMatch) {
      const oldForks = parseInt(forksMatch[1]);
      if (oldForks !== newForks) {
        forksChanges.push({ ownerRepo, old: oldForks, new: newForks });
        const absIdx = urlIdx + forksMatch.index + 'forks: '.length;
        toolsContent = toolsContent.slice(0, absIdx) + newForks + toolsContent.slice(absIdx + forksMatch[1].length);
      }
    }
  }
  
  // Update language
  const newLang = data.language;
  if (newLang && newLang !== 'null') {
    const langMatch = blockContent.match(/language:\s*"([^"]*)"/);
    if (langMatch && langMatch[1] !== newLang) {
      langChanges.push({ ownerRepo, old: langMatch[1], new: newLang });
      const absIdx = urlIdx + langMatch.index + 'language: "'.length;
      toolsContent = toolsContent.slice(0, absIdx) + newLang + toolsContent.slice(absIdx + langMatch[1].length);
    }
  }
}

// Update lastUpdated date for changed tools
if (starsChanges.length > 0 || forksChanges.length > 0 || langChanges.length > 0) {
  const today = new Date().toISOString().slice(0, 10);
  const changedRepos = new Set([
    ...starsChanges.map(s => s.ownerRepo),
    ...forksChanges.map(f => f.ownerRepo),
    ...langChanges.map(l => l.ownerRepo)
  ]);
  
  for (const ownerRepo of changedRepos) {
    const escaped = ownerRepo.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const urlPattern = new RegExp(`url:\\s*"https://github\\.com/${escaped}"`);
    const urlIdx = toolsContent.search(urlPattern);
    if (urlIdx === -1) continue;
    
    const blockContent = toolsContent.slice(urlIdx);
    const updatedAtMatch = blockContent.match(/updatedAt:\s*"(\d{4}-\d{2}-\d{2})"/);
    if (updatedAtMatch && updatedAtMatch[1] !== today) {
      const absIdx = urlIdx + updatedAtMatch.index + 'updatedAt: "'.length;
      toolsContent = toolsContent.slice(0, absIdx) + today + toolsContent.slice(absIdx + updatedAtMatch[1].length);
    }
  }
}

// Find new AI topics
const newTopics = [];
for (const [topic, info] of allDiscoveredTopics) {
  if (existingTopics.has(topic)) continue;
  if (!info.isAI) continue;
  
  const repoCount = info.repos.size;
  const maxStars = Math.max(...[...info.repos].map(r => {
    const result = results.find(res => res.ownerRepo === r);
    return result ? result.data.stargazers_count : 0;
  }), 0);
  
  if (repoCount === 1 && maxStars < 1000) continue;
  
  let minStars;
  if (repoCount >= 3) minStars = 2000;
  else if (repoCount >= 2) minStars = 3000;
  else minStars = 5000;
  
  newTopics.push({
    topic,
    url: `https://github.com/topics/${topic}`,
    minStars,
    description: `（自动发现）${topic}`,
    repoCount,
    maxStars
  });
}

// Sort new topics by repoCount desc
newTopics.sort((a, b) => b.repoCount - a.repoCount || b.maxStars - a.maxStars);

// Write files
let fileChanged = false;
if (starsChanges.length > 0 || forksChanges.length > 0 || langChanges.length > 0) {
  writeFileSync('src/data/tools.ts', toolsContent);
  console.log('\nUpdated tools.ts');
  fileChanged = true;
} else {
  console.log('\nNo changes to tools.ts');
}

if (newTopics.length > 0) {
  for (const t of newTopics) {
    topicsData.topics.push({
      topic: t.topic,
      url: t.url,
      minStars: t.minStars,
      description: t.description
    });
  }
  topicsData.lastUpdated = new Date().toISOString();
  writeFileSync('data/ai-topics.json', JSON.stringify(topicsData, null, 2));
  console.log(`Updated ai-topics.json with ${newTopics.length} new topics`);
  fileChanged = true;
} else {
  console.log('No new topics to add');
}

// Output summary
const summary = {
  totalReposScanned: uniqueRepos.length,
  totalReposFetched: results.length,
  starsChanges: starsChanges.length,
  forksChanges: forksChanges.length,
  langChanges: langChanges.length,
  topStarChanges: starsChanges.sort((a, b) => Math.abs(b.diff) - Math.abs(a.diff)).slice(0, 8),
  newTopicsCount: newTopics.length,
  newTopics: newTopics.slice(0, 20),
  totalTopicsAfter: topicsData.topics.length,
  fileChanged
};

writeFileSync('/tmp/github-update-summary.json', JSON.stringify(summary, null, 2));

console.log('\n=== Summary ===');
console.log(`Repos scanned: ${summary.totalReposScanned}, fetched: ${summary.totalReposFetched}`);
console.log(`Stars changes: ${summary.starsChanges}`);
console.log(`Forks changes: ${summary.forksChanges}`);
console.log(`Language changes: ${summary.langChanges}`);
if (summary.topStarChanges.length > 0) {
  console.log('Top star changes:');
  summary.topStarChanges.forEach(s => console.log(`  ${s.ownerRepo}: ${s.old} → ${s.new} (${s.diff > 0 ? '+' : ''}${s.diff})`));
}
console.log(`New AI topics: ${summary.newTopicsCount}`);
summary.newTopics.forEach(t => console.log(`  ${t.topic} (${t.repoCount} repos, ${t.maxStars} max stars)`));
console.log(`Total topics after: ${summary.totalTopicsAfter}`);
console.log(`File changed: ${summary.fileChanged}`);
