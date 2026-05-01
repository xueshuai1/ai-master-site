#!/usr/bin/env node
/**
 * Bulk update GitHub stars, forks, language for all tools.
 * Discover new AI topics from repo topics.
 * Usage: node update-github-data.mjs <GITHUB_TOKEN>
 */
import fs from 'fs';
import path from 'path';

const TOKEN = process.argv[2];
const TOOLS_PATH = 'src/data/tools.ts';
const TOPICS_PATH = 'data/ai-topics.json';

// ── 1. Extract all GitHub repos from tools.ts ──
const toolsRaw = fs.readFileSync(TOOLS_PATH, 'utf-8');
const urlRe = /url:\s*"https:\/\/github\.com\/([^"]+)"/g;
const repos = new Map();
let m;
while ((m = urlRe.exec(toolsRaw)) !== null) {
  const repo = m[1].trim();
  if (!repos.has(repo)) repos.set(repo, []);
  repos.get(repo).push(m.index);
}
console.log(`Found ${repos.size} unique repos`);

// ── 2. Load existing topics ──
const topicsData = JSON.parse(fs.readFileSync(TOPICS_PATH, 'utf-8'));
const existingTopicsSet = new Set(topicsData.topics.map(t => t.topic.toLowerCase()));

// ── 3. AI keyword list ──
const AI_KW = [
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
  return AI_KW.some(kw => t.includes(kw));
}

// ── 4. Fetch repo data sequentially ──
const sleep = ms => new Promise(r => setTimeout(r, ms));
const repoList = [...repos.keys()];
const apiData = {};
const topicUsage = {};

