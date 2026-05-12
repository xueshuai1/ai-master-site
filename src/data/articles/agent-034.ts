import { Article } from '../knowledge';

export const article: Article = {
    id: "agent-034",
    title: "Agent 编排标准（一）：OpenAI Symphony 与多智能体协作",
    category: "agent",
    tags: ["Agent 编排", "Symphony", "多 Agent 协作", "开放标准", "API 规范", "Agent 注册表", "通信协议", "互操作性"],
    summary: "OpenAI 开源的 Symphony 规范正在成为多 Agent 协作的行业标准。本文从规范架构、角色定义、通信协议、注册表机制到实战集成，系统讲解如何理解和实现多智能体编排标准，帮助你在碎片化的 Agent 框架生态中找到统一的协作语言。",
    date: "2026-04-29",
    readTime: "28 min",
    level: "高级",
  learningPath: {
    routeId: "agent-orchestration",
    phase: 1,
    order: 1,
    nextStep: "agent-038",
    prevStep: null,
  },
    content: [
        {
            title: "1. 为什么需要 Agent 编排标准",
            body: `AI Agent 编排标准的诞生，本质上是多智能体系统从实验性原型走向生产级协作的必然要求。

### 碎片化生态的痛点

截至 2026 年，市面上的 Agent 框架已经超过 20 种——LangGraph、CrewAI、AutoGen、Haystack、Dify、FastGPT……每个框架都有自己的角色定义方式、通信协议和工具调用接口。这就好比每家公司都用不同的编程语言写服务，却指望它们能互相调用。

核心矛盾在于：当一个企业同时使用 **LangGraph** 构建规划 Agent、用 **CrewAI** 管理执行 Agent 团队、用 **AutoGen** 处理多轮对话时，这些 Agent 之间的互操作性几乎为零。

### Symphony 的愿景

OpenAI Symphony 的核心理念很简洁：定义一套开放的、框架无关的多 Agent 协作规范。就像 HTTP 协议统一了 Web 通信、REST API 统一了服务交互一样，Symphony 要统一的是 Agent 之间的交互语言。

这不是要取代现有的框架，而是提供一层互操作标准，让 LangGraph 的 Agent 能和 CrewAI 的 Agent 无缝协作，让不同公司开发的 Agent 能在同一个编排平面上协同工作。

### 编排 vs 协作：概念辨析

理解 Agent 编排（Orchestration） 和 Agent 协作（Collaboration） 的区别至关重要：

- 编排是一个中心化的概念——有一个编排器（Orchestrator）负责任务分解、Agent 调度、结果聚合。编排器知道全局状态，掌控整个工作流。
- 协作是一个去中心化的概念——多个 Agent 通过对等通信自主协调，没有单一的控制中心。每个 Agent 只知道自己的局部状态。

Symphony 规范同时支持两种模式，但通过不同的规范子集来实现。

编排的关键价值：在复杂任务中，编排能确保任务不遗漏、顺序正确、结果可追溯。没有编排的多 Agent 系统就像没有指挥的乐团——每个乐手都在演奏，但合在一起可能是噪音。`,
            tip: "如果你的 Agent 系统只涉及 2-3 个简单任务，暂时不需要引入编排标准。但当 Agent 数量超过 5 个、任务依赖关系变得复杂时，标准化的编排规范能显著降低系统复杂度。",
            warning: "不要混淆「编排标准」和「编排框架」。Symphony 是一套规范（Specification），不是一个可以安装的框架（Framework）。它定义的是交互协议，不提供运行时实现。你需要选择合适的框架来实现这个规范。"
        },
        {
            title: "2. Symphony 规范的核心架构",
            body: `Symphony 规范由三个核心组件构成，它们共同定义了多 Agent 协作的完整生命周期。

### 2.1 角色规范（Role Specification）

每个 Agent 在 Symphony 体系中被称为一个 Role，角色规范定义了 Agent 的能力声明和交互接口：

- capabilities：该 Agent 能做什么——支持的任务类型、工具列表、输出格式
- constraints：该 Agent 的边界——权限范围、资源限制、安全约束
- interface：该 Agent 的通信方式——输入格式、输出格式、错误码定义

角色规范的核心思想是能力优先（Capability-First）：编排器不关心 Agent 是用什么框架实现的，它只关心 Agent 能做什么、接受什么输入、返回什么输出。

### 2.2 编排规范（Orchestration Specification）

编排规范定义了工作流的描述语言，它包含三个层次：

- 任务图（Task Graph）：描述任务的依赖关系和执行顺序。用有向无环图（DAG）表示，每个节点是一个任务，每条边是一个依赖。
- 调度策略（Scheduling Policy）：决定任务何时执行、分配给哪个 Agent、并发还是串行。
- 结果聚合（Result Aggregation）：定义多个 Agent 的输出如何合并、冲突如何解决、最终结果如何产出。

编排规范支持两种执行模式：同步编排（Synchronous Orchestration）和异步编排（Asynchronous Orchestration）。同步模式下，编排器阻塞等待每个 Agent 完成；异步模式下，Agent 自主执行，通过事件通知汇报进度。

### 2.3 注册表规范（Registry Specification）

注册表是 Symphony 生态的基础设施，它解决了Agent 发现和能力匹配的问题：

- Agent 注册：Agent 启动时向注册表发布自己的角色规范，包括能力声明、接口定义、健康状态。
- 能力查询：编排器通过结构化查询找到能满足特定任务需求的 Agent。
- 版本管理：每个 Agent 的注册信息都有版本号，支持灰度发布和回滚。
- 健康检查：注册表定期检测 Agent 的存活状态，自动剔除不健康的节点。

注册表的架构选择：可以是集中式（单一注册表服务，适合中小规模）或分布式（基于 Gossip 协议的去中心化注册表，适合大规模部署）。`,
            tip: "在设计角色规范时，建议使用最小能力声明（Minimal Capability Declaration）原则——只声明你确实能做到的事。过度声明会导致编排器分配不可能的任务，最终产生错误。",
            warning: "注册表是 Symphony 架构的单点故障。如果你的系统对可用性要求极高，必须实现分布式注册表或至少准备注册表故障时的降级策略（比如本地缓存 Agent 能力信息）。"
        },
        {
            title: "3. 通信协议详解",
            body: `通信协议是 Symphony 规范的核心，它定义了 Agent 之间如何传递消息、协商任务、汇报状态。

### 3.1 消息格式

Symphony 定义了标准化的消息信封（Message Envelope），每条消息都包含以下字段：

- message_id：全局唯一的消息标识符，用于追踪和去重
- sender_id：发送方 Agent 的标识符
- receiver_id：接收方 Agent 的标识符（广播模式下为空）
- message_type：消息类型——任务分配（TASK_ASSIGN）、结果返回（TASK_RESULT）、状态更新（STATUS_UPDATE）、错误报告（ERROR_REPORT）、协商请求（NEGOTIATE）
- payload：消息体，包含任务描述、参数、结果数据等
- metadata：附加元数据——优先级、超时时间、重试策略

### 3.2 任务生命周期

一个标准的 Symphony 任务经历以下状态流转：

1. PENDING：任务已创建，等待调度分配
2. ASSIGNED：任务已分配给特定 Agent，Agent 尚未开始执行
3. RUNNING：Agent 正在执行任务，可定期汇报进度
4. COMPLETED：任务执行成功，结果已返回
5. FAILED：任务执行失败，附带错误信息
6. CANCELLED：任务被主动取消（超时、优先级变更等）

状态转换规则：PENDING → ASSIGNED → RUNNING → COMPLETED 是标准路径。PENDING → CANCELLED 是超时路径。RUNNING → FAILED 是异常路径。每个转换都必须通过消息协议通知编排器。

### 3.3 错误处理与重试

Symphony 规范定义了三级错误处理机制：

- Agent 级重试：Agent 内部自动重试可恢复的错误（网络抖动、临时资源不足），重试策略由 Agent 自主决定。
- 编排级重试：编排器在 Agent 级重试耗尽后介入，可以重新分配任务到其他 Agent，或者调整任务参数后重试。
- 系统级降级：当多个 Agent 同时失败时，编排器触发降级策略——使用缓存结果、简化任务、人工介入。

错误码体系采用分层编码：第一层表示错误大类（1xx=通信错误，2xx=执行错误，3xx=数据错误，4xx=权限错误），第二层表示具体错误。`,
            tip: "在实现通信协议时，建议为每条消息设置TTL（Time-To-Live），避免过期消息被处理后产生错误的结果。特别是在异步编排模式下，消息可能在队列中滞留很长时间。",
            warning: "不要在消息体中传输大量数据。Symphony 的消息协议是为控制信令设计的，适合传输任务描述和引用标识。如果需要传输大量数据（比如图片、大文件），应该通过共享存储（对象存储、数据库）传递引用，而不是在消息中直接传输内容。"
        },
        {
            title: "4. 实战：构建 Symphony 兼容的 Agent",
            body: `本节通过 Python 实战代码，演示如何构建一个符合 Symphony 规范的 Agent。

### 4.1 角色规范定义

首先需要定义 Agent 的角色规范（Role Spec），这是 Agent 向外界声明自身能力的标准格式。角色规范包含了 Agent 的全部能力信息——从支持的任务类型到输入输出格式，再到资源约束。

编排器通过读取角色规范，能够精确判断哪个 Agent 最适合处理特定任务。这种能力优先的设计哲学，使得编排器不需要了解 Agent 的内部实现细节，只需要关心它能做什么。

### 4.2 注册表交互与心跳保活

Agent 启动后需要向注册表注册自身能力，并通过心跳保持存活状态。注册流程是 Agent 与编排生态建立连接的第一步——Agent 将自己的 RoleSpec 发送到注册表服务，注册表验证数据格式后存入持久化存储，并返回一个注册令牌。

心跳机制确保编排器能够实时感知 Agent 的健康状态。如果注册表在连续 N 个心跳周期内没有收到某个 Agent 的心跳，就会将该 Agent 标记为不健康并从可用列表中移除。心跳间隔建议设置为 10-30 秒，具体取决于系统对故障检测速度的要求。

### 4.3 消息处理循环

Agent 需要实现消息处理循环，接收编排器的任务分配消息并执行。消息处理的核心是一个异步事件循环：Agent 从消息队列中取出消息，根据消息类型分发到不同的处理器。对于 TASK_ASSIGN 消息，Agent 首先检查自身是否具备所需能力，如果不具备则返回错误；如果具备则开始执行，并定期发送状态更新。`,
            code: [
                {
                    lang: "python",
                    title: "Symphony Agent 角色规范定义与注册表交互",
                    code: `from dataclasses import dataclass
from typing import List, Dict, Any
import json
import httpx
import asyncio

@dataclass
class Capability:
    """Agent 能力声明"""
    name: str
    description: str
    input_schema: Dict[str, Any]
    output_schema: Dict[str, Any]

@dataclass
class RoleSpec:
    """Symphony 角色规范"""
    agent_id: str
    agent_name: str
    version: str
    capabilities: List[Capability]
    constraints: Dict[str, Any]
    health_endpoint: str

    def to_registry_payload(self) -> Dict[str, Any]:
        return {
            "agent_id": self.agent_id,
            "agent_name": self.agent_name,
            "version": self.version,
            "capabilities": [
                {"name": c.name, "description": c.description,
                 "input_schema": c.input_schema, "output_schema": c.output_schema}
                for c in self.capabilities
            ],
            "constraints": self.constraints,
            "health_endpoint": self.health_endpoint,
            "status": "healthy",
        }

class RegistryClient:
    def __init__(self, registry_url: str):
        self.registry_url = registry_url

    async def register(self, role_spec: RoleSpec) -> bool:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self.registry_url}/api/v1/agents/register",
                json=role_spec.to_registry_payload(),
            )
            return response.status_code == 201

    async def heartbeat(self, agent_id: str) -> bool:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self.registry_url}/api/v1/agents/{agent_id}/heartbeat",
            )
            return response.status_code == 200

async def main():
    analyst = RoleSpec(
        agent_id="data-analyst-001",
        agent_name="DataAnalyst",
        version="1.2.0",
        capabilities=[
            Capability(
                name="sql_query",
                description="执行 SQL 查询并返回结构化结果",
                input_schema={"type": "object", "properties": {"query": {"type": "string"}}},
                output_schema={"type": "object", "properties": {"rows": {"type": "array"}}},
            ),
        ],
        constraints={"max_query_rows": 10000},
        health_endpoint="http://data-analyst:8080/health",
    )
    registry = RegistryClient("http://symphony-registry:8000")
    success = await registry.register(analyst)
    print(f"注册结果: {'成功' if success else '失败'}")

asyncio.run(main())`,
                },
            ],
            tip: "在实现 Agent 时，建议将角色规范和业务逻辑分离。角色规范是声明式的，描述 Agent 能做什么；业务逻辑是命令式的，描述 Agent 怎么做。这样当 Agent 的能力变化时，只需要更新角色规范，不需要修改通信层代码。",
            warning: "注册表交互必须实现重试和超时处理。网络故障时注册失败会导致 Agent 无法被编排器发现。建议在启动时实现指数退避重试，连续失败超过阈值后标记 Agent 为不可用状态。"
        },
        {
            title: "5. 实战：编排器与任务调度引擎",
            body: `编排器是 Symphony 架构的大脑，负责任务分解、Agent 匹配和结果聚合。本节通过一个轻量级编排器的 Python 实现，展示核心调度逻辑。

### 5.1 任务匹配策略

编排器需要根据任务的能力需求找到最合适的 Agent。匹配策略有多种：

精确匹配：只考虑完全具备所需能力的 Agent。这是最安全的策略，但可能导致资源利用率低——某些 Agent 只缺少一个次要能力就被排除在外。

加权匹配：为每个 Agent 的能力设置权重分值，根据任务对各能力的需求权重，计算综合匹配度，选择得分最高的 Agent。这是最灵活的策略，但实现复杂度较高。

负载均衡匹配：在满足能力需求的前提下，优先选择当前负载最低的 Agent。这能实现更好的资源利用率，但需要注册表维护每个 Agent 的实时负载信息。

### 5.2 任务队列与并发控制

编排器需要维护一个任务队列，负责任务的入队、出队和状态管理。在高并发场景下，队列管理变得尤为重要——需要控制并发任务数，防止 Agent 过载；需要实现优先级调度，确保高优任务优先执行。`,
            code: [
                {
                    lang: "python",
                    title: "轻量级 Symphony 编排器实现",
                    code: `import asyncio
import random
from typing import Dict, List, Optional
from dataclasses import dataclass, field

@dataclass
class Task:
    task_id: str
    required_capability: str
    params: Dict[str, Any]
    priority: int = 0
    status: str = "pending"
    assigned_agent: Optional[str] = None
    result: Optional[Dict[str, Any]] = None

class SimpleOrchestrator:
    """轻量级 Symphony 编排器"""
    def __init__(self):
        self.agents: Dict[str, Dict[str, Any]] = {}
        self.tasks: Dict[str, Task] = {}
        self.task_queue: asyncio.Queue = asyncio.Queue()

    def register_agent(self, agent_id: str, capabilities: List[str], load: float = 0.0):
        """注册 Agent 及其能力"""
        self.agents[agent_id] = {
            "capabilities": capabilities,
            "current_load": load,
            "status": "healthy",
        }

    def submit_task(self, task: Task):
        """提交任务到编排队列"""
        self.tasks[task.task_id] = task
        self.task_queue.put_nowait(task.task_id)

    async def process_tasks(self):
        """任务处理主循环"""
        while True:
            task_id = await self.task_queue.get()
            task = self.tasks[task_id]
            best_agent = self._match_agent(task)
            if best_agent:
                task.assigned_agent = best_agent
                task.status = "completed"
                task.result = {"output": f"Result for {task.required_capability}"}
                print(f"任务 {task_id} -> Agent {best_agent} ✅")
            else:
                task.status = "failed"
                print(f"任务 {task_id} 无可用 Agent ❌")
            self.task_queue.task_done()

    def _match_agent(self, task: Task) -> Optional[str]:
        """根据能力和负载匹配最佳 Agent"""
        candidates = [
            aid for aid, info in self.agents.items()
            if task.required_capability in info["capabilities"]
            and info["status"] == "healthy"
        ]
        if not candidates:
            return None
        return min(candidates, key=lambda a: self.agents[a]["current_load"])

# 使用示例
async def demo():
    orch = SimpleOrchestrator()
    orch.register_agent("agent-1", ["sql_query", "data_viz"])
    orch.register_agent("agent-2", ["sql_query", "text_analysis"])
    orch.submit_task(Task("task-001", "sql_query", {"query": "SELECT * FROM users"}))
    await orch.process_tasks()

asyncio.run(demo())`,
                },
            ],
            tip: "在实际项目中，渐进式采用是最佳策略：先在单个框架内验证工作流设计，确认任务分解和 Agent 分工合理后，再引入 Symphony 规范实现跨框架互操作。不要一开始就追求「完美的标准合规」，这会拖慢开发进度。",
            warning: "Symphony 规范目前仍处于早期阶段，API 可能会有不兼容变更。在生产系统中使用时，建议对 Symphony 相关的交互代码进行抽象封装，这样当规范更新时，只需要修改封装层，不需要改动业务逻辑。"
        },
        {
            title: "6. Symphony 与主流框架对比",
            body: `Symphony 不是唯一的 Agent 协作方案。理解它与其他框架的定位差异，有助于你做出正确的技术选型。

### 6.1 框架定位对比

| 维度 | Symphony | LangGraph | CrewAI | AutoGen |
|------|----------|-----------|--------|---------|
| 本质 | 开放规范 | Python 框架 | Python 框架 | Python 框架 |
| 语言绑定 | 框架无关 | Python/JS | Python | Python |
| 互操作性 | 核心目标 | 不支持 | 不支持 | 不支持 |
| 角色定义 | 能力声明 | 节点函数 | Agent 对象 | Agent 对象 |
| 通信方式 | 标准化消息协议 | 状态图边 | 任务委派 | 消息传递 |
| 编排模式 | 中心+去中心 | 中心化图 | 中心化层级 | 去中心化对话 |

### 6.2 关键差异分析

第一层差异：规范 vs 框架。这是最根本的区别。LangGraph、CrewAI、AutoGen 都是框架（Framework）——它们提供了运行时、API、工具链。而 Symphony 是规范（Specification）——它只定义了交互协议，不提供运行时。你可以用 LangGraph 来实现 Symphony 规范的 Agent，也可以用 CrewAI 来实现。

第二层差异：互操作性。LangGraph 的 Agent 不能直接和 CrewAI 的 Agent 对话——它们的数据格式、通信方式、生命周期管理都不兼容。Symphony 的存在就是为了解决这个问题：它定义了一个通用语言，让不同框架的 Agent 能互相理解。

第三层差异：编排粒度。LangGraph 的编排粒度是函数级别——每个节点是一个函数，边定义调用关系。CrewAI 的编排粒度是任务级别——每个 Agent 负责一个任务。Symphony 的编排粒度是能力级别——编排器根据任务需求匹配具备相应能力的 Agent，不关心 Agent 内部如何完成任务。`,
            tip: "如果你的团队只用一个框架，且任务不太复杂，直接使用框架自带的编排能力即可，不需要引入 Symphony。当团队使用了多个框架时，Symphony 的价值才真正体现。",
            warning: "Symphony 规范目前仍处于早期阶段，API 可能会有不兼容变更。在生产系统中使用时，建议对 Symphony 相关的交互代码进行抽象封装，这样当规范更新时，只需要修改封装层，不需要改动业务逻辑。"
        },
        {
            title: "7. 生产环境注意事项",
            body: `将 Symphony 规范应用到生产环境时，有几个关键问题需要特别关注。

### 7.1 安全性

身份验证：每条 Symphony 消息都应该经过身份验证。建议使用双向 TLS（mTLS）或JWT 令牌验证消息发送方的身份，防止恶意 Agent 冒充合法节点。

权限控制：Agent 的能力声明中包含了它能执行的操作，但编排器在分配任务时还需要验证 Agent 是否有权限执行该操作。建议在注册表层面维护一份权限映射表，在任务分配时进行二次校验。

数据隔离：不同 Agent 处理的数据可能需要隔离存储。特别是在多租户场景下，Agent A 不应该能访问 Agent B 的数据。实现方式包括命名空间隔离、数据加密、访问令牌。

### 7.2 性能考量

消息延迟：在大规模部署（100+ Agent）中，消息传递延迟可能成为瓶颈。优化策略包括：使用消息队列中间件（Kafka、RabbitMQ）代替 HTTP 调用、实现本地缓存减少注册表查询。

注册表压力：如果每个 Agent 每秒都发送心跳，注册表的负载会非常高。建议采用分级心跳策略——关键 Agent 每秒心跳，普通 Agent 每 30 秒心跳，空闲 Agent 每 5 分钟心跳。

### 7.3 可观测性

日志标准：所有 Symphony 消息都应该记录结构化日志，包含 message_id、sender_id、receiver_id、msg_type、处理耗时。使用 OpenTelemetry 标准的日志格式，便于集中式分析。

追踪链路：每个任务分配产生一个 trace_id，从编排器发起、经过 Agent 执行、到结果返回，整条链路使用同一个 trace_id。这样在排查问题时，可以通过 trace_id 快速定位整个任务的生命周期。

指标监控：关键指标包括——消息处理延迟（P50/P99）、任务成功率、Agent 存活率、注册表查询延迟、编排器队列积压数。建议使用 Prometheus + Grafana 构建监控面板。`,
            tip: "在生产环境部署前，务必进行混沌工程测试——模拟 Agent 崩溃、网络分区、注册表宕机、消息乱序等异常场景，验证系统的自愈能力。不要等到线上出问题才意识到没有容错机制。",
            warning: "不要在消息协议中传输敏感数据（密码、API 密钥、个人身份信息）。即使使用了 TLS 加密，日志系统和监控系统中仍然可能以明文形式暴露这些数据。敏感数据应该通过安全的密钥管理服务（如 HashiCorp Vault）传递。"
        },
        {
            title: "8. 扩展阅读与未来趋势",
            body: `Agent 编排标准领域正在快速发展，以下是值得关注的研究方向和行业趋势。

### 8.1 相关标准与规范

- MCP（Model Context Protocol）：Anthropic 提出的模型上下文协议，定义了 AI 模型与外部工具和数据的交互标准。MCP 聚焦于单个模型的工具调用，Symphony 聚焦于多 Agent 协作编排，两者互补。
- A2A（Agent-to-Agent）协议：Google 提出的 Agent 间通信协议，定义了 Agent 之间的能力发现和任务委托机制。A2A 和 Symphony 在角色注册和能力匹配方面有重叠，但设计哲学不同。
- OpenAPI Specification：REST API 的事实标准。虽然不专门针对 Agent，但很多 Agent 框架的工具调用接口兼容 OpenAPI 规范。

### 8.2 未来趋势预判

趋势一：编排标准收敛。未来 2-3 年内，Agent 编排标准很可能收敛为 1-2 个主流规范。目前 Symphony、A2A 等方案并存，但随着行业成熟，互操作需求会推动标准合并或桥接协议的出现。

趋势二：AI 辅助编排。编排器本身正在从规则驱动转向 AI 驱动——用 LLM 来理解任务需求、匹配最佳 Agent、动态调整编排策略。这意味着未来的编排器不再需要人工编写工作流定义，而是通过自然语言描述自动生成编排计划。

趋势三：边缘编排。随着边缘计算的发展，Agent 编排正在从云端集中式走向边缘分布式——部分编排决策在边缘节点本地完成，只有关键决策同步到云端。

### 8.3 推荐学习资源

- OpenAI Symphony 官方文档：https://github.com/openai/symphony-spec — 规范的完整定义和参考实现
- LangGraph 官方教程：https://langchain-ai.github.io/langgraph/ — 学习基于图的 Agent 编排
- CrewAI 文档：https://docs.crewai.com/ — 轻量级多 Agent 任务编排
- 《多智能体系统》教材（Stanford CS224T）— 系统学习多 Agent 协作的理论基础`,
            tip: "如果你想深入理解 Agent 编排的理论背景，推荐阅读分布式系统和工作流引擎领域的经典论文。BPMN（业务流程建模符号）、Apache Airflow 的 DAG 设计、Kubernetes 的调度器架构——这些非 AI 领域的知识，对理解 Agent 编排同样有重要参考价值。",
            warning: "Agent 编排标准领域变化非常快。今天学的 API 可能明天就弃用了。建议以理解核心概念为主，而不是死记硬背具体的接口定义。核心概念（角色声明、能力匹配、任务生命周期、消息协议）是稳定的，而具体实现细节是易变的。"
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
    ],
};
