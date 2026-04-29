#!/usr/bin/env node
import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

const fetchedData = JSON.parse(readFileSync(join(root, 'scripts/github-data-results.json'), 'utf-8'));
const resultsMap = new Map();
for (const r of fetchedData.results) {
  resultsMap.set(r.repo, r);
}

const toolsContent = readFileSync(join(root, 'src/data/tools.ts'), 'utf-8');

// Split into parts: header + tools array
// Find the export const tools: Tool[] = [ line
const headerEnd = toolsContent.indexOf('export const tools: Tool[] = [');
const header = toolsContent.substring(0, headerEnd + 'export const tools: Tool[] = ['.length);
const rest = toolsContent.substring(headerEnd + 'export const tools: Tool[] = ['.length);

// Split by },{ pattern to get individual tool blocks
// But we need to preserve the closing ];
const closingIndex = rest.lastIndexOf('];');
const toolsBlock = rest.substring(0, closingIndex).trim();
const trailing = rest.substring(closingIndex);

// Now split into individual tool entries
// Each entry starts with { and ends with }
// We need to handle nested objects/arrays properly
const toolEntries = [];
let depth = 0;
let current = '';
let inString = false;
let escapeNext = false;
let stringChar = null;

for (let i = 0; i < toolsBlock.length; i++) {
  const ch = toolsBlock[i];
  
  if (escapeNext) {
    current += ch;
    escapeNext = false;
    continue;
  }
  
  if (ch === '\\' && inString) {
    current += ch;
    escapeNext = true;
    continue;
  }
  
  if (ch === '"' || ch === "'") {
    if (!inString) {
      inString = true;
      stringChar = ch;
    } else if (ch === stringChar) {
      inString = false;
      stringChar = null;
    }
    current += ch;
    continue;
  }
  
  if (inString) {
    current += ch;
    continue;
  }
  
  if (ch === '{') {
    depth++;
    current += ch;
  } else if (ch === '}') {
    depth--;
    current += ch;
    if (depth === 0) {
      toolEntries.push(current.trim());
      current = '';
    }
  } else {
    current += ch;
  }
}

console.log(`Parsed ${toolEntries.length} tool entries`);

let updates = { stars: 0, forks: 0, language: 0 };

const updatedEntries = toolEntries.map(entry => {
  // Extract URL
  const urlMatch = entry.match(/url:\s*["']https:\/\/github\.com\/([^"']+)["']/);
  if (!urlMatch) return entry;
  
  const repo = urlMatch[1];
  const data = resultsMap.get(repo);
  if (!data) return entry;
  
  let modified = entry;
  
  // Update githubStars
  const starsMatch = modified.match(/(githubStars:\s*)(\d+)/);
  if (starsMatch) {
    const oldStars = parseInt(starsMatch[2]);
    if (oldStars !== data.stars) {
      modified = modified.replace(/(githubStars:\s*)\d+/, `$1${data.stars}`);
      updates.stars++;
    }
  }
  
  // Update forks
  const forksMatch = modified.match(/(forks:\s*)(\d+)/);
  if (forksMatch) {
    const oldForks = parseInt(forksMatch[2]);
    if (oldForks !== data.forks) {
      modified = modified.replace(/(forks:\s*)\d+/, `$1${data.forks}`);
      updates.forks++;
    }
  }
  
  // Update language  
  const langMatch = modified.match(/(language:\s*)(["'][^"']*["']|null)/);
  if (langMatch) {
    const oldLang = langMatch[2].replace(/["']/g, '');
    const newLang = data.language || 'null';
    if (oldLang !== newLang) {
      modified = modified.replace(/(language:\s*)(["'][^"']*["']|null)/, `$1"${newLang}"`);
      updates.language++;
    }
  }
  
  return modified;
});

// Reconstruct
const reconstructed = updatedEntries.join(',\n');
const newContent = header + '\n' + reconstructed + '\n' + trailing;

console.log('Updates:', JSON.stringify(updates));

if (updates.stars === 0 && updates.forks === 0 && updates.language === 0) {
  console.log('No changes needed.');
  writeFileSync(join(root, 'scripts/update-result.json'), JSON.stringify({ hasChanges: false, ...updates }, null, 2));
} else {
  writeFileSync(join(root, 'src/data/tools.ts'), newContent);
  writeFileSync(join(root, 'scripts/update-result.json'), JSON.stringify({ hasChanges: true, ...updates }, null, 2));
  console.log('tools.ts updated!');
}
