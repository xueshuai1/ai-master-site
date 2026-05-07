#!/usr/bin/env node
// Updates GitHub stars/forks/language/updatedAt for tools.ts
// Uses curl with Authorization header (GitHub deprecated ?access_token query param → 400)

import { readFileSync, writeFileSync, execSync } from 'fs';

const TOKEN = execSync('grep GITHUB_TOKEN /Users/xueshuai/.openclaw/workspace/ai-master-site/.env.local | cut -d= -f2 | tr -d "\n"').toString();
const TOOLS_PATH = '/Users/xueshuai/.openclaw/workspace/ai-master-site/src/data/tools.ts';
const TOPICS_PATH = '/Users/xueshuai/.openclaw/workspace/ai-master-site/data/ai-topics.json';

// GitHub API via curl with Authorization header
async function fetchRepo(repo) {
  const cmd = `curl -s -w "\\n%{http_code}" -H "Authorization: Bearer ${TOKEN}" "https://api.github.com/repos/${repo}"`;
  try {
    const raw = execSync(cmd, { timeout: 15000, maxBuffer: 100000 }).toString();
    const nl = raw.lastIndexOf('\n');
    const code = parseInt(raw.slice(nl + 1));
    const body = raw.slice(0, nl);
    if (code === 200) return JSON.parse(body);
    if (code === 404) return null;
    if (code === 403) {
      // Rate limited — check reset time
      const rl = JSON.parse(execSync(`curl -s -H "Authorization: Bearer ${TOKEN}" "https://api.github.com/rate_limit"`, { timeout: 10000 }).toString());
      const remaining = rl.resources.core.remaining;
      const reset = rl.resources.core.reset;
      if (remaining === 0) {
        const waitSec = Math.ceil((reset * 1000 - Date.now()) / 1000) + 5;
        if (waitSec > 0 && waitSec < 120) {
          console.log(`  Rate limited, waiting ${waitSec}s...`);
          await new Promise(r => setTimeout(r, waitSec * 1000));
          // Retry
          const raw2 = execSync(cmd, { timeout: 15000, maxBuffer: 100000 }).toString();
          const nl2 = raw2.lastIndexOf('\n');
          if (parseInt(raw2.slice(nl2 + 1)) === 200) return JSON.parse(raw2.slice(0, nl2));
        }
      }
      return '__RATE_LIMITED__';
    }
    return null;
  } catch(e) {
    console.log(`  [ERR] ${repo}: ${e.message.slice(0,80)}`);
    return null;
  }
}

// ── Parse tools.ts ──
// Only check repos from tools that HAVE `githubStars` defined
const content = readFileSync(TOOLS_PATH, 'utf8');
const lines = content.split('\n');

// Extract tool entries: find objects with id, url (GitHub repo), githubStars
const tools = [];
let current = null;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  const idMatch = line.match(/^\s*id:\s*["']([^"']+)["']/);
  if (idMatch) {
    current = { id: idMatch[1], repo: null, starsLine: -1, starsVal: -1, forksLine: -1, langLine: -1, dateLine: -1 };
    tools.push(current);
  }
  if (!current) continue;
  
  // Match url field (GitHub repo) — only `url:` field, not `learnMore:`
  if (!current.repo) {
    const urlMatch = line.match(/^\s*url:\s*["'](https?:\/\/github\.com\/([^"'\s#?]+))["']/);
    if (urlMatch) {
      const parts = urlMatch[2].split('/');
      if (parts.length === 2) current.repo = parts[0] + '/' + parts[1];
    }
  }
  
  // Match githubStars
  const starsMatch = line.match(/^(\s*)githubStars:\s*(\d+)/);
  if (starsMatch) { current.starsLine = i; current.starsVal = parseInt(starsMatch[2]); }
  
  // Match forks
  const forksMatch = line.match(/^(\s*)forks:\s*(\d+)/);
  if (forksMatch) { current.forksLine = i; }
  
  // Match language
  const langMatch = line.match(/^(\s*)language:\s*["']([^"']+)["']/);
  if (langMatch) { current.langLine = i; }
  
  // Match updatedAt
  const dateMatch = line.match(/^(\s*)updatedAt:\s*["']([^"']+)["']/);
  if (dateMatch) { current.dateLine = i; }
}

