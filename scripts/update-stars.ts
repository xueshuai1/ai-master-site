#!/usr/bin/env ts-node
// 批量更新 GitHub stars + 仓库信息 + Topic 发现
import * as fs from 'fs';
import * as path from 'path';

const TOKEN = process.env.GITHUB_TOKEN || '';
if (!TOKEN) {
  console.error('GITHUB_TOKEN not set');
  process.exit(1);
}

// Read tools.ts
const toolsPath = path.join(__dirname, '../src/data/tools.ts');
const toolsContent = fs.readFileSync(toolsPath, 'utf-8');

// Extract all tools with github URLs containing github.com
const urlRegex = /url:\s*["']https:\/\/github\.com\/([^"']+)["']/g;
const starsRegex = /githubStars:\s*(\d+)/g;

// Parse tools to find owner/repo pairs
// We'll use a simpler approach: find all tool objects by their id
const idRegex = /id:\s*["']([^"']+)["']/g;

// Build tool list
const tools: { id: string; url: string; githubRepo: string; oldStars: number; oldForks?: number; oldLanguage?: string }[] = [];
const lines = toolsContent.split('\n');
let currentTool: any = null;
let braceDepth = 0;
let inToolsArray = false;

for (const line of lines) {
  // Detect start of tools array
  if (/export const tools:\s*Tool\[\]\s*=/.test(line) || /export const tools\s*=\s*\[/.test(line)) {
    inToolsArray = true;
    continue;
  }
  
  if (inToolsArray) {
    // Detect tool object start
    const idMatch = line.match(/id:\s*["']([^"']+)["']/);
    if (idMatch && braceDepth === 1) {
      currentTool = { id: idMatch[1], url: '', githubRepo: '', oldStars: -1, oldForks: undefined, oldLanguage: undefined };
    }
    
    if (currentTool) {
      const urlMatch = line.match(/url:\s*["']https:\/\/github\.com\/([^"']+)["']/);
      if (urlMatch) {
        currentTool.url = urlMatch[1];
        currentTool.githubRepo = urlMatch[1];
      }
      const starsMatch = line.match(/githubStars:\s*(\d+)/);
      if (starsMatch) {
        currentTool.oldStars = parseInt(starsMatch[1]);
      }
      const forksMatch = line.match(/forks:\s*(\d+)/);
      if (forksMatch) {
        currentTool.oldForks = parseInt(forksMatch[1]);
      }
      const langMatch = line.match(/language:\s*["']([^"']+)["']/);
      if (langMatch) {
        currentTool.oldLanguage = langMatch[1];
      }
    }
    
    // Track braces to know when a tool object ends
    for (const ch of line) {
      if (ch === '{') braceDepth++;
      if (ch === '}') braceDepth--;
      if (ch === '}' && braceDepth === 0 && currentTool && currentTool.githubRepo) {
        tools.push({ ...currentTool });
        currentTool = null;
      }
    }
  }
}

console.log(`Found ${tools.length} tools with GitHub repos`);

// Read existing topics
const topicsPath = path.join(__dirname, '../data/ai-topics.json');
const topicsData = JSON.parse(fs.readFileSync(topicsPath, 'utf-8'));
const existingTopics = new Set(topicsData.topics.map((t: any) => t.topic.toLowerCase()));

// AI keyword matching
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

function isAITopic(topic: string): boolean {
  const lower = topic.toLowerCase();
  return aiKeywords.some(kw => lower.includes(kw) || kw.includes(lower.split('-')[0]));
}

// Fetch repo info with rate limiting
async function fetchRepo(repo: string): Promise<any> {
  const url = `https://api.github.com/repos/${repo}?access_token=${TOKEN}`;
  const res = await fetch(url);
  if (!res.ok) {
    console.error(`  ❌ ${repo}: ${res.status} ${res.statusText}`);
    return null;
  }
  const data = await res.json();
  return data;
}

async function main() {
  const results: any[] = [];
  const allTopics: Map<string, number> = new Map(); // topic -> count of repos using it
  const topicRepoMap: Map<string, string[]> = new Map(); // topic -> list of repos

  for (let i = 0; i < tools.length; i++) {
    const tool = tools[i];
    if (!tool.githubRepo) continue;
    
    console.log(`[${i + 1}/${tools.length}] Fetching ${tool.githubRepo}...`);
    
    try {
      const data = await fetchRepo(tool.githubRepo);
      if (!data) continue;
      
      const newStars = data.stargazers_count;
      const pushedAt = data.pushed_at ? new Date(data.pushed_at).toISOString().split('T')[0] : undefined;
      const forks = data.forks_count;
      const language = data.language || undefined;
      const repoTopics = (data.topics || []) as string[];
      
      results.push({
        ...tool,
        newStars,
        pushedAt,
        newForks: forks,
        newLanguage: language,
        repoTopics
      });
      
      // Collect topics
      for (const topic of repoTopics) {
        const normalized = topic.toLowerCase().replace(/\s+/g, '-');
        allTopics.set(normalized, (allTopics.get(normalized) || 0) + 1);
        if (!topicRepoMap.has(normalized)) topicRepoMap.set(normalized, []);
        topicRepoMap.get(normalized)!.push(tool.githubRepo);
      }
      
      console.log(`  Stars: ${tool.oldStars} → ${newStars} (${newStars > tool.oldStars ? '+' : ''}${newStars - tool.oldStars})`);
      
      // Rate limit: 1 second between requests
      if (i < tools.length - 1) {
        await new Promise(r => setTimeout(r, 1000));
      }
    } catch (err: any) {
      console.error(`  ❌ ${tool.githubRepo}: ${err.message}`);
    }
  }
  
  // Calculate updates
  let starsUpdated = 0;
  let forksUpdated = 0;
  let languageUpdated = 0;
  const changes: any[] = [];
  
  for (const r of results) {
    const starDiff = r.newStars - r.oldStars;
    if (starDiff !== 0) {
      starsUpdated++;
      changes.push({ id: r.id, name: r.id, oldStars: r.oldStars, newStars: r.newStars, diff: starDiff });
    }
    if (r.newForks !== r.oldForks && r.newForks !== undefined) {
      forksUpdated++;
    }
    if (r.newLanguage !== r.oldLanguage && r.newLanguage !== undefined) {
      languageUpdated++;
    }
  }
  
  // Sort changes by diff
  changes.sort((a, b) => Math.abs(b.diff) - Math.abs(a.diff));
  
  // Find new AI topics
  const newTopics: any[] = [];
  const newTopicNames = new Set<string>();
  
  for (const entry of Array.from(allTopics.entries())) {
    const [topic, count] = entry;
    if (existingTopics.has(topic)) continue;
    if (!isAITopic(topic)) continue;
    if (count === 1) {
      // Only used by 1 repo, check if that repo has < 1000 stars
      const repos = topicRepoMap.get(topic) || [];
      const maxStars = repos.reduce((max, repo) => {
        const r = results.find(x => x.githubRepo === repo);
        return Math.max(max, r?.newStars || 0);
      }, 0);
      if (maxStars < 1000) continue;
    }
    
    newTopicNames.add(topic);
    let minStars: number;
    if (count >= 3) minStars = 2000;
    else if (count >= 2) minStars = 3000;
    else minStars = 5000;
    
    newTopics.push({
      topic,
      url: `https://github.com/topics/${topic}`,
      minStars,
      description: `（自动发现）${topic}`
    });
  }
  
  // Output JSON for the next script to process
  const output = {
    results,
    starsUpdated,
    forksUpdated,
    languageUpdated,
    changes,
    newTopics,
    totalTopics: allTopics.size,
    existingCount: existingTopics.size
  };
  
  fs.writeFileSync('/tmp/github-update-output.json', JSON.stringify(output, null, 2));
  console.log('\n=== Summary ===');
  console.log(`Tools scanned: ${results.length}`);
  console.log(`Stars updated: ${starsUpdated}`);
  console.log(`Forks updated: ${forksUpdated}`);
  console.log(`Language updated: ${languageUpdated}`);
  console.log(`New AI topics found: ${newTopics.length}`);
  console.log(`Total topics from repos: ${allTopics.size}`);
  
  if (changes.length > 0) {
    console.log('\nTop star changes:');
    for (const c of changes.slice(0, 5)) {
      console.log(`  ${c.id}: ${c.oldStars} → ${c.newStars} (${c.diff > 0 ? '+' : ''}${c.diff})`);
    }
  }
  
  if (newTopics.length > 0) {
    console.log('\nNew AI topics:');
    for (const t of newTopics.slice(0, 10)) {
      console.log(`  ${t.topic} (${t.minStars} min stars)`);
    }
  }
}

main().catch(console.error);
