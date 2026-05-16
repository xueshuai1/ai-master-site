#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');

// Read env
const envFile = fs.readFileSync(path.resolve(rootDir, '.env.local'), 'utf8');
const GITHUB_TOKEN = envFile.match(/GITHUB_TOKEN=(.+)/)?.[1]?.trim();
if (!GITHUB_TOKEN) { console.error('No GITHUB_TOKEN'); process.exit(1); }

// Parse tools.ts
const content = fs.readFileSync(path.resolve(rootDir, 'src/data/tools.ts'), 'utf8');

// Extract all tool blocks using the tools array
// Strategy: find each tool by its id field, then extract github URL, stars, forks, language
const tools = [];
const idPattern = /\bid:\s*"([^"]+)"/g;
let idMatch;

// Get all tool boundaries
const boundaries = [];
while ((idMatch = idPattern.exec(content)) !== null) {
  // Only capture ids that are inside tool objects (not in interfaces or constants)
  // A tool id is followed eventually by a url with github.com
  const startIdx = idMatch.index;
  const snippet = content.slice(startIdx, startIdx + 500);
  
  // Check if this snippet contains a github.com url
  const hasGithubUrl = snippet.includes('github.com');
  if (hasGithubUrl) {
    boundaries.push({ id: idMatch[1], index: startIdx });
  }
}

console.log(`Found ${boundaries.length} tools with GitHub URLs`);

for (let i = 0; i < boundaries.length; i++) {
  const b = boundaries[i];
  const nextBoundary = boundaries[i + 1];
  const blockEnd = nextBoundary ? nextBoundary.index : content.length;
  const block = content.slice(b.index, blockEnd);
  
  // Extract github url
  const urlMatch = block.match(/url:\s*["`]\s*https:\/\/github\.com\/([a-zA-Z0-9._-]+\/[a-zA-Z0-9._-]+)/);
  if (!urlMatch) continue;
  
  const githubUrl = urlMatch[1];
  const githubStars = (block.match(/githubStars:\s*(\d+)/) || [])[1] ? parseInt((block.match(/githubStars:\s*(\d+)/) || [])[1]) : null;
  const forksMatch = block.match(/forks:\s*(\d+)/);
  const forks = forksMatch ? parseInt(forksMatch[1]) : null;
  const langMatch = block.match(/language:\s*"([^"]+)"/);
  const language = langMatch ? langMatch[1] : null;
  
  tools.push({ id: b.id, githubUrl, githubStars, forks, language });
}

console.log(`  ${tools.length} tools extracted`);
const noStars = tools.filter(t => t.githubStars === null);
if (noStars.length) console.log(`  Without stars: ${noStars.map(t => t.id).join(', ')}`);

// Fetch GitHub API
async function fetchRepo(repo) {
  const url = `https://api.github.com/repos/${repo}`;
  try {
    const res = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${GITHUB_TOKEN}`,
        'User-Agent': 'ai-master-site-bot',
      }
    });
    
    if (res.status === 403 || res.status === 401) {
      const text = await res.text();
      console.error(`  ⛔ Auth error: ${text.slice(0, 150)}`);
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
    if (data.message) {
      console.error(`  ⚠️ API message for ${repo}: ${data.message}`);
      return null;
    }
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
  
  for (let i = 0; i < tools.length; i++) {
    const tool = tools[i];
    const data = await fetchRepo(tool.githubUrl);
    if (data) {
      results.push({ ...tool, ...data });
      data.topics.forEach(t => allTopics.add(t));
    }
    // Rate limit: 1s between requests  
    if (i < tools.length - 1) {
      await new Promise(r => setTimeout(r, 1000));
    }
    if ((i + 1) % 25 === 0) {
      console.log(`  Progress: ${i + 1}/${tools.length}...`);
    }
  }
  
  console.log(`\n✅ Fetched ${results.length}/${tools.length} repos`);
  
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
  
  fs.writeFileSync(path.resolve(rootDir, '.stars-update-output.json'), JSON.stringify({
    tools,
    results: results.map(r => ({
      id: r.id, url: r.githubUrl, stars: r.stars, forks: r.forks,
      language: r.language, pushed_at: r.pushed_at, topics: r.topics
    })),
    starsChanged,
    allTopics: [...allTopics].sort(),
  }, null, 2));
  console.log('📝 Saved to .stars-update-output.json');
}

main().catch(console.error);
