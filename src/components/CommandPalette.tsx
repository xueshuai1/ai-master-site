"use client";

import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";

type ItemType = "article" | "blog" | "tool" | "news";

interface SearchItem {
  id: string;
  type: ItemType;
  title: string;
  subtitle: string;
  /** 用于命中匹配的小写文本（已合并 title + tags + summary 等） */
  haystack: string;
  /** 内部跳转 path；外部链接（如 tools）放 external */
  href?: string;
  external?: string;
}

const typeMeta: Record<ItemType, { label: string; icon: string; badgeClass: string }> = {
  article: { label: "知识库", icon: "📚", badgeClass: "bg-emerald-500/15 text-emerald-300 border-emerald-500/25" },
  blog:    { label: "博客",   icon: "✍️", badgeClass: "bg-violet-500/15 text-violet-300 border-violet-500/25" },
  tool:    { label: "工具",   icon: "🛠️", badgeClass: "bg-amber-500/15 text-amber-300 border-amber-500/25" },
  news:    { label: "资讯",   icon: "📰", badgeClass: "bg-sky-500/15 text-sky-300 border-sky-500/25" },
};

/**
 * 动态加载索引：四份数据文件共数 MB，按需 chunk 加载，
 * 避免拖大全站共享 bundle。
 */
async function buildIndex(): Promise<SearchItem[]> {
  const [knowledgeMod, blogsMod, toolsMod, newsMod] = await Promise.all([
    import("@/data/knowledge"),
    import("@/data/blogs"),
    import("@/data/tools"),
    import("@/data/news"),
  ]);
  const { articles } = knowledgeMod;
  const { blogs } = blogsMod;
  const { tools } = toolsMod;
  const { news } = newsMod;

  const items: SearchItem[] = [];

  for (const a of articles) {
    const tagsStr = a.tags.join(" ");
    items.push({
      id: `article:${a.id}`,
      type: "article",
      title: a.title,
      subtitle: a.summary,
      haystack: `${a.title} ${tagsStr} ${a.summary}`.toLowerCase(),
      href: `/article/${a.id}`,
    });
  }
  for (const b of blogs) {
    const tagsStr = (b.tags || []).join(" ");
    items.push({
      id: `blog:${b.id}`,
      type: "blog",
      title: b.title,
      subtitle: b.summary,
      haystack: `${b.title} ${tagsStr} ${b.summary}`.toLowerCase(),
      href: `/blog/${b.id}`,
    });
  }
  for (const t of tools) {
    const tagsStr = (t.tags || []).join(" ");
    items.push({
      id: `tool:${t.id}`,
      type: "tool",
      title: t.name,
      subtitle: t.description,
      haystack: `${t.name} ${tagsStr} ${t.description}`.toLowerCase(),
      href: `/tools/${t.id}`,
    });
  }
  for (const n of news) {
    items.push({
      id: `news:${n.id}`,
      type: "news",
      title: n.title,
      subtitle: n.summary,
      haystack: `${n.title} ${n.tag} ${n.summary}`.toLowerCase(),
      href: n.href,
    });
  }
  return items;
}

const MAX_RESULTS = 30;

function highlight(text: string, query: string): React.ReactNode {
  if (!query) return text;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx < 0) return text;
  return (
    <>
      {text.slice(0, idx)}
      <mark className="bg-brand-500/30 text-white rounded px-0.5">
        {text.slice(idx, idx + query.length)}
      </mark>
      {text.slice(idx + query.length)}
    </>
  );
}

