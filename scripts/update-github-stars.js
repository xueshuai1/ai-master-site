#!/usr/bin/env node
/**
 * Update GitHub stars, forks, language, updatedAt for all tools with GitHub repos.
 * Discover new AI topics from repository topics.
 */
import fs from 'fs';
import path from 'path';

const GITHUB_TOKEN = process.argv[2];
if (!GITHUB_TOKEN) { console.error('Usage: node script.js TOKEN'); process.exit(1); }

const TOOLS_FILE = path.resolve('src/data/tools.ts');
const TOPICS_FILE = path.resolve('data/ai-topics.json');

// ── 1. Extract all GitHub repos from tools.ts ──
const toolsRaw = fs.readFileSync(TOOLS_FILE, 'utf-8');
const repoRegex = /url:\s*"https:\/\/github\.com\/([^"]+)"/g;
const repos = new Set();
let m;
while ((m = repoRegex.exec(toolsRaw)) !== null) {
  repos.add(m[1].trim());
}
console.log(`Found ${repos.size} GitHub repos`);

// ── 2. Load existing topics ──
const topicsData = JSON.parse(fs.readFileSync(TOPICS_FILE, 'utf-8'));
const existingTopics = new Set(topicsData.topics.map(t => t.topic.toLowerCase()));

// ── 3. AI keyword matching ──
const AI_KEYWORDS = [
  'ai','ml','dl','llm','nlp','cv','agent','robot','robots','robotics',
  'vision','language','neural','learning','generative','prompt','chatbot',
  'deep-learning','machine-learning','transformer','gpt','diffusion','rag',
  'embedding','inference','fine-tuning','llmops','mlops','model-serving',
  'vector-search','semantic-search','knowledge-graph','multimodal','speech',
  'text-to-speech','image-generation','video-generation','code-generation',
  'autonomous','embodied-ai','world-models','foundation-models',
  'large-language-models','retrieval-augmented','instruction-tuning',
  'rlhf','alignment'
];

function isAiRelated(topic) {
  const t = topic.toLowerCase();
  return AI_KEYWORDS.some(kw => t.includes(kw) || t === kw);
}

// ── 4. Fetch all repos sequentially ──
const sleep = ms => new Promise(r => setTimeout(r, ms));
const repoArr = [...repos];
const repoData = {};
const topicCount = {};
const topicRepos = {}; // topic -> [repo names]

for (let i = 0; i < repoArr.length; i++) {
  const repo = repoArr[i];
  try {
    const res = await fetch(`https://api.github.com/repos/${repo}?access_token=${GITHUB_TOKEN}`, {
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'ai-master-site/1.0'
      }
    });
    if (res.status === 403) {
      console.log(`  [403] Rate limited on ${repo}, retrying...`);
      await sleep(10000);
      i--; // retry
      continue;
    }
    if (!res.ok) {
      console.log(`  [${res.status}] ${repo}`);
      await sleep(1000);
      continue;
    }
    const data = await res.json();
    repoData[repo] = {
      stars: data.stargazers_count || 0,
      forks: data.forks_count || 0,
      language: data.language || null,
      pushedAt: data.pushed_at ? data.pushed_at.split('T')[0] : null,
      topics: (data.topics || []).map(t => t.toLowerCase())
    };
    // Track topic usage
    for (const t of repoData[repo].topics) {
      topicCount[t] = (topicCount[t] || 0) + 1;
      if (!topicRepos[t]) topicRepos[t] = [];
      topicRepos[t].push(repo);
    }
    console.log(`  ✓ ${repo} → ${repoData[repo].stars}★, ${repoData[repo].forks} forks, ${repoData[repo].language||'N/A'}`);
  } catch (e) {
    console.log(`  ✗ ${repo} - ${e.message}`);
  }
  if (i < repoArr.length - 1) await sleep(1000);
}

// ── 5. Build new tools.ts content ──
let newContent = toolsRaw;
const changes = [];

