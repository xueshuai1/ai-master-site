// scripts/qa-scan.mjs — ai-master.cc 内容质量全面扫描
// 每次 cron 执行直接运行此脚本，无需重新创建
// 用法：node scripts/qa-scan.mjs

import { readFileSync, readdirSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const results = { pass: [], fail: [], warn: [] };

/** 移除代码块、mermaid、表格和 <pre>，避免 HTML 检查误报 */
function stripCodeBlocks(content) {
  return content
    .replace(/```[\s\S]*?```/g, '')   // 标准 ``` 代码块
    .replace(/mermaid:\s*`[\s\S]*?`/g, '') // mermaid 模板字面量（内含 <br/> 等）
    .replace(/code:\s*`[\s\S]*?`/g, '')   // code 模板字面量（内含 React JSX 等）
    .replace(/<pre>[\s\S]*?<\/pre>/g, '') // <pre> ASCII 图表（合理用法）
    .replace(/table:\s*\{[\s\S]*?\},?\s*\n\s*\}/g, '') // table 块（单元格中可能有 <br>）
}

/** 检查 Mermaid classDef 对比度（2026-04-29 增强 — blog-085 事故） */
function checkClassDefContrast(content, file) {
  const lines = content.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line.startsWith('classDef ')) continue;
    const fillMatch = line.match(/fill:([#][0-9a-fA-F]+)/i);
    if (!fillMatch) continue;
    const fillColor = fillMatch[1].toLowerCase();
    // 检查是否使用了浅色（亮度 > 0.5 的颜色）
    const hex = fillColor.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16) / 255;
    const g = parseInt(hex.substring(2, 4), 16) / 255;
    const b = parseInt(hex.substring(4, 6), 16) / 255;
    const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    if (luminance > 0.4) {
      results.fail.push(`❌ ${file}: Mermaid classDef 对比度不足 — fill:${fillColor} 过浅（亮度 ${(luminance * 100).toFixed(0)}%），文字不可读。应使用 800-900 色阶深色`);
    }
  }
}

/** 检查 Mermaid 连线语法（2026-04-29 增强 — blog-084 事故） */
function checkMermaidArrows(content, file) {
  const mermaidBlocks = content.matchAll(/mermaid:\s*`([\s\S]*?)`/g);
  for (const block of mermaidBlocks) {
    const lines = block[1].split('\n');
    for (let i = 0; i < lines.length; i++) {
      if (/\. -\s+>/.test(lines[i])) {
        results.fail.push(`❌ ${file}: Mermaid 连线语法错误 L${i + 1} — 发现「.- >」（带空格），应为「->」，会导致渲染为空白块`);
      }
    }
  }
}

/** 检查 Mermaid 中的 % 注释符（2026-04-29 增强 — blog-084 控制台报错事故） */
function checkMermaidPercent(content, file) {
  const mermaidBlocks = content.matchAll(/mermaid:\s*`([\s\S]*?)`/g);
  for (const block of mermaidBlocks) {
    const lines = block[1].split('\n');
    for (let i = 0; i < lines.length; i++) {
      if (/(?<!\\)%/.test(lines[i])) {
        results.fail.push(`❌ ${file}: Mermaid 中包含 % 字符 L${i + 1} — mermaid 中 % 是注释标记，会导致解析错误。请改用全角 ％`);
      }
    }
  }
}

