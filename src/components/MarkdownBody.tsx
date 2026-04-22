import { marked } from "marked";

marked.setOptions({ breaks: true, gfm: true });

// ── Syntax highlighting ───────────────────────────────────────

function highlightPython(code: string): string {
  return code
    .replace(/(#.*)/g, '<span class="token-comment">$1</span>')
    .replace(/("""[\s\S]*?"""|'''[\s\S]*?''')/g, '<span class="token-string">$1</span>')
    .replace(/(f?"[^"]*"|f?'[^']*'|"[^"]*"|'[^']*')/g, '<span class="token-string">$1</span>')
    .replace(/\b(import|from|def|class|return|if|else|elif|for|while|try|except|with|as|yield|lambda|pass|break|continue|raise|in|not|and|or|is|True|False|None|self|super|global|nonlocal|assert|del|finally|async|await|print)\b/g,
      '<span class="token-keyword">$1</span>')
    .replace(/\b(\d+\.?\d*)\b/g, '<span class="token-number">$1</span>')
    .replace(/@(\w+)/g, '<span class="token-decorator">@$1</span>')
    .replace(/\b(torch|nn|math|os|sys|json|re|typing|collections|functools|itertools|pathlib|datatrove|trl|transformers|tiktoken|datasets)\b/g,
      '<span class="token-builtin">$1</span>')
    .replace(/(\w+)(\s*\()/g, '<span class="token-function">$1</span>$2');
}

function highlightBash(code: string): string {
  return code
    .replace(/(#.*)/g, '<span class="token-comment">$1</span>')
    .replace(/(f?"[^"]*"|f?'[^']*'|"[^"]*"|'[^']*')/g, '<span class="token-string">$1</span>')
    .replace(/\b(pip|vllm|npm|npx|yarn|apt|brew|curl|wget|docker|git|python|node|cd|ls|mkdir|rm|cp|mv|cat|echo|export|source|sudo|chmod|chown)\b/g,
      '<span class="token-function">$1</span>')
    .replace(/(--?\w[\w-]*)/g, '<span class="token-parameter">$1</span>');
}

function highlightCode(code: string, lang: string): string {
  let escaped = code
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  switch (lang.toLowerCase()) {
    case "python":
    case "py":
      return escaped
        .replace(/(#.*)/g, '<span class="token-comment">$1</span>')
        .replace(/(&quot;&quot;&quot;[\s\S]*?&quot;&quot;&quot;|&#39;&#39;&#39;[\s\S]*?&#39;&#39;&#39;)/g, '<span class="token-string">$1</span>')
        .replace(/(f?&quot;[^&]*?&quot;|f?&#39;[^&]*?&#39;|&quot;[^&]*?&quot;|&#39;[^&]*?&#39;)/g, '<span class="token-string">$1</span>')
        .replace(/\b(import|from|def|class|return|if|else|elif|for|while|try|except|with|as|yield|lambda|pass|break|continue|raise|in|not|and|or|is|True|False|None|self|super|global|nonlocal|assert|del|finally|async|await|print)\b/g,
          '<span class="token-keyword">$1</span>')
        .replace(/\b(\d+\.?\d*)\b/g, '<span class="token-number">$1</span>')
        .replace(/@(\w+)/g, '<span class="token-decorator">@$1</span>')
        .replace(/\b(torch|nn|math|os|sys|json|re|typing|collections|functools|itertools|pathlib|datatrove|trl|transformers|tiktoken|datasets)\b/g,
          '<span class="token-builtin">$1</span>')
        .replace(/(\w+)(\s*\()/g, '<span class="token-function">$1</span>$2');
    case "bash":
    case "sh":
    case "shell":
      return escaped
        .replace(/(#.*)/g, '<span class="token-comment">$1</span>')
        .replace(/\b(pip|vllm|npm|npx|yarn|apt|brew|curl|wget|docker|git|python|node|cd|ls|mkdir|rm|cp|mv|cat|echo|export|source|sudo|chmod|chown)\b/g,
          '<span class="token-function">$1</span>')
        .replace(/(--?\w[\w-]*)/g, '<span class="token-parameter">$1</span>');
    default:
      return escaped;
  }
}

function renderCodeBlock(code: string, lang: string): string {
  const highlighted = highlightCode(code, lang);
  const langLabel = lang ? (lang.charAt(0).toUpperCase() + lang.slice(1)) : "Code";
  return `<pre class="code-block"><div class="code-header"><span class="lang-label font-mono text-xs">${langLabel}</span><button onclick="navigator.clipboard.writeText(this.closest('pre').querySelector('code').textContent);this.textContent='✅ 已复制';var b=this;setTimeout(()=>b.textContent='📋 复制',1500)" class="copy-btn text-xs text-slate-400 hover:text-white transition-colors cursor-pointer">📋 复制</button></div><code>${highlighted}</code></pre>`;
}

function createMarkdownRenderer() {
  const renderer = new marked.Renderer();
  renderer.code = function(token) {
    const lang = (token as any).lang || "";
    const text = (token as any).text || "";
    return renderCodeBlock(text, lang);
  };
  return renderer;
}

/** Parse markdown to HTML with syntax-highlighted code blocks */
export function parseMarkdown(text: string): string {
  const renderer = createMarkdownRenderer();
  return marked.parse(text, { renderer }) as string;
}

/** React component for rendering markdown with styled code blocks (client-side only) */
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
