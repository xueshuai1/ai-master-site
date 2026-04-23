#!/usr/bin/env node
/**
 * 批量修复 Mermaid 配色 —— 将不安全的浅色替换为深色安全色
 * 
 * 用法：node scripts/fix-mermaid-colors.mjs [文件路径...]
 *   node scripts/fix-mermaid-colors.mjs                              # 修复所有文章
 *   node scripts/fix-mermaid-colors.mjs src/data/articles/agent-027.ts  # 修复单个
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join, relative } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const DATA_DIR = join(__dirname, '../src/data');

// 不安全色 → 安全色映射
const COLOR_MAP = {
  '#ef4444': '#991b1b',  // red-500 → red-800
  '#f59e0b': '#92400e',  // amber-500 → amber-800
  '#fbbf24': '#92400e',  // amber-400 → amber-800
  '#fcd34d': '#92400e',  // amber-300 → amber-800
  '#fde68a': '#92400e',  // amber-200 → amber-800
  '#10b981': '#064e3b',  // emerald-500 → emerald-900
  '#34d399': '#064e3b',  // emerald-400 → emerald-900
  '#6ee7b7': '#064e3b',  // emerald-300 → emerald-900
  '#6366f1': '#3730a3',  // indigo-500 → indigo-800
  '#818cf8': '#3730a3',  // indigo-400 → indigo-800
  '#a5b4fc': '#3730a3',  // indigo-300 → indigo-800
  '#8b5cf6': '#581c87',  // violet-500 → violet-900
  '#a78bfa': '#581c87',  // violet-400 → violet-900
  '#c4b5fd': '#581c87',  // violet-300 → violet-900
  '#ec4899': '#831843',  // pink-500 → pink-800
  '#f472b6': '#831843',  // pink-400 → pink-800
  '#06b6d4': '#164e63',  // cyan-500 → cyan-900
  '#22d3ee': '#164e63',  // cyan-400 → cyan-900
  '#84cc16': '#3f6212',  // lime-500 → lime-800
  '#a3e635': '#3f6212',  // lime-400 → lime-800
  // 边框色也需要同步修复
  '#dc2626': '#b91c1c',  // red-600 → red-700
  '#d97706': '#b45309',  // amber-600 → amber-700
  '#d59e0b': '#b45309',
  '#059669': '#047857',  // emerald-600 → emerald-700
  '#10b981': '#047857',  // duplicate
  '#4f46e5': '#4338ca',  // indigo-600 → indigo-700
  '#6366f1': '#4338ca',  // duplicate
  '#7c3aed': '#6d28d9',  // violet-600 → violet-700
  '#8b5cf6': '#6d28d9',  // duplicate
  '#db2777': '#be185d',  // pink-600 → pink-700
  '#0891b2': '#0e7490',  // cyan-600 → cyan-700
  '#65a30d': '#4d7c0f',  // lime-600 → lime-700
  '#2563eb': '#1d4ed8',  // blue-600 → blue-700
  '#3b82f6': '#1d4ed8',  // blue-500 → blue-700
  // Material Design light colors — dangerously low contrast with white text
  '#e1f5fe': '#1e3a5f',  // MD light blue 50 → deep navy
  '#b3e5fc': '#075985',  // MD light blue 100 → deep blue
  '#81d4fa': '#075985',  // MD light blue 200 → deep blue
  '#c8e6c9': '#064e3b',  // MD light green 100 → deep green
  '#a5d6a7': '#064e3b',  // MD light green 200 → deep green
  '#81c784': '#064e3b',  // MD light green 300 → deep green
  '#fff3e0': '#92400e',  // MD orange 50 → deep amber
  '#ffe0b2': '#92400e',  // MD orange 100 → deep amber
  '#ffcc80': '#92400e',  // MD orange 200 → deep amber
  '#fff9c4': '#713f12',  // MD yellow 100 → deep yellow
  '#fff59d': '#713f12',  // MD yellow 200 → deep yellow
  '#f8bbd0': '#831843',  // MD pink 100 → deep pink
  '#f48fb1': '#831843',  // MD pink 200 → deep pink
  '#e1bee7': '#581c87',  // MD purple 100 → deep purple
  '#ce93d8': '#581c87',  // MD purple 200 → deep purple
  '#b2ebf2': '#164e63',  // MD cyan 100 → deep cyan
  '#80deea': '#164e63',  // MD cyan 200 → deep cyan
  '#d7ccc8': '#5d4037',  // MD brown 100 → deep brown
  '#bcaaa4': '#5d4037',  // MD brown 200 → deep brown
  '#cfd8dc': '#374151',  // MD blue grey 100 → deep grey
  '#b0bec5': '#374151',  // MD blue grey 200 → deep grey
};

// 也修复 stroke 色
function fixColors(content) {
  let changed = 0;
  let fixed = content;
  
  // 修复 fill 色
  for (const [unsafe, safe] of Object.entries(COLOR_MAP)) {
    const fillPattern = new RegExp(`fill:${unsafe}`, 'g');
    const count = (fixed.match(fillPattern) || []).length;
    if (count > 0) {
      fixed = fixed.replace(fillPattern, `fill:${safe}`);
      changed += count;
    }
  }
  
  // 修复 stroke 色
  for (const [unsafe, safe] of Object.entries(COLOR_MAP)) {
    const strokePattern = new RegExp(`stroke:${unsafe}`, 'g');
    const count = (fixed.match(strokePattern) || []).length;
    if (count > 0) {
      fixed = fixed.replace(strokePattern, `stroke:${safe}`);
      changed += count;
    }
  }
  
  return { content: fixed, changed };
}

function getAllTsFiles(dir) {
  let results = [];
  try {
    const entries = readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = join(dir, entry.name);
      if (entry.isDirectory()) {
        results = results.concat(getAllTsFiles(fullPath));
      } else if (entry.name.endsWith('.ts')) {
        results.push(fullPath);
      }
    }
  } catch (e) {}
  return results;
}

const args = process.argv.slice(2);
let filesToFix = [];

if (args.length > 0) {
  filesToFix = args;
} else {
  filesToFix = [
    ...getAllTsFiles(join(DATA_DIR, 'articles')),
    ...getAllTsFiles(join(DATA_DIR, 'blogs')),
  ];
}

let totalFixed = 0;
const fixedFiles = [];

for (const filePath of filesToFix) {
  try {
    const raw = readFileSync(filePath, 'utf-8');
    const { content, changed } = fixColors(raw);
    
    if (changed > 0) {
      writeFileSync(filePath, content, 'utf-8');
      totalFixed += changed;
      const relPath = relative(join(__dirname, '../src/data'), filePath);
      fixedFiles.push({ file: relPath, changes: changed });
    }
  } catch (e) {
    // Skip files that can't be read
  }
}

if (fixedFiles.length === 0) {
  console.log('✅ 无需修复，所有配色均安全');
} else {
  console.log(`✅ 修复了 ${fixedFiles.length} 个文件，共 ${totalFixed} 处配色：\n`);
  for (const f of fixedFiles) {
    console.log(`  ${f.file}: ${f.changes} 处`);
  }
}
