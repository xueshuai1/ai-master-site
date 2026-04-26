import { marked } from "marked";

marked.setOptions({ breaks: true, gfm: true });

// ── Syntax highlighting: tokenize once, highlight in single pass ──

type TokenType =
  | "comment" | "string" | "keyword" | "number"
  | "decorator" | "builtin" | "type" | "function" | "operator" | "plain";

interface Token {
  type: TokenType;
  text: string;
  start: number;
  end: number;
}

const PYTHON_KEYWORDS = new Set([
  "import","from","def","class","return","if","else","elif","for","while",
  "try","except","with","as","yield","lambda","pass","break","continue",
  "raise","in","not","and","or","is","True","False","None","self","super",
  "global","nonlocal","assert","del","finally","async","await","print",
]);

const PYTHON_TYPES = new Set([
  "int","str","float","bool","list","dict","tuple","set","bytes","object",
  "type","Optional","Any","Union","List","Dict","Callable","Iterable",
  "Iterator","Generator","Sequence","Mapping","MutableMapping","Tuple",
  "Set","FrozenSet","Deque","DefaultDict","OrderedDict","Counter",
  "NamedTuple","TypeVar","Generic","Protocol","runtime_checkable","Final",
  "ClassVar","Literal","TypedDict","Annotated","Self","Never","NoReturn",
]);

const PYTHON_BUILTINS = new Set([
  "torch","nn","math","os","sys","json","re","typing","collections",
  "functools","itertools","pathlib","datatrove","trl","transformers",
  "tiktoken","datasets",
]);

