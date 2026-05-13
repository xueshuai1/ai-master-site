#!/usr/bin/env node
import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');

// Load token
const envContent = readFileSync(join(rootDir, '.env.local'), 'utf-8');
const GITHUB_TOKEN = envContent.match(/GITHUB_TOKEN=(.+)/)?.[1]?.trim();
if (!GITHUB_TOKEN) {
  console.error('No GITHUB_TOKEN found');
  process.exit(1);
}

const AI_KEYWORDS = [
  'ai','ml','dl','llm','nlp','cv','agent','robot','robots','robotics','vision','language',
  'neural','learning','generative','prompt','chatbot','deep-learning','machine-learning',
  'transformer','gpt','diffusion','rag','embedding','inference','fine-tuning','llmops',
  'mlops','model-serving','vector-search','semantic-search','knowledge-graph','multimodal',
  'speech','text-to-speech','image-generation','video-generation','code-generation',
  'autonomous','embodied-ai','world-models','foundation-models','large-language-models',
  'retrieval-augmented','instruction-tuning','rlhf','alignment'
];

function isAITopic(topic) {
  const t = topic.toLowerCase();
  return AI_KEYWORDS.some(kw => t === kw || t.includes(kw) || kw.includes(t));
}

const toolsContent = readFileSync(join(rootDir, 'src/data/tools.ts'), 'utf-8');

// Extract GitHub repos
const urlRegex = /url:\s*"(https:\/\/github\.com\/[^"]+)"/g;
const repos = [];
let match;
while ((match = urlRegex.exec(toolsContent)) !== null) {
  const repo = match[1].replace('https://github.com/', '').trim();
  if (repo && !repos.includes(repo) && repo.split('/').length === 2) {
    repos.push(repo);
  }
}

const urlRegex2 = /url:\s*'(https:\/\/github\.com\/[^']+)'/g;
let match2;
while ((match2 = urlRegex2.exec(toolsContent)) !== null) {
  const repo = match2[1].replace('https://github.com/', '').trim();
  if (repo && !repos.includes(repo) && repo.split('/').length === 2) {
    repos.push(repo);
  }
}

console.log(`Found ${repos.length} GitHub repos`);

const topicsData = JSON.parse(readFileSync(join(rootDir, 'data/ai-topics.json'), 'utf-8'));
const existingTopics = new Set(topicsData.topics.map(t => t.topic.toLowerCase()));

const starChanges = [];
const allTopics = {};

async function fetchRepo(repo) {
  const url = `https://api.github.com/repos/${repo}`;
  try {
    const res = await fetch(url, {
      headers: {
        'Authorization': `token ${GITHUB_TOKEN}`,
        'User-Agent': 'ai-master-site-updater',
        'Accept': 'application/vnd.github.v3+json'
      }
    });
    if (res.status === 404) return { repo, error: 'not_found' };
    if (res.status === 403) {
      const reset = res.headers.get('x-ratelimit-reset');
      const wait = reset ? (parseInt(reset) - Math.floor(Date.now()/1000)) * 1000 + 1000 : 60000;
      console.log(`  ⏳ Rate limited, waiting ${Math.round(wait/1000)}s`);
      await sleep(wait);
      return fetchRepo(repo);
    }
    if (!res.ok) return { repo, error: `HTTP ${res.status}` };
    const data = await res.json();
    return {
      repo,
      stars: data.stargazers_count,
      pushed_at: data.pushed_at,
      forks: data.forks_count,
      language: data.language,
      topics: data.topics || []
    };
  } catch (e) {
    return { repo, error: e.message };
  }
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

let successCount = 0;
const repoDataMap = new Map();

for (let i = 0; i < repos.length; i++) {
  const result = await fetchRepo(repos[i]);
  
  if (result.error) {
    console.log(`  ❌ ${result.repo}: ${result.error}`);
  } else {
    repoDataMap.set(result.repo, result);
    successCount++;
    for (const topic of result.topics) {
      const normalized = topic.toLowerCase().replace(/\s+/g, '-');
      allTopics[normalized] = (allTopics[normalized] || 0) + 1;
    }
    console.log(`  ✅ ${result.repo} ⭐${result.stars} 🍴${result.forks} ${result.language || ''}`);
  }
  
  if (i < repos.length - 1) await sleep(1100);
}

console.log(`\nFetched ${successCount}/${repos.length} repos`);

// Update tools.ts
let updatedTools = toolsContent;
let starsUpdated = 0;
let forksUpdated = 0;
let langUpdated = 0;

// Find each tool's block and update
const idRegex = /id:\s*"([^"]+)"/g;
let idMatch;
const toolIds = [];
while ((idMatch = idRegex.exec(toolsContent)) !== null) {
  toolIds.push(idMatch[1]);
}

