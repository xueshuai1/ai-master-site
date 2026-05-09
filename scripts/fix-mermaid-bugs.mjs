/**
 * Mermaid Bug 批量修复脚本
 * 
 * 修复两类问题：
 * 1. 字面量 \n 字符（应该是真正的换行符）
 * 2. graph TD 中混入 title 声明（应删除或改用注释）
 * 
 * 用法: node scripts/fix-mermaid-bugs.mjs [--dry-run]
 */

import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

const DIRS = ['src/data/articles', 'src/data/blogs'];
const dryRun = process.argv.includes('--dry-run');

function fileHash(content) {
  return crypto.createHash('md5').update(content).digest('hex').slice(0, 8);
}

function findAllTSFiles(dirs) {
  const files = [];
  for (const dir of dirs) {
    if (!fs.existsSync(dir)) continue;
    for (const file of fs.readdirSync(dir)) {
      if (file.endsWith('.ts')) {
        files.push(path.join(dir, file));
      }
    }
  }
  return files.sort();
}

function fixFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const relPath = path.relative(process.cwd(), filePath);
  const bugs = [];

  // ─── Bug 1: 字面量 \n 在 mermaid 块中 ───
  // 匹配 mermaid: `...` 多行块中的字面量 \n
  // 策略：找到 mermaid: ` 开头，到下一个 ` 结尾（后面跟 , 或换行+indent+非mermaid字段）
  const mermaidBlockRegex = /mermaid:\s*`([\s\S]*?)`\s*,?\s*\n/g;
  let hasChanges = false;
  let newContent = content;
  let match;
  const replacements = [];

  while ((match = mermaidBlockRegex.exec(content)) !== null) {
    const fullMatch = match[0];
    const mermaidContent = match[1];
    const startOffset = match.index;
    const endOffset = match.index + fullMatch.length;

    // 检查是否有字面量 \n
    if (mermaidContent.includes('\\n')) {
      const fixedContent = mermaidContent.replace(/\\n/g, '\n');
      const fixedBlock = fullMatch.replace(mermaidContent, fixedContent);
      replacements.push({
        start: startOffset,
        end: endOffset,
        original: fullMatch.slice(0, 80) + '...',
        fixed: fixedBlock.slice(0, 80) + '...',
        type: 'LITERAL_NEWLINE_ESCAPE',
        hash: fileHash(`${relPath}:${startOffset}:LITERAL_NEWLINE_ESCAPE`),
      });
    }

    // 检查是否有 graph TD 中的 title 声明
    const firstLine = mermaidContent.split('\n')[0].trim();
    if ((firstLine.startsWith('graph ') || firstLine.startsWith('flowchart ')) &&
        mermaidContent.includes('\n    title ')) {
      const fixedContent = mermaidContent.replace(/\n\s+title\s+[^\n]+/g, '');
      const fixedBlock = fullMatch.replace(mermaidContent, fixedContent);
      replacements.push({
        start: startOffset,
        end: endOffset,
        original: fullMatch.slice(0, 80) + '...',
        fixed: fixedBlock.slice(0, 80) + '...',
        type: 'INVALID_GRAPH_TITLE',
        hash: fileHash(`${relPath}:${startOffset}:INVALID_GRAPH_TITLE`),
      });
    }
  }

  // 去重（同一个 mermaid 块可能有多种问题）
  const seenStarts = new Set();
  const uniqueReplacements = [];
  for (const r of replacements) {
    // 合并同一位置的替换
    const existing = uniqueReplacements.find(u => u.start === r.start);
    if (existing) {
      // 应用两种修复
      const originalContent = newContent.slice(existing.start, existing.end);
      let fixedContent = originalContent;
      const mermaidMatch = originalContent.match(/mermaid:\s*`([\s\S]*?)`\s*,?\s*\n/);
      if (mermaidMatch) {
        let mc = mermaidMatch[1];
        if (r.type === 'LITERAL_NEWLINE_ESCAPE' || existing.type === 'LITERAL_NEWLINE_ESCAPE') {
          mc = mc.replace(/\\n/g, '\n');
        }
        if (r.type === 'INVALID_GRAPH_TITLE' || existing.type === 'INVALID_GRAPH_TITLE') {
          const firstLine = mc.split('\n')[0].trim();
          if (firstLine.startsWith('graph ') || firstLine.startsWith('flowchart ')) {
            mc = mc.replace(/\n\s+title\s+[^\n]+/g, '');
          }
        }
        const fixed = originalContent.replace(mermaidMatch[1], mc);
        existing.end = existing.start + fixed.length;
        existing.fixed = fixed.slice(0, 80) + '...';
        existing.types = [...new Set([...(existing.types || [existing.type]), r.type])];
        existing.type = existing.types.join(' + ');
      }
    } else {
      uniqueReplacements.push({ ...r, types: [r.type] });
    }
  }

  if (uniqueReplacements.length === 0) return [];

  // 应用修复（从后往前替换，避免偏移问题）
  uniqueReplacements.sort((a, b) => b.start - a.start);

  let result = newContent;
  for (const r of uniqueReplacements) {
    const originalBlock = result.slice(r.start, r.end);
    const mermaidMatch = originalBlock.match(/mermaid:\s*`([\s\S]*?)`\s*,?\s*\n/);
    if (!mermaidMatch) continue;

    let mc = mermaidMatch[1];
    let fixed = mc;

    for (const t of r.types) {
      if (t === 'LITERAL_NEWLINE_ESCAPE') {
        fixed = fixed.replace(/\\n/g, '\n');
      }
      if (t === 'INVALID_GRAPH_TITLE') {
        const firstLine = fixed.split('\n')[0].trim();
        if (firstLine.startsWith('graph ') || firstLine.startsWith('flowchart ')) {
          fixed = fixed.replace(/\n\s+title\s+[^\n]+/g, '');
        }
      }
    }

    if (fixed === mc) continue;

    const newBlock = originalBlock.replace(mc, fixed);
    result = result.slice(0, r.start) + newBlock + result.slice(r.end);
    bugs.push({
      file: relPath,
      type: r.types.join(' + '),
      hash: r.hash,
      snippet: mc.slice(0, 100).replace(/\n/g, '\\n'),
    });
    hasChanges = true;
  }

  if (hasChanges && !dryRun) {
    fs.writeFileSync(filePath, result, 'utf8');
  }

  return bugs;
}

