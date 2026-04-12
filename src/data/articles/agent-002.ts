import { Article } from '../knowledge';

export const article: Article = {
    id: "agent-002",
    title: "Multi-Agent 系统设计与协作",
    category: "agent",
    tags: ["Multi-Agent", "协作", "架构"],
    summary: "探索多智能体系统的通信协议、角色分配和任务协调机制",
    date: "2026-04-07",
    readTime: "20 min",
    level: "高级",
    content: [
      {
        title: "1. 什么是 Multi-Agent 系统",
        body: `Multi-Agent 系统（MAS）是由多个自主智能体组成的分布式计算系统，这些智能体通过感知环境、相互通信和协作来完成单一智能体无法独立完成的复杂任务。与单 Agent 系统不同，MAS 的核心设计理念是"分工与协作"——每个 Agent 拥有特定的能力范围和职责边界，通过结构化的交互协议共同解决问题。

MAS 的设计灵感来源于人类社会中的组织结构。就像一个企业中不同部门各司其职又相互配合，MAS 中的每个 Agent 都有明确的角色定位：Researcher 负责信息收集和推理，Coder 负责代码生成和执行，Reviewer 负责结果审核和质量控制，Manager 负责任务统筹和进度管理。这种架构天然支持并行处理，显著提升了复杂任务的完成效率。

从技术角度看，MAS 解决了一个根本性矛盾：单一 LLM 的上下文窗口和推理深度是有限的，但通过多 Agent 协作，我们可以将大问题分解为多个子问题，每个子问题由专门的 Agent 处理，最后整合结果。这使得系统能够突破单个模型的能力上限，处理更复杂、更多维度的任务。MAS 的理论基础可追溯到分布式人工智能（DAI），2023-2024 年随着 LLM 能力爆发，MAS 从理论快速走向工程实践。`,
        mermaid: `graph TD
    A["复杂任务"] --> B["任务分解器"]
    B --> C["子任务 1"]
    B --> D["子任务 2"]
    B --> E["子任务 3"]
    C --> F["Agent A: Researcher"]
    D --> G["Agent B: Coder"]
    E --> H["Agent C: Reviewer"]
    F --> I["结果 A"]
    G --> J["结果 B"]
    H --> K["结果 C"]
    I --> L["结果整合器"]
    J --> L
    K --> L
    L --> M["最终输出"]`,
        table: {
          headers: ["架构模式", "适用场景", "优势", "劣势"],
          rows: [
            ["单 Agent", "简单问答、文本生成", "实现简单、调试容易", "能力上限受模型限制"],
            ["多 Agent 串行", "多步骤流水线任务", "职责清晰、便于调试", "串行执行速度较慢"],
            ["多 Agent 并行", "独立子任务同时处理", "速度快、效率高", "需要结果整合机制"],
            ["多 Agent 混合", "复杂协作+并行处理", "能力最强、灵活性高", "设计复杂度高"],
            ["Hierarchical MAS", "大规模分布式任务", "可扩展、层次化管理", "通信开销大"],
          ],
        },
        tip: "学习建议：先从单 Agent + 工具调用的模式开始，理解 Agent 的核心能力边界后，再逐步引入多 Agent 架构。不要为了用多 Agent 而用多 Agent——只有当单 Agent 确实无法胜任时，才考虑 MAS。",
      },
      {
        title: "2. 通信协议与消息传递",
        body: `通信协议是 Multi-Agent 系统的神经系统——它决定了 Agent 之间如何交换信息、共享状态和协调行动。没有高效的通信机制，再强大的 Agent 也只是一群各自为战的孤岛。MAS 中的通信可以分为两大类：直接通信（点对点消息传递）和间接通信（通过共享黑板或消息队列）。

直接通信是最常用的方式，Agent 之间通过结构化的消息格式（通常是 JSON）发送请求和响应。消息通常包含发送者、接收者、消息类型、内容负载和时间戳等字段。CrewAI 使用简单的消息传递模型，而 AutoGen 则支持更复杂的群聊（group chat）和单聊（one-to-one）模式。

间接通信通过共享媒介实现，类似于黑板系统（Blackboard Pattern）。所有 Agent 都可以读写共享的状态空间，通过观察状态变化来决定下一步行动。这种方式解耦了 Agent 之间的直接依赖，适合异步、大规模的场景，但可能带来数据一致性和冲突问题。

消息传递的效率直接影响系统性能。关键设计考量包括：消息格式标准化（确保所有 Agent 能互相理解）、消息路由（确定消息该发给谁）、消息队列（处理突发流量和背压）、以及超时与重试机制（应对网络抖动和 Agent 故障）。`,
        code: [
          {
            lang: "python",
            code: `# 简单的 Agent 消息传递框架
from dataclasses import dataclass, field
from enum import Enum
from typing import Any, Dict, List
import uuid, time

class MessageType(Enum):
    REQUEST = "request"
    RESPONSE = "response"
    BROADCAST = "broadcast"
    STATUS_UPDATE = "status_update"

@dataclass
class Message:
    sender: str
    receiver: str
    msg_type: MessageType
    content: Dict[str, Any]
    msg_id: str = field(default_factory=lambda: str(uuid.uuid4()))
    timestamp: float = field(default_factory=time.time)
    reply_to: str = None

    def to_dict(self) -> Dict:
        return {
            "msg_id": self.msg_id, "sender": self.sender,
            "receiver": self.receiver, "type": self.msg_type.value,
            "content": self.content, "timestamp": self.timestamp,
        }

class MessageBus:
    """消息总线：Agent 间通信的中枢"""
    def __init__(self):
        self._queues: Dict[str, List[Message]] = {}
        self._history: List[Message] = []

    def register(self, agent_id: str):
        if agent_id not in self._queues:
            self._queues[agent_id] = []

    def send(self, msg: Message):
        self._queues.setdefault(msg.receiver, []).append(msg)
        self._history.append(msg)

    def receive(self, agent_id: str) -> List[Message]:
        messages = self._queues.get(agent_id, [])
        self._queues[agent_id] = []
        return messages

    def broadcast(self, sender: str, content: Dict[str, Any]):
        for agent_id in self._queues:
            if agent_id != sender:
                self.send(Message(
                    sender=sender, receiver=agent_id,
                    msg_type=MessageType.BROADCAST, content=content,
                ))

# 使用示例
bus = MessageBus()
for agent in ["researcher", "coder", "reviewer"]:
    bus.register(agent)

bus.send(Message(
    sender="manager", receiver="researcher",
    msg_type=MessageType.REQUEST,
    content={"task": "查找 Python 异步编程最佳实践"},
))
msgs = bus.receive("researcher")
print(f"收到 {len(msgs)} 条消息: {msgs[0].content}")`,
          },
          {
            lang: "python",
            code: `# 基于 Agent-to-Agent 对话的通信（AutoGen 风格）
class A2AProtocol:
    """Agent-to-Agent 通信协议"""
    def __init__(self):
        self._agents: Dict[str, callable] = {}
        self._conversation_log: List[Dict] = []

    def register(self, name: str, handler: callable):
        self._agents[name] = handler

    def chat(self, sender: str, receiver: str, message: str,
             max_turns: int = 5) -> str:
        current_msg = message
        for turn in range(max_turns):
            if receiver not in self._agents:
                return f"Error: Agent '{receiver}' not registered"
            response = self._agents[receiver](current_msg)
            if "<DONE>" in response:
                return response.replace("<DONE>", "").strip()
            current_msg = response
            sender, receiver = receiver, sender
        return current_msg

    def group_chat(self, participants: List[str], initial_msg: str,
                   max_rounds: int = 10) -> List[Dict]:
        history = [{"from": "system", "msg": initial_msg}]
        current_msg = initial_msg
        for _ in range(max_rounds):
            for p in participants:
                if p in self._agents:
                    response = self._agents[p](current_msg)
                    history.append({"from": p, "msg": response})
                    current_msg = response
                    if "<DONE>" in response:
                        return history
        return history

# 注册模拟 Agent
protocol = A2AProtocol()
protocol.register("researcher", lambda msg: f"Research: {msg}. <DONE>找到3篇论文。")
protocol.register("coder", lambda msg: f"Implement: {msg}. <DONE>代码已生成。")

result = protocol.chat("manager", "researcher", "调查 FastAPI 性能优化")
print(f"结果: {result}")`,
          },
          {
            lang: "python",
            code: `# 共享黑板（Blackboard）通信模式
class Blackboard:
    """共享黑板：Agent 通过读写共享空间进行间接通信"""
    def __init__(self):
        self._data: Dict[str, Any] = {}
        self._subscribers: Dict[str, List[callable]] = {}
        self._version = 0

    def write(self, key: str, value: Any, author: str):
        self._data[key] = {
            "value": value, "author": author,
            "version": self._version, "timestamp": time.time(),
        }
        self._version += 1
        for cb in self._subscribers.get(key, []):
            cb(key, value, author)

    def read(self, key: str) -> Any:
        entry = self._data.get(key)
        return entry["value"] if entry else None

    def read_all(self) -> Dict[str, Any]:
        return {k: v["value"] for k, v in self._data.items()}

    def subscribe(self, key: str, callback: callable):
        self._subscribers.setdefault(key, []).append(callback)

# 使用示例
board = Blackboard()

def on_update(key, value, author):
    print(f"[通知] {key} 已被 {author} 更新")

board.subscribe("research_results", on_update)
board.write("research_results", ["论文1", "论文2"], "researcher")
results = board.read("research_results")
board.write("code_draft", "async def fetch_data(): ...", "coder")
print(f"所有数据: {board.read_all()}")`,
          },
        ],
        table: {
          headers: ["通信模式", "实时性", "解耦程度", "适用场景", "代表框架"],
          rows: [
            ["直接点对点", "高", "低", "明确的双向交互", "AutoGen 一对一"],
            ["群聊广播", "高", "中", "多 Agent 共同讨论", "AutoGen Group Chat"],
            ["共享黑板", "中", "高", "异步、松散耦合", "CrewAI Tasks"],
            ["消息队列", "中", "高", "大规模、高吞吐", "Celery + Redis"],
            ["事件总线", "中", "高", "事件驱动架构", "LangGraph State"],
          ],
        },
        warning: "通信设计常见陷阱：① 消息风暴——Agent 之间无节制地互相发送消息导致系统过载；② 死锁——Agent A 等待 Agent B 的回复，而 Agent B 也在等待 Agent A；③ 信息丢失——异步通信中消息可能因网络问题或 Agent 崩溃而丢失。缓解策略：设置消息上限、超时机制和重试策略。",
      },
      {
        title: "3. 角色分配与任务分解",
        body: `角色分配是 Multi-Agent 系统设计的核心环节。一个好的角色设计能让系统像精密的机械表一样运转——每个齿轮各司其职又相互配合。角色设计需要回答三个关键问题：需要哪些角色？每个角色的能力边界是什么？角色之间的依赖关系如何？

角色设计通常遵循"能力-职责-权限"三位一体的原则。能力（Capability）定义了角色能做什么，职责（Responsibility）定义了角色应该做什么，权限（Authority）定义了角色可以调用哪些工具或资源。这三个维度的精确定义，是确保 Agent 行为可预测的基础。

任务分解（Task Decomposition）则是将复杂目标拆解为可执行的子任务序列。常见分解策略包括：按功能模块分解（前端、后端、数据库）、按时间顺序分解（调研→设计→实现→测试）、按难度层次分解（简单任务先行、复杂任务后置）、以及按依赖关系分解（DAG 拓扑排序）。在实践中，角色和任务的设计不是一次性的——它需要通过系统的实际运行结果来迭代优化。观察哪些角色经常超负荷（说明需要拆分）、哪些角色长期空闲（说明可以合并或消除）、哪些任务总是超时（说明分解不够细），然后调整角色和任务的设计。`,
        code: [
          {
            lang: "python",
            code: `# 角色定义与分配系统
from enum import Enum
from typing import List, Dict
from dataclasses import dataclass

class RoleType(Enum):
    MANAGER = "manager"
    RESEARCHER = "researcher"
    CODER = "coder"
    REVIEWER = "reviewer"
    TESTER = "tester"
    DEPLOYER = "deployer"

@dataclass
class Role:
    role_type: RoleType
    name: str
    capabilities: List[str]
    tools: List[str]
    max_concurrent_tasks: int
    priority: int

@dataclass
class Agent:
    role: Role
    agent_id: str
    current_tasks: List[str]
    status: str = "idle"

    def can_accept_task(self) -> bool:
        return len(self.current_tasks) < self.role.max_concurrent_tasks

    def assign(self, task_id: str):
        self.current_tasks.append(task_id)
        self.status = "busy"

    def complete(self, task_id: str):
        self.current_tasks.remove(task_id)
        if not self.current_tasks:
            self.status = "idle"

# 定义典型软件开发团队的角色
roles = [
    Role(RoleType.MANAGER, "项目经理",
         ["任务分解", "进度管理", "资源分配"],
         ["task_tracker", "calendar"], 10, 1),
    Role(RoleType.RESEARCHER, "研究员",
         ["信息检索", "文献综述", "技术选型"],
         ["web_search", "arxiv"], 3, 2),
    Role(RoleType.CODER, "开发者",
         ["代码生成", "代码重构", "API 开发"],
         ["code_editor", "git", "terminal"], 2, 3),
    Role(RoleType.REVIEWER, "代码审查员",
         ["代码审查", "质量评估", "安全检查"],
         ["code_reviewer", "linter"], 5, 3),
]

agents = [Agent(r, f"{r.role_type.value}-01", []) for r in roles]
for a in agents:
    print(f"{a.role.name}: {a.role.capabilities}")`,
          },
          {
            lang: "python",
            code: `# 任务分解与 DAG 调度
from collections import defaultdict, deque

@dataclass
class Task:
    task_id: str
    description: str
    assigned_role: RoleType
    dependencies: List[str]
    estimated_time: int  # 分钟
    status: str = "pending"

class TaskScheduler:
    """基于 DAG 的任务调度器"""
    def __init__(self):
        self.tasks: Dict[str, Task] = {}
        self.adj: Dict[str, List[str]] = defaultdict(list)
        self.in_degree: Dict[str, int] = defaultdict(int)

    def add_task(self, task: Task):
        self.tasks[task.task_id] = task
        for dep in task.dependencies:
            self.adj[dep].append(task.task_id)
            self.in_degree[task.task_id] += 1

    def get_ready_tasks(self) -> List[Task]:
        return [
            t for t in self.tasks.values()
            if t.status == "pending" and self.in_degree[t.task_id] == 0
        ]

    def complete_task(self, task_id: str):
        self.tasks[task_id].status = "completed"
        for nxt in self.adj[task_id]:
            self.in_degree[nxt] -= 1

    def topological_order(self) -> List[str]:
        in_deg = dict(self.in_degree)
        queue = deque([t for t in self.tasks if in_deg.get(t, 0) == 0])
        order = []
        while queue:
            node = queue.popleft()
            order.append(node)
            for n in self.adj[node]:
                in_deg[n] -= 1
                if in_deg[n] == 0:
                    queue.append(n)
        return order

# 构建任务 DAG
scheduler = TaskScheduler()
tasks = [
    Task("T1", "需求分析", RoleType.MANAGER, [], 60),
    Task("T2", "技术调研", RoleType.RESEARCHER, ["T1"], 120),
    Task("T3", "架构设计", RoleType.CODER, ["T1"], 90),
    Task("T4", "API 开发", RoleType.CODER, ["T2", "T3"], 180),
    Task("T5", "代码审查", RoleType.REVIEWER, ["T4"], 60),
]
for t in tasks:
    scheduler.add_task(t)

print("拓扑排序:", scheduler.topological_order())
print("可并行:", [t.task_id for t in scheduler.get_ready_tasks()])`,
          },
        ],
        table: {
          headers: ["角色", "核心职责", "典型工具", "输出产物", "依赖前置"],
          rows: [
            ["Manager", "任务分解与协调", "任务追踪、日历", "任务分配方案", "无"],
            ["Researcher", "信息收集与分析", "搜索引擎、数据库", "调研报告", "Manager"],
            ["Coder", "代码实现与开发", "代码编辑器、Git", "功能代码", "Researcher"],
            ["Reviewer", "代码审查与质量", "Linter、安全扫描", "审查报告", "Coder"],
            ["Tester", "自动化测试", "测试框架、CI/CD", "测试报告", "Coder"],
            ["Deployer", "部署与运维", "Docker、K8s", "部署清单", "Reviewer"],
          ],
        },
        tip: "角色设计的实用建议：给每个角色写一份'职位说明书'——包含职责描述、输入输出、使用的工具、与其他角色的接口。这样能确保 Agent 的行为边界清晰，不会越界或推诿。",
      },
      {
        title: "4. 协作模式：竞争、合作与混合",
        body: `Multi-Agent 系统中的协作模式决定了 Agent 之间如何互动。最常见的三种模式是：合作（Cooperative）、竞争（Competitive）和混合（Hybrid）。选择正确的协作模式是系统设计成败的关键。

合作模式是最常见的设计，所有 Agent 共享同一个目标，通过分工协作来提高效率。在这种模式下，Agent 之间是伙伴关系，信息共享是默认行为。合作模式的典型应用是软件开发流水线：Researcher 收集信息后交给 Coder 实现，Coder 完成后交给 Reviewer 审查。

竞争模式则让多个 Agent 为同一目标各自提出方案，然后通过评估选择最优解。这种模式在创意生成、方案设计和辩论场景中非常有效。竞争模式的核心价值在于"多样性"——不同的 Agent 会从不同角度思考问题，产生更多样化的解决方案。

混合模式结合了合作与竞争的优点。例如在"辩论式架构"中，两个 Agent 分别扮演"正方"和"反方"，通过多轮辩论找出方案中的漏洞和盲点；或者在"投票式架构"中，多个 Agent 独立完成任务后，通过投票或加权平均的方式达成共识。`,
        mermaid: `graph TD
    A["任务输入"] --> B["协作模式选择"]
    B -->|"合作模式"| C["分工流水线"]
    B -->|"竞争模式"| D["并行方案生成"]
    B -->|"混合模式"| E["辩论+投票"]
    
    C --> C1["Agent A 执行阶段1"]
    C1 --> C2["Agent B 执行阶段2"]
    C2 --> C3["Agent C 执行阶段3"]
    C3 --> F["最终结果"]
    
    D --> D1["Agent A 方案A"]
    D --> D2["Agent B 方案B"]
    D --> D3["Agent C 方案C"]
    D1 --> D4["评估器"]
    D2 --> D4
    D3 --> D4
    D4 --> F
    
    E --> E1["正方 Agent 支持"]
    E --> E2["反方 Agent 质疑"]
    E1 --> E3["多轮辩论"]
    E2 --> E3
    E3 --> E4["共识提取"]
    E4 --> F`,
        code: [
          {
            lang: "python",
            code: `# 合作模式：流水线协作
class CooperativePipeline:
    """合作模式的流水线实现"""
    def __init__(self):
        self.agents = {}
        self.pipeline_order = []

    def add_agent(self, name: str, handler):
        self.agents[name] = handler

    def set_order(self, order: List[str]):
        self.pipeline_order = order

    def execute(self, initial_input: str) -> Dict[str, str]:
        results = {}
        current = initial_input
        for name in self.pipeline_order:
            if name in self.agents:
                result = self.agents[name](current)
                results[name] = result
                current = result
        return results

# 示例：软件开发流水线
pipeline = CooperativePipeline()
pipeline.add_agent("researcher", lambda x: f"基于'{x}'，找到技术方案: FastAPI, Celery")
pipeline.add_agent("architect", lambda x: f"根据方案，设计架构: REST API + 异步队列")
pipeline.add_agent("coder", lambda x: f"根据架构，生成完整代码实现")
pipeline.add_agent("reviewer", lambda x: f"审查代码，发现2个问题并修复")
pipeline.set_order(["researcher", "architect", "coder", "reviewer"])

results = pipeline.execute("构建高并发数据处理平台")
for name, result in results.items():
    print(f"[{name}] {result}")`,
          },
          {
            lang: "python",
            code: `# 竞争模式：多方案生成与评估
class CompetitiveSolver:
    """竞争模式：多个 Agent 独立求解，然后评估选择"""
    def __init__(self):
        self.agents = {}
        self.evaluator = None

    def add_agent(self, name: str, solver):
        self.agents[name] = solver

    def set_evaluator(self, evaluator):
        self.evaluator = evaluator

    def solve(self, problem: str) -> Dict:
        proposals = {}
        for name, solver in self.agents.items():
            proposals[name] = {"solution": solver(problem), "score": 0}
        if self.evaluator:
            for name, p in proposals.items():
                p["score"] = self.evaluator(problem, p["solution"])
        best = max(proposals.items(), key=lambda x: x[1]["score"])
        return {
            "all_proposals": proposals,
            "best_agent": best[0],
            "best_solution": best[1]["solution"],
        }

def evaluate(problem, solution):
    score = 0
    if "成熟" in solution: score += 3
    if "最新" in solution: score += 2
    if "混合" in solution: score += 4
    return score

solver = CompetitiveSolver()
solver.add_agent("conservative", lambda p: f"[保守] 用成熟框架: {p}")
solver.add_agent("innovative", lambda p: f"[创新] 用最新技术: {p}")
solver.add_agent("balanced", lambda p: f"[混合] 核心成熟+边缘创新: {p}")
solver.set_evaluator(evaluate)
result = solver.solve("构建实时聊天系统")
print(f"最佳方案: {result['best_agent']} -> {result['best_solution']}")`,
          },
          {
            lang: "python",
            code: `# 混合模式：辩论式架构
class DebateFramework:
    """辩论式架构：正反方多轮辩论提取共识"""
    def __init__(self, max_rounds: int = 3):
        self.max_rounds = max_rounds
        self.debate_log = []

    def setup(self, proposition, affirmative, negative, judge):
        self.proposition = proposition
        self.affirmative = affirmative
        self.negative = negative
        self.judge = judge

    def debate(self) -> Dict:
        context = f"议题: {self.proposition}"
        aff_points, neg_points = [], []
        for r in range(1, self.max_rounds + 1):
            aff = self.affirmative(context)
            aff_points.append(aff)
            neg = self.negative(f"正方: {aff}")
            neg_points.append(neg)
            self.debate_log.append(f"第{r}轮 正方: {aff} | 反方: {neg}")
            context = f"第{r}轮后 - 正方: {aff} | 反方: {neg}"
        verdict = self.judge(self.debate_log)
        return {"verdict": verdict, "log": self.debate_log}

# 示例辩论
framework = DebateFramework(max_rounds=2)
framework.setup(
    "新项目应使用微服务架构",
    lambda c: "微服务提供独立部署、技术栈自由",
    lambda c: "但微服务带来分布式复杂度和运维成本",
    lambda log: "综合：微服务适合大型团队，小型项目单体先行",
)
result = framework.debate()
print(f"判决: {result['verdict']}")`,
          },
        ],
        table: {
          headers: ["协作模式", "Agent 关系", "信息共享", "适合场景", "典型风险"],
          rows: [
            ["合作", "伙伴关系", "完全共享", "流水线任务、分工明确", "过度依赖单一 Agent"],
            ["竞争", "对手关系", "各自独立", "创意生成、方案选择", "重复计算浪费资源"],
            ["辩论", "对立关系", "逐步揭露", "方案审查、风险评估", "辩论陷入僵局"],
            ["投票", "平等关系", "独立+汇总", "决策共识、结果聚合", "群体思维偏差"],
            ["主从", "层级关系", "自上而下", "复杂任务统筹", "单点瓶颈"],
          ],
        },
        warning: "协作模式选择常见错误：① 过度竞争——在明确目标的任务中使用竞争模式只会浪费计算资源；② 盲目合作——当问题有多个可能的解决方案时，单一合作流水线可能错过更优解；③ 辩论失控——辩论轮数太多会导致无意义的反复争论，应该设置明确的终止条件。",
      },
      {
        title: "5. 冲突解决与共识机制",
        body: `在 Multi-Agent 系统中，冲突是不可避免的。当多个 Agent 对同一问题给出不同的答案、对同一资源有竞争需求、或对任务优先级有不同判断时，系统必须有明确的冲突解决机制。缺乏冲突解决机制的 MAS 就像没有交通规则的城市——迟早会陷入混乱。

冲突的类型多种多样：信息冲突（不同 Agent 获取到矛盾的信息）、目标冲突（Agent 之间的子目标相互矛盾）、资源冲突（多个 Agent 竞争同一计算资源或工具）、以及时序冲突（Agent 的执行顺序影响了最终结果）。每种冲突需要不同的解决策略。

共识机制是冲突解决的制度化方案。常见的共识机制包括：多数投票（简单但可能忽视少数派的高质量意见）、加权投票（根据 Agent 的历史表现分配权重）、共识阈值（要求达到一定比例的同意）、以及权威裁决（由指定的决策 Agent 做最终判断）。

在实际系统中，冲突预防比冲突解决更重要。良好的设计应该在源头减少冲突的可能性：明确的角色边界、清晰的接口定义、无共享状态的 Agent 设计（避免资源竞争）、以及确定性的任务分配算法。`,
        code: [
          {
            lang: "python",
            code: `# 共识机制实现
from typing import Dict, Any
import statistics

class ConsensusEngine:
    """多 Agent 共识引擎"""
    def __init__(self):
        self.agent_weights: Dict[str, float] = {}
        self.history: Dict[str, List[float]] = {}

    def register(self, agent_id: str, weight: float = 1.0):
        self.agent_weights[agent_id] = weight
        self.history[agent_id] = []

    def update_weight(self, agent_id: str, accuracy: float):
        self.history[agent_id].append(accuracy)
        recent = self.history[agent_id][-5:]
        new_w = sum(w * (0.8 ** i) for i, w in enumerate(reversed(recent))) / len(recent)
        self.agent_weights[agent_id] = max(0.1, new_w)

    def weighted_vote(self, votes: Dict[str, float]) -> float:
        total = sum(self.agent_weights[a] for a in votes)
        if total == 0:
            return statistics.mean(votes.values())
        return sum(self.agent_weights[a] * v for a, v in votes.items()) / total

    def majority_vote(self, votes: Dict[str, Any]) -> Any:
        counts: Dict[Any, float] = {}
        for a, v in votes.items():
            counts[v] = counts.get(v, 0) + self.agent_weights.get(a, 1.0)
        return max(counts, key=counts.get)

    def consensus_threshold(self, votes: Dict[str, Any], threshold: float = 0.6) -> Dict:
        counts: Dict[Any, float] = {}
        total = sum(self.agent_weights.get(a, 1.0) for a in votes)
        for a, v in votes.items():
            counts[v] = counts.get(v, 0) + self.agent_weights.get(a, 1.0)
        for opt, w in counts.items():
            if w / total >= threshold:
                return {"consensus": True, "option": opt, "confidence": round(w / total, 3)}
        return {"consensus": False, "closest": max(counts, key=counts.get)}

# 使用示例
engine = ConsensusEngine()
engine.register("agent_a", 0.9)
engine.register("agent_b", 0.7)
engine.register("agent_c", 0.8)

votes = {"agent_a": 0.85, "agent_b": 0.72, "agent_c": 0.80}
print(f"加权投票: {engine.weighted_vote(votes):.3f}")

choice = {"agent_a": "方案A", "agent_b": "方案A", "agent_c": "方案B"}
print(f"多数投票: {engine.majority_vote(choice)}")
print(f"共识检查: {engine.consensus_threshold(choice)}")`,
          },
          {
            lang: "python",
            code: `# 冲突检测与自动解决
class ConflictResolver:
    """冲突检测与解决系统"""
    def __init__(self):
        self.conflict_log = []

    def detect(self, results: Dict[str, Any]) -> List[Dict]:
        conflicts = []
        ids = list(results.keys())
        for i in range(len(ids)):
            for j in range(i + 1, len(ids)):
                a, b = ids[i], ids[j]
                c = self._check(a, results[a], b, results[b])
                if c:
                    conflicts.append(c)
        return conflicts

    def _check(self, a: str, ra: Any, b: str, rb: Any) -> Dict:
        if isinstance(ra, dict) and isinstance(rb, dict):
            diff_keys = [k for k in set(ra) & set(rb) if ra[k] != rb[k]]
            if diff_keys:
                return {"type": "data", "agents": [a, b],
                        "keys": diff_keys}
        elif ra != rb:
            return {"type": "result", "agents": [a, b],
                    "values": {a: str(ra), b: str(rb)}}
        return None

    def resolve(self, conflict: Dict, strategy: str = "merge") -> Dict:
        if strategy == "highest_weight":
            return {"resolved": True, "winner": conflict["agents"][0]}
        elif strategy == "merge":
            return {"resolved": True, "strategy": "merge",
                    "action": "合并两个结果，保留不冲突部分"}
        return {"resolved": False}

# 使用示例
resolver = ConflictResolver()
results = {
    "researcher": {"framework": "FastAPI", "db": "PostgreSQL"},
    "architect": {"framework": "FastAPI", "db": "MongoDB"},
}
conflicts = resolver.detect(results)
for c in conflicts:
    print(f"发现冲突: {c['type']} in {c['keys']}")
    r = resolver.resolve(c, "merge")
    print(f"解决: {r}")`,
          },
        ],
        table: {
          headers: ["冲突类型", "检测方法", "解决策略", "预防手段"],
          rows: [
            ["信息冲突", "结果对比、交叉验证", "多数投票、加权平均", "统一数据源"],
            ["目标冲突", "依赖图分析、约束检查", "协商妥协、上级裁决", "明确目标层级"],
            ["资源冲突", "锁检测、超时监控", "排队、优先级调度", "资源池化、隔离"],
            ["时序冲突", "版本向量、逻辑时钟", "最终一致性、冲突合并", "无状态设计"],
            ["权限冲突", "ACL 检查、能力验证", "权限提升、降级执行", "最小权限原则"],
          ],
        },
        tip: "冲突管理的学习建议：阅读分布式系统中的共识算法（如 Paxos、Raft），虽然这些是为服务器集群设计的，但其中的思想（如 Leader 选举、日志复制、多数派共识）对 Multi-Agent 系统的冲突解决有重要启发。",
      },
      {
        title: "6. 主流框架：AutoGen、CrewAI、LangGraph",
        body: `2024-2026 年间，Multi-Agent 框架百花齐放，每个框架都有独特的设计哲学和适用场景。理解它们的差异，是选择合适工具的关键。

AutoGen（Microsoft Research）是 Multi-Agent 领域的标杆框架。它的核心设计理念是"可对话的 Agent"——Agent 之间通过自然语言对话进行协作。AutoGen 支持多种对话模式：一对一、群聊、嵌套对话，并且天然支持 Human-in-the-loop（人类参与对话）。AutoGen 的最大优势是其灵活性和可扩展性，几乎可以构建任何复杂度的多 Agent 系统。但灵活性也带来了复杂度，初学者需要较长时间才能掌握。

CrewAI 则走向了另一个极端：极简主义。它的设计目标是让多 Agent 编程像写职位描述一样简单。CrewAI 的核心概念是 Crew（团队）、Agent（成员）、Task（任务）和 Process（流程）。你只需要定义每个 Agent 的角色、目标和工具，以及每个任务的描述和依赖关系，CrewAI 就会自动编排执行。CrewAI 的学习曲线最低，适合快速原型和中小型项目。

LangGraph（LangChain 团队）基于图结构来定义 Agent 的工作流。每个节点代表一个 Agent 或一个操作，边定义了执行流。LangGraph 的最大优势是它支持循环、分支和条件执行——这意味着你可以构建非常复杂的有状态工作流。它特别适合需要精确控制执行流程的生产级应用。`,
        code: [
          {
            lang: "python",
            code: `# AutoGen 风格：多 Agent 对话协作
class AutoGenStyleSystem:
    """模拟 AutoGen 的多 Agent 对话系统"""
    def __init__(self):
        self.agents: Dict[str, Dict] = {}
        self.history: List[Dict] = []

    def create_agent(self, name: str, system_msg: str, tools=None):
        self.agents[name] = {"name": name, "system": system_msg,
                             "tools": tools or []}

    def chat(self, initiator: str, recipient: str, msg: str,
             max_turns: int = 5) -> List[Dict]:
        self.history = [{"role": "user", "content": msg, "name": initiator}]
        current = msg
        spk, lst = initiator, recipient
        for _ in range(max_turns):
            agent = self.agents.get(lst, {})
            response = self._resp(lst, current, agent.get("system", ""))
            self.history.append({"role": "assistant", "content": response, "name": lst})
            if "TERMINATE" in response:
                break
            current = response
            spk, lst = lst, spk
        return self.history

    def _resp(self, name: str, msg: str, sys: str) -> str:
        if name == "researcher":
            return f"查询'{msg}'，找到：FastAPI 是最佳选择。TERMINATE"
        elif name == "coder":
            return f"根据调研，实现代码：from fastapi import FastAPI。TERMINATE"
        elif name == "reviewer":
            return f"审查完成：✅ 架构合理。TERMINATE"
        return "收到"

sys = AutoGenStyleSystem()
sys.create_agent("user", "用户代理")
sys.create_agent("researcher", "技术研究专家", ["web_search"])
sys.create_agent("coder", "代码实现专家", ["code_editor"])
chat = sys.chat("user", "researcher", "如何构建高性能异步 API？")
for m in chat:
    print(f"[{m['name']}] {m['content']}")`,
          },
          {
            lang: "python",
            code: `# CrewAI 风格：定义团队和任务
@dataclass
class CrewAgent:
    role: str
    goal: str
    backstory: str
    tools: List[str]

@dataclass
class CrewTask:
    description: str
    expected_output: str
    agent: str
    context: List[str] = None

class CrewAIStyleSystem:
    """模拟 CrewAI 的团队编排系统"""
    def __init__(self):
        self.agents: Dict[str, CrewAgent] = {}
        self.tasks: List[CrewTask] = []

    def add_agent(self, id: str, agent: CrewAgent):
        self.agents[id] = agent

    def add_task(self, task: CrewTask):
        self.tasks.append(task)

    def kickoff(self) -> Dict[str, str]:
        results = {}
        completed = set()
        while len(completed) < len(self.tasks):
            progress = False
            for i, task in enumerate(self.tasks):
                if i in completed:
                    continue
                if task.context and not all(c in completed for c in task.context):
                    continue
                agent = self.agents[task.agent]
                ctx = " | ".join(results.get(c, "") for c in (task.context or []))
                results[f"task_{i}"] = f"[{agent.role}] {task.description} → {task.expected_output}"
                completed.add(i)
                progress = True
            if not progress:
                raise RuntimeError("循环依赖")
        return results

crew = CrewAIStyleSystem()
crew.add_agent("researcher", CrewAgent(
    "高级研究员", "找到最佳技术方案", "10年经验架构师", ["web_search"]))
crew.add_agent("coder", CrewAgent(
    "全栈工程师", "编写高质量代码", "擅长 Python 开发", ["code_editor"]))
crew.add_task(CrewTask("调研异步 Web 框架", "技术调研报告", "researcher"))
crew.add_task(CrewTask("基于调研实现 API", "可运行代码", "coder", ["task_0"]))
results = crew.kickoff()
for tid, r in results.items():
    print(f"{tid}: {r}")`,
          },
          {
            lang: "python",
            code: `# LangGraph 风格：基于图的 Agent 工作流
class LangGraphStyleSystem:
    """模拟 LangGraph 的图结构工作流"""
    def __init__(self):
        self.nodes: Dict[str, callable] = {}
        self.edges: Dict[str, str] = {}
        self.conditional: Dict[str, callable] = {}
        self.state: Dict[str, Any] = {}

    def add_node(self, name: str, handler: callable):
        self.nodes[name] = handler

    def add_edge(self, frm: str, to: str):
        self.edges[frm] = to

    def add_conditional(self, frm: str, router: callable):
        self.conditional[frm] = router

    def run(self, start: str, max_steps: int = 20) -> Dict:
        current = start
        log = []
        for step in range(max_steps):
            if current not in self.nodes:
                break
            result = self.nodes[current](self.state)
            self.state.update(result or {})
            log.append({"step": step, "node": current})
            if current in self.conditional:
                nxt = self.conditional[current](self.state)
                if nxt == "__end__":
                    break
                current = nxt
            elif current in self.edges:
                current = self.edges[current]
            else:
                break
        return {"state": self.state, "log": log}

# 构建工作流
wf = LangGraphStyleSystem()
wf.add_node("research", lambda s: {"research": "FastAPI 最佳"})
wf.add_node("implement", lambda s: {"code": "async def api(): ..."})
wf.add_node("review", lambda s: {"status": "approved" if "code" in s else "rejected"})
wf.add_node("deploy", lambda s: {"url": "https://api.example.com"})
wf.add_edge("research", "implement")
wf.add_edge("implement", "review")
wf.add_conditional("review", lambda s: "deploy" if s.get("status") == "approved" else "__end__")
result = wf.run("research")
print(f"执行 {len(result['log'])} 步，状态: {result['state']}")`,
          },
        ],
        table: {
          headers: ["特性", "AutoGen", "CrewAI", "LangGraph"],
          rows: [
            ["开发方", "Microsoft Research", "João Moura", "LangChain"],
            ["核心理念", "可对话的 Agent", "极简团队编排", "图结构工作流"],
            ["通信方式", "自然语言对话", "任务结果传递", "状态图传递"],
            ["人类参与", "原生支持", "支持", "需手动集成"],
            ["学习曲线", "较陡", "平缓", "中等"],
            ["适合规模", "中到大型", "小型到中型", "中型到大型"],
            ["循环支持", "天然支持", "有限支持", "完整支持"],
            ["生产就绪", "实验性", "生产可用", "生产可用"],
          ],
        },
        warning: "框架选择常见错误：① 过度工程——简单任务用 AutoGen 就像用大炮打蚊子；② 框架锁定——不要把业务逻辑深度耦合到某个框架的 API 中；③ 版本陷阱——这些框架迭代极快，注意 API breaking changes。",
      },
      {
        title: "7. 实际应用与未来展望",
        body: `Multi-Agent 系统已经从学术研究快速渗透到工业界的多个领域。理解当前的应用格局和未来趋势，能帮助你在正确的时机采用正确的技术。

在软件开发领域，MAS 已经展现出变革性的潜力。DevOps 流水线中的 Agent 可以自动完成代码审查、测试生成、性能分析和部署决策；在需求分析阶段，多个 Agent 可以分别从用户体验、技术可行性、安全合规等角度评估需求文档。像 Devin 这样的"AI 软件工程师"本质上就是一个精心设计的 Multi-Agent 系统。

在科学研究领域，MAS 正在改变研究范式。Science 期刊 2024 年的一篇论文展示了由多个 AI Agent 组成的"虚拟实验室"——它们可以独立提出假设、设计实验、分析数据、撰写论文，甚至相互评审。这种"AI for Science"的模式将极大地加速科学发现的进程。

展望未来，MAS 的发展将聚焦于几个关键方向：Agent 间的标准化通信协议（类似人类社会的通用语言）、自适应角色分配（Agent 根据任务动态调整角色）、跨模型协作（不同基座模型的 Agent 互补优势）、以及人机混合智能（人类和 Agent 团队的无缝融合）。`,
        mermaid: `graph TD
    A["MAS 应用领域"] --> B["软件开发"]
    A --> C["科学研究"]
    A --> D["商业智能"]
    A --> E["客户服务"]
    A --> F["教育"]

    B --> B1["代码生成 + 审查"]
    B --> B2["自动化测试"]
    B --> B3["DevOps 编排"]

    C --> C1["假设生成"]
    C --> C2["实验设计"]
    C --> C3["论文撰写"]

    D --> D1["市场监控"]
    D --> D2["竞品分析"]
    D --> D3["投资决策"]

    E --> E1["智能客服"]
    E --> E2["工单处理"]
    E --> E3["情感分析"]

    F --> F1["个性化教学"]
    F --> F2["自动批改"]
    F --> F3["学习规划"]`,
        code: [
          {
            lang: "python",
            code: `# 实际案例：自动化代码审查流水线
class AutomatedReviewSystem:
    """自动化代码审查 Multi-Agent 系统"""
    def __init__(self):
        self.agents = {
            "linter": self._run_linter,
            "security": self._security_scan,
            "complexity": self._check_complexity,
            "summary": self._generate_summary,
        }

    def review(self, code: str, pr_desc: str) -> Dict:
        results = {}
        for check in ["linter", "security", "complexity"]:
            results[check] = self.agents[check](code)
        results["summary"] = self.agents["summary"](results, pr_desc)
        results["approved"] = all(
            results[c].get("passed", False) for c in ["linter", "security", "complexity"]
        )
        return results

    def _run_linter(self, code: str) -> Dict:
        return {"passed": "SyntaxError" not in code, "issues": []}

    def _security_scan(self, code: str) -> Dict:
        issues = []
        if "eval(" in code:
            issues.append("使用 eval() 存在代码注入风险")
        if "os.system(" in code:
            issues.append("使用 os.system() 存在命令注入风险")
        return {"passed": len(issues) == 0, "issues": issues}

    def _check_complexity(self, code: str) -> Dict:
        lines = code.strip().split("\\n")
        return {
            "passed": len(lines) < 100,
            "metrics": {"lines": len(lines)},
        }

    def _generate_summary(self, results: Dict, pr_desc: str) -> Dict:
        total = sum(len(r.get("issues", [])) for r in results.values())
        return {
            "total_issues": total,
            "verdict": "通过" if total == 0 else f"需修复 {total} 个问题",
        }

reviewer = AutomatedReviewSystem()
code = "def process(data):\\n    result = eval(data['expr'])\\n    return result"
result = reviewer.review(code, "数据处理优化")
print(f"审查: {result['summary']['verdict']} (通过: {result['approved']})")`,
          },
        ],
        table: {
          headers: ["应用领域", "成熟度", "典型 Agent 数", "主要价值", "代表案例"],
          rows: [
            ["软件开发", "🟢 成熟", "2-5", "提升开发效率 40%+", "Devin, Copilot Workspace"],
            ["科学研究", "🟡 发展中", "3-10", "加速假设生成与验证", "AI Scientist, Sakana AI"],
            ["商业智能", "🟢 成熟", "3-8", "全天候多维度分析", "BloombergGPT 分析管线"],
            ["客户服务", "🟢 成熟", "2-4", "降低人工客服成本 60%", "Intercom Fin, Zendesk AI"],
            ["教育", "🟡 发展中", "2-5", "个性化学习路径", "Khanmigo, Duolingo Max"],
            ["法律合规", "🟠 早期", "3-6", "自动化合规审查", "Harvey AI"],
          ],
        },
        tip: "未来趋势关注点：① Agent 标准化——类似 RESTful API 的 Agent 通信标准正在形成；② 低成本 Agent——通过模型蒸馏和量化，让小模型也能胜任专业角色；③ 可信 Agent——可解释性、审计追踪和安全保障将成为企业采用的关键门槛。",
        warning: "MAS 应用的长期风险：① 系统复杂性失控——Agent 越多，调试和预测行为越困难；② 安全攻击面扩大——每个 Agent 都是潜在的攻击入口；③ 伦理与责任——当多个 Agent 协作做出错误决策时，责任归属难以界定。在设计系统时必须考虑这些因素。",
      },
    ],
  };
