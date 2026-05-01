import { readFileSync, writeFileSync } from 'fs';

const changes = JSON.parse(readFileSync('/tmp/github-changes.json', 'utf8'));
const changesMap = new Map();
for (const r of changes.results) {
  changesMap.set(r.id, r);
}

let content = readFileSync('src/data/tools.ts', 'utf8');
const lines = content.split('\n');

// First pass: identify which tool block belongs to which id
const toolBlocks = []; // {id, startLine, endLine}
let currentId = null;
let braceCount = 0;
let inTool = false;
let startLine = -1;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  
  if (line.match(/\bid:\s*"/) && !inTool) {
    const m = line.match(/\bid:\s*"([^"]+)"/);
    if (m) {
      currentId = m[1];
      startLine = i;
      inTool = true;
      braceCount = 0;
    }
  }
  
  if (inTool) {
    for (const ch of line) {
      if (ch === '{') braceCount++;
      if (ch === '}') braceCount--;
    }
    if (braceCount <= 0) {
      toolBlocks.push({ id: currentId, startLine, endLine: i });
      currentId = null;
      inTool = false;
    }
  }
}

console.log(`Found ${toolBlocks.length} tool blocks`);

// Second pass: update each tool block
let updated = 0;
for (const block of toolBlocks) {
  const change = changesMap.get(block.id);
  if (!change) continue;
  
  for (let i = block.startLine; i <= block.endLine; i++) {
    // Update githubStars
    const starsMatch = lines[i].match(/githubStars:\s*(\d+)/);
    if (starsMatch && parseInt(starsMatch[1]) === change.oldStars && change.oldStars !== change.newStars) {
      lines[i] = lines[i].replace(/githubStars:\s*\d+/, `githubStars: ${change.newStars}`);
    }
    
    // Update forks
    const forksMatch = lines[i].match(/forks:\s*(\d+)/);
    if (forksMatch && parseInt(forksMatch[1]) === change.oldForks && change.oldForks !== change.newForks) {
      lines[i] = lines[i].replace(/forks:\s*\d+/, `forks: ${change.newForks}`);
    }
    
    // Update language
    const langMatch = lines[i].match(/language:\s*"([^"]+)"/);
    if (langMatch && langMatch[1] === change.oldLanguage && change.oldLanguage !== 'N/A' && change.newLanguage !== 'N/A' && change.oldLanguage !== change.newLanguage) {
      lines[i] = lines[i].replace(/language:\s*"[^"]+"/, `language: "${change.newLanguage}"`);
    }
    
    // Update updatedAt
    const updatedMatch = lines[i].match(/updatedAt:\s*"([^"]+)"/);
    if (updatedMatch && change.pushedAt) {
      const newDate = change.pushedAt.split('T')[0];
      if (updatedMatch[1] !== newDate) {
        lines[i] = lines[i].replace(/updatedAt:\s*"[^"]+"/, `updatedAt: "${newDate}"`);
      }
    }
  }
  updated++;
}

writeFileSync('src/data/tools.ts', lines.join('\n'));
console.log(`Updated ${updated} tool blocks`);

// Verify
const newContent = readFileSync('src/data/tools.ts', 'utf8');
const starCount = (newContent.match(/githubStars/g) || []).length;
console.log(`githubStars fields: ${starCount}`);
