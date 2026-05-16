/**
 * 精简重复加粗
 * 同一篇文章中，同一个术语反复加粗 → 只保留第一次出现
 * 例："Google" 出现 5 次加粗 → 只保留第 1 次，其余去掉加粗
 */

import fs from 'fs';
import path from 'path';

const files = process.argv.slice(2);

for (const filePath of files) {
  const absPath = path.resolve(filePath);
  if (!fs.existsSync(absPath)) continue;
  
  const original = fs.readFileSync(absPath, 'utf8');
  const allBolds = original.match(/\*\*[^*]+\*\*/g) || [];
  if (allBolds.length === 0) continue;
  
  // 统计每个术语出现次数
  const counts = {};
  for (const b of allBolds) {
    const key = b.toLowerCase();
    counts[key] = (counts[key] || 0) + 1;
  }
  
  // 找出重复的术语（出现 ≥ 2 次）
  const repeated = new Set(
    Object.entries(counts)
      .filter(([_, count]) => count >= 2)
      .map(([key]) => key)
  );
  
  if (repeated.size === 0) continue;
  
  // 替换：每个重复术语只保留第一次加粗
  let result = original;
  const seen = new Set();
  
  result = result.replace(/\*\*([^*]+?)\*\*/g, (m, inner) => {
    const key = inner.toLowerCase().trim();
    if (repeated.has(key)) {
      if (seen.has(key)) {
        return inner; // 第 2 次+，去掉加粗
      }
      seen.add(key);
      return m; // 第 1 次，保留
    }
    return m;
  });
  
  const after = (result.match(/\*\*[^*]+\*\*/g) || []).length;
  const before = allBolds.length;
  
  if (after !== before) {
    fs.writeFileSync(absPath, result, 'utf8');
    const flag = after > 100 ? '🔴' : after > 50 ? '🟠' : after > 20 ? '🟡' : '🟢';
    console.log(`${flag} ${path.basename(filePath)}: ${before} → ${after} (−${before - after}, ${repeated.size} 个重复术语)`);
  }
}
