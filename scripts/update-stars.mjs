import { readFileSync, writeFileSync } from 'fs';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

// Get GitHub token
const envLocal = readFileSync(join(root, '.env.local'), 'utf-8');
const GITHUB_TOKEN = envLocal.match(/GITHUB_TOKEN=(.+)/)?.[1]?.trim();
if (!GITHUB_TOKEN) { console.error('No GITHUB_TOKEN found'); process.exit(1); }

// Parse tools.ts to extract repo info
const toolsContent = readFileSync(join(root, 'src/data/tools.ts'), 'utf-8');

// Extract all GitHub URLs from the url field
const urlMatches = toolsContent.matchAll(/url:\s*"https:\/\/github\.com\/([^"]+)"/g);
const repos = [];
for (const m of urlMatches) {
  const url = m[0];
  const ownerRepo = m[1];
  // Extract id from same tool block (look backwards from url match)
  const idx = m.index;
  const beforeBlock = toolsContent.slice(Math.max(0, idx - 500), idx);
  const idMatch = beforeBlock.match(/id:\s*"([^"]+)"/g);
  const id = idMatch ? idMatch[idMatch.length - 1].match(/id:\s*"([^"]+)"/)[1] : null;
  
  // Extract current githubStars
  const afterUrl = toolsContent.slice(idx, idx + 2000);
  const starsMatch = afterUrl.match(/githubStars:\s*(\d+)/);
  const currentStars = starsMatch ? parseInt(starsMatch[1]) : null;
  const forksMatch = afterUrl.match(/forks:\s*(\d+)/);
  const currentForks = forksMatch ? parseInt(forksMatch[1]) : null;
  const langMatch = afterUrl.match(/language:\s*"(.*?)"/);
  const currentLang = langMatch ? langMatch[1] : null;

  repos.push({ url, ownerRepo, id, currentStars, currentForks, currentLang });
}

// Deduplicate repos
const uniqueRepos = [];
const seen = new Set();
for (const r of repos) {
  if (!seen.has(r.ownerRepo)) {
    seen.add(r.ownerRepo);
    uniqueRepos.push(r);
  }
}

console.log(`Found ${uniqueRepos.length} unique GitHub repos`);

// Fetch GitHub API with rate limiting
const results = {};
for (let i = 0; i < uniqueRepos.length; i++) {
  const repo = uniqueRepos[i];
  if (i > 0 && i % 10 === 0) {
    console.log(`  Fetched ${i}/${uniqueRepos.length}...`);
    await new Promise(r => setTimeout(r, 2000)); // extra pause every 10
  } else {
    await new Promise(r => setTimeout(r, 300)); // 300ms between requests
  }
  
  try {
    const apiUrl = `https://api.github.com/repos/${repo.ownerRepo}?access_token=${GITHUB_TOKEN}`;
    const resp = execSync(`curl -s -H "Authorization: token ${GITHUB_TOKEN}" https://api.github.com/repos/${repo.ownerRepo}`, {
      timeout: 15000,
      maxBuffer: 10 * 1024 * 1024
    });
    const data = JSON.parse(resp.toString());
    
    if (data.message === 'Not Found') {
      console.log(`  ❌ Not Found: ${repo.ownerRepo}`);
      continue;
    }
    if (data.message && data.message.includes('rate limit')) {
      console.log(`  ⚠️ Rate limited, waiting 60s...`);
      await new Promise(r => setTimeout(r, 60000));
      i--; // retry
      continue;
    }
    
    results[repo.ownerRepo] = {
      stars: data.stargazers_count,
      forks: data.forks_count,
      language: data.language || null,
      pushed_at: data.pushed_at,
      topics: data.topics || [],
      full_name: data.full_name
    };
  } catch (e) {
    console.error(`  ❌ Error fetching ${repo.ownerRepo}: ${e.message}`);
  }
}

console.log(`\nSuccessfully fetched ${Object.keys(results).length} repos`);

// Now update tools.ts
let updatedContent = toolsContent;
let updatedTools = 0;
let starsChanges = [];
let forksChanges = [];
let langChanges = [];

