#!/usr/bin/env node
// Fetches GitHub data for all repos in tools.ts and updates stars/forks/language/topics
// Usage: node scripts/update-github-stars.js

import { readFileSync, writeFileSync } from 'fs';
import { execSync } from 'child_process';

const GITHUB_TOKEN = process.env.GITHUB_TOKEN || 
  readFileSync('.env.local', 'utf8').match(/GITHUB_TOKEN=(.+)/)?.[1]?.trim() || '';

if (!GITHUB_TOKEN) {
  console.error('❌ GITHUB_TOKEN not found');
  process.exit(1);
}

// Extract github repos from tools.ts
const toolsContent = readFileSync('src/data/tools.ts', 'utf8');
const urlRegex = /url:\s*["']https:\/\/github\.com\/([a-zA-Z0-9_.-]+)\/([a-zA-Z0-9_.-]+)["']/g;
const repos = new Set();
let match;
while ((match = urlRegex.exec(toolsContent)) !== null) {
  repos.add(`${match[1]}/${match[2]}`);
}

const repoList = [...repos];
console.log(`Found ${repoList.length} unique GitHub repos`);

// Load existing ai-topics
let aiTopicsData;
try {
  aiTopicsData = JSON.parse(readFileSync('data/ai-topics.json', 'utf8'));
} catch {
  aiTopicsData = { topics: [] };
}
const existingTopics = new Set(aiTopicsData.topics.map(t => t.topic.toLowerCase()));

// AI-related keywords
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
  const t = topic.toLowerCase();
  return aiKeywords.some(kw => t === kw || t.includes(kw) || kw.includes(t));
}

// Fetch with rate limiting
const results = {};
const errors = [];
const BATCH_SIZE = 5;

async function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function fetchRepo(repo) {
  const url = `https://api.github.com/repos/${repo}?access_token=${GITHUB_TOKEN}`;
  try {
    const resp = await fetch(url, {
      headers: {
        'Authorization': `token ${GITHUB_TOKEN}`,
        'User-Agent': 'ai-master-site-bot'
      }
    });
    if (resp.status === 404 || resp.status === 403) {
      errors.push({ repo, status: resp.status });
      return null;
    }
    if (!resp.ok) {
      errors.push({ repo, status: resp.status });
      await sleep(2000);
      return null;
    }
    const data = await resp.json();
    return {
      repo,
      stargazers_count: data.stargazers_count,
      pushed_at: data.pushed_at,
      forks_count: data.forks_count,
      language: data.language,
      topics: data.topics || [],
      full_name: data.full_name
    };
  } catch (e) {
    errors.push({ repo, error: e.message });
    return null;
  }
}

async function fetchBatch(batch) {
  const promises = batch.map(repo => fetchRepo(repo));
  const results = await Promise.all(promises);
  return results.filter(Boolean);
}

