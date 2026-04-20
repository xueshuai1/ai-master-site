"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { tools, toolCategories, Tool } from "@/data/tools";
import githubStars from "@/data/github-stars.json";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import CategoryFilter from "@/components/CategoryFilter";

const toolsWithPopularity: Tool[] = tools.map(t => {
  const ghData = (githubStars as any).stars?.[t.id];
  const altData = (githubStars as any).alternativeTo?.[t.id];
  return {
    ...t,
    githubStars: ghData?.stars ?? t.githubStars ?? null,
    altToLikes: altData?.likes ?? null,
    repoCreatedAt: ghData?.createdAt ?? (t as any).createdAt ?? null,
    delta: ghData?.delta ?? null,
    previousStars: ghData?.previousStars ?? null,
    // GitHub 完整数据 — 优先 stars.json，回退到 tools.ts 字段
    forks: ghData?.forks ?? (t as any).forks ?? null,
    watchers: ghData?.watchers ?? (t as any).watchers ?? null,
    language: ghData?.language ?? (t as any).language ?? null,
    license: ghData?.license ?? (t as any).license ?? null,
    homepage: ghData?.homepage ?? (t as any).homepage ?? null,
    lastUpdated: ghData?.updatedAt ?? (t as any).updatedAt ?? null,
    openIssues: ghData?.openIssues ?? (t as any).openIssues ?? null,
    topics: ghData?.topics ?? (t as any).topics ?? null,
  };
});

function formatPopularity(n: number): string {
  if (n >= 10000) return `${Math.round(n / 1000)}k`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return n.toString();
}

const priceColors: Record<string, string> = {
  免费: "bg-emerald-500/10 text-emerald-300",
  开源: "bg-blue-500/10 text-blue-300",
  付费: "bg-amber-500/10 text-amber-300",
  "免费+付费": "bg-purple-500/10 text-purple-300",
};

