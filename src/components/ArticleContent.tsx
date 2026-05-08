"use client";

import { useEffect, useRef } from "react";
import { ArticleSection } from "@/data/knowledge";
import { MarkdownBody } from "@/components/MarkdownBody";

const codeBlockStyle = `
  div.code-block {
    border-radius: 12px;
    overflow: hidden;
    margin: 16px 0;
    background: rgba(15, 23, 42, 0.8);
    border: 1px solid rgba(255,255,255,0.1);
  }
  div.code-block .code-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px 16px;
    background: rgba(255,255,255,0.05);
    font-size: 14px;
    color: #94a3b8;
  }
  div.code-block pre {
    background: transparent;
    padding: 16px;
    margin: 0;
    overflow-x: auto;
    overflow-y: auto;
    max-height: 400px;
  }
  div.code-block pre code {
    font-family: 'SF Mono', 'Fira Code', 'Cascadia Code', monospace;
    font-size: 13px;
    line-height: 1.6;
    color: #cdd6f4;
    tab-size: 4;
    white-space: pre;
  }
  /* Catppuccin Mocha inspired syntax highlighting */
  .token-keyword { color: #cba6f7; }
  .token-string { color: #a6e3a1; }
  .token-comment { color: #6c7086; font-style: italic; }
  .token-number { color: #fab387; }
  .token-function { color: #89b4fa; }
  .token-class { color: #f9e2af; }
  .token-operator { color: #89dceb; }
  .token-decorator { color: #f5c2e7; }
  .token-builtin { color: #f38ba8; }
  .token-parameter { color: #eba0ac; }
  .token-type { color: #89dceb; }
  .token-property { color: #89b4fa; }
  .token-boolean { color: #fab387; }
  .token-null { color: #fab387; }
  .token-import { color: #cba6f7; }
  .token-from { color: #cba6f7; }
`;