async function main() {
  console.log('Starting batch fetch...');
  
  for (let i = 0; i < repoList.length; i += BATCH_SIZE) {
    const batch = repoList.slice(i, i + BATCH_SIZE);
    const batchResults = await fetchBatch(batch);
    batchResults.forEach(r => { results[r.repo] = r; });
    console.log(`  Progress: ${Math.min(i + BATCH_SIZE, repoList.length)}/${repoList.length} (${Object.keys(results).length} success, ${errors.length} errors)`);
    if (i + BATCH_SIZE < repoList.length) {
      await sleep(1200);
    }
  }

  console.log(`\nFetch complete: ${Object.keys(results).length} success, ${errors.length} errors`);
  
  // Now process the data
  // 1. Extract stars/forks/language from tools.ts
  // 2. Compare and update
  
  const starRegex = /githubStars:\s*(\d+)/g;
  const existingStars = {};
  let starMatch;
  while ((starMatch = starRegex.exec(toolsContent)) !== null) {
    existingStars[starMatch[1]] = starMatch[1];
  }
  
  // Build a mapping from repo URL to tool id and current values
  const toolPattern = /\{\s*id:\s*["']([^"']+)["'][^}]*?url:\s*["']https:\/\/github\.com\/([a-zA-Z0-9_.-]+)\/([a-zA-Z0-9_.-]+)["'][^}]*?githubStars:\s*(\d+)[^}]*?(?:updatedAt:\s*["']([^"']+)["'])?[^}]*?(?:forks:\s*(\d+))?[^}]*?(?:language:\s*["']([^"']+)["'])?/gs;
  
  const tools = [];
  let tMatch;
  while ((tMatch = toolPattern.exec(toolsContent)) !== null) {
    tools.push({
      id: tMatch[1],
      owner: tMatch[2],
      repo_name: tMatch[3],
      fullRepo: `${tMatch[2]}/${tMatch[3]}`,
      currentStars: parseInt(tMatch[4]),
      currentUpdated: tMatch[5] || null,
      currentForks: tMatch[6] ? parseInt(tMatch[6]) : null,
      currentLanguage: tMatch[7] || null,
      index: tMatch.index
    });
  }
  
  console.log(`\nFound ${tools.length} tools with GitHub URLs`);
  
  const starsUpdates = [];
  const forksUpdates = [];
  const languageUpdates = [];
  const newTopics = [];
  const allTopics = {};
  
  for (const tool of tools) {
    const data = results[tool.fullRepo];
    if (!data) continue;
    
    const newStars = data.stargazers_count;
    const pushedAt = data.pushed_at ? data.pushed_at.split('T')[0] : null;
    const newForks = data.forks_count;
    const newLanguage = data.language;
    
    if (newStars !== tool.currentStars) {
      starsUpdates.push({
        id: tool.id,
        old: tool.currentStars,
        new: newStars,
        delta: newStars - tool.currentStars
      });
    }
    
    if (tool.currentForks !== newForks) {
      forksUpdates.push({
        id: tool.id,
        old: tool.currentForks,
        new: newForks
      });
    }
    
    if (tool.currentLanguage !== newLanguage && newLanguage) {
      languageUpdates.push({
        id: tool.id,
        old: tool.currentLanguage,
        new: newLanguage
      });
    }
    
    // Collect topics
    if (data.topics && data.topics.length > 0) {
      for (const topic of data.topics) {
        if (!allTopics[topic]) {
          allTopics[topic] = { count: 0, repos: [], maxStars: 0 };
        }
        allTopics[topic].count++;
        allTopics[topic].repos.push(tool.fullRepo);
        allTopics[topic].maxStars = Math.max(allTopics[topic].maxStars, newStars);
      }
    }
  }
  
  // Find new AI topics
  for (const [topic, info] of Object.entries(allTopics)) {
    const normalized = topic.toLowerCase().replace(/\s+/g, '-');
    if (existingTopics.has(normalized)) continue;
    
    // Check if AI-related
    if (!isAITopic(topic)) continue;
    
    // Skip if only 1 repo and stars < 1000
    if (info.count <= 1 && info.maxStars < 1000) continue;
    
    let minStars;
    if (info.count >= 3) minStars = 2000;
    else if (info.count >= 2) minStars = 3000;
    else minStars = 5000;
    
    newTopics.push({
      topic: normalized,
      url: `https://github.com/topics/${normalized}`,
      minStars,
      description: `（自动发现）${topic}`
    });
  }
  
  // Output results as JSON
  const output = {
    starsUpdates,
    forksUpdates,
    languageUpdates,
    newTopics,
    errors: errors.slice(0, 20),
    totalRepos: repoList.length,
    totalTools: tools.length,
    successCount: Object.keys(results).length
  };
  
  writeFileSync('/tmp/github-update-results.json', JSON.stringify(output, null, 2));
  
  // Print summary
  console.log('\n=== Summary ===');
  console.log(`Stars updates: ${starsUpdates.length}`);
  console.log(`Forks updates: ${forksUpdates.length}`);
  console.log(`Language updates: ${languageUpdates.length}`);
  console.log(`New AI Topics: ${newTopics.length}`);
  
  if (starsUpdates.length > 0) {
    console.log('\nTop star changes:');
    starsUpdates.sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta));
    starsUpdates.slice(0, 10).forEach(s => {
      console.log(`  ${s.id}: ${s.old} → ${s.new} (${s.delta > 0 ? '+' : ''}${s.delta})`);
    });
  }
  
  if (newTopics.length > 0) {
    console.log('\nNew AI Topics:');
    newTopics.forEach(t => {
      const info = allTopics[t.topic] || {};
      console.log(`  ${t.topic} — ${t.description} (${info.count || 0} repos)`);
    });
  }
}

main().catch(e => {
  console.error('Fatal:', e);
  process.exit(1);
});
