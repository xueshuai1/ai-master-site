import { readFileSync, writeFileSync } from 'fs';

const changes = JSON.parse(readFileSync('/tmp/github-changes.json', 'utf8'));
const changesMap = new Map();
for (const r of changes.results) {
  changesMap.set(r.id, r);
}

let content = readFileSync('src/data/tools.ts', 'utf8');
const lines = content.split('\n');

// Find all tool objects by looking for "id:" lines within the tools array
// Each tool object spans from { after export const tools: Tool[] = [ to the matching }

let updatedStars = 0;
let updatedForks = 0;
let updatedLang = 0;
let updatedDate = 0;

// Simple approach: find each id: "xxx" line, then look for githubStars in subsequent lines
// until we hit the next id: or end of tools array
let inTools = false;
let currentId = null;
let currentIdLine = -1;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  
  // Detect start of tools array
  if (line.includes('export const tools: Tool[] = [')) {
    inTools = true;
    continue;
  }
  
  // Detect end of tools array
  if (inTools && line.trim() === '];') {
    inTools = false;
    continue;
  }
  
  if (inTools) {
    // Look for id: "xxx"
    const idMatch = line.match(/id:\s*"([^"]+)"/);
    if (idMatch) {
      currentId = idMatch[1];
      currentIdLine = i;
    }
    
    // If we have a current id, look for githubStars, forks, language, updatedAt
    if (currentId) {
      const change = changesMap.get(currentId);
      if (change) {
        // githubStars
        const starsMatch = line.match(/githubStars:\s*(\d+)/);
        if (starsMatch) {
          const oldVal = parseInt(starsMatch[1]);
          if (oldVal === change.oldStars && oldVal !== change.newStars) {
            lines[i] = lines[i].replace(/githubStars:\s*\d+/, `githubStars: ${change.newStars}`);
            updatedStars++;
          }
        }
        
        // forks
        const forksMatch = line.match(/forks:\s*(\d+)/);
        if (forksMatch) {
          const oldVal = parseInt(forksMatch[1]);
          if (oldVal === change.oldForks && oldVal !== change.newForks) {
            lines[i] = lines[i].replace(/forks:\s*\d+/, `forks: ${change.newForks}`);
            updatedForks++;
          }
        }
        
        // language
        const langMatch = line.match(/language:\s*"([^"]+)"/);
        if (langMatch && change.oldLanguage !== 'N/A' && change.newLanguage !== 'N/A') {
          const oldVal = langMatch[1];
          if (oldVal === change.oldLanguage && oldVal !== change.newLanguage) {
            lines[i] = lines[i].replace(/language:\s*"[^"]+"/, `language: "${change.newLanguage}"`);
            updatedLang++;
          }
        }
        
        // updatedAt
        const dateMatch = line.match(/updatedAt:\s*"([^"]+)"/);
        if (dateMatch && change.pushedAt) {
          const newDate = change.pushedAt.split('T')[0];
          const oldDate = dateMatch[1];
          if (oldDate !== newDate) {
            lines[i] = lines[i].replace(/updatedAt:\s*"[^"]+"/, `updatedAt: "${newDate}"`);
            updatedDate++;
          }
        }
      }
    }
  }
}

writeFileSync('src/data/tools.ts', lines.join('\n'));
console.log(`Updated: ${updatedStars} stars, ${updatedForks} forks, ${updatedLang} languages, ${updatedDate} dates`);

// Verify
const final = readFileSync('src/data/tools.ts', 'utf8');
console.log('Has ollama 170437?', final.includes('githubStars: 170437'));
console.log('Has open-webui 135009?', final.includes('githubStars: 135009'));
console.log('Has prompts-chat 161268?', final.includes('githubStars: 161268'));
console.log('Total githubStars fields:', (final.match(/githubStars:/g) || []).length);
