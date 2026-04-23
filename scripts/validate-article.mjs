#!/usr/bin/env node
/**
 * 文章发布前校验脚本
 * 
 * 检查项：
 * 1. Mermaid 配色对比度（WCAG AA ≥ 4.5:1）
 * 2. 代码块是否提取到 code: 字段
 * 3. 基本格式完整性
 * 
 * 用法：
 *   node scripts/validate-article.mjs                    # 全量检查
 *   node scripts/validate-article.mjs src/data/articles/agent-027.ts  # 单文件
 */

import { readFileSync, readdirSync, statSync } from 'fs';
import { join, relative, basename } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const DATA_DIR = join(__dirname, '../src/data');

// ===== 配色检查 =====

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

const MIN_CONTRAST = 4.5;
const DEFAULT_TEXT = '#f1f5f9';

// ✅ 安全配色表（经过对比度验证的颜色）
const SAFE_FILLS = new Set([
  '#0c4a6e', '#1e3a5f', '#14532d', '#7f1d1d', '#881337',
  '#7c2d12', '#713f12', '#581c87', '#374151', '#134e4a',
  '#92400e', '#be123c', '#075985', '#155e75', '#5b21b6',
  '#3730a3', '#4338ca', '#1d4ed8', '#047857', '#b45309',
  '#b91c1c', '#991b1b', '#78350f', '#6d28d9', '#9a3412',
  '#831843', '#064e3b', '#312e81', '#475569', '#3f6212',
  '#65a30d', '#334155', '#1e3a8a', '#78350f',
  // Tailwind 900 色阶 — 深色配白字安全
  '#7f1d1d', '#991b1b', '#7f1d1d',
  '#92400e', '#78350f',
  '#713f12',
  '#14532d', '#064e3b',
  '#164e63', '#134e4a',
  '#1e3a8a', '#1e3a5f', '#172554',
  '#581c87', '#3b0764',
  '#831843', '#500724',
  '#374151', '#1f2937', '#111827',
]);

