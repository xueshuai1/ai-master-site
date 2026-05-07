#!/usr/bin/env node
import { readFileSync, writeFileSync } from 'fs';

// Read and clean token
const envContent = readFileSync('/Users/xueshuai/.openclaw/workspace/ai-master-site/.env.local', 'utf-8');
const TOKEN = envContent.split('\n')
  .find(l => l.startsWith('GITHUB_TOKEN='))
  ?.split('=').slice(1).join('=')
  ?.replace(/[\r\n\s]+$/, '')
  ?.trim();

if (!TOKEN) { console.error('No token found'); process.exit(1); }
console.log(`Token loaded: ${TOKEN.slice(0, 10)}...`);

// Test with one repo first
const testResp = await fetch('https://api.github.com/repos/ollama/ollama', {
  headers: {
    'Authorization': `Bearer ${TOKEN}`,
    'Accept': 'application/vnd.github+json'
  }
});
console.log(`Test: ollama/ollama → HTTP ${testResp.status}`);

if (testResp.status !== 200) {
  console.log('Auth failed. Trying token format...');
  const test2 = await fetch('https://api.github.com/repos/ollama/ollama', {
    headers: {
      'Authorization': `token ${TOKEN}`,
      'Accept': 'application/vnd.github+json'
    }
  });
  console.log(`Test with 'token': HTTP ${test2.status}`);
  if (test2.status !== 200) {
    const body = await test2.text();
    console.log(`Error: ${body.slice(0, 200)}`);
    process.exit(1);
  }
}

const toolsPath = '/Users/xueshuai/.openclaw/workspace/ai-master-site/src/data/tools.ts';
const topicsPath = '/Users/xueshuai/.openclaw/workspace/ai-master-site/data/ai-topics.json';

const content = readFileSync(toolsPath, 'utf-8');
const urlRegex = /url:\s*"https:\/\/github\.com\/([^"]+)"/g;
const repos = new Set();
let m;
while ((m = urlRegex.exec(content)) !== null) repos.add(m[1]);
console.log(`Found ${repos.size} repos`);

const topicsData = JSON.parse(readFileSync(topicsPath, 'utf-8'));
const existingTopics = new Set(topicsData.topics.map(t => t.topic.toLowerCase()));
console.log(`Existing topics: ${existingTopics.size}`);

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
  return aiKeywords.some(kw => t.includes(kw));
}

const results = {};
const repoList = Array.from(repos);

for (let i = 0; i < repoList.length; i++) {
  const repo = repoList[i];
  try {
    const resp = await fetch(`https://api.github.com/repos/${repo}`, {
      headers: {
        'Authorization': `Bearer ${TOKEN}`,
        'Accept': 'application/vnd.github+json'
      }
    });
    if (resp.status === 200) {
      const data = await resp.json();
      results[repo] = {
        stars: data.stargazers_count,
        pushed_at: data.pushed_at,
        forks: data.forks_count,
        language: data.language,
        topics: data.topics || []
      };
      console.log(`  ✓ ${repo} → ${data.stargazers_count}★`);
    } else if (resp.status === 404) {
      console.log(`  ✗ ${repo} → not found`);
    } else if (resp.status === 403) {
      console.log(`  ⚠ Rate limited!`);
      break;
    } else {
      console.log(`  ✗ ${repo} → HTTP ${resp.status}`);
    }
  } catch (e) {
    console.log(`  ✗ ${repo} → ${e.message}`);
  }
  if (i < repoList.length - 1) await new Promise(r => setTimeout(r, 1100));
}

// Collect topics
const topicInfo = {};
for (const repo of repoList) {
  if (!results[repo]) continue;
  for (const t of results[repo].topics) {
    const norm = t.toLowerCase().replace(/\s+/g, '-');
    topicInfo[norm] = topicInfo[norm] || { count: 0, maxStars: 0 };
    topicInfo[norm].count++;
    topicInfo[norm].maxStars = Math.max(topicInfo[norm].maxStars, results[repo].stars);
  }
}

const newTopics = [];
for (const [topic, info] of Object.entries(topicInfo)) {
  if (existingTopics.has(topic)) continue;
  if (!isAITopic(topic)) continue;
  if (info.count === 1 && info.maxStars < 1000) continue;
  const minStars = info.count >= 3 ? 2000 : info.count >= 2 ? 3000 : 5000;
  newTopics.push({ topic, url: `https://github.com/topics/${topic}`, minStars, description: `（自动发现）${topic.replace(/-/g, ' ')}` });
}

const output = { results, newTopics, totalReposScanned: repoList.length, successfulFetches: Object.keys(results).length };
writeFileSync('/tmp/github-update-results.json', JSON.stringify(output, null, 2));
console.log(`\n✅ Done: ${Object.keys(results).length}/${repoList.length} fetched, ${newTopics.length} new AI topics`);
