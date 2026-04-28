import { readFileSync, writeFileSync } from 'fs';
import { execSync } from 'child_process';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

const GITHUB_TOKEN = readFileSync(join(root, '.env.local'), 'utf8')
  .match(/GITHUB_TOKEN=(.+)/)?.[1]?.trim();
if (!GITHUB_TOKEN) throw new Error('No GITHUB_TOKEN');

// Load existing topics
const aiTopics = JSON.parse(readFileSync(join(root, 'data/ai-topics.json'), 'utf8'));
const existingTopics = new Set(aiTopics.topics.map(t => t.topic.toLowerCase()));

// Parse tools.ts - extract tools with GitHub URLs
const toolsContent = readFileSync(join(root, 'src/data/tools.ts'), 'utf8');
const tools = [];
let m;
const urlRe = /url:\s*"https:\/\/github\.com\/([^"]+)"/g;
while ((m = urlRe.exec(toolsContent)) !== null) {
  const idx = m.index;
  const ownerRepo = m[1];
  const before = toolsContent.slice(0, idx);
  const nameMatch = before.match(/name:\s*"([^"]+)"/g)?.pop()?.match(/name:\s*"([^"]+)"/);
  const after = toolsContent.slice(idx, idx + 3000);
  const stars = after.match(/githubStars:\s*(\d+)/);
  const forks = after.match(/forks:\s*(\d+)/);
  const lang = after.match(/language:\s*"([^"]+)"/);
  tools.push({
    name: nameMatch?.[1] || 'unknown',
    ownerRepo,
    githubStars: stars ? parseInt(stars[1]) : null,
    forks: forks ? parseInt(forks[1]) : null,
    language: lang?.[1] || null,
  });
}

// Deduplicate repos
const repoMap = new Map();
for (const t of tools) {
  if (!repoMap.has(t.ownerRepo)) repoMap.set(t.ownerRepo, []);
  repoMap.get(t.ownerRepo).push(t);
}
const uniqueRepos = [...repoMap.keys()];
console.log(`${tools.length} tools, ${uniqueRepos.length} unique repos`);

// AI topic keywords
const aiKeywords = [
  'ai','ml','dl','llm','nlp','cv','agent','robot','robots','robotics',
  'vision','language','neural','learning','generative','prompt','chatbot',
  'deep-learning','machine-learning','transformer','gpt','diffusion','rag',
  'embedding','inference','fine-tuning','llmops','mlops','model-serving',
  'vector-search','semantic-search','knowledge-graph','multimodal','speech',
  'text-to-speech','image-generation','video-generation','code-generation',
  'autonomous','embodied-ai','world-models','foundation-models',
  'large-language-models','retrieval-augmented','instruction-tuning','rlhf',
  'alignment'
];

function isAITopic(topic) {
  const t = topic.toLowerCase();
  return aiKeywords.some(kw => {
    if (t === kw) return true;
    return t.split(/[-_\s]+/).includes(kw);
  });
}

// Fetch using curl with Authorization header
const results = [];
const allTopics = new Map();

for (let i = 0; i < uniqueRepos.length; i++) {
  const repo = uniqueRepos[i];
  try {
    const cmd = `curl -s -w '\n%{http_code}' -H "Authorization: Bearer ${GITHUB_TOKEN}" -H "Accept: application/vnd.github+json" "https://api.github.com/repos/${repo}"`;
    const output = execSync(cmd, { timeout: 15000, encoding: 'utf8' });
    const lines = output.trim().split('\n');
    const httpCode = parseInt(lines.pop());
    const data = JSON.parse(lines.join('\n'));
    
    if (httpCode !== 200) {
      console.log(`[${i+1}/${uniqueRepos.length}] ${repo}: HTTP ${httpCode} ${data.message||''}`);
      continue;
    }
    
    const newStars = data.stargazers_count;
    const pushedAt = data.pushed_at?.split('T')[0] || null;
    const newForks = data.forks_count || 0;
    const newLang = data.language || null;
    const topics = data.topics || [];
    
    // Update all tools pointing to this repo
    for (const tool of repoMap.get(repo)) {
      const starsChanged = tool.githubStars !== null && newStars !== tool.githubStars;
      const forksChanged = tool.forks !== null && newForks !== tool.forks;
      const langChanged = tool.language && newLang && tool.language !== newLang;
      
      results.push({
        name: tool.name, repo,
        oldStars: tool.githubStars, newStars, starsChanged,
        oldForks: tool.forks, newForks, forksChanged,
        oldLang: tool.language, newLang, langChanged,
        pushedAt, topics
      });
      
      if (starsChanged) {
        const diff = newStars - tool.githubStars;
        console.log(`  ⭐ ${tool.name}: ${tool.githubStars} → ${newStars} (${diff>0?'+':''}${diff})`);
      }
    }
    
    // Collect topics
    for (const topic of topics) {
      const norm = topic.toLowerCase().replace(/\s+/g, '-');
      if (!allTopics.has(norm)) allTopics.set(norm, { count: 0, repos: [] });
      allTopics.get(norm).count++;
      if (!allTopics.get(norm).repos.includes(repo)) allTopics.get(norm).repos.push(repo);
    }
    
    if ((i+1) % 20 === 0) console.log(`  Progress: ${i+1}/${uniqueRepos.length}`);
    
    // Rate limit: 1s
    if (i < uniqueRepos.length - 1) await new Promise(r => setTimeout(r, 1000));
  } catch (err) {
    console.log(`  ❌ ${repo}: ${err.message}`);
    await new Promise(r => setTimeout(r, 3000));
  }
}

