#!/usr/bin/env node
/**
 * 验证所有文章中 mermaid 图表的语法是否正确
 * 检查已知的不兼容语法，提前发现问题
 * 
 * 用法：node scripts/validate-mermaid.mjs
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ARTICLES_DIR = path.resolve(__dirname, '../src/data/articles');
const BLOGS_DIR = path.resolve(__dirname, '../src/data/blogs');

// 已知不安全的 mermaid 语法（v11.14.0）
const UNSAFE_PATTERNS = [
  { pattern: /^sequenceDiagram/, name: 'sequenceDiagram（不兼容 v11）', fix: '改用 graph LR/TD' },
  { pattern: /class\s+\w+\s*,\s*\w+/, name: 'class 多节点逗号分隔', fix: '每个节点单独写 style' },
  { pattern: /classDef\s+\w+\s+fill/, name: 'classDef 样式', fix: '直接在节点写 style' },
  { pattern: /--\.\w*\.-->/, name: '虚线箭头 -.text.-. ', fix: '用 --> 或 -.->' },
];

let errors = 0;
let files = 0;
let totalMermaids = 0;

function checkFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const mermaidRegex = /mermaid:\s*`([^`]+)`/g;
  let match;
  
  while ((match = mermaidRegex.exec(content)) !== null) {
    totalMermaids++;
    const chart = match[1];
    
    for (const { pattern, name, fix } of UNSAFE_PATTERNS) {
      if (pattern.test(chart)) {
        const relPath = path.relative(process.cwd(), filePath);
        console.error(`❌ ${relPath}`);
        console.error(`   问题: ${name}`);
        console.error(`   修复: ${fix}`);
        errors++;
      }
    }
  }
  files++;
}

// 扫描所有文章和博客
for (const dir of [ARTICLES_DIR, BLOGS_DIR]) {
  if (!fs.existsSync(dir)) continue;
  for (const file of fs.readdirSync(dir)) {
    if (!file.endsWith('.ts')) continue;
    checkFile(path.join(dir, file));
  }
}

console.log(`\n✅ 检查了 ${files} 个文件，共 ${totalMermaids} 个 mermaid 图表`);
if (errors > 0) {
  console.error(`\n❌ 发现 ${errors} 个潜在语法问题`);
  process.exit(1);
} else {
  console.log('✅ 所有 mermaid 语法检查通过');
}
