# AI 面试题网站规划文档 v2.0

> **版本更新**: 2026-03-29
> - ✅ 混合分类体系（技术 + 岗位 + 专区）
> - ✅ 全文搜索功能
> - ✅ 图片本地化处理
> - ✅ 定时自动收集
> - ✅ 延伸追问生成

---

## 1. 竞品分析

### 1.1 国际网站

| 网站 | URL | 特点 | 内容组织 |
|------|-----|------|----------|
| **InterviewBit** | interviewbit.com/machine-learning-interview-questions | 结构化 Q&A，按难度分级，涵盖 ML 基础到高级 | 分类清晰：基础概念、算法、SVM、深度学习等 |
| **Educative** | educative.io/courses/grokking-the-machine-learning-interview | 系统化课程设计，ML System Design 专项 | 11 个模块：基础概念 +6 个实战系统设计 + 模拟面试 |
| **LeetCode Discuss** | leetcode.com/discuss/interview-question/machine-learning | 社区驱动，真实面试经验分享 | 按公司、职位、题型标签分类 |
| **Glassdoor** | glassdoor.com | 真实面试题库，公司特定问题 | 按公司、职位搜索，用户贡献内容 |
| **Medium** | medium.com | 个人博客形式，深度技术文章 | 标签分类，作者驱动 |

### 1.2 国内网站

| 网站 | URL | 特点 | 内容组织 |
|------|-----|------|----------|
| **牛客网** | nowcoder.com | 国内最大技术面试社区，笔试 + 面试 | 按公司、岗位、技术栈分类，含真题 |
| **力扣中国** | leetcode.cn | 算法题为主，AI 专项题目增长中 | 题库 + 竞赛 + 讨论 + 求职 |
| **GitHub 开源项目** | github.com/PPshrimpGo/AIinterview | 算法工程师面试题整理，中文 | Transformer/Bert、CNN、RNN、传统 ML、手撕代码 |
| **CSDN/博客园** | csdn.net | 个人技术博客，面试经验 | 标签分类，质量参差不齐 |
| **知乎** | zhihu.com | 问答社区，面试经验分享 | 话题分类，高赞答案质量高 |

### 1.3 竞品核心特点总结

**优点：**
- ✅ 结构化分类（按技术领域、难度、公司）
- ✅ 真实面试经验分享
- ✅ 包含代码题和系统设计
- ✅ 社区驱动内容更新

**不足：**
- ❌ 内容分散，缺乏统一标准
- ❌ AI/LLM 最新内容更新慢
- ❌ 缺少系统化的学习路径
- ❌ 中文高质量内容较少

---

## 2. 内容分类体系

### 2.1 一级分类（技术领域）

```
AI 面试题
├── 机器学习基础 (ML Basics)
├── 深度学习 (Deep Learning)
├── 自然语言处理 (NLP)
├── 计算机视觉 (CV)
├── 大语言模型 (LLM)
├── 推荐系统 (RecSys)
├── 强化学习 (RL)
├── 机器学习系统设计 (ML System Design)
└── 编程与算法 (Coding & Algorithms)
```

### 2.2 二级分类（详细主题）

#### 机器学习基础
- 监督学习（回归、分类）
- 无监督学习（聚类、降维）
- 模型评估与选择
- 特征工程
- 优化算法
- 正则化与过拟合
- 集成学习（Bagging, Boosting, Stacking）

#### 深度学习
- 神经网络基础
- CNN 与图像处理
- RNN/LSTM/GRU 与序列建模
- Attention 机制
- Transformer 架构
- 生成模型（GAN, VAE, Diffusion）
- 模型压缩与加速

#### 自然语言处理
- 词嵌入（Word2Vec, GloVe, FastText）
- 预训练模型（BERT, RoBERTa, ALBERT）
- 文本分类与情感分析
- 命名实体识别（NER）
- 机器翻译
- 问答系统
- 文本生成

#### 计算机视觉
- 图像分类（ResNet, EfficientNet）
- 目标检测（YOLO, Faster R-CNN, SSD）
- 图像分割（U-Net, Mask R-CNN）
- 人脸识别
- 图像生成（StyleGAN, Stable Diffusion）
- 视频理解

