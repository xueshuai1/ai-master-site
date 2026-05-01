import { readFileSync, writeFileSync } from 'fs';

const resultsData = JSON.parse(readFileSync('/tmp/github-update-results.json', 'utf-8'));
const results = resultsData.results;
let content = readFileSync('src/data/tools.ts', 'utf-8');

// Collect all updates as {pos, oldLen, newText}
const updates = [];

for (const r of results) {
  // Find this tool's id
  let idPos = content.indexOf(`id: "${r.id}"`);
  if (idPos === -1) idPos = content.indexOf(`id: '${r.id}'`);
  if (idPos === -1) continue;
  
  // Search within the next 3000 chars for each field
  const searchEnd = Math.min(idPos + 3000, content.length);
  const section = content.slice(idPos, searchEnd);
  
  // githubStars
  if (r.starsChanged) {
    const m = section.match(/(githubStars:\s*)(\d+)/);
    if (m) {
      const absPos = idPos + m.index;
      updates.push({
        pos: absPos,
        oldLen: m[0].length,
        newText: m[1] + r.newStars
      });
    }
  }
  
  // forks (only if > 0)
  if (r.forksChanged && r.newForks > 0) {
    const m = section.match(/(forks:\s*)(\d+)/);
    if (m) {
      const absPos = idPos + m.index;
      updates.push({
        pos: absPos,
        oldLen: m[0].length,
        newText: m[1] + r.newForks
      });
    }
  }
  
  // language (only if non-empty new value)
  if (r.langChanged && r.newLang) {
    const m = section.match(/(language:\s*["'])([^"']+)["']/);
    if (m) {
      const absPos = idPos + m.index;
      updates.push({
        pos: absPos,
        oldLen: m[0].length,
        newText: m[1] + r.newLang + '"'
      });
    }
  }
  
  // updatedAt
  if (r.newPushedAt && r.newPushedAt !== r.currentUpdatedAt) {
    const m = section.match(/(updatedAt:\s*["'])([^"']+)["']/);
    if (m) {
      const absPos = idPos + m.index;
      updates.push({
        pos: absPos,
        oldLen: m[0].length,
        newText: m[1] + r.newPushedAt + '"'
      });
    }
  }
}

// Sort by position descending (apply from end to start to keep positions valid)
updates.sort((a, b) => b.pos - a.pos);

// Apply updates
for (const u of updates) {
  content = content.slice(0, u.pos) + u.newText + content.slice(u.pos + u.oldLen);
}

writeFileSync('src/data/tools.ts', content);

// Summary
const starsCount = results.filter(r => r.starsChanged).length;
const forksCount = results.filter(r => r.forksChanged && r.newForks > 0).length;
const langCount = results.filter(r => r.langChanged && r.newLang).length;
const dateCount = results.filter(r => r.newPushedAt && r.newPushedAt !== r.currentUpdatedAt).length;

console.log(`Applied ${updates.length} updates:`);
console.log(`  githubStars: ${starsCount}`);
console.log(`  forks: ${forksCount}`);
console.log(`  language: ${langCount}`);
console.log(`  updatedAt: ${dateCount}`);
console.log('Done!');
