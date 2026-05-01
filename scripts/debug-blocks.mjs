import { readFileSync } from 'fs';
const content = readFileSync('src/data/tools.ts', 'utf8');
const lines = content.split('\n');

let currentId = null;
let braceCount = 0;
let inBlock = false;
let blocks = [];

for (let i = 0; i < Math.min(100, lines.length); i++) {
  const line = lines[i];
  
  if (line.match(/id:\s*"/) && !inBlock) {
    const m = line.match(/id:\s*"([^"]+)"/);
    if (m) {
      currentId = m[1];
      inBlock = true;
      braceCount = 0;
      console.log('Block start at line', i, ':', currentId);
    }
  }
  
  if (inBlock) {
    for (const ch of line) {
      if (ch === '{') braceCount++;
      if (ch === '}') braceCount--;
    }
    if (braceCount <= 0) {
      blocks.push(currentId);
      console.log('Block end at line', i, ':', currentId);
      currentId = null;
      inBlock = false;
    }
  }
}
console.log('Found', blocks.length, 'blocks in first 100 lines');
