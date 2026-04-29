#!/usr/bin/env node
import { readFileSync, writeFileSync } from 'fs';
import { execSync } from 'child_process';

// Load GitHub token
const envContent = readFileSync('.env.local', 'utf-8');
const GITHUB_TOKEN = envContent.match(/GITHUB_TOKEN=(.+)/)?.[1]?.trim();
if (!GITHUB_TOKEN) { console.error('No GITHUB_TOKEN found'); process.exit(1); }

// Read tools.ts and extract repo URLs
const toolsContent = readFileSync('src/data/tools.ts', 'utf-8');
const urlRegex = /url:\s*"(https:\/\/github\.com\/[^"]+)"/g;
const repos = new Set();
let match;
while ((match = urlRegex.exec(toolsContent)) !== null) {
  const url = match[1];
  const parts = url.replace('https://github.com/', '').split('/');
  if (parts.length >= 2 && !parts[1].includes('/') && parts[0] && parts[1]) {
    repos.add(parts[0] + '/' + parts[1]);
  }
}

const repoList = Array.from(repos);
console.log(`Found ${repoList.length} GitHub repos`);

// Read existing ai-topics.json
const topicsData = JSON.parse(readFileSync('data/ai-topics.json', 'utf-8'));
const existingTopics = new Set(topicsData.topics.map(t => t.topic.toLowerCase()));

// AI keyword list
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
  return aiKeywords.some(kw => t.includes(kw) || t === kw);
}

// Fetch using curl with Authorization header
function fetchRepo(repo) {
  try {
    const result = execSync(
      `curl -s -H "Authorization: token ${GITHUB_TOKEN}" "https://api.github.com/repos/${repo}"`,
      { encoding: 'utf-8', timeout: 15000 }
    );
    const data = JSON.parse(result);
    if (data.message === 'Not Found') return null;
    if (data.message && data.message.includes('rate limit')) return 'rate-limited';
    return {
      stars: data.stargazers_count,
      pushed_at: data.pushed_at,
      forks: data.forks_count,
      language: data.language,
      topics: data.topics || []
    };
  } catch (e) {
    return 'error';
  }
}

const repoData = {};
let successCount = 0;
let failCount = 0;
let rateLimited = 0;

for (let i = 0; i < repoList.length; i++) {
  const repo = repoList[i];
  if (i > 0) {
    // Dynamic delay: if we're getting close to rate limit, slow down
    await new Promise(r => setTimeout(r, 1000));
  }
  
  const data = fetchRepo(repo);
  if (!data) {
    failCount++;
    continue;
  }
  if (data === 'rate-limited') {
    rateLimited++;
    console.log(`  [RATE LIMITED] ${repo} — waiting 60s`);
    await new Promise(r => setTimeout(r, 60000));
    // Retry once
    const retry = fetchRepo(repo);
    if (retry && retry !== 'rate-limited' && retry !== 'error') {
      repoData[repo] = retry;
      successCount++;
    } else {
      failCount++;
    }
    continue;
  }
  if (data === 'error') {
    failCount++;
    continue;
  }
  
  repoData[repo] = data;
  successCount++;
  if ((i + 1) % 10 === 0) {
    console.log(`  Progress: ${i+1}/${repoList.length} — ${repo} (${data.stars}★)`);
  }
}

console.log(`\nResults: ${successCount} success, ${failCount} failed, ${rateLimited} rate-limited`);

// Parse tools and compute updates
// Extract tool blocks by finding id + url pairs and their positions
const toolRegex = /\{[\s\S]*?id:\s*"([^"]+)"[\s\S]*?url:\s*"https:\/\/github\.com\/([^"]+)"[\s\S]*?\}/g;
const tools = [];
let m;
while ((m = toolRegex.exec(toolsContent)) !== null) {
  const id = m[1];
  const repo = m[2];
  const block = m[0];
  const startIndex = m.index;
  
  const starsMatch = block.match(/githubStars:\s*(\d+)/);
  const forksMatch = block.match(/forks:\s*(\d+)/);
  const langMatch = block.match(/language:\s*"([^"]*)"/);
  const dateMatch = block.match(/updatedAt:\s*"([^"]+)"/);
  
  const apiData = repoData[repo];
  
  const changes = {};
  if (apiData) {
    if (starsMatch && parseInt(starsMatch[1]) !== apiData.stars) {
      changes.stars = { old: parseInt(starsMatch[1]), new: apiData.stars };
    }
    if (forksMatch && parseInt(forksMatch[1]) !== apiData.forks) {
      changes.forks = { old: parseInt(forksMatch[1]), new: apiData.forks };
    }
    if (langMatch && langMatch[1] !== apiData.language && apiData.language) {
      changes.language = { old: langMatch[1], new: apiData.language };
    }
    if (apiData.pushed_at) {
      const newDate = apiData.pushed_at.split('T')[0];
      if (dateMatch && dateMatch[1] !== newDate) {
        changes.updatedAt = { old: dateMatch[1], new: newDate };
      }
    }
  }
  
  tools.push({ id, repo, block, startIndex, changes, apiData });
}

// Count changes
let starsChanged = 0, forksChanged = 0, langChanged = 0, dateChanged = 0;
const starChanges = [], forkChanges = [], langChanges = [], dateChanges = [];

for (const t of tools) {
  if (t.changes.stars) { starsChanged++; starChanges.push(t); }
  if (t.changes.forks) { forksChanged++; forkChanges.push(t); }
  if (t.changes.language) { langChanged++; langChanges.push(t); }
  if (t.changes.updatedAt) { dateChanged++; dateChanges.push(t); }
}

// Apply changes to tools.ts using string replacement
// We need to be careful to replace in the correct order (from end to start to preserve positions)
// Actually, we can just replace each field individually since they're unique within each block

