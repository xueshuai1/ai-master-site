import { Article } from '../knowledge';

export const article: Article = {
    id: "agent-guide",
    title: "AI Agent 实战学习导览",
    category: "agent",
    tags: ["AI Agent", "学习导览", "工具调用", "Multi-Agent", "Function Calling", "MCP"],
    summary: "从 LLM 应用到自主 Agent 的进阶路线。系统学习感知、规划、记忆、工具调用四大核心组件，掌握 Function Calling、MCP 协议和多 Agent 协作架构。",
    date: "2026-04-16",
    readTime: "15 min",
    level: "入门",
    content: [
        {
            title: "0. 什么是 AI Agent？",
            body: `LLM 能回答问题，但不能帮你完成一个完整的任务。

AI Agent = LLM + 自主规划 + 工具调用 + 记忆

打个比方：
- LLM 是一个聪明的顾问（给你建议）
- Agent 是一个能干的员工（帮你干活）

2026 年，AI Agent 已经成为最热门的开发方向。Claude Code、Cursor、Devin、Manus……这些都是 Agent 产品。它们之所以强大，不是因为模型本身多聪明，而是因为Agent 架构让 LLM 具备了自主行动的能力。

### 传统应用 vs Agent 应用

传统应用是代码驱动的——程序员写好所有逻辑，用户按固定流程操作。Agent 应用是目标驱动的——你告诉 Agent「帮我做一件事」，它自己规划步骤、调用工具、完成目标。这是软件开发范式的根本性转变。`,
            mermaid: `graph TD
    subgraph "传统应用（代码驱动）"
        T1["用户输入"] --> T2["固定业务逻辑"]
        T2 --> T3["预设输出"]
        style T2 fill:#1e3a5f,stroke:#2563eb,color:#fff
    end
    
    subgraph "Agent 应用（目标驱动）"
        A1["用户目标描述"] --> A2["Agent 自主规划"]
        A2 --> A3["调用工具 API"]
        A3 --> A4["观察执行结果"]
        A4 --> A5{"目标达成？"}
        A5 -->|"否"| A2
        A5 -->|"是"| A6["最终交付"]
        style A2 fill:#1e3a5f,stroke:#2563eb,color:#fff
        style A3 fill:#1e3a5f,stroke:#2563eb,color:#fff
        style A5 fill:#b91c1c,stroke:#dc2626,color:#fff
    end`,
        },
        {
            title: "1. Agent 四大核心组件",
            body: `一个完整的 AI Agent 由四大核心组件构成，缺一不可：

### 1.1 感知模块（Perception）

Agent 需要理解用户意图和环境状态。这不仅仅是解析文本，还包括：
- 理解用户的真实需求（用户说"帮我查个东西"，到底要查什么？）
- 感知工具的能力边界（哪个工具能解决这个问题？）
- 读取环境上下文（当前在哪个页面？之前做了什么？）

### 1.2 规划模块（Planning）

将复杂目标拆解为可执行的步骤序列。规划分为两种策略：
- 单步规划：目标简单，直接生成行动计划
- 多步规划：目标复杂，需要递归分解（类似人类的"分而治之"思维）

### 1.3 记忆模块（Memory）

Agent 需要保持上下文，否则每次交互都是"失忆"状态。记忆分为三层：
- 短期记忆：当前对话上下文（对话历史）
- 长期记忆：跨会话的知识存储（用户偏好、历史记录）
- 工作记忆：当前任务的中间状态（做到哪一步了？）

### 1.4 工具执行模块（Tool Execution）

Agent 通过工具调用来改变外部世界。核心能力包括：
- Function Calling：LLM 输出结构化函数调用
- MCP 协议：Model Context Protocol，标准化的工具接入方式
- 代码执行：在沙箱中运行 Python/Node.js 代码`,
            mermaid: `graph TD
    User["用户输入"] --> Perception
    
    subgraph "Agent 核心架构"
        Perception["🧠 感知模块<br/>意图理解 + 环境感知"]
        Planning["📋 规划模块<br/>任务分解 + 策略选择"]
        Memory["💾 记忆模块<br/>短期/长期/工作记忆"]
        Tools["🔧 工具执行<br/>API 调用 + 代码执行 + MCP"]
        
        Perception --> Planning
        Planning --> Tools
        Memory -.->|"读写上下文"| Planning
        Memory -.->|"提供历史"| Perception
        Tools -->|"执行结果反馈"| Planning
    end
    
    Planning --> Output["✅ 最终交付"]
    
    style Perception fill:#1e3a5f,stroke:#2563eb,color:#fff
    style Planning fill:#1e3a5f,stroke:#2563eb,color:#fff
    style Memory fill:#1e3a5f,stroke:#2563eb,color:#fff
    style Tools fill:#1e3a5f,stroke:#2563eb,color:#fff`,
        },
        {
            title: "2. 工具调用实战路线",
            body: `工具调用是 Agent 区别于普通 LLM 的最核心能力。学习路线如下：

### 第一阶段：Function Calling（基础）

Function Calling 是让 LLM 输出结构化 JSON 描述「我要调用哪个函数、传什么参数」。这是最基础的工具调用方式。

关键要点：
- 工具描述要精准：LLM 靠工具的名称和描述决定调用哪个
- 参数校验不能少：LLM 可能生成格式错误的参数，必须校验
- 错误处理要完善：工具调用失败时，LLM 需要知道如何重试或换方案

### 第二阶段：MCP 协议（进阶）

Model Context Protocol（模型上下文协议）是 Anthropic 提出的标准化工具接入协议。它解决了 Function Calling 的核心痛点：每个应用都要重新定义工具接口。

MCP 的核心优势：
- 统一接口：一次实现，多个 LLM 都能用
- 动态发现：Agent 能自动发现可用的工具列表
- 上下文传递：工具可以读取 Agent 的上下文信息

### 第三阶段：代码执行（高级）

让 Agent 在沙箱环境中执行代码，是最强大的工具调用形式。Claude Code、Devin 等产品都是基于这种方式。

关键挑战：
- 安全性：沙箱隔离，防止恶意代码
- 可观测性：实时监控代码执行状态
- 回滚能力：执行出错时能恢复`,
        },
        {
            title: "3. Multi-Agent 协作架构",
            body: `当单个 Agent 无法完成复杂任务时，就需要多 Agent 协作。这是 Agent 发展的下一个阶段。

### 为什么需要 Multi-Agent？

单个 Agent 的问题是：能力有限、上下文有限、容易迷失在复杂任务中。多个专业化 Agent 分工协作，可以解决更复杂的问题。

### 常见的 Multi-Agent 模式

模式 1：分工协作（最常用）
- 研究员 Agent → 搜索信息
- 写手 Agent → 生成内容
- 审核 Agent → 质量检查

模式 2：审查-修正
- 主 Agent 生成方案
- 审核 Agent 提出批评
- 主 Agent 根据批评修正

模式 3：辩论模式
- 两个 Agent 从不同角度分析问题
- 通过辩论找到最优方案`,
            mermaid: `graph TD
    subgraph "Multi-Agent 协作架构"
        User["用户目标"] --> Orchestrator
        
        Orchestrator["🎯 编排 Agent<br/>任务分解 + 分配 + 整合"]
        
        Orchestrator -->|"研究任务"| Researcher
        Orchestrator -->|"写作任务"| Writer
        Orchestrator -->|"审核任务"| Reviewer
        
        Researcher["🔍 研究员 Agent<br/>搜索 + 分析 + 提取"]
        Writer["✍️ 写手 Agent<br/>生成 + 编辑 + 格式化"]
        Reviewer["🧪 审核 Agent<br/>质检 + 纠错 + 评分"]
        
        Researcher -->|"研究报告"| Writer
        Writer -->|"草稿"| Reviewer
        Reviewer -->|"修改意见"| Writer
        Reviewer -->|"通过"| Final
        Writer -->|"修订稿"| Reviewer
        
        Final["✅ 最终交付"]
    end
    
    style Orchestrator fill:#1e3a5f,stroke:#2563eb,color:#fff
    style Reviewer fill:#b91c1c,stroke:#dc2626,color:#fff`,
        },
        {
            title: "4. 学习路线与实战项目",
            body: `### 推荐学习路线

第 1 步：Agent 基础组件（2-3 天）
→ 理解感知、规划、记忆、工具调用四大组件

第 2 步：工具调用实战（2-3 天）
→ Function Calling、MCP 协议、外部工具集成

第 3 步：Multi-Agent 协作（2-3 天）
→ 多角色分工、通信协议、复杂任务编排

前置要求：已经学过 LLM 应用开发（会用 API）

### 实战项目建议

学完后可以动手做的 Agent 项目：

- 研究助手 Agent — 自动搜索网页、整理信息、生成报告
- 代码审查 Agent — 自动审查 PR、提建议、创建评论
- 数据分析 Agent — 接收 CSV，自动分析、生成图表和洞察
- 客服 Agent — 多轮对话、调用知识库、转人工

> 关键心态转变：从"让 AI 回答问题"到"让 AI 完成任务"。`,
            tip: "💡 建议从 Claude Code 或 Cline 开始，亲自体验 Agent 自主完成任务的过程，再学习如何自己构建 Agent。",
            mermaid: `graph LR
    A["第1步<br/>基础组件<br/>2-3天"] -->|"掌握四大组件"| B["第2步<br/>工具调用<br/>2-3天"]
    B -->|"Function Calling + MCP"| C["第3步<br/>Multi-Agent<br/>2-3天"]
    C -->|"分工协作 + 编排"| D["实战项目<br/>自主构建"]
    
    D --> P1["研究助手"]
    D --> P2["代码审查"]
    D --> P3["数据分析"]
    D --> P4["智能客服"]
    
    style A fill:#1e3a5f,stroke:#2563eb,color:#fff
    style B fill:#1e3a5f,stroke:#2563eb,color:#fff
    style C fill:#1e3a5f,stroke:#2563eb,color:#fff
    style D fill:#b91c1c,stroke:#dc2626,color:#fff`,
        },
    ]
};
