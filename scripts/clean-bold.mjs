/**
 * 去掉所有包含英文字母的加粗
 */

import fs from 'fs';
import path from 'path';

const files = process.argv.slice(2);
let totalRemoved = 0;
let filesChanged = 0;

for (const filePath of files) {
  const absPath = path.resolve(filePath);
  if (!fs.existsSync(absPath)) continue;
  
  const original = fs.readFileSync(absPath, 'utf8');
  const result = original.replace(/\*\*([^*]+?)\*\*/g, (m, inner) => {
    if (/[A-Za-z]/.test(inner)) {
      totalRemoved++;
      return inner;
    }
    return m;
  });
  
  if (result !== original) {
    fs.writeFileSync(absPath, result, 'utf8');
    filesChanged++;
  }
}

console.log(`去掉了 ${totalRemoved} 个英文加粗，${filesChanged} 个文件被修改`);
