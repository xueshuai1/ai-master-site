#!/usr/bin/env node
/**
 * 工具数据校验脚本
 * 检查：重复ID、必填字段、URL格式、分类有效性
 * 运行：node scripts/validate-tools.mjs
 */

import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

const VALID_CATEGORIES = ['llm', 'agent', 'multimodal', 'devops', 'cli', 'plugin', 'data', 'frontend', 'video', 'audio', 'image', 'coding', 'research', 'security', 'education', 'productivity'];

let errors = 0;
let warnings = 0;

function error(msg) { console.error(`❌ ${msg}`); errors++; }
function warn(msg) { console.error(`⚠️  ${msg}`); warnings++; }
function ok(msg) { console.error(`✅ ${msg}`); }

try {
  const content = readFileSync(join(ROOT, 'src/data/tools.ts'), 'utf-8');
  
  // 1. 提取所有工具对象
  const idRegex = /id:\s*"([^"]+)"/g;
  const nameRegex = /name:\s*"([^"]+)"/g;
  const categoryRegex = /category:\s*"([^"]+)"/g;
  const urlRegex = /url:\s*"([^"]+)"/g;
  
  const ids = [...content.matchAll(idRegex)].map(m => m[1]);
  const names = [...content.matchAll(nameRegex)].map(m => m[1]);
  const categories = [...content.matchAll(categoryRegex)].map(m => m[1]);
  const urls = [...content.matchAll(urlRegex)].map(m => m[1]);
  
  // 2. 检查重复ID
  const idCounts = {};
  ids.forEach(id => { idCounts[id] = (idCounts[id] || 0) + 1; });
  const dups = Object.entries(idCounts).filter(([, c]) => c > 1);
  if (dups.length > 0) {
    dups.forEach(([id, count]) => error(`重复ID: "${id}" 出现 ${count} 次`));
  } else {
    ok(`无重复ID (${ids.length} 个工具)`);
  }
  
  // 3. 检查空ID
  const emptyIds = ids.filter(id => !id || id.trim() === '');
  if (emptyIds.length > 0) {
    error(`发现 ${emptyIds.length} 个空ID`);
  }
  
  // 4. 检查必填字段数量一致性
  if (ids.length !== names.length) {
    error(`ID(${ids.length}) 和 name(${names.length}) 数量不一致`);
  }
  if (ids.length !== categories.length) {
    error(`ID(${ids.length}) 和 category(${categories.length}) 数量不一致`);
  }
  if (ids.length !== urls.length) {
    error(`ID(${ids.length}) 和 url(${urls.length}) 数量不一致`);
  }
  
  // 5. 检查无效分类
  const invalidCats = categories.filter(c => !VALID_CATEGORIES.includes(c));
  if (invalidCats.length > 0) {
    warn(`非常见分类: ${[...new Set(invalidCats)].join(', ')}`);
  }
  
  // 6. 检查 URL 格式
  const invalidUrls = urls.filter(u => !u.startsWith('http'));
  if (invalidUrls.length > 0) {
    error(`${invalidUrls.length} 个无效URL: ${invalidUrls.slice(0, 3).join(', ')}...`);
  }
  
  // 7. 检查数组中是否有空条目 (,, 或 [, ,])
  if (/,\s*,/.test(content)) {
    error('工具数组中存在空条目（连续逗号）');
  }
  
  console.error(`\n📊 总计: ${ids.length} 个工具, ${errors} 错误, ${warnings} 警告`);
  process.exit(errors > 0 ? 1 : 0);
  
} catch (e) {
  console.error(`❌ 读取失败: ${e.message}`);
  process.exit(1);
}
