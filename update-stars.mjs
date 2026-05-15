import fs from 'fs';
import path from 'path';

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const TOOLS_PATH = path.join('src/data/tools.ts');
const TOPICS_PATH = path.join('data/ai-topics.json');

// Read tools.ts content
const toolsContent = fs.readFileSync(TOOLS_PATH, 'utf-8');

// Extract GitHub URLs and repo info
const urlRegex = /url:\s*["']https:\/\/github\.com\/([^"']+)["']/g;
const nameRegex = /name:\s*["']([^"']+)["']/g;
const idRegex = /id:\s*["']([^"']+)["']/g;
const starsRegex = /githubStars:\s*(\d+)/g;
const forksRegex = /forks:\s*(\d+)/g;
const langRegex = /language:\s*["']([^"']+)["']/g;

const urls = [...toolsContent.matchAll(urlRegex)].map(m => m[1]);
const names = [...toolsContent.matchAll(nameRegex)].map(m => m[1]);
const ids = [...toolsContent.matchAll(idRegex)].map(m => m[1]);
const stars = [...toolsContent.matchAll(starsRegex)].map(m => parseInt(m[1]));
const forksList = [...toolsContent.matchAll(forksRegex)].map(m => parseInt(m[1]));
const langs = [...toolsContent.matchAll(langRegex)].map(m => m[1]);

// Find the positions of each tool object to update them later
const toolObjects = [];
let i = 0;
for (const url of urls) {
  const urlIdx = toolsContent.indexOf(`https://github.com/${url}`, i);
  if (urlIdx === -1) continue;
  
  // Find the surrounding tool object boundaries
  let objStart = urlIdx;
  // Go back to find the start of this tool object ({)
  let braceCount = 0;
  let foundStart = false;
  for (let j = objStart - 1; j >= 0; j--) {
    if (toolsContent[j] === '}') braceCount++;
    if (toolsContent[j] === '{') {
      if (braceCount === 0) {
        objStart = j;
        foundStart = true;
        break;
      }
      braceCount--;
    }
  }
  if (!foundStart) continue;
  
  // Find the end of this tool object
  braceCount = 0;
  let objEnd = -1;
  for (let j = objStart; j < toolsContent.length; j++) {
    if (toolsContent[j] === '{') braceCount++;
    if (toolsContent[j] === '}') {
      braceCount--;
      if (braceCount === 0) {
        objEnd = j + 1;
        break;
      }
    }
  }
  if (objEnd === -1) continue;
  
  const objContent = toolsContent.substring(objStart, objEnd);
  
  const idMatch = objContent.match(/id:\s*["']([^"']+)["']/);
  const nameMatch = objContent.match(/name:\s*["']([^"']+)["']/);
  const starsMatch = objContent.match(/githubStars:\s*(\d+)/);
  const forksMatch = objContent.match(/forks:\s*(\d+)/);
  const langMatch = objContent.match(/language:\s*["']([^"']+)["']/);
  const updatedAtMatch = objContent.match(/updatedAt:\s*["']([^"']+)["']/);
  
  toolObjects.push({
    id: idMatch ? idMatch[1] : null,
    name: nameMatch ? nameMatch[1] : null,
    repo: url,
    stars: starsMatch ? parseInt(starsMatch[1]) : null,
    forks: forksMatch ? parseInt(forksMatch[1]) : null,
    language: langMatch ? langMatch[1] : null,
    updatedAt: updatedAtMatch ? updatedAtMatch[1] : null,
    objStart,
    objEnd,
    objContent
  });
  
  i = urlIdx + url.length;
}

console.log(`Found ${toolObjects.length} GitHub repos in tools.ts`);

// AI Topic keywords
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

// Read existing topics
const topicsData = JSON.parse(fs.readFileSync(TOPICS_PATH, 'utf-8'));
const existingTopics = new Set(topicsData.topics.map(t => t.topic.toLowerCase()));

console.log(`Existing topics: ${existingTopics.size}`);

// Fetch GitHub API data sequentially
const results = [];
const allTopics = new Set();

