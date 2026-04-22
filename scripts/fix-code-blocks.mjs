#!/usr/bin/env node
// 批量改造：将 body 中的 \`\`\` 代码块提取到独立的 code 字段
import { readFileSync, writeFileSync } from 'fs';
import { join, basename } from 'path';

const PROJECT_ROOT = new URL('..', import.meta.url).pathname;
const FILES = process.argv.slice(2);

// 代码块标记
const ESCAPED_BACKTICK3 = '\\`\\`\\`';
const BACKTICK3 = '```';

function fixFile(filePath) {
  let raw = readFileSync(filePath, 'utf-8');
  let fixed = 0;

  // 找所有 title: 位置，然后找其后的 body:
  const titleRegex = /title:\s*["']([^"']+)["']/g;
  let titleMatch;
  const sections = [];

  while ((titleMatch = titleRegex.exec(raw)) !== null) {
    const title = titleMatch[1];
    const titlePos = titleMatch.index;

    const afterTitle = raw.substring(titlePos);
    const bodyMatch = afterTitle.match(/body:\s*(`|"|')/);
    if (!bodyMatch) continue;

    const quoteChar = bodyMatch[1];
    const bodyStartOffset = titlePos + bodyMatch.index + bodyMatch[0].length;

    // 找 body 结束位置（不被转义的引号）
    let bodyEndPos = -1;
    let i = bodyStartOffset;
    while (i < raw.length) {
      if (raw[i] === quoteChar) {
        let backslashCount = 0;
        let j = i - 1;
        while (j >= bodyStartOffset && raw[j] === '\\') {
          backslashCount++;
          j--;
        }
        if (backslashCount % 2 === 0) {
          bodyEndPos = i;
          break;
        }
      }
      i++;
    }
    if (bodyEndPos === -1) continue;

    const bodyContent = raw.substring(bodyStartOffset, bodyEndPos);
    const hasEscaped = bodyContent.includes(ESCAPED_BACKTICK3);
    const hasRaw = bodyContent.includes(BACKTICK3);

    if (!hasEscaped && !hasRaw) continue;

    // 提取代码块对
    const codeBlocks = [];
    // 用 split 方式提取代码块
    let remaining = bodyContent;
    const markers = [ESCAPED_BACKTICK3, BACKTICK3];

    while (true) {
      // 找下一个代码块开始
      let earliestIdx = -1;
      let earliestMarker = '';
      for (const m of markers) {
        const idx = remaining.indexOf(m);
        if (idx !== -1 && (earliestIdx === -1 || idx < earliestIdx)) {
          earliestIdx = idx;
          earliestMarker = m;
        }
      }
      if (earliestIdx === -1) break;

      // 提取语言
      let after = remaining.substring(earliestIdx + earliestMarker.length);
      // 语言在第一行末尾之前
      const newlineIdx = after.indexOf('\n');
      const lang = newlineIdx !== -1
        ? (after.substring(0, newlineIdx).trim() || 'text')
        : 'text';

      if (newlineIdx === -1) break;
      after = after.substring(newlineIdx + 1);

      // 找结束标记
      let endIdx = -1;
      for (const m of markers) {
        const idx = after.indexOf(m);
        if (idx !== -1 && (endIdx === -1 || idx < endIdx)) {
          endIdx = idx;
        }
      }
      if (endIdx === -1) break;

      const code = after.substring(0, endIdx).trim();
      codeBlocks.push({ lang, code });

      remaining = after.substring(endIdx + earliestMarker.length);
    }

    if (codeBlocks.length === 0) continue;

    sections.push({
      titlePos,
      bodyStartOffset,
      bodyEndPos,
      codeBlocks,
    });
  }

  if (sections.length === 0) return { raw, fixed: 0 };

  // 从后往前替换（避免位置偏移）
  let newRaw = raw;
  for (let idx = sections.length - 1; idx >= 0; idx--) {
    const sec = sections[idx];

    // 重建 body 内容（删除代码块）
    let bodyContent = newRaw.substring(sec.bodyStartOffset, sec.bodyEndPos);

    // 删除代码块：用 split-join 方式
    const markers = [ESCAPED_BACKTICK3, BACKTICK3];
    // 循环删除所有代码块对
    while (true) {
      let earliestIdx = -1;
      let earliestMarker = '';
      for (const m of markers) {
        const mi = bodyContent.indexOf(m);
        if (mi !== -1 && (earliestIdx === -1 || mi < earliestIdx)) {
          earliestIdx = mi;
          earliestMarker = m;
        }
      }
      if (earliestIdx === -1) break;

      // 找结束标记
      let endIdx = -1;
      for (const m of markers) {
        const mi = bodyContent.indexOf(m, earliestIdx + earliestMarker.length);
        if (mi !== -1 && (endIdx === -1 || mi < endIdx)) {
          endIdx = mi;
        }
      }
      if (endIdx === -1) break;

      // 删除代码块及其前后的多余换行
      let before = bodyContent.substring(0, earliestIdx);
      before = before.replace(/(\n\s*)+$/, '\n');
      const after = bodyContent.substring(endIdx + earliestMarker.length);
      bodyContent = before + after;
    }

    bodyContent = bodyContent.trimEnd();

    // 构建 code 字段
    const codeFieldLines = [];
    codeFieldLines.push('code: [');
    for (const cb of sec.codeBlocks) {
      const escapedCode = cb.code.replace(/`/g, '\\`');
      codeFieldLines.push('      {');
      codeFieldLines.push(`        lang: "${cb.lang}",`);
      codeFieldLines.push(`        code: \`${escapedCode}\`,`);
      codeFieldLines.push('      },');
    }
    codeFieldLines.push('    ]');
    const codeField = codeFieldLines.join('\n');

    // 替换
    const isTemplateString = newRaw[sec.bodyStartOffset - 1] === '`';
    let newBodySection;
    if (isTemplateString) {
      newBodySection = bodyContent + '`,\n    ' + codeField;
    } else {
      const escaped = bodyContent
        .replace(/\\/g, '\\\\')
        .replace(/"/g, '\\"')
        .replace(/\n/g, '\\n');
      newBodySection = '"' + escaped + '",\n    ' + codeField;
    }

    newRaw = newRaw.substring(0, sec.bodyStartOffset) + newBodySection + newRaw.substring(sec.bodyEndPos + 1);
    fixed++;
  }

  return { raw: newRaw, fixed };
}

let totalFixed = 0;

for (const file of FILES) {
  const filePath = join(PROJECT_ROOT, file);
  try {
    const result = fixFile(filePath);
    if (result.fixed > 0) {
      writeFileSync(filePath, result.raw, 'utf-8');
      console.log(`✅ ${basename(file)}: 修复了 ${result.fixed} 个 section`);
      totalFixed += result.fixed;
    } else {
      console.log(`⏭️ ${basename(file)}: 无需修复`);
    }
  } catch (e) {
    console.error(`❌ ${basename(file)}: ${e.message}`);
  }
}

console.log(`\n📊 总计: 修复了 ${totalFixed} 个 section`);