#### 大语言模型（2025-2026 重点）
- LLM 基础架构（Decoder-only, MoE）
- 预训练与微调（SFT, RLHF, DPO）
- Prompt Engineering
- RAG（检索增强生成）
- Agent 与工具调用
- 多模态模型（GPT-4V, LLaVA）
- 模型部署与优化（量化、蒸馏、vLLM）
- LLM 应用开发

#### 推荐系统
- 召回与排序
- 协同过滤
- 深度学习推荐（DeepFM, DIN, MMOE）
- 序列推荐
- 多任务学习
- 冷启动问题

#### 强化学习
- MDP 与贝尔曼方程
- Q-Learning 与 DQN
- Policy Gradient
- Actor-Critic 方法
- PPO 与 SAC
- 多智能体 RL

#### ML 系统设计
- 特征管道设计
- 模型训练平台
- 在线服务与 A/B 测试
- 模型监控与迭代
- 数据闭环
- 大规模系统案例（搜索、推荐、广告）

#### 编程与算法
- 数据结构（链表、树、图、堆）
- 算法（排序、搜索、动态规划）
- 机器学习手撕代码
- 深度学习框架使用（PyTorch/TensorFlow）
- 数据处理（Pandas, NumPy）

### 2.3 题目类型

| 类型 | 描述 | 示例 |
|------|------|------|
| **概念题** | 理论知识，原理理解 | "解释 Attention 机制的工作原理" |
| **代码题** | 手写代码，算法实现 | "实现 K-Means 聚类算法" |
| **数学推导** | 公式推导，证明 | "推导反向传播算法" |
| **项目题** | 项目经验，实际问题解决 | "描述你解决过的最复杂的 ML 问题" |
| **系统设计** | 开放性问题，架构设计 | "设计一个 YouTube 视频推荐系统" |
| **案例分析** | 场景分析，方案选择 | "如何处理样本不均衡问题" |

### 2.4 难度分级

| 级别 | 标识 | 描述 | 目标人群 |
|------|------|------|----------|
| **初级** | ⭐ | 基础概念，入门知识 | 应届生，转行者 |
| **中级** | ⭐⭐ | 深入理解，应用能力 | 1-3 年经验 |
| **高级** | ⭐⭐⭐ | 复杂问题，系统设计 | 3-5 年经验 |
| **专家** | ⭐⭐⭐⭐ | 前沿技术，创新思考 | 5 年 + 经验，Tech Lead |

---

## 3. 网站结构建议（Next.js App Router）

### 3.1 目录结构

