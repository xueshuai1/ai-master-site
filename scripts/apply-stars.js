#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const data = JSON.parse(fs.readFileSync('/tmp/github-update-output.json', 'utf-8'));
const toolsPath = path.join(__dirname, '../src/data/tools.ts');
const lines = fs.readFileSync(toolsPath, 'utf-8').split('\n');

// Build a map of tool id -> index in the results for quick lookup
const resultById = {};
for (const r of data.results) {
  resultById[r.id] = r;
}

let updatesCount = 0;
let currentId = null;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  
  // Detect tool id (only as a field declaration, not inside strings)
  const idMatch = line.match(/^\s*id:\s*["']([^"']+)["']/);
  if (idMatch) {
    currentId = idMatch[1];
  }
  
  if (!currentId || !resultById[currentId]) continue;
  
  const r = resultById[currentId];
  
  // Update githubStars
  const starsMatch = line.match(/^(\s*githubStars:\s*)(\d+)(.*)$/);
  if (starsMatch && parseInt(starsMatch[2]) !== r.newStars) {
    lines[i] = `${starsMatch[1]}${r.newStars}${starsMatch[3]}`;
    updatesCount++;
    continue;
  }
  
  // Update forks
  if (r.newForks !== undefined) {
    const forksMatch = line.match(/^(\s*forks:\s*)(\d+)(.*)$/);
    if (forksMatch && parseInt(forksMatch[2]) !== r.newForks) {
      lines[i] = `${forksMatch[1]}${r.newForks}${forksMatch[3]}`;
      updatesCount++;
      continue;
    }
  }
  
  // Update language
  if (r.newLanguage && r.newLanguage !== r.oldLanguage) {
    const langMatch = line.match(/^(\s*language:\s*["'])([^"']+)["'](.*)$/);
    if (langMatch) {
      lines[i] = `${langMatch[1]}${r.newLanguage}'${langMatch[3]}`;
      updatesCount++;
      continue;
    }
  }
  
}

// Remove trailing id reset logic (not needed since each tool has exactly one id)

fs.writeFileSync(toolsPath, lines.join('\n'));
console.log(`Applied ${updatesCount} field updates to tools.ts`);