function highlightPython(code: string): string {
  return code
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/(#.*)/g, '<span class="token-comment">$1</span>')
    .replace(/("""[\s\S]*?"""|'''[\s\S]*?''')/g, '<span class="token-string">$1</span>')
    .replace(/(f?"[^"]*"|f?'[^']*'|"[^"]*"|'[^']*')/g, '<span class="token-string">$1</span>')
    .replace(/\b(import|from|def|class|return|if|else|elif|for|while|try|except|with|as|yield|lambda|pass|break|continue|raise|in|not|and|or|is|True|False|None|self|super|global|nonlocal|assert|del|finally|async|await|print)\b/g,
      '<span class="token-keyword">$1</span>')
    .replace(/\b(\d+\.?\d*)\b/g, '<span class="token-number">$1</span>')
    .replace(/@(\w+)/g, '<span class="token-decorator">@$1</span>')
    .replace(/\b(int|str|float|bool|list|dict|tuple|set|bytes|object|type|Optional|Any|Union|List|Dict|Callable|Iterable|Iterator|Generator|Sequence|Mapping|MutableMapping|Tuple|Set|FrozenSet|Deque|DefaultDict|OrderedDict|Counter|NamedTuple|TypeVar|Generic|Protocol|runtime_checkable|Final|ClassVar|Literal|TypedDict|Annotated|Self|Never|NoReturn|Never)\b/g,
      '<span class="token-type">$1</span>')
    .replace(/\b(torch|nn|math|os|sys|json|re|typing|collections|functools|itertools|pathlib|datatrove|trl|transformers|tiktoken|datasets)\b/g,
      '<span class="token-builtin">$1</span>')
    .replace(/(\w+)(\s*\()/g, '<span class="token-function">$1</span>$2');
}

function highlightBash(code: string): string {
  return code
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/(#.*)/g, '<span class="token-comment">$1</span>')
    .replace(/(f?"[^"]*"|f?'[^']*'|"[^"]*"|'[^']*')/g, '<span class="token-string">$1</span>')
    .replace(/\b(pip|vllm|npm|npx|yarn|apt|brew|curl|wget|docker|git|python|node|cd|ls|mkdir|rm|cp|mv|cat|echo|export|source|sudo|chmod|chown)\b/g,
      '<span class="token-function">$1</span>')
    .replace(/(--?\w[\w-]*)/g, '<span class="token-parameter">$1</span>')
    .replace(/(\\)$/gm, '<span class="token-operator">$1</span>');
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
    default:
      return code.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }
}

function CodeBlock({ lang, code, title }: { lang: string; code: string; title?: string }) {
  const highlighted = highlightCode(code, lang);
  const langLabel = lang.charAt(0).toUpperCase() + lang.slice(1);

  return (
    <div className="code-block">
      <div className="code-header">
        <span className="font-mono text-xs">{langLabel}{title ? ` · ${title}` : ''}</span>
        <button
          onClick={() => navigator.clipboard.writeText(code)}
          className="text-xs text-slate-400 hover:text-white transition-colors"
        >
          📋 复制
        </button>
      </div>
      <pre><code dangerouslySetInnerHTML={{ __html: highlighted }} /></pre>
    </div>
  );
}

function ContentTable({ table }: { table: { headers: string[]; rows: string[][] } }) {
  return (
    <div className="overflow-x-auto my-6 rounded-xl border border-white/10">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-white/5">
            {table.headers.map((h, i) => (
              <th
                key={i}
                className="px-4 py-3 text-left font-semibold text-brand-300 border-b border-white/10 whitespace-nowrap"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {table.rows.map((row, ri) => (
            <tr
              key={ri}
              className={`${
                ri % 2 === 0 ? "bg-transparent" : "bg-white/[0.02]"
              } hover:bg-white/5 transition-colors`}
            >
              {row.map((cell, ci) => (
                <td
                  key={ci}
                  className="px-4 py-3 text-slate-300 border-b border-white/5 prose prose-invert prose-sm max-w-none
                    prose-strong:text-amber-400 prose-strong:font-bold
                    prose-code:text-pink-300 prose-code:bg-white/5 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:before:content-none prose-code:after:content-none
                    [&_p]:my-0 [&_p]:inline"
                >
                  <MarkdownBody text={cell} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function TipBox({ text, type }: { text: string; type: "tip" | "warning" }) {
  const isTip = type === "tip";
  return (
    <div
      className={`flex items-start gap-3 p-4 rounded-xl my-6 border ${
        isTip
          ? "bg-emerald-500/5 border-emerald-500/20"
          : "bg-amber-500/5 border-amber-500/20"
      }`}
    >
      <div className="text-sm text-slate-300 leading-relaxed prose prose-invert max-w-none
        prose-strong:text-amber-400 prose-strong:font-bold
        prose-code:text-pink-300 prose-code:bg-white/5 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:before:content-none prose-code:after:content-none
        [&_p]:my-0">
        <MarkdownBody text={text} />
      </div>
    </div>
  );
}

function MermaidDiagram({ chart }: { chart: string }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let mounted = true;
    const render = async () => {
      if (!containerRef.current) return;
      try {
        const { default: mermaid } = await import("mermaid");
        if (!mounted) return;
        mermaid.initialize({
          startOnLoad: false,
          theme: "dark",
          securityLevel: "loose",
          fontFamily: "system-ui, sans-serif",
          suppressErrorRendering: true,
          themeVariables: {
            fontSize: '16px',
            primaryTextColor: '#f1f5f9',
            secondaryTextColor: '#f1f5f9',
            tertiaryTextColor: '#f1f5f9',
            primaryColor: '#1e3a5f',
            primaryBorderColor: '#60a5fa',
            mainBkg: '#1e3a5f',
            secondBkg: '#1e3a5f',
            nodeBkg: '#1e3a5f',
            nodeBorder: '#60a5fa',
            lineColor: '#60a5fa',
            secondaryColor: '#1e3a5f',
            secondaryBorderColor: '#60a5fa',
            tertiaryColor: '#1e3a5f',
            tertiaryBorderColor: '#60a5fa',
            clusterBkg: '#0f172a',
            clusterBorder: '#475569',
            titleColor: '#f8fafc',
            edgeLabelBackground: '#1e293b',
            actorBorder: '#60a5fa',
            background: '#0f172a',
            textColor: '#f1f5f9',
          },
        });
        const id = `mermaid-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
        const { svg } = await mermaid.render(id, chart);
        if (containerRef.current && mounted) {
          containerRef.current.innerHTML = svg;
        }
      } catch {
        // Silently fail — suppressErrorRendering prevents bomb icon
        if (containerRef.current && mounted) {
          containerRef.current.innerHTML = '';
        }
      }
    };
    render();
    return () => {
      mounted = false;
    };
  }, [chart]);

  return (
    <div
      ref={containerRef}
      className="my-6 p-4 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center overflow-x-auto"
    />
  );
}

export default function ArticleContent({
  sections,
}: {
  sections: ArticleSection[];
}) {
  return (
    <>
      <style jsx global>
        {codeBlockStyle}
      </style>
      {sections.map((section, i) => (
        <div key={i} className="mb-10">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
            <span className="w-8 h-8 rounded-lg bg-brand-500/10 text-brand-400 flex items-center justify-center text-sm font-bold">
              {i + 1}
            </span>
            {section.title}
          </h2>

          {section.body && <MarkdownBody text={section.body} />}

          {section.list && (
            <ul className="space-y-2 my-4">
              {section.list.map((item, j) => (
                <li
                  key={j}
                  className="flex items-start gap-2 text-slate-300 leading-relaxed"
                >
                  <span className="text-brand-400 mt-1.5 shrink-0">•</span>
                  <MarkdownBody text={item} />
                </li>
              ))}
            </ul>
          )}

          {section.code &&
            section.code.map((block, j) => (
              <CodeBlock key={j} lang={block.lang} code={block.code} title={block.title} />
            ))}

          {section.table && <ContentTable table={section.table} />}

          {section.mermaid && <MermaidDiagram chart={section.mermaid} />}

          {section.tip && <TipBox text={section.tip} type="tip" />}
          {section.warning && <TipBox text={section.warning} type="warning" />}
        </div>
      ))}
    </>
  );
}
