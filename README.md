# AI 面试题大全 v2.0 🤖

> 专注 AI 领域的面试题库，采用混合分类体系，助你拿到理想 Offer

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)](https://nextjs.org)
[![Auto Collect](https://img.shields.io/badge/Auto-Collect-green)](./skills/auto-interview-collector)

---

## ✨ 特性亮点

### 🎯 混合分类体系 v2.0

从三个维度组织题目，更贴近实际学习路径：

1. **技术分类** - 9 个技术领域（ML/DL/NLP/CV/LLM/RecSys/RL/System/Coding）
2. **岗位角色** - 6 个岗位方向（前端/后端/算法/AI 工程化/产品/数据科学）
3. **技术专区** - 5 个专题区域（OpenClaw/Agent 开发/方法论/工具链/前沿技术）

### 🔍 强大搜索功能

- 全文搜索（标题、内容、标签）
- 多维度筛选（分类、岗位、专区、难度）
- 搜索结果高亮
- 快速响应

### 🤖 自动收集系统

- 50+ 关键词轮换搜索（中英文）
- 多来源内容获取（GitHub、Medium、知乎、牛客网等）
- 图片本地化处理
- AI 延伸追问生成
- 智能去重
- 自动 Git 提交 + Vercel 部署

### 📚 题目结构完善

每道题目包含：
- 题目描述
- 参考答案
- 考察重点
- 延伸题目
- **延伸追问**（v2.0 新增）
- **深入理解**（v2.0 新增）

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

## 🤖 自动收集

### 手动收集

```bash
cd skills/auto-interview-collector

# 收集 10 道题目
python scripts/collect.py --count 10 --manual

# 指定分类
python scripts/collect.py --category LLM --count 5

# 指定关键词
python scripts/collect.py --keywords "RAG,Agent" --count 5
```

### 定时任务

配置每天凌晨 2 点自动收集：

```bash
# macOS / Linux
bash scripts/setup-cron.sh
```

**配置详情**：
- 执行时间：每天 2:00 AM
- 每次收集：10-15 道题
- 自动 commit + push
- 触发 Vercel 部署
- 日志保存：`logs/` 目录

---

## 📁 项目结构

```
ai-interview-questions/
├── src/
│   ├── app/
│   │   ├── page.tsx          # 首页（v2.0 更新）
│   │   ├── search/           # 搜索页面（v2.0 新增）
│   │   └── api/search/       # 搜索 API（v2.0 新增）
│   └── lib/
│       └── search.ts         # 搜索逻辑库（v2.0 新增）
├── content/meta/
│   └── categories.json       # 分类配置（v2.0 更新）
├── skills/auto-interview-collector/
│   ├── scripts/
│   │   ├── collect.py        # 收集脚本（v2.0 更新）
│   │   └── setup-cron.sh     # Cron 配置（v2.0 更新）
│   ├── config.json           # 配置文件（v2.0 更新）
│   └── questions/            # 题目存储
│       ├── LLM/
│       ├── CV/
│       ├── NLP/
│       └── ...
└── docs/
    ├── site-structure.md     # 网站结构
    └── classification-system.md  # 分类体系（v2.0 新增）
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
- [自动收集器](./skills/auto-interview-collector/README.md)

---

## 📅 开发路线图

### Phase 1: ✅ 已完成 (2026-03-29)
- [x] 混合分类体系
- [x] 搜索功能
- [x] 图片本地化
- [x] 自动收集系统
- [x] 延伸追问生成

### Phase 2: 🚧 进行中
- [ ] 题目详情页
- [ ] 分类筛选页
- [ ] 岗位学习页
- [ ] 技术专区页

### Phase 3: 📋 计划中
- [ ] 学习路径
- [ ] 模拟面试
- [ ] 收藏功能
- [ ] 进度追踪

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
