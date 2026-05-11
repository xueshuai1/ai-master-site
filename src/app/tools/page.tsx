import { Suspense } from "react";
import { enrichedTools } from "@/lib/tools-helpers";
import { SITE_URL, itemListSchema } from "@/lib/structured-data";
import JsonLd from "@/components/JsonLd";
import ToolsListClient from "@/components/ToolsListClient";

/**
 * Server Component 壳：负责输出 ItemList JSON-LD（SSR 阶段就写进 HTML），
 * 把真正的交互逻辑下放到 ToolsListClient。
 *
 * 必须用 Suspense 包裹 ToolsListClient，否则 useSearchParams() 会让
 * 整个路由 deopt 到 CSR，导致 JSON-LD 也丢失。
 */
const itemListJsonLd = itemListSchema(
  [...enrichedTools]
    .sort((a, b) => (b.githubStars ?? 0) - (a.githubStars ?? 0))
    .map((t) => ({
      url: `${SITE_URL}/tools/${t.id}`,
      name: t.name,
    })),
);

export default function ToolsPage() {
  return (
    <>
      <JsonLd data={itemListJsonLd} />
      <Suspense fallback={null}>
        <ToolsListClient />
      </Suspense>
    </>
  );
}
