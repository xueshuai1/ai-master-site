import { Article } from '../knowledge';

export const article: Article = {
    id: "agent-010",
    title: "AI 编程 Agent：从辅助到自主编码",
    category: "agent",
    tags: ["AI 编程", "Claude Code", "Cursor", "Devin", "自主编码", "AI 软件开发"],
    summary: "AI 编程 Agent 的演进路径——从代码补全到自主完成复杂开发任务，掌握主流工具与实战技巧",
    date: "2026-04-13",
    readTime: "22 min",
    level: "进阶",
    content: [
        {
            title: "1. AI 编程的四个进化阶段",
            body: `AI 辅助编程的发展经历了四个清晰的阶段，每一阶段都代表了 AI 在软件开发中参与度的质的飞跃。

第一阶段：代码补全（2022-2023）。以 GitHub Copilot 为代表的代码补全工具，能够在开发者输入时预测下一行或下一个代码块。这个阶段的 AI 是被动的——它只在开发者请求时提供建议，没有自主理解项目上下文的能力，也无法执行多步操作。

第二阶段：对话式辅助（2023-2024）。ChatGPT Code Interpreter 和 Cursor 的 Chat 模式让开发者可以用自然语言描述需求，AI 生成完整代码片段。AI 开始理解项目级别的上下文（多个文件），但仍然需要人类手动复制粘贴、测试和调试。

第三阶段：集成式编程助手（2024-2025）。Claude Code、Cursor Agent 和 Devin 等工具将 AI 直接集成到开发工作流中。AI 不仅可以生成代码，还能读取项目文件、运行终端命令、执行测试、修复错误。开发者从"写代码的人"变成了"审查代码的人"——AI 负责生成和迭代，人类负责指导和审批。

第四阶段：自主编程 Agent（2025-2026）。这是 2026 年的前沿。AI Agent 可以接收一个高层次的任务描述（"重构这个 API 模块，添加分页和错误处理"），然后自主完成：理解代码库 → 制定计划 → 逐步实现 → 运行测试 → 修复错误 → 提交 PR。人类只需要在关键决策点介入。

2026 年的一个显著趋势是 "Vibe Coding"的兴起和反思。Vibe Coding 指的是用纯自然语言描述需求，让 AI 完成全部编码工作。这种方式在快速原型和小型项目中效果惊人，但在复杂项目中暴露了代码质量、可维护性和安全性问题。2026 年的最佳实践是：AI 生成代码，人类审查架构——而不是完全放手。`,
            code: [
                {
                    lang: "text",
                    code: `AI 编程能力进化路径

2022 ──── 代码补全 ──── 2023 ──── 对话辅助 ──── 2024 ──── 集成助手 ──── 2025 ──── 自主 Agent ──── 2026+
          (Copilot)         (ChatGPT)        (Cursor)         (Claude Code)      (多 Agent 协作)

人类参与度: ████████████████████ ────────────────────────────→ ░░░░░░░░░░░░░░░░░░
                100%                                                     10%
AI 自主度:    ░░░░░░░░░░░░░░░░░░ ────────────────────────────→ ████████████████████
                0%                                                      90%

典型任务:
  代码补全  →  单行/单函数补全
  对话辅助  →  "写一个排序函数" → 生成代码片段
  集成助手  →  "添加用户认证" → 读取文件 → 修改代码 → 运行测试
  自主 Agent →  "重构 API 模块" → 理解代码库 → 制定计划 → 实现 → 测试 → 修复 → 提交
`
                }
            ],
            table: {
                headers: ["阶段", "代表工具", "AI 能力", "人类角色", "适用场景"],
                rows: [
                    ["代码补全", "GitHub Copilot", "行级预测", "写作者", "日常编码加速"],
                    ["对话辅助", "ChatGPT", "片段生成", "复制粘贴者", "算法/函数实现"],
                    ["集成助手", "Cursor, Claude Code", "多文件操作", "审查者", "功能开发"],
                    ["自主 Agent", "Claude Code + MCP", "端到端开发", "指导者", "模块级重构"],
                ]
            },
            mermaid: `graph LR
    A["需求描述"] --> B{"任务复杂度?"}
    B -->|"简单: 单函数"| C["代码补全/对话"]
    B -->|"中等: 多文件"| D["集成助手"]
    B -->|"复杂: 模块级"| E["自主 Agent"]
    C --> F["人类编写主体"]
    D --> G["人类审查修改"]
    E --> H["人类审批 PR"]
            `,
            tip: "2026 年最有效的模式不是'完全自主'，而是'人在回路'——AI 负责繁重的编码工作，人类在架构决策、代码审查和安全审核中保持控制权。",
        },
        {
            title: "2. Claude Code 深度解析",
            body: `Claude Code 是 Anthropic 在 2025 年推出的终端原生 AI 编程 Agent，代表了自主编程的最新实践。与传统的 IDE 插件不同，Claude Code 直接在终端中运行，拥有对项目文件的完整访问权、终端命令执行权和 Git 操作权。

Claude Code 的核心能力包括：文件读写——读取项目中的任意文件，创建和修改代码文件。终端执行——运行编译、测试、lint 等命令，查看输出结果。Git 操作——创建分支、提交代码、生成 PR 描述。上下文理解——通过读取代码库的关键文件（README、package.json、配置文件等），建立对项目结构和架构的理解。

Claude Code 的工作流程是自主循环的。你给出一个任务描述，它会：1) 先读取相关文件理解上下文；2) 制定实现计划；3) 逐步修改文件；4) 运行测试验证；5) 如果测试失败，分析错误原因并修复；6) 重复直到所有测试通过。这个循环可以持续数分钟到数十分钟，期间完全自主运行。

2026 年 Claude Code 的关键改进包括：MCP 集成——可以通过 MCP 协议连接外部工具（数据库、API、CI/CD），扩展编码能力。Sub-agents——可以将复杂任务拆分为子任务，分配给多个子 Agent 并行处理。Permission model——更细粒度的权限控制，允许人类审批敏感操作（如删除文件、修改配置）。

Claude Code 的局限性也很明显：它不理解业务的"为什么"（为什么要这样设计），可能做出技术上正确但业务上不合理的决策；在大型代码库（>100K 行）中上下文理解可能不完整；生成的代码质量取决于提示词的精确度。`,
            code: [
                {
                    lang: "text",
                    code: `# Claude Code 使用示例

# 基本用法：给一个任务描述
$ claude "为 UserAPI 添加分页功能，每页 20 条"

# Claude Code 会自主完成：
# 1. 读取 UserAPI 相关文件（routes/users.js, models/User.js）
# 2. 理解现有代码结构
# 3. 修改代码添加分页逻辑
# 4. 运行测试
# 5. 如果测试失败，分析错误并修复
# 6. 提交 commit

# 使用 /compact 压缩上下文（当对话过长时）
/compact

# 使用 /clear 清除对话历史
/clear

# 使用 /cost 查看当前会话的 token 消耗
/cost

# 权限模式（2026 新特性）
# 默认：自动模式（AI 自主操作）
# 安全模式：敏感操作需要人工确认
/permissions set sensitive=confirm

# 与 MCP Server 集成
# claude --mcp-config mcp-config.json "查询数据库并生成报告脚本"
`
                },
                {
                    lang: "text",
                    code: `# Claude Code 的 CLAUDE.md 文件
# 在项目根目录创建 CLAUDE.md，给 AI 提供项目级指令

# 示例 CLAUDE.md
---
# 项目: 电商后端 API
# 技术栈: Node.js + Express + PostgreSQL

## 代码规范
- 使用 TypeScript 严格模式
- 所有 API 端点必须有 Zod 验证
- 错误处理使用 AppError 类
- 测试覆盖率要求 > 80%

## 架构约定
- 路由文件放在 src/routes/
- 控制器放在 src/controllers/
- 服务层放在 src/services/
- 数据模型放在 src/models/

## 重要提醒
- 不要修改数据库迁移文件
- API 响应格式必须遵循 { success, data, error } 结构
- 所有外部调用必须有超时和重试逻辑
- 提交前运行: npm run lint && npm test
---
`
                }
            ],
            table: {
                headers: ["功能", "Claude Code", "Cursor Agent", "GitHub Copilot"],
                rows: [
                    ["终端执行", "✅ 原生支持", "❌ 需要插件", "❌"],
                    ["多文件编辑", "✅ 完整支持", "✅ 完整支持", "⚠️ 有限"],
                    ["Git 操作", "✅ 完整支持", "✅ 部分支持", "❌"],
                    ["自主循环", "✅ 测试-修复循环", "✅ Agent 模式", "❌"],
                    ["MCP 集成", "✅ 原生支持", "⚠️ 部分支持", "❌"],
                    ["子代理", "✅ 2026 新特性", "❌", "❌"],
                    ["IDE 集成", "⚠️ 终端为主", "✅ 原生 IDE", "✅ 原生 IDE"],
                    ["价格", "$200/月 (Pro)", "$20/月 (Pro)", "$19/月 (Business)"],
                ]
            },
            tip: "CLAUDE.md 是提升 Claude Code 效果的关键。花时间写一份清晰的项目指令文档，比每次在提示词中重复说明要高效得多。",
        },
        {
            title: "3. Cursor：IDE 原生的 AI 编程体验",
            body: `Cursor 是基于 VS Code 分叉的 AI 原生 IDE，在 2025-2026 年经历了爆发式增长。与 Claude Code 的终端模式不同，Cursor 将 AI 深度集成到 IDE 的每一个交互点——编辑器、终端、文件树、搜索面板，甚至 Git diff。

Cursor 的核心优势在于上下文感知的代码理解。它自动索引整个代码库，构建符号表（函数、类、变量的定义和使用关系），让 AI 在生成代码时能准确理解跨文件依赖。当你让 Cursor "修改用户认证逻辑"时，它不仅能找到 auth.ts 文件，还能识别所有引用认证函数的地方，并同步更新。

Cursor 的 Agent 模式（2025 年推出）是其最强大的功能。在 Agent 模式下，Cursor 可以自主执行多步操作：搜索文件 → 读取内容 → 编辑代码 → 运行终端命令 → 查看测试输出 → 修复错误。整个过程在 IDE 内完成，你可以实时看到 AI 的每一步操作，随时中断或修改方向。

2026 年 Cursor 的关键特性包括：Codebase Rules——在 .cursor/rules 中定义项目级规则（类似 CLAUDE.md 但支持多条规则，按文件路径匹配）；MCP 支持——集成外部工具和服务；Cursor Composer——多文件同时编辑，AI 可以并行修改多个相关文件；Background Agent——后台运行的 AI Agent，在你做其他事情时持续工作。

Cursor 与 Claude Code 的选择：如果你习惯终端工作流、需要深度的 Git 集成和自主循环，选 Claude Code。如果你更喜欢可视化 IDE、需要实时代码预览和交互式编辑，选 Cursor。实际上，很多开发者同时使用两者——Cursor 用于日常开发和探索，Claude Code 用于批量重构和自动化任务。`,
            code: [
                {
                    lang: "text",
                    code: `# Cursor 的 .cursor/rules 配置示例
# 比 CLAUDE.md 更灵活——支持按文件路径匹配不同规则

---
# 规则 1: API 端点规范
alwaysApply: false
globs: ["src/routes//*.ts", "src/controllers//*.ts"]
description: "API 路由和控制器必须遵循的规范"
---
所有 API 端点必须:
1. 使用 Zod 进行请求体验证
2. 返回统一格式: { success: boolean, data?: T, error?: string }
3. 包含 try-catch 错误处理
4. 使用 async/await（不使用 .then）
5. 添加 OpenAPI 注释（用于自动生成文档）

---
# 规则 2: 数据库模型规范
alwaysApply: false
globs: ["src/models/**/*.ts"]
description: "Prisma 模型定义规范"
---
所有 Prisma 模型必须:
1. 包含 createdAt 和 updatedAt 字段
2. 使用 @map 指定数据库列名（snake_case）
3. 添加 @@map 指定数据库表名（复数形式）
4. 所有字符串字段指定 @db.VarChar 长度限制

---
# 规则 3: 全局规范
alwaysApply: true
description: "所有代码都必须遵守的规则"
---
- 使用 TypeScript 严格模式
- 不使用 any 类型
- 所有导出函数必须有 JSDoc
- 错误消息使用中文（用户可见的错误）
- 日志使用英文（开发者日志）
`
                },
                {
                    lang: "text",
                    code: `# Cursor Agent 模式实战

# 场景：重构一个 Express 路由，添加错误处理和日志

# 1. 在 Cursor 中按 Cmd+K（或 Ctrl+K）打开 Agent 模式
# 2. 输入自然语言指令：
"重构 src/routes/orders.ts：
- 添加 try-catch 错误处理
- 每个端点添加请求日志（方法、路径、耗时）
- 使用 AppError 替代直接 throw Error
- 确保所有测试通过"

# 3. Cursor Agent 会：
#    - 读取 orders.ts 和相关文件
#    - 分析现有代码结构
#    - 逐步修改代码
#    - 在终端运行 npm test
#    - 如果失败，分析错误并修复
#    - 完成后展示 diff

# 4. 你可以：
#    - 在过程中随时查看和修改 AI 的更改
#    - 按 Accept 接受或按 Reject 拒绝
#    - 继续对话进一步调整

# 关键技巧：
# - 任务描述越具体，AI 执行越准确
# - 包含验收标准（"确保所有测试通过"）
# - 指出约束条件（"不要修改测试文件"）
`
                }
            ],
            mermaid: `graph TD
    A["开发者输入需求"] --> B["Cursor 索引代码库"]
    B --> C["AI 理解上下文"]
    C --> D["生成修改计划"]
    D --> E["逐步编辑文件"]
    E --> F["显示 Diff 预览"]
    F --> G{"人类审批"}
    G -->|"Accept"| H["应用更改"]
    G -->|"Reject"| I["撤销更改"]
    H --> J["运行测试"]
    J --> K{"测试通过?"}
    K -->|"是"| L["完成"]
    K -->|"否"| M["AI 分析错误并修复"]
    M --> E
            `,
            tip: "Cursor 的 Codebase Rules 比 CLAUDE.md 更强大——它支持按文件路径匹配不同规则。把项目规范拆分为多条针对性规则，效果远好于一条大而全的全局规则。",
        },
        {
            title: "4. 多 Agent 协作编程",
            body: `2026 年最前沿的 AI 编程模式不是单个 Agent 独立工作，而是多个 Agent 协作完成复杂任务。这种模式借鉴了人类软件开发团队的组织方式——有人负责架构设计，有人负责编码实现，有人负责代码审查。

架构师 Agent：负责理解需求、设计架构、制定技术方案。它读取项目文档、分析现有代码结构、输出技术设计文档。它不写具体代码，而是输出接口定义、模块划分、数据流图。

实现 Agent：根据架构师的设计，负责具体的编码实现。它可以同时启动多个实例，并行开发不同模块。每个实现 Agent 专注于一个子任务（如"实现用户认证模块"），独立完成编码、测试和文档。

审查 Agent：负责代码审查，检查代码质量、安全性、性能。它运行 lint、静态分析、安全扫描工具，输出审查报告。它可以自动修复简单问题（格式、命名），标记需要人工审查的问题（架构、业务逻辑）。

这种多 Agent 协作模式的优势在于分工和并行。一个复杂的重构任务（如"将单体应用拆分为微服务"），单 Agent 可能需要数小时，而多 Agent 并行可以将时间缩短到分钟级。

2026 年的多 Agent 编程框架包括：Claude Code 的 Sub-agents（原生支持任务拆分和并行执行）、Codium Agent（专注于测试驱动的多 Agent 开发）、Devika（开源的多 Agent 编程平台）。这些框架的核心挑战是 Agent 之间的协调——如何确保不同 Agent 生成的代码风格一致、接口匹配、没有冲突。`,
            code: [
                {
                    lang: "typescript",
                    code: `// 多 Agent 协作编程框架（简化概念示例）
interface Agent {
  role: "architect" | "implementer" | "reviewer";
  model: string;
  execute: (task: Task) => Promise<Result>;
}

interface Task {
  id: string;
  description: string;
  dependencies?: string[];
  assignedTo?: string;
  status: "pending" | "in_progress" | "completed" | "blocked";
}

interface Result {
  taskId: string;
  output: string;
  artifacts: string[]; // 生成的文件路径
  success: boolean;
  reviewNotes?: string;
}

class MultiAgentDevTeam {
  private agents: Agent[];
  private tasks: Task[];
  private results: Map<string, Result> = new Map();

  constructor(agents: Agent[]) {
    this.agents = agents;
    this.tasks = [];
  }

  // 架构师 Agent 分析需求并拆分任务
  async plan(architect: Agent, requirement: string): Promise<Task[]> {
    const plan = await architect.execute({
      id: "plan",
      description: \`分析需求并拆分任务: \${requirement}\`,
      status: "pending",
    });

    // 解析架构师输出的任务列表
    this.tasks = this.parsePlan(plan.output);
    return this.tasks;
  }

  // 并行分配任务给实现 Agent
  async executeParallel(): Promise<Result[]> {
    const readyTasks = this.tasks.filter(
      (t) =>
        t.status === "pending" &&
        (t.dependencies?.every((dep) =>
          this.results.get(dep)?.success
        ) ?? true)
    );

    const implementers = this.agents.filter(
      (a) => a.role === "implementer"
    );

    // 并行执行
    const promises = readyTasks.map((task, i) => {
      const agent = implementers[i % implementers.length];
      task.status = "in_progress";
      task.assignedTo = agent.model;
      return agent.execute(task).then((result) => {
        this.results.set(task.id, result);
        task.status = result.success ? "completed" : "blocked";
        return result;
      });
    });

    return Promise.all(promises);
  }

  // 审查 Agent 审查所有生成代码
  async reviewAll(): Promise<Result[]> {
    const reviewers = this.agents.filter((a) => a.role === "reviewer");
    const completedResults = Array.from(this.results.values()).filter(
      (r) => r.success
    );

    const reviewPromises = completedResults.map((result, i) => {
      const reviewer = reviewers[i % reviewers.length];
      return reviewer.execute({
        id: \`review-\${result.taskId}\`,
        description: \`审查代码: \${result.artifacts.join(", ")}\`,
        status: "pending",
      });
    });

    return Promise.all(reviewPromises);
  }
}
`
                },
                {
                    lang: "text",
                    code: `# 多 Agent 协作实战场景：重构用户模块

# 输入需求
"重构用户模块：
1. 添加角色权限系统（admin, editor, viewer）
2. 将密码加密从 bcrypt 改为 argon2
3. 添加用户审计日志
4. 确保向后兼容现有 API"

# 架构师 Agent 输出：
# ┌─────────────────────────────────────────┐
# │ 技术设计方案                             │
# │                                         │
# │ 1. 新增 Role 枚举和 User.role 字段       │
# │ 2. 替换 @bcrypt 为 @argon2              │
# │ 3. 新增 AuditLog 模型和中间件            │
# │ 4. API 兼容层：保留旧字段，标记 @deprecated │
# │                                         │
# │ 任务拆分：                               │
# │   Task A: 数据库迁移 (Role, AuditLog)    │
# │   Task B: 密码加密替换                   │
# │   Task C: 权限中间件实现                 │
# │   Task D: API 兼容层                    │
# │   Task E: 测试更新                       │
# └─────────────────────────────────────────┘

# 并行执行（4 个实现 Agent）：
# Agent 1 → Task A (10 min)
# Agent 2 → Task B (8 min)
# Agent 3 → Task C (12 min)
# Agent 4 → Task D (6 min)
#         → Task E (等 A-D 完成后, 15 min)

# 总时间：~25 分钟（vs 单 Agent ~50 分钟）

# 审查 Agent 输出：
# ✅ Task A: 迁移正确，添加了回滚脚本
# ✅ Task B: argon2 配置合理（memoryCost: 19456）
# ⚠️ Task C: 权限检查缺少缓存，建议添加
# ✅ Task D: 兼容层完整，deprecated 标记正确
# ✅ Task E: 测试覆盖率 92%，通过
`
                }
            ],
            table: {
                headers: ["模式", "优势", "挑战", "适用场景"],
                rows: [
                    ["单 Agent 串行", "简单、一致性好", "慢、上下文窗口有限", "小任务、快速原型"],
                    ["多 Agent 并行", "快、可分工", "协调复杂、可能冲突", "中等重构、多模块开发"],
                    ["架构师+实现", "设计质量高", "需要好的架构师提示", "复杂系统、大型重构"],
                    ["实现+审查", "代码质量保障", "审查可能误报", "生产级代码、安全敏感"],
                ]
            },
            tip: "多 Agent 协作的关键是任务拆分的粒度。任务太粗（一个 Agent 做太多）失去并行优势，任务太细（一个 Agent 做太少）协调成本超过收益。经验法则是每个任务对应一个独立文件或模块。",
        },
        {
            title: "5. AI 编程的质量保障与测试",
            body: `AI 生成的代码最大的风险不是"不能运行"，而是"看起来能运行但实际上有 bug"。AI 模型擅长生成语法正确、逻辑看似合理的代码，但可能遗漏边界条件、引入安全漏洞或做出不合理的架构决策。

2026 年 AI 编程的质量保障体系包含四个层次。静态分析层：使用 ESLint、TypeScript 编译器、SonarQube 等工具检查代码质量问题。AI 生成的代码通常能通过语法检查，但可能违反项目规范。测试层：单元测试、集成测试和端到端测试是验证 AI 代码正确性的最可靠手段。让 AI 自己写测试也是一个有效策略——先让 AI 写测试（测试驱动开发），再让它实现功能。代码审查层：人工审查仍然是不可替代的。开发者需要理解 AI 生成的代码做了什么、为什么这样做、是否有更好的方案。安全扫描层：使用 SAST（静态应用安全测试）工具检查 AI 代码中的安全漏洞，如 SQL 注入、XSS、硬编码密钥等。

一个被证明有效的模式是 AI 驱动测试先行（AI-driven TDD）：1) 人类描述需求；2) AI 生成测试用例（包括正常路径和边界条件）；3) 人类审查测试用例是否完整；4) AI 实现功能使测试通过；5) AI 运行测试并迭代直到全部通过。这个模式将人类的质量保证前置到测试设计阶段，而不是事后审查代码。

另一个重要实践是代码解释——要求 AI 在生成代码后，用自然语言解释每段代码的作用、为什么选择这个方案、有什么潜在风险。这不仅帮助人类审查，也让 AI 自己"反思"生成质量。`,
            code: [
                {
                    lang: "typescript",
                    code: `// AI 驱动测试先行（AI-driven TDD）工作流

// 步骤 1: 人类描述需求
const requirement = \`
实现一个用户注册验证函数：
- 用户名：3-20 个字符，只允许字母数字和下划线
- 邮箱：有效邮箱格式
- 密码：至少 8 个字符，包含大小写字母和数字
- 返回验证结果和错误信息列表
\`;

// 步骤 2: AI 生成测试用例
const generatedTests = \`
describe("validateRegistration", () => {
  // 正常路径
  it("should accept valid input", () => {
    const result = validateRegistration({
      username: "user_123",
      email: "user@example.com",
      password: "SecurePass1"
    });
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  // 边界条件
  it("should reject username too short", () => {
    const result = validateRegistration({
      username: "ab",
      email: "user@example.com",
      password: "SecurePass1"
    });
    expect(result.valid).toBe(false);
    expect(result.errors).toContain("用户名至少需要 3 个字符");
  });

  it("should reject username with special chars", () => {
    const result = validateRegistration({
      username: "user@name!",
      email: "user@example.com",
      password: "SecurePass1"
    });
    expect(result.valid).toBe(false);
  });

  it("should reject invalid email", () => {
    const result = validateRegistration({
      username: "valid_user",
      email: "not-an-email",
      password: "SecurePass1"
    });
    expect(result.valid).toBe(false);
  });

  it("should reject weak password (no uppercase)", () => {
    const result = validateRegistration({
      username: "valid_user",
      email: "user@example.com",
      password: "weakpass1"
    });
    expect(result.valid).toBe(false);
  });

  it("should reject weak password (too short)", () => {
    const result = validateRegistration({
      username: "valid_user",
      email: "user@example.com",
      password: "Ab1"
    });
    expect(result.valid).toBe(false);
  });

  it("should reject missing fields", () => {
    const result = validateRegistration({
      username: "",
      email: "",
      password: ""
    });
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });
});
\`;

// 步骤 3: 人类审查测试用例
// - 是否覆盖了所有需求？
// - 是否有遗漏的边界条件？（例如：用户名已存在？）
// - 错误消息是否清晰？

// 步骤 4: AI 实现功能
const implementation = \`
interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export function validateRegistration(input: {
  username: string;
  email: string;
  password: string;
}): ValidationResult {
  const errors: string[] = [];

  if (!input.username || input.username.length < 3) {
    errors.push("用户名至少需要 3 个字符");
  }
  if (!/^[a-zA-Z0-9_]{3,20}$/.test(input.username)) {
    errors.push("用户名只能包含字母、数字和下划线");
  }
  if (!/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(input.email)) {
    errors.push("请输入有效的邮箱地址");
  }
  if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).{8,}/.test(input.password)) {
    errors.push("密码需要至少 8 个字符，包含大小写字母和数字");
  }

  return { valid: errors.length === 0, errors };
}
\`;

// 步骤 5: AI 运行测试，迭代修复直到全部通过
`
                },
                {
                    lang: "text",
                    code: `# AI 代码审查清单（人工审查时检查这些项）

## 功能性
- [ ] 代码是否满足需求描述？
- [ ] 是否处理了所有边界条件？
- [ ] 错误处理是否完整？

## 安全性
- [ ] 是否有 SQL 注入风险？（参数化查询）
- [ ] 是否有 XSS 风险？（输出转义）
- [ ] 是否有硬编码密钥/密码？
- [ ] 权限检查是否正确？

## 性能
- [ ] 是否有 N+1 查询问题？
- [ ] 是否有不必要的循环或递归？
- [ ] 大数据量场景是否考虑？

## 可维护性
- [ ] 代码结构是否清晰？
- [ ] 命名是否有意义？
- [ ] 是否有足够的注释/文档？
- [ ] 是否遵循项目代码规范？

## AI 特有风险
- [ ] AI 是否"发明"了不存在的 API？（幻觉）
- [ ] 依赖库是否真实存在？（AI 可能编造包名）
- [ ] 代码是否过度复杂？（AI 倾向过度设计）
- [ ] 是否有不必要的抽象层？
`
                }
            ],
            table: {
                headers: ["质量保障层", "工具", "检测能力", "AI 适用性"],
                rows: [
                    ["静态分析", "ESLint, TypeScript, SonarQube", "语法、规范、复杂度", "高（自动运行）"],
                    ["单元测试", "Jest, Vitest, Pytest", "功能正确性", "高（AI 可自写测试）"],
                    ["集成测试", "Supertest, Testcontainers", "组件交互", "中（需要环境配置）"],
                    ["代码审查", "人工 + AI Reviewer", "架构、业务逻辑", "中（AI 辅助）"],
                    ["安全扫描", "Semgrep, Snyk, CodeQL", "安全漏洞", "高（自动运行）"],
                ]
            },
            tip: "AI 驱动 TDD 是最有效的质量保障模式：让 AI 先写测试，再实现功能。测试用例由人类审查，确保完整性；功能实现由 AI 完成，确保测试通过。",
        },
        {
            title: "6. AI 编程的最佳实践与反模式",
            body: `经过两年的实践，AI 编程社区已经总结出了一系列最佳实践和需要避免的反模式。这些经验教训能帮你避免常见的坑，最大化 AI 编程的效率。

最佳实践一：从小任务开始。不要一开始就让 AI 重构整个系统。从单一文件、单一函数开始，观察 AI 的编码风格和决策模式，逐步增加任务复杂度。最佳实践二：提供充分上下文。AI 不知道你的项目约定、业务规则和历史决策。用 CLAUDE.md 或 .cursor/rules 提供项目级上下文，在任务描述中包含相关文件的引用。最佳实践三：审查每一行代码。即使 AI 生成的代码看起来完美，也要仔细阅读。AI 会引入微妙的 bug——比如使用了错误的比较运算符（== vs ===），或者遗漏了错误处理。最佳实践四：使用版本控制。每次 AI 的大规模修改都应该在独立分支上进行，方便回滚和代码审查。

反模式一：盲目接受。不审查直接合并 AI 生成的代码——这是引入 bug 和安全漏洞的最快路径。反模式二：过度依赖。完全让 AI 决定架构和设计——AI 不理解你的业务上下文、团队能力和技术债务。反模式三：忽略测试。跳过测试直接部署 AI 代码——"看起来能运行"不等于"真的能运行"。反模式四：不记录 AI 决策。不记录 AI 做了什么决策、为什么——当 bug 出现时，你无法追溯是人类的决策还是 AI 的错误。

2026 年的一个重要趋势是AI 代码的供应链管理。随着 AI 生成的代码在代码库中的比例不断增加（有些项目已经超过 50%），如何追踪哪些代码是人类写的、哪些是 AI 生成的、AI 生成了哪些依赖——这些问题正在成为软件工程的新课题。一些工具已经开始支持在 Git commit 中记录 AI 生成信息，方便审计和追溯。`,
            code: [
                {
                    lang: "text",
                    code: `# AI 编程实战工作流

## 1. 任务准备（5 分钟）
$ git checkout -b feature/add-pagination
$ cat << 'EOF' > task-description.md
# 任务: 为 UserAPI 添加分页
## 背景: 用户列表接口返回所有数据，数据量大时性能差
## 需求:
- 支持 page 和 page_size 参数
- 默认 page_size=20, 最大 100
- 返回总记录数 (total) 和总页数 (total_pages)
- 向后兼容：不传参数时行为不变
- 更新相关测试
## 相关文件:
- src/routes/users.ts (主路由)
- src/services/userService.ts (业务逻辑)
- src/__tests__/users.test.ts (测试)
EOF

## 2. AI 执行（5-15 分钟）
$ claude "$(cat task-description.md)"
# AI 自主读取文件 → 修改代码 → 运行测试 → 修复

## 3. 人类审查（5 分钟）
$ git diff
# 仔细检查每一处修改
$ npm test
# 确认所有测试通过
$ npm run lint
# 确认代码规范

## 4. 提交
$ git add -A
$ git commit -m "feat: 添加用户列表分页支持

AI 生成: Claude Code
Reviewed-by: 薛帅"
$ git push origin feature/add-pagination

## 5. PR 审查
# 在 PR 中记录 AI 决策和人工审查结论
`
                },
                {
                    lang: "text",
                    code: `# AI 代码 Git 元数据记录方案

# 方案 1: 在 commit message 中标记
git commit -m "feat(auth): 添加 JWT 刷新机制

AI-generated: Claude Code (claude-sonnet-4-20250514)
Context: 需求描述见 task-auth-refresh.md
Reviewed: Yes - 薛帅
Changes: 
  - 新增 token refresh 端点
  - 修改 auth middleware 支持 token 过期检测
  - 更新 3 个测试用例"

# 方案 2: 使用 Git trailers
git commit -m "feat: 添加用户分页

AI-generated-by: Claude Code
AI-model: claude-sonnet-4-20250514
AI-prompt-hash: sha256:abc123...
Reviewed-by: 薛帅 <xueshuai@example.com>
Tested-by: CI/CD Pipeline"

# 方案 3: 使用自定义 Git hook 自动记录
# .git/hooks/commit-msg
#!/bin/bash
# 自动在 commit message 中追加 AI 信息
if [ -f ".ai-session.json" ]; then
    echo "" >> $1
    echo "AI-generated: $(cat .ai-session.json | jq -r '.tool')" >> $1
    echo "AI-model: $(cat .ai-session.json | jq -r '.model')" >> $1
    echo "AI-tokens: $(cat .ai-session.json | jq -r '.tokens_used')" >> $1
fi
`
                }
            ],
            table: {
                headers: ["实践", "描述", "效果", "实施难度"],
                rows: [
                    ["任务描述模板", "结构化描述需求、背景、相关文件", "显著提升 AI 输出质量", "低"],
                    ["CLAUDE.md / Rules", "项目级指令文档", "一致性大幅提升", "中"],
                    ["AI 驱动 TDD", "先写测试再实现", "代码质量最可靠", "中"],
                    ["分支隔离", "AI 修改在独立分支", "安全回滚", "低"],
                    ["AI 元数据记录", "Commit 中记录 AI 信息", "可追溯、可审计", "低"],
                ]
            },
            mermaid: `graph TD
    A["任务描述"] --> B["AI 生成代码"]
    B --> C["静态分析"]
    C -->|"通过"| D["测试运行"]
    C -->|"失败"| B
    D -->|"通过"| E["人工审查"]
    D -->|"失败"| F["AI 修复"]
    F --> D
    E -->|"通过"| G["合并"]
    E -->|"修改"| B
            `,
            tip: "AI 编程的核心原则：AI 是副驾驶，你是机长。你可以让它操作，但你知道最终责任在你。永远审查、永远测试、永远理解你合并的每一行代码。",
        },
        {
            title: "7. 2026 年 AI 编程的未来展望",
            body: `站在 2026 年，AI 编程已经从"未来已来"变成了"每天都在用"。但这个领域的发展远未到达顶点。以下几个方向代表了 AI 编程的下一个进化阶段。

方向一：代码库理解超越人类。当前 AI 对代码库的理解还停留在表层——它能读取文件、识别函数调用关系，但缺乏对项目历史决策、业务约束和团队约定的深层理解。下一代 AI 编程 Agent 将能阅读 Git 历史（理解为什么代码被这样写）、分析 Issue 和 PR 讨论（理解设计决策的背景）、甚至参与团队会议（理解业务需求的变化）。这将使 AI 从"代码生成器"进化为"项目成员"。

方向二：跨模态编程。未来的编程不只是写代码。AI Agent 将能理解设计稿（Figma → 代码）、数据库 schema（ER 图 → 模型）、API 文档（OpenAPI → 客户端/服务端代码）、甚至用户反馈（用户抱怨 → Bug 修复）。编程的输入将不仅仅是文本，而是多种模态的信息。

方向三：自我进化的代码库。AI Agent 不仅能生成代码，还能持续改进已有代码。它可以定期运行代码质量分析，自动重构过时代码，更新依赖版本，修复安全漏洞——就像一个永不休息的高级工程师。这种持续改进模式将大幅减少技术债务的积累。

方向四：编程范式的根本变革。当 AI 能生成高质量代码时，"编程"本身可能从"写代码"变为"描述意图"。这不是自然语言编程的简单重复——而是更精确的规范语言，类似于形式化方法但更易用。开发者将专注于"做什么"和"为什么"，AI 负责"怎么做"。

无论 AI 如何进化，有一个原则不会变：好软件的核心是对问题的深刻理解。AI 可以写代码，但它不能替你理解用户需要什么、业务怎么运作、技术决策的权衡是什么。AI 编程的未来不是取代开发者，而是让开发者专注于真正重要的事——理解问题、设计解决方案、创造价值。`,
            code: [
                {
                    lang: "text",
                    code: `# 2026-2030 AI 编程发展路线图

2026 ████████████░░░░░░░░░░░░░░░░░░░░░░░░░░ 35%
├── AI 编程助手普及（>50% 开发者使用）
├── 多 Agent 协作成为主流
├── MCP 协议标准化
└── AI 代码审查工具成熟

2027 ████████████████████░░░░░░░░░░░░░░░░░░ 55%
├── AI 理解项目历史和业务上下文
├── 跨模态编程（设计稿 → 代码）
├── 自主代码改进（技术债务管理）
└── AI 编程教育普及（从 CS 课程开始）

2028 ██████████████████████████░░░░░░░░░░░░ 70%
├── 规范驱动的编程（意图 → 代码）
├── AI 原生开发框架
├── 代码自动生成率 >70%
└── 开发者角色从"写代码"转为"定义问题"

2029-2030 ████████████████████████████████████ 90%
├── 全自主软件开发流水线
├── AI 与人类开发者的无缝协作
├── 软件工程教育根本性变革
└── 编程成为一种"元技能"而非职业技能
`
                },
                {
                    lang: "text",
                    code: `# 开发者如何应对 AI 编程时代

## 立即行动（2026）
✅ 掌握 AI 编程工具（Claude Code, Cursor）
✅ 学习 Prompt Engineering for Code
✅ 建立 AI 代码审查流程
✅ 投资自动化测试基础设施

## 中期规划（2027）
📋 学习 MCP 协议和 Agent 开发
📋 培养系统架构能力（AI 擅长编码，你擅长设计）
📋 深入理解业务领域（AI 不懂你的行业）
📋 建立 AI 编程最佳实践文档

## 长期准备（2028+）
🎯 从"代码作者"转型为"问题定义者"
🎯 培养跨领域能力（技术 + 业务 + 用户）
🎯 关注软件伦理和责任（AI 生成代码的责任归属）
🎯 持续学习——工具会变，但解决问题的能力不变

## 永远不会过时的技能
⭐ 问题分析和分解能力
⭐ 系统思维和架构设计
⭐ 沟通和协作能力
⭐ 对用户体验的敏感度
⭐ 对质量和安全的执着
`
                }
            ],
            table: {
                headers: ["技能", "AI 替代性", "2026 重要性", "2030 重要性"],
                rows: [
                    ["写代码", "高", "⭐⭐", "⭐"],
                    ["代码审查", "中高", "⭐⭐⭐", "⭐⭐"],
                    ["架构设计", "中", "⭐⭐⭐⭐⭐", "⭐⭐⭐⭐⭐"],
                    ["需求分析", "低", "⭐⭐⭐⭐⭐", "⭐⭐⭐⭐⭐"],
                    ["系统设计", "中低", "⭐⭐⭐⭐⭐", "⭐⭐⭐⭐⭐"],
                    ["调试和问题定位", "中", "⭐⭐⭐⭐", "⭐⭐⭐"],
                    ["测试设计", "中", "⭐⭐⭐⭐", "⭐⭐⭐"],
                    ["团队协作", "极低", "⭐⭐⭐⭐⭐", "⭐⭐⭐⭐⭐"],
                ]
            },
            mermaid: `graph TD
    A["AI 编程时代"] --> B{"你选择成为?"}
    B -->|"代码工人"| C["❌ 被 AI 替代"]
    B -->|"AI 操作员"| D["⚠️ 短期安全"]
    B -->|"问题定义者"| E["✅ 长期价值"]
    B -->|"架构设计师"| E
    B -->|"领域专家"| E
    E --> F["AI 是你的超级工具"]
    D --> G["工具在进化"]
    C --> H["市场在缩小"]
            `,
            tip: "2026 年学习 AI 编程的最佳方式不是读教程，而是直接用。选一个你正在做的项目，让 AI 帮你完成一个功能，然后仔细审查它生成的每一行代码。你会在 1 小时中学到比 1 周教程更多的东西。",
            warning: "AI 编程的最大风险不是 AI 太强，而是人类太懒。不审查、不测试、不理解就合并 AI 代码——这是技术债务最快的积累方式。记住：你对你代码库中的每一行代码负责，不管它是谁（或什么）写的。",
        },
    ],
};
