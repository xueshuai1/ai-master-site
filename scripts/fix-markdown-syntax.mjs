#!/usr/bin/env node
/**
 * Markdown / Mermaid 语法检查与修复工具
 *
 * 用法：
 *   node scripts/fix-markdown-syntax.mjs            # 扫描并自动修复
 *   node scripts/fix-markdown-syntax.mjs --check    # 只报告，不修改文件（CI 模式）
 *   node scripts/fix-markdown-syntax.mjs --verbose  # 打印每个问题的详情
 *   node scripts/fix-markdown-syntax.mjs --json     # 以 JSON 格式输出结果
 *
 * 检查项：
 *   [A] MERMAID_BACKSLASH  — mermaid 中 \<换行> 行继续符，导致节点文字错误拼接（自动修复）
 *   [B] MERMAID_CONTRAST   — mermaid style/classDef 颜色对比度 < 4.5:1 WCAG AA（自动修复）
 *   [C] BOLD_IMBALANCE     — body/tip/warning 中段落内 ** 数量为奇数，可能存在未闭合加粗（仅报告）
 *
 * 退出码：
 *   0  无问题（或已全部修复）
 *   1  --check 模式下发现问题；或修复后仍有 [C] 类待人工确认问题
 */

import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join, relative } from 'path';

// ── 配置 ─────────────────────────────────────────────────────
const ARTICLES_DIR = './src/data/articles';
const BLOGS_DIR    = './src/data/blogs';
const CWD          = process.cwd();

// 对比度阈值（WCAG AA）
const MIN_CONTRAST  = 4.5;
const DEFAULT_TEXT  = '#e2e8f0';   // 深色主题默认文字色

// 颜色自动修复映射（低对比度 → 更深替代色）
const COLOR_FIX_MAP = {
  '#0e7490': '#155e75',  // cyan-700  (4.35) → cyan-900  (5.89)
  '#b45309': '#92400e',  // amber-700 (4.07) → amber-800 (5.75)
  '#15803d': '#14532d',  // green-700 (4.07) → green-900 (7.39)
  '#8b6a1a': '#713f12',  // custom    (4.08) → amber-900 (7.03)
  '#c2410c': '#9a3412',  // orange-700(4.20) → orange-800(5.93)
  '#2563eb': '#1d4ed8',  // blue-600  (4.19) → blue-700  (5.44)
  '#1a56db': '#1d4ed8',  // blue alt  → blue-700
  '#3b82f6': '#1d4ed8',  // blue-500  (3.03) → blue-700
  '#10b981': '#047857',  // emerald-500→ emerald-700
  '#6366f1': '#4338ca',  // indigo-500→ indigo-700
  '#8b5cf6': '#6d28d9',  // violet-500→ violet-700
  '#ec4899': '#be185d',  // pink-500  → pink-700
  '#f59e0b': '#b45309',  // amber-500 (1.97 vs light)→ amber-700 (but use white text)
  '#22c55e': '#15803d',  // green-500 → green-700
  '#06b6d4': '#0e7490',  // cyan-500  → cyan-700 (but that one also fails; chain to 155e75)
};

// ── CLI 参数 ─────────────────────────────────────────────────
const args    = new Set(process.argv.slice(2));
const CHECK   = args.has('--check') || args.has('--check-only');
const VERBOSE = args.has('--verbose') || args.has('-v');
const JSON_OUT = args.has('--json');

// ── 状态 ─────────────────────────────────────────────────────
const report = {
  scanned: 0,
  fixed: 0,
  fixes: [],          // {file, type, detail}
  issues: [],         // {file, line, field, type, message, text}
};

// ═══════════════════════════════════════════════════════════════
// 工具函数
// ═══════════════════════════════════════════════════════════════

function relPath(p) { return relative(CWD, p); }

// ── 对比度计算 ────────────────────────────────────────────────
function luminance(r, g, b) {
  return [r, g, b].reduce((acc, c, i) => {
    const v = c / 255;
    const s = v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    return acc + s * [0.2126, 0.7152, 0.0722][i];
  }, 0);
}

