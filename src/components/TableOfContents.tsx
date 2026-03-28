"use client";

import { useEffect, useState } from "react";

interface TOCItem {
  id: string;
  text: string;
  level: number;
}

interface TableOfContentsProps {
  containerSelector?: string;
  title?: string;
  maxDepth?: number;
}

export default function TableOfContents({ 
  containerSelector = ".prose",
  title = "目录",
  maxDepth = 3
}: TableOfContentsProps) {
  const [items, setItems] = useState<TOCItem[]>([]);
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    const container = document.querySelector(containerSelector);
    if (!container) return;

    const headings = container.querySelectorAll("h1, h2, h3, h4, h5, h6");
    const tocItems: TOCItem[] = [];

    headings.forEach((heading) => {
      const level = parseInt(heading.tagName[1]);
      if (level > maxDepth) return;

      // Generate ID if not exists
      if (!heading.id) {
        heading.id = heading.textContent?.toLowerCase().replace(/\s+/g, "-").replace(/[^\w-]/g, "") || "";
      }

      tocItems.push({
        id: heading.id,
        text: heading.textContent || "",
        level,
      });
    });

    setItems(tocItems);

    // Scroll spy
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: "-20% 0px -80% 0px" }
    );

    headings.forEach((heading) => observer.observe(heading));

    return () => observer.disconnect();
  }, [containerSelector, maxDepth]);

  if (items.length === 0) return null;

  return (
    <nav className="sticky top-6 bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
      <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
        <span>📑</span>
        {title}
      </h3>
      <ul className="space-y-2">
        {items.map((item) => (
          <li
            key={item.id}
            className={`text-sm transition-all duration-200 ${
              item.level === 1 ? "font-medium" : item.level === 2 ? "ml-3" : "ml-6"
            }`}
          >
            <a
              href={`#${item.id}`}
              className={`block py-1.5 px-2 rounded-lg transition-colors ${
                activeId === item.id
                  ? "bg-blue-50 text-blue-700 font-medium"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              }`}
              onClick={(e) => {
                e.preventDefault();
                document.getElementById(item.id)?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              {item.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
