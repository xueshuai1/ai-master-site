#!/usr/bin/env node
// Apply GitHub data updates to tools.ts

const fs = require('fs');
const path = require('path');

const TOOLS_PATH = path.join(__dirname, '..', 'src', 'data', 'tools.ts');
const RESULTS_PATH = '/tmp/stars-update-results.json';

function getIndent(text) {
  const lines = text.split('\n');
  for (const line of lines) {
    const m = line.match(/^(\s+)/);
    if (m && m[1].length > 0) return m[1].length;
  }
  return 4;
}

const results = JSON.parse(fs.readFileSync(RESULTS_PATH, 'utf-8'));
let content = fs.readFileSync(TOOLS_PATH, 'utf-8');

const resultMap = {};
for (const r of results.results) {
  if (!r.error) resultMap[r.repo] = r;
}

// Find all tool blocks by "id:" markers
const idRegex = /(\{\s*\n\s*id:\s*["']([^"']+)["'])/g;
const toolStarts = [];
let m;
while ((m = idRegex.exec(content)) !== null) {
  toolStarts.push({ index: m.index, id: m[2] });
}

// For each tool, find its closing brace
const toolBlocks = [];
for (let i = 0; i < toolStarts.length; i++) {
  const start = toolStarts[i].index;
  const nextStart = i + 1 < toolStarts.length ? toolStarts[i + 1].index : content.length;
  let braceCount = 0;
  let blockEnd = start;
  for (let j = start; j < nextStart; j++) {
    if (content[j] === '{') braceCount++;
    else if (content[j] === '}') {
      braceCount--;
      if (braceCount === 0) { blockEnd = j + 1; break; }
    }
  }
  toolBlocks.push({
    id: toolStarts[i].id,
    start, end: blockEnd,
    text: content.substring(start, blockEnd)
  });
}

console.log(`Found ${toolBlocks.length} tool blocks`);

const starsChanges = [];
let updatedBlocks = 0, forksUpdates = 0, langUpdates = 0;

for (let i = 0; i < toolBlocks.length; i++) {
  const block = toolBlocks[i];
  const urlMatch = block.text.match(/url:\s*["']https:\/\/github\.com\/([^"']+)["']/);
  if (!urlMatch) continue;
  const repo = urlMatch[1].trim();
  const data = resultMap[repo];
  if (!data) continue;

  let newText = block.text;
  let blockChanged = false;
  const indent = ' '.repeat(getIndent(newText));

  // Stars
  const starsMatch = newText.match(/githubStars:\s*(\d+)/);
  if (starsMatch) {
    const oldStars = parseInt(starsMatch[1]);
    if (data.stars !== oldStars) {
      starsChanges.push({ repo, old: oldStars, new: data.stars, delta: data.stars - oldStars });
      newText = newText.replace(/githubStars:\s*\d+/, `githubStars: ${data.stars}`);
      blockChanged = true;
    }
  }

  // Forks
  const forksMatch = newText.match(/forks:\s*(\d+)/);
  if (forksMatch) {
    const oldForks = parseInt(forksMatch[1]);
    if (data.forks != null && data.forks !== oldForks) {
      newText = newText.replace(/forks:\s*\d+/, `forks: ${data.forks}`);
      forksUpdates++; blockChanged = true;
    }
  } else if (data.forks != null && data.forks > 0) {
    newText = newText.replace(/(githubStars:\s*\d+,?\n)/, `$1${indent}forks: ${data.forks},\n`);
    forksUpdates++; blockChanged = true;
  }

  // Language
  const langMatch = newText.match(/language:\s*["']([^"']+)["']/);
  if (langMatch && data.language && data.language !== 'None' && data.language !== 'N/A') {
    if (data.language !== langMatch[1]) {
      newText = newText.replace(/language:\s*["'][^"']+["']/, `language: "${data.language}"`);
      langUpdates++; blockChanged = true;
    }
  } else if (!langMatch && data.language && data.language !== 'None' && data.language !== 'N/A') {
    newText = newText.replace(/(forks:\s*\d+,?\n)/, `$1${indent}language: "${data.language}",\n`);
    langUpdates++; blockChanged = true;
  }

  if (blockChanged) {
    content = content.substring(0, block.start) + newText + content.substring(block.end);
    updatedBlocks++;
    const diff = newText.length - block.text.length;
    for (let j = i + 1; j < toolBlocks.length; j++) {
      toolBlocks[j].start += diff;
      toolBlocks[j].end += diff;
    }
  }
}

fs.writeFileSync(TOOLS_PATH, content);

console.log(`📊 Summary:`);
console.log(`  Blocks updated: ${updatedBlocks}`);
console.log(`  Stars changes: ${starsChanges.length}`);
console.log(`  Forks updates: ${forksUpdates}`);
console.log(`  Language updates: ${langUpdates}`);

console.log(`\n⭐ Stars changes:`);
const sorted = starsChanges.sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta));
for (const c of sorted.slice(0, 15)) {
  const s = c.delta >= 0 ? '+' : '';
  console.log(`  ${c.repo}: ${c.old.toLocaleString()} → ${c.new.toLocaleString()} (${s}${c.delta.toLocaleString()})`);
}

fs.writeFileSync('/tmp/stars-changes.json', JSON.stringify(starsChanges, null, 2));