for (const tool of toolObjects) {
  try {
    const url = `https://api.github.com/repos/${tool.repo}?access_token=${GITHUB_TOKEN}`;
    const response = await fetch(url, {
      headers: {
        'Authorization': `token ${GITHUB_TOKEN}`,
        'User-Agent': 'ai-master-site/1.0'
      }
    });
    
    if (!response.ok) {
      console.log(`⚠️  Failed to fetch ${tool.repo}: ${response.status} ${response.statusText}`);
      await new Promise(r => setTimeout(r, 2000));
      continue;
    }
    
    const data = await response.json();
    
    const newStars = data.stargazers_count;
    const newForks = data.forks_count;
    const newLang = data.language;
    const pushedAt = data.pushed_at ? new Date(data.pushed_at).toISOString().split('T')[0] : null;
    const repoTopics = (data.topics || []).map(t => t.toLowerCase());
    
    // Collect all topics
    repoTopics.forEach(t => allTopics.add(t));
    
    results.push({
      ...tool,
      newStars,
      newForks,
      newLang,
      pushedAt,
      repoTopics,
      starsChanged: tool.stars !== null && newStars !== tool.stars,
      starsDiff: tool.stars !== null ? newStars - tool.stars : 0,
      forksChanged: tool.forks !== null && newForks !== tool.forks,
      langChanged: tool.language !== newLang
    });
    
    console.log(`✅ ${tool.name}: ${newStars.toLocaleString()} stars (diff: ${tool.stars ? (newStars - tool.stars).toLocaleString() : 'N/A'})`);
    
    // Rate limit protection
    await new Promise(r => setTimeout(r, 1000));
  } catch (err) {
    console.log(`❌ Error fetching ${tool.repo}: ${err.message}`);
    await new Promise(r => setTimeout(r, 2000));
  }
}

// Generate updated tools.ts
let updatedContent = toolsContent;

// Process from end to start to maintain positions
const sortedResults = [...results].sort((a, b) => b.objStart - a.objStart);

let starsUpdated = 0;
let forksUpdated = 0;
let langUpdated = 0;
const changes = [];

for (const r of sortedResults) {
  let objContent = updatedContent.substring(r.objStart, r.objEnd);
  const originalObj = objContent;
  
  // Update githubStars
  if (r.starsChanged) {
    const oldStars = r.stars;
    objContent = objContent.replace(
      /githubStars:\s*\d+/,
      `githubStars: ${r.newStars}`
    );
    starsUpdated++;
    changes.push(`${r.name}: ${oldStars} → ${r.newStars} (${r.starsDiff > 0 ? '+' : ''}${r.starsDiff})`);
  }
  
  // Update forks
  if (r.forksChanged || (r.forks === null && r.newForks !== null)) {
    if (objContent.includes('forks:')) {
      objContent = objContent.replace(
        /forks:\s*\d+/,
        `forks: ${r.newForks}`
      );
    } else {
      // Add forks after githubStars line
      objContent = objContent.replace(
        /(githubStars:\s*\d+)/,
        `$1,\n    forks: ${r.newForks}`
      );
    }
    forksUpdated++;
  }
  
  // Update language
  if (r.langChanged) {
    if (objContent.includes('language:')) {
      objContent = objContent.replace(
        /language:\s*["'][^"']+["']/,
        `language: "${r.newLang}"`
      );
    } else {
      // Add language after forks or githubStars
      if (objContent.includes('forks:')) {
        objContent = objContent.replace(
          /(forks:\s*\d+)/,
          `$1,\n    language: "${r.newLang}"`
        );
      } else {
        objContent = objContent.replace(
          /(githubStars:\s*\d+)/,
          `$1,\n    language: "${r.newLang}"`
        );
      }
    }
    langUpdated++;
  }
  
  // Update updatedAt if pushedAt changed
  if (r.pushedAt && r.pushedAt !== r.updatedAt) {
    if (objContent.includes('updatedAt:')) {
      objContent = objContent.replace(
        /updatedAt:\s*["'][^"']+["']/,
        `updatedAt: "${r.pushedAt}"`
      );
    } else {
      objContent = objContent.replace(
        /(githubStars:\s*\d+)/,
        `$1,\n    updatedAt: "${r.pushedAt}"`
      );
    }
  }
  
  if (objContent !== originalObj) {
    updatedContent = updatedContent.substring(0, r.objStart) + objContent + updatedContent.substring(r.objEnd);
  }
}

