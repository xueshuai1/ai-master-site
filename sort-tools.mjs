import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const BASE = '/Users/xueshuai/.openclaw/workspace/ai-master-site';
const filePath = join(BASE, 'src/data/tools.ts');
let content = readFileSync(filePath, 'utf-8');

// Parse the tools array - extract the full array content
const arrayStart = content.indexOf('export const tools: Tool[] = [');
const arrayEnd = content.lastIndexOf('];');
const prefix = content.substring(0, arrayStart + 'export const tools: Tool[] = ['.length);
const suffix = content.substring(arrayEnd);
const arrayContent = content.substring(arrayStart + 'export const tools: Tool[] = ['.length, arrayEnd);

// Extract individual tool objects by matching balanced braces
const tools = [];
let depth = 0;
let start = 0;
let inString = false;
let stringChar = null;
let escaped = false;

for (let i = 0; i < arrayContent.length; i++) {
  const ch = arrayContent[i];
  
  if (escaped) { escaped = false; continue; }
  if (ch === '\\') { escaped = true; continue; }
  
  if ((ch === '"' || ch === "'" || ch === '`') && !inString) {
    inString = true;
    stringChar = ch;
  } else if (ch === stringChar && inString) {
    inString = false;
    stringChar = null;
  } else if (!inString) {
    if (ch === '{') {
      if (depth === 0) start = i;
      depth++;
    } else if (ch === '}') {
      depth--;
      if (depth === 0) {
        const objStr = arrayContent.substring(start, i + 1);
        // Extract id, category, and githubStars
        const idMatch = objStr.match(/id:\s*"([^"]+)"/);
        const catMatch = objStr.match(/category:\s*"([^"]+)"/);
        const starsMatch = objStr.match(/githubStars:\s*(\d+)/);
        if (idMatch && catMatch) {
          tools.push({
            id: idMatch[1],
            category: catMatch[1],
            stars: starsMatch ? parseInt(starsMatch[1]) : 0,
            raw: objStr
          });
        }
      }
    }
  }
}

console.log(`Parsed ${tools.length} tools`);

// Group by category
const byCategory = {};
for (const t of tools) {
  if (!byCategory[t.category]) byCategory[t.category] = [];
  byCategory[t.category].push(t);
}

// Sort each category by stars descending
for (const cat of Object.keys(byCategory)) {
  byCategory[cat].sort((a, b) => b.stars - a.stars);
}

// Rebuild the array content in sorted order
const sortedRaw = [];
for (const cat of Object.keys(byCategory)) {
  for (const t of byCategory[cat]) {
    sortedRaw.push(t.raw);
  }
}

const newArrayContent = '\n' + sortedRaw.join(',\n') + '\n';
const newContent = prefix + newArrayContent + suffix;

writeFileSync(filePath, newContent);
console.log(`Sorted ${tools.length} tools by category + stars`);
console.log('Done ✅');
