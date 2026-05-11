"use client";

interface PaginatorProps {
  currentPage: number;
  totalPages: number;
  onChange: (page: number) => void;
  /** 在 currentPage 两侧各显示多少页（默认 1） */
  siblingCount?: number;
}

/**
 * 分页器，>7 页时自动折叠为 1 … (current-1) [current] (current+1) … last。
 * 支持上一页 / 下一页 / 直接跳转。
 *
 * 示例：
 *   < 1 ... 7 8 [9] 10 11 ... 14 >
 */
export default function Paginator({
  currentPage,
  totalPages,
  onChange,
  siblingCount = 1,
}: PaginatorProps) {
  if (totalPages <= 1) return null;
  const pages = computePageList(currentPage, totalPages, siblingCount);

  const go = (n: number) => {
    if (n < 1 || n > totalPages || n === currentPage) return;
    onChange(n);
    if (typeof window !== "undefined") window.scrollTo({ top: 0 });
  };

  return (
    <nav className="flex items-center justify-center gap-2 mt-10 flex-wrap" aria-label="分页">
      <button
        type="button"
        onClick={() => go(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-sm font-medium text-slate-400 hover:bg-white/10 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        aria-label="上一页"
      >
        ← 上一页
      </button>

      {pages.map((p, idx) =>
        p === "…" ? (
          <span key={`gap-${idx}`} className="px-2 text-slate-500 select-none">
            …
          </span>
        ) : (
          <button
            key={p}
            type="button"
            onClick={() => go(p)}
            aria-current={p === currentPage ? "page" : undefined}
            className={`w-10 h-10 rounded-lg text-sm font-medium transition-all ${
              p === currentPage
                ? "bg-brand-600 text-white shadow-lg shadow-brand-500/25"
                : "bg-white/5 border border-white/10 text-slate-400 hover:bg-white/10 hover:text-white"
            }`}
          >
            {p}
          </button>
        ),
      )}

      <button
        type="button"
        onClick={() => go(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-sm font-medium text-slate-400 hover:bg-white/10 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        aria-label="下一页"
      >
        下一页 →
      </button>
    </nav>
  );
}

/**
 * 计算实际渲染的页码列表，"…" 用作折叠占位。
 * 总页数 ≤ 7 时全部展开，否则用 sliding window + 两端锚定。
 */
function computePageList(
  current: number,
  total: number,
  siblings: number,
): (number | "…")[] {
  const totalNumbers = siblings * 2 + 5; // first + last + current + 2*siblings + 2 ellipsis
  if (total <= totalNumbers) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const left = Math.max(2, current - siblings);
  const right = Math.min(total - 1, current + siblings);
  const showLeftEllipsis = left > 2;
  const showRightEllipsis = right < total - 1;

  const result: (number | "…")[] = [1];
  if (showLeftEllipsis) result.push("…");
  for (let i = left; i <= right; i++) result.push(i);
  if (showRightEllipsis) result.push("…");
  result.push(total);
  return result;
}
