import { Article } from '../knowledge';

export const article: Article = {
    id: "agent-012",
    title: "AI Agent 多智能体协作框架：从 LangGraph 到 Agent Teams 的演进",
    category: "agent",
    tags: ["多智能体", "协作框架", "LangGraph", "CrewAI", "Agent Teams", "任务编排"],
    summary: "系统梳理 2026 年主流多智能体协作框架的架构差异、适用场景和选型指南。涵盖 LangGraph、CrewAI、OpenAI Agent Teams、Google ADK 等框架的对比分析。",
    date: "2026-04-13",
    readTime: "22 min",
    level: "进阶",
    content: [
        {
            title: "1. 为什么需要多智能体协作？",
            body: `单智能体（Single Agent）已经能够完成很多复杂的编程和推理任务，但在以下场景中，多智能体协作展现出不可替代的价值：

****并行任务处理****： 当任务可以分解为独立的子任务时，多个 Agent 并行执行比单个 Agent 串行执行快数倍。例如，代码审查 + 测试生成 + 文档更新可以同时进行。

****专业化分工****： 不同 Agent 可以专注于不同领域——一个负责代码生成，一个负责安全审计，一个负责性能优化。这种分工比通用 Agent 在每个维度上都表现更好。

****自我校验****： 多个 Agent 可以互相审查彼此的工作，减少"幻觉"和错误。**OpenAI** 的 Swarm 架构和 **Anthropic** 的 Agent Teams 都采用了这种模式。

****复杂工作流****： 涉及多步骤、有条件分支、需要人机协作的复杂流程，单 Agent 难以维持上下文一致性。`,
            mermaid: `graph TD
    A[任务输入] --> B[任务分解器]
    B --> C[Agent A: 代码生成]
    B --> D[Agent B: 安全审计]
    B --> E[Agent C: 测试生成]
    C --> F[结果聚合]
    D --> F
    E --> F
    F --> G[质量校验]
    G --> H[输出结果]`
        },
        {
            title: "2. LangGraph：状态机驱动的多智能体编排",
            body: `**LangGraph** 是 **LangChain** 团队推出的有状态多智能体编排框架，2026 年 GitHub 星标数已突破 122k。

****核心设计理念****：
**LangGraph** 将多智能体协作建模为有向图（Directed Graph），每个节点是一个 Agent 或工具，边定义了执行流。支持循环图，这意味着 Agent 可以迭代式地改进输出。

****关键特性****：
- 持久化（Checkpointing）： 支持中断和恢复，适合人机协作场景。Agent 可以在关键步骤暂停，等待人类审查后继续
****- 条件路由****： 基于上一步的结果动态决定下一步的执行路径
****- 状态管理****： 图状态在整个执行过程中保持不变，避免了上下文丢失问题

****适用场景****： 需要精细控制执行流、支持中断和恢复的生产级应用。`,
            code: [{ lang: "python", code: `from langgraph.graph import StateGraph, END\nfrom typing import TypedDict\n\nclass AgentState(TypedDict):\n    task: str\n    code_result: str\n    final_output: str\n\nworkflow = StateGraph(AgentState)\nworkflow.add_node("coder", code_agent)\nworkflow.add_node("reviewer", security_agent)\nworkflow.add_edge("coder", "reviewer")\nworkflow.add_edge("reviewer", END)\napp = workflow.compile()`, filename: "langgraph_workflow.py" }]
        },
        {
            title: "3. CrewAI：角色驱动的智能体团队",
            body: `**CrewAI** 采用了一种更直觉化的方式——你为每个 Agent 定义角色（Role）、目标（Goal）和背景（Backstory），然后将它们组织成一个 Crew。

****核心设计理念****：
**CrewAI** 模拟真实的人类团队协作。每个 Agent 像一个团队成员，有自己的专业领域和工作风格。**CrewAI** 支持顺序（Sequential）和层级（Hierarchical）两种协作模式。

****关键特性****：
****- 角色定义****： 每个 Agent 有明确的角色、目标和背景故事
****- 任务委派****： 自动将任务分配给最合适的 Agent
****- 协作记忆****： Agent 之间共享上下文和知识
****- 工具集成****： 每个 Agent 可以配备专属工具集

****适用场景****： 需要模拟人类团队协作流程的场景，如研究报告生成、多步骤数据分析。`,
            code: [{ lang: "python", code: `from crewai import Agent, Task, Crew\n\ncode_agent = Agent(\n    role="高级软件工程师",\n    goal="编写高质量、可维护的代码",\n    backstory="你是一位有10年经验的全栈工程师，擅长 Python 和 TypeScript",\n    tools=[code_editor, github_tool]\n)\n\nreview_agent = Agent(\n    role="安全审计专家",\n    goal="发现并修复安全漏洞",\n    backstory="你是一位资深安全研究员，擅长代码审计和渗透测试",\n    tools=[security_scanner]\n)\n\ntask1 = Task(description="实现用户认证模块", agent=code_agent)\ntask2 = Task(description="审查认证模块的安全性", agent=review_agent)\n\ncrew = Crew(agents=[code_agent, review_agent], tasks=[task1, task2])\nresult = crew.kickoff()`, filename: "crewai_example.py" }]
        },
        {
            title: "4. OpenAI Agent Teams 与 Anthropic Agent Teams",
            body: `2026 年，**OpenAI** 和 **Anthropic** 都推出了自己的多 Agent 协作方案。

**OpenAI** Agent Teams：
- 原生支持 GPT 系列模型的多 Agent 编排
- 内置 Guardrails 安全护栏，防止 Agent 执行危险操作
- Handoffs 机制允许 Agent 之间传递控制权
- 与 **OpenAI** API 生态深度集成

**Anthropic** Agent Teams（**Claude** Code）：
- **Claude** Code 2026 年支持多 Agent 并行协作
- 利用 **Claude** 系列模型的强推理能力进行任务分解
- 内置安全对齐机制，Agent 行为更可控
- 终端优先的设计哲学

****对比分析****：
- **OpenAI** Agent Teams 更适合需要精细安全控制的场景
- **Anthropic** Agent Teams 在复杂推理和代码任务上表现更优
- 两者都在快速发展中，API 和功能迭代频繁`,
        },
        {
            title: "5. Google ADK：YAML 配置驱动的多智能体",
            body: `Google ADK（Agent Development Kit） 是 Google 2026 年推出的开源多智能体开发框架，4 月 GitHub 新增 8,200+ 星。

****核心设计理念****：
ADK 采用 YAML 配置 + 可视化编排的方式定义多 Agent 系统，降低了开发门槛。

****关键特性****：
- YAML 配置定义 Agent 角色、工具和协作关系
- 可视化编排界面，支持拖拽式工作流设计
- 与 Google 生态（**Gemini** API、Vertex AI）深度集成
- 支持生产级部署和监控

****适用场景****： 需要快速原型开发和可视化调试的多 Agent 应用。`,
            table: {
                headers: ["框架", "核心范式", "学习曲线", "生产级", "生态", "GitHub 星"],
                rows: [
                    ["LangGraph", "状态机有向图", "陡峭", "是", "LangChain 生态", "122k+"],
                    ["CrewAI", "角色驱动团队", "平缓", "中", "独立生态", "35k+"],
                    ["OpenAI Agent Teams", "Handoff 交接", "中等", "是", "OpenAI 生态", "N/A"],
                    ["Anthropic Agent Teams", "Claude Code 协作", "中等", "是", "Claude 生态", "N/A"],
                    ["Google ADK", "YAML 配置编排", "平缓", "是", "Google 生态", "8.2k+"],
                    ["JetBrains Air", "IDE 内并行", "中等", "中", "JetBrains 生态", "N/A"]
                ]
            },
            tip: "不要过早选择框架——先用简单的单 Agent 方案验证核心逻辑，确定需要多 Agent 协作后再选择框架。",
            warning: "多 Agent 系统的调试复杂度远超单 Agent，建议从 LangGraph 开始（最成熟的检查点和调试能力），再根据需要迁移到其他框架。"
        },
        {
            title: "7. 多智能体协作的未来趋势",
            body: `2026 年多智能体协作领域呈现出以下几个重要趋势：

****趋势一****：从编排到涌现
当前的多 Agent 系统大多是"编排式"的——开发者预先定义好每个 Agent 的角色和协作流程。未来可能出现"涌现式"多 Agent 系统，Agent 能够自主发现协作模式并动态调整。

****趋势二****：Agent 即服务（Agent-as-a-Service）
类似微服务架构，未来可能出现专门的 Agent 服务提供商。企业不需要自己训练和部署 Agent，而是通过 API 调用专业化的 Agent 服务。MCP（Model Context Protocol）正在成为这一趋势的基础设施。

****趋势三****：人类在环（Human-in-the-Loop）的精细化
人机协作从简单的"审批/拒绝"发展为更精细的互动模式——人类可以在 Agent 执行过程中随时介入、提供反馈、调整方向，然后 Agent 继续执行。

****趋势四****：Agent 评估体系的建立
随着多 Agent 系统的普及，如何评估一个 Agent 团队的效能成为关键问题。预计 2026 年下半年将出现标准化的多 Agent 评估基准。

******总结******：
多智能体协作是 2026 年 AI 领域最激动人心的方向之一。它不是简单的"多个 Agent 一起工作"，而是一种全新的问题求解范式——通过专业化分工、并行执行和互相校验，实现超越单一 Agent 能力的系统表现。`,
            mermaid: `graph LR
    A[编排式多Agent] --> B[预定义角色]
    B --> C[固定协作流]
    A --> D[涌现式多Agent]
    D --> E[自主发现协作模式]
    E --> F[动态调整]
    D --> G[MCP 协议连接]
    G --> H[Agent-as-a-Service]`,
            tip: "MCP 协议正在成为多 Agent 系统的基础设施——理解 MCP 比学习某个具体框架更重要，因为它是跨框架的通用协议。",
            warning: "不要在团队还不熟悉单 Agent 开发时就跳跃到多 Agent 架构。多 Agent 系统的调试成本、失败模式和运维复杂度都远高于单 Agent。"
        }
    ]
};
