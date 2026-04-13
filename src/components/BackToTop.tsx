"use client";

import { useState, useEffect } from "react";

export default function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const toggle = () => setVisible(window.scrollY > 400);
    window.addEventListener("scroll", toggle, { passive: true });
    return () => window.removeEventListener("scroll", toggle);
  }, []);

  if (!visible) return null;

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className="fixed bottom-6 right-6 z-50 w-12 h-12 bg-brand-600 hover:bg-brand-500 rounded-full shadow-lg shadow-brand-500/30 flex items-center justify-center text-xl transition-all hover:-translate-y-1 animate-fade-in"
      aria-label="回到顶部"
    >
      ↑
    </button>
  );
}
