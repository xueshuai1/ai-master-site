⏰ 写入时间：2026-05-09 18:00 (Asia/Shanghai)
🐛 修复：3 个 bug（QA 扫描脚本误报修复）
✨ 新增：0 个功能
🔧 优化：4 项

## 修复详情

### b1: coding-output-001.ts HTML 标签误报
- **根因：** QA 的 `stripCodeBlocks` 用简单正则剥离代码块，遇到代码内容中的反引号提前终止
- **修复：** 重写为 `removeAllTemplateLiterals` 字符级扫描，正确处理所有模板字面量（含 `\`` 转义）

### b2: blog-141.ts Mermaid 浅色误报
- **根因：** "Mermaid 浅色" 检查扫描整个文件，匹配到 CSS 代码中的颜色
- **修复：** 改为仅扫描 `mermaid:` 块内部

### b3: blog-141.ts HTML 标签误报
- **根因：** 正文中 `\`<p>\`` 是转义反引号包裹的引用，但 QA 剥离只处理真反引号
- **修复：** 增强反引号剥离，同时处理转义反引号

## 额外修复
- `validate-article.mjs` 支持 `content` 简写语法（之前只匹配 `content: [` 或 `content,`）

## 验证结果
- QA 扫描：2159/0/0 ✅
- Build：通过 ✅
- TypeScript：通过 ✅

已知问题：无
