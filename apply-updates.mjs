#!/usr/bin/env node
import { readFileSync, writeFileSync } from 'fs';

const results = JSON.parse(readFileSync('/tmp/github-update-results.json', 'utf-8'));
const toolsPath = '/Users/xueshuai/.openclaw/workspace/ai-master-site/src/data/tools.ts';
const content = readFileSync(toolsPath, 'utf-8');

// For each repo, check what needs updating
const stats = { starsUpdated: 0, forksUpdated: 0, languageUpdated: 0 };
let newContent = content;

for (const [repo, data] of Object.entries(results.results)) {
  const escapedRepo = repo.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  
  // Find the tool block for this repo
  // Look for the url line, then find githubStars, forks, language nearby
  const urlPattern = new RegExp(`url:\\s*"https://github\\.com/${escapedRepo}"`);
  const urlMatch = urlPattern.exec(content);
  if (!urlMatch) continue;
  
  const startPos = urlMatch.index;
  
  // Find the tool object boundaries (look backwards for { and forwards for })
  let braceCount = 0;
  let objStart = startPos;
  for (let i = startPos; i >= 0; i--) {
    if (content[i] === '}') braceCount--;
    if (content[i] === '{') {
      braceCount++;
      if (braceCount === 1) { objStart = i; break; }
    }
  }
  
  braceCount = 0;
  let objEnd = startPos;
  for (let i = startPos; i < content.length; i++) {
    if (content[i] === '{') braceCount++;
    if (content[i] === '}') {
      braceCount--;
      if (braceCount === -1) { objEnd = i; break; }
    }
  }
  
  if (objStart >= objEnd) continue;
  const toolBlock = content.substring(objStart, objEnd + 1);
  
  // Check stars
  const starsMatch = toolBlock.match(/githubStars:\s*(\d+)/);
  if (starsMatch) {
    const oldStars = parseInt(starsMatch[1]);
    if (oldStars !== data.stars) {
      newContent = newContent.replace(
        new RegExp(`(url:\\s*"https://github\\.com/${escapedRepo}".*?githubStars:\\s*)\\d+`, 's'),
        `$1${data.stars}`
      );
      stats.starsUpdated++;
      console.log(`  ★ ${repo}: ${oldStars} → ${data.stars} (${data.stars - oldStars > 0 ? '+' : ''}${data.stars - oldStars})`);
    }
  }
  
  // Check forks
  const forksMatch = toolBlock.match(/forks:\s*(\d+)/);
  if (forksMatch && data.forks > 0) {
    const oldForks = parseInt(forksMatch[1]);
    if (oldForks !== data.forks) {
      newContent = newContent.replace(
        new RegExp(`(url:\\s*"https://github\\.com/${escapedRepo}".*?forks:\\s*)\\d+`, 's'),
        `$1${data.forks}`
      );
      stats.forksUpdated++;
    }
  }
  
  // Check language
  const langMatch = toolBlock.match(/language:\s*"([^"]+)"/);
  if (langMatch && data.language && data.language !== 'None') {
    const oldLang = langMatch[1];
    if (oldLang !== data.language) {
      newContent = newContent.replace(
        new RegExp(`(url:\\s*"https://github\\.com/${escapedRepo}".*?language:\\s*)"[^"]+"`, 's'),
        `$1"${data.language}"`
      );
      stats.languageUpdated++;
    }
  }
}

if (newContent !== content) {
  writeFileSync(toolsPath, newContent);
  console.log(`\nUpdated: ${stats.starsUpdated} stars, ${stats.forksUpdated} forks, ${stats.languageUpdated} language`);
  console.log('MODIFIED');
} else {
  console.log('NO_CHANGES');
}
