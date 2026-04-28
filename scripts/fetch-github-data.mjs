import { readFileSync, writeFileSync } from 'fs';
import { execSync } from 'child_process';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

// Load token
const envLocal = readFileSync(join(root, '.env.local'), 'utf8');
const GITHUB_TOKEN = envLocal.match(/GITHUB_TOKEN=(.+)/)?.[1]?.trim();
if (!GITHUB_TOKEN) { throw new Error('GITHUB_TOKEN not found'); }

// Load existing topics
const aiTopics = JSON.parse(readFileSync(join(root, 'data/ai-topics.json'), 'utf8'));
const existingTopics = new Set(aiTopics.topics.map(t => t.topic.toLowerCase()));

// Parse tools.ts
const toolsContent = readFileSync(join(root, 'src/data/tools.ts'), 'utf8');

// Extract tools with their GitHub URLs
const urlRegex = /url:\s*"https:\/\/github\.com\/([^"]+)"/g;
const nameRegex = /name:\s*"([^"]+)"/g;
const allNames = [...toolsContent.matchAll(nameRegex)];

const tools = [];
const seenRepos = new Set();
for (const urlMatch of toolsContent.matchAll(urlRegex)) {
  const ownerRepo = urlMatch[1];
  const urlIndex = urlMatch.index;
  
  // Find nearest preceding name
  let nearestName = null;
  for (const nm of allNames) {
    if (nm.index < urlIndex) nearestName = nm[1];
    else break;
  }
  
  // Find existing stars/forks/language after the URL
  const afterUrl = toolsContent.slice(urlIndex, urlIndex + 3000);
  const existingStars = afterUrl.match(/githubStars:\s*(\d+)/)?.[1];
  const existingForks = afterUrl.match(/forks:\s*(\d+)/)?.[1];
  const existingLanguage = afterUrl.match(/language:\s*"([^"]+)"/)?.[1];
  
  if (!seenRepos.has(ownerRepo)) {
    seenRepos.add(ownerRepo);
    tools.push({
      ownerRepo,
      name: nearestName || ownerRepo,
      githubStars: existingStars ? parseInt(existingStars) : null,
      forks: existingForks ? parseInt(existingForks) : null,
      language: existingLanguage || null,
    });
  }
}

console.log(`Found ${tools.length} unique GitHub repos`);

// AI Topic keywords
const aiKeywords = [
  'ai', 'ml', 'dl', 'llm', 'nlp', 'cv', 'agent', 'robot', 'robots', 'robotics',
  'vision', 'language', 'neural', 'learning', 'generative', 'prompt', 'chatbot',
  'deep-learning', 'machine-learning', 'transformer', 'gpt', 'diffusion', 'rag',
  'embedding', 'inference', 'fine-tuning', 'llmops', 'mlops', 'model-serving',
  'vector-search', 'semantic-search', 'knowledge-graph', 'multimodal', 'speech',
  'text-to-speech', 'image-generation', 'video-generation', 'code-generation',
  'autonomous', 'embodied-ai', 'world-models', 'foundation-models',
  'large-language-models', 'retrieval-augmented', 'instruction-tuning', 'rlhf',
  'alignment'
];

function isAITopic(topic) {
  const t = topic.toLowerCase();
  // Direct match
  if (aiKeywords.includes(t)) return true;
  // Component match (topic is hyphen-separated)
  const parts = t.split(/[-_\s]+/);
  return aiKeywords.some(kw => parts.includes(kw));
}

// Fetch with curl using Authorization header
const results = [];
const allTopics = new Map();

for (let i = 0; i < tools.length; i++) {
  const tool = tools[i];
  const cmd = `curl -s -H "Authorization: token ${GITHUB_TOKEN}" -H "Accept: application/vnd.github+json" "https://api.github.com/repos/${tool.ownerRepo}"`;
  
  try {
    const raw = execSync(cmd, { timeout: 15000, encoding: 'utf8' });
    const data = JSON.parse(raw);
    
    if (data.message && (data.message.includes('API rate limit') || data.message.includes('Not Found'))) {
      console.log(`⚠️  ${tool.name}: ${data.message}`);
      continue;
    }
    
    const newStars = data.stargazers_count;
    const pushedAt = data.pushed_at ? data.pushed_at.split('T')[0] : null;
    const forksCount = data.forks_count || 0;
    const language = data.language || null;
    const topics = data.topics || [];
    
    const starsChanged = tool.githubStars !== null && newStars !== tool.githubStars;
    const forksChanged = tool.forks !== forksCount;
    const langChanged = !tool.language && language ? true : (tool.language && language && tool.language.toLowerCase() !== language.toLowerCase());
    
    results.push({
      name: tool.name,
      ownerRepo: tool.ownerRepo,
      oldStars: tool.githubStars,
      newStars,
      starsChanged,
      oldForks: tool.forks,
      newForks: forksCount,
      forksChanged,
      oldLanguage: tool.language,
      newLanguage: language,
      langChanged: !!langChanged,
      pushedAt,
      topics
    });
    
    // Collect topics
    for (const topic of topics) {
      const normalized = topic.toLowerCase().replace(/\s+/g, '-');
      if (!allTopics.has(normalized)) {
        allTopics.set(normalized, { count: 0, repos: [] });
      }
      const entry = allTopics.get(normalized);
      entry.count++;
      if (!entry.repos.includes(tool.name)) entry.repos.push(tool.name);
    }
    
    if (starsChanged) {
      const diff = newStars - (tool.githubStars || 0);
      console.log(`⭐ ${tool.name}: ${tool.githubStars} → ${newStars} (${diff > 0 ? '+' : ''}${diff})`);
    }
    
    // Rate limit: 800ms
    if (i < tools.length - 1) await new Promise(r => setTimeout(r, 800));
  } catch (err) {
    console.log(`❌ ${tool.name}: ${err.message}`);
    await new Promise(r => setTimeout(r, 2000));
  }
}

