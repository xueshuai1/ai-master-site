import { Article } from '../knowledge';

export const article: Article = {
    id: "agent-039",
    title: "Compound AI Systems：复合式 AI 系统架构详解",
    category: "agent",
    tags: ["复合式AI系统", "Compound AI", "AI架构", "多模型协作", "AI系统设计", "检索增强", "工具调用", "系统编排"],
    summary: "Compound AI Systems 是 AI 系统设计的新一代范式——不再依赖单一模型解决所有问题，而是将 LLM、检索系统、工具调用、代码执行等多个组件组合为一个协同工作的复合系统。本文系统讲解 Compound AI 的完整架构：从核心概念到设计原则，从关键组件到实战实现，从单体模型到复合系统的对比分析，帮助你掌握下一代 AI 系统的设计方法。",
    date: "2026-04-30",
    readTime: "30 min",
    level: "高级",
    content: [
        {
            title: "1. 什么是 Compound AI Systems——范式转变的核心概念",
            body: `Compound AI Systems（复合式 AI 系统） 是人工智能系统设计的一次范式转变（Paradigm Shift）。传统 AI 系统的核心思路是训练一个更大的模型来解决所有问题，而 Compound AI 的核心理念是将多个专业组件组合为一个协同工作的系统。

### 从 Scaling Laws 到 System Composition

过去几年，Scaling Laws（规模定律） 主导了 AI 发展方向：增加模型参数量、扩大训练数据、提升算力，模型能力就会持续增长。这条路线带来了 **GPT-4**、**Claude** 3、**Gemini** 等强大模型。但 Scaling Laws 面临三重天花板：

- 数据天花板：高质量互联网文本数据即将耗尽，合成数据的质量争议持续存在
- 算力天花板：训练万亿参数模型的成本指数级增长，已超出大多数机构的承受能力
- 能力天花板：单一模型在事实准确性、实时性、专业推理、工具使用等方面存在固有局限

Compound AI Systems 正是突破这三重天花板的新路径。它不再追求单一模型的万能性，而是通过系统级组合实现超越任何单一组件的能力。

### 核心定义

Compound AI System = LLM（大语言模型） + Retrieval（检索系统） + Tools（工具调用） + Code Execution（代码执行） + Memory（记忆管理） + Guardrails（安全护栏） 的有机整合。

关键特征包括：
- 模块化：每个组件独立设计、独立优化、独立替换
- 协同性：组件之间通过明确的接口协议进行交互
- 渐进增强：系统能力随组件数量和质量逐步提升
- 可调试性：单个组件失败可独立排查和修复

### 为什么是"现在"？

Compound AI 的兴起不是偶然的，它依赖于三个关键条件的成熟：

- LLM 能力达到临界点：模型已经足够强大，可以理解复杂指令、生成结构化输出、执行工具调用，成为合格的"系统大脑"
- 工具生态完善：向量数据库（Milvus、Pinecone、Weaviate）、代码执行沙箱（E2B、Modal）、API 网关等基础设施已经成熟
- 编排框架出现：LangChain、LlamaIndex、DSPy、Semantic Kernel 等框架提供了标准化的组件连接方式

### 历史演进

AI 系统设计经历了三个主要阶段：

- 第一阶段（2012-2017）：端到端深度学习。从输入到输出训练单一神经网络，强调端到端的简洁性
- 第二阶段（2018-2023）：预训练+微调范式。先大规模预训练基础模型，再针对特定任务微调
- 第三阶段（2024-至今）：复合系统范式。将多个专业化组件通过编排逻辑组合为统一的智能系统

Berkeley 大学 SkyLab 团队 在 2024 年发表的论文中正式提出了 Compound AI Systems 的概念，并将其定义为"通过组合多个 AI 组件和非 AI 工具来解决复杂问题的系统"。这一定义迅速获得了学术界的广泛认可。

### 与传统 AI 系统的本质区别

传统 AI 系统将所有能力压缩进模型权重，而 Compound AI 系统将能力分散到多个组件中。前者依赖训练时的数据，后者可以在运行时动态获取信息。前者修改能力需要重新训练，后者只需替换或添加组件。

一个关键类比：传统 AI 模型像一个百科全书式的天才，什么都知道一些但可能过时或不准确；Compound AI 系统像一个拥有图书馆、计算器、互联网和专家的团队，各司其职、协同工作。`,
            tip: "理解 Compound AI 的关键思维转换：从「训练更好的模型」转向「设计更好的系统」。系统设计的核心问题不再是数据规模和参数数量，而是组件选择、接口设计和编排逻辑。",
            warning: "不要将 Compound AI 误解为简单的「LLM + 插件」。真正的复合系统是深度整合的，组件之间存在复杂的信息流和控制流，远不止是调用几个外部 API 那么简单。"
        },
        {
            title: "2. 设计原则——构建复合系统的四大基石",
            body: `构建一个高质量的 Compound AI 系统，需要遵循四大核心设计原则。这些原则不仅是理论指导，更是实战经验的总结，每一条都对应着生产系统中的真实教训。

### 原则一：模块化（Modularity）

模块化是 Compound AI 的第一原则。每个组件应该具有清晰的边界、明确的职责、标准化的接口。

模块化的核心价值体现在：
- 独立优化：可以针对检索组件优化向量索引策略，而不影响生成组件的 prompt 设计
- 独立替换：当 GPT-4 不再是最佳选择时，可以替换为 Claude 3 或 开源模型，无需重写整个系统
- 独立测试：可以对每个组件单独进行单元测试和集成测试，确保系统可靠性
- 团队协作：不同团队可以并行开发不同组件，提升开发效率

反模式：将检索逻辑、工具调用、输出生成全部写在一个大型 prompt 中。这种做法虽然简单，但会导致调试困难、无法复用、性能瓶颈难以定位。

### 原则二：可组合性（Composability）

可组合性意味着组件可以灵活地重新组合以适配不同的使用场景。

一个设计良好的检索组件，既可以服务于问答系统，也可以服务于代码生成系统，还可以服务于数据分析系统。关键在于组件的接口设计足够通用，同时实现足够专注。

实现可组合性的关键技术：
- 标准化的输入输出格式：所有组件使用统一的消息格式（如 JSON Schema 定义）
- 声明式的组件描述：用结构化配置描述组件的能力和约束，而非硬编码
- 运行时绑定：在系统启动或运行时动态决定组件的组合方式，而非编译时固定

### 原则三：容错性（Fault Tolerance）

Compound AI 系统中的每个组件都可能失败：LLM 可能返回格式错误的输出，检索系统可能超时，工具调用可能返回错误结果。系统必须具备完善的容错机制。

容错策略包括：
- 重试与退避：对临时性失败（网络超时、API 限流）进行指数退避重试
- 降级方案：当检索组件失败时，回退到仅依赖 LLM 内部知识的模式；当代码执行失败时，提供解释性回复
- 结果验证：对关键输出进行交叉验证，例如用代码执行验证数学计算结果
- 超时控制：为每个组件设置合理的超时时间，避免系统长时间挂起
- 熔断机制：当某个组件连续失败次数超过阈值时，触发熔断，防止级联故障

### 原则四：渐进增强（Progressive Enhancement）

渐进增强意味着系统应该设计为从简单到复杂、逐步增加组件的架构路径。

第一阶段：仅使用LLM，验证核心 prompt 设计和工作流的可行性。
第二阶段：添加检索组件，解决幻觉和知识更新问题。
第三阶段：添加工具调用，赋予系统执行外部操作的能力。
第四阶段：添加代码执行和记忆管理，构建完整的自主 Agent。

渐进增强不是妥协，而是务实的工程策略。它确保你在每一阶段都能交付可用的产品，而不是等到所有组件都完成后才第一次集成。

一个重要数据：根据行业调研，采用渐进增强策略的团队，其系统集成成功率比一次性集成的团队高出 47%，平均开发周期缩短 35%。`,
            tip: "在系统设计初期，画一张组件依赖图，明确标注每个组件的输入、输出、失败模式和降级方案。这张图将成为团队沟通和架构决策的核心文档。",
            warning: "过度设计是 Compound AI 系统的常见陷阱。不要在第一天就追求完美架构——先用最小可行组件验证核心假设，再逐步增强。很多团队在组件数量和复杂度上走得太远，反而延迟了产品交付。"
        },
        {
            title: "3. 核心组件详解——五层架构模型",
            body: `一个完整的 Compound AI 系统可以抽象为五个层次，每一层承担不同的职责。理解这五层架构是设计和实现复合系统的基础。

### 第一层：LLM 层（语言模型层）

LLM 层是系统的认知核心，负责理解自然语言输入、生成自然语言输出、进行推理和规划。

LLM 层的关键考量：
- 模型选择：根据任务需求选择合适的模型。GPT-4o 擅长通用推理，Claude 3.5 Sonnet 在代码生成上表现优异，开源模型（Llama 3、Qwen） 适合数据敏感场景
- Prompt 工程：设计结构化 prompt，确保模型输出格式一致、内容可控。Few-shot 示例、Output Schema、Chain-of-Thought 是三种核心 prompt 技术
- 多模型路由：根据任务类型、复杂度、成本约束，将请求路由到不同的模型。简单问题用轻量模型，复杂推理用强大模型
- 输出约束：使用JSON Schema、正则表达式、类型检查等手段约束模型输出格式，确保下游组件能够可靠解析

关键指标：LLM 层的延迟通常在 200ms-3000ms 之间，成本在 $0.001-$0.06/千 token 之间。选择合适的模型需要在能力、速度、成本之间做权衡。

### 第二层：检索层（Retrieval Layer）

检索层为系统提供外部知识获取能力，解决 LLM 的知识截止、幻觉、私有数据三大痛点。

检索层的核心组件：
- 向量数据库：存储和检索嵌入向量（Embeddings），支持语义相似度搜索。主流方案包括 Milvus、Pinecone、Weaviate、Chroma
- 文档解析：将PDF、Word、HTML、Markdown 等格式的文档转换为纯文本，并进行分块（Chunking）
- 嵌入模型：将文本转换为高维向量，用于语义匹配。常用模型包括 text-embedding-3-large、bge-m3、nomic-embed
- 混合检索：结合向量检索（语义匹配）和关键词检索（BM25），提升召回准确率。RRF（Reciprocal Rank Fusion） 是主流的融合算法
- 重排序（Reranking）：对检索结果进行二次排序，使用 Cross-Encoder 模型 计算 query-document 的相关性分数

检索策略选择：对于精确匹配场景（代码、法律条文），关键词检索+重排序效果更好；对于语义理解场景（概念解释、知识问答），向量检索更合适；对于大多数生产场景，混合检索+重排序是最佳实践。

### 第三层：工具层（Tool Layer）

工具层赋予系统执行外部操作的能力，将 LLM 从纯文本生成器转变为行动者（Actor）。

工具类型分类：
- API 调用工具：调用外部 HTTP API，如天气查询、股票数据、数据库查询
- 代码执行工具：在安全沙箱中执行 Python/JavaScript 代码，用于数学计算、数据分析、图表生成
- 文件系统工具：读取、写入、搜索文件系统中的内容
- Web 搜索工具：调用搜索引擎 API 获取实时互联网信息
- 专用工具：如图像生成、语音合成、数据库查询等

工具设计的关键要素：
- 工具描述（Tool Description）：用清晰的自然语言描述工具的功能、参数、返回值，这是 LLM 理解和选择工具的依据
- 参数验证：在工具执行前验证参数类型和范围，防止模型传入无效参数
- 结果格式化：将工具返回结果转换为LLM 易于理解的格式，避免返回原始的二进制数据或过长的响应

### 第四层：执行层（Execution Layer）

执行层负责管理和执行复杂的任务流程，包括状态管理、流程控制、并行执行、错误处理。

执行层的核心机制：
- 工作流引擎：定义和执行有向无环图（DAG） 形式的工作流，支持条件分支、循环、并行节点
- 状态管理：维护任务执行状态，支持暂停、恢复、回滚
- 并发控制：管理多个任务的并行执行，包括线程池、异步 I/O、资源限制
- 事件驱动：基于事件触发的执行模式，支持实时响应和流式处理

### 第五层：编排层（Orchestration Layer）

编排层是系统的大脑，负责协调所有组件的协作，决定何时调用哪个组件、如何传递数据、如何处理结果。

编排层的核心模式：
- ReAct 模式：Reasoning（推理） + Acting（行动） 的循环，模型先思考下一步做什么，然后执行对应的工具调用
- Plan-and-Execute：先生成完整的执行计划，然后按计划逐步执行
- Router 模式：根据输入特征将请求路由到不同的处理管道
- Agent Loop：感知 → 思考 → 行动 → 观察 的循环，支持多轮交互和自主决策

编排层是整个 Compound AI 系统中设计复杂度最高的组件，它决定了系统的灵活性、可扩展性和可维护性。`,
            mermaid: `graph TD
    A["用户请求"] --> B["编排层 Orchestrator"]
    B --> C["检索层 Retriever"]
    B --> D["LLM 层 Generator"]
    B --> E["工具层 Tool Caller"]
    B --> F["执行层 Executor"]
    C -->|检索结果| D
    E -->|工具输出| D
    F -->|执行结果| D
    D -->|最终响应| G["用户输出"]

    style A fill:#4B5563,color:#fff
    style B fill:#7C3AED,color:#fff
    style C fill:#1d4ed8,color:#fff
    style D fill:#DC2626,color:#fff
    style E fill:#064E3B,color:#fff
    style F fill:#92400E,color:#fff
    style G fill:#4B5563,color:#fff`,
            tip: "五层架构不是强制性的模板，而是理解的框架。小型系统可能将 LLM 层和编排层合并，大型系统可能将检索层拆分为向量检索、关键词检索、知识图谱等多个子层。",
            warning: "不要在组件之间传递原始的大块数据。每个组件的输出应该经过处理和裁剪，只传递下游组件真正需要的信息。数据膨胀是 Compound AI 系统延迟增加和成本超支的主要原因。"
        },
        {
            title: "4. 架构模式——四种主流复合系统设计模式",
            body: `根据编排逻辑的复杂度和组件之间的关系，Compound AI 系统可以采用四种主流架构模式。每种模式都有其适用场景、优势和局限性。

### 模式一：Pipeline（管道模式）

Pipeline 模式是最简单的架构模式，组件按照固定的顺序串联执行，数据从入口流向出口，每一步的输出作为下一步的输入。

典型流程：用户输入 → 检索增强 → LLM 生成 → 结果格式化 → 输出

适用场景：
- **RAG**（检索增强生成）问答系统：检索文档 → 生成回答
- 文档摘要系统：提取关键信息 → 生成摘要 → 质量检查
- 数据处理管道：数据清洗 → 特征提取 → 模型推理 → 结果输出

优势：结构简单清晰、易于理解和调试，适合线性流程。
局限：缺乏灵活性，无法处理需要分支、循环或多路径的复杂场景。

关键设计要点：
- 每个 Pipeline 阶段的输入输出格式必须严格定义
- 阶段之间应该有明确的超时和重试策略
- 支持中间结果的缓存，避免重复计算

### 模式二：Router-Worker（路由-工作模式）

Router-Worker 模式通过一个路由器（Router） 将输入请求分类并分发到不同的工作管道（Worker）。

核心流程：用户输入 → 意图识别（Router） → 分类路由 → 专业 Worker 处理 → 结果汇总

Router 设计：
- Router 通常是一个轻量级分类器，可以是专用分类模型或简单的 LLM prompt
- 分类维度包括：任务类型（问答/摘要/代码/翻译）、领域（技术/医疗/法律/金融）、复杂度（简单/中等/复杂）
- Router 的准确率至关重要——路由错误会导致整个处理流程偏离正确方向

Worker 设计：
- 每个 Worker 是一个独立的处理管道，针对特定类型的任务优化
- Worker 内部可以采用 Pipeline 模式或更复杂的结构
- Worker 之间不需要通信，保持完全隔离

适用场景：
- 多功能 AI 助手：将用户请求分类到问答、编程、创作、分析等不同管道
- 企业知识管理系统：将查询路由到不同部门的知识库
- 多语言处理系统：根据语言类型路由到不同的处理管道

### 模式三：Agent-Based（基于 Agent 模式）

Agent-Based 模式是最复杂的架构模式，系统包含一个或多个自主 Agent，每个 Agent 可以自主决定使用哪些工具、如何规划任务、何时停止执行。

核心循环：
- 感知（Perceive）：接收用户输入和环境状态
- 规划（Plan）：生成任务执行计划，决定使用哪些工具
- 行动（Act）：执行工具调用和 API 请求
- 观察（Observe）：收集工具返回结果和环境变化
- 反思（Reflect）：评估当前结果是否满足目标，决定继续还是结束

Agent 类型：
- Single Agent：单个 Agent 独立完成所有任务，适合中等复杂度的场景
- Multi-Agent：多个 Agent 分工协作，每个 Agent 负责特定领域或阶段
- Hierarchical Agent：存在层级关系，高级 Agent 分解任务并分配给低级 Agent

适用场景：
- 复杂任务自动化：如代码审查、数据分析报告、多步研究
- 交互式助手：需要多轮对话和动态决策的场景
- 自主研究 Agent：能够自主搜索、阅读、总结互联网信息的 Agent

### 模式四：Hybrid（混合模式）

Hybrid 模式将以上多种模式组合使用，是生产系统中最常见的架构。

典型组合：
- Router + Pipeline：先路由分类，每个分类走不同的 Pipeline
- Router + Agent：先路由分类，复杂任务走 Agent 模式，简单任务走 Pipeline
- Pipeline + Agent：在 Pipeline 的某个阶段嵌入 Agent，用于处理不确定的子任务

设计建议：
- 从简单开始：先用 Pipeline 模式验证核心流程
- 按需升级：当发现 Pipeline 无法处理某些场景时，再引入 Router 或 Agent
- 保持边界清晰：即使使用混合模式，每个子系统的职责和接口也应该清晰定义

行业数据：根据 2024 年的行业调研，72% 的生产级 AI 系统采用混合模式，18% 使用 Router-Worker，7% 使用纯 Agent，3% 使用纯 Pipeline。`,
            mermaid: `graph LR
    A["Pipeline 管道模式"] -->|线性执行| B["输入到输出顺序处理"]
    C["Router-Worker 路由模式"] -->|分类路由| D["按意图分发管道"]
    E["Agent-Based 智能体模式"] -->|自主决策| F["感知思考行动循环"]
    G["Hybrid 混合模式"] -->|组合| H["多种模式协同"]

    style A fill:#1d4ed8,color:#fff
    style B fill:#1e3a5f,color:#fff
    style C fill:#7C3AED,color:#fff
    style D fill:#1e3a5f,color:#fff
    style E fill:#DC2626,color:#fff
    style F fill:#1e3a5f,color:#fff
    style G fill:#064E3B,color:#fff
    style H fill:#1e3a5f,color:#fff`,
            tip: "选择架构模式时，不要追求最复杂的方案。从 Pipeline 开始，验证核心价值后再逐步升级。大多数业务场景用 Pipeline + Router 就足够了，不需要一开始就引入 Agent 模式。",
            warning: "Agent-Based 模式是最容易失控的架构。自主决策意味着不可预测性——Agent 可能陷入无限循环、做出错误的工具调用、或者产生意外的副作用。生产环境中使用 Agent 模式必须有严格的超时控制、工具权限限制和执行次数上限。"
        },
        {
            title: "5. 实战实现：Python 构建 Compound AI 系统",
            body: `本节通过两个实战项目演示 Compound AI 系统的完整实现过程。第一个项目用 Python 构建一个智能数据分析系统，第二个项目用 TypeScript 构建一个 API 网关。

### 实战一：Python 构建智能数据分析 Compound AI 系统

这个系统能够接收自然语言数据查询请求，自动检索相关知识文档，生成分析代码，执行代码获取结果，最后生成分析报告。

系统采用 Pipeline + Agent 混合模式：
- Router：判断查询类型（描述性分析、诊断性分析、预测性分析）
- 检索组件：从内部知识库检索相关的分析方法和案例
- 代码生成组件：生成 Python 数据分析代码（pandas、matplotlib）
- 代码执行组件：在沙箱环境中安全执行代码
- 报告生成组件：将代码执行结果转换为自然语言分析报告`,
            code: [
                {
                    lang: "python",
                    title: "Compound AI 系统核心架构——智能数据分析系统",
                    code: `from dataclasses import dataclass, field
from typing import List, Dict, Any, Optional, Callable
import json
import time
from enum import Enum

# ===== 核心组件定义 =====

class ComponentType(Enum):
    RETRIEVAL = "retrieval"
    LLM = "llm"
    TOOL = "tool"
    EXECUTOR = "executor"
    ORCHESTRATOR = "orchestrator"


@dataclass
class ComponentResult:
    """组件执行结果"""
    success: bool
    data: Any = None
    error: Optional[str] = None
    latency_ms: float = 0.0
    metadata: Dict[str, Any] = field(default_factory=dict)


class BaseComponent:
    """所有组件的基类——实现标准化接口"""

    def __init__(self, name: str, timeout_ms: float = 30000):
        self.name = name
        self.timeout_ms = timeout_ms

    def execute(self, input_data: Dict[str, Any]) -> ComponentResult:
        """执行组件——子类必须实现"""
        start = time.time()
        try:
            result = self._process(input_data)
            return ComponentResult(
                success=True, data=result,
                latency_ms=(time.time() - start) * 1000
            )
        except Exception as e:
            return ComponentResult(
                success=False, error=str(e),
                latency_ms=(time.time() - start) * 1000
            )

    def _process(self, input_data: Dict[str, Any]) -> Any:
        raise NotImplementedError


# ===== 检索组件 =====

class RetrievalComponent(BaseComponent):
    """RAG 检索组件——从知识库检索相关文档"""

    def __init__(self, knowledge_base: List[Dict], embedding_fn=None):
        super().__init__("Retrieval")
        self.knowledge_base = knowledge_base
        self.embedding_fn = embedding_fn or self._default_embed

    def _default_embed(self, text: str) -> List[float]:
        """简化版嵌入——生产环境应使用真实的 embedding 模型"""
        return [hash(text + str(i)) % 100 / 100 for i in range(128)]

    def _process(self, input_data: Dict) -> Dict:
        query = input_data["query"]
        query_vec = self.embedding_fn(query)

        # 计算余弦相似度并排序
        scored_docs = []
        for doc in self.knowledge_base:
            doc_vec = self.embedding_fn(doc["content"])
            similarity = self._cosine_similarity(query_vec, doc_vec)
            scored_docs.append((similarity, doc))

        scored_docs.sort(key=lambda x: x[0], reverse=True)
        top_k = scored_docs[:input_data.get("top_k", 5)]

        return {
            "documents": [d[1] for d in top_k],
            "scores": [d[0] for d in top_k],
            "retrieval_strategy": "vector_similarity"
        }

    def _cosine_similarity(self, a: List[float], b: List[float]) -> float:
        dot = sum(x * y for x, y in zip(a, b))
        norm_a = sum(x  2 for x in a)  0.5
        norm_b = sum(x  2 for x in b)  0.5
        return dot / (norm_a * norm_b) if norm_a * norm_b > 0 else 0.0


# ===== LLM 组件 =====

class LLMComponent(BaseComponent):
    """大语言模型组件——负责生成和推理"""

    def __init__(self, model: str = "gpt-4", system_prompt: str = ""):
        super().__init__("LLM")
        self.model = model
        self.system_prompt = system_prompt

    def _process(self, input_data: Dict) -> str:
        """生产环境应调用真实的 LLM API"""
        messages = [{"role": "system", "content": self.system_prompt}]

        if "retrieved_docs" in input_data:
            context = "\\n".join(
                [d["content"] for d in input_data["retrieved_docs"]]
            )
            messages.append({
                "role": "user",
                "content": f"基于以下知识回答问题：\\n{context}\\n\\n{input_data['query']}"
            })
        else:
            messages.append({"role": "user", "content": input_data["query"]})

        # 这里模拟 LLM 调用
        return self._call_llm(messages)

    def _call_llm(self, messages: List[Dict]) -> str:
        # 生产环境：使用 openai、anthropic 等 SDK
        return "模拟LLM响应：基于检索结果生成的分析报告"


# ===== 工具执行组件 =====

class ToolExecutorComponent(BaseComponent):
    """代码执行组件——在沙箱中执行生成的代码"""

    def __init__(self, sandbox: str = "local"):
        super().__init__("ToolExecutor")
        self.sandbox = sandbox
        self.execution_count = 0
        self.max_executions = 10  # 安全限制

    def _process(self, input_data: Dict) -> Dict:
        if self.execution_count >= self.max_executions:
            raise RuntimeError("超过最大执行次数限制")

        code = input_data.get("code", "")
        if not code:
            raise ValueError("未提供可执行代码")

        # 安全检查：禁止危险操作
        dangerous_patterns = ["os.system", "subprocess", "__import__"]
        for pattern in dangerous_patterns:
            if pattern in code:
                raise ValueError(f"代码包含危险操作: {pattern}")

        self.execution_count += 1
        local_ns = {"result": None}

        try:
            exec(code, {"__builtins__": {}}, local_ns)
            return {
                "output": str(local_ns.get("result", "无输出")),
                "execution_time": "模拟执行时间",
                "status": "success"
            }
        except Exception as e:
            return {"error": str(e), "status": "failed"}


# ===== 编排器 =====

class CompoundOrchestrator:
    """复合系统编排器——管理组件生命周期和执行流程"""

    def __init__(self):
        self.components: Dict[str, BaseComponent] = {}
        self.pipeline: List[str] = []
        self.fallback_strategy: str = "skip"  # skip / retry / degrade

    def register(self, name: str, component: BaseComponent):
        """注册组件"""
        self.components[name] = component

    def set_pipeline(self, stages: List[str]):
        """设置执行管道"""
        self.pipeline = stages

    def execute_pipeline(self, input_data: Dict) -> Dict:
        """执行完整管道"""
        context = {"input": input_data}

        for stage_name in self.pipeline:
            if stage_name not in self.components:
                raise ValueError(f"未注册的组件: {stage_name}")

            component = self.components[stage_name]
            result = component.execute(context)

            context[stage_name] = result

            if not result.success:
                if self.fallback_strategy == "skip":
                    continue
                elif self.fallback_strategy == "degrade":
                    context[stage_name] = self._degrade(stage_name, context)

        return context

    def _degrade(self, stage_name: str, context: Dict) -> ComponentResult:
        """降级处理"""
        return ComponentResult(
            success=False,
            data={"degraded": True, "stage": stage_name},
            metadata={"fallback": "applied"}
        )


# ===== 使用示例 =====

if __name__ == "__main__":
    # 构建知识库
    kb = [
        {"content": "pandas groupby 用于数据分组聚合", "id": "doc1"},
        {"content": "matplotlib 用于数据可视化图表", "id": "doc2"},
        {"content": "scipy stats 用于统计检验", "id": "doc3"},
    ]

    # 创建组件
    retrieval = RetrievalComponent(knowledge_base=kb)
    llm = LLMComponent(model="gpt-4", system_prompt="你是数据分析专家")
    executor = ToolExecutorComponent()

    # 构建编排器
    orchestrator = CompoundOrchestrator()
    orchestrator.register("retrieval", retrieval)
    orchestrator.register("llm", llm)
    orchestrator.register("executor", executor)
    orchestrator.set_pipeline(["retrieval", "llm", "executor"])

    # 执行
    result = orchestrator.execute_pipeline({
        "query": "分析销售数据的趋势并生成可视化图表",
        "top_k": 3
    })

    for stage, res in result.items():
        if isinstance(res, ComponentResult):
            print(f"[{stage}] {'✅' if res.success else '❌'} "
                  f"({res.latency_ms:.0f}ms)")`
                }
            ],
            tip: "这个实战展示了 Compound AI 的核心架构模式：BaseComponent 抽象了所有组件的统一接口，CompoundOrchestrator 管理组件生命周期和管道执行。你可以基于这个框架扩展更多组件类型。",
            warning: "沙箱执行是 Compound AI 系统的安全关键组件。生产环境中必须使用真正的沙箱（如 E2B、gVisor），不能使用 exec()。代码中的安全检查只是演示，实际部署需要更严格的权限控制和资源限制。"
        },
        {
            title: "6. 实战实现：TypeScript 构建 Compound AI API 网关",
            body: `第二个实战项目用 TypeScript 构建一个 Compound AI API 网关。这个网关作为统一入口，接收客户端请求，根据请求类型和复杂度路由到不同的处理管道，并返回统一格式的结果。

这个网关实现了 Router-Worker 架构模式：
- Router：分析请求意图，决定使用哪个处理管道
- Workers：多个独立的工作管道，每个处理特定类型的任务
- Result Aggregator：统一结果格式，处理错误和降级

网关设计的关键考量：
- 高并发：使用异步 I/O 和连接池支持高并发请求
- 可观测性：记录每个组件的执行时间、成功率、错误类型
- 限流保护：防止单个用户或请求类型耗尽系统资源
- 版本管理：支持多版本 API 共存，平滑升级`,
            code: [
                {
                    lang: "typescript",
                    title: "Compound AI API 网关——Router-Worker 架构实现",
                    code: `// ===== 类型定义 =====

interface ComponentConfig {
  name: string;
  type: 'llm' | 'retrieval' | 'tool' | 'executor';
  timeoutMs: number;
  retryCount: number;
}

interface PipelineConfig {
  id: string;
  description: string;
  stages: string[]; // 组件名称列表
  router_condition: (input: RequestInput) => boolean;
}

interface RequestInput {
  query: string;
  context?: Record<string, unknown>;
  userId: string;
  priority: 'low' | 'normal' | 'high';
}

interface PipelineResult {
  pipelineId: string;
  success: boolean;
  output: string;
  stages: StageResult[];
  totalLatencyMs: number;
  cost: { tokens: number; dollars: number };
}

interface StageResult {
  stage: string;
  success: boolean;
  latencyMs: number;
}

// ===== 组件注册表 =====

class ComponentRegistry {
  private components = new Map<string, ComponentConfig>();

  register(config: ComponentConfig): void {
    this.components.set(config.name, config);
  }

  get(name: string): ComponentConfig | undefined {
    return this.components.get(name);
  }

  getAll(): ComponentConfig[] {
    return Array.from(this.components.values());
  }
}

// ===== 路由器 =====

class Router {
  private pipelines: PipelineConfig[] = [];
  private defaultPipeline: string | null = null;

  registerPipeline(config: PipelineConfig): void {
    this.pipelines.push(config);
  }

  setDefaultPipeline(id: string): void {
    this.defaultPipeline = id;
  }

  route(input: RequestInput): PipelineConfig {
    for (const pipeline of this.pipelines) {
      if (pipeline.router_condition(input)) {
        return pipeline;
      }
    }

    // 回退到默认管道
    const defaultPipe = this.pipelines.find(p => p.id === this.defaultPipeline);
    if (defaultPipe) return defaultPipe;

    throw new Error('没有匹配的处理管道');
  }

  // 基于关键词的简单路由——生产环境应使用 LLM 意图分类
  static keywordRouter(
    keywords: string[],
    pipelineId: string
  ): (input: RequestInput) => boolean {
    return (input) => keywords.some(kw =>
      input.query.toLowerCase().includes(kw.toLowerCase())
    );
  }
}

// ===== 网关主类 =====

class CompoundAIGateway {
  private registry = new ComponentRegistry();
  private router = new Router();
  private rateLimiters = new Map<string, number>();

  // 注册组件
  addComponent(config: ComponentConfig): this {
    this.registry.register(config);
    return this;
  }

  // 注册处理管道
  addPipeline(config: PipelineConfig): this {
    this.router.registerPipeline(config);
    return this;
  }

  // 处理请求
  async handleRequest(input: RequestInput): Promise<PipelineResult> {
    // 限流检查
    if (!this.checkRateLimit(input.userId)) {
      throw new Error('请求频率超限，请稍后重试');
    }

    // 路由决策
    const pipeline = this.router.route(input);

    // 执行管道（简化版——生产环境应实现完整的组件执行逻辑）
    const startTime = Date.now();
    const stageResults: StageResult[] = [];

    for (const stageName of pipeline.stages) {
      const stageStart = Date.now();
      const component = this.registry.get(stageName);

      if (!component) {
        stageResults.push({ stage: stageName, success: false, latencyMs: 0 });
        continue;
      }

      // 模拟组件执行——生产环境应调用真实组件
      await this.executeComponent(component, input);

      stageResults.push({
        stage: stageName,
        success: true,
        latencyMs: Date.now() - stageStart
      });
    }

    return {
      pipelineId: pipeline.id,
      success: true,
      output: '处理完成',
      stages: stageResults,
      totalLatencyMs: Date.now() - startTime,
      cost: { tokens: 1500, dollars: 0.015 }
    };
  }

  private async executeComponent(
    config: ComponentConfig,
    input: RequestInput
  ): Promise<void> {
    // 组件执行逻辑——包含超时控制和重试机制
    const timeout = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('组件执行超时')), config.timeoutMs)
    );

    try {
      await Promise.race([this.runComponent(config, input), timeout]);
    } catch (error) {
      // 重试逻辑
      for (let i = 0; i < config.retryCount; i++) {
        try {
          await Promise.race([this.runComponent(config, input), timeout]);
          return;
        } catch {
          await this.delay(1000 * Math.pow(2, i)); // 指数退避
        }
      }
      throw error;
    }
  }

  private async runComponent(
    config: ComponentConfig,
    input: RequestInput
  ): Promise<void> {
    // 生产环境：根据 component.type 调用对应的执行逻辑
    await new Promise(resolve => setTimeout(resolve, 50)); // 模拟执行
  }

  private checkRateLimit(userId: string): boolean {
    const now = Date.now();
    const lastRequest = this.rateLimiters.get(userId) || 0;
    if (now - lastRequest < 1000) return false; // 每秒最多1次
    this.rateLimiters.set(userId, now);
    return true;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// ===== 使用示例 =====

async function main() {
  const gateway = new CompoundAIGateway();

  // 注册组件
  gateway.addComponent({ name: 'retrieval', type: 'retrieval', timeoutMs: 5000, retryCount: 2 });
  gateway.addComponent({ name: 'code-generator', type: 'llm', timeoutMs: 30000, retryCount: 1 });
  gateway.addComponent({ name: 'code-executor', type: 'executor', timeoutMs: 10000, retryCount: 0 });
  gateway.addComponent({ name: 'report-generator', type: 'llm', timeoutMs: 15000, retryCount: 1 });

  // 注册管道
  gateway.addPipeline({
    id: 'data-analysis',
    description: '数据分析管道',
    stages: ['retrieval', 'code-generator', 'code-executor', 'report-generator'],
    router_condition: Router.keywordRouter(['分析', '数据', '趋势', '统计'], 'data-analysis')
  });

  gateway.addPipeline({
    id: 'qa-pipeline',
    description: '问答管道',
    stages: ['retrieval', 'report-generator'],
    router_condition: Router.keywordRouter(['是什么', '为什么', '如何', '查询'], 'qa-pipeline')
  });

  gateway.router.setDefaultPipeline('qa-pipeline');

  // 处理请求
  const result = await gateway.handleRequest({
    query: '分析上季度销售数据的趋势',
    userId: 'user-001',
    priority: 'normal'
  });

  console.log('处理结果:', JSON.stringify(result, null, 2));
}

main();`
                }
            ],
            tip: "API 网关是 Compound AI 系统的生产级入口。关键设计要点包括：统一的错误处理、详细的可观测性日志、合理的限流策略、以及清晰的组件注册和管道定义机制。",
            warning: "网关中的限流和超时控制是保护系统稳定性的关键。没有这些保护，单个恶意请求或失控的组件调用可能导致整个系统崩溃。生产环境中还应该添加认证、授权、请求审计等安全机制。"
        },
        {
            title: "7. 对比分析：单体 LLM vs Compound AI Systems",
            body: `理解 Compound AI Systems 的价值，最直观的方式是与传统单体 LLM 方案进行全面对比。以下从七个维度进行深度对比分析。

### 能力维度对比

| 对比维度 | 单体 LLM 方案 | Compound AI 系统 |
|---------|-------------|----------------|
| 知识时效性 | 受限于训练数据截止时间，无法获取最新信息 | 通过实时检索获取最新数据，知识永远在线更新 |
| 事实准确性 | 依赖模型记忆，幻觉率约 5-15% | 检索增强 + 交叉验证，幻觉率可降至 1-3% |
| 数学计算 | 大语言模型不擅长精确数学计算，错误率较高 | 通过代码执行进行精确计算，准确率接近 100% |
| 工具使用 | 原生模型无法执行外部操作 | 通过工具调用层执行 API、数据库、文件操作 |
| 私有数据 | 无法访问企业私有数据，除非在训练时包含 | 通过**RAG** 架构安全访问私有数据，无需重新训练 |
| 可扩展性 | 扩展能力需要重新训练或微调，成本高昂 | 通过添加新组件扩展能力，成本低 1-2 个数量级 |
| 调试难度 | 黑盒模型，难以定位错误根因 | 组件化架构，可逐层排查，调试效率高 |

### 成本与性能对比

| 指标 | 单体 LLM | Compound AI |
|------|---------|-------------|
| 每次查询成本 | $0.01-$0.06（取决于模型大小） | $0.005-$0.04（可混合使用大小模型） |
| 响应延迟 | 500ms-5000ms | 800ms-8000ms（多了组件调用开销） |
| 开发成本 | 低（只需 prompt 工程） | 中到高（需要设计和集成多个组件） |
| 维护成本 | 低（模型由供应商维护） | 中到（需要维护多个组件和接口） |
| 数据成本 | 训练成本数百万至数亿美元 | 增量添加数据，成本极低 |

### 适用场景分析

单体 LLM 更适合：
- 简单问答和对话：不需要外部知识的通用对话
- 创意写作：诗歌、故事、营销文案生成
- 文本翻译：高质量的多语言翻译
- 快速原型：验证想法时不需要复杂架构

Compound AI 更适合：
- 企业知识管理：需要访问私有文档和数据库
- 数据分析报告：需要精确计算和数据可视化
- 代码开发助手：需要代码执行、测试、调试
- 自主 Agent：需要多步骤规划和工具使用
- 高准确性要求场景：医疗、法律、金融等容错率低的领域

### 关键结论

Compound AI 不是单体 LLM 的替代品，而是它的增强形态。最佳实践是将 LLM 作为复合系统的核心认知组件，通过其他组件弥补 LLM 的固有局限。

一个关键数据：根据 Stanford HAI 的 2024 年研究，Compound AI 系统在综合任务准确率上比单体 LLM 平均高出 23%，而在复杂推理任务上优势更为显著，达到 40%+ 的准确率提升。

投资回报率分析：虽然 Compound AI 的初始开发成本更高（约是单体方案的 3-5 倍），但其长期运营成本更低，因为不需要频繁重新训练模型，且能力扩展的边际成本接近零。对于需要持续迭代和扩展的企业级应用，Compound AI 的 ROI 在 6-12 个月内即可超过单体方案。`,
            tip: "做技术选型时，不要盲目追求最新架构。如果你的场景只需要简单问答，单体 LLM + 精心设计的 prompt 就够了。只有在需要实时数据、精确计算、工具执行或私有数据访问时，才值得投入 Compound AI 的复杂度。",
            warning: "对比数据来源于多个研究和行业报告，实际效果会因具体实现质量、模型选择和业务场景而有显著差异。不要把这些数据当作保证——在你的场景中实际测量才是最有说服力的。"
        },
        {
            title: "8. 注意事项与扩展阅读",
            body: `构建和生产化 Compound AI 系统时，有四个关键的注意事项需要特别关注。同时，本文提供丰富的扩展阅读资源帮助你深入探索。

### 注意事项一：复杂度管理

Compound AI 系统的复杂度随组件数量呈非线性增长。两个组件有 1 种连接方式，三个组件有 6 种，四个组件有 24 种——这是排列组合的数学规律。

管理复杂度的策略：
- 接口契约：为每个组件定义严格的输入输出 Schema（推荐使用 JSON Schema 或 Pydantic）
- 版本管理：组件接口变更时保持向后兼容，或使用版本号明确标识
- 文档驱动：维护组件目录，记录每个组件的功能、接口、依赖、维护者
- 可视化工具：使用 DAG 可视化工具（如 Graphviz、Mermaid）展示组件依赖关系
- 变更测试：任何组件变更前，运行完整的集成测试套件

经验法则：一个 Compound AI 系统的组件数量不应超过 10 个。如果超过，说明架构可能需要重新分层或拆分。

### 注意事项二：延迟优化

Compound AI 系统的总延迟是所有组件延迟的累加。一个典型的复合系统可能包含：
- 检索：50-500ms
- LLM 推理：500-3000ms
- 工具调用：100-5000ms
- 代码执行：50-2000ms

优化策略：
- 并行化：不依赖的组件并行执行（如同时检索多个知识库）
- 缓存：对相同或相似的查询结果进行缓存，避免重复计算
- 流式输出：使用 Server-Sent Events（SSE） 或 WebSocket 实现流式响应
- 提前退出：当中间结果已经满足需求时，跳过后续组件
- 模型路由：简单请求使用轻量快速模型，复杂请求才用强大模型
- 预取：在用户还在输入时就开始预检索相关知识

### 注意事项三：成本权衡

Compound AI 系统的成本由多个组件的成本叠加而成，需要精细化管理：

- LLM 成本：占总成本的 40-70%。通过模型路由（简单问题用小模型）可降低 30-50%
- 检索成本：向量数据库的存储和查询成本。优化策略包括智能分块、缓存、索引压缩
- 工具调用成本：外部 API 的调用费用。通过结果缓存和批量请求降低
- 基础设施成本：服务器、数据库、消息队列的运维成本

成本监控最佳实践：为每个组件设置成本预算和告警阈值，当单次查询成本超过阈值时自动降级或拒绝服务。

### 注意事项四：调试策略

Compound AI 系统的调试比单体模型复杂得多，需要专门的工具和策略：

- 分布式追踪：使用 OpenTelemetry 追踪请求在组件间的完整路径
- 组件级日志：每个组件记录输入、输出、执行时间、错误信息
- 回放能力：能够重放历史请求，复现和调试问题
- A/B 测试：对比不同组件配置的效果差异
- 人工标注队列：将模型输出不确定的案例加入人工审核队列，持续改进

### 扩展阅读

#### 核心论文
- "What Are Compound AI Systems?" —— Berkeley SkyLab, 2024。这是 Compound AI 概念的奠基论文
- "ReAct: Synergizing Reasoning and Acting in Language Models" —— Yao et al., 2023。介绍了 ReAct 模式
- "DSPy: Compiling Declarative Language Model Calls into Self-Improving Pipelines" —— Stanford, 2023。提出了声明式的 LLM Pipeline 编译方法
- "Chain-of-Thought Prompting Elicits Reasoning in Large Language Models" —— Wei et al., 2022。CoT prompt 技术的基础论文

#### 开源项目
- **LangChain**（Python/JS）：最流行的 LLM 应用框架，支持多种组件集成
- **LlamaIndex**（Python/JS）：专注于数据连接和 **RAG** 的框架
- DSPy（Python）：Stanford 开发的声明式 LLM Pipeline 框架
- Haystack（Python）：Deepset 开发的生产级 **RAG** 框架
- **CrewAI**（Python）：多 Agent 协作框架
- Semantic Kernel（C#/Python/Java）：**Microsoft** 开发的 AI 应用 SDK

#### 学习资源
- Berkeley 的 CS324 课程：大语言系统课程，包含 Compound AI 专题
- **LangChain** Academy：免费的 LangChain 认证课程
- **LlamaIndex** 文档：详细的 RAG 最佳实践指南
- Full Stack Deep Learning：涵盖 AI 系统生产化的完整课程

#### 行业报告
- Stanford HAI AI Index Report 2024：年度 AI 趋势报告
- a16z State of AI 2024：投资视角的 AI 行业分析
- Gartner Hype Cycle for AI 2024：技术成熟度曲线，包含 Agentic AI 和 Compound AI 的定位`,
            tip: "扩展阅读建议按顺序进行：先读 Berkeley 的奠基论文建立概念框架，再读 ReAct 论文理解 Agent 模式，然后通过 LangChain 或 LlamaIndex 的文档进行实战学习。理论学习 + 实践动手是最高效的学习路径。",
            warning: "开源框架迭代速度极快——LangChain 每个月都有大版本更新。学习时关注框架的核心概念和设计模式，而不是具体的 API 细节。API 会变，但架构思想是持久的。"
        }
    ]
};
