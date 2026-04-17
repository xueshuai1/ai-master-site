"use client";

import { useState, useRef, useEffect } from "react";

export interface CategoryItem {
  key: string;
  icon: string;
  label: string;
  count: number;
}

interface CategoryFilterProps {
  categories: CategoryItem[];
  activeCategory: string;
  onChange: (key: string) => void;
  sortBy?: string;
  onSortChange?: (sort: string) => void;
}

export default function CategoryFilter({ categories, activeCategory, onChange, sortBy, onSortChange }: CategoryFilterProps) {
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);

  const hasSelection = activeCategory !== categories[0]?.key;
  const activeItem = categories.find((c) => c.key === activeCategory);

  // Click outside to close
  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (
        panelRef.current &&
        !panelRef.current.contains(e.target as Node) &&
        btnRef.current &&
        !btnRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  // ESC to close
  useEffect(() => {
    if (!open) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open]);

  const handleSelect = (key: string) => {
    onChange(key);
    setOpen(false);
  };

  return (
    <div className="relative" ref={panelRef}>
      {/* Trigger Button */}
      <button
        ref={btnRef}
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
          hasSelection
            ? "bg-brand-600/20 text-brand-300 border border-brand-500/30"
            : "bg-white/5 text-slate-400 border border-white/10 hover:bg-white/10 hover:text-white"
        }`}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
        </svg>
        <span>分类</span>
        {hasSelection && activeItem && (
          <span className="text-[10px] text-brand-400/60">·{activeItem.label}</span>
        )}
        <svg
          className={`w-3.5 h-3.5 transition-transform ${open ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Panel */}
      {open && (
        <>
          {/* Backdrop (mobile) */}
          <div className="fixed inset-0 z-40 sm:hidden" onClick={() => setOpen(false)} />

          {/* Dropdown */}
          <div className="absolute right-0 top-full mt-2 z-50 w-64 rounded-xl bg-slate-900/95 backdrop-blur-xl border border-white/10 shadow-2xl shadow-black/50 overflow-hidden">
            {/* Header */}
            <div className="px-4 py-2.5 border-b border-white/5 flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest">分类</span>
              <button
                onClick={() => handleSelect(categories[0]?.key)}
                className={`text-xs font-medium transition-colors ${
                  activeCategory === categories[0]?.key
                    ? "text-brand-400"
                    : "text-slate-500 hover:text-brand-400"
                }`}
              >
                不限
              </button>
            </div>

            {/* List */}
            <div className="py-1.5 max-h-72 overflow-y-auto">
              {categories.map((c) => {
                const isActive = activeCategory === c.key;
                return (
                  <button
                    key={c.key}
                    onClick={() => handleSelect(c.key)}
                    className={`w-full flex items-center justify-between px-4 py-2 text-sm transition-all ${
                      isActive
                        ? "text-brand-300 bg-brand-500/10"
                        : "text-slate-400 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {isActive && (
                        <svg className="w-3.5 h-3.5 text-brand-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                      {!isActive && <span className="w-3.5" />}
                      <span className={`font-medium ${isActive ? "text-brand-300" : ""}`}>{c.label}</span>
                    </div>
                    <span className={`text-xs tabular-nums ${isActive ? "text-brand-400/60" : "text-slate-600"}`}>
                      {c.count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Sort section (mobile only, inside panel) */}
            {onSortChange && (
              <div className="border-t border-white/5 px-4 py-2.5">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest">排序</span>
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => onSortChange("default")}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      sortBy === "default"
                        ? "bg-brand-500/20 text-brand-300"
                        : "bg-white/5 text-slate-400 hover:text-white"
                    }`}
                  >
                    默认
                  </button>
                  <button
                    onClick={() => onSortChange("stars")}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      sortBy === "stars"
                        ? "bg-brand-500/20 text-brand-300"
                        : "bg-white/5 text-slate-400 hover:text-white"
                    }`}
                  >
                    ⭐ 热门
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
