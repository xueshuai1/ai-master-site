/**
 * 全局加粗审计 + 精简
 * 
 * 策略：加粗的意义在于"突出"。如果满篇都是加粗，那加粗就失去了意义。
 * 
 * 保留：
 *   ✅ 纯英文术语（产品名/框架名/缩写/模型名/公司名/基准名）
 *      如：SOC, EDR, GDPR, PGD, Gartner, Function Calling, Llama
 *   ✅ 英文+数字混合（如 GPT-4, RT-2, H100, Llama 3）
 *   ✅ 包含英文的混合术语（如 AI Agent, iOS 18）—— 但限制长度
 * 
 * 去除：
 *   ❌ 所有纯中文加粗 → 去掉（中文术语不需要加粗）
 *   ❌ 数字+中文（2000 亿美元、2027 年）→ 去掉
 *   ❌ 描述性短语 → 去掉
 *   ❌ 重复术语 → 同一术语在文章中只保留第一次加粗
 */

import fs from 'fs';
import path from 'path';

const dirs = [
  { dir: 'src/data/articles', label: '知识库' },
  { dir: 'src/data/blogs', label: '博客' },
];

const allFiles = [];
for (const { dir, label } of dirs) {
  for (const f of fs.readdirSync(dir).filter(x => x.endsWith('.ts'))) {
    allFiles.push({ path: path.join(dir, f), label, name: f });
  }
}

// ===== 检查函数 =====

function shouldKeepBold(inner) {
  const t = inner.trim();
  if (!t) return false;
  
  // 句级标点 → 去掉
  if (/[\uff0c\u3002\uff1b\uff01\uff1a\n\r]/.test(t)) return false;
  
  // 纯英文术语 → 保留
  if (/^[A-Za-z0-9\s\/\.\-\+#]+$/.test(t) && t.length <= 35) return true;
  
  // 包含英文字母的混合术语 → 保留（如 "AI Agent", "GPT-4 模型"）
  if (/[A-Za-z]/.test(t) && /[\u4e00-\u9fff]/.test(t)) {
    // 但要限制长度，排除长混合短语
    if (t.length <= 20) return true;
  }
  
  // 其他（纯中文、数字+中文单位等）→ 去掉
  return false;
}

// ===== 第 1 部分：审计 =====

const stats = [];
for (const { path: fp, label, name } of allFiles) {
  const content = fs.readFileSync(fp, 'utf8');
  const count = (content.match(/\*\*[^*]+\*\*/g) || []).length;
  stats.push({ name, label, count, path: fp });
}

stats.sort((a, b) => b.count - a.count);

console.log('📊 全局加粗审计\n');
console.log(`总文件: ${stats.length} 篇`);
console.log(`总加粗: ${stats.reduce((s, x) => s + x.count, 0)} 个`);
console.log(`平均: ${Math.round(stats.reduce((s, x) => s + x.count, 0) / stats.length)} 个/篇\n`);

// 分布
const ranges = [[0, 5], [6, 15], [16, 30], [31, 50], [51, 100], [101, 9999]];
console.log('分布:');
for (const [lo, hi] of ranges) {
  const cnt = stats.filter(x => x.count >= lo && x.count <= hi).length;
  const bar = '█'.repeat(Math.min(cnt, 50));
  const label = hi > 999 ? `${lo}+` : `${lo}–${hi}`;
  console.log(`  ${label.padStart(8)}: ${String(cnt).padStart(3)}篇  ${bar}`);
}

// TOP 15
console.log('\n🔴 加粗 TOP 15:');
for (const s of stats.slice(0, 15)) {
  const flag = s.count > 100 ? '🔴' : s.count > 50 ? '🟠' : s.count > 30 ? '🟡' : '';
  if (flag) console.log(`  ${flag} ${s.label} ${s.name}: ${s.count}`);
}

// ===== 第 2 部分：精简 =====

// Step A: 去除所有中文加粗和无效加粗
const toFixA = stats.filter(x => x.count > 30);
if (toFixA.length > 0) {
  console.log(`\n🧹 Step A: 精简 ${toFixA.length} 篇加粗 > 30 的文章\n`);
  
  let totalReduced = 0;
  for (const { path: fp, name, count: before } of toFixA) {
    const content = fs.readFileSync(fp, 'utf8');
    const result = content.replace(/\*\*([^*]+?)\*\*/g, (m, inner) =>
      shouldKeepBold(inner) ? m : inner
    );
    const after = (result.match(/\*\*[^*]+\*\*/g) || []).length;
    if (after !== before) {
      fs.writeFileSync(fp, result, 'utf8');
      totalReduced += (before - after);
    }
    const flag = after > 100 ? '🔴' : after > 50 ? '🟠' : after > 30 ? '🟡' : '🟢';
    console.log(`  ${flag} ${name}: ${before} → ${after} (−${before - after})`);
  }
  console.log(`\n共减少 ${totalReduced} 个中文/无效加粗`);
}

// Step B: 去除重复术语的多余加粗（同一术语在文章中只保留第一次加粗）
console.log('\n🔄 Step B: 去除重复术语的多余加粗\n');

// 重新读取最新数据
const toFixB = [];
for (const { path: fp, label, name } of allFiles) {
  const content = fs.readFileSync(fp, 'utf8');
  const count = (content.match(/\*\*[^*]+\*\*/g) || []).length;
  if (count > 30) toFixB.push({ path: fp, name, count });
}

let totalTrimmed = 0;
for (const { path: fp, name, count: before } of toFixB) {
  const content = fs.readFileSync(fp, 'utf8');
  const allBolds = content.match(/\*\*[^*]+\*\*/g) || [];
  
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
  let result = content;
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
  
  if (after !== before) {
    fs.writeFileSync(fp, result, 'utf8');
    totalTrimmed += (before - after);
    const flag = after > 100 ? '🔴' : after > 50 ? '🟠' : after > 30 ? '🟡' : '🟢';
    console.log(`  ${flag} ${name}: ${before} → ${after} (−${before - after}, ${repeated.size} 个重复术语)`);
  }
}

console.log(`\n共减少 ${totalTrimmed} 个重复加粗`);

// ===== 最终统计 =====

console.log('\n✅ 最终状态:');
let finalTotal = 0;
let finalMax = 0;
let finalMaxName = '';
for (const { path: fp, name } of allFiles) {
  const content = fs.readFileSync(fp, 'utf8');
  const count = (content.match(/\*\*[^*]+\*\*/g) || []).length;
  finalTotal += count;
  if (count > finalMax) {
    finalMax = count;
    finalMaxName = name;
  }
}
console.log(`总加粗: ${finalTotal} 个`);
console.log(`平均: ${Math.round(finalTotal / allFiles.length)} 个/篇`);
console.log(`最高: ${finalMaxName} → ${finalMax}`);

// 最终分布
let stillOver30 = 0;
let stillOver50 = 0;
for (const { path: fp } of allFiles) {
  const content = fs.readFileSync(fp, 'utf8');
  const count = (content.match(/\*\*[^*]+\*\*/g) || []).length;
  if (count > 30) stillOver30++;
  if (count > 50) stillOver50++;
}
console.log(`> 30: ${stillOver30} 篇`);
console.log(`> 50: ${stillOver50} 篇`);
