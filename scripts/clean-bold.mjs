/**
 * 彻底清理文章文件中的中文加粗
 * 只保留：纯英文产品名/公司名/框架名/缩写
 * 所有包含中文的加粗一律去掉
 */

import fs from 'fs';
import path from 'path';

const files = process.argv.slice(2);

// 只保留纯英文的短术语
function shouldKeepBold(inner) {
  const t = inner.trim();
  // 包含任何中文字符 → 去掉
  if (/[\u4e00-\u9fff\u3400-\u4dbf]/.test(t)) return false;
  // 纯英文/数字/符号，长度 ≤ 25 → 保留
  if (/^[A-Za-z0-9\s\/\.\-\+#]+$/.test(t) && t.length <= 25) return true;
  return false;
}

for (const filePath of files) {
  const absPath = path.resolve(filePath);
  if (!fs.existsSync(absPath)) continue;

  const original = fs.readFileSync(absPath, 'utf8');
  const before = (original.match(/\*\*[^*]+\*\*/g) || []).length;

  // 全文件范围替换（不仅 body，还包括 body2/tip/warning/list 等）
  let result = original.replace(/\*\*([^*]+?)\*\*/g, (m, inner) =>
    shouldKeepBold(inner) ? m : inner
  );

  const after = (result.match(/\*\*[^*]+\*\*/g) || []).length;

  if (before !== after) {
    fs.writeFileSync(absPath, result, 'utf8');
    console.log(`✅ ${path.basename(filePath)}: ${before} → ${after} (−${before - after})`);
  } else {
    console.log(`⏭️ ${path.basename(filePath)}: 无变化 (${before})`);
  }
}
