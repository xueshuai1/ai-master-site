/**
 * 去掉所有英文加粗（包含英文字母的加粗全部去掉）
 */

import fs from 'fs';
import path from 'path';

const files = process.argv.slice(2);

let totalBefore = 0, totalAfter = 0, changed = 0;

for (const filePath of files) {
  const absPath = path.resolve(filePath);
  if (!fs.existsSync(absPath)) continue;
  
  const original = fs.readFileSync(absPath, 'utf8');
  const before = (original.match(/\*\*[^*]+\*\*/g) || []).length;
  totalBefore += before;
  if (before === 0) continue;
  
  // 包含英文字母的加粗 → 去掉
  const result = original.replace(/\*\*([^*]+?)\*\*/g, (m, inner) => {
    if (/[A-Za-z]/.test(inner.trim())) return inner.trim();
    return m;
  });
  
  const after = (result.match(/\*\*[^*]+\*\*/g) || []).length;
  totalAfter += after;
  
  if (before !== after) {
    fs.writeFileSync(absPath, result, 'utf8');
    changed++;
  }
}

console.log(`去英文加粗完成: ${totalBefore} → ${totalAfter} (−${totalBefore - totalAfter}), ${changed} 个文件被修改`);
