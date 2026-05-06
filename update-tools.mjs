#!/usr/bin/env node
import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const { results, newTopics } = JSON.parse(readFileSync(join(__dirname, 'github-fetch-result.json'), 'utf8'));
const repoMap = new Map();
for (const r of results) {
  repoMap.set(r.repo, { stars: r.stars, pushed: r.pushed, forks: r.forks, lang: r.lang });
}

let content = readFileSync(join(__dirname, 'src/data/tools.ts'), 'utf8');
const changes = [];

// Collect all edits as {start, end, newText}, apply from end to start
const edits = [];

for (const [repo, data] of repoMap) {
  if (data.stars === undefined || data.stars === null) continue;
  
  const urlIdx = content.indexOf(`"https://github.com/${repo}"`);
  if (urlIdx === -1) continue;
  
  const searchEnd = Math.min(urlIdx + 3000, content.length);
  const section = content.substring(urlIdx, searchEnd);
  
  // githubStars
  const sM = section.match(/(githubStars:\s*)(\d+)/);
  if (sM && data.stars !== parseInt(sM[2])) {
    edits.push({ start: urlIdx + sM.index, end: urlIdx + sM.index + sM[0].length, newText: `githubStars: ${data.stars}` });
    changes.push({ repo, field: 'stars', old: parseInt(sM[2]), new: data.stars });
  }
  
  // forks
  const fM = section.match(/(forks:\s*)(\d+)/);
  if (fM && data.forks !== undefined && data.forks !== null && data.forks !== parseInt(fM[2])) {
    edits.push({ start: urlIdx + fM.index, end: urlIdx + fM.index + fM[0].length, newText: `forks: ${data.forks}` });
    changes.push({ repo, field: 'forks', old: parseInt(fM[2]), new: data.forks });
  }
  
  // language
  const lM = section.match(/(language:\s*)"([^"]+)"/);
  if (lM && data.lang && data.lang !== lM[2]) {
    edits.push({ start: urlIdx + lM.index, end: urlIdx + lM.index + lM[0].length, newText: `language: "${data.lang}"` });
    changes.push({ repo, field: 'language', old: lM[2], new: data.lang });
  }
}

// Apply edits from end to start to avoid position shifts
edits.sort((a, b) => b.start - a.start);
for (const e of edits) {
  content = content.substring(0, e.start) + e.newText + content.substring(e.end);
}

writeFileSync(join(__dirname, 'src/data/tools.ts'), content);

// Update topics
const topicsPath = join(__dirname, 'data/ai-topics.json');
const topicsData = JSON.parse(readFileSync(topicsPath, 'utf8'));
const existingSet = new Set(topicsData.topics.map(t => t.topic.toLowerCase()));
const addedTopics = [];

for (const t of newTopics) {
  if (!existingSet.has(t.topic)) {
    topicsData.topics.push({ topic: t.topic, url: t.url, minStars: t.minStars, description: t.description });
    addedTopics.push(t.topic);
    existingSet.add(t.topic);
  }
}

topicsData.lastUpdated = new Date().toISOString();
writeFileSync(topicsPath, JSON.stringify(topicsData, null, 2));

console.log(`Changes: ${changes.length}`);
changes.forEach(c => console.log(`  ${c.repo}: ${c.field} ${c.old} → ${c.new}`));
console.log(`New topics: ${addedTopics.length}`);
addedTopics.forEach(t => console.log(`  ${t}`));
if (changes.length === 0 && addedTopics.length === 0) console.log('No changes needed.');
