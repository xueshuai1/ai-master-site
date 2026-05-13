#!/usr/bin/env node
/**
 * Process fetched GitHub data → update tools.ts and ai-topics.json
 * Fixed version: correctly finds tool blocks by URL
 */
import { readFileSync, writeFileSync } from 'fs';

// Load fetched data
const rawData = JSON.parse(readFileSync('/tmp/github-update-results.json', 'utf-8'));
const { repoData, allTopics, topicRepoCount, existingTopics: existingTopicsArr } = rawData;
const existingTopics = new Set(existingTopicsArr.map(t => t.toLowerCase()));
const repos = rawData.repos;

console.log(`Processing ${repos.length} repos, ${allTopics.length} unique topics`);

// Read tools.ts as a single string
const toolsPath = '/Users/xueshuai/.openclaw/workspace/ai-master-site/src/data/tools.ts';
let toolsContent = readFileSync(toolsPath, 'utf-8');

// Parse tool blocks: find each { ... } that contains a url: "https://github.com/..."
function findToolBlock(content, repo) {
  const url = `https://github.com/${repo}`;
  const urlIdx = content.indexOf(`"${url}"`);
  if (urlIdx === -1) return null;

  // Find the enclosing { } for this URL
  // Count braces forward from urlIdx to find closing }
  let depth = 0;
  let endIdx = -1;
  for (let i = urlIdx; i < content.length; i++) {
    if (content[i] === '{') depth++;
    if (content[i] === '}') {
      depth--;
      if (depth === 0) { endIdx = i; break; }
    }
  }
  if (endIdx === -1) return null;

  // Count braces backward from urlIdx to find opening {
  depth = 0;
  let startIdx = -1;
  for (let i = urlIdx; i >= 0; i--) {
    if (content[i] === '}') depth++;
    if (content[i] === '{') {
      depth--;
      if (depth === 0) { startIdx = i; break; }
    }
  }
  if (startIdx === -1) return null;

  return { startIdx, endIdx: endIdx + 1 };
}

// AI keywords for topic filtering
const aiKeywords = [
  'ai','ml','dl','llm','nlp','cv','agent','robot','robots','robotics','vision','language',
  'neural','learning','generative','prompt','chatbot','deep-learning','machine-learning',
  'transformer','gpt','diffusion','rag','embedding','inference','fine-tuning','llmops',
  'mlops','model-serving','vector-search','semantic-search','knowledge-graph','multimodal',
  'speech','text-to-speech','image-generation','video-generation','code-generation',
  'autonomous','embodied-ai','world-models','foundation-models','large-language-models',
  'retrieval-augmented','instruction-tuning','rlhf','alignment'
];

function isAITopic(topic) {
  const t = topic.toLowerCase().replace(/\s+/g, '-');
  for (const kw of aiKeywords) {
    if (t === kw || t.includes(kw)) return true;
  }
  const aiPatterns = ['genai', 'gen-ai', 'generative', 'hugging', 'huggingface', 'deep',
    'tensor', 'chat', 'model', 'neural', 'langchain', 'vector', 'retrieval', 'memory', 'agent', 'llm'];
  for (const p of aiPatterns) {
    if (t.includes(p)) return true;
  }
  return false;
}

// Track changes
const starsChanges = [];
const forksUpdates = [];
const langUpdates = [];
const dateUpdates = [];
let noChangeCount = 0;
let totalTools = 0;
let matchedTools = 0;

