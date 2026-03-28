# AI 面试题分类体系 v2.0

## 概述

本系统采用**混合分类体系**，从三个维度组织面试题：

1. **技术分类** - 按技术领域划分（第一层）
2. **岗位角色** - 按目标岗位划分（第二层）
3. **技术专区** - 按特定主题划分（第三层）

这种设计允许用户从多个角度浏览和学习题目，更贴近实际学习路径。

---

## 第一层：技术分类

覆盖 AI 领域的核心技术方向，共 9 个分类：

| ID | 名称 | 图标 | 描述 |
|----|------|------|------|
| ML | 机器学习基础 | 📊 | 监督学习、无监督学习、模型评估、特征工程、优化算法 |
| DL | 深度学习 | 🧠 | 神经网络、CNN、RNN、Transformer、生成模型 |
| NLP | 自然语言处理 | 📝 | 词向量、语言模型、文本分类、机器翻译、问答系统 |
| CV | 计算机视觉 | 👁️ | 图像分类、目标检测、分割、人脸识别、生成模型 |
| LLM | 大语言模型 | 🤖 | Prompt Engineering、RAG、Fine-tuning、Agent、模型部署 |
| RecSys | 推荐系统 | 🎯 | 召回排序、协同过滤、深度学习推荐、多任务学习 |
| RL | 强化学习 | 🎮 | MDP、Q-Learning、Policy Gradient、PPO、多智能体 |
| System | 系统设计 | 🏗️ | ML 系统设计、特征管道、模型服务、监控迭代 |
| Coding | 编程算法 | 💻 | 数据结构、算法、手撕代码、LeetCode |

### 题目数据结构

```yaml
---
title: "题目名称"
category: LLM  # 技术分类 ID
roles: [前端开发，AI 工程化]  # 适用岗位
zones: [Agent 开发]  # 技术专区（可选）
difficulty: ⭐⭐  # 难度级别
tags: [标签 1, 标签 2]
source: 来源
sourceUrl: https://...
createdAt: 2026-03-29
updatedAt: 2026-03-29
images: [/images/questions/...]
---
```

---

## 第二层：岗位角色

根据目标岗位的学习路径分类，共 6 个角色：

### 1. 前端开发 🎨

**子方向：**
- AI 应用开发 - 使用 LLM API 构建智能应用
- 前端工程化+AI - AI 辅助前端开发、代码生成
- UI/UX+AI - AI 驱动的设计工具和流程

**核心技能：**
- JavaScript/TypeScript
- React/Vue/Next.js
- AI API 集成（OpenAI、Anthropic 等）
- Prompt Engineering
- 前端性能优化

### 2. 后端开发 ⚙️

**子方向：**
- 模型部署 - 模型服务化、API 设计
- API 设计 - RESTful、GraphQL、gRPC
- 系统架构 - 微服务、分布式系统

**核心技能：**
- Python/Go/Java
- 模型部署框架（FastAPI、Flask）
- 容器化（Docker、Kubernetes）
- 云服务（AWS、GCP、Azure）
- 数据库和缓存

### 3. 算法工程师 🔬

**子方向：**
- 模型原理 - 深入理解算法原理
- 训练优化 - 超参数调优、分布式训练
- 论文解读 - 追踪最新研究进展

**核心技能：**
- 机器学习/深度学习理论
- PyTorch/TensorFlow
- 数学基础（线性代数、概率论）
- 论文阅读能力
- 实验设计和分析

### 4. AI 工程化 🛠️

**子方向：**
- Agent/多 Agent - 智能体开发和协作
- 开发方法论 - SDD/TDD/ATDD/OMO
- 工具链 - OpenCode、Cursor、Windsurf 等
- 部署运维 - MLOps、监控、CI/CD

**核心技能：**
- Agent 框架（LangChain、LlamaIndex）
- MLOps 工具（MLflow、Kubeflow）
- 监控和日志
- 自动化测试
- AI 开发工具使用

### 5. 产品经理 📋

**子方向：**
- AI 产品设计 - 设计 AI 驱动的产品功能
- 场景分析 - 识别 AI 应用场景和价值

