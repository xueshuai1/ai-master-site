#!/usr/bin/env node
// Fetch GitHub stars + topics for all repos in tools.ts

import fs from 'fs';
import path from 'path';

const TOOLS_FILE = path.resolve('src/data/tools.ts');
const TOPICS_FILE = path.resolve('data/ai-topics.json');
const ENV_FILE = path.resolve('.env.local');

// Read GitHub token
const envContent = fs.readFileSync(ENV_FILE, 'utf8');
const GITHUB_TOKEN = envContent.match(/GITHUB_TOKEN=(.+)/)?.[1]?.trim();
if (!GITHUB_TOKEN) {
  console.error('GITHUB_TOKEN not found in .env.local');
  process.exit(1);
}

// Read tools.ts and extract repos
const toolsContent = fs.readFileSync(TOOLS_FILE, 'utf8');

// Extract all url: "https://github.com/owner/repo" patterns
const urlRegex = /url:\s*"(https:\/\/github\.com\/([^"\/]+\/[^"\/\s]+))"/g;
const repos = [];
const seenUrls = new Set();
let match;
while ((match = urlRegex.exec(toolsContent)) !== null) {
  const fullUrl = match[1];
  const ownerRepo = match[2];
  if (!seenUrls.has(fullUrl)) {
    seenUrls.add(fullUrl);
    // Extract tool id from the same entry (look backwards for id: "...")
    const beforeMatch = toolsContent.substring(0, match.index);
    const idMatch = beforeMatch.match(/id:\s*"([^"]+)"/g);
    const toolId = idMatch ? idMatch[idMatch.length - 1].match(/id:\s*"([^"]+)"/)[1] : null;
    repos.push({ url: fullUrl, ownerRepo, toolId });
  }
}

console.log(`Found ${repos.length} GitHub repos in tools.ts`);

// Read existing topics
const existingTopics = JSON.parse(fs.readFileSync(TOPICS_FILE, 'utf8'));
const existingTopicNames = new Set(existingTopics.topics.map(t => t.topic.toLowerCase()));

// AI topic keywords
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

function isAiTopic(topic) {
  const t = topic.toLowerCase().replace(/\s+/g, '-');
  return aiKeywords.some(kw => {
    const tParts = t.split(/[-_\s]+/);
    const kwParts = kw.split(/[-_\s]+/);
    // Check if any keyword is a substring of the topic parts
    return tParts.some(tp => kwParts.some(kp => tp.includes(kp) || kp.includes(tp)));
  });
}

// Sleep function
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Results storage
const results = [];
const allTopics = {}; // topic -> { count, repos }

async function fetchRepo(repo, index) {
  const { url, ownerRepo, toolId } = repo;
  const apiUrl = `https://api.github.com/repos/${ownerRepo}`;
  
  try {
    const res = await fetch(apiUrl, {
      headers: {
        'Accept': 'application/vnd.github+json',
        'Authorization': `Bearer ${GITHUB_TOKEN}`
      }
    });
    
    if (res.status === 404) {
      console.log(`  [${index + 1}/${repos.length}] ${ownerRepo} → 404 (not found or private)`);
      return null;
    }
    
    if (res.status === 403) {
      const resetTime = res.headers.get('x-ratelimit-reset');
      console.error(`  Rate limited! Reset at: ${resetTime}`);
      await sleep(60000);
      return fetchRepo(repo, index);
    }
    
    if (!res.ok) {
      console.log(`  [${index + 1}/${repos.length}] ${ownerRepo} → HTTP ${res.status}`);
      await sleep(2000);
      return null;
    }
    
    const data = await res.json();
    
    const stars = data.stargazers_count || 0;
    const pushedAt = data.pushed_at ? new Date(data.pushed_at).toISOString().split('T')[0] : null;
    const forks = data.forks_count || 0;
    const language = data.language || null;
    const topics = (data.topics || []).map(t => t.toLowerCase().replace(/\s+/g, '-'));
    
    // Collect topics
    for (const t of topics) {
      if (!allTopics[t]) {
        allTopics[t] = { count: 0, maxStars: 0 };
      }
      allTopics[t].count++;
      allTopics[t].maxStars = Math.max(allTopics[t].maxStars, stars);
    }
    
    console.log(`  [${index + 1}/${repos.length}] ${ownerRepo} → ⭐${stars} 🍴${forks} 📅${pushedAt} 🔤${language || 'N/A'}`);
    
    return { toolId, ownerRepo, stars, pushedAt, forks, language, topics };
    
  } catch (err) {
    console.error(`  [${index + 1}/${repos.length}] ${ownerRepo} → Error: ${err.message}`);
    await sleep(3000);
    return null;
  }
}

// Fetch all repos with rate limiting (1 req/sec)
console.log('\nFetching GitHub data...');
for (let i = 0; i < repos.length; i++) {
  if (i > 0) await sleep(1000);
  const result = await fetchRepo(repos[i], i);
  if (result) results.push(result);
}

console.log(`\n✅ Fetched ${results.length} repos successfully`);

// Build updates for tools.ts
const updates = results.map(r => ({
  toolId: r.toolId,
  oldStars: null, // will be filled by matching
  newStars: r.stars,
  pushedAt: r.pushedAt,
  forks: r.forks,
  language: r.language === 'null' ? null : r.language,
}));

// Find new AI topics
const newTopics = [];
const topicCounts = {};
for (const r of results) {
  for (const t of r.topics) {
    if (!topicCounts[t]) {
      topicCounts[t] = { count: 0, maxStars: 0 };
    }
    topicCounts[t].count++;
    topicCounts[t].maxStars = Math.max(topicCounts[t].maxStars, r.stars);
  }
}

for (const [topic, info] of Object.entries(topicCounts)) {
  if (existingTopicNames.has(topic)) continue;
  
  // Skip if only 1 repo uses it and stars < 1000
  if (info.count === 1 && info.maxStars < 1000) continue;
  
  // Check if AI related
  if (!isAiTopic(topic)) continue;
  
  let minStars;
  if (info.count >= 3) minStars = 2000;
  else if (info.count >= 2) minStars = 3000;
  else minStars = 5000;
  
  newTopics.push({
    topic,
    url: `https://github.com/topics/${topic}`,
    minStars,
    description: `（自动发现）${topic}`
  });
}

// Sort new topics by count descending
newTopics.sort((a, b) => (topicCounts[b.topic]?.count || 0) - (topicCounts[a.topic]?.count || 0));

console.log(`\n📊 Found ${newTopics.length} new AI topics`);

// Save results to JSON for the next step
const output = {
  results: results.map(r => ({
    toolId: r.toolId,
    ownerRepo: r.ownerRepo,
    stars: r.stars,
    pushedAt: r.pushedAt,
    forks: r.forks,
    language: r.language === 'null' ? null : r.language,
    topics: r.topics
  })),
  newTopics,
  topicCounts
};

fs.writeFileSync(path.resolve('scripts/_stars-results.json'), JSON.stringify(output, null, 2));
console.log('Results saved to scripts/_stars-results.json');

// Print summary
const starsChanges = results.filter(r => true); // all have data
console.log('\n📋 Stars Summary:');
for (const r of results) {
  console.log(`  ${r.toolId} (${r.ownerRepo}): ⭐ ${r.stars}`);
}
