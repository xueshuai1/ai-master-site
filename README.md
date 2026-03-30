# AI 学习与面试大全 🤖

> 专注 AI 领域的知识库和面试准备，助你系统性掌握 AI 技术，轻松应对技术面试

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org)
[![Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black)](https://vercel.com)

---

## 📋 项目说明

本项目正在从基础重建，当前包含：

- **示例文章**: 1 篇（Transformer 架构详解）
- **示例面试题**: 1 道（Transformer）
- **技术栈**: Next.js 16 + TypeScript + Tailwind CSS
- **部署**: Vercel（SSG + ISR）
- **更新策略**: 每小时自动更新

### 🎯 示例规范

保留的文章和试题作为**内容标准规范**，展示：
- ✅ 标准化的元数据格式（分类、编号、难度、标签、摘要）
- ✅ 多样化的内容展示（代码高亮、表格、列表、图表）
- ✅ 结构化的知识组织
- ✅ ISR 增量更新配置

---

## 🚀 快速开始

---

## 🚀 快速开始

### 开发环境

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 访问 http://localhost:3000
```

### 部署

项目已配置 Vercel 自动部署：

1. Fork 本仓库
2. 在 Vercel 导入项目
3. 每次 push 自动部署

或访问在线版本：[TODO: 添加部署链接]

---

## 📖 使用指南

### 浏览题目

- **按技术分类**：访问 `/categories/[category]`
- **按岗位学习**：访问 `/roles/[role]`
- **技术专区**：访问 `/zones/[zone]`
- **搜索题目**：访问 `/search`

### 题目格式

```markdown
---
title: "题目名称"
category: LLM
roles: ["后端开发", "AI 工程化"]
zones: ["Agent 开发"]
difficulty: ⭐⭐⭐
tags: ["RAG", "LLM 应用"]
source: 来源
sourceUrl: https://...
createdAt: 2026-03-29
updatedAt: 2026-03-29
images: []
---

## 题目描述
...

## 参考答案
...

## 考察重点
...

## 延伸题目
...

## 延伸追问
...

## 深入理解
...
```

---

## 📁 项目结构

```
ai-interview-questions/
├── src/
│   ├── app/
│   │   ├── page.tsx              # 首页
│   │   ├── search/               # 搜索页面
│   │   ├── knowledge/            # 知识库页面
│   │   ├── questions/            # 题目详情页
│   │   └── api/                  # API 路由
├── content/
│   ├── knowledge/                # 298 篇知识库文章
│   │   ├── LLM/
│   │   ├── DL/
│   │   ├── CV/
│   │   └── ...
│   └── questions/                # 271 道面试题
│       ├── LLM/
│       ├── DL/
│       ├── CV/
│       └── ...
├── data/
│   └── keywords-*.json           # 关键词库（AIGC 生成用）
├── scripts/
│   ├── auto-test.js              # 自动测试
│   └── evaluate-quality.py       # 质量评估
└── docs/
    ├── site-structure.md         # 网站结构
    └── classification-system.md  # 分类体系
```

---

## 📊 分类体系

### 技术分类（9 个）

| 分类 | 描述 |
|------|------|
| 📊 ML | 机器学习基础 |
| 🧠 DL | 深度学习 |
| 📝 NLP | 自然语言处理 |
| 👁️ CV | 计算机视觉 |
| 🤖 LLM | 大语言模型 |
| 🎯 RecSys | 推荐系统 |
| 🎮 RL | 强化学习 |
| 🏗️ System | 系统设计 |
| 💻 Coding | 编程算法 |

### 岗位角色（6 个）

| 岗位 | 子方向 |
|------|--------|
| 🎨 前端开发 | AI 应用开发、前端工程化+AI、UI/UX+AI |
| ⚙️ 后端开发 | 模型部署、API 设计、系统架构 |
| 🔬 算法工程师 | 模型原理、训练优化、论文解读 |
| 🛠️ AI 工程化 | Agent/多 Agent、开发方法论、工具链 |
| 📋 产品经理 | AI 产品设计、场景分析 |
| 📈 数据科学家 | 数据分析、特征工程 |

### 技术专区（5 个）

| 专区 | 主题 |
|------|------|
| 🦞 OpenClaw | OpenClaw 技术、技能开发、节点控制 |
| 🤖 Agent 开发 | 子 Agent、多 Agent 协作 |
| 📚 开发方法论 | SDD/TDD/ATDD/OMO |
| 🔧 工具链 | OpenCode、Cursor、Windsurf |
| 🚀 前沿技术 | 最新论文、技术趋势 |

---

## 🛠️ 技术栈

- **框架**: Next.js 14 (App Router)
- **语言**: TypeScript
- **样式**: Tailwind CSS
- **内容**: Markdown
- **部署**: Vercel
- **搜索**: 自定义全文搜索（支持 FlexSearch 扩展）

---

## 📝 贡献指南

### 添加新题目

1. 在对应分类目录下创建 Markdown 文件
2. 使用标准 frontmatter 格式
3. 确保 tags 准确描述内容
4. 提交 PR

### 改进现有题目

- 修正错误答案
- 补充延伸追问
- 添加实际案例
- 更新参考资料

### 功能建议

欢迎通过 [GitHub Issues](https://github.com/xueshuai/ai-interview-questions/issues) 提出建议！

---

## 📄 文档

- [网站结构](./docs/site-structure.md)
- [分类体系](./docs/classification-system.md)

---

## 📅 开发路线图

### Phase 1: ✅ 已完成 (2026-03-29)
- [x] 混合分类体系
- [x] 搜索功能
- [x] 图片本地化
- [x] 延伸追问生成

### Phase 2: ✅ 已完成 (2026-03-30)
- [x] 题目详情页
- [x] 分类筛选页
- [x] 岗位学习页
- [x] 技术专区页
- [x] **知识库系统** (v3.0)
- [x] **298 篇知识点文章**
- [x] **271 道面试题**

### Phase 3: 🚧 进行中
- [ ] 学习路径
- [ ] 模拟面试
- [ ] 收藏功能
- [ ] 进度追踪

### Phase 4: 📋 计划中
- [ ] 知识图谱可视化
- [ ] 个性化推荐
- [ ] 学习社区

---

## 🙏 致谢

感谢所有贡献者和 AI 面试准备社区！

---

## 📜 许可证

MIT License - 详见 [LICENSE](LICENSE)

---

## 📬 联系方式

- GitHub: [@xueshuai](https://github.com/xueshuai)
- 问题反馈：[Issues](https://github.com/xueshuai/ai-interview-questions/issues)

---

**Good Luck with Your AI Interviews! 🎉**
