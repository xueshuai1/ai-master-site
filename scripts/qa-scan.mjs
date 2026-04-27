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

function checkRegex(file, ruleName, regex, message) {
  const content = readFileSync(join(ROOT, file), 'utf8');
  const matches = content.match(regex);
  if (matches && matches.length > 0) {
    results.fail.push(`❌ ${file}: ${ruleName} — 发现 ${matches.length} 处: ${message}`);
  } else {
    results.pass.push(`✅ ${file}: ${ruleName}`);
  }
}

function checkRequired(file, content) {
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
  checkRegex(file, '代码块格式', /```/, 'body 中发现 ``` 代码块');
  checkRegex(file, 'Mermaid 配色', /#ef4444|#f59e0b|#10b981|#6366f1|#8b5cf6|#ec4899|#06b6d4|#84cc16/, '发现浅色 Mermaid 配色');
  checkRegex(file, 'HTML 标签', /<br[^>]*>|<\/br>|<p[^>]*>|<\/p>|<div[^>]*>|<\/div>/, '发现未转义 HTML 标签');
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
  checkRegex(file, '代码块格式', /```/, 'body 中发现 ``` 代码块');
  checkRegex(file, 'Mermaid 配色', /#ef4444|#f59e0b|#10b981|#6366f1|#8b5cf6|#ec4899|#06b6d4|#84cc16/, '发现浅色 Mermaid 配色');
  checkRegex(file, 'HTML 标签', /<br[^>]*>|<\/br>|<p[^>]*>|<\/p>|<div[^>]*>|<\/div>/, '发现未转义 HTML 标签');
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
