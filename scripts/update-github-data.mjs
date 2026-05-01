import { readFileSync, writeFileSync } from 'fs';
import { execSync } from 'child_process';

// Get GitHub token
const envContent = readFileSync('.env.local', 'utf8');
const GITHUB_TOKEN = envContent.match(/GITHUB_TOKEN=(.+)/)?.[1]?.trim();
if (!GITHUB_TOKEN) {
  console.error('No GITHUB_TOKEN found in .env.local');
  process.exit(1);
}

// Read existing ai-topics
const aiTopicsRaw = readFileSync('data/ai-topics.json', 'utf8');
const aiTopics = JSON.parse(aiTopicsRaw);
const existingTopicNames = new Set(aiTopics.topics.map(t => t.topic.toLowerCase()));

// Parse tools.ts to extract tool data
const toolsContent = readFileSync('src/data/tools.ts', 'utf8');

// Better approach: find tool objects by scanning for githubStars entries
// and then look backwards for id, name, url
const lines = toolsContent.split('\n');
const toolObjects = [];
let currentTool = null;
let braceCount = 0;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  
  if (line.includes('id:') && line.includes('"') && !currentTool) {
    const idMatch = line.match(/id:\s*"([^"]+)"/);
    if (idMatch) {
      currentTool = { id: idMatch[1], lineStart: i, lineEnd: i };
      braceCount = 1;
    }
  } else if (currentTool) {
    currentTool.lineEnd = i;
    const nameMatch = line.match(/name:\s*"([^"]+)"/);
    if (nameMatch) currentTool.name = nameMatch[1];
    
    const urlMatch = line.match(/url:\s*"https:\/\/github\.com\/([^"]+)"/);
    if (urlMatch) currentTool.repo = urlMatch[1];
    
    const starsMatch = line.match(/githubStars:\s*(\d+)/);
    if (starsMatch) currentTool.githubStars = parseInt(starsMatch[1]);
    
    const forksMatch = line.match(/forks:\s*(\d+)/);
    if (forksMatch) currentTool.forks = parseInt(forksMatch[1]);
    
    const langMatch = line.match(/language:\s*"([^"]+)"/);
    if (langMatch) currentTool.language = langMatch[1];
    
    const updatedMatch = line.match(/updatedAt:\s*"([^"]+)"/);
    if (updatedMatch) currentTool.updatedAt = updatedMatch[1];
    
    for (const ch of line) {
      if (ch === '{') braceCount++;
      if (ch === '}') braceCount--;
    }
    
    if (braceCount <= 0) {
      if (currentTool.repo) {
        // Skip known invalid repos
        if (!currentTool.repo.includes('/') || currentTool.repo === 'features/copilot') {
          currentTool = null;
          continue;
        }
        toolObjects.push(currentTool);
      }
      currentTool = null;
    }
  }
}

console.log(`Found ${toolObjects.length} tools with GitHub repos`);

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

// Fetch GitHub data
const results = [];
const allTopics = new Map(); // topic -> count of repos using it

let fetched = 0;
for (let i = 0; i < toolObjects.length; i++) {
  const tool = toolObjects[i];
  const repo = tool.repo;
  
  try {
    const cmd = `curl -s --max-time 10 -H "Authorization: token ${GITHUB_TOKEN}" "https://api.github.com/repos/${repo}"`;
    const output = execSync(cmd, { encoding: 'utf8' });
    const data = JSON.parse(output);
    fetched++;
    
    if (data.message) {
      if (data.message.includes('rate limit')) {
        console.log(`  Rate limited! Waiting 65s...`);
        await sleep(65000);
        i--;
        continue;
      }
      if (data.message.includes('Not Found')) {
        console.log(`  ${fetched}/${toolObjects.length} [SKIP] ${repo}`);
        await sleep(1000);
        continue;
      }
    }
    
    const newStars = data.stargazers_count;
    const newForks = data.forks_count;
    const newLanguage = data.language || null;
    const pushedAt = data.pushed_at;
    const repoTopics = data.topics || [];
    
    if (typeof newStars !== 'number' || newStars === null) {
      console.log(`  ${fetched}/${toolObjects.length} [WARN] ${repo} - invalid stars data`);
      await sleep(1000);
      continue;
    }
    
    // Track topics
    repoTopics.forEach(t => {
      const key = t.toLowerCase();
      allTopics.set(key, (allTopics.get(key) || 0) + 1);
    });
    
    const starsChanged = newStars !== tool.githubStars;
    const forksChanged = newForks !== (tool.forks || 0);
    const langChanged = newLanguage && newLanguage !== tool.language;
    
    if (starsChanged || forksChanged || langChanged) {
      results.push({
        id: tool.id,
        name: tool.name,
        repo,
        oldStars: tool.githubStars,
        newStars,
        oldForks: tool.forks || 0,
        newForks,
        oldLanguage: tool.language || 'N/A',
        newLanguage: newLanguage || 'N/A',
        pushedAt,
        starsDiff: newStars - tool.githubStars
      });
    }
    
    if (i % 10 === 0) {
      console.log(`  ${fetched}/${toolObjects.length} ${repo} ${starsChanged ? `⭐${tool.githubStars}→${newStars}` : '(no change)'}`);
    }
    
    // Rate limit protection
    await sleep(1100);
  } catch (e) {
    console.error(`  ${fetched}/${toolObjects.length} [ERROR] ${repo}: ${e.message}`);
    await sleep(2000);
  }
}

// Save intermediate results
writeFileSync('/tmp/github-changes.json', JSON.stringify({ results, toolObjects }, null, 2));

// Output results
console.log('\n=== RESULTS ===');
console.log(`Tools checked: ${fetched}/${toolObjects.length}`);
console.log(`Tools with changes: ${results.length}`);

if (results.length > 0) {
  results.sort((a, b) => Math.abs(b.starsDiff) - Math.abs(a.starsDiff));
  console.log('\nStars changes (sorted by magnitude):');
  results.forEach(r => {
    console.log(`  ${r.name} (${r.repo}): ${r.oldStars} → ${r.newStars} (${r.starsDiff > 0 ? '+' : ''}${r.starsDiff})`);
  });
}

// Analyze new topics
const newTopics = [];
for (const [topic, count] of allTopics) {
  if (!existingTopicNames.has(topic)) {
    // Check if AI-related
    const isAI = aiKeywords.some(kw => topic.includes(kw) || kw.includes(topic));
    if (isAI) {
      newTopics.push({ topic, count });
    }
  }
}

newTopics.sort((a, b) => b.count - a.count);
console.log(`\nNew AI topics found: ${newTopics.length}`);
newTopics.forEach(t => {
  console.log(`  ${t.topic} (${t.count} repos)`);
});

writeFileSync('/tmp/github-topics.json', JSON.stringify({ allTopics: Object.fromEntries(allTopics), newTopics }, null, 2));
console.log('\nDone! Data saved to /tmp/github-changes.json and /tmp/github-topics.json');

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
