"use client";

import { useState, useEffect } from "react";

interface TocItem {
  id: string;
  title: string;
}

interface ArticleTocSidebarProps {
  toc: TocItem[];
  contentSelector?: string;
}

export default function ArticleTocSidebar({ toc, contentSelector = "article" }: ArticleTocSidebarProps) {
  const [activeId, setActiveId] = useState("");

  useEffect(() => {
    const handleScroll = () => {
      const content = document.querySelector(contentSelector);
      if (!content) return;
      const headings = content.querySelectorAll("h2");
      for (let i = headings.length - 1; i >= 0; i--) {
        const h = headings[i] as HTMLElement;
        if (h.getBoundingClientRect().top <= 120) {
          setActiveId(h.id);
          break;
        }
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [contentSelector]);

  const scrollToHeading = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  if (toc.length < 2) return null;

  return (
    <aside className="hidden lg:block w-64 shrink-0">
      <div className="sticky top-24">
        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">
          📑 目录
        </h3>
        <nav className="space-y-1">
          {toc.map((item) => (
            <button
              key={item.id}
              onClick={() => scrollToHeading(item.id)}
              className={`block w-full text-left py-1.5 text-sm transition-all rounded-md px-2 truncate ${
                activeId === item.id
                  ? "text-brand-300 bg-brand-500/10 font-medium"
                  : "text-slate-500 hover:text-slate-300"
              }`}
            >
              {item.title}
            </button>
          ))}
        </nav>
      </div>
    </aside>
  );
}
