import Link from "next/link";
import { Article } from "@/data/knowledge";
import dynamic from "next/dynamic";

const CardStats = dynamic(() => import("@/components/CardStats"), { ssr: false });

const levelColors: Record<string, string> = {
  入门: "bg-emerald-500/10 text-emerald-300 border-emerald-500/20",
  进阶: "bg-amber-500/10 text-amber-300 border-amber-500/20",
  高级: "bg-rose-500/10 text-rose-300 border-rose-500/20",
};

/** Check if the article date (YYYY-MM-DD) is within 24 hours of now */
function isRecentlyPublished(dateStr: string): boolean {
  const articleTime = new Date(dateStr).getTime();
  const now = Date.now();
  return now - articleTime <= 24 * 60 * 60 * 1000;
}

export default function ArticleCard({ article }: { article: Article }) {
  const isNew = isRecentlyPublished(article.date);
  return (
    <Link
      href={`/article/${article.id}`}
      className="group glass-card glass-card-hover block p-5 flex flex-col"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <h3 className="text-lg font-semibold group-hover:text-brand-300 transition-colors leading-snug line-clamp-2">
          {article.title}
        </h3>
        <div className="flex items-center gap-1.5 shrink-0">
          {isNew && (
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-red-500/20 text-red-300 border border-red-500/30 animate-pulse">
              NEW
            </span>
          )}
          {article.learningPath?.routeId && (
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-brand-500/20 text-brand-300 border border-brand-500/30">
              📖 系列
            </span>
          )}
          <span
            className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${levelColors[article.level]}`}
          >
            {article.level}
          </span>
        </div>
      </div>

      {/* Summary */}
      <p className="text-slate-300 text-sm leading-relaxed mb-4 line-clamp-2 flex-1">
        {article.summary}
      </p>

      {/* Tags */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        {article.tags.slice(0, 3).map((tag) => (
          <span
            key={tag}
            className="px-2 py-0.5 bg-white/5 rounded-md text-xs text-slate-400"
          >
            #{tag}
          </span>
        ))}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between text-xs text-slate-500 pt-3 border-t border-white/5">
        <span className="flex items-center gap-1.5">
          <span>{article.date}</span>
          {article.updatedAt && (
            <span className="text-amber-400" title={`更新于 ${article.updatedAt}`}>
              🔄 {article.updatedAt}
            </span>
          )}
        </span>
        <div className="flex items-center gap-3">
          <CardStats type="article" id={article.id} />
          <span>📖 {article.readTime}</span>
        </div>
      </div>
    </Link>
  );
}