function tokenizePython(code: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;

  while (i < code.length) {
    if (code[i] === "#") {
      let end = code.indexOf("\n", i);
      if (end === -1) end = code.length;
      tokens.push({ type: "comment", text: code.slice(i, end), start: i, end });
      i = end;
      continue;
    }

    if ((code.slice(i, i + 3) === '"""' || code.slice(i, i + 3) === "'''")) {
      const q = code.slice(i, i + 3);
      let end = code.indexOf(q, i + 3);
      if (end === -1) end = code.length;
      else end += 3;
      tokens.push({ type: "string", text: code.slice(i, end), start: i, end });
      i = end;
      continue;
    }

    if (code[i] === '"' || (code[i] === "f" && code[i + 1] === '"')) {
      const isF = code[i] === "f";
      const start = isF ? i : i;
      const qi = isF ? i + 1 : i;
      let j = qi + 1;
      while (j < code.length && code[j] !== '"') {
        if (code[j] === "\\") j++;
        j++;
      }
      tokens.push({ type: "string", text: code.slice(start, j + 1), start, end: j + 1 });
      i = j + 1;
      continue;
    }

    if (code[i] === "'" || (code[i] === "f" && code[i + 1] === "'")) {
      const isF = code[i] === "f";
      const start = isF ? i : i;
      const qi = isF ? i + 1 : i;
      let j = qi + 1;
      while (j < code.length && code[j] !== "'") {
        if (code[j] === "\\") j++;
        j++;
      }
      tokens.push({ type: "string", text: code.slice(start, j + 1), start, end: j + 1 });
      i = j + 1;
      continue;
    }

    if (code[i] === "@") {
      let j = i + 1;
      while (j < code.length && /\w/.test(code[j])) j++;
      tokens.push({ type: "decorator", text: code.slice(i, j), start: i, end: j });
      i = j;
      continue;
    }

    if (/\d/.test(code[i])) {
      let j = i;
      while (j < code.length && /[\d.]/.test(code[j])) j++;
      tokens.push({ type: "number", text: code.slice(i, j), start: i, end: j });
      i = j;
      continue;
    }

    if (/[a-zA-Z_]/.test(code[i])) {
      let j = i;
      while (j < code.length && /[\w]/.test(code[j])) j++;
      const word = code.slice(i, j);

      let k = j;
      while (k < code.length && code[k] === " ") k++;
      if (code[k] === "(") {
        tokens.push({ type: "function", text: word, start: i, end: j });
        i = j;
        continue;
      }

      if (PYTHON_KEYWORDS.has(word)) {
        tokens.push({ type: "keyword", text: word, start: i, end: j });
      } else if (PYTHON_TYPES.has(word)) {
        tokens.push({ type: "type", text: word, start: i, end: j });
      } else if (PYTHON_BUILTINS.has(word)) {
        tokens.push({ type: "builtin", text: word, start: i, end: j });
      } else {
        tokens.push({ type: "plain", text: word, start: i, end: j });
      }
      i = j;
      continue;
    }

    tokens.push({ type: "plain", text: code[i], start: i, end: i + 1 });
    i++;
  }

  return tokens;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function highlightPython(code: string): string {
  const tokens = tokenizePython(code);
  const typeClass: Record<TokenType, string> = {
    comment: "token-comment", string: "token-string", keyword: "token-keyword",
    number: "token-number", decorator: "token-decorator", builtin: "token-builtin",
    type: "token-type", function: "token-function", operator: "token-operator", plain: "",
  };
  return tokens.map((t) => {
    const escaped = escapeHtml(t.text);
    const cls = typeClass[t.type];
    return cls ? `<span class="${cls}">${escaped}</span>` : escaped;
  }).join("");
}

function highlightBash(code: string): string {
  const escaped = escapeHtml(code);
  // Use 'Z' as delimiter — it IS a word character, so \b keyword boundaries
  // cannot form at the delimiter boundary. "ZPAR0Z" has no \b inside it.
  const params: string[] = [];
  const strings: string[] = [];
  let processed = escaped
    .replace(/("[^"]*"|'[^']*')/g, (_m, s) => {
      strings.push(s);
      return `ZSTR${strings.length - 1}Z`;
    })
    .replace(/(--?[a-zA-Z][a-zA-Z0-9-]*)/g, (_m, p) => {
      params.push(p);
      return `ZPAR${params.length - 1}Z`;
    });
  
  // Now \b keyword patterns CANNOT match inside ZPAR0Z etc (no word boundary at Z)
  processed = processed
    .replace(/#(.*)/gm, '<span class="token-comment">#$1</span>')
    .replace(/\b(pip|vllm|npm|npx|yarn|apt|brew|curl|wget|docker|git|python|node|cd|ls|mkdir|rm|cp|mv|cat|echo|export|source|sudo|chmod|chown)\b/g,
      '<span class="token-function">$1</span>');
  
  // Restore: replace ZPARnZ with styled parameter
  params.forEach((p, i) => {
    processed = processed.replace(`ZPAR${i}Z`, `<span class="token-parameter">${p}</span>`);
  });
  strings.forEach((s, i) => {
    processed = processed.replace(`ZSTR${i}Z`, `<span class="token-string">${s}</span>`);
  });
  
  return processed;
}

function highlightYaml(code: string): string {
  return escapeHtml(code)
    .replace(/(#.*)/g, '<span class="token-comment">$1</span>')
    .replace(/("[^"]*"|'[^']*')/g, '<span class="token-string">$1</span>')
    .replace(/\b(true|false|yes|no|null|none)\b/gi, '<span class="token-keyword">$1</span>')
    .replace(/(\d+\.?\d*)/g, '<span class="token-number">$1</span>');
}

function highlightCode(code: string, lang: string): string {
  switch (lang.toLowerCase()) {
    case "python":
    case "py":
      return highlightPython(code);
    case "bash":
    case "sh":
    case "shell":
      return highlightBash(code);
    case "yaml":
    case "yml":
      return highlightYaml(code);
    case "json":
      return escapeHtml(code)
        .replace(/("[^"]*")\s*:/g, '<span class="token-keyword">$1</span>:')
        .replace(/:\s*("[^"]*")/g, ': <span class="token-string">$1</span>')
        .replace(/\b(true|false|null)\b/g, '<span class="token-keyword">$1</span>')
        .replace(/(\d+\.?\d*)/g, '<span class="token-number">$1</span>');
    case "typescript":
    case "ts":
    case "javascript":
    case "js":
      return highlightPython(code); // Reuse Python tokenizer for JS/TS (similar syntax)
    case "dockerfile":
    case "docker":
      return escapeHtml(code)
        .replace(/(#.*)/g, '<span class="token-comment">$1</span>')
        .replace(/\b(FROM|WORKDIR|COPY|RUN|EXPOSE|CMD|ENTRYPOINT|ENV|ARG|ADD|USER|VOLUME|LABEL|MAINTAINER|HEALTHCHECK|ONBUILD|STOPSIGNAL|SHELL|AS)\b/g, '<span class="token-keyword">$1</span>')
        .replace(/("[^"]*"|'[^']*')/g, '<span class="token-string">$1</span>');
    default:
      return escapeHtml(code);
  }
}

// ── Parse markdown: extract code blocks, parse rest, reassemble ──

const CODE_PLACEHOLDER = "\x00CODEBLOCK\x00";
const MERMAID_PLACEHOLDER = "\x00MERMAIDBLOCK\x00";

export function parseMarkdown(text: string): string {
  // Step 1: Extract fenced code blocks and replace with placeholders
  const codeBlocks: { lang: string; code: string }[] = [];
  const processed = text.replace(/```(\w*)\n?([\s\S]*?)```/g, (_match, lang, code) => {
    const language = (lang || "").trim();
    const cleanCode = code.replace(/\n$/, "");
    codeBlocks.push({ lang: language, code: cleanCode });
    // Mermaid blocks → separate placeholder → rendered as charts client-side
    if (language === "mermaid") {
      return "\n" + MERMAID_PLACEHOLDER + "\n";
    }
    return "\n" + CODE_PLACEHOLDER + "\n";
  });

  // Step 2: Parse the remaining markdown
  const html = marked.parse(processed) as string;

  // Step 3: Replace code block placeholders with highlighted code blocks
  let result = html;
  let index = 0;
  const codePH = new RegExp(
    "<p>\\s*" + CODE_PLACEHOLDER.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "\\s*<\\/p>",
    "g"
  );
  result = result.replace(codePH, () => {
    const { lang, code } = codeBlocks[index++];
    const langLabel = lang || "code";
    const highlighted = highlightCode(code, lang);
    const svgCopy = '<svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"></path></svg>';
    return `<div class="space-y-4 my-6"><div class="rounded-xl overflow-hidden bg-slate-900/80 border border-white/10"><div class="flex items-center justify-between px-4 py-2 bg-white/5 text-sm text-slate-400"><span class="font-mono">${langLabel}</span><div class="flex items-center gap-2"><button onclick="navigator.clipboard.writeText(this.closest('.space-y-4').querySelector('code').textContent);this.innerHTML='${svgCopy}已复制';var b=this;setTimeout(()=>b.innerHTML='${svgCopy}复制',1500)" class="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium transition-all duration-200 text-slate-400 hover:text-white hover:bg-white/10" title="复制代码">${svgCopy}复制</button></div></div><pre class="p-4 overflow-x-auto overflow-y-auto max-h-[400px] text-sm"><code class="text-slate-300 font-mono whitespace-pre">${highlighted}</code></pre></div></div>`;
  });

  // Step 4: Replace mermaid placeholders with chart containers (rendered client-side)
  let mermaidIndex = 0;
  const mermaidPH = new RegExp(
    "<p>\\s*" + MERMAID_PLACEHOLDER.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "\\s*<\\/p>",
    "g"
  );
  result = result.replace(mermaidPH, () => {
    const { code: chart } = codeBlocks[index++];
    // Store raw chart in data attribute for client-side rendering
    const safeChart = chart.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    const containerId = `mdm-${mermaidIndex++}`;
    return `<div class="mermaid-container my-6 p-6 rounded-xl bg-white/5 border border-white/10" data-mermaid="${safeChart}" id="${containerId}"><div class="flex justify-center items-center min-h-[60px]"><div class="mermaid-chart"></div><span class="text-xs text-slate-500 ml-2">图表渲染中...</span></div></div>`;
  });

  return result;
}

/** React component for rendering markdown with styled code blocks */
export function MarkdownBody({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  const html = parseMarkdown(text);
  const cls = className || `prose prose-invert max-w-none prose-p:text-slate-300 prose-p:leading-relaxed prose-p:my-3 prose-strong:text-amber-400 prose-strong:font-bold prose-code:text-pink-300 prose-code:bg-white/5 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:before:content-none prose-code:after:content-none prose-a:text-brand-400 hover:prose-a:underline [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1.5 [&_ul]:text-slate-300 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:space-y-1.5 [&_ol]:text-slate-300 [&_li]:leading-relaxed`;
  return <div className={cls} dangerouslySetInnerHTML={{ __html: html }} />;
}
