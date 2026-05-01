#!/usr/bin/env node
/**
 * Update GitHub stars, forks, language, updatedAt for tools.
 * Discover new AI topics from repository topics.
 */
const fs = require('fs');
const path = require('path');

const GITHUB_TOKEN = process.argv[2];
if (!GITHUB_TOKEN) { console.error('Need GITHUB_TOKEN'); process.exit(1); }

const TOOLS_FILE = path.resolve('src/data/tools.ts');
const TOPICS_FILE = path.resolve('data/ai-topics.json');
const toolsContent = fs.readFileSync(TOOLS_FILE, 'utf-8');

// Extract all GitHub repos from url fields
const repoSet = new Map(); // repo -> {ids: [], indices: []}
const urlRe = /url:\s*"(https:\/\/github\.com\/[^"]+)"/g;
let m;
while ((m = urlRe.exec(toolsContent)) !== null) {
  const url = m[1];
  const parts = url.replace('https://github.com/', '').split('/');
  if (parts.length >= 2) {
    const repo = parts[0] + '/' + parts[1];
    if (!repoSet.has(repo)) repoSet.set(repo, []);
    repoSet.get(repo).push(m.index);
  }
}

const repos = [...repoSet.keys()];
console.log(`Found ${repos.length} GitHub repos`);

// AI keywords
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

// Load existing topics
const topicsData = JSON.parse(fs.readFileSync(TOPICS_FILE, 'utf-8'));
const existingTopics = new Set(topicsData.topics.map(t => t.topic.toLowerCase()));

// Fetch all repos
const sleep = ms => new Promise(r => setTimeout(r, ms));
const results = [];
const topicUsage = {};

