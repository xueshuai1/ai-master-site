import { readFileSync, writeFileSync } from 'fs';
import { execSync as childExecSync } from 'child_process';

const envContent = readFileSync('/Users/xueshuai/.openclaw/workspace/ai-master-site/.env.local', 'utf8');
const GITHUB_TOKEN = envContent.match(/GITHUB_TOKEN=(.+)/)?.[1]?.trim();
if (!GITHUB_TOKEN) { console.error('No token'); process.exit(1); }

const toolsPath = '/Users/xueshuai/.openclaw/workspace/ai-master-site/src/data/tools.ts';
const toolsContent = readFileSync(toolsPath, 'utf8');

// Extract repos
const urlRegex = /url:\s*"https:\/\/github\.com\/([^/]+)\/([^"/]+)/g;
const repos = [];
let m;
while ((m = urlRegex.exec(toolsContent)) !== null) {
  const owner = m[1];
  const repo = m[2].replace(/\/.*$/, '');
  if (owner === 'features') continue;
  const key = `${owner}/${repo}`;
  if (!repos.some(r => r.key === key)) repos.push({ key, owner, repo });
}
console.log(`Found ${repos.length} unique GitHub repos`);

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function fetchRepo(key, owner, repo, retries = 2) {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const result = childExecSync(
        `curl -s --connect-timeout 8 --max-time 12 -H "Authorization: token ${GITHUB_TOKEN}" -H "Accept: application/vnd.github.v3+json" "https://api.github.com/repos/${owner}/${repo}"`,
        { encoding: 'utf8' }
      );
      const data = JSON.parse(result);
      if (data.message && data.message.includes('Not Found')) return null;
      if (data.message && data.message.includes('rate limit')) {
        console.log(`  ⚠️ Rate limited for ${key}, waiting...`);
        await sleep(60000);
        continue;
      }
      return {
        stargazers_count: data.stargazers_count ?? null,
        pushed_at: data.pushed_at ?? null,
        forks_count: data.forks_count ?? null,
        language: data.language ?? null,
        topics: data.topics || []
      };
    } catch (e) {
      if (attempt < retries) {
        await sleep(2000 * (attempt + 1));
      } else {
        console.log(`  ❌ ${key}: ${e.message?.substring(0, 80)}`);
      }
    }
  }
  return null;
}

const repoData = {};
const allTopicCounts = new Map();
let failed = 0;

// Process in batches of 3 for rate limiting
for (let i = 0; i < repos.length; i++) {
  const r = repos[i];
  if (i % 30 === 0) console.log(`Progress: ${i}/${repos.length} (fetched: ${Object.keys(repoData).length}, failed: ${failed})`);
  
  const data = await fetchRepo(r.key, r.owner, r.repo);
  if (data) {
    repoData[r.key] = data;
    data.topics.forEach(t => {
      const n = t.toLowerCase().replace(/\s+/g, '-');
      allTopicCounts.set(n, (allTopicCounts.get(n) || 0) + 1);
    });
  } else {
    failed++;
  }
  
  if (i < repos.length - 1) await sleep(1000);
}

writeFileSync('/tmp/github-fetch-results.json', JSON.stringify({
  repoData,
  allTopicCounts: Object.fromEntries(allTopicCounts),
  totalFound: repos.length,
  totalFetched: Object.keys(repoData).length,
  totalFailed: failed
}, null, 2));
console.log(`\n✅ Done: ${Object.keys(repoData).length} fetched, ${failed} failed out of ${repos.length}`);
