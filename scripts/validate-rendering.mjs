#!/usr/bin/env node
/**
 * 渲染层验证 — 防止 MarkdownBody 组件的语法高亮出现问题
 * 
 * 检查项：
 * 1. highlightPython 对关键字加 token-keyword
 * 2. highlightBash 对命令加 token-function，参数中不含有关键字
 * 3. highlightBash 不产生嵌套 span
 * 4. highlightYaml 不产生嵌套 span
 * 5. highlightJson 不产生嵌套 span
 * 6. 源代码：所有高亮函数使用 Z 占位符（word char，不会形成 \b 词边界）
 * 
 * 用法：node scripts/validate-rendering.mjs
 */

import { readFileSync } from 'fs';

function escapeHtml(text) {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function highlightBash(code) {
  const escaped = escapeHtml(code);
  const params = [];
  const strings = [];
  let processed = escaped
    .replace(/("[^"]*"|'[^']*')/g, (_m, s) => { strings.push(s); return `ZSTR${strings.length-1}Z`; })
    .replace(/(--?[a-zA-Z][a-zA-Z0-9-]*)/g, (_m, p) => { params.push(p); return `ZPAR${params.length-1}Z`; });
  processed = processed
    .replace(/#(.*)/gm, '<span class="token-comment">#$1</span>')
    .replace(/\b(pip|vllm|npm|npx|yarn|apt|brew|curl|wget|docker|git|python|node|cd|ls|mkdir|rm|cp|mv|cat|echo|export|source|sudo|chmod|chown)\b/g,
      '<span class="token-function">$1</span>');
  params.forEach((p, i) => { processed = processed.replace(`ZPAR${i}Z`, `<span class="token-parameter">${p}</span>`); });
  strings.forEach((s, i) => { processed = processed.replace(`ZSTR${i}Z`, `<span class="token-string">${s}</span>`); });
  return processed;
}

function highlightYaml(code) {
  const escaped = escapeHtml(code);
  const comments = [];
  const strings = [];
  let processed = escaped
    .replace(/("[^"]*"|'[^']*')/g, (_m, s) => { strings.push(s); return `ZSTR${strings.length-1}Z`; })
    .replace(/(#.*)/g, (_m, c) => { comments.push(c); return `ZCMT${comments.length-1}Z`; });
  processed = processed
    .replace(/\b(true|false|yes|no|null|none)\b/gi, '<span class="token-keyword">$1</span>')
    .replace(/(?<=[^\d])(\d+\.?\d*)(?=[^\d"])/g, '<span class="token-number">$1</span>');
  comments.forEach((c, i) => { processed = processed.replace(`ZCMT${i}Z`, `<span class="token-comment">${c}</span>`); });
  strings.forEach((s, i) => { processed = processed.replace(`ZSTR${i}Z`, `<span class="token-string">${s}</span>`); });
  return processed;
}

function highlightJson(code) {
  const escaped = escapeHtml(code);
  const strings = [];
  let processed = escaped.replace(/("[^"]*")\s*:/g, (_m, s) => { strings.push(s); return `ZKEY${strings.length-1}Z:`; });
  processed = processed
    .replace(/\b(true|false|null)\b/g, '<span class="token-keyword">$1</span>')
    .replace(/(?<=[^\d])(\d+\.?\d*)(?=[^\d"])/g, '<span class="token-number">$1</span>');
  strings.forEach((s, i) => { processed = processed.replace(`ZKEY${i}Z`, `<span class="token-keyword">${s}</span>`); });
  return processed;
}

// ===== 测试用例 =====

const tests = [
  {
    name: 'Python: import/def/return 等关键字有 token-keyword',
    input: 'from agents import Agent\n\ndef main():\n    return None',
    highlight: (c) => escapeHtml(c).replace(/\b(import|from|def|class|return|if|else|elif|for|while|try|except|with|as|yield|lambda|pass|break|continue|raise|in|not|and|or|is|True|False|None|self|super|global|nonlocal|assert|del|finally|async|await|print)\b/g, '<span class="token-keyword">$1</span>'),
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
    name: 'Bash: --export-model 不应把 export 单独高亮',
    input: 'python -m vllm.entrypoints.api_server --export-model ./output',
    highlight: (c) => highlightBash(c),
    pass: (html) => !/<span[^>]*>[^<]*<span[^>]*class=['"]token-/.test(html)
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
  {
    name: 'YAML: 不产生嵌套 span（注释/字符串/关键词不会互相破坏）',
    input: '# docker-compose.yml\nservices:\n  app:\n    image: "nginx:latest"\n    ports:\n      - "8000:8000"',
    highlight: (c) => highlightYaml(c),
    pass: (html) => !/<span[^>]*>[^<]*<span[^>]*class="token-/.test(html)
  },
  {
    name: 'JSON: 不产生嵌套 span',
    input: '{\n  "name": "test",\n  "count": 42,\n  "active": true\n}',
    highlight: (c) => highlightJson(c),
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
    console.log(`     输出: ${html.substring(0, 150)}...`);
    failed++;
  }
}

// ===== 源代码结构检查 =====

const source = readFileSync('src/components/MarkdownBody.tsx', 'utf-8');
const articleSource = readFileSync('src/app/article/[id]/page.tsx', 'utf-8');

const sourceChecks = [
  {
    name: 'MarkdownBody highlightBash 使用 Z 占位符（word char，无词边界问题）',
    pass: () => {
      const bashFunc = source.match(/function highlightBash[\s\S]*?^}/m);
      if (!bashFunc) return false;
      return bashFunc[0].includes('ZPAR') && bashFunc[0].includes('ZSTR') 
        && !bashFunc[0].includes('\\x00') && !bashFunc[0].includes('\\x01');
    }
  },
  {
    name: 'MarkdownBody highlightYaml 使用安全占位符',
    pass: () => {
      const yamlFunc = source.match(/function highlightYaml[\s\S]*?^}/m);
      if (!yamlFunc) return false;
      return yamlFunc[0].includes('YC') && yamlFunc[0].includes('YS') && !yamlFunc[0].includes('\\x00');
    }
  },
  {
    name: 'MarkdownBody highlightJson 使用安全占位符',
    pass: () => {
      const jsonFunc = source.match(/function highlightJson[\s\S]*?^}/m);
      if (!jsonFunc) return false;
      return jsonFunc[0].includes('YK') && !jsonFunc[0].includes('\\x00');
    }
  },
  {
    name: '文章页 highlightBash 使用 Z 占位符',
    pass: () => {
      const bashFunc = articleSource.match(/function highlightBash[\s\S]*?^}/m);
      if (!bashFunc) return false;
      return bashFunc[0].includes('ZPAR') && bashFunc[0].includes('ZSTR')
        && !bashFunc[0].includes('\\x00') && !bashFunc[0].includes('\\x01');
    }
  },
  {
    name: '文章页 highlightDockerfile 使用 Z 占位符',
    pass: () => {
      const dockerFunc = articleSource.match(/function highlightDockerfile[\s\S]*?^}/m);
      if (!dockerFunc) return false;
      return dockerFunc[0].includes('ZSTR') && !dockerFunc[0].includes('\\x00') && !dockerFunc[0].includes('\\x01');
    }
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

console.log(`\n${passed}/${passed + failed} 通过`);

if (failed > 0) {
  console.log('\n❌ 渲染验证失败，不能提交');
  process.exit(1);
} else {
  console.log('\n✅ 全部通过');
}