// Summary
const starChanges = results.filter(r => r.starsChanged);
const forkChanges = results.filter(r => r.forksChanged);
const langChanges = results.filter(r => r.langChanged);
console.log(`\n=== Summary ===`);
console.log(`Scanned: ${results.length}/${uniqueRepos.length} repos`);
console.log(`Stars updated: ${starChanges.length}`);
console.log(`Forks updated: ${forkChanges.length}`);
console.log(`Languages updated: ${langChanges.length}`);

if (starChanges.length > 0) {
  const top = [...starChanges].sort((a,b) => Math.abs(b.newStars-b.oldStars) - Math.abs(a.newStars-a.oldStars)).slice(0, 5);
  console.log('\nBiggest changes:');
  for (const r of top) console.log(`  ${r.name}: ${r.oldStars} → ${r.newStars} (${r.newStars-r.oldStars>0?'+':''}${r.newStars-r.oldStars})`);
}

const oldest = results.filter(r=>r.pushedAt).sort((a,b)=>a.pushedAt.localeCompare(b.pushedAt))[0];
if (oldest) {
  const days = Math.floor((Date.now()-new Date(oldest.pushedAt))/86400000);
  console.log(`\nOldest: ${oldest.name} (${oldest.pushedAt}, ${days}d ago)`);
}

// New AI topics
const newTopics = [];
for (const [topic, info] of allTopics) {
  if (existingTopics.has(topic)) continue;
  if (!isAITopic(topic)) continue;
  if (info.count === 1) {
    const maxStars = info.repos.map(r => results.find(x=>x.repo===r)?.newStars||0).reduce((a,b)=>Math.max(a,b),0);
    if (maxStars < 1000) continue;
  }
  const minStars = info.count >= 3 ? 2000 : info.count >= 2 ? 3000 : 5000;
  newTopics.push({ topic, url:`https://github.com/topics/${topic}`, minStars,
    description:`（自动发现）${topic.replace(/-/g,' ')}（${info.count} 个仓库使用）` });
}

console.log(`\nNew AI Topics: ${newTopics.length}`);
for (const t of newTopics.slice(0, 15)) console.log(`  + ${t.topic} — ${t.description}`);
if (newTopics.length > 15) console.log(`  ... +${newTopics.length-15} more`);

// Save results for later steps
writeFileSync(join(root, 'scripts/update-results.json'), JSON.stringify({
  starChanges: starChanges.map(r=>({name:r.name,old:r.oldStars,new:r.newStars,diff:r.newStars-r.oldStars})),
  forkChanges: forkChanges.length, langChanges: langChanges.length,
  oldestUpdate: oldest ? {name:oldest.name, date:oldest.pushedAt, daysAgo:Math.floor((Date.now()-new Date(oldest.pushedAt))/86400000)} : null,
  newTopics,
  existingTopicsCount: aiTopics.topics.length,
  newTopicsCount: newTopics.length,
  totalTopicsAfter: aiTopics.topics.length + newTopics.length,
  results
}, null, 2));
console.log('\nSaved to scripts/update-results.json');
