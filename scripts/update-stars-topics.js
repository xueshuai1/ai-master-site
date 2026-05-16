#!/usr/bin/env node
/**
 * Update GitHub stars, forks, language for tools.ts
 * Discover new AI topics from repo topics
 */
import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(__dirname, '..');

// Read env
const envFile = readFileSync(resolve(rootDir, '.env.local'), 'utf8');
const GITHUB_TOKEN = envFile.match(/GITHUB_TOKEN=(.+)/)?.[1]?.trim();
if (!GITHUB_TOKEN) { console.error('No GITHUB_TOKEN'); process.exit(1); }

// Parse tools.ts - extract per-tool fields
const content = readFileSync(resolve(rootDir, 'src/data/tools.ts'), 'utf8');

const tools = [];
const lines = content.split('\n');
let currentTool = null;
let inTool = false;

for (const line of lines) {
  const trimmed = line.trim();
  
  // Detect start of tool: line that has { and is followed by id:
  if (!inTool && (trimmed === '{')) {
    // Look ahead: next few lines should have id:
    continue;
  }
  
  // Look for id: "xxx"
  if (!inTool || (inTool && currentTool && currentTool.id)) {
    const idMatch = trimmed.match(/^id:\s*"([^"]+)"/);
    if (idMatch) {
      if (inTool && currentTool) {
        tools.push(currentTool);
      }
      currentTool = { id: idMatch[1], githubUrl: null, githubStars: null, forks: null, language: null };
      inTool = true;
      continue;
    }
  }
  
  // Collect fields for current tool
  if (inTool && currentTool && currentTool.id) {
    if (!currentTool.githubUrl) {
      const urlMatch = trimmed.match(/url:\s*["`]\s*(https:\/\/github\.com\/[a-zA-Z0-9._-]+\/[a-zA-Z0-9._-]+)/);
      if (urlMatch) {
        currentTool.githubUrl = urlMatch[1];
        continue;
      }
      // Check for template literal that spans lines
      if (trimmed.startsWith('url:') && trimmed.includes('github.com')) {
        const m = trimmed.match(/github\.com\/([a-zA-Z0-9._-]+\/[a-zA-Z0-9._-]+)/);
        if (m) {
          currentTool.githubUrl = m[1];
          continue;
        }
      }
    }
    
    if (currentTool.githubUrl) {
      const starsM = trimmed.match(/githubStars:\s*(\d+)/);
      if (starsM) { currentTool.githubStars = parseInt(starsM[1]); continue; }
      
      const forksM = trimmed.match(/forks:\s*(\d+)/);
      if (forksM) { currentTool.forks = parseInt(forksM[1]); continue; }
      
      const langM = trimmed.match(/language:\s*"([^"]+)"/);
      if (langM) { currentTool.language = langM[1]; continue; }
      
      // End of tool block
      if (trimmed.startsWith('},') || trimmed === '}') {
        tools.push(currentTool);
        currentTool = null;
        inTool = false;
      }
    }
  }
}

// Push last tool if any
if (currentTool) tools.push(currentTool);

const withUrl = tools.filter(t => t.githubUrl);
console.log(`Found ${withUrl.length} tools with GitHub URLs`);
const noStars = withUrl.filter(t => t.githubStars === null);
console.log(`  Without githubStars: ${noStars.map(t => t.id).join(', ')}`);

// Fetch GitHub API
async function fetchRepo(repo) {
  const url = `https://api.github.com/repos/${repo}`;
  try {
    const res = await fetch(url, {
      headers: {
        'Authorization': `token ${GITHUB_TOKEN}`,
        'User-Agent': 'ai-master-site-bot',
      }
    });
    
    if (res.status === 403 || res.status === 401) {
      const text = await res.text();
      console.error(`  ⛔ Auth error for ${repo}: ${text.slice(0, 100)}`);
      process.exit(1);
    }
    if (res.status === 404) {
      console.error(`  ⚠️ Not found: ${repo}`);
      return null;
    }
    if (!res.ok) {
      console.error(`  ⚠️ Error ${res.status} for ${repo}`);
      return null;
    }
    
    const data = await res.json();
    return {
      stars: data.stargazers_count,
      forks: data.forks_count,
      language: data.language || null,
      pushed_at: data.pushed_at || null,
      topics: (data.topics || []).map(t => t.toLowerCase()),
    };
  } catch (err) {
    console.error(`  ⚠️ Fetch error for ${repo}: ${err.message}`);
    return null;
  }
}

async function main() {
  const results = [];
  const allTopics = new Set();
  
  for (let i = 0; i < withUrl.length; i++) {
    const tool = withUrl[i];
    const data = await fetchRepo(tool.githubUrl);
    if (data) {
      results.push({ ...tool, ...data });
      data.topics.forEach(t => allTopics.add(t));
    }
    // Rate limit protection: 1s between requests
    if (i < withUrl.length - 1) {
      await new Promise(r => setTimeout(r, 1000));
    }
    if ((i + 1) % 20 === 0) {
      console.log(`  Progress: ${i + 1}/${withUrl.length}...`);
    }
  }
  
  console.log(`\n✅ Fetched ${results.length}/${withUrl.length} repos`);
  
  // Analysis
  const starsChanged = [];
  for (const r of results) {
    if (r.githubStars !== null && r.stars !== r.githubStars) {
      starsChanged.push({ id: r.id, old: r.githubStars, new: r.stars, delta: r.stars - r.githubStars });
    }
  }
  
  console.log(`\n📊 Stars changes: ${starsChanged.length}`);
  for (const c of starsChanged.sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta)).slice(0, 15)) {
    console.log(`  ${c.id}: ${c.old} → ${c.new} (${c.delta > 0 ? '+' : ''}${c.delta})`);
  }
  console.log(`Topics collected: ${allTopics.size}`);
  
  writeFileSync(resolve(rootDir, '.stars-update-output.json'), JSON.stringify({
    tools: withUrl.map(t => ({ id: t.id, githubUrl: t.githubUrl, githubStars: t.githubStars, forks: t.forks, language: t.language })),
    results: results.map(r => ({ id: r.id, url: r.githubUrl, stars: r.stars, forks: r.forks, language: r.language, pushed_at: r.pushed_at, topics: r.topics })),
    starsChanged,
    allTopics: [...allTopics].sort(),
  }, null, 2));
  console.log('📝 Saved to .stars-update-output.json');
}

main().catch(console.error);
