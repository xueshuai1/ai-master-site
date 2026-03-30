# 🎉 完整的文章管理系统

> 从存储、读取、更新到发布的完整解决方案

---

## 📊 系统架构

### 1. 存储机制

```
content/knowledge/
├── LLM/
│   ├── 001_Transformer.md              # 文章文件
│   ├── 001_Transformer.history.md      # 历史版本（可选）
│   └── README.md                       # 分类说明
├── ML/
├── DL/
└── ...
```

### 2. 渲染机制

| 页面类型 | 渲染方式 | 更新机制 | 数据来源 |
|---------|---------|---------|---------|
| **分类列表** | SSG + ISR | 每小时自动更新 | 直接读取 Markdown 文件 ✅ |
| **文章详情** | SSG + ISR | 每小时自动更新 | 直接读取 Markdown 文件 ✅ |
| **首页** | SSG | 构建时生成 | 硬编码 |

### 3. 发布流程

```
修改代码/文档
    ↓
本地构建测试 (npm run build) ← 必须！
    ↓
✅ 构建成功
    ↓
提交代码 (git commit)
    ↓
推送到 GitHub (git push)
    ↓
Vercel 自动部署
    ↓
2-5 分钟后生效
```

---

## 🛠️ 工具脚本

### scripts/article-tools.sh

**功能**：
- `create` - 创建新文章（自动生成模板）
- `update` - 更新文章（自动更新时间/版本号）
- `stats` - 显示文章统计
- `check` - 检查文章质量
- `changelog` - 添加更新日志
- `archive` - 归档文章

**示例**：
```bash
# 创建新文章
./scripts/article-tools.sh create LLM "Self-Attention" 002

# 更新文章
./scripts/article-tools.sh update content/knowledge/LLM/001_Transformer.md

# 查看统计
./scripts/article-tools.sh stats

# 质量检查
./scripts/article-tools.sh check
```

### .git/hooks/pre-commit

**作用**：Git 预提交钩子，自动执行检查

**功能**：
1. 检查文章质量（如果有 Markdown 文件改动）
2. 执行本地构建测试
3. 构建失败则阻止提交

**自动触发**：
```bash
git commit
# 自动运行预提交检查
# ✅ 通过 → 提交成功
# ❌ 失败 → 阻止提交
```

---

## 📝 文档规范

### 元数据格式

```markdown
# 文章标题

> **分类**: 大语言模型 | **编号**: LLM-001 | **更新时间**: 2026-03-30 | **难度**: ⭐⭐⭐
> **版本**: v1.2 | **作者**: AI Team | **审核状态**: ✅

`标签 1` `标签 2` `标签 3`

**摘要**: 50-100 字的摘要内容...

---

## 更新日志

- **v1.2** (2026-03-30) - 更新代码示例
- **v1.1** (2026-03-28) - 添加图表
- **v1.0** (2026-03-25) - 初始版本
```

### 版本控制

```
v主版本。次版本。修订版本

例如：v1.2.3
- 主版本：重大更新（架构变化）
- 次版本：功能更新（添加内容）
- 修订版本：小幅修改（错别字、格式）
```

---

## 🚀 使用流程

### 创建新文章

```bash
# 1. 创建文章
./scripts/article-tools.sh create LLM "Self-Attention" 002

# 2. 编辑内容
vim content/knowledge/LLM/002_Self-Attention.md

# 3. 本地构建测试
npm run build
# ✅ 构建成功

# 4. 提交
git add -A
git commit -m "docs: 新增 Self-Attention 文章"
git push origin main

# 5. 验证部署
# 访问 Vercel 查看部署状态
```

### 更新文章

