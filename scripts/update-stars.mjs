/**
 * Update GitHub stars for tools.ts
 * Run: GITHUB_TOKEN=$(grep GITHUB_TOKEN .env.local | cut -d= -f2) node scripts/update-stars.mjs
 */
import { readFileSync, writeFileSync } from 'fs';

const TOKEN = process.env.GITHUB_TOKEN || '';
const TOOLS_PATH = './src/data/tools.ts';

async function fetchRepo(ownerRepo) {
  const url = `https://api.github.com/repos/${ownerRepo}`;
  const res = await fetch(url, {
    headers: { 'Authorization': `token ${TOKEN}`, 'Accept': 'application/vnd.github.v3+json' }
  });
  if (!res.ok) { console.error(`  ⚠️ ${ownerRepo}: HTTP ${res.status}`); return null; }
  return await res.json();
}

// Extract {owner}/{repo} from GitHub URL
function extractOwnerRepo(url) {
  const m = url.match(/https:\/\/github\.com\/([A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+)/);
  return m ? m[1] : null;
}

// Parse tools.ts to find all id + url pairs with their line positions
function parseTools(content) {
  const entries = [];
  const lines = content.split('\n');
  let current = null;
  
  for (let i = 0; i < lines.length; i++) {
    const idMatch = lines[i].match(/id:\s*["']([^"']+)["']/);
    const urlMatch = lines[i].match(/url:\s*["'](https:\/\/github\.com\/[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+)["']/);
    const starsMatch = lines[i].match(/githubStars:\s*(\d+)/);
    const updatedMatch = lines[i].match(/updatedAt:\s*["'](\d{4}-\d{2}-\d{2})["']/);
    
    if (idMatch) {
      if (current) entries.push(current);
      current = { id: idMatch[1], url: null, starsLine: null, stars: null, updatedLine: null, updated: null };
    }
    if (current) {
      if (urlMatch && !current.url) {
        current.url = urlMatch[1];
        current.ownerRepo = extractOwnerRepo(current.url);
      }
      if (starsMatch) {
        current.starsLine = i;
        current.stars = parseInt(starsMatch[1]);
      }
      if (updatedMatch) {
        current.updatedLine = i;
        current.updated = updatedMatch[1];
      }
    }
  }
  if (current) entries.push(current);
  return entries;
}

async function main() {
  const content = readFileSync(TOOLS_PATH, 'utf-8');
  const entries = parseTools(content);
  console.log(`Found ${entries.length} entries with GitHub URLs`);
  
  // Deduplicate repos
  const reposToFetch = new Map();
  for (const e of entries) {
    if (e.ownerRepo && e.stars !== null) {
      if (!reposToFetch.has(e.ownerRepo)) {
        reposToFetch.set(e.ownerRepo, []);
      }
      reposToFetch.get(e.ownerRepo).push(e);
    }
  }
  
  const repoArray = Array.from(reposToFetch.keys());
  console.log(`Unique repos to fetch: ${repoArray.length}`);
  
  const results = new Map();
  let fetched = 0;
  
  for (const repo of repoArray) {
    fetched++;
    if (fetched % 15 === 0) console.log(`  Progress: ${fetched}/${repoArray.length}`);
    const data = await fetchRepo(repo);
    if (data) {
      results.set(repo, {
        stars: data.stargazers_count,
        forks: data.forks_count,
        language: data.language,
        pushed_at: data.pushed_at,
        created_at: data.created_at,
        updated_at: data.updated_at ? data.updated_at.slice(0, 10) : null,
        topics: data.topics || [],
        homepage: data.homepage,
        open_issues: data.open_issues_count,
        license: data.license ? data.license.spdx_id : null,
      });
    }
    if (fetched < repoArray.length) await new Promise(r => setTimeout(r, 1100));
  }
  
  console.log(`\n✅ Fetched ${results.size} repos\n`);
  
  // Build line-by-line output with updates
  const lines = content.split('\n');
  const starsChanges = [];
  const dateUpdates = [];
  
  for (const [repo, data] of results) {
    const entryList = reposToFetch.get(repo);
    for (const entry of entryList) {
      if (entry.starsLine !== null && data.stars !== entry.stars) {
        const delta = data.stars - entry.stars;
        lines[entry.starsLine] = lines[entry.starsLine].replace(
          /(githubStars:\s*)\d+/,
          `$1${data.stars}`
        );
        starsChanges.push({ id: entry.id, old: entry.stars, new: data.stars, delta });
      }
      if (entry.updatedLine !== null && data.updated_at && data.updated_at > entry.updated) {
        lines[entry.updatedLine] = lines[entry.updatedLine].replace(
          /(updatedAt:\s*["'])\d{4}-\d{2}-\d{2}(["'])/,
          `$1${data.updated_at}$2`
        );
        dateUpdates.push({ id: entry.id, old: entry.updated, new: data.updated_at });
      }
    }
  }
  
  // Sort changes by delta
  starsChanges.sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta));
  
  writeFileSync(TOOLS_PATH, lines.join('\n'));
  
  console.log(`📊 Stars updated for ${starsChanges.length} tools`);
  console.log(`📅 Dates updated for ${dateUpdates.length} tools`);
  
  if (starsChanges.length > 0) {
    console.log('\n🔝 Top 5 changes:');
    for (const c of starsChanges.slice(0, 5)) {
      console.log(`  ${c.id}: ${c.old} → ${c.new} (${c.delta > 0 ? '+' : ''}${c.delta})`);
    }
  }
  
  // Collect all topics
  const allTopics = new Set();
  for (const [repo, data] of results) {
    data.topics.forEach(t => allTopics.add(t));
  }
  
  // Write summary
  const summary = {
    timestamp: new Date().toISOString(),
    updated: starsChanges.length,
    datesUpdated: dateUpdates.length,
    topChanges: starsChanges.slice(0, 5),
    newTopics: Array.from(allTopics),
    allChanges: starsChanges
  };
  writeFileSync('/tmp/github-update-summary.json', JSON.stringify(summary, null, 2));
  
  console.log(`\n✅ Done. Summary at /tmp/github-update-summary.json`);
}

main().catch(e => { console.error('Fatal:', e); process.exit(1); });
