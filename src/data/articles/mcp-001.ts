// MCP (Model Context Protocol) 全面指南

import { Article } from '../knowledge';

export const article: Article = {
  id: "mcp-001",
  title: "MCP (Model Context Protocol) 全面指南：从协议原理到生产级 Agent 集成",
  category: "aieng",
  tags: ["MCP", "Model Context Protocol", "AI Agent", "工具集成", "Anthropic", "Claude", "协议标准"],
  summary: "MCP 正在成为 AI Agent 连接外部工具和数据的标准协议。本文从协议架构讲起，详解 Server-Client-Host 三层模型、JSON-RPC 通信机制、资源/工具/提示词三大能力，并附带完整的 Python MCP Server 实现、Claude Desktop MCP 配置实战、以及与传统 API 集成的全面对比。",
  date: "2026-04-21",
  readTime: "22 min",
  level: "进阶",
  content: [
    {
      title: "为什么 MCP 是 AI Agent 的「USB-C」",
      body: `2026 年，AI Agent 正从「孤立模型」走向「生态系统」。但一个核心问题始终存在：**如何让不同 Agent 以标准化方式连接外部工具和数据？**

早期方案各显神通：LangChain 用 Tool 定义，AutoGPT 用 JSON Schema，各种 Agent 框架各自为战。直到 Anthropic 提出 **MCP（Model Context Protocol）**——一个统一的、开源的、标准化的 Agent 连接协议。

### MCP 的核心愿景

MCP 的目标很简单但影响深远：

> "让任何 AI 应用都能以统一方式连接任何数据源和工具，就像 USB-C 统一了物理接口一样。"

**三大关键价值：**

1. **标准化连接**：一个 MCP Server 可以被 Claude Desktop、Cursor、任何支持 MCP 的 Agent 直接使用
2. **安全隔离**：MCP 在 Agent 和工具之间提供安全层，控制权限、验证输入、限制访问范围
3. **能力发现**：Agent 可以自动发现 MCP Server 提供了哪些工具和资源，无需硬编码

### MCP 与传统 API 集成的本质区别

| 维度 | 传统 API 集成 | MCP 协议 |
|------|-------------|---------|
| **集成方式** | 每个工具单独写适配器 | 统一协议，一次实现处处可用 |
| **能力发现** | 需要查阅文档/API 文档 | 自动 discovery，Agent 自主探索 |
| **上下文管理** | 手动管理 token 和上下文 | 协议层自动管理资源引用 |
| **安全模型** | API Key 直接暴露给 Agent | MCP Server 作为安全代理层 |
| **多 Agent 支持** | 每个 Agent 框架单独适配 | 一个 Server 服务所有 MCP 客户端 |
| **协议标准化** | 各框架自定义格式 | 标准化 JSON-RPC 2.0 |
| **部署复杂度** | N × M 个集成点 | N + M 个组件（Server + Client） |

**关键洞察**：MCP 不是替代 API，而是**在 API 之上加了一层 Agent 友好的抽象**。你的数据库仍然通过 REST API 暴露数据，但 MCP Server 将这些 REST API 转换为 Agent 可以理解的工具和资源。`
    },
    {
      title: "MCP 协议架构详解",
      body: `MCP 采用**客户端-服务器-主机（Client-Server-Host）**三层架构：

### 三层模型

\`\`\`
┌─────────────────────────────────────────┐
│              Host Application            │
│    (Claude Desktop / Cursor / IDE)       │
│                                          │
│  ┌──────────────────────────────────┐   │
│  │         MCP Client                │   │
│  │  (协议实现 + 能力发现 + 安全层)    │   │
│  └──────────────────────────────────┘   │
│              ▲    ▲    ▲                 │
│              │    │    │                 │
│  ┌───────────┼────┼────┼───────────┐    │
│  │  MCP Server │ MCP Server │ MCP Server │   │
│  │  (GitHub)   │  (File)    │  (Database)  │   │
│  └───────────┴────┴────┴───────────┘    │
└─────────────────────────────────────────┘
\`\`\`

### 三层职责

**1. Host（宿主应用）**
- 运行 LLM 的应用程序（Claude Desktop、Cursor、VS Code 等）
- 负责管理多个 MCP Client
- 处理用户界面和交互流程

**2. Client（客户端）**
- 实现 MCP 协议的客户端逻辑
- 连接到多个 MCP Server
- 负责**能力发现**（Discovery）：询问 Server 提供了什么
- 负责**安全控制**：管理权限、过滤请求、限制访问

**3. Server（服务端）**
- 暴露具体的工具（Tools）、资源（Resources）、提示词（Prompts）
- 实现实际的业务逻辑
- 可以是本地进程、远程 HTTP 服务、或 SSE 端点

### JSON-RPC 2.0 通信机制

MCP 基于 **JSON-RPC 2.0** 协议，所有通信通过标准 JSON 格式：

**请求格式：**
\`\`\`json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/call",
  "params": {
    "name": "search_github",
    "arguments": {"query": "MCP protocol", "limit": 5}
  }
}
\`\`\`

**响应格式：**
\`\`\`json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "content": [
      {"type": "text", "text": "Found 5 repositories..."}
    ]
  }
}
\`\`\`

**传输层支持：**
- **stdio**：标准输入输出（本地进程）
- **SSE**（Server-Sent Events）：HTTP 长连接（远程服务）
- **WebSocket**：双向通信（实时交互）`
    },
    {
      title: "MCP 三大核心能力",
      body: `MCP Server 可以暴露三种核心能力：

### 1. Tools（工具）—— Agent 的「双手」

工具是 Agent 可以**主动调用**的功能。类比：Agent 说"我需要搜索 GitHub"，Client 就调用对应的 MCP Tool。

**典型用例：**
- 代码仓库操作（git clone、commit、push）
- 文件读写
- API 调用（数据库查询、HTTP 请求）
- 系统命令执行

### 2. Resources（资源）—— Agent 的「眼睛」

资源是 Agent 可以**读取**的数据。类比：Agent 说"我想看看这个文件的内容"。

**典型用例：**
- 文件系统内容
- 数据库记录
- API 响应数据
- 配置信息

### 3. Prompts（提示词）—— Agent 的「模板」

提示词是预定义的交互模板，帮助 Agent 更好地完成特定任务。

**典型用例：**
- 代码审查模板
- Bug 修复工作流
- 文档生成模板`
    },
    {
      title: "MCP 请求流程架构图",
      mermaid: `graph TB
    subgraph "Agent 发起请求"
        A[Agent 决定调用工具] --> B[Client 发现可用 Tools]
    end
    subgraph "MCP 协议层"
        B --> C[Client 发送 JSON-RPC 请求]
        C --> D[Server 接收并验证]
        D --> E[Server 执行业务逻辑]
        E --> F[Server 返回结果]
        F --> G[Client 处理并返回给 Agent]
    end
    subgraph "外部系统"
        D --> H[数据库/API/文件系统]
        E --> H
    end
    G --> I[Agent 处理结果并决策下一步]
`
    },
    {
      title: "实战：用 Python 构建 MCP Server",
      body: `下面是一个完整的 Python MCP Server 实现，提供 GitHub 搜索和文件操作能力：

### 安装依赖

\`\`\`bash
pip install mcp
\`\`\`

### 完整实现

\`\`\`python
from mcp.server import Server
from mcp.server.stdio import stdio_server
from mcp.types import Tool, TextContent, ImageContent
import asyncio
import json
import os
from pathlib import Path

# 创建 MCP Server 实例
app = Server("ai-master-github-tools")

# === 能力发现：告诉 Client 我们提供了什么 ===
@app.list_tools()
async def list_tools():
    """返回所有可用工具列表"""
    return [
        Tool(
            name="search_github",
            description="搜索 GitHub 仓库、用户或代码",
            inputSchema={
                "type": "object",
                "properties": {
                    "query": {
                        "type": "string",
                        "description": "搜索关键词"
                    },
                    "type": {
                        "type": "string",
                        "enum": ["repositories", "users", "code"],
                        "description": "搜索类型",
                        "default": "repositories"
                    },
                    "sort": {
                        "type": "string",
                        "enum": ["stars", "forks", "updated"],
                        "description": "排序方式",
                        "default": "stars"
                    },
                    "per_page": {
                        "type": "integer",
                        "description": "每页结果数",
                        "default": 5
                    }
                },
                "required": ["query"]
            }
        ),
        Tool(
            name="read_file",
            description="读取本地文件内容",
            inputSchema={
                "type": "object",
                "properties": {
                    "path": {
                        "type": "string",
                        "description": "文件路径"
                    }
                },
                "required": ["path"]
            }
        ),
        Tool(
            name="list_directory",
            description="列出目录内容",
            inputSchema={
                "type": "object",
                "properties": {
                    "path": {
                        "type": "string",
                        "description": "目录路径"
                    }
                },
                "required": ["path"]
            }
        )
    ]

# === 工具调用：实际执行逻辑 ===
@app.call_tool()
async def call_tool(name: str, arguments: dict):
    """处理工具调用请求"""
    
    if name == "search_github":
        import urllib.request
        
        query = arguments.get("query", "")
        search_type = arguments.get("type", "repositories")
        sort = arguments.get("sort", "stars")
        per_page = arguments.get("per_page", 5)
        
        # 构建 GitHub API 请求
        url = f"https://api.github.com/search/{search_type}?q={query}&sort={sort}&per_page={per_page}"
        
        req = urllib.request.Request(url)
        req.add_header("Accept", "application/vnd.github.v3+json")
        
        # 如果有 token 则添加
        token = os.environ.get("GITHUB_TOKEN")
        if token:
            req.add_header("Authorization", f"Bearer {token}")
        
        try:
            with urllib.request.urlopen(req, timeout=10) as response:
                data = json.loads(response.read().decode())
                
            # 格式化结果
            items = data.get("items", [])
            total = data.get("total_count", 0)
            
            result_lines = [f"📊 找到 {total} 个结果（显示前 {len(items)} 个）\\n"]
            
            for item in items:
                if search_type == "repositories":
                    result_lines.append(
                        f"⭐ {item['full_name']}\\n"
                        f"   {item.get('description', 'N/A')}\\n"
                        f"   Stars: {item['stargazers_count']:,} | "
                        f"Forks: {item['forks_count']:,} | "
                        f"Language: {item.get('language', 'N/A')}\\n"
                        f"   🔗 {item['html_url']}\\n"
                    )
                elif search_type == "users":
                    result_lines.append(
                        f"👤 {item['login']}\\n"
                        f"   {item.get('bio', 'N/A')}\\n"
                        f"   Repos: {item['public_repos']} | "
                        f"Followers: {item['followers']}\\n"
                        f"   🔗 {item['html_url']}\\n"
                    )
            
            return [TextContent(type="text", text="\\n".join(result_lines))]
            
        except Exception as e:
            return [TextContent(type="text", text=f"❌ 搜索失败: {str(e)}")]
    
    elif name == "read_file":
        path = arguments.get("path", "")
        try:
            # 安全检查：限制在特定目录
            base_dir = Path("/workspace")
            full_path = (base_dir / path).resolve()
            if not str(full_path).startswith(str(base_dir)):
                return [TextContent(type="text", text="❌ 路径超出允许范围")]
            
            content = full_path.read_text(encoding="utf-8")
            return [TextContent(type="text", text=f"📄 {path}:\\n\\n{content[:5000]}")]
        except Exception as e:
            return [TextContent(type="text", text=f"❌ 读取失败: {str(e)}")]
    
    elif name == "list_directory":
        path = arguments.get("path", ".")
        try:
            base_dir = Path("/workspace")
            full_path = (base_dir / path).resolve()
            if not str(full_path).startswith(str(base_dir)):
                return [TextContent(type="text", text="❌ 路径超出允许范围")]
            
            entries = list(full_path.iterdir())
            lines = [f"📁 {path}/\\n"]
            
            for entry in sorted(entries):
                icon = "📂" if entry.is_dir() else "📄"
                size = "" if entry.is_dir() else f" ({entry.stat().st_size:,} bytes)"
                lines.append(f"  {icon} {entry.name}{size}")
            
            return [TextContent(type="text", text="\\n".join(lines))]
        except Exception as e:
            return [TextContent(type="text", text=f"❌ 列出失败: {str(e)}")]
    
    else:
        return [TextContent(type="text", text=f"❌ 未知工具: {name}")]

# === 资源暴露：让 Agent 可以读取数据 ===
@app.list_resources()
async def list_resources():
    """返回所有可用资源列表"""
    return []

# === 启动 Server ===
async def main():
    async with stdio_server() as (read_stream, write_stream):
        await app.run(
            read_stream,
            write_stream,
            app.create_initialization_options()
        )

if __name__ == "__main__":
    asyncio.run(main())
\`\`\`

### 配置 Claude Desktop 使用此 MCP Server

在 Claude Desktop 的配置文件中（\`~/Library/Application Support/Claude/claude_desktop_config.json\`）：

\`\`\`json
{
  "mcpServers": {
    "ai-master-tools": {
      "command": "python",
      "args": ["/path/to/ai-master-mcp-server.py"],
      "env": {
        "GITHUB_TOKEN": "your_token_here"
      }
    }
  }
}
\`\`\`

重启 Claude Desktop 后，Agent 就能自动发现并使用这些工具了！`
    },
    {
      title: "MCP 在 2026 的生态现状",
      body: `MCP 自 2024 年底由 Anthropic 提出以来，已经形成了庞大的生态系统：

### 主要参与者

| 类别 | 项目 | 描述 | Stars |
|------|------|------|-------|
| **协议标准** | MCP Specification | Anthropic 官方协议规范 | 25K+ |
| **Python SDK** | mcp (Python) | 官方 Python SDK | 15K+ |
| **TypeScript SDK** | @modelcontextprotocol/sdk | 官方 TS SDK | 20K+ |
| **Claude Desktop** | Claude Desktop MCP | Claude 原生 MCP 支持 | 内置 |
| **Cursor** | Cursor MCP | Cursor IDE 集成 | 内置 |
| **n8n** | n8n MCP | 工作流自动化 MCP | 184K |
| **LangChain** | LangChain MCP | 框架级 MCP 支持 | 90K+ |
| **社区 Server** | various | 数据库、Git、Slack 等 | 快速增长 |

### 热门 MCP Server 类型

1. **文件系统**：读写本地文件、目录遍历
2. **数据库**：PostgreSQL、MySQL、SQLite 查询
3. **Git**：仓库操作、diff、commit 历史
4. **Web 搜索**：Google、Bing、Perplexity 搜索
5. **代码工具**：lint、format、test 运行
6. **API 集成**：Slack、GitHub、Notion、Figma
7. **系统工具**：终端命令、进程管理

### MCP 与其他协议的竞争/互补

| 协议 | 定位 | 与 MCP 关系 |
|------|------|------------|
| **MCP** | Agent-工具连接 | 标准协议，专注 Agent 场景 |
| **OpenAPI** | REST API 描述 | 互补：MCP 可消费 OpenAPI |
| **gRPC** | 高性能 RPC | 互补：MCP 可用 gRPC 传输 |
| **LangChain Tools** | 框架内工具 | 竞争/兼容：LangChain 已支持 MCP |
| **Function Calling** | 模型原生工具 | 互补：MCP 可作为 Function 来源 |`
    },
    {
      title: "MCP 安全模型与最佳实践",
      body: `MCP 的安全模型是其核心价值之一。理解它对于生产级部署至关重要。

### 安全架构

\`\`\`
┌─────────────────────────────────────────────┐
│              用户 / Agent                    │
│              (不可信环境)                     │
├─────────────────────────────────────────────┤
│           MCP Client (安全层)                │
│  • 权限控制：决定 Agent 可以调用哪些工具       │
│  • 输入验证：过滤和验证所有请求参数            │
│  • 速率限制：防止滥用和 DoS                   │
│  • 审计日志：记录所有工具调用                  │
├─────────────────────────────────────────────┤
│           MCP Server (执行层)                │
│  • 业务逻辑执行                               │
│  • 数据访问控制                               │
│  • 敏感信息过滤                               │
├─────────────────────────────────────────────┤
│           外部系统 (数据库/API)              │
│  • 最小权限访问                               │
│  • 数据脱敏                                   │
└─────────────────────────────────────────────┘
\`\`\`

### 安全最佳实践

**1. 最小权限原则**
\`\`\`python
# ❌ 危险：允许 Agent 访问整个文件系统
@app.list_resources()
async def list_resources():
    return [Resource(uri="file:///*", name="All Files")]

# ✅ 安全：限制在特定目录
@app.list_resources()
async def list_resources():
    return [
        Resource(
            uri="file:///workspace/docs",
            name="Project Documentation"
        ),
        Resource(
            uri="file:///workspace/src",
            name="Source Code"
        )
    ]
\`\`\`

**2. 输入验证**
\`\`\`python
import re

@app.call_tool()
async def call_tool(name: str, arguments: dict):
    if name == "execute_command":
        cmd = arguments.get("command", "")
        # 禁止危险命令
        dangerous_patterns = ['rm -rf', 'sudo', 'dd ', '> /dev/', '| bash']
        for pattern in dangerous_patterns:
            if pattern in cmd:
                raise ValueError(f"命令包含禁止模式: {pattern}")
        # 限制命令长度
        if len(cmd) > 1000:
            raise ValueError("命令过长")
        # 只允许白名单命令
        allowed_prefixes = ['ls ', 'cat ', 'grep ', 'head ', 'wc ']
        if not any(cmd.startswith(p) for p in allowed_prefixes):
            raise ValueError("命令不在白名单中")
\`\`\`

**3. 敏感信息脱敏**
\`\`\`python
import re

def sanitize_output(text: str) -> str:
    """从输出中移除敏感信息"""
    # 移除 API Key 模式
    text = re.sub(r'sk-[a-zA-Z0-9]{48}', '[REDACTED_API_KEY]', text)
    # 移除密码
    text = re.sub(r'"password":\\s*"[^"]*"', '"password": "[REDACTED]"', text)
    # 移除 IP 地址（可选）
    text = re.sub(r'\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}', '[REDACTED_IP]', text)
    return text
\`\`\`

**4. 审计日志**
\`\`\`python
import logging
import json
from datetime import datetime

audit_logger = logging.getLogger("mcp-audit")

@app.call_tool()
async def call_tool(name: str, arguments: dict):
    # 记录审计日志
    audit_logger.info(json.dumps({
        "timestamp": datetime.utcnow().isoformat(),
        "tool": name,
        "arguments": {k: v for k, v in arguments.items() 
                      if k not in ["password", "token", "api_key"]},
        "status": "success"
    }))
    
    # 正常处理...
\`\`\``
    },
    {
      title: "Headless AI + MCP：未来的 Agent 服务架构",
      body: `结合 Salesforce Headless 360 和 MCP 协议，我们看到了 AI 服务的未来方向：

### 什么是 Headless AI？

Simon Willison 在 2026 年 4 月引用的 Matt Webb 观点：

> "Headless services are about to become much more common — because using personal AIs is a better experience for users than using services directly."

**Headless AI 的核心思想：**
- 服务不再提供 UI，而是暴露 API/MCP/CLI
- AI Agent 直接通过 API 与服务交互
- 用户通过个人 AI 助手（如 OpenClaw）间接使用服务

### MCP + Headless 架构

\`\`\`
用户 ──→ [个人 AI 助手] ──→ [MCP Client] ──→ [MCP Server] ──→ [Headless Service]
                                              │
                                              ├──→ GitHub API
                                              ├──→ 数据库
                                              ├──→ 文件系统
                                              └──→ 任何 MCP 服务
\`\`\`

**这个架构的优势：**

1. **统一入口**：用户只需要一个 AI 助手，就能访问所有服务
2. **自然语言交互**：用自然语言代替点击和表单
3. **自动化工作流**：Agent 可以跨多个服务编排复杂流程
4. **权限集中管理**：在 MCP Client 层统一控制所有工具的访问权限

### 构建 Headless MCP 服务

下面是一个将现有 REST API 转换为 MCP Server 的示例：

\`\`\`python
from mcp.server import Server
from mcp.server.fastmcp import FastMCP
import httpx
import os

# 使用 FastMCP 简化开发
mcp = FastMCP("headless-service")

@mcp.tool()
async def query_database(sql: str, params: dict = None) -> str:
    """查询数据库（只读）"""
    # 安全：只允许 SELECT
    if not sql.strip().upper().startswith("SELECT"):
        return "❌ 只允许 SELECT 查询"
    
    async with httpx.AsyncClient() as client:
        response = await client.post(
            "http://database-service:8080/query",
            json={"sql": sql, "params": params},
            headers={"Authorization": f"Bearer {os.environ['DB_TOKEN']}"}
        )
        return response.json()["result"]

@mcp.tool()
async def create_record(table: str, data: dict) -> str:
    """创建数据记录"""
    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"http://api-service:8080/{table}",
            json=data,
            headers={"Authorization": f"Bearer {os.environ['API_TOKEN']}"}
        )
        return f"✅ 创建成功: {response.json()['id']}"

@mcp.resource("config://app")
async def get_app_config() -> str:
    """获取应用配置信息"""
    return """
    {
      "app_name": "AI Master",
      "version": "2.0.0",
      "features": ["knowledge", "tools", "blog", "news"],
      "api_endpoint": "https://ai-master.cc/api"
    }
    """

if __name__ == "__main__":
    mcp.run()
\`\`\`

**部署方式：**
- 本地：通过 stdio 连接
- 远程：通过 SSE 或 WebSocket
- 容器化：Docker + Kubernetes 部署`
    },
    {
      title: "MCP vs 其他 Agent 工具方案的全面对比",
      body: `| 维度 | MCP | LangChain Tools | OpenAI Function Calling | AutoGPT Tools |
|------|-----|-----------------|------------------------|---------------|
| **标准化程度** | ⭐⭐⭐⭐⭐ 协议标准 | ⭐⭐⭐ 框架内标准 | ⭐⭐⭐⭐ OpenAI 生态 | ⭐⭐ 自定义格式 |
| **跨框架兼容** | ✅ 所有 MCP 客户端 | ❌ 仅 LangChain | ❌ 仅 OpenAI 模型 | ❌ 仅 AutoGPT |
| **安全模型** | ✅ 协议层安全 | ⚠️ 依赖框架实现 | ⚠️ 模型层有限控制 | ❌ 基本无安全层 |
| **能力发现** | ✅ 自动 Discovery | ⚠️ 手动注册 | ✅ 自动发现 | ⚠️ 部分自动 |
| **远程部署** | ✅ SSE/WebSocket | ⚠️ 需要额外配置 | ❌ 仅本地 | ❌ 仅本地 |
| **社区生态** | 📈 快速增长 | ✅ 成熟 | ✅ 成熟 | 📉 减少 |
| **学习曲线** | 中等 | 低（框架内） | 低 | 中等 |
| **生产就绪** | ✅ 是 | ✅ 是 | ✅ 是 | ⚠️ 实验性 |
| **多工具连接** | ✅ 一个 Client 连多个 Server | ⚠️ 需手动集成 | ❌ 每次定义 | ⚠️ 有限支持 |
| **版本控制** | ✅ 协议版本化 | ⚠️ 框架版本绑定 | ✅ API 版本化 | ❌ 无 |

### 选择建议

- **新项目**：优先选择 MCP，标准化 + 跨框架兼容是长期优势
- **已有 LangChain 项目**：可以逐步迁移到 MCP（LangChain 已支持 MCP）
- **仅用 OpenAI**：Function Calling 足够，但考虑 MCP 做未来准备
- **多 Agent 协作**：MCP 是最佳选择（统一协议）`
    },
    {
      title: "总结与行动指南",
      body: `### MCP 正在成为 AI Agent 的「标准插座」

就像 USB-C 统一了物理接口，MCP 正在统一 AI Agent 与外部世界的连接方式。2026 年，支持 MCP 已经成为 AI 工具的标准配置。

### 关键要点回顾

1. **MCP 是什么**：标准化的 Agent-工具连接协议，基于 JSON-RPC 2.0
2. **三层架构**：Host（应用）→ Client（协议）→ Server（工具）
3. **三大能力**：Tools（调用）、Resources（读取）、Prompts（模板）
4. **安全模型**：Client 层权限控制 + Server 层执行隔离
5. **生态现状**：Claude Desktop、Cursor、n8n、LangChain 均已支持
6. **未来趋势**：MCP + Headless AI = Agent 原生服务架构

### 下一步行动

1. **体验 MCP**：在 Claude Desktop 中配置一个 MCP Server
2. **构建第一个 Server**：用 Python 或 TypeScript 写一个简单工具
3. **集成现有服务**：将你的 API/数据库包装为 MCP Server
4. **关注生态**：关注 MCP 社区的最新 Server 实现

MCP 不是未来的技术——它**就是现在**。每个 AI 开发者都应该了解并使用它。`
    }
  ]
};
