import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const BASE = '/Users/xueshuai/.openclaw/workspace/ai-master-site';

// 1. Read tools.ts
const toolsContent = readFileSync(join(BASE, 'src/data/tools.ts'), 'utf-8');

// Extract tool blocks - each starts with { and ends with }
// We need id, url (github), githubStars for each tool
const lines = toolsContent.split('\n');
const tools = [];
let currentTool = null;
let braceDepth = 0;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  
  for (const ch of line) {
    if (ch === '{') {
      braceDepth++;
      if (braceDepth === 1 && toolsContent.substring(Math.max(0, toolsContent.indexOf('tools: Tool[] = [', i*50)), i*50).includes('tools: Tool')) {
        // We're in the tools array
      }
    } else if (ch === '}') {
      braceDepth--;
    }
  }
}

// Simpler approach: use regex to find each tool's key fields
// Find all id fields
const idMatches = [...toolsContent.matchAll(/id:\s*"([^"]+)"/g)];
const urlMatches = [...toolsContent.matchAll(/url:\s*"https:\/\/github\.com\/([^"]+)"/g)];
const starsMatches = [...toolsContent.matchAll(/githubStars:\s*(\d+)/g)];

// For each tool, find its id, url, and stars by proximity
const repoTools = [];
const seenUrls = new Set();

for (const idMatch of idMatches) {
  const idPos = idMatch.index;
  const id = idMatch[1];
  
  // Find the nearest url and githubStars after this id
  let bestUrl = null;
  let bestUrlPos = Infinity;
  for (const urlMatch of urlMatches) {
    if (urlMatch.index > idPos && urlMatch.index < idPos + 3000) {
      if (urlMatch.index < bestUrlPos) {
        bestUrl = urlMatch[1];
        bestUrlPos = urlMatch.index;
      }
    }
  }
  
  let bestStars = null;
  let bestStarsPos = Infinity;
  for (const starsMatch of starsMatches) {
    if (starsMatch.index > idPos && starsMatch.index < idPos + 3000) {
      if (starsMatch.index < bestStarsPos) {
        bestStars = parseInt(starsMatch[1]);
        bestStarsPos = starsMatch.index;
      }
    }
  }
  
  if (bestUrl && !seenUrls.has(bestUrl) && bestStars !== null) {
    seenUrls.add(bestUrl);
    // Filter out non-repo URLs
    if (bestUrl.includes('/')) {
      repoTools.push({ id, repoPath: bestUrl, stars: bestStars, starsPos: bestStarsPos });
    }
  }
}

console.log(`Found ${repoTools.length} tools with GitHub repos`);

// 2. Read existing topics
const topicsData = JSON.parse(readFileSync(join(BASE, 'data/ai-topics.json'), 'utf-8'));
const existingTopics = new Set(topicsData.topics.map(t => t.topic.toLowerCase()));

// 3. Fetch GitHub API
const allDiscoveredTopics = new Map();
const results = [];

async function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function fetchRepo(repoPath) {
  const url = `https://api.github.com/repos/${repoPath}`;
  try {
    const resp = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'ai-master-site-bot'
      }
    });
    if (resp.status === 404) return { notFound: true };
    if (!resp.ok) {
      console.error(`  ❌ ${repoPath}: ${resp.status}`);
      return null;
    }
    return await resp.json();
  } catch (e) {
    console.error(`  ❌ ${repoPath}: ${e.message}`);
    return null;
  }
}

for (let i = 0; i < repoTools.length; i++) {
  const tool = repoTools[i];
  if (i % 20 === 0) console.log(`\n[${i + 1}/${repoTools.length}] Fetching...`);
  
  const data = await fetchRepo(tool.repoPath);
  if (!data) continue;
  if (data.notFound) {
    console.log(`  ⚠️  Not found: ${tool.repoPath}`);
    continue;
  }
  
  const newStars = data.stargazers_count;
  const newForks = data.forks_count;
  const newLanguage = data.language;
  const pushedAt = data.pushed_at ? data.pushed_at.split('T')[0] : null;
  const repoTopics = data.topics || [];
  
  const changed = newStars !== tool.stars;
  results.push({
    ...tool,
    newStars, newForks, newLanguage, pushedAt, repoTopics, changed,
    delta: newStars - tool.stars
  });
  
  // Collect topics
  for (const t of repoTopics) {
    const normalized = t.toLowerCase().replace(/\s+/g, '-');
    if (!allDiscoveredTopics.has(normalized)) {
      allDiscoveredTopics.set(normalized, { count: 0, maxStars: 0, name: t });
    }
    const entry = allDiscoveredTopics.get(normalized);
    entry.count++;
    entry.maxStars = Math.max(entry.maxStars, newStars);
  }
  
  if (changed) {
    const sign = newStars > tool.stars ? '↑' : '↓';
    console.log(`  ${sign} ${tool.id}: ${tool.stars.toLocaleString()} → ${newStars.toLocaleString()} (${tool.delta >= 0 ? '+' : ''}${tool.delta})`);
  }
  
  await sleep(1200);
}

