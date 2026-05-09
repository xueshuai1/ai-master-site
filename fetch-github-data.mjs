#!/usr/bin/env node
import { readFileSync, writeFileSync } from 'fs';

const TOOLS_PATH = './src/data/tools.ts';
const OUTPUT_PATH = '/tmp/github-repos-data.json';

const envContent = readFileSync('.env.local', 'utf-8');
const GITHUB_TOKEN = envContent.match(/GITHUB_TOKEN=(.+)/)?.[1]?.trim();
if (!GITHUB_TOKEN) { console.error('No token'); process.exit(1); }

const toolsContent = readFileSync(TOOLS_PATH, 'utf-8');
const urlRegex = /https:\/\/github\.com\/([a-zA-Z0-9_.-]+\/[a-zA-Z0-9_.-]+)/g;
const repos = [...new Set([...toolsContent.matchAll(urlRegex)].map(m => m[1]))];
console.log(`Found ${repos.length} unique repos`);

const results = {};
let fetched = 0;

for (let i = 0; i < repos.length; i++) {
  const repo = repos[i];
  try {
    const res = await fetch(`https://api.github.com/repos/${repo}`, {
      headers: {
        'Authorization': `Bearer ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28'
      }
    });
    if (res.status === 404) { fetched++; continue; }
    if (res.status === 403) {
      const reset = res.headers.get('x-ratelimit-reset');
      if (reset) {
        const wait = parseInt(reset) * 1000 - Date.now() + 2000;
        console.log(`  Rate limited, sleeping ${Math.ceil(wait/1000)}s`);
        await new Promise(r => setTimeout(r, Math.min(wait, 120000)));
      } else {
        await new Promise(r => setTimeout(r, 60000));
      }
      i--; continue;
    }
    if (!res.ok) { console.log(`  HTTP ${res.status}: ${repo}`); fetched++; continue; }
    const d = await res.json();
    results[repo] = {
      stars: d.stargazers_count,
      forks: d.forks_count,
      language: d.language || null,
      topics: d.topics || [],
      pushed_at: d.pushed_at,
    };
    fetched++;
    if (fetched % 20 === 0) console.log(`  Progress: ${fetched}/${repos.length}`);
  } catch (e) {
    console.error(`  Error ${repo}: ${e.message}`);
    fetched++;
  }
  if (i < repos.length - 1) await new Promise(r => setTimeout(r, 1100));
}

writeFileSync(OUTPUT_PATH, JSON.stringify({ repos, data: results }, null, 2));
console.log(`\nDone: ${Object.keys(results).length}/${repos.length} repos fetched`);
