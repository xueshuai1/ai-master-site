⏰ 写入时间：2026-05-16 22:00 (Asia/Shanghai)
🐛 修复：3 个 bug
  - b1: ai-security-015 使用了无效分类 key "ai-security" → 改为 "practice"
  - b2: blog-182.ts 代码块中 `${meeting.summary}` 被 TS 模板字符串当作插值解析 → 转义
  - b3: blog-182.ts mermaid 中包含 4 个 `%` 字符（会解析为注释）→ 替换为全角 `％`
✨ 新增：0 个功能
🔧 优化：0 项
已知问题：无
