import { readFileSync, writeFileSync } from 'fs';
import { execSync } from 'child_process';

// Get token
const envContent = readFileSync('.env.local', 'utf-8');
const GITHUB_TOKEN = envContent.match(/GITHUB_TOKEN=(.+)/)?.[1]?.trim().replace(/["']/g, '');
if (!GITHUB_TOKEN) { console.error('No GITHUB_TOKEN found'); process.exit(1); }
console.log('Token loaded:', GITHUB_TOKEN.substring(0, 8) + '...');

// Read tools.ts
const toolsContent = readFileSync('src/data/tools.ts', 'utf-8');

// Extract github repos from url fields
const urlRegex = /url:\s*["'](https:\/\/github\.com\/([^"']+)\/([^"']+)\/?)["']/g;
const idRegex = /id:\s*["']([^"']+)["']/g;
const starsRegex = /githubStars:\s*(\d+)/g;
const forksRegex = /forks:\s*(\d+)/g;
const langRegex = /language:\s*["']([^"']+)["']/g;
const updatedAtRegex = /updatedAt:\s*["']([^"']+)["']/g;

const urlMatches = [...toolsContent.matchAll(/id:\s*["']([^"']+)["'][\s\S]*?url:\s*["'](https:\/\/github\.com\/([^"']+)\/([^"'/]+))/g)];

// Also find tools that have githubStars but might have different URL format
const toolsWithStars = [];
let currentId = null;
let currentUrl = null;
let currentStars = null;
let currentForks = null;
let currentLang = null;
let currentUpdatedAt = null;

// Parse the file more carefully - find each tool block
const toolBlockRegex = /\{\s*\n\s*id:\s*["']([^"']+)["'][\s\S]*?url:\s*["'](https:\/\/github\.com\/[^"']+)["'][\s\S]*?githubStars:\s*(\d+)/g;

const blocks = [...toolsContent.matchAll(/\{\s*\n\s*id:\s*["']([^"']+)["']/g)];

console.log(`Found ${blocks.length} tool blocks`);

// For each id, find the associated url and githubStars
const tools = [];
for (const match of blocks) {
  const id = match[1];
  const startPos = match.index;
  
  // Look for url after id
  const slice = toolsContent.slice(startPos, startPos + 2000);
  const urlMatch = slice.match(/url:\s*["'](https:\/\/github\.com\/([^"']+)\/([^"'/]+))["']/);
  const starsMatch = slice.match(/githubStars:\s*(\d+)/);
  
  if (urlMatch && starsMatch) {
    tools.push({
      id,
      url: urlMatch[1],
      owner: urlMatch[2],
      repo: urlMatch[3],
      currentStars: parseInt(starsMatch[1]),
      currentForks: parseInt(slice.match(/forks:\s*(\d+)/)?.[1] || '0'),
      currentLang: slice.match(/language:\s*["']([^"']+)["']/)?.[1] || '',
      currentUpdatedAt: slice.match(/updatedAt:\s*["']([^"']+)["']/)?.[1] || ''
    });
  }
}

console.log(`Found ${tools.length} tools with GitHub repos and stars`);

// Also filter out non-repo URLs
const filteredTools = tools.filter(t => !t.url.includes('/features/') && !t.url.includes('/sponsors/'));
console.log(`After filtering: ${filteredTools.length} valid repos`);

// Fetch GitHub API
const results = [];
const allTopics = new Set();
const topicUsage = {};

for (let i = 0; i < filteredTools.length; i++) {
  const tool = filteredTools[i];
  const apiUrl = `https://api.github.com/repos/${tool.owner}/${tool.repo}?access_token=${GITHUB_TOKEN}`;
  
  try {
    const response = await fetch(apiUrl, {
      headers: {
        'Authorization': `token ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github+json',
        'User-Agent': 'ai-master-site-star-updater'
      }
    });
    
    if (response.status === 404) {
      console.log(`[${i+1}/${filteredTools.length}] ${tool.id} (${tool.owner}/${tool.repo}) - NOT FOUND, skipping`);
      continue;
    }
    
    if (response.status === 403) {
      const reset = response.headers.get('x-ratelimit-reset');
      console.log(`Rate limited! Reset at: ${reset}`);
      // Wait and retry
      await new Promise(r => setTimeout(r, 2000));
      i--;
      continue;
    }
    
    if (!response.ok) {
      console.log(`[${i+1}/${filteredTools.length}] ${tool.id} - HTTP ${response.status}, skipping`);
      continue;
    }
    
    const data = await response.json();
    
    const newStars = data.stargazers_count;
    const newForks = data.forks_count;
    const newLang = data.language || '';
    const newPushedAt = data.pushed_at ? data.pushed_at.split('T')[0] : '';
    const newTopics = data.topics || [];
    
    // Track topics
    for (const topic of newTopics) {
      const normalized = topic.toLowerCase().replace(/\s+/g, '-');
      allTopics.add(normalized);
      topicUsage[normalized] = (topicUsage[normalized] || 0) + 1;
    }
    
    const starsChanged = newStars !== tool.currentStars;
    const forksChanged = newForks !== tool.currentForks;
    const langChanged = newLang !== tool.currentLang;
    
    if (starsChanged || forksChanged || langChanged) {
      console.log(`[${i+1}/${filteredTools.length}] ${tool.id}: ${tool.currentStars}→${newStars} stars${starsChanged ? ' ⬆️' : ''}${forksChanged ? ` forks:${tool.currentForks}→${newForks}` : ''}${langChanged ? ` lang:${tool.currentLang}→${newLang}` : ''}`);
    } else {
      console.log(`[${i+1}/${filteredTools.length}] ${tool.id}: no change (${newStars}⭐)`);
    }
    
    results.push({
      ...tool,
      newStars,
      newForks,
      newLang,
      newPushedAt,
      topics: newTopics,
      starsChanged,
      forksChanged,
      langChanged
    });
    
    // Rate limiting - 1s between requests
    if (i < filteredTools.length - 1) {
      await new Promise(r => setTimeout(r, 1000));
    }
    
  } catch (err) {
    console.log(`[${i+1}/${filteredTools.length}] ${tool.id} - Error: ${err.message}`);
    await new Promise(r => setTimeout(r, 2000));
  }
}

// Output results as JSON
const output = {
  results,
  allTopics: [...allTopics].sort(),
  topicUsage
};

writeFileSync('/tmp/github-update-results.json', JSON.stringify(output, null, 2));
console.log(`\nDone! Processed ${results.length} repos. Results saved to /tmp/github-update-results.json`);
console.log(`Topics collected: ${allTopics.size} unique topics`);
