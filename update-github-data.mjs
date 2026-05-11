#!/usr/bin/env node
import fs from 'fs';
import path from 'path';

const TOOLS_PATH = 'src/data/tools.ts';
const TOPICS_PATH = 'data/ai-topics.json';

const envContent = fs.readFileSync('.env.local', 'utf8');
const GITHUB_TOKEN = envContent.match(/GITHUB_TOKEN=(.+)/)?.[1]?.trim();
if (!GITHUB_TOKEN) { console.error('No GITHUB_TOKEN'); process.exit(1); }

const toolsContent = fs.readFileSync(TOOLS_PATH, 'utf8');
const existingTopicsData = JSON.parse(fs.readFileSync(TOPICS_PATH, 'utf8'));
const existingTopicNames = new Set(existingTopicsData.topics.map(t => t.topic.toLowerCase()));

// Extract tool blocks with their current data
const toolBlocks = [];
// Match each tool object - find id + url pairs
const blockRegex = /\{\s*id:\s*"([^"]+)"([\s\S]*?)(?=,\s*\{|\]\s*;)/g;
let bm;
while ((bm = blockRegex.exec(toolsContent)) !== null) {
  const id = bm[1];
  const block = bm[2];
  const urlMatch = block.match(/url:\s*"https:\/\/github\.com\/([^"]+)"/);
  if (!urlMatch) continue;
  const repo = urlMatch[1].trim();
  if (!repo.includes('/')) continue;
  
  toolBlocks.push({
    id,
    repo,
    currentStars: parseInt((block.match(/githubStars:\s*(\d+)/) || [])[1] || '0'),
    currentForks: parseInt((block.match(/forks:\s*(\d+)/) || [])[1] || '0'),
    currentLang: (block.match(/language:\s*"([^"]+)"/) || [])[1] || null,
    currentUpdated: (block.match(/updatedAt:\s*"([^"]+)"/) || [])[1] || null,
  });
}

// Deduplicate repos
const uniqueRepos = [...new Set(toolBlocks.map(t => t.repo))];
console.log(`Found ${toolBlocks.length} tools, ${uniqueRepos.length} unique repos`);

const aiKeywords = [
  'ai','ml','dl','llm','nlp','cv','agent','robot','robots','robotics','vision',
  'language','neural','learning','generative','prompt','chatbot','deep-learning',
  'machine-learning','transformer','gpt','diffusion','rag','embedding','inference',
  'fine-tuning','llmops','mlops','model-serving','vector-search','semantic-search',
  'knowledge-graph','multimodal','speech','text-to-speech','image-generation',
  'video-generation','code-generation','autonomous','embodied-ai','world-models',
  'foundation-models','large-language-models','retrieval-augmented','instruction-tuning',
  'rlhf','alignment'
];

function isAITopic(topic) {
  const t = topic.toLowerCase();
  return aiKeywords.some(kw => t.includes(kw) || t === kw);
}

const results = {};
const allTopics = new Set();
const sleep = ms => new Promise(r => setTimeout(r, ms));