```
ai-interview-questions/
├── app/
│   ├── layout.tsx              # 全局布局
│   ├── page.tsx                # 首页
│   ├── sitemap.ts              # SEO Sitemap
│   ├── robots.ts               # Robots.txt
│   │
│   ├── questions/              # 题目列表页
│   │   ├── page.tsx            # 所有题目
│   │   ├── [category]/         # 分类页面
│   │   │   ├── page.tsx        # 分类列表
│   │   │   └── [subcategory]/  # 子分类
│   │   │       └── page.tsx
│   │   │
│   │   └── [slug]/             # 单题详情页
│   │       ├── page.tsx        # 题目内容
│   │       └── opengraph-image.tsx  # SEO 分享图
│   │
│   ├── categories/             # 分类导航页
│   │   └── page.tsx
│   │
│   ├── tags/                   # 标签页面
│   │   └── [tag]/
│   │       └── page.tsx
│   │
│   ├── difficulty/             # 按难度筛选
│   │   └── [level]/
│   │       └── page.tsx
│   │
│   ├── roadmaps/               # 学习路径
│   │   ├── page.tsx            # 路径列表
│   │   └── [roadmap]/          # 具体路径
│   │       └── page.tsx
│   │
│   ├── mock-interviews/        # 模拟面试
│   │   └── page.tsx
│   │
│   ├── about/                  # 关于页面
│   │   └── page.tsx
│   │
│   └── api/                    # API 路由（可选）
│       └── search/
│           └── route.ts
│
├── content/                    # 内容存储（Markdown）
│   ├── questions/              # 题目内容
│   │   ├── ml-basics/          # 机器学习基础
│   │   ├── deep-learning/      # 深度学习
│   │   ├── nlp/                # NLP
│   │   ├── cv/                 # 计算机视觉
│   │   ├── llm/                # 大语言模型
│   │   ├── recsys/             # 推荐系统
│   │   ├── rl/                 # 强化学习
│   │   ├── system-design/      # 系统设计
│   │   └── coding/             # 编程题
│   │
│   ├── roadmaps/               # 学习路径
│   │   ├── ml-engineer.md
│   │   ├── nlp-engineer.md
│   │   └── cv-engineer.md
│   │
│   └── meta/                   # 元数据
│       ├── categories.json     # 分类定义
│       └── tags.json           # 标签定义
│
├── components/                 # React 组件
│   ├── ui/                     # 基础 UI 组件
│   ├── question/               # 题目相关组件
│   │   ├── QuestionCard.tsx
│   │   ├── QuestionList.tsx
│   │   └── CodeBlock.tsx
│   ├── layout/                 # 布局组件
│   └── seo/                    # SEO 组件
│
├── lib/                        # 工具函数
│   ├── content.ts              # 内容加载
│   ├── categories.ts           # 分类处理
│   └── utils.ts
│
├── styles/                     # 样式文件
│   └── globals.css
│
├── public/                     # 静态资源
│   ├── images/
│   └── favicon.ico
│
├── docs/                       # 项目文档
│   └── site-structure.md       # 本文档
│
├── next.config.js
├── tailwind.config.js
├── tsconfig.json
└── package.json
```

### 3.2 路由设计（v2.0）

| 路由 | 页面 | 功能 |
|------|------|------|
| `/` | 首页 | 搜索框、技术分类、岗位学习、技术专区 |
| `/search` | 搜索页面 | 全文搜索 + 多维度筛选 |
| `/questions` | 题目列表 | 所有题目，支持筛选和搜索 |
| `/questions/[category]` | 分类题目 | 按技术分类筛选 |
| `/questions/[slug]` | 题目详情 | 单题完整内容（含延伸追问） |
| `/categories` | 分类总览 | 9 个技术分类展示 |
| `/roles/[role]` | 岗位页面 | 按岗位角色筛选题目（v2.0 新增） |
| `/zones/[zone]` | 专区页面 | 按技术专区筛选题目（v2.0 新增） |
| `/difficulty/[level]` | 难度筛选 | 按难度查看题目 |
| `/roadmaps` | 学习路径 | 职业发展方向 |
| `/mock-interviews` | 模拟面试 | 随机组题功能 |
| `/api/search` | 搜索 API | 搜索接口（v2.0 新增） |

### 3.3 技术栈建议

```json
{
  "framework": "Next.js 14+ (App Router)",
  "language": "TypeScript",
  "styling": "Tailwind CSS",
  "content": "Markdown (MDX)",
  "deployment": "Vercel",
  "search": "Fuse.js (客户端搜索) 或 Algolia",
  "analytics": "Vercel Analytics / Google Analytics"
}
```

---

## 4. 功能建议

### 4.1 核心功能（MVP）

1. **题目浏览**
   - 分类浏览（按领域、难度）
   - 搜索功能（全文搜索）
   - 标签筛选

2. **题目详情**
   - Markdown 渲染
   - 代码高亮
   - 答案折叠/展开
   - 相关题目推荐

3. **SEO 优化**
   - 静态生成（SSG）
   - 结构化数据（Schema.org）
   - Open Graph 图片
   - Sitemap 自动生成

### 4.2 进阶功能

4. **学习路径**
   - 按角色定制（ML Engineer, NLP Engineer, CV Engineer）
   - 进度追踪（本地存储）
   - 推荐学习顺序

5. **模拟面试**
   - 随机组题（按分类、难度、数量）
   - 计时模式
   - 答案对照

