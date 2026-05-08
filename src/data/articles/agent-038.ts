import { Article } from '../knowledge';

export const article: Article = {
    id: "agent-038",
    title: "Agent 编排模式（二）：从 OpenAI Symphony 到多智能体协作范式",
    category: "agent",
    tags: ["Agent 编排", "多智能体系统", "OpenAI Symphony", "协作协议", "Agent 架构", "工作流引擎", "状态机", "Agent 通信"],
    summary: "Agent 编排是多智能体系统的核心基础设施，决定了多个 Agent 如何协同工作、共享信息、处理冲突。本文系统讲解 Agent 编排的完整知识体系：从编排的概念定义到主流架构模式（中心化/去中心化/混合），从 OpenAI Symphony 开源规范到 LangGraph、CrewAI 等框架对比，从状态机建模到实战代码实现，帮助你建立完整的 Agent 编排知识框架。",
    date: "2026-04-30",
    readTime: "30 min",
    level: "高级",
  learningPath: {
    routeId: "agent-orchestration",
    phase: 2,
    order: 2,
    nextStep: null,
    prevStep: "agent-034",
  },
    content: [
        {
            title: "1. 什么是 Agent 编排——多智能体协作的基础设施",
            body: `<strong>Agent 编排（Agent Orchestration）</strong>是指在<strong>多智能体系统</strong>中，对多个 <strong>Agent 的任务分配、执行顺序、信息传递、冲突解决</strong>进行<strong>统一管理和调度</strong>的技术体系。它是<strong>多 Agent 协作</strong>的基础设施，类似于操作系统中的<strong>进程调度器</strong>。

### 为什么需要编排？

单个 <strong>Agent</strong> 可以独立完成简单任务，但在面对<strong>复杂业务场景</strong>时，需要将工作<strong>分解为多个子任务</strong>，由<strong>不同的 Agent</strong> 分别执行。如果没有<strong>统一的编排机制</strong>，会出现以下问题：

- <strong>任务分配混乱</strong>：多个 Agent 同时执行相同任务，或者关键任务无人执行
- <strong>信息孤岛</strong>：Agent 之间无法<strong>共享上下文和中间结果</strong>
- <strong>状态不一致</strong>：无法追踪<strong>全局执行状态</strong>，导致任务遗漏或重复
- <strong>无法容错</strong>：某个 Agent 失败时，没有<strong>降级和重试机制</strong>

### 编排 vs 协调

<strong>编排（Orchestration）</strong> 和 <strong>协调（Coordination）</strong>是两个容易混淆的概念：

| 维度 | 编排 | 协调 |
|------|------|------|
| 控制方式 | <strong>中心化调度</strong>，有明确的编排器 | <strong>去中心化协商</strong>，Agent 自主决定 |
| 复杂度 | 编排器负责<strong>全局逻辑</strong> | 每个 Agent 负责<strong>局部逻辑</strong> |
| 适用场景 | 工作流明确、步骤清晰的场景 | 动态环境、需要灵活响应的场景 |
| 容错性 | 编排器是<strong>单点故障</strong> | 无单点故障，但<strong>一致性难以保证</strong> |

在实际系统中，通常采用<strong>混合模式</strong>：核心流程由<strong>编排器调度</strong>，局部交互由 <strong>Agent 自主协调</strong>。

### 编排的核心要素

一个完整的 Agent 编排系统包含以下<strong>核心要素</strong>：

- <strong>任务分解</strong>：将复杂任务拆分为<strong>可执行的子任务</strong>
- <strong>Agent 注册与发现</strong>：管理可用 Agent 的<strong>能力清单</strong>
- <strong>调度策略</strong>：决定<strong>哪个 Agent 执行哪个任务</strong>
- <strong>状态管理</strong>：追踪<strong>全局和局部的执行状态</strong>
- <strong>通信机制</strong>：Agent 之间<strong>传递消息和共享数据</strong>
- <strong>异常处理</strong>：处理 Agent 失败、超时、冲突等<strong>异常情况</strong>`,
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
            body: `<strong>Agent 编排的架构模式</strong>决定了系统的<strong>可扩展性、容错性和灵活性</strong>。主流架构模式有三种：<strong>中心化编排</strong>、<strong>去中心化编排</strong> 和 <strong>混合编排</strong>。

### 中心化编排（Centralized Orchestration）

<strong>中心化编排</strong>由一个<strong>编排器（Orchestrator）</strong>统一管理所有 Agent 的任务分配和执行流程。编排器是系统的<strong>大脑</strong>，负责接收输入、分解任务、调度 Agent、收集结果。

<strong>中心化编排的优点</strong>：

- <strong>全局视图</strong>：编排器掌握<strong>完整的任务状态</strong>，可以做出最优调度决策
- <strong>易于调试</strong>：所有流程<strong>经过编排器</strong>，日志集中、问题定位容易
- <strong>确定性高</strong>：执行顺序和结果<strong>可预测</strong>，适合对<strong>一致性要求高</strong>的场景

<strong>中心化编排的缺点</strong>：

- <strong>单点故障</strong>：编排器一旦失败，整个系统<strong>瘫痪</strong>
- <strong>扩展性受限</strong>：编排器可能成为<strong>性能瓶颈</strong>，难以水平扩展
- <strong>灵活性差</strong>：新增 Agent 类型或修改流程需要<strong>修改编排器逻辑</strong>

### 去中心化编排（Decentralized Orchestration）

<strong>去中心化编排</strong>中，没有统一的编排器，每个 Agent <strong>自主决策</strong>何时执行任务、与谁协作。Agent 通过<strong>消息传递</strong> 或 <strong>共享环境</strong>进行通信。

<strong>去中心化编排的优点</strong>：

- <strong>无单点故障</strong>：任意 Agent 失败不影响<strong>整体系统运行</strong>
- <strong>高度可扩展</strong>：新 Agent 可以随时<strong>加入系统</strong>，无需修改现有逻辑
- <strong>灵活性强</strong>：Agent 可以<strong>动态调整</strong>策略，适应变化的环境

<strong>去中心化编排的缺点</strong>：

- <strong>全局一致性难保证</strong>：没有全局视图，可能出现<strong>任务重复执行或遗漏</strong>
- <strong>调试困难</strong>：问题分散在多个 Agent 中，<strong>日志不集中</strong>
- <strong>死锁风险</strong>：Agent 之间的<strong>循环依赖</strong>可能导致死锁

### 混合编排（Hybrid Orchestration）

<strong>混合编排</strong>结合了中心化和去中心化的优点：核心流程由<strong>编排器统一管理</strong>，局部交互由 <strong>Agent 自主协调</strong>。这是目前<strong>工业实践中最常用的模式</strong>。

混合编排的典型结构：

- <strong>顶层编排</strong>：编排器负责<strong>任务分解</strong> 和 <strong>Agent 分组</strong>
- <strong>组内协调</strong>：每组内的 Agent <strong>自主协商</strong>执行顺序
- <strong>结果聚合</strong>：编排器收集各组结果，进行<strong>最终整合</strong>

### 架构模式选择矩阵

| 场景 | 推荐模式 | 理由 |
|------|---------|------|
| 数据流水线 | <strong>中心化</strong> | 流程固定，需要严格顺序执行 |
| 实时监控系统 | <strong>去中心化</strong> | 需要快速响应，容错要求高 |
| 客户服务系统 | <strong>混合</strong> | 核心流程集中，对话交互分散 |
| 代码审查系统 | <strong>混合</strong> | 检查规则集中，审查逻辑分散 |`,
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
            body: `<strong>OpenAI Symphony</strong> 是 OpenAI 于 2026 年 4 月发布的<strong>开源 Agent 编排规范</strong>，旨在为多智能体协作提供<strong>统一的标准协议</strong>。Symphony 的核心目标是解决当前 Agent 生态中<strong>协议碎片化</strong>的问题，让不同框架和平台的 Agent 能够<strong>无缝协作</strong>。

### Symphony 的设计理念

Symphony 的设计遵循三个核心原则：

- <strong>开放性</strong>：规范完全开源，任何框架和平台都可以<strong>自由实现</strong>
- <strong>最小化</strong>：只定义<strong>必要的协议接口</strong>，不强制要求特定的实现方式
- <strong>可扩展</strong>：通过<strong>插件机制</strong>支持自定义功能，不影响核心协议

### Symphony 的核心概念

<strong>Symphony 定义了以下核心概念</strong>：

- <strong>Score（乐谱）</strong>：描述整个任务的<strong>执行计划</strong>，包含任务分解、Agent 分配、执行顺序和依赖关系
- <strong>Conductor（指挥家）</strong>：负责<strong>解析 Score</strong> 并调度 Agent 执行的<strong>编排器</strong>
- <strong>Player（演奏者）</strong>：执行具体任务的 <strong>Agent</strong>，接收指令、执行任务、返回结果
- <strong>Movement（乐章）</strong>：Score 中的<strong>一个执行阶段</strong>，包含一组并行或串行的任务

### Symphony 的通信协议

<strong>Symphony 定义了三种通信模式</strong>：

- <strong>Request-Response</strong>：Conductor 向 Player 发送请求，等待<strong>同步响应</strong>
- <strong>Publish-Subscribe</strong>：Conductor 发布事件，多个 Player <strong>订阅并响应</strong>
- <strong>Event Stream</strong>：Player 在执行过程中<strong>持续推送事件</strong>，Conductor 实时监听

### Symphony 与其他规范的对比

| 特性 | Symphony | A2A (Agent-to-Agent) | MCP (Model Context Protocol) |
|------|---------|---------------------|------------------------------|
| 定位 | <strong>多 Agent 编排标准</strong> | Agent 间通信协议 | 工具调用标准 |
| 开源 | ✅ 完全开源 | ✅ 开源 | ✅ 开源 |
| 编排能力 | ✅ <strong>内置编排逻辑</strong> | ❌ 仅通信 | ❌ 仅工具调用 |
| 多 Agent 支持 | ✅ <strong>原生支持</strong> | ✅ 原生支持 | ⚠️ 间接支持 |
| 状态管理 | ✅ <strong>内置状态追踪</strong> | ❌ 无 | ❌ 无 |
| 错误处理 | ✅ <strong>重试+降级</strong> | ⚠️ 基础 | ⚠️ 基础 |`,
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
            body: `<strong>有限状态机（Finite State Machine, FSM）</strong>是 Agent 编排系统的<strong>核心抽象</strong>。通过将任务建模为状态机的状态转换，可以清晰地描述任务的<strong>生命周期</strong> 和 <strong>执行流程</strong>。

### 状态机的基本元素

一个用于 Agent 编排的状态机包含以下元素：

- <strong>状态（State）</strong>：任务所处的<strong>阶段</strong>，如 Pending、Running、Completed、Failed
- <strong>转换（Transition）</strong>：从一个状态到另一个状态的<strong>变化条件</strong>
- <strong>事件（Event）</strong>：触发状态转换的<strong>外部信号</strong>
- <strong>动作（Action）</strong>：状态转换时执行的<strong>操作</strong>

### Agent 编排的典型状态机

典型的 Agent 编排状态转换流程为：<strong>Pending（待调度）→ Running（执行中）→ Completed（完成）</strong> 或 <strong>Failed（失败）</strong>。失败后可以进入 <strong>Retrying（重试中）</strong>，重试成功回到 Running，超过最大重试次数后 <strong>Escalate（升级处理）</strong>。

### 状态机的实现策略

<strong>实现 Agent 编排状态机有三种主要策略</strong>：

<strong>策略一：硬编码状态机</strong>——将状态转换逻辑<strong>直接写入代码</strong>，使用 switch-case 或 if-else 实现。优点是简单直接，缺点是<strong>状态变更需要修改代码</strong>。

<strong>策略二：声明式状态机</strong>——使用<strong>配置文件</strong>定义状态转换规则，运行时动态解析。优点是<strong>规则变更无需改代码</strong>，缺点是需要额外的<strong>规则引擎</strong>。

<strong>策略三：图状态机</strong>——将状态机建模为<strong>有向图</strong>，使用图遍历算法执行状态转换。这是 <strong>LangGraph</strong> 采用的方式，支持<strong>循环、分支和并行</strong>等复杂模式。

### 状态管理的持久化

在分布式环境中，状态需要<strong>持久化存储</strong>以保证系统重启后能恢复：

- <strong>内存存储</strong>：适合<strong>单进程、短生命周期</strong>的编排任务
- <strong>Redis</strong>：适合<strong>分布式、高并发</strong>场景，支持原子操作
- <strong>数据库</strong>：适合<strong>需要长期审计</strong>的场景，支持复杂查询`,
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
            body: `<strong>LangGraph</strong> 是目前最成熟的 <strong>Agent 编排框架</strong>之一。它基于<strong>图计算模型</strong>，将 Agent 编排建模为<strong>有向图的遍历</strong>，支持循环、分支、并行等复杂模式。本节通过一个<strong>代码审查 Agent 系统</strong>的实战案例，演示 LangGraph 的完整用法。

### 系统架构

我们要构建的代码审查系统包含以下 Agent：

- <strong>Parser Agent</strong>：解析代码变更，提取修改的文件和行
- <strong>Lint Agent</strong>：执行静态分析，检查代码规范
- <strong>Security Agent</strong>：检测安全漏洞和潜在风险
- <strong>Reviewer Agent</strong>：综合所有分析结果，生成审查报告

### 执行流程

整个代码审查流程分为四个阶段：<strong>解析阶段</strong> → <strong>Lint 检查和安全扫描并行执行</strong> → <strong>生成审查报告</strong> → <strong>输出结果</strong>。如果解析后发现没有代码变更，直接跳过检查阶段。

### 关键实现要点

<strong>状态定义</strong>：使用 Annotation 定义编排状态，包括代码变更列表、Lint 结果、安全扫描结果、审查报告和当前步骤。

<strong>节点函数</strong>：每个 Agent 实现为一个节点函数，接收当前状态，返回更新后的状态。

<strong>条件边</strong>：使用 addConditionalEdges 实现动态路由，根据解析结果决定是进入检查阶段还是直接生成报告。`,
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
            body: `当前主流的 <strong>Agent 编排框架</strong>有三个：<strong>LangGraph</strong>、<strong>CrewAI</strong> 和 <strong>AutoGen</strong>。它们各有特点，适用于不同的场景。本节从多个维度进行<strong>深度对比分析</strong>。

### LangGraph

<strong>LangGraph</strong> 由 LangChain 团队开发，基于<strong>图计算模型</strong>的 Agent 编排框架。

<strong>核心特点</strong>：

- <strong>图模型</strong>：将编排逻辑建模为<strong>有向图</strong>，节点是 Agent 或函数，边是控制流
- <strong>状态管理</strong>：内置<strong>状态对象</strong>，节点之间通过状态共享数据
- <strong>循环支持</strong>：原生支持<strong>循环和条件分支</strong>，适合迭代式任务
- <strong>人工介入</strong>：支持<strong>Human-in-the-loop</strong>，可以在关键步骤暂停等待人工确认

<strong>适用场景</strong>：需要<strong>复杂控制流</strong>的编排任务，如代码生成-审查-修复的迭代流程。

### CrewAI

<strong>CrewAI</strong> 是一个<strong>角色驱动</strong>的 Agent 编排框架，强调 Agent 的<strong>角色定义</strong> 和 <strong>任务分配</strong>。

<strong>核心特点</strong>：

- <strong>角色系统</strong>：每个 Agent 有明确的<strong>角色（Role）</strong>、<strong>目标（Goal）</strong> 和 <strong>背景（Backstory）</strong>
- <strong>任务分配</strong>：通过 <strong>Process</strong> 对象定义任务分配策略（Sequential 或 Hierarchical）
- <strong>易用性</strong>：API 设计简洁，适合<strong>快速原型开发</strong>
- <strong>工具集成</strong>：内置丰富的<strong>工具集</strong>，减少外部依赖

<strong>适用场景</strong>：需要<strong>明确角色分工</strong>的协作任务，如内容创作团队、调研分析团队。

### AutoGen

<strong>AutoGen</strong> 由微软开发，强调<strong>多 Agent 对话</strong>的编排模式。

<strong>核心特点</strong>：

- <strong>对话驱动</strong>：Agent 之间通过<strong>多轮对话</strong>协作，模拟人类团队的讨论过程
- <strong>用户代理</strong>：支持<strong>UserProxyAgent</strong>，让人类参与 Agent 对话
- <strong>代码执行</strong>：内置<strong>代码执行器</strong>，Agent 可以编写并执行代码
- <strong>灵活拓扑</strong>：支持<strong>任意对话拓扑</strong>，不限于线性或层级结构

<strong>适用场景</strong>：需要<strong>多轮讨论和协商</strong>的任务，如方案设计、问题诊断。

### 三维度对比

| 维度 | LangGraph | CrewAI | AutoGen |
|------|-----------|--------|---------|
| <strong>编程模型</strong> | 有向图 | 角色+任务 | 多轮对话 |
| <strong>学习曲线</strong> | 中等 | 低 | 中等 |
| <strong>控制精度</strong> | <strong>高</strong> | 中 | 低 |
| <strong>状态管理</strong> | 内置状态对象 | 任务结果传递 | 对话历史 |
| <strong>循环支持</strong> | ✅ 原生 | ⚠️ 有限 | ✅ 通过对话 |
| <strong>人工介入</strong> | ✅ 内置 | ❌ 需自行实现 | ✅ UserProxyAgent |
| <strong>调试体验</strong> | 好（图可视化） | 中 | 中（对话日志） |
| <strong>社区生态</strong> | <strong>大</strong>（LangChain 生态） | 中 | 大（微软支持） |
| <strong>生产就绪</strong> | ✅ | ⚠️ | ⚠️ |

### 选型建议

| 需求 | 推荐框架 |
|------|---------|
| 精确控制执行流程 | <strong>LangGraph</strong> |
| 快速原型 + 角色分工 | <strong>CrewAI</strong> |
| 多轮讨论 + 代码执行 | <strong>AutoGen</strong> |
| 生产级稳定性 | <strong>LangGraph</strong> |
| 与 LangChain 集成 | <strong>LangGraph</strong> |`,
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
            body: `<strong>Agent 编排系统的容错能力</strong>是生产环境中最重要的非功能性指标。Agent 可能因为各种原因失败：<strong>网络超时</strong>、<strong>模型幻觉</strong>、<strong>资源不足</strong>、<strong>输入异常</strong>。一个健壮的编排系统必须能够<strong>优雅地处理这些失败</strong>。

### 错误类型分类

<strong>Agent 编排中的错误可以分为四类</strong>：

- <strong>瞬时错误（Transient Error）</strong>：网络超时、API 限流、临时资源不足。这类错误通常<strong>短暂存在</strong>，重试即可恢复。
- <strong>持久错误（Persistent Error）</strong>：配置错误、权限不足、输入格式错误。这类错误<strong>不会因重试而消失</strong>，需要人工干预。
- <strong>Agent 错误（Agent Error）</strong>：模型返回无效结果、Agent 陷入循环、Agent 超时。这类错误需要<strong>特定的恢复策略</strong>。
- <strong>系统错误（System Error）</strong>：编排器崩溃、数据库连接断开、消息队列积压。这类错误影响<strong>整个编排系统</strong>。

### 重试策略

<strong>重试是处理瞬时错误的主要手段</strong>。但重试不是简单的"再试一次"，需要考虑以下因素：

- <strong>最大重试次数</strong>：不宜过多，对于 LLM 调用建议最多 <strong>3 次</strong>
- <strong>退避策略</strong>：使用<strong>指数退避</strong>（1s → 2s → 4s），避免<strong>重复冲击</strong>下游服务
- <strong>可重试错误白名单</strong>：只重试<strong>确实可能恢复</strong>的错误类型

### 降级策略

当 Agent 持续失败时，编排系统需要启动<strong>降级策略</strong>：

- <strong>功能降级</strong>：使用<strong>简化版功能</strong>替代完整功能（如使用规则引擎替代 AI 模型）
- <strong>结果降级</strong>：返回<strong>部分结果</strong> 而 非完整结果
- <strong>超时降级</strong>：超过最大等待时间后，<strong>跳过该 Agent</strong>，继续执行后续步骤

### 熔断器模式

<strong>熔断器（Circuit Breaker）</strong> 是防止<strong>级联失败</strong>的重要模式：

- <strong>关闭状态（Closed）</strong>：正常执行，统计失败次数
- <strong>打开状态（Open）</strong>：失败次数超过阈值，<strong>直接拒绝请求</strong>，快速失败
- <strong>半开状态（Half-Open）</strong>：等待一段时间后，<strong>允许少量请求通过</strong>，测试是否恢复`,
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
            body: `基于大量的<strong>工业实践经验</strong>，本节总结了 Agent 编排中的<strong>最佳实践</strong> 和 <strong>常见反模式</strong>，帮助你在设计和实现编排系统时<strong>少走弯路</strong>。

### 最佳实践

<strong>实践一：从简单开始，渐进式复杂化</strong>

不要一开始就设计<strong>多 Agent、多阶段、多分支</strong>的复杂编排流程。从<strong>线性流程</strong>开始，逐步增加<strong>并行节点</strong> 和 <strong>条件分支</strong>。每一步都验证<strong>正确性和性能</strong>后再进入下一步。

<strong>实践二：为每个 Agent 定义清晰的契约</strong>

每个 Agent 应该有明确的<strong>输入格式</strong>、<strong>输出格式</strong> 和 <strong>错误码</strong>。契约文档化，并在代码中通过<strong>类型系统</strong>强制执行。这样可以减少 Agent 之间的<strong>集成问题</strong>。

<strong>实践三：编排逻辑与业务逻辑分离</strong>

<strong>编排逻辑</strong>（任务分解、调度、容错）和<strong>业务逻辑</strong>（Agent 的具体实现）应该<strong>严格分离</strong>。这样可以在不影响业务逻辑的情况下，<strong>独立优化编排策略</strong>。

<strong>实践四：全面的可观测性</strong>

编排系统需要以下<strong>可观测性指标</strong>：

- <strong>指标（Metrics）</strong>：任务成功率、平均执行时间、Agent 调用次数
- <strong>追踪（Tracing）</strong>：每个任务的<strong>完整调用链</strong>，包括耗时和状态
- <strong>日志（Logging）</strong>：结构化的<strong>事件日志</strong>，支持按任务 ID 查询

### 反模式

<strong>反模式一：上帝编排器（God Orchestrator）</strong>——将所有逻辑都塞进<strong>编排器</strong>中，Agent 只是<strong>被动的执行器</strong>。正确做法是编排器只负责<strong>调度和协调</strong>，具体业务逻辑放在 <strong>Agent 内部</strong>。

<strong>反模式二：隐式状态传递</strong>——通过<strong>全局变量</strong> 或 <strong>隐式上下文</strong>在 Agent 之间传递状态。正确做法是使用<strong>显式的状态对象</strong>。

<strong>反模式三：忽略超时设置</strong>——不为 Agent 调用设置<strong>超时时间</strong>，导致一个慢 Agent <strong>阻塞整个编排流程</strong>。正确做法是为每个 Agent 调用设置<strong>合理的超时时间</strong>。

<strong>反模式四：过度并行</strong>——将<strong>所有任务都并行化</strong>，认为"并行一定比串行快"。实际上，如果任务之间有<strong>隐含依赖</strong>，过度并行会导致<strong>结果不一致</strong> 和 <strong>资源浪费</strong>。`,
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
            body: `<strong>Agent 编排</strong>是一个快速发展的领域，以下是一些<strong>推荐的学习资源</strong> 和 <strong>延伸阅读方向</strong>，帮助你持续深入这个领域。

### 推荐阅读

<strong>论文与规范</strong>：

- <strong>OpenAI Symphony Specification</strong>（2026）：开源 Agent 编排规范的官方文档，定义了 Score、Conductor、Player 等核心概念
- <strong>A2A Protocol</strong>（2026）：Agent-to-Agent 通信协议，关注 Agent 之间的<strong>直接通信</strong> 而 非编排
- <strong>MCP Specification</strong>（2025）：Model Context Protocol，定义了 AI 模型与外部工具的<strong>标准化接口</strong>

<strong>开源项目</strong>：

- <strong>LangGraph</strong>：基于图模型的 Agent 编排框架，支持循环、分支、并行
- <strong>CrewAI</strong>：角色驱动的 Agent 编排框架，API 简洁易用
- <strong>AutoGen</strong>：微软开发的多 Agent 对话框架，支持代码执行和人工介入
- <strong>Temporal</strong>：分布式工作流引擎，虽然不是专为 Agent 设计，但编排理念高度相关

### 学习路线建议

<strong>第一步：理解基础</strong>——学习有限状态机（FSM）和工作流引擎概念

<strong>第二步：实践 LangGraph</strong>——用 LangGraph 实现一个简单的多 Agent 编排流程

<strong>第三步：对比其他框架</strong>——用同样的任务在 CrewAI 和 AutoGen 上实现，对比差异

<strong>第四步：研究 OpenAI Symphony</strong>——阅读 Symphony 规范，理解 Score 格式和通信协议

<strong>第五步：生产实践</strong>——为你的实际业务场景设计编排方案，加入容错和可观测性

### 未来趋势

<strong>Agent 编排领域的三个重要趋势</strong>：

- <strong>标准化</strong>：随着 Symphony、A2A 等规范的推广，Agent 编排将逐步走向<strong>标准化</strong>，不同框架之间的互操作性会越来越好
- <strong>智能化</strong>：编排器本身将引入 <strong>AI 能力</strong>，能够根据任务特征<strong>自动选择最优编排策略</strong>，而不仅仅是执行预设流程
- <strong>可观测性驱动</strong>：随着生产环境中 Agent 编排规模的扩大，<strong>可观测性</strong>将成为编排系统的<strong>核心能力</strong>，而不仅仅是附加功能`,
            code: [],
            tip: "关注 Symphony 和 A2A 协议发展，有望成为行业标准。学习核心概念而非具体 API。",
            warning: "框架和规范 API 变化频繁，关注核心概念而非具体实现细节。"
        }
    ]
};