// Use Authorization header
async function fetchRepo(repo, retries = 3) {
  const url = `https://api.github.com/repos/${repo}`;
  try {
    const resp = await fetch(url, {
      headers: {
        'Authorization': `token ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'ai-master-site-bot'
      }
    });
    
    if (resp.status === 200) {
      const data = await resp.json();
      results[repo] = {
        stars: data.stargazers_count,
        pushed_at: data.pushed_at,
        forks: data.forks_count,
        language: data.language,
        topics: data.topics || []
      };
      (data.topics || []).forEach(t => allTopics.add(t.toLowerCase()));
      return true;
    } else if (resp.status === 403 || resp.status === 429) {
      const resetHeader = resp.headers.get('x-ratelimit-reset');
      if (resetHeader && retries > 0) {
        const resetTime = parseInt(resetHeader) * 1000;
        const waitTime = Math.min(resetTime - Date.now() + 1000, 120000);
        console.log(`  Rate limited, waiting ${Math.round(waitTime/1000)}s...`);
        await sleep(waitTime);
        return fetchRepo(repo, retries - 1);
      }
      // Secondary rate limit - backoff
      if (retries > 0) {
        const backoff = 30000 * (4 - retries);
        console.log(`  Rate limited ${repo}, backing off ${backoff/1000}s...`);
        await sleep(backoff);
        return fetchRepo(repo, retries - 1);
      }
      results[repo] = { error: resp.status };
      return false;
    } else {
      results[repo] = { error: resp.status };
      return false;
    }
  } catch (e) {
    results[repo] = { error: e.message };
    return false;
  }
}

// Fetch all repos with rate limiting
console.log(`\nFetching ${uniqueRepos.length} repos...`);
for (let i = 0; i < uniqueRepos.length; i++) {
  const repo = uniqueRepos[i];
  await fetchRepo(repo);
  if (i % 20 === 0 && i > 0) {
    const ok = Object.keys(results).filter(k => !results[k].error).length;
    const err = Object.keys(results).filter(k => results[k].error).length;
    console.log(`  Progress: ${i+1}/${uniqueRepos.length} (ok=${ok}, err=${err})`);
  }
  // 1 second between requests
  if (i < uniqueRepos.length - 1) await sleep(1000);
}

// Save results
const okCount = Object.keys(results).filter(k => !results[k].error).length;
console.log(`\nFetch complete: ${okCount}/${uniqueRepos.length} successful`);

// Compute updates
let starsUpdated = 0, forksUpdated = 0, langUpdated = 0, updatedUpdated = 0;
const changes = [];
const now = new Date();
let oldestUpdate = { name: '', days: 0 };

for (const tool of toolBlocks) {
  const data = results[tool.repo];
  if (!data || data.error) continue;
  
  if (tool.currentStars !== data.stars) {
    starsUpdated++;
    changes.push({ id: tool.id, stars: data.stars, diff: data.stars - tool.currentStars });
  }
  if (tool.currentForks !== data.forks && data.forks !== undefined) {
    forksUpdated++;
  }
  if (tool.currentLang !== data.language && data.language) {
    langUpdated++;
  }
  if (data.pushed_at) {
    const pushedDate = data.pushed_at.split('T')[0];
    if (tool.currentUpdated !== pushedDate) {
      updatedUpdated++;
    }
    const days = Math.floor((now - new Date(data.pushed_at)) / 86400000);
    if (days > oldestUpdate.days) {
      oldestUpdate.name = tool.id;
      oldestUpdate.days = days;
    }
  }
}

changes.sort((a, b) => Math.abs(b.diff) - Math.abs(a.diff));

// Topic discovery
const topicUsageCount = {};
const topicMaxStars = {};
for (const repo of uniqueRepos) {
  const data = results[repo];
  if (!data || data.error) continue;
  const repoStars = data.stars || 0;
  (data.topics || []).forEach(t => {
    const key = t.toLowerCase();
    topicUsageCount[key] = (topicUsageCount[key] || 0) + 1;
    topicMaxStars[key] = Math.max(topicMaxStars[key] || 0, repoStars);
  });
}

const newTopics = [];
for (const [topic, count] of Object.entries(topicUsageCount)) {
  if (existingTopicNames.has(topic)) continue;
  if (!isAITopic(topic)) continue;
  if (count === 1 && (topicMaxStars[topic] || 0) < 1000) continue;
  
  let minStars = count >= 3 ? 2000 : count >= 2 ? 3000 : 5000;
  
  newTopics.push({
    topic,
    url: `https://github.com/topics/${topic}`,
    minStars,
    description: `（自动发现）${topic}`,
    count
  });
}

newTopics.sort((a, b) => b.count - a.count);

// Build tools.ts updates
const updates = {}; // repo -> new data
for (const tool of toolBlocks) {
  const data = results[tool.repo];
  if (!data || data.error) continue;
  
  const updatesForTool = {};
  if (tool.currentStars !== data.stars) updatesForTool.stars = data.stars;
  if (tool.currentForks !== data.forks && data.forks !== undefined) updatesForTool.forks = data.forks;
  if (tool.currentLang !== data.language && data.language) updatesForTool.language = data.language;
  
  if (data.pushed_at) {
    const pushedDate = data.pushed_at.split('T')[0];
    if (tool.currentUpdated !== pushedDate) updatesForTool.updatedAt = pushedDate;
  }
  
  if (Object.keys(updatesForTool).length > 0) {
    updates[tool.id] = updatesForTool;
  }
}

// Apply updates to tools.ts using edits
if (Object.keys(updates).length > 0) {
  console.log(`\nApplying ${Object.keys(updates).length} tool updates to tools.ts...`);
  
  let newContent = toolsContent;
  for (const [id, up] of Object.entries(updates)) {
    // Find the tool block and update fields
    // Stars
    if (up.stars !== undefined) {
      newContent = newContent.replace(
        new RegExp(`(id:\\s*"${id}"[\\s\\S]*?)githubStars:\\s*\\d+`),
        `$1githubStars: ${up.stars}`
      );
    }
    if (up.forks !== undefined) {
      // Check if forks field exists
      const toolBlockMatch = newContent.match(new RegExp(`id:\\s*"${id}"([\\s\\S]*?)(?=,\\s*\\{|\\]\\s*;)`));
      if (toolBlockMatch && toolBlockMatch[1].includes('forks:')) {
        newContent = newContent.replace(
          new RegExp(`(id:\\s*"${id}"[\\s\\S]*?)forks:\\s*\\d+`),
          `$1forks: ${up.forks}`
        );
      } else {
        // Insert forks after githubStars line
        newContent = newContent.replace(
          new RegExp(`(id:\\s*"${id}"[\\s\\S]*?githubStars:\\s*\\d+,?)`),
          `$1\n    forks: ${up.forks},`
        );
      }
    }
    if (up.language !== undefined) {
      const toolBlockMatch = newContent.match(new RegExp(`id:\\s*"${id}"([\\s\\S]*?)(?=,\\s*\\{|\\]\\s*;)`));
      if (toolBlockMatch && toolBlockMatch[1].includes('language:')) {
        newContent = newContent.replace(
          new RegExp(`(id:\\s*"${id}"[\\s\\S]*?)language:\\s*"[^"]*"`),
          `$1language: "${up.language}"`
        );
      } else {
        newContent = newContent.replace(
          new RegExp(`(id:\\s*"${id}"[\\s\\S]*?updatedAt:\\s*"[^"]*",?)`),
          `$1\n    language: "${up.language}",`
        );
      }
    }
    if (up.updatedAt !== undefined) {
      newContent = newContent.replace(
        new RegExp(`(id:\\s*"${id}"[\\s\\S]*?)updatedAt:\\s*"[^"]*"`),
        `$1updatedAt: "${up.updatedAt}"`
      );
    }
  }
  
  fs.writeFileSync(TOOLS_PATH, newContent);
  console.log('tools.ts updated');
}

// Apply topic updates
if (newTopics.length > 0) {
  console.log(`\nAppending ${newTopics.length} new AI topics...`);
  const cleanTopics = newTopics.map(({ count, ...rest }) => rest);
  existingTopicsData.topics.push(...cleanTopics);
  existingTopicsData.lastUpdated = new Date().toISOString();
  fs.writeFileSync(TOPICS_PATH, JSON.stringify(existingTopicsData, null, 2));
  console.log('ai-topics.json updated');
}

// Save summary
const summary = {
  totalRepos: uniqueRepos.length,
  fetched: okCount,
  starsUpdated,
  forksUpdated,
  langUpdated,
  updatedUpdated,
  topChanges: changes.slice(0, 5),
  oldestUpdate,
  allTopicsCollected: allTopics.size,
  newAITopics: newTopics.length,
  newTopics: newTopics.slice(0, 20).map(t => ({ topic: t.topic, count: t.count })),
  hasChanges: Object.keys(updates).length > 0 || newTopics.length > 0
};

fs.writeFileSync('/tmp/github-summary.json', JSON.stringify(summary, null, 2));
console.log('\n=== Summary ===');
console.log(`Repos: ${okCount}/${uniqueRepos.length} fetched`);
console.log(`Stars updated: ${starsUpdated}`);
console.log(`Forks updated: ${forksUpdated}`);
console.log(`Language updated: ${langUpdated}`);
console.log(`UpdatedAt updated: ${updatedUpdated}`);
console.log(`Topics collected: ${allTopics.size}`);
console.log(`New AI topics: ${newTopics.length}`);
if (changes.length > 0) {
  console.log('\nTop changes:');
  changes.slice(0, 5).forEach(c => console.log(`  ${c.id}: ${c.stars} (${c.diff > 0 ? '+' : ''}${c.diff})`));
}
if (newTopics.length > 0) {
  console.log('\nNew topics:');
  newTopics.slice(0, 10).forEach(t => console.log(`  ${t.topic} (${t.count} repos)`));
}
console.log(`\nHas changes: ${summary.hasChanges}`);
