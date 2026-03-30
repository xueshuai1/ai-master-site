# 🚀 标准发布流程

> **重要原则**：任何改动必须先在本地构建测试通过，然后再提交推送！

---

## ❌ 错误流程（禁止）

```bash
# 错误：直接推送，等 Vercel 构建失败再排查
修改代码 → git push → Vercel 构建 ❌ 失败 → 再排查
```

**问题**：
- 浪费 Vercel 构建时间
- 问题发现太晚
- 修复周期长
- 影响部署效率

---

## ✅ 正确流程（必须遵守）

```bash
# 正确：本地构建测试 + 验证通过后再推送
修改代码 → npm run build ✅ → npm run dev ✅ 验证 → git push → Vercel 自动部署
```

**优势**：
- ✅ 问题本地发现
- ✅ 修复快速
- ✅ 确保内容可访问
- ✅ 部署一次成功
- ✅ 节省构建时间

---

## 📋 详细步骤

### 1. 本地修改

```bash
# 修改代码/文档
vim content/knowledge/LLM/002_Self-Attention.md

# 或者使用工具脚本
./scripts/article-tools.sh create LLM "Self-Attention" 002
```

### 2. 本地构建测试（必须！）

```bash
# 执行完整构建
npm run build

# 查看构建输出
# ✅ 看到 "Build completed successfully" 或类似成功信息
# ❌ 如果有错误，立即修复
```

**构建成功标志**：
```
✓ Compiled successfully
✓ Generating static pages
✓ Finalizing page optimization

Route (app)                            Revalidate  Expire
├ ○ /
├ ● /knowledge/[category]/[articleId]
│ └ /knowledge/LLM/001_Transformer
```

### 3. 本地验证（新增文章必须！）

```bash
# 启动本地服务器
npm run dev

# 访问 http://localhost:3000

# 1. 检查分类列表页
访问：http://localhost:3000/knowledge/LLM
验证：能看到新增文章

# 2. 检查文章详情页
访问：http://localhost:3000/knowledge/LLM/002_Self-Attention
验证：文章内容正常显示

# 3. 检查格式
- 标题、摘要显示正常
- 代码高亮正常
- 图表渲染正常
- 表格显示正常

# 验证完成后关闭服务器
Ctrl + C
```

**验证清单**：
- [ ] 分类列表页能找到新文章
- [ ] 文章详情页能正常访问
- [ ] 文章内容完整显示
- [ ] 代码、图表、表格正常渲染
- [ ] 元数据（分类/编号/版本）正确显示

**构建失败处理**：
```bash
# 1. 查看错误信息
npm run build 2>&1 | grep -A5 "Error"

# 2. 根据错误修复代码
vim src/app/xxx/page.tsx

# 3. 重新构建测试
npm run build

# 4. 重复直到构建成功
```

### 4. 提交代码

```bash
# 添加更改
git add -A

# 预提交钩子会自动执行：
# 1. 文章质量检查
# 2. 本地构建测试
# 3. 新增文章可访问性验证（如有新增文章）

# 如果所有检查通过，编写提交信息
git commit -m "类型 (范围): 简短描述

- 详细改动 1
- 详细改动 2

版本：vX.X → vY.Y（如有）"
```

### 5. 推送部署

```bash
# 推送到 GitHub
git push origin main

# Vercel 会自动检测并部署
# 访问 https://vercel.com/dashboard 查看部署状态
```

### 6. 验证部署

```bash
# 部署完成后（2-5 分钟）
# 1. 访问网站查看新内容
curl https://your-site.vercel.app/knowledge/LLM

# 2. 检查页面是否正常
# 3. 如有问题，回滚或修复
```

---

## 🔧 常用检查命令

### 构建前检查

```bash
# 检查文章质量
./scripts/article-tools.sh check

# 查看文章统计
./scripts/article-tools.sh stats

# 如果有错误或警告，先修复
```

### 构建测试

```bash
# 完整构建（推荐）
npm run build

# 开发模式测试（快速）
npm run dev

# 访问 http://localhost:3000 测试
```

### 构建后验证

```bash
# 检查生成的文件
ls -la .next/

# 查看构建报告
cat .next/build-manifest.json
```

---

## 📝 提交信息规范

### 格式

```
类型 (范围): 简短描述

详细改动列表
- 改动 1
- 改动 2

版本：vX.X → vY.Y（如有）
```

### 类型

| 类型 | 说明 | 示例 |
|------|------|------|
| **docs** | 文档更新 | `docs(Transformer): 添加示例` |
| **feat** | 新功能 | `feat(search): 添加搜索功能` |
| **fix** | Bug 修复 | `fix(build): 修复构建错误` |
| **chore** | 日常维护 | `chore: 批量更新时间戳` |
| **refactor** | 重构 | `refactor(category): 改为服务端渲染` |

### 示例