function main() {
  console.log(`🔍 Mermaid Bug 批量${dryRun ? '检查（DRY RUN）' : '修复'}启动...\n`);

  const files = findAllTSFiles(DIRS);
  console.log(`📂 扫描 ${files.length} 个文件\n`);

  const allBugs = [];
  let fixedCount = 0;

  for (const file of files) {
    try {
      const bugs = fixFile(file);
      if (bugs.length > 0) {
        fixedCount++;
        allBugs.push(...bugs);
      }
    } catch (e) {
      console.error(`❌ 处理失败: ${file} - ${e.message}`);
    }
  }

  console.log(`\n📊 完成: ${fixedCount} 个文件有可修复的问题，共 ${allBugs.length} 处修复\n`);

  if (allBugs.length === 0) {
    console.log('✅ 没有发现需要修复的 Mermaid 问题！');
    return;
  }

  // 按类型分组统计
  const byType = {};
  for (const bug of allBugs) {
    byType[bug.type] = (byType[bug.type] || 0) + 1;
  }
  for (const [type, count] of Object.entries(byType)) {
    console.log(`  ${type}: ${count} 处`);
  }
  console.log('');

  // 输出前 30 个详情
  console.log(`📋 问题详情（前 30 个）:\n`);
  for (let i = 0; i < Math.min(30, allBugs.length); i++) {
    const bug = allBugs[i];
    console.log(`  ${i + 1}. ${bug.file}`);
    console.log(`     类型: ${bug.type}`);
    console.log(`     Hash: ${bug.hash}`);
    console.log(`     代码: ${bug.snippet.slice(0, 80)}`);
    console.log('');
  }

  // 保存报告
  const reportPath = path.resolve('scripts/mermaid-fix-report.json');
  const report = {
    timestamp: new Date().toISOString(),
    dryRun,
    fixedFiles: fixedCount,
    totalFixes: allBugs.length,
    byType,
    bugs: allBugs,
  };
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`📋 修复报告: ${reportPath}`);
}

main();
