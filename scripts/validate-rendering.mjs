// 文章渲染质量检查 — 捕获常见渲染问题（2026-04-28 新增）
import fs from 'fs';

const articleFile = process.argv[2];
if (!articleFile) {
  console.error('用法: node scripts/validate-rendering.mjs <article-file>');
  process.exit(1);
}

const content = fs.readFileSync(articleFile, 'utf8');
let errors = [];
let warnings = [];

// === 1. 检查 body 中是否有 ``` 代码块 ===
// The file uses \`\`\`python for code blocks inside body template literals
const codeBlockPattern = /\\`\\`\\`(python|javascript|typescript|bash|json|yaml|css|html|sql)/g;
const codeBlockMatches = content.match(codeBlockPattern) || [];
if (codeBlockMatches.length > 0) {
  errors.push(`body 中包含 ${codeBlockMatches.length} 个 \`\`\` 代码块 — 应该提取到 code: [] 数组中`);
}

// === 2. 检查 Mermaid style fill 语法 ===
const styleFillMatches = content.match(/style\s+\w+\s+fill:/g) || [];
if (styleFillMatches.length > 0) {
  errors.push(`Mermaid 使用了 ${styleFillMatches.length} 处 'style X fill:' 语法（会导致空白块/黑块），必须改用 classDef + class 语法`);
}

// === 3. 检查 Mermaid classDef 是否同时有 fill + stroke + color ===
const classDefMatches = content.match(/classDef\s+\w+\s+([^;]+);/g) || [];
classDefMatches.forEach(match => {
  const props = match;
  if (!props.includes('fill:')) warnings.push(`classDef 缺少 fill 属性`);
  if (!props.includes('stroke:')) warnings.push(`classDef 缺少 stroke 属性`);
  if (!props.includes('color:')) warnings.push(`classDef 缺少 color 属性（文字可能不可见）`);
});

// === 4. 检查 code 块是否都有 title ===
// Look for code: [...] arrays
const codeArrayPattern = /code:\s*\[[\s\S]*?\]/g;
const codeArrays = content.match(codeArrayPattern) || [];
codeArrays.forEach(match => {
  const blocks = match.match(/lang:/g) || [];
  const titles = match.match(/title:/g) || [];
  if (blocks.length > titles.length) {
    errors.push(`code 数组中有 ${blocks.length} 个代码块，但只有 ${titles.length} 个 title（每个都必须有 title）`);
  }
});

// === 5. 检查禁止的浅色配色 ===
const forbiddenColors = ['#ef4444','#f59e0b','#10b981','#6366f1','#8b5cf6','#ec4899','#f3e5f5','#e1f5fe','#c8e6c9','#fff3e0'];
forbiddenColors.forEach(color => {
  if (content.includes(color)) {
    errors.push(`使用了禁止的浅色 ${color}（会导致文字不可见）`);
  }
});

// === 6. 检查空 body 段落 ===
const emptyBody = content.match(/body:\s*`\s*`/g) || [];
if (emptyBody.length > 0) {
  errors.push(`发现 ${emptyBody.length} 个空 body 段落（会导致页面空白块）`);
}

// === 输出 ===
console.log('\n===== 渲染质量检查 =====');
console.log(`文件: ${articleFile}\n`);

if (errors.length === 0 && warnings.length === 0) {
  console.log('✅ 全部通过，没有发现渲染问题');
  process.exit(0);
}

if (errors.length > 0) {
  console.log(`❌ ${errors.length} 个错误:`);
  errors.forEach((e, i) => console.log(`  ${i+1}. ${e}`));
  console.log('');
}

if (warnings.length > 0) {
  console.log(`⚠️ ${warnings.length} 个警告:`);
  warnings.forEach((w, i) => console.log(`  ${i+1}. ${w}`));
  console.log('');
}

process.exit(errors.length > 0 ? 1 : 0);
