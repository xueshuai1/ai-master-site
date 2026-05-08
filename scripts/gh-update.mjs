#!/usr/bin/env node
// Update GitHub stars, forks, language, updatedAt in tools.ts
// Discover new AI topics from repo topics and append to ai-topics.json
import { readFileSync, writeFileSync } from 'fs';

const TOKEN = process.env.GITHUB_TOKEN;
if (!TOKEN) { console.error('GITHUB_TOKEN required'); process.exit(1); }

const toolsContent = readFileSync('src/data/tools.ts', 'utf-8');
const topicsJson = JSON.parse(readFileSync('data/ai-topics.json', 'utf-8'));

// 1. Extract unique repos
const urlRe = /url:\s*"https:\/\/github\.com\/([^"]+)"/g;
const repos = new Set();
let m; while ((m = urlRe.exec(toolsContent))) repos.add(m[1]);
const repoList = [...repos];
console.log(`Found ${repoList.length} unique repos`);

// 2. Existing topics (lowercase)
const existing = new Set(topicsJson.topics.map(t => t.topic.toLowerCase()));

// 3. AI keywords
const AI_KW = [
  'ai','ml','dl','llm','nlp','cv','agent','robot','robots','robotics','vision','language',
  'neural','learning','generative','prompt','chatbot','deep-learning','machine-learning',
  'transformer','gpt','diffusion','rag','embedding','inference','fine-tuning','llmops',
  'mlops','model-serving','vector-search','semantic-search','knowledge-graph','multimodal',
  'speech','text-to-speech','image-generation','video-generation','code-generation',
  'autonomous','embodied-ai','world-models','foundation-models','large-language-models',
  'retrieval-augmented','instruction-tuning','rlhf','alignment'
];
const isAi = t => AI_KW.some(kw => t.toLowerCase().includes(kw));

// 4. Fetch GitHub API using Authorization header
const headers = {
  'Authorization': `Bearer ${TOKEN}`,
  'Accept': 'application/vnd.github.v3+json',
  'User-Agent': 'ai-master-site-update'
};

const fetched = [];
const topicMap = new Map();

for (let i = 0; i < repoList.length; i++) {
  const r = repoList[i];
  try {
    const resp = await fetch(`https://api.github.com/repos/${r}`, { headers });
    if (!resp.ok) {
      console.error(`  ✗ ${r}: ${resp.status}`);
      if (resp.status === 403) {
        const remaining = resp.headers.get('x-ratelimit-remaining');
        const reset = resp.headers.get('x-ratelimit-reset');
        console.error(`    Rate limit: remaining=${remaining}, reset=${reset}`);
        break;
      }
      continue;
    }
    const d = await resp.json();
    const entry = {
      repo: r,
      stars: d.stargazers_count || 0,
      pushed: d.pushed_at?.split('T')[0] || '',
      forks: d.forks_count || 0,
      lang: d.language || '',
      topics: (d.topics || []).map(t => t.toLowerCase().replace(/\s+/g, '-'))
    };
    fetched.push(entry);
    for (const t of entry.topics) {
      if (!topicMap.has(t)) topicMap.set(t, new Set());
      topicMap.get(t).add(r);
    }
    console.log(`  ✓ ${r}: ${entry.stars}★ | forks:${entry.forks} | ${entry.lang} | ${entry.pushed}`);
  } catch (e) { console.error(`  ✗ ${r}: ${e.message}`); }
  if (i < repoList.length - 1) await new Promise(r => setTimeout(r, 1100));
}

console.log(`\nFetched ${fetched.length}/${repoList.length}\n`);

// 5. Compare & detect changes
const changes = { stars: [], forks: [], lang: [], dates: [] };
let oldestRepo = '', oldestDays = 0;

for (const f of fetched) {
  const pos = toolsContent.indexOf(`https://github.com/${f.repo}`);
  if (pos === -1) continue;
  const blk = toolsContent.slice(pos, pos + 3000);
  
  const oldS = parseInt(blk.match(/githubStars:\s*(\d+)/)?.[1] || '0');
  const oldF = parseInt(blk.match(/forks:\s*(\d+)/)?.[1] || '0');
  const oldL = blk.match(/language:\s*"([^"]+)"/)?.[1] || '';
  const oldD = blk.match(/updatedAt:\s*"([^"]+)"/)?.[1] || '';
  
  if (oldS && oldS !== f.stars) changes.stars.push({ repo: f.repo, old: oldS, new: f.stars, delta: f.stars - oldS });
  if (oldF && oldF !== f.forks) changes.forks.push({ repo: f.repo, old: oldF, new: f.forks });
  if (oldL && oldL !== f.lang && f.lang) changes.lang.push({ repo: f.repo, old: oldL, new: f.lang });
  if (oldD && oldD !== f.pushed && f.pushed) changes.dates.push({ repo: f.repo, old: oldD, new: f.pushed });
  
  if (f.pushed) {
    const days = Math.floor((Date.now() - new Date(f.pushed)) / 86400000);
    if (days > oldestDays) { oldestDays = days; oldestRepo = f.repo; }
  }
}

