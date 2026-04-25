#!/usr/bin/env node
/**
 * 渲染层验证 — 防止 MarkdownBody 组件的语法高亮出现问题
 * 
 * 检查项：
 * 1. highlightPython 对关键字加 token-keyword
 * 2. highlightBash 对命令加 token-function
 * 3. highlightBash 不产生嵌套 span（参数匹配不会匹配到 class 名）
 * 4. 源代码：parseMarkdown 调用 highlightCode 而非直接 escapeHtml
 * 5. 源代码：highlightBash 使用占位符机制
 * 
 * 用法：node scripts/validate-rendering.mjs
 */

import { readFileSync } from 'fs';

// ===== 复现 MarkdownBody.tsx 中的高亮函数 =====
// 这段代码是从 MarkdownBody.tsx 复制的，确保逻辑一致

function escapeHtml(text) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

const PYTHON_KEYWORDS = new Set([
  "import","from","def","class","return","if","else","elif","for","while",
  "try","except","with","as","yield","lambda","pass","break","continue",
  "raise","in","not","and","or","is","True","False","None","self","super",
  "global","nonlocal","assert","del","finally","async","await","print",
]);

function highlightPython(code) {
  return escapeHtml(code)
    .replace(/(#.*)/g, '<span class="token-comment">$1</span>')
    .replace(/("""[\s\S]*?"""|'''[\s\S]*?''')/g, '<span class="token-string">$1</span>')
    .replace(/\b(import|from|def|class|return|if|else|elif|for|while|try|except|with|as|yield|lambda|pass|break|continue|raise|in|not|and|or|is|True|False|None|self|super|global|nonlocal|assert|del|finally|async|await|print)\b/g,
      '<span class="token-keyword">$1</span>');
}

function highlightBash(code) {
  return escapeHtml(code)
    .replace(/(--?\w[\w-]*)/g, '\x00PARAM:$1\x00')
    .replace(/\b(pip|vllm|npm|npx|yarn|apt|brew|curl|wget|docker|git|python|node|cd|ls|mkdir|rm|cp|mv|cat|echo|export|source|sudo|chmod|chown)\b/g,
      '<span class="token-function">$1</span>')
    .replace(/(#.*)/g, '<span class="token-comment">$1</span>')
    .replace(/\x00PARAM:(.*?)\x00/g, '<span class="token-parameter">$1</span>');
}

// ===== 测试用例 =====

const tests = [
  {
    name: 'Python: import/def/return 等关键字有 token-keyword',
    input: 'from agents import Agent\n\ndef main():\n    return None',
    highlight: (c) => highlightPython(c),
    pass: (html) => html.includes('token-keyword')
  },
  {
    name: 'Python: 注释有 token-comment',
    input: '# 这是注释\ndef main(): pass',
    highlight: (c) => highlightPython(c),
    pass: (html) => html.includes('token-comment')
  },
  {
    name: 'Bash: pip/export 等命令有 token-function',
    input: 'pip install openai-agents\nexport OPENAI_API_KEY="key"',
    highlight: (c) => highlightBash(c),
    pass: (html) => html.includes('token-function')
  },
  {
    name: 'Bash: --verbose 参数有 token-parameter',
    input: 'pip install package --verbose',
    highlight: (c) => highlightBash(c),
    pass: (html) => html.includes('token-parameter')
  },
  {
    name: 'Bash: 不产生嵌套 span（占位符机制防止参数匹配 class 名）',
    input: 'pip install package --verbose\nexport KEY="value"',
    highlight: (c) => highlightBash(c),
    pass: (html) => !/<span[^>]*>[^<]*<span[^>]*class="token-/.test(html)
  },
];

console.log('🔍 渲染层验证...\n');

let passed = 0;
let failed = 0;

for (const test of tests) {
  const html = test.highlight(test.input);
  if (test.pass(html)) {
    console.log(`  ✅ ${test.name}`);
    passed++;
  } else {
    console.log(`  ❌ ${test.name}`);
    console.log(`     输出: ${html.substring(0, 120)}...`);
    failed++;
  }
}

// ===== 源代码结构检查 =====

const source = readFileSync('src/components/MarkdownBody.tsx', 'utf-8');

const sourceChecks = [
  {
    name: 'parseMarkdown 的 placeholder 替换中调用了 highlightCode',
    pass: () => source.includes('const highlighted = highlightCode(code, lang)')
  },
  {
    name: 'parseMarkdown 的 placeholder 替换返回的是 highlighted 变量',
    pass: () => {
      // 找到 placeholderRe 替换块，检查里面用了 highlighted 而不是 escaped
      const lines = source.split('\n');
      let inPlaceholderReplace = false;
      for (const line of lines) {
        if (line.includes('placeholderRe')) inPlaceholderReplace = true;
        if (inPlaceholderReplace && line.includes('highlighted}')) return true;
        if (inPlaceholderReplace && line.includes('return result')) break;
      }
      return false;
    }
  },
  {
    name: 'highlightBash 使用 \\x00PARAM 占位符避免嵌套',
    pass: () => source.includes('PARAM:$1')
  },
];

console.log('\n源代码检查：');
for (const check of sourceChecks) {
  if (check.pass()) {
    console.log(`  ✅ ${check.name}`);
    passed++;
  } else {
    console.log(`  ❌ ${check.name}`);
    failed++;
  }
}

// ===== 报告 =====

console.log(`\n${passed}/${passed + failed} 通过`);

if (failed > 0) {
  console.log('\n❌ 渲染验证失败，不能提交');
  process.exit(1);
} else {
  console.log('\n✅ 全部通过');
}
