#!/usr/bin/env node
// Fetch GitHub repo data and generate update instructions

import { readFileSync, writeFileSync } from 'fs';

// Load env
const envContent = readFileSync('.env.local', 'utf-8');
const GITHUB_TOKEN = envContent.match(/GITHUB_TOKEN=(.+)/)?.[1]?.trim();
if (!GITHUB_TOKEN) { console.error('No GITHUB_TOKEN found'); process.exit(1); }

// Extract all GitHub repos from tools.ts
const toolsContent = readFileSync('src/data/tools.ts', 'utf-8');
const repoRegex = /https:\/\/github\.com\/([a-zA-Z0-9_.-]+)\/([a-zA-Z0-9_.-]+)/g;
const repos = new Set();
let match;
while ((match = repoRegex.exec(toolsContent)) !== null) {
  repos.add(`${match[1].toLowerCase()}/${match[2].toLowerCase()}`);
}
const repoList = [...repos];
console.log(`Found ${repoList.length} unique GitHub repos`);

// Load existing topics
const topicsData = JSON.parse(readFileSync('data/ai-topics.json', 'utf-8'));
const existingTopics = new Set(topicsData.topics.map(t => t.topic.toLowerCase()));
console.log(`Existing topics: ${existingTopics.size}`);

// AI Topic keywords
const AI_KEYWORDS = [
  'ai','ml','dl','llm','nlp','cv','agent','robot','robots','robotics','vision','language',
  'neural','learning','generative','prompt','chatbot','deep-learning','machine-learning',
  'transformer','gpt','diffusion','rag','embedding','inference','fine-tuning','llmops',
  'mlops','model-serving','vector-search','semantic-search','knowledge-graph','multimodal',
  'speech','text-to-speech','image-generation','video-generation','code-generation',
  'autonomous','embodied-ai','world-models','foundation-models','large-language-models',
  'retrieval-augmented','instruction-tuning','rlhf','alignment'
];

function isAITopic(topic) {
  const t = topic.toLowerCase();
  return AI_KEYWORDS.some(kw => t === kw || t.includes(kw) || kw.includes(t));
}

function normalizeTopic(name) {
  return name.toLowerCase().replace(/\s+/g, '-');
}

// Fetch repo data
async function fetchRepoData(repo) {
  const url = `https://api.github.com/repos/${repo}?access_token=${GITHUB_TOKEN}`;
  try {
    const resp = await fetch(url);
    if (resp.status === 404) return { repo, error: 'not-found' };
    if (resp.status === 403) {
      const remaining = resp.headers.get('x-ratelimit-remaining');
      const reset = resp.headers.get('x-ratelimit-reset');
      console.error(`Rate limited. Remaining: ${remaining}, Reset at: ${reset}`);
      return { repo, error: 'rate-limited', remaining };
    }
    if (!resp.ok) return { repo, error: `http-${resp.status}` };
    return await resp.json();
  } catch (e) {
    return { repo, error: e.message };
  }
}

async function main() {
  const results = {};
  for (let i = 0; i < repoList.length; i++) {
    const repo = repoList[i];
    if (i > 0 && i % 30 === 0) {
      console.log(`Fetched ${i}/${repoList.length}... waiting 5s for rate limit`);
      await new Promise(r => setTimeout(r, 5000));
    }
    const data = await fetchRepoData(repo);
    results[repo] = data;
    if (data.stargazers_count !== undefined) {
      console.log(`  ${repo}: ${data.stargazers_count} stars`);
    } else if (data.error) {
      console.log(`  ${repo}: ERROR - ${data.error}`);
    }
    await new Promise(r => setTimeout(r, 1000));
  }

  // Save raw results
  writeFileSync('/tmp/github-repo-results.json', JSON.stringify(results, null, 2));
  console.log(`\nSaved results to /tmp/github-repo-results.json`);
}

main().catch(e => { console.error(e); process.exit(1); });
