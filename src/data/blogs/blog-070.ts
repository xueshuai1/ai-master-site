// OpenAI Agents Python SDK 深度解读：多 Agent 工作流新范式

import type { BlogPost } from './blog-types';

export const blog: BlogPost = {
  id: "blog-070",
  author: "AI Master",
  title: "OpenAI Agents Python SDK 深度解读：多 Agent 工作流新范式与 2026 年框架全景对比",
  category: "agent",
  tags: ["OpenAI Agents SDK", "多 Agent 编排", "Handoff 模式", "Sandbox Agent", "Guardrails", "CrewAI", "LangGraph", "AutoGen", "multica", "Agent 框架对比", "2026 前沿"],
  summary: "OpenAI 官方发布的 Agents Python SDK 以 25K 星成为本周 GitHub AI 趋势榜首。它引入了 Handoff 委托、Guardrails 安全防护、Sandbox Agent 沙箱执行、Realtime Voice Agent 实时语音等创新概念。本文深度解析 OpenAI Agents SDK 的完整架构，将其与 CrewAI、LangGraph、AutoGen 3.0、multica 进行系统对比，并提供多 Agent 协作系统的完整 Python 实战代码，帮助开发者在 2026 年的 Agent 框架生态中做出正确选择。",
  date: "2026-04-25",
  readTime: 42,
content: [
    {
      title: "0. 引言：OpenAI 为什么要发布自己的 Agent SDK？",
      body: `**2026 年 4 月**，OpenAI 正式发布 Agents Python SDK（openai/openai-agents-python），两周内突破 **25,000 stars**，成为 GitHub AI 领域最受关注的新项目。

这个时间点值得深思：在此之前，CrewAI、LangGraph、AutoGen 等第三方框架已经统治了多 Agent 编排领域。OpenAI 的入局不是为了重复造轮子，而是为了解决一个核心问题——**第三方框架与 OpenAI 模型能力之间存在能力断层**。

OpenAI Agents SDK 的设计哲学可以用一句话概括：**"Lightweight yet powerful"**——轻量但强大。它不做厚重的编排层，而是把复杂能力下沉到 API 层，让开发者用最少的代码构建最复杂的 Agent 工作流。

### 核心差异化定位

| 维度 | CrewAI/LangGraph/AutoGen | OpenAI Agents SDK |
|------|-------------------------|-------------------|
| 设计目标 | 通用多 Agent 编排框架 | 与 OpenAI 模型深度集成的工作流框架 |
| 学习曲线 | 需要理解特定 DSL 和编排概念 | Python 原生，几乎零学习成本 |
| 供应商锁定 | 无（支持任意 LLM） | 默认 OpenAI，但支持 LiteLLM/any-llm 接入任意模型 |
| 核心创新 | 角色定义、图编排、群体协商 | Handoff 委托、Guardrails 安全、Sandbox 沙箱 |
| 生产就绪度 | 成熟，大量生产案例 | 新发布，API 设计面向生产 |

在深入技术细节之前，我们先看 SDK 的完整架构。`,
      mermaid: `graph TD
    subgraph AppLayer["应用层"]
        App["你的应用"]
    end
    subgraph AgentLayer["Agent 层"]
        A1["Agent A"]
        A2["Agent B"]
        A3["Sandbox Agent"]
        A4["Realtime Agent"]
    end
    subgraph CoreLayer["核心能力层"]
        H["Handoffs 委托机制"]
        T["Tools 工具系统"]
        G["Guardrails 安全防护"]
        S["Sessions 会话管理"]
        Tr["Tracing 追踪系统"]
        HiL["Human in the Loop"]
    end
    subgraph ModelLayer["模型层"]
        R["Responses API"]
        C["Chat Completions API"]
        L["LiteLLM / 100+ 其他模型"]
    end
    App --> A1
    App --> A2
    App --> A3
    App --> A4
    A1 --> H
    A1 --> T
    A1 --> G
    A1 --> S
    A2 --> H
    A2 --> T
    A2 --> G
    A3 --> T
    A3 --> Tr
    A4 --> R
    H --> R
    T --> R
    T --> L
    G --> R
    S --> R
    Tr --> C
    HiL --> S`
    },
    {
      title: "1. Agent 定义与 Handoff 机制",
      body: `OpenAI Agents SDK 的 Agent 定义极其简洁——只需要 \`name\`、\`instructions\` 和可选的 \`tools\`。但真正的威力在于 **Handoff 委托机制**。

Handoff 是 OpenAI Agents SDK 最核心的创新。它允许一个 Agent **在运行时动态决定**将任务委托给另一个更专业的 Agent，类似于人类工作中的 "转接给专家"。

**与 CrewAI 角色分配的本质区别**：CrewAI 在任务定义时静态分配角色，而 Handoff 是 Agent 在理解用户需求后**自主决策**的委托行为。`,
      mermaid: `graph TD
    U["用户输入"] --> T["Triage Agent"]
    T --> D{"分析意图"}
    D -->|"需要搜索"| R["Researcher Agent"]
    D -->|"需要分析"| AN["Analyst Agent"]
    D -->|"需要撰写"| W["Writer Agent"]
    R --> R1["执行 search_web"]
    AN --> AN1["执行 analyze_data"]
    W --> W1["执行 format_report"]
    R1 --> J["返回结果到上下文"]
    AN1 --> J
    W1 --> J
    J --> K{"还有子任务?"}
    K -->|"是"| D
    K -->|"否"| OUT["Triage 汇总输出"]
    OUT --> USER["返回给用户"]`,
      code: [
        {
          lang: "python",
          title: "基础 Agent 定义与 Handoff 配置",
          code: `from agents import Agent, Runner, handoff
import asyncio

# 定义三个专业 Agent
researcher = Agent(
    name="Researcher",
    instructions="你是一个资深研究员。搜索、分析并总结信息。",
)

analyst = Agent(
    name="Analyst",
    instructions="你是一个数据分析师。分析数据并提取关键洞察。",
)

writer = Agent(
    name="Writer",
    instructions="你是一个专业报告撰写人。将研究结果格式化为报告。",
)

# Triage Agent 作为调度中心
triage = Agent(
    name="Triage",
    instructions="""你是一个智能调度员。分析用户需求：
- 需要搜索信息 -> 委托给 Researcher
- 需要数据分析 -> 委托给 Analyst
- 需要撰写报告 -> 委托给 Writer
先判断需要什么，再决定委托顺序。""",
    handoffs=[
        handoff(researcher),
        handoff(analyst),
        handoff(writer),
    ],
)

# 运行多 Agent 协作
async def main():
    result = await Runner.run(
        triage,
        "研究 2026 年 AI Agent 框架发展趋势，撰写对比报告"
    )
    print(result.final_output)

if __name__ == "__main__":
    asyncio.run(main())`
        }
      ]
    },
    {
      title: "2. Tools 工具系统与 Sandbox Agent",
      body: `**Sandbox Agent**（v0.14.0 新增）是 SDK 中最具突破性的功能之一。它允许 Agent 在**隔离的容器环境**中执行真实操作——读写文件、运行命令、安装依赖，而不会危及宿主系统。

这在 AI 编程助手场景中至关重要：Claude Code、Codex 等工具之所以强大，正是因为它们能在安全环境中执行代码。Sandbox Agent 将这种能力标准化并开放给所有开发者。`,
      code: [
        {
          lang: "python",
          title: "自定义工具与 Sandbox Agent 实战",
          code: `from agents import Agent, Runner, function_tool
from agents.run import RunConfig
from agents.sandbox import Manifest, SandboxAgent, SandboxRunConfig
from agents.sandbox.entries import GitRepo
from agents.sandbox.sandboxes import UnixLocalSandboxClient

# ========== 自定义工具 ==========

@function_tool
def search_web(query: str) -> str:
    """搜索网络获取最新信息"""
    # 实际项目中接入 SerpAPI、Tavily 等
    import urllib.request
    import json
    url = f"https://api.example.com/search?q={query}"
    # return urllib.request.urlopen(url).read().decode()
    return f"搜索结果: {query}"

@function_tool
def analyze_data(data: str) -> str:
    """分析数据并提取关键洞察"""
    lines = data.split('\\n')
    insights = []
    for i, line in enumerate(lines[:5]):
        insights.append(f"发现 {i+1}: {line.strip()}")
    return "\\n".join(insights)

# ========== Sandbox Agent 沙箱执行 ==========

sandbox_agent = SandboxAgent(
    name="Workspace Assistant",
    instructions="你可以在沙箱中执行任何操作。先检查工作区，再回答问题。",
    default_manifest=Manifest(
        entries={
            "repo": GitRepo(
                repo="user/my-project",
                ref="main"
            ),
            "tools": {"python": "3.12", "pip": True}
        }
    ),
)

result = Runner.run_sync(
    sandbox_agent,
    "克隆仓库，运行测试，如果失败则修复并重试",
    run_config=RunConfig(
        sandbox=SandboxRunConfig(
            client=UnixLocalSandboxClient()
        )
    ),
)
print(result.final_output)`
        }
      ]
    },
    {
      title: "3. Guardrails 安全防护系统",
      body: `Guardrails 是生产级 Agent 系统的必备能力。OpenAI Agents SDK 提供了**可配置的输入和输出验证层**，可以在消息到达 LLM 之前或之后进行安全检查。

输入护栏可以在用户消息到达 Agent 之前进行过滤，防止提示注入攻击。输出护栏可以确保 Agent 不会泄露敏感信息如密码、API Key 等。`,
      code: [
        {
          lang: "python",
          title: "输入/输出 Guardrails 完整实现",
          code: `from agents import Agent, Runner
from agents.guardrail import InputGuardrailResult, OutputGuardrailResult
import re

# ========== 输入护栏：防止提示注入 ==========

def prompt_injection_guardrail(context, agent, input_text):
    """检测并阻止提示注入攻击"""
    attack_patterns = [
        "ignore previous",
        "system prompt",
        "disregard all",
        "forget everything",
        "you are now",
    ]
    for pattern in attack_patterns:
        if pattern in input_text.lower():
            return InputGuardrailResult(
                tripwire_triggered=True,
                output=f"安全警告：检测到潜在的提示注入攻击模式 '{pattern}'"
            )
    return InputGuardrailResult(tripwire_triggered=False)

# ========== 输出护栏：防止 PII 泄露 ==========

def pii_guardrail(context, agent, output_text):
    """防止个人身份信息泄露"""
    pii_patterns = [
        (r'\\b\\d{3}-\\d{2}-\\d{4}\\b', 'SSN'),
        (r'\\b\\d{16}\\b', '信用卡号'),
        (r'[\\w.+-]+@[\\w-]+\\.[\\w.]+', '邮箱地址'),
    ]
    for pattern, pii_type in pii_patterns:
        if re.search(pattern, output_text):
            return OutputGuardrailResult(
                tripwire_triggered=True,
                output=f"[已过滤：检测到 {pii_type}]"
            )
    return OutputGuardrailResult(tripwire_triggered=False)

# ========== 安全 Agent ==========

safe_agent = Agent(
    name="Safe Assistant",
    instructions="你是一个安全助手。回答问题时确保不泄露敏感信息。",
    input_guardrails=[prompt_injection_guardrail],
    output_guardrails=[pii_guardrail],
)

result = Runner.run_sync(safe_agent, "Hello!")
print(result.final_output)`
        }
      ]
    },
    {
      title: "4. 2026 年 Agent 框架全景对比",
      body: `2026 年的多 Agent 框架生态已经非常成熟。以下是主要框架的全面对比：`,
      table: {
        headers: ["框架", "GitHub Stars", "核心范式", "学习曲线", "内置安全", "沙箱执行", "实时语音", "最佳场景"],
        rows: [
          ["OpenAI Agents SDK", "25,000", "Handoff 委托", "⭐⭐ 极简", "✅ Guardrails", "✅ Sandbox", "✅ Realtime", "快速原型 + 生产"],
          ["CrewAI", "27,000", "角色驱动", "⭐⭐⭐ 中等", "❌ 需自实现", "⚠️ 需自实现", "❌", "角色扮演工作流"],
          ["LangGraph", "30,000", "有状态图", "⭐⭐⭐⭐ 较陡", "❌ 需自实现", "❌ 需自实现", "❌", "复杂状态机"],
          ["AutoGen 3.0", "28,000", "群聊协商", "⭐⭐⭐⭐ 较陡", "❌ 需自实现", "❌ 需自实现", "❌", "多 Agent 协商"],
          ["multica", "20,500", "任务看板", "⭐⭐ 简单", "⚠️ 部分", "✅ Runtime", "❌", "团队 AI 管理"],
          ["Hermes Agent", "114,754", "自进化", "⭐⭐⭐⭐ 较陡", "⚠️ 内置", "✅ 沙箱", "⚠️", "自主进化 Agent"],
        ]
      },
      mermaid: `graph TD
    subgraph Lightweight["轻量级框架"]
        OAI["OpenAI Agents SDK"]
        MUL["multica"]
        HER["Hermes Agent"]
        GEN["GenericAgent"]
    end
    subgraph Heavyweight["重量级框架"]
        CRE["CrewAI"]
        LG["LangGraph"]
        AG["AutoGen 3.0"]
    end
    subgraph UseCase["使用场景分类"]
        Quick["快速原型"] --> OAI
        Prod["生产级应用"] --> OAI
        Team["团队管理"] --> MUL
        Complex["复杂工作流"] --> LG
        Role["角色扮演"] --> CRE
        Evolve["自进化"] --> HER
        Evolve --> GEN
        Negotiate["多 Agent 协商"] --> AG
    end`,
      code: [
        {
          lang: "python",
          title: "完整多 Agent 研究系统实战",
          code: `from agents import Agent, Runner, handoff, function_tool
import asyncio

# ========== 工具定义 ==========

@function_tool
def search_web(query: str) -> str:
    """搜索网络获取最新信息"""
    return f"搜索结果: {query}"

@function_tool
def analyze_data(data: str) -> str:
    """分析数据并提取关键洞察"""
    lines = data.split('\\n')
    insights = []
    for i, line in enumerate(lines[:5]):
        insights.append(f"发现 {i+1}: {line.strip()}")
    return "\\n".join(insights)

@function_tool
def format_report(content: str, title: str) -> str:
    """格式化研究报告"""
    return f"# {title}\\n\\n{content}\\n\\n---\\n报告生成时间: 2026-04-25"

# ========== Agent 定义 ==========

researcher = Agent(
    name="Researcher",
    instructions="使用 search_web 工具搜索用户指定的主题，返回详细的搜索结果。搜索后委托回 Triage。",
    tools=[search_web],
    handoffs=[handoff("triage")],
)

analyst = Agent(
    name="Analyst",
    instructions="使用 analyze_data 工具分析数据，提取关键洞察。分析后委托回 Triage。",
    tools=[analyze_data],
    handoffs=[handoff("triage")],
)

writer = Agent(
    name="Writer",
    instructions="使用 format_report 工具将内容格式化为专业报告。完成后委托回 Triage。",
    tools=[format_report],
    handoffs=[handoff("triage")],
)

triage = Agent(
    name="Triage",
    instructions="""分析用户需求，委托给合适的专家：
- 需要搜索 -> Researcher
- 需要分析 -> Analyst
- 需要撰写 -> Writer
如果需要多个步骤，依次委托。""",
    handoffs=[
        handoff(researcher),
        handoff(analyst),
        handoff(writer),
    ],
)

# ========== 运行 ==========

async def main():
    result = await Runner.run(
        triage,
        "研究 2026 年 AI Agent 框架发展趋势，分析优缺点，撰写对比报告"
    )
    print("=== 最终输出 ===")
    print(result.final_output)

if __name__ == "__main__":
    asyncio.run(main())`
        }
      ]
    },
    {
      title: "5. 趋势展望：2026 年下半年 Agent 框架演进方向",
      body: `基于本周 GitHub Trending 和行业动态，Agent 框架领域呈现出以下明确趋势：

### 5.1 自进化 Agent 成为主流

GenericAgent（6,798 星）和 Evolver（6,783 星）的爆发表明，**自进化能力正在从实验特性变为刚需**。下一代 Agent 框架将内置技能自动发现、参数持续优化和事件驱动进化。

### 5.2 记忆系统标准化

Claude-Mem（66,866 星）的成功证明，**长期记忆是 Agent 的核心竞争力**。未来的框架将内置向量检索 + 知识图谱的混合记忆架构，支持记忆压缩和跨会话持久化。

### 5.3 管理平台化

multica（20,559 星）的崛起表明，企业和团队需要**统一的 Agent 管理平台**——不仅仅是开发框架，还包括任务分配、进度追踪、技能复用和团队协作。

### 5.4 实时语音 Agent 爆发

OpenAI Agents SDK 内置的 Realtime Agent 支持（基于 gpt-realtime-1.5）和 voicebox（23,064 星）的流行表明，**语音交互正在成为 Agent 的标准接口**。

### 如何选择适合你的框架？

| 你的需求 | 推荐框架 | 理由 |
|----------|----------|------|
| 快速构建原型 | OpenAI Agents SDK | API 极简，5 分钟上手 |
| 生产级安全需求 | OpenAI Agents SDK | 内置 Guardrails |
| 团队 AI 管理 | multica | 看板 + 技能复用 |
| 复杂状态机 | LangGraph | 图结构精确控制 |
| 角色分工协作 | CrewAI | 角色定义清晰 |
| 自主进化能力 | Hermes/GenericAgent | 自进化架构 |

### 快速开始指南

\`\`\`bash
pip install openai-agents
export OPENAI_API_KEY="your-key-here"
\`\`\`

更多信息：[GitHub 仓库](https://github.com/openai/openai-agents-python) | [官方文档](https://openai.github.io/openai-agents-python/)`
    }
  ],
};
