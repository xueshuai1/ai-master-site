import type { ArticleSection } from "@/data/knowledge";

/**
 * Converts an ArticleSection array to standard Markdown format.
 * Used by CopyMarkdownButton to let users copy full article as MD.
 */
export function sectionsToMarkdown(
  title: string,
  summary: string,
  sections: ArticleSection[]
): string {
  const parts: string[] = [];

  parts.push(`# ${title}\n`);
  if (summary) {
    parts.push(`> ${summary}\n`);
  }

  for (const section of sections) {
    try {
      parts.push(`## ${section.title}\n`);

      if (section.body) {
        parts.push(section.body.trim());
        parts.push("");
      }

      if (section.body2) {
        parts.push(section.body2.trim());
        parts.push("");
      }

      if (section.list && section.list.length > 0) {
        for (const item of section.list) {
          parts.push(`- ${item}`);
        }
        parts.push("");
      }

      if (section.code && section.code.length > 0) {
        for (const block of section.code) {
          // 代码内容若含反引号，用 4 个反引号包裹避免破坏围栏
          const fence = block.code.includes("```") ? "````" : "```";
          const header = block.filename
            ? `${fence}${block.lang} title="${block.filename}"`
            : `${fence}${block.lang}`;
          parts.push(header);
          parts.push(block.code.trim());
          parts.push(fence);
          parts.push("");
        }
      }

      if (section.mermaid) {
        // 全角 ％ 还原为 % 供标准 Mermaid 渲染器使用
        const mermaidContent = section.mermaid.trim().replace(/％/g, "%");
        parts.push("```mermaid");
        parts.push(mermaidContent);
        parts.push("```");
        parts.push("");
      }

      if (section.table) {
        const { headers, rows } = section.table;
        const sep = headers.map(() => "---");
        parts.push(`| ${headers.join(" | ")} |`);
        parts.push(`| ${sep.join(" | ")} |`);
        for (const row of rows) {
          parts.push(`| ${row.join(" | ")} |`);
        }
        parts.push("");
      }

      if (section.tip) {
        parts.push(`> 💡 **提示：** ${section.tip}`);
        parts.push("");
      }

      if (section.warning) {
        parts.push(`> ⚠️ **注意：** ${section.warning}`);
        parts.push("");
      }
    } catch {
      // 单个 section 转换失败时跳过，不影响其余内容
      parts.push(`## ${section.title ?? "(内容解析失败)"}\n`);
    }
  }

  const sourceUrl = typeof window !== "undefined"
    ? window.location.href
    : "";

  const footer = [
    "---",
    `> 本文来源：[AI Master](https://www.ai-master.cc)${sourceUrl ? ` · ${sourceUrl}` : ""}`,
  ].join("\n");

  return parts.join("\n").replace(/\n{3,}/g, "\n\n").trim() + "\n\n" + footer;
}
