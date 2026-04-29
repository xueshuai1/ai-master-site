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

// Find boundaries
const headerEnd = toolsContent.indexOf('export const tools: Tool[] = [');
const header = toolsContent.substring(0, headerEnd + 'export const tools: Tool[] = ['.length);
const rest = toolsContent.substring(headerEnd + 'export const tools: Tool[] = ['.length);
const closingIndex = rest.lastIndexOf('];');
const toolsBlock = rest.substring(0, closingIndex);
const trailing = rest.substring(closingIndex);

// Parse tool entries - track braces, strings
const rawEntries = [];
let depth = 0, current = '', inString = false, escapeNext = false, stringChar = null;

for (let i = 0; i < toolsBlock.length; i++) {
  const ch = toolsBlock[i];
  if (escapeNext) { current += ch; escapeNext = false; continue; }
  if (ch === '\\' && inString) { current += ch; escapeNext = true; continue; }
  if (ch === '"' || ch === "'") {
    if (!inString) { inString = true; stringChar = ch; }
    else if (ch === stringChar) { inString = false; stringChar = null; }
    current += ch; continue;
  }
  if (inString) { current += ch; continue; }
  
  if (ch === '{') {
    if (depth === 0) current = ''; // Start fresh at top-level {
    depth++; current += ch;
  } else if (ch === '}') {
    depth--; current += ch;
    if (depth === 0) {
      rawEntries.push(current.trim());
    }
  } else {
    // Only collect content at depth > 0 (inside a tool object)
    if (depth > 0) current += ch;
  }
}

console.log(`Parsed ${rawEntries.length} tool entries`);

// Apply updates and extract metadata
let updateCounts = { stars: 0, forks: 0, language: 0 };

const processedEntries = rawEntries.map(entry => {
  let mod = entry;
  
  const urlMatch = mod.match(/url:\s*["']https:\/\/github\.com\/([^"']+)["']/);
  const repo = urlMatch ? urlMatch[1] : null;
  const data = repo ? resultsMap.get(repo) : null;
  
  if (data) {
    // Stars
    const sm = mod.match(/(githubStars:\s*)(\d+)/);
    if (sm && parseInt(sm[2]) !== data.stars) {
      mod = mod.replace(/(githubStars:\s*)\d+/, `$1${data.stars}`);
      updateCounts.stars++;
    }
    // Forks
    const fm = mod.match(/(forks:\s*)(\d+)/);
    if (fm && parseInt(fm[2]) !== data.forks) {
      mod = mod.replace(/(forks:\s*)\d+/, `$1${data.forks}`);
      updateCounts.forks++;
    }
    // Language
    const lm = mod.match(/(language:\s*)(["'][^"']*["']|null)/);
    if (lm) {
      const oldLang = lm[2].replace(/["']/g, '');
      const newLang = data.language || 'null';
      if (oldLang !== newLang) {
        mod = mod.replace(/(language:\s*)(["'][^"']*["']|null)/, `$1"${newLang}"`);
        updateCounts.language++;
      }
    }
  }
  
  const catMatch = mod.match(/category:\s*["']([^"']+)["']/);
  const starsMatch = mod.match(/githubStars:\s*(\d+)/);
  
  return {
    entry: mod,
    category: catMatch ? catMatch[1] : 'zz_unknown',
    stars: starsMatch ? parseInt(starsMatch[1]) : 0,
  };
});

// Sort by category then stars desc
const categoryOrder = [
  'llm', 'agent', 'framework', 'cli', 'plugin', 'data', 'multimodal',
  'search', 'security', 'devops', 'education', 'cv', 'aieng', 'finance'
];
const catRank = {};
categoryOrder.forEach((c, i) => catRank[c] = i);

processedEntries.sort((a, b) => {
  const rankA = catRank[a.category] ?? 999;
  const rankB = catRank[b.category] ?? 999;
  if (rankA !== rankB) return rankA - rankB;
  return b.stars - a.stars;
});

// Reconstruct with proper comma separation
const sortedEntries = processedEntries.map(e => e.entry);
const reconstructed = '  ' + sortedEntries.join(',\n  ');
const newContent = header + '\n' + reconstructed + '\n' + trailing;

writeFileSync(join(root, 'src/data/tools.ts'), newContent);

console.log('Updates:', JSON.stringify(updateCounts));
console.log('tools.ts updated and sorted!');

writeFileSync(join(root, 'scripts/update-result.json'), JSON.stringify({ hasChanges: true, ...updateCounts }, null, 2));
