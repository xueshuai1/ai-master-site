⏰ 写入时间：2026-05-17 06:00 (Asia/Shanghai)
🐛 修复：3 个 bug
  - b1: news.ts 内容中的反引号代码块未转义导致 build 失败（news-1953/news-1954）
  - b2: aieng-031.ts mermaid 中 % 字符导致解析错误（3处→全角％）
  - b3: blog-184.ts mermaid 中 % 字符 + 对比度不达标（4处→全角％，#0891b2→#1e3a5f）
✨ 新增：0 个功能
🔧 优化：0 项
已知问题：aieng-031.ts mermaid gantt 类型不推荐用于中文（仅警告，非阻断）
