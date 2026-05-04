#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const TOOLS_FILE = path.resolve(__dirname, '../src/data/tools.ts');
const TOPICS_FILE = path.resolve(__dirname, '../data/ai-topics.json');
const TOKEN = process.env.GITHUB_TOKEN || '';

if (!TOKEN) { console.error('GITHUB_TOKEN not set'); process.exit(1); }

const toolsContent = fs.readFileSync(TOOLS_FILE, 'utf8');
const topicsData = JSON.parse(fs.readFileSync(TOPICS_FILE, 'utf8'));
const existingTopics = new Set(topicsData.topics.map(t => t.topic.toLowerCase()));

const aiKeywords = ['ai','ml','dl','llm','nlp','cv','agent','robot','robots','robotics','vision','language','neural','learning','generative','prompt','chatbot','deep-learning','machine-learning','transformer','gpt','diffusion','rag','embedding','inference','fine-tuning','llmops','mlops','model-serving','vector-search','semantic-search','knowledge-graph','multimodal','speech','text-to-speech','image-generation','video-generation','code-generation','autonomous','embodied-ai','world-models','foundation-models','large-language-models','retrieval-augmented','instruction-tuning','rlhf','alignment'];

function isAITopic(t) {
  const l = t.toLowerCase();
  return aiKeywords.some(kw => l.includes(kw) || l === kw);
}

const urlRegex = /url:\s*["']https:\/\/github\.com\/([^"']+)["']/g;
const repos = new Set();
let match;
while ((match = urlRegex.exec(toolsContent)) !== null) repos.add(match[1]);

const repoList = [...repos];
console.log(`Total repos: ${repoList.length}`);

const CONCURRENCY = 5;
const results = {};
const allTopics = {};

async function fetchOne(repo) {
  try {
    const res = await fetch(`https://api.github.com/repos/${repo}`, {
      headers: {
        'Authorization': `Bearer ${TOKEN}`,
        'Accept': 'application/vnd.github+json',
        'User-Agent': 'ai-master-site'
      }
    });
    if (res.status === 404 || res.status === 400) return null;
    if (!res.ok) {
      if (res.status === 403 || res.status === 429) {
        await new Promise(r => setTimeout(r, 3000));
        const res2 = await fetch(`https://api.github.com/repos/${repo}`, {
          headers: { 'Authorization': `Bearer ${TOKEN}`, 'Accept': 'application/vnd.github+json', 'User-Agent': 'ai-master-site' }
        });
        if (!res2.ok) return null;
        const d = await res2.json();
        return { stars: d.stargazers_count, forks: d.forks_count, lang: d.language, pushed: d.pushed_at, topics: d.topics || [] };
      }
      return null;
    }
    const d = await res.json();
    return { stars: d.stargazers_count, forks: d.forks_count, lang: d.language, pushed: d.pushed_at, topics: d.topics || [] };
  } catch(e) { return null; }
}

async function runWithConcurrency(items, fn, max) {
  let idx = 0;
  async function worker() {
    while (idx < items.length) {
      const i = idx++;
      await fn(items[i], i);
    }
  }
  const workers = Array.from({length: Math.min(max, items.length)}, () => worker());
  await Promise.all(workers);
}

await runWithConcurrency(repoList, async (repo, i) => {
  const r = await fetchOne(repo);
  if (r) {
    results[repo] = r;
    (r.topics || []).forEach(t => {
      const nt = t.toLowerCase().replace(/\s+/g, '-');
      allTopics[nt] = (allTopics[nt] || 0) + 1;
    });
  }
  if ((i + 1) % 30 === 0) console.log(`[${i+1}/${repoList.length}] done, fetched ${Object.keys(results).length}`);
}, CONCURRENCY);

console.log(`\nFetched: ${Object.keys(results).length}/${repoList.length}`);

// Update tools.ts
let updated = toolsContent;
let starsUpdated = 0, forksUpdated = 0, langUpdated = 0, dateUpdated = 0;
const starsChanges = [];

