#!/usr/bin/env node
/**
 * 批量修复 Mermaid 中的 <br/> 标签
 * 将 <br/> 替换为空格（Mermaid 节点标签自动换行不需要 <br/>）
 */
import { readFileSync, writeFileSync } from 'fs';
import { glob } from 'glob';

const files = await glob('src/data/{blogs/*.ts,articles/*.ts}');
let totalFiles = 0;
let totalReplacements = 0;

for (const file of files) {
  const content = readFileSync(file, 'utf-8');
  // Only fix <br/> inside mermaid blocks
  const newContent = content.replace(
    /(```mermaid[\s\S]*?```)/g,
    (block) => block.replace(/<br\/?>/g, ' ')
  );
  
  if (content !== newContent) {
    const count = (content.match(/<br\/?>/g) || []).length;
    writeFileSync(file, newContent, 'utf-8');
    console.log(`✅ ${file}: 修复 ${count} 处 <br/>`);
    totalFiles++;
    totalReplacements += count;
  }
}

console.log(`\n总计：修复 ${totalFiles} 个文件，共 ${totalReplacements} 处 <br/>`);