/** 检查文章是否包含至少 2 个 Mermaid 图表（2026-04-29 用户指示） */
function checkMermaidCount(content, file) {
  const mermaidMatches = content.match(/mermaid:\s*`/g);
  const count = mermaidMatches ? mermaidMatches.length : 0;
  if (count < 2) {
    results.fail.push(`❌ ${file}: Mermaid 图表数量不足 — 只有 ${count} 个，至少需要 2 个。文章可以没有代码块，但不能没有文本绘图。`);
  } else {
    results.pass.push(`✅ ${file}: Mermaid 图表数量 ${count} 个（≥ 2）`);
  }
}

function checkRegex(file, ruleName, regex, message, stripCode = false) {
  let content = readFileSync(join(ROOT, file), 'utf8');
  if (stripCode) content = stripCodeBlocks(content);
  const matches = content.match(regex);
  if (matches && matches.length > 0) {
    results.fail.push(`❌ ${file}: ${ruleName} — 发现 ${matches.length} 处: ${message}`);
  } else {
    results.pass.push(`✅ ${file}: ${ruleName}`);
  }
}

function checkRequired(file, content) {
  // 跳过类型定义文件（如 blog-types.ts）
  if (file.endsWith('-types.ts')) {
    results.pass.push(`✅ ${file}: 必填字段完整（类型定义文件，跳过）`);
    return;
  }
  const hasTitle = /title:\s*['"`]/.test(content);
  const hasBody = /body:\s*['"`]/.test(content);
  const hasSummary = /summary:\s*['"`]/.test(content);
  if (!hasTitle || !hasBody || !hasSummary) {
    results.fail.push(`❌ ${file}: 必填字段缺失 — title:${hasTitle}, body:${hasBody}, summary:${hasSummary}`);
  } else {
    results.pass.push(`✅ ${file}: 必填字段完整`);
  }
  if (/,\s*,/.test(content)) {
    results.fail.push(`❌ ${file}: 发现孤立逗号`);
  }
}

// ===== 知识库文章全量扫描 =====
const articlesDir = join(ROOT, 'src/data/articles');
const articleFiles = readdirSync(articlesDir, { withFileTypes: true })
  .filter(d => d.isFile() && d.name.endsWith('.ts'))
  .map(d => 'src/data/articles/' + d.name);

console.log('=== 知识库文章 QA 扫描 ===');
console.log(`共 ${articleFiles.length} 篇文章\n`);

for (const file of articleFiles) {
  const content = readFileSync(join(ROOT, file), 'utf8');
  checkMermaidCount(content, file);
  checkRegex(file, '代码块格式', /```/, 'body 中发现 ``` 代码块');
  checkRegex(file, 'Mermaid 浅色', /#ef4444|#f59e0b|#10b981|#6366f1|#8b5cf6|#ec4899|#06b6d4|#84cc16/, '发现浅色 Mermaid 配色');
  checkClassDefContrast(content, file);
  checkMermaidArrows(content, file);
  checkMermaidPercent(content, file);
  checkRegex(file, 'HTML 标签', /<br[^>]*>|<\/br>|<p[^>]*>|<\/p>|<div[^>]*>|<\/div>/, '发现未转义 HTML 标签', true);
  checkRequired(file, content);
}

// ===== 博客文章全量扫描 =====
console.log('\n=== 博客文章 QA 扫描 ===');
const blogsDir = join(ROOT, 'src/data/blogs');
const blogFiles = readdirSync(blogsDir, { withFileTypes: true })
  .filter(d => d.isFile() && d.name.endsWith('.ts'))
  .map(d => 'src/data/blogs/' + d.name);

console.log(`共 ${blogFiles.length} 篇博客\n`);

for (const file of blogFiles) {
  const content = readFileSync(join(ROOT, file), 'utf8');
  checkMermaidCount(content, file);
  checkRegex(file, '代码块格式', /```/, 'body 中发现 ``` 代码块');
  checkRegex(file, 'Mermaid 浅色', /#ef4444|#f59e0b|#10b981|#6366f1|#8b5cf6|#ec4899|#06b6d4|#84cc16/, '发现浅色 Mermaid 配色');
  checkClassDefContrast(content, file);
  checkMermaidArrows(content, file);
  checkMermaidPercent(content, file);
  checkRegex(file, 'HTML 标签', /<br[^>]*>|<\/br>|<p[^>]*>|<\/p>|<div[^>]*>|<\/div>/, '发现未转义 HTML 标签', true);
  checkRequired(file, content);
}

// ===== 新闻扫描 =====
console.log('\n=== 新闻 QA 扫描 ===');
const newsContent = readFileSync(join(ROOT, 'src/data/news.ts'), 'utf8');

const hrefMatches = newsContent.match(/href:\s*['"]([^'"]+)['"]/g) || [];
const invalidHref = hrefMatches.filter(h => h.includes('ai-master.cc') || h.includes('本站'));
if (invalidHref.length > 0) results.fail.push(`❌ news.ts: ${invalidHref.length} 条站内自宣 href`);
else results.pass.push('✅ news.ts: href 均为外部链接');

const sourceMatches = newsContent.match(/source:\s*['"]([^'"]+)['"]/g) || [];
const invalidSource = sourceMatches.filter(s => s.includes('AI Master') || s.includes('本站'));
if (invalidSource.length > 0) results.fail.push(`❌ news.ts: ${invalidSource.length} 条站内 source`);
else results.pass.push('✅ news.ts: source 均为外部来源');

// ===== 工具检查 =====
console.log('\n=== 工具数据 QA 扫描 ===');
const toolsContent = readFileSync(join(ROOT, 'src/data/tools.ts'), 'utf8');

try {
  const out = execSync('node scripts/validate-tools.mjs', { cwd: ROOT, encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] });
  results.pass.push(`✅ tools.ts: validate-tools.mjs 通过`);
} catch (e) {
  results.fail.push(`❌ tools.ts: validate-tools.mjs 失败 — ${e.stdout || e.message}`);
}

const nameMatches = toolsContent.match(/name:\s*['"]([^'"]+)['"]/g) || [];
const parenNames = nameMatches.filter(n => /[（）()]/.test(n));
if (parenNames.length > 0) results.fail.push(`❌ tools.ts: ${parenNames.length} 个工具名含括号`);
else results.pass.push('✅ tools.ts: 工具名无括号');

// ===== 输出结果 =====
console.log(`\n========== QA 扫描: 通过${results.pass.length} / 失败${results.fail.length} / 警告${results.warn.length} ==========`);
if (results.fail.length) console.log('\n❌ 失败项:\n' + results.fail.join('\n'));
if (results.warn.length) console.log('\n⚠️ 警告项:\n' + results.warn.join('\n'));

writeFileSync(join(ROOT, 'reports/qa-scan-result.json'), JSON.stringify(results, null, 2));
console.log('\n结果已保存到 reports/qa-scan-result.json');
