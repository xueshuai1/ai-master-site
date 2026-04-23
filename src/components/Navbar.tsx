"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

interface NavLink {
  label: string;
  href: string;
}

const navLinks: NavLink[] = [
  { label: "首页", href: "/" },
  { label: "知识库", href: "/knowledge" },
  { label: "GitHub AI 精选", href: "/tools" },
  { label: "AI博客", href: "/blog" },
  { label: "最新AI动态", href: "/news" },
  { label: "学习路线", href: "/knowledge?mode=path" },
  { label: "关于", href: "/about" },
];

export default function Navbar({ activePath }: { activePath?: string }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on route change (click outside)
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [activePath]);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-slate-950/95 backdrop-blur-md border-b border-white/5 shadow-lg shadow-black/10"
          : "bg-slate-950/80 backdrop-blur-md border-b border-white/5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <span className="text-2xl" role="img" aria-label="AI Master logo">
              🍪
            </span>
            <span className="text-xl font-bold text-gradient">AI Master</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = activePath === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? "text-brand-400 bg-brand-500/10"
                      : "text-slate-300 hover:text-white hover:bg-white/5"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
            <Link
              href="/knowledge"
              className="ml-4 px-5 py-2 bg-brand-600 hover:bg-brand-500 rounded-lg text-sm font-medium transition-all hover:shadow-lg hover:shadow-brand-500/25"
            >
              开始学习
            </Link>
          </div>

          {/* Mobile hamburger button */}
          <button
            className="md:hidden p-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? "关闭菜单" : "打开菜单"}
            aria-expanded={mobileMenuOpen}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              {mobileMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu dropdown with animation */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-white/5 bg-slate-950/95 backdrop-blur-md">
          <div className="px-4 py-3 space-y-1">
            {navLinks.map((link) => {
              const isActive = activePath === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`block px-4 py-3 rounded-lg text-lg transition-colors ${
                    isActive
                      ? "text-brand-400 bg-brand-500/10 font-medium"
                      : "text-slate-300 hover:text-white hover:bg-white/10"
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              );
            })}
            <Link
              href="/knowledge"
              className="block w-full mt-2 text-center px-5 py-3 bg-brand-600 hover:bg-brand-500 rounded-lg font-medium text-lg"
              onClick={() => setMobileMenuOpen(false)}
            >
              开始学习
            </Link>
          </div>
        </div>
      )}

      {/* Overlay to close mobile menu */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-[-1]"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
    </nav>
  );
}