function ToolCard({ tool }: { tool: Tool }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="group block p-5 rounded-2xl bg-white/5 border border-white/5 hover:border-brand-500/30 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-brand-500/5 min-w-0 overflow-hidden">
      <div className="flex items-start gap-3 mb-3">
        <span className="text-3xl">{tool.icon}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-lg font-semibold group-hover:text-brand-300 transition-colors">{tool.name}</h3>
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${priceColors[tool.price]}`}>{tool.price}</span>
            {tool.githubStars != null && tool.githubStars > 0 && (
              <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-500/10 text-yellow-300 flex items-center gap-0.5">
                ⭐ {formatPopularity(tool.githubStars)}
                {(tool as any).delta != null && (tool as any).delta > 0 && (
                  <span className="text-green-400 ml-0.5">↑+{formatPopularity((tool as any).delta)}</span>
                )}
                {(tool as any).delta != null && (tool as any).delta < 0 && (
                  <span className="text-red-400 ml-0.5">↓{formatPopularity(Math.abs((tool as any).delta))}</span>
                )}
              </span>
            )}
            {tool.githubStars == null && (tool as any).altToLikes != null && (tool as any).altToLikes > 0 && (
              <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-orange-500/10 text-orange-300 flex items-center gap-0.5">🔥 {formatPopularity((tool as any).altToLikes)}</span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-0.5 truncate max-w-full">{tool.url.replace("https://", "")}</p>
        </div>
      </div>
      <p className="text-slate-400 text-sm leading-relaxed mb-2 line-clamp-3">{tool.description}</p>
      {tool.useCase && <p className="text-xs text-slate-500 mb-3 flex items-center gap-1"><span className="text-brand-400">🎯</span> {tool.useCase}</p>}
      <div className="flex flex-wrap gap-1.5 overflow-hidden max-w-full mb-3">
        {tool.tags.slice(0, 4).map((tag) => (
          <span key={tag} className="px-2 py-0.5 bg-white/5 rounded-md text-xs text-slate-400 whitespace-nowrap">#{tag}</span>
        ))}
        {tool.tags.length > 4 && <span className="px-2 py-0.5 bg-white/5 rounded-md text-xs text-slate-500">+{tool.tags.length - 4}</span>}
      </div>

      {/* GitHub 元数据 */}
      {((tool as any).language || (tool as any).forks != null || (tool as any).repoCreatedAt || (tool as any).license) && (
        <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 mb-3 px-3 py-2.5 rounded-xl bg-white/[0.03] border border-white/5">
          {(tool as any).language && (
            <div className="flex items-center gap-1.5 text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span className="text-slate-500">语言</span>
              <span className="text-slate-300">{(tool as any).language}</span>
            </div>
          )}
          {(tool as any).forks != null && (tool as any).forks > 0 && (
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-slate-500">🍴 Forks</span>
              <span className="text-slate-300">{(tool as any).forks.toLocaleString()}</span>
            </div>
          )}
          {(tool as any).watchers != null && (tool as any).watchers > 0 && (
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-slate-500">👀 Watch</span>
              <span className="text-slate-300">{(tool as any).watchers.toLocaleString()}</span>
            </div>
          )}
          {(tool as any).openIssues != null && (tool as any).openIssues > 0 && (
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-slate-500">🔧 Issues</span>
              <span className="text-slate-300">{(tool as any).openIssues.toLocaleString()}</span>
            </div>
          )}
          {(tool as any).repoCreatedAt && (
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-slate-500">📅 上线</span>
              <span className="text-slate-300">{new Date((tool as any).repoCreatedAt).toLocaleDateString('zh-CN')}</span>
            </div>
          )}
          {(tool as any).lastUpdated && (
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-slate-500">🔄 更新</span>
              <span className="text-slate-300">{new Date((tool as any).lastUpdated).toLocaleDateString('zh-CN')}</span>
            </div>
          )}
          {(tool as any).license && (tool as any).license !== 'null' && (
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-slate-500">📄 协议</span>
              <span className="text-slate-300">{(tool as any).license}</span>
            </div>
          )}
          {(tool as any).delta != null && (tool as any).delta !== 0 && (
            <div className="col-span-2 flex items-center gap-1.5 text-xs">
              <span className="text-slate-500">📈 增长</span>
              <span className={(tool as any).delta > 0 ? 'text-green-400' : 'text-red-400'}>
                {(tool as any).delta > 0 ? '↑' : '↓'}{(tool as any).delta > 0 ? '+' : ''}{(tool as any).delta.toLocaleString()} ⭐
                <span className="text-slate-500 ml-1">（对比上次检查）</span>
              </span>
            </div>
          )}
        </div>
      )}
      {(tool.pros?.length || tool.cons?.length) && (
        <>
          <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); setExpanded(!expanded); }} className="text-xs text-brand-400 hover:text-brand-300 transition-colors flex items-center gap-1 mb-2">
            {expanded ? "收起" : "查看优缺点"} {expanded ? "▲" : "▼"}
          </button>
          {expanded && (
            <div className="space-y-2 text-xs">
              {tool.pros && tool.pros.length > 0 && (
                <div>
                  <p className="text-emerald-400 font-medium mb-1">✅ 优点</p>
                  {tool.pros.map((p, i) => (
                    <p key={i} className="text-slate-400 flex items-start gap-1"><span className="text-emerald-500 mt-0.5 shrink-0">•</span> {p}</p>
                  ))}
                </div>
              )}
              {tool.cons && tool.cons.length > 0 && (
                <div>
                  <p className="text-red-400 font-medium mb-1">⚠️ 限制</p>
                  {tool.cons.map((c, i) => (
                    <p key={i} className="text-slate-400 flex items-start gap-1"><span className="text-red-500 mt-0.5 shrink-0">•</span> {c}</p>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/5">
        {tool.learnMore ? (
          <a href={tool.learnMore} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="text-xs text-brand-400 hover:text-brand-300 transition-colors flex items-center gap-1">📖 官方文档</a>
        ) : <span />}
        <a href={tool.url} target="_blank" rel="noopener noreferrer" className="text-xs text-slate-500 hover:text-brand-400 transition-colors flex items-center gap-1">访问工具 →</a>
      </div>
    </div>
  );
}

const TOOLS_PER_PAGE = 20;

type SortKey = "stars" | "newest" | "hottest";

export default function ToolsPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [activeCategory, setActiveCategory] = useState(searchParams.get("cat") || "all");
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get("page") || "1") || 1);
  const [sortBy, setSortBy] = useState<SortKey>((searchParams.get("sort") as SortKey) || "stars");

  const isInitialMount = useRef(true);
  const syncTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Unified effect: detect category/sort changes → reset page → sync URL
  useEffect(() => {
    if (isInitialMount.current) { isInitialMount.current = false; return; }
    setCurrentPage(1);
    const params = new URLSearchParams();
    if (activeCategory !== "all") params.set("cat", activeCategory);
    if (searchQuery) params.set("q", searchQuery);
    if (sortBy !== "stars") params.set("sort", sortBy);
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }, [activeCategory, searchQuery, sortBy, pathname, router]);

  const filteredTools = useMemo(() => {
    let result = toolsWithPopularity.filter((t) => {
      const matchCategory = activeCategory === "all" || t.category === activeCategory;
      const matchSearch = !searchQuery || t.name.toLowerCase().includes(searchQuery.toLowerCase()) || t.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase())) || t.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCategory && matchSearch;
    });
    if (sortBy === "stars") {
      result = [...result].sort((a, b) => {
        const aStars = a.githubStars != null && a.githubStars > 0 ? a.githubStars : 0;
        const bStars = b.githubStars != null && b.githubStars > 0 ? b.githubStars : 0;
        return bStars - aStars;
      });
    } else if (sortBy === "newest") {
      result = [...result].sort((a, b) => {
        const aDate = (a as any).repoCreatedAt || (a as any).createdAt || '';
        const bDate = (b as any).repoCreatedAt || (b as any).createdAt || '';
        if (!aDate && !bDate) return 0;
        if (!aDate) return 1;
        if (!bDate) return -1;
        return bDate.localeCompare(aDate);
      });
    } else if (sortBy === "hottest") {
      result = [...result].sort((a, b) => {
        const aDelta = (a as any).delta ?? 0;
        const bDelta = (b as any).delta ?? 0;
        return bDelta - aDelta;
      });
    }
    return result;
  }, [activeCategory, searchQuery, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filteredTools.length / TOOLS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedTools = filteredTools.slice((safePage - 1) * TOOLS_PER_PAGE, safePage * TOOLS_PER_PAGE);

  const categoryData = toolCategories.map((c) => ({
    key: c.key,
    icon: c.icon,
    label: c.label,
    count: c.key === "all" ? toolsWithPopularity.length : toolsWithPopularity.filter((t) => t.category === c.key).length,
  }));

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-brand-950 text-white">
      <Navbar activePath="/tools" />

      <section className="pt-28 pb-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">🛠️ <span className="text-gradient">GitHub AI 精选</span></h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">精选最实用的 GitHub 开源 AI 项目，发现优质框架、模型与工具</p>
        </div>
      </section>

      <section className="px-4 sm:px-6 lg:px-8 pb-6">
        <div className="max-w-5xl mx-auto">
          <div className="relative">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input type="text" placeholder="搜索项目、标签..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-brand-500/50 focus:ring-1 focus:ring-brand-500/25 transition-all" />
          </div>
        </div>
      </section>

      <section className="hidden lg:block px-4 sm:px-6 lg:px-8 pb-4">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-wrap gap-2">
            {categoryData.map((c) => {
              const isActive = activeCategory === c.key;
              return (
                <button key={c.key} onClick={() => setActiveCategory(c.key)} className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-sm border transition-all cursor-pointer ${isActive ? "bg-brand-500/15 border-brand-500/40 text-brand-300 shadow-sm shadow-brand-500/10" : "bg-white/5 border-white/10 text-slate-400 hover:border-brand-500/30 hover:text-white"}`}>
                  <span>{c.icon}</span><span className="font-medium">{c.label}</span><span className="text-xs opacity-60">{c.count}</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <section className="px-4 sm:px-6 lg:px-8 pb-20">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <p className="hidden lg:block text-sm text-slate-500">收录 <span className="text-brand-400 font-medium">{filteredTools.length}</span> 个开源项目</p>
            <div className="flex items-center gap-2">
              {/* Mobile: sort tabs + category */}
              <div className="lg:hidden flex items-center gap-2">
                <div className="flex items-center gap-1 bg-white/5 border border-white/10 rounded-lg p-0.5">
                  {([
                    ["stars", "⭐ Stars"],
                    ["newest", "🕐 最新"],
                    ["hottest", "🔥 最火"],
                  ] as [SortKey, string][]).map(([key, label]) => (
                    <button
                      key={key}
                      onClick={() => setSortBy(key)}
                      className={`px-2 py-1 rounded-md text-xs font-medium transition-all whitespace-nowrap ${
                        sortBy === key
                          ? "bg-brand-500/20 text-brand-300"
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                <CategoryFilter categories={categoryData} activeCategory={activeCategory} onChange={(key) => setActiveCategory(key)} />
              </div>
              {/* Desktop: sort select */}
              <div className="hidden lg:flex items-center gap-2">
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value as SortKey)} className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-sm text-slate-400 focus:outline-none focus:border-brand-500/50 appearance-none cursor-pointer">
                  <option value="stars">⭐ Stars</option><option value="newest">🕐 最新</option><option value="hottest">🔥 最火</option>
                </select>
              </div>
            </div>
          </div>

          {filteredTools.length > 0 ? (
            <>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 overflow-hidden">
                {paginatedTools.map((tool) => (<ToolCard key={tool.id} tool={tool} />))}
              </div>
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-10">
                  <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={safePage === 1} className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-sm font-medium text-slate-400 hover:bg-white/10 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all">← 上一页</button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button key={page} onClick={() => setCurrentPage(page)} className={`w-10 h-10 rounded-lg text-sm font-medium transition-all ${page === safePage ? "bg-brand-600 text-white shadow-lg shadow-brand-500/25" : "bg-white/5 border border-white/10 text-slate-400 hover:bg-white/10 hover:text-white"}`}>{page}</button>
                  ))}
                  <button onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={safePage === totalPages} className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-sm font-medium text-slate-400 hover:bg-white/10 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all">下一页 →</button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-20">
              <div className="text-5xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold text-slate-300 mb-2">没有找到相关项目</h3>
              <p className="text-slate-500">试试其他关键词或切换分类</p>
              <button onClick={() => { setSearchQuery(""); setActiveCategory("all"); setSortBy("stars"); setCurrentPage(1); }} className="mt-4 px-6 py-2 bg-brand-600 hover:bg-brand-500 rounded-lg font-medium transition-all">重置筛选</button>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </main>
  );
}