**核心技能：**
- 产品方法论
- AI 技术理解
- 用户需求分析
- 数据驱动决策
- 竞品分析

### 6. 数据科学家 📈

**子方向：**
- 数据分析 - 探索性数据分析、可视化
- 特征工程 - 特征选择、构造、变换

**核心技能：**
- Python/R
- SQL
- 统计分析
- 数据可视化
- 机器学习建模

---

## 第三层：技术专区

聚焦特定技术主题的深度学习和实践：

### 1. OpenClaw 专区 🦞

**主题：**
- OpenClaw 技术 - 架构、核心概念
- 技能开发 - 创建和发布技能
- 节点控制 - 节点连接、设备管理

**适合人群：**
- OpenClaw 用户和开发者
- 对 AI 助理系统感兴趣的人

### 2. Agent 开发 🤖

**主题：**
- 子 Agent - 单一功能 Agent 设计
- 多 Agent 协作 - Agent 间通信和协作
- Agent 框架 - LangChain、AutoGen 等

**适合人群：**
- AI 应用开发者
- 对 Agent 技术感兴趣的人

### 3. 开发方法论 📚

**主题：**
- SDD (Specification-Driven Development)
- TDD (Test-Driven Development)
- ATDD (Acceptance Test-Driven Development)
- OMO (Oh-My-OpenAgent)

**适合人群：**
- 追求高质量代码的开发者
- 技术团队负责人

### 4. 工具链 🔧

**主题：**
- OpenCode - AI 代码编辑器
- Cursor - AI 原生 IDE
- Windsurf - AI 开发环境
- Continue - VS Code AI 插件
- Aider - 命令行 AI 编程

**适合人群：**
- 希望提升开发效率的开发者
- AI 工具探索者

### 5. 前沿技术 🚀

**主题：**
- 最新论文 - 顶级会议论文解读
- 技术趋势 - 行业发展方向
- 前沿研究 - 实验性技术和方法

**适合人群：**
- 研究人员
- 技术爱好者
- 希望保持技术敏感度的人

---

## 难度级别

| 级别 | 标识 | 描述 | 目标人群 |
|------|------|------|----------|
| 初级 | ⭐ | 基础概念，入门知识 | 应届生，转行者 |
| 中级 | ⭐⭐ | 深入理解，应用能力 | 1-3 年经验 |
| 高级 | ⭐⭐⭐ | 复杂问题，系统设计 | 3-5 年经验 |
| 专家 | ⭐⭐⭐⭐ | 前沿技术，创新思考 | 5 年+ 经验，Tech Lead |

---

## 使用场景

### 场景 1：按技术分类学习

> "我想系统学习 LLM 相关知识"

→ 浏览 `/categories/LLM`，按难度从低到高学习

### 场景 2：按岗位准备面试

> "我要面试 AI 工程化岗位"

→ 浏览 `/roles/ai-engineering`，针对性准备

### 场景 3：深入研究特定主题

> "我想了解多 Agent 协作"

→ 浏览 `/zones/agent-dev`，深入学习

### 场景 4：搜索特定知识点

> "我想知道 RAG 相关的面试题"

→ 使用搜索功能，输入 "RAG"

---

## 扩展指南

### 添加新分类

1. 编辑 `content/meta/categories.json`
2. 在对应部分添加新条目
3. 更新本文档

### 添加新题目

1. 在对应分类目录下创建 Markdown 文件
2. 使用标准 frontmatter 格式
3. 确保 tags 准确描述内容

### 题目自动收集

使用 `auto-interview-collector` 技能自动收集：

```bash
python scripts/collect.py --count 10 --manual
```

配置定时任务：

```bash
bash scripts/setup-cron.sh
```

---

## 版本历史

- **v2.0** (2026-03-29) - 混合分类体系，新增岗位角色和技术专区
- **v1.0** (2026-03-xx) - 初始版本，仅技术分类

---

## 反馈与建议

欢迎通过 GitHub Issues 提出改进建议：
https://github.com/xueshuai/ai-interview-questions/issues
