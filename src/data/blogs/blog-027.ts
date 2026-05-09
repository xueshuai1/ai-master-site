import { BlogPost, ArticleSection } from './blog-types';

const content: ArticleSection[] = [
  {
    title: "引言：为什么需要关注 Agent 架构？",
    body: "2025 年初，大多数人还在用 ChatGPT 做问答。到了 2026 年，**AI Agent 已经能自主完成复杂任务链**——写代码、调试、部署、监控。\n\n但 Agent 不是魔法。它的核心是一个**架构模式**，决定了：",
    list: [
      "Agent 能做什么（工具、知识、记忆）",
      "Agent 怎么思考（推理、规划、反思）",
      "Agent 之间怎么协作（分工、通信、协调）",
    ],
    tip: "**选错架构 = Agent 能力上限被锁死。**\n\n本文从零开始，用代码和架构图，系统梳理 Agent 架构的完整演进路径。",
  },
  {
    title: "第一阶段：ReAct — Agent 的起点",
    body: "ReAct（Reasoning + Acting）是最基础的 Agent 模式，核心思想很简单：\n\n> 让模型在\"思考\"和\"行动\"之间交替，每思考一步，可能执行一个动作，观察结果后继续思考。",
    mermaid: `sequenceDiagram
    participant User as 用户
    participant Agent as Agent (LLM)
    participant Tools as 工具/环境
    User->>Agent: 提问："今天北京的天气怎么样？"
    Note over Agent: 思考：需要查天气<br/>决定调用天气API
    Agent->>Tools: 调用 search("北京 天气")
    Tools-->>Agent: 返回：晴，22°C
    Note over Agent: 思考：已有足够信息
    Agent-->>User: 回答："今天北京晴天，气温 22°C"`,
  },
  {
    title: "Python 实现：ReAct Agent",
    code: [{
      lang: "python",
      code: `import openai

class ReActAgent:
    """最简 ReAct Agent 实现"""
    
    def __init__(self, model: str = "gpt-4"):
        self.model = model
        self.tools = {}
        self.history = []
    
    def register_tool(self, name: str, func: callable, desc: str):
        """注册工具"""
        self.tools[name] = {"func": func, "desc": desc}
    
    def _build_prompt(self, query: str) -> str:
        """构建包含工具列表的提示词"""
        tool_list = "\\n".join(
            f"- {name}: {tool['desc']}" 
            for name, tool in self.tools.items()
        )
        return f"""你是一个智能助手。你可以使用以下工具来帮助用户。

可用工具：
{tool_list}

请按照以下格式回答：
Thought: 你在想什么
Action: 你要调用的工具名
Action Input: 工具的输入参数
Observation: 工具的返回结果（由系统填充）
...（可以重复 Thought/Action/Observation 多轮）
Final Answer: 最终回答

用户问题：{query}

请开始："""
    
    def run(self, query: str, max_steps: int = 5) -> str:
        """执行 ReAct 循环"""
        prompt = self._build_prompt(query)
        history = []
        
        for step in range(max_steps):
            # 调用 LLM
            response = openai.ChatCompletion.create(
                model=self.model,
                messages=[{"role": "user", "content": prompt + "\\n".join(history)}]
            )
            text = response.choices[0].message.content.strip()
            history.append(text)
            
            # 解析响应
            if "Final Answer:" in text:
                return text.split("Final Answer:")[1].strip()
            
            if "Action:" in text and "Action Input:" in text:
                action = text.split("Action:")[1].split("Action Input:")[0].strip()
                action_input = text.split("Action Input:")[1].split("Observation:")[0].strip()
                
                # 执行工具
                if action in self.tools:
                    result = self.tools[action]["func"](action_input)
                    history.append(f"Observation: {result}")
                else:
                    history.append(f"Observation: 工具 {action} 不存在")
            else:
                # 没有 Final Answer 也没有 Action，直接返回
                return text
        
        return "达到最大步数限制，未完成推理。"


# === 使用示例 ===

def search_weather(query: str) -> str:
    # 实际应调用天气 API
    return f"{query}: 晴天，22°C，风力 3 级"

agent = ReActAgent()
agent.register_tool("search_weather", search_weather, "查询指定城市的天气信息")

result = agent.run("今天北京天气怎么样？")
print(result)
# 输出: 今天北京晴天，气温 22°C，风力 3 级`,
    }],
  },
  {
    title: "ReAct 的局限性",
    mermaid: `mindmap
  root((ReAct 的局限))
    单步思考
      无法规划多步任务
      容易陷入死循环
    无记忆
      不记住历史教训
      重复犯同样错误
    无自省
      无法检查自己的答案
      幻觉无法自我纠正
    工具有限
      每次只能调用一个工具
      无法并行执行`,
  },
  {
    title: "第二阶段：Plan-and-Execute — 学会规划",
    body: "ReAct 是\"边想边做\"，Plan-and-Execute 是**先想清楚整个计划，再一步步执行**：",
    mermaid: `graph TD
    A[用户请求] --> B[Planner: 生成执行计划]
    B --> C{计划是否完整?}
    C -->|否| D[Re-planner: 调整计划]
    C -->|是| E[Executor: 逐步执行]
    E --> F[收集结果]
    F --> G[Synthesizer: 综合回答]
    D --> E
    G --> H[返回用户]`,
  },
  {
    title: "与 ReAct 的关键区别",
    table: {
      headers: ["维度", "ReAct", "Plan-and-Execute"],
      rows: [
        ["思考方式", "逐步思考，边想边做", "先规划完整计划，再执行"],
        ["适合场景", "简单查询、单步推理", "复杂多步任务（如写论文）"],
        ["容错能力", "低，一步错步步错", "高，可以重新规划"],
        ["Token 消耗", "较少", "较多（需要规划步骤）"],
        ["执行速度", "快", "较慢（多了规划阶段）"],
      ],
    },
  },
  {
    title: "Python 实现：Plan-and-Execute Agent",
    code: [{
      lang: "python",
      code: `from dataclasses import dataclass
from typing import List, Optional

@dataclass
class Step:
    """执行计划中的一个步骤"""
    step_number: int
    description: str
    tool_name: str
    tool_input: str
    result: Optional[str] = None
    status: str = "pending"  # pending | running | done | failed


class PlanAndExecuteAgent:
    """Plan-and-Execute 架构的 Agent"""
    
    def __init__(self, llm, tools: dict):
        self.llm = llm
        self.tools = tools
    
    def plan(self, task: str, max_steps: int = 5) -> List[Step]:
        """LLM 生成执行计划"""
        tool_names = ", ".join(self.tools.keys())
        plan_prompt = f"""任务：{task}

可用工具：{tool_names}

请将任务拆解为最多 {max_steps} 个步骤。
每步指定一个工具。
按 JSON 格式输出：
[
  {{"step": 1, "description": "描述", "tool": "工具名", "input": "输入参数"}},
  ...
]"""
        
        response = self.llm(plan_prompt)
        # 实际应做 JSON 解析，这里简化
        steps_data = self._parse_json(response)
        
        return [
            Step(
                step_number=s["step"],
                description=s["description"],
                tool_name=s["tool"],
                tool_input=s["input"]
            )
            for s in steps_data
        ]
    
    def execute(self, steps: List[Step]) -> List[Step]:
        """逐步执行计划"""
        for step in steps:
            step.status = "running"
            try:
                if step.tool_name in self.tools:
                    step.result = self.tools[step.tool_name](step.tool_input)
                    step.status = "done"
                else:
                    step.result = f"工具 {step.tool_name} 不存在"
                    step.status = "failed"
            except Exception as e:
                step.result = str(e)
                step.status = "failed"
        return steps
    
    def synthesize(self, task: str, steps: List[Step]) -> str:
        """综合执行结果，生成最终回答"""
        results_text = "\\n".join(
            f"步骤 {s.step_number} [{s.status}]: {s.result or '无结果'}"
            for s in steps
        )
        
        synthesize_prompt = f"""任务：{task}

执行结果：
{results_text}

请根据以上结果，给出最终回答。"""
        
        return self.llm(synthesize_prompt)
    
    def run(self, task: str) -> str:
        """完整流程：规划 → 执行 → 综合"""
        plan = self.plan(task)
        executed_steps = self.execute(plan)
        return self.synthesize(task, executed_steps)`,
    }],
  },
  {
    title: "第三阶段：Reflection — 自我纠错",
    body: "LLM 会犯错（幻觉、逻辑错误、代码 bug）。Reflection 模式让 Agent **检查自己的工作，发现并修正错误**。",
    mermaid: `graph LR
    A[生成初稿] --> B[审查]
    B --> C{发现问题?}
    C -->|是| D[修正]
    D --> B
    C -->|否| E[输出最终结果]
    class D s1
    class B s0
    classDef s0 fill:#1e3a5f,color:#fff
    classDef s1 fill:#b91c1c,color:#fff`,
  },
  {
    title: "Reflection 的四种模式",
    mermaid: `graph TD
    A[Reflection 模式] --> B[Self-Correction]
    A --> C[Self-Verification]
    A --> D[Self-Refinement]
    A --> E[Self-Consistency]
    
    B --> B1[检查输出是否有错]
    B1 --> B2[发现错 → 修正]
    
    C --> C1[生成多个候选答案]
    C1 --> C2[投票选出最佳答案]
    
    D --> D1[对输出评分]
    D1 --> D2[根据评分优化]
    
    E --> E1[多次独立推理]
    E1 --> E2[取最一致的答案]`,
  },
  {
    title: "Python 实现：带 Reflection 的 Agent",
    code: [{
      lang: "python",
      code: `class ReflectiveAgent(ReActAgent):
    """带自我纠错能力的 Agent"""
    
    def __init__(self, *args, max_reflections: int = 3, **kwargs):
        super().__init__(*args, **kwargs)
        self.max_reflections = max_reflections
    
    def reflect(self, draft: str, task: str) -> tuple[str, bool]:
        """审查并修正输出
        
        Returns:
            (修正后的输出, 是否需要继续修正)
        """
        reflection_prompt = f"""你是一位严格的审核员。请审查以下回答：

任务：{task}
回答：{draft}

请检查：
1. 回答是否准确？有无幻觉？
2. 逻辑是否严密？
3. 是否有遗漏或错误？

如有问题，请输出修正后的回答。
格式：
Critique: [你的审查意见]
Revised: [修正后的回答，如无修改则保持原样]"""
        
        response = self.llm(reflection_prompt)
        
        # 解析
        if "Revised:" in response:
            revised = response.split("Revised:")[1].strip()
            return revised, revised != draft
        return draft, False
    
    def run_with_reflection(self, task: str) -> str:
        """带 Reflection 的完整流程"""
        # 1. 生成初稿
        draft = self.run(task)
        
        # 2. 多轮审查
        current = draft
        for i in range(self.max_reflections):
            refined, needs_more = self.reflect(current, task)
            current = refined
            if not needs_more:
                break
        
        return current`,
    }],
  },
  {
    title: "第四阶段：多 Agent 协作 — 团队作战",
    body: "当任务复杂度超过单个 Agent 的能力时，就需要**多 Agent 协作**——每个 Agent 专注一个领域，像团队一样工作。",
    mermaid: `graph TD
    subgraph "多 Agent 架构"
        Orchestrator["🎯 编排器\
(理解任务、分配工作)"]
        
        subgraph "Worker Agents"
            Researcher["🔍 研究员\
(搜索、分析)"]
            Coder["💻 程序员\
(写代码、调试)"]
            Reviewer["🧪 审核员\
(测试、审查)"]
            Writer["✍️ 写作者\
(文档、报告)"]
        end
        
        Orchestrator --> Researcher
        Orchestrator --> Coder
        Orchestrator --> Reviewer
        Orchestrator --> Writer
        
        Researcher --> Orchestrator
        Coder --> Orchestrator
        Reviewer --> Orchestrator
        Writer --> Orchestrator
    end
    
    User((👤 用户)) --> Orchestrator
    Orchestrator --> User`,
  },
  {
    title: "常见的多 Agent 架构",
    mermaid: `graph LR
    subgraph "Swarm 模式"
        A1[Agent A] <--> B1[Agent B]
        B1 <--> C1[Agent C]
        C1 <--> D1[Agent D]
        A1 <--> C1
    end
    
    subgraph "Hierarchical 模式"
        Boss[编排器] --> W1[Worker 1]
        Boss --> W2[Worker 2]
        Boss --> W3[Worker 3]
    end
    
    subgraph "Pipeline 模式"
        P1[Agent 1] --> P2[Agent 2]
        P2 --> P3[Agent 3]
    end`,
    table: {
      headers: ["架构", "通信方式", "适合场景", "复杂度"],
      rows: [
        ["**Swarm**", "Agent 之间直接通信", "开放式探索、头脑风暴", "高"],
        ["**Hierarchical**", "编排器 → Worker → 编排器", "结构化任务、项目管理", "中"],
        ["**Pipeline**", "单向传递结果", "流水线处理、数据清洗", "低"],
      ],
    },
  },
  {
    title: "Python 实现：Hierarchical 多 Agent",
    code: [{
      lang: "python",
      code: `from typing import Dict, List, Callable
from dataclasses import dataclass

@dataclass
class AgentMessage:
    """Agent 之间的消息"""
    sender: str
    receiver: str
    content: str
    context: Dict = None


class Agent:
    """单个 Agent"""
    
    def __init__(self, name: str, role: str, system_prompt: str, llm):
        self.name = name
        self.role = role
        self.system_prompt = system_prompt
        self.llm = llm
        self.memory: List[AgentMessage] = []
    
    def receive(self, message: AgentMessage):
        """接收消息，存入记忆"""
        self.memory.append(message)
    
    def think(self, task: str) -> str:
        """思考并回复"""
        context = "\\n".join(f"[{m.sender}]: {m.content}" for m in self.memory[-5:])
        prompt = f"{self.system_prompt}\\n\\n上下文:\\n{context}\\n\\n任务: {task}"
        return self.llm(prompt)


class AgentOrchestrator:
    """多 Agent 编排器"""
    
    def __init__(self, agents: Dict[str, Agent]):
        self.agents = agents
        self.results: List[str] = []
    
    def assign_task(self, agent_name: str, task: str) -> str:
        """分配任务给指定 Agent"""
        if agent_name not in self.agents:
            raise ValueError(f"Agent {agent_name} 不存在")
        
        agent = self.agents[agent_name]
        result = agent.think(task)
        self.results.append(f"[{agent_name}]: {result}")
        return result
    
    def run_pipeline(self, workflow: List[tuple]) -> List[str]:
        """执行流水线任务
        workflow = [
            ("researcher", "搜索最新 Agent 框架"),
            ("coder", "根据调研报告写代码"),
            ("reviewer", "审查代码质量"),
        ]
        """
        results = []
        for agent_name, task in workflow:
            result = self.assign_task(agent_name, task)
            # 将结果广播给所有 Agent
            message = AgentMessage(
                sender="orchestrator",
                receiver=agent_name,
                content=result
            )
            for agent in self.agents.values():
                agent.receive(message)
            results.append(result)
        return results
    
    def get_summary(self) -> str:
        """获取所有 Agent 的工作总结"""
        return "\\n".join(self.results)


# === 使用示例 ===

def mock_llm(prompt: str) -> str:
    # 实际应调用 LLM API
    return f"[模拟 LLM 回复]"

# 创建 Agent 团队
team = AgentOrchestrator({
    "researcher": Agent(
        name="researcher", role="研究员",
        system_prompt="你是一位资深技术研究员。擅长搜索和分析前沿技术。",
        llm=mock_llm
    ),
    "coder": Agent(
        name="coder", role="程序员",
        system_prompt="你是一位全栈工程师。擅长写高质量代码。",
        llm=mock_llm
    ),
    "reviewer": Agent(
        name="reviewer", role="审核员",
        system_prompt="你是一位资深代码审核员。严格把关代码质量。",
        llm=mock_llm
    ),
})

# 执行多 Agent 协作
results = team.run_pipeline([
    ("researcher", "搜索并分析 2026 年最新的 AI Agent 框架"),
    ("coder", "根据调研报告，用 Python 实现一个 ReAct Agent"),
    ("reviewer", "审查 Agent 代码，指出潜在问题和改进建议"),
])

print(team.get_summary())`,
    }],
  },
  {
    title: "架构选择决策树",
    body: "当你需要构建一个 Agent 应用时，该选哪种架构？",
    mermaid: `graph TD
    A[用户需求] --> B{任务是否多步骤?}
    B -->|否| C[直接 LLM 回答]
    B -->|是| D{是否需要工具?}
    D -->|否| E[Chain-of-Thought]
    D -->|是| F{步骤数是否 > 3?}
    F -->|否| G[ReAct Agent]
    F -->|是| H{是否需要自我纠错?}
    H -->|否| I[Plan-and-Execute]
    H -->|是| J[Reflective Agent]
    J --> K{是否涉及多个领域?}
    K -->|否| J
    K -->|是| L[多 Agent 协作]
    class L s3
    class I s2
    class G s1
    class C s0
    classDef s0 fill:#1e3a5f,color:#fff
    classDef s1 fill:#1d4ed8,color:#fff
    classDef s2 fill:#1e3a5f,color:#fff
    classDef s3 fill:#b91c1c,color:#fff`,
  },
  {
    title: "实战案例：用多 Agent 构建知识图谱",
    body: "**任务：** 从一篇技术文章中提取实体关系，构建知识图谱。",
    mermaid: `sequenceDiagram
    participant User as 用户
    participant Orch as 编排器
    participant Parser as 解析 Agent
    participant Extractor as 提取 Agent
    participant Builder as 构建 Agent
    participant Validator as 验证 Agent
    
    User->>Orch: 输入文章文本
    Orch->>Parser: 解析文章结构
    Parser-->>Orch: 段落列表
    Orch->>Extractor: 提取实体和关系
    Extractor-->>Orch: 实体关系列表
    Orch->>Builder: 构建知识图谱
    Builder-->>Orch: 图谱数据
    Orch->>Validator: 验证图谱质量
    Validator-->>Orch: 验证报告
    Orch->>User: 输出最终知识图谱`,
    code: [{
      lang: "python",
      code: `# 完整的多 Agent 知识图谱构建流程
# （简化版，展示架构而非完整实现）

kg_orchestrator = AgentOrchestrator({
    "parser": Agent("parser", "解析员", 
        "你擅长将长文本拆分为结构化段落。", mock_llm),
    "extractor": Agent("extractor", "提取员",
        "你擅长从文本中提取实体（人名、技术、组织）和关系。", mock_llm),
    "builder": Agent("builder", "构建员",
        "你擅长将实体关系数据转换为图数据库格式。", mock_llm),
    "validator": Agent("validator", "验证员",
        "你严格审查知识图谱的质量：完整性、一致性、准确性。", mock_llm),
})

# 执行流水线
kg_results = kg_orchestrator.run_pipeline([
    ("parser", "将以下文章拆分为逻辑段落，标注每个段落的主题。"),
    ("extractor", "从每个段落中提取实体和关系，输出 (实体1, 关系, 实体2) 三元组。"),
    ("builder", "将所有三元组合并为知识图谱，输出 GraphML 格式。"),
    ("validator", "审查知识图谱：是否有重复实体？关系是否一致？"),
])

print(kg_orchestrator.get_summary())`,
    }],
  },
  {
    title: "总结与展望",
    mermaid: `graph TD
    2022 Q4 : ReAct 提出<br/>基础推理+行动循环
    2023 Q1 : Plan-and-Execute<br/>学会规划
    2023 Q2 : Tool-Use 标准化<br/>函数调用成为标配
    2023 Q3 : Reflection 模式<br/>自我纠错
    2023 Q4 : Multi-Agent<br/>Swarm / Hierarchical
    2024 Q1 : Agent 框架百花齐放<br/>LangChain / AutoGen / CrewAI
    2025 : 生产级 Agent 落地<br/>企业级编排、安全、监控
    2026 : Agent 生态成熟<br/>标准化协议、互操作性`,
  },
  {
    title: "关键要点",
    list: [
      "**没有银弹** — 简单任务用 ReAct，复杂任务用多 Agent",
      "**Reflection 是必选项** — 任何生产级 Agent 都应该有自我纠错",
      "**工具决定能力上限** — Agent 再聪明，没有好工具也白搭",
      "**多 Agent 不是银弹** — 多了通信开销、调试难度、成本",
    ],
  },
  {
    title: "未来方向",
    list: [
      "**Agent 互操作协议** — 不同框架的 Agent 能否互相协作？",
      "**Agent 安全** — 如何防止 Agent 执行危险操作？",
      "**Agent 成本优化** — 多 Agent 的 Token 消耗很高，如何优化？",
      "**Agent 评估基准** — 怎么科学地评估一个 Agent 的能力？",
    ],
    tip: "*本文所有代码均可在本地 Python 环境中运行，建议在浏览器中查看代码块并点击「▶ 运行」按钮体验。*",
  },
];

export const blog: BlogPost = {
    id: "blog-027",
    title: "Agentic AI 架构深度解析：从 ReAct 到多 Agent 协作的演进之路",
    date: "2026-04-18",
    readTime: 22,
    summary: "2026 年，AI Agent 已经从概念走向生产级应用。本文系统梳理 Agent 架构的演进脉络：从最基础的 ReAct 模式，到 Plan-and-Execute、Tool-Use、Reflection，再到多 Agent 协作的 Swarm、Hierarchical 架构。附带每种模式的 Python 实现代码和 Mermaid 架构图。",
    tags: ["AI Agent", "架构模式", "ReAct", "多 Agent", "Agent 编排", "LLM 应用"],
    author: "AI Master",
    category: "ai-analysis",
    content,
};
