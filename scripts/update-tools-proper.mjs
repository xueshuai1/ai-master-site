#!/usr/bin/env node
/**
 * Proper tool block parser + updater for tools.ts
 * Uses line-by-line parsing with proper brace tracking (handles template literals)
 */
import { readFileSync, writeFileSync } from 'fs';

// Load fetched data
const rawData = JSON.parse(readFileSync('/tmp/github-update-results.json', 'utf-8'));
const { repoData } = rawData;

// Read tools.ts
const toolsPath = '/Users/xueshuai/.openclaw/workspace/ai-master-site/src/data/tools.ts';
const toolsContent = readFileSync(toolsPath, 'utf-8');

// Parse tool blocks properly using line-by-line brace tracking
const lines = toolsContent.split('\n');
const tools = [];

let currentTool = null;
let braceDepth = 0;
let inTemplateLiteral = false;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];

  // Count braces, accounting for template literals and strings
  for (let j = 0; j < line.length; j++) {
    const ch = line[j];
    const prev = j > 0 ? line[j - 1] : '';

    if (ch === '`' && prev !== '\\') {
      inTemplateLiteral = !inTemplateLiteral;
    } else if (!inTemplateLiteral) {
      if (ch === '{') {
        if (braceDepth === 0) {
          currentTool = { startLine: i, fields: {}, url: null, githubStarsLine: null, forksLine: null, languageLine: null, updatedAtLine: null };
        }
        braceDepth++;
      } else if (ch === '}') {
        braceDepth--;
        if (braceDepth === 0 && currentTool) {
          currentTool.endLine = i;
          tools.push(currentTool);
          currentTool = null;
        }
      }
    }
  }

  // Extract fields from current tool
  if (currentTool) {
    const urlMatch = line.match(/url:\s*"(https:\/\/github\.com\/[^"]+)"/);
    if (urlMatch) currentTool.url = urlMatch[1];

    const idMatch = line.match(/id:\s*"([^"]+)"/);
    if (idMatch) currentTool.id = idMatch[1];

    const starsMatch = line.match(/githubStars:\s*(\d+)/);
    if (starsMatch) { currentTool.githubStars = parseInt(starsMatch[1]); currentTool.githubStarsLine = i; }

    const forksMatch = line.match(/forks:\s*(\d+)/);
    if (forksMatch) { currentTool.forks = parseInt(forksMatch[1]); currentTool.forksLine = i; }

    const langMatch = line.match(/language:\s*"([^"]+)"/);
    if (langMatch) { currentTool.language = langMatch[1]; currentTool.languageLine = i; }

    const updatedMatch = line.match(/updatedAt:\s*"([^"]+)"/);
    if (updatedMatch) { currentTool.updatedAt = updatedMatch[1]; currentTool.updatedAtLine = i; }
  }
}

console.log(`Parsed ${tools.length} tool blocks`);

// Map URL to repo data
function urlToRepo(url) {
  if (!url) return null;
  const path = url.replace('https://github.com/', '').replace(/\/+$/, '');
  const parts = path.split('/');
  const repoPath = parts.length >= 2 ? `${parts[0]}/${parts[1]}` : parts[0];
  return repoData[repoPath] || null;
}

// Track changes
const starsChanges = [];
const forksUpdates = [];
const langUpdates = [];
const dateUpdates = [];

// Apply updates to lines array
const newLines = [...lines];