// Filter: only tools with githubStars AND a repo
const toCheck = tools.filter(t => t.starsVal >= 0 && t.repo);
console.log(`Tools with githubStars + repo: ${toCheck.length}`);

// Deduplicate repos
const repoMap = new Map();
for (const t of toCheck) {
  if (!repoMap.has(t.repo)) repoMap.set(t.repo, []);
  repoMap.get(t.repo).push(t);
}
console.log(`Unique repos: ${repoMap.size}`);

// ── Fetch GitHub data ──
const repoData = {};
const repos = [...repoMap.keys()];
let rateLimited = false;

for (let i = 0; i < repos.length; i++) {
  if (rateLimited) break;
  const repo = repos[i];
  if (i > 0) await new Promise(r => setTimeout(r, 1100)); // ~1 req/sec
  
  try {
    const data = await fetchRepo(repo);
    if (data === '__RATE_LIMITED__') { rateLimited = true; break; }
    if (data) {
      repoData[repo] = data;
      console.log(`  [OK] ${repo} — ★${data.stargazers_count} forks:${data.forks_count} lang:${data.language} pushed:${data.pushed_at?.slice(0,10)}`);
    }
  } catch(e) {
    console.log(`  [ERR] ${repo}: ${e.message?.slice(0,80) || e}`);
  }
}

console.log(`\nFetched ${Object.keys(repoData).length}/${repos.length} repos`);

// ── Apply updates ──
const updates = { stars: [], forks: [], language: [], date: [] };

for (const [repo, data] of Object.entries(repoData)) {
  const toolList = repoMap.get(repo);
  for (const tool of toolList) {
    // Stars
    if (data.stargazers_count !== tool.starsVal && tool.starsLine >= 0) {
      const indent = lines[tool.starsLine].match(/^(\s*)/)?.[1] || '';
      lines[tool.starsLine] = `${indent}githubStars: ${data.stargazers_count}`;
      updates.stars.push({ tool: tool.id, old: tool.starsVal, new: data.stargazers_count, diff: data.stargazers_count - tool.starsVal });
    }
    
    // Forks
    if (data.forks_count !== undefined && tool.forksLine >= 0) {
      const existingForks = parseInt(lines[tool.forksLine].match(/forks:\s*(\d+)/)?.[1] || '0');
      if (data.forks_count !== existingForks) {
        const indent = lines[tool.forksLine].match(/^(\s*)/)?.[1] || '';
        lines[tool.forksLine] = `${indent}forks: ${data.forks_count}`;
        updates.forks.push({ tool: tool.id, old: existingForks, new: data.forks_count });
      }
    }
    
    // Language
    if (data.language && tool.langLine >= 0) {
      const existingLang = lines[tool.langLine].match(/language:\s*["']([^"']+)["']/)?.[1];
      if (existingLang && existingLang !== data.language) {
        const indent = lines[tool.langLine].match(/^(\s*)/)?.[1] || '';
        lines[tool.langLine] = `${indent}language: "${data.language}"`;
        updates.language.push({ tool: tool.id, old: existingLang, new: data.language });
      }
    }
    
    // UpdatedAt
    if (data.pushed_at && tool.dateLine >= 0) {
      const pushed = data.pushed_at.split('T')[0];
      const existing = lines[tool.dateLine].match(/updatedAt:\s*["']([^"']+)["']/)?.[1];
      if (existing && existing !== pushed) {
        const indent = lines[tool.dateLine].match(/^(\s*)/)?.[1] || '';
        lines[tool.dateLine] = `${indent}updatedAt: "${pushed}"`;
        updates.date.push({ tool: tool.id, old: existing, new: pushed });
      }
    }
  }
}

writeFileSync(TOOLS_PATH, lines.join('\n'));

// ── Topic Discovery ──
const topicsData = JSON.parse(readFileSync(TOPICS_PATH, 'utf8'));
const existingTopics = new Set(topicsData.topics.map(t => t.topic.toLowerCase()));