for (const [repo, info] of Object.entries(results)) {
  const escaped = repo.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const urlPattern = `https://github.com/${escaped}`;
  const urlIdx = updated.indexOf(urlPattern);
  if (urlIdx < 0) continue;
  
  const windowStart = urlIdx;
  const windowEnd = Math.min(urlIdx + 2000, updated.length);
  const window = updated.substring(windowStart, windowEnd);
  
  // Update githubStars
  const starsM = window.match(/githubStars:\s*(\d+)/);
  if (starsM && starsM[1] !== undefined) {
    const oldS = parseInt(starsM[1]);
    if (oldS !== info.stars) {
      starsChanges.push({ repo, old: oldS, new: info.stars, diff: info.stars - oldS });
      const absIdx = windowStart + starsM.index;
      const searchLen = `githubStars: ${oldS}`.length;
      updated = updated.substring(0, absIdx) + `githubStars: ${info.stars}` + updated.substring(absIdx + searchLen);
      starsUpdated++;
    }
  }
  
  // Update forks
  const forksM = window.match(/forks:\s*(\d+)/);
  if (forksM) {
    const oldF = parseInt(forksM[1]);
    if (oldF !== info.forks) {
      const absIdx = windowStart + forksM.index;
      const searchLen = `forks: ${oldF}`.length;
      updated = updated.substring(0, absIdx) + `forks: ${info.forks}` + updated.substring(absIdx + searchLen);
      forksUpdated++;
    }
  }
  
  // Update language
  if (info.lang) {
    const langM = window.match(/language:\s*"([^"]*)"/);
    if (langM && langM[1] !== info.lang) {
      const absIdx = windowStart + langM.index;
      const searchLen = `language: "${langM[1]}"`.length;
      updated = updated.substring(0, absIdx) + `language: "${info.lang}"` + updated.substring(absIdx + searchLen);
      langUpdated++;
    }
  }
  
  // Update updatedAt
  if (info.pushed) {
    const newDate = new Date(info.pushed).toISOString().split('T')[0];
    const dateM = window.match(/updatedAt:\s*"([^"]*)"/);
    if (dateM && dateM[1] !== newDate) {
      const absIdx = windowStart + dateM.index;
      const searchLen = `updatedAt: "${dateM[1]}"`.length;
      updated = updated.substring(0, absIdx) + `updatedAt: "${newDate}"` + updated.substring(absIdx + searchLen);
      dateUpdated++;
    }
  }
}

starsChanges.sort((a, b) => Math.abs(b.diff) - Math.abs(a.diff));

// Collect new AI topics
const newTopics = [];
for (const [topic, count] of Object.entries(allTopics)) {
  if (existingTopics.has(topic)) continue;
  if (!isAITopic(topic)) continue;
  if (count === 1) {
    const maxS = Object.entries(results)
      .filter(([r, i]) => i.topics && i.topics.some(t => t.toLowerCase() === topic))
      .reduce((mx, [r, i]) => Math.max(mx, i.stars), 0);
    if (maxS < 1000) continue;
  }
  let minS = count >= 3 ? 2000 : count >= 2 ? 3000 : 5000;
  newTopics.push({ topic, url: `https://github.com/topics/${topic}`, minStars: minS, description: `（自动发现）${topic.replace(/-/g, ' ')}` });
}

console.log(`\nSummary:`);
console.log(`  Stars: ${starsUpdated} updated`);
console.log(`  Forks: ${forksUpdated} updated`);
console.log(`  Lang: ${langUpdated} updated`);
console.log(`  Dates: ${dateUpdated} updated`);
console.log(`  New topics: ${newTopics.length}`);
if (starsChanges.length > 0) {
  console.log('\nTop changes:');
  starsChanges.slice(0, 10).forEach(c => console.log(`  ${c.repo}: ${c.old} → ${c.new} (${c.diff > 0 ? '+' : ''}${c.diff})`));
}

// Write files
if (updated !== toolsContent) {
  fs.writeFileSync(TOOLS_FILE, updated, 'utf8');
  console.log('\n✅ tools.ts written');
} else {
  console.log('\n✅ tools.ts no changes');
}

if (newTopics.length > 0) {
  topicsData.topics.push(...newTopics);
  topicsData.lastUpdated = new Date().toISOString();
  fs.writeFileSync(TOPICS_FILE, JSON.stringify(topicsData, null, 2), 'utf8');
  console.log(`✅ ai-topics.json: +${newTopics.length} topics`);
} else {
  console.log('✅ ai-topics.json no changes');
}

fs.writeFileSync('/tmp/github-update-result.json', JSON.stringify({
  reposFetched: Object.keys(results).length, reposTotal: repoList.length,
  starsUpdated, forksUpdated, langUpdated, dateUpdated,
  newTopicsCount: newTopics.length, newTopics: newTopics.slice(0, 20),
  starsChanges: starsChanges.slice(0, 10),
  topicsTotal: existingTopics.size + newTopics.length,
  toolsChanged: updated !== toolsContent, topicsChanged: newTopics.length > 0
}, null, 2));
console.log('\nDone.');