changes.stars.sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta));
console.log(`Stars: ${changes.stars.length} | Forks: ${changes.forks.length} | Lang: ${changes.lang.length} | Dates: ${changes.dates.length}`);

// 6. Apply changes to tools.ts
let newTools = toolsContent;
for (const c of changes.stars) {
  const pos = newTools.indexOf(`https://github.com/${c.repo}`);
  if (pos === -1) continue;
  const blk = newTools.slice(pos, pos + 3000);
  const sm = blk.match(/(githubStars:\s*)\d+/);
  if (sm) { const ap = pos + sm.index; newTools = newTools.slice(0, ap) + sm[1] + c.new + newTools.slice(ap + sm[0].length); }
}
for (const c of changes.forks) {
  const pos = newTools.indexOf(`https://github.com/${c.repo}`);
  if (pos === -1) continue;
  const blk = newTools.slice(pos, pos + 3000);
  const fm = blk.match(/(forks:\s*)\d+/);
  if (fm) { const ap = pos + fm.index; newTools = newTools.slice(0, ap) + fm[1] + c.new + newTools.slice(ap + fm[0].length); }
}
for (const c of changes.lang) {
  const pos = newTools.indexOf(`https://github.com/${c.repo}`);
  if (pos === -1) continue;
  const blk = newTools.slice(pos, pos + 3000);
  const lm = blk.match(/(language:\s*")[^"]+(")/);
  if (lm) { const ap = pos + lm.index; newTools = newTools.slice(0, ap) + lm[1] + c.new + lm[2] + newTools.slice(ap + lm[0].length); }
}
for (const c of changes.dates) {
  const pos = newTools.indexOf(`https://github.com/${c.repo}`);
  if (pos === -1) continue;
  const blk = newTools.slice(pos, pos + 3000);
  const dm = blk.match(/(updatedAt:\s*")[^"]+(")/);
  if (dm) { const ap = pos + dm.index; newTools = newTools.slice(0, ap) + dm[1] + c.new + dm[2] + newTools.slice(ap + dm[0].length); }
}

const hasChanges = changes.stars.length || changes.forks.length || changes.lang.length || changes.dates.length;
if (hasChanges) { writeFileSync('src/data/tools.ts', newTools); console.log('✓ tools.ts updated'); }
else console.log('✓ No tools.ts changes');

// 7. Discover new AI topics
const newTopics = [];
for (const [topic, repoSet] of topicMap) {
  if (existing.has(topic)) continue;
  if (!isAi(topic)) continue;
  if (repoSet.size === 1) { const rd = fetched.find(r => r.repo === [...repoSet][0]); if (rd && rd.stars < 1000) continue; }
  const cnt = repoSet.size;
  newTopics.push({
    topic, url: `https://github.com/topics/${topic}`,
    minStars: cnt >= 3 ? 2000 : cnt >= 2 ? 3000 : 5000,
    description: `（自动发现）${topic.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}`
  });
}
newTopics.sort((a, b) => a.topic.localeCompare(b.topic));

if (newTopics.length) {
  topicsJson.lastUpdated = new Date().toISOString();
  topicsJson.topics.push(...newTopics);
  writeFileSync('data/ai-topics.json', JSON.stringify(topicsJson, null, 2) + '\n');
  console.log(`✓ ai-topics.json: +${newTopics.length} topics (total: ${topicsJson.topics.length})`);
} else console.log('✓ No new topics');

// 8. Save summary
writeFileSync('/tmp/gh-summary.json', JSON.stringify({
  scanned: fetched.length,
  stars: changes.stars.length, topStars: changes.stars.slice(0, 5),
  forks: changes.forks.length, lang: changes.lang.length, dates: changes.dates.length,
  oldestRepo, oldestDays,
  newTopics: newTopics.length, totalTopics: topicsJson.topics.length,
  newTopicsList: newTopics.slice(0, 20),
  hasChanges
}, null, 2));
console.log('\n✓ Summary saved to /tmp/gh-summary.json');
