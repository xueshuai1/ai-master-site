#!/usr/bin/env node
/**
 * Sort tools by githubStars within each category.
 * Uses ts-node to parse the TypeScript file, sort in JS, then rebuild.
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const TOOLS_PATH = path.resolve(__dirname, '..', 'src', 'data', 'tools.ts');

// 先用 tsc 编译，然后运行 JS 来排序
// 方案：读取文件内容，用正则提取每个工具块，然后按分类+stars排序

let content = fs.readFileSync(TOOLS_PATH, 'utf-8');

// 找到 tools 数组
const marker = 'export const tools: Tool[] =';
const markerPos = content.indexOf(marker);
if (markerPos === -1) { console.error('找不到 tools 数组'); process.exit(1); }

// 找到 = 之后的 [
const eqPos = content.indexOf('=', markerPos);
let arrStart = -1;
for (let i = eqPos + 1; i < content.length; i++) {
  if (content[i] === '[') { arrStart = i; break; }
}
if (arrStart === -1) { console.error('找不到 ['); process.exit(1); }

console.log(`数组起始位置: ${arrStart}`);

// 从 arrStart 开始，找到匹配的 ]
function findMatchingClose(text, start, openChar, closeChar) {
  let depth = 0;
  let inStr = false, strCh = '', esc = false;
  for (let i = start; i < text.length; i++) {
    const c = text[i];
    if (esc) { esc = false; continue; }
    if (inStr) {
      if (c === '\\') esc = true;
      else if (c === strCh) inStr = false;
      continue;
    }
    if (c === '"' || c === "'" || c === '`') { inStr = true; strCh = c; continue; }
    if (c === openChar) depth++;
    if (c === closeChar) { depth--; if (depth === 0) return i; }
  }
  return -1;
}

// 注意：数组内还有对象 {}，但我们需要找的是 ]
// 所以要区分 [ 和 {
function findArrayEnd(text, start) {
  let arrDepth = 0;
  let objDepth = 0;
  let inStr = false, strCh = '', esc = false;
  for (let i = start; i < text.length; i++) {
    const c = text[i];
    if (esc) { esc = false; continue; }
    if (inStr) {
      if (c === '\\') esc = true;
      else if (c === strCh) inStr = false;
      continue;
    }
    if (c === '"' || c === "'" || c === '`') { inStr = true; strCh = c; continue; }
    if (c === '[') arrDepth++;
    if (c === ']') { arrDepth--; if (arrDepth === 0 && objDepth === 0) return i; }
    if (c === '{') objDepth++;
    if (c === '}') objDepth--;
  }
  return -1;
}

const arrEnd = findArrayEnd(content, arrStart);
console.log(`数组结束位置: ${arrEnd}`);

if (arrEnd === -1) { console.error('找不到数组结束 ]'); process.exit(1); }

// 提取数组体内的 { } 块
const body = content.substring(arrStart + 1, arrEnd);

function extractObjects(text) {
  const objs = [];
  let i = 0;
  while (i < text.length) {
    // skip whitespace/commas
    while (i < text.length && (/\s/.test(text[i]) || text[i] === ',')) i++;
    if (i >= text.length) break;
    if (text[i] !== '{') {
      // 跳过非 { 内容
      i++;
      continue;
    }
    
    let depth = 0;
    let start = i;
    let inStr = false, strCh = '', esc = false;
    for (; i < text.length; i++) {
      const c = text[i];
      if (esc) { esc = false; continue; }
      if (inStr) {
        if (c === '\\') esc = true;
        else if (c === strCh) inStr = false;
        continue;
      }
      if (c === '"' || c === "'" || c === '`') { inStr = true; strCh = c; continue; }
      if (c === '{') depth++;
      if (c === '}') { depth--; if (depth === 0) { objs.push(text.substring(start, i + 1)); i++; break; } }
    }
  }
  return objs;
}

const objs = extractObjects(body);
console.log(`提取到 ${objs.length} 个工具对象`);

// 解析 category 和 githubStars
const parsed = objs.map(o => {
  const catM = o.match(/category:\s*["']([^"']+)["']/);
  const starM = o.match(/githubStars:\s*(\d+)/);
  return { txt: o, cat: catM ? catM[1] : 'unknown', stars: starM ? parseInt(starM[1]) : 0 };
});

// 按分类分组，保留原始分类顺序
const catOrder = [];
const grouped = {};
for (const p of parsed) {
  if (!grouped[p.cat]) { grouped[p.cat] = []; catOrder.push(p.cat); }
  grouped[p.cat].push(p);
}

// 每个分类内按 stars 降序
for (const cat of catOrder) {
  grouped[cat].sort((a, b) => b.stars - a.stars);
}

// 重建数组体
let newBody = '';
for (const cat of catOrder) {
  for (const t of grouped[cat]) {
    newBody += '\n  ' + t.txt + ',';
  }
}

// 写回文件
const newContent = content.substring(0, arrStart + 1) + newBody + '\n' + content.substring(arrEnd);
fs.writeFileSync(TOOLS_PATH, newContent);

console.log(`✅ 排序完成: ${parsed.length} 个工具, ${catOrder.length} 个分类`);