```bash
# 新增文章
git commit -m "docs: 新增 Self-Attention 文章

- 创建完整的文章模板
- 添加代码示例
- 添加 Mermaid 图表

版本：v1.0"

# 更新文章
git commit -m "docs(Transformer): 更新代码示例

- 添加 Python 实现
- 添加位置编码示例
- 更新更新日志

版本：v1.1 → v1.2"

# 修复 Bug
git commit -m "fix(category): 修复分类列表页构建错误

- 移除 styled-jsx（服务器组件不支持）
- 移除 Google Fonts 注入
- 字体在 layout.tsx 中全局配置"

# 批量更新
git commit -m "chore: 批量更新文章时间戳

- 更新所有文章的更新时间
- 检查元数据完整性"
```

---

## 🎯 质量保证

### 必须检查项

```bash
# 1. 本地构建必须通过
npm run build

# 2. 文章质量检查
./scripts/article-tools.sh check

# 3. 查看统计信息
./scripts/article-tools.sh stats
```

### 检查清单

- [ ] 本地构建成功
- [ ] 文章元数据完整（分类/编号/版本/时间）
- [ ] 有更新日志
- [ ] 提交信息规范
- [ ] 版本号正确更新
- [ ] 代码无语法错误
- [ ] Markdown 格式正确

---

## ⚠️ 常见问题

### Q1: 构建失败怎么办？

```bash
# 1. 查看详细错误
npm run build 2>&1 | grep -A10 "Error"

# 2. 根据错误修复
vim 出问题的文件

# 3. 重新构建
npm run build

# 4. 重复直到成功
```

### Q2: Vercel 构建失败？

```bash
# 1. 查看 Vercel 构建日志
# 访问 https://vercel.com/dashboard

# 2. 本地重现错误
npm run build

# 3. 修复后重新提交
git add -A
git commit -m "fix: 修复 Vercel 构建错误"
git push origin main

# 4. 本地必须先测试通过！
```

### Q3: 如何回滚？

```bash
# 回滚到上一个版本
git revert HEAD
git push origin main

# 或者重置到特定提交
git reset --hard <commit-hash>
git push origin main --force
```

---

## 📊 部署监控

### Vercel 仪表板

访问：https://vercel.com/dashboard

**查看**：
- 构建状态（成功/失败）
- 构建时间
- 部署预览
- 生产版本

### 网站验证

```bash
# 访问分类列表
curl https://your-site.vercel.app/knowledge/LLM

# 访问文章详情
curl https://your-site.vercel.app/knowledge/LLM/001_Transformer

# 检查是否正常显示
```

---

## 🎓 最佳实践

### 1. 小步提交

```bash
# ✅ 推荐：小改动，频繁提交
git commit -m "docs: 添加文章头部"
git commit -m "docs: 添加核心概念章节"
git commit -m "docs: 添加代码示例"

# ❌ 不推荐：大改动，一次提交
git commit -m "docs: 完成整篇文章"
```

### 2. 测试驱动

```bash
# 每次修改后都测试
修改 → npm run build → 通过 → 继续修改
修改 → npm run build → 失败 → 修复 → 重新测试
```

### 3. 代码审查

```bash
# 提交前自检
git diff          # 查看改动
./scripts/article-tools.sh check  # 检查质量
npm run build     # 构建测试

# 确认无误后再提交
```

### 4. 版本管理

```bash
# 使用语义化版本
v1.0.0 → v1.1.0  # 添加功能
v1.1.0 → v1.1.1  # 小幅修改
v1.1.1 → v2.0.0  # 重大更新
```

---

## 📋 完整流程示例

### 示例 1：新增文章

```bash
# 1. 创建文章
./scripts/article-tools.sh create LLM "Self-Attention" 002

# 2. 编辑内容
vim content/knowledge/LLM/002_Self-Attention.md

# 3. 本地构建测试
npm run build
# ✅ 构建成功

# 4. 检查质量
./scripts/article-tools.sh check
# ✅ 检查通过

# 5. 提交
git add -A
git commit -m "docs: 新增 Self-Attention 文章

- 创建完整的文章模板
- 添加代码示例
- 添加 Mermaid 图表

版本：v1.0"

# 6. 推送
git push origin main

# 7. 验证部署
# 访问 Vercel 查看部署状态
# 2-5 分钟后访问网站查看
```

### 示例 2：修复 Bug

```bash
# 1. 发现问题
# Vercel 构建失败：styled-jsx 不支持

# 2. 本地修复
vim src/app/knowledge/[category]/page.tsx
# 移除 styled-jsx 代码

# 3. 本地构建测试
npm run build
# ✅ 构建成功

# 4. 提交
git add -A
git commit -m "fix(category): 修复构建错误

- 移除 styled-jsx（服务器组件不支持）
- 移除 Google Fonts 注入"

# 5. 推送
git push origin main

# 6. 验证
# Vercel 自动部署成功
```

---

## 🔐 发布检查清单

发布前必须完成：

- [ ] **本地构建成功** (`npm run build`)
- [ ] **文章质量检查通过** (`./scripts/article-tools.sh check`)
- [ ] **元数据完整**（分类/编号/版本/时间）
- [ ] **有更新日志**
- [ ] **提交信息规范**
- [ ] **版本号正确更新**
- [ ] **代码无语法错误**
- [ ] **Markdown 格式正确**

---

**流程版本**: v1.0  
**最后更新**: 2026-03-30  
**维护人**: AI Team

**记住：本地构建测试通过是发布的必要条件！** ✅
