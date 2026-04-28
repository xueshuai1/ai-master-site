import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

// Load results
const results = JSON.parse(readFileSync(join(root, 'scripts/update-results.json'), 'utf8'));
const starChanges = results.starChanges || [];
const forkChanges = results.forkChanges || 0;

// Load tools.ts
const toolsPath = join(root, 'src/data/tools.ts');
let content = readFileSync(toolsPath, 'utf8');

let starUpdates = 0;
let forkUpdates = 0;

// Update stars - match by tool name and replace githubStars value
for (const change of starChanges) {
  const name = change.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  // Match: name: "X", ... githubStars: OLD
  const pattern = new RegExp(`(name:\\s*"${name}"[\\s\\S]{0,2000}?githubStars:\\s*)${change.old}`, 'g');
  const match = pattern.exec(content);
  if (match) {
    content = content.replace(pattern, `$1${change.new}`);
    starUpdates++;
  } else {
    console.log(`⚠️  Could not find stars for: ${change.name}`);
  }
}

// Update forks - match by tool name and replace forks value
// We need to know old fork values from results
const allResults = results.results || [];
for (const r of allResults) {
  if (r.forksChanged && r.oldForks !== undefined) {
    const name = r.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const pattern = new RegExp(`(name:\\s*"${name}"[\\s\\S]{0,2000}?forks:\\s*)${r.oldForks}`, 'g');
    const match = pattern.exec(content);
    if (match) {
      content = content.replace(pattern, `$1${r.newForks}`);
      forkUpdates++;
    } else {
      // Try without exact old match - just find forks near this tool
      const pattern2 = new RegExp(`(name:\\s*"${name}"[\\s\\S]{0,2000}?forks:\\s*)\\d+`);
      const match2 = pattern2.exec(content);
      if (match2) {
        content = content.replace(pattern2, `$1${r.newForks}`);
        forkUpdates++;
      } else {
        console.log(`⚠️  Could not find forks for: ${r.name}`);
      }
    }
  }
}

if (starUpdates > 0 || forkUpdates > 0) {
  writeFileSync(toolsPath, content);
  console.log(`✅ Updated ${starUpdates} stars, ${forkUpdates} forks`);
} else {
  console.log('No changes to apply');
}