for (const [repo, data] of Object.entries(repoData)) {
  // Find the tool entry for this repo
  const escapedRepo = repo.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  
  // ── Update githubStars ──
  const starsPattern = new RegExp(`(url:\\s*"https://github\\.com/${escapedRepo}"[^}]*?githubStars:\\s*)(\\d+)`);
  const starsMatch = starsPattern.exec(newContent);
  if (starsMatch) {
    const oldStars = parseInt(starsMatch[2]);
    if (oldStars !== data.stars) {
      const delta = data.stars - oldStars;
      const pos = starsMatch.index + starsMatch[1].length;
      newContent = newContent.substring(0, pos) + data.stars + newContent.substring(pos + starsMatch[2].length);
      changes.push({ type: 'stars', repo, old: oldStars, new: data.stars, delta });
    }
  }
  
  // ── Update forks ──
  const forksPattern = new RegExp(`(url:\\s*"https://github\\.com/${escapedRepo}"[^}]*?forks:\\s*)(\\d+)`);
  const forksMatch = forksPattern.exec(newContent);
  if (forksMatch) {
    const oldForks = parseInt(forksMatch[2]);
    if (oldForks !== data.forks) {
      const pos = forksMatch.index + forksMatch[1].length;
      newContent = newContent.substring(0, pos) + data.forks + newContent.substring(pos + forksMatch[2].length);
      changes.push({ type: 'forks', repo, old: oldForks, new: data.forks });
    }
  } else {
    // Check if repo has forks data but tool doesn't have forks field
    // Skip adding forks field for now to keep changes minimal
  }
  
  // ── Update language ──
  if (data.language) {
    const langPattern = new RegExp(`(url:\\s*"https://github\\.com/${escapedRepo}"[^}]*?language:\\s*")([^"]*)"`);
    const langMatch = langPattern.exec(newContent);
    if (langMatch && langMatch[2] !== data.language) {
      const pos = langMatch.index + langMatch[1].length;
      newContent = newContent.substring(0, pos) + data.language + newContent.substring(pos + langMatch[2].length);
      changes.push({ type: 'language', repo, old: langMatch[2], new: data.language });
    }
  }
  
  // ── Update updatedAt ──
  if (data.pushedAt) {
    const datePattern = new RegExp(`(url:\\s*"https://github\\.com/${escapedRepo}"[^}]*?updatedAt:\\s*")([^"]*)"`);
    const dateMatch = datePattern.exec(newContent);
    if (dateMatch && dateMatch[2] !== data.pushedAt) {
      const pos = dateMatch.index + dateMatch[1].length;
      newContent = newContent.substring(0, pos) + data.pushedAt + newContent.substring(pos + dateMatch[2].length);
      changes.push({ type: 'updatedAt', repo, old: dateMatch[2], new: data.pushedAt });
    }
  }
}

// ── 6. Find new AI topics ──
const newTopics = [];
for (const [topic, count] of Object.entries(topicCount)) {
  if (existingTopics.has(topic)) continue;
  if (!isAiRelated(topic)) continue;
  // Skip if only 1 repo uses it and max stars < 1000
  const reposForTopic = topicRepos[topic] || [];
  const maxStars = Math.max(...reposForTopic.map(r => (repoData[r] || {}).stars || 0), 0);
  if (count <= 1 && maxStars < 1000) continue;
  
  let minStars = 5000;
  if (count >= 3) minStars = 2000;
  else if (count >= 2) minStars = 3000;
  
  const desc = topic.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  newTopics.push({
    topic,
    url: `https://github.com/topics/${topic}`,
    minStars,
    description: `（自动发现）${desc}（${count} 个仓库使用）`
  });
}

// ── 7. Write files ──
if (newContent !== toolsRaw) {
  fs.writeFileSync(TOOLS_FILE, newContent);
  console.log('\n✓ tools.ts updated');
} else {
  console.log('\n✓ tools.ts no changes needed');
}

if (newTopics.length > 0) {
  topicsData.topics.push(...newTopics);
  topicsData.lastUpdated = new Date().toISOString();
  fs.writeFileSync(TOPICS_FILE, JSON.stringify(topicsData, null, 2));
  console.log(`✓ ai-topics.json: +${newTopics.length} new topics`);
} else {
  console.log('✓ ai-topics.json no changes needed');
}

// ── 8. Summary ──
const starsChanges = changes.filter(c => c.type === 'stars');
const forksChanges = changes.filter(c => c.type === 'forks');
const langChanges = changes.filter(c => c.type === 'language');

console.log('\n=== Summary ===');
console.log(`Repos scanned: ${repoArr.length}`);
console.log(`Stars updated: ${starsChanges.length}`);
if (starsChanges.length > 0) {
  starsChanges.sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta));
  for (const c of starsChanges.slice(0, 5)) {
    console.log(`  ${c.repo}: ${c.old} → ${c.new} (${c.delta > 0 ? '+' : ''}${c.delta})`);
  }
}
console.log(`Forks updated: ${forksChanges.length}`);
console.log(`Language updated: ${langChanges.length}`);
console.log(`New AI topics: ${newTopics.length}`);
if (newTopics.length > 0) {
  newTopics.forEach(t => console.log(`  ${t.topic} — ${t.description}`));
}

// Save summary for reporting
fs.writeFileSync('/tmp/github-data-summary.json', JSON.stringify({
  reposScanned: repoArr.length,
  starsChanges,
  forksChanges,
  langChanges,
  newTopics,
  totalChanges: changes.length + newTopics.length
}, null, 2));
