#!/usr/bin/env node
/**
 * 扫描并修复所有文章/博客的 Markdown 语法问题
 * 
 * 检查和修复：
 * 1. Mermaid 中的反斜杠换行（\<newline> → \n）
 * 2. 加粗标签未闭合（段落内奇数个 **，正确排除代码块）
 * 3. 其他明确的格式问题
 */

import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join, relative } from 'path';

const ARTICLES_DIR = './src/data/articles';
const BLOGS_DIR = './src/data/blogs';
const CWD = process.cwd();

const allIssues = [];
const allFixes = [];
let totalFilesScanned = 0;
let totalFilesFixed = 0;

// ============================================================
// 内容提取：从 TypeScript 文件中提取模板字符串
// ============================================================

function extractFields(fileContent) {
  const results = [];
  const lines = fileContent.split('\n');
  
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    
    // 匹配 body/tip/warning/mermaid 字段的模板字符串开始
    const fieldMatch = line.match(/^\s*(body|tip|warning|mermaid):\s*`(.*)/);
    if (!fieldMatch) { i++; continue; }
    
    const fieldName = fieldMatch[1];
    const restOfLine = fieldMatch[2]; // backtick 后的内容
    const startLine = i + 1; // 1-indexed
    
    // 检查是否是单行（以 `, 或 `; 结尾）
    if (/`,?\s*$/.test(restOfLine) || /`;\s*$/.test(restOfLine)) {
      const content = restOfLine.replace(/`,?\s*$/, '').replace(/`;\s*$/, '');
      results.push({ fieldName, content, startLine, endLine: startLine });
      i++;
      continue;
    }
    
    // 多行模板字符串
    const contentLines = [restOfLine];
    i++;
    while (i < lines.length) {
      const tLine = lines[i];
      // 检查行是否以 `, 或 `; 或纯 ` 结尾（模板字符串结束）
      const closeMatch = tLine.match(/^([\s\S]*?)`,?\s*$/);
      if (closeMatch && (tLine.trimEnd().endsWith('`,') || tLine.trimEnd().endsWith('`;') || /`\s*$/.test(tLine))) {
        const closingContent = tLine.replace(/`,?\s*$/, '').replace(/`;\s*$/, '');
        contentLines.push(closingContent);
        results.push({
          fieldName,
          content: contentLines.join('\n'),
          startLine,
          endLine: i + 1
        });
        break;
      }
      contentLines.push(tLine);
      i++;
    }
    i++;
  }
  
  return results;
}

// ============================================================
// 工具：从 Markdown 文本中移除代码区域
// ============================================================

/**
 * 移除三反引号代码块，保留其他内容
 */
function stripCodeBlocks(text) {
  return text.replace(/```[\s\S]*?```/g, '\n\n');
}

/**
 * 移除行内代码（单反引号）
 */
