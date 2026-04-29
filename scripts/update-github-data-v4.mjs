#!/usr/bin/env node
// Simple, reliable GitHub data updater for tools.ts
import { readFileSync, writeFileSync } from 'fs';
import { execSync } from 'child_process';

const TOKEN = readFileSync('.env.local', 'utf-8').match(/GITHUB_TOKEN=(.+)/)?.[1]?.trim();
if (!TOKEN) { console.error('No GITHUB_TOKEN'); process.exit(1); }

const content = readFileSync('src/data/tools.ts', 'utf-8');
const topicsData = JSON.parse(readFileSync('data/ai-topics.json', 'utf-8'));
const existingTopics = new Set(topicsData.topics.map(t => t.topic.toLowerCase()));

// Extract all {owner}/{repo} from URLs
const repoSet = new Set();
for (const m of content.matchAll(/url:\s*"https:\/\/github\.com\/([^\/"]+\/[^\/"]+)"/g)) {
  repoSet.add(m[1]);
}
const repos = [...repoSet];
console.log(`Found ${repos.length} repos`);

// Fetch from GitHub API (sequential, with token auth via curl header)
const repoInfo = {};
let ok = 0, fail = 0;

for (let i = 0; i < repos.length; i++) {
  if (i > 0) await new Promise(r => setTimeout(r, 750));
  const repo = repos[i];
  try {
    const raw = execSync(
      `curl -sS --max-time 15 -H "Authorization: token ${TOKEN}" https://api.github.com/repos/${repo}`,
      { encoding: 'utf-8', maxBuffer: 5 * 1024 * 1024 }
    );
    const j = JSON.parse(raw);
    if (j.message && j.message.includes('rate limit')) {
      console.log(`  ⏳ rate limit at ${repo}, waiting 60s`);
      await new Promise(r => setTimeout(r, 60000));
      i--; continue;
    }
    if (!j.stargazers_count && j.stargazers_count !== 0) { fail++; continue; }
    repoInfo[repo] = {
      stars: j.stargazers_count,
      forks: j.forks_count ?? 0,
      lang: j.language ?? null,
      pushed: j.pushed_at ? j.pushed_at.split('T')[0] : null,
      topics: j.topics || []
    };
    ok++;
    if ((ok) % 25 === 0) console.log(`  ${ok}/${repos.length} done: ${repo} (${j.stargazers_count}★)`);
  } catch (e) {
    console.log(`  ✗ ${repo}: ${e.message?.substring(0, 80)}`);
    fail++;
  }
}
console.log(`Fetched: ${ok} ok, ${fail} failed\n`);

// Count changes and apply
let changes = 0;
let starsChanges = [], forksChanges = [], langChanges = [], dateChanges = [];

// Process each repo reference in the file
for (const repo of repos) {
  const info = repoInfo[repo];
  if (!info) continue;
  
  // Find each occurrence of this repo URL in the content
  let pos = 0;
  const url = `https://github.com/${repo}`;
  while (true) {
    const urlIdx = content.indexOf(url, pos);
    if (urlIdx === -1) break;
    
    // Find the object boundaries around this URL
    let start = urlIdx;
    for (let b = 0; start >= 0; start--) {
      if (content[start] === '}') b--;
      if (content[start] === '{') { b++; if (b === 1) break; }
    }
    let end = urlIdx;
    for (let b = 0; end < content.length; end++) {
      if (content[end] === '{') b++;
      if (content[end] === '}') { b--; if (b === 0) { end++; break; } }
    }
    
    const obj = content.substring(start, end);
    
    // Check and record changes
    const oldStars = obj.match(/githubStars:\s*(\d+)/);
    const oldForks = obj.match(/forks:\s*(\d+)/);
    const oldLang = obj.match(/language:\s*"([^"]*)"/);
    const oldDate = obj.match(/updatedAt:\s*"([^"]+)"/);
    
    if (oldStars && parseInt(oldStars[1]) !== info.stars) {
      starsChanges.push({ repo, old: parseInt(oldStars[1]), new: info.stars });
    }
    if (oldForks && parseInt(oldForks[1]) !== info.forks) {
      forksChanges.push({ repo, old: parseInt(oldForks[1]), new: info.forks });
    }
    if (oldLang && info.lang && oldLang[1] !== info.lang && oldLang[1] !== 'null') {
      langChanges.push({ repo, old: oldLang[1], new: info.lang });
    }
    if (oldDate && info.pushed && oldDate[1] !== info.pushed) {
      dateChanges.push({ repo, old: oldDate[1], new: info.pushed });
    }
    
    pos = urlIdx + url.length;
  }
}

// Now apply changes using targeted regex replacements
let result = content;

// Apply stars changes
for (const c of starsChanges) {
  const regex = new RegExp(`(githubStars:\\s*)${c.old}(?!\\d)`, 'g');
  const matches = [...result.matchAll(regex)];
  // Only replace the ones near the right repo URL
  for (const m of matches) {
    // Check if this stars field is near the repo URL
    const nearbyContent = result.substring(Math.max(0, m.index - 500), m.index + 500);
    if (nearbyContent.includes(`github.com/${c.repo}`)) {
      result = result.substring(0, m.index) + `githubStars: ${c.new}` + result.substring(m.index + m[0].length);
      changes++;
    }
  }
}