function parseHex(hex) {
  hex = hex.replace('#', '');
  if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
  const n = parseInt(hex, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function contrast(c1, c2) {
  const l1 = luminance(...parseHex(c1));
  const l2 = luminance(...parseHex(c2));
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
}

// ── 模板字符串提取 ────────────────────────────────────────────
/**
 * 从 TypeScript 文件中提取 body/tip/warning/mermaid 字段的模板字符串
 * 返回 [{fieldName, content, startLine, endLine}]
 */
function extractFields(fileContent) {
  const results = [];
  const lines   = fileContent.split('\n');
  let i = 0;

  while (i < lines.length) {
    const m = lines[i].match(/^\s*(body|tip|warning|mermaid):\s*`(.*)/);
    if (!m) { i++; continue; }

    const [, fieldName, rest] = m;
    const startLine = i + 1;

    // 单行模板字符串
    if (/`,?\s*$|`;\s*$/.test(rest)) {
      results.push({ fieldName, content: rest.replace(/`,?\s*$|`;\s*$/, ''), startLine, endLine: startLine });
      i++;
      continue;
    }

    // 多行模板字符串
    const buf = [rest];
    i++;
    while (i < lines.length) {
      const tl = lines[i];
      if (tl.trimEnd().endsWith('`,') || tl.trimEnd().endsWith('`;') || /`\s*$/.test(tl)) {
        buf.push(tl.replace(/`,?\s*$|`;\s*$/, ''));
        results.push({ fieldName, content: buf.join('\n'), startLine, endLine: i + 1 });
        break;
      }
      buf.push(tl);
      i++;
    }
    i++;
  }
  return results;
}

// ── Markdown 工具 ─────────────────────────────────────────────
function stripCodeBlocks(text)  { return text.replace(/```[\s\S]*?```/g, '\n\n'); }
function stripInlineCode(text)  { return text.replace(/`[^`\n]+`/g, '``'); }

// ═══════════════════════════════════════════════════════════════
// 检查函数
// ═══════════════════════════════════════════════════════════════

// ── [A] Mermaid 反斜杠换行 ────────────────────────────────────
function detectMermaidBackslash(content, startLine) {
  return content.split('\n')
    .map((ln, i) => /\\\s*$/.test(ln) ? {
      lineNum: startLine + i,
      message: 'mermaid 节点标签中使用了 \\ 换行（应改为 \\n）',
      text: ln.trim().slice(0, 100)
    } : null)
    .filter(Boolean);
}

// ── [B] Mermaid 颜色对比度 ────────────────────────────────────
/**
 * 同时检查 style 行和 classDef 行
 * classDef 如有显式 color: 则用该颜色，否则用默认文字色
 */
function detectContrastIssues(fileContent) {
  const issues = [];
  const lines  = fileContent.split('\n');

  for (let i = 0; i < lines.length; i++) {
    const ln = lines[i].trim();

    // style nodeId fill:#xxx[,color:#yyy]
    if (ln.startsWith('style ')) {
      const fillM = ln.match(/fill:(#[0-9a-fA-F]{3,6})/i);
      if (!fillM) continue;
      const fill  = fillM[1].toLowerCase();
      const colM  = ln.match(/(?<![a-z])color:(#[0-9a-fA-F]{3,6})/i);
      const text  = colM ? colM[1].toLowerCase() : DEFAULT_TEXT;
      const ratio = contrast(fill, text);
      if (ratio < MIN_CONTRAST) {
        issues.push({ line: i + 1, fill, text, ratio, kind: 'style' });
      }
    }

    // classDef name fill:#xxx[,color:#yyy]
    if (ln.startsWith('classDef ')) {
      const fillM = ln.match(/fill:(#[0-9a-fA-F]{3,6})/i);
      if (!fillM) continue;
      const fill  = fillM[1].toLowerCase();
      const colM  = ln.match(/(?<![a-z])color:(#[0-9a-fA-F]{3,6})/i);
      const text  = colM ? colM[1].toLowerCase() : DEFAULT_TEXT;
      const ratio = contrast(fill, text);
      if (ratio < MIN_CONTRAST) {
        issues.push({ line: i + 1, fill, text, ratio, kind: 'classDef' });
      }
    }
  }
  return issues;
}

// ── [C] 加粗标签平衡性 ───────────────────────────────────────
function detectBoldImbalance(content, startLine) {
  const issues  = [];
  const noCode  = stripCodeBlocks(content);
  const paras   = noCode.split(/\n\n+/);
  let offset    = 0;

  for (const para of paras) {
    if (para.trim()) {
      const clean = stripInlineCode(para);
      const cnt   = (clean.match(/\*\*/g) || []).length;
      if (cnt % 2 !== 0) {
        const firstLine = para.split('\n').find(l => l.trim()) || '';
        issues.push({
          lineNum: startLine + offset,
          message: `段落内加粗标签不平衡（共 ${cnt} 个 **）`,
          text: firstLine.trim().slice(0, 120)
        });
      }
    }
    offset += para.split('\n').length + 1;
  }
  return issues;
}

// ═══════════════════════════════════════════════════════════════
// 修复函数
// ═══════════════════════════════════════════════════════════════

// ── [A] 修复 mermaid 反斜杠换行 ──────────────────────────────
function fixMermaidBackslash(content) {
  if (!content.includes('\\\n')) return { content, count: 0 };
  let count = 0;
  const fixed = content.replace(
    /(mermaid:\s*`)([\s\S]*?)(`,?|`\s*$)/gm,
    (match, pre, body, suf) => {
      if (!body.includes('\\\n')) return match;
      const c = (body.match(/\\\n/g) || []).length;
      count += c;
      return pre + body.replace(/\\\n\s*/g, '\\n') + suf;
    }
  );
  return { content: fixed, count };
}