const AI_KEYWORDS = [
  'ai','ml','dl','llm','nlp','cv','agent','robot','robots','robotics',
  'vision','language','neural','learning','generative','prompt','chatbot',
  'deep-learning','machine-learning','transformer','gpt','diffusion','rag',
  'embedding','inference','fine-tuning','llmops','mlops','model-serving',
  'vector-search','semantic-search','knowledge-graph','multimodal','speech',
  'text-to-speech','image-generation','video-generation','code-generation',
  'autonomous','embodied-ai','world-models','foundation-models',
  'large-language-models','retrieval-augmented','instruction-tuning','rlhf','alignment'
];

function isAiRelated(t) {
  const s = t.toLowerCase();
  return AI_KEYWORDS.some(kw => s.includes(kw));
}

const topicCounts = new Map();
const topicMaxStars = new Map();
for (const data of Object.values(repoData)) {
  if (!data.topics) continue;
  for (const topic of data.topics) {
    const n = topic.toLowerCase().replace(/\s+/g, '-');
    topicCounts.set(n, (topicCounts.get(n) || 0) + 1);
    if (!topicMaxStars.has(n) || data.stargazers_count > topicMaxStars.get(n)) {
      topicMaxStars.set(n, data.stargazers_count);
    }
  }
}

const newAiTopics = [];
for (const [topic, count] of topicCounts.entries()) {
  if (existingTopics.has(topic)) continue;
  const maxStars = topicMaxStars.get(topic) || 0;
  if (count === 1 && maxStars < 1000) continue;
  if (!isAiRelated(topic)) continue;
  
  let minStars = 5000;
  if (count >= 3) minStars = 2000;
  else if (count >= 2) minStars = 3000;
  
  newAiTopics.push({
    topic, url: `https://github.com/topics/${topic}`, minStars,
    description: `（自动发现）${topic.replace(/-/g, ' ')}`
  });
}

let topicsUpdated = false;
if (newAiTopics.length > 0) {
  topicsData.topics.push(...newAiTopics);
  topicsData.lastUpdated = new Date().toISOString();
  writeFileSync(TOPICS_PATH, JSON.stringify(topicsData, null, 2) + '\n');
  topicsUpdated = true;
}

// ── Summary ──
console.log('\n========== SUMMARY ==========');
console.log(`Repos checked: ${Object.keys(repoData).length}`);
console.log(`Stars changed: ${updates.stars.length}`);
const sorted = [...updates.stars].sort((a, b) => Math.abs(b.diff) - Math.abs(a.diff));
for (const u of sorted.slice(0, 5)) {
  const s = u.diff > 0 ? '+' : '';
  console.log(`  ${u.tool}: ${u.old} → ${u.new} (${s}${u.diff})`);
}
console.log(`Forks changed: ${updates.forks.length}`);
console.log(`Language changed: ${updates.language.length}`);
console.log(`Date changed: ${updates.date.length}`);
console.log(`New AI Topics: ${newAiTopics.length}`);
for (const t of newAiTopics.slice(0, 10)) {
  console.log(`  - ${t.topic} (${topicCounts.get(t.topic)} repos, max★${topicMaxStars.get(t.topic)})`);
}

const hasChanges = updates.stars.length + updates.forks.length + updates.language.length + updates.date.length + newAiTopics.length > 0;

const now = Date.now();
let oldestPushed = { repo: '', days: 0 };
for (const [repo, data] of Object.entries(repoData)) {
  if (data?.pushed_at) {
    const days = Math.floor((now - new Date(data.pushed_at).getTime()) / 86400000);
    if (days > oldestPushed.days) oldestPushed = { repo, days };
  }
}

writeFileSync('/tmp/github-update-summary.json', JSON.stringify({
  hasChanges, reposChecked: Object.keys(repoData).length,
  starsChanged: updates.stars, forksChanged: updates.forks,
  languageChanged: updates.language, dateChanged: updates.date,
  newAiTopics, totalTopics: topicsData.topics.length, oldestPushed,
  biggestStarChanges: sorted.slice(0, 3)
}, null, 2));

console.log('\nDone. Summary → /tmp/github-update-summary.json');
console.log(`hasChanges: ${hasChanges}`);
