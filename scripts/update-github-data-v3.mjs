#!/usr/bin/env node
import { readFileSync, writeFileSync, execSync } from 'child_process';

// Load GitHub token
const envContent = readFileSync('.env.local', 'utf-8');
const GITHUB_TOKEN = envContent.match(/GITHUB_TOKEN=(.+)/)?.[1]?.trim();
if (!GITHUB_TOKEN) { console.error('No GITHUB_TOKEN found'); process.exit(1); }

// Read tools.ts
const toolsContent = readFileSync('src/data/tools.ts', 'utf-8');

// Extract repo URLs
const urlRegex = /url:\s*"(https:\/\/github\.com\/([^\/]+)\/([^\/"]+))"/g;
const repos = [];
let match;
while ((match = urlRegex.exec(toolsContent)) !== null) {
  repos.push({ fullUrl: match[1], owner: match[2], repo: match[3], key: match[2] + '/' + match[3] });
}
console.log(`Found ${repos.length} GitHub repo references`);

// Fetch data with rate limiting
const repoData = {};
let successCount = 0, failCount = 0;

for (let i = 0; i < repos.length; i++) {
  const r = repos[i];
  if (i > 0) await new Promise(res => setTimeout(res, 800));
  
  try {
    const result = execSync(
      `curl -s -w "\n%{http_code}" -H "Authorization: token ${GITHUB_TOKEN}" "https://api.github.com/repos/${r.key}"`,
      { encoding: 'utf-8', timeout: 15000, maxBuffer: 10 * 1024 * 1024 }
    );
    const parts = result.trim().split('\n');
    const httpCode = parseInt(parts.pop());
    const body = parts.join('\n');
    
    if (httpCode === 404 || httpCode === 410) {
      // Repo doesn't exist or was deleted
      continue;
    }
    if (httpCode === 403) {
      console.log(`  [403] ${r.key} - rate limited, waiting 60s`);
      await new Promise(res => setTimeout(res, 60000));
      // Retry once
      i--; 
      continue;
    }
    if (httpCode !== 200) {
      console.log(`  [HTTP ${httpCode}] ${r.key}`);
      failCount++;
      continue;
    }
    
    const data = JSON.parse(body);
    if (!data.stargazers_count) {
      // Might be an org page or not a repo
      continue;
    }
    
    repoData[r.key] = {
      stars: data.stargazers_count,
      pushed_at: data.pushed_at,
      forks: data.forks_count,
      language: data.language || null,
      topics: data.topics || []
    };
    successCount++;
    
    if ((successCount) % 20 === 0) {
      console.log(`  Progress: ${successCount} fetched — ${r.key} (${data.stargazers_count}★)`);
    }
  } catch (e) {
    console.log(`  [ERR] ${r.key}: ${e.message}`);
    failCount++;
  }
}

console.log(`\nFetched: ${successCount} success, ${failCount} failed`);

// Now apply changes to tools.ts
let updatedContent = toolsContent;
let editsCount = 0;