// Write updated tools.ts if changed
if (updatedContent !== toolsContent) {
  fs.writeFileSync(TOOLS_PATH, updatedContent);
  console.log(`\n✅ tools.ts updated: ${starsUpdated} stars, ${forksUpdated} forks, ${langUpdated} languages`);
} else {
  console.log('\n✅ tools.ts: no changes needed');
}

// Analyze new topics
const newAITopics = [];
for (const topic of allTopics) {
  if (existingTopics.has(topic)) continue;
  
  // Check if AI-related
  const isAI = AI_KEYWORDS.some(kw => 
    topic === kw || topic.includes(kw) || kw.includes(topic)
  );
  
  if (!isAI) continue;
  
  // Count how many repos use this topic
  const usageCount = results.filter(r => r.repoTopics.includes(topic)).length;
  
  // Calculate minStars
  let minStars = 5000;
  if (usageCount >= 3) minStars = 2000;
  else if (usageCount >= 2) minStars = 3000;
  
  // Generate description
  const desc = topic.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  
  newAITopics.push({
    topic,
    url: `https://github.com/topics/${topic}`,
    minStars,
    description: `（自动发现）${desc}`,
    usageCount
  });
}

console.log(`\n🔍 New AI Topics found: ${newAITopics.length}`);
for (const t of newAITopics.slice(0, 20)) {
  console.log(`  - ${t.topic} (${t.usageCount} repos)`);
}

// Write updated ai-topics.json if new topics found
if (newAITopics.length > 0) {
  const newTopicEntries = newAITopics.map(t => ({
    topic: t.topic,
    url: t.url,
    minStars: t.minStars,
    description: t.description
  }));
  
  topicsData.topics.push(...newTopicEntries);
  topicsData.lastUpdated = new Date().toISOString();
  
  fs.writeFileSync(TOPICS_PATH, JSON.stringify(topicsData, null, 2));
  console.log(`\n✅ ai-topics.json updated: ${newAITopics.length} new topics added`);
} else {
  console.log('\n✅ ai-topics.json: no new topics');
}

// Summary
console.log('\n=== SUMMARY ===');
console.log(`Repos scanned: ${results.length}`);
console.log(`Stars updated: ${starsUpdated}`);
console.log(`Forks updated: ${forksUpdated}`);
console.log(`Languages updated: ${langUpdated}`);
console.log(`New topics found: ${newAITopics.length}`);

if (changes.length > 0) {
  console.log('\nTop changes:');
  changes.sort((a, b) => Math.abs(parseInt(b.split('→')[1])) - Math.abs(parseInt(a.split('→')[1])));
  for (const c of changes.slice(0, 10)) {
    console.log(`  ${c}`);
  }
}

// Find oldest updated tool
const oldestUpdated = results
  .filter(r => r.pushedAt)
  .sort((a, b) => new Date(a.pushedAt) - new Date(b.pushedAt))[0];

if (oldestUpdated) {
  const daysAgo = Math.floor((Date.now() - new Date(oldestUpdated.pushedAt).getTime()) / (1000 * 60 * 60 * 24));
  console.log(`\nLast updated oldest: ${oldestUpdated.name} (${oldestUpdated.pushedAt}, ${daysAgo} days ago)`);
}

// Output data for the message script
const output = {
  scanned: results.length,
  starsUpdated,
  forksUpdated,
  langUpdated,
  newTopics: newAITopics.length,
  topChanges: changes.slice(0, 5),
  oldestUpdated: oldestUpdated ? { name: oldestUpdated.name, date: oldestUpdated.pushedAt } : null,
  totalTopics: topicsData.topics.length
};

fs.writeFileSync('/tmp/update-result.json', JSON.stringify(output, null, 2));
console.log('\n✅ Result saved to /tmp/update-result.json');
