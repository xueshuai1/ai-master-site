#!/usr/bin/env node
import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

// Load GITHUB_TOKEN
const envContent = readFileSync(join(root, '.env.local'), 'utf-8');
const tokenMatch = envContent.match(/GITHUB_TOKEN=(.+)/);
if (!tokenMatch) { process.stderr.write('GITHUB_TOKEN not found\n'); process.exit(1); }
const GITHUB_TOKEN = tokenMatch[1].trim();

// Load tools.ts and parse githubRepo entries
const toolsContent = readFileSync(join(root, 'src/data/tools.ts'), 'utf-8');

// Extract all {owner}/{repo} from url: "https://github.com/..."
const urlRegex = /url:\s*["']https:\/\/github\.com\/([^"']+)["']/g;
const repos = new Set();
let match;
while ((match = urlRegex.exec(toolsContent)) !== null) {
  repos.add(match[1]);
}

console.log(`Found ${repos.size} GitHub repos to query`);

// Load existing topics
const topicsData = JSON.parse(readFileSync(join(root, 'data/ai-topics.json'), 'utf-8'));
const existingTopics = new Set(topicsData.topics.map(t => t.topic.toLowerCase()));

// AI topic keywords
const aiKeywords = [
  'ai', 'ml', 'dl', 'llm', 'nlp', 'cv', 'agent', 'robot', 'robots', 'robotics',
  'vision', 'language', 'neural', 'learning', 'generative', 'prompt', 'chatbot',
  'deep-learning', 'machine-learning', 'transformer', 'gpt', 'diffusion', 'rag',
  'embedding', 'inference', 'fine-tuning', 'llmops', 'mlops', 'model-serving',
  'vector-search', 'semantic-search', 'knowledge-graph', 'multimodal', 'speech',
  'text-to-speech', 'image-generation', 'video-generation', 'code-generation',
  'autonomous', 'embodied-ai', 'world-models', 'foundation-models',
  'large-language-models', 'retrieval-augmented', 'instruction-tuning',
  'rlhf', 'alignment'
];

function isAITopic(topic) {
  const t = topic.toLowerCase();
  return aiKeywords.some(kw => {
    if (kw.includes('-')) return t === kw || t.includes(kw);
    return t.split(/[-_\s]/).includes(kw) || t === kw;
  });
}

const repoList = [...repos];
const results = [];
const allTopics = new Map(); // topic -> count
const updates = [];

// Fetch each repo sequentially with 1s delay
for (let i = 0; i < repoList.length; i++) {
  const repo = repoList[i];
  if (i > 0) await new Promise(r => setTimeout(r, 1000));
  
  const url = `https://api.github.com/repos/${repo}?access_token=${GITHUB_TOKEN}`;
  
  try {
    const resp = await fetch(url, {
      headers: {
        'Authorization': `token ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'ai-master-site-data-updater'
      }
    });
    
    if (resp.status === 404) {
      console.log(`[${i+1}/${repoList.length}] 404: ${repo} - not found, skipping`);
      continue;
    }
    
    if (resp.status === 403) {
      const body = await resp.text();
      console.log(`[${i+1}/${repoList.length}] 403: ${repo} - ${body.slice(0, 200)}`);
      await new Promise(r => setTimeout(r, 5000));
      continue;
    }
    
    if (!resp.ok) {
      console.log(`[${i+1}/${repoList.length}] Error ${resp.status}: ${repo}`);
      continue;
    }
    
    const data = await resp.json();
    
    results.push({
      repo,
      stars: data.stargazers_count,
      forks: data.forks_count,
      language: data.language || null,
      pushedAt: data.pushed_at || null,
      topics: data.topics || [],
    });
    
    // Collect topics
    for (const topic of (data.topics || [])) {
      const normalized = topic.toLowerCase().replace(/\s+/g, '-');
      allTopics.set(normalized, (allTopics.get(normalized) || 0) + 1);
    }
    
    const starChange = `★${data.stargazers_count}`;
    console.log(`[${i+1}/${repoList.length}] ${repo}: ${starChange} | lang=${data.language || 'N/A'} | forks=${data.forks_count}`);
    
  } catch (err) {
    console.log(`[${i+1}/${repoList.length}] ${repo}: fetch error - ${err.message}`);
  }
}

console.log(`\n=== Fetched ${results.length} repos successfully ===\n`);

// Find new AI topics
const newTopics = [];
const topicCounts = {};
for (const [topic, count] of allTopics) {
  if (existingTopics.has(topic)) continue;
  if (count === 1) {
    // Single repo using it - need to check if that repo has >= 1000 stars
    const repo = results.find(r => r.topics.map(t => t.toLowerCase()).includes(topic));
    if (!repo || repo.stars < 1000) continue;
  }
  
  // Check if AI-related
  if (!isAITopic(topic)) continue;
  
  topicCounts[topic] = count;
  
  // Calculate minStars
  let minStars = 5000;
  if (count >= 3) minStars = 2000;
  else if (count >= 2) minStars = 3000;
  else minStars = 5000;
  
  // Description
  const desc = topic.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  
  newTopics.push({
    topic,
    url: `https://github.com/topics/${topic}`,
    minStars,
    description: desc
  });
}

console.log(`Found ${newTopics.length} new AI topics:`);
for (const t of newTopics) {
  console.log(`  ${t.topic} (${topicCounts[t.topic]} repos)`);
}

// Save results for the update script
writeFileSync(join(root, 'scripts/github-data-results.json'), JSON.stringify({
  results,
  newTopics,
  topicCounts,
  timestamp: new Date().toISOString()
}, null, 2));

console.log('\nResults saved to scripts/github-data-results.json');
