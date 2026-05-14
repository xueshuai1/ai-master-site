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
  learningPath: {
    routeId: "agent-series",
    phase: 1,
    order: 1,
    nextStep: "agent-005",
    prevStep: null,
  },
    content: [
      {
        title: "1. 为什么需要 Multi-Agent？从单兵到团队的范式跃迁",
        body: `单 Agent 系统已经能够处理很多复杂任务，但在面对真正的大规模复杂问题时，单个 Agent 的局限性就会暴露出来。

**认知边界问题**：单个 LLM 的上下文窗口虽然越来越大（128K、256K、甚至 1M tokens），但它仍然是一个大脑。当任务涉及多个独立领域（例如：同时需要代码审查、安全审计、性能优化），单个 Agent 需要在不同思维模式之间频繁切换，容易遗漏细节。这就像一个程序员同时兼顾前端、后端、运维、测试——不是不能做，而是效率和质量的折中。

**专业化分工**：Multi-Agent 的核心思想是让每个 Agent 做它最擅长的事。一个 Agent 专门负责搜索和信息收集，一个专门负责代码生成，一个专门负责代码审查。每个 Agent 可以通过系统 prompt 被赋予特定的角色、专业知识和行为约束，就像人类团队中的专家角色。

**容错与鲁棒性**：单 Agent 系统中，如果核心 LLM 的输出出现偏差，整个任务链就会失败。Multi-Agent 系统可以通过多人投票、交叉验证、冗余执行等机制来提高系统的可靠性。即使某个 Agent 出错，其他 Agent 也能发现并纠正。

**可扩展性**：当业务增长、任务复杂度增加时，单 Agent 系统往往需要全面重构。Multi-Agent 系统则可以水平扩展——只需添加新的 Agent 角色，而无需修改现有 Agent 的逻辑。`,
        mermaid: `graph LR
    A["复杂任务"] --> B{"单 Agent or Multi-Agent?"}
    B -->|"领域单一\n步骤有限"| C["单 Agent"]
    B -->|"多领域\n高复杂度\n需要容错"| D["Multi-Agent"]
    D --> E["专业化分工"]
    D --> F["交叉验证"]
    D --> G["水平扩展"]
    C --> H["简单高效"]
    E --> I["质量更高"]
    F --> I
    G --> I`,
        table: {
          headers: ["维度", "单 Agent", "Multi-Agent", "适用场景"],
          rows: [
            ["任务复杂度", "中低", "高", "单 Agent 适合线性任务，Multi-Agent 适合网状任务"],
            ["上下文利用", "集中式，可能拥挤", "分布式，各自专注", "Multi-Agent 减少上下文竞争"],
            ["容错能力", "低（单点故障）", "高（交叉验证）", "关键任务推荐 Multi-Agent"],
            ["开发成本", "低", "中高", "快速验证用单 Agent"],
            ["可扩展性", "垂直（更强的模型）", "水平（更多 Agent）", "长期项目推荐 Multi-Agent"],
          ],
        },
        code: [
          {
            lang: "python",
            code: `# 单 Agent vs Multi-Agent 的代码结构对比

# ====== 单 Agent 模式 ======
class SingleAgent:
    """一个 Agent 干所有事"""
    def __init__(self, llm):
        self.llm = llm
    
    def handle_task(self, task: str) -> str:
        # 同一个 LLM 处理搜索、编码、审查...
        # prompt 里要包含所有领域的指令
        return self.llm(f"你是全能助手，请完成：{task}")

# ====== Multi-Agent 模式 ======
from dataclasses import dataclass
from typing import List, Optional

@dataclass
class AgentMessage:
    """Agent 之间传递的消息"""
    sender: str
    content: str
    message_type: str  # "request", "response", "feedback"
    metadata: dict = None

class AgentRole:
    """定义 Agent 的角色"""
    def __init__(self, name: str, system_prompt: str, llm):
        self.name = name
        self.system_prompt = system_prompt
        self.llm = llm
        self.message_history: List[AgentMessage] = []
    
    def process(self, message: AgentMessage) -> AgentMessage:
        prompt = f"{self.system_prompt}\\n\\n收到消息：{message.content}"
        response = self.llm(prompt)
        self.message_history.append(message)
        return AgentMessage(
            sender=self.name, content=response,
            message_type="response", metadata={"source_role": self.name}
        )

# 创建专业 Agent 团队
researcher = AgentRole("Researcher", 
    "你是一个专业研究员，负责收集和分析信息。", llm)
coder = AgentRole("Coder",
    "你是一个资深工程师，负责编写高质量代码。", llm)
reviewer = AgentRole("Reviewer",
    "你是一个严格的代码审查员，负责发现潜在问题。", llm)`,
          },
          {
            lang: "python",
            code: `# Multi-Agent 协作管道（Pipeline）
from typing import Callable, List

class AgentPipeline:
    """将多个 Agent 串联成处理管道"""
    def __init__(self):
        self.stages: List[AgentRole] = []
    
    def add_stage(self, agent: AgentRole):
        self.stages.append(agent)
        return self
    
    def execute(self, initial_input: str) -> str:
        current_input = initial_input
        for stage in self.stages:
            msg = AgentMessage(
                sender="Pipeline", content=current_input,
                message_type="request"
            )
            response = stage.process(msg)
            current_input = response.content
            print(f"[{stage.name}] -> {current_input[:80]}...")
        return current_input

# 构建处理管道
pipeline = (AgentPipeline()
    .add_stage(researcher)    # 先研究
    .add_stage(coder)         # 再编码
    .add_stage(reviewer)      # 最后审查
)

result = pipeline.execute("实现一个支持并发请求的 HTTP 客户端")`,
          },
        ],
        tip: "何时选择 Multi-Agent：当你的任务需要多个不同领域的专业知识、或者需要交叉验证来提高可靠性时，Multi-Agent 是更好的选择。但如果任务简单明确，单 Agent 更直接高效。",
      },
      {
        title: "2. 通信协议：Agent 之间的对话机制",
        body: `Multi-Agent 系统的核心挑战之一是：Agent 之间如何高效、准确地通信？这不仅仅是发消息这么简单，而是需要设计一套完整的协议。

直接通信 vs 间接通信：直接通信是两个 Agent 之间点对点地交换消息（A 发消息给 B），这种方式延迟低、语义明确，但耦合度高——每个 Agent 需要知道其他 Agent 的存在和能力。间接通信则是通过共享媒介（黑板模式、消息队列、共享数据库）进行交互，Agent 不需要知道消息的接收者是谁，只需将信息发布到共享空间。这种方式解耦了 Agent，但增加了协调的复杂性。

**消息格式设计**：良好的消息格式应该包含：消息类型（请求/响应/通知/错误）、发送者标识、内容载荷、时间戳、优先级、以及可选的元数据。JSON 是最常用的格式，但在高性能场景下，Protocol Buffers 或 MessagePack 可能更合适。

**同步 vs 异步通信**：同步通信要求发送者等待接收者的响应（类似函数调用），实现简单但容易阻塞。异步通信允许发送者继续执行其他任务，通过回调或事件总线接收响应（类似事件驱动），更适合大规模分布式系统。`,
        mermaid: `sequenceDiagram
    participant M as Manager Agent
    participant R as Researcher Agent
    participant C as Coder Agent
    participant V as Reviewer Agent
    participant B as 消息总线
    
    M->>B: 发布任务（异步）
    B->>R: 任务路由
    R->>R: 执行研究
    R->>B: 发布研究结果
    B->>C: 结果转发
    C->>C: 编写代码
    C->>B: 发布代码
    B->>V: 代码转发
    V->>V: 审查代码
    V->>B: 发布审查报告
    B->>M: 最终结果聚合
    M->>M: 生成最终输出`,
        table: {
          headers: ["通信模式", "实现方式", "优势", "劣势", "适用场景"],
          rows: [
            ["点对点直连", "Agent 直接调用", "延迟最低、语义清晰", "耦合度高、扩展困难", "固定 2-3 个 Agent 的小型系统"],
            ["消息总线", "Redis Pub/Sub、Kafka", "解耦、支持广播", "需要额外基础设施", "中等规模、动态 Agent 数量"],
            ["黑板模式", "共享数据结构/数据库", "完全解耦、灵活", "协调复杂、可能冲突", "高度动态、Agent 角色不确定"],
            ["RPC/HTTP", "REST/gRPC 调用", "标准化、跨语言", "网络延迟、依赖管理", "分布式部署、跨服务通信"],
          ],
        },
        code: [
          {
            lang: "python",
            code: `# 基于发布-订阅模式的 Agent 消息总线
import asyncio
from typing import Callable, Dict, List, Any
import json
import time

class MessageBus:
    """异步消息总线，支持发布-订阅模式"""
    def __init__(self):
        self._subscribers: Dict[str, List[Callable]] = {}
        self._message_log: List[dict] = []
    
    def subscribe(self, topic: str, callback: Callable):
        """订阅某个话题"""
        if topic not in self._subscribers:
            self._subscribers[topic] = []
        self._subscribers[topic].append(callback)
    
    async def publish(self, topic: str, data: Any, sender: str = "system"):
        """发布消息到话题"""
        message = {
            "topic": topic, "data": data,
            "sender": sender, "timestamp": time.time(),
            "msg_id": f"{topic}_{len(self._message_log)}",
        }
        self._message_log.append(message)
        print(f"[BUS] 发布 [{topic}] 来自 {sender}")
        tasks = []
        for callback in self._subscribers.get(topic, []):
            tasks.append(asyncio.create_task(callback(message)))
        if tasks:
            results = await asyncio.gather(*tasks, return_exceptions=True)
            for r in results:
                if isinstance(r, Exception):
                    print(f"  [BUS] 回调异常: {r}")
        return message
    
    def get_history(self, topic: str = None) -> List[dict]:
        if topic:
            return [m for m in self._message_log if m["topic"] == topic]
        return self._message_log

# 使用示例
bus = MessageBus()

async def on_research_result(msg):
    print(f"  [Coder] 收到研究结果: {msg['data'][:50]}...")

async def on_code_complete(msg):
    print(f"  [Reviewer] 收到代码: {msg['data'][:50]}...")

bus.subscribe("research.done", on_research_result)
bus.subscribe("code.done", on_code_complete)`,
          },
          {
            lang: "python",
            code: `# Agent 之间的结构化消息协议
from enum import Enum
from typing import Optional, Dict, Any
from dataclasses import dataclass, asdict
import json

class MessageType(Enum):
    TASK_ASSIGN = "task_assign"       # 分配任务
    TASK_COMPLETE = "task_complete"   # 任务完成
    REQUEST_INFO = "request_info"     # 请求信息
    PROVIDE_INFO = "provide_info"     # 提供信息
    ERROR = "error"                   # 错误报告
    FEEDBACK = "feedback"             # 反馈/评价
    VOTE = "vote"                     # 投票

@dataclass
class ProtocolMessage:
    """标准化的 Agent 间通信协议"""
    msg_type: MessageType
    sender: str
    receiver: str  # "*" 表示广播
    content: str
    payload: Dict[str, Any] = None
    priority: int = 5  # 1-10，10 最高
    thread_id: Optional[str] = None  # 关联同一对话线程
    reply_to: Optional[str] = None   # 回复哪条消息
    
    def to_json(self) -> str:
        d = asdict(self)
        d["msg_type"] = self.msg_type.value
        return json.dumps(d, ensure_ascii=False)
    
    @classmethod
    def from_json(cls, json_str: str) -> "ProtocolMessage":
        d = json.loads(json_str)
        d["msg_type"] = MessageType(d["msg_type"])
        return cls(**d)

# 示例：Task Manager 分配任务
assign_msg = ProtocolMessage(
    msg_type=MessageType.TASK_ASSIGN,
    sender="Manager",
    receiver="Researcher",
    content="请调研 Python 异步 HTTP 库的优缺点",
    payload={
        "task_id": "T-001",
        "deadline": "5min",
        "expected_format": "对比表格",
    },
    priority=7,
)
print(assign_msg.to_json())`,
          },
          {
            lang: "python",
            code: `# 黑板（Blackboard）模式的实现
class Blackboard:
    """共享黑板：Agent 们通过读写黑板进行间接通信"""
    def __init__(self):
        self._board: Dict[str, Any] = {}
        self._lock = asyncio.Lock()
        self._observers: Dict[str, List[Callable]] = {}
    
    async def write(self, key: str, value: Any, author: str):
        async with self._lock:
            old_value = self._board.get(key)
            self._board[key] = {
                "value": value, "author": author,
                "updated_at": time.time(), "version": 1
            }
            if old_value:
                self._board[key]["version"] = old_value.get("version", 0) + 1
            for callback in self._observers.get(key, []):
                await callback(key, value, author)
    
    def read(self, key: str) -> Optional[dict]:
        return self._board.get(key)
    
    def observe(self, key: str, callback: Callable):
        if key not in self._observers:
            self._observers[key] = []
        self._observers[key].append(callback)
    
    def snapshot(self) -> Dict[str, dict]:
        return {k: v for k, v in self._board.items()}

# Agent 通过黑板协作的示例
blackboard = Blackboard()

async def researcher_work():
    await blackboard.write("research_result", 
        {"frameworks": ["aiohttp", "httpx", "FastAPI"], "recommendation": "httpx"},
        "Researcher")

async def coder_work():
    result = blackboard.read("research_result")
    if result:
        print(f"基于 {result['value']['recommendation']} 进行编码...")
        await blackboard.write("code_draft", 
            "import httpx; async def fetch(url): ...", "Coder")`,
          },
        ],
        warning: "通信协议设计的关键陷阱：① 消息爆炸——Agent 之间产生大量不必要的消息，消耗资源并引入噪声。缓解方案：消息优先级过滤、话题隔离。② 循环依赖——Agent A 等待 Agent B 的输出，而 Agent B 又需要 Agent A 的结果。缓解方案：DAG 依赖管理、超时机制。③ 消息丢失——异步通信中消息可能因为异常而丢失。缓解方案：消息持久化、确认机制 ACK、重试策略。",
      },
      {
        title: "3. 角色分配：如何让每个 Agent 各司其职",
        body: `在 Multi-Agent 系统中，角色（Role）定义了每个 Agent 的职责、能力和行为边界。好的角色设计是系统成功的基石。

**角色设计的原则**：首先，角色应该是正交的——每个角色有明确的职责范围，尽量避免重叠。重叠的角色不仅浪费计算资源，还可能导致重复工作或冲突。其次，角色的粒度要适中：太粗（一个角色承担太多职责）会退化为单 Agent；太细（每个微小功能一个角色）会导致通信开销爆炸。经验法则是：角色数量等于任务领域中需要专业知识的独立子领域数量。

系统 Prompt 工程：角色的行为和输出格式主要通过系统 Prompt 定义。一个完整的角色 Prompt 应该包括：角色名称和描述、专业领域和知识范围、行为约束和规则、输出格式要求、以及与其他角色交互的方式。例如，Reviewer 角色的 Prompt 不仅要告诉它是代码审查员，还要指定审查的维度（安全性、性能、可读性、测试覆盖率）和输出格式（问题列表加严重等级加修复建议）。

**动态角色分配**：在一些更高级的系统中，角色不是静态分配的，而是根据任务需求动态创建和调整。例如，当任务中出现新的子领域时，系统可以实例化一个新的专家 Agent；当某个角色完成工作后，可以将其资源释放或重新分配。`,
        mermaid: `graph TD
    A["Multi-Agent 团队"] --> B["Manager\n任务分解与协调"]
    A --> C["Researcher\n信息收集与分析"]
    A --> D["Coder\n代码生成与实现"]
    A --> E["Reviewer\n质量审查与反馈"]
    A --> F["Tester\n测试验证"]
    A --> G["Writer\n文档生成"]
    
    B -->|"分配任务"| C
    B -->|"分配任务"| D
    C -->|"提供研究"| D
    D -->|"提交代码"| E
    E -->|"反馈修改"| D
    D -->|"完成代码"| F
    F -->|"测试结果"| B
    B -->|"触发文档"| G`,
        table: {
          headers: ["角色", "职责", "关键能力", "输出", "常见 Prompt 关键词"],
          rows: [
            ["Manager", "任务分解、协调、决策", "规划能力、全局视角", "任务分配方案、最终整合", "你是项目经理，负责分解任务并协调团队"],
            ["Researcher", "信息收集、分析、总结", "搜索、归纳、对比", "研究报告、对比分析", "你是领域专家，负责调研和分析"],
            ["Coder", "代码编写、实现", "编程、架构设计", "可运行代码、注释", "你是资深工程师，负责编写高质量代码"],
            ["Reviewer", "代码审查、质量评估", "批判性思维、安全性意识", "审查报告、修改建议", "你是严格的代码审查员，关注安全、性能和可维护性"],
            ["Tester", "测试设计、执行验证", "测试方法论、边界思维", "测试用例、测试报告", "你是 QA 工程师，负责设计全面的测试"],
          ],
        },
        code: [
          {
            lang: "python",
            code: `# 角色工厂：动态创建不同类型的 Agent
from enum import Enum
from typing import Dict, Callable, Optional

class RoleType(Enum):
    MANAGER = "manager"
    RESEARCHER = "researcher"
    CODER = "coder"
    REVIEWER = "reviewer"
    TESTER = "tester"

# 角色 Prompt 模板库
ROLE_PROMPTS: Dict[RoleType, str] = {
    RoleType.MANAGER: """你是项目 Manager，负责分解复杂任务、分配给合适的专家、协调进度并整合结果。
你的核心职责：
1. 分析用户需求的复杂度和涉及的领域
2. 将任务拆分为可独立执行的子任务
3. 根据子任务类型选择合适的专家角色
4. 监控各子任务的进度，处理阻塞和冲突
5. 整合所有子任务的结果，生成最终输出

决策原则：宁可多分配专家，也不让一个角色承担过多职责。""",

    RoleType.RESEARCHER: """你是 Researcher，负责信息收集、技术调研和分析对比。
你的工作方式：
1. 明确调研的目标和范围
2. 从多个来源收集信息（文档、最佳实践、案例）
3. 对比分析不同方案的优缺点
4. 给出基于证据的推荐意见

输出格式：使用结构化的对比表格，列出方案、优势、劣势、适用场景。""",

    RoleType.CODER: """你是 Coder，一位拥有 10 年经验的资深软件工程师。
你的编码原则：
1. 代码必须清晰、可读、可维护
2. 遵循 SOLID 原则和设计模式
3. 包含必要的类型注解和文档字符串
4. 考虑边界条件和错误处理
5. 优先使用标准库和成熟框架

输出要求：完整的可运行代码，包含注释和示例用法。""",

    RoleType.REVIEWER: """你是 Reviewer，一位经验丰富的技术负责人，负责代码审查。
审查维度：
1. 安全性：是否存在注入、溢出、权限绕过等漏洞
2. 性能：是否有不必要的计算、内存泄漏、N+1 查询
3. 可读性：命名是否清晰、结构是否合理、注释是否充分
4. 可维护性：是否遵循 DRY 原则、是否易于扩展和修改
5. 测试覆盖：关键逻辑是否有对应的测试

输出格式：按严重程度列出问题（Critical/Major/Minor），每个问题附带修复建议。""",
}

class RoleFactory:
    """角色工厂：根据角色类型创建配置好的 Agent"""
    @staticmethod
    def create(role_type: RoleType, llm: Callable, **kwargs) -> AgentRole:
        prompt = ROLE_PROMPTS.get(role_type)
        if not prompt:
            raise ValueError(f"未知角色类型: {role_type}")
        custom_prompt = kwargs.get("custom_prompt", "")
        if custom_prompt:
            prompt = f"{prompt}\\n\\n额外要求：{custom_prompt}"
        return AgentRole(role_type.value, prompt, llm)`,
          },
          {
            lang: "python",
            code: `# 动态角色分配算法
from collections import defaultdict

class DynamicRoleAssigner:
    """根据任务特征动态分配 Agent 角色"""
    
    def __init__(self):
        # 角色能力矩阵：角色 -> 擅长的任务类型
        self.role_capabilities = {
            RoleType.RESEARCHER: ["调研", "分析", "对比", "搜索", "总结"],
            RoleType.CODER: ["编码", "实现", "重构", "调试", "API"],
            RoleType.REVIEWER: ["审查", "评估", "安全", "性能", "优化"],
            RoleType.TESTER: ["测试", "验证", "覆盖率", "边界", "集成测试"],
            RoleType.MANAGER: ["协调", "规划", "整合", "分解"],
        }
    
    def assign_roles(self, task_description: str) -> Dict[str, list]:
        """分析任务描述，分配需要的角色"""
        words = set(task_description)
        
        # 计算每个角色与任务的匹配度
        role_scores = {}
        for role, keywords in self.role_capabilities.items():
            score = sum(1 for kw in keywords if any(kw in w for w in words))
            if score > 0:
                role_scores[role.value] = score
        
        # 总是需要 Manager
        role_scores.setdefault("manager", 1)
        
        # 按匹配度排序，选择匹配度 > 0 的角色
        assigned = {role: [] for role, score in role_scores.items() if score > 0}
        return assigned

# 使用示例
assigner = DynamicRoleAssigner()
task = "调研 Python 异步编程框架，对比 aiohttp 和 httpx，编写封装库并编写单元测试"
roles = assigner.assign_roles(task)
print(f"需要 {len(roles)} 个角色: {list(roles.keys())}")`,
          },
        ],
        tip: "角色设计的实用技巧：先定义最小可行团队（通常 3-4 个角色足以覆盖大多数场景）；给每个角色写一个自我介绍，如果两个角色的介绍有超过 30% 的重合度，考虑合并或重新划分；为每个角色定义清晰的交接点（什么条件下把控制权交给下一个角色）。",
      },
      {
        title: "4. 任务协调：从分解到交付的完整生命周期",
        body: `任务协调是 Multi-Agent 系统的中枢神经系统。它负责将用户的宏观目标拆解为具体的子任务，分配给合适的 Agent，监控执行进度，处理异常情况，最终整合结果。

任务分解（Task Decomposition）：这是协调的第一步，也是最关键的一步。好的分解应该满足三个标准：独立性（子任务可以并行执行，减少等待时间）、完整性（所有子任务的组合能够完成原始目标）、可验证性（每个子任务都有明确的完成标准）。常用的分解策略包括：按功能领域分解（搜索、编码、审查）、按数据流分解（输入处理、核心计算、输出生成）、按依赖关系分解（DAG 拓扑排序）。

**执行调度**：分解完成后，需要决定子任务的执行顺序。如果子任务之间没有依赖关系，可以并行执行以节省时间。如果存在依赖（例如：编码需要研究结果），则需要按拓扑顺序执行。调度器需要动态跟踪每个子任务的状态（待执行、执行中、已完成、失败），并在所有前置任务完成后启动依赖任务。

**结果整合**：当所有子任务完成后，Manager Agent 需要将结果整合为最终输出。整合不仅仅是简单的拼接——可能需要消除冗余、解决不一致、格式化输出、以及在必要时要求某些子任务重新执行。`,
        mermaid: `graph TD
    A["用户目标"] --> B["Manager: 任务分解"]
    B --> C{子任务依赖?}
    C -->|"无依赖"| D["并行执行"]
    C -->|"有依赖"| E["拓扑排序"]
    D --> F["Agent A: 执行"]
    D --> G["Agent B: 执行"]
    D --> H["Agent C: 执行"]
    E --> I["顺序执行"]
    F --> J["结果收集"]
    G --> J
    H --> J
    I --> J
    J --> K{"全部成功?"}
    K -->|"是"| L["整合结果"]
    K -->|"否"| M["错误处理/重试"]
    M --> F
    L --> N["最终输出"]`,
        table: {
          headers: ["调度策略", "并行度", "复杂度", "适用场景", "示例"],
          rows: [
            ["完全并行", "最高", "低", "子任务完全独立", "同时搜索多个关键词"],
            ["流水线（Pipeline）", "中", "低", "线性依赖链", "研究 -> 编码 -> 审查"],
            ["DAG 调度", "高", "中", "复杂依赖关系", "多输入多输出的数据处理"],
            ["动态优先级", "可变", "高", "不确定执行时间", "根据 Agent 负载动态调整"],
            ["工作窃取（Work Stealing）", "最高", "高", "任务量不均衡", "空闲 Agent 帮忙碌 Agent"],
          ],
        },
        code: [
          {
            lang: "python",
            code: `# 基于 DAG 的任务调度器
from collections import defaultdict, deque
from typing import Dict, List, Set, Callable, Any
import asyncio

class TaskNode:
    """DAG 中的任务节点"""
    def __init__(self, task_id: str, description: str, 
                 executor: Callable, depends_on: List[str] = None):
        self.task_id = task_id
        self.description = description
        self.executor = executor
        self.depends_on = depends_on or []
        self.result: Any = None
        self.status = "pending"  # pending, running, done, failed

class DAGScheduler:
    """基于有向无环图的任务调度器"""
    def __init__(self):
        self.tasks: Dict[str, TaskNode] = {}
        self._adjacency: Dict[str, List[str]] = defaultdict(list)
        self._in_degree: Dict[str, int] = defaultdict(int)
    
    def add_task(self, task: TaskNode):
        self.tasks[task.task_id] = task
        for dep in task.depends_on:
            self._adjacency[dep].append(task.task_id)
            self._in_degree[task.task_id] += 1
        self._in_degree.setdefault(task.task_id, 0)
    
    def get_ready_tasks(self) -> List[str]:
        """获取所有可以执行的任务（依赖已满足）"""
        return [tid for tid, node in self.tasks.items()
                if node.status == "pending" and self._in_degree.get(tid, 0) == 0]
    
    async def execute(self) -> Dict[str, Any]:
        """执行所有任务（BFS 拓扑排序）"""
        ready = self.get_ready_tasks()
        while ready:
            batch_tasks = []
            for tid in ready:
                task = self.tasks[tid]
                dep_results = {dep: self.tasks[dep].result 
                              for dep in task.depends_on}
                batch_tasks.append(self._run_task(task, dep_results))
            
            results = await asyncio.gather(*batch_tasks, return_exceptions=True)
            
            for tid, result in zip(ready, results):
                if isinstance(result, Exception):
                    self.tasks[tid].status = "failed"
                    self.tasks[tid].result = f"Error: {result}"
                    print(f"  任务 {tid} 失败: {result}")
                else:
                    self.tasks[tid].status = "done"
                    self.tasks[tid].result = result
                    for successor in self._adjacency.get(tid, []):
                        self._in_degree[successor] -= 1
            
            ready = self.get_ready_tasks()
        
        pending = [t for t in self.tasks.values() if t.status == "pending"]
        if pending:
            print(f"  检测到循环依赖: {[t.task_id for t in pending]}")
        
        return {tid: t.result for tid, t in self.tasks.items()}
    
    async def _run_task(self, task: TaskNode, dep_results: dict) -> Any:
        task.status = "running"
        print(f"  执行任务: {task.description}")
        return await task.executor(dep_results) if asyncio.iscoroutinefunction(task.executor) else task.executor(dep_results)`,
          },
          {
            lang: "python",
            code: `# 使用 DAG 调度器构建 Multi-Agent 任务流
async def build_article_pipeline(llm):
    """构建一个文章生成的 DAG 任务流"""
    scheduler = DAGScheduler()
    
    # T1: 研究（无依赖）
    async def research_task(deps):
        researcher = AgentRole("Researcher", ROLE_PROMPTS[RoleType.RESEARCHER], llm)
        msg = AgentMessage("Scheduler", "调研 2026 年 AI Agent 最新进展", "request")
        return researcher.process(msg).content
    scheduler.add_task(TaskNode("research", "调研", research_task))
    
    # T2: 大纲（依赖研究）
    async def outline_task(deps):
        result = deps.get("research", "")
        msg = AgentMessage("Scheduler", f"基于以下研究写文章大纲:\\n{result[:200]}", "request")
        manager = AgentRole("Manager", ROLE_PROMPTS[RoleType.MANAGER], llm)
        return manager.process(msg).content
    scheduler.add_task(TaskNode("outline", "大纲", outline_task, ["research"]))
    
    # T3: 正文（依赖大纲）
    async def body_task(deps):
        outline = deps.get("outline", "")
        msg = AgentMessage("Scheduler", f"根据以下大纲撰写正文:\\n{outline[:200]}", "request")
        coder = AgentRole("Coder", ROLE_PROMPTS[RoleType.CODER], llm)
        return coder.process(msg).content
    scheduler.add_task(TaskNode("body", "正文", body_task, ["outline"]))
    
    # T4: 审查（依赖正文）
    async def review_task(deps):
        body = deps.get("body", "")
        msg = AgentMessage("Scheduler", f"审查以下文章:\\n{body[:300]}", "request")
        reviewer = AgentRole("Reviewer", ROLE_PROMPTS[RoleType.REVIEWER], llm)
        return reviewer.process(msg).content
    scheduler.add_task(TaskNode("review", "审查", review_task, ["body"]))
    
    results = await scheduler.execute()
    return results

# 执行
# results = asyncio.run(build_article_pipeline(some_llm))
# print(results)  # {'research': ..., 'outline': ..., 'body': ..., 'review': ...}`,
          },
        ],
        warning: "任务协调的常见陷阱：① 过度分解——把任务拆得太细，导致 Agent 之间通信开销超过计算收益。经验法则是每个子任务应该至少需要 30 秒以上的计算量。② 隐藏依赖——某些子任务看似独立，实际共享隐式依赖（如同一个外部 API）。调度器需要识别这类依赖，避免并发请求导致限流或数据不一致。③ 结果爆炸——多个 Agent 的输出加起来远超过原始任务的合理规模。需要在整合阶段进行摘要和裁剪。",
      },
      {
        title: "5. 冲突解决：当 Agent 们意见不合时",
        body: `在 Multi-Agent 系统中，冲突是不可避免的。不同的 Agent 可能对同一问题给出不同答案，可能对任务的执行方式有分歧，甚至可能在资源使用上产生竞争。有效的冲突解决机制是系统可靠性的关键保障。

**冲突的类型**：首先是内容冲突——例如 Researcher 推荐方案 A，Coder 认为方案 B 更好。这类冲突本质上是哪个方案更优的判断问题。其次是资源冲突——多个 Agent 同时请求同一个受限资源（如 API 密钥的速率限制、同一数据库的写入锁）。第三是流程冲突——Manager 要求先做 X 再做 Y，但某个 Agent 认为先做 Y 更高效。

**解决策略**：对于内容冲突，最常用的方法是投票机制（多个 Agent 各自给出判断，取多数意见）和仲裁机制（由一个更高权限的 Agent 做出最终决定）。对于资源冲突，需要实现资源管理器和锁机制。对于流程冲突，Manager 应该保留最终决策权，但允许 Agent 提出异议（类似人类团队中的强烈反对但服从模式）。

**冲突记录与学习**：一个好的 Multi-Agent 系统不仅解决冲突，还会记录冲突的历史。通过分析过去的冲突模式，系统可以优化角色定义、改进任务分解、甚至自动调整 Agent 的行为策略。`,
        mermaid: `graph TD
    A["检测到冲突"] --> B{"冲突类型?"}
    B -->|"内容冲突"| C["投票/仲裁"]
    B -->|"资源冲突"| D["资源锁 + 队列"]
    B -->|"流程冲突"| E["Manager 仲裁"]
    
    C --> F["多数投票"]
    C --> G["权重投票"]
    C --> H["仲裁者决定"]
    
    F --> I["执行胜出方案"]
    G --> I
    H --> I
    D --> I
    E --> I
    
    I --> J["记录冲突到日志"]
    J --> K["分析冲突模式"]
    K --> L["优化角色定义"]`,
        table: {
          headers: ["策略", "原理", "优势", "劣势", "适用场景"],
          rows: [
            ["多数投票", "多个 Agent 各自判断，取多数", "简单公平、容错", "可能出现平票、成本高", "客观判断、分类问题"],
            ["权重投票", "按 Agent 专业度加权投票", "尊重专业意见", "权重设定主观", "不同专业度的 Agent"],
            ["仲裁者模式", "指定一个 Manager 做最终决定", "决策快速、责任明确", "仲裁者可能判断失误", "时间敏感、需要快速决策"],
            ["辩论模式", "Agent 互相辩论，达成共识", "充分讨论、结果高质量", "耗时长、可能无法达成共识", "重要决策、需要深度分析"],
            ["置信度比较", "每个 Agent 给出答案加置信度，选最高", "量化不确定性", "LLM 的置信度不可靠", "概率判断、风险评估"],
          ],
        },
        code: [
          {
            lang: "python",
            code: `# 加权投票冲突解决机制
from typing import List, Dict, Any
from collections import Counter

class WeightedVoter:
    """基于权重的多 Agent 投票系统"""
    def __init__(self):
        self._weights: Dict[str, float] = {}
        self._votes: Dict[str, Any] = {}
    
    def set_weight(self, agent_name: str, weight: float):
        """设置 Agent 的投票权重"""
        self._weights[agent_name] = max(0.0, weight)
    
    def cast_vote(self, agent_name: str, vote: Any, confidence: float = 1.0):
        """Agent 投票"""
        weight = self._weights.get(agent_name, 1.0)
        effective_weight = weight * confidence
        self._votes[agent_name] = {"vote": vote, "weight": effective_weight}
    
    def tally(self) -> Dict[str, Any]:
        """统计投票结果"""
        score_map: Dict[str, float] = {}
        vote_map: Dict[str, str] = {}
        for agent, data in self._votes.items():
            vote_key = str(data["vote"])
            vote_map[vote_key] = data["vote"]
            score_map[vote_key] = score_map.get(vote_key, 0) + data["weight"]
        
        if not score_map:
            return {"winner": None, "scores": {}, "total_votes": 0}
        
        winner_key = max(score_map, key=score_map.get)
        total_weight = sum(score_map.values())
        
        return {
            "winner": vote_map[winner_key],
            "scores": {k: round(v / total_weight, 3) for k, v in score_map.items()},
            "total_votes": len(self._votes),
            "consensus": max(score_map.values()) / total_weight > 0.7,
        }

# 使用示例：三个 Agent 对技术方案投票
voter = WeightedVoter()
voter.set_weight("Researcher", 0.3)
voter.set_weight("Coder", 0.5)
voter.set_weight("Reviewer", 0.4)

voter.cast_vote("Researcher", "方案A", 0.8)
voter.cast_vote("Coder", "方案B", 0.9)
voter.cast_vote("Reviewer", "方案A", 0.7)

result = voter.tally()
print(f"胜出: {result['winner']}, 共识: {result['consensus']}")`,
          },
          {
            lang: "python",
            code: `# 辩论式冲突解决（Debate-based Resolution）
class DebateModerator:
    """辩论主持人：引导 Agent 进行结构化辩论"""
    def __init__(self, llm, max_rounds: int = 3):
        self.llm = llm
        self.max_rounds = max_rounds
        self.transcript: List[Dict] = []
    
    def moderate(self, topic: str, positions: Dict[str, str]) -> str:
        """主持辩论
        topic: 争议话题
        positions: {agent_name: 立场}
        """
        agent_names = list(positions.keys())
        print(f"辩论开始：{topic}")
        print(f"   参与方: {', '.join(agent_names)}")
        
        for round_num in range(self.max_rounds):
            print(f"\\n--- 第 {round_num + 1} 轮 ---")
            for agent_name in agent_names:
                history = "\\n".join(
                    f"[{t['agent']}]: {t['argument'][:100]}" 
                    for t in self.transcript[-4:]
                )
                prompt = f"""辩论话题：{topic}
你的立场：{positions[agent_name]}
之前的辩论记录：
{history}

请用 3-5 句话陈述你的观点。如果是后续轮次，请回应其他参与方的论点。"""
                argument = self.llm(prompt)
                self.transcript.append({
                    "agent": agent_name, "round": round_num + 1,
                    "argument": argument
                })
                print(f"  [{agent_name}]: {argument[:80]}...")
        
        full_transcript = "\\n".join(
            f"[{t['agent']} R{t['round']}]: {t['argument']}" 
            for t in self.transcript
        )
        verdict_prompt = f"""作为公正的裁判，请根据以下辩论内容做出裁决。
辩论话题：{topic}
{full_transcript}

请给出裁决结果，说明哪一方的论点更有说服力，为什么。"""
        return self.llm(verdict_prompt)`,
          },
          {
            lang: "python",
            code: `# 冲突日志与学习系统
import json
from datetime import datetime

class ConflictLogger:
    """记录和分析 Agent 之间的冲突"""
    def __init__(self, log_file: str = "conflicts.json"):
        self.log_file = log_file
        self.conflicts = self._load()
    
    def _load(self) -> List[dict]:
        try:
            with open(self.log_file) as f:
                return json.load(f)
        except FileNotFoundError:
            return []
    
    def log_conflict(self, conflict_type: str, agents: List[str],
                     descriptions: Dict[str, str], resolution: str,
                     winner: str = None):
        entry = {
            "timestamp": datetime.now().isoformat(),
            "type": conflict_type,
            "agents": agents,
            "positions": descriptions,
            "resolution": resolution,
            "winner": winner,
        }
        self.conflicts.append(entry)
        self._save()
    
    def _save(self):
        with open(self.log_file, 'w') as f:
            json.dump(self.conflicts, f, ensure_ascii=False, indent=2)
    
    def get_patterns(self) -> Dict[str, Any]:
        """分析冲突模式"""
        type_counts = Counter(c["type"] for c in self.conflicts)
        agent_conflict_count = Counter()
        for c in self.conflicts:
            for agent in c["agents"]:
                agent_conflict_count[agent] += 1
        
        return {
            "total_conflicts": len(self.conflicts),
            "by_type": dict(type_counts),
            "most_conflicted_agents": dict(agent_conflict_count.most_common(3)),
            "recent_trend": "increasing" if len(self.conflicts) > 5 
                           and self.conflicts[-3:] else "stable",
        }

# 使用
logger = ConflictLogger()
logger.log_conflict(
    conflict_type="content_disagreement",
    agents=["Researcher", "Coder"],
    descriptions={
        "Researcher": "推荐使用 httpx，性能更好",
        "Coder": "推荐使用 aiohttp，生态更成熟"
    },
    resolution="加权投票，Coder 权重更高（实际开发经验）",
    winner="Coder"
)
print(json.dumps(logger.get_patterns(), indent=2, ensure_ascii=False))`,
          },
        ],
        tip: "冲突解决的实用建议：预防胜于治疗——在角色定义阶段就明确边界条件，减少模糊地带；建立升级路径——低级别冲突由 Agent 自行解决，中级别引入投票，高级别交给 Manager 仲裁；允许建设性冲突——不是所有分歧都是坏事，适度的观点碰撞往往能产生更好的结果。",
      },
      {
        title: "6. 典型 Multi-Agent 架构深入解析",
        body: `当前主流的 Multi-Agent 框架各有不同的设计哲学和架构风格。理解它们的底层架构，能帮助你在选择框架时做出更明智的决策。

**CrewAI** 的角色-任务-流程架构：**CrewAI** 采用最直观的设计——你定义 Role（角色）、Task（任务）、Process（流程），然后框架自动管理 Agent 之间的协作。它的 Process 支持 Sequential（顺序执行）和 Hierarchical（层级管理）两种模式。CrewAI 的优势在于极简的 API 设计，但灵活性和自定义能力相对有限。

**AutoGen** 的对话驱动架构：**AutoGen** 的核心思想是：Agent 之间的协作本质上是对话。每个 Agent 可以与其他 Agent 进行多轮对话，通过对话来交换信息、协商方案、解决问题。AutoGen 支持非常灵活的多 Agent 拓扑结构：可以是星形（中心 Agent 协调）、环形（Agent 链式传递）、全连接（任何 Agent 之间直接通信）。

ReAct 架构的多 Agent 扩展：虽然 ReAct 最初是为单 Agent 设计的（Thought 到 Action 到 Observation），但在 Multi-Agent 场景下，每个 Agent 都可以独立执行 ReAct 循环，同时通过共享的观察空间进行协作。这种架构的优势是每个 Agent 都保持自主性，同时又能感知到全局状态。`,
        mermaid: `graph LR
    subgraph CrewAI 架构
        A1["Role 1"] --> A2["Task 1"]
        A3["Role 2"] --> A4["Task 2"]
        A5["Role 3"] --> A6["Task 3"]
        A2 --> A7["Process: Sequential/Hierarchical"]
        A4 --> A7
        A6 --> A7
    end
    
    subgraph AutoGen 架构
        B1["User Proxy"] <-->|"对话"| B2["Assistant Agent"]
        B2 <-->|"对话"| B3["Expert Agent"]
        B1 <-->|"对话"| B3
    end
    
    subgraph Multi-ReAct 架构
        C1["Agent A: Thought->Action->Obs"] -.共享观测.-> C2["Agent B: Thought->Action->Obs"]
        C2 -.共享观测.-> C3["Agent C: Thought->Action->Obs"]
    end`,
        table: {
          headers: ["框架", "核心理念", "通信方式", "编排模式", "学习曲线", "生态"],
          rows: [
            ["CrewAI", "角色-任务-流程", "共享上下文", "Sequential / Hierarchical", "低", "快速增长中"],
            ["AutoGen", "对话即协作", "Agent 对话", "灵活拓扑（星形/环形/全连接）", "中等", "Microsoft 支持"],
            ["LangGraph", "图结构工作流", "状态传递", "有向图（循环、分支）", "中等", "LangChain 生态"],
            ["OpenAI Swarm", "极简协作", "Handoff 协议", "Agent 之间切换", "低", "官方实验性"],
            ["MetaGPT", "软件公司模拟", "结构化消息", "SOP 标准流程", "较陡", "学术导向"],
          ],
        },
        code: [
          {
            lang: "python",
            code: `# CrewAI 风格的架构实现（简化版）
from typing import List, Optional
from dataclasses import dataclass, field

@dataclass
class Task:
    description: str
    agent: Optional[str] = None
    expected_output: str = ""
    is_complete: bool = False
    result: str = ""

@dataclass
class Crew:
    """CrewAI 风格的团队编排"""
    agents: Dict[str, AgentRole] = field(default_factory=dict)
    tasks: List[Task] = field(default_factory=list)
    process: str = "sequential"  # sequential | hierarchical
    
    def add_agent(self, agent: AgentRole):
        self.agents[agent.name] = agent
    
    def add_task(self, task: Task):
        self.tasks.append(task)
    
    def kickoff(self) -> str:
        """启动团队执行任务"""
        if self.process == "sequential":
            return self._sequential_process()
        elif self.process == "hierarchical":
            return self._hierarchical_process()
        else:
            raise ValueError(f"未知流程: {self.process}")
    
    def _sequential_process(self) -> str:
        """顺序执行：按任务列表依次执行"""
        context = ""
        for task in self.tasks:
            if task.agent and task.agent in self.agents:
                agent = self.agents[task.agent]
                input_text = f"{task.description}\\n\\n上下文信息:\\n{context}" if context else task.description
                msg = AgentMessage("Crew", input_text, "request")
                result = agent.process(msg).content
                task.result = result
                task.is_complete = True
                context += f"\\n[{task.agent} 的结果]: {result[:200]}"
                print(f"  完成: {task.description[:40]}...")
        return context
    
    def _hierarchical_process(self) -> str:
        """层级执行：Manager Agent 协调所有任务"""
        manager = self.agents.get("manager")
        if not manager:
            return self._sequential_process()
        
        task_summary = "\\n".join(
            f"- [{t.agent}] {t.description}" for t in self.tasks
        )
        msg = AgentMessage("Crew", f"请协调完成以下任务:\\n{task_summary}", "request")
        return manager.process(msg).content`,
          },
          {
            lang: "python",
            code: `# AutoGen 风格的对话驱动架构
class ConversationalAgent:
    """AutoGen 风格的对话式 Agent"""
    def __init__(self, name: str, system_prompt: str, llm, 
                 can_terminate: bool = False, can_ask_human: bool = False):
        self.name = name
        self.system_prompt = system_prompt
        self.llm = llm
        self.can_terminate = can_terminate
        self.can_ask_human = can_ask_human
        self.chat_history: List[Dict] = []
    
    def receive(self, message: str, sender: str) -> str:
        """接收消息并回复"""
        self.chat_history.append({"role": "user", "content": message, "sender": sender})
        
        context = "\\n".join(
            f"[{m['sender']}]: {m['content']}" for m in self.chat_history[-10:]
        )
        prompt = f"{self.system_prompt}\\n\\n对话历史:\\n{context}\\n\\n请回复："
        
        reply = self.llm(prompt)
        self.chat_history.append({"role": "assistant", "content": reply, "sender": self.name})
        return reply
    
    def is_termination(self, message: str) -> bool:
        """判断对话是否应该终止"""
        if not self.can_terminate:
            return False
        termination_signals = ["TERMINATE", "任务完成", "没有问题了", "done"]
        return any(signal in message.upper() for signal in termination_signals)

class GroupChat:
    """AutoGen 风格的群聊"""
    def __init__(self, agents: List[ConversationalAgent], max_rounds: int = 10):
        self.agents = {a.name: a for a in agents}
        self.max_rounds = max_rounds
        self.messages: List[Dict] = []
    
    def run(self, initial_message: str, speaker_order: List[str] = None) -> str:
        """运行群聊"""
        self.messages.append({"sender": "User", "content": initial_message})
        current_speaker_idx = 0
        
        for round_num in range(self.max_rounds):
            if speaker_order:
                speaker_name = speaker_order[current_speaker_idx % len(speaker_order)]
                current_speaker_idx += 1
            else:
                speaker_name = list(self.agents.keys())[round_num % len(self.agents)]
            
            agent = self.agents[speaker_name]
            last_message = self.messages[-1]["content"]
            
            reply = agent.receive(last_message, self.messages[-1]["sender"])
            self.messages.append({"sender": speaker_name, "content": reply})
            print(f"  [{speaker_name}]: {reply[:60]}...")
            
            if agent.is_termination(reply):
                print(f"  {speaker_name} 发起终止")
                break
        
        return self.messages[-1]["content"]`,
          },
          {
            lang: "python",
            code: `# Multi-ReAct 架构：多个 Agent 共享观察空间
class SharedObservationSpace:
    """多个 ReAct Agent 共享的观察空间"""
    def __init__(self):
        self.observations: List[Dict] = []
        self.global_state: Dict[str, Any] = {}
    
    def publish(self, agent_name: str, thought: str, action: str, observation: str):
        """Agent 发布自己的 ReAct 步骤"""
        entry = {
            "agent": agent_name, "thought": thought,
            "action": action, "observation": observation,
            "timestamp": time.time(),
        }
        self.observations.append(entry)
        self.global_state[f"{agent_name}_last_observation"] = observation
    
    def get_shared_context(self, agent_name: str, last_n: int = 5) -> str:
        """获取共享上下文（不包括自己的最新步骤）"""
        others = [o for o in self.observations[-last_n*2:] if o["agent"] != agent_name]
        if not others:
            return "暂无其他 Agent 的观察结果。"
        return "\\n".join(
            f"[{o['agent']}] 行动: {o['action']}\\n  结果: {o['observation'][:100]}"
            for o in others
        )
    
    def get_global_state(self) -> Dict[str, Any]:
        return dict(self.global_state)

class MultiReactAgent(AgentRole):
    """执行 ReAct 循环的 Agent，可以感知其他 Agent 的观察"""
    def __init__(self, name: str, system_prompt: str, llm, shared_space: SharedObservationSpace):
        super().__init__(name, system_prompt, llm)
        self.shared_space = shared_space
    
    def react_step(self, goal: str, max_steps: int = 5) -> str:
        for step in range(max_steps):
            shared_context = self.shared_space.get_shared_context(self.name)
            
            prompt = f"""{self.system_prompt}

目标: {goal}
其他 Agent 的观察:
{shared_context}

请用 ReAct 格式回复:
Thought: <思考>
Action: <行动>
Observation: <你观察到的结果>"""
            
            response = self.llm(prompt)
            
            thought = self._extract(response, "Thought:")
            action = self._extract(response, "Action:")
            observation = self._extract(response, "Observation:")
            
            self.shared_space.publish(self.name, thought, action, observation)
            
            if "done" in observation.lower() or not action:
                return observation
        
        return "达到最大步数"
    
    def _extract(self, text: str, prefix: str) -> str:
        for line in text.split("\\n"):
            if line.startswith(prefix):
                return line[len(prefix):].strip()
        return ""`,
          },
        ],
        warning: "框架选择的常见误区：追求最新最火——新框架可能功能丰富但不够稳定，生产环境应优先选择经过验证的方案。过度工程化——简单任务不需要复杂框架，如果 3 个 Agent 顺序执行就能解决问题，不要引入完整的消息总线和 DAG 调度器。忽略团队熟悉度——框架的学习曲线直接影响开发效率。如果团队已经熟悉 LangChain，切换到 AutoGen 的隐性成本可能高于框架本身的优势。",
      },
      {
        title: "7. 实战案例：构建一个完整的 Multi-Agent 代码评审系统",
        body: `理论说得再多，不如一个完整案例来得直观。我们将设计一个 Multi-Agent 代码评审系统，模拟真实软件开发流程中的代码评审环节。

**系统设计**：这个系统包含四个 Agent——Coder（提交代码的开发者）、StaticAnalyzer（静态分析 Agent，检查代码风格、复杂度、潜在 Bug）、SecurityReviewer（安全审查 Agent，检查安全漏洞）、TechLead（技术负责人，汇总所有意见并给出最终评审结论）。

**工作流程**：Coder 提交代码后，StaticAnalyzer 和 SecurityReviewer 并行执行分析（因为它们之间没有依赖关系），两者的结果汇总后交给 TechLead，TechLead 综合所有信息生成最终的评审报告。这个过程完美展示了 Multi-Agent 系统的并行处理和专业分工优势。

**技术实现**：我们将使用前面章节介绍的通信协议（消息总线）、角色定义（角色工厂）、任务调度（DAG 调度器）来构建完整的系统。这个案例将把所有概念串联起来，展示如何从零构建一个实用的 Multi-Agent 应用。`,
        mermaid: `graph TD
    A["Coder 提交代码"] --> B["消息总线分发"]
    B --> C["StaticAnalyzer"]
    B --> D["SecurityReviewer"]
    
    C --> C1["代码风格检查"]
    C --> C2["复杂度分析"]
    C --> C3["潜在 Bug 检测"]
    
    D --> D1["注入漏洞扫描"]
    D --> D2["权限检查"]
    D --> D3["依赖安全分析"]
    
    C1 --> E["结果聚合"]
    C2 --> E
    C3 --> E
    D1 --> E
    D2 --> E
    D3 --> E
    
    E --> F["TechLead 综合评审"]
    F --> G["生成评审报告"]
    G --> H{"通过?"}
    H -->|"是"| I["合并代码"]
    H -->|"否"| J["返回修改意见给 Coder"]
    J --> A`,
        table: {
          headers: ["Agent", "职责", "检查项", "输出格式", "优先级"],
          rows: [
            ["StaticAnalyzer", "代码质量分析", "PEP8 规范、圈复杂度、重复代码、未使用变量", "JSON: issues 列表", "高"],
            ["SecurityReviewer", "安全漏洞扫描", "SQL 注入、XSS、硬编码密钥、不安全的反序列化", "JSON: vulnerabilities 列表", "最高"],
            ["TechLead", "综合评审决策", "整合所有分析结果、权衡问题严重程度、给出最终建议", "文本: 评审报告加通过或拒绝决定", "高"],
            ["Coder", "代码提交与修改", "根据评审意见修改代码、回复评审意见", "文本: 修改说明加更新后的代码", "中"],
          ],
        },
        code: [
          {
            lang: "python",
            code: `# 静态分析 Agent（模拟 AST 级别的代码分析）
import ast
import re
from typing import List, Dict

class StaticAnalyzerAgent:
    """模拟静态分析的 Agent"""
    def __init__(self, llm):
        self.llm = llm
        self.name = "StaticAnalyzer"
    
    def analyze(self, code: str) -> Dict:
        """执行多维度代码分析"""
        issues = []
        
        # 规则 1: 检查函数长度（超过 50 行的大函数）
        try:
            tree = ast.parse(code)
            for node in ast.walk(tree):
                if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef)):
                    lines = node.end_lineno - node.lineno + 1 if hasattr(node, 'end_lineno') else 0
                    if lines > 50:
                        issues.append({
                            "line": node.lineno, "type": "complexity",
                            "severity": "warning",
                            "message": f"函数 '{node.name}' 有 {lines} 行，建议拆分为更小的函数"
                        })
        except SyntaxError as e:
            issues.append({"line": e.lineno, "type": "syntax", "severity": "error",
                          "message": f"语法错误: {e.msg}"})
        
        # 规则 2: 检查 TODO/FIXME/HACK 注释
        for i, line in enumerate(code.split("\\n"), 1):
            if re.search(r'#.*\\b(TODO|FIXME|HACK|XXX)\\b', line):
                issues.append({
                    "line": i, "type": "code_smell",
                    "severity": "info",
                    "message": f"发现标记注释: {line.strip()}"
                })
        
        # 规则 3: LLM 辅助语义分析
        if issues:
            llm_prompt = f"""分析以下 Python 代码的质量问题：

代码片段:
{code[:2000]}

已发现的机械检查问题：
{issues}

请补充：命名是否清晰、是否有更好的设计模式、整体代码结构建议"""
            llm_feedback = self.llm(llm_prompt)
        else:
            llm_feedback = "代码结构良好，未发现明显质量问题。"
        
        return {
            "agent": self.name,
            "total_issues": len(issues),
            "issues": issues,
            "llm_feedback": llm_feedback,
            "status": "passed" if not any(i["severity"] == "error" for i in issues) else "failed"
        }`,
          },
          {
            lang: "python",
            code: `# 安全审查 Agent
class SecurityReviewerAgent:
    """安全漏洞扫描 Agent"""
    def __init__(self, llm):
        self.llm = llm
        self.name = "SecurityReviewer"
        # 常见的安全模式
        self.dangerous_patterns = [
            (r'eval\\s*\\(', "使用 eval() 可能导致代码注入"),
            (r'exec\\s*\\(', "使用 exec() 可能导致代码注入"),
            (r'os\\.system\\s*\\(', "os.system() 可能导致命令注入"),
            (r'subprocess\\.call\\s*\\(.*shell\\s*=\\s*True', "shell=True 可能导致命令注入"),
            (r'(?i)password\\s*=\\s*["\\x27][^"\\x27]+["\\x27]', "硬编码密码"),
            (r'(?i)api[_-]?key\\s*=\\s*["\\x27][^"\\x27]+["\\x27]', "硬编码 API 密钥"),
            (r'(?i)secret\\s*=\\s*["\\x27][^"\\x27]+["\\x27]', "硬编码密钥"),
            (r'pickle\\.loads?', "pickle 反序列化可能导致远程代码执行"),
            (r'marshal\\.loads?', "marshal 反序列化可能不安全"),
        ]
    
    def review(self, code: str) -> Dict:
        vulnerabilities = []
        
        # 规则扫描
        for pattern, message in self.dangerous_patterns:
            for i, line in enumerate(code.split("\\n"), 1):
                if re.search(pattern, line):
                    vulnerabilities.append({
                        "line": i, "severity": "critical" if "注入" in message else "high",
                        "type": "security", "description": message,
                        "code": line.strip()
                    })
        
        # LLM 深度安全分析
        llm_prompt = f"""作为安全专家，审查以下代码的安全漏洞：

代码片段:
{code[:2000]}

请检查：
1. 输入验证是否充分
2. 是否存在 SQL 注入、XSS、CSRF 风险
3. 认证和授权逻辑是否安全
4. 敏感数据处理是否合规
5. 依赖包是否有已知漏洞

列出发现的所有安全问题，按严重程度排序。"""
        llm_security_report = self.llm(llm_prompt)
        
        critical_count = sum(1 for v in vulnerabilities if v["severity"] == "critical")
        return {
            "agent": self.name,
            "vulnerabilities": vulnerabilities,
            "llm_security_report": llm_security_report,
            "critical_count": critical_count,
            "status": "blocked" if critical_count > 0 else "passed"
        }`,
          },
          {
            lang: "python",
            code: `# 技术负责人 Agent + 完整的代码评审流程
class TechLeadAgent:
    """技术负责人：综合分析并做出评审决策"""
    def __init__(self, llm):
        self.llm = llm
        self.name = "TechLead"
    
    def review(self, code: str, static_result: Dict, security_result: Dict) -> Dict:
        """综合评审"""
        all_issues = []
        all_issues.extend(static_result.get("issues", []))
        all_issues.extend(security_result.get("vulnerabilities", []))
        
        critical = [i for i in all_issues if i.get("severity") in ("critical", "error")]
        warnings = [i for i in all_issues if i.get("severity") == "warning"]
        infos = [i for i in all_issues if i.get("severity") in ("info", "minor")]
        
        # 自动生成决策
        if critical:
            decision = "REJECT"
            reason = f"发现 {len(critical)} 个严重问题，必须修复后才能合并"
        elif len(warnings) > 5:
            decision = "REQUEST_CHANGES"
            reason = f"发现 {len(warnings)} 个警告，建议修改后重新提交"
        elif len(all_issues) <= 3:
            decision = "APPROVE"
            reason = "代码质量良好，可以合并"
        else:
            decision = "APPROVE_WITH_COMMENTS"
            reason = f"可以合并，但有 {len(all_issues)} 个建议改进项"
        
        # LLM 生成详细评审报告
        report_prompt = f"""作为技术负责人，请生成代码评审报告。

代码片段:
{code[:1500]}

静态分析结果（{static_result['total_issues']} 个问题）：
{str(static_result.get('issues', []))[:500]}

安全审查结果（{security_result['critical_count']} 个严重漏洞）：
{str(security_result.get('vulnerabilities', []))[:500]}

安全分析报告：
{security_result.get('llm_security_report', 'N/A')[:500]}

请生成格式化的评审报告，包括：
1. 总体评价（1-2 句话）
2. 必须修复的问题（按优先级排序）
3. 建议改进的方面
4. 最终结论：APPROVE / REQUEST_CHANGES / REJECT"""
        report = self.llm(report_prompt)
        
        return {
            "agent": self.name,
            "decision": decision,
            "reason": reason,
            "summary": {
                "critical": len(critical),
                "warnings": len(warnings),
                "info": len(infos),
                "total": len(all_issues),
            },
            "report": report,
        }

# ====== 完整的代码评审 Pipeline ======
def code_review_pipeline(code: str, llm) -> Dict:
    """完整的 Multi-Agent 代码评审流程"""
    print("开始 Multi-Agent 代码评审...")
    
    # Step 1: 并行执行静态分析和安全审查
    static_analyzer = StaticAnalyzerAgent(llm)
    security_reviewer = SecurityReviewerAgent(llm)
    
    print("  静态分析中...")
    static_result = static_analyzer.analyze(code)
    print(f"    发现 {static_result['total_issues']} 个问题")
    
    print("  安全审查中...")
    security_result = security_reviewer.review(code)
    print(f"    发现 {security_result['critical_count']} 个严重漏洞")
    
    # Step 2: TechLead 综合评审
    print("  TechLead 评审中...")
    tech_lead = TechLeadAgent(llm)
    final_result = tech_lead.review(code, static_result, security_result)
    
    print(f"\\n评审结果: {final_result['decision']}")
    print(f"   原因: {final_result['reason']}")
    print(f"   问题统计: {final_result['summary']}")
    
    return final_result`,
          },
        ],
        tip: "Multi-Agent 实战开发的最佳实践：先用单 Agent 验证核心逻辑——确保每个 Agent 的独立功能正确，再组合成 Multi-Agent 系统；为每个 Agent 编写单元测试——Agent 本身也是代码，需要测试覆盖；设置超时和重试——Agent 调用 LLM 可能失败或超时，需要有合理的容错机制；监控 Agent 的 token 消耗——Multi-Agent 系统的 token 消耗是单 Agent 的 N 倍，需要监控和优化。",
      },
    ],
  };