6. **收藏与笔记**
   - 题目收藏（本地存储）
   - 个人笔记（Markdown）
   - 导出功能

7. **贡献系统**
   - GitHub PR 贡献
   - 内容审核流程
   - 贡献者展示

### 4.3 未来功能

8. **社区功能**
   - 题目讨论
   - 面试经验分享
   - 评分系统

9. **AI 辅助**
   - AI 生成答案解析
   - 智能推荐题目
   - 面试模拟对话

10. **多语言支持**
    - 中英文切换
    - 国际化路由

---

## 5. 内容模板

### 5.1 单题 Markdown 模板（v2.0）

```markdown
---
title: "题目名称"
category: LLM  # 技术分类（ML/DL/NLP/CV/LLM/RecSys/RL/System/Coding）
roles: ["前端开发", "AI 工程化"]  # 适用岗位（v2.0 新增）
zones: ["Agent 开发"]  # 技术专区（v2.0 新增，可选）
difficulty: ⭐⭐  # 难度级别（⭐ 到 ⭐⭐⭐⭐）
tags: ["标签 1", "标签 2", "标签 3"]
source: 来源
sourceUrl: https://...
createdAt: 2026-03-29
updatedAt: 2026-03-29
images: ["/images/questions/20260329/image1.png"]  # 本地图片路径（v2.0 新增）
---

## 题目描述

这里是问题的完整描述...

## 参考答案

详细的答案内容...

## 考察重点

- **核心知识点**: ...
- **能力维度**: ...
- **常见误区**: ...

## 延伸题目

- [[相关题目 1]](./related-1.md)
- [[相关题目 2]](./related-2.md)

## 延伸追问（v2.0 新增）

### 追问 1: 如果场景发生变化会怎样？
**答案：** ...

### 追问 2: 如何优化这个方案？
**答案：** ...

## 深入理解（v2.0 新增）

> **实际应用场景**: ...
> **与其他知识点的关联**: ...
> **进阶变体**: ...
> **面试技巧**: ...

### 核心要点

1. 要点一
2. 要点二
3. 要点三

### 详细解答

详细的答案内容，可以包含：

- 概念解释
- 原理说明
- 公式推导

### 代码示例（如适用）

```python
# 代码示例
def example():
    pass
```

## 延伸思考

- 相关问题 1
- 相关问题 2
- 实际应用场景

## 参考资源

- [资源 1 名称](链接)
- [资源 2 名称](链接)

## 相关题目

- [相关题目 1](/questions/相关 slug)
- [相关题目 2](/questions/相关 slug)
```

### 5.2 分类定义 JSON 模板

```json
{
  "ml-basics": {
    "name": "机器学习基础",
    "nameEn": "Machine Learning Basics",
    "description": "机器学习基础概念和算法",
    "icon": "📊",
    "subcategories": {
      "supervised": "监督学习",
      "unsupervised": "无监督学习",
      "evaluation": "模型评估",
      "optimization": "优化算法"
    }
  },
  "llm": {
    "name": "大语言模型",
    "nameEn": "Large Language Models",
    "description": "LLM 架构、训练、应用",
    "icon": "🤖",
    "subcategories": {
      "architecture": "模型架构",
      "training": "训练与微调",
      "prompt": "Prompt Engineering",
      "rag": "RAG",
      "agent": "Agent",
      "deployment": "部署优化"
    }
  }
}
```

### 5.3 学习路径模板

```markdown
---
title: "机器学习工程师学习路径"
role: "ML Engineer"
duration: "6-12 个月"
levels: ["初级", "中级", "高级"]
---

## 阶段一：基础（1-2 个月）

### 必修题目

1. [什么是机器学习和深度学习的区别？](/questions/ml-basics/ml-vs-dl)
2. [解释过拟合和欠拟合](/questions/ml-basics/overfitting-underfitting)
3. [常见的损失函数有哪些？](/questions/ml-basics/loss-functions)

### 推荐资源

- 吴恩达机器学习课程
- 《机器学习》周志华

## 阶段二：进阶（2-4 个月）

...

## 阶段三：实战（3-6 个月）

...
```