// ── [B] 修复 mermaid 颜色对比度 ──────────────────────────────
function fixContrastColors(content) {
  let count = 0;
  const fixed = content.replace(
    /^(\s*(?:style|classDef)\s+\S+.*?fill:)(#[0-9a-fA-F]{3,6})(.*)/gim,
    (match, pre, color, rest) => {
      const fill = color.toLowerCase();
      // 提取当前行的 text color（显式或默认）
      const colM = rest.match(/(?<![a-z])color:(#[0-9a-fA-F]{3,6})/i);
      const text = colM ? colM[1].toLowerCase() : DEFAULT_TEXT;
      // 只有对比度真正不足时才替换
      if (contrast(fill, text) < MIN_CONTRAST && COLOR_FIX_MAP[fill]) {
        count++;
        return pre + COLOR_FIX_MAP[fill] + rest;
      }
      return match;
    }
  );
  return { content: fixed, count };
}

// ═══════════════════════════════════════════════════════════════
// 文件处理
// ═══════════════════════════════════════════════════════════════

function processFile(filePath) {
  const original = readFileSync(filePath, 'utf-8');
  const rel      = relPath(filePath);
  let   content  = original;
  const fileFixes = [];

  // ── 修复阶段（非 --check 模式） ──────────────────────────
  if (!CHECK) {
    // [A] Mermaid 反斜杠
    const { content: c1, count: n1 } = fixMermaidBackslash(content);
    if (n1 > 0) {
      content = c1;
      fileFixes.push({ file: rel, type: 'A', detail: `Mermaid 反斜杠换行 → \\n（${n1} 处）` });
    }

    // [B] 颜色对比度
    const { content: c2, count: n2 } = fixContrastColors(content);
    if (n2 > 0) {
      content = c2;
      fileFixes.push({ file: rel, type: 'B', detail: `Mermaid 颜色对比度修复（${n2} 处）` });
    }

    if (content !== original) {
      writeFileSync(filePath, content, 'utf-8');
      report.fixed++;
      report.fixes.push(...fileFixes);
    }
  }

  // ── 检查阶段（检查修复后的内容） ──────────────────────────
  const fields = extractFields(content);

  for (const { fieldName, content: fc, startLine } of fields) {
    if (fieldName === 'mermaid') {
      for (const iss of detectMermaidBackslash(fc, startLine)) {
        report.issues.push({ file: rel, ...iss, field: 'mermaid', type: 'A' });
      }
    } else {
      for (const iss of detectBoldImbalance(fc, startLine)) {
        report.issues.push({ file: rel, ...iss, field: fieldName, type: 'C' });
      }
    }
  }

  // [B] 颜色对比度（针对整个文件内容）
  for (const iss of detectContrastIssues(content)) {
    report.issues.push({
      file: rel, lineNum: iss.line, field: iss.kind, type: 'B',
      message: `颜色对比度不足 ${iss.ratio.toFixed(2)}:1（fill:${iss.fill}, text:${iss.text}）`,
      text: ''
    });
  }

  report.scanned++;
}

function processDirectory(dir) {
  let files;
  try { files = readdirSync(dir).filter(f => f.endsWith('.ts')); }
  catch { return; }
  files.forEach(f => processFile(join(dir, f)));
}

// ═══════════════════════════════════════════════════════════════
// 主程序
// ═══════════════════════════════════════════════════════════════

processDirectory(ARTICLES_DIR);
processDirectory(BLOGS_DIR);

// ── JSON 输出 ─────────────────────────────────────────────────
if (JSON_OUT) {
  console.log(JSON.stringify(report, null, 2));
  process.exit(report.issues.length > 0 ? 1 : 0);
}

// ── 人类可读输出 ──────────────────────────────────────────────
const mode = CHECK ? ' [检查模式，不修改文件]' : '';
console.log(`\n🔍 Markdown / Mermaid 语法检查${mode}`);
console.log('─'.repeat(56));
console.log(`   扫描文件：${report.scanned}`);

if (!CHECK && report.fixed > 0) {
  console.log(`   已修复  ：${report.fixed} 个文件`);
  if (VERBOSE || report.fixed <= 20) {
    // 按类型分组输出修复详情
    const byType = { A: [], B: [] };
    for (const f of report.fixes) byType[f.type]?.push(f);

    if (byType.A.length) {
      console.log(`\n  ✅ [A] Mermaid 反斜杠换行修复（${byType.A.length} 个文件）：`);
      byType.A.forEach(f => console.log(`     • ${f.file}`));
    }
    if (byType.B.length) {
      console.log(`\n  ✅ [B] Mermaid 颜色对比度修复（${byType.B.length} 个文件）：`);
      byType.B.forEach(f => console.log(`     • ${f.file}  — ${f.detail}`));
    }
  }
}

// 剩余问题
const issuesByType = { A: [], B: [], C: [] };
for (const i of report.issues) issuesByType[i.type]?.push(i);

const totalIssues = report.issues.length;

if (totalIssues === 0) {
  console.log('\n🎉 一切正常，未发现问题！\n');
  process.exit(0);
}

console.log(`\n⚠️  发现 ${totalIssues} 处问题：`);

// [A] Mermaid 反斜杠（修复后应为 0）
if (issuesByType.A.length) {
  console.log(`\n  ❌ [A] Mermaid 反斜杠换行（${issuesByType.A.length} 处）：`);
  issuesByType.A.slice(0, 10).forEach(i =>
    console.log(`     ${i.file}:${i.lineNum}  ${i.text}`)
  );
}

// [B] 颜色对比度（修复后应为 0）
if (issuesByType.B.length) {
  console.log(`\n  ❌ [B] Mermaid 颜色对比度（${issuesByType.B.length} 处）：`);
  issuesByType.B.slice(0, 10).forEach(i =>
    console.log(`     ${i.file}:${i.lineNum}  ${i.message}`)
  );
  if (issuesByType.B.length > 10)
    console.log(`     ... 还有 ${issuesByType.B.length - 10} 处`);
}

// [C] 加粗不平衡（需人工确认）
if (issuesByType.C.length) {
  console.log(`\n  ⚠️  [C] 加粗标签不平衡（${issuesByType.C.length} 处，需人工确认）：`);
  const shown = VERBOSE ? issuesByType.C : issuesByType.C.slice(0, 10);
  shown.forEach(i => {
    console.log(`     ${i.file}:${i.lineNum} [${i.field}]  ${i.message}`);
    if (i.text) console.log(`       └─ "${i.text}"`);
  });
  if (!VERBOSE && issuesByType.C.length > 10)
    console.log(`     ... 还有 ${issuesByType.C.length - 10} 处（加 --verbose 查看全部）`);
}

// 退出码
const hasBlocker = issuesByType.A.length + issuesByType.B.length > 0;
const hasWarning = issuesByType.C.length > 0;

console.log('');
if (hasBlocker) {
  console.log('❌ 存在需修复的问题，请运行不带 --check 的命令自动修复。\n');
  process.exit(1);
} else if (hasWarning && CHECK) {
  console.log('⚠️  存在加粗标签不平衡警告，建议人工确认。\n');
  process.exit(1);
} else {
  console.log('✅ 可自动修复的问题已处理完毕。\n');
  process.exit(0);
}