function checkMermaidColors(content, filePath) {
  const errors = [];
  const lines = content.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line.startsWith('style ')) continue;

    const fillMatch = line.match(/fill:([#][0-9a-fA-F]+)/i);
    if (!fillMatch) continue;

    const fillColor = fillMatch[1].toLowerCase();
    const colorMatch = line.match(/color:([#][0-9a-fA-F]+)/i);
    const textColor = colorMatch ? colorMatch[1].toLowerCase() : DEFAULT_TEXT;
    const cr = contrastRatio(fillColor, textColor);

    if (cr < MIN_CONTRAST) {
      // 推荐替代色
      const suggestion = getSafeAlternative(fillColor);
      errors.push({
        line: i + 1,
        file: filePath,
        fill: fillColor,
        text: textColor,
        ratio: cr.toFixed(2),
        suggestion,
      });
    }
  }
  return errors;
}

function getSafeAlternative(badColor) {
  // 根据色相推荐同色系安全色
  const map = {
    '#ef4444': '#991b1b',  // red-500 → red-800
    '#f59e0b': '#92400e',  // amber-500 → amber-800
    '#fbbf24': '#92400e',  // amber-400 → amber-800
    '#fcd34d': '#92400e',  // amber-300 → amber-800
    '#10b981': '#064e3b',  // emerald-500 → emerald-900
    '#34d399': '#064e3b',  // emerald-400 → emerald-900
    '#6366f1': '#3730a3',  // indigo-500 → indigo-800
    '#818cf8': '#3730a3',  // indigo-400 → indigo-800
    '#8b5cf6': '#581c87',  // violet-500 → violet-900
    '#a78bfa': '#581c87',  // violet-400 → violet-900
    '#ec4899': '#831843',  // pink-500 → pink-800
    '#f472b6': '#831843',  // pink-400 → pink-800
    '#06b6d4': '#164e63',  // cyan-500 → cyan-900
    '#22d3ee': '#164e63',  // cyan-400 → cyan-900
    '#84cc16': '#3f6212',  // lime-500 → lime-800
    '#a3e635': '#3f6212',  // lime-400 → lime-800
  };
  return map[badColor] || '#1e3a5f';
}

// ===== 代码块检查 =====
// 注意：body 中嵌入代码块（\`\`\`）是合法的格式，不报错
// 只检查是否有 extract-code.js 导致的 garbled text（在 checkBasicFormat 中）

// ===== Mermaid 类型检查 =====
const VALID_MERMAID_TYPES = new Set([
  'graph TD', 'graph LR', 'graph BT', 'graph RL',
  'flowchart TD', 'flowchart LR', 'flowchart BT', 'flowchart RL',
  'sequenceDiagram', 'pie', 'gantt', 'stateDiagram-v2',
  'classDiagram', 'erDiagram', 'journey', 'quadrantChart', 'mindmap',
]);

function checkMermaidTypes(content, filePath) {
  const errors = [];
  // Capture full type: "graph TD", "graph LR", "sequenceDiagram", "stateDiagram-v2", "tree-beta", etc.
  const mermaidRegex = /mermaid:\s*`([a-zA-Z][a-zA-Z0-9-]*(?:\s+(?:TD|LR|BT|RL|v2))?)/g;
  let match;
  while ((match = mermaidRegex.exec(content)) !== null) {
    const type = match[1];
    const lineNum = (content.substring(0, match.index).match(/\n/g) || []).length + 1;
    if (!VALID_MERMAID_TYPES.has(type)) {
      const suggestion = type.startsWith('graph') || type.startsWith('flowchart') ? 'graph TD' : 'graph TD';
      errors.push({
        file: filePath,
        type: 'invalid_mermaid_type',
        line: lineNum,
        message: `Mermaid 类型 "${type}" 不合法，会渲染为空白块。建议使用: ${suggestion}`,
      });
    }
  }
  return errors;
}

// ===== 基本格式检查 =====

function checkBasicFormat(content, filePath) {
  const errors = [];
  
  // 检查是否有 id, title, category
  if (!content.match(/id:\s*["']/)) {
    errors.push({ file: filePath, type: 'missing_id', message: '缺少 id 字段' });
  }
  if (!content.match(/title:\s*["']/)) {
    errors.push({ file: filePath, type: 'missing_title', message: '缺少 title 字段' });
  }
  if (!content.match(/category:\s*["']/)) {
    errors.push({ file: filePath, type: 'missing_category', message: '缺少 category 字段' });
  }
  
  // 检查 content 数组是否存在
  if (!content.includes('content: [')) {
    errors.push({ file: filePath, type: 'missing_content', message: '缺少 content: [] 数组' });
  }
  
  // 检查每个 section 是否有 title 和 body
  const sectionCount = (content.match(/title:\s*["']/g) || []).length;
  const bodyCount = (content.match(/body:\s*`/g) || []).length;
  if (sectionCount > 0 && bodyCount === 0) {
    errors.push({ file: filePath, type: 'missing_body', message: `有 ${sectionCount} 个 section title 但无 body 字段` });
  }
  
  // 🔴 检测 extract-code.js 导致的 body 损坏（garbled text）
  // extract-code.js 会替换代码块为 "xxx 代码如下：" 残骸
  const garbledTexts = [
    '流程如下：',
    'json 代码如下：',
    'python 代码如下：',
  ];
  
  // 逐行扫描，检测 body 模板字符串内的 garbled text
  const lines = content.split('\n');
  let inBody = false;
  let backtickBalance = 0;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // 检测进入 body 模板字符串
    if (line.includes('body: `')) {
      inBody = true;
    }
    
    // 检测退出 body 模板字符串（行以 `, 或 ` 结尾，且不在代码块内）
    if (inBody) {
      for (const text of garbledTexts) {
        if (line.includes(text)) {
          errors.push({ 
            file: filePath, 
            type: 'garbled_body', 
            line: i + 1,
            message: `body 中有 extract-code.js 残骸 "${text}" — 代码块被提取到了 code: 字段，应还原为 body 内的代码块` 
          });
          break;
        }
      }
      
      // 简单检测 body 模板结束（行末尾有 ` 且不是转义的 \`）
      const trimmed = line.trimEnd();
      if (trimmed.endsWith('`,') || trimmed.endsWith('`,')) {
        inBody = false;
      }
    }
  }
  
  return errors;
}

// ===== 主流程 =====

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

const targetFile = process.argv[2];
let filesToCheck = [];

if (targetFile) {
  filesToCheck = [targetFile];
} else {
  filesToCheck = [
    ...getAllTsFiles(join(DATA_DIR, 'articles')),
    ...getAllTsFiles(join(DATA_DIR, 'blogs')),
  ];
}

let allErrors = [];
let checkedCount = 0;

for (const filePath of filesToCheck) {
  let content;
  try {
    content = readFileSync(filePath, 'utf-8');
  } catch (e) {
    continue;
  }
  
  const relPath = relative(join(__dirname, '../src/data'), filePath);
  checkedCount++;
  
  // 1. Mermaid 配色检查
  const mermaidErrors = checkMermaidColors(content, relPath);
  allErrors.push(...mermaidErrors.map(e => ({ ...e, severity: 'error' })));
  
  // 2. Mermaid 类型检查
  const mermaidTypeErrors = checkMermaidTypes(content, relPath);
  allErrors.push(...mermaidTypeErrors.map(e => ({ ...e, severity: 'error' })));
  
  // 3. 基本格式检查（含 garbled body 检测）
  const formatErrors = checkBasicFormat(content, relPath);
  allErrors.push(...formatErrors.map(e => ({ ...e, severity: 'error' })));
}

// ===== 输出结果 =====

if (allErrors.length === 0) {
  console.log(`✅ 文章校验通过（检查了 ${checkedCount} 个文件）`);
  process.exit(0);
}

// 按严重性分类
const errors = allErrors.filter(e => e.severity === 'error');
const warnings = allErrors.filter(e => e.severity === 'warning');

if (errors.length > 0) {
  console.error(`\n❌ 发现 ${errors.length} 个错误：\n`);
  
  // 按文件分组
  const byFile = {};
  for (const e of errors) {
    if (!byFile[e.file]) byFile[e.file] = [];
    byFile[e.file].push(e);
  }
  
  for (const [file, fileErrors] of Object.entries(byFile)) {
    console.error(`📄 ${file}:`);
    for (const e of fileErrors) {
      if (e.type === 'garbled_body') {
        console.error(`  L${e.line}: ❌ ${e.message}`);
      } else if (e.type === 'invalid_mermaid_type') {
        console.error(`  L${e.line}: ❌ ${e.message}`);
      } else if (e.line && e.fill) {
        console.error(`  L${e.line}: fill:${e.fill} + color:${e.text} → 对比度 ${e.ratio}:1 < 4.5:1`);
        console.error(`    💡 建议：将 fill:${e.fill} 改为 fill:${e.suggestion}（同色系深色）`);
      } else {
        console.error(`  ${e.message}`);
      }
    }
    console.error('');
  }
}

if (warnings.length > 0) {
  console.warn(`\n⚠️ ${warnings.length} 个警告：\n`);
  for (const w of warnings) {
    console.warn(`  ${w.file}: ${w.message}`);
  }
}

console.error('\n💡 修复指南：');
console.error('  1. Mermaid 配色 → 使用 docs/MERMAID-COLORS.md 中的安全配色表');
console.error('  2. Mermaid 类型 → 只能使用 graph TD/LR、sequenceDiagram、pie 等合法类型');
console.error('  3. 代码块未提取 → 检查 code: 数组和 title 字段');
console.error('  4. 格式问题 → 参考 src/data/knowledge.ts 中的 Article 类型定义');
console.error('');

process.exit(1);
