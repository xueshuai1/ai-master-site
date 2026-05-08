import * as fs from 'fs';
import * as path from 'path';

const GITHUB_TOKEN = process.env.GITHUB_TOKEN || '';
const TOOLS_PATH = path.join(__dirname, '..', 'src', 'data', 'tools.ts');
const TOPICS_PATH = path.join(__dirname, '..', 'data', 'ai-topics.json');

// AI keyword list
const AI_KEYWORDS = [
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

function isAiRelated(topic: string): boolean {
  const t = topic.toLowerCase();
  return AI_KEYWORDS.some(kw => t.includes(kw) || kw.includes(t));
}

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Parse repos from tools.ts
const toolsContent = fs.readFileSync(TOOLS_PATH, 'utf-8');
const repoRegex = /githubRepo:\s*['"]([^'"]+)['"]/g;
const repos: string[] = [];
let match;
while ((match = repoRegex.exec(toolsContent)) !== null) {
  repos.push(match[1]);
}

// Deduplicate repos
const uniqueRepos = Array.from(new Set(repos));
console.log(`Found ${uniqueRepos.length} unique repos`);

// Load existing topics
const topicsData = JSON.parse(fs.readFileSync(TOPICS_PATH, 'utf-8'));
const existingTopics = new Set(topicsData.topics.map((t: any) => t.topic.toLowerCase()));
console.log(`Existing topics: ${existingTopics.size}`);

// Fetch repo data
const results: any[] = [];
const allTopics: Map<string, number> = new Map(); // topic -> count of repos using it

for (const repo of uniqueRepos) {
  const url = `https://api.github.com/repos/${repo}?access_token=${GITHUB_TOKEN}`;
  try {
    const response = await fetch(url);
    if (response.status === 403) {
      const resetTime = response.headers.get('x-ratelimit-reset');
      console.log(`Rate limited, reset at ${resetTime}`);
      await sleep(60000);
      continue;
    }
    if (!response.ok) {
      console.log(`Failed to fetch ${repo}: ${response.status}`);
      await sleep(1000);
      continue;
    }
    const data = await response.json();
    results.push({
      repo,
      stargazers_count: data.stargazers_count,
      pushed_at: data.pushed_at,
      forks_count: data.forks_count,
      language: data.language,
      topics: data.topics || []
    });
    // Collect topics
    (data.topics || []).forEach((t: string) => {
      allTopics.set(t, (allTopics.get(t) || 0) + 1);
    });
    console.log(`${repo}: ${data.stargazers_count} stars`);
    await sleep(1100); // rate limit protection
  } catch (e: any) {
    console.log(`Error fetching ${repo}: ${e.message}`);
    await sleep(1000);
  }
}

// Parse current tool entries with their positions in tools.ts
// We need to find each tool's githubStars, forks, language fields and update them
const repoMap = new Map<string, any>();
results.forEach(r => repoMap.set(r.repo, r));

// Find tool names mapped to repos
const toolRepoMap: Map<string, string> = new Map();
const nameRegex = /name:\s*['"]([^'"]+)['"]/g;
const lines = toolsContent.split('\n');
let currentName = '';
let currentRepo = '';

for (const line of lines) {
  const nameMatch = /name:\s*['"]([^'"]+)['"]/.exec(line);
  const repoMatch = /githubRepo:\s*['"]([^'"]+)['"]/.exec(line);
  if (nameMatch) currentName = nameMatch[1];
  if (repoMatch && currentName) {
    toolRepoMap.set(currentName, repoMatch[1]);
  }
}

// Also try to find url patterns like github.com/owner/repo
const urlRepoMap: Map<string, string> = new Map();
currentName = '';
for (const line of lines) {
  const nameMatch = /name:\s*['"]([^'"]+)['"]/.exec(line);
  const urlMatch = /url:\s*['"]https:\/\/github\.com\/([^'"]+)['"]/.exec(line);
  if (nameMatch) currentName = nameMatch[1];
  if (urlMatch && currentName) {
    urlRepoMap.set(currentName, urlMatch[1]);
  }
}

// Build a combined map: tool name -> repo
const combinedMap = new Map<string, string>();
for (const [name, repo] of toolRepoMap) combinedMap.set(name, repo);
for (const [name, repo] of urlRepoMap) {
  if (!combinedMap.has(name)) combinedMap.set(name, repo);
}

// Also extract tool id -> repo mapping
const idRepoMap: Map<string, string> = new Map();
let currentId = '';
currentName = '';
for (const line of lines) {
  const idMatch = /id:\s*['"]([^'"]+)['"]/.exec(line);
  const nameMatch = /name:\s*['"]([^'"]+)['"]/.exec(line);
  const repoMatch = /githubRepo:\s*['"]([^'"]+)['"]/.exec(line);
  const urlMatch = /url:\s*['"]https:\/\/github\.com\/([^'"]+)['"]/.exec(line);
  if (idMatch) currentId = idMatch[1];
  if (nameMatch) currentName = nameMatch[1];
  if (repoMatch && currentId) idRepoMap.set(currentId, repoMatch[1]);
  if (urlMatch && currentId && !idRepoMap.has(currentId)) idRepoMap.set(currentId, urlMatch[1]);
}

// Update tools.ts
let updatedContent = toolsContent;
const updates: string[] = [];
const starChanges: { name: string; old: number; new: number }[] = [];
let forksUpdated = 0;
let languageUpdated = 0;

// For each unique repo, find and update its entry in tools.ts
for (const [id, repo] of idRepoMap) {
  const repoData = repoMap.get(repo);
  if (!repoData) {
    console.log(`No data for repo: ${repo}`);
    continue;
  }

  // Find the tool entry block for this id
  const blockStart = updatedContent.indexOf(`id: "${id}"`);
  if (blockStart === -1) continue;

  // Find the end of this tool object (next tool's id or end of array)
  const blockEndSearch = updatedContent.indexOf(`id: "`, blockStart + 1);
  const blockEnd = blockEndSearch === -1 ? updatedContent.length : blockEndSearch;
  const block = updatedContent.substring(blockStart, blockEnd);

  // Find the tool name for reporting
  const nameMatch = /name:\s*['"]([^'"]+)['"]/.exec(block);
  const toolName = nameMatch ? nameMatch[1] : id;

  // Update githubStars
  const starsMatch = block.match(/githubStars:\s*(\d+)/);
  if (starsMatch) {
    const oldStars = parseInt(starsMatch[1]);
    const newStars = repoData.stargazers_count;
    if (oldStars !== newStars) {
      updatedContent = updatedContent.replace(
        `githubStars: ${oldStars}`,
        `githubStars: ${newStars}`
      );
      starChanges.push({ name: toolName, old: oldStars, new: newStars });
    }
  }

  // Update or add forks
  const forksMatch = block.match(/forks:\s*(\d+)/);
  if (forksMatch) {
    const oldForks = parseInt(forksMatch[1]);
    const newForks = repoData.forks_count;
    if (oldForks !== newForks) {
      updatedContent = updatedContent.replace(
        `forks: ${oldForks}`,
        `forks: ${newForks}`
      );
      forksUpdated++;
    }
  } else if (repoData.forks_count !== undefined && repoData.forks_count !== null) {
    // Add forks field before createdAt or at end of object
    const insertPoint = block.search(/createdAt:/);
    if (insertPoint !== -1) {
      const absPos = blockStart + insertPoint;
      const insertText = `forks: ${repoData.forks_count},\n    `;
      updatedContent = updatedContent.substring(0, absPos) + insertText + updatedContent.substring(absPos);
      forksUpdated++;
    }
  }

  // Update or add language
  const langMatch = block.match(/language:\s*['"]([^'"]+)['"]/);
  if (langMatch) {
    if (repoData.language && langMatch[1] !== repoData.language) {
      updatedContent = updatedContent.replace(
        `language: "${langMatch[1]}"`,
        `language: "${repoData.language}"`
      );
      languageUpdated++;
    }
  } else if (repoData.language) {
    // Add language field
    const insertPoint = block.search(/createdAt:/);
    if (insertPoint !== -1) {
      const absPos = blockStart + insertPoint;
      const insertText = `language: "${repoData.language}",\n    `;
      updatedContent = updatedContent.substring(0, absPos) + insertText + updatedContent.substring(absPos);
      languageUpdated++;
    }
  }
}

// Update updatedAt for each tool based on pushed_at
const now = new Date();
for (const [id, repo] of idRepoMap) {
  const repoData = repoMap.get(repo);
  if (!repoData || !repoData.pushed_at) continue;

  const pushedDate = new Date(repoData.pushed_at);
  const dateStr = pushedDate.toISOString().split('T')[0];

  // Find the tool block
  const blockStart = updatedContent.indexOf(`id: "${id}"`);
  if (blockStart === -1) continue;
  const blockEndSearch = updatedContent.indexOf(`id: "`, blockStart + 1);
  const blockEnd = blockEndSearch === -1 ? updatedContent.length : blockEndSearch;
  const block = updatedContent.substring(blockStart, blockEnd);

  const updatedAtMatch = block.match(/updatedAt:\s*['"]([^'"]+)['"]/);
  if (updatedAtMatch && updatedAtMatch[1] !== dateStr) {
    updatedContent = updatedContent.replace(
      `updatedAt: "${updatedAtMatch[1]}"`,
      `updatedAt: "${dateStr}"`
    );
  }
}

// Write updated tools.ts
fs.writeFileSync(TOOLS_PATH, updatedContent);
console.log(`\nStar changes: ${starChanges.length}`);
starChanges.forEach(c => console.log(`  ${c.name}: ${c.old} → ${c.new} (${c.new - c.old > 0 ? '+' : ''}${c.new - c.old})`));
console.log(`Forks updated: ${forksUpdated}`);
console.log(`Language updated: ${languageUpdated}`);

// Find new AI topics
const newTopics: any[] = [];
for (const [topic, count] of allTopics) {
  if (existingTopics.has(topic.toLowerCase())) continue;
  
  // Get max stars of repos using this topic
  const reposWithTopic = results.filter(r => r.topics.includes(topic));
  const maxStars = Math.max(...reposWithTopic.map(r => r.stargazers_count));
  
  // Skip if too niche (only 1 repo and stars < 1000)
  if (reposWithTopic.length === 1 && maxStars < 1000) continue;

  // Determine minStars
  let minStars: number;
  if (reposWithTopic.length >= 3) minStars = 2000;
  else if (reposWithTopic.length >= 2) minStars = 3000;
  else minStars = 5000;

  // Generate description
  const aiRelated = isAiRelated(topic);
  const desc = aiRelated ? `（自动发现）${topic}` : undefined;
  
  // Only add AI-related topics
  if (aiRelated) {
    newTopics.push({
      topic: topic.toLowerCase().replace(/\s+/g, '-'),
      url: `https://github.com/topics/${topic.toLowerCase().replace(/\s+/g, '-')}`,
      minStars,
      description: desc || `（自动发现）${topic}`
    });
  }
}

console.log(`\nNew AI topics found: ${newTopics.length}`);
newTopics.forEach(t => console.log(`  ${t.topic} (${t.description})`));

// Update ai-topics.json
if (newTopics.length > 0) {
  topicsData.topics.push(...newTopics);
  topicsData.lastUpdated = new Date().toISOString();
  fs.writeFileSync(TOPICS_PATH, JSON.stringify(topicsData, null, 2) + '\n');
  console.log(`Topics updated: ${topicsData.topics.length} total`);
}

// Output summary as JSON for the cron script to parse
const summary = {
  reposScanned: uniqueRepos.length,
  starChanges: starChanges.length,
  starChangeDetails: starChanges.slice(0, 5), // top 5
  forksUpdated,
  languageUpdated,
  newTopicsFound: newTopics.length,
  newTopics: newTopics.slice(0, 10),
  totalTopics: topicsData.topics.length,
  toolsWithStars: (updatedContent.match(/githubStars:/g) || []).length
};

fs.writeFileSync('/tmp/update-summary.json', JSON.stringify(summary, null, 2));
console.log('\nSummary written to /tmp/update-summary.json');
