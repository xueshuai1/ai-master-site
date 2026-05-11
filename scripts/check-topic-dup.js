#!/usr/bin/env node
/**
 * 选题查重检查 — 写新文章前必须运行
 * 
 * 用法：node scripts/check-topic-dup.js "拟写的新文章标题"
 * 
 * 输出：
 *   0 — 无重复，可以写
 *   1 — 发现高度相似文章（>=0.7），禁止另写，建议更新旧文
 *   2 — 发现中度相似文章（>=0.5），需确认角度差异
 */

const fs = require('fs');
const path = require('path');

const ARTICLES_DIR = path.join(__dirname, '..', 'src', 'data', 'articles');
const BLOGS_DIR = path.join(__dirname, '..', 'src', 'data', 'blogs');

// 读取所有文章标题
function readAllTitles(dir, pattern) {
  const titles = {};
  if (!fs.existsSync(dir)) return titles;
  const files = fs.readdirSync(dir).filter(f => pattern.test(f));
  for (const f of files) {
    const content = fs.readFileSync(path.join(dir, f), 'utf-8');
    const m = content.match(/title:\s*["\u2018\u2019']([^"\u2018\u2019']+)["\u2018\u2019']/);
    if (m) titles[f] = m[1];
  }
  return titles;
}

// 计算两个字符串的相似度（Levenshtein 距离转相似度）
function similarity(a, b) {
  const lenA = a.length;
  const lenB = b.length;
  if (lenA === 0 || lenB === 0) return 0;
  
  const matrix = Array(lenB + 1).fill(null).map(() => Array(lenA + 1).fill(0));
  for (let i = 0; i <= lenA; i++) matrix[0][i] = i;
  for (let j = 0; j <= lenB; j++) matrix[j][0] = j;
  for (let j = 1; j <= lenB; j++) {
    for (let i = 1; i <= lenA; i++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1,
        matrix[j - 1][i] + 1,
        matrix[j - 1][i - 1] + cost
      );
    }
  }
  return 1 - matrix[lenB][lenA] / Math.max(lenA, lenB);
}

// 提取标题的「核心关键词」用于匹配
function extractKeywords(title) {
  return title
    .replace(/[（(【\d]+[)）】]/g, '')
    .replace(/：.*/, '')
    .replace(/[vsVS].*$/, '')
    .trim();
}

// 检查是否属于同一系列的不同编号文章（如 MoE（一）vs MoE（二）不算重复）
function isSameSeries(titleA, titleB) {
  const matchA = titleA.match(/^(.+?)[（(]([一二三四五六七八九十\d]+)[)）]/);
  const matchB = titleB.match(/^(.+?)[（(]([一二三四五六七八九十\d]+)[)）]/);
  if (!matchA || !matchB) return false;
  // 同系列名 + 不同编号 = 不重复
  return matchA[1].trim() === matchB[1].trim() && matchA[2] !== matchB[2];
}

const newTitle = process.argv[2];
if (!newTitle) {
  console.error('用法: node scripts/check-topic-dup.js "拟写的新文章标题"');
  process.exit(1);
}

const articleTitles = readAllTitles(ARTICLES_DIR, /\.ts$/);
const blogTitles = readAllTitles(BLOGS_DIR, /blog-.*\.ts$/);
const allTitles = { ...articleTitles, ...blogTitles };

const results = [];
const newKeywords = extractKeywords(newTitle);

for (const [file, title] of Object.entries(allTitles)) {
  const simFull = similarity(newTitle, title);
  const oldKeywords = extractKeywords(title);
  const simKey = similarity(newKeywords, oldKeywords);
  const sim = Math.max(simFull, simKey);
  
  if (sim >= 0.5) {
    results.push({ file, title, sim });
  }
}

results.sort((a, b) => b.sim - a.sim);

// 过滤掉同一系列不同编号的文章
const highDups = results.filter(r => r.sim >= 0.7 && !isSameSeries(newTitle, r.title));
const midDups = results.filter(r => r.sim >= 0.5 && r.sim < 0.7 && !isSameSeries(newTitle, r.title));

if (highDups.length > 0) {
  console.log(`\n🔴 选题查重拦截！发现 ${highDups.length} 篇高度相似文章：\n`);
  for (const r of highDups) {
    console.log(`   相似度: ${(r.sim * 100).toFixed(0)}%`);
    console.log(`   已有: [${r.file}] ${r.title}`);
    console.log(`   拟写: ${newTitle}`);
    console.log();
  }
  console.log('⛔ 禁止另写一篇！请更新旧文，或确保角度完全不同。');
  process.exit(1);
} else if (midDups.length > 0) {
  console.log(`\n🟡 选题警告！发现 ${midDups.length} 篇中度相似文章：\n`);
  for (const r of midDups) {
    console.log(`   相似度: ${(r.sim * 100).toFixed(0)}%`);
    console.log(`   已有: [${r.file}] ${r.title}`);
    console.log(`   拟写: ${newTitle}`);
    console.log();
  }
  console.log('⚠️  请确认新文章角度与已有文章是否完全不同。如果相近，请更新旧文。');
  process.exit(2);
} else {
  console.log(`\n✅ 选题查重通过！未发现与 "${newTitle}" 相似的文章，可以写。`);
  process.exit(0);
}