let updatedContent = toolsContent;
let totalEdits = 0;

for (const t of tools) {
  if (t.changes.stars) {
    const oldStr = `githubStars: ${t.changes.stars.old}`;
    const newStr = `githubStars: ${t.changes.stars.new}`;
    // Only replace the first occurrence in this tool's block area
    const idx = updatedContent.indexOf(oldStr, t.startIndex - 100);
    if (idx >= 0 && idx < t.startIndex + t.block.length + 100) {
      updatedContent = updatedContent.substring(0, idx) + newStr + updatedContent.substring(idx + oldStr.length);
      totalEdits++;
    }
  }
  if (t.changes.forks) {
    const oldStr = `forks: ${t.changes.forks.old}`;
    const newStr = `forks: ${t.changes.forks.new}`;
    // Find it near the tool's position
    let searchFrom = Math.max(0, t.startIndex - 200);
    // After stars edit, position may shift - just find globally
    const idx = updatedContent.indexOf(oldStr, searchFrom);
    if (idx >= 0) {
      updatedContent = updatedContent.substring(0, idx) + newStr + updatedContent.substring(idx + oldStr.length);
      totalEdits++;
    }
  }
  if (t.changes.language) {
    const oldStr = `language: "${t.changes.language.old}"`;
    const newStr = `language: "${t.changes.language.new}"`;
    let searchFrom = Math.max(0, t.startIndex - 200);
    const idx = updatedContent.indexOf(oldStr, searchFrom);
    if (idx >= 0) {
      updatedContent = updatedContent.substring(0, idx) + newStr + updatedContent.substring(idx + oldStr.length);
      totalEdits++;
    }
  }
  if (t.changes.updatedAt) {
    const oldStr = `updatedAt: "${t.changes.updatedAt.old}"`;
    const newStr = `updatedAt: "${t.changes.updatedAt.new}"`;
    let searchFrom = Math.max(0, t.startIndex - 200);
    const idx = updatedContent.indexOf(oldStr, searchFrom);
    if (idx >= 0) {
      updatedContent = updatedContent.substring(0, idx) + newStr + updatedContent.substring(idx + oldStr.length);
      totalEdits++;
    }
  }
}

// Write updated tools.ts
writeFileSync('src/data/tools.ts', updatedContent);
console.log(`\nApplied ${totalEdits} edits to tools.ts`);

// Collect topics
const allTopics = new Map();
for (const repo of Object.keys(repoData)) {
  for (const topic of repoData[repo].topics) {
    const normalized = topic.toLowerCase().replace(/\s+/g, '-');
    allTopics.set(normalized, (allTopics.get(normalized) || 0) + 1);
  }
}

// Find new AI topics
const newTopics = [];
for (const [topic, count] of allTopics) {
  if (existingTopics.has(topic)) continue;
  if (!isAITopic(topic)) continue;
  
  // Skip if only 1 repo and that repo has < 1000 stars
  if (count === 1) {
    const repoWithTopic = Object.keys(repoData).find(r => 
      repoData[r].topics.map(t => t.toLowerCase().replace(/\s+/g, '-')).includes(topic)
    );
    if (repoWithTopic && repoData[repoWithTopic].stars < 1000) continue;
  }
  
  let minStars = 5000;
  if (count >= 3) minStars = 2000;
  else if (count >= 2) minStars = 3000;
  
  newTopics.push({
    topic,
    url: `https://github.com/topics/${topic}`,
    minStars,
    description: `（自动发现）${topic}`
  });
}

// Update ai-topics.json if new topics found
if (newTopics.length > 0) {
  topicsData.topics.push(...newTopics);
  topicsData.lastUpdated = new Date().toISOString();
  writeFileSync('data/ai-topics.json', JSON.stringify(topicsData, null, 2) + '\n');
  console.log(`Added ${newTopics.length} new topics to ai-topics.json`);
}

// Find oldest updated tool
let oldestUpdate = { name: '', days: 0 };
for (const t of tools) {
  if (t.apiData && t.apiData.pushed_at) {
    const daysAgo = Math.floor((Date.now() - new Date(t.apiData.pushed_at).getTime()) / 86400000);
    if (daysAgo > oldestUpdate.days) {
      // Find the tool name
      const nameMatch = t.block.match(/name:\s*"([^"]+)"/);
      oldestUpdate = { name: nameMatch ? nameMatch[1] : t.id, days: daysAgo };
    }
  }
}

// Top star changes
const topStarGains = [...starChanges]
  .sort((a, b) => (b.changes.stars.new - b.changes.stars.old) - (a.changes.stars.new - a.changes.stars.old))
  .slice(0, 5);
const topStarLosses = [...starChanges]
  .sort((a, b) => (a.changes.stars.new - a.changes.stars.old) - (b.changes.stars.new - b.changes.stars.old))
  .slice(0, 3);

// Write results
writeFileSync('/tmp/github-update-results.json', JSON.stringify({
  starsChanged, forksChanged, langChanged, dateChanged, totalEdits,
  topStarGains: topStarGains.map(t => ({ name: t.id, repo: t.repo, change: t.changes.stars.new - t.changes.stars.old, newStars: t.changes.stars.new })),
  topStarLosses: topStarLosses.map(t => ({ name: t.id, repo: t.repo, change: t.changes.stars.new - t.changes.stars.old, newStars: t.changes.stars.new })),
  oldestUpdate,
  newTopics,
  totalRepos: repoList.length,
  successCount, failCount, rateLimited,
  topicStats: {
    totalCollected: allTopics.size,
    newAiTopics: newTopics.length,
    existingTopics: existingTopics.size
  }
}, null, 2));

console.log('\nAll done! Results in /tmp/github-update-results.json');
