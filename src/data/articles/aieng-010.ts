import { Article } from '../knowledge';

export const article: Article = {
    id: "aieng-010",
    title: "Harness Engineering：AI Agent 时代的工程范式革命",
    category: "aieng",
    tags: ["Harness", "Agent 框架", "工程化", "编排", "LangGraph", "CrewAI", "AutoGen"],
    summary: "2026 年 AI 领域最重要的趋势不是模型本身，而是 Harness Engineering —— 围绕模型构建的工具使用、任务编排、多步执行的控制系统。深入解析主流 Harness 框架对比、选型策略与实战指南。",
    date: "2026-04-15",
    readTime: "25 min",
    level: "进阶",
    content: [
      {
        title: "1. 什么是 Harness？从模型到行动者的关键一跃",
        body: `2026 年 3-4 月，AI 领域最热门的概念不是某个新模型，而是一个工程范式：**Harness Engineering**（智能体控制系统工程）。

要理解 Harness，先看一个类比：马的力量再大，没有缰绳和 harness（马具）也拉不了车。同样的道理，一个强大的 LLM 如果没有 harness 系统，也只能被动地"你问我答"。

**Harness 的定义**：一个让 AI 能够使用工具、采取行动、自主完成多步任务的系统框架。它是模型与现实世界之间的"控制层"。

宾夕法尼亚大学沃顿商学院教授 Ethan Mollick 在 2026 年 2 月发表的文章中明确指出：
> "Until recently, you didn't have to know this. The model was the product, the app was the website, and the harness was minimal. Now the same model can behave very differently depending on what harness it's operating in."

同一个 Claude Opus 4.6 模型，在 claude.ai 网站上只能聊天和搜索网页，但在 Claude Code 的 harness 中，它可以获得虚拟电脑、浏览器、终端，自主完成整个网站的开发和测试。

**Harness 的三层架构**：
- **模型层**：LLM 作为"大脑"，提供推理、理解、生成能力
- **Harness 层**：工具调用、上下文管理、任务规划、错误恢复 —— 这是本文的核心
- **应用层**：面向用户的产品界面（网站、IDE、桌面应用等）

2026 年行业共识：**模型能力已经趋同，真正的差异化在于 Harness 层**。`,
        mermaid: `graph TD
    A["用户目标"] --> B["应用层\\n产品界面"]
    B --> C["Harness 层\\n工具调用 / 任务规划 / 上下文管理"]
    C --> D["模型层\\nLLM 推理引擎"]
    D --> C
    C --> E["外部工具\\nAPI / 代码执行 / 浏览器"]
    E --> C
    C --> F["执行结果"]`,
        tip: "关键洞察：Gartner 预测到 2026 年底，40% 的企业应用将包含任务特定的 AI Agent（2025 年不到 5%）。Harness 已经从可选工具变成了基础设施。",
      },
      {
        title: "2. 为什么 2026 年是 Harness 之年？",
        body: `Harness Engineering 在 2026 年爆发，有三个深层原因：

**第一，模型趋同**。2026 年的前沿模型（Claude Opus 4.6、GPT-5.2、Gemini 3 Pro）在基础能力上已经非常接近。Hacker News 上一个被广泛引用的帖子指出：
> "AI 应该被视为 LLM 与其 Harness 组成的完整反馈控制系统 —— Harness 的改进与模型本身的提升同等重要。"

当模型选择不再是瓶颈时，竞争焦点自然转移到了"如何用好模型"这个层面。

**第二，Agent 从原型到生产**。企业不再满足于"能聊天的 AI"，而是需要"能干活的 AI"。McKinsey 的研究显示，80% 的 Agent 实施时间消耗在数据工程、利益相关者对齐和治理上，而不是框架配置或模型选择。

**第三，开源生态成熟**。2026 年初，主流 Harness 框架都达到了生产级成熟度：
- LangGraph：24,000+ GitHub stars，对比基准测试中任务成功率 87%
- CrewAI：45,900+ stars，最快实现多 Agent 原型
- AutoGen/AG2：54,000+ stars，代码沙箱和迭代调试能力强
- Mastra：19,000+ stars，TypeScript 团队首选
- OpenHarness（HKUDS）：9,100 stars，开源 Harness 运行时

Harness.io 公司（AI Software Delivery Platform）甚至入选了 Fortune 2026 美洲最具创新力公司榜单，这标志着 Harness 概念已经从学术讨论走向了商业主流。`,
        table: {
          headers: ["指标", "2025 年", "2026 年", "变化"],
          rows: [
            ["企业 Agent 应用率", "< 5%", "40%（预测）", "8 倍增长"],
            ["主流框架 Stars", "数千级别", "数万级别", "10 倍增长"],
            ["Harness 相关论文/文章", "少量", "大量（Mollick、Atlan 等）", "爆发式增长"],
            ["行业关注点", "哪个模型更好", "哪个 Harness 更好", "范式转移"],
          ],
        },
      },
      {
        title: "3. 主流 Harness 框架深度对比",
        body: `2026 年 4 月 Atlan 发布了对 11 个主流 AI Agent Harness 工具的横评。以下是最关键的 6 个框架对比：

**LangGraph**（Orchestration/全栈）
基于图的多 Agent 编排框架，通过条件边、检查点和流式处理实现对 Agent 状态的精细控制。在 2026 年对比基准测试中达到 87% 任务成功率，是该列表中最高的。适合需要精确状态控制的生产级多 Agent 流水线。集成 LangSmith 提供内置可观测性。缺点是学习曲线陡峭，图配置冗长。

**CrewAI**（基于角色的多 Agent）
最快的多 Agent 原型框架。通过角色定义（如"研究员"、"写作者"、"审稿人"）让多个 Agent 协作完成任务。45,900+ GitHub stars，是角色编排框架中采用率最高的。任务成功率 82%。优点是上手快、API 直观；缺点是对复杂状态流控制不如 LangGraph 精细。

**AutoGen / AG2**（对话式多 Agent）
微软开源的多 Agent 框架，基于对话模式。54,000+ GitHub stars，Stars 数量最高。强项是代码沙箱和迭代调试 —— 多个 Agent 可以通过对话协作完成复杂的编程任务。MIT 协议，完全开源。

**Mastra**（TypeScript 优先）
专为 TypeScript/JavaScript 团队设计的框架。19,000+ stars。内置观察性记忆（observational memory），支持类型安全。对前端全栈团队来说是最自然的选择。

**LangChain deepagents**（全栈 Agent Harness）
LangChain 生态的全栈 Agent 解决方案，126,000+ 生态系统 stars。擅长复杂长周期任务，利用 LangChain 生态的丰富工具集成。

**Microsoft Semantic Kernel**（企业编排）
面向 .NET 和 Microsoft 生态的企业级编排框架。27,000+ stars。与 Azure RBAC 深度集成，适合已经在 Microsoft 技术栈中的企业。`,
        table: {
          headers: ["框架", "架构", "GitHub Stars", "最佳场景", "任务成功率", "协议"],
          rows: [
            ["LangGraph", "图状编排", "24,000+", "精确状态控制", "87%", "MIT"],
            ["CrewAI", "角色多Agent", "45,900+", "快速原型", "82%", "OSS+付费"],
            ["AutoGen/AG2", "对话多Agent", "54,000+", "代码沙箱调试", "—", "MIT"],
            ["Mastra", "TS优先", "19,000+", "TS团队", "—", "OSS+企业版"],
            ["LangChain deepagents", "全栈", "126k生态", "长周期任务", "—", "MIT"],
            ["Semantic Kernel", "企业编排", "27,000+", "Azure/Microsoft生态", "—", "MIT+Azure"],
          ],
        },
        warning: "OWASP 2025 年 12 月发布的 Agentic 应用 Top 10 安全威胁中，记忆中毒（Memory Poisoning）和级联失败（Cascading Failures）位居前列 —— 两者都由不良数据输入引起。选择 Harness 时，必须考虑数据治理层。",
      },
      {
        title: "4. Harness 的缺失层：数据治理",
        body: `Atlan 的对比文章指出了一个所有框架共同忽视的问题：**数据质量层**。

所有 11 个 Harness 框架都做了一个基础假设：喂给 Agent 的上下文是可信的。但没有一个框架验证这一点。

McKinsey 的数据很残酷：
- 80% 的 Agent 实施时间消耗在数据工程和治理上
- 8/10 的公司认为数据限制是扩展 Agent 的主要障碍
- 大量被归咎于"LLM 幻觉"的问题，实际上是数据源不一致、过期或部分复制导致的

这意味着，一个完整的 Agent 系统架构应该包含四层：

1. **模型层**：LLM 推理引擎
2. **数据治理层**：验证、认证、追踪上下文数据的来源和质量（Atlan 等工具提供）
3. **Harness 层**：工具调用、任务编排、上下文管理
4. **应用层**：面向用户的产品

如果只关注 Harness 而忽视数据治理，Agent 在生产环境中会遇到大量"幻觉"问题 —— 但其实那不是模型的问题，是数据的问题。`,
        mermaid: `graph TD
    A["应用层\\n用户界面"] --> B["Harness 层\\nLangGraph / CrewAI / AutoGen"]
    B --> C["数据治理层\\n验证 / 认证 / 血缘追踪"]
    C --> D["模型层\\nLLM 推理引擎"]
    D --> C
    C --> E["可信数据源\\n认证表 / 实时元数据"]
    style C fill:#d97706,stroke:#d97706,color:#000`,
        tip: "实际建议：在评估 Harness 框架时，除了比较功能特性，还要评估它与你现有数据治理基础设施的集成能力。没有好的数据，再好的 Harness 也只是给 Agent 提供垃圾输入的管道。",
      },
      {
        title: "5. 如何选择适合你的 Harness 框架？",
        body: `选择 Harness 框架不是选"最好的"，而是选"最适合你的"。以下决策指南：

**场景 1：快速原型验证**
→ CrewAI。角色定义直观，几分钟就能搭建一个多 Agent 协作流程。适合概念验证和快速迭代。

**场景 2：生产级复杂工作流**
→ LangGraph。图状模型提供了最精细的状态控制，87% 的任务成功率也证明了其可靠性。适合需要检查点、流式处理和条件路由的生产环境。

**场景 3：代码开发和调试**
→ AutoGen/AG2。对话式 Agent 协作模式非常适合编程场景，多个 Agent 可以像程序员一样"讨论"和"审查"代码。

**场景 4：TypeScript/前端团队**
→ Mastra。类型安全、与现有 TS 生态无缝集成、内置观察性记忆。前端全栈团队无需学习 Python 生态。

**场景 5：Azure/Microsoft 生态企业**
→ Semantic Kernel。与 Azure 深度集成，RBAC 权限管理原生支持。

**场景 6：避免框架锁定**
→ OpenHarness.ai（MaxGfeller 项目）。提供 Harness 互操作性 SDK，可以在不同框架之间迁移。

**场景 7：需要可观测性和评估**
→ Langfuse（600 万+ SDK 月安装量）或 AgentOps。专注于部署后的监控和评估。`,
        table: {
          headers: ["你的需求", "推荐框架", "关键理由"],
          rows: [
            ["快速原型", "CrewAI", "角色定义直观，上手最快"],
            ["生产级可靠", "LangGraph", "87%成功率，精细状态控制"],
            ["代码开发", "AutoGen/AG2", "对话协作，代码沙箱"],
            ["TS团队", "Mastra", "类型安全，TS生态"],
            ["Azure生态", "Semantic Kernel", "Azure RBAC集成"],
            ["避免锁定", "OpenHarness.ai", "互操作性SDK"],
            ["可观测性", "Langfuse/AgentOps", "部署后监控评估"],
          ],
        },
      },
      {
        title: "6. Harness Engineering 实战：从零构建你的第一个 Agent Harness",
        body: `以 LangGraph 为例，从零构建一个简单的 Agent Harness。

**第一步：环境准备**
安装 LangGraph 和相关依赖。推荐使用 Python 虚拟环境。

**第二步：定义工具**
Harness 的核心价值在于让 Agent 使用工具。你需要定义清晰的工具函数，包括名称、描述、参数和执行逻辑。工具描述越清晰，Agent 的调用决策越准确。

**第三步：构建图（Graph）**
在 LangGraph 中，Agent 的工作流被建模为一个有向图。节点是状态转换步骤，边是条件路由。通过图的结构，你可以精确控制 Agent 的行为流程。

**第四步：添加记忆**
使用检查点（Checkpointer）实现长期记忆。LangGraph 支持 SQLite、PostgreSQL 等多种持久化后端。

**第五步：部署和监控**
集成 LangSmith 或其他可观测性工具，追踪 Agent 的每次决策和执行。监控任务成功率、延迟、工具调用频率等关键指标。

**关键原则**：
1. 工具描述要精确 —— LLM 依靠描述理解工具用途
2. 错误处理要全面 —— Agent 会遇到各种异常情况
3. 记忆设计要分层 —— 短期、长期、工作记忆各司其职
4. 安全护栏要到位 —— 权限控制、输出验证、人工审核`,
        code: [
          {
            lang: "bash",
            code: `# 环境准备
pip install langgraph langchain-openai langsmith
pip install langgraph-checkpoint-sqlite`,
          },
          {
            lang: "python",
            code: `from langgraph.graph import StateGraph, END
from langchain_openai import ChatOpenAI
from typing import TypedDict, Annotated
import operator

# 1. 定义状态
class AgentState(TypedDict):
    messages: Annotated[list, operator.add]
    current_step: str

# 2. 定义工具
def search_tool(query: str) -> str:
    """搜索最新信息"""
    return f"搜索结果: {query}"

def code_tool(code: str) -> str:
    """执行代码"""
    return f"执行结果: {code}"

# 3. 构建图
llm = ChatOpenAI(model="gpt-4o")

def agent_node(state):
    response = llm.invoke(state["messages"])
    return {"messages": [response]}

workflow = StateGraph(AgentState)
workflow.add_node("agent", agent_node)
workflow.set_entry_point("agent")
workflow.add_edge("agent", END)

app = workflow.compile()

# 4. 执行
result = app.invoke({
    "messages": [("user", "帮我搜索最新的AI新闻")],
    "current_step": "start"
})`,
            filename: "my_harness.py",
          },
        ],
        warning: "上面的代码是最简示例。生产级 Harness 需要：完整的工具注册表、条件路由逻辑、错误重试机制、检查点持久化、可观测性集成、安全护栏。不要直接把玩具代码部署到生产环境。",
      },
      {
        title: "7. 未来展望：Harness Engineering 将走向何方？",
        body: `Harness Engineering 正处于快速演进阶段。以下是几个明确的趋势：

**趋势 1：Harness 互操作性**。随着框架数量增加，开发者不希望被锁定在单一框架中。OpenHarness.ai 等项目正在制定跨框架的 Harness 接口标准，类似于 JPA 在 Java 数据库访问中的地位。

**趋势 2：数据治理内建**。下一代 Harness 框架将内置数据质量验证层，而不是依赖外部工具。这意味着 Agent 在读取上下文之前，会自动验证数据来源、新鲜度和认证状态。

**趋势 3：安全原生化**。OWASP Agentic Top 10 的发布只是开始。未来的 Harness 将内置安全护栏：权限边界、输出过滤、人工审核触发器、异常行为检测。

**趋势 4：多模型路由**。Harness 将能够根据任务类型自动选择最优模型 —— 简单任务用便宜快速的小模型，复杂任务用强大的大模型。这与 OpenClaw 的多模型路由理念一致。

**趋势 5：标准化基准测试**。目前各框架的任务成功率（LangGraph 87%、CrewAI 82%）来自独立基准。行业正在推动统一的 Agent 能力评测标准，让框架对比更加客观。

Harness Engineering 不是短期热点，而是 AI 工程化的长期方向。正如 DevOps 在 2010 年代重塑了软件开发流程，Harness Engineering 正在重塑 AI 应用的构建方式。`,
        list: [
          "2026 Q2：预计会出现首个被广泛采用的 Harness 互操作标准",
          "2026 Q3：主流框架将集成数据治理层，解决 80% 的实施时间消耗问题",
          "2026 Q4：企业级 Harness 平台（如 Harness.io）将提供完整的 SDLC AI 化",
          "2027：Harness Engineering 将成为 AI 工程师的核心技能，类似 DevOps 在今天的地位",
        ],
      },
    ],
};
