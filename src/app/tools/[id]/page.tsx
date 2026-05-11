import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { tools } from "@/data/tools";
import {
  enrichedTools,
  getEnrichedTool,
  getRelatedTools,
  formatStars,
  starsBadgeClass,
  isNewTool,
  categoryLabel,
} from "@/lib/tools-helpers";
import {
  SITE_URL,
  softwareApplicationSchema,
  breadcrumbSchema,
} from "@/lib/structured-data";
import JsonLd from "@/components/JsonLd";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ToolCard from "@/components/ToolCard";

export const dynamicParams = false;

export function generateStaticParams() {
  return tools.map((t) => ({ id: t.id }));
}

const priceColors: Record<string, string> = {
  免费: "bg-emerald-500/10 text-emerald-300",
  开源: "bg-blue-500/10 text-blue-300",
  付费: "bg-amber-500/10 text-amber-300",
  "免费+付费": "bg-purple-500/10 text-purple-300",
};

export function generateMetadata({ params }: { params: { id: string } }): Metadata {
  const tool = getEnrichedTool(params.id);
  if (!tool) {
    return { title: "工具未找到 - AI Master", robots: "noindex" };
  }
  const titleBase = `${tool.name} - ${categoryLabel(tool.category)}`;
  const desc =
    `${tool.name}：${tool.description}` +
    (tool.useCase ? ` 适用场景：${tool.useCase}` : "");
  return {
    title: titleBase,
    description: desc.slice(0, 160),
    keywords: [tool.name, categoryLabel(tool.category), ...tool.tags].join(", "),
    alternates: {
      canonical: `${SITE_URL}/tools/${tool.id}`,
    },
    openGraph: {
      type: "website",
      title: tool.name,
      description: tool.description,
      url: `${SITE_URL}/tools/${tool.id}`,
      locale: "zh_CN",
      siteName: "AI Master",
    },
    twitter: {
      card: "summary",
      title: tool.name,
      description: tool.description,
    },
  };
}

