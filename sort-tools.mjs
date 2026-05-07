#!/usr/bin/env node
import { readFileSync, writeFileSync } from 'fs';

const results = JSON.parse(readFileSync('/tmp/github-update-results.json', 'utf-8'));
const toolsPath = '/Users/xueshuai/.openclaw/workspace/ai-master-site/src/data/tools.ts';
const content = readFileSync(toolsPath, 'utf-8');

// Extract the tools array content
const toolsArrayMatch = content.match(/export const tools:\s*Tool\[\]\s*=\s*\[([\s\S]*)\];\s*$/);
if (!toolsArrayMatch) { console.error('Cannot find tools array'); process.exit(1); }

const toolsContent = toolsArrayMatch[1];
const prefix = content.substring(0, content.indexOf('export const tools:'));
const suffix = '];\n';

// Parse individual tool objects - find matching braces
const tools = [];
let depth = 0;
let startIdx = 0;

for (let i = 0; i < toolsContent.length; i++) {
  if (toolsContent[i] === '{') {
    if (depth === 0) startIdx = i;
    depth++;
  } else if (toolsContent[i] === '}') {
    depth--;
    if (depth === 0) {
      tools.push(toolsContent.substring(startIdx, i + 1));
    }
  }
}

console.log(`Found ${tools.length} tools`);

// Extract star count from a tool object
function getStars(toolStr) {
  const m = toolStr.match(/githubStars:\s*(\d+)/);
  return m ? parseInt(m[1]) : 0;
}

// Extract category from a tool object
function getCategory(toolStr) {
  const m = toolStr.match(/category:\s*"([^"]+)"/);
  return m ? m[1] : 'unknown';
}

// Group by category, sort each group by stars desc
const groups = {};
for (const tool of tools) {
  const cat = getCategory(tool);
  if (!groups[cat]) groups[cat] = [];
  groups[cat].push(tool);
}

for (const cat of Object.keys(groups)) {
  groups[cat].sort((a, b) => getStars(b) - getStars(a));
}

// Rebuild content
const sortedTools = [];
const categoryOrder = ['all', 'llm', 'agent', 'framework', 'cli', 'plugin', 'data', 'multimodal', 'search', 'security', 'devops', 'education', 'cv', 'aieng', 'finance'];

for (const cat of categoryOrder) {
  if (groups[cat]) {
    sortedTools.push(...groups[cat]);
  }
}

// Add any uncategorized tools
for (const cat of Object.keys(groups)) {
  if (!categoryOrder.includes(cat)) {
    sortedTools.push(...groups[cat]);
  }
}

const newToolsContent = sortedTools.join(',\n');
const newContent = prefix + 'export const tools: Tool[] = [\n' + newToolsContent + '\n];\n';

writeFileSync(toolsPath, newContent);
console.log('Tools sorted by category and stars');
