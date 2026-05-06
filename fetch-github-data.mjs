#!/usr/bin/env node
import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const TOKEN = readFileSync(join(__dirname, '.env.local'), 'utf8').match(/GITHUB_TOKEN=(.+)/)?.[1]?.trim();
if (!TOKEN) { console.error('No GITHUB_TOKEN'); process.exit(1); }

// Extract repos from tools.ts
const toolsContent = readFileSync(join(__dirname, 'src/data/tools.ts'), 'utf8');
const urlRe = /url:\s*"(https:\/\/github\.com\/([^"]+))"/g;
const repos = new Set();
let m;
while ((m = urlRe.exec(toolsContent)) !== null) {
  const r = m[2].trim().replace(/["'\s]+$/, '');
  if (r.split('/').length === 2) repos.add(r);
}
const repoList = Array.from(repos);
console.log(`Found ${repoList.length} repos`);

// Existing topics
const topicsData = JSON.parse(readFileSync(join(__dirname, 'data/ai-topics.json'), 'utf8'));
const existingTopics = new Set(topicsData.topics.map(t => t.topic.toLowerCase()));

// AI keywords
const aiKws = ['ai','ml','dl','llm','nlp','cv','agent','robot','robots','robotics','vision','language',
  'neural','learning','generative','prompt','chatbot','deep-learning','machine-learning','transformer','gpt',
  'diffusion','rag','embedding','inference','fine-tuning','llmops','mlops','model-serving','vector-search',
  'semantic-search','knowledge-graph','multimodal','speech','text-to-speech','image-generation',
  'video-generation','code-generation','autonomous','embodied-ai','world-models','foundation-models',
  'large-language-models','retrieval-augmented','instruction-tuning','rlhf','alignment'];

function isAI(t) { const l=t.toLowerCase(); return aiKws.some(k=>l===k||l.includes(k)||l.includes(k.replace(/-/g,''))); }
function desc(t) { return `（自动发现）${t}`; }

// Fetch via curl with Authorization header
function fetchRepo(repo) {
  try {
    const cmd = `curl -sS -H "Authorization: Bearer ${TOKEN}" -H "Accept: application/vnd.github+json" "https://api.github.com/repos/${repo}"`;
    const raw = execSync(cmd, { encoding:'utf8', timeout:15000 });
    const data = JSON.parse(raw);
    if (data.message === 'Not Found') return null;
    return data;
  } catch(e) { return null; }
}

const results = [];
const allTopics = new Map();
const errors = [];

for (let i = 0; i < repoList.length; i++) {
  const repo = repoList[i];
  console.log(`[${i+1}/${repoList.length}] ${repo}`);
  let data = fetchRepo(repo);
  if (!data) { errors.push(repo); continue; }
  if (data.message?.includes('rate limit')) {
    console.log('  Rate limited, sleep 60s');
    execSync('sleep 60');
    data = fetchRepo(repo);
    if (!data) { errors.push(repo); continue; }
  }
  results.push({ repo, stars:data.stargazers_count, pushed:data.pushed_at, forks:data.forks_count, lang:data.language, topics:data.topics||[] });
  console.log(`  ⭐${data.stargazers_count} 🍴${data.forks_count} 📅${data.pushed_at?.split('T')[0]||'?'} 🗣${data.language||'?'}`);
  for (const t of (data.topics||[])) {
    const n = t.toLowerCase().replace(/\s+/g,'-');
    if (!allTopics.has(n)) allTopics.set(n, {count:0,repos:[],max:0});
    const e = allTopics.get(n); e.count++; if (!e.repos.includes(repo)) e.repos.push(repo); if (data.stargazers_count>e.max) e.max=data.stargazers_count;
  }
  if (i < repoList.length-1) execSync('sleep 1');
}

const newTopics = [];
for (const [topic, info] of allTopics) {
  if (existingTopics.has(topic) || !isAI(topic)) continue;
  if (info.count===1 && info.max<1000) continue;
  const ms = info.count>=3?2000:info.count>=2?3000:5000;
  newTopics.push({topic,url:`https://github.com/topics/${topic}`,minStars:ms,description:desc(topic),count:info.count});
}

const output = {results, newTopics, errors};
writeFileSync(join(__dirname,'github-fetch-result.json'), JSON.stringify(output, null, 2));
console.log(`\n✅ ${results.length}/${repoList.length} fetched | ${newTopics.length} new topics | ${errors.length} errors`);