function stripInlineCode(text) {
  return text.replace(/`[^`\n]+`/g, '``');
}

// ============================================================
// 检查：加粗标签平衡性
// ============================================================

/**
 * 检查 Markdown 内容中的加粗标签是否平衡
 * 返回 [{lineNum, message, text}]
 */
function checkBoldBalance(content, startLine) {
  const issues = [];
  
  // 先移除代码块，再检查
  const withoutCodeBlocks = stripCodeBlocks(content);
  
  // 按段落分割
  const paragraphs = withoutCodeBlocks.split(/\n\n+/);
  let lineOffset = 0;
  
  for (const para of paragraphs) {
    if (!para.trim()) {
      lineOffset += para.split('\n').length + 1;
      continue;
    }
    
    // 移除行内代码后计数
    const cleanPara = stripInlineCode(para);
    
    // 计算 ** 数量（不做任何其他转换）
    const boldCount = (cleanPara.match(/\*\*/g) || []).length;
    
    if (boldCount % 2 !== 0) {
      const firstLine = para.split('\n').find(l => l.trim()) || '';
      issues.push({
        lineNum: startLine + lineOffset,
        message: `加粗标签不平衡（共 ${boldCount} 个 **），可能存在未闭合的加粗`,
        text: firstLine.trim().substring(0, 120)
      });
    }
    
    lineOffset += para.split('\n').length + 1;
  }
  
  return issues;
}

// ============================================================
// 检查：Mermaid 反斜杠换行
// ============================================================

function checkMermaidBackslash(content, startLine) {
  const issues = [];
  const lines = content.split('\n');
  
  for (let i = 0; i < lines.length; i++) {
    if (/\\\s*$/.test(lines[i])) {
      issues.push({
        lineNum: startLine + i,
        message: 'Mermaid 中使用了 \\ 换行（\\ + 换行），应改为 \\n',
        text: lines[i].trim().substring(0, 100)
      });
    }
  }
  
  return issues;
}

// ============================================================
// 修复：Mermaid 反斜杠换行
// ============================================================

/**
 * 修复 mermaid 字段中的 \<newline> → \n
 * 在 TypeScript 模板字符串中，\ + 换行 = 行继续（换行被移除）
 * 在 mermaid 图表中，\n 才表示节点标签内的换行
 */
function fixMermaidBackslash(content, filePath, fixes) {
  if (!content.includes('\\\n')) return content;
  
  // 精确找到所有 mermaid 字段并修复
  const result = content.replace(
    /(mermaid:\s*`)([\s\S]*?)(`,?)/g,
    (match, prefix, mermaidContent, suffix) => {
      if (!mermaidContent.includes('\\\n')) return match;
      
      const fixed = mermaidContent.replace(/\\\n\s*/g, '\\n');
      
      if (fixed !== mermaidContent) {
        const count = (mermaidContent.match(/\\\n/g) || []).length;
        fixes.push({
          file: relative(CWD, filePath),
          type: 'MERMAID_BACKSLASH_NEWLINE',
          description: `Mermaid 反斜杠换行 → \\n（${count} 处）`
        });
      }
      
      return prefix + fixed + suffix;
    }
  );
  
  return result;
}

// ============================================================
// 修复：其他明确可自动修复的问题
// ============================================================

/**
 * 修复 body/tip/warning 中的常见可靠格式问题
 * 目前：暂不自动修复加粗问题（需人工确认上下文）
 */
function fixBodyContent(content, _filePath, _fixes) {
  return content;
}

// ============================================================
// 文件级别处理
// ============================================================

function processFile(filePath) {
  const original = readFileSync(filePath, 'utf-8');
  const relPath = relative(CWD, filePath);
  const fileIssues = [];
  const fileFixes = [];
  
  // --- 应用修复 ---
  let fixed = original;
  fixed = fixMermaidBackslash(fixed, filePath, fileFixes);
  fixed = fixBodyContent(fixed, filePath, fileFixes);
  
  // --- 扫描剩余问题 ---
  // 重新提取字段（使用修复后的内容）
  const fields = extractFields(fixed);
  
  for (const field of fields) {
    if (field.fieldName === 'mermaid') {
      // Mermaid 反斜杠问题（修复后应为0）
      const issues = checkMermaidBackslash(field.content, field.startLine);
      fileIssues.push(...issues.map(i => ({ ...i, file: relPath, field: 'mermaid' })));
    } else {
      // 加粗标签平衡性
      const issues = checkBoldBalance(field.content, field.startLine);
      fileIssues.push(...issues.map(i => ({ ...i, file: relPath, field: field.fieldName })));
    }
  }
  
  // --- 写入修复 ---
  if (fixed !== original) {
    writeFileSync(filePath, fixed, 'utf-8');
    totalFilesFixed++;
    allFixes.push(...fileFixes);
  }
  
  allIssues.push(...fileIssues);
  totalFilesScanned++;
}

function processDirectory(dir, label) {
  let files;
  try {
    files = readdirSync(dir).filter(f => f.endsWith('.ts'));
  } catch (e) {
    console.log(`⚠️  目录不存在：${dir}`);
    return;
  }
  
  process.stdout.write(`\n📂 处理 ${label} (${files.length} 个文件)...`);
  
  for (const file of files) {
    processFile(join(dir, file));
  }
  
  console.log(' ✓');
}

// ============================================================
// 主程序
// ============================================================

console.log('🔍 扫描并修复所有文章/博客的 Markdown 语法问题...');

processDirectory(ARTICLES_DIR, '知识库文章');
processDirectory(BLOGS_DIR, '技术博客');

// ============================================================
// 输出报告
// ============================================================

console.log('\n' + '='.repeat(60));
console.log('📊 报告');
console.log('='.repeat(60));
console.log(`✅ 扫描文件：${totalFilesScanned}`);
console.log(`🔧 已修复文件：${totalFilesFixed}`);

if (allFixes.length > 0) {
  console.log('\n✅ 已自动修复：');
  // 合并相同类型的修复
  const byFile = {};
  for (const fix of allFixes) {
    if (!byFile[fix.file]) byFile[fix.file] = [];
    byFile[fix.file].push(fix.description);
  }
  for (const [file, descs] of Object.entries(byFile)) {
    console.log(`  📄 ${file}`);
    descs.forEach(d => console.log(`     - ${d}`));
  }
}

const realIssues = allIssues.filter(i => i.field !== 'mermaid' || i.message.includes('\\'));

if (realIssues.length > 0) {
  console.log(`\n📋 剩余需确认的问题（${realIssues.length} 处）：\n`);
  
  // 按文件分组
  const byFile = {};
  for (const issue of realIssues) {
    if (!byFile[issue.file]) byFile[issue.file] = [];
    byFile[issue.file].push(issue);
  }
  
  let shown = 0;
  for (const [file, issues] of Object.entries(byFile)) {
    if (shown >= 100) {
      console.log(`\n... 还有 ${Object.keys(byFile).length - shown} 个文件有问题`);
      break;
    }
    console.log(`📄 ${file}:`);
    for (const issue of issues.slice(0, 3)) {
      console.log(`   行 ${issue.lineNum} [${issue.field}]: ${issue.message}`);
      if (issue.text) console.log(`   └─ "${issue.text}"`);
    }
    if (issues.length > 3) {
      console.log(`   ... 还有 ${issues.length - 3} 处`);
    }
    shown++;
  }
} else {
  console.log('\n🎉 未发现需要确认的问题！');
}

console.log('\n✅ 完成！\n');
