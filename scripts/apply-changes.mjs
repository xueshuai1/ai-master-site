import { readFileSync, writeFileSync } from 'fs';

// Read changes
const changes = JSON.parse(readFileSync('/tmp/github-changes.json', 'utf8'));
const changesMap = new Map();
for (const r of changes.results) {
  changesMap.set(r.id, r);
}

// Read tools.ts
let content = readFileSync('src/data/tools.ts', 'utf8');

// Build the full content of tools.ts with updated values
const lines = content.split('\n');
const updatedLines = [...lines];
let updated = 0;

// Parse tools and update
let currentId = null;
let currentToolLines = [];
let toolStartLine = -1;
let braceCount = 0;
let inTool = false;

const toolUpdates = []; // {startLine, endLine, id, stars?, forks?, lang?, updatedAt?}

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  
  if (line.includes('id:') && line.includes('"') && !inTool) {
    const idMatch = line.match(/id:\s*"([^"]+)"/);
    if (idMatch) {
      currentId = idMatch[1];
      toolStartLine = i;
      currentToolLines = [i];
      inTool = true;
      braceCount = 0;
    }
  } else if (inTool) {
    currentToolLines.push(i);
    for (const ch of line) {
      if (ch === '{') braceCount++;
      if (ch === '}') braceCount--;
    }
    
    if (braceCount <= 0) {
      // End of tool block
      const change = changesMap.get(currentId);
      if (change) {
        toolUpdates.push({
          startLine: toolStartLine,
          endLine: i,
          id: currentId,
          newStars: change.newStars,
          newForks: change.newForks,
          newLanguage: change.newLanguage,
          newUpdatedAt: change.pushedAt ? change.pushedAt.split('T')[0] : null,
          oldStars: change.oldStars,
          oldForks: change.oldForks,
          oldLanguage: change.oldLanguage
        });
        updated++;
      }
      
      currentId = null;
      currentToolLines = [];
      inTool = false;
    }
  }
}

console.log(`Tools to update: ${toolUpdates.length}`);

// Now apply updates by modifying lines directly
// We need to update specific fields in each tool block

for (const upd of toolUpdates) {
  for (let i = upd.startLine; i <= upd.endLine; i++) {
    // Update githubStars
    const starsMatch = updatedLines[i].match(/(githubStars:\s*)(\d+)/);
    if (starsMatch && parseInt(starsMatch[2]) === upd.oldStars) {
      updatedLines[i] = updatedLines[i].replace(
        /githubStars:\s*\d+/,
        `githubStars: ${upd.newStars}`
      );
    }
    
    // Update forks
    const forksMatch = updatedLines[i].match(/(forks:\s*)(\d+)/);
    if (forksMatch && parseInt(forksMatch[2]) === upd.oldForks) {
      updatedLines[i] = updatedLines[i].replace(
        /forks:\s*\d+/,
        `forks: ${upd.newForks}`
      );
    }
    
    // Update language
    const langMatch = updatedLines[i].match(/(language:\s*)"([^"]+)"/);
    if (langMatch && langMatch[2] === upd.oldLanguage && upd.newLanguage !== 'N/A') {
      updatedLines[i] = updatedLines[i].replace(
        /language:\s*"[^"]+"/,
        `language: "${upd.newLanguage}"`
      );
    }
    
    // Update updatedAt if it exists
    const updatedMatch = updatedLines[i].match(/(updatedAt:\s*)"([^"]+)"/);
    if (updatedMatch && upd.newUpdatedAt) {
      updatedLines[i] = updatedLines[i].replace(
        /updatedAt:\s*"[^"]+"/,
        `updatedAt: "${upd.newUpdatedAt}"`
      );
    }
  }
}

// Write back
writeFileSync('src/data/tools.ts', updatedLines.join('\n'));
console.log(`Updated ${updated} tools in tools.ts`);

// Verify stars count
const starCount = (content.match(/githubStars/g) || []).length;
const newStarCount = (updatedLines.join('\n').match(/githubStars/g) || []).length;
console.log(`githubStars fields: before=${starCount}, after=${newStarCount}`);