for (let i = 0; i < repoList.length; i++) {
  const repo = repoList[i];
  try {
    const res = await fetch(`https://api.github.com/repos/${repo}`, {
      headers: {
        'Authorization': `token ${TOKEN}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'ai-master-site'
      }
    });
    if (res.status === 403) {
      console.log(`  ⏳ Rate limited on ${repo}, wait 10s...`);
      await sleep(10000);
      i--; continue;
    }
    if (res.status === 404) { console.log(`  ✗ 404 ${repo}`); await sleep(500); continue; }
    if (!res.ok) { console.log(`  ✗ ${res.status} ${repo}`); await sleep(500); continue; }
    const data = await res.json();
    apiData[repo] = {
      stars: data.stargazers_count || 0,
      forks: data.forks_count || 0,
      language: data.language || null,
      pushedAt: data.pushed_at ? data.pushed_at.split('T')[0] : null,
      topics: (data.topics || []).map(t => t.toLowerCase())
    };
    // Track topics
    for (const t of apiData[repo].topics) {
      topicUsage[t] = (topicUsage[t] || 0) + 1;
    }
    console.log(`  ✓ ${repo} → ${apiData[repo].stars}★, ${apiData[repo].forks} forks, ${apiData[repo].language||'N/A'}`);
  } catch(e) {
    console.log(`  ✗ ${repo}: ${e.message}`);
  }
  if (i < repoList.length - 1) await sleep(1000);
}

// ── 5. Build changes to tools.ts ──
let newContent = toolsRaw;
const changes = { stars: [], forks: [], language: [], updatedAt: [] };

// For each repo, find its tool entry and update fields
for (const [repo, data] of Object.entries(apiData)) {
  const escaped = repo.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  
  // Update githubStars
  const starsRe = new RegExp(`(url:\\s*"https://github\\.com/${escaped}"[\\s\\S]*?githubStars:\\s*)(\\d+)`);
  const sm = starsRe.exec(newContent);
  if (sm) {
    const oldVal = parseInt(sm[2]);
    if (oldVal !== data.stars) {
      const pos = sm.index + sm[1].length;
      newContent = newContent.slice(0, pos) + data.stars + newContent.slice(pos + sm[2].length);
      changes.stars.push({ repo, old: oldVal, new: data.stars, delta: data.stars - oldVal });
    }
  }
  
  // Update forks (if field exists)
  const forksRe = new RegExp(`(url:\\s*"https://github\\.com/${escaped}"[\\s\\S]*?forks:\\s*)(\\d+)`);
  const fm = forksRe.exec(newContent);
  if (fm) {
    const oldVal = parseInt(fm[2]);
    if (oldVal !== data.forks) {
      const pos = fm.index + fm[1].length;
      newContent = newContent.slice(0, pos) + data.forks + newContent.slice(pos + fm[2].length);
      changes.forks.push({ repo, old: oldVal, new: data.forks });
    }
  }
  
  // Update language (if field exists)
  if (data.language) {
    const langRe = new RegExp(`(url:\\s*"https://github\\.com/${escaped}"[\\s\\S]*?language:\\s*")([^"]*)"`,);
    const lm = langRe.exec(newContent);
    if (lm && lm[2] !== data.language && lm[2] !== 'N/A') {
      const pos = lm.index + lm[1].length;
      newContent = newContent.slice(0, pos) + data.language + newContent.slice(pos + lm[2].length);
      changes.language.push({ repo, old: lm[2], new: data.language });
    }
  }
  
  // Update updatedAt (if field exists)
  if (data.pushedAt) {
    const dateRe = new RegExp(`(url:\\s*"https://github\\.com/${escaped}"[\\s\\S]*?updatedAt:\\s*")([^"]*)"`);
    const dm = dateRe.exec(newContent);
    if (dm && dm[2] !== data.pushedAt) {
      const pos = dm.index + dm[1].length;
      newContent = newContent.slice(0, pos) + data.pushedAt + newContent.slice(pos + dm[2].length);
      changes.updatedAt.push({ repo, old: dm[2], new: data.pushedAt });
    }
  }
}

// Write updated tools.ts
let toolsChanged = false;
if (newContent !== toolsRaw) {
  fs.writeFileSync(TOOLS_PATH, newContent);
  toolsChanged = true;
}

// ── 6. Discover new AI topics ──
const newTopics = [];
for (const [topic, count] of Object.entries(topicUsage)) {
  if (existingTopicsSet.has(topic)) continue;
  if (!isAiRelated(topic)) continue;
  // Filter: skip if only 1 repo and max stars < 1000
  const reposForTopic = repoList.filter(r => apiData[r] && apiData[r].topics.includes(topic));
  const maxStars = Math.max(...reposForTopic.map(r => apiData[r].stars), 0);
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

if (newTopics.length > 0) {
  topicsData.topics.push(...newTopics);
  topicsData.lastUpdated = new Date().toISOString();
  fs.writeFileSync(TOPICS_PATH, JSON.stringify(topicsData, null, 2));
}

// ── 7. Summary ──
console.log('\n========== SUMMARY ==========');
console.log(`Repos scanned: ${repoList.length}`);
console.log(`API responses: ${Object.keys(apiData).length}`);
console.log(`Stars updated: ${changes.stars.length}`);
if (changes.stars.length > 0) {
  changes.stars.sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta));
  changes.stars.slice(0, 8).forEach(c => {
    console.log(`  ${c.repo}: ${c.old} → ${c.new} (${c.delta > 0 ? '+' : ''}${c.delta})`);
  });
}
console.log(`Forks updated: ${changes.forks.length}`);
console.log(`Language updated: ${changes.language.length}`);
console.log(`New AI topics: ${newTopics.length}`);
if (newTopics.length > 0) {
  newTopics.forEach(t => console.log(`  • ${t.topic} — ${t.description}`));
}
console.log(`tools.ts changed: ${toolsChanged}`);
console.log('===============================');

// Save summary for the commit message
fs.writeFileSync('/tmp/github-update-result.json', JSON.stringify({
  reposScanned: repoList.length,
  apiResponses: Object.keys(apiData).length,
  starsChanges: changes.stars,
  forksChanges: changes.forks,
  langChanges: changes.language,
  newTopics,
  toolsChanged,
}, null, 2));
