# 🚀 快速使用指南

> AI 知识库文章管理快速入门

---

## 📝 创建新文章

### 方法 1：使用脚本（推荐）

```bash
# 语法
./scripts/article-tools.sh create <分类> <标题> <编号>

# 示例
./scripts/article-tools.sh create LLM "Self-Attention" 002
```

**效果**：
- ✅ 自动创建标准格式的文章模板
- ✅ 自动填充分类、编号、日期
- ✅ 包含更新日志部分

### 方法 2：手动创建

```bash
# 1. 创建文件
touch content/knowledge/LLM/002_Self-Attention.md

# 2. 添加标准头部
cat > content/knowledge/LLM/002_Self-Attention.md << 'EOF'
# Self-Attention

> **分类**: 大语言模型 | **编号**: LLM-002 | **更新时间**: 2026-03-30 | **难度**: ⭐⭐⭐
> **版本**: v1.0 | **作者**: AI Team | **审核状态**: ⏳

`Transformer` `Attention` `深度学习`

**摘要**: Self-Attention 是 Transformer 的核心组件...

---

## 更新日志

- **v1.0** (2026-03-30) - 初始版本

---

[文章内容]
EOF

# 3. 提交并推送
git add -A
git commit -m "docs: 新增 Self-Attention 文章"
git push origin main
```

---

## 🔄 更新文章

### 自动更新（推荐）

```bash
# 自动更新时间和版本号
./scripts/article-tools.sh update content/knowledge/LLM/001_Transformer.md

# 添加更新日志
./scripts/article-tools.sh changelog content/knowledge/LLM/001_Transformer.md "添加代码示例和图表"
```

### 手动更新

```bash
# 1. 编辑文章
vim content/knowledge/LLM/001_Transformer.md

# 2. 更新头部信息
# 将 更新时间 改为当前日期
# 将 版本 号增加（v1.0 → v1.1）

# 3. 添加更新日志
## 更新日志

- **v1.1** (2026-03-30) - 添加代码示例和图表
- **v1.0** (2026-03-25) - 初始版本

# 4. 提交并推送
git add -A
git commit -m "docs(Transformer): 添加代码示例和图表

- 添加 Python 实现
- 添加 Mermaid 图表

版本：v1.0 → v1.1"
git push origin main
```

---

## 📊 查看统计

```bash
# 显示所有统计信息
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

---

## ✅ 质量检查

```bash
# 检查所有文章质量
./scripts/article-tools.sh check
```

**检查项**：
- ✅ 是否有标题
- ✅ 是否有分类信息
- ✅ 是否有更新时间
- ⚠️ 是否有版本号（警告）
- ⚠️ 是否有更新日志（警告）

---

## 🗂️ 归档文章

```bash
# 归档过时文章
./scripts/article-tools.sh archive content/knowledge/LLM/old-article.md
```

**效果**：
- ✅ 移动到 `content/.archived/` 目录
- ✅ 保留历史记录
- ✅ 不影响现有链接

---

## 📋 版本管理规范

### 版本号格式

```
v主版本。次版本。修订版本

例如：v1.2.3
```

### 何时更新版本号

| 变更类型 | 版本号变化 | 示例 |
|---------|-----------|------|
| **重大更新** | v1.x.x → v2.0.0 | 完全重写文章 |
| **功能更新** | v1.1.x → v1.2.0 | 添加新章节/代码 |
| **小幅修改** | v1.1.1 → v1.1.2 | 修改错别字/格式 |

### 更新日志格式

```markdown
## 更新日志

- **v1.2.0** (2026-03-30) - 添加代码示例
  - 添加 Python 实现
  - 添加使用示例
  
- **v1.1.0** (2026-03-28) - 添加图表
  - 添加架构图
  - 添加流程图
  
- **v1.0.0** (2026-03-25) - 初始版本
```

---

## 🎯 最佳实践

### 1. 文章命名

```
✅ 推荐：
- 001_Transformer.md
- 002_Self-Attention.md

❌ 不推荐：
- transformer.md
- 01.md
- 文章 1.md
```

### 2. 提交信息

```
✅ 推荐：
docs(Transformer): 更新代码示例

- 添加 Python 实现
- 添加使用示例

版本：v1.1 → v1.2

❌ 不推荐：
更新文章
修改内容
```

### 3. 更新频率

```
- 新文章：每周 1-2 篇
- 更新文章：每月审查一次
- 技术跟进：及时更新最新进展
```

---

## 🔧 常用命令

```bash
# 创建新文章
./scripts/article-tools.sh create LLM "Multi-Head Attention" 003

# 更新文章
./scripts/article-tools.sh update content/knowledge/LLM/001_Transformer.md

# 添加更新日志
./scripts/article-tools.sh changelog content/knowledge/LLM/001_Transformer.md "添加可视化图表"

# 查看统计
./scripts/article-tools.sh stats

# 质量检查
./scripts/article-tools.sh check

# 查看帮助
./scripts/article-tools.sh help
```

---

## 📈 完整工作流程

### 创建新文章

```bash
# 1. 创建文章
./scripts/article-tools.sh create LLM "Self-Attention" 002

# 2. 编辑内容
vim content/knowledge/LLM/002_Self-Attention.md

# 3. 检查质量
./scripts/article-tools.sh check

# 4. 提交并推送
git add -A
git commit -m "docs: 新增 Self-Attention 文章"
git push origin main
```

### 更新现有文章

```bash
# 1. 编辑文章
vim content/knowledge/LLM/001_Transformer.md

# 2. 更新时间和版本
./scripts/article-tools.sh update content/knowledge/LLM/001_Transformer.md

# 3. 添加更新日志
./scripts/article-tools.sh changelog content/knowledge/LLM/001_Transformer.md "更新代码示例"

# 4. 检查质量
./scripts/article-tools.sh check

# 5. 提交并推送
git add -A
git commit -m "docs(Transformer): 更新代码示例

版本：v1.1 → v1.2"
git push origin main
```

---

## 🎓 示例

### 示例 1：创建完整的文章

```bash
# 创建文章
./scripts/article-tools.sh create LLM "Transformer" 001

# 编辑内容（添加代码、图表、表格等）
vim content/knowledge/LLM/001_Transformer.md

# 提交
git add -A
git commit -m "docs: 新增 Transformer 架构详解文章

- 包含完整的 Self-Attention 实现
- 添加 Mermaid 流程图
- 添加对比表格
- 添加实践建议"
git push origin main
```

### 示例 2：批量更新

```bash
# 查看所有文章
./scripts/article-tools.sh stats

# 检查质量
./scripts/article-tools.sh check

# 更新有问题的文章
vim content/knowledge/LLM/xxx.md

# 再次检查
./scripts/article-tools.sh check

# 提交
git add -A
git commit -m "chore: 批量更新文章元数据"
git push origin main
```

---

**快速指南版本**: v1.0  
**最后更新**: 2026-03-30  
**维护人**: AI Team