// Apply forks changes
for (const c of forksChanges) {
  const regex = new RegExp(`(forks:\\s*)${c.old}(?!\\d)`, 'g');
  const matches = [...result.matchAll(regex)];
  for (const m of matches) {
    const nearbyContent = result.substring(Math.max(0, m.index - 500), m.index + 500);
    if (nearbyContent.includes(`github.com/${c.repo}`)) {
      result = result.substring(0, m.index) + `forks: ${c.new}` + result.substring(m.index + m[0].length);
      changes++;
    }
  }
}

// Apply language changes
for (const c of langChanges) {
  const regex = new RegExp(`(language:\\s*)"${c.old.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"`, 'g');
  const matches = [...result.matchAll(regex)];
  for (const m of matches) {
    const nearbyContent = result.substring(Math.max(0, m.index - 500), m.index + 500);
    if (nearbyContent.includes(`github.com/${c.repo}`)) {
      result = result.substring(0, m.index) + `language: "${c.new}"` + result.substring(m.index + m[0].length);
      changes++;
    }
  }
}

// Apply date changes
for (const c of dateChanges) {
  const regex = new RegExp(`(updatedAt:\\s*)"${c.old}"`, 'g');
  const matches = [...result.matchAll(regex)];
  for (const m of matches) {
    const nearbyContent = result.substring(Math.max(0, m.index - 500), m.index + 500);
    if (nearbyContent.includes(`github.com/${c.repo}`)) {
      result = result.substring(0, m.index) + `updatedAt: "${c.new}"` + result.substring(m.index + m[0].length);
      changes++;
    }
  }
}

writeFileSync('src/data/tools.ts', result);
console.log(`Applied ${changes} edits to tools.ts`);
console.log(`  Stars: ${starsChanges.length}, Forks: ${forksChanges.length}, Lang: ${langChanges.length}, Date: ${dateChanges.length}`);

// Topic discovery
const allTopics = new Map();
for (const [repo, info] of Object.entries(repoInfo)) {
  for (const t of info.topics) {
    const norm = t.toLowerCase().replace(/\s+/g, '-');
    allTopics.set(norm, (allTopics.get(norm) || 0) + 1);
  }
}

const aiKws = ['ai','ml','dl','llm','nlp','cv','agent','robot','robots','robotics','vision','language',
  'neural','learning','generative','prompt','chatbot','deep-learning','machine-learning',
  'transformer','gpt','diffusion','rag','embedding','inference','fine-tuning','llmops',
  'mlops','model-serving','vector-search','semantic-search','knowledge-graph','multimodal',
  'speech','text-to-speech','image-generation','video-generation','code-generation',
  'autonomous','embodied-ai','world-models','foundation-models','large-language-models',
  'retrieval-augmented','instruction-tuning','rlhf','alignment'];

const newTopics = [];
for (const [topic, count] of allTopics) {
  if (existingTopics.has(topic)) continue;
  if (!aiKws.some(kw => topic.includes(kw) || topic === kw)) continue;
  if (count === 1) {
    const matchingRepo = Object.entries(repoInfo).find(([r, i]) =>
      i.topics.map(t => t.toLowerCase().replace(/\s+/g, '-')).includes(topic));
    if (matchingRepo && matchingRepo[1].stars < 1000) continue;
  }
  let minStars = count >= 3 ? 2000 : count >= 2 ? 3000 : 5000;
  newTopics.push({ topic, url: `https://github.com/topics/${topic}`, minStars, description: `（自动发现）${topic}` });
}

if (newTopics.length > 0) {
  topicsData.topics.push(...newTopics);
  topicsData.lastUpdated = new Date().toISOString();
  writeFileSync('data/ai-topics.json', JSON.stringify(topicsData, null, 2) + '\n');
  console.log(`Added ${newTopics.length} new topics`);
}

// Top star changes
const topGains = [...starsChanges].sort((a, b) => (b.new - b.old) - (a.new - a.old)).slice(0, 5);
const topLosses = [...starsChanges].sort((a, b) => (a.new - a.old) - (b.new - b.old)).slice(0, 3);

// Oldest updated
let oldestRepo = { name: '', days: 0 };
for (const [repo, info] of Object.entries(repoInfo)) {
  if (info.pushed) {
    const days = Math.floor((Date.now() - new Date(info.pushed).getTime()) / 86400000);
    if (days > oldestRepo.days) {
      // Find tool name
      const nameMatch = content.match(new RegExp(`id:\\s*"([^"]+)"[\\s\\S]{0,200}github\\.com/${repo.replace('/', '\\/')}`));
      oldestRepo = { name: nameMatch ? nameMatch[1] : repo, days };
    }
  }
}

// Save summary
writeFileSync('/tmp/github-update-results.json', JSON.stringify({
  totalRepos: repos.length, successCount: ok, failCount: fail,
  starsChanged: starsChanges.length, forksChanged: forksChanges.length,
  langChanged: langChanges.length, dateChanged: dateChanges.length, totalEdits: changes,
  topGains, topLosses, oldestRepo, newTopics,
  topicStats: { total: allTopics.size, new: newTopics.length, existing: existingTopics.size }
}, null, 2));

console.log('Done!');