for (const tool of tools) {
  const rd = urlToRepo(tool.url);
  if (!rd) continue;

  // Stars
  if (tool.githubStars !== undefined && rd.stars !== undefined && tool.githubStars !== rd.stars) {
    newLines[tool.githubStarsLine] = newLines[tool.githubStarsLine].replace(
      /(githubStars:\s*)\d+/,
      `$1${rd.stars}`
    );
    starsChanges.push({ id: tool.id, old: tool.githubStars, new: rd.stars, delta: rd.stars - tool.githubStars });
  }

  // Forks
  if (tool.forks !== undefined && rd.forks !== undefined && tool.forks !== rd.forks) {
    newLines[tool.forksLine] = newLines[tool.forksLine].replace(
      /(forks:\s*)\d+/,
      `$1${rd.forks}`
    );
    forksUpdates.push({ id: tool.id, old: tool.forks, new: rd.forks });
  } else if (tool.forks === undefined && rd.forks !== undefined && tool.githubStarsLine !== null) {
    // Add forks after githubStars line
    const starsLine = newLines[tool.githubStarsLine];
    const indent = starsLine.match(/^(\s*)/)[1];
    newLines.splice(tool.githubStarsLine + 1, 0, `${indent}forks: ${rd.forks},`);
    forksUpdates.push({ id: tool.id, old: null, new: rd.forks });
    // Adjust line references for lines after insertion
    for (const t of tools) {
      if (t.forksLine > tool.githubStarsLine) t.forksLine++;
      if (t.languageLine > tool.githubStarsLine) t.languageLine++;
      if (t.updatedAtLine > tool.githubStarsLine) t.updatedAtLine++;
      if (t.githubStarsLine > tool.githubStarsLine) t.githubStarsLine++;
      if (t.endLine > tool.githubStarsLine) t.endLine++;
    }
  }

  // Language
  if (tool.language !== undefined && rd.language && tool.language !== rd.language) {
    newLines[tool.languageLine] = newLines[tool.languageLine].replace(
      /(language:\s*")[^"]+(")/,
      `$1${rd.language}$2`
    );
    langUpdates.push({ id: tool.id, old: tool.language, new: rd.language });
  } else if (tool.language === undefined && rd.language && tool.githubStarsLine !== null) {
    const starsLine = newLines[tool.githubStarsLine];
    const indent = starsLine.match(/^(\s*)/)[1];
    newLines.splice(tool.githubStarsLine + 1, 0, `${indent}language: "${rd.language}",`);
    langUpdates.push({ id: tool.id, old: null, new: rd.language });
    for (const t of tools) {
      if (t.forksLine > tool.githubStarsLine) t.forksLine++;
      if (t.languageLine > tool.githubStarsLine) t.languageLine++;
      if (t.updatedAtLine > tool.githubStarsLine) t.updatedAtLine++;
      if (t.githubStarsLine > tool.githubStarsLine) t.githubStarsLine++;
      if (t.endLine > tool.githubStarsLine) t.endLine++;
    }
  }

  // UpdatedAt
  const newDate = rd.pushed_at ? rd.pushed_at.split('T')[0] : null;
  if (tool.updatedAt !== undefined && newDate && tool.updatedAt !== newDate) {
    newLines[tool.updatedAtLine] = newLines[tool.updatedAtLine].replace(
      /(updatedAt:\s*")[^"]+(")/,
      `$1${newDate}$2`
    );
    dateUpdates.push({ id: tool.id, old: tool.updatedAt, new: newDate });
  }
}

// Write updated file
writeFileSync(toolsPath, newLines.join('\n'));

console.log(`\n📝 tools.ts updated:`);
console.log(`  Stars changed: ${starsChanges.length}`);
console.log(`  Forks updated: ${forksUpdates.length}`);
console.log(`  Languages updated: ${langUpdates.length}`);
console.log(`  Dates updated: ${dateUpdates.length}`);

// Show top star changes
if (starsChanges.length > 0) {
  const sorted = [...starsChanges].sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta));
  console.log('\n🔝 Top star changes:');
  for (const c of sorted.slice(0, 10)) {
    const sign = c.delta > 0 ? '+' : '';
    console.log(`  ${c.id}: ${c.old} → ${c.new} (${sign}${c.delta})`);
  }
}

// Save summary
writeFileSync('/tmp/update-summary.json', JSON.stringify({
  starsChanges: starsChanges.length,
  forksUpdates: forksUpdates.length,
  langUpdates: langUpdates.length,
  dateUpdates: dateUpdates.length,
  topStarChanges: [...starsChanges].sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta)).slice(0, 5),
}, null, 2));