export default function ToolDetailPage({ params }: { params: { id: string } }) {
  const tool = getEnrichedTool(params.id);
  if (!tool) notFound();

  const url = `${SITE_URL}/tools/${tool.id}`;
  const related = getRelatedTools(tool, 6);
  const isNew = isNewTool(tool);
  const stars = tool.githubStars ?? 0;
  const showStars = stars > 0;
  const delta = tool.delta ?? 0;
  const sameAsClean = Array.from(
    new Set([tool.url, tool.homepage].filter((v): v is string => !!v)),
  );

  const structured = [
    softwareApplicationSchema({
      url,
      name: tool.name,
      description: tool.description,
      applicationCategory: categoryLabel(tool.category),
      price: tool.price,
      programmingLanguage: tool.language,
      keywords: tool.tags,
      stars: tool.githubStars,
      sameAs: sameAsClean,
    }),
    breadcrumbSchema([
      { name: "首页", url: SITE_URL },
      { name: "AI 工具", url: `${SITE_URL}/tools` },
      { name: tool.name, url },
    ]),
  ];

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-brand-950 text-white">
      <JsonLd data={structured} />
      <Navbar activePath="/tools" />

      <article className="pt-28 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <nav className="text-sm text-slate-500 mb-6 flex items-center gap-2 flex-wrap" aria-label="面包屑">
            <Link href="/" className="hover:text-brand-400 transition-colors">首页</Link>
            <span>/</span>
            <Link href="/tools" className="hover:text-brand-400 transition-colors">AI 工具</Link>
            <span>/</span>
            <Link
              href={`/tools?cat=${tool.category}`}
              className="hover:text-brand-400 transition-colors"
            >
              {categoryLabel(tool.category)}
            </Link>
            <span>/</span>
            <span className="text-slate-300">{tool.name}</span>
          </nav>

          <header className="glass-card p-8 mb-8">
            <div className="flex items-start gap-5 mb-5">
              <span className="text-6xl shrink-0" aria-hidden="true">{tool.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-2">
                  <h1 className="text-3xl sm:text-4xl font-bold">{tool.name}</h1>
                  {isNew && (
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-pink-500/20 to-fuchsia-500/20 text-pink-300 border border-pink-500/30">
                      NEW
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 flex-wrap text-sm">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      priceColors[tool.price] ?? "bg-white/5 text-slate-300"
                    }`}
                  >
                    {tool.price}
                  </span>
                  <Link
                    href={`/tools?cat=${tool.category}`}
                    className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-brand-500/10 text-brand-300 hover:bg-brand-500/20 transition-colors"
                  >
                    {categoryLabel(tool.category)}
                  </Link>
                  {showStars && (
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-medium flex items-center gap-1 ${starsBadgeClass(stars)}`}
                    >
                      ⭐ {formatStars(stars)}
                      {delta > 0 && (
                        <span className="text-green-400 ml-1">↑+{formatStars(delta)}</span>
                      )}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <p className="text-slate-300 leading-relaxed text-base sm:text-lg mb-5">
              {tool.description}
            </p>

            {tool.useCase && (
              <div className="mb-5 px-4 py-3 rounded-xl bg-brand-500/5 border border-brand-500/20">
                <p className="text-sm text-slate-300 flex items-start gap-2">
                  <span className="text-brand-400 shrink-0">🎯</span>
                  <span>
                    <span className="text-brand-300 font-medium">适用场景：</span>
                    {tool.useCase}
                  </span>
                </p>
              </div>
            )}

            <div className="flex flex-wrap gap-2 mb-6">
              {tool.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2.5 py-1 bg-white/5 rounded-md text-xs text-slate-400"
                >
                  #{tag}
                </span>
              ))}
            </div>

            <div className="flex flex-wrap gap-3">
              <a
                href={tool.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-600 hover:bg-brand-500 rounded-lg font-medium transition-all shadow-lg shadow-brand-500/20"
              >
                访问工具
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
              {tool.learnMore && (
                <a
                  href={tool.learnMore}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg font-medium transition-all text-slate-300"
                >
                  📖 官方文档
                </a>
              )}
              {tool.homepage && tool.homepage !== tool.url && (
                <a
                  href={tool.homepage}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg font-medium transition-all text-slate-300"
                >
                  🌐 官网
                </a>
              )}
            </div>
          </header>

          {hasGitHubMeta(tool) && (
            <section className="glass-card p-6 mb-8">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <span>📊</span> 仓库数据
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {tool.githubStars != null && tool.githubStars > 0 && (
                  <Stat label="Stars" value={tool.githubStars.toLocaleString()} icon="⭐" />
                )}
                {tool.forks != null && tool.forks > 0 && (
                  <Stat label="Forks" value={tool.forks.toLocaleString()} icon="🍴" />
                )}
                {tool.watchers != null && tool.watchers > 0 && (
                  <Stat label="Watchers" value={tool.watchers.toLocaleString()} icon="👀" />
                )}
                {tool.openIssues != null && tool.openIssues > 0 && (
                  <Stat label="Open Issues" value={tool.openIssues.toLocaleString()} icon="🔧" />
                )}
                {tool.language && <Stat label="语言" value={tool.language} icon="🟢" />}
                {tool.license && tool.license !== "null" && (
                  <Stat label="协议" value={tool.license} icon="📄" />
                )}
                {tool.createdAt && (
                  <Stat
                    label="上线"
                    value={new Date(tool.createdAt).toLocaleDateString("zh-CN")}
                    icon="📅"
                  />
                )}
                {tool.updatedAt && (
                  <Stat
                    label="更新"
                    value={new Date(tool.updatedAt).toLocaleDateString("zh-CN")}
                    icon="🔄"
                  />
                )}
              </div>
              {delta !== 0 && (
                <p className="mt-4 text-sm text-slate-500">
                  📈 上次抓取以来{" "}
                  <span className={delta > 0 ? "text-green-400" : "text-red-400"}>
                    {delta > 0 ? "↑+" : "↓"}
                    {delta.toLocaleString()} ⭐
                  </span>
                </p>
              )}
            </section>
          )}

          {(tool.pros?.length || tool.cons?.length) && (
            <section className="grid sm:grid-cols-2 gap-5 mb-8">
              {tool.pros && tool.pros.length > 0 && (
                <div className="glass-card p-6">
                  <h2 className="text-lg font-semibold text-emerald-300 mb-3 flex items-center gap-2">
                    <span>✅</span> 优点
                  </h2>
                  <ul className="space-y-2 text-sm text-slate-300">
                    {tool.pros.map((p, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-emerald-500 shrink-0 mt-0.5">•</span>
                        <span>{p}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {tool.cons && tool.cons.length > 0 && (
                <div className="glass-card p-6">
                  <h2 className="text-lg font-semibold text-red-300 mb-3 flex items-center gap-2">
                    <span>⚠️</span> 限制
                  </h2>
                  <ul className="space-y-2 text-sm text-slate-300">
                    {tool.cons.map((c, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-red-500 shrink-0 mt-0.5">•</span>
                        <span>{c}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </section>
          )}

          {related.length > 0 && (
            <section>
              <h2 className="text-2xl font-bold mb-5 flex items-center gap-2">
                <span>🔗</span> 相关工具
              </h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {related.map((t) => (
                  <ToolCard key={t.id} tool={t} />
                ))}
              </div>
              <div className="mt-8 text-center">
                <Link
                  href="/tools"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg font-medium transition-all text-slate-300"
                >
                  ← 浏览全部 {enrichedTools.length} 个工具
                </Link>
              </div>
            </section>
          )}
        </div>
      </article>

      <Footer />
    </main>
  );
}

function Stat({ label, value, icon }: { label: string; value: string; icon: string }) {
  return (
    <div className="flex flex-col gap-1 px-3 py-2.5 rounded-xl bg-white/[0.03] border border-white/5">
      <span className="text-xs text-slate-500 flex items-center gap-1">
        <span aria-hidden="true">{icon}</span>
        {label}
      </span>
      <span className="text-slate-200 font-medium text-sm">{value}</span>
    </div>
  );
}

function hasGitHubMeta(t: ReturnType<typeof getEnrichedTool>): boolean {
  if (!t) return false;
  return Boolean(
    (t.githubStars != null && t.githubStars > 0) ||
      (t.forks != null && t.forks > 0) ||
      t.language ||
      t.license ||
      t.createdAt ||
      t.updatedAt,
  );
}