// 4. Update tools.ts by replacing star values at exact positions
const sortedResults = [...results].filter(r => r.changed).sort((a, b) => b.starsPos - a.starsPos);

if (sortedResults.length > 0) {
  let updated = toolsContent;
  for (const r of sortedResults) {
    // Find the exact githubStars value at the position and replace it
    // We need to be careful to only replace the value, not the key
    const searchStr = `githubStars: ${r.stars}`;
    const pos = updated.indexOf(searchStr, r.starsPos - 50);
    if (pos !== -1) {
      updated = updated.substring(0, pos) + `githubStars: ${r.newStars}` + updated.substring(pos + searchStr.length);
    }
  }
  writeFileSync(join(BASE, 'src/data/tools.ts'), updated);
  console.log(`\n✅ Updated ${sortedResults.length} tools in tools.ts`);
} else {
  console.log('\n⏭️  No star changes');
}

// 5. Find new AI topics
const aiKeywords = ['ai', 'ml', 'dl', 'llm', 'nlp', 'cv', 'agent', 'robot', 'robots', 'robotics',
  'vision', 'neural', 'learning', 'generative', 'prompt', 'chatbot', 'deep-learning',
  'machine-learning', 'transformer', 'gpt', 'diffusion', 'rag', 'embedding', 'inference',
  'fine-tuning', 'llmops', 'mlops', 'model-serving', 'vector-search', 'semantic-search',
  'knowledge-graph', 'multimodal', 'speech', 'text-to-speech', 'image-generation',
  'video-generation', 'code-generation', 'autonomous', 'embodied-ai', 'world-models',
  'foundation-models', 'large-language-model', 'retrieval-augmented', 'instruction-tuning',
  'rlhf', 'alignment'];

const newTopics = [];
for (const [topic, info] of allDiscoveredTopics) {
  if (existingTopics.has(topic)) continue;
  
  const isAI = aiKeywords.some(kw => topic.includes(kw));
  if (!isAI) continue;
  
  if (info.count === 1 && info.maxStars < 1000) continue;
  
  let minStars = 5000;
  if (info.count >= 3) minStars = 2000;
  else if (info.count >= 2) minStars = 3000;
  
  const desc = topic.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  
  newTopics.push({
    topic,
    url: `https://github.com/topics/${topic}`,
    minStars,
    description: `（自动发现）${desc}`
  });
}

if (newTopics.length > 0) {
  topicsData.topics.push(...newTopics);
  topicsData.lastUpdated = new Date().toISOString();
  writeFileSync(join(BASE, 'data/ai-topics.json'), JSON.stringify(topicsData, null, 2));
  console.log(`\n🆕 Added ${newTopics.length} new AI topics to ai-topics.json`);
  for (const t of newTopics) {
    console.log(`  • ${t.topic} (${allDiscoveredTopics.get(t.topic)?.count} repos, minStars: ${t.minStars})`);
  }
} else {
  console.log('\n🆕 No new AI topics discovered');
}

// 6. Save summary
const changedResults = results.filter(r => r.changed);
const summary = {
  timestamp: new Date().toISOString(),
  totalRepos: results.length,
  starsChanged: changedResults.length,
  newTopics: newTopics.length,
  topChanges: changedResults
    .sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta))
    .slice(0, 10)
    .map(r => ({ id: r.id, old: r.stars, new: r.newStars, delta: r.delta })),
  allNewTopics: newTopics.map(t => ({
    topic: t.topic,
    repos: allDiscoveredTopics.get(t.topic)?.count || 0,
    description: t.description
  }))
};
writeFileSync(join(BASE, '.update-summary.json'), JSON.stringify(summary, null, 2));

console.log('\n=== Summary ===');
console.log(`Repos checked: ${results.length}`);
console.log(`Stars updated: ${changedResults.length}`);
console.log(`New topics: ${newTopics.length}`);
console.log('Done! ✅');
