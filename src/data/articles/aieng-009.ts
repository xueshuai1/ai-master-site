import { Article } from '../knowledge';

export const article: Article = {
  id: 'aieng-009',
  title: '12-Factor Agents：AI Agent 工程原则详解',
  category: 'AI 工程化',
  tags: ['AI Agent', '工程原则', '12-Factor', '软件架构', '最佳实践'],
  level: '进阶',
  summary: '从 Heroku 12-Factor App 到 AI Agent 工程方法论，系统讲解构建可维护、可扩展、可观测的 AI Agent 应用的 12 条核心原则，涵盖代码库管理、依赖隔离、配置分离、状态治理、并发模型和可观测性。',
  sections: [
    {
      title: '一、引言：AI Agent 需要自己的工程原则',
      content: `**12-Factor App** 是 Heroku 团队在 2011 年提出的一套 **Web 应用开发最佳实践**，深刻影响了现代 **云原生应用** 的构建方式。如今，随着 **AI Agent** 从实验性原型走向 **生产级部署**，我们面临同样的挑战：如何构建 **可维护、可扩展、可观测** 的 Agent 系统？

**AI Agent 与传统 Web 应用** 有本质区别。Agent 不是简单的 **请求-响应** 模型，而是具有 **自主决策能力**、**工具调用能力** 和 **持续状态** 的智能体。传统的 **MVC 架构** 和 **RESTful API 设计** 无法直接套用到 Agent 系统中。

**2026 年 5 月**，社区涌现出多个 Agent 框架（**Mastra AI** 23,784 星、**ElizaOS** 18,346 星、**humanlayer/12-factor-agents** 19,754 星），标志着 AI Agent 工程化进入了 **标准化阶段**。这些框架背后的设计理念，与 12-Factor App 的精神高度一致：**通过约定而非配置来降低复杂度**。

**为什么需要 12-Factor Agents？** 因为当前的 Agent 开发存在严重问题：**硬编码 API Key**、**会话状态无法持久化**、**工具调用缺乏审计**、**多 Agent 协作没有明确边界**。这些问题在传统软件工程中都已有成熟解决方案，但 Agent 领域尚未形成共识。

本文将基于 **12-Factor App** 的核心思想，结合 **AI Agent 的独特需求**，提出适配 Agent 系统的 **12 条工程原则**。这些原则不是理论推导，而是来自 **生产级 Agent 系统** 的实战经验总结。`,
      tip: '如果你正在构建面向生产环境的 AI Agent，建议在项目启动阶段就将这些原则纳入架构设计，而非事后补救。重构 Agent 的状态管理远比重构 Web 应用的数据库连接更困难。',
      warning: '不要盲目照搬 12-Factor App 的所有条目。Agent 系统有独特的需求（如 prompt 版本管理、工具调用的幂等性），需要针对性调整。本文的原则是经过 AI 场景适配的版本。',
    },
    {
      title: '二、Factor 1：单一代码库（Codebase）',
      content: `每个 **AI Agent** 应该维护在 **一个版本控制仓库** 中。这与 12-Factor App 的第一条原则一致，但在 Agent 语境下有特殊含义。

**Agent 的代码库** 包含三个核心部分：**Agent 逻辑代码**（决策树、状态机）、**Prompt 模板**（系统提示词、Few-shot 示例）和 **工具定义**（Function Calling schema、API 封装）。这三者必须 **同步版本化**，因为它们是 **强耦合** 的。

**错误实践：Prompt 与代码分离存储**
\`\`\`
❌ Agent 代码在 Git 仓库
❌ Prompt 模板在 Notion 文档
❌ 工具定义在飞书表格
✅ 全部在同一个 Git 仓库中版本化管理
\`\`\`

**正确的目录结构** 应该将所有 Agent 相关资产组织在一起：
\`\`\`
my-agent/
├── src/
│   ├── agents/          # Agent 逻辑代码
│   │   ├── planner.ts   # 规划器
│   │   └── executor.ts  # 执行器
│   ├── prompts/         # Prompt 模板
│   │   ├── system.md    # 系统提示词
│   │   └── few-shot/    # Few-shot 示例
│   ├── tools/           # 工具定义
│   │   ├── search.ts    # 搜索工具
│   │   └── browser.ts   # 浏览器工具
│   └── config/          # 配置文件
│       └── tools.json   # 工具注册表
├── tests/
│   ├── agent.test.ts    # Agent 行为测试
│   └── prompt.test.ts   # Prompt 输出测试
└── package.json
\`\`\`

**多 Agent 协作** 场景下，每个 Agent 应该有 **独立的仓库**，通过 **定义清晰的接口契约** 进行通信。这类似于 **微服务架构** 中的服务边界划分。

**版本兼容性** 是关键问题。当 Agent A 的 **工具调用接口** 升级时，Agent B 必须能够 **优雅降级**。这要求在 **接口设计阶段** 就考虑 **向后兼容性**。`,
      tip: '使用 monorepo 管理多 Agent 项目时，确保每个 Agent 有独立的目录和 package.json，通过 workspace 协议共享公共依赖。这样既能独立部署，又能共享工具库。',
      warning: '避免将所有 Agent 的 Prompt 放在同一个文件中。当项目规模扩大时，Prompt 文件会变得难以维护。应该按 Agent 和功能模块拆分。',
    },
    {
      title: '三、Factor 2：显式声明依赖（Dependencies）',
      content: `**AI Agent 的依赖管理** 比传统应用更复杂，因为 Agent 不仅依赖 **代码库**，还依赖 **模型版本**、**工具 API** 和 **外部数据源**。

**第一层依赖：代码依赖**。这部分与传统 Node.js 项目相同，通过 **package.json** 和 **lock 文件** 管理：
\`\`\`json
{
  "dependencies": {
    "@ai-sdk/openai": "^1.2.0",
    "langchain": "^0.3.5",
    "zod": "^3.23.0"
  },
  "engines": {
    "node": ">=20.0.0"
  }
}
\`\`\`

**第二层依赖：模型依赖**。Agent 的行为高度依赖 **底层模型版本**。同一个 Prompt 在 **gpt-4o** 和 **Claude 3.5** 上可能产生 **完全不同的输出**。必须 **显式声明** 所用模型的 **版本号** 和 **提供商**：
\`\`\`typescript
// ✅ 显式声明模型版本
const MODEL_CONFIG = {
  provider: 'openai',
  model: 'gpt-4o-2024-11-20',  // 精确到具体版本
  temperature: 0.1,
  maxTokens: 4096,
} as const;

// ❌ 不要使用模糊的模型标识
const BAD_CONFIG = {
  model: 'gpt-4o-latest',  // "latest" 会在上游更新后改变行为
};
\`\`\`

**第三层依赖：工具 API 依赖**。Agent 调用的 **外部工具**（搜索 API、数据库、浏览器）是 **关键依赖链**。每个工具必须声明：
- **API 版本**（如 Google Search API v1）
- **速率限制**（如 100 次/分钟）
- **降级策略**（如超时后使用缓存）

**依赖锁定文件** 应该包含所有三层依赖的 **精确版本**。推荐使用 **dotenv + .env.lock** 记录模型版本和 API 端点。`,
      tip: '为 Agent 项目创建一个 dependency-audit 脚本，定期检查模型版本是否过期、工具 API 是否有 breaking change。AI 领域的 API 变更频率远高于传统软件。',
      warning: '不要在代码中硬编码 API Key 或模型配置。使用环境变量注入，确保同一套代码可以在不同环境（开发、测试、生产）中运行。',
    },
    {
      title: '四、Factor 3：配置与代码分离（Config）',
      content: `**配置分离** 是 12-Factor App 的核心原则之一，在 AI Agent 中有 **更丰富的含义**。Agent 的配置分为四类：

**第一类：环境变量**。包括 **API Key**、**数据库连接串**、**服务地址** 等敏感信息：
\`\`\`bash
# .env（不要提交到 Git）
OPENAI_API_KEY=sk-xxx
ANTHROPIC_API_KEY=sk-ant-xxx
DATABASE_URL=postgresql://localhost:5432/agent-db
REDIS_URL=redis://localhost:6379
\`\`\`

**第二类：运行时配置**。包括 **模型参数**、**超时设置**、**重试策略** 等：
\`\`\`typescript
// config/runtime.ts
export const runtimeConfig = {
  llm: {
    temperature: 0.1,        // 低温度确保确定性输出
    topP: 0.9,
    maxRetries: 3,
    timeoutMs: 30000,
  },
  tools: {
    search: { maxResults: 10, timeoutMs: 5000 },
    browser: { headless: true, timeoutMs: 60000 },
  },
} as const;
\`\`\`

**第三类：Prompt 参数**。Prompt 中的 **可变部分**（如语言、角色、输出格式）应该 **参数化**，而非硬编码：
\`\`\`markdown
# system.md
你是一个 **{role}** 助手，使用 **{language}** 回复。
你的职责是 **{task_description}**。
输出格式：**{output_format}**。
\`\`\`

**第四类：行为开关**（Feature Flags）。控制 Agent 的 **实验性功能**：
\`\`\`typescript
export const featureFlags = {
  enableReflection: true,     // 启用自我反思
  enableToolChain: false,     // 工具链模式（实验中）
  maxChainDepth: 3,           // 最大调用深度
} as const;
\`\`\`

**配置验证** 是重要环节。Agent 启动时应 **校验所有必需配置**，缺失时 **立即报错退出**，而非在运行时抛出难以调试的错误。`,
      tip: '使用 Zod 或 Joi 对配置文件进行运行时校验。Agent 的配置错误通常在运行时才暴露，导致难以复现。启动时校验可以在部署阶段就拦截配置错误。',
      warning: '不要把 Prompt 模板当作配置项存在 .env 文件中。Prompt 是代码的一部分，应该和代码一起版本化。只有 Prompt 中的变量（如角色名、语言）才通过配置注入。',
    },
    {
      title: '五、Factor 4：后端服务即绑定资源（Backing Services）',
      content: `在 12-Factor App 中，**后端服务**（数据库、缓存、消息队列）被视为 **绑定资源**。Agent 系统中，这个概念扩展为 **AI 绑定资源**：

**AI 绑定资源包括**：
- **LLM API**（OpenAI、Anthropic、Google 等）
- **向量数据库**（Pinecone、Weaviate、Milvus）
- **工具 API**（搜索、浏览器、代码执行）
- **消息队列**（任务调度、Agent 间通信）

**关键原则**：Agent 代码不应该对 **具体提供商** 做出假设。通过 **抽象层** 实现 **可替换性**：
\`\`\`typescript
// ✅ 使用抽象接口
interface LLMProvider {
  generate(prompt: string, options?: LLMOptions): Promise<string>;
  embed(text: string): Promise<number[]>;
}

// 具体实现可替换
class OpenAIProvider implements LLMProvider { ... }
class AnthropicProvider implements LLMProvider { ... }

// Agent 代码只依赖接口
const agent = new Agent({ llm: new OpenAIProvider() });
\`\`\`

**连接管理** 方面，Agent 应该使用 **连接池** 和 **重试机制**：
\`\`\`typescript
const llmClient = new LLMClient({
  provider: process.env.LLM_PROVIDER,
  maxConnections: 10,
  retryPolicy: {
    maxRetries: 3,
    backoffMs: 1000,
    retryOnStatus: [429, 500, 503],
  },
});
\`\`\`

**本地开发** 和 **生产环境** 应该使用 **相同类型的服务**，只是配置不同。例如，开发环境使用 **本地 Ollama**，生产环境使用 **OpenAI API**，但通过同一个 **LLMProvider 接口** 调用。`,
      tip: '为每个后端服务实现一个 mock 版本，用于单元测试。Agent 的测试比传统应用更依赖 mock，因为真实 LLM 调用既慢又贵。',
      warning: '不要将 Agent 与特定 LLM 提供商深度耦合。如果代码中到处是 openai.chat.completions.create() 调用，更换提供商将变成噩梦。使用抽象层隔离。',
    },
    {
      title: '六、Factor 5：严格分离构建、发布、运行（Build, Release, Run）',
      content: `**构建阶段**（Build）：将代码仓库转换为 **可执行包**。在 Agent 项目中，这包括：
- **编译 TypeScript** 为 JavaScript
- **安装依赖**（npm install --production）
- **构建 Prompt 模板**（合并模板与参数）
- **生成工具注册表**（扫描 tools/ 目录生成 JSON schema）

**发布阶段**（Release）：将构建产物与 **运行时配置** 结合，创建 **发布版本**：
\`\`\`bash
# 发布流程
npm run build          # 构建
node scripts/validate-prompts.mjs  # 验证 Prompt 语法
node scripts/generate-tool-schema.mjs  # 生成工具 schema
# 将构建产物 + .env 配置打包为发布版本
\`\`\`

**运行阶段**（Run）：在 **执行环境** 中启动 Agent：
\`\`\`bash
# 运行命令（只读文件系统）
node dist/main.js
\`\`\`

**三个阶段必须严格分离**：
- **构建阶段** 不应该访问任何运行时配置
- **发布阶段** 不应该执行任何代码
- **运行阶段** 不应该修改任何文件

**Agent 特有的构建步骤** 包括 **Prompt 验证**。Prompt 模板中的 **变量占位符** 必须在构建阶段验证：
\`\`\`typescript
// validate-prompts.mjs
import { readFileSync } from 'fs';
const prompt = readFileSync('prompts/system.md', 'utf-8');
const placeholders = prompt.match(/\\{\\w+\\}/g);
// 验证所有占位符都有对应的配置注入
\`\`\`

**不可变发布** 是核心原则。一旦发布版本创建，就不应该被修改。如果需要更新，应该 **创建新的发布版本**，而非修改现有版本。`,
      tip: '使用 Docker 容器化 Agent 应用，确保构建、发布、运行阶段的隔离。Dockerfile 中明确区分 COPY（构建）、ENV（发布）和 CMD（运行）阶段。',
      warning: 'Agent 在运行时不应该修改自己的 Prompt 模板或工具定义。如果你发现 Agent 需要"自我修改"代码，这通常是架构设计问题。应该在配置层或状态层解决。',
    },
    {
      title: '七、Factor 6：无状态进程（Stateless Processes）',
      content: `**无状态进程** 是 12-Factor App 的标志性原则：每个请求都是 **独立的**，不依赖 **进程内存中的状态**。这对 AI Agent 提出了 **独特挑战**。

**Agent 的"状态"是什么？** Agent 的 **对话历史**、**上下文窗口**、**工具调用记录** 都是状态。如果将这些状态存在 **进程内存** 中，一旦进程重启，所有状态都会丢失。

**正确的做法：将状态外置到持久化存储**：
\`\`\`typescript
// ✅ 状态存储在外部数据库
interface AgentState {
  sessionId: string;
  conversationHistory: Message[];  // 存储在数据库
  toolCallLog: ToolCall[];          // 存储在数据库
  context: Record<string, any>;     // 用户偏好、临时数据
}

// Agent 进程本身不持有任何持久状态
class StatelessAgent {
  async handleRequest(input: Input, state: AgentState): Promise<Output> {
    const context = await stateLoader.load(state.sessionId);
    const result = await this.process(input, context);
    await stateSaver.save(state.sessionId, result.newState);
    return result.output;
  }
}
\`\`\`

**上下文窗口的管理** 是 Agent 特有的无状态挑战。由于 LLM 的 **上下文窗口有限**（如 128K tokens），Agent 必须在每次调用时 **重建上下文**：
\`\`\`typescript
// 上下文重建策略
async function rebuildContext(sessionId: string): Promise<Context> {
  const history = await db.getConversation(sessionId, { limit: 20 });
  const summary = await db.getSummary(sessionId);  // 长期摘要
  return {
    systemPrompt: loadSystemPrompt(),
    history: history.messages,
    summary: summary.text,
  };
}
\`\`\`

**水平扩展** 的前提是无状态。只有当 Agent 进程无状态时，才能在 **多个实例间负载均衡**。如果 Agent 持有会话状态，就必须使用 **sticky session**，这严重限制了扩展性。`,
      tip: '使用 Redis 存储短期会话状态，PostgreSQL 存储长期对话历史。Redis 的 TTL 功能可以自动清理过期会话，避免存储无限增长。',
      warning: '不要把 LLM 的上下文窗口当作"状态存储"。每次调用 LLM 时都应该从持久化存储重建上下文。如果依赖进程内存中的对话历史，进程重启后所有对话都会丢失。',
    },
    {
      title: '八、Factor 7：端口绑定服务暴露（Port Binding）',
      content: `**Agent 通过端口绑定暴露服务**，而不是依赖 **特定运行时环境**（如 Nginx、PM2）来注入网络层。

**Agent 的服务暴露模式** 有三种：

**模式一：HTTP API 模式**。Agent 作为 **RESTful 或 GraphQL 服务** 运行：
\`\`\`typescript
import { Hono } from 'hono';
const app = new Hono();

app.post('/api/agent/chat', async (c) => {
  const { message, sessionId } = await c.req.json();
  const agent = new ChatAgent({ sessionId });
  const response = await agent.process(message);
  return c.json(response);
});

app.listen({ port: parseInt(process.env.PORT || '3000') });
\`\`\`

**模式二：WebSocket 流式模式**。Agent 通过 **WebSocket** 提供 **实时流式输出**：
\`\`\`typescript
wss.on('connection', (ws) => {
  ws.on('message', async (data) => {
    const agent = new StreamingAgent();
    for await (const chunk of agent.streamProcess(data)) {
      ws.send(JSON.stringify({ type: 'chunk', data: chunk }));
    }
    ws.send(JSON.stringify({ type: 'done' }));
  });
});
\`\`\`

**模式三：事件驱动模式**。Agent 订阅 **消息队列**，响应事件：
\`\`\`typescript
consumer.subscribe({
  topic: 'agent-tasks',
  handler: async (task) => {
    const agent = new TaskAgent();
    const result = await agent.execute(task);
    producer.send('agent-results', result);
  },
});
\`\`\`

**端口配置** 应该通过 **环境变量** 注入，而非硬编码：
\`\`\`bash
export PORT=3000      # Agent HTTP 服务端口
export METRICS_PORT=9090  # 监控指标端口
\`\`\`

**健康检查端点** 是必须的：
\`\`\`typescript
app.get('/health', async (c) => {
  const llmOk = await checkLLMConnection();
  const dbOk = await checkDatabaseConnection();
  const status = llmOk && dbOk ? 'healthy' : 'degraded';
  return c.json({ status, llm: llmOk, db: dbOk });
});
\`\`\``,
      tip: 'Agent 的健康检查不仅要检查数据库连接，还要检查 LLM API 的可达性。一个无法调用 LLM 的 Agent 本质上是不可用的。',
      warning: '不要将 Agent 绑定到特定端口号。在容器化环境中，端口是动态分配的。始终通过 PORT 环境变量读取端口号。',
    },
    {
      title: '九、Factor 8：并发模型（Concurrency）',
      content: `**Agent 的并发模型** 比传统应用更复杂，因为 Agent 涉及 **CPU 密集**（LLM 推理）、**I/O 密集**（工具调用）和 **内存密集**（上下文管理）三种工作负载。

**并发层级**：

**第一层：进程级并发**。通过 **多个 Agent 实例** 处理独立请求。这是最常见的扩展方式：
\`\`\`bash
# 使用 PM2 启动多个 Agent 实例
pm2 start dist/main.js -i 4  # 4 个实例
\`\`\`

**第二层：任务级并发**。单个 Agent 实例内部 **并行处理多个子任务**：
\`\`\`typescript
// 并行执行多个工具调用
const [searchResults, weatherData, calendarEvents] = await Promise.all([
  searchTool.execute(query),
  weatherTool.execute(location),
  calendarTool.execute(dateRange),
]);
\`\`\`

**第三层：多 Agent 协作**。多个 Agent **协同工作**，每个 Agent 负责不同的子任务：
\`\`\`typescript
// 多 Agent 编排
const planner = new PlannerAgent();
const plan = await planner.create(userRequest);

// 并行执行计划中的独立步骤
const executors = plan.steps
  .filter(s => !s.dependsOn)
  .map(s => new ExecutorAgent(s));

const results = await Promise.all(
  executors.map(e => e.execute())
);
\`\`\`

**并发控制** 的关键是 **资源限制**。Agent 工具调用（特别是 LLM API）有 **速率限制** 和 **成本约束**：
\`\`\`typescript
// 并发限制器
class ConcurrencyLimiter {
  private active = 0;
  private max: number;

  async acquire(): Promise<void> {
    while (this.active >= this.max) {
      await this.waitForSlot();
    }
    this.active++;
  }

  release(): void {
    this.active--;
  }
}

// 限制 LLM 调用的并发数
const llmLimiter = new ConcurrencyLimiter(5);  // 最多 5 个并发
\`\`\`

**背压机制**（Backpressure）：当 Agent 的 **请求队列** 超过处理能力时，应该 **拒绝新请求** 而非无限排队：
\`\`\`typescript
const queue = new AsyncQueue({
  maxConcurrent: 10,
  maxQueued: 100,
  onOverflow: (req) => {
    req.respond({ error: '服务繁忙，请稍后重试', status: 503 });
  },
});
\`\`\``,
      tip: '使用信号量（Semaphore）控制 LLM API 的并发调用数。大多数 LLM 提供商有每分钟请求数（RPM）限制，超出会被限流。在 Agent 层面做并发控制比在 API 层面更可控。',
      warning: '不要在 Agent 中使用无限制的 Promise.all。如果某个工具调用挂起，所有后续调用都会被阻塞。始终设置超时时间和并发上限。',
    },
    {
      title: '十、Factor 9：可快速启动和优雅终止（Disposability）',
      content: `**Agent 进程** 应该能够 **快速启动**（秒级）和 **优雅终止**（不丢失状态）。

**快速启动** 的关键是 **最小化初始化工作**：
\`\`\`typescript
// ✅ 延迟初始化（Lazy Initialization）
class Agent {
  private llm: LLMClient | null = null;

  private getLLM(): LLMClient {
    if (!this.llm) {
      this.llm = new LLMClient({ /* 配置 */ });
    }
    return this.llm;
  }

  async process(input: string): Promise<string> {
    const llm = this.getLLM();  // 首次使用时才初始化
    return llm.generate(input);
  }
}
\`\`\`

**优雅终止** 需要处理 **SIGTERM 信号**：
\`\`\`typescript
process.on('SIGTERM', async () => {
  console.log('收到 SIGTERM，开始优雅关闭...');

  // 1. 停止接收新请求
  server.close();

  // 2. 等待进行中的请求完成
  await drainActiveRequests({ timeoutMs: 30000 });

  // 3. 保存未持久化的状态
  await stateManager.flush();

  // 4. 关闭所有连接
  await db.close();
  await redis.close();

  console.log('优雅关闭完成');
  process.exit(0);
});

// 超时强制退出
setTimeout(() => {
  console.error('优雅关闭超时，强制退出');
  process.exit(1);
}, 35000);
\`\`\`

**Agent 特有的终止挑战**：LLM 调用可能持续 **数十秒**。优雅终止必须 **等待进行中的 LLM 调用完成**，或者 **安全取消**：
\`\`\`typescript
const abortController = new AbortController();

// LLM 调用支持取消
const response = await llm.generate(prompt, {
  signal: abortController.signal,
});

// 终止时取消进行中的调用
process.on('SIGTERM', () => {
  abortController.abort();
});
\`\`\``,
      tip: '设置合理的优雅关闭超时时间（30-60 秒）。太短会导致 LLM 调用被强制中断，太长会导致部署时等待过久。建议在开发环境设置较短超时以加快迭代。',
      warning: '不要在 SIGTERM 处理函数中执行长时间操作（如批量数据迁移）。优雅终止的目标是保存当前状态，不是做数据维护。数据维护应该在正常运行时通过定时任务完成。',
    },
    {
      title: '十一、Factor 10：开发环境与生产环境等价（Dev/Prod Parity）',
      content: `**开发、测试、生产环境的一致性** 是减少部署问题的关键。Agent 项目在这方面面临 **独特挑战**：

**挑战一：模型差异**。开发环境使用 **小型本地模型**（如 Ollama + Llama 3），生产环境使用 **大型云端模型**（如 GPT-4o）。两者的 **输出质量** 和 **响应速度** 差异巨大。

**解决方案：抽象模型层** + **配置驱动**：
\`\`\`typescript
// 通过环境变量切换模型
const getLLMConfig = () => {
  if (process.env.NODE_ENV === 'production') {
    return {
      provider: 'openai',
      model: 'gpt-4o-2024-11-20',
      maxTokens: 4096,
    };
  }
  // 开发/测试环境使用本地模型
  return {
    provider: 'ollama',
    model: 'llama3.1:8b',
    maxTokens: 2048,
  };
};
\`\`\`

**挑战二：工具 API 差异**。开发环境可能使用 **mock 工具**，生产环境使用 **真实 API**。

**解决方案：统一接口 + 不同实现**：
\`\`\`typescript
// 工具接口统一
interface SearchTool {
  execute(query: string): Promise<SearchResult[]>;
}

// 开发环境：mock 实现
class MockSearchTool implements SearchTool {
  async execute(query: string): Promise<SearchResult[]> {
    return [{ title: 'Mock Result', url: 'https://example.com' }];
  }
}

// 生产环境：真实实现
class RealSearchTool implements SearchTool {
  async execute(query: string): Promise<SearchResult[]> {
    return googleSearch(query);
  }
}

// 根据环境注入
const searchTool = process.env.NODE_ENV === 'production'
  ? new RealSearchTool()
  : new MockSearchTool();
\`\`\`

**挑战三：数据差异**。生产环境有 **真实用户数据**，开发环境只有 **测试数据**。

**解决方案：数据脱敏 + 种子数据**：
\`\`\`bash
# 开发环境使用种子数据
npm run seed:dev

# 生产数据脱敏后用于测试
npm run sanitize-prod-data > tests/fixtures/sanitized.json
\`\`\`

**环境配置矩阵**：

| 配置项 | 开发 | 测试 | 生产 |
|--------|------|------|------|
| 模型 | Ollama (Llama 3) | OpenAI (gpt-4o-mini) | OpenAI (gpt-4o) |
| 搜索 | Mock | Mock | Google API |
| 数据库 | SQLite | PostgreSQL (本地) | PostgreSQL (云端) |
| 缓存 | 无 | Redis (本地) | Redis (云端) |
| 日志 | Console | File | CloudWatch |

**CI/CD 管道** 应该在 **与生产相同的环境** 中运行测试。这意味着 CI 应该使用 **真实模型**（至少是小型的）而非完全 mock。`,
      tip: '在 CI/CD 中设置一个"smoke test"步骤，使用真实的小型 LLM 调用验证 Agent 的基本功能。这能捕获 mock 无法发现的问题（如 Prompt 格式错误、工具 schema 不匹配）。',
      warning: '不要完全依赖 mock 进行 Agent 测试。LLM 的输出是非确定性的，mock 无法模拟这种特性。至少在集成测试阶段使用真实的 LLM 调用。',
    },
    {
      title: '十二、Factor 11：日志作为事件流（Logs）',
      content: `**日志** 在 Agent 系统中比在传统应用中 **更重要**，因为 Agent 的行为 **更难预测**。

**Agent 需要记录的事件类型**：

**第一类：LLM 交互日志**。记录每次 **Prompt 输入** 和 **模型输出**：
\`\`\`typescript
interface LLMLog {
  timestamp: Date;
  sessionId: string;
  model: string;
  inputTokens: number;       // 输入 token 数
  outputTokens: number;      // 输出 token 数
  promptHash: string;        // Prompt 的哈希（用于去重）
  response: string;          // 模型输出
  latencyMs: number;         // 响应延迟
  cost: number;              // 本次调用成本
}
\`\`\`

**第二类：工具调用日志**。记录每次 **工具调用** 的 **参数**、**结果** 和 **耗时**：
\`\`\`typescript
interface ToolCallLog {
  timestamp: Date;
  toolName: string;
  input: Record<string, any>;
  output: any;
  success: boolean;
  latencyMs: number;
  retryCount: number;
}
\`\`\`

**第三类：决策日志**。记录 Agent 的 **推理过程**：
\`\`\`typescript
interface DecisionLog {
  timestamp: Date;
  sessionId: string;
  decision: string;          // Agent 的决策内容
  reasoning: string;         // 决策依据
  alternatives: string[];    // 考虑过的替代方案
  confidence: number;        // 置信度 (0-1)
}
\`\`\`

**日志输出格式** 应该是 **结构化的 JSON**，而非纯文本：
\`\`\`json
{"level":"info","timestamp":"2026-05-12T09:00:00Z","sessionId":"abc123","event":"tool_call","tool":"search","input":{"query":"AI news"},"success":true,"latencyMs":234}
\`\`\`

**日志级别** 设计：
- **DEBUG**：详细的 Prompt 和响应（开发环境）
- **INFO**：工具调用、决策点、会话开始/结束
- **WARN**：重试、降级、模型切换
- **ERROR**：工具调用失败、LLM 超时、状态不一致

**日志聚合** 应该使用 **集中式日志系统**（如 ELK Stack、Datadog），支持 **按会话 ID 查询** 完整的 Agent 行为轨迹。`,
      tip: '为每个 Agent 会话生成唯一的 traceId，贯穿所有日志条目。这样你可以查询一个 traceId 看到 Agent 从接收请求到返回结果的完整行为链。',
      warning: '不要在日志中记录敏感信息（API Key、用户隐私数据）。LLM 的 Prompt 可能包含用户的个人信息，日志记录前应该进行脱敏处理。',
    },
    {
      title: '十三、Factor 12：管理进程作为一次性任务（Admin Processes）',
      content: `**管理任务** 应该作为 **一次性进程** 运行，而非在 **应用进程中** 执行。

**Agent 常见的管理任务**：

**任务一：Prompt 优化**。分析 LLM 交互日志，找出 **低质量输出** 的 Prompt，进行优化：
\`\`\`bash
# 一次性运行
node scripts/analyze-prompts.mjs --from 2026-05-01 --to 2026-05-12
\`\`\`

**任务二：工具性能分析**。统计每个工具的 **调用频率**、**成功率** 和 **平均延迟**：
\`\`\`typescript
// analyze-tool-performance.mjs
const logs = await db.query(\`
  SELECT tool_name,
         COUNT(*) as calls,
         AVG(CASE WHEN success THEN 1 ELSE 0 END) as success_rate,
         AVG(latency_ms) as avg_latency
  FROM tool_call_logs
  WHERE timestamp > ?
  GROUP BY tool_name
\`, [sevenDaysAgo]);
\`\`\`

**任务三：会话清理**。清理 **过期会话** 和 **无效数据**：
\`\`\`bash
# 每天运行一次
node scripts/cleanup-sessions.mjs --ttl 30d
\`\`\`

**任务四：成本分析**。统计 **LLM 调用成本**，按 Agent、按用户、按时间段分析：
\`\`\`typescript
interface CostReport {
  totalCost: number;
  byAgent: Record<string, number>;
  byUser: Record<string, number>;
  byModel: Record<string, number>;
  topExpensiveSessions: Array<{
    sessionId: string;
    cost: number;
    reason: string;
  }>;
}
\`\`\`

**这些管理任务** 应该：
- **独立于应用进程** 运行
- **使用相同的配置**（环境变量、数据库连接）
- **有明确的开始和结束**（不应该是长期运行的守护进程）
- **有输出报告**（而非静默执行）

**调度方式** 推荐使用 **cron 表达式** 或 **事件触发**：
\`\`\`bash
# crontab
0 2 * * * node scripts/cleanup-sessions.mjs --ttl 30d
0 6 * * 1 node scripts/cost-report.mjs --format markdown --output reports/weekly-cost.md
\`\`\``,
      tip: '将管理任务打包为独立的 npm script（如 npm run analyze、npm run cleanup），这样团队成员可以手动运行，CI/CD 也可以自动调度。',
      warning: '不要在 Agent 应用进程中运行管理任务。这些任务通常消耗大量资源（如分析数天的日志数据），会影响 Agent 的正常服务。始终作为独立进程运行。',
    },
    {
      title: '十四、实战：12-Factor Agents 检查清单',
      content: `在开始一个新的 AI Agent 项目时，使用以下检查清单确保 **12 条原则** 都被遵循：

**启动阶段检查清单**：

| # | 原则 | 检查项 | 状态 |
|---|------|--------|------|
| 1 | 单一代码库 | 所有代码、Prompt、工具定义在同一仓库 | □ |
| 2 | 显式声明依赖 | package.json + 模型版本锁定 + API 版本声明 | □ |
| 3 | 配置分离 | 环境变量注入 + 运行时配置 + Prompt 参数化 | □ |
| 4 | 后端服务绑定 | LLM 抽象层 + 连接池 + 可替换实现 | □ |
| 5 | 构建/发布/运行 | Docker 多阶段构建 + 不可变发布 | □ |
| 6 | 无状态进程 | 状态外置数据库 + 上下文重建策略 | □ |
| 7 | 端口绑定 | PORT 环境变量 + 健康检查端点 | □ |
| 8 | 并发模型 | 并发限制器 + 背压机制 + 超时控制 | □ |
| 9 | 可快速启停 | 延迟初始化 + SIGTERM 处理 + AbortController | □ |
| 10 | 环境等价 | 开发/测试/生产配置矩阵 + CI smoke test | □ |
| 11 | 日志事件流 | 结构化 JSON + traceId + 三类日志（LLM/工具/决策） | □ |
| 12 | 管理进程 | 独立一次性脚本 + cron 调度 + 输出报告 | □ |

**代码审查检查清单**：

- [ ] 代码中是否有硬编码的 API Key？
- [ ] 模型版本是否精确到具体日期？
- [ ] Prompt 模板是否与代码一起版本化？
- [ ] 状态是否存储在外部数据库而非进程内存？
- [ ] 是否有健康检查端点？
- [ ] 工具调用是否有超时和重试机制？
- [ ] 日志是否包含敏感信息？
- [ ] 是否有 SIGTERM 处理函数？
- [ ] 管理任务是否独立于应用进程？

**持续改进检查清单**（每月执行一次）：

- [ ] 审查 LLM 交互日志，优化低质量 Prompt
- [ ] 分析工具调用性能，替换慢速工具
- [ ] 检查成本报告，优化 token 使用
- [ ] 更新模型版本（评估新模型的效果提升）
- [ ] 审查安全策略（API Key 轮换、权限最小化）`,
      tip: '将检查清单集成到 CI/CD 管道中，作为 PR 审查的自动检查项。例如，代码扫描工具可以检测硬编码的 API Key、不精确的模型版本标识等问题。',
      warning: '检查清单不是一次性的。随着 Agent 系统的演进，检查清单也应该更新。建议每月回顾一次，根据实际情况增减检查项。',
    },
    {
      title: '十五、扩展阅读',
      content: `**12-Factor App 原始文档**：[12factor.net](https://12factor.net/) — Heroku 团队提出的原始 12 条原则，是理解本文的基础。

**12-Factor Agents 社区**：[humanlayer/12-factor-agents](https://github.com/humanlayer/12-factor-agents)（19,754 星）— 将 12-Factor 原则适配到 AI Agent 领域的开源项目。

**AI Agent 框架对比**：
- **Mastra AI**（23,784 星）：Gatsby 团队打造的企业级 Agent 框架，内置 12-Factor 原则支持
- **ElizaOS**（18,346 星）：面向所有人的自主 Agent 框架，强调可访问性
- **LangGraph**：LangChain 生态的 Agent 编排层，适合复杂工作流

**相关知识库文章**：
- [aieng-001] 模型训练基础设施
- [aieng-008] AI 系统架构设计
- [agent-001] AI Agent 入门：从概念到实现
- [agent-002] Multi-Agent 系统设计与协作

**推荐阅读顺序**：
1. 先阅读 12-Factor App 原始文档，理解核心思想
2. 再阅读 [agent-001] 了解 Agent 基本概念
3. 最后阅读本文，将 12-Factor 原则应用到 Agent 场景`,
      tip: '推荐阅读 12-Factor Agents 社区仓库的源码，了解他们如何将每条原则转化为具体的代码实践。理论 + 源码结合是最高效的学习方式。',
      warning: '不要试图一次性将所有 12 条原则应用到新项目中。建议从最关键的 5 条开始（配置分离、无状态进程、日志事件流、显式依赖、可快速启停），逐步完善。',
    },
  ],
};
