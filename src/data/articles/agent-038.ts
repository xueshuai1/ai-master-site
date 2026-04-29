import { Article } from '../knowledge';

export const article: Article = {
    id: "agent-038",
    title: "AI Agent 编排标准：从 OpenAI Symphony 到多智能体协作范式",
    category: "agent",
    tags: ["Agent 编排", "多智能体系统", "OpenAI Symphony", "协作协议", "Agent 架构", "工作流引擎", "状态机", "Agent 通信"],
    summary: "Agent 编排是多智能体系统的核心基础设施，决定了多个 Agent 如何协同工作、共享信息、处理冲突。本文系统讲解 Agent 编排的完整知识体系：从编排的概念定义到主流架构模式（中心化/去中心化/混合），从 OpenAI Symphony 开源规范到 LangGraph、CrewAI 等框架对比，从状态机建模到实战代码实现，帮助你建立完整的 Agent 编排知识框架。",
    date: "2026-04-30",
    readTime: "30 min",
    level: "高级",
    content: [
        {
            title: "1. 什么是 Agent 编排——多智能体协作的基础设施",
            body: `**Agent 编排（Agent Orchestration）**是指在**多智能体系统**中，对多个 **Agent 的任务分配、执行顺序、信息传递、冲突解决**进行**统一管理和调度**的技术体系。它是**多 Agent 协作**的基础设施，类似于操作系统中的**进程调度器**。

### 为什么需要编排？

单个 **Agent** 可以独立完成简单任务，但在面对**复杂业务场景**时，需要将工作**分解为多个子任务**，由**不同的 Agent** 分别执行。如果没有**统一的编排机制**，会出现以下问题：

- **任务分配混乱**：多个 Agent 同时执行相同任务，或者关键任务无人执行
- **信息孤岛**：Agent 之间无法**共享上下文和中间结果**
- **状态不一致**：无法追踪**全局执行状态**，导致任务遗漏或重复
- **无法容错**：某个 Agent 失败时，没有**降级和重试机制**

### 编排 vs 协调

**编排（Orchestration）**和**协调（Coordination）**是两个容易混淆的概念：

| 维度 | 编排 | 协调 |
|------|------|------|
| 控制方式 | **中心化调度**，有明确的编排器 | **去中心化协商**，Agent 自主决定 |
| 复杂度 | 编排器负责**全局逻辑** | 每个 Agent 负责**局部逻辑** |
| 适用场景 | 工作流明确、步骤清晰的场景 | 动态环境、需要灵活响应的场景 |
| 容错性 | 编排器是**单点故障** | 无单点故障，但**一致性难以保证** |

在实际系统中，通常采用**混合模式**：核心流程由**编排器调度**，局部交互由 **Agent 自主协调**。

### 编排的核心要素

一个完整的 Agent 编排系统包含以下**核心要素**：

- **任务分解**：将复杂任务拆分为**可执行的子任务**
- **Agent 注册与发现**：管理可用 Agent 的**能力清单**
- **调度策略**：决定**哪个 Agent 执行哪个任务**
- **状态管理**：追踪**全局和局部的执行状态**
- **通信机制**：Agent 之间**传递消息和共享数据**
- **异常处理**：处理 Agent 失败、超时、冲突等**异常情况**`,
            code: [{
                lang: "typescript",
                title: "Agent 编排核心接口定义",
                code: `// Agent 编排核心接口定义
interface AgentRegistry {
  register(agentId: string, capabilities: string[]): void;
  findAgent(task: string): string | null;
  getCapabilities(agentId: string): string[];
}

interface Orchestrator {
  decomposeTask(task: string): SubTask[];
  schedule(subTask: SubTask): AgentAssignment;
  execute(assignment: AgentAssignment): Promise<Result>;
  aggregate(results: Result[]): FinalResult;
}

interface SubTask {
  id: string;
  description: string;
  requiredCapabilities: string[];
  dependencies: string[];
  timeoutMs: number;
}

interface AgentAssignment {
  subTaskId: string;
  agentId: string;
  input: Record<string, unknown>;
  retryCount: number;
}`,
            }],
            tip: "选择编排模式时，先评估任务的确定性程度。流程固定选中心化编排，环境动态选去中心化协调。",
            warning: "不要一开始就设计复杂的编排系统，从简单的线性工作流开始逐步演进。"
        },
        {
            title: "2. Agent 编排的架构模式——中心化、去中心化与混合",
            body: `**Agent 编排的架构模式**决定了系统的**可扩展性、容错性和灵活性**。主流架构模式有三种：**中心化编排**、**去中心化编排**和**混合编排**。

### 中心化编排（Centralized Orchestration）

**中心化编排**由一个**编排器（Orchestrator）**统一管理所有 Agent 的任务分配和执行流程。编排器是系统的**大脑**，负责接收输入、分解任务、调度 Agent、收集结果。

**中心化编排的优点**：

- **全局视图**：编排器掌握**完整的任务状态**，可以做出最优调度决策
- **易于调试**：所有流程**经过编排器**，日志集中、问题定位容易
- **确定性高**：执行顺序和结果**可预测**，适合对**一致性要求高**的场景

**中心化编排的缺点**：

- **单点故障**：编排器一旦失败，整个系统**瘫痪**
- **扩展性受限**：编排器可能成为**性能瓶颈**，难以水平扩展
- **灵活性差**：新增 Agent 类型或修改流程需要**修改编排器逻辑**

### 去中心化编排（Decentralized Orchestration）

**去中心化编排**中，没有统一的编排器，每个 Agent **自主决策**何时执行任务、与谁协作。Agent 通过**消息传递**或**共享环境**进行通信。

**去中心化编排的优点**：

- **无单点故障**：任意 Agent 失败不影响**整体系统运行**
- **高度可扩展**：新 Agent 可以随时**加入系统**，无需修改现有逻辑
- **灵活性强**：Agent 可以**动态调整**策略，适应变化的环境

**去中心化编排的缺点**：

- **全局一致性难保证**：没有全局视图，可能出现**任务重复执行或遗漏**
- **调试困难**：问题分散在多个 Agent 中，**日志不集中**
- **死锁风险**：Agent 之间的**循环依赖**可能导致死锁

### 混合编排（Hybrid Orchestration）

**混合编排**结合了中心化和去中心化的优点：核心流程由**编排器统一管理**，局部交互由 **Agent 自主协调**。这是目前**工业实践中最常用的模式**。

混合编排的典型结构：

- **顶层编排**：编排器负责**任务分解**和**Agent 分组**
- **组内协调**：每组内的 Agent **自主协商**执行顺序
- **结果聚合**：编排器收集各组结果，进行**最终整合**

### 架构模式选择矩阵

| 场景 | 推荐模式 | 理由 |
|------|---------|------|
| 数据流水线 | **中心化** | 流程固定，需要严格顺序执行 |
| 实时监控系统 | **去中心化** | 需要快速响应，容错要求高 |
| 客户服务系统 | **混合** | 核心流程集中，对话交互分散 |
| 代码审查系统 | **混合** | 检查规则集中，审查逻辑分散 |`,
            code: [{
                lang: "typescript",
                title: "混合编排器实现示例",
                code: `// 混合编排器实现示例
class HybridOrchestrator {
  private groups: Map<string, AgentGroup> = new Map();
  private orchestrator: CentralOrchestrator;

  constructor(agents: Agent[]) {
    this.orchestrator = new CentralOrchestrator(agents);
    // 编排器负责顶层任务分解
    const groups = this.orchestrator.decomposeAndGroup(task);
    for (const g of groups) {
      this.groups.set(g.id, new AgentGroup(g.agents));
    }
  }

  async execute(task: Task): Promise<FinalResult> {
    // 第一步：编排器分解任务
    const subTasks = this.orchestrator.decompose(task);

    // 第二步：分配到各组
    const groupResults = await Promise.all(
      subTasks.map(async (st) => {
        const group = this.groups.get(st.groupId)!;
        // 组内 Agent 自主协商执行顺序（去中心化）
        return group.executeNegotiated(st);
      })
    );

    // 第三步：编排器聚合结果（中心化）
    return this.orchestrator.aggregate(groupResults);
  }
}`,
            }],
            tip: "混合编排是工业实践最佳选择：编排器负责任务分解和结果聚合，Agent 在组内自主协调。",
            warning: "混合编排设计复杂度最高，需要明确定义编排器和 Agent 的职责边界。"
        },
        {
            title: "3. OpenAI Symphony 开源规范——Agent 编排的新标准",
            body: `**OpenAI Symphony** 是 OpenAI 于 2026 年 4 月发布的**开源 Agent 编排规范**，旨在为多智能体协作提供**统一的标准协议**。Symphony 的核心目标是解决当前 Agent 生态中**协议碎片化**的问题，让不同框架和平台的 Agent 能够**无缝协作**。

### Symphony 的设计理念

Symphony 的设计遵循三个核心原则：

- **开放性**：规范完全开源，任何框架和平台都可以**自由实现**
- **最小化**：只定义**必要的协议接口**，不强制要求特定的实现方式
- **可扩展**：通过**插件机制**支持自定义功能，不影响核心协议

### Symphony 的核心概念

**Symphony 定义了以下核心概念**：

- **Score（乐谱）**：描述整个任务的**执行计划**，包含任务分解、Agent 分配、执行顺序和依赖关系
- **Conductor（指挥家）**：负责**解析 Score** 并调度 Agent 执行的**编排器**
- **Player（演奏者）**：执行具体任务的 **Agent**，接收指令、执行任务、返回结果
- **Movement（乐章）**：Score 中的**一个执行阶段**，包含一组并行或串行的任务

### Symphony 的通信协议

**Symphony 定义了三种通信模式**：

- **Request-Response**：Conductor 向 Player 发送请求，等待**同步响应**
- **Publish-Subscribe**：Conductor 发布事件，多个 Player **订阅并响应**
- **Event Stream**：Player 在执行过程中**持续推送事件**，Conductor 实时监听

### Symphony 与其他规范的对比

| 特性 | Symphony | A2A (Agent-to-Agent) | MCP (Model Context Protocol) |
|------|---------|---------------------|------------------------------|
| 定位 | **多 Agent 编排标准** | Agent 间通信协议 | 工具调用标准 |
| 开源 | ✅ 完全开源 | ✅ 开源 | ✅ 开源 |
| 编排能力 | ✅ **内置编排逻辑** | ❌ 仅通信 | ❌ 仅工具调用 |
| 多 Agent 支持 | ✅ **原生支持** | ✅ 原生支持 | ⚠️ 间接支持 |
| 状态管理 | ✅ **内置状态追踪** | ❌ 无 | ❌ 无 |
| 错误处理 | ✅ **重试+降级** | ⚠️ 基础 | ⚠️ 基础 |`,
            code: [{
                lang: "json",
                title: "Symphony Score 格式示例",
                code: `{
  "score_id": "score-2026-04-30-001",
  "version": "1.0",
  "movements": [
    {
      "movement_id": "research",
      "type": "parallel",
      "tasks": [
        {
          "task_id": "web-search",
          "agent": "search-agent",
          "input": { "query": "OpenAI Symphony 规范" },
          "timeout_ms": 30000
        },
        {
          "task_id": "doc-analysis",
          "agent": "analysis-agent",
          "input": { "source": "symphony-spec.md" },
          "timeout_ms": 60000
        }
      ]
    },
    {
      "movement_id": "synthesize",
      "type": "sequential",
      "depends_on": ["research"],
      "tasks": [
        {
          "task_id": "write-report",
          "agent": "writer-agent",
          "input": {
            "references": ["web-search.result", "doc-analysis.result"]
          },
          "timeout_ms": 120000
        }
      ]
    }
  ]
}`,
            }],
            tip: "复杂任务协作优先选择 Symphony，Score 格式清晰描述任务依赖和执行顺序。",
            warning: "Symphony 是 2026 年新规范，生态尚不成熟，生产环境建议同时实现回退方案。"
        },
        {
            title: "4. 状态机建模——编排系统的核心抽象",
            body: `**有限状态机（Finite State Machine, FSM）**是 Agent 编排系统的**核心抽象**。通过将任务建模为状态机的状态转换，可以清晰地描述任务的**生命周期**和**执行流程**。

### 状态机的基本元素

一个用于 Agent 编排的状态机包含以下元素：

- **状态（State）**：任务所处的**阶段**，如 Pending、Running、Completed、Failed
- **转换（Transition）**：从一个状态到另一个状态的**变化条件**
- **事件（Event）**：触发状态转换的**外部信号**
- **动作（Action）**：状态转换时执行的**操作**

### Agent 编排的典型状态机

典型的 Agent 编排状态转换流程为：**Pending（待调度）→ Running（执行中）→ Completed（完成）** 或 **Failed（失败）**。失败后可以进入 **Retrying（重试中）**，重试成功回到 Running，超过最大重试次数后 **Escalate（升级处理）**。

### 状态机的实现策略

**实现 Agent 编排状态机有三种主要策略**：

**策略一：硬编码状态机**——将状态转换逻辑**直接写入代码**，使用 switch-case 或 if-else 实现。优点是简单直接，缺点是**状态变更需要修改代码**。

**策略二：声明式状态机**——使用**配置文件**定义状态转换规则，运行时动态解析。优点是**规则变更无需改代码**，缺点是需要额外的**规则引擎**。

**策略三：图状态机**——将状态机建模为**有向图**，使用图遍历算法执行状态转换。这是 **LangGraph** 采用的方式，支持**循环、分支和并行**等复杂模式。

### 状态管理的持久化

在分布式环境中，状态需要**持久化存储**以保证系统重启后能恢复：

- **内存存储**：适合**单进程、短生命周期**的编排任务
- **Redis**：适合**分布式、高并发**场景，支持原子操作
- **数据库**：适合**需要长期审计**的场景，支持复杂查询`,
            code: [{
                lang: "typescript",
                title: "声明式状态机实现",
                code: `// 声明式状态机：基于配置的状态转换
interface StateMachineConfig {
  states: Record<string, Record<string, string>>;
  initialState: string;
}

class DeclarativeStateMachine {
  private config: StateMachineConfig;
  private currentState: string;

  constructor(config: StateMachineConfig) {
    this.config = config;
    this.currentState = config.initialState;
  }

  transition(event: string): string | null {
    const transitions = this.config.states[this.currentState];
    if (!transitions || !transitions[event]) {
      return null; // 无效转换
    }
    const nextState = transitions[event];
    this.currentState = nextState;
    return nextState;
  }

  getState(): string {
    return this.currentState;
  }
}

// 使用示例：Agent 编排状态机
const agentFSM = new DeclarativeStateMachine({
  states: {
    pending:   { dispatch: 'running' },
    running:   { complete: 'completed', fail: 'failed', timeout: 'retrying' },
    retrying:  { retry: 'running', escalate: 'failed' },
    completed: {},
    failed:    { restart: 'pending' },
  },
  initialState: 'pending',
});`,
            }],
            tip: "生产级编排系统推荐 Redis 作为状态存储，配合 Lua 脚本实现原子状态转换。",
            warning: "状态持久化有性能开销，短生命周期任务（< 5 秒）使用内存存储即可。"
        },
        {
            title: "5. 实战实现：使用 LangGraph 构建 Agent 编排系统",
            body: `**LangGraph** 是目前最成熟的 **Agent 编排框架**之一。它基于**图计算模型**，将 Agent 编排建模为**有向图的遍历**，支持循环、分支、并行等复杂模式。本节通过一个**代码审查 Agent 系统**的实战案例，演示 LangGraph 的完整用法。

### 系统架构

我们要构建的代码审查系统包含以下 Agent：

- **Parser Agent**：解析代码变更，提取修改的文件和行
- **Lint Agent**：执行静态分析，检查代码规范
- **Security Agent**：检测安全漏洞和潜在风险
- **Reviewer Agent**：综合所有分析结果，生成审查报告

### 执行流程

整个代码审查流程分为四个阶段：**解析阶段** → **Lint 检查和安全扫描并行执行** → **生成审查报告** → **输出结果**。如果解析后发现没有代码变更，直接跳过检查阶段。

### 关键实现要点

**状态定义**：使用 Annotation 定义编排状态，包括代码变更列表、Lint 结果、安全扫描结果、审查报告和当前步骤。

**节点函数**：每个 Agent 实现为一个节点函数，接收当前状态，返回更新后的状态。

**条件边**：使用 addConditionalEdges 实现动态路由，根据解析结果决定是进入检查阶段还是直接生成报告。`,
            code: [{
                lang: "typescript",
                title: "LangGraph 代码审查编排系统",
                code: `import { StateGraph, END } from "@langchain/langgraph";
import { Annotation } from "@langchain/langgraph";

// 定义编排状态
const AgentState = Annotation.Root({
  codeChanges: Annotation<string[]>({
    reducer: (x, y) => x.concat(y),
    default: () => [],
  }),
  lintResults: Annotation<string[]>({
    reducer: (x, y) => x.concat(y),
    default: () => [],
  }),
  securityResults: Annotation<string[]>({
    reducer: (x, y) => x.concat(y),
    default: () => [],
  }),
  reviewReport: Annotation<string>,
  currentStep: Annotation<string>,
});

// Lint 检查节点
async function lintCheck(state: typeof AgentState.State) {
  const results: string[] = [];
  for (const file of state.codeChanges) {
    const lintOutput = await runLinter(file);
    if (lintOutput.violations.length > 0) {
      results.push(\`[\${file}] \${lintOutput.violations.length} 个规范问题\`);
    }
  }
  return { lintResults: results, currentStep: "lint_done" };
}

// 安全扫描节点
async function securityScan(state: typeof AgentState.State) {
  const results: string[] = [];
  for (const file of state.codeChanges) {
    const vulns = await scanVulnerabilities(file);
    if (vulns.length > 0) {
      results.push(\`[\${file}] \${vulns.length} 个安全漏洞\`);
    }
  }
  return { securityResults: results, currentStep: "security_done" };
}

// 生成审查报告节点
async function generateReport(state: typeof AgentState.State) {
  const report = [
    "# 代码审查报告",
    ...state.lintResults.map(r => \`- \${r}\`),
    ...state.securityResults.map(r => \`- \${r}\`),
    state.securityResults.length > 0
      ? "❌ 存在安全漏洞，建议修复后重新提交"
      : "✅ 代码质量良好，可以合并",
  ].join("\\n");
  return { reviewReport: report, currentStep: "completed" };
}

// 构建编排图
const workflow = new StateGraph(AgentState)
  .addNode("lint", lintCheck)
  .addNode("security", securityScan)
  .addNode("review", generateReport)
  .addEdge("__start__", "lint")
  .addEdge("lint", "security")
  .addEdge("security", "review")
  .addEdge("review", END);

const app = workflow.compile();`,
            }],
            tip: "LangGraph 的 addConditionalEdges 支持动态路由，根据中间结果决定执行路径。",
            warning: "LangGraph 循环边必须设置 maxIterations，否则可能进入无限循环。"
        },
        {
            title: "6. 主流编排框架对比——LangGraph、CrewAI、AutoGen",
            body: `当前主流的 **Agent 编排框架**有三个：**LangGraph**、**CrewAI** 和 **AutoGen**。它们各有特点，适用于不同的场景。本节从多个维度进行**深度对比分析**。

### LangGraph

**LangGraph** 由 LangChain 团队开发，基于**图计算模型**的 Agent 编排框架。

**核心特点**：

- **图模型**：将编排逻辑建模为**有向图**，节点是 Agent 或函数，边是控制流
- **状态管理**：内置**状态对象**，节点之间通过状态共享数据
- **循环支持**：原生支持**循环和条件分支**，适合迭代式任务
- **人工介入**：支持**Human-in-the-loop**，可以在关键步骤暂停等待人工确认

**适用场景**：需要**复杂控制流**的编排任务，如代码生成-审查-修复的迭代流程。

### CrewAI

**CrewAI** 是一个**角色驱动**的 Agent 编排框架，强调 Agent 的**角色定义**和**任务分配**。

**核心特点**：

- **角色系统**：每个 Agent 有明确的**角色（Role）**、**目标（Goal）**和**背景（Backstory）**
- **任务分配**：通过 **Process** 对象定义任务分配策略（Sequential 或 Hierarchical）
- **易用性**：API 设计简洁，适合**快速原型开发**
- **工具集成**：内置丰富的**工具集**，减少外部依赖

**适用场景**：需要**明确角色分工**的协作任务，如内容创作团队、调研分析团队。

### AutoGen

**AutoGen** 由微软开发，强调**多 Agent 对话**的编排模式。

**核心特点**：

- **对话驱动**：Agent 之间通过**多轮对话**协作，模拟人类团队的讨论过程
- **用户代理**：支持**UserProxyAgent**，让人类参与 Agent 对话
- **代码执行**：内置**代码执行器**，Agent 可以编写并执行代码
- **灵活拓扑**：支持**任意对话拓扑**，不限于线性或层级结构

**适用场景**：需要**多轮讨论和协商**的任务，如方案设计、问题诊断。

### 三维度对比

| 维度 | LangGraph | CrewAI | AutoGen |
|------|-----------|--------|---------|
| **编程模型** | 有向图 | 角色+任务 | 多轮对话 |
| **学习曲线** | 中等 | 低 | 中等 |
| **控制精度** | **高** | 中 | 低 |
| **状态管理** | 内置状态对象 | 任务结果传递 | 对话历史 |
| **循环支持** | ✅ 原生 | ⚠️ 有限 | ✅ 通过对话 |
| **人工介入** | ✅ 内置 | ❌ 需自行实现 | ✅ UserProxyAgent |
| **调试体验** | 好（图可视化） | 中 | 中（对话日志） |
| **社区生态** | **大**（LangChain 生态） | 中 | 大（微软支持） |
| **生产就绪** | ✅ | ⚠️ | ⚠️ |

### 选型建议

| 需求 | 推荐框架 |
|------|---------|
| 精确控制执行流程 | **LangGraph** |
| 快速原型 + 角色分工 | **CrewAI** |
| 多轮讨论 + 代码执行 | **AutoGen** |
| 生产级稳定性 | **LangGraph** |
| 与 LangChain 集成 | **LangGraph** |`,
            code: [{
                lang: "python",
                title: "CrewAI 角色驱动编排示例",
                code: `# CrewAI 角色驱动编排示例
from crewai import Agent, Task, Crew, Process

# 定义角色
researcher = Agent(
    role="高级技术研究员",
    goal="深入调研 Agent 编排框架的技术细节",
    backstory="你是一位有 10 年经验的系统架构师，擅长分布式系统设计。",
    verbose=True,
    allow_delegation=False,
)

writer = Agent(
    role="技术写作者",
    goal="将调研结果转化为清晰的技术文档",
    backstory="你是一位资深技术作家，善于将复杂概念用简单语言解释。",
    verbose=True,
    allow_delegation=False,
)

# 定义任务
research_task = Task(
    description="对比 LangGraph、CrewAI、AutoGen 三个框架",
    expected_output="一份包含编程模型、状态管理、容错能力的对比报告",
    agent=researcher,
)

write_task = Task(
    description="基于调研报告编写技术博客文章",
    expected_output="一篇 3000 字以上的深度技术博客",
    agent=writer,
)

# 创建 Crew 并执行
crew = Crew(
    agents=[researcher, writer],
    tasks=[research_task, write_task],
    process=Process.sequential,  # 顺序执行
)

result = crew.kickoff()`,
            }],
            tip: "不确定选哪个框架时从 LangGraph 开始，图模型表达能力最强，社区生态最成熟。",
            warning: "不要在同一个项目中混用多个编排框架，状态模型和通信协议不兼容。"
        },
        {
            title: "7. 编排系统的错误处理与容错机制",
            body: `**Agent 编排系统的容错能力**是生产环境中最重要的非功能性指标。Agent 可能因为各种原因失败：**网络超时**、**模型幻觉**、**资源不足**、**输入异常**。一个健壮的编排系统必须能够**优雅地处理这些失败**。

### 错误类型分类

**Agent 编排中的错误可以分为四类**：

- **瞬时错误（Transient Error）**：网络超时、API 限流、临时资源不足。这类错误通常**短暂存在**，重试即可恢复。
- **持久错误（Persistent Error）**：配置错误、权限不足、输入格式错误。这类错误**不会因重试而消失**，需要人工干预。
- **Agent 错误（Agent Error）**：模型返回无效结果、Agent 陷入循环、Agent 超时。这类错误需要**特定的恢复策略**。
- **系统错误（System Error）**：编排器崩溃、数据库连接断开、消息队列积压。这类错误影响**整个编排系统**。

### 重试策略

**重试是处理瞬时错误的主要手段**。但重试不是简单的"再试一次"，需要考虑以下因素：

- **最大重试次数**：不宜过多，对于 LLM 调用建议最多 **3 次**
- **退避策略**：使用**指数退避**（1s → 2s → 4s），避免**重复冲击**下游服务
- **可重试错误白名单**：只重试**确实可能恢复**的错误类型

### 降级策略

当 Agent 持续失败时，编排系统需要启动**降级策略**：

- **功能降级**：使用**简化版功能**替代完整功能（如使用规则引擎替代 AI 模型）
- **结果降级**：返回**部分结果**而非完整结果
- **超时降级**：超过最大等待时间后，**跳过该 Agent**，继续执行后续步骤

### 熔断器模式

**熔断器（Circuit Breaker）** 是防止**级联失败**的重要模式：

- **关闭状态（Closed）**：正常执行，统计失败次数
- **打开状态（Open）**：失败次数超过阈值，**直接拒绝请求**，快速失败
- **半开状态（Half-Open）**：等待一段时间后，**允许少量请求通过**，测试是否恢复`,
            code: [{
                lang: "typescript",
                title: "熔断器模式实现",
                code: `// 熔断器模式实现
class CircuitBreaker {
  private state: 'closed' | 'open' | 'half-open' = 'closed';
  private failureCount = 0;
  private lastFailureTime = 0;

  constructor(
    private threshold: number,
    private resetTimeout: number
  ) {}

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === 'open') {
      if (Date.now() - this.lastFailureTime > this.resetTimeout) {
        this.state = 'half-open';
      } else {
        throw new Error('熔断器打开，请求被拒绝');
      }
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess() {
    this.failureCount = 0;
    this.state = 'closed';
  }

  private onFailure() {
    this.failureCount++;
    this.lastFailureTime = Date.now();
    if (this.failureCount >= this.threshold) {
      this.state = 'open';
    }
  }
}

// 在编排系统中使用熔断器
const agentCircuitBreaker = new CircuitBreaker(
  5,      // 连续 5 次失败后打开熔断器
  30000   // 30 秒后进入半开状态
);`,
            }],
            tip: "编排系统务必实现重试+降级+熔断三层防护，缺一不可。",
            warning: "LLM 调用重试最多 3 次，指数增长间隔，避免浪费 API 配额。"
        },
        {
            title: "8. Agent 编排的最佳实践与反模式",
            body: `基于大量的**工业实践经验**，本节总结了 Agent 编排中的**最佳实践**和**常见反模式**，帮助你在设计和实现编排系统时**少走弯路**。

### 最佳实践

**实践一：从简单开始，渐进式复杂化**

不要一开始就设计**多 Agent、多阶段、多分支**的复杂编排流程。从**线性流程**开始，逐步增加**并行节点**和**条件分支**。每一步都验证**正确性和性能**后再进入下一步。

**实践二：为每个 Agent 定义清晰的契约**

每个 Agent 应该有明确的**输入格式**、**输出格式**和**错误码**。契约文档化，并在代码中通过**类型系统**强制执行。这样可以减少 Agent 之间的**集成问题**。

**实践三：编排逻辑与业务逻辑分离**

**编排逻辑**（任务分解、调度、容错）和**业务逻辑**（Agent 的具体实现）应该**严格分离**。这样可以在不影响业务逻辑的情况下，**独立优化编排策略**。

**实践四：全面的可观测性**

编排系统需要以下**可观测性指标**：

- **指标（Metrics）**：任务成功率、平均执行时间、Agent 调用次数
- **追踪（Tracing）**：每个任务的**完整调用链**，包括耗时和状态
- **日志（Logging）**：结构化的**事件日志**，支持按任务 ID 查询

### 反模式

**反模式一：上帝编排器（God Orchestrator）**——将所有逻辑都塞进**编排器**中，Agent 只是**被动的执行器**。正确做法是编排器只负责**调度和协调**，具体业务逻辑放在 **Agent 内部**。

**反模式二：隐式状态传递**——通过**全局变量**或**隐式上下文**在 Agent 之间传递状态。正确做法是使用**显式的状态对象**。

**反模式三：忽略超时设置**——不为 Agent 调用设置**超时时间**，导致一个慢 Agent **阻塞整个编排流程**。正确做法是为每个 Agent 调用设置**合理的超时时间**。

**反模式四：过度并行**——将**所有任务都并行化**，认为"并行一定比串行快"。实际上，如果任务之间有**隐含依赖**，过度并行会导致**结果不一致**和**资源浪费**。`,
            code: [{
                lang: "typescript",
                title: "Agent 契约定义与契约驱动调用",
                code: `// 最佳实践：为 Agent 定义清晰的契约
interface SearchAgentInput {
  query: string;
  maxResults: number;
  language: 'zh' | 'en';
}

interface SearchAgentOutput {
  results: Array<{
    title: string;
    url: string;
    snippet: string;
    relevanceScore: number;
  }>;
  totalCount: number;
}

interface SearchAgentError {
  code: 'TIMEOUT' | 'RATE_LIMIT' | 'INVALID_QUERY' | 'NETWORK_ERROR';
  message: string;
  retryable: boolean;
}

// 契约驱动的 Agent 调用
async function callSearchAgent(
  input: SearchAgentInput,
  timeoutMs: number = 30000
): Promise<SearchAgentOutput> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch('http://search-agent/api/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
      signal: controller.signal,
    });

    if (!response.ok) {
      const error: SearchAgentError = await response.json();
      throw new Error(\`[\${error.code}] \${error.message}\`);
    }

    return response.json();
  } finally {
    clearTimeout(timeout);
  }
}`,
            }],
            tip: "定期审查编排系统的性能指标，识别瓶颈 Agent。系统性能取决于最慢的 Agent。",
            warning: "避免过度工程化。2-3 个 Agent 协作用简单函数调用链即可，不需要完整编排框架。"
        },
        {
            title: "架构图示 1：Agent 编排架构对比",
            mermaid: `graph TD
    A[Agent 编排系统] --> B[中心化编排]
    A --> C[去中心化编排]
    A --> D[混合编排]
    B --> B1[全局视图]
    B --> B2[易于调试]
    B --> B3[单点故障]
    C --> C1[无单点故障]
    C --> C2[高度可扩展]
    C --> C3[一致性难保证]
    D --> D1[顶层编排]
    D --> D2[组内协调]
    classDef s0 fill:#1e3a5f,stroke:#4a90d9,color:#fff
    classDef s1 fill:#2d4a3e,stroke:#14532d,color:#fff
    classDef s2 fill:#3e2d4a,stroke:#9c27b0,color:#fff
    classDef s3 fill:#4a3e2d,stroke:#ff9800,color:#fff
    class A s0
    class B s1
    class C s2
    class D s3
    D --> D3[结果聚合]`,
        },
        {
            title: "架构图示 2：编排系统状态转换",
            mermaid: `graph LR
    A[Pending] -->|dispatch| B[Running]
    B -->|complete| C[Completed]
    B -->|fail| D[Failed]
    B -->|timeout| E[Retrying]
    E -->|retry| B
    E -->|escalate| D
    classDef s0 fill:#1e3a5f,stroke:#4a90d9,color:#fff
    classDef s1 fill:#2d4a3e,stroke:#14532d,color:#fff
    classDef s2 fill:#1e3a5f,stroke:#4a90d9,color:#fff
    classDef s3 fill:#4a3e2d,stroke:#ff9800,color:#fff
    classDef s4 fill:#3e2d4a,stroke:#9c27b0,color:#fff
    class A s0
    class B s1
    class C s2
    class D s3
    class E s4
    D -->|restart| A`,
        },
        {
            title: "9. 扩展阅读与学习路线",
            body: `**Agent 编排**是一个快速发展的领域，以下是一些**推荐的学习资源**和**延伸阅读方向**，帮助你持续深入这个领域。

### 推荐阅读

**论文与规范**：

- **OpenAI Symphony Specification**（2026）：开源 Agent 编排规范的官方文档，定义了 Score、Conductor、Player 等核心概念
- **A2A Protocol**（2026）：Agent-to-Agent 通信协议，关注 Agent 之间的**直接通信**而非编排
- **MCP Specification**（2025）：Model Context Protocol，定义了 AI 模型与外部工具的**标准化接口**

**开源项目**：

- **LangGraph**：基于图模型的 Agent 编排框架，支持循环、分支、并行
- **CrewAI**：角色驱动的 Agent 编排框架，API 简洁易用
- **AutoGen**：微软开发的多 Agent 对话框架，支持代码执行和人工介入
- **Temporal**：分布式工作流引擎，虽然不是专为 Agent 设计，但编排理念高度相关

### 学习路线建议

**第一步：理解基础**——学习有限状态机（FSM）和工作流引擎概念

**第二步：实践 LangGraph**——用 LangGraph 实现一个简单的多 Agent 编排流程

**第三步：对比其他框架**——用同样的任务在 CrewAI 和 AutoGen 上实现，对比差异

**第四步：研究 OpenAI Symphony**——阅读 Symphony 规范，理解 Score 格式和通信协议

**第五步：生产实践**——为你的实际业务场景设计编排方案，加入容错和可观测性

### 未来趋势

**Agent 编排领域的三个重要趋势**：

- **标准化**：随着 Symphony、A2A 等规范的推广，Agent 编排将逐步走向**标准化**，不同框架之间的互操作性会越来越好
- **智能化**：编排器本身将引入 **AI 能力**，能够根据任务特征**自动选择最优编排策略**，而不仅仅是执行预设流程
- **可观测性驱动**：随着生产环境中 Agent 编排规模的扩大，**可观测性**将成为编排系统的**核心能力**，而不仅仅是附加功能`,
            code: [],
            tip: "关注 Symphony 和 A2A 协议发展，有望成为行业标准。学习核心概念而非具体 API。",
            warning: "框架和规范 API 变化频繁，关注核心概念而非具体实现细节。"
        }
    ]
};
