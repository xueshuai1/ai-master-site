import { Article } from '../knowledge';

export const article: Article = {
    id: "agent-guide",
    title: "AI Agent 实战学习导览",
    category: "agent",
    tags: ["AI Agent", "学习导览", "工具调用", "Multi-Agent"],
    summary: "从 LLM 应用到自主 Agent 的进阶。学习感知、规划、记忆、工具调用四大核心组件，掌握 Function Calling、MCP 协议和多 Agent 协作。",
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

2026 年，AI Agent 已经成为最热门的开发方向。Claude Code、Cursor、Devin、Manus……这些都是 Agent。`,
        },
        {
            title: "1. Agent 四大核心组件",
            body: `AI Agent 包含四大核心组件：

- 感知模块 — 理解用户输入和外部环境
- 规划模块 — 将复杂任务分解为可执行步骤
- 记忆模块 — 保持上下文和历史记录
- 工具执行 — 调用 API、执行代码、读写文件

每个组件都有对应的知识点，按顺序学习即可。`,
        },
        {
            title: "2. 学习路线",
            body: `第 1 步：Agent 基础组件（2-3 天）
→ 理解感知、规划、记忆、工具调用

第 2 步：工具调用实战（2-3 天）
→ Function Calling、MCP 协议、外部工具集成

第 3 步：Multi-Agent 协作（2-3 天）
→ 多角色分工、通信协议、复杂任务编排

前置要求： 已经学过 LLM 应用开发（会用 API）`,
        },
        {
            title: "3. 实战项目建议",
            body: `学完后可以做的 Agent 项目：

- 研究助手 Agent — 自动搜索网页、整理信息、生成报告
- 代码审查 Agent — 自动审查 PR、提建议、创建评论
- 数据分析 Agent — 接收 CSV，自动分析、生成图表和洞察
- 客服 Agent — 多轮对话、调用知识库、转人工

> 关键心态转变： 从"让 AI 回答问题"到"让 AI 完成任务"。`,
            tip: "💡 建议从 Claude Code 或 Cline 开始，亲自体验 Agent 自主完成任务的过程，再学习如何自己构建 Agent。",
        },
        {
            title: "架构图示 1",
            mermaid: `graph TD
    A["概述"] --> B["原理"]
    B --> C["实现"]
    C --> D["应用"]
    D --> E["总结"]`,
        },
        {
            title: "架构图示 2",
            mermaid: `graph TD
    A["概述"] --> B["原理"]
    B --> C["实现"]
    C --> D["应用"]
    D --> E["总结"]`,
        },
    ]
};
