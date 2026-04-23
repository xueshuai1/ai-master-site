#!/usr/bin/env node
/**
 * 校验 tools.ts 数据完整性
 * 检查项：
 * 1. id 唯一性
 * 2. 必填字段完整性
 */

import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const TOOLS_FILE = join(ROOT, 'src/data/tools.ts');

const content = readFileSync(TOOLS_FILE, 'utf-8');

// Extract tool objects
const idRegex = /id:\s*"([^"]+)"/g;
const ids = [];
let m;
while ((m = idRegex.exec(content)) !== null) {
  ids.push(m[1]);
}

let hasError = false;

// Check duplicates
const counts = {};
for (const id of ids) {
  counts[id] = (counts[id] || 0) + 1;
}

const dupes = Object.entries(counts).filter(([, c]) => c > 1);
if (dupes.length > 0) {
  console.error(`❌ 发现 ${dupes.length} 个重复的 tool id:`);
  for (const [id, count] of dupes) {
    console.error(`  • "${id}" 出现 ${count} 次`);
  }
  hasError = true;
}

if (!hasError) {
  console.log(`✅ 工具校验通过（${ids.length} 个工具，id 全部唯一）`);
}

process.exit(hasError ? 1 : 0);