// Summary
const updated = results.filter(r => r.starsChanged);
const forksUpdated = results.filter(r => r.forksChanged);
const langUpdated = results.filter(r => r.langChanged);

console.log(`\n=== Summary ===`);
console.log(`Scanned: ${results.length}/${tools.length}`);
console.log(`Stars updated: ${updated.length}`);
console.log(`Forks updated: ${forksUpdated.length}`);
console.log(`Languages updated: ${langUpdated.length}`);

if (updated.length > 0) {
  const sorted = [...updated].sort((a, b) => Math.abs(b.newStars - b.oldStars) - Math.abs(a.newStars - a.oldStars));
  console.log('\nBiggest changes:');
  for (const r of sorted.slice(0, 5)) {
    const diff = r.newStars - r.oldStars;
    console.log(`  ${r.name}: ${r.oldStars} → ${r.newStars} (${diff > 0 ? '+' : ''}${diff})`);
  }
}

// Find oldest updated tool
const now = new Date();
const sortedByDate = [...results].filter(r => r.pushedAt).sort((a, b) => a.pushedAt.localeCompare(b.pushedAt));
if (sortedByDate.length > 0) {
  const oldest = sortedByDate[0];
  const daysAgo = Math.floor((now - new Date(oldest.pushedAt)) / (1000*60*60*24));
  console.log(`\nLast updated longest ago: ${oldest.name} (${oldest.pushedAt}, ${daysAgo} days)`);
}

// Find new AI topics
const newTopics = [];
for (const [topic, info] of allTopics) {
  if (existingTopics.has(topic)) continue;
  if (!isAITopic(topic)) continue;
  if (info.count === 1) {
    const maxRepoStars = info.repos.map(rn => {
      const res = results.find(r => r.name === rn);
      return res ? res.newStars : 0;
    }).reduce((a, b) => Math.max(a, b), 0);
    if (maxRepoStars < 1000) continue;
  }
  const minStars = info.count >= 3 ? 2000 : info.count >= 2 ? 3000 : 5000;
  newTopics.push({
    topic,
    url: `https://github.com/topics/${topic}`,
    minStars,
    description: `（自动发现）${topic}（${info.count} 个仓库使用：${info.repos.slice(0, 3).join('、')}）`
  });
}

console.log(`\nNew AI Topics found: ${newTopics.length}`);
for (const t of newTopics.slice(0, 20)) {
  console.log(`  + ${t.topic} — ${t.description}`);
}
if (newTopics.length > 20) console.log(`  ... and ${newTopics.length - 20} more`);

// Save report
const report = {
  totalScanned: results.length,
  totalTools: tools.length,
  starsUpdated: updated.length,
  forksUpdated: forksUpdated.length,
  langUpdated: langUpdated.length,
  biggestChanges: [...updated].sort((a, b) => Math.abs(b.newStars - b.oldStars) - Math.abs(a.newStars - a.oldStars)).slice(0, 5).map(r => ({
    name: r.name, old: r.oldStars, new: r.newStars, diff: r.newStars - r.oldStars
  })),
  oldestUpdate: sortedByDate.length > 0 ? { name: sortedByDate[0].name, date: sortedByDate[0].pushedAt, daysAgo: Math.floor((now - new Date(sortedByDate[0].pushedAt)) / (1000*60*60*24)) } : null,
  newTopics,
  existingTopicsCount: aiTopics.topics.length,
  allTopicsCount: allTopics.size,
  results: results.map(r => ({
    name: r.name, ownerRepo: r.ownerRepo, oldStars: r.oldStars, newStars: r.newStars,
    starsChanged: r.starsChanged, oldForks: r.oldForks, newForks: r.newForks,
    forksChanged: r.forksChanged, oldLanguage: r.oldLanguage, newLanguage: r.newLanguage,
    langChanged: r.langChanged, pushedAt: r.pushedAt, topics: r.topics
  }))
};

writeFileSync(join(root, 'scripts/update-results.json'), JSON.stringify(report, null, 2));
console.log('\nResults saved to scripts/update-results.json');
