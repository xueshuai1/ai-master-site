import Link from "next/link";

const footerLinks = {
  learning: [
    { label: "📊 机器学习", href: "/knowledge?cat=ml" },
    { label: "🧠 深度学习", href: "/knowledge?cat=dl" },
    { label: "💬 NLP", href: "/knowledge?cat=nlp" },
    { label: "👁️ 计算机视觉", href: "/knowledge?cat=cv" },
  ],
  about: [
    { label: "关于我们", href: "/about" },
    { label: "技术博客", href: "/blog" },
    { label: "AI 工具", href: "/tools" },
  ],
};

export default function Footer() {
  return (
    <footer className="py-12 px-4 sm:px-6 lg:px-8 border-t border-white/5">
      <div className="max-w-7xl mx-auto">
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-8 mb-10">
          {/* Brand */}
          <div className="sm:col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <span className="text-2xl">🍪</span>
              <span className="text-xl font-bold text-gradient">AI Master</span>
            </Link>
            <p className="text-slate-400 text-sm leading-relaxed max-w-xs">
              AI Master 致力于成为最优质的中文 AI 学习平台，让每个人都能掌握人工智能技术。
            </p>
          </div>

          {/* Learning */}
          <div>
            <h4 className="font-semibold mb-4 text-sm uppercase tracking-wider text-slate-300">
              学习资源
            </h4>
            <ul className="space-y-2.5">
              {footerLinks.learning.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-slate-400 hover:text-white text-sm transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* About */}
          <div>
            <h4 className="font-semibold mb-4 text-sm uppercase tracking-wider text-slate-300">
              关于
            </h4>
            <ul className="space-y-2.5">
              {footerLinks.about.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-slate-400 hover:text-white text-sm transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>


        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-slate-500 text-sm">
            © 2026 AI Master. All rights reserved. Built with ❤️ and AI.
          </p>
          <div className="flex items-center gap-4">
          </div>
        </div>
      </div>
    </footer>
  );
}
