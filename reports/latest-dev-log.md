⏰ 写入时间：2026-05-12 02:08 (Asia/Shanghai)
🐛 修复：2 个 bug
  - b1: GitHubRepoStats.language 类型不兼容 null 值 → 改为 string|null
  - b2: GitHubRepoStats.createdAt/updatedAt 类型不兼容 null 值 → 改为 string|null
✨ 新增：4 个功能
  - ToolCard 组件（工具卡片展示）
  - Paginator 组件（分页器，>7页自动折叠）
  - tools-helpers 工具库（enrichTool/formatStars/starsBadge/relatedTools/categoryLabel）
  - useDebounced hook（高频事件降频）
🔧 优化：3 项
  - Tool 接口扩展：watchers/license/homepage/openIssues/topics/altToLikes/delta/previousStars
  - SoftwareApplication Schema 支持（工具详情页 SEO）
  - GitHubRepoStats 接口完善（全部 nullable 字段声明）
已知问题：无
