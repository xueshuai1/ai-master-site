import { Article } from '../knowledge';

export const article: Article = {
    id: "agent-009",
    title: "MCP 协议：AI Agent 的工具集成标准",
    category: "agent",
    tags: ["MCP", "Model Context Protocol", "AI 工具集成", "Agent 协议", "Linux Foundation"],
    summary: "深入理解 Model Context Protocol（MCP）——2026 年 AI Agent 工具集成的事实标准，从协议原理到生产实战",
    date: "2026-04-13",
    readTime: "24 min",
    level: "进阶",
    content: [
        {
            title: "1. 为什么需要 MCP：AI 工具集成的痛点",
            body: `在 MCP 出现之前，每个 AI Agent 与外部工具的集成都是一次性定制开发。如果你想让 Claude 访问你的数据库、让 GPT-4 调用你的内部 API、让 Gemini 读取你的文件系统——你需要为每一对（模型, 工具）编写独立的适配代码。当支持 N 个模型和 M 个工具时，集成工作量是 O(N×M) 的二次增长。

2024 年 11 月，Anthropic 提出了 Model Context Protocol（MCP），灵感来源于 USB-C 接口的设计理念：一个标准化接口，让任何设备（工具）可以连接到任何主机（AI 模型），无需定制适配。2025 年 12 月，MCP 被捐赠给 Linux Foundation 的 Agentic AI Foundation，标志着它从 Anthropic 的专有协议升级为行业开放标准。

到 2026 年初，MCP 已经被所有主流 AI 平台采纳：OpenAI 在 Responses API 中支持远程 MCP 服务器，Google 将 MCP 集成到 Gemini 和 Google Workspace 生态，Microsoft 在 Windows Agentic 框架中原生支持 MCP，Amazon 在 Q Developer 中使用 MCP 连接 AWS 服务。据 IBM 研究，使用标准化协议的 AI 组织比自定义集成的组织减少了 60-70% 的集成时间。

MCP 解决的核心问题是：上下文交换的标准化。AI 模型需要外部数据（文件、数据库、API）才能做出准确决策，但每个数据源的格式、认证方式、查询语言都不同。MCP 定义了一个统一的 JSON-RPC 协议层，将工具的能力（tools）、可用资源（resources）和交互提示（prompts）以标准方式暴露给 AI 模型。`,
            mermaid: `graph LR
    A["AI 模型 A"] -->|"定制集成"| B["工具 1"]
    A -->|"定制集成"| C["工具 2"]
    A -->|"定制集成"| D["工具 3"]
    E["AI 模型 B"] -->|"定制集成"| B
    E -->|"定制集成"| C
    E -->|"定制集成"| D
            `,
            tip: "MCP 的价值随着工具和模型数量的增长而指数级放大。如果你有 3 个工具和 2 个模型，MCP 将 6 个集成点减少到 3 个 MCP 服务器。",
        },
        {
            title: "2. MCP 架构深度解析",
            body: `MCP 的架构由三个核心角色组成：Host（宿主应用，如 Claude Desktop、Cursor）、Client（MCP 客户端，内嵌在 Host 中）和 Server（MCP 服务器，提供工具/资源/提示）。

通信基于 JSON-RPC 2.0 协议，传输层支持两种模式：stdio（标准输入/输出，用于本地进程）和 HTTP+SSE（Server-Sent Events，用于远程服务）。这种设计让同一个 MCP Server 既可以作为本地子进程运行（零网络开销），也可以部署为远程服务（跨机器、跨云）。

MCP Server 暴露三种能力：Tools（可调用的函数，类似 Function Calling）、Resources（可读取的数据源，如文件、数据库记录）和 Prompts（预定义的交互模板，引导用户与模型交互）。

协议交互分为几个阶段。初始化阶段：Host 发送 initialize 请求，声明协议版本和能力；Server 回应其支持的协议版本和可用能力。能力协商阶段：Host 发送 initialized 通知，确认连接建立。运行时阶段：Host 通过 tools/list、tools/call、resources/list、resources/read 等标准方法与 Server 交互。

2026 年 MCP 的重要扩展包括：远程 MCP 服务器（通过 HTTP 协议跨网络通信）、OAuth 认证（为远程服务器添加安全认证层）、流式响应（支持长时间运行工具的进度推送）、MCP Apps（在 Agent 界面中渲染交互式 UI，而非纯文本响应）。`,
            code: [
                {
                    lang: "json",
                    code: `// MCP 协议交互示例：初始化阶段
// 1. Host → Server: initialize
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "initialize",
  "params": {
    "protocolVersion": "2024-11-05",
    "capabilities": {
      "roots": { "listChanged": true },
      "sampling": {}
    },
    "clientInfo": {
      "name": "claude-desktop",
      "version": "1.0.0"
    }
  }
}

// 2. Server → Host: initialize response
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "protocolVersion": "2024-11-05",
    "capabilities": {
      "tools": { "listChanged": true },
      "resources": { "subscribe": true, "listChanged": true },
      "prompts": { "listChanged": true }
    },
    "serverInfo": {
      "name": "github-mcp-server",
      "version": "1.0.0"
    }
  }
}

// 3. Host → Server: initialized (通知)
{
  "jsonrpc": "2.0",
  "method": "notifications/initialized"
}

// 4. Host → Server: 列出可用工具
{
  "jsonrpc": "2.0",
  "id": 2,
  "method": "tools/list"
}

// 5. Server → Host: 返回工具列表
{
  "jsonrpc": "2.0",
  "id": 2,
  "result": {
    "tools": [
      {
        "name": "create_issue",
        "description": "在 GitHub 仓库中创建 Issue",
        "inputSchema": {
          "type": "object",
          "properties": {
            "owner": { "type": "string" },
            "repo": { "type": "string" },
            "title": { "type": "string" },
            "body": { "type": "string" },
            "labels": { "type": "array", "items": { "type": "string" } }
          },
          "required": ["owner", "repo", "title"]
        }
      }
    ]
  }
}`
                },
                {
                    lang: "typescript",
                    code: `// MCP Server 的传输层选择
// stdio 模式（本地进程）
// ┌──────────┐   stdin    ┌───────────┐
// │   Host   │ ─────────► │ MCP Server│
// │          │ ◄───────── │ (子进程)  │
// └──────────┘   stdout   └───────────┘
// 优点：零网络延迟、无需端口管理、进程级隔离
// 缺点：只能在本地运行

// HTTP + SSE 模式（远程服务）
// ┌──────────┐  HTTP POST  ┌───────────┐
// │   Host   │ ──────────► │ MCP Server│
// │          │ ◄────────── │ (远程服务) │
// └──────────┘   SSE stream └───────────┘
// 优点：跨网络、可部署到云端、支持多 Host 连接
// 缺点：网络延迟、需要认证、运维复杂

// 2026 年趋势：本地开发用 stdio，生产环境用 HTTP+SSE
`
                }
            ],
            table: {
                headers: ["MCP 概念", "类比", "功能", "示例"],
                rows: [
                    ["Tools", "函数/方法", "AI 模型可调用外部操作", "创建 GitHub Issue、查询数据库"],
                    ["Resources", "文件/数据流", "AI 模型可读取的上下文数据", "源代码文件、日志、配置"],
                    ["Prompts", "模板/快捷方式", "预定义的交互流程", "代码审查模板、PR 描述生成"],
                    ["Host", "浏览器", "运行 Agent 的应用", "Claude Desktop、Cursor、VS Code"],
                    ["Client", "HTTP 客户端", "Host 内部的 MCP 连接器", "内置在 Host 中的 MCP SDK"],
                    ["Server", "Web 服务", "暴露工具/资源/提示的服务", "github-mcp-server、filesystem-mcp"],
                ]
            },
            mermaid: `sequenceDiagram
    participant Host as Host (Claude Desktop)
    participant Client as MCP Client
    participant Server as MCP Server (GitHub)
    Host->>Client: 用户输入 "帮我创建 Issue"
    Client->>Server: initialize
    Server-->>Client: capabilities + tools list
    Client-->>Host: 可用工具：create_issue
    Host->>Client: 调用 create_issue
    Client->>Server: tools/call(create_issue, params)
    Server-->>Client: 结果: Issue #42 已创建
    Client-->>Host: 返回结果给模型
    Host-->>Host: 模型生成回复
    Host-->>Host: 显示给用户
            `,
            tip: "选择传输层的经验法则：开发调试用 stdio（启动快、调试方便），生产部署用 HTTP+SSE（可扩展、支持远程）",
        },
        {
            title: "3. 编写 MCP Server：从零到一",
            body: `MCP Server 是 MCP 生态中最核心的组件——它决定了 AI Agent 能做什么。编写一个 MCP Server 意味着将你的工具、数据源或 API 以标准方式暴露给任何支持 MCP 的 AI 模型。

使用 TypeScript MCP SDK（官方 SDK），编写 MCP Server 的过程非常直观：首先创建 Server 实例并声明其能力，然后注册 Tools（定义输入 schema 和处理函数）、Resources（定义 URI 模板和读取方法）和 Prompts（定义交互模板）。

MCP Server 可以是简单的本地脚本（如读取本地文件系统），也可以是复杂的企业级服务（如连接 Salesforce CRM、查询生产数据库、触发 CI/CD 流水线）。关键设计原则是：最小权限（只暴露必要的工具）、防御性编程（验证所有输入参数）和错误处理（返回有意义的错误信息，而不是静默失败）。

2026 年的 MCP Server 生态已经非常丰富。官方和社区提供了数十个即用型 Server：GitHub（仓库管理）、PostgreSQL/MySQL（数据库查询）、Slack（消息发送）、Google Drive（文件访问）、Puppeteer（网页自动化）、Brave Search（网络搜索）等。这些 Server 可以组合使用，让一个 AI Agent 同时具备代码管理、数据查询、团队协作和外部搜索的能力。`,
            code: [
                {
                    lang: "typescript",
                    code: `// 构建自定义 MCP Server：数据库查询工具
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { Pool } from "pg";

// 创建 MCP Server 实例
const server = new McpServer({
  name: "database-query-server",
  version: "1.0.0",
});

const db = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || "5432"),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

// 注册工具 1: 安全 SQL 查询
server.tool(
  "query_database",
  "执行只读 SQL 查询，返回结果集",
  {
    sql: z.string().describe("SELECT 查询语句"),
    max_rows: z.number().default(100).describe("最大返回行数"),
  },
  async ({ sql, max_rows }) => {
    // 安全验证：只允许 SELECT 语句
    const normalized = sql.trim().toUpperCase();
    if (!normalized.startsWith("SELECT")) {
      return {
        content: [{ type: "text", text: "错误：只允许 SELECT 查询" }],
        isError: true,
      };
    }
    // 限制返回行数
    const safeSql = sql.endsWith(";") ? sql : sql + ";";
    const limitSql = safeSql.replace(
      /;$/,
      \` LIMIT \${Math.min(max_rows, 1000)};\`
    );

    try {
      const result = await db.query(limitSql);
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(result.rows, null, 2),
          },
          {
            type: "text",
            text: \`返回 \${result.rows.length} 行（最大 \${max_rows} 行）\`,
          },
        ],
      };
    } catch (error: any) {
      return {
        content: [{ type: "text", text: \`查询错误: \${error.message}\` }],
        isError: true,
      };
    }
  }
);

// 注册工具 2: 表结构查询
server.tool(
  "describe_table",
  "查询表的结构信息（列名、类型、约束）",
  {
    table_name: z.string().describe("表名"),
  },
  async ({ table_name }) => {
    // SQL 注入防护：只允许字母数字和下划线
    if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(table_name)) {
      return {
        content: [{ type: "text", text: "错误：无效的表名" }],
        isError: true,
      };
    }

    const query = \`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = $1
      ORDER BY ordinal_position
    \`;

    try {
      const result = await db.query(query, [table_name]);
      if (result.rows.length === 0) {
        return {
          content: [{ type: "text", text: \`表 "\${table_name}" 不存在\` }],
          isError: true,
        };
      }
      return {
        content: [
          { type: "text", text: JSON.stringify(result.rows, null, 2) },
        ],
      };
    } catch (error: any) {
      return {
        content: [{ type: "text", text: error.message }],
        isError: true,
      };
    }
  }
);

// 注册资源：数据库连接状态
server.resource(
  "db_status",
  "db://status",
  async (uri) => ({
    contents: [
      {
        uri: uri.href,
        mimeType: "application/json",
        text: JSON.stringify({
          connected: true,
          host: process.env.DB_HOST,
          database: process.env.DB_NAME,
          timestamp: new Date().toISOString(),
        }),
      },
    ],
  })
);

// 启动 Server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Database MCP Server running on stdio");
}

main().catch(console.error);`
                },
                {
                    lang: "json",
                    code: `// MCP Server 配置（claude_desktop_config.json 示例）
{
  "mcpServers": {
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "ghp_xxx"
      }
    },
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "/Users/xueshuai/projects"],
      "env": {}
    },
    "database": {
      "command": "node",
      "args": ["/path/to/database-mcp-server.js"],
      "env": {
        "DB_HOST": "localhost",
        "DB_PORT": "5432",
        "DB_NAME": "myapp",
        "DB_USER": "app_user",
        "DB_PASSWORD": "secret"
      }
    },
    "brave-search": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-brave-search"],
      "env": {
        "BRAVE_API_KEY": "BSA_xxx"
      }
    }
  }
}
// 以上配置让 Claude Desktop 同时拥有：
// - GitHub 仓库管理能力
// - 本地文件系统访问能力
// - 数据库查询能力
// - 网络搜索能力
`
                }
            ],
            table: {
                headers: ["MCP Server 类型", "用途", "数据流向", "安全风险"],
                rows: [
                    ["文件系统 Server", "读取/写入本地文件", "本地 ↔ Agent", "中（文件权限控制）"],
                    ["数据库 Server", "执行 SQL 查询", "数据库 ↔ Agent", "高（SQL 注入、数据泄露）"],
                    ["API Server", "调用外部 API", "外部服务 ↔ Agent", "中（认证令牌管理）"],
                    ["搜索 Server", "网络搜索", "搜索引擎 ↔ Agent", "低（只读操作）"],
                    ["浏览器 Server", "网页自动化", "浏览器 ↔ Agent", "高（任意代码执行）"],
                ]
            },
            mermaid: `graph TD
    A["AI 模型"] --> B["Host 应用"]
    B --> C["MCP Client"]
    C --> D["MCP Server 1: GitHub"]
    C --> E["MCP Server 2: 数据库"]
    C --> F["MCP Server 3: 文件系统"]
    C --> G["MCP Server N: ..."]
    D --> H["GitHub API"]
    E --> I["PostgreSQL"]
    F --> J["本地文件系统"]
            `,
            tip: "MCP Server 的安全设计至关重要。始终遵循最小权限原则——只暴露必要的工具，验证所有输入，限制查询范围，记录所有操作日志。",
            warning: "不要让 MCP Server 以 root 或管理员权限运行。数据库 Server 应该使用只读账户，文件系统 Server 应该限制可访问的目录范围。",
        },
        {
            title: "4. MCP 在生产环境中的架构模式",
            body: `当 MCP 从开发工具走向生产环境时，架构需要考虑几个关键维度：可扩展性（支持大量并发请求）、安全性（认证、授权、审计）、可观测性（日志、指标、追踪）和可靠性（容错、重试、降级）。

2026 年的主流生产架构有三种。架构一：Sidecar 模式——每个 AI Agent 实例旁边运行一个 MCP Client，通过 stdio 连接本地 MCP Server 进程。这种模式简单、隔离性好，适合低并发场景。架构二：集中式 MCP Gateway——部署一个 MCP Gateway 服务，所有 AI Agent 通过 HTTP 连接到 Gateway，Gateway 负责路由请求到后端 MCP Server 集群。这种模式适合大规模部署，支持负载均衡和流量控制。架构三：混合模式——本地开发用 stdio，生产环境用 HTTP+SSE，通过配置文件切换，开发体验和生产环境一致。

MCP 的安全架构也在 2026 年快速成熟。远程 MCP Server 支持 OAuth 2.0 / OIDC 认证，确保只有授权的 Agent 才能访问工具。工具级别的权限控制（RBAC）让不同角色的 Agent 拥有不同的工具访问权限。审计日志记录所有工具调用，满足合规要求。

MCP 的可观测性方面，2026 年的最佳实践包括：每个工具调用记录结构化日志（工具名、参数、结果、延迟），使用 OpenTelemetry 追踪 MCP 请求的端到端延迟，设置告警规则（工具错误率、超时率、异常调用频率）。`,
            code: [
                {
                    lang: "typescript",
                    code: `// MCP Gateway 架构：集中式路由与流量控制
import express from "express";
import { McpClient } from "@modelcontextprotocol/sdk/client/mcp.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";

interface McpGatewayConfig {
  servers: Record<string, {
    url: string;
    auth?: { type: "bearer"; token: string };
    rateLimit?: { requestsPerMinute: number };
    timeout?: number;
  }>;
}

class McpGateway {
  private clients: Map<string, McpClient> = new Map();
  private rateLimiters: Map<string, { count: number; resetAt: number }> = new Map();
  private app = express();

  constructor(private config: McpGatewayConfig) {}

  async initialize() {
    // 连接到所有 MCP Server
    for (const [name, serverConfig] of Object.entries(this.config.servers)) {
      const client = new McpClient({
        name: "mcp-gateway",
        version: "1.0.0",
      });
      const transport = new StreamableHTTPClientTransport(
        new URL(serverConfig.url),
        {
          requestInit: serverConfig.auth
            ? { headers: { Authorization: \`Bearer \${serverConfig.auth.token}\` } }
            : undefined,
        }
      );
      await client.connect(transport);
      this.clients.set(name, client);
      this.rateLimiters.set(name, { count: 0, resetAt: Date.now() + 60000 });
    }
  }

  // 路由 MCP 工具调用请求
  async handleToolCall(serverName: string, toolName: string, args: any) {
    // 1. 速率限制检查
    const limiter = this.rateLimiters.get(serverName);
    if (!limiter) throw new Error(\`Unknown server: \${serverName}\`);

    if (Date.now() > limiter.resetAt) {
      limiter.count = 0;
      limiter.resetAt = Date.now() + 60000;
    }
    const serverConfig = this.config.servers[serverName];
    if (serverConfig.rateLimit && limiter.count >= serverConfig.rateLimit.requestsPerMinute) {
      throw new Error(\`Rate limit exceeded for \${serverName}\`);
    }
    limiter.count++;

    // 2. 工具调用
    const client = this.clients.get(serverName);
    if (!client) throw new Error(\`Client not connected: \${serverName}\`);

    const startTime = Date.now();
    try {
      const result = await client.callTool(toolName, args, {
        timeout: serverConfig.timeout || 30000,
      });
      const latency = Date.now() - startTime;

      // 3. 记录指标
      console.log(JSON.stringify({
        event: "mcp_tool_call",
        server: serverName,
        tool: toolName,
        latency,
        success: true,
        timestamp: new Date().toISOString(),
      }));

      return result;
    } catch (error: any) {
      console.error(JSON.stringify({
        event: "mcp_tool_call",
        server: serverName,
        tool: toolName,
        error: error.message,
        latency: Date.now() - startTime,
        success: false,
      }));
      throw error;
    }
  }
}`
                },
                {
                    lang: "yaml",
                    code: `# 生产环境 MCP 部署配置（docker-compose.yml）
version: "3.8"

services:
  # MCP Gateway —— 集中式路由
  mcp-gateway:
    build: ./gateway
    ports:
      - "3000:3000"
    environment:
      - GITHUB_MCP_URL=http://github-mcp:8080
      - DB_MCP_URL=http://db-mcp:8080
      - REDIS_URL=redis://redis:6379
    depends_on:
      - github-mcp
      - db-mcp
      - redis

  # GitHub MCP Server
  github-mcp:
    image: ghcr.io/modelcontextprotocol/servers/github:latest
    environment:
      - GITHUB_PERSONAL_ACCESS_TOKEN=\${GITHUB_TOKEN}
    restart: unless-stopped

  # 数据库 MCP Server
  db-mcp:
    build: ./mcp-servers/database
    environment:
      - DB_HOST=postgres
      DB_NAME: app_db
      - DB_USER=readonly_user
      - DB_PASSWORD=\${DB_PASSWORD}
    depends_on:
      - postgres

  # Redis 用于速率限制和缓存
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

  # PostgreSQL 数据库
  postgres:
    image: postgres:16
    environment:
      POSTGRES_DB: app_db
      - POSTGRES_USER=app_admin
      - POSTGRES_PASSWORD=\${DB_PASSWORD}
    volumes:
      - pgdata:/var/lib/postgresql/data

volumes:
  pgdata:
`
                }
            ],
            table: {
                headers: ["架构模式", "适用场景", "优点", "缺点", "典型并发"],
                rows: [
                    ["Sidecar (stdio)", "开发工具、个人助手", "简单、隔离、零网络延迟", "不支持并发、资源开销大", "< 10"],
                    ["集中式 Gateway", "企业 AI 平台", "可扩展、集中管理、可观测", "单点故障风险、网络延迟", "100-1000+"],
                    ["混合模式", "全生命周期", "开发体验一致、生产可扩展", "配置复杂度较高", "10-1000+"],
                    ["Serverless MCP", "突发工作负载", "按需付费、自动扩缩", "冷启动延迟、状态管理难", "弹性"],
                ]
            },
            mermaid: `graph TD
    A["AI Agent 集群"] --> B["MCP Gateway"]
    B --> C["Auth & RBAC"]
    C --> D["Rate Limiter"]
    D --> E["Request Router"]
    E --> F["GitHub MCP"]
    E --> G["DB MCP"]
    E --> H["Filesystem MCP"]
    E --> I["Custom MCP N"]
    F --> J["GitHub API"]
    G --> K["PostgreSQL"]
    H --> L["本地文件系统"]
    I --> M["外部服务"]
    B --> N["审计日志"]
    B --> O["Prometheus 指标"]
            `,
            tip: "生产环境的 MCP Gateway 应该实现优雅降级——当某个 MCP Server 不可用时，返回降级响应而不是让整个 Agent 失败。",
        },
        {
            title: "5. MCP 安全最佳实践",
            body: `MCP 让 AI Agent 获得了强大的工具调用能力，但这也带来了新的安全风险。2026 年，随着 MCP 在生产环境中的大规模部署，安全问题成为企业和开发者最关心的话题。

MCP 的安全威胁主要包括四类。注入攻击：恶意用户通过构造输入参数，让 AI Agent 执行非预期的工具调用。例如，在自然语言中嵌入"顺便删除这个文件"的指令。权限提升：Agent 通过某个工具获取敏感信息后，利用该信息调用更高权限的工具。数据泄露：Agent 将敏感数据（数据库内容、内部文件）泄露到外部工具（如搜索 API、外部聊天服务）。拒绝服务：通过大量工具调用消耗 Agent 的计算资源或导致费用飙升。

防御策略需要多层叠加。输入验证层：对所有工具调用参数进行严格验证（类型、范围、格式），拒绝任何可疑输入。权限控制层：使用 RBAC 或 ABAC 控制不同 Agent/用户对不同工具的访问权限。审计层：记录所有工具调用的完整日志（谁、调用了什么、参数是什么、结果是什么），用于事后追溯和实时告警。预算控制层：设置工具调用的频率上限和费用上限，防止意外费用。

OWASP 在 2026 年发布了《LLM Top 10》安全指南，其中专门针对 Agent 工具的章节提供了详细的安全检查清单。企业级的 MCP 部署还应该考虑 SOC 2、ISO 27001 等合规框架的要求。`,
            code: [
                {
                    lang: "typescript",
                    code: `// MCP 安全中间件：输入验证 + 权限控制 + 审计
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

interface SecurityContext {
  userId: string;
  role: "admin" | "developer" | "viewer";
  allowedTools: string[];
  rateLimit: { maxCalls: number; windowMs: number };
}

// 安全审计日志
function auditLog(ctx: SecurityContext, tool: string, args: any, result: any) {
  console.log(JSON.stringify({
    timestamp: new Date().toISOString(),
    userId: ctx.userId,
    role: ctx.role,
    tool,
    args: sanitizeArgs(args), // 脱敏处理
    success: !result.isError,
    resultSize: JSON.stringify(result).length,
  }));
}

// 参数脱敏
function sanitizeArgs(args: any): any {
  const sensitive = ["password", "token", "secret", "api_key"];
  const sanitized = { ...args };
  for (const key of sensitive) {
    if (key in sanitized) {
      sanitized[key] = "*REDACTED*";
    }
  }
  return sanitized;
}

// 权限检查装饰器
function requireRole(allowed: SecurityContext["role"][]) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const original = descriptor.value;
    descriptor.value = async function (ctx: SecurityContext, ...args: any[]) {
      if (!allowed.includes(ctx.role)) {
        auditLog(ctx, propertyKey, args, { isError: true });
        return {
          content: [{ type: "text", text: "权限不足" }],
          isError: true,
        };
      }
      return original.call(this, ctx, ...args);
    };
    return descriptor;
  };
}

// 速率限制装饰器
function rateLimit(maxCalls: number, windowMs: number) {
  const calls = new Map<string, { count: number; resetAt: number }>();
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const original = descriptor.value;
    descriptor.value = async function (ctx: SecurityContext, ...args: any[]) {
      const key = ctx.userId;
      const now = Date.now();
      const limiter = calls.get(key) || { count: 0, resetAt: now + windowMs };

      if (now > limiter.resetAt) {
        limiter.count = 0;
        limiter.resetAt = now + windowMs;
      }
      limiter.count++;
      calls.set(key, limiter);

      if (limiter.count > maxCalls) {
        return {
          content: [{ type: "text", text: "速率限制：请稍后重试" }],
          isError: true,
        };
      }
      return original.call(this, ctx, ...args);
    };
    return descriptor;
  };
}
`
                },
                {
                    lang: "typescript",
                    code: `// 防止提示词注入的工具包装器
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

class SecureToolWrapper {
  private server: McpServer;
  // 常见的提示词注入模式
  private injectionPatterns = [
    /ignore\s+(previous|all)\s+(instructions|rules)/i,
    /system\s*:\s*/i,
    /you\s+are\s+now/i,
    /new\s+instructions/i,
    /disregard/i,
    /override/i,
    /forget\s+your/i,
  ];

  constructor(server: McpServer) {
    this.server = server;
  }

  checkForInjection(input: string): { safe: boolean; risk: string } {
    for (const pattern of this.injectionPatterns) {
      if (pattern.test(input)) {
        return { safe: false, risk: \`检测到注入模式: \${pattern.source}\` };
      }
    }
    return { safe: true, risk: "" };
  }

  // 安全调用工具：先检查注入，再执行
  async safeCallTool(
    toolName: string,
    args: Record<string, string>
  ): Promise<any> {
    // 检查所有字符串参数
    for (const [key, value] of Object.entries(args)) {
      if (typeof value === "string") {
        const check = this.checkForInjection(value);
        if (!check.safe) {
          console.warn(\`[SECURITY] \${toolName}.\${key}: \${check.risk}\`);
          return {
            content: [
              {
                type: "text",
                text: "请求被安全系统拦截，请检查输入内容",
              },
            ],
            isError: true,
          };
        }
      }
    }
    // 通过检查，正常调用
    return this.server.callTool(toolName, args);
  }
}
`
                }
            ],
            table: {
                headers: ["安全威胁", "攻击方式", "影响", "防御措施"],
                rows: [
                    ["提示词注入", "在输入中嵌入越权指令", "执行非预期操作", "输入过滤、模式检测"],
                    ["权限提升", "利用工具结果获取敏感信息", "访问未授权资源", "RBAC、最小权限"],
                    ["数据泄露", "将内部数据发送到外部工具", "数据泄露", "输出过滤、DLP"],
                    ["拒绝服务", "大量并发工具调用", "资源耗尽、费用飙升", "速率限制、预算控制"],
                    ["供应链攻击", "恶意 MCP Server", "任意代码执行", "签名验证、沙箱"],
                ]
            },
            mermaid: `graph TD
    A["用户输入"] --> B["注入检测"]
    B -->|"通过"| C["权限检查"]
    B -->|"拦截"| D["拒绝请求"]
    C -->|"授权"| E["速率限制"]
    C -->|"拒绝"| D
    E -->|"未超限"| F["执行工具"]
    E -->|"超限"| D
    F --> G["输出过滤"]
    G --> H["审计日志"]
    H --> I["返回结果"]
            `,
            tip: "MCP 安全的核心原则：永远不要信任 Agent 的输入，永远不要假设工具调用是安全的。每一层都应该独立验证。",
        },
        {
            title: "6. MCP 生态与 2026 年发展路线图",
            body: `MCP 的发展速度在 2026 年令人瞩目。从 Anthropic 2024 年 11 月首次提出，到 2025 年 12 月捐赠给 Linux Foundation，再到 2026 年成为所有主流 AI 平台的标准集成方式——MCP 在不到 18 个月内完成了从概念到行业标准的全过程。

2026 年 MCP 的关键里程碑包括：W3C 标准化进程启动——W3C AI Agent Protocol Community Group 正在制定 MCP 的 Web 标准规范，预计 2026-2027 年发布正式标准。MCP Apps——从纯文本/JSON 响应扩展到交互式 UI 渲染，Agent 可以在聊天界面中直接渲染表单、图表和仪表盘。OAuth 认证支持——远程 MCP Server 可以通过标准 OAuth 2.0 流程进行用户认证，解决了企业级部署的身份验证难题。流式工具响应——支持长时间运行工具（如代码编译、大数据分析）的进度推送，Agent 可以在工具执行过程中向用户展示进度。

MCP 的社区生态在 2026 年蓬勃发展。glama.ai 和 mcprun.com 等平台提供了 MCP Server 的发现、安装和分享机制。开发者可以像安装 npm 包一样安装 MCP Server，一键获得新的工具能力。截至 2026 年 3 月，社区已有超过 1000 个开源 MCP Server，覆盖了从数据库查询到社交媒体管理的各个场景。

MCP 的未来方向包括：Agent-to-Agent (A2A) 协议——不仅是 Agent 与工具的通信，还包括 Agent 之间的标准化通信。MCP 联邦学习——多个 MCP Server 协作训练模型，数据不出本地。MCP 与 Agent 编排框架的集成——LangGraph、CrewAI 等框架原生支持 MCP，让多 Agent 系统可以动态发现和调用 MCP 工具。`,
            code: [
                {
                    lang: "typescript",
                    code: `// MCP Apps：在 Agent 界面中渲染交互式 UI
// 这是 2026 年 MCP 最令人兴奋的新特性

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

const server = new McpServer({
  name: "dashboard-mcp",
  version: "1.0.0",
});

// 返回交互式仪表盘而非纯文本
server.tool(
  "show_metrics_dashboard",
  "显示系统性能仪表板",
  {
    timeRange: z.enum(["1h", "24h", "7d", "30d"]).default("24h"),
  },
  async ({ timeRange }) => {
    const metrics = await fetchMetrics(timeRange);

    // MCP 2026 新特性：返回交互式 UI 组件
    return {
      content: [
        {
          type: "resource",
          resource: {
            uri: "mcp://dashboard/metrics",
            mimeType: "application/vnd.mcp.app+json",
            text: JSON.stringify({
              type: "dashboard",
              title: "系统性能指标",
              timeRange,
              widgets: [
                {
                  type: "line_chart",
                  title: "CPU 使用率",
                  data: metrics.cpu,
                  unit: "%",
                },
                {
                  type: "bar_chart",
                  title: "API 请求量",
                  data: metrics.requests,
                  unit: "req/s",
                },
                {
                  type: "gauge",
                  title: "内存使用",
                  value: metrics.memory,
                  unit: "%",
                  thresholds: { warning: 70, critical: 90 },
                },
                {
                  type: "table",
                  title: "服务状态",
                  columns: ["服务", "状态", "延迟", "错误率"],
                  rows: metrics.services.map((s: any) => [
                    s.name,
                    s.healthy ? "✅" : "❌",
                    \`\${s.latency}ms\`,
                    \`\${s.errorRate}%\`,
                  ]),
                },
              ],
            }),
          },
        },
      ],
    };
  }
);

// MCP Apps 让 Agent 从"聊天机器人"进化为"交互式应用平台"
// 用户不再只是阅读文本，而是可以与数据直接交互
`
                },
                {
                    lang: "json",
                    code: `// 2026 年 MCP 生态概览
{
  "official_servers": [
    "@modelcontextprotocol/server-github",
    "@modelcontextprotocol/server-filesystem",
    "@modelcontextprotocol/server-postgres",
    "@modelcontextprotocol/server-brave-search",
    "@modelcontextprotocol/server-puppeteer",
    "@modelcontextprotocol/server-slack",
    "@modelcontextprotocol/server-google-drive",
    "@modelcontextprotocol/server-git"
  ],
  "community_highlights": {
    "total_servers": 1000,
    "categories": {
      "databases": ["mysql", "mongodb", "redis", "elasticsearch"],
      "apis": ["stripe", "salesforce", "hubspot", "jira", "notion"],
      "tools": ["docker", "kubectl", "terraform", "ansible"],
      "media": ["spotify", "youtube", "s3", "cloudinary"]
    }
  },
  "platform_support": {
    "anthropic_claude": "原生支持 (2024.11)",
    "openai": "Responses API MCP 支持 (2026.01)",
    "google_gemini": "Workspace MCP 集成 (2026.02)",
    "microsoft_copilot": "Windows Agentic MCP (2026.01)",
    "amazon_q": "AWS MCP 连接器 (2026.02)"
  },
  "governance": {
    "owner": "Linux Foundation Agentic AI Foundation",
    "donated": "2025-12",
    "w3c_status": "Community Group (标准制定中)",
    "expected_standard": "2026-2027"
  }
}
`
                }
            ],
            mermaid: `graph TD
    A["2024.11: Anthropic 提出 MCP"] --> B["2025.12: 捐赠给 Linux Foundation"]
    B --> C["2026.01: OpenAI/Microsoft 支持 MCP"]
    C --> D["2026.02: Google/Amazon 支持 MCP"]
    D --> E["2026.03: W3C 启动标准化"]
    E --> F["2026-2027: W3C 正式标准"]
    F --> G["MCP 成为 AI 工具集成的事实标准"]
            `,
            tip: "MCP 生态正在像 npm/PyPI 一样发展。关注 glama.ai 和 MCP 官方目录，发现最新的社区 Server。",
        },
        {
            title: "7. MCP 实战指南：从入门到精通",
            body: `掌握 MCP 需要理解三个层次：使用者（配置和使用现有 MCP Server）、开发者（编写自定义 MCP Server）和架构师（设计企业级 MCP 架构）。

作为使用者，你需要学会：如何配置 claude_desktop_config.json（或其他 Host 的配置）、如何排查 MCP Server 连接问题（查看日志、测试连接）、如何组合多个 MCP Server 实现复杂工作流。

作为开发者，你需要掌握：TypeScript MCP SDK 的 API、工具定义的最佳实践（清晰的描述、精确的 schema）、错误处理和用户反馈、本地测试和调试方法（MCP Inspector 工具）。

作为架构师，你需要设计：MCP Server 的部署拓扑（本地 vs 远程）、安全策略（认证、授权、审计）、可观测性方案（日志、指标、追踪）、成本控制（速率限制、预算告警）。

2026 年的一个重要趋势是 MCP 与 Agent 框架的深度集成。LangGraph 0.2+ 版本原生支持 MCP 工具节点，CrewAI 允许 Agent 动态发现和调用 MCP Server，AutoGen 使用 MCP 作为 Agent 之间的通信协议。这意味着你不再需要为每个 Agent 框架编写适配代码——一个 MCP Server 可以在所有框架中即插即用。

另一个重要趋势是 MCP 在企业合规中的应用。MCP 的审计日志功能天然适合金融（SOC 2）、医疗（HIPAA）、政府（FedRAMP）等合规场景。每次工具调用都被完整记录，包括谁、什么时间、调用了什么工具、参数是什么、结果是什么——这恰好是合规审计需要的完整证据链。

MCP 不是万能的。它最适合的场景是：需要让 AI Agent 与外部系统（数据库、API、文件系统）交互的情况。如果你的需求只是纯文本对话，MCP 不是必要的。但一旦你的 Agent 需要"做事"——查询数据、调用 API、操作文件——MCP 就是最优的标准方案。`,
            code: [
                {
                    lang: "typescript",
                    code: `// MCP + LangGraph 集成示例
import { createReactAgent } from "@langchain/langgraph/preloaded_agent";
import { ChatAnthropic } from "@langchain/anthropic";
import { McpClient } from "@modelcontextprotocol/sdk/client/mcp.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { tool } from "@langchain/core/tools";

async function buildMcpAgent() {
  // 1. 连接 MCP Server
  const transport = new StdioClientTransport({
    command: "npx",
    args: ["-y", "@modelcontextprotocol/server-github"],
    env: { GITHUB_PERSONAL_ACCESS_TOKEN: process.env.GITHUB_TOKEN! },
  });
  const mcpClient = new McpClient({
    name: "github-agent",
    version: "1.0.0",
  });
  await mcpClient.connect(transport);

  // 2. 将 MCP 工具转换为 LangChain 工具
  const toolsList = await mcpClient.listTools();
  const langchainTools = toolsList.tools.map((t) =>
    tool(
      async (input) => {
        const result = await mcpClient.callTool(t.name, JSON.parse(input));
        return JSON.stringify(result.content);
      },
      {
        name: t.name,
        description: t.description,
        schema: t.inputSchema,
      }
    )
  );

  // 3. 创建 Agent
  const model = new ChatAnthropic({
    model: "claude-sonnet-4-20250514",
    temperature: 0,
  });

  const agent = createReactAgent({
    llm: model,
    tools: langchainTools,
    promptTemplate: "你是一个 GitHub 助手，可以帮助用户管理仓库。",
  });

  return agent;
}

// 使用
// const agent = await buildMcpAgent();
// const result = await agent.invoke({
//   input: "帮我查看 openclaw 仓库最近的 Issue",
// });
`
                },
                {
                    lang: "typescript",
                    code: `// MCP 故障排查检查清单
interface McpHealthCheck {
  serverName: string;
  checks: HealthCheck[];
}

interface HealthCheck {
  name: string;
  fn: () => Promise<{ pass: boolean; detail: string }>;
}

async function runHealthChecks(
  config: McpHealthCheck
): Promise<HealthReport> {
  const report: HealthReport = { server: config.serverName, results: [] };

  for (const check of config.checks) {
    try {
      const result = await check.fn();
      report.results.push({ check: check.name, ...result });
    } catch (error: any) {
      report.results.push({
        check: check.name,
        pass: false,
        detail: error.message,
      });
    }
  }

  return report;
}

interface HealthReport {
  server: string;
  results: { check: string; pass: boolean; detail: string }[];
}

// 使用示例
const report = await runHealthChecks({
  server: "github-mcp",
  checks: [
    {
      name: "进程运行中",
      fn: async () => ({
        pass: await isProcessRunning("github-mcp"),
        detail: "PID 检查",
      }),
    },
    {
      name: "协议初始化",
      fn: async () => {
        const resp = await mcpClient.initialize();
        return {
          pass: resp.protocolVersion === "2024-11-05",
          detail: \`协议版本: \${resp.protocolVersion}\`,
        };
      },
    },
    {
      name: "工具列表可获取",
      fn: async () => {
        const tools = await mcpClient.listTools();
        return {
          pass: tools.tools.length > 0,
          detail: \`发现 \${tools.tools.length} 个工具\`,
        };
      },
    },
    {
      name: "工具调用正常",
      fn: async () => {
        const result = await mcpClient.callTool("get_user_profile", {});
        return {
          pass: !result.isError,
          detail: result.isError ? "调用失败" : "调用成功",
        };
      },
    },
  ],
});

console.log(\`MCP 健康报告: \${report.server}\`);
for (const r of report.results) {
  console.log(\`  \${r.pass ? "✅" : "❌"} \${r.check}: \${r.detail}\`);
}
`
                }
            ],
            table: {
                headers: ["角色", "核心技能", "学习资源", "时间投入"],
                rows: [
                    ["使用者", "配置 MCP Server、排查连接问题、组合工具", "官方文档、MCP Inspector", "1-2 天"],
                    ["开发者", "TypeScript SDK API、工具定义、错误处理", "SDK 文档、社区示例", "1-2 周"],
                    ["架构师", "部署拓扑、安全策略、可观测性、成本控制", "企业案例、安全指南", "1-2 月"],
                ]
            },
            mermaid: `graph TD
    A["学习 MCP"] --> B{"你的角色?"}
    B -->|"使用者"| C["配置现有 Server"]
    B -->|"开发者"| D["编写自定义 Server"]
    B -->|"架构师"| E["设计企业架构"]
    C --> F["claude_desktop_config.json"]
    D --> G["TypeScript MCP SDK"]
    E --> H["MCP Gateway + 安全策略"]
    F --> I["多 Server 组合工作流"]
    G --> I
    H --> I
    I --> J["🎉 掌握 MCP"]
            `,
            tip: "MCP 的学习曲线很平缓——配置一个简单的 Server 只需要 5 分钟，编写一个自定义 Server 只需要几小时。真正的挑战是安全和架构设计，这是长期积累的经验。",
            warning: "2026 年 MCP 还在快速演进中。API 可能有 breaking changes，生产环境使用前务必锁定 SDK 版本并跟踪 Changelog。",
        },
    ],
};
