#!/usr/bin/env node
/**
 * 工具集覆盖率审计脚本
 * 
 * 对比已知热点工具清单和工具集，发现遗漏
 * 用法：node scripts/audit-tool-coverage.mjs
 */

import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// 已知热点工具清单（从 KNOWN-AI-TOOLS.md 解析）
const KNOWN_TOOLS_FILE = join(__dirname, '../KNOWN-AI-TOOLS.md');
const TOOLS_FILE = join(__dirname, '../src/data/tools.ts');

// 解析已知热点工具清单
function parseKnownTools(filePath) {
  const content = readFileSync(filePath, 'utf8');
  const repos = [];
  // 匹配 markdown 中的 github 链接：- owner/repo 或 - [name](url)
  const lines = content.split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed.startsWith('- ')) continue;
    // Match: - https://github.com/owner/repo
    const urlMatch = trimmed.match(/github\.com\/([^)\s]+)/);
    if (urlMatch) {
      repos.push(urlMatch[1].toLowerCase());
      continue;
    }
    // Match: - owner/repo
    const repoMatch = trimmed.match(/^- ([\w-]+\/[\w-]+)$/);
    if (repoMatch) {
      repos.push(repoMatch[1].toLowerCase());
    }
  }
  return repos;
}

// 从工具集提取已收录的 GitHub 仓库
function extractToolRepos(toolsContent) {
  const urls = toolsContent.match(/https:\/\/github\.com\/[^\s"')\]]+/g) || [];
  return new Set(urls.map(u => {
    const match = u.match(/github\.com\/(.+?)(?:["')\s,|]|$)/);
    return match ? match[1].toLowerCase() : null;
  }).filter(Boolean));
}

// 主流程
const knownTools = parseKnownTools(KNOWN_TOOLS_FILE);
const toolsContent = readFileSync(TOOLS_FILE, 'utf8');
const existingRepos = extractToolRepos(toolsContent);

const missing = knownTools.filter(r => !existingRepos.has(r));
const covered = knownTools.filter(r => existingRepos.has(r));

console.log(`\n📊 工具集覆盖率审计`);
console.log(`已知热点工具: ${knownTools.length} 个`);
console.log(`已收录: ${covered.length} 个 (${Math.round(covered.length/knownTools.length*100)}%)`);
console.log(`遗漏: ${missing.length} 个`);

if (missing.length > 0) {
  console.log('\n⚠️ 遗漏的工具：');
  missing.forEach(r => console.log(`  - https://github.com/${r}`));
} else {
  console.log('\n✅ 覆盖率 100%，无遗漏');
}

process.exit(missing.length > 0 ? 1 : 0);
