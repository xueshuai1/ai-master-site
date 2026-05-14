#!/usr/bin/env node
/**
 * Pre-commit hook: 检查 mermaid 图表配色对比度
 * 不达标时阻止提交，防止浅色背景+亮色文字的问题再次出现
 * 
 * 使用方式：
 * 1. 复制此脚本到 .husky/pre-commit 或手动在提交前运行
 * 2. 或作为 CI 检查步骤
 * 
 * npm run lint:mermaid
 */

const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '../src/data');

// WCAG 对比度计算
function relativeLuminance(r, g, b) {
  const [rs, gs, bs] = [r, g, b].map(c => {
    c /= 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

function hexToRgb(hex) {
  hex = hex.replace('#', '');
  if (hex.length === 3) hex = hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2];
  const num = parseInt(hex, 16);
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
}

function contrastRatio(c1, c2) {
  const l1 = relativeLuminance(...hexToRgb(c1));
  const l2 = relativeLuminance(...hexToRgb(c2));
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
}

const DEFAULT_TEXT = '#e2e8f0';
const MIN_CONTRAST = 4.5;

// 允许使用的安全配色（与 #e2e8f0 默认文字对比度 >= 4.5:1）
// 注：#b45309 对比度 4.07，已移除；如需琥珀色请用 #92400e (5.75)
const SAFE_COLORS = new Set([
  // Tailwind 深色系列
  '#0c4a6e', '#1e3a5f', '#14532d', '#7f1d1d', '#881337',
  '#7c2d12', '#713f12', '#581c87', '#374151', '#134e4a',
  '#92400e', '#be123c', '#075985', '#155e75',
  // 更深的变体
  '#5b21b6', '#3730a3', '#4338ca', '#1d4ed8', '#047857',
  '#b91c1c', '#991b1b', '#78350f', '#6d28d9',
  '#9a3412', '#831843', '#064e3b', '#312e81', '#475569',
  '#3f6212', '#334155',
]);

function getAllFiles(dir) {
  let results = [];
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        results = results.concat(getAllFiles(fullPath));
      } else if (entry.name.endsWith('.ts')) {
        results.push(fullPath);
      }
    }
  } catch (e) {
    // Skip if directory doesn't exist
  }
  return results;
}

// 只检查最近修改的文件（git staged）或直接全量检查
const allFiles = getAllFiles(DATA_DIR);
let totalIssues = 0;
const errors = [];

for (const filePath of allFiles) {
  const content = fs.readFileSync(filePath, 'utf8');
  const relPath = path.relative(DATA_DIR, filePath);
  const lines = content.split('\n');

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line.startsWith('style ')) continue;

    const fillMatch = line.match(/fill:([#][0-9a-fA-F]+)/i);
    if (!fillMatch) continue;

    const fillColor = fillMatch[1].toLowerCase();
    const colorMatch = line.match(/color:([#][0-9a-fA-F]+)/i);
    const textColor = colorMatch ? colorMatch[1] : DEFAULT_TEXT;
    const cr = contrastRatio(fillColor, textColor);

    if (cr < MIN_CONTRAST) {
      totalIssues++;
      errors.push({
        file: relPath,
        line: i + 1,
        fill: fillColor,
        text: textColor,
        ratio: cr.toFixed(2),
      });
    }
  }
}

if (totalIssues > 0) {
  console.error('\n❌ Mermaid 配色对比度检查失败！\n');
  console.error(`发现 ${totalIssues} 处对比度不足（< ${MIN_CONTRAST}:1 WCAG AA 标准）\n`);
  
  errors.slice(0, 10).forEach(e => {
    console.error(`  ${e.file}:${e.line}`);
    console.error(`    fill:${e.fill} + color:${e.text} → 对比度 ${e.ratio}:1`);
  });
  
  if (errors.length > 10) {
    console.error(`  ... 还有 ${errors.length - 10} 处`);
  }

  console.error('\n💡 修复建议：');
  console.error('  - 使用深色背景色（如 #1e3a5f、#14532d、#7f1d1d）');
  console.error('  - 浅色背景必须配深色文字 color:#1e293b');
  console.error('  - 参考 Tailwind 800-900 色阶');
  console.error('  - 详见 docs/MERMAID-COLORS.md\n');
  
  process.exit(1);
} else {
  console.log('✅ Mermaid 配色对比度检查通过');
  process.exit(0);
}
