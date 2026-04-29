#!/usr/bin/env node
import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

const toolsContent = readFileSync(join(root, 'src/data/tools.ts'), 'utf-8');

// Split header and tools
const headerEnd = toolsContent.indexOf('export const tools: Tool[] = [');
const header = toolsContent.substring(0, headerEnd + 'export const tools: Tool[] = ['.length);
const rest = toolsContent.substring(headerEnd + 'export const tools: Tool[] = ['.length);
const closingIndex = rest.lastIndexOf('];');
const toolsBlock = rest.substring(0, closingIndex).trim();
const trailing = rest.substring(closingIndex);

// Parse entries
const toolEntries = [];
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
  if (ch === '{') { depth++; current += ch; }
  else if (ch === '}') { depth--; current += ch; if (depth === 0) { toolEntries.push(current.trim()); current = ''; } }
  else { current += ch; }
}

// Extract category and stars from each entry
const parsedEntries = toolEntries.map(entry => {
  const catMatch = entry.match(/category:\s*["']([^"']+)["']/);
  const starsMatch = entry.match(/githubStars:\s*(\d+)/);
  return {
    entry,
    category: catMatch ? catMatch[1] : 'unknown',
    stars: starsMatch ? parseInt(starsMatch[1]) : 0,
  };
});

// Group by category
const categories = {};
for (const e of parsedEntries) {
  if (!categories[e.category]) categories[e.category] = [];
  categories[e.category].push(e);
}

// Sort each category by stars descending
for (const cat of Object.keys(categories)) {
  categories[cat].sort((a, b) => b.stars - a.stars);
}

// Reconstruct in order of toolCategories
const categoryOrder = [
  'all', 'llm', 'agent', 'framework', 'cli', 'plugin', 'data', 'multimodal',
  'search', 'security', 'devops', 'education', 'cv', 'aieng', 'finance'
];

const sortedEntries = [];
for (const cat of categoryOrder) {
  if (categories[cat]) {
    sortedEntries.push(...categories[cat].map(e => e.entry));
  }
}

// Also add any categories not in the list
for (const cat of Object.keys(categories)) {
  if (!categoryOrder.includes(cat)) {
    sortedEntries.push(...categories[cat].map(e => e.entry));
  }
}

const reconstructed = sortedEntries.join(',\n');
const newContent = header + '\n' + reconstructed + '\n' + trailing;

writeFileSync(join(root, 'src/data/tools.ts'), newContent);
console.log('Categories sorted by stars.');