// Count total tools
totalTools = (toolsContent.match(/id:\s*"/g) || []).length;
console.log(`Total tools in file: ${totalTools}`);

for (const repo of repos) {
  const data = repoData[repo];
  if (!data) continue;

  const block = findToolBlock(toolsContent, repo);
  if (!block) {
    noChangeCount++;
    continue;
  }
  matchedTools++;

  const blockContent = toolsContent.substring(block.startIdx, block.endIdx);

  // Extract current values
  const currentStarsMatch = blockContent.match(/githubStars:\s*(\d+)/);
  const currentForksMatch = blockContent.match(/forks:\s*(\d+)/);
  const currentLangMatch = blockContent.match(/language:\s*["']([^"']+)["']/);
  const currentUpdatedMatch = blockContent.match(/updatedAt:\s*["']([^"']+)["']/);

  const currentStars = currentStarsMatch ? parseInt(currentStarsMatch[1]) : null;
  const currentForks = currentForksMatch ? parseInt(currentForksMatch[1]) : null;
  const currentLang = currentLangMatch ? currentLangMatch[1] : null;
  const currentUpdated = currentUpdatedMatch ? currentUpdatedMatch[1] : null;

  const newStars = data.stars;
  const newForks = data.forks;
  const newLang = data.language;
  const newDate = data.pushed_at ? data.pushed_at.split('T')[0] : null;

  let modified = false;
  let newBlock = blockContent;

  // Update githubStars
  if (currentStars !== null && newStars !== null && currentStars !== newStars) {
    newBlock = newBlock.replace(/(githubStars:\s*)\d+/, `$1${newStars}`);
    starsChanges.push({ repo, old: currentStars, new: newStars, delta: newStars - currentStars });
    modified = true;
  }

  // Update/add forks
  if (currentForks !== null && newForks !== null && currentForks !== newForks) {
    newBlock = newBlock.replace(/(forks:\s*)\d+/, `$1${newForks}`);
    forksUpdates.push({ repo, old: currentForks, new: newForks });
    modified = true;
  } else if (currentForks === null && newForks !== null) {
    newBlock = newBlock.replace(/(githubStars:\s*\d+,?)/, `$1\n    forks: ${newForks},`);
    forksUpdates.push({ repo, old: null, new: newForks });
    modified = true;
  }

  // Update/add language
  if (currentLang !== null && newLang !== null && currentLang !== newLang) {
    newBlock = newBlock.replace(/(language:\s*["'][^"']+["'])/, `language: "${newLang}"`);
    langUpdates.push({ repo, old: currentLang, new: newLang });
    modified = true;
  } else if (currentLang === null && newLang !== null) {
    newBlock = newBlock.replace(/(githubStars:\s*\d+,?)/, `$1\n    language: "${newLang}",`);
    langUpdates.push({ repo, old: null, new: newLang });
    modified = true;
  }

  // Update updatedAt
  if (newDate && currentUpdated !== newDate) {
    newBlock = newBlock.replace(/(updatedAt:\s*["'][^"']+["'])/, `updatedAt: "${newDate}"`);
    dateUpdates.push({ repo, old: currentUpdated, new: newDate });
    modified = true;
  }

  if (modified) {
    toolsContent = toolsContent.substring(0, block.startIdx) + newBlock + toolsContent.substring(block.endIdx);
  } else {
    noChangeCount++;
  }
}

// Write updated tools.ts
writeFileSync(toolsPath, toolsContent);
console.log(`\n📝 tools.ts processed (${matchedTools}/${repos.length} matched):`);
console.log(`  Stars changed: ${starsChanges.length}`);
console.log(`  Forks updated: ${forksUpdates.length}`);
console.log(`  Languages updated: ${langUpdates.length}`);
console.log(`  Dates updated: ${dateUpdates.length}`);
console.log(`  No changes: ${noChangeCount}`);

// Show top star changes
if (starsChanges.length > 0) {
  const sorted = [...starsChanges].sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta));
  console.log('\n🔝 Top star changes:');
  for (const c of sorted.slice(0, 10)) {
    const sign = c.delta > 0 ? '+' : '';
    console.log(`  ${c.repo}: ${c.old} → ${c.new} (${sign}${c.delta})`);
  }
}

// --- Process Topics ---
const newAITopics = [];
for (const topic of allTopics) {
  if (existingTopics.has(topic)) continue;
  if (!isAITopic(topic)) continue;

  const count = topicRepoCount[topic] || 1;

  // Skip if only 1 repo uses it and that repo has < 1000 stars
  if (count === 1) {
    const reposUsingTopic = repos.filter(r => {
      const rd = repoData[r];
      return rd && rd.topics && rd.topics.map(t => t.toLowerCase().replace(/\s+/g, '-')).includes(topic);
    });
    const maxStars = Math.max(...reposUsingTopic.map(r => repoData[r]?.stars || 0));
    if (maxStars < 1000) continue;
  }

  let minStars = 5000;
  if (count >= 3) minStars = 2000;
  else if (count >= 2) minStars = 3000;

  const desc = `（自动发现）${topic}`;

  newAITopics.push({
    topic,
    url: `https://github.com/topics/${topic}`,
    minStars,
    description: desc,
    _repoCount: count
  });
}

console.log(`\n🔍 New AI Topics found: ${newAITopics.length}`);
for (const t of newAITopics.slice(0, 30)) {
  console.log(`  - ${t.topic} (${t._repoCount} repos, minStars: ${t.minStars})`);
}

// Update ai-topics.json
if (newAITopics.length > 0) {
  const topicsPath = '/Users/xueshuai/.openclaw/workspace/ai-master-site/data/ai-topics.json';
  const topicsData = JSON.parse(readFileSync(topicsPath, 'utf-8'));

  for (const t of newAITopics) {
    const { _repoCount, ...entry } = t;
    topicsData.topics.push(entry);
  }
  topicsData.lastUpdated = new Date().toISOString();

  writeFileSync(topicsPath, JSON.stringify(topicsData, null, 2) + '\n');
  console.log(`\n✅ Added ${newAITopics.length} new topics to ai-topics.json`);
  console.log(`   Previous: ${topicsData.topics.length - newAITopics.length} → Now: ${topicsData.topics.length}`);
} else {
  console.log('\n✅ No new AI topics to add');
}

// Save summary
const summary = {
  starsChanges: starsChanges.length,
  forksUpdates: forksUpdates.length,
  langUpdates: langUpdates.length,
  dateUpdates: dateUpdates.length,
  noChangeCount,
  newTopics: newAITopics.length,
  totalStarsChanges: starsChanges.map(c => ({ repo: c.repo, old: c.old, new: c.new, delta: c.delta })),
  topStarChanges: [...starsChanges].sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta)).slice(0, 5),
  newTopicList: newAITopics.map(t => ({ topic: t.topic, repoCount: t._repoCount }))
};

writeFileSync('/tmp/update-summary.json', JSON.stringify(summary, null, 2));
console.log('\n✅ Summary saved to /tmp/update-summary.json');