for (const r of repos) {
  const data = repoData[r.key];
  if (!data) continue;
  
  // Find the block containing this URL and extract relevant fields
  // We'll use regex to find and replace within a localized area
  
  // Find position of this URL
  const urlPos = updatedContent.indexOf(r.fullUrl);
  if (urlPos === -1) continue;
  
  // Find the block boundaries - look backwards for { after a newline
  let blockStart = urlPos;
  let braceCount = 0;
  for (let i = urlPos; i >= 0; i--) {
    if (updatedContent[i] === '}') braceCount--;
    if (updatedContent[i] === '{') {
      braceCount++;
      if (braceCount === 1) { blockStart = i; break; }
    }
  }
  
  // Find block end
  let blockEnd = urlPos;
  braceCount = 0;
  for (let i = urlPos; i < updatedContent.length; i++) {
    if (updatedContent[i] === '{') braceCount++;
    if (updatedContent[i] === '}') {
      braceCount--;
      if (braceCount === 0) { blockEnd = i + 1; break; }
    }
  }
  
  const block = updatedContent.substring(blockStart, blockEnd);
  let newBlock = block;
  
  // Update githubStars
  const starsMatch = newBlock.match(/(githubStars:\s*)(\d+)/);
  if (starsMatch) {
    const oldStars = parseInt(starsMatch[2]);
    if (oldStars !== data.stars) {
      newBlock = newBlock.replace(starsMatch[0], `githubStars: ${data.stars}`);
      editsCount++;
    }
  }
  
  // Update forks
  const forksMatch = newBlock.match(/(forks:\s*)(\d+)/);
  if (forksMatch) {
    const oldForks = parseInt(forksMatch[2]);
    if (oldForks !== data.forks) {
      newBlock = newBlock.replace(forksMatch[0], `forks: ${data.forks}`);
      editsCount++;
    }
  }
  
  // Update language (only if API returned a non-null language)
  if (data.language) {
    const langMatch = newBlock.match(/(language:\s*)"([^"]*)"/);
    if (langMatch) {
      const oldLang = langMatch[2];
      if (oldLang !== data.language) {
        newBlock = newBlock.replace(langMatch[0], `language: "${data.language}"`);
        editsCount++;
      }
    }
  }
  
  // Update updatedAt
  if (data.pushed_at) {
    const newDate = data.pushed_at.split('T')[0];
    const dateMatch = newBlock.match(/(updatedAt:\s*)"([^"]+)"/);
    if (dateMatch) {
      const oldDate = dateMatch[2];
      if (oldDate !== newDate) {
        newBlock = newBlock.replace(dateMatch[0], `updatedAt: "${newDate}"`);
        editsCount++;
      }
    }
  }
  
  if (newBlock !== block) {
    updatedContent = updatedContent.substring(0, blockStart) + newBlock + updatedContent.substring(blockEnd);
  }
}

writeFileSync('src/data/tools.ts', updatedContent);
console.log(`Applied ${editsCount} edits to tools.ts`);

// Topic discovery
const topicsData = JSON.parse(readFileSync('data/ai-topics.json', 'utf-8'));
const existingTopics = new Set(topicsData.topics.map(t => t.topic.toLowerCase()));

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
  const t = topic.toLowerCase();
  return aiKeywords.some(kw => t.includes(kw) || t === kw);
}

const allTopics = new Map();
for (const key of Object.keys(repoData)) {
  for (const topic of repoData[key].topics) {
    const normalized = topic.toLowerCase().replace(/\s+/g, '-');
    allTopics.set(normalized, (allTopics.get(normalized) || 0) + 1);
  }
}

const newTopics = [];
for (const [topic, count] of allTopics) {
  if (existingTopics.has(topic)) continue;
  if (!isAITopic(topic)) continue;
  
  if (count === 1) {
    const repoWithTopic = Object.keys(repoData).find(r =>
      repoData[r].topics.map(t => t.toLowerCase().replace(/\s+/g, '-')).includes(topic)
    );
    if (repoWithTopic && repoData[repoWithTopic].stars < 1000) continue;
  }
  
  let minStars = 5000;
  if (count >= 3) minStars = 2000;
  else if (count >= 2) minStars = 3000;
  
  newTopics.push({
    topic,
    url: `https://github.com/topics/${topic}`,
    minStars,
    description: `（自动发现）${topic}`
  });
}

if (newTopics.length > 0) {
  topicsData.topics.push(...newTopics);
  topicsData.lastUpdated = new Date().toISOString();
  writeFileSync('data/ai-topics.json', JSON.stringify(topicsData, null, 2) + '\n');
  console.log(`Added ${newTopics.length} new topics to ai-topics.json`);
} else {
  console.log('No new AI topics discovered');
}

// Write summary
writeFileSync('/tmp/github-update-results.json', JSON.stringify({
  editsCount,
  starsChanged: repos.filter(r => {
    const d = repoData[r.key];
    if (!d) return false;
    // We'd need to re-parse, but let's just count
    return true;
  }).length,
  newTopics,
  totalRepos: repos.length,
  successCount, failCount,
  topicStats: {
    totalCollected: allTopics.size,
    newAiTopics: newTopics.length,
    existingTopics: existingTopics.size
  }
}, null, 2));

console.log('\nDone!');
