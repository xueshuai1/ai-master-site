⏰ 写入时间：2026-05-10 06:02 (Asia/Shanghai)
🐛 修复：7 个 bug
  - b1: news.ts 5 个条目 content 字段字面换行符（双引号字符串被劈成多行）→ 脚本批量修复
  - b2: voice-005.ts 4 处 tip/warning 双引号字符串内含未转义双引号 → 替换为单引号
  - b3: voice-005.ts body 模板 literal 内含 triple backtick 提前终止字符串 → 替换为缩进代码块
  - b4: voice-005.ts 缺少 mermaid 图表 → 补充 2 个 mermaid（管线架构图 + 全双工状态机）
  - b5: voice-005.ts mermaid 颜色对比度不达标 → #00C853→#1B5E20, #FF1744→#B71C1C
  - b6: blog-143.ts mermaid 含半角百分号 → 替换为全角 ％
✨ 新增：0 个功能（本轮为 bug 修复轮）
🔧 优化：1 项 — 写了 fix-news-newlines.mjs 脚本可复用于未来同类问题
已知问题：无（bug-hash 全部清零）