// For each tool, find its url and githubStars, then update
for (const id of toolIds) {
  // Find the tool's position in the file
  const idPattern = `id: "${id}"`;
  const idIdx = updatedTools.indexOf(idPattern);
  if (idIdx === -1) continue;
  
  // Find the url for this tool
  const searchEnd = Math.min(
    updatedTools.indexOf('  {\n', idIdx + 5),
    updatedTools.indexOf('];', idIdx + 5)
  );
  const block = updatedTools.substring(idIdx, searchEnd === -1 ? idIdx + 3000 : searchEnd);
  
  // Extract url
  const urlMatch = block.match(/url:\s*"(https:\/\/github\.com\/[^"]+)"/);
  if (!urlMatch) continue;
  const repo = urlMatch[1].replace('https://github.com/', '');
  
  const repoData = repoDataMap.get(repo);
  if (!repoData) continue;
  
  let blockModified = false;
  let newBlock = block;
  
  // Update githubStars
  const starsMatch = newBlock.match(/githubStars:\s*(\d+)/);
  if (starsMatch) {
    const oldStars = parseInt(starsMatch[1]);
    const newStars = repoData.stars;
    if (newStars !== oldStars) {
      starChanges.push({ id, old: oldStars, new: newStars, delta: newStars - oldStars });
      newBlock = newBlock.replace(/githubStars:\s*\d+/, `githubStars: ${newStars}`);
      starsUpdated++;
      blockModified = true;
    }
  }
  
  // Update/add forks
  const forksMatch = newBlock.match(/forks:\s*(\d+)/);
  if (repoData.forks != null) {
    if (forksMatch) {
      const oldForks = parseInt(forksMatch[1]);
      if (oldForks !== repoData.forks) {
        newBlock = newBlock.replace(/forks:\s*\d+/, `forks: ${repoData.forks}`);
        forksUpdated++;
        blockModified = true;
      }
    } else {
      // Add after githubStars
      newBlock = newBlock.replace(/(githubStars:\s*\d+)/, `$1,\n    forks: ${repoData.forks}`);
      forksUpdated++;
      blockModified = true;
    }
  }
  
  // Update/add language
  const langMatch = newBlock.match(/language:\s*"([^"]*)"/);
  if (repoData.language) {
    if (langMatch) {
      if (langMatch[1] !== repoData.language) {
        newBlock = newBlock.replace(/language:\s*"[^"]*"/, `language: "${repoData.language}"`);
        langUpdated++;
        blockModified = true;
      }
    } else {
      // Add after last field before closing
      newBlock = newBlock.replace(/(language:\s*"[^"]*"|forks:\s*\d+|githubStars:\s*\d+)/, `$1,\n    language: "${repoData.language}"`);
      langUpdated++;
      blockModified = true;
    }
  }
  
  if (blockModified) {
    updatedTools = updatedTools.substring(0, idIdx) + newBlock + updatedTools.substring(idIdx + block.length);
  }
}

// Sort each category by stars (within each tool block section)
// This is complex in raw text, so we'll skip re-sorting unless significant changes

// Write files
if (updatedTools !== toolsContent) {
  writeFileSync(join(rootDir, 'src/data/tools.ts'), updatedTools);
  console.log('✅ tools.ts updated');
} else {
  console.log('ℹ️  tools.ts unchanged');
}

// New AI topics
const newAITopics = [];
for (const [topic, count] of Object.entries(allTopics).sort()) {
  if (existingTopics.has(topic)) continue;
  if (!isAITopic(topic)) continue;
  
  let minStars;
  if (count >= 3) minStars = 2000;
  else if (count >= 2) minStars = 3000;
  else minStars = 5000;
  
  newAITopics.push({
    topic,
    url: `https://github.com/topics/${topic}`,
    minStars,
    description: `（自动发现）${topic}`
  });
}

if (newAITopics.length > 0) {
  topicsData.topics.push(...newAITopics);
  topicsData.lastUpdated = new Date().toISOString();
  writeFileSync(join(rootDir, 'data/ai-topics.json'), JSON.stringify(topicsData, null, 2));
  console.log(`✅ ai-topics.json: +${newAITopics.length} topics → ${topicsData.topics.length} total`);
} else {
  console.log('ℹ️  No new AI topics');
}

// Summary
const summary = {
  totalRepos: repos.length,
  successCount,
  starsUpdated: starChanges.length,
  forksUpdated,
  languageUpdated: langUpdated,
  starChanges: starChanges.sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta)).slice(0, 10),
  newAITopicsCount: newAITopics.length,
  newAITopics: newAITopics.slice(0, 15),
  totalTopics: topicsData.topics.length
};

writeFileSync(join(rootDir, 'scripts/github-update-summary.json'), JSON.stringify(summary, null, 2));
console.log('\n📊 Summary:');
console.log(JSON.stringify(summary, null, 2));
