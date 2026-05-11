/**
 * 输出 schema.org JSON-LD 的 <script>。
 *
 * Server Component（不带 "use client"），可被 metadata 之外的任意页面引用。
 * 单个对象或对象数组都接受。
 */
interface JsonLdProps {
  data: Record<string, unknown> | Record<string, unknown>[];
}

export default function JsonLd({ data }: JsonLdProps) {
  // 转义关闭脚本标签的极端字符串（避免 "</script>" 出现在 JSON 里破坏页面）
  const json = JSON.stringify(data).replace(/</g, "\\u003c");
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: json }}
    />
  );
}
