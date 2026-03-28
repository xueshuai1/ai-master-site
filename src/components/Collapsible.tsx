"use client";

import { useState } from "react";

interface CollapsibleProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  variant?: "default" | "card" | "simple";
}

export default function Collapsible({ 
  title, 
  children, 
  defaultOpen = false,
  variant = "default"
}: CollapsibleProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  if (variant === "simple") {
    return (
      <details 
        className="my-4 group"
        open={defaultOpen}
      >
        <summary className="cursor-pointer list-none flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors">
          <span className="font-medium text-gray-800">{title}</span>
          <span className="text-gray-400 group-open:rotate-180 transition-transform">
            ▼
          </span>
        </summary>
        <div className="mt-3 pl-4 border-l-2 border-gray-200">
          {children}
        </div>
      </details>
    );
  }

  if (variant === "card") {
    return (
      <div className="my-4 border border-gray-200 rounded-xl overflow-hidden">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between px-5 py-4 bg-gradient-to-r from-gray-50 to-white hover:from-gray-100 hover:to-gray-50 transition-all"
        >
          <span className="font-semibold text-gray-800 text-lg">{title}</span>
          <span className={`text-gray-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}>
            ▼
          </span>
        </button>
        {isOpen && (
          <div className="px-5 py-4 border-t border-gray-100 bg-white">
            {children}
          </div>
        )}
      </div>
    );
  }

  // default variant
  return (
    <div className="my-4 border border-gray-200 rounded-lg overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors"
      >
        <span className="font-medium text-gray-800">{title}</span>
        <span className={`text-gray-500 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}>
          ▼
        </span>
      </button>
      {isOpen && (
        <div className="px-4 py-4 border-t border-gray-200">
          {children}
        </div>
      )}
    </div>
  );
}
