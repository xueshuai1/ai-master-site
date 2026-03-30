# AI 学习与面试大全 🤖

> 专注 AI 领域的知识库和面试准备，助你系统性掌握 AI 技术，轻松应对技术面试

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org)
[![Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black)](https://vercel.com)

---

## 🎯 项目定位

**从零开始，打造最优质的 AI 技术学习与面试准备平台**

- 📚 **系统化知识库** - 结构化组织 AI 核心技术知识点
- 💼 **面试题库** - 精选高频面试题，助你轻松应对技术面试
- 🗺️ **学习路径** - 从入门到精通，循序渐进的学习路线
- ⚡ **持续更新** - ISR 增量更新，内容持续优化

---

## 📖 技术领域

### 9 大技术分类

| 分类 | 图标 | 描述 |
|------|------|------|
| **ML** | 📊 | 机器学习基础 - 监督学习、无监督学习、模型评估 |
| **DL** | 🧠 | 深度学习 - 神经网络、CNN、RNN、Transformer |
| **NLP** | 📝 | 自然语言处理 - 词向量、语言模型、文本生成 |
| **CV** | 👁️ | 计算机视觉 - 图像分类、目标检测、分割 |
| **LLM** | 🤖 | 大语言模型 - Prompt、RAG、Fine-tuning、Agent |
| **RecSys** | 🎯 | 推荐系统 - 召回排序、协同过滤、深度学习 |
| **RL** | 🎮 | 强化学习 - MDP、Q-Learning、Policy Gradient |
| **System** | ⚙️ | AI 工程化 - 模型部署、MLOps、系统设计 |
| **AI-Engineering** | 🛠️ | AI 工程与实践 - Agent 开发、方法论、工具链 |

---

## 🚀 快速开始

### 开发环境

```bash
# 克隆项目
git clone https://github.com/xueshuai1/ai-interview-questions.git
cd ai-interview-questions

# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 访问 http://localhost:3000
```

### 构建

```bash
# 生产构建
npm run build

# 本地预览
npm start
```

---

## 📁 项目结构

```
ai-interview-questions/
├── content/
│   ├── knowledge/          # 知识库文章
│   │   ├── ML/            # 机器学习
│   │   ├── DL/            # 深度学习
│   │   ├── NLP/           # 自然语言处理
│   │   ├── CV/            # 计算机视觉
│   │   ├── LLM/           # 大语言模型
│   │   ├── RecSys/        # 推荐系统
│   │   ├── RL/            # 强化学习
│   │   ├── System/        # AI 工程化
│   │   └── AI-Engineering/# AI 工程与实践
│   └── questions/          # 面试题库
│       └── [category]/     # 按分类组织
├── src/
│   ├── app/               # Next.js App Router
│   │   ├── page.tsx       # 首页
│   │   ├── knowledge/     # 知识库页面
│   │   ├── interview/     # 面试题库
│   │   └── layout.tsx     # 根布局
│   └── components/        # React 组件
├── public/                # 静态资源
└── package.json
```

---

## 📝 内容规范

### 知识库文章格式

```markdown
# 文章标题

> **分类**: 领域分类 | **编号**: XXX | **更新时间**: YYYY-MM-DD | **难度**: ⭐/⭐⭐/⭐⭐⭐

`标签 1` `标签 2` `标签 3`

**摘要**: 50-100 字核心内容概括

---

## 一、核心概念
## 二、核心原理
## 三、应用场景
## 四、实践建议
## 五、总结
```

### 面试试题格式

```markdown
# 主题 - 面试题

> **分类**: 领域分类 | **编号**: XXX | **难度**: ⭐/⭐⭐/⭐⭐⭐

## 问题

清晰的问题描述

## 参考答案

结构化的参考答案

## 核心要点

1. 要点一
2. 要点二
3. 要点三

## 延伸追问

1. 追问一
2. 追问二
3. 追问三
```

---

## 🎨 技术栈

- **框架**: Next.js 16 (App Router)
- **语言**: TypeScript
- **样式**: Tailwind CSS
- **内容**: Markdown
- **部署**: Vercel
- **渲染**: SSG + ISR（静态生成 + 增量更新）

---

## 📊 部署

### Vercel 自动部署

项目已配置 Vercel，每次 push 到 main 分支自动部署：

1. Push 代码到 GitHub
2. Vercel 自动检测并构建
3. 自动部署到生产环境

### ISR 更新策略

- **更新频率**: 每小时自动更新
- **触发方式**: 用户访问时后台静默更新
- **优势**: 无需手动部署，内容持续优化

---

## 📋 开发计划

### Phase 1: 基础建设 ✅
- [x] 项目初始化
- [x] SSG + ISR 配置
- [x] 内容规范制定
- [ ] 首页设计
- [ ] 分类页面

### Phase 2: 内容填充 🚧
- [ ] ML 领域文章
- [ ] DL 领域文章
- [ ] LLM 领域文章
- [ ] 面试题库

### Phase 3: 功能完善 📋
- [ ] 搜索功能
- [ ] 学习路径
- [ ] 学习进度追踪
- [ ] 书签功能

### Phase 4: 优化提升 📋
- [ ] SEO 优化
- [ ] 性能优化
- [ ] 移动端优化
- [ ] 国际化

---

## 🤝 贡献指南

欢迎贡献！请遵循以下步骤：

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

---

## 📄 许可证

MIT License - 详见 [LICENSE](LICENSE)

---

## 📬 联系方式

- **GitHub**: [@xueshuai1](https://github.com/xueshuai1)
- **问题反馈**: [Issues](https://github.com/xueshuai1/ai-interview-questions/issues)

---

**开始构建你的 AI 知识体系吧！** 🚀
