⏰ 写入时间：2026-05-06 18:04 (Asia/Shanghai)
🐛 修复：3 个 build 语法错误 bug
✨ 新增：0 个功能
🔧 优化：0 项
已知问题：无

## 修复详情
- **b1**: ai-security-013 section2 mermaid 块嵌入 body 模板字符串内 → 提取为独立 mermaid 属性
- **b2**: ai-security-013 section6 mermaid 块嵌入 body 模板字符串内 → 提取为独立 mermaid 属性  
- **b3**: blog-124 section4 mermaid 块嵌入 body 模板字符串内 → 提取为独立 mermaid 属性

## 根因
PM 写作时 mermaid 图被错误地放在 body 字段内部而非作为独立的 mermaid 字段，导致 JS 语法解析失败。

## 验证
- Build: ✅ 通过（939 路由全部生成）
- TypeScript: ✅ 零错误
- 数据校验: ✅ 292 篇文章通过
