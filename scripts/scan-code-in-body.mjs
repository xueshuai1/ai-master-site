#!/usr/bin/env node
// 扫描所有知识库文章和博客文章的 TS 文件
// 找出 body 中包含 markdown 代码块（``` 或 \`\`\`）但没用独立 code 结构的部分

import { readFileSync, readdirSync } from 'fs';
import { join, basename } from 'path';

const PROJECT_ROOT = new URL('..', import.meta.url).pathname;
const ARTICLES_DIR = join(PROJECT_ROOT, 'src/data/articles');
const BLOGS_DIR = join(PROJECT_ROOT, 'src/data/blogs');

const SKIP_FILES = new Set(['knowledge.ts', 'update-time.ts', 'blogs.ts', 'blog-types.ts', 'index.ts']);

/**
 * 解析 TS 文件，提取每个 section 的 title 和 body 内容
 * 使用基于对象结构的方法：找 { title: ..., body: ..., ... } 块
 */
function scanFile(filePath) {
  const raw = readFileSync(filePath, 'utf-8');
  const issues = [];

  // 策略：找到所有 title: "xxx" 或 title: 'xxx'，
  // 然后检查同一 section 中的 body 是否包含代码块

  // 匹配 title: "..." 或 title: '...'
  const titleRegex = /title:\s*["']([^"']+)["']/g;
  let titleMatch;

  while ((titleMatch = titleRegex.exec(raw)) !== null) {
    const title = titleMatch[1];
    const titlePos = titleMatch.index;

    // 从这个 title 往后找 body:
    const afterTitle = raw.substring(titlePos);
    const bodyMatch = afterTitle.match(/body:\s*(`|"|')/);
    if (!bodyMatch) continue;

    const quoteChar = bodyMatch[1];
    const bodyStartPos = titlePos + bodyMatch.index + bodyMatch[0].length;

    // 找到 body 内容的结束位置
    // 对于 template string (`)，需要找不被转义的反引号
    // 对于字符串 ("或')，找不被转义的引号
    let bodyEndPos = -1;
    let i = bodyStartPos;
    while (i < raw.length) {
      const ch = raw[i];
      if (ch === quoteChar) {
        // 检查前面是否有奇数个反斜杠（转义）
        let backslashCount = 0;
        let j = i - 1;
        while (j >= bodyStartPos && raw[j] === '\\') {
          backslashCount++;
          j--;
        }
        if (backslashCount % 2 === 0) {
          // 没有被转义，这是结束引号
          bodyEndPos = i;
          break;
        }
      }
      i++;
    }

    if (bodyEndPos === -1) continue;

    const bodyContent = raw.substring(bodyStartPos, bodyEndPos);

    // 检查 body 中是否有代码块（``` 或 \`\`\`）
    // 注意：在模板字符串中，代码块写成 \`\`\` 或 ```
    const hasCodeBlock = bodyContent.includes('```') || bodyContent.includes('\\`\\`\\`');

    if (hasCodeBlock) {
      // 只统计代码块起始标记（忽略结束标记）
      // 匹配 ```lang 或 \`\`\`lang（后面跟换行或空白），排除 ```\n（无语言标记的结束标记）
      const codeBlockStartRe = /(?:\\`\\`\\`|```)(\w*)\s*$/gm;
      const codeBlockEndRe = /(?:\\`\\`\\`|```)\s*$/gm;
      const starts = [...bodyContent.matchAll(codeBlockStartRe)].filter(m => m.index !== undefined);
      const ends = [...bodyContent.matchAll(codeBlockEndRe)].filter(m => m.index !== undefined);
      
      // 实际代码块数 = 起始标记数（每个起始对应一个结束）
      // 如果结束标记比开始多，说明有 false positive
      const codeBlockCount = Math.min(starts.length, ends.length);
      const langs = starts.slice(0, codeBlockCount).map(m => m[1] || 'text');

      // 计算行号
      const lineNum = raw.substring(0, titlePos).split('\n').length;

      issues.push({
        line: lineNum,
        title,
        codeBlocks: langs,
        codeBlockCount,
      });
    }
  }

  return issues;
}

function getTsFiles(dir) {
  const files = [];
  for (const f of readdirSync(dir)) {
    if (f.endsWith('.ts') && !SKIP_FILES.has(f)) {
      files.push(join(dir, f));
    }
  }
  return files.sort();
}

const articleFiles = getTsFiles(ARTICLES_DIR);
const blogFiles = getTsFiles(BLOGS_DIR);

const allResults = [];

console.log('🔍 开始扫描知识库文章...\n');

for (const file of articleFiles) {
  const issues = scanFile(file);
  if (issues.length > 0) {
    allResults.push({ category: '知识库', file: basename(file), dir: 'articles', issues });
  }
}

console.log('🔍 开始扫描博客文章...\n');

for (const file of blogFiles) {
  const issues = scanFile(file);
  if (issues.length > 0) {
    allResults.push({ category: '博客', file: basename(file), dir: 'blogs', issues });
  }
}

// 输出结果
console.log('\n' + '='.repeat(80));
console.log('📊 扫描结果\n');

if (allResults.length === 0) {
  console.log('✅ 所有文章都使用了正确的 code 独立结构！');
} else {
  let totalSections = 0;
  let totalCodeBlocks = 0;

  for (const group of allResults) {
    console.log(`\n📁 ${group.category}: ${group.file}`);
    console.log('-'.repeat(60));
    for (const issue of group.issues) {
      console.log(`  第 ${issue.line} 行 | 章节: "${issue.title}" | 代码块: ${issue.codeBlockCount} 个 (${issue.codeBlocks.join(', ')})`);
      totalSections++;
      totalCodeBlocks += issue.codeBlockCount;
    }
  }

  console.log('\n' + '='.repeat(80));
  console.log(`\n📋 总计: ${allResults.length} 个文件有问题，共 ${totalSections} 个 section 需要修复，涉及 ${totalCodeBlocks} 个代码块`);

  console.log('\n📝 需要修复的文件列表:');
  for (const group of allResults) {
    for (const issue of group.issues) {
      console.log(`  - src/data/${group.dir}/${group.file} (第 ${issue.line} 行: "${issue.title}")`);
    }
  }
}
