import Link from "next/link";
import { Article } from "@/data/knowledge";

const levelColors: Record<string, string> = {
  入门: "bg-emerald-500/10 text-emerald-300 border-emerald-500/20",
  进阶: "bg-amber-500/10 text-amber-300 border-amber-500/20",
  高级: "bg-rose-500/10 text-rose-300 border-rose-500/20",
};

export default function ArticleCard({ article }: { article: Article }) {
  return (
    <Link
      href={`/article/${article.id}`}
      className="group block p-5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 hover:border-brand-500/40 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-brand-500/10 flex flex-col"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <h3 className="text-lg font-semibold group-hover:text-brand-300 transition-colors leading-snug line-clamp-2">
          {article.title}
        </h3>
        <span
          className={`shrink-0 px-2.5 py-0.5 rounded-full text-xs font-medium border ${levelColors[article.level]}`}
        >
          {article.level}
        </span>
      </div>

      {/* Summary */}
      <p className="text-slate-300 text-sm leading-relaxed mb-4 line-clamp-2 flex-1">
        {article.summary}
      </p>

      {/* Tags */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        {article.tags.map((tag) => (
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
        <span>{article.date}</span>
        <span>📖 {article.readTime}</span>
      </div>
    </Link>
  );
}