---

## 6. SEO 优化建议

### 6.1 技术优化

- ✅ 使用 Next.js SSG（静态生成）
- ✅ 每个页面生成唯一 meta 标签
- ✅ 结构化数据（JSON-LD）
- ✅ 自动生成 sitemap.xml
- ✅ 优化页面加载速度（图片懒加载）

### 6.2 内容优化

- ✅ 每题目标关键词（如"Transformer 面试题"）
- ✅ 长尾关键词覆盖
- ✅ 内部链接网络
- ✅ 定期更新内容

### 6.3 元数据模板

```typescript
export async function generateMetadata({ params }): Promise<Metadata> {
  const question = await getQuestion(params.slug)
  
  return {
    title: `${question.title} - AI 面试题`,
    description: question.excerpt,
    openGraph: {
      title: question.title,
      description: question.excerpt,
      type: 'article',
    },
  }
}
```

---

## 7. 部署建议

### 7.1 Vercel 配置

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "nextjs"
}
```

### 7.2 环境变量

```bash
# 可选：搜索服务
NEXT_PUBLIC_ALGOLIA_APP_ID=xxx
NEXT_PUBLIC_ALGOLIA_SEARCH_KEY=xxx

# 可选：分析服务
NEXT_PUBLIC_GA_ID=G-xxx
```

### 7.3 自定义域名

- 在 Vercel 添加自定义域名
- 配置 DNS 记录
- 启用 HTTPS（自动）

---

## 8. 开发路线图

### Phase 1: MVP（2 周）
- [ ] 项目初始化
- [ ] 基础布局组件
- [ ] 内容加载系统
- [ ] 题目列表页
- [ ] 题目详情页
- [ ] 部署上线

### Phase 2: 核心功能（2 周）
- [ ] 分类系统
- [ ] 搜索功能
- [ ] 标签系统
- [ ] SEO 优化
- [ ] 内容填充（50+ 题目）

### Phase 3: 进阶功能（2 周）
- [ ] 学习路径
- [ ] 模拟面试
- [ ] 收藏功能
- [ ] 内容贡献指南

### Phase 4: 增长优化（持续）
- [ ] 社区功能
- [ ] 数据分析
- [ ] 内容扩展
- [ ] 性能优化

---

## 9. 自动收集系统（v2.0 新增）

### 9.1 收集脚本

位置：`skills/auto-interview-collector/scripts/collect.py`

**功能：**
- 50+ 关键词轮换搜索（中英文）
- 多来源内容获取（GitHub、Medium、知乎、牛客网等）
- 图片本地化处理
- AI 延伸追问生成
- 智能去重
- 自动 Git 提交 + Vercel 部署触发

**使用：**
```bash
# 手动收集
python collect.py --count 10 --manual

# 指定分类
python collect.py --category LLM --count 5

# 指定关键词
python collect.py --keywords "LLM interview,RAG" --count 5
```

### 9.2 定时任务配置

```bash
# 配置 cron 定时任务（每天凌晨 2 点）
bash scripts/setup-cron.sh
```

**配置详情：**
- macOS: 使用 launchd
- Linux: 使用 cron
- 执行时间：每天 2:00 AM
- 每次收集：10-15 道题
- 自动 commit + push
- 触发 Vercel 部署

---

## 10. 总结

基于竞品分析，本项目应聚焦以下差异化优势：

1. **内容质量**：精选题目 + 详细解答，避免低质内容
2. **时效性**：重点关注 LLM 等前沿技术（2025-2026）
3. **结构化**：清晰的分类体系和学习路径
4. **可维护性**：Markdown + Git 版本控制，便于社区贡献
5. **SEO 优先**：静态生成 + 优化元数据，获取自然流量

技术选择坚持简单可靠：
- Next.js App Router（成熟稳定）
- Markdown 存储（易于编辑和版本控制）
- Vercel 部署（零配置，自动 HTTPS）
- 纯静态（低成本，高性能）