for (let i = 0; i < repos.length; i++) {
  const repo = repos[i];
  try {
    const res = await fetch(`https://api.github.com/repos/${repo}`, {
      headers: {
        'Authorization': `token ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'ai-master-site'
      }
    });
    if (res.status === 403) {
      console.log(`  [403] Rate limited on ${repo}`);
      await sleep(5000);
      continue;
    }
    if (!res.ok) { console.log(`  [${res.status}] ${repo}`); await sleep(1000); continue; }
    const data = await res.json();
    const stars = data.stargazers_count || 0;
    const forks = data.forks_count || 0;
    const language = data.language || null;
    const pushedAt = data.pushed_at ? data.pushed_at.split('T')[0] : null;
    const topics = (data.topics || []).map(t => t.toLowerCase());

    topics.forEach(t => { topicUsage[t] = (topicUsage[t] || 0) + 1; });

    results.push({ repo, stars, forks, language, pushedAt, topics });
    console.log(`  ✓ ${repo} → ${stars}★, ${forks} forks, ${language||'N/A'}, pushed:${pushedAt||'N/A'}`);
  } catch(e) {
    console.log(`  ✗ ${repo} - ${e.message}`);
  }
  if (i < repos.length - 1) await sleep(1000);
}

// Track changes
let starsChanged = [];
let forksChanged = [];
let langChanged = [];
let needsUpdate = false;

let newContent = toolsContent;

for (const r of results) {
  // Update githubStars
  const starsRe = new RegExp(`(url:\\s*"https://github\\.com/${r.repo.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"[\\s\\S]*?githubStars:\\s*)(\\d+)`);
  const starsMatch = starsRe.exec(newContent);
  if (starsMatch && parseInt(starsMatch[2]) !== r.stars) {
    const oldVal = parseInt(starsMatch[2]);
    const oldPos = starsMatch.index + starsMatch[1].length;
    const before = newContent.substring(0, oldPos);
    const after = newContent.substring(oldPos + starsMatch[2].length);
    newContent = before + r.stars + after;
    starsChanged.push({ repo: r.repo, old: oldVal, new: r.stars, delta: r.stars - oldVal });
  }

  // Update or add forks
  const blockStart = newContent.indexOf(`url: "https://github.com/${r.repo}"`);
  if (blockStart === -1) continue;

  // Find the end of this tool object
  let braceCount = 0, objStart = -1;
  for (let j = blockStart; j >= 0; j--) {
    if (newContent[j] === '}') braceCount++;
    if (newContent[j] === '{') { braceCount--; if (braceCount === 0) { objStart = j; break; } }
  }
  let braceCount2 = 0, objEnd = -1;
  for (let j = objStart; j < newContent.length; j++) {
    if (newContent[j] === '{') braceCount2++;
    if (newContent[j] === '}') { braceCount2--; if (braceCount2 === 0) { objEnd = j; break; } }
  }
  const block = newContent.substring(objStart, objEnd + 1);

  // Check forks
  const forksInBlock = block.match(/forks:\s*(\d+)/);
  if (!forksInBlock) {
    // Add forks field - find where to insert (after githubStars)
    const insertAfter = block.match(/githubStars:\s*\d+/);
    if (insertAfter) {
      const absPos = objStart + insertAfter.index + insertAfter[0].length;
      const indent = '\n    ';
      newContent = newContent.substring(0, absPos) + `,${indent}forks: ${r.forks}` + newContent.substring(absPos);
      forksChanged.push({ repo: r.repo, old: null, new: r.forks });
    }
  } else if (parseInt(forksInBlock[1]) !== r.forks) {
    const forksAbsPos = objStart + block.indexOf('forks:') + 'forks:'.length;
    const numMatch = newContent.substring(forksAbsPos).match(/\s*(\d+)/);
    if (numMatch) {
      const oldForks = parseInt(numMatch[1]);
      const replaceStart = forksAbsPos;
      const replaceEnd = replaceStart + numMatch[0].length;
      newContent = newContent.substring(0, replaceStart) + ` ${r.forks}` + newContent.substring(replaceEnd);
      forksChanged.push({ repo: r.repo, old: oldForks, new: r.forks });
    }
  }

  // Check language
  const langInBlock = block.match(/language:\s*"([^"]*)"/);
  if (!langInBlock && r.language) {
    // Add language field
    const insertPoint = block.match(/(githubStars:\s*\d+,?)/);
    if (insertPoint) {
      const absPos = objStart + insertPoint.index + insertPoint[1].length;
      const indent = '\n    ';
      newContent = newContent.substring(0, absPos) + `${indent}language: "${r.language}"` + newContent.substring(absPos);
      langChanged.push({ repo: r.repo, old: null, new: r.language });
    }
  } else if (langInBlock && langInBlock[1] !== r.language && r.language) {
    const langAbsPos = objStart + block.indexOf('language:');
    const valMatch = newContent.substring(langAbsPos).match(/language:\s*"([^"]*)"/);
    if (valMatch) {
      const oldLang = valMatch[1];
      const replaceStart = langAbsPos + 'language: "'.length;
      const replaceEnd = replaceStart + valMatch[1].length;
      newContent = newContent.substring(0, replaceStart) + r.language + newContent.substring(replaceEnd);
      langChanged.push({ repo: r.repo, old: oldLang, new: r.language });
    }
  }

  // Update updatedAt (pushed_at)
  if (r.pushedAt) {
    const upRe = new RegExp(`(url:\\s*"https://github\\.com/${r.repo.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"[\\s\\S]*?updatedAt:\\s*")([^"]*)"`);
    const upMatch = upRe.exec(newContent);
    if (upMatch && upMatch[2] !== r.pushedAt) {
      const replaceStart = upMatch.index + upMatch[1].length;
      const replaceEnd = replaceStart + upMatch[2].length;
      newContent = newContent.substring(0, replaceStart) + r.pushedAt + newContent.substring(replaceEnd);
    }
  }
}

// Write updated tools.ts
if (newContent !== toolsContent) {
  fs.writeFileSync(TOOLS_FILE, newContent);
  needsUpdate = true;
  console.log(`\n✏️  tools.ts updated`);
} else {
  console.log(`\n✅ tools.ts no changes needed`);
}

// Discover new topics
const allTopics = [...new Set(Object.keys(topicUsage))];
const newTopics = [];

for (const topic of allTopics) {
  if (existingTopics.has(topic)) continue;
  if (!isAiRelated(topic)) continue;
  const count = topicUsage[topic] || 1;
  const maxStarsForTopic = results
    .filter(r => r.topics.includes(topic))
    .map(r => r.stars)
    .reduce((max, s) => Math.max(max, s), 0);
  if (count <= 1 && maxStarsForTopic < 1000) continue;

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
  fs.writeFileSync(TOPICS_FILE, JSON.stringify(topicsData, null, 2));
  console.log(`📝 Added ${newTopics.length} new topics to ai-topics.json`);
  newTopics.forEach(t => console.log(`    ${t.topic} — ${t.description}`));
} else {
  console.log(`✅ No new topics to add`);
}

// Save summary
const summary = {
  reposScanned: repos.length,
  starsChanged,
  forksChanged,
  langChanged,
  newTopics,
  stats: {
    reposScanned: repos.length,
    starsUpdated: starsChanged.length,
    forksUpdated: forksChanged.length,
    langUpdated: langChanged.length,
    newTopicsCount: newTopics.length,
  }
};
fs.writeFileSync('/tmp/github-update-summary.json', JSON.stringify(summary, null, 2));

console.log(`\n=== Summary ===`);
console.log(`Repos scanned: ${repos.length}`);
console.log(`Stars updated: ${starsChanged.length}`);
console.log(`Forks updated: ${forksChanged.length}`);
console.log(`Language updated: ${langChanged.length}`);
console.log(`New topics: ${newTopics.length}`);
