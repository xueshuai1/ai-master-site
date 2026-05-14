"use client";

import { useState, useCallback } from "react";
import type { ArticleSection } from "@/data/knowledge";
import { sectionsToMarkdown } from "@/lib/sectionsToMarkdown";

interface Props {
  title: string;
  summary: string;
  sections: ArticleSection[];
}

export default function CopyMarkdownButton({ title, summary, sections }: Props) {
  const [state, setState] = useState<"idle" | "copied" | "error">("idle");

  const handleCopy = useCallback(async () => {
    let md: string;
    try {
      md = sectionsToMarkdown(title, summary, sections);
    } catch {
      // 内容转换失败时降级：只复制标题和摘要
      md = `# ${title}\n\n> ${summary}`;
    }

    try {
      await navigator.clipboard.writeText(md);
      setState("copied");
      setTimeout(() => setState("idle"), 2000);
    } catch {
      // clipboard API 不可用时尝试 execCommand 兼容方案
      try {
        const ta = document.createElement("textarea");
        ta.value = md;
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
        setState("copied");
        setTimeout(() => setState("idle"), 2000);
      } catch {
        setState("error");
        setTimeout(() => setState("idle"), 2000);
      }
    }
  }, [title, summary, sections]);

  const label =
    state === "copied" ? "✓ 已复制" : state === "error" ? "复制失败" : "复制全文";

  return (
    <button
      onClick={handleCopy}
      title="以 Markdown 格式复制全文"
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium border transition-all
        ${
          state === "copied"
            ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-300"
            : state === "error"
            ? "bg-red-500/15 border-red-500/40 text-red-300"
            : "bg-white/5 border-white/10 text-slate-400 hover:bg-white/10 hover:border-white/20 hover:text-slate-200"
        }`}
    >
      {state === "copied" ? (
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      ) : (
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-4 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      )}
      {label}
    </button>
  );
}
