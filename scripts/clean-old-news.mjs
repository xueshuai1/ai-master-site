/**
 * 清理 news.ts 中 3 天以外的旧新闻
 * 运行: node scripts/clean-old-news.mjs
 * 应在更新新闻前执行，防止数据无限膨胀
 */
import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const newsFile = join(__dirname, '..', 'src', 'data', 'news.ts');

// 保留 3 天内的新闻
const cutoff = new Date();
cutoff.setDate(cutoff.getDate() - 3);
cutoff.setHours(0, 0, 0, 0);
const cutoffStr = cutoff.toISOString().split('T')[0];

const content = readFileSync(newsFile, 'utf-8');

// 找到数组内容范围
const arrMarker = 'export const news: NewsItem[] = [';
const arrStartIdx = content.indexOf(arrMarker);
const arrEndIdx = content.lastIndexOf('];');
if (arrStartIdx === -1 || arrEndIdx === -1) {
  console.error('❌ 无法找到 news 数组');
  process.exit(1);
}

const header = content.substring(0, arrStartIdx + arrMarker.length);
const footer = content.substring(arrEndIdx);
const body = content.substring(arrStartIdx + arrMarker.length, arrEndIdx);

// 按对象边界分割每条新闻
const items = [];
let current = '';
let depth = 0;

for (const ch of body) {
  if (ch === '{' && depth === 0) {
    current = '{';
    depth = 1;
    continue;
  }
  if (depth > 0) {
    current += ch;
    if (ch === '{') depth++;
    if (ch === '}') depth--;
    if (depth === 0) {
      items.push(current);
    }
  }
}

console.log(`当前总计 ${items.length} 条新闻`);

// 过滤：只保留 3 天内的
const kept = items.filter(item => {
  const m = item.match(/date:\s*["']([^"']+)["']/);
  if (!m) return true; // 无法解析的保守保留
  const datePart = m[1].split(' ')[0];
  return datePart >= cutoffStr;
});

const removed = items.length - kept.length;
console.log(`保留 ${kept.length} 条（≥ ${cutoffStr}），清理 ${removed} 条`);

if (removed === 0) {
  console.log('✅ 无需清理');
  process.exit(0);
}

// 重写文件
const newBody = '\n' + kept.join(',\n') + '\n';
const newContent = header + newBody + footer;
writeFileSync(newsFile, newContent, 'utf-8');
console.log('✅ 清理完成');
