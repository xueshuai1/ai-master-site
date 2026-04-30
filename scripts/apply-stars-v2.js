#!/usr/bin/env node
// Apply GitHub data updates to tools.ts

const fs = require('fs');
const path = require('path');

const TOOLS_PATH = path.join(__dirname, '..', 'src', 'data', 'tools.ts');
const RESULTS_PATH = '/tmp/stars-update-results.json';

const results = JSON.parse(fs.readFileSync(RESULTS_PATH, 'utf-8'));
let content = fs.readFileSync(TOOLS_PATH, 'utf-8');
let changed = false;

const resultMap = {};
for (const r of results.results) {
  if (!r.error) resultMap[r.repo] = r;
}

const starsChanges = [];

// For each repo, find it in tools.ts by URL and update fields
for (const [repo, data] of Object.entries(resultMap)) {
  // Build URL pattern - match the github.com/owner/repo part
  // Tools might have URLs like https://github.com/owner/repo or https://github.com/owner/repo/something
  const urlPattern = `github.com/${repo}`;
  
  // Find the tool block by looking for this URL
  // Strategy: find the line with this URL, then look for githubStars/forks/language within ~30 lines
  const lines = content.split('\n');
  let urlLineIndex = -1;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes(urlPattern)) {
      urlLineIndex = i;
      break;
    }
  }
  
  if (urlLineIndex === -1) continue;
  
  // Search for githubStars, forks, language in the next ~50 lines
  let blockEnd = Math.min(urlLineIndex + 60, lines.length);
  let blockContent = lines.slice(urlLineIndex, blockEnd).join('\n');
  
  // Update githubStars
  const oldStarsMatch = blockContent.match(/githubStars:\s*(\d+)/);
  if (oldStarsMatch) {
    const oldStars = parseInt(oldStarsMatch[1]);
    if (data.stars !== oldStars) {
      starsChanges.push({ repo, old: oldStars, new: data.stars, delta: data.stars - oldStars });
      const oldStr = `githubStars: ${oldStars}`;
      const newStr = `githubStars: ${data.stars}`;
      content = content.replace(oldStr, newStr);
      changed = true;
    }
  }
  
  // Update forks
  const oldForksMatch = blockContent.match(/forks:\s*(\d+)/);
  if (oldForksMatch) {
    const oldForks = parseInt(oldForksMatch[1]);
    if (data.forks !== undefined && data.forks !== null && data.forks !== oldForks) {
      const oldStr = `forks: ${oldForks}`;
      const newStr = `forks: ${data.forks}`;
      content = content.replace(oldStr, newStr);
      changed = true;
    }
  } else if (data.forks !== undefined && data.forks !== null && data.forks > 0) {
    // Add forks field - find a good insertion point (after githubStars or createdAt)
    const afterStars = content.match(/githubStars: \d+[,\s\n]/);
    if (afterStars) {
      // Insert forks after githubStars line
      content = content.replace(
        /(githubStars:\s*\d+,\n)/,
        `$1    forks: ${data.forks},\n`
      );
      changed = true;
    }
  }
  
  // Update language
  const oldLangMatch = blockContent.match(/language:\s*["']([^"']+)["']/);
  if (oldLangMatch && data.language && data.language !== 'None' && data.language !== 'N/A') {
    const oldLang = oldLangMatch[1];
    if (data.language !== oldLang) {
      const oldStr = `language: "${oldLang}"`;
      const newStr = `language: "${data.language}"`;
      content = content.replace(oldStr, newStr);
      changed = true;
    }
  } else if (!oldLangMatch && data.language && data.language !== 'None' && data.language !== 'N/A') {
    // Add language field after forks or githubStars
    const insertPoint = content.match(/(forks:\s*\d+,\n)/);
    if (insertPoint) {
      content = content.replace(
        /(forks:\s*\d+,\n)/,
        `$1    language: "${data.language}",\n`
      );
      changed = true;
    }
  }
}

if (changed) {
  fs.writeFileSync(TOOLS_PATH, content);
  console.log('✅ tools.ts updated');
} else {
  console.log('✅ No changes to tools.ts');
}

// Print summary
console.log(`\n⭐ Stars changes (${starsChanges.length}):`);
const sorted = starsChanges.sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta));
for (const c of sorted.slice(0, 15)) {
  const sign = c.delta >= 0 ? '+' : '';
  console.log(`   ${c.repo}: ${c.old.toLocaleString()} → ${c.new.toLocaleString()} (${sign}${c.delta.toLocaleString()})`);
}

// Save changes summary
fs.writeFileSync('/tmp/stars-changes.json', JSON.stringify(starsChanges, null, 2));
