import { articles, ArticleSection } from "@/data/knowledge";
import Link from "next/link";
import { notFound } from "next/navigation";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import ReadingProgressBar from "@/components/ReadingProgressBar";
import MermaidChart from "@/components/MermaidChart";
import ArticleTocSidebar from "@/components/ArticleTocSidebar";
import { marked } from "marked";

marked.setOptions({ breaks: true, gfm: true });

const levelColors: Record<string, string> = {
  入门: "bg-emerald-500/10 text-emerald-300 border-emerald-500/20",
  进阶: "bg-amber-500/10 text-amber-300 border-amber-500/20",
  高级: "bg-rose-500/10 text-rose-300 border-rose-500/20",
};

const categoryIcons: Record<string, string> = {
  ml: "📊",
  dl: "🧠",
  nlp: "💬",
  cv: "👁️",
  llm: "🤖",
  agent: "🦾",
};

const categoryNames: Record<string, string> = {
  ml: "机器学习",
  dl: "深度学习",
  nlp: "自然语言处理",
  cv: "计算机视觉",
  llm: "大语言模型",
  agent: "AI Agent",
};

function getRelatedArticles(currentId: string, category: string) {
  return articles
    .filter((a) => a.category === category && a.id !== currentId)
    .slice(0, 3);
}

function generateContent(article: (typeof articles)[0]) {
  // If the article has real content, use it directly
  if (article.content && article.content.length > 0) {
    return article.content.map((section) => ({ title: section.title, section }));
  }

  // Fallback: generate placeholder content for articles without content
  const sections: { title: string; section?: never; body: string }[] = [];

  sections.push({
    title: "概述",
    body: article.summary +
      "。本文将从基础概念讲起，逐步深入到核心原理和实战应用，帮助你全面理解这一技术。",
  });

  switch (article.category) {
    case "ml":
      sections.push({ title: "核心概念", body: `在机器学习中，${article.title.replace(/：.*/, "")}是最基础也是最重要的概念之一。理解其数学原理对于掌握后续的算法至关重要。` });
      sections.push({ title: "数学原理", body: "机器学习算法的本质是优化问题。通过定义损失函数，我们寻找最优的参数使得模型在训练数据上的表现最佳。常见的优化方法包括梯度下降法、牛顿法等。" });
      sections.push({ title: "代码实现", body: "在实际编码中，我们通常使用 scikit-learn 等成熟的机器学习库来快速实现算法。关键步骤包括：数据预处理、模型选择、训练、评估和调参。" });
      break;
    case "dl":
      sections.push({ title: "核心概念", body: `深度学习通过多层神经网络学习数据的层次化表示。${article.title.replace(/：.*/, "")}是深度学习中不可或缺的一环。` });
      sections.push({ title: "架构设计", body: "深度网络的架构设计是一门艺术。层数、激活函数选择、连接方式等都会影响模型的性能。" });
      sections.push({ title: "训练技巧", body: "训练深度网络需要掌握多种技巧：学习率调度、权重初始化、Batch Normalization、Dropout 正则化等。" });
      break;
    case "nlp":
      sections.push({ title: "核心概念", body: `自然语言处理致力于让计算机理解和生成人类语言。${article.title.replace(/：.*/, "")}是 NLP 领域的关键技术。` });
      sections.push({ title: "文本表示", body: "从 one-hot 编码到词向量，再到上下文感知的预训练模型（BERT、GPT），文本表示的能力不断提升。" });
      sections.push({ title: "应用场景", body: "NLP 技术广泛应用于机器翻译、情感分析、文本摘要、问答系统等场景。" });
      break;
    case "cv":
      sections.push({ title: "核心概念", body: `计算机视觉让机器能够「看」和理解图像。${article.title.replace(/：.*/, "")}是 CV 领域的核心任务之一。` });
      sections.push({ title: "关键技术", body: "卷积神经网络（CNN）是计算机视觉的基石。通过卷积层提取特征、池化层降维、全连接层分类。" });
      sections.push({ title: "实战应用", body: "CV 技术已广泛应用于自动驾驶、医疗影像分析、工业质检、人脸识别等领域。" });
      break;
    case "llm":
      sections.push({ title: "核心概念", body: `大语言模型是近年来 AI 领域最引人注目的突破。${article.title.replace(/：.*/, "")}是理解和应用大语言模型的关键。` });
      sections.push({ title: "训练管线", body: "大语言模型的训练包含：大规模语料预训练、指令微调（SFT）、基于人类反馈的强化学习（RLHF）。" });
      sections.push({ title: "应用实践", body: "大语言模型应用于文本生成、代码编写、数据分析、对话系统等。通过 Prompt Engineering、RAG、Fine-tuning 等技术优化效果。" });
      break;
    case "agent":
      sections.push({ title: "核心概念", body: `AI Agent 是能够自主感知、规划、决策和执行任务的智能体。${article.title.replace(/：.*/, "")}是构建高效 AI Agent 的重要基础。` });
      sections.push({ title: "架构设计", body: "一个完整的 AI Agent 通常包含：感知模块、记忆模块、规划模块、执行模块。各模块协同决定了 Agent 的整体能力。" });
      sections.push({ title: "最佳实践", body: "构建实用的 AI Agent 需要考虑：任务分解策略、工具选择机制、错误处理与回退、多步推理能力。" });
      break;
  }

  sections.push({
    title: "总结与展望",
    body: `通过本文的学习，你应该对${article.title.replace(/：.*/, "")}有了全面的理解。AI 领域发展日新月异，持续学习和实践是保持竞争力的关键。`,
  });

  return sections;
}

