import { marked } from "marked";
import { highlightCode } from "@/lib/highlight";

marked.setOptions({ breaks: true, gfm: true });

// ── Global copy button handler (event delegation) ──
if (typeof document !== "undefined") {
  document.addEventListener("click", (e) => {
    const btn = (e.target as HTMLElement).closest(".copy-btn");
    if (!btn) return;
    const codeBlock = btn.closest(".space-y-4")?.querySelector("code");
    if (!codeBlock) return;
    
    const text = codeBlock.textContent || "";
    navigator.clipboard.writeText(text).then(() => {
      const original = btn.innerHTML;
      btn.innerHTML = "✅ 已复制";
      setTimeout(() => { btn.innerHTML = original; }, 1500);
    }).catch(() => {
      btn.innerHTML = "❌ 失败";
      setTimeout(() => { btn.innerHTML = "📋 复制"; }, 1500);
    });
  });
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
    // Use data attribute + global event listener instead of inline onclick
    // to avoid HTML attribute boundary issues with SVG in onclick
    return `<div class="space-y-4 my-6"><div class="rounded-xl overflow-hidden bg-slate-900/80 border border-white/10"><div class="flex items-center justify-between px-4 py-2 bg-white/5 text-sm text-slate-400"><span class="font-mono">${langLabel}</span><div class="flex items-center gap-2"><button class="copy-btn inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium transition-all duration-200 text-slate-400 hover:text-white hover:bg-white/10" title="复制代码">📋 复制</button></div></div><pre class="p-4 overflow-x-auto overflow-y-auto max-h-[400px] text-sm"><code class="text-slate-300 font-mono whitespace-pre">${highlighted}</code></pre></div></div>`;
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

  // Step 5: Wrap <table> in scrollable container
  // Use table-layout:auto so columns auto-size, but cap table width at 100%
  // Cells get min-width:0 + word-break so long content wraps instead of overflowing
  result = result.replace(/<table>/g,
    '<div class="overflow-x-auto my-4"><table class="w-full" style="table-layout:auto;border-collapse:collapse">'
  ).replace(/<\/table>/g, '</table></div>');

  result = result.replace(/<th/g, '<th style="min-width:0;word-break:break-word;overflow-wrap:break-word;padding:0.5rem 0.75rem"')
    .replace(/<td/g, '<td style="min-width:0;word-break:break-word;overflow-wrap:break-word;padding:0.5rem 0.75rem"');

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
