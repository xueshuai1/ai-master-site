#!/usr/bin/env node
/**
 * Update GitHub stars, forks, language for tools in tools.ts
 * Also collect topics for AI topic discovery
 * 
 * Uses Authorization: token header (NOT ?access_token query param which is deprecated)
 */
import { readFileSync, writeFileSync } from 'fs';

// Load GITHUB_TOKEN
const envContent = readFileSync('/Users/xueshuai/.openclaw/workspace/ai-master-site/.env.local', 'utf-8');
const GITHUB_TOKEN = envContent.match(/GITHUB_TOKEN=(.*)/)?.[1]?.trim()?.replace(/["'\s]/g, '');
if (!GITHUB_TOKEN) {
  console.error('GITHUB_TOKEN not found');
  process.exit(1);
}

console.log(`Token loaded: ${GITHUB_TOKEN.substring(0, 8)}...`);

// Read tools.ts - extract GitHub repos
const toolsContent = readFileSync('/Users/xueshuai/.openclaw/workspace/ai-master-site/src/data/tools.ts', 'utf-8');
const urlRegex = /url:\s*"(https:\/\/github\.com\/([^"]+))"/g;
const repos = [];
let m;
while ((m = urlRegex.exec(toolsContent)) !== null) {
  let repoPath = m[2].replace(/\/+$/, '');
  // Handle org-only URLs like /MiniMax-AI → keep as owner-only
  const parts = repoPath.split('/');
  if (parts.length >= 2) {
    repoPath = parts.slice(0, 2).join('/');
  }
  if (!repos.includes(repoPath)) {
    repos.push(repoPath);
  }
}

console.log(`Found ${repos.length} unique GitHub repos to query`);

// Read existing ai-topics.json
const topicsData = JSON.parse(readFileSync('/Users/xueshuai/.openclaw/workspace/ai-master-site/data/ai-topics.json', 'utf-8'));
const existingTopics = new Set(topicsData.topics.map(t => t.topic.toLowerCase()));

// AI keyword matching
const aiKeywords = [
  'ai','ml','dl','llm','nlp','cv','agent','robot','robots','robotics','vision','language',
  'neural','learning','generative','prompt','chatbot','deep-learning','machine-learning',
  'transformer','gpt','diffusion','rag','embedding','inference','fine-tuning','llmops',
  'mlops','model-serving','vector-search','semantic-search','knowledge-graph','multimodal',
  'speech','text-to-speech','image-generation','video-generation','code-generation',
  'autonomous','embodied-ai','world-models','foundation-models','large-language-models',
  'retrieval-augmented','instruction-tuning','rlhf','alignment'
];

function isAITopic(topic) {
  const t = topic.toLowerCase().replace(/\s+/g, '-');
  for (const kw of aiKeywords) {
    if (t === kw || t.includes(kw)) return true;
  }
  return false;
}

// Fetch GitHub repo data — use Authorization: token header
async function fetchRepo(repo) {
  const url = `https://api.github.com/repos/${repo}`;
  try {
    const resp = await fetch(url, {
      headers: {
        'Authorization': `token ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github+json',
        'User-Agent': 'ai-master-site-bot'
      }
    });
    if (resp.status === 403) {
      const resetTime = resp.headers.get('x-ratelimit-reset');
      if (resetTime) {
        const waitMs = parseInt(resetTime) * 1000 - Date.now() + 2000;
        if (waitMs > 0 && waitMs < 120000) {
          console.log(`  Rate limited, waiting ${Math.round(waitMs/1000)}s...`);
          await new Promise(r => setTimeout(r, waitMs));
          return fetchRepo(repo); // retry
        }
      }
      await new Promise(r => setTimeout(r, 5000));
      return fetchRepo(repo); // retry
    }
    if (resp.status === 404) {
      console.log(`  → 404 not found`);
      return null;
    }
    if (!resp.ok) {
      console.log(`  → HTTP ${resp.status}`);
      return null;
    }
    return await resp.json();
  } catch (e) {
    console.log(`  → Error: ${e.message}`);
    return null;
  }
}

// Fetch sequentially with 1s delay
const repoData = {};
const allTopics = new Set();
const topicRepoCount = {};

for (let i = 0; i < repos.length; i++) {
  const repo = repos[i];
  
  if (i > 0) await new Promise(r => setTimeout(r, 1000));
  
  console.log(`[${i + 1}/${repos.length}] Fetching ${repo}...`);
  const data = await fetchRepo(repo);
  
  if (data) {
    repoData[repo] = {
      stars: data.stargazers_count,
      pushed_at: data.pushed_at,
      forks: data.forks_count,
      language: data.language,
      topics: data.topics || []
    };
    
    // Collect topics
    for (const topic of (data.topics || [])) {
      const normalized = topic.toLowerCase().replace(/\s+/g, '-');
      allTopics.add(normalized);
      topicRepoCount[normalized] = (topicRepoCount[normalized] || 0) + 1;
    }
    
    console.log(`  → stars: ${data.stargazers_count}, forks: ${data.forks_count}, lang: ${data.language}`);
  } else {
    repoData[repo] = null;
    console.log(`  → Failed to fetch`);
  }
}

// Save results
const result = {
  repoData,
  allTopics: [...allTopics],
  topicRepoCount,
  existingTopics: [...existingTopics],
  repos,
  stats: {
    fetched: Object.values(repoData).filter(Boolean).length,
    failed: Object.values(repoData).filter(v => !v).length,
    total: repos.length
  }
};

writeFileSync('/tmp/github-update-results.json', JSON.stringify(result, null, 2));
console.log(`\n✅ Done! ${Object.values(repoData).filter(Boolean).length}/${repos.length} repos fetched`);