/** Render a single rich content section */
function ArticleSectionContent({ section, headingId }: { section: ArticleSection; headingId?: string }) {
  // If title starts with "N. " or "N、", extract the number for the badge
  const numMatch = section.title.match(/^(\d+)[.、]\s*/);
  const badgeNum = numMatch ? numMatch[1] : '';
  const cleanTitle = numMatch ? section.title.replace(/^\d+[.、]\s*/, '') : section.title;

  return (
    <div className="mb-10">
      <h2 id={headingId} className="text-2xl font-bold mb-4 flex items-center gap-3 scroll-mt-24">
        {badgeNum && (
          <span className="w-8 h-8 rounded-lg bg-brand-500/10 text-brand-400 flex items-center justify-center text-sm font-bold">
            {badgeNum}
          </span>
        )}
        {cleanTitle}
      </h2>

      {section.body && (
        <div className="prose prose-invert max-w-none text-base sm:text-lg mb-4 overflow-x-auto
          prose-p:text-slate-300 prose-p:leading-relaxed prose-p:my-3
          prose-strong:text-white prose-strong:font-semibold
          prose-code:text-pink-300 prose-code:bg-white/5 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:before:content-none prose-code:after:content-none
          prose-a:text-brand-400 hover:prose-a:underline
          [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1.5 [&_ul]:text-slate-300
          [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:space-y-1.5 [&_ol]:text-slate-300
          [&_li]:leading-relaxed
          [&_p]:break-words [&_p]:whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: marked.parse(section.body) as string }} />
      )}

      {section.code && section.code.length > 0 && (
        <div className="space-y-4 my-6">
          {section.code.map((block, idx) => (
            <div key={idx} className="rounded-xl overflow-hidden bg-slate-900/80 border border-white/10">
              <div className="flex items-center justify-between px-4 py-2 bg-white/5 text-sm text-slate-400">
                <span className="font-mono">{block.lang}</span>
                {block.filename && <span>{block.filename}</span>}
              </div>
              <pre className="p-4 overflow-x-auto text-sm">
                <code className="text-slate-300 font-mono whitespace-pre">{block.code}</code>
              </pre>
            </div>
          ))}
        </div>
      )}

      {section.mermaid && (
        <div className="my-6 p-6 rounded-xl bg-white/5 border border-white/10">
          <MermaidChart chart={section.mermaid} />
        </div>
      )}

      {section.table && (
        <div className="my-6 overflow-x-auto rounded-xl border border-white/10">
          <table className="w-full text-sm">
            <thead className="bg-white/5">
              <tr>
                {section.table.headers.map((h, i) => (
                  <th key={i} className="px-4 py-3 text-left font-semibold text-slate-200 border-b border-white/10">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {section.table.rows.map((row, ri) => (
                <tr key={ri} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  {row.map((cell, ci) => (
                    <td key={ci} className="px-4 py-3 text-slate-300 prose prose-invert prose-sm max-w-none
                      prose-strong:text-white prose-strong:font-semibold
                      prose-code:text-pink-300 prose-code:bg-white/5 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:before:content-none prose-code:after:content-none
                      [&_p]:my-0 [&_p]:inline" dangerouslySetInnerHTML={{ __html: marked.parse(cell) as string }} />
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {section.list && section.list.length > 0 && (
        <ul className="my-4 space-y-2">
          {section.list.map((item, i) => (
            <li key={i} className="flex items-start gap-2 text-slate-300 leading-relaxed">
              <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-brand-400 flex-shrink-0" />
              <span dangerouslySetInnerHTML={{ __html: marked.parse(item) as string }} />
            </li>
          ))}
        </ul>
      )}

      {section.tip && (
        <div className="my-4 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-sm prose prose-invert max-w-none
          prose-strong:text-white prose-strong:font-semibold
          prose-code:text-pink-300 prose-code:bg-white/5 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:before:content-none prose-code:after:content-none
          [&_p]:my-0 [&_p]:text-emerald-300" dangerouslySetInnerHTML={{ __html: `💡 ${marked.parse(section.tip) as string}` }} />
      )}

      {section.warning && (
        <div className="my-4 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-sm prose prose-invert max-w-none
          prose-strong:text-white prose-strong:font-semibold
          prose-code:text-pink-300 prose-code:bg-white/5 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:before:content-none prose-code:after:content-none
          [&_p]:my-0 [&_p]:text-amber-300" dangerouslySetInnerHTML={{ __html: `⚠️ ${marked.parse(section.warning) as string}` }} />
      )}
    </div>
  );
}

export function generateStaticParams() {
  return articles.map((article) => ({
    id: article.id,
  }));
}

export function generateMetadata({ params }: { params: { id: string } }) {
  const article = articles.find((a) => a.id === params.id);
  if (!article) {
    return { title: "文章不存在 - AI Master" };
  }
  return {
    title: `${article.title} - AI Master`,
    description: article.summary,
    keywords: article.tags.join(", "),
  };
}

export default function ArticlePage({ params }: { params: { id: string } }) {
  const article = articles.find((a) => a.id === params.id);

  if (!article) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-brand-950 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">📄</div>
          <h1 className="text-2xl font-bold mb-2">文章不存在</h1>
          <p className="text-slate-400 mb-6">该文章可能已被删除或链接有误</p>
          <Link href="/knowledge" className="px-6 py-3 bg-brand-600 hover:bg-brand-500 rounded-xl font-medium transition-all">
            返回知识库
          </Link>
        </div>
      </main>
    );
  }

  const relatedArticles = getRelatedArticles(article.id, article.category);
  const content = generateContent(article);
  const categoryIcon = categoryIcons[article.category] || "📄";
  const categoryName = categoryNames[article.category] || article.category;

  // Generate TOC from content sections
  const toc = content.map((item, i) => ({
    id: `section-${i}`,
    title: item.title,
  }));

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-brand-950 text-white">
      <ReadingProgressBar />
      <Navbar />

      {/* Article Header */}
      <section className="pt-28 pb-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-2 text-sm text-slate-400 mb-6">
            <Link href="/" className="hover:text-slate-300 transition-colors">首页</Link>
            <span>/</span>
            <Link href="/knowledge" className="hover:text-slate-300 transition-colors">知识库</Link>
            <span>/</span>
            <span className="text-slate-400 truncate">{article.title}</span>
          </div>

          <div className="flex items-center gap-3 mb-4 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-brand-500/10 text-brand-300 rounded-full text-sm font-medium">
              {categoryIcon} {categoryName}
            </span>
            <span className={`px-3 py-1 rounded-full text-sm font-medium border ${levelColors[article.level]}`}>
              {article.level}
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6 leading-tight">
            {article.title}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-sm text-slate-400 mb-8 pb-8 border-b border-white/5">
            <span>📅 {article.date}</span>
            <span>📖 {article.readTime} 阅读</span>
            <span>🏷️ {article.tags.map((t) => `#${t}`).join(" ")}</span>
          </div>
        </div>
      </section>

      {/* Article Content */}
      <section className="px-4 sm:px-6 lg:px-8 pb-16">
        <div className="max-w-6xl mx-auto">
          <div className="flex gap-8">
            {/* Main Content */}
            <div className="flex-1 min-w-0 max-w-4xl">
              <div className="p-6 rounded-2xl bg-brand-500/5 border border-brand-500/20 mb-12">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">💡</span>
                  <div>
                    <h3 className="font-semibold text-brand-300 mb-2">文章摘要</h3>
                    <p className="text-slate-300 leading-relaxed">{article.summary}</p>
                  </div>
                </div>
              </div>

              <article>
              {content.map((item, i) => {
                // Article has real rich content
                if (item.section) {
                  return (
                    <ArticleSectionContent key={i} section={item.section} headingId={`section-${i}`} />
                    );
                }
                // Fallback: generic placeholder content
                return (
                  <div key={i} className="mb-10">
                    <h2 id={`section-${i}`} className="text-2xl font-bold mb-4 flex items-center gap-3 scroll-mt-24">
                      <span className="w-8 h-8 rounded-lg bg-brand-500/10 text-brand-400 flex items-center justify-center text-sm font-bold">
                        {i + 1}
                      </span>
                      {item.title}
                    </h2>
                    <p className="text-slate-300 leading-relaxed text-base sm:text-lg">
                      {item.body}
                    </p>
                  </div>
                );
              })}
              </article>

              <div className="mt-12 pt-8 border-t border-white/5">
                <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">标签</h3>
                <div className="flex flex-wrap gap-2">
                  {article.tags.map((tag) => (
                    <span key={tag} className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/5 rounded-full text-sm text-slate-300 transition-colors cursor-pointer">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* TOC Sidebar */}
            <ArticleTocSidebar toc={toc} />
          </div>
        </div>
      </section>

      {/* Related Articles */}
      {relatedArticles.length > 0 && (
        <section className="px-4 sm:px-6 lg:px-8 pb-20">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-2xl font-bold mb-8">📚 相关文章推荐</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {relatedArticles.map((rel) => (
                <Link
                  key={rel.id}
                  href={`/article/${rel.id}`}
                  className="group p-5 rounded-2xl bg-white/5 border border-white/5 hover:border-brand-500/30 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-brand-500/5"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">{categoryIcons[rel.category]}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${levelColors[rel.level]}`}>
                      {rel.level}
                    </span>
                  </div>
                  <h3 className="text-base font-semibold group-hover:text-brand-300 transition-colors leading-snug line-clamp-2 mb-2">
                    {rel.title}
                  </h3>
                  <p className="text-slate-400 text-sm line-clamp-2">{rel.summary}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="px-4 sm:px-6 lg:px-8 pb-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center p-10 rounded-3xl bg-gradient-to-r from-brand-600/10 to-accent-600/10 border border-brand-500/20">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4">继续你的 AI 学习之旅</h2>
            <p className="text-slate-400 mb-8 max-w-lg mx-auto">浏览更多 AI 知识库文章，或者探索实用的 AI 工具</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/knowledge" className="px-8 py-3 bg-brand-600 hover:bg-brand-500 rounded-xl font-semibold transition-all hover:shadow-lg hover:shadow-brand-500/25 hover:-translate-y-0.5">
                📚 浏览知识库
              </Link>
              <Link href="/tools" className="px-8 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl font-semibold transition-all hover:-translate-y-0.5">
                🛠️ 探索工具集
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
