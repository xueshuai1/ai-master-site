#!/usr/bin/env node
import { readFileSync, writeFileSync } from 'fs';
import { execSync } from 'child_process';

// Load GitHub token
const envContent = readFileSync('/Users/xueshuai/.openclaw/workspace/ai-master-site/.env.local', 'utf-8');
const GITHUB_TOKEN = envContent.match(/GITHUB_TOKEN=(.+)/)?.[1]?.trim();
if (!GITHUB_TOKEN) { console.error('No GITHUB_TOKEN found'); process.exit(1); }

// Read tools.ts and extract repo URLs
const toolsContent = readFileSync('src/data/tools.ts', 'utf-8');
const urlRegex = /url:\s*"(https:\/\/github\.com\/[^"]+)"/g;
const repos = new Set();
let match;
while ((match = urlRegex.exec(toolsContent)) !== null) {
  const url = match[1];
  // Parse owner/repo from URL
  const parts = url.replace('https://github.com/', '').split('/');
  if (parts.length >= 2 && !parts[1].includes('/')) {
    repos.add(parts[0] + '/' + parts[1]);
  }
}

console.log(`Found ${repos.size} GitHub repos`);

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

// Fetch repo data from GitHub API
const repoData = {};
const repoList = Array.from(repos);
let successCount = 0;
let failCount = 0;

for (let i = 0; i < repoList.length; i++) {
  const repo = repoList[i];
  if (i > 0) await new Promise(r => setTimeout(r, 1000)); // Rate limit: 1s between requests
  
  try {
    const resp = await fetch(`https://api.github.com/repos/${repo}?access_token=${GITHUB_TOKEN}`);
    if (resp.status === 404) {
      console.log(`  [404] ${repo} - not found`);
      failCount++;
      continue;
    }
    if (resp.status === 403) {
      console.log(`  [403] ${repo} - rate limited`);
      failCount++;
      continue;
    }
    const data = await resp.json();
    repoData[repo] = {
      stars: data.stargazers_count,
      pushed_at: data.pushed_at,
      forks: data.forks_count,
      language: data.language,
      topics: data.topics || []
    };
    successCount++;
    if (i % 10 === 0) console.log(`  Fetched ${i+1}/${repoList.length}: ${repo} (${data.stargazers_count} stars)`);
  } catch (e) {
    console.log(`  [ERR] ${repo}: ${e.message}`);
    failCount++;
  }
}

console.log(`\nFetched: ${successCount} success, ${failCount} failed`);

// Parse tools.ts to update data
// We'll do a targeted approach: find each tool's githubStars, forks, language fields and update them

// First, extract all tool blocks with their id, url, and current values
const toolBlocks = [];
const toolRegex = /\{\s*id:\s*"([^"]+)"[\s\S]*?url:\s*"([^"]+)"[\s\S]*?\}/g;
// This is too greedy. Let me use a different approach.

// Read the file as lines and parse tool objects
const lines = toolsContent.split('\n');
const tools = [];
let currentTool = null;
let braceCount = 0;
let inTool = false;
let toolStart = 0;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  if (line.includes('id: "') && !inTool) {
    inTool = true;
    toolStart = i;
    currentTool = { lines: [line], startIndex: i, id: line.match(/id:\s*"([^"]+)"/)?.[1] };
    braceCount += (line.match(/{/g) || []).length - (line.match(/}/g) || []).length;
    continue;
  }
  if (inTool) {
    currentTool.lines.push(line);
    braceCount += (line.match(/{/g) || []).length - (line.match(/}/g) || []).length;
    if (braceCount <= 0) {
      tools.push(currentTool);
      inTool = false;
      currentTool = null;
    }
  }
}

console.log(`Parsed ${tools.length} tools`);

// Build updates
const starsUpdates = [];
const forksUpdates = [];
const languageUpdates = [];
const updatedAtUpdates = [];
let starsChanged = 0;
let forksChanged = 0;
let langChanged = 0;
let dateChanged = 0;

for (const tool of tools) {
  const urlLine = tool.lines.find(l => l.includes('url:'));
  if (!urlLine) continue;
  const urlMatch = urlLine.match(/https:\/\/github\.com\/([^"]+)/);
  if (!urlMatch) continue;
  const repoPath = urlMatch[1].replace(/"/g, '');
  const data = repoData[repoPath];
  if (!data) continue;

  const toolContent = tool.lines.join('\n');
  
  // Check stars
  const starsMatch = toolContent.match(/githubStars:\s*(\d+)/);
  if (starsMatch && parseInt(starsMatch[1]) !== data.stars) {
    starsUpdates.push({ tool, oldStars: parseInt(starsMatch[1]), newStars: data.stars, repo: repoPath });
    starsChanged++;
  }
  
  // Check forks
  const forksMatch = toolContent.match(/forks:\s*(\d+)/);
  if (forksMatch && parseInt(forksMatch[1]) !== data.forks) {
    forksUpdates.push({ tool, oldForks: parseInt(forksMatch[1]), newForks: data.forks, repo: repoPath });
    forksChanged++;
  }
  
  // Check language
  const langMatch = toolContent.match(/language:\s*"([^"]+)"/);
  const newLang = data.language || '';
  if (langMatch && langMatch[1] !== newLang && newLang) {
    languageUpdates.push({ tool, oldLang: langMatch[1], newLang, repo: repoPath });
    langChanged++;
  }
  
  // Check updatedAt
  const dateMatch = toolContent.match(/updatedAt:\s*"([^"]+)"/);
  if (data.pushed_at) {
    const newDate = data.pushed_at.split('T')[0];
    if (dateMatch && dateMatch[1] !== newDate) {
      updatedAtUpdates.push({ tool, oldDate: dateMatch[1], newDate, repo: repoPath });
      dateChanged++;
    }
  }
}

console.log(`\nStars to update: ${starsChanged}`);
console.log(`Forks to update: ${forksChanged}`);
console.log(`Languages to update: ${langChanged}`);
console.log(`Dates to update: ${dateChanged}`);

// Collect all topics
const allTopics = new Map(); // topic -> count of repos using it
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
  // Skip non-AI topics that don't match keywords
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

// Write results to temp files for the next step
writeFileSync('/tmp/github-update-results.json', JSON.stringify({
  starsChanged, forksChanged, langChanged, dateChanged,
  starsUpdates: starsUpdates.map(u => ({ repo: u.repo, old: u.oldStars, new: u.newStars })),
  forksUpdates: forksUpdates.map(u => ({ repo: u.repo, old: u.oldForks, new: u.newForks })),
  langUpdates: languageUpdates.map(u => ({ repo: u.repo, old: u.oldLang, new: u.newLang })),
  dateUpdates: updatedAtUpdates.map(u => ({ repo: u.repo, old: u.oldDate, new: u.newDate })),
  newTopics,
  totalRepos: repoList.length,
  successCount, failCount,
  topicStats: {
    totalCollected: allTopics.size,
    newAiTopics: newTopics.length,
    existingTopics: existingTopics.size
  }
}, null, 2));

console.log(`\nNew AI Topics found: ${newTopics.length}`);
for (const t of newTopics) {
  console.log(`  - ${t.topic} (${allTopics.get(t.topic)} repos, minStars: ${t.minStars})`);
}

console.log('\nDone. Results written to /tmp/github-update-results.json');
