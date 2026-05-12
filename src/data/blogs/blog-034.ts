import { BlogPost, ArticleSection } from './blog-types';

const content: ArticleSection[] = [
  {
    title: "引言：一场静悄悄的革命",
    body: `2026 年 4 月 19 日，Interconnected 的 Matt Webb 发表了一篇引发广泛讨论的文章——"Headless everything for personal AI"。与此同时，Salesforce CEO Marc Benioff 在 Twitter 上宣布：

> "Welcome Salesforce Headless 360: No Browser Required! Our API is the UI. Entire Salesforce & Agentforce & Slack platforms are now exposed as APIs, MCP, & CLI."

这两位不同领域的领袖不约而同地指向了同一个结论：个人 AI 正在改变人与软件的交互方式，而 "headless"（无头化）服务将成为基础设施。

什么是 "headless everything"？简单说：当 AI Agent 代替人类使用软件时，图形界面不再是必需的——API、MCP 和 CLI 才是 AI Agent 与软件交互的正确方式。

这篇文章将深度解读这一趋势的技术背景、商业影响，以及为什么它可能重塑整个软件行业。`,
    tip: "阅读收获：\n- 理解 'Headless Everything' 的核心概念和驱动力\n- 掌握 MCP 协议在 headless 服务中的关键作用\n- 分析 Salesforce Headless 360 等实际案例\n- 通过 Python 代码构建自己的 headless AI 服务",
  },
  {
    title: "一、什么是 'Headless'？",
    body: `"Headless"（无头）这个概念最初来自 CMS 领域——"headless CMS" 指只提供 API、不提供前端界面的内容管理系统。现在这个概念正在扩展到几乎所有软件领域。

在 AI Agent 语境下，"headless" 意味着：`,
    list: [
      "没有 GUI——服务不提供网页或桌面界面，只通过 API/MCP/CLI 交互",
      "AI 优先设计——从第一天就为 AI Agent 的消费模式而构建",
      "自动化友好——支持批量操作、异步任务、无需人工确认",
      "标准化协议——使用 MCP、REST、gRPC 等 AI Agent 原生理解的协议",
    ],
    mermaid: `graph TD
    A["传统 SaaS 服务"] --> B["Web GUI 界面"]
    B --> C["用户手动操作"]
    C --> D["点击、输入、浏览"]
    
    E["Headless 服务"] --> F["API / MCP / CLI"]
    F --> G["AI Agent 直接调用"]
    G --> H["自动化执行"]
    
    B -.->|"浏览器自动化<br/>慢且脆弱"| G
    F -->|"直接通信<br/>快且可靠"| H
    class E s1
    class A s0
    classDef s0 fill:#b45309,stroke:#ec971f,color:#fff
    classDef s1 fill:#047857,stroke:#4cae4c,color:#fff`,
  },
  {
    title: "二、为什么 'Headless Everything' 现在发生？",
    body: `Matt Webb 的分析指出了核心驱动力："使用个人 AI 比直接使用服务体验更好"。这意味着越来越多的用户会通过 AI Agent 来使用软件服务，而不是直接打开网页或 App。

让我们看看三个关键的推动因素：`,
    table: {
      headers: ["驱动因素", "说明", "影响"],
      rows: [
        ["AI Agent 能力成熟", "Claude、GPT 等模型已能可靠地执行复杂任务链", "Agent 需要结构化接口而非 GUI"],
        ["MCP 协议标准化", "Model Context Protocol 成为 AI 连接工具的标准方式", "服务暴露为 MCP Server 即可被所有 AI Agent 使用"],
        ["SaaS 定价模式受冲击", "按人头收费模式无法适应 AI Agent 批量使用的场景", "需要新的按调用量/按代理数的计费方式"],
      ]
    },
  },
  {
    title: "三、Salesforce Headless 360：企业级标杆",
    body: `Marc Benioff 宣布的 Salesforce Headless 360 是这一趋势的企业级标杆。它的核心主张是：

> "Our API is the UI"

这意味着 Salesforce 整个平台——包括 CRM、Agentforce 和 Slack——都被暴露为 API、MCP 和 CLI。AI Agent 可以直接访问数据、工作流和任务，无需通过浏览器界面。

这对 SaaS 行业意味着什么？

如果 Salesforce——全球最大的企业 SaaS 公司——都在转向 headless，那其他 SaaS 公司必须跟上。Brandur Leach（前 Stripe 工程师）在 \`The Second Wave of the API-first Economy\` 中预测：

> "突然间，API 不再是负担，而是一个主要的可销售向量。尤其是在产品差异不大的领域，API 的可用性可能成为决定性的竞争因素。"

这意味着：`,
    list: [
      "API-first 不再是口号，而是生存必需——没有好 API 的 SaaS 将被 AI Agent 时代淘汰",
      "MCP Server 将成为标配——就像 2010 年代每个 SaaS 都需要 REST API 一样",
      "CLI 工具将回归——AI Agent 通过 CLI 执行操作比 GUI 更高效",
      "SaaS 定价模式需要重构——按人头收费不再适用 Agent 批量使用的场景",
    ],
  },
  {
    title: "四、MCP：Headless 服务的关键协议",
    body: `Model Context Protocol (MCP) 是 Anthropic 提出的开放标准，用于让 AI 模型连接到外部工具和数据源。在 headless 服务的语境下，MCP 扮演了至关重要的角色。

MCP 为什么重要？

MCP 让任何服务都能以标准化的方式向 AI Agent 暴露能力。一个 headless 服务只需要实现 MCP Server，就能被所有支持 MCP 的 AI Agent 发现和调用。`,
    mermaid: `sequenceDiagram
    participant AI as AI Agent (Claude/GPT)
    participant MCP as MCP Protocol
    participant S1 as Salesforce MCP Server
    participant S2 as 数据库 MCP Server
    participant S3 as 邮件 MCP Server
    
    AI->>MCP: 发现可用工具
    MCP-->>AI: 返回工具列表 (Salesforce CRM, 数据库查询, 邮件发送)
    
    AI->>S1: 调用: 查询客户数据
    S1-->>AI: 返回客户信息
    
    AI->>S2: 调用: 查询订单
    S2-->>AI: 返回订单记录
    
    AI->>S3: 调用: 发送邮件
    S3-->>AI: 发送成功
    
    Note over AI,S3: 全程无需 GUI，AI Agent<br/>直接通过 MCP 调用多个服务`,
  },
  {
    title: "五、Python 实战：构建一个 Headless AI 服务",
    body: `让我们用 Python 构建一个简单的 headless AI 服务，展示如何将一个传统功能转变为 AI Agent 友好的 headless 服务。

场景： 一个 "内容摘要服务"，AI Agent 可以调用它来生成文本摘要。`,
    code: [{
      lang: "python",
      filename: "headless_summarizer.py",
      code: `"""
Headless Content Summarizer Service
一个面向 AI Agent 的内容摘要服务
支持 API、MCP 和 CLI 三种交互方式
"""

import asyncio
import json
from typing import Optional
from dataclasses import dataclass, asdict

# ===== 1. 核心业务逻辑（headless，无 GUI） =====

@dataclass
class SummaryResult:
    """摘要结果"""
    original_length: int
    summary: str
    summary_length: int
    compression_ratio: float
    key_points: list[str]
    language: str

class HeadlessSummarizer:
    """Headless 摘要服务——只通过 API/MCP/CLI 交互"""
    
    def __init__(self, model: str = "gpt-4o-mini"):
        self.model = model
    
    async def summarize(self, text: str, max_length: int = 200, 
                        language: str = "zh") -> SummaryResult:
        """
        生成文本摘要——AI Agent 的核心调用入口
        
        Args:
            text: 原文本
            max_length: 摘要最大长度
            language: 输出语言 (zh/en)
        """
        # 实际场景中这里会调用 LLM API
        # 这里用简单算法演示 headless 服务的设计模式
        
        sentences = text.replace('。', '。<SEP>').replace('.', '.<SEP>').split('<SEP>')
        sentences = [s.strip() for s in sentences if s.strip()]
        
        # 简单提取式摘要（实际应调用 LLM）
        key_sentences = sentences[:min(3, len(sentences))]
        summary = '。'.join(key_sentences)
        
        if len(summary) > max_length:
            summary = summary[:max_length] + '...'
        
        return SummaryResult(
            original_length=len(text),
            summary=summary,
            summary_length=len(summary),
            compression_ratio=len(summary) / max(len(text), 1),
            key_points=key_sentences,
            language=language
        )

# ===== 2. REST API 接口（AI Agent 调用方式一） =====

from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI(title="Headless Summarizer API")
summarizer = HeadlessSummarizer()

class SummarizeRequest(BaseModel):
    text: str
    max_length: int = 200
    language: str = "zh"

@app.post("/summarize", response_model=dict)
async def api_summarize(req: SummarizeRequest):
    """AI Agent 通过 REST API 调用摘要服务"""
    result = await summarizer.summarize(
        text=req.text,
        max_length=req.max_length,
        language=req.language
    )
    return asdict(result)

@app.get("/health")
async def health_check():
    """健康检查端点"""
    return {"status": "ok", "service": "headless-summarizer"}

# ===== 3. MCP Server 接口（AI Agent 调用方式二） =====

# pip install mcp
async def run_mcp_server():
    """将服务暴露为 MCP Server，AI Agent 可直接发现和调用"""
    from mcp.server.fastmcp import FastMCP
    
    mcp = FastMCP("headless-summarizer")
    
    @mcp.tool()
    async def summarize_text(text: str, max_length: int = 200) -> dict:
        """为 AI Agent 提供文本摘要能力
        
        Args:
            text: 需要摘要的文本
            max_length: 摘要最大字符数
        """
        result = await summarizer.summarize(text, max_length)
        return asdict(result)
    
    @mcp.tool()
    async def extract_key_points(text: str, num_points: int = 5) -> list[str]:
        """从文本中提取关键要点
        
        Args:
            text: 源文本
            num_points: 提取的要点数量
        """
        result = await summarizer.summarize(text)
        return result.key_points[:num_points]
    
    await mcp.run()

# ===== 4. CLI 接口（AI Agent 调用方式三） =====

import click

@click.group()
def cli():
    """Headless Summarizer CLI - AI Agent 通过命令行调用"""
    pass

@cli.command()
@click.argument('text')
@click.option('--max-length', default=200, help='摘要最大长度')
@click.option('--language', default='zh', help='输出语言')
def summarize(text: str, max_length: int, language: str):
    """通过 CLI 生成文本摘要"""
    result = asyncio.run(summarizer.summarize(text, max_length, language))
    click.echo(json.dumps(asdict(result), ensure_ascii=False, indent=2))

@cli.command()
@click.argument('file', type=click.File('r'))
def batch_summarize(file):
    """批量处理文件中的文本"""
    text = file.read()
    result = asyncio.run(summarizer.summarize(text))
    click.echo(f"原文: {result.original_length} 字")
    click.echo(f"摘要: {result.summary}")

if __name__ == "__main__":
    # 三种启动方式：
    # python headless_summarizer.py api      -> 启动 REST API
    # python headless_summarizer.py mcp      -> 启动 MCP Server
    # python headless_summarizer.py summarize "文本" -> CLI 模式
    import sys
    if len(sys.argv) > 1:
        if sys.argv[1] == "api":
            import uvicorn
            uvicorn.run(app, host="0.0.0.0", port=8000)
        elif sys.argv[1] == "mcp":
            asyncio.run(run_mcp_server())
        else:
            cli()
    else:
        print("Usage: python headless_summarizer.py [api|mcp|<command>]")`,
    }],
  },
  {
    title: "六、AI Agent 如何消费 Headless 服务",
    body: `Headless 服务构建完成后，AI Agent 可以通过多种方式消费它。以下是 Claude Code 通过 MCP 调用 headless 服务的完整示例：`,
    code: [{
      lang: "python",
      filename: "agent_consuming_headless.py",
      code: `"""
AI Agent 消费 Headless 服务的完整示例
演示 Agent 如何组合多个 headless 服务完成复杂任务
"""

import asyncio
import httpx

class AIAgent:
    """模拟 AI Agent 消费多个 headless 服务"""
    
    def __init__(self):
        self.services = {
            "summarizer": "http://localhost:8000",
            "weather": "https://api.weather.example.com",
            "calendar": "https://api.calendar.example.com",
        }
    
    async def daily_briefing(self) -> str:
        """
        AI Agent 自主组合多个 headless 服务，
        生成每日简报——这是 headless 服务的典型使用场景
        """
        # Step 1: 调用天气服务获取今日天气
        weather = await self._get_weather("Beijing")
        
        # Step 2: 调用日历服务获取今日日程
        schedule = await self._get_today_schedule()
        
        # Step 3: 调用摘要服务压缩长文本信息
        news_digest = await self._summarize_news()
        
        # Step 4: AI Agent 综合所有信息生成简报
        briefing = f"""📋 今日简报

🌤️ 天气：{weather['condition']}，{weather['temp']}°C
📅 日程：今日有 {len(schedule)} 个会议
📰 新闻摘要：
{news_digest['summary']}

💡 建议：{'今天适合户外活动' if weather['temp'] > 15 else '建议室内办公'}
"""
        return briefing
    
    async def _get_weather(self, city: str) -> dict:
        """调用 headless 天气服务"""
        # 实际场景中通过 API 调用
        return {"condition": "晴", "temp": 22, "city": city}
    
    async def _get_today_schedule(self) -> list[dict]:
        """调用 headless 日历服务"""
        return [
            {"time": "09:00", "title": "产品评审会"},
            {"time": "14:00", "title": "代码审查"},
            {"time": "16:00", "title": "技术分享"},
        ]
    
    async def _summarize_news(self) -> dict:
        """调用 headless 摘要服务"""
        async with httpx.AsyncClient() as client:
            resp = await client.post(
                f"{self.services['summarizer']}/summarize",
                json={
                    "text": "AI Agent 市场规模预计 2026 年达到 500 亿美元...",
                    "max_length": 100
                }
            )
            return resp.json()

# ===== 运行示例 =====
async def main():
    agent = AIAgent()
    briefing = await agent.daily_briefing()
    print(briefing)

if __name__ == "__main__":
    asyncio.run(main())`,
    }],
  },
  {
    title: "七、对 SaaS 行业的深远影响",
    body: `Headless 趋势不仅仅是技术变化，更是对整个软件商业模式的冲击。

1. 定价模式的重构

传统 SaaS 按人头（per-seat）收费。但当 AI Agent 代替人类使用服务时，这个模式面临根本挑战：
- 一个用户可能有 10 个 AI Agent 同时调用 API
- Agent 的调用量是人类的 100-1000 倍
- 按人头收费不再反映真实的资源消耗

2. API 质量成为核心竞争力

Brandur Leach 的预测正在应验：在产品功能同质化的时代，API 的质量将成为决定性的竞争因素。好的 headless API 意味着：
- 文档清晰，AI Agent 能自动理解
- 错误信息明确，Agent 能自动恢复
- 权限模型支持 Agent 身份

3. 新的创业机会

Headless 趋势催生了新的创业方向：
- MCP Server 市场：为现有 SaaS 构建 MCP 适配器
- Headless-first 新产品：从第一天就只为 AI Agent 设计
- Agent 编排平台：连接多个 headless 服务的工作流引擎`,
    mermaid: `graph LR
    A["SaaS 传统模式"] --> B["按人头收费"]
    B --> C["GUI 驱动"]
    C --> D["人类操作"]
    
    E["Headless SaaS 模式"] --> F["按调用量收费"]
    F --> G["API/MCP 驱动"]
    G --> H["AI Agent 操作"]
    
    D -.->|"效率提升<br/>100-1000x"| H
    class E s1
    class A s0
    classDef s0 fill:#b45309,stroke:#ec971f,color:#fff
    classDef s1 fill:#047857,stroke:#4cae4c,color:#fff`,
  },
  {
    title: "八、对比：传统服务 vs Headless 服务",
    body: `让我们从多个维度对比传统服务和 headless 服务的差异：`,
    table: {
      headers: ["维度", "传统 SaaS", "Headless 服务"],
      rows: [
        ["交互方式", "Web/App GUI", "API/MCP/CLI"],
        ["用户", "人类", "AI Agent"],
        ["定价", "按人头 (per-seat)", "按调用量/按 Agent"],
        ["集成", "OAuth + Webhook", "MCP Protocol"],
        ["自动化", "有限（受 GUI 限制）", "原生支持"],
        ["批量操作", "困难", "天然支持"],
        ["发现机制", "搜索/推荐", "MCP Registry"],
        ["错误处理", "弹窗/提示", "结构化错误码"],
        ["开发重点", "UI/UX 设计", "API 设计与文档"],
        ["安全模型", "用户身份认证", "Agent 身份 + 权限委托"],
      ]
    },
  },
  {
    title: "九、开发者行动指南",
    body: `面对 headless 趋势，开发者应该采取哪些行动？

立即行动（本周）：
1. 为你的服务添加 MCP Server 支持——这是 AI Agent 发现和调用你服务的标准方式
2. 审查 API 文档是否对 AI Agent 友好——结构化、机器可读的文档
3. 考虑增加 CLI 接口——很多 AI Agent 通过 CLI 调用服务

短期规划（本月）：
4. 设计支持 Agent 身份的权限模型——不只是 human auth
5. 实现批量操作 API——Agent 的使用模式与人类不同
6. 优化错误信息——让 AI Agent 能理解并自动恢复

长期策略（本季度）：
7. 探索按调用量的定价模式——准备迎接 Agent 用户
8. 构建 headless-first 的新产品功能——不只是 wrapper
9. 加入 MCP 生态——让服务可被所有 AI Agent 发现`,
    warning: "注意： Headless 不代表完全去掉 GUI。最佳策略是 'headless-first'——先构建强大的 API/MCP 层，GUI 作为可选的展示层。这样既服务 AI Agent，也不放弃人类用户。",
  },
  {
    title: "十、未来展望：Headless 之后是什么？",
    body: `Headless 只是开始。展望未来 1-2 年，我们可以预见：

Agent-to-Agent 经济
当所有服务都是 headless 的，AI Agent 之间将形成直接的调用关系。你的 Agent 可能直接调用供应商的 Agent 来下订单、谈判价格、完成交易——全程无需人类介入。

自主编排的兴起
AI Agent 将自主发现、组合和编排多个 headless 服务来完成复杂任务。不需要人类编写工作流，Agent 会根据目标自动规划最优的服务调用链。

新的安全范式
当 AI Agent 代替人类操作一切时，安全模型必须根本性改变：Agent 身份认证、操作审计、权限委托、异常检测——这些将成为基础设施级别的需求。

开放标准的重要性
MCP 可能只是一个开始。未来可能出现更多 headless 服务的开放标准，就像 REST 和 GraphQL 定义了 API 时代一样。`,
  },
  {
    title: "总结",
    body: `"Headless Everything for Personal AI" 不是某个人的臆想，而是正在发生的技术范式转移。

核心要点回顾：

1. 个人 AI 体验优于直接使用服务——这是 headless 趋势的根本驱动力
2. MCP 是关键协议——它让 AI Agent 能以标准化方式连接任何服务
3. SaaS 定价模式需要重构——per-seat 模式无法适应 Agent 经济
4. API 质量成为核心竞争力——在产品同质化时代，好 API 决定胜负
5. 新创业机会涌现——MCP Server 市场、headless-first 产品、Agent 编排

正如 Brandur Leach 所说："API 不再是负担，而是主要的可销售向量。" 在 2026 年，这句话比以往任何时候都更加真实。

对于开发者来说，现在是构建 headless-first 服务的最佳时机。拥抱 MCP、优化 API、准备迎接 AI Agent 用户——这是未来软件的方向。`,
  },
];

export const blog: BlogPost = {
  id: "blog-034",
  title: "Headless Everything for Personal AI：当 API 成为新的 UI",
  summary: "Matt Webb 预言 'Headless Everything' 即将到来，Salesforce 宣布 Headless 360 'No Browser Required'。本文深度解读 headless AI 趋势的技术原理、商业影响，以及如何用 Python + MCP 构建面向 AI Agent 的 headless 服务。",
  date: "2026-04-20",
  author: "AI Master",
  tags: ["Headless AI", "MCP 协议", "AI Agent", "API 经济", "Salesforce", "SaaS 趋势"],
  content,
  readTime: 18,
};
