import { readFileSync, writeFileSync } from 'fs';

// Read changes
const changes = JSON.parse(readFileSync('/tmp/github-changes.json', 'utf8'));
const changesMap = new Map();
for (const r of changes.results) {
  changesMap.set(r.id, r);
}

// Read file and split into lines
let content = readFileSync('src/data/tools.ts', 'utf8');
const lines = content.split('\n');

// Parse tool blocks by tracking id and githubStars fields
// Strategy: for each tool block, if we find its id and it has a change,
// replace the githubStars, forks, language, updatedAt fields within that block

let updatedStars = 0;
let updatedForks = 0;
let updatedLang = 0;
let updatedDate = 0;

// Process each tool block
let currentId = null;
let blockStart = -1;
let braceCount = 0;
let inBlock = false;
let starsLine = -1;
let forksLine = -1;
let langLine = -1;
let dateLine = -1;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  
  // Detect start of a tool object (look for id: "xxx")
  if (line.match(/\bid:\s*"/) && !inBlock) {
    const m = line.match(/\bid:\s*"([^"]+)"/);
    if (m) {
      currentId = m[1];
      blockStart = i;
      inBlock = true;
      braceCount = 0;
      starsLine = -1;
      forksLine = -1;
      langLine = -1;
      dateLine = -1;
    }
  }
  
  if (inBlock) {
    // Count braces
    for (const ch of line) {
      if (ch === '{') braceCount++;
      if (ch === '}') braceCount--;
    }
    
    // Track relevant fields
    if (starsLine === -1 && line.match(/githubStars:\s*\d+/)) {
      starsLine = i;
    }
    if (forksLine === -1 && line.match(/forks:\s*\d+/)) {
      forksLine = i;
    }
    if (langLine === -1 && line.match(/language:\s*"[^"]+"/)) {
      langLine = i;
    }
    if (dateLine === -1 && line.match(/updatedAt:\s*"[^"]+"/)) {
      dateLine = i;
    }
    
    // End of block
    if (braceCount <= 0) {
      const change = changesMap.get(currentId);
      if (change) {
        // Update stars
        if (starsLine >= 0) {
          const oldVal = parseInt(lines[starsLine].match(/githubStars:\s*(\d+)/)[1]);
          if (oldVal === change.oldStars && oldVal !== change.newStars) {
            lines[starsLine] = lines[starsLine].replace(/githubStars:\s*\d+/, `githubStars: ${change.newStars}`);
            updatedStars++;
          }
        }
        
        // Update forks
        if (forksLine >= 0) {
          const oldVal = parseInt(lines[forksLine].match(/forks:\s*(\d+)/)[1]);
          if (oldVal === change.oldForks && oldVal !== change.newForks) {
            lines[forksLine] = lines[forksLine].replace(/forks:\s*\d+/, `forks: ${change.newForks}`);
            updatedForks++;
          }
        }
        
        // Update language
        if (langLine >= 0 && change.oldLanguage !== 'N/A' && change.newLanguage !== 'N/A') {
          const oldVal = lines[langLine].match(/language:\s*"([^"]+)"/)[1];
          if (oldVal === change.oldLanguage && oldVal !== change.newLanguage) {
            lines[langLine] = lines[langLine].replace(/language:\s*"[^"]+"/, `language: "${change.newLanguage}"`);
            updatedLang++;
          }
        }
        
        // Update updatedAt
        if (dateLine >= 0 && change.pushedAt) {
          const newDate = change.pushedAt.split('T')[0];
          const oldDate = lines[dateLine].match(/updatedAt:\s*"([^"]+)"/)[1];
          if (oldDate !== newDate) {
            lines[dateLine] = lines[dateLine].replace(/updatedAt:\s*"[^"]+"/, `updatedAt: "${newDate}"`);
            updatedDate++;
          }
        }
      }
      
      // Reset for next block
      currentId = null;
      inBlock = false;
    }
  }
}

// Write back
writeFileSync('src/data/tools.ts', lines.join('\n'));
console.log(`Updated: ${updatedStars} stars, ${updatedForks} forks, ${updatedLang} languages, ${updatedDate} dates`);

// Quick verification
const final = readFileSync('src/data/tools.ts', 'utf8');
console.log('Has ollama 170437?', final.includes('githubStars: 170437'));
console.log('Has open-webui 135009?', final.includes('githubStars: 135009'));
console.log('Has prompts-chat 161268?', final.includes('githubStars: 161268'));
