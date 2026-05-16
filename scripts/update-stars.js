/**
 * Update GitHub stars for all tools in tools.ts and add new discoveries
 * Usage: node scripts/update-stars.js
 */

import { readFileSync, writeFileSync } from 'fs';
import { execSync } from 'child_process';

const TOKEN = process.env.GITHUB_TOKEN || '';
const TOOLS_PATH = './src/data/tools.ts';
const TOPICS_PATH = './data/ai-topics.json';

// Fetch repo info from GitHub API
async function fetchRepo(ownerRepo) {
  const url = `https://api.github.com/repos/${ownerRepo}?access_token=${TOKEN}`;
  try {
    const res = await fetch(url);
    if (!res.ok) {
      if (res.status === 404) return null;
      console.error(`  ⚠️ ${ownerRepo}: HTTP ${res.status}`);
      return null;
    }
    const data = await res.json();
    return {
      stars: data.stargazers_count,
      forks: data.forks_count,
      language: data.language || null,
      pushed_at: data.pushed_at || null,
      created_at: data.created_at || null,
      updated_at: data.updated_at ? data.updated_at.slice(0, 10) : null,
      topics: data.topics || [],
      homepage: data.homepage || null,
      open_issues: data.open_issues_count || 0,
      license: data.license ? data.license.spdx_id : null,
    };
  } catch (e) {
    console.error(`  ❌ ${ownerRepo}: ${e.message}`);
    return null;
  }
}

// Extract GitHub repos from tools.ts
function extractRepos(toolsContent) {
  const repos = new Set();
  const regex = /https:\/\/github\.com\/([A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+)/g;
  let match;
  while ((match = regex.exec(toolsContent)) !== null) {
    repos.add(match[1]);
  }
  return repos;
}

// Find which entries have which repo
function mapReposToEntries(toolsContent) {
  const mapping = new Map();
  const lines = toolsContent.split('\n');
  let currentId = null;
  let currentUrl = null;

  for (const line of lines) {
    const idMatch = line.match(/id:\s*["']([^"']+)["']/);
    if (idMatch) {
      if (currentId && currentUrl) {
        mapping.set(currentId, currentUrl);
      }
      currentId = idMatch[1];
      currentUrl = null;
    }
    const urlMatch = line.match(/url:\s*["'](https:\/\/github\.com\/[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+)["']/);
    if (urlMatch) {
      currentUrl = urlMatch[1];
    }
  }
  if (currentId && currentUrl) {
    mapping.set(currentId, currentUrl);
  }
  return mapping;
}

function extractOwnerRepo(url) {
  const match = url.match(/https:\/\/github\.com\/([A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+)/);
  return match ? match[1] : null;
}

async function main() {
  console.log('🚀 Starting GitHub data update...\n');

  // Read current tools.ts
  let toolsContent = readFileSync(TOOLS_PATH, 'utf-8');

  // Map entries to repos
  const idToUrl = mapReposToEntries(toolsContent);
  console.log(`📋 Found ${idToUrl.size} entries with GitHub URLs\n`);

  // Group by ownerRepo to avoid duplicate fetches
  const repoSet = new Set();
  for (const [id, url] of idToUrl) {
    const ownerRepo = extractOwnerRepo(url);
    if (ownerRepo) repoSet.add(ownerRepo);
  }

  const repos = Array.from(repoSet);
  console.log(`🔍 Fetching data for ${repos.length} unique repos...\n`);

  // Rate limiting: 1 request per second
  const results = new Map();
  for (let i = 0; i < repos.length; i++) {
    const repo = repos[i];
    const data = await fetchRepo(repo);
    if (data) {
      results.set(repo, data);
      if (i % 10 === 0) console.log(`  Progress: ${i + 1}/${repos.length}`);
    }
    if (i < repos.length - 1) await new Promise(r => setTimeout(r, 1000));
  }

  console.log(`\n✅ Fetched data for ${results.size} repos\n`);

  // Update stars in tools.ts using regex replacement
  let updated = 0;
  let maxChange = { tool: '', delta: 0 };

  for (const [id, url] of idToUrl) {
    const ownerRepo = extractOwnerRepo(url);
    if (!ownerRepo || !results.has(ownerRepo)) continue;

    const repoData = results.get(ownerRepo);
    const newStars = repoData.stars;

    // Find the current githubStars value for this id
    // Match pattern: after this id entry, find githubStars
    const entryRegex = new RegExp(
      `(id:\\s*["']${id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}["'][\\s\\S]*?githubStars:\\s*)(\\d+)(\\s*,?)`,
      'm'
    );
    const match = toolsContent.match(entryRegex);
    if (!match) continue;

    const oldStars = parseInt(match[2]);
    const delta = newStars - oldStars;

    if (delta !== 0) {
      toolsContent = toolsContent.replace(
        entryRegex,
        `$1${newStars}$3`
      );
      updated++;
      if (Math.abs(delta) > Math.abs(maxChange.delta)) {
        maxChange = { tool: id, delta };
      }
    }
  }

  // Update updatedAt where we have fresher data
  for (const [id, url] of idToUrl) {
    const ownerRepo = extractOwnerRepo(url);
    if (!ownerRepo || !results.has(ownerRepo)) continue;

    const repoData = results.get(ownerRepo);
    if (repoData.updated_at) {
      // Only update if the current updatedAt is older
      const updatedAtRegex = new RegExp(
        `(id:\\s*["']${id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}["'][\\s\\S]*?updatedAt:\\s*["'])(\\d{4}-\\d{2}-\\d{2})(["'])`,
        'm'
      );
      const match = toolsContent.match(updatedAtRegex);
      if (match) {
        const currentUpdatedAt = match[2];
        if (repoData.updated_at > currentUpdatedAt) {
          toolsContent = toolsContent.replace(
            updatedAtRegex,
            `$1${repoData.updated_at}$3`
          );
        }
      }
    }
  }

  console.log(`📝 Updated ${updated} tools' stars`);
  console.log(`📈 Biggest change: ${maxChange.tool} (${maxChange.delta > 0 ? '+' : ''}${maxChange.delta})`);

  // Collect all topics
  const allTopics = new Set();
  for (const [repo, data] of results) {
    if (data.topics) {
      data.topics.forEach(t => allTopics.add(t));
    }
  }

  // Write updated tools.ts
  writeFileSync(TOOLS_PATH, toolsContent);
  console.log(`\n💾 tools.ts updated`);

  // Output summary as JSON for the caller
  const summary = {
    updated: updated,
    maxChange: maxChange,
    totalReposFetched: results.size,
    newTopics: Array.from(allTopics).slice(0, 50),
    updatedEntries: []
  };

  writeFileSync('/tmp/github-update-summary.json', JSON.stringify(summary, null, 2));
  console.log(`\n📊 Summary saved to /tmp/github-update-summary.json`);
  console.log(summary);
}

main().catch(e => {
  console.error('Fatal error:', e);
  process.exit(1);
});
