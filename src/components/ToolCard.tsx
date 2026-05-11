"use client";

import Link from "next/link";
import { useState } from "react";
import type { Tool } from "@/data/tools";
import { formatStars, starsBadgeClass, isNewTool } from "@/lib/tools-helpers";

const priceColors: Record<string, string> = {
  免费: "bg-emerald-500/10 text-emerald-300",
  开源: "bg-blue-500/10 text-blue-300",
  付费: "bg-amber-500/10 text-amber-300",
  "免费+付费": "bg-purple-500/10 text-purple-300",
};

interface ToolCardProps {
  tool: Tool;
  /** 是否高亮 NEW（默认按 createdAt 自动判断） */
  forceNew?: boolean;
}

export default function ToolCard({ tool, forceNew }: ToolCardProps) {
  const [expanded, setExpanded] = useState(false);
  const isNew = forceNew ?? isNewTool(tool);
  const stars = tool.githubStars ?? 0;
  const showStars = stars > 0;
  const delta = tool.delta ?? 0;

  return (
    <Link
      href={`/tools/${tool.id}`}
      className="group glass-card glass-card-hover block p-5 min-w-0 overflow-hidden focus:outline-none focus:ring-2 focus:ring-brand-500/40"
      aria-label={`${tool.name} - ${tool.description}`}
    >
      <div className="flex items-start gap-3 mb-3">
        <span className="text-3xl" aria-hidden="true">{tool.icon}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-lg font-semibold group-hover:text-brand-300 transition-colors">
              {tool.name}
            </h3>
            {isNew && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-gradient-to-r from-pink-500/20 to-fuchsia-500/20 text-pink-300 border border-pink-500/30 animate-pulse">
                NEW
              </span>
            )}
            <span
              className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                priceColors[tool.price] ?? "bg-white/5 text-slate-300"
              }`}
            >
              {tool.price}
            </span>
            {showStars && (
              <span
                className={`px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-0.5 ${starsBadgeClass(stars)}`}
              >
                ⭐ {formatStars(stars)}
                {delta > 0 && (
                  <span className="text-green-400 ml-0.5">↑+{formatStars(delta)}</span>
                )}
                {delta < 0 && (
                  <span className="text-red-400 ml-0.5">↓{formatStars(Math.abs(delta))}</span>
                )}
              </span>
            )}
            {!showStars && tool.altToLikes != null && tool.altToLikes > 0 && (
              <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-orange-500/10 text-orange-300 flex items-center gap-0.5">
                🔥 {formatStars(tool.altToLikes)}
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-0.5 truncate max-w-full">
            {tool.url.replace(/^https?:\/\//, "")}
          </p>
        </div>
      </div>

      <p className="text-slate-400 text-sm leading-relaxed mb-2 line-clamp-3">
        {tool.description}
      </p>
      {tool.useCase && (
        <p className="text-xs text-slate-500 mb-3 flex items-center gap-1">
          <span className="text-brand-400">🎯</span> {tool.useCase}
        </p>
      )}
      <div className="flex flex-wrap gap-1.5 overflow-hidden max-w-full mb-3">
        {tool.tags.slice(0, 4).map((tag) => (
          <span
            key={tag}
            className="px-2 py-0.5 bg-white/5 rounded-md text-xs text-slate-400 whitespace-nowrap"
          >
            #{tag}
          </span>
        ))}
        {tool.tags.length > 4 && (
          <span className="px-2 py-0.5 bg-white/5 rounded-md text-xs text-slate-500">
            +{tool.tags.length - 4}
          </span>
        )}
      </div>

      {/* 卡片只显示 4 个高价值字段，其他都搬到详情页（避免视觉过载） */}
      {(tool.language || (tool.forks != null && tool.forks > 0) || tool.createdAt || tool.updatedAt) && (
        <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 mb-3 px-3 py-2.5 rounded-xl bg-white/[0.03] border border-white/5">
          {tool.language && (
            <div className="flex items-center gap-1.5 text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span className="text-slate-500">语言</span>
              <span className="text-slate-300">{tool.language}</span>
            </div>
          )}
          {tool.forks != null && tool.forks > 0 && (
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-slate-500">🍴 Forks</span>
              <span className="text-slate-300">{tool.forks.toLocaleString()}</span>
            </div>
          )}
          {tool.createdAt && (
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-slate-500">📅 上线</span>
              <span className="text-slate-300">
                {new Date(tool.createdAt).toLocaleDateString("zh-CN")}
              </span>
            </div>
          )}
          {tool.updatedAt && (
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-slate-500">🔄 更新</span>
              <span className="text-slate-300">
                {new Date(tool.updatedAt).toLocaleDateString("zh-CN")}
              </span>
            </div>
          )}
        </div>
      )}

      {(tool.pros?.length || tool.cons?.length) && (
        <>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setExpanded((prev) => !prev);
            }}
            aria-expanded={expanded}
            className="text-xs text-brand-400 hover:text-brand-300 transition-colors flex items-center gap-1 mb-2"
          >
            {expanded ? "收起" : "查看优缺点"} {expanded ? "▲" : "▼"}
          </button>
          {expanded && (
            <div className="space-y-2 text-xs">
              {tool.pros && tool.pros.length > 0 && (
                <div>
                  <p className="text-emerald-400 font-medium mb-1">✅ 优点</p>
                  {tool.pros.map((p, i) => (
                    <p key={i} className="text-slate-400 flex items-start gap-1">
                      <span className="text-emerald-500 mt-0.5 shrink-0">•</span> {p}
                    </p>
                  ))}
                </div>
              )}
              {tool.cons && tool.cons.length > 0 && (
                <div>
                  <p className="text-red-400 font-medium mb-1">⚠️ 限制</p>
                  {tool.cons.map((c, i) => (
                    <p key={i} className="text-slate-400 flex items-start gap-1">
                      <span className="text-red-500 mt-0.5 shrink-0">•</span> {c}
                    </p>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}

      <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/5">
        {tool.learnMore ? (
          <a
            href={tool.learnMore}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="text-xs text-brand-400 hover:text-brand-300 transition-colors flex items-center gap-1"
          >
            📖 官方文档
          </a>
        ) : (
          <span />
        )}
        <a
          href={tool.url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="text-xs text-slate-500 hover:text-brand-400 transition-colors flex items-center gap-1"
        >
          访问工具 →
        </a>
      </div>
    </Link>
  );
}
