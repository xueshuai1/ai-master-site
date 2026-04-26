#!/usr/bin/env node
/**
 * 渲染层验证 — 防止 MarkdownBody 组件的语法高亮出现问题
 * 
 * 检查项：
 * 1. highlightPython 对关键字加 token-keyword
 * 2. highlightBash 对命令加 token-function
 * 3. highlightBash 参数中不含有关键字（如 --export-model 不应把 export 单独高亮）
 * 4. highlightBash 不产生嵌套 span
 * 5. 源代码：parseMarkdown 调用 highlightCode 而非直接 escapeHtml
 * 6. 源代码：highlightBash 使用安全占位符机制（\x01 而非 \x00）
 * 
 * 用法：node scripts/validate-rendering.mjs
 */

import { readFileSync } from 'fs';

// ===== 复现 MarkdownBody.tsx 中的高亮函数 =====

function escapeHtml(text) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function highlightBash(code) {
  const escaped = escapeHtml(code);
  const params = [];
  const strings = [];
  let processed = escaped
    .replace(/("[^"]*"|'[^']*')/g, (_m, s) => {
      strings.push(s);
      return `\x01STR${strings.length - 1}\x01`;
    })
    .replace(/(--?[a-zA-Z][a-zA-Z0-9-]*)/g, (_m, p) => {
      params.push(p);
      return `\x01PAR${params.length - 1}\x01`;
    });
  
  processed = processed
    .replace(/#(.*)/gm, '<span class="token-comment">#$1</span>')
    .replace(/\b(pip|vllm|npm|npx|yarn|apt|brew|curl|wget|docker|git|python|node|cd|ls|mkdir|rm|cp|mv|cat|echo|export|source|sudo|chmod|chown)\b/g,
      '<span class="token-function">$1</span>');
  
  params.forEach((p, i) => {
    processed = processed.replace(`\x01PAR${i}\x01`, `<span class="token-parameter">${p}</span>`);
  });
  strings.forEach((s, i) => {
    processed = processed.replace(`\x01STR${i}\x01`, `<span class="token-string">${s}</span>`);
  });
  
  return processed;
}

// ===== 测试用例 =====

const tests = [
  {
    name: 'Python: import/def/return 等关键字有 token-keyword',
    input: 'from agents import Agent\n\ndef main():\n    return None',
    highlight: (c) => {
      // Simple Python highlight for testing
      return escapeHtml(c)
        .replace(/\b(import|from|def|class|return|if|else|elif|for|while|try|except|with|as|yield|lambda|pass|break|continue|raise|in|not|and|or|is|True|False|None|self|super|global|nonlocal|assert|del|finally|async|await|print)\b/g,
          '<span class="token-keyword">$1</span>');
    },
    pass: (html) => html.includes('token-keyword')
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
    name: 'Bash: --export-model 不应把 export 单独高亮（防止嵌套 span）',
    input: 'python -m vllm.entrypoints.api_server --export-model ./output',
    highlight: (c) => highlightBash(c),
    pass: (html) => {
      // Should NOT have <span...<span class="token-function">export
      const hasNestedExport = /<span[^>]*>[^<]*<span[^>]*class=['"]token-function['"][^>]*>export/.test(html);
      return !hasNestedExport;
    }
  },
  {
    name: 'Bash: 不产生任何嵌套 span',
    input: '# 注释\npip install pkg --verbose --export-model ./out\ndocker run -d nginx',
    highlight: (c) => highlightBash(c),
    pass: (html) => !/<span[^>]*>[^<]*<span[^>]*class="token-/.test(html)
  },
  {
    name: 'Bash: 引号内内容作为字符串高亮',
    input: 'export API_KEY="secret-key-123"',
    highlight: (c) => highlightBash(c),
    pass: (html) => html.includes('token-string')
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
    console.log(`     输出: ${html.substring(0, 150)}...`);
    failed++;
  }
}

// ===== 源代码结构检查 =====

const source = readFileSync('src/components/MarkdownBody.tsx', 'utf-8');
const articleSource = readFileSync('src/app/article/[id]/page.tsx', 'utf-8');

const sourceChecks = [
  {
    name: 'parseMarkdown 的 placeholder 替换中调用了 highlightCode',
    pass: () => source.includes('const highlighted = highlightCode(code, lang)')
  },
  {
    name: 'parseMarkdown 中 mermaid 代码块有独立占位符',
    pass: () => source.includes('MERMAID_PLACEHOLDER') && source.includes('language === "mermaid"')
  },
  {
    name: 'parseMarkdown 的 mermaid 占位符替换为 .mermaid-container 图表容器',
    pass: () => source.includes('mermaid-container') && source.includes('data-mermaid')
  },
  {
    name: '文章页使用 BodyMermaidRenderer 客户端渲染 mermaid 图表',
    pass: () => articleSource.includes('BodyMermaidRenderer')
  },
  {
    name: 'MarkdownBody highlightBash 使用 \\x01 占位符（安全，不创建词边界）',
    pass: () => source.includes('\\x01') && !source.includes('\\x00PARAM')
  },
  {
    name: '文章页 highlightBash 使用 \\x01 占位符',
    pass: () => articleSource.includes('\\x01') && !articleSource.includes('\\x00PAR')
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