for (const repo of uniqueRepos) {
  const data = results[repo.ownerRepo];
  if (!data) continue;
  
  // Update stars
  if (repo.currentStars !== null && repo.currentStars !== data.stars) {
    const delta = data.stars - repo.currentStars;
    // Find and replace githubStars: N where the repo url appears nearby
    const beforeIdx = updatedContent.indexOf(repo.url);
    if (beforeIdx !== -1) {
      const afterBlock = updatedContent.slice(beforeIdx, beforeIdx + 3000);
      const starsPattern = /githubStars:\s*\d+/;
      const starsMatch = afterBlock.match(starsPattern);
      if (starsMatch) {
        const oldVal = starsMatch[0];
        const newVal = `githubStars: ${data.stars}`;
        // Use exact position to replace
        const absIdx = beforeIdx + starsMatch.index;
        updatedContent = updatedContent.slice(0, absIdx) + newVal + updatedContent.slice(absIdx + oldVal.length);
        starsChanges.push({ id: repo.id, name: repo.ownerRepo, old: repo.currentStars, new: data.stars, delta });
        updatedTools++;
      }
    }
  }
  
  // Update forks
  if (data.forks !== null && repo.currentForks !== data.forks) {
    const beforeIdx = updatedContent.indexOf(repo.url);
    if (beforeIdx !== -1) {
      const afterBlock = updatedContent.slice(beforeIdx, beforeIdx + 3000);
      const forksPattern = /forks:\s*\d+/;
      const forksMatch = afterBlock.match(forksPattern);
      if (forksMatch) {
        const oldVal = forksMatch[0];
        const newVal = `forks: ${data.forks}`;
        const absIdx = beforeIdx + forksMatch.index;
        updatedContent = updatedContent.slice(0, absIdx) + newVal + updatedContent.slice(absIdx + oldVal.length);
        forksChanges.push({ id: repo.id, name: repo.ownerRepo, old: repo.currentForks, new: data.forks });
      } else {
        // forks field doesn't exist, need to add it
        // Find the last field before closing } of this tool
        const toolBlockEnd = findToolBlockEnd(updatedContent, beforeIdx);
        if (toolBlockEnd) {
          // Insert forks before the closing }
          const insertText = `    forks: ${data.forks},\n`;
          updatedContent = updatedContent.slice(0, toolBlockEnd) + insertText + updatedContent.slice(toolBlockEnd);
          forksChanges.push({ id: repo.id, name: repo.ownerRepo, old: null, new: data.forks });
        }
      }
    }
  }
  
  // Update language
  if (data.language && repo.currentLang !== data.language) {
    const beforeIdx = updatedContent.indexOf(repo.url);
    if (beforeIdx !== -1) {
      const afterBlock = updatedContent.slice(beforeIdx, beforeIdx + 3000);
      const langPattern = /language:\s*"[^"]+"/;
      const langMatch = afterBlock.match(langPattern);
      if (langMatch) {
        const oldVal = langMatch[0];
        const newVal = `language: "${data.language}"`;
        const absIdx = beforeIdx + langMatch.index;
        updatedContent = updatedContent.slice(0, absIdx) + newVal + updatedContent.slice(absIdx + oldVal.length);
        langChanges.push({ id: repo.id, name: repo.ownerRepo, old: repo.currentLang, new: data.language });
      } else {
        // language field doesn't exist, need to add it
        const toolBlockEnd = findToolBlockEnd(updatedContent, beforeIdx);
        if (toolBlockEnd) {
          const insertText = `    language: "${data.language}",\n`;
          updatedContent = updatedContent.slice(0, toolBlockEnd) + insertText + updatedContent.slice(toolBlockEnd);
          langChanges.push({ id: repo.id, name: repo.ownerRepo, old: null, new: data.language });
        }
      }
    }
  }
}

// Collect all topics for AI topic discovery
const allTopics = new Set();
for (const data of Object.values(results)) {
  if (data.topics) {
    for (const t of data.topics) {
      allTopics.add(t.toLowerCase().replace(/\s+/g, '-'));
    }
  }
}

console.log(`\nUpdated tools: ${updatedTools}`);
console.log(`Stars changes: ${starsChanges.length}`);
console.log(`Forks changes: ${forksChanges.length}`);
console.log(`Language changes: ${langChanges.length}`);

// Save updated tools.ts
if (updatedContent !== toolsContent) {
  writeFileSync(join(root, 'src/data/tools.ts'), updatedContent, 'utf-8');
  console.log('✅ tools.ts updated');
} else {
  console.log('⏭️  No changes to tools.ts');
}

// Save topics data for next step
const topicsData = {
  allTopics: Array.from(allTopics).sort(),
  results: Object.fromEntries(Object.entries(results).map(([k, v]) => [k, { topics: v.topics || [] }]))
};
writeFileSync(join(root, 'data/_topics-discovery.json'), JSON.stringify(topicsData, null, 2), 'utf-8');

// Print stars changes summary
starsChanges.sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta));
console.log('\n📊 Stars changes (top 10):');
for (const c of starsChanges.slice(0, 10)) {
  const sign = c.delta > 0 ? '+' : '';
  console.log(`  ${c.name}: ${c.old} → ${c.new} (${sign}${c.delta})`);
}

function findToolBlockEnd(content, startIdx) {
  // Find the closing brace/bracket of the current tool object
  let depth = 0;
  let inObject = false;
  for (let i = startIdx; i < content.length; i++) {
    if (content[i] === '{') { depth++; inObject = true; }
    if (content[i] === '}') {
      depth--;
      if (inObject && depth === 0) {
        return i;
      }
    }
  }
  return null;
}

// Write summary
const summary = {
  updatedTools,
  starsChanges: starsChanges.length,
  forksChanges: forksChanges.length,
  langChanges: langChanges.length,
  topStarsChanges: starsChanges.slice(0, 10),
  totalTopics: allTopics.size,
  fetchedRepos: Object.keys(results).length
};
writeFileSync(join(root, 'data/_update-summary.json'), JSON.stringify(summary, null, 2), 'utf-8');
console.log('\n✅ Done. Summary saved to data/_update-summary.json');
