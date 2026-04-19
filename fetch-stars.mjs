// Extract all GitHub repos from tools.ts and fetch their stars
import { readFileSync, writeFileSync } from 'fs';

const content = readFileSync('./src/data/tools.ts', 'utf-8');

// Extract url: "..." patterns
const urlMatches = content.matchAll(/url:\s*"(https:\/\/github\.com\/[^"]+)"/g);
const tools = [];
for (const m of urlMatches) {
  const url = m[1];
  // Find the tool id from the context (look backward for id:)
  const pos = m.index;
  const before = content.substring(Math.max(0, pos - 500), pos);
  const idMatch = before.match(/id:\s*"([^"]+)"/g);
  const id = idMatch ? idMatch[idMatch.length - 1].match(/id:\s*"([^"]+)"/)[1] : 'unknown';
  
  // Parse repo
  const repoMatch = url.match(/github\.com\/([^\/]+\/[^\/\?]+)/);
  const repo = repoMatch ? repoMatch[1] : null;
  
  tools.push({ id, url, repo });
}

console.log(`Found ${tools.length} GitHub URL tools`);

// Fetch stars
const results = {};
for (const { id, repo, url } of tools) {
  if (!repo) {
    // Try to handle org-level URLs
    if (url === 'https://github.com/MiniMax-AI') {
      // Try MMX-CLI repo specifically
      const resp = await fetch('https://api.github.com/repos/MiniMax-AI/MMX-CLI', {
        headers: { 'User-Agent': 'AI-Master-Site' }
      });
      if (resp.ok) {
        const data = await resp.json();
        results[id] = data.stargazers_count;
        console.log(`✓ ${id} → MiniMax-AI/MMX-CLI → ${data.stargazers_count}`);
      } else {
        results[id] = null;
        console.log(`✗ ${id} → MiniMax-AI/MMX-CLI → HTTP ${resp.status}`);
      }
      await new Promise(r => setTimeout(r, 150));
      continue;
    }
    if (url === 'https://github.com/everything-claude-code') {
      results[id] = null;
      console.log(`✗ ${id} → org URL, skipping`);
      continue;
    }
    results[id] = null;
    console.log(`✗ ${id} → no repo parsed`);
    continue;
  }
  
  try {
    const resp = await fetch(`https://api.github.com/repos/${repo}`, {
      headers: { 'User-Agent': 'AI-Master-Site' }
    });
    if (resp.ok) {
      const data = await resp.json();
      results[id] = data.stargazers_count;
      console.log(`✓ ${id} → ${repo} → ${data.stargazers_count}`);
    } else if (resp.status === 403) {
      const body = await resp.text();
      console.log(`✗ Rate limited on ${repo}: ${body.substring(0, 100)}`);
      results[id] = 'rate_limited';
    } else {
      console.log(`✗ ${id} → ${repo} → HTTP ${resp.status}`);
      results[id] = null;
    }
  } catch (e) {
    console.log(`✗ ${id} → ${repo} → ${e.message}`);
    results[id] = null;
  }
  
  // Rate limit: GitHub allows 60/hr unauthenticated
  await new Promise(r => setTimeout(r, 1200));
}

writeFileSync('./reports/stars-results.json', JSON.stringify(results, null, 2));
console.log('\nDone. Results written to reports/stars-results.json');

// Count successes/rate_limited/fails
const ok = Object.values(results).filter(v => typeof v === 'number').length;
const rl = Object.values(results).filter(v => v === 'rate_limited').length;
const fail = Object.values(results).filter(v => v === null).length;
console.log(`Success: ${ok}, Rate limited: ${rl}, Failed: ${fail}`);