```bash
# 1. 编辑文章
vim content/knowledge/LLM/001_Transformer.md

# 2. 自动更新时间和版本
./scripts/article-tools.sh update content/knowledge/LLM/001_Transformer.md

# 3. 添加更新日志
./scripts/article-tools.sh changelog content/knowledge/LLM/001_Transformer.md "添加代码示例"

# 4. 本地构建测试
npm run build
# ✅ 构建成功

# 5. 提交
git add -A
git commit -m "docs(Transformer): 添加代码示例
版本：v1.1 → v1.2"
git push origin main
```

---

## ✅ 质量保证

### 预提交检查（自动）

```bash
git commit
# 自动触发预提交钩子
# 1. 检查文章质量
# 2. 执行本地构建
# ✅ 通过 → 提交
# ❌ 失败 → 阻止提交
```

### 发布检查清单（手动）

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

## 📊 统计分析

### 查看统计

```bash
./scripts/article-tools.sh stats
```

**输出示例**：
```
=== AI 知识库文章统计 ===

📚 文章总数：10 篇

📊 按分类统计:
  - 大语言模型 (LLM): 5 篇
  - 机器学习基础 (ML): 3 篇
  - 深度学习 (DL): 2 篇

🔄 版本分布:
  - v1.x: 8 篇
  - v2.x: 2 篇

🕐 最近 7 天更新:
- 001_Transformer.md
- 002_Self-Attention.md

📝 质量检查:
  - 有更新日志：8/10 (80%)
  - 有版本号：10/10 (100%)
  - 有更新时间：10/10 (100%)
```

### 质量检查

```bash
./scripts/article-tools.sh check
```

**检查项**：
- ✅ 是否有标题
- ✅ 是否有分类信息
- ✅ 是否有更新时间
- ⚠️ 是否有版本号（警告）
- ⚠️ 是否有更新日志（警告）

---

## 🎯 最佳实践

### 1. 小步提交

```bash
# ✅ 推荐
git commit -m "docs: 添加文章头部"
git commit -m "docs: 添加核心概念章节"
git commit -m "docs: 添加代码示例"

# ❌ 不推荐
git commit -m "docs: 完成整篇文章"
```

### 2. 测试驱动

```bash
# 每次修改后都测试
修改 → npm run build → 通过 → 继续修改
修改 → npm run build → 失败 → 修复 → 重新测试
```

### 3. 提交信息规范

```bash
# ✅ 推荐
docs(Transformer): 更新代码示例

- 添加 Python 实现
- 添加使用示例

版本：v1.1 → v1.2

# ❌ 不推荐
更新文章
修改内容
```

---

## 📚 相关文档

- 📖 [文章管理规范](./ARTICLE-MANAGEMENT.md) - 完整的规范文档
- 🚀 [快速使用指南](./QUICK-START.md) - 快速入门
- 🛠️ [标准发布流程](./RELEASE-PROCESS.md) - 发布规范
- 🔧 [管理脚本](../scripts/article-tools.sh) - 自动化工具

---

## 🔐 核心原则

### ✅ 必须遵守

1. **本地构建测试**：任何改动必须先在本地构建测试
2. **构建通过再推送**：构建成功后才能提交推送
3. **禁止直接推送**：禁止等 Vercel 构建失败再排查

### ❌ 严格禁止

1. ❌ 直接推送，等 Vercel 构建失败
2. ❌ 不测试就提交
3. ❌ 提交信息不规范
4. ❌ 跳过质量检查

---

## 🎓 示例场景

### 场景 1：新增文章

```bash
# 1. 创建文章
./scripts/article-tools.sh create LLM "Self-Attention" 002

# 2. 编辑内容
vim content/knowledge/LLM/002_Self-Attention.md

# 3. 本地构建测试
npm run build
# ✅ 构建成功

# 4. 质量检查
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

# 7. 验证
# 访问 Vercel 查看部署状态
# 2-5 分钟后访问网站查看
```

### 场景 2：修复 Bug

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

**系统版本**: v1.0  
**最后更新**: 2026-03-30  
**维护人**: AI Team

**记住：本地构建测试通过是发布的必要条件！** ✅
