#!/usr/bin/env node
// Simple and reliable: process file from end to start, replacing each tool block
import { readFileSync, writeFileSync } from 'fs';

const results = JSON.parse(readFileSync('/tmp/github-update-results.json', 'utf8'));
let content = readFileSync('src/data/tools.ts', 'utf8');

// Dedup updates - last entry wins
const starsMap = new Map();
const forksMap = new Map();
const langMap = new Map();
for (const u of results.starsUpdates) starsMap.set(u.id, u);
for (const u of results.forksUpdates) forksMap.set(u.id, u);
for (const u of results.languageUpdates) langMap.set(u.id, u);

const allIds = new Set([...starsMap.keys(), ...forksMap.keys(), ...langMap.keys()]);
console.log(`${allIds.size} tools need updates`);

// Find each tool's position and process from end to start
const toolPositions = [];

for (const id of allIds) {
  // Find the id field
  const quotePos = content.indexOf(`"${id}"`);
  if (quotePos === -1) continue;
  
  // Find opening brace before this id
  let braceStart = quotePos;
  while (braceStart > 0 && content[braceStart] !== '{') braceStart--;
  
  // Find matching closing brace
  let depth = 0;
  let braceEnd = braceStart;
  for (let i = braceStart; i < content.length; i++) {
    if (content[i] === '{') depth++;
    else if (content[i] === '}') {
      depth--;
      if (depth === 0) { braceEnd = i + 1; break; }
    }
  }
  
  toolPositions.push({ id, start: braceStart, end: braceEnd });
}

// Sort descending by position
toolPositions.sort((a, b) => b.start - a.start);

let changed = 0;

for (const { id, start, end } of toolPositions) {
  let block = content.substring(start, end);
  let updated = block;
  let mod = false;
  
  // 1. Update stars
  const su = starsMap.get(id);
  if (su && su.oldStars !== undefined) {
    const regex = new RegExp(`githubStars:\\s*${su.oldStars}\\b`);
    if (regex.test(updated)) {
      updated = updated.replace(regex, `githubStars: ${su.new}`);
      mod = true;
    }
  }
  
  // 2. Update or add forks
  const fu = forksMap.get(id);
  if (fu) {
    if (/forks:\s*\d+/.test(updated)) {
      updated = updated.replace(/forks:\s*\d+/, `forks: ${fu.new}`);
      mod = true;
    } else {
      // Insert after githubStars or updatedAt or createdAt
      const m = updated.match(/(githubStars:\s*\d+[,\s]*\n)/) 
             || updated.match(/(updatedAt:\s*"[^"]*"[,\s]*\n)/)
             || updated.match(/(createdAt:\s*"[^"]*"[,\s]*\n)/);
      if (m) {
        updated = updated.replace(m[0], `${m[0]}    forks: ${fu.new},\n`);
        mod = true;
      }
    }
  }
  
  // 3. Update or add language
  const lu = langMap.get(id);
  if (lu) {
    if (/language:\s*"[^"]*"/.test(updated)) {
      updated = updated.replace(/language:\s*"[^"]*"/, `language: "${lu.new}"`);
      mod = true;
    } else {
      // Insert after forks, githubStars, or createdAt
      const m = /forks:\s*\d+[,\s]*\n/.test(updated)
        ? updated.match(/(forks:\s*\d+[,\s]*\n)/)
        : updated.match(/(githubStars:\s*\d+[,\s]*\n)/)
        || updated.match(/(updatedAt:\s*"[^"]*"[,\s]*\n)/)
        || updated.match(/(createdAt:\s*"[^"]*"[,\s]*\n)/);
      if (m) {
        updated = updated.replace(m[0], `${m[0]}    language: "${lu.new}",\n`);
        mod = true;
      }
    }
  }
  
  if (mod) {
    content = content.substring(0, start) + updated + content.substring(end);
    changed++;
  }
}

writeFileSync('src/data/tools.ts', content, 'utf8');
console.log(`Updated ${changed} out of ${toolPositions.length} tool blocks`);
