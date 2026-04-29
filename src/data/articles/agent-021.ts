// Managed Agent 平台与 AI 团队协作：从单兵作战到智能体军团

import { Article } from '../knowledge';

export const article: Article = {
  id: "agent-021",
  title: "Managed Agent 平台与 AI 团队协作：从单兵作战到智能体军团的范式转变",
  category: "agent",
  tags: ["Managed Agent", "多 Agent 协作", "Multica", "Agent 团队", "任务分配", "技能复合", "AI 团队管理", "Agent 编排", "2026 趋势"],
  summary: "2026 年 4 月，AI Agent 正在经历从「单兵作战」到「团队协作」的根本转变。Multica 开源多 Agent 管理平台单周暴涨 7,831 星，总计 16,826 星，提出将编程 Agent 变为「真正的团队成员」——分配任务、追踪进度、累积技能。与此同时，n8n、LangGraph、CrewAI 等平台也在向 Managed Agent 方向演进。本文深度解析 Managed Agent 平台的技术架构、与 Multi-Agent 框架的本质区别、主流平台对比，以及如何在自己的项目中构建 AI 团队协作系统。",
  date: "2026-04-20",
  readTime: "25 min",
  level: "进阶",
  content: [
    {
      title: "1. 为什么 2026 年是「AI 团队」元年？",
      body: `回顾 2025 年，AI Agent 的核心叙事是**「单个 Agent 能做什么」**——能不能自主编码？能不能操作浏览器？能不能调用 API？这些问题的答案在 2025 年底已经基本明朗：单个 Agent 可以在限定场景下完成复杂任务。\n\n但进入 2026 年，问题变成了：**「多个 Agent 如何协作？」**\n\n这不是一个量变，而是一个质变。单个 Agent 无论多强，都有能力边界——上下文窗口有限、专业知识有限、无法同时处理多个独立任务。而 Agent 团队可以通过**分工协作**突破这些限制。\n\n2026 年 4 月，三个信号同时出现，标志着「AI 团队」元年的到来：\n\n- **Multica**（github.com/multica-ai/multica）：开源 Managed Agents 平台，单周暴涨 7,831 星，总计 16,826 星。核心理念是「把编程 Agent 变成真正的团队成员」——你可以给 Agent 分配任务、追踪它的进度、看它累积技能\n- **OpenAI Agents SDK**：标准化 Agent 构建工具链，原生支持 Agent 编排和 Handoff（任务交接）\n- **n8n AI 工作流**（184K 星）：从工作流自动化平台进化为 AI Agent 编排平台，支持多 Agent 协作管道\n\n这些项目的共同点是：**不再把 Agent 当工具，而是当「同事」。**`,
      mermaid: `graph LR
    A["2025: 单 Agent 时代"] -->|"能力天花板
单个 Agent 无法突破"| B["2026: AI 团队时代"]
    
    subgraph 单 Agent 局限
    A1["上下文窗口有限"]
    A2["专业知识有限"]
    A3["无法并行处理"]
    end
    
    subgraph 团队优势
    B1["分工协作"]
    B2["技能互补"]
    B3["并行执行"]
    B4["经验共享"]
    end
    
    A --> A1
    A --> A2
    A --> A3
    B --> B1
    B --> B2
    B --> B3
    B --> B4
    
    C["🔥 Multica
16K+ 星
周增 7,831"] -.-> B
    D["OpenAI Agents SDK"] -.-> B
    E["n8n AI 编排
184K 星"] -.-> B`,
      tip: "Managed Agent 不是 Multi-Agent 的简单升级。Multi-Agent 关注「多个 Agent 如何对话」，Managed Agent 关注「如何管理团队：分配任务、追踪进度、评估绩效、累积技能」。这是从「技术框架」到「管理系统」的跃迁。"
    },
    {
      title: "2. Managed Agent vs Multi-Agent：本质区别",
      body: `很多人会把 Managed Agent 和 Multi-Agent 混为一谈，但它们解决的是不同层次的问题。\n\n### Multi-Agent 框架：关注「对话与协作协议」\n\nMulti-Agent 框架（如 AutoGen、CrewAI、LangGraph 的早期版本）解决的核心问题是：**多个 Agent 之间如何通信和协调**。它们提供的是对话协议、消息传递机制和简单的协作模式（如顺序执行、并行执行、投票决策）。\n\n但 Multi-Agent 框架有一个根本局限：**它们没有「管理」的概念**。没有任务分配系统、没有进度追踪、没有绩效评估、没有技能积累。你手动编排 Agent 的执行顺序，就像手动管理一个团队——可行，但不可扩展。\n\n### Managed Agent 平台：关注「团队运营管理」\n\nManaged Agent 平台在 Multi-Agent 之上增加了一个**管理层（Management Layer）**，解决了以下问题：\n\n1. **任务分配**：根据 Agent 的技能和当前负载，自动或半自动地将任务分配给合适的 Agent\n2. **进度追踪**：实时监控每个 Agent 的任务状态、完成度、遇到的阻塞\n3. **技能累积**：Agent 完成任务后，将获得的经验和技能存入团队知识库\n4. **绩效评估**：评估 Agent 的任务完成质量、速度、资源消耗\n5. **动态扩缩容**：根据任务复杂度，动态增加或减少参与的 Agent 数量\n6. **上下文共享**：Agent 之间的上下文不是简单的消息传递，而是结构化的知识共享\n\n这就好比从「微信群聊」（Multi-Agent）升级到「企业项目管理平台」（Managed Agent）。`,
      mermaid: `graph TD
    subgraph Multi-Agent 框架
    MA1["Agent A"] <-->|"消息传递"| MA2["Agent B"]
    MA2 <-->|"消息传递"| MA3["Agent C"]
    MA3 <-->|"消息传递"| MA1
    end
    
    subgraph Managed Agent 平台
    ML["管理层 Management Layer"]
    
    ML -->|"任务分配"| MA4["Agent A
前端开发"]
    ML -->|"任务分配"| MA5["Agent B
后端开发"]
    ML -->|"任务分配"| MA6["Agent C
测试"]
    
    MA4 -->|"进度汇报"| ML
    MA5 -->|"进度汇报"| ML
    MA6 -->|"进度汇报"| ML
    
    ML --> SK["技能库
Skill Registry"]
    SK -->|"技能注入"| MA4
    SK -->|"技能注入"| MA5
    SK -->|"技能注入"| MA6
    
    ML --> PE["绩效评估
Performance Eval"]
    end
    
    Multi-Agent 框架 -.->|"缺乏"| M1["任务管理"]
    Multi-Agent 框架 -.->|"缺乏"| M2["技能累积"]
    Multi-Agent 框架 -.->|"缺乏"| M3["绩效评估"]`,
      code: [{ lang: "python", filename: "multi_agent_vs_managed.py", code: `"""
对比 Multi-Agent 和 Managed Agent 的实现差异
演示两种范式在任务处理上的本质区别
"""

from dataclasses import dataclass, field
from typing import List, Dict, Optional
from enum import Enum
import time


# ===== Multi-Agent 范式：手动编排 =====

class SimpleMultiAgentSystem:
    """传统 Multi-Agent 系统：手动编排执行顺序"""

    def __init__(self):
        self.agents = {}

    def register_agent(self, name: str, capability: str):
        self.agents[name] = {
            "name": name,
            "capability": capability,
            "completed_tasks": 0,
            "skills": []
        }

    def execute_pipeline(self, task: str, agent_order: List[str]) -> Dict:
        """
        手动指定执行顺序的管道
        缺点：需要开发者预先知道哪个 Agent 做什么
        """
        result = {"task": task, "steps": []}
        current_input = task

        for agent_name in agent_order:
            if agent_name not in self.agents:
                raise ValueError(f"Agent {agent_name} not registered")

            agent = self.agents[agent_name]
            # 模拟 Agent 处理
            step_result = f"[{agent_name}({agent['capability']})] 处理: {current_input}"
            result["steps"].append(step_result)
            agent["completed_tasks"] += 1
            current_input = step_result

        return result


# ===== Managed Agent 范式：自动管理 =====

class TaskPriority(Enum):
    LOW = 1
    MEDIUM = 2
    HIGH = 3
    CRITICAL = 4


@dataclass
class ManagedTask:
    task_id: str
    description: str
    required_skills: List[str]
    priority: TaskPriority
    status: str = "pending"
    assigned_to: Optional[str] = None
    result: Optional[str] = None


@dataclass
class ManagedAgent:
    name: str
    skills: List[str]
    current_load: float = 0.0  # 0-1, 当前负载
    max_load: float = 1.0
    completed_tasks: int = 0
    performance_score: float = 1.0  # 0-1, 绩效评分
    accumulated_knowledge: List[str] = field(default_factory=list)


class ManagedAgentPlatform:
    """Managed Agent 平台：自动任务分配 + 进度追踪 + 技能累积"""

    def __init__(self):
        self.agents: Dict[str, ManagedAgent] = {}
        self.task_queue: List[ManagedTask] = []
        self.skill_registry: Dict[str, List[str]] = {}  # 技能 → 掌握的 Agent 列表
        self.completed_tasks: List[ManagedTask] = []

    def register_agent(self, agent: ManagedAgent):
        self.agents[agent.name] = agent
        # 更新技能注册表
        for skill in agent.skills:
            if skill not in self.skill_registry:
                self.skill_registry[skill] = []
            self.skill_registry[skill].append(agent.name)

    def submit_task(self, task: ManagedTask):
        self.task_queue.append(task)
        self._dispatch()  # 自动调度

    def _find_best_agent(self, task: ManagedTask) -> Optional[str]:
        """智能匹配：找到最适合的 Agent"""
        candidates = []

        for name, agent in self.agents.items():
            # 检查技能匹配度
            skill_match = sum(
                1 for s in task.required_skills if s in agent.skills
            ) / len(task.required_skills) if task.required_skills else 0

            # 检查可用性
            availability = 1.0 - (agent.current_load / agent.max_load)

            # 综合评分：技能匹配(60%) + 可用性(20%) + 历史绩效(20%)
            score = skill_match * 0.6 + availability * 0.2 + agent.performance_score * 0.2

            if skill_match > 0:  # 至少需要一个匹配技能
                candidates.append((name, score))

        if not candidates:
            return None

        # 选择评分最高的 Agent
        candidates.sort(key=lambda x: x[1], reverse=True)
        return candidates[0][0]

    def _dispatch(self):
        """自动任务调度"""
        pending = [t for t in self.task_queue if t.status == "pending"]
        # 按优先级排序
        pending.sort(key=lambda t: t.priority.value, reverse=True)

        for task in pending:
            best_agent = self._find_best_agent(task)
            if best_agent:
                task.status = "running"
                task.assigned_to = best_agent
                self.agents[best_agent].current_load += 0.3
                self._execute_task(task)

    def _execute_task(self, task: ManagedTask):
        """执行任务并累积经验"""
        agent = self.agents[task.assigned_to]

        # 模拟执行
        result = f"Agent '{agent.name}' 完成任务 '{task.description}'"
        task.result = result
        task.status = "completed"

        # 更新 Agent 状态
        agent.completed_tasks += 1
        agent.current_load = max(0, agent.current_load - 0.3)
        agent.performance_score = min(1.0, agent.performance_score + 0.05)

        # 技能累积
        for skill in task.required_skills:
            if skill not in agent.accumulated_knowledge:
                agent.accumulated_knowledge.append(skill)

        self.completed_tasks.append(task)

    def get_team_report(self) -> Dict:
        """生成团队报告"""
        return {
            "total_agents": len(self.agents),
            "total_completed": len(self.completed_tasks),
            "agents": {
                name: {
                    "completed": a.completed_tasks,
                    "skills": a.skills + a.accumulated_knowledge,
                    "performance": round(a.performance_score, 2),
                    "knowledge_count": len(a.accumulated_knowledge)
                }
                for name, a in self.agents.items()
            }
        }


# ===== 使用示例 =====

def demo():
    # --- Multi-Agent 方式 ---
    print("=" * 50)
    print("Multi-Agent 方式（手动编排）")
    print("=" * 50)

    ma = SimpleMultiAgentSystem()
    ma.register_agent("coder", "编码")
    ma.register_agent("reviewer", "代码审查")
    ma.register_agent("tester", "测试")

    result = ma.execute_pipeline(
        "开发用户登录功能",
        ["coder", "reviewer", "tester"]  # 需要手动指定顺序
    )
    for step in result["steps"]:
        print(f"  {step}")

    # --- Managed Agent 方式 ---
    print("\\n" + "=" * 50)
    print("Managed Agent 方式（自动管理）")
    print("=" * 50)

    platform = ManagedAgentPlatform()
    platform.register_agent(ManagedAgent(
        name="FrontendBot",
        skills=["React", "TypeScript", "UI设计"]
    ))
    platform.register_agent(ManagedAgent(ManagedAgent(
        name="BackendBot",
        skills=["Python", "API设计", "数据库"]
    )))
    platform.register_agent(ManagedAgent(
        name="QABot",
        skills=["测试", "性能分析", "安全审查"]
    ))

    # 提交任务，平台自动分配
    platform.submit_task(ManagedTask(
        task_id="T001",
        description="开发用户登录 API",
        required_skills=["Python", "API设计"],
        priority=TaskPriority.HIGH
    ))

    platform.submit_task(ManagedTask(
        task_id="T002",
        description="实现登录页面 UI",
        required_skills=["React", "TypeScript"],
        priority=TaskPriority.MEDIUM
    ))

    platform.submit_task(ManagedTask(
        task_id="T003",
        description="安全渗透测试",
        required_skills=["安全审查", "测试"],
        priority=TaskPriority.CRITICAL
    ))

    report = platform.get_team_report()
    print(f"团队报告：{report['total_agents']} 个 Agent，"
          f"完成 {report['total_completed']} 个任务")
    for name, info in report["agents"].items():
        print(f"  {name}: 完成 {info['completed']} 个任务，"
              f"绩效 {info['performance']}，"
              f"累积知识 {info['knowledge_count']} 项")


if __name__ == "__main__":
    demo()`
      }]
    },
    {
      title: "3. 2026 年主流 Managed Agent 平台对比",
      body: `目前市面上有多个平台正在向 Managed Agent 方向演进，但它们的定位和成熟度差异很大。下面从六个维度进行对比：\n\n**1. Multica（github.com/multica-ai/multica）**\n\nMultica 是 2026 年最引人注目的 Managed Agent 新星。它的核心理念非常清晰：**把编程 Agent 变成真正的团队成员**。你可以在平台上给 Agent 分配任务、追踪进度、查看技能增长曲线。单周 7,831 星的增长说明市场对这种理念的极度认可。\n\n技术特点：\n- 支持多种编程 Agent 接入（Claude Code、Codex、Cursor 等）\n- 内置任务分解引擎，自动将大任务拆解为子任务分配给不同 Agent\n- 技能累积系统：Agent 完成任务后自动提取可复用技能\n- 团队看板：可视化展示每个 Agent 的状态、负载、技能树\n\n**2. n8n（github.com/n8n-io/n8n，184K 星）**\n\nn8n 从一个工作流自动化平台进化为 AI Agent 编排平台。它的优势是**400+ 集成节点**和**可视化工作流构建**，适合需要与非 AI 系统集成的场景。\n\n**3. LangGraph（LangChain 生态）**\n\nLangGraph 提供了强大的图式 Agent 编排能力，适合需要精细控制 Agent 执行流程的场景。但它更偏向「编排框架」而非「管理平台」，需要较多手动配置。\n\n**4. CrewAI**\n\nCrewAI 是最早提出「Agent 团队」概念的框架之一，支持角色定义、任务分配和顺序/层级协作。但它缺少运行时管理和技能累积能力。`,
      table: {
        headers: ["平台", "定位", "任务分配", "进度追踪", "技能累积", "Star 数"],
        rows: [
          ["Multica", "Managed Agent 平台", "✅ 自动+手动", "✅ 实时看板", "✅ 自动提取", "16,826 ⭐"],
          ["n8n", "AI 工作流编排", "✅ 可视化", "✅ 节点状态", "❌", "184,749 ⭐"],
          ["LangGraph", "Agent 编排框架", "⚠️ 手动配置", "⚠️ 需自建", "❌", "38,000+ ⭐"],
          ["CrewAI", "Agent 团队框架", "✅ 角色分配", "❌", "❌", "24,000+ ⭐"],
          ["AutoGen", "Multi-Agent 对话", "❌", "❌", "❌", "38,000+ ⭐"],
          ["OpenAI Agents SDK", "Agent 构建工具", "✅ Handoff", "⚠️ 需自建", "❌", "N/A"]
        ]
      },
      tip: "如果你的需求是「管理多个编程 Agent 协作完成项目」，Multica 是目前最匹配的选择。如果需要「AI 与非 AI 系统集成」，n8n 更合适。如果需要「精细控制 Agent 执行逻辑」，LangGraph 更灵活。"
    },
    {
      title: "4. Managed Agent 的核心技术组件",
      body: `构建一个 Managed Agent 平台需要解决四个核心技术问题：\n\n### 4.1 任务理解与分解\n\n当用户提交一个复杂任务（如「开发一个带用户认证的博客系统」）时，平台需要：\n1. 理解任务的整体目标和约束条件\n2. 将任务拆解为可独立执行的子任务\n3. 识别子任务之间的依赖关系\n\n这通常需要一个**规划 Agent（Planner）**，使用 LLM 的推理能力进行分析。\n\n### 4.2 Agent 匹配与调度\n\n任务分解后，需要将每个子任务分配给最合适的 Agent。匹配策略包括：\n- **技能匹配**：Agent 的技能是否与任务需求匹配\n- **负载平衡**：避免某个 Agent 过载而其他 Agent 闲置\n- **历史绩效**：优先分配给在该类任务上表现好的 Agent\n- **上下文亲和性**：将相关子任务分配给同一个 Agent，减少上下文切换\n\n### 4.3 执行监控与异常处理\n\nAgent 在执行过程中可能遇到各种问题：API 调用失败、逻辑错误、资源不足等。平台需要：\n- 实时监控 Agent 的执行状态\n- 检测超时、死循环等异常情况\n- 提供人工介入的接口\n- 支持任务重试和回滚\n\n### 4.4 经验累积与知识共享\n\n这是 Managed Agent 区别于 Multi-Agent 的核心能力。平台需要：\n- 从每次任务执行中提取可复用的知识\n- 将知识结构化（技能、模式、最佳实践）\n- 在后续任务中自动注入相关知识\n- 支持 Agent 之间的知识共享`,
      mermaid: `graph TD
    U["用户提交任务"] --> P["Planner Agent
任务分解"]
    P --> T1["子任务 A
前端开发"]
    P --> T2["子任务 B
后端开发"]
    P --> T3["子任务 C
测试"]

    T1 --> S["调度引擎
Scheduler"]
    T2 --> S
    T3 --> S

    S -->|"技能+负载匹配"| A1["Frontend Agent"]
    S -->|"技能+负载匹配"| A2["Backend Agent"]
    S -->|"技能+负载匹配"| A3["QA Agent"]

    A1 -->|"执行中"| M["监控中心
Monitor"]
    A2 -->|"执行中"| M
    A3 -->|"执行中"| M

    M -->|"正常"| R["聚合结果
返回用户"]
    M -->|"异常"| H["人工介入
Human-in-the-loop"]
    H -->|"修正后继续"| S

    A1 -->|"经验提取"| K["知识库
Knowledge Base"]
    A2 -->|"经验提取"| K
    A3 -->|"经验提取"| K

    K -->|"知识注入"| S
    K -->|"知识注入"| P`,
      code: [{ lang: "python", filename: "managed_agent_platform.py", code: `"""
Managed Agent 平台核心实现
包含：任务分解、Agent 调度、执行监控、经验累积
"""

import asyncio
from dataclasses import dataclass, field
from typing import List, Dict, Optional, Callable, Any
from enum import Enum
import json
import time


class TaskStatus(Enum):
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"
    BLOCKED = "blocked"


@dataclass
class SubTask:
    id: str
    description: str
    required_skills: List[str]
    depends_on: List[str] = field(default_factory=list)
    status: TaskStatus = TaskStatus.PENDING
    assigned_to: Optional[str] = None
    result: Optional[str] = None
    error: Optional[str] = None


@dataclass
class AgentProfile:
    name: str
    skills: List[str]
    current_tasks: List[str] = field(default_factory=list)
    max_concurrent: int = 2
    completed_count: int = 0
    failed_count: int = 0
    skill_improvements: Dict[str, float] = field(default_factory=dict)


class ManagedAgentPlatform:
    """Managed Agent 平台核心实现"""

    def __init__(self, planner_fn=None, executor_fn=None):
        self.agents: Dict[str, AgentProfile] = {}
        self.tasks: Dict[str, SubTask] = {}
        self.task_dependencies: Dict[str, List[str]] = {}
        self.knowledge_base: Dict[str, List[Dict]] = {}
        self.execution_log: List[Dict] = []

        # 可插拔的规划器和执行器
        self.planner_fn = planner_fn or self._default_planner
        self.executor_fn = executor_fn or self._default_executor

    def register_agent(self, profile: AgentProfile):
        """注册 Agent"""
        self.agents[profile.name] = profile

    async def submit_project(self, project_name: str, description: str) -> List[str]:
        """提交项目：自动分解 + 调度 + 执行"""
        # 1. 任务分解
        subtasks = await self.planner_fn(project_name, description)

        # 2. 注册任务
        task_ids = []
        for st in subtasks:
            self.tasks[st.id] = st
            task_ids.append(st.id)

        # 3. 构建依赖图
        self._build_dependency_graph()

        # 4. 执行循环
        await self._execution_loop()

        return task_ids

    async def _default_planner(
        self, project_name: str, description: str
    ) -> List[SubTask]:
        """
        默认规划器：基于规则的简单分解
        生产环境应替换为 LLM 驱动的智能规划器
        """
        # 简化示例：固定分解模式
        return [
            SubTask(
                id=f"{project_name}-design",
                description=f"设计 {description} 的架构",
                required_skills=["架构设计", "系统设计"]
            ),
            SubTask(
                id=f"{project_name}-impl",
                description=f"实现 {description}",
                required_skills=["编码", "开发"],
                depends_on=[f"{project_name}-design"]
            ),
            SubTask(
                id=f"{project_name}-test",
                description=f"测试 {description}",
                required_skills=["测试", "QA"],
                depends_on=[f"{project_name}-impl"]
            ),
        ]

    def _build_dependency_graph(self):
        """构建任务依赖图"""
        for task_id, task in self.tasks.items():
            self.task_dependencies[task_id] = task.depends_on

    def _get_ready_tasks(self) -> List[str]:
        """获取可以执行的任务（依赖已满足）"""
        ready = []
        for task_id, task in self.tasks.items():
            if task.status != TaskStatus.PENDING:
                continue
            deps = self.task_dependencies.get(task_id, [])
            if all(
                self.tasks[d].status == TaskStatus.COMPLETED
                for d in deps
            ):
                ready.append(task_id)
        return ready

    def _assign_task(self, task_id: str) -> Optional[str]:
        """为任务分配合适的 Agent"""
        task = self.tasks[task_id]
        candidates = []

        for name, agent in self.agents.items():
            # 检查技能
            skill_match = sum(
                1 for s in task.required_skills if s in agent.skills
            ) / max(len(task.required_skills), 1)

            # 检查负载
            if len(agent.current_tasks) >= agent.max_concurrent:
                continue

            # 计算匹配分数
            success_rate = agent.completed_count / max(
                agent.completed_count + agent.failed_count, 1
            )
            score = skill_match * 0.7 + success_rate * 0.3

            candidates.append((name, score))

        if not candidates:
            return None

        candidates.sort(key=lambda x: x[1], reverse=True)
        return candidates[0][0]

    async def _execution_loop(self):
        """主执行循环"""
        max_iterations = 100
        iteration = 0

        while iteration < max_iterations:
            iteration += 1

            # 获取可执行任务
            ready = self._get_ready_tasks()
            if not ready:
                # 检查是否全部完成
                all_done = all(
                    t.status in (TaskStatus.COMPLETED, TaskStatus.FAILED)
                    for t in self.tasks.values()
                )
                if all_done:
                    break
                await asyncio.sleep(0.1)
                continue

            # 分配并执行
            for task_id in ready:
                agent_name = self._assign_task(task_id)
                if agent_name:
                    await self._execute_with_agent(task_id, agent_name)

        # 执行完成后提取经验
        self._extract_experience()

    async def _execute_with_agent(self, task_id: str, agent_name: str):
        """使用指定 Agent 执行任务"""
        task = self.tasks[task_id]
        agent = self.agents[agent_name]

        task.status = TaskStatus.RUNNING
        task.assigned_to = agent_name
        agent.current_tasks.append(task_id)

        try:
            # 注入相关知识
            relevant_knowledge = self._get_relevant_knowledge(
                task.required_skills
            )

            # 执行
            result = await self.executor_fn(
                task, agent, relevant_knowledge
            )

            task.result = result
            task.status = TaskStatus.COMPLETED
            agent.completed_count += 1

            # 记录执行日志
            self.execution_log.append({
                "task": task_id,
                "agent": agent_name,
                "status": "completed",
                "timestamp": time.time()
            })

        except Exception as e:
            task.error = str(e)
            task.status = TaskStatus.FAILED
            agent.failed_count += 1

        finally:
            agent.current_tasks.remove(task_id)

    def _get_relevant_knowledge(self, skills: List[str]) -> List[Dict]:
        """获取相关知识"""
        knowledge = []
        for skill in skills:
            if skill in self.knowledge_base:
                knowledge.extend(self.knowledge_base[skill])
        return knowledge

    def _extract_experience(self):
        """从已完成任务中提取经验"""
        for task_id, task in self.tasks.items():
            if task.status != TaskStatus.COMPLETED or not task.result:
                continue

            # 提取技能相关经验
            for skill in task.required_skills:
                if skill not in self.knowledge_base:
                    self.knowledge_base[skill] = []

                self.knowledge_base[skill].append({
                    "task": task.description,
                    "agent": task.assigned_to,
                    "result_summary": task.result[:100],
                    "timestamp": time.time()
                })

    async def _default_executor(
        self, task: SubTask, agent: AgentProfile, knowledge: List[Dict]
    ) -> str:
        """默认执行器：模拟执行"""
        await asyncio.sleep(0.05)  # 模拟执行时间
        return f"完成: {task.description}"

    def get_status_report(self) -> Dict:
        """生成项目状态报告"""
        total = len(self.tasks)
        completed = sum(
            1 for t in self.tasks.values()
            if t.status == TaskStatus.COMPLETED
        )
        failed = sum(
            1 for t in self.tasks.values()
            if t.status == TaskStatus.FAILED
        )

        return {
            "progress": f"{completed}/{total}",
            "success_rate": f"{completed/max(completed+failed,1)*100:.0f}%",
            "agents": {
                name: {
                    "completed": a.completed_count,
                    "failed": a.failed_count,
                    "active_tasks": len(a.current_tasks)
                }
                for name, a in self.agents.items()
            },
            "knowledge_base_size": {
                k: len(v) for k, v in self.knowledge_base.items()
            }
        }


async def demo_platform():
    """演示 Managed Agent 平台"""
    platform = ManagedAgentPlatform()

    # 注册 Agent 团队
    platform.register_agent(AgentProfile(
        name="Architect",
        skills=["架构设计", "系统设计", "技术选型"],
        max_concurrent=1
    ))
    platform.register_agent(AgentProfile(
        name="Developer",
        skills=["编码", "开发", "代码审查"],
        max_concurrent=3
    ))
    platform.register_agent(AgentProfile(
        name="Tester",
        skills=["测试", "QA", "性能分析"],
        max_concurrent=2
    ))

    # 提交项目
    task_ids = await platform.submit_project(
        "blog-system",
        "带用户认证的博客系统"
    )

    # 查看报告
    report = platform.get_status_report()
    print(json.dumps(report, indent=2, ensure_ascii=False))


if __name__ == "__main__":
    asyncio.run(demo_platform())`
      }]
    },
    {
      title: "5. 如何构建你自己的 AI 团队",
      body: `基于上述分析，如果你想在项目中引入 Managed Agent 模式，可以按照以下步骤进行：\n\n### 第一步：定义 Agent 角色和职责\n\n不要一开始就追求「万能 Agent」。相反，定义明确的 Agent 角色，每个角色有清晰的职责边界：\n\n- **规划 Agent**：负责任务分解和优先级排序\n- **执行 Agent（多个）**：每个专注于特定领域（前端、后端、数据、测试等）\n- **审查 Agent**：负责质量检查和代码审查\n- **协调 Agent**：负责 Agent 之间的信息同步和冲突解决\n\n### 第二步：建立任务管理系统\n\n需要一个任务管理系统来：\n- 接收用户请求并分解为子任务\n- 维护任务依赖关系\n- 跟踪任务状态（待分配、执行中、已完成、失败）\n- 处理任务之间的阻塞和依赖\n\n### 第三步：实现智能调度\n\n调度是 Managed Agent 的核心。至少需要支持：\n- 基于技能的 Agent 匹配\n- 负载平衡（避免单个 Agent 过载）\n- 依赖感知的调度顺序（先执行无依赖的任务）\n\n### 第四步：建立知识累积机制\n\n这是 Managed Agent 区别于简单 Multi-Agent 的关键。每次任务完成后：\n1. 提取任务中的关键决策和解决方案\n2. 将知识结构化并存储\n3. 在后续任务中自动注入相关知识\n\n### 第五步：加入 Human-in-the-Loop\n\n完全的自主 Agent 目前还不够可靠。在关键环节加入人工审核：\n- 任务分解结果需要人工确认\n- 关键决策点需要人工审批\n- 异常情况需要人工介入\n\n**推荐起步方案**：如果你是个人开发者，可以先用 Multica 这样的开源平台快速搭建。如果是企业级需求，可以考虑 n8n + 自定义 Agent 的组合方案。`,
      table: {
        headers: ["阶段", "最小实现", "生产级实现", "推荐工具"],
        rows: [
          ["角色定义", "2-3 个固定角色", "动态角色 + 技能注册表", "Multica / CrewAI"],
          ["任务管理", "简单队列", "DAG 依赖图 + 优先级", "LangGraph / n8n"],
          ["调度", "轮询分配", "技能匹配 + 负载感知", "自建 / Multica"],
          ["知识累积", "日志存储", "向量数据库 + 语义检索", "ChromaDB / Pinecone"],
          ["人工介入", "关键节点审批", "实时看板 + 随时介入", "Multica 看板"],
          ["监控告警", "基础日志", "指标采集 + 异常检测", "Prometheus + Grafana"]
        ]
      },
      warning: "不要一开始就追求完美的 Managed Agent 平台。从最简单的「两个 Agent + 手动任务分配」开始，逐步增加自动化程度。过早优化调度算法和知识累积机制会浪费大量时间。"
    },
    {
      title: "6. 未来展望：AI 团队的下一个 frontier",
      body: `Managed Agent 平台还处在非常早期的阶段。以下几个方向值得持续关注：\n\n**自进化 Agent 团队**：将自进化机制（如 agent-020 中讨论的 Hermes Agent、GenericAgent、Evolver）引入团队层面。不仅单个 Agent 可以进化，整个团队的协作模式、任务分配策略、知识共享机制也可以进化。\n\n**跨组织 Agent 协作**：不同公司、不同项目的 Agent 如何安全地协作？这需要标准化的协议（类似 MCP 协议之于工具集成），以及信任机制。\n\n**Agent 经济模型**：当 Agent 可以自主完成任务时，如何计量和结算？可能出现「Agent 技能市场」、「Agent 劳动力市场」等新经济模式。\n\n**法律与合规**：AI 团队完成的工作，知识产权归属谁？Agent 犯错的法律责任如何界定？这些都是 2026-2027 年需要解决的关键问题。\n\n**与自进化的结合**：Managed Agent + Self-Evolving Agent 可能是终极形态——团队不仅管理 Agent，还帮助 Agent 进化；进化的 Agent 又让团队更强大。这是一个正反馈循环。`,
      mermaid: `graph TD
    subgraph 2026: 当前
    A1["Managed Agent 平台
Multica / n8n"]
    A2["自进化 Agent
Hermes / GenericAgent"]
    A3["MCP 协议标准化"]
    end

    subgraph 2026 Q3-Q4
    B1["自进化 Agent 团队
团队级进化"]
    B2["Agent 技能市场
共享技能模块"]
    B3["跨组织协作协议"]
    end

    subgraph 2027
    C1["Agent 经济体
自主协作 + 经济结算"]
    C2["人类-AI 混合团队
人类和 Agent 共同工作"]
    C3["监管框架
法律 + 合规"]
    end

    A1 --> B1
    A2 --> B1
    A3 --> B3
    B1 --> C1
    B1 --> C2
    B2 --> C1
    B3 --> C3`,
      tip: "如果你想保持对 Managed Agent 领域的关注，建议跟踪以下项目：multica-ai/multica（Managed Agent 平台）、NousResearch/hermes-agent（自进化 Agent）、lsdefine/GenericAgent（技能生长）、n8n-io/n8n（工作流+AI 编排）。同时关注 OpenAI Agents SDK 的更新，它可能成为行业标准的 Agent 编排工具。"
    },
    {
      title: "7. 总结",
      body: `2026 年 4 月，AI Agent 正在经历从「单兵作战」到「团队协作」的范式转变。Multica 等 Managed Agent 平台的出现，标志着我们不再满足于「多个 Agent 能对话」，而是追求「多个 Agent 能像团队一样工作」。\n\n**关键要点**：\n1. Managed Agent ≠ Multi-Agent：前者关注团队管理（任务分配、进度追踪、技能累积），后者关注协作协议\n2. Multica 是当前最纯粹的 Managed Agent 平台，16K+ 星、周增 7,831 星说明市场极度认可\n3. 构建 Managed Agent 平台需要四个核心组件：任务分解、智能调度、执行监控、经验累积\n4. 从简单开始：2-3 个 Agent + 手动任务分配 → 逐步增加自动化程度\n5. Human-in-the-Loop 仍然是必须的，完全的自主团队还不成熟\n6. Managed Agent + Self-Evolving Agent 可能是终极形态\n\n本文提供的两个 Python 实现（ManagedAgentPlatform 和完整平台实现）可以作为你探索这一领域的起点。`
    }
  ]
};
