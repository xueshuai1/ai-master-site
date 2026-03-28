"use client";

import { useState } from "react";

interface CodeBlockProps {
  language: string;
  children: string;
  title?: string;
  collapsible?: boolean;
}

export default function CodeBlock({ 
  language, 
  children, 
  title,
  collapsible = false 
}: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(collapsible);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(children);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const codeContent = (
    <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm font-mono leading-relaxed">
      <code className="language-{language}">{children}</code>
    </pre>
  );

  if (collapsible) {
    return (
      <div className="my-6 border border-gray-200 rounded-xl overflow-hidden">
        {title && (
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors border-b border-gray-200"
          >
            <div className="flex items-center gap-3">
              <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded font-medium">
                {language}
              </span>
              <span className="text-gray-700 font-medium">{title}</span>
            </div>
            <span className="text-gray-500 text-sm">
              {isCollapsed ? "▶ 展开" : "▼ 收起"}
            </span>
          </button>
        )}
        {!isCollapsed && (
          <div className="relative">
            {codeContent}
            <button
              onClick={handleCopy}
              className="absolute top-2 right-2 px-3 py-1.5 bg-white/90 hover:bg-white text-gray-700 text-xs rounded-md border border-gray-200 transition-all"
            >
              {copied ? "✅ 已复制" : "📋 复制"}
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="my-6 relative">
      {(title || language) && (
        <div className="flex items-center justify-between mb-2">
          {title && <span className="text-gray-700 font-medium">{title}</span>}
          {language && (
            <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded font-medium">
              {language}
            </span>
          )}
        </div>
      )}
      <div className="relative">
        {codeContent}
        <button
          onClick={handleCopy}
          className="absolute top-2 right-2 px-3 py-1.5 bg-white/90 hover:bg-white text-gray-700 text-xs rounded-md border border-gray-200 transition-all"
        >
          {copied ? "✅ 已复制" : "📋 复制"}
        </button>
      </div>
    </div>
  );
}