export default function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // 全站索引：只在打开时首次异步构建一次（动态 import + 一次性缓存）
  const [index, setIndex] = useState<SearchItem[] | null>(null);
  const buildingRef = useRef(false);
  useEffect(() => {
    if (!open || index !== null || buildingRef.current) return;
    buildingRef.current = true;
    buildIndex()
      .then((idx) => setIndex(idx))
      .finally(() => {
        buildingRef.current = false;
      });
  }, [open, index]);

  // 全局快捷键：⌘K / Ctrl+K 打开；/ 在无 input focus 时也打开
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const isMod = e.metaKey || e.ctrlKey;
      if (isMod && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
        return;
      }
      if (!open && e.key === "/" && !isTypingTarget(e.target)) {
        e.preventDefault();
        setOpen(true);
      }
    };
    const onOpen = () => setOpen(true);
    window.addEventListener("keydown", onKey);
    window.addEventListener("open-command-palette", onOpen);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("open-command-palette", onOpen);
    };
  }, [open]);

  // 打开时聚焦输入框
  useEffect(() => {
    if (open) {
      // 等下一帧 transform 完毕后聚焦
      requestAnimationFrame(() => inputRef.current?.focus());
      setActive(0);
    } else {
      setQuery("");
    }
  }, [open]);

  // 锁定 body 滚动
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const results = useMemo<SearchItem[]>(() => {
    if (!index) return [];
    const q = query.trim().toLowerCase();
    if (!q) {
      // 空查询时显示每类前几条，便于「随便看看」
      const slice: SearchItem[] = [];
      const perType = 6;
      (["article", "blog", "tool", "news"] as ItemType[]).forEach((t) => {
        slice.push(...index.filter((i) => i.type === t).slice(0, perType));
      });
      return slice.slice(0, MAX_RESULTS);
    }
    // 简易打分：title 命中 > haystack 命中
    const scored: { item: SearchItem; score: number }[] = [];
    for (const item of index) {
      const titleLc = item.title.toLowerCase();
      let score = 0;
      if (titleLc.startsWith(q)) score = 100;
      else if (titleLc.includes(q)) score = 60;
      else if (item.haystack.includes(q)) score = 20;
      if (score > 0) scored.push({ item, score });
    }
    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, MAX_RESULTS).map((s) => s.item);
  }, [index, query]);

  // 选中越界时回到 0
  useEffect(() => {
    if (active >= results.length) setActive(0);
  }, [results.length, active]);

  const close = useCallback(() => setOpen(false), []);

  const select = useCallback(
    (item: SearchItem) => {
      close();
      if (item.external) {
        window.open(item.external, "_blank", "noopener,noreferrer");
      } else if (item.href) {
        router.push(item.href);
      }
    },
    [close, router]
  );

  // 列表键盘导航
  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Escape") {
      e.preventDefault();
      close();
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => Math.min(results.length - 1, i + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => Math.max(0, i - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const item = results[active];
      if (item) select(item);
    }
  };

  // 选中项滚动到可视区
  useEffect(() => {
    const el = listRef.current?.querySelector<HTMLElement>(`[data-idx="${active}"]`);
    el?.scrollIntoView({ block: "nearest" });
  }, [active]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center p-4 pt-[10vh] sm:pt-[15vh]"
      onKeyDown={onKeyDown}
      role="dialog"
      aria-modal="true"
      aria-label="搜索"
    >
      {/* 背景遮罩 */}
      <button
        type="button"
        aria-label="关闭搜索"
        onClick={close}
        className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm animate-cmdk-fade"
      />

      {/* 面板 */}
      <div className="relative w-full max-w-2xl rounded-2xl border border-white/10 bg-slate-900/95 shadow-2xl shadow-black/40 backdrop-blur-xl overflow-hidden animate-cmdk-pop">
        {/* 顶部输入区 */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-white/5">
          <svg className="w-5 h-5 text-slate-400 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="搜索知识库 / 博客 / 工具 / 资讯…"
            className="flex-1 bg-transparent text-base text-white placeholder-slate-500 outline-none"
          />
          <kbd className="hidden sm:inline-flex items-center gap-1 rounded border border-white/10 bg-white/5 px-1.5 py-0.5 text-[10px] font-mono text-slate-400">
            ESC
          </kbd>
        </div>

        {/* 结果区 */}
        <div ref={listRef} className="max-h-[60vh] overflow-y-auto py-2">
          {!index ? (
            <div className="px-4 py-10 text-center text-sm text-slate-500">索引加载中…</div>
          ) : results.length === 0 ? (
            <div className="px-4 py-10 text-center text-sm text-slate-500">
              没有找到匹配的内容。试试别的关键词？
            </div>
          ) : (
            results.map((item, i) => {
              const meta = typeMeta[item.type];
              const isActive = i === active;
              return (
                <button
                  key={item.id}
                  data-idx={i}
                  type="button"
                  onMouseEnter={() => setActive(i)}
                  onClick={() => select(item)}
                  className={`group w-full flex items-start gap-3 px-4 py-2.5 text-left transition-colors ${
                    isActive ? "bg-brand-500/15" : "hover:bg-white/[0.04]"
                  }`}
                >
                  <span className={`mt-0.5 inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[10px] font-medium ${meta.badgeClass}`}>
                    <span aria-hidden>{meta.icon}</span>
                    <span>{meta.label}</span>
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className={`text-sm font-medium truncate ${isActive ? "text-white" : "text-slate-200"}`}>
                      {highlight(item.title, query.trim())}
                    </div>
                    {item.subtitle && (
                      <div className="text-xs text-slate-500 truncate mt-0.5">
                        {item.subtitle}
                      </div>
                    )}
                  </div>
                  {item.external && (
                    <svg className="w-3.5 h-3.5 text-slate-500 mt-1 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14 3h7v7m0-7L10 14m-4-7H5a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2v-3" />
                    </svg>
                  )}
                  <span
                    className={`mt-1 shrink-0 text-[10px] font-mono opacity-0 transition-opacity ${
                      isActive ? "opacity-100 text-brand-300" : ""
                    }`}
                  >
                    ↵
                  </span>
                </button>
              );
            })
          )}
        </div>

        {/* 底部提示栏 */}
        <div className="flex items-center justify-between gap-4 px-4 py-2 border-t border-white/5 bg-white/[0.02] text-[11px] text-slate-500">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1">
              <kbd className="rounded border border-white/10 bg-white/5 px-1 py-0.5 font-mono">↑</kbd>
              <kbd className="rounded border border-white/10 bg-white/5 px-1 py-0.5 font-mono">↓</kbd>
              移动
            </span>
            <span className="inline-flex items-center gap-1">
              <kbd className="rounded border border-white/10 bg-white/5 px-1 py-0.5 font-mono">↵</kbd>
              打开
            </span>
            <span className="inline-flex items-center gap-1">
              <kbd className="rounded border border-white/10 bg-white/5 px-1 py-0.5 font-mono">ESC</kbd>
              关闭
            </span>
          </div>
          {index && (
            <span>
              共 {index.length.toLocaleString("zh-CN")} 条 · 显示前 {Math.min(results.length, MAX_RESULTS)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function isTypingTarget(t: EventTarget | null): boolean {
  if (!(t instanceof HTMLElement)) return false;
  const tag = t.tagName;
  if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return true;
  return t.isContentEditable;
}
