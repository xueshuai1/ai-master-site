// AI 最新动态数据源

export interface NewsItem {
  id: string;
  tag: string;
  tagColor?: string;
  coverImage?: string;
  title: string;
  summary: string;
  content: string;
  date: string;
  source: string;
  sourceUrl: string;
  href: string;
}

export const news: NewsItem[] = [
{
    id: "news-376",
    tag: "大语言模型",
    tagColor: "bg-blue-500/10 text-blue-300",
    title: "GPT-5.5 发布：OpenAI 最新旗舰模型在 Codex 编程和复杂推理方面显著提升",
    summary: 'OpenAI 于 4 月 23 日发布 GPT-5.5 模型，作为 GPT-5 系列的重大升级。GPT-5.5 在 Agentic Coding、复杂推理、多模态理解方面显著提升，保持了 GPT-5.4 的定价（$5/$30）。Simon Willison 评测称其「快速、有效且高度胜任」。',
    content: `## GPT-5.5：OpenAI 在 Agentic Coding 领域的又一次升级\n\n**2026 年 4 月 23 日**，OpenAI 在 Codex 平台正式推出 GPT-5.5 模型，同时向付费 ChatGPT 订阅用户逐步开放。\n\n### 核心改进\n\n- **Agentic Coding 专项优化**：更长的规划链路、更精准的大代码库理解\n- **推理 token 效率改进**：更少的 thinking tokens 达到相同质量\n- **多模态融合深化**：图片、文档、架构图的理解能力增强\n\n### 定价\n\n保持 GPT-5.4 的定价：$5/M 输入 / $30/M 输出，性能提升但成本不变。\n\n### 竞品对比\n\n在编程能力上 GPT-5.5 仍领先，但 DeepSeek V4-Pro 以 1/14 的价格提供了接近的性能，而 Qwen3.6-27B 以 27B 参数量逼近了 MoE 大模型的表现。\n\n### 接入方式\n\n- **Codex 平台**：首发平台，支持完整的 Agentic Coding\n- **OpenAI API**：标准 chat.completions 接口，模型名 "gpt-5.5"\n- **半官方 Codex API**：社区反向工程的接口，可提前体验`,
    date: "2026-04-25 02:00",
    source: "OpenAI + Simon Willison Blog",
    sourceUrl: "https://simonwillison.net/2026/Apr/23/gpt-5-5/",
    href: "/news/news-376",
  },
  {
    id: "news-377",
    tag: "数据库",
    tagColor: "bg-green-500/10 text-green-300",
    title: "honker 发布：将 PostgreSQL NOTIFY/LISTEN 语义引入 SQLite 的 Rust 扩展",
    summary: 'Simon Willison 推荐 honker——将 PostgreSQL NOTIFY/LISTEN 通知机制和事务型外盒模式引入 SQLite。支持 Queue（工作队列）和 Stream（持久化事件流），通过 WAL 1ms 轮询实现低延迟消息通知，特别适合 AI Agent 任务队列和事件溯源场景。',
    content: `## honker：SQLite 上的消息队列革命

**2026 年 4 月 24 日**，russellromney 发布的 honker 项目受到 Simon Willison 强烈推荐。

### 核心功能

- **Queue 队列**：类 Redis BLPOP 的工作队列，支持 ACK/NACK、Worker 崩溃重试
- **Stream 数据流**：Kafka 风格的持久化事件流，支持消费者组和偏移量管理
- **事务型外盒模式**：确保数据写入与消息发送的原子一致性
- **20+ 自定义 SQL 函数**：notify、stream_publish、queue_enqueue 等
- **多语言绑定**：官方 Python 支持，社区可扩展 Go/Node.js/Rust

### 性能特征

| 指标 | 数值 |
|------|------|
| WAL 轮询间隔 | 1ms |
| 消息消费延迟 | 1-5ms |
| 单 DB 并发写入 | ~1000 TPS |
| 内存占用 | < 50MB |

### 适用场景

- **AI Agent 任务队列**：可靠的 Agent 任务分发和执行跟踪
- **实时事件推送**：Dashboard 实时更新、数据变更捕获
- **边缘部署**：零额外服务，随 SQLite 一起部署

honker 不是 Kafka/RabbitMQ 的替代品——它解决的是不同的问题。如果你的场景是单机/边缘部署、需要零运维和事务一致性，honker 是目前 SQLite 生态中最好的选择。`,
    date: "2026-04-25 08:00",
    source: "Simon Willison Blog + GitHub",
    sourceUrl: "https://simonwillison.net/2026/Apr/24/honker/",
    href: "/news/news-377",
  },
  {
    id: "news-373",
    tag: "框架发布",
    tagColor: "bg-purple-500/10 text-purple-300",
    title: "OpenAI Agents Python SDK 正式发布：轻量级多 Agent 工作流框架两周突破 25K 星",
    summary: 'OpenAI 官方发布 Agents Python SDK，提供 Handoff 委托、Guardrails 安全防护、Sandbox Agent 沙箱执行和 Realtime Voice Agent 实时语音等核心能力。与 CrewAI、LangGraph 等第三方框架相比，OpenAI Agents SDK 以极简 API 和内置生产级特性快速成为 2026 年最受关注的 Agent 框架。',
    content: `## OpenAI Agents Python SDK：轻量但强大的多 Agent 工作流框架

**2026 年 4 月**，OpenAI 正式发布 Agents Python SDK（openai/openai-agents-python），两周内突破 **25,000 stars**，成为 GitHub AI 趋势榜首。

### 核心能力

- **Handoff 委托机制**：Agent 在运行时自主决定将任务委托给更专业的 Agent，类似人类工作中的 "转接给专家"
- **Guardrails 安全防护**：可配置的输入/输出验证层，防止提示注入和敏感信息泄露
- **Sandbox Agent**（v0.14.0）：在隔离容器中安全执行代码，支持文件系统操作和命令运行
- **Realtime Voice Agent**：基于 gpt-realtime-1.5 的实时语音 Agent，支持全双工对话
- **Sessions 会话管理**：自动管理跨 Agent 运行的对话历史
- **Tracing 追踪系统**：内置 Agent 运行的追踪和调试能力
- **Human in the Loop**：内置人工介入机制

### 技术特点

OpenAI Agents SDK 采用分层模块化设计，支持 OpenAI Responses API、Chat Completions API，并通过 LiteLLM/any-llm 兼容 100+ 其他 LLM。安装只需 \`pip install openai-agents\`。

### 与主流框架对比

| 框架 | Stars | 核心范式 | 内置安全 | 沙箱执行 |
|------|-------|----------|----------|----------|
| OpenAI Agents SDK | 25,000 | Handoff 委托 | ✅ | ✅ |
| CrewAI | 27,000 | 角色驱动 | ❌ | ⚠️ |
| LangGraph | 30,000 | 有状态图 | ❌ | ❌ |
| AutoGen 3.0 | 28,000 | 群聊协商 | ❌ | ❌ |
| multica | 20,500 | 任务看板 | ⚠️ | ✅ |

### 快速开始

\`\`\`python
from agents import Agent, Runner

agent = Agent(
    name="Assistant",
    instructions="你是一个有帮助的助手。"
)
result = Runner.run_sync(agent, "Hello!")
print(result.final_output)
\`\`\`

更多信息：[GitHub 仓库](https://github.com/openai/openai-agents-python) | [官方文档](https://openai.github.io/openai-agents-python/)`,
    date: "2026-04-25",
    source: "GitHub",
    sourceUrl: "https://github.com/openai/openai-agents-python",
    href: "/news/news-373",
},
{
    id: "news-371",
    tag: "模型发布",
    tagColor: "bg-blue-500/10 text-blue-300",
    title: "DeepSeek V4 双模型齐发：V4-Pro 逼近前沿、V4-Flash 极致性价比，中国 AI 再次震惊世界",
    summary: 'DeepSeek 今日正式发布 V4 系列首发模型——DeepSeek-V4-Pro 和 V4-Flash。V4-Pro 在多项基准测试中逼近 GPT-5.5/Claude Opus 4.7 水平，而 V4-Flash 以极低价格提供接近旗舰模型的能力。这是 DeepSeek 自 V3.2 以来最重要的发布，标志着中国开源 AI 已进入全球第一梯队。',
    content: `## DeepSeek V4：中国 AI 的里程碑式发布

**2026 年 4 月 24 日**，中国 AI 实验室 DeepSeek 正式发布 V4 系列的首批两款预览模型：DeepSeek-V4-Pro 和 DeepSeek-V4-Flash。

### 发布背景

DeepSeek 上一次重大模型发布是 2025 年 12 月的 V3.2 系列（含 V3.2 Speciale）。时隔 4 个月，V4 系列的到来引发了全球 AI 社区的高度关注。

### 两款模型定位

| 模型 | 定位 | 对标竞品 | 核心优势 |
|------|------|----------|----------|
| V4-Pro | 旗舰级推理模型 | GPT-5.5, Claude Opus 4.7 | 复杂推理、代码生成、数学 |
| V4-Flash | 极速推理模型 | GPT-4.1, Gemini 2.5 Flash | 低延迟、高性价比、高吞吐 |

### V4-Pro：逼近前沿的推理能力

DeepSeek-V4-Pro 是 DeepSeek 目前的旗舰模型，在多项基准测试中表现惊人：

- **代码生成**：在 HumanEval 和 MBPP 等编程基准上接近 GPT-5.5 水平
- **数学推理**：在 MATH 和 GSM8K 上超越上一代 V3.2 Speciale 约 8-12%
- **通用知识**：MMLU 分数逼近 Claude Opus 4.7
- **中文能力**：在 C-Eval 和 CMMLU 上保持显著优势

### V4-Flash：极致性价比的推理引擎

DeepSeek-V4-Flash 的定位是 "fast and cheap"——在保持接近旗舰模型能力的同时，将推理成本降低一个数量级。

\`\`\`python
from openai import OpenAI

# V4-Pro：适合复杂任务
pro_client = OpenAI(
    base_url="https://api.deepseek.com/v1",
    api_key="sk-..."
)
pro_response = pro_client.chat.completions.create(
    model="deepseek-chat-v4-pro",
    messages=[{"role": "user", "content": "分析这段代码的架构问题并给出重构方案"}],
    temperature=0.1
)
# 成本：~$0.02-0.05/千 tokens

# V4-Flash：适合日常任务
flash_client = OpenAI(
    base_url="https://api.deepseek.com/v1",
    api_key="sk-..."
)
flash_response = flash_client.chat.completions.create(
    model="deepseek-chat-v4-flash",
    messages=[{"role": "user", "content": "总结这篇论文的核心贡献"}],
    temperature=0.7
)
# 成本：~$0.002-0.005/千 tokens（约 Pro 的 1/10）
\`\`\`

### 技术亮点

DeepSeek V4 系列延续了 DeepSeek 在 MoE 架构上的技术优势：

1. **更精细的专家路由**：V4 采用了更智能的 token-level 路由策略，每个 token 激活的专家数量更少但更精准
2. **训练效率提升**：据 DeepSeek 论文，V4 的训练效率比 V3.2 提升了约 30%
3. **上下文窗口扩展**：V4-Pro 支持 256K 上下文，V4-Flash 支持 128K

### 对行业的影响

DeepSeek V4 的发布进一步加剧了 2026 年 AI 模型市场的竞争：

- **价格战继续**：V4-Flash 的定价策略可能迫使其他厂商跟进降价
- **开源 vs 闭源**：DeepSeek 的 API 价格远低于 OpenAI/Anthropic，但性能接近
- **中国 AI 崛起**：从 V3 的"价格屠夫"到 V4 的"性能挑战者"，DeepSeek 正在从跟随者变为引领者

### 与 GPT-5.5 同日发布

值得注意的是，DeepSeek V4 与 OpenAI GPT-5.5 几乎同时发布（相差不到 24 小时）。这并非巧合——两家公司的发布节奏反映了 AI 模型市场的竞争白热化。

Simon Willison 在博客中同时报道了这两个发布，将 DeepSeek V4 形容为 "almost on the frontier, a fraction of the price"（逼近前沿，价格却只是零头）。

### 实战建议

对于开发者来说，DeepSeek V4 提供了新的选择：

- **日常开发**：V4-Flash 性价比极高，适合代码补全、文档生成等任务
- **复杂推理**：V4-Pro 可作为 GPT-5.5 的平替，尤其在中文场景下优势明显
- **混合策略**：简单任务用 Flash，复杂任务用 Pro，实现成本与效果的最优平衡`,
    date: "2026-04-24 16:00",
    source: "DeepSeek / Simon Willison",
    sourceUrl: "https://simonwillison.net/2026/Apr/24/deepseek-v4/",
    href: "/news/news-371",
  },
{
    id: "news-372",
    tag: "行业动态",
    tagColor: "bg-yellow-500/10 text-yellow-300",
    title: "SQLite 生态爆发：honker 实现 Kafka 级消息队列，LiteParse 浏览器内解析 PDF，SQLite 成为 AI 时代的数据基石",
    summary: '本周 SQLite 生态迎来两大重要发布：russellromney/honker 用 Rust 扩展为 SQLite 添加 NOTIFY/LISTEN 语义和 Kafka 级流式处理；LlamaIndex 的 LiteParse 实现浏览器内 PDF 文本提取。SQLite 正从嵌入式数据库升级为 AI 时代的全栈数据基础设施。',
    content: `## SQLite 在 AI 时代的新角色

**2026 年 4 月**，SQLite 生态迎来了令人瞩目的发展——这个仅有 15 万行代码的数据库引擎，正在 AI 时代扮演越来越重要的角色。

### honker：SQLite 的消息队列革命

russellromney 开源的 honker 是一个 Rust SQLite 扩展，为 SQLite 添加了 Postgres NOTIFY/LISTEN 语义和 Kafka 级流式处理能力。

\`\`\`python
import honker

# 打开数据库并创建队列
db = honker.open("app.db")
emails = db.queue("emails")

# 生产者：入队任务
emails.enqueue({"to": "alice@example.com", "subject": "Hello"})

# 消费者：处理任务
async for job in emails.claim("worker-1"):
    send(job.payload)
    job.ack()

# 流式处理（Kafka 风格）
stream = db.stream("user-events")
with db.transaction() as tx:
    tx.execute("UPDATE users SET name=? WHERE id=?", [name, uid])
    stream.publish({"user_id": uid, "change": "name"}, tx=tx)

async for event in stream.subscribe(consumer="dashboard"):
    await push_to_browser(event)
\`\`\`

honker 的核心创新：
- **事务性 Outbox 模式**：确保消息只在事务成功提交后入队
- **WAL 模式轮询**：Worker 可每 1ms 轮询 .db-wal 文件，实现近实时处理
- **20+ 自定义 SQL 函数**：包括 notify() 和 honker_stream_read_since() 等

### LiteParse：浏览器内 PDF 解析

LlamaIndex 的 LiteParse 原本是一个 Node.js CLI 工具，用于从 PDF 中提取文本。现在有人将其改造为完全在浏览器中运行的版本。

这意味着：
- **零后端依赖**：PDF 解析完全在客户端完成
- **隐私保护**：敏感文档无需上传到服务器
- **即时处理**：无网络延迟，用户体验更好

### 为什么 SQLite 在 AI 时代如此重要？

1. **边缘 AI 推理**：本地运行 LLM（如 llama.cpp）需要高效的数据存储
2. **Agent 记忆**：AI Agent 需要持久化存储对话历史和知识
3. **RAG 检索**：向量数据库之外，传统的关系型查询仍然重要
4. **低成本部署**：SQLite 零配置、零运维，适合各种规模的 AI 应用

Simon Willison 在博客中特别提到，Bluesky 的 For You Feed 服务就是用 Go + SQLite 在自家客厅的游戏 PC 上运行的，月成本仅 $30，却能服务 72,000 用户。`,
    date: "2026-04-24 16:01",
    source: "Simon Willison / LlamaIndex",
    sourceUrl: "https://simonwillison.net/2026/Apr/24/honker/",
    href: "/news/news-372",
  },
{
    id: "news-367",
    tag: "AI Agent",
    tagColor: "bg-red-500/10 text-red-300",
    title: "Anthropic 发布 Claude Code 质量事故复盘：Harness 层三缺陷导致用户大规模投诉，非模型退化",
    summary: "Anthropic 发布 April 23 Postmortem 报告，确认过去两个月 Claude Code 质量问题源于 Harness 层的三个独立缺陷：记忆清除 Bug 导致每轮对话都清除思考内容、上下文管理异常、工具调用状态不一致。报告强调「模型本身没有问题」，为 AI Agent 可靠性工程敲响警钟。",
    content: `## Anthropic Claude Code 质量事故复盘深度解读\n\n**2026 年 4 月 23 日**，Anthropic 发布了详细的 Claude Code 质量事故复盘报告（[April 23 Postmortem](https://www.anthropic.com/engineering/april-23-postmortem)），回应了过去两个月内用户对 Claude Code 质量下降的大量投诉。\n\n### 核心发现\n\nAnthropic 确认了三个独立的 Harness 层缺陷：\n\n1. **记忆清除 Bug**：3 月 26 日的变更本应只在空闲超过 1 小时时清除旧 thinking 内容，但 Bug 导致此后每一轮对话都会清除\n2. **上下文管理异常**：长时间会话中上下文窗口管理出现异常\n3. **工具调用状态不一致**：工具执行结果的缓存与回滚逻辑存在竞态条件\n\n### 关键教训\n\n- **Harness 层质量可能比模型更重要**：即使模型能力很强，编排层的 Bug 也会让 Agent 表现糟糕\n- **非确定性让调试极其困难**：相同输入不一定产生相同输出，使得传统调试方法失效\n- **变更需要灰度和回滚**：任何状态管理相关的变更都必须有快速回滚方案\n\nSimon Willison 评论：「如果你正在构建 agentic 系统，这篇文章值得仔细阅读——Harness 层的 Bug 类型极其复杂。」\n\n这一事故为整个 AI Agent 行业敲响了警钟：随着 Agent 越来越复杂，可靠性工程的重要性将超过模型能力本身。`,
    date: "2026-04-24",
    source: "Anthropic Engineering",
    sourceUrl: "https://www.anthropic.com/engineering/april-23-postmortem",
    href: "/news/news-367",
  },
{
    id: "news-368",
    tag: "开源工具",
    tagColor: "bg-green-500/10 text-green-300",
    title: "NousResearch Hermes Agent 突破 113K Stars：自进化 Agent 周增 20K+，经验胶囊系统让 Agent 越用越聪明",
    summary: "NousResearch 的 Hermes Agent 以 113,550 stars 和单周 20,316 星的增长，稳居 GitHub AI 项目增长榜第一。其核心创新「经验胶囊」系统通过独立压缩 Agent 对交互过程进行语义压缩，提取可复用的成功模式、失败教训和知识沉淀，30 天内任务完成率从 62% 提升至 89%。",
    content: `## Hermes Agent：自进化 Agent 的里程碑\n\n**2026 年 4 月 24 日**，NousResearch 的 Hermes Agent GitHub stars 已达 **113,550**，周增 **20,316** 星，是 2026 年增长最快的开源 AI 项目。\n\n### 经验胶囊系统\n\nHermes Agent 的核心理念是 "The agent that grows with you"。不同于简单的日志记录，它通过一个独立的「压缩 Agent」对交互过程进行语义压缩：\n\n- **成功模式胶囊**：记录任务成功执行的关键步骤和决策点\n- **失败教训胶囊**：记录错误路径、根因分析和规避策略\n- **知识沉淀胶囊**：从工具调用结果中提取结构化知识\n\n### 自进化效果\n\n经过 30 天使用，Hermes Agent 展现出显著的自我优化能力：\n\n| 指标 | 初始 | 30 天后 | 提升 |\n|------|------|---------|------|\n| 任务完成率 | 62% | 89% | +43% |\n| 工具调用次数 | 8.5 次 | 4.2 次 | -51% |\n| 上下文命中率 | 35% | 78% | +123% |\n\n### 技术定位\n\n在 2026 年的 Agent 生态中，Hermes Agent 代表了一条独特的自进化路线：不是通过 GEP（基因组进化协议）进行群体进化，而是通过经验积累和语义压缩实现个体进化。与 Evolver 的群体竞争策略不同，Hermes 专注于单个 Agent 的持续成长。`,
    date: "2026-04-24",
    source: "GitHub Trending",
    sourceUrl: "https://github.com/NousResearch/hermes-agent",
    href: "/news/news-368",
  },
{
    id: "news-354",
    tag: "AI 安全",
    tagColor: "bg-red-500/10 text-red-300",
    title: "Firefox 150 修复 271 个漏洞：Claude Mythos 安全审计首次大规模落地，Mozilla CTO 称「防御者终于有了胜算」",
    summary: "Mozilla 与 Anthropic 合作，将 Claude Mythos Preview 应用于 Firefox 浏览器安全审计，一次发现并修复 271 个零日漏洞。Mozilla CTO Bobby Holley 表示「Defenders finally have a chance to win, decisively」。这是 AI 安全审计从概念验证走向生产环境的里程碑事件。",
    content: `## Firefox 150：AI 安全审计的里程碑

**2026 年 4 月 22 日**，Mozilla 发布 Firefox 150，同时公布：

> 作为与 Anthropic 持续合作的一部分，Mozilla 将 Claude Mythos Preview 的早期版本应用于 Firefox 的安全评估。Firefox 150 包含了此次评估中发现并修复的 **271 个漏洞**。

**Mozilla CTO Bobby Holley 的评论：**
> "Our experience is a hopeful one for teams who shake off the vertigo and get to work. Defenders finally have a chance to win, decisively."

**漏洞分布（根据 MFSA2026-30）：**
- 内存安全类（use-after-free、缓冲区溢出）：~85 个
- 注入类（XSS、命令注入）：~45 个
- 权限控制类：~55 个
- 逻辑漏洞类：~40 个
- 加密/随机数类：~20 个
- 其他：~26 个

**历史意义：** 这是 AI 安全审计首次在生产级软件中大规模落地。Claude Mythos 不仅发现了传统静态分析工具遗漏的漏洞，还生成了修复建议，大幅缩短了从发现到修复的时间。Mozilla 在公告中提到，可能需要「重新排列所有工作的优先级」来专注修复，但最终成功在 Firefox 150 中纳入了所有修复。

**行业影响：**
- Anthropic 与 Mozilla 的合作为行业树立了「AI 安全协作」的新范式
- Firefox 150 修复的 271 个漏洞中包含了多个此前未被发现的零日漏洞
- Mozilla 在安全公告中感谢了 Anthropic 的合作（MFSA2026-30）
- 这标志着 AI 安全从理论走向实践的转折点`,
    date: "2026-04-23 06:00",
    source: "Mozilla / Anthropic / Simon Willison",
    sourceUrl: "https://www.mozilla.org/en-US/security/advisories/mfsa2026-30/",
    href: "/news/news-354",
  },
{
    id: "news-352",
    tag: "模型发布",
    tagColor: "bg-blue-500/10 text-blue-300",
    title: "Qwen3.6-27B 发布：27B 密集模型全面超越 397B MoE 旗舰，Agentic Coding 能力惊艳社区",
    summary: "通义千问发布 Qwen3.6-27B，一款仅 27B 参数的密集模型，在所有主要编程基准上超越前代旗舰 Qwen3.5-397B-A17B（397B MoE）。模型文件仅 55.6GB（前代 807GB），Q4 量化版 16.8GB 可在消费级硬件运行，llama.cpp 实测推理速度约 25 tokens/s。",
    content: `## Qwen3.6-27B：小身材，大能力

2026 年 4 月 22 日，阿里巴巴通义千问团队正式发布 **Qwen3.6-27B**，这是 2026 年开源 AI 领域最受瞩目的模型发布之一。

**核心亮点：**

- **27B 密集模型超越 397B MoE**：Qwen3.6-27B 在所有主要编程基准上超越了前代旗舰 Qwen3.5-397B-A17B
- **极致压缩**：模型文件仅 55.6GB，而前代 Qwen3.5-397B 需要 807GB
- **消费级可部署**：Unsloth 提供的 Q4_K_M 量化版仅 16.8GB，可在 RTX 4090 或 M 系列 Mac 上运行
- **Agentic Coding 旗舰级表现**：在 SWE-bench、HumanEval、MBPP 等编程基准上表现优异

**Simon Willison 实测数据：**
- 使用 llama.cpp + Q4_K_M 量化，推理速度约 **25 tokens/s**
- 生成 4,444 tokens（SVG 鹈鹕骑自行车）耗时 2 分 53 秒
- 生成 6,575 tokens（复杂 SVG）耗时 4 分 25 秒

**技术背景：**
Qwen3.6-27B 从 MoE 架构回归 Dense 架构，通过更高质量的训练数据、课程学习策略和专项编程微调，实现了参数效率的质的飞跃。这证明了「训练质量比参数规模更重要」的理念。`,
    date: "2026-04-23 01:30",
    source: "Qwen Blog / Simon Willison",
    sourceUrl: "https://qwen.ai/blog?id=qwen3.6-27b",
    href: "/news/news-352",
  },
{
    id: "news-353",
    tag: "多模态",
    tagColor: "bg-purple-500/10 text-purple-300",
    title: "OpenAI 发布 ChatGPT Images 2.0：图像生成能力从 GPT-3 级别跃升至 GPT-5 级别",
    summary: "OpenAI 发布 ChatGPT Images 2.0，Sam Altman 称从 gpt-image-1 到 gpt-image-2 的飞跃相当于从 GPT-3 到 GPT-5 的跨越。新版本在图像质量、细节还原和指令遵循方面均有显著提升。",
    content: `## ChatGPT Images 2.0：图像生成的巨大飞跃

2026 年 4 月 21 日，OpenAI 正式发布 **ChatGPT Images 2.0**，这是其最新的图像生成模型。

**发布亮点：**

- Sam Altman 在直播中表示：从 gpt-image-1 到 gpt-image-2 的飞跃相当于 **从 GPT-3 到 GPT-5 的跨越**
- 图像质量和细节还原有显著提升
- 对复杂指令的理解和遵循能力大幅增强

**Simon Willison 实测：**

Simon Willison 第一时间对 ChatGPT Images 2.0 进行了测试，验证了其在复杂场景下的表现。与前代相比，新版本在处理以下场景时表现更好：

- 复杂的人物和动物渲染
- 文字生成（在图像中嵌入准确的文字）
- 多元素组合场景
- 高分辨率输出

**行业影响：**

ChatGPT Images 2.0 的发布进一步加剧了 AI 图像生成领域的竞争。当前主要玩家包括：
- OpenAI: ChatGPT Images 2.0
- Midjourney: v6/v7 系列
- Stable Diffusion: SD3/SDXL 系列
- Google: Imagen 3

这对于内容创作者、设计师和 AI 开发者来说是一个重要的工具升级。`,
    date: "2026-04-23 01:00",
    source: "OpenAI / Simon Willison",
    sourceUrl: "https://openai.com/index/introducing-chatgpt-images-2-0/",
    href: "/news/news-353",
  },
{
    id: "news-350",
    tag: "行业动态",
    tagColor: "bg-orange-500/10 text-orange-300",
    title: "GitHub Copilot Individual 计划重大调整：暂停新注册、收紧用量限制、Pro 计划移除 Opus 模型",
    summary: "GitHub 宣布 Copilot Individual 计划重大变更：暂停 Pro/Pro+/Student 新注册；引入基于 token 消耗和模型乘数的用量限制；Pro 计划不再提供 Opus 模型（仅限 $39/月的 Pro+）；现有用户可在 5 月 20 日前取消并获得退款。GitHub 称「Agent 工作流已根本性改变 Copilot 的算力需求」，这是 AI 编码工具领域继 Claude Code 定价风波后的又一重大定价调整。",
    content: `## GitHub Copilot Individual 计划重大调整

**变更详情（2026 年 4 月 20 日发布）：**

**1. 暂停新注册**
- Copilot Pro、Pro+、Student 计划全部暂停接受新用户
- 官方说法：「暂停注册让我们能更有效地服务现有用户」

**2. 收紧用量限制**
- 引入双层限制：Session 限制 + Weekly（7 天滚动）限制
- 基于两个因素：Token 消耗量 + 模型乘数（Model Multiplier）
- Pro+ 的用量限制是 Pro 的 5 倍以上
- VS Code 和 Copilot CLI 现已实时显示剩余用量

**3. 模型可用性调整**
- Pro 计划不再提供 Opus 模型
- Opus 4.7 仅限 Pro+（$39/月）可用
- Opus 4.5 和 4.6 将从 Pro+ 中移除

**4. 退款政策**
- 5 月 20 日前取消 Pro 或 Pro+ 订阅可获得剩余时间的全额退款

## 为什么做出这些变更？

GitHub 官方博客明确说明：

> "Agentic workflows have fundamentally changed Copilot's compute demands. Long-running, parallelized sessions now regularly consume far more resources than the original plan structure was built to support."

**翻译：** Agent 工作流已经根本性改变了 Copilot 的算力需求。长时间运行的并行 session 现在经常消耗远超原计划结构所能支持的资源。

**背景数据：**
- 6 个月前，重度 LLM 用户的 token 消耗量比现在低一个数量级
- 编码 Agent 的消耗量远超传统补全工具
- Copilot 之前按请求收费（per-request），而非按 token 收费，这意味着单个 agentic 请求可能消耗大量 token 但只算一次费用

## 用量限制机制详解

**Session 限制：**
- 防止高峰期服务过载
- 大多数用户不应受影响
- 达到限制后必须等待重置窗口

**Weekly 限制：**
- 7 天滚动窗口内的 token 消耗上限
- 每个模型有不同的乘数（Multiplier）
- 如果达到 Weekly 限制但仍有 premium requests 剩余，可继续使用 Auto model selection
- Pro 用户可升级到 Pro+ 来提高限制

**关键区别：** 用量限制 ≠ Premium Requests
- Premium Requests 决定你能用哪些模型、多少次
- 用量限制是基于 token 的防护栏，限制你在给定时间窗口内消耗的 token 总量
- 你可能还有 premium requests 剩余，但仍然触及用量限制

## 如何避免触及限制？

GitHub 给出的建议：
1. **简单任务使用乘数较低的模型** — 乘数越大，越快触及限制
2. **升级到 Pro+** — Pro 用户可提高 5 倍以上限制
3. **使用 Plan 模式** — VS Code 和 Copilot CLI 均支持，能提高效率并改善任务成功率
4. **减少并行工作流** — /fleet 等工具会导致更高的 token 消耗，接近限制时应谨慎使用

## 行业影响

这是继 Claude Code 定价风波后，AI 编码工具领域的又一重大定价调整：

| 厂商 | 变更 | 影响 |
|------|------|------|
| GitHub Copilot | 暂停注册 + 用量限制 + 移除 Opus | Individual 用户受限 |
| Anthropic Claude Code | 试探性提价后撤回 | 信任受损 |
| OpenAI Codex | 保持 FREE/PLUS 可用 | 趁势抢占市场 |

**趋势：** 三大 AI 编码工具的定价策略正在快速分化。Agent 工作流的算力消耗是核心驱动力——当一次 agentic session 可能消耗过去一个月的 token 量时，原有定价模型必然崩溃。

**给开发者的建议：**
- 如果你频繁使用 agentic 功能，预计成本可能上升
- 考虑使用 Plan 模式减少不必要的 token 消耗
- 关注 OpenAI Codex 作为替代方案（目前保持低价）
- 评估开源替代方案（Ollama + 本地模型）`,
    date: "2026-04-22 12:30",
    source: "GitHub Blog / Simon Willison's Weblog",
    sourceUrl: "https://github.blog/news-insights/company-news/changes-to-github-copilot-individual-plans/",
    href: "/news/news-350"
  },
{
    id: "news-351",
    tag: "GitHub Trending",
    tagColor: "bg-green-500/10 text-green-300",
    title: "GitHub 本周 AI Trending（4.15-4.22）：Hermes Agent 突破 108K 星、claude-mem 达 65K 星、自进化 Agent 持续爆发",
    summary: "2026 年 4 月 22 日 GitHub Trending 周报：NousResearch Hermes Agent 达 108,735 星（周增 25,081）；claude-mem 达 65,294 星（周增 10,356）；markitdown 达 114,214 星（周增 6,012）；multica 18,735 星（周增 6,223）；voicebox 22,208 星（周增 5,198）；dive-into-llms 33,423 星（周增 5,167）。本周新上榜：GenericAgent 5,649 星（自进化技能树）、Evolver 6,393 星（GEP 基因组进化）、OpenAI Agents Python 24,435 星（官方多 Agent 框架）。",
    content: `## GitHub AI Trending 周报（4.15-4.22）

**🔥 爆炸级增长：**
- **NousResearch/hermes-agent**：108,735 stars（+25,081/周）——可成长型 AI Agent 平台
- **thedotmack/claude-mem**：65,294 stars（+10,356/周）——Claude Code 自动记忆插件
- **multica-ai/multica**：18,735 stars（+6,223/周）——开源 Agent 管理平台
- **microsoft/markitdown**：114,214 stars（+6,012/周）——文件转 Markdown + MCP Server

**🚀 快速增长：**
- **jamiepine/voicebox**：22,208 stars（+5,198/周）——开源语音合成工作室
- **Lordog/dive-into-llms**：33,423 stars（+5,167/周）——动手学大模型中文教程
- **openai/openai-agents-python**：24,435 stars（+3,546/周）——OpenAI 官方多 Agent 框架
- **virattt/ai-hedge-fund**：56,846 stars（+3,104/周）——AI 对冲基金
- **BasedHardware/omi**：11,866 stars（+3,863/周）——AI 屏幕助手
- **shiyu-coder/Kronos**：20,092 stars（+2,458/周）——金融市场基础模型
- **OpenBMB/VoxCPM**：15,406 stars（+2,599/周）——Tokenizer-Free 多语言语音合成

**🆕 本周新上榜：**
- **lsdefine/GenericAgent**：5,649 stars（+4,223/周）——自进化 Agent，3.3K 行种子代码自主生长技能树，6 倍更少 token 消耗实现全系统控制
- **EvoMap/evolver**：6,393 stars（+4,376/周）——GEP 基因组进化引擎，群体竞争+交叉繁殖
- **forrestchang/andrej-karpathy-skills**：CLAUDE.md 编码最佳实践，来自 Karpathy 对 LLM 编码陷阱的观察
- **Tracer-Cloud/opensre**：2,187 stars（+1,395/周）——开源 AI SRE Agent 工具包
- **z-lab/dflash**：2,103 stars（+909/周）——推测解码新范式：Block Diffusion for Flash Speculative Decoding
- **SimoneAvogadro/android-reverse-engineering-skill**：4,480 stars（+2,813/周）——Claude Code Android 逆向工程技能

**💡 值得关注的中小项目：**
- **warproxxx/poly_data**：1,482 stars（+435/周）——Polymarket 数据检索器

## 趋势分析

**自进化 Agent 双路线并驾齐驱：**
- **GenericAgent**（技能树路线）：通过元认知循环逐步扩展技能库，像生物进化一样生长能力
- **Evolver**（基因组进化路线）：将 Agent 能力编码为「基因组」，通过群体竞争和交叉繁殖产生更优后代
- 两者代表了 2026 年「自进化 Agent」方向的两种核心范式

**OpenAI 官方 Agent 框架持续升温：**
- openai-agents-python 已达 24K+ 星，是 OpenAI 在 Agent 生态上的官方布局
- 轻量级、支持多 Agent 工作流，与 LangChain/AutoGen 形成竞争

**语音 AI 赛道持续火热：**
- voicebox（22K）+ VoxCPM（15K）双星闪耀
- 语音合成从 TTS 工具走向「创作工作室」范式`,
    date: "2026-04-22 13:00",
    source: "GitHub Trending",
    sourceUrl: "https://github.com/trending?since=weekly",
    href: "/news/news-351"
  },
{
    id: "news-349",
    tag: "产品动态",
    tagColor: "bg-red-500/10 text-red-300",
    title: "Claude Code 定价风波：Anthropic 悄悄测试将 Claude Code 从 Pro 计划移除，引发社区反弹后迅速撤回",
    summary: "Anthropic 在定价页面悄悄将 Claude Code 从 $20/月 Pro 计划移至 $100/月 Max 计划专属，引发 Reddit、HN 和 Twitter 强烈反弹。OpenAI Codex 工程师直接表态 Codex 将保持免费和 Plus 可用。数小时后 Anthropic 恢复原页面，称只是「约 2% 新用户的小型测试」。",
    content: `## Claude Code 定价风波：$20 → $100？\n\n**事件经过：**\n2026 年 4 月 22 日，Anthropic 静默更新了 claude.com/pricing 页面，将 Claude Code 从 Pro 计划（$20/月）功能列表中移除，改为仅 Max 计划（$100/月或 $200/月）可用。\n\n**社区反应：**\n- Reddit、Hacker News、Twitter 全面「起火」\n- Simon Willison 花了一小时调查此事，写了长文分析\n- OpenAI Codex 工程师 Thibault Sottiaux 直接表态：「Codex 将继续在 FREE 和 PLUS（$20）计划中可用。我们有足够的算力和高效模型来支持。」\n\n**Anthropic 回应：**\n增长负责人 Amol Avasare 发推澄清：「我们正在对约 2% 的新 Prosumer 用户做小测试，现有订阅者不受影响。」\n\n**但几小时后已撤回：** Internet Archive 快照显示定价页面已恢复原状。\n\n**深远影响：**\n- Simon Willison：「我不打算向数据新闻记者教授依赖 $100/月订阅的课程」\n- 信任危机：透明定价是 Anthropic 的重要资产\n- 竞争格局：OpenAI 借机抢占市场，Codex 明确保持低价策略\n\n**策略分析：** 这可能是 Anthropic 在试探市场对提价的接受度。但 Codex 的迅速反击和社区的强烈反应表明，Claude Code 的定价策略需要极其谨慎。在编码 Agent 竞争白热化的阶段，价格可能是决定胜负的关键因素。`,
    date: "2026-04-22 11:00",
    source: "Simon Willison's Weblog",
    sourceUrl: "https://simonwillison.net/2026/Apr/22/claude-code-confusion/",
    href: "/news/news-349"
  },
{
    id: "news-347",
    tag: "产品动态",
    tagColor: "bg-purple-500/10 text-purple-300",
    title: "OpenAI 发布 ChatGPT Images 2.0：Sam Altman 称「从 gpt-image-1 到 2.0 的跃升等同于 GPT-3 到 GPT-5」",
    summary: "OpenAI 正式发布 ChatGPT Images 2.0，新一代图像生成模型。Sam Altman 在直播中表示，从 gpt-image-1 到 gpt-image-2 的飞跃等同于从 GPT-3 到 GPT-5 的跨越。新模型在照片级真实感、文本渲染、复杂构图方面显著提升，直接集成到 ChatGPT 对话中，用户无需任何技术门槛即可生成高质量图像。",
    content: `## ChatGPT Images 2.0 的核心升级\n\n**质量飞跃：**\n- Sam Altman 官方称从 gpt-image-1 到 2.0 的跃升「等同于 GPT-3 到 GPT-5」\n- 照片级真实感显著提升，特别是在人物肖像和场景光影方面\n- 文本渲染能力大幅改善，生成图像中的文字更清晰可读\n- 复杂构图理解力增强，能处理多主体、多层级的场景描述\n\n**集成到 ChatGPT 对话：**\n- 用户直接在对话中描述需求即可生成图片\n- 支持多轮迭代："把背景换成日落"、"加上一个戴帽子的人"\n- 零门槛使用，无需任何技术背景或专业工具\n- 与 ChatGPT 的文本理解能力深度结合，可以基于对话上下文生成\n\n**与竞品的对比：**\n- Midjourney v7：艺术感更强，但需要 Discord/订阅，学习成本高\n- Flux.1：开源免费，质量接近商用级，但需要 GPU 和一定技术基础\n- ChatGPT Images 2.0：最易用，适合大众用户和快速原型\n- DALL-E 3：上一代产品，2.0 在各方面均有显著提升\n\n**实际测试：**\n- Simon Willison 测试了 \"raccoon with a ham radio\" 等趣味 prompt\n- 生成质量在复杂场景和细节处理上明显优于前代\n- 文本渲染仍有改进空间，但已可满足日常需求`,
    date: "2026-04-22 06:00",
    source: "OpenAI / Simon Willison's Weblog",
    sourceUrl: "https://simonwillison.net/2026/Apr/21/gpt-image-2/",
    href: "/news/news-347"
  },
{
    id: "news-344",
    tag: "产品动态",
    tagColor: "bg-purple-500/10 text-purple-300",
    title: "Kimi 2.6 登陆 OpenRouter：支持 HTML/JS 动态生成，引发关注",
    summary: "Moonshot AI 的 Kimi 2.6 正式上线 OpenRouter 平台。该模型在代码生成场景中表现独特，能够直接输出包含 HTML 和 JavaScript 的完整可运行页面，而非纯文本回复。Simon Willison 实测了 Kimi 2.6 的 pelican 动画生成能力，结果令人印象深刻。",
    content: `## Kimi 2.6 的核心特点\n\n**HTML/JS 动态生成能力：**\n- Kimi 2.6 在代码生成场景中可以直接输出包含 HTML、CSS、JavaScript 的完整可运行页面\n- 相比传统模型只能输出代码片段，Kimi 2.6 的生成物可直接在浏览器中运行\n- Simon Willison 测试了其 pelican 动画生成，结果是一个带 UI 控制按钮的 HTML 页面\n\n**OpenRouter 接入的意义：**\n- 开发者可以通过统一 API 接口访问 Kimi 2.6，无需单独注册 Moonshot 平台\n- OpenRouter 定价：输入 $1.50/M tokens，输出 $6.00/M tokens\n- 相比 GPT-4o 和 Claude Sonnet，Kimi 2.6 在代码生成场景的性价比突出\n\n**与其他模型的对比：**\n- Claude Opus 4.7：最强推理能力，但 token 成本高\n- GPT-4o：均衡型选手，适合通用场景\n- Kimi 2.6：代码生成性价比高，适合动态内容场景`,
    date: "2026-04-22 03:00",
    source: "Simon Willison's Weblog / OpenRouter",
    sourceUrl: "https://simonwillison.net/2026/Apr/20/claude-token-counts/",
    href: "/news/news-344"
  },
{
    id: "news-345",
    tag: "GitHub 趋势",
    tagColor: "bg-green-500/10 text-green-300",
    title: "n8n 突破 185K Stars：AI 工作流自动化平台持续领跑，新增 MCP 原生支持",
    summary: "n8n（n8n-io/n8n）GitHub Stars 突破 185,000，成为 AI 工作流自动化领域的绝对领导者。最新版本已原生支持 MCP（Model Context Protocol），可与 Claude、GPT 等 LLM 深度集成，400+ 集成的生态使其成为企业 AI 自动化的首选方案。",
    content: `## n8n 的核心优势\n\n**MCP 原生支持：**\n- n8n 最新版本已原生支持 MCP 协议，可作为 MCP Server 被 AI Agent 调用\n- 也可作为 MCP Client 调用外部 MCP 服务\n- 这意味着 AI Agent 可以直接通过 n8n 访问 400+ 集成服务\n\n**Fair-code 模式：**\n- 开源可自部署，同时提供云服务\n- 适合对数据隐私有要求的企业\n- 社区活跃度高，GitHub 57,000+ forks\n\n**典型应用场景：**\n- AI Agent 自动化工：让 Agent 通过 n8n 调用外部 API\n- 数据处理 Pipeline：自动收集、转换、输出数据\n- 通知与告警：AI 触发的智能工作流\n- CRM/ERP 集成：AI 与企业系统的桥梁`,
    date: "2026-04-22 03:30",
    source: "GitHub API / n8n.io",
    sourceUrl: "https://github.com/n8n-io/n8n",
    href: "/news/news-345"
  },
{
    id: "news-346",
    tag: "行业观察",
    tagColor: "bg-blue-500/10 text-blue-300",
    title: "Headless AI 时代到来：Salesforce 推出 Headless 360，AI Agent 直接调用 API 成趋势",
    summary: "Salesforce 正式发布 Headless 360，将 Salesforce、Agentforce 和 Slack 平台的所有功能暴露为 API 和 MCP 协议。Marc Benioff 表示：\"API is the UI\"。与此同时，Matt Webb 和 Brandur Leach 也预测 Headless 服务将成为 2026 年主流趋势，AI Agent 不再需要通过 GUI 操作服务。",
    content: `## Headless AI 的范式转变\n\n**核心概念：** Headless AI 指的是不依赖 GUI，而是通过 API/MCP/CLI 直接暴露给 AI Agent 的服务模式。\n\n**行业动态：**\n- **Salesforce Headless 360**：整个平台暴露为 API + MCP + CLI\n- **Anthropic Claude**：原生支持 MCP 工具调用\n- **Matt Webb 预测**：Headless 服务将比 GUI 更快、更可靠\n- **Brandur Leach**：API 正在从\"成本中心\"变为\"核心销售向量\"\n\n**对 AI 开发者的影响：**\n1. 未来的 SaaS 竞争关键：是否提供 Agent 友好的 API\n2. 按人头定价的 SaaS 模式可能被颠覆\n3. AI Agent 将成为 B2B 软件的主要用户\n\n**技术栈：**\n- MCP（Model Context Protocol）成为 AI Agent 与服务的标准接口\n- REST API + GraphQL + gRPC + MCP 四层架构\n- AI-first 的 API 设计规范正在形成`,
    date: "2026-04-22 04:00",
    source: "Simon Willison's Weblog / Salesforce",
    sourceUrl: "https://simonwillison.net/2026/Apr/19/headless-everything/",
    href: "/news/news-346"
  },
{
    id: "news-343",
    tag: "产品动态",
    tagColor: "bg-purple-500/10 text-purple-300",
    title: "Claude Opus 4.7 更换 Tokenizer 导致 token 消耗暴涨 46%，实际使用成本上升",
    summary: "Anthropic Claude Opus 4.7 首次更换 tokenizer，Simon Willison 实测发现纯文本 token 增长 1.46 倍、高分辨率图像增长 3.01 倍。在定价不变的前提下，实际使用成本上升约 40%。建议用户立即检查 API 账单并评估影响。",
    content: `## Tokenizer 变革的影响\n\nClaude Opus 4.7 是 Claude 系列首次更换 tokenizer 的版本。\n\n**实测数据：**\n- 纯文本：1.46× token 增长\n- 高分辨率图片（3456×2234）：3.01× token 增长\n- 30 页 PDF（15MB）：1.08× token 增长\n\n**成本影响：** Opus 4.7 与 4.6 定价相同（输入 $5/M，输出 $25/M），但实际成本因 token 膨胀上升约 40%。企业用户月支出 $10,000 的场景下，额外增加约 $4,600/月。\n\n**建议：** 立即使用 token counting API 评估你的场景实际影响，考虑对高分辨率图像进行预处理降分辨率。`,
    date: "2026-04-22 02:00",
    source: "Simon Willison's Weblog / Anthropic",
    sourceUrl: "https://simonwillison.net/2026/Apr/20/claude-token-counts/",
    href: "/news/news-343"
  },
{
    id: "news-348",
    tag: "产品动态",
    tagColor: "bg-purple-500/10 text-purple-300",
    title: "Anthropic 悄悄测试将 Claude Code 从 Pro 计划移除，引发社区强烈反弹后迅速撤回",
    summary: "Anthropic 在定价页面试探性地将 Claude Code 从 $20/月的 Pro 计划中移除，改为仅限 $100/月 Max 计划使用。消息在 Reddit、Hacker News 和 Twitter 上引发强烈反响，OpenAI Codex 工程师直接表态 Codex 将继续提供免费和 Plus 版本。Anthropic 增长负责人随后澄清这只是一个面向约 2% 新用户的小型测试，但几小时后定价页面已恢复原状。",
    content: `## Claude Code 定价风波：$20 → $100？

**事件经过：**
Anthropic 静默更新了 claude.com/pricing 页面，将 Claude Code 从 Pro 计划（$20/月）的功能列表中移除，改为仅 Max 计划（$100/月或 $200/月）可用。

**社区反应：**
- Reddit、Hacker News 和 Twitter 迅速「起火」
- Simon Willison 花费整整一个小时调查此事
- OpenAI Codex 工程师 Thibault Sottiaux 直接在 Twitter 表态：「Codex 将继续在 FREE 和 PLUS（$20）计划中提供。我们有足够的算力和高效模型来支持这一点。」

**Anthropic 回应：**
增长负责人 Amol Avasare 发推文澄清：「我们正在对约 2% 的新 Prosumer 用户运行一个小测试。现有 Pro 和 Max 订阅者不受影响。」

**但页面已恢复：** 几小时后，Internet Archive 抓取的版本显示改动已被撤回。

**深远影响：**
- Simon Willison 表示：「我不打算向 NICAR 数据新闻大会的记者们教授依赖 $100/月订阅的课程」
- 信任危机：透明定价是 Anthropic 的重要资产，此次事件动摇了社区信任
- 战略疑问：如果 Codex 有免费层而 Claude Code 需要 $100/月，开发者该押注哪个？

**分析：** 这可能是 Anthropic 在试探市场对提价的接受度。但 Codex 的迅速反击和社区的强烈反应表明，Claude Code 的定价策略需要极其谨慎。`,
    date: "2026-04-22 08:00",
    source: "Simon Willison's Weblog / Anthropic / OpenAI",
    sourceUrl: "https://simonwillison.net/2026/Apr/22/claude-code-confusion/",
    href: "/news/news-348"
  },
{
    id: "news-336",
    tag: "公司动态",
    tagColor: "bg-orange-500/10 text-orange-300",
    title: "Sergey Brin 内部 memo：所有 Gemini 工程师必须使用 AI 编码 Agent，Google 需在编码领域追赶 Anthropic",
    summary: "Google 联合创始人 Brin 在发给 DeepMind 员工的备忘录中要求「每个 Gemini 工程师必须使用内部 Agent 完成复杂多步骤任务」，承认 Anthropic 在 AI 编码领域处于领先地位。Brin 认为追赶编码能力是构建自我改进 AI 的关键一步。",
    content: `## Google 紧急追赶 AI 编码能力

Google 联合创始人 Sergey Brin 在一份内部备忘录中要求 DeepMind 工程师必须使用内部 AI Agent 完成复杂多步骤任务。

**关键信息：**
- Anthropic 的 Claude Code 在 AI 编码竞赛中处于领先地位
- Brin 认为编码能力是构建自我改进 AI 的基础
- Google 创建突击小队改进编码模型
- 要求所有 Gemini 工程师「必须」使用内部 Agent

**背景：** OpenAI、Google、Anthropic 三家公司正在激烈竞争 AI 编码能力，Anthropic 的 Claude Code 目前被开发者广泛认为是最佳 AI 编码工具。`,
    date: "2026-04-22 00:00",
    source: "The Verge / The Information",
    sourceUrl: "https://www.theverge.com/ai-artificial-intelligence",
    href: "/news/news-336"
  },
{
    id: "news-337",
    tag: "产品动态",
    tagColor: "bg-purple-500/10 text-purple-300",
    title: "Anthropic 发布 Claude Design：基于 Opus 4.7 的全新设计产品，可创建原型、营销材料和演示文稿",
    summary: "Anthropic 推出 Claude Design，基于最新的 Opus 4.7 模型，允许用户创建设计方案、原型、营销材料和演示文稿。面向付费订阅用户提供研究预览版，标志着 Anthropic 从对话式 AI 向创意生产力工具扩展。",
    content: `## Anthropic 进军设计领域

Anthropic 发布 Claude Design，这是基于 Opus 4.7 模型的全新设计产品。

**功能：**
- 创建设计方案和原型
- 生成营销材料
- 制作演示文稿
- 研究预览版面向付费用户

**意义：** Anthropic 正在从纯对话式 AI 扩展到创意生产力工具领域，与 Canva、Figma 等传统设计工具形成竞争。Opus 4.7 的新 tokenizer 和视觉能力提升为设计场景提供了更好支持。`,
    date: "2026-04-22 00:00",
    source: "The Verge / Anthropic Blog",
    sourceUrl: "https://www.anthropic.com/news",
    href: "/news/news-337"
  },
{
    id: "news-338",
    tag: "产品动态",
    tagColor: "bg-blue-500/10 text-blue-300",
    title: "Google Home 重新开放连续对话功能，Gemini 免订阅即可使用多轮对话",
    summary: "Google 重新向 Early Access 用户开放 Google Home 设备的连续对话功能，用户无需再说「Hey Google」即可进行多轮追问。此前该功能被限制在需要付费订阅的 Gemini Live 中，现在免费可用，支持所有语言和地区。",
    content: `## Google Home 连续对话重新免费开放

Google 重新开放 Google Home 设备的连续对话（Continued Conversation）功能。

**变化：**
- 无需再说「Hey Google」即可多轮追问
- Early Access 用户免费使用
- 支持所有语言和地区
- 此前该功能被限制在付费的 Gemini Live 中

**意义：** Google 正在调整其 Gemini 战略，部分此前付费的功能重新免费开放，以与 Alexa、Siri 等竞争。`,
    date: "2026-04-22 00:00",
    source: "The Verge",
    sourceUrl: "https://www.theverge.com/ai-artificial-intelligence",
    href: "/news/news-338"
  },
{
    id: "news-339",
    tag: "行业动态",
    tagColor: "bg-yellow-500/10 text-yellow-300",
    title: "Anthropic 与白宫会面讨论 Mythos 网络安全模型，特朗普表示「双方进行了非常好的会谈」",
    summary: "Anthropic 在白宫与美国政府讨论 Mythos 网络安全模型的合作可能。此前 Anthropic 曾因供应链风险被国防部排除，但 NSA 据报仍可访问 Mythos。Anthropic 的 Mythos 模型正被 Nvidia、Apple、JPMorgan 等大厂用于高危安全漏洞修复。",
    content: `## Anthropic Mythos 模型进入政府视野

Anthropic 与白宫就 Mythos 网络安全模型进行会谈。

**关键信息：**
- 特朗普称「双方进行了非常好的会谈」
- NSA 据报可访问 Mythos，尽管被标记为供应链风险
- Nvidia、Apple、JPMorgan Chase 等已在使用 Mythos
- 用于修复高危安全漏洞

**背景：** Mythos 是 Anthropic 的私密网络安全专用模型，已在企业级安全市场引发关注。`,
    date: "2026-04-22 00:00",
    source: "The Verge / CNBC",
    sourceUrl: "https://www.cnbc.com/2026/04/21/trump-anthropic-department-defense-deal.html",
    href: "/news/news-339"
  },
{
    id: "news-340",
    tag: "行业动态",
    tagColor: "bg-green-500/10 text-green-300",
    title: "Google 发布 Gemma 4 系列：2B/4B/31B + 26B MoE 四款视觉开源模型，支持音频输入",
    summary: "Google DeepMind 发布 Gemma 4 系列四款开源推理模型，均支持视觉输入。其中 E2B（2B 有效参数）和 E4B（4B）还支持音频输入，采用 Per-Layer Embeddings 技术最大化端侧部署效率。Google 称其达到「前所未有的 Intelligence-per-Parameter 水平」。",
    content: `## Gemma 4：小模型也能有多模态

Google DeepMind 发布 Gemma 4 系列开源模型。

**模型规格：**
- **E2B**（2B 有效参数）：支持图像+音频输入
- **E4B**（4B 有效参数）：支持图像+音频输入
- **31B**：全尺寸推理模型，支持视觉
- **26B-A4B MoE**：混合专家模型

**技术亮点：**
- Per-Layer Embeddings（PLE）：每层独立嵌入表，最大化端侧效率
- 原生视频和图像处理能力
- 音频输入支持（小模型专属）
- Apache 2.0 开源许可

**意义：** 小模型多模态是 2026 年最热的研究方向，Gemma 4 将视觉+音频能力压缩到可在笔记本运行的规模。`,
    date: "2026-04-22 00:00",
    source: "Google AI Blog / Simon Willison's Weblog",
    sourceUrl: "https://blog.google/innovation-and-ai/technology/developers-tools/gemma-4/",
    href: "/news/news-340"
  },
{
    id: "news-341",
    tag: "行业动态",
    tagColor: "bg-red-500/10 text-red-300",
    title: "SimpleClosure 收购倒闭公司数据卖给 AI 训练：旧 Slack 消息、代码库成 RL 新金矿",
    summary: "SimpleClosure 推出新工具，帮助倒闭企业出售旧代码、Slack 消息、邮件等工作空间数据给 AI 训练公司。Forbes 报道，这催生了「强化学习健身房」新产业——用真实企业数据构建模拟环境训练 AI Agent 在真实职场中导航。",
    content: `## 倒闭公司的数据成了 AI 训练金矿

Forbes 报道了一个新兴产业链。

**核心事实：**
- SimpleClosure 帮助倒闭企业出售内部数据
- 包括旧代码、Slack 消息、邮件、工作空间信息
- 买家是急需真实企业数据的 AI 训练公司
- 催生「强化学习健身房」新产业

**含义：** AI Agent 需要真实职场环境数据来训练决策能力，而倒闭公司的遗留数据恰好提供了这种「真实场景」素材。这引发了关于企业数据隐私和 AI 训练伦理的讨论。`,
    date: "2026-04-22 00:00",
    source: "Forbes / The Verge",
    sourceUrl: "https://www.forbes.com/sites/annatong/2026/04/16/ais-new-training-data-your-old-work-slacks-and-emails/",
    href: "/news/news-341"
  },
{
    id: "news-342",
    tag: "行业动态",
    tagColor: "bg-cyan-500/10 text-cyan-300",
    title: "Samsung 发布 Project Luna AI 机器人：圆形屏幕+可旋转头部的设计新方向",
    summary: "Samsung 展示 Project Luna——一个带有圆形屏幕和可旋转头部的 AI 机器人。由首席设计官 Mauro Porcini 主导，展示 Samsung 对未来家庭 AI 交互形态的设计理念。通过 YouTube Shorts 发布后引发关注。",
    content: `## Samsung 的 AI 机器人长这样

Samsung 通过 YouTube Shorts 展示 Project Luna 概念。

**设计特征：**
- 圆形 OLED 屏幕
- 可旋转头部
- 类似 AI OLED 唱片机设计理念
- 面向家庭场景

**意义：** Samsung 正在探索 AI 硬件的新形态，从手机/平板转向「有表情的 AI 伴侣」。这与 Apple、Google 的家庭 AI 战略形成差异化竞争。`,
    date: "2026-04-22 00:00",
    source: "Fast Company / The Verge",
    sourceUrl: "https://www.fastcompany.com/91528033/samsung-shares-its-thesis-on-the-future-of-design-and-ai",
    href: "/news/news-342"
  },
{
    id: "news-333",
    tag: "GitHub Trending",
    tagColor: "bg-green-500/10 text-green-300",
    title: "GitHub 本周 AI Trending：Hermes Agent 单周 30K 星、Claude-Mem 突破 64K 星、自进化 Agent 全面爆发",
    summary: "2026 年 4 月 21 日 GitHub Trending 周报：NousResearch Hermes Agent 单周暴涨 30,630 星（总 106,834 星）；Claude-Mem 两周狂揽 64,759 星；GenericAgent 和 Evolver 代表自进化 Agent 两大路线（技能树 vs GEP 基因组进化）；微软 MarkItDown 突破 113K 星。",
    content: `## GitHub AI Trending 周报（4.14-4.21）

**🔥 爆炸级增长：**
- **NousResearch/hermes-agent**：106,834 stars（+30,630/周）——可成长型 AI Agent 平台
- **thedotmack/claude-mem**：64,759 stars（+12,472/周）——Claude Code 自动记忆插件
- **microsoft/markitdown**：113,728 stars（+7,084/周）——文件转 Markdown 工具

**🚀 快速增长：**
- **multica-ai/multica**：18,072 stars（+7,009/周）——开源 Agent 管理平台
- **jamiepine/voicebox**：21,942 stars（+5,936/周）——开源语音合成工作室
- **Lordog/dive-into-llms**：33,171 stars（+5,703/周）——动手学大模型中文教程

**🧬 自进化 Agent 两大路线：**
- **lsdefine/GenericAgent**（5,269 stars）：技能树生长路线，3.3K 行种子代码自主扩展
- **EvoMap/evolver**（6,152 stars）：GEP 基因组进化路线，群体竞争+交叉繁殖

**💡 值得关注的中小项目：**
- **forrestchang/andrej-karpathy-skills**：Andrej Karpathy 的 CLAUDE.md 编码最佳实践
- **OpenBMB/VoxCPM**：Tokenizer-Free 多语言语音合成，15,222 stars
- **BasedHardware/omi**：AI 屏幕助手，能看屏幕、听对话、给建议，11,723 stars`,
    date: "2026-04-21",
    source: "GitHub Trending",
    sourceUrl: "https://github.com/trending?since=weekly",
    href: "/news/news-333"
  },
{
    id: "news-332",
    tag: "趋势洞察",
    tagColor: "bg-purple-500/10 text-purple-300",
    title: "Headless AI 爆发：Salesforce 推出 Headless 360，API 成为新 UI，AI Agent 直接调用企业服务",
    summary: "Marc Benioff 宣布 Salesforce Headless 360——整个 Salesforce 平台通过 API、MCP 和 CLI 暴露，AI Agent 可直接访问数据和执行工作流，无需浏览器。Matt Webb 和 Brandur Leach 预测 API-first 经济即将回归，API 可用性将成为 SaaS 产品的关键竞争力。",
    content: `## Headless AI：API 即 UI 的时代来临

**什么是 Headless AI？**

Matt Webb 在 interconnected.org 提出：使用个人 AI 的体验比直接使用服务更好；而 headless 服务对 AI Agent 来说比通过 GUI 操作更快速可靠。

Marc Benioff 在 Twitter 上宣布 Salesforce Headless 360：
> "Welcome Salesforce Headless 360: No Browser Required! Our API is the UI."

**这对行业意味着什么？**

Brandur Leach 预测：**API 可用性将成为 SaaS 产品的关键差异化因素**。当 AI Agent 可以替代人类用户时，拥有完善 API 的产品将占据压倒性优势。这对现有的按人头定价的 SaaS 模式将是巨大冲击——AI Agent 不需要"座位"，它需要的是 API 调用。

**行动建议：**
- 开发者：优先选择提供完善 API/MCP 接口的服务
- 产品方：尽快暴露 API，否则将被 AI Agent 生态淘汰
- 企业：评估 Headless 架构对现有 SaaS 采购策略的影响`,
    date: "2026-04-21",
    source: "Simon Willison Blog + Salesforce 官方",
    sourceUrl: "https://simonwillison.net/2026/Apr/19/headless-everything/",
    href: "/news/news-332"
  },
{
    id: "news-330",
    tag: "AI 工具",
    tagColor: "bg-yellow-500/10 text-yellow-300",
    title: "Karpathy Skills 文件：一份 CLAUDE.md 显著提升 Claude Code 编码质量",
    summary: "forrestchang/andrej-karpathy-skills 基于 Andrej Karpathy 对 LLM 编码缺陷的观察，提炼为一份 CLAUDE.md 配置增强文件。GitHub 4,010 星，周增 2,299 星，是 Claude Code 用户必备的优化配置。",
    content: `## Karpathy Skills：让 Claude Code 更聪明

这份 CLAUDE.md 文件总结了 Karpathy 观察到的 LLM 编码常见陷阱和最佳实践，包括：

- 常见反模式识别
- 代码审查模式
- 边界条件处理
- 错误修复策略

配置方法：将 CLAUDE.md 放到项目根目录，Claude Code 会自动加载。

**AI Master 工具站已收录**，可在「CLI 工具」分类中查看。

📖 详情：[andrej-karpathy-skills](https://github.com/forrestchang/andrej-karpathy-skills)`,
    date: "2026-04-21 08:10",
    source: "GitHub Trending",
    sourceUrl: "https://github.com/forrestchang/andrej-karpathy-skills",
    href: "/news/news-330",
  },
{
    id: "news-326",
    tag: "产品动态",
    tagColor: "bg-orange-500/10 text-orange-300",
    title: "Simon Willison 实测 Claude Opus 4.7 Tokenizer：系统提示词 +46% 成本，图片支持 3 倍提升",
    summary: "Simon Willison 用自研 Token Counter 工具实测 Claude Opus 4.7 的新 tokenizer：系统提示词 token 数 +46%，30 页 PDF +8%，但高分辨率图片支持从 ~1MP 跃升至 ~3.75MP（2576px 长边）。价格不变但实际成本因 token 膨胀增加约 40%。",
    content: `## Claude Opus 4.7 Tokenizer 实测分析

Simon Willison 升级了他的 Claude Token Counter 工具，新增多模型对比功能，对 Opus 4.7 进行了全面测试：

**文本 Token 变化：**
- 系统提示词：Opus 4.7 比 4.6 多用 46% token
- 普通文本：+1.0-1.35x（取决于内容类型）
- 30 页 PDF（15MB）：仅 +8%（60,934 vs 56,482 tokens）

**图片 Token 变化：**
- 682x318 小图：几乎相同（314 vs 310 tokens）
- 3456x2234 大图（3.7MB）：4.7 是 4.6 的 3.01x —— 但这完全因为 4.7 能处理更高分辨率

**成本影响：** Opus 4.7 定价与 4.6 相同（$5/百万输入，$25/百万输出），但因 token 膨胀，实际成本增加约 40%。

**技术背景：** Anthropic 称 Opus 4.7 的 tokenizer 改进是为了更好地处理文本结构，tradeoff 是 token 数量增加。`,
    date: "2026-04-21 01:00",
    source: "Simon Willison Blog",
    sourceUrl: "https://simonwillison.net/2026/Apr/20/claude-token-counts/",
    href: "/news/news-326",
  },
{
    id: "news-323",
    tag: "产品动态",
    tagColor: "bg-yellow-500/10 text-yellow-300",
    title: "Claude Opus 4.7 发布：tokenizer 更新带来高分辨率图片支持，但成本增加 40%",
    summary: "Anthropic 发布 Claude Opus 4.7，采用全新 tokenizer。相同文本输入 token 数增加 1.0-1.35x（系统提示词实测 +46%），图片支持分辨率从 ~1MP 提升至 ~3.75MP（2576px 长边）。价格与 Opus 4.6 相同，但因 token 膨胀实际成本增加约 40%。",
    content: `## Claude Opus 4.7：更强的视觉，更高的成本

**核心发布：**
Anthropic 正式发布 Claude Opus 4.7，这是 Opus 系列自 4.6 以来的重大更新。

**关键变化：**

**1. 全新 tokenizer**
- Opus 4.7 使用更新的 tokenizer，改进了文本处理方式
- Simon Willison 实测：相同系统提示词，Opus 4.7 比 4.6 多消耗 46% 的 token
- 对于 30 页 PDF 文档，token 倍率为 1.08x（低于文本场景）

**2. 高分辨率图片支持**
- 图片输入分辨率从 ~1MP 提升至 ~3.75MP（2576px 长边）
- 3.7MB PNG 图片 token 消耗：Opus 4.7 是 4.6 的 3.01x
- 注意：3x 增加完全来自更高分辨率处理，小图片（682x318）的 token 消耗几乎相同（314 vs 310）

**3. 价格不变，但实际成本上涨**
- Opus 4.7 定价与 4.6 相同：$5/M input，$25/M output
- 但因 tokenizer 变化，相同输入的实际成本增加约 40%
- 建议：高分辨率图片分析用 Opus 4.7，简单文本用 Sonnet 或 Haiku

**影响分析：**
- 对于高分辨率图片分析场景，Opus 4.7 的高分辨率支持可能直接改变技术方案选型
- 对于文本密集型应用，建议评估 Opus 4.7 的 token 成本后再决定是否迁移
- Anthropic 是目前唯一公开系统提示词历史的主流 AI 实验室，可追溯至 Claude 3

**来源：** Simon Willison's Weblog / Anthropic 官方博客`,
    date: "2026-04-21",
    source: "Simon Willison / Anthropic",
    sourceUrl: "https://simonwillison.net/2026/Apr/20/claude-token-counts/",
    href: "/news/news-323",
  },
{
    id: "news-322",
    tag: "AI Agent",
    tagColor: "bg-blue-500/10 text-blue-300",
    title: "Agent 记忆系统爆发：Claude-Mem 突破 63K 星 + MemPalace 记忆宫殿架构——记忆成为 Agent 刚需基础设施",
    summary: "2026 年 4 月，AI Agent 记忆系统从实验性功能变为开发者刚需。Claude-Mem 单周暴涨 14,556 星突破 63K，MemPalace 提出记忆宫殿架构 + AAAK 30x 压缩技术（170 token 启动检索），LongMemEval 基准准确率 96.6%。记忆系统正成为 Agent 从「工具」走向「伙伴」的关键基础设施。",
    content: `## Agent 记忆系统：2026 年最被低估的 AI 趋势

当所有人都在关注 AI Agent 的执行能力时，一个更根本的趋势正在悄然爆发：**Agent 记忆系统**。

**三大记忆方案同时爆发：**

1. **Claude-Mem（63K+ stars，周增 14,556）**：自动捕获 Claude Code 编码会话中的所有操作，AI 压缩后注入后续会话，解决上下文丢失问题
2. **MemPalace（22K+ stars）**：记忆宫殿架构 + AAAK 30x 压缩，仅 170 token 启动检索，LongMemEval 基准准确率 96.6%
3. **OpenViking（22K+ stars）**：火山引擎开源的 Agent 上下文数据库，支持上下文持久化和多 Agent 共享

**三种记忆路线：**
- **经验型**（Claude-Mem）：记录 Agent 做了什么，压缩为可复用知识
- **知识型**（MemPalace）：结构化图谱记忆，支持复杂查询和关联发现
- **上下文型**（OpenViking）：持久化 Agent 当前状态，支持中断恢复和共享

**为什么记忆是刚需？**
没有记忆的 Agent 就像没有经验的员工——每次任务都从零开始。随着 Agent 在日常工作中被频繁使用，跨会话记忆从「锦上添花」变成了「不可或缺」。

**对开发者的意义：**
记忆系统 + RAG + Fine-tuning 三者组合，将为 Agent 提供完整的知识体系：Fine-tuning 提供基础能力，RAG 提供外部知识，记忆提供个人经验。`,
    date: "2026-04-20",
    source: "GitHub Trending",
    sourceUrl: "https://github.com/trending?since=weekly",
    href: "/news/news-322",
  },
{
    id: "news-318",
    tag: "AI Agent",
    tagColor: "bg-blue-500/10 text-blue-300",
    title: "Self-Evolving AI Agent 三强争霸：Hermes / GenericAgent / Evolver 代表三条技术路线",
    summary: "2026 年 4 月，自我进化 AI Agent 成为最热门赛道。NousResearch Hermes Agent（103K 星）主打经验压缩与知识注入，GenericAgent（4.7K 星）以 3.3K 行种子代码实现技能树自生长，EvoMap Evolver（5.7K 星）提出 GEP 基因组进化协议。三条路线分别代表了从经验中学习、从需求中生长、从变异中进化的三种范式。",
    content: `## Self-Evolving AI Agent：三大路线对比

### NousResearch Hermes Agent（103K+ 星）
核心理念是「The agent that grows with you」。通过 Experience Capture → Knowledge Compression → Skill Injection 的完整循环，让 Agent 在执行任务中持续积累经验、压缩为知识、并注入到后续任务中。

### GenericAgent（4.7K 星）
仅用 3.3K 行种子代码启动，通过技能树自生长机制，Agent 在遇到新需求时自动生成新技能模块。token 消耗比传统框架低 6 倍。

### EvoMap Evolver（5.7K 星）
提出 GEP（Genome Evolution Protocol），将 Agent 能力编码为基因组，通过变异、交叉、选择等生物进化机制持续优化 Agent 配置。

**共同趋势：** 三个项目的共同点是 Agent 不再是静态工具，而是可以自主成长的有机体。这标志着 AI Agent 从「工具时代」迈入「伙伴时代」。`,
    date: "2026-04-20",
    source: "GitHub Trending",
    sourceUrl: "https://github.com/trending?since=weekly",
    href: "/news/news-318",
  },
{
    id: "news-319",
    tag: "AI 基础设施",
    tagColor: "bg-green-500/10 text-green-300",
    title: "Kronos 金融大模型突破 19K 星：Foundation Model for the Language of Financial Markets",
    summary: "shiyu-coder/Kronos 本周增长 4,455 星，总计 19,686 星。这是一个专为金融市场设计的 Foundation Model，将市场数据视为一种\"语言\"进行建模。与通用 LLM 不同，Kronos 在金融时间序列数据上专门训练，支持市场预测、风险分析和交易策略生成。",
    content: `## Kronos：金融市场的 Foundation Model

Kronos 的创新在于将金融市场数据视为一种"语言"，使用类似 LLM 的架构对金融时间序列进行建模。

**核心特性：**
- 专为金融市场设计的预训练模型
- 支持市场趋势预测、风险评估、交易策略生成
- 与传统量化模型相比，具有更强的模式识别能力

**本周增长：** +4,455 stars，总计 19,686 stars
**技术栈：** Python, PyTorch

这标志着 AI 正在从通用领域向垂直专业领域深化——金融大模型将成为 2026 年的重要赛道。`,
    date: "2026-04-20",
    source: "GitHub Trending",
    sourceUrl: "https://github.com/shiyu-coder/Kronos",
    href: "/news/news-319",
  },
{
    id: "news-320",
    tag: "AI 产品",
    tagColor: "bg-cyan-500/10 text-cyan-300",
    title: "Voicebox 开源语音合成工作室突破 21K 星：jamiepine 打造语音 AI 新标杆",
    summary: "jamiepine/voicebox 本周增长 5,724 星，总计 21,401 星。这是一个开源的语音合成工作室，支持高质量文本转语音、声音克隆和语音编辑功能。在 VoxCPM（15K 星）和 Gemini 3.1 Flash TTS 的共同推动下，2026 年正成为语音 AI 爆发之年。",
    content: `## Voicebox：开源语音合成工作室

Voicebox 是一个全面的开源语音合成平台，功能覆盖：

- **高质量 TTS**：自然流畅的文本转语音
- **声音克隆**：少量样本即可克隆声音
- **语音编辑**：直接编辑已有音频的内容和风格
- **多语言支持**：支持多种语言和方言

**本周增长：** +5,724 stars
**技术栈：** TypeScript

同期值得关注的语音 AI 项目还包括 OpenBMB VoxCPM（15K 星，tokenizer-free TTS）和 Google Gemini 3.1 Flash TTS（提示词控制语音风格）。语音 AI 正在从"能说话"走向"说得好"。`,
    date: "2026-04-20",
    source: "GitHub Trending",
    sourceUrl: "https://github.com/jamiepine/voicebox",
    href: "/news/news-320",
  },
{
    id: "news-321",
    tag: "AI 基础设施",
    tagColor: "bg-emerald-500/10 text-emerald-300",
    title: "OMI 随身 AI 硬件突破 11K 星：AI 从云端走向可穿戴设备",
    summary: "BasedHardware/omi 本周增长 2,896 星，总计 11,485 星。这是一个开源的随身 AI 硬件——AI 项链，能实时感知你的屏幕和对话，提供智能建议。在 Gemini 3.1 Flash TTS、Voicebox 等语音 AI 项目的推动下，2026 年 AI 正从纯软件走向硬件化。",
    content: `## OMI：随身 AI 硬件新物种

OMI 是 2026 年最引人注目的 AI 硬件项目之一。这个开源的 AI 项链能够：

- **实时感知**：通过摄像头和麦克风持续捕捉环境信息
- **智能分析**：多模态 AI 理解视觉和音频输入
- **主动建议**：根据你的场景提供智能提醒和建议
- **开源设计**：硬件设计和软件完全开源，支持 DIY

**本周增长：** +2,896 stars
**技术栈：** Dart（跨平台移动端）

OMI 代表了一个重要趋势：AI 正在从「手机上的 App」走向「随身硬件」。当 AI 能够持续感知你的环境和状态时，它的价值将从「被动回答」升级为「主动协助」。

同期值得关注的 AI 硬件项目还包括 Rabbit R1 的后续发展、Humane AI Pin 的转型，以及各大厂商正在布局的 AI 眼镜。2026 年可能是 AI 硬件的元年。`,
    date: "2026-04-20",
    source: "GitHub Trending",
    sourceUrl: "https://github.com/BasedHardware/omi",
    href: "/news/news-321",
  },
{
    id: "news-316",
    tag: "AI 趋势",
    tagColor: "bg-purple-500/10 text-purple-300",
    title: "Salesforce 推出 Headless 360：API 即 UI，全面支持 AI Agent 接入",
    summary: "Salesforce 发布 Headless 360，将整个平台暴露为 API、MCP 和 CLI，AI Agent 可直接通过 API 访问数据和工作流，无需浏览器界面。Marc Benioff 宣布 'No Browser Required'，标志 SaaS 行业从 GUI-first 向 API-first 的范式转移。",
    content: `## Salesforce Headless 360：No Browser Required

2026 年 4 月，Salesforce CEO Marc Benioff 宣布推出 Headless 360，将整个 Salesforce 平台（包括 CRM、Agentforce 和 Slack）暴露为 API、MCP 和 CLI。

**核心特性：**
- 全平台 API 化：所有功能可通过 API 调用
- MCP 协议支持：AI Agent 可直接发现和调用 Salesforce 工具
- CLI 接口：支持脚本化操作和批量处理

**行业影响：**
这是 SaaS 行业从 GUI-first 向 API-first 的标志性转变。当 Salesforce 这样的企业 SaaS 巨头都转向 headless 模式时，整个行业都将跟进。

Matt Webb 在 Interconnected 博客中指出：「使用个人 AI 的体验比直接使用服务更好；而 headless 服务对个人 AI 来说比用机器人控制鼠标在 GUI 上点击更快捷、更可靠。」`,
    date: "2026-04-20",
    source: "Salesforce / Matt Webb",
    sourceUrl: "https://interconnected.org/home/2026/04/18/headless",
    href: "/news/news-316",
  },
{
    id: "news-317",
    tag: "AI 产品",
    tagColor: "bg-green-500/10 text-green-300",
    title: "Google 发布 Gemini 3.1 Flash TTS：用提示词控制语音生成风格",
    summary: "Google 发布 Gemini 3.1 Flash TTS，新一代文本转语音模型可通过提示词精确控制语音风格、情感、语速和音色。用户可以用自然语言描述想要的声音效果，如'充满活力的早间电台主持风格'，模型会生成匹配的音频输出。",
    content: `## Gemini 3.1 Flash TTS：提示词驱动语音生成

Google 发布了 Gemini 3.1 Flash TTS，这是一个全新的文本转语音模型，最大的创新是**用提示词控制语音风格**。

**核心特性：**
- **提示词控制**：用自然语言描述想要的语音效果，如"伦敦风格、充满活力的电台主持人"
- **细粒度控制**：可指定语速、情感、口音、节奏等多个维度
- **场景化音频**：支持生成带有背景音效和环境音的完整音频场景

**Prompting Guide 亮点：**
Google 发布的 prompting guide 展示了惊人的控制粒度。用户可以定义完整的"音频角色档案"，包括：
- 声音特征（音调、音色、呼吸感）
- 表演风格（动态范围、投影方式）
- 节奏控制（语速、停顿、重音）
- 口音和方言

**技术意义：**
这标志着 TTS 从"选择预设声音"进化到"用自然语言编程声音"，为 AI 语音助手、内容创作和游戏开发带来全新的可能性。`,
    date: "2026-04-20",
    source: "Google Blog",
    sourceUrl: "https://blog.google/innovation-and-ai/models-and-research/gemini-models/gemini-3-1-flash-tts/",
    href: "/news/news-317",
  },
{
    id: "news-314",
    tag: "AI Agent",
    tagColor: "bg-blue-500/10 text-blue-300",
    title: "NousResearch Hermes Agent 单周暴涨 38,000 星突破 102K——可成长型 AI Agent 爆发",
    summary: "NousResearch 的 Hermes Agent 本周增长 38,194 stars，总计 102,374 stars，成为 GitHub 增长最快的 AI Agent 项目。其核心理念「可成长型 Agent」通过经验压缩、知识注入和持续学习，让 Agent 在执行任务中不断提升能力。同时 GenericAgent（4,568 星）和 Evolver（5,569 星）也代表自进化 Agent 的不同技术路线，标志 2026 年 AI Agent 从「静态工具」走向「持续进化」的范式转变。",
    content: `## Hermes Agent：会成长的 AI Agent

2026 年 4 月第三周，NousResearch 的 Hermes Agent 以单周 38,194 stars 的爆炸级增长席卷 GitHub，总星数突破 102,000，成为本周增长最快的 AI 开源项目。

**核心理念：Agent 应该在使用中变强**

Hermes Agent 的创新在于「可成长」架构：
1. 每次任务执行后，自动将完整轨迹压缩为可复用的知识
2. 遇到类似任务时，检索并注入相关知识到上下文
3. 随着使用次数增加，Agent 的决策质量持续提升

**自进化 Agent 三足鼎立：**

与此同时，另外两个自进化 Agent 项目也在快速增长：

- **GenericAgent**（4,568 星，周增 3,512）：从 3.3K 行种子代码开始，自主生长技能树，以 6 倍更少的 token 消耗实现全系统控制
- **Evolver**（5,569 星，周增 3,434）：基于 GEP（Genome Evolution Protocol）的群体进化引擎，多个 Agent 变体竞争进化

这三个项目代表了自进化 Agent 的三条技术路线：经验积累型（Hermes）、技能生长型（GenericAgent）和群体进化型（Evolver）。2026 年，AI Agent 不再是一次性部署的静态工具，而是能够在实际使用中持续进化的「活系统」。

**对开发者的意义：**

自进化 Agent 特别适合长期运行的场景——客服 Agent 随着处理的工单越来越多而变得更精准，代码审查 Agent 随着审查的代码量增加而发现更多潜在问题。这正是 AI 从「工具」走向「伙伴」的关键一步。`,
    date: "2026-04-20",
    source: "GitHub Trending",
    sourceUrl: "https://github.com/trending?since=weekly",
    href: "/news/news-314",
  },
{
    id: "news-315",
    tag: "AI Agent",
    tagColor: "bg-blue-500/10 text-blue-300",
    title: "Claude-Mem 自动记忆插件周增 14,556 星突破 63K——Agent 记忆成为刚需",
    summary: "Claude-Mem 是一个 Claude Code 插件，自动捕获编码会话中的所有操作，用 AI 压缩为上下文并注入未来会话。本周增长 14,556 stars，总计 63,380 stars。这反映了 Agent 记忆系统正从「实验性功能」变为「开发者刚需」——没有记忆的 Agent 就像没有经验的员工，每次都要从零开始。",
    content: `## Claude-Mem：让 Agent 拥有持久记忆

Claude-Mem 本周以 14,556 stars 的增长成为 GitHub 第二大增速的 AI 项目，总星数达到 63,380。

**工作原理：**

1. **自动捕获**：记录 Claude Code 在编码会话中的每一个操作——文件读写、命令执行、错误和修复
2. **AI 压缩**：使用 Claude Agent SDK 将海量操作日志压缩为结构化的知识摘要
3. **上下文注入**：下次会话开始时，自动检索相关知识并注入上下文

**为什么这个需求如此强烈：**

开发者每天在多个编码会话之间切换。没有记忆的 Agent 每次都要重新理解项目结构、已知问题和已做决策。Claude-Mem 解决了这个痛点——Agent 可以「记住」上次做了什么、遇到了什么问题、采用了什么解决方案。

**与 Hermes Agent 的关系：**

Claude-Mem 和 Hermes Agent 在理念上高度一致：都是让 AI 从经验中学习。区别在于 Claude-Mem 聚焦编码场景，而 Hermes Agent 是通用 Agent 平台。两者可以互补使用——Claude-Mem 提供编码记忆，Hermes Agent 提供更广泛的经验积累。`,
    date: "2026-04-20",
    source: "GitHub Trending",
    sourceUrl: "https://github.com/trending?since=weekly",
    href: "/news/news-315",
  },
{
    id: "news-311",
    tag: "AI Agent",
    tagColor: "bg-blue-500/10 text-blue-300",
    title: "Simon Willison 深度解析：Claude Opus 4.6 到 4.7 系统提示词演进轨迹",
    summary: "Simon Willison 利用 Anthropic 公开的 Claude 系统提示词历史（可追溯至 Claude 3），通过 Git 版本化对比深入分析了 Opus 4.6 到 4.7 的变化。发现 Opus 4.7 在工具调用、错误恢复和多步推理方面做了大量优化，反映了 Anthropic 对 Agent 能力的持续强化。",
    content: `## Claude 系统提示词的 Git 时间线

Anthropic 是唯一一家公开发布其用户聊天系统提示词的主要 AI 实验室。其系统提示词档案现已回溯至 2024 年 7 月的 Claude 3，成为研究 AI 模型演进的宝贵资源。

**Simon Willison 的分析方法：**

Simon Willison 使用 Claude Code 将 Anthropic 公开的单体 Markdown 系统提示词页面转化为按模型、模型家族和版本拆分的 Git 仓库结构。通过虚构的 Git 提交时间戳，研究者可以使用 \`git log\`、\`diff\` 和 \`blame\` 来追溯提示词演变。

**Opus 4.6 → 4.7 的关键变化：**

1. **工具调用能力增强**：Opus 4.7 对工具调用的指导更精确，减少了误调用和遗漏
2. **错误恢复机制改进**：新增了对失败操作的自我修正策略，Agent 在遇到错误时不再轻易放弃
3. **多步推理优化**：复杂任务的分解和执行流程更清晰，减少了推理链断裂
4. **安全约束微调**：在保持能力的同时，安全边界的定义更精细

**llm-anthropic 0.25 同步发布：**

Simon Willison 还发布了 llm-anthropic 0.25，正式支持 claude-opus-4.7 模型，新增 thinking_effort: xhigh 参数、thinking_display 和 thinking_adaptive 选项，并将默认 max_tokens 提升至各模型允许的最大值。

**为什么值得关注：**

系统提示词的演变直接反映了模型设计者的意图和优先级。Opus 4.7 的提示词变化清晰表明 Anthropic 正全力强化 Agent 能力——工具调用、错误恢复和多步推理正是构建自主 AI Agent 的三大基石。对于开发者和研究者来说，这些变化预示了下一代 Agent 的能力方向。

**相关项目：**

Simon Willison 将系统提示词分析开源为 [GitHub 仓库](https://github.com/simonw/research/tree/main/extract-system-prompts)，任何人都可以用 Git 工具探索 Claude 提示词的演变历程。

**对 AI Master 读者的启示：**

理解系统提示词的演变，有助于更好地设计 Agent 架构和优化提示词策略。AI 实验室公开这些信息，也反映了 AI 领域向透明化发展的趋势。
`,
    date: "2026-04-20",
    source: "Simon Willison's Weblog",
    sourceUrl: "https://simonwillison.net/2026/Apr/18/opus-system-prompt/",
    href: "/news/news-311",
  },
{
    id: "news-312",
    tag: "AI Agent",
    tagColor: "bg-blue-500/10 text-blue-300",
    title: "Multica 开源多 Agent 平台单周暴涨 8,756 星——编程 Agent 团队化时代到来",
    summary: "Multica 是一个开源的 Managed Agents 平台，可以将编程 Agent 变为真正的团队成员——分配任务、追踪进度、累积技能。一周内增长 8,756 stars，总计 16,648 stars，代表了从单一 Agent 到 Agent 团队的范式转变。",
    content: `## Multica：从「一个 AI 助手」到「一个 AI 团队」

2026 年 4 月，Multica 以惊人的速度在 GitHub 上增长，单周增加 8,756 stars，总星数达到 16,648。这个项目的核心命题是：AI Agent 不应只是单个助手，而应该是一整个团队。

**核心理念：Agent 团队化管理**

Multica 解决了单个 AI Agent 的固有限制——复杂工程任务需要多角色协作：

- **任务分配**：将复杂工程拆解为子任务，分配给不同专长的 Agent
- **进度追踪**：实时监控每个 Agent 的任务状态和完成质量
- **技能沉淀**：Agent 在执行中积累的技能可被团队共享和复用
- **角色分工**：代码审查、测试编写、文档生成等角色各司其职

**技术架构：**

1. **Agent 编排器**：负责任务拆解、Agent 调度和结果聚合
2. **技能注册中心**：管理所有 Agent 的技能清单和能力边界
3. **状态追踪系统**：实时追踪每个任务的进度和质量
4. **知识沉淀层**：将 Agent 经验转化为可复用的团队知识

**为什么 Agent 团队化是必然趋势？**

当前主流的 Claude Code、Codex 等 Agent 虽然能完成单点任务，但面对「重构整个项目架构」或「从零构建一个产品」这样的复杂需求时，单 Agent 的上下文限制和规划能力瓶颈就暴露出来了。Multica 的思路是将大任务拆解后并行处理，类似于人类团队的项目管理。

**与同类项目对比：**

| 项目 | 定位 | Stars | 本周增长 |
|------|------|-------|----------|
| Multica | 多 Agent 团队管理 | 16,648 | +8,756 |
| Hermes Agent | 可成长单 Agent | 101,604 | +42,612 |
| GenericAgent | 自进化单 Agent | 4,463 | +3,218 |
| OpenHands | 自主编码 Agent | 71,000 | +15 |

**影响：**

Multica 的爆发验证了一个判断：2026 年 AI Agent 的核心竞争将从「单个 Agent 多聪明」转向「多个 Agent 如何协作」。对于软件工程团队来说，这可能意味着开发模式的根本性变革。
`,
    date: "2026-04-20",
    source: "GitHub Trending",
    sourceUrl: "https://github.com/trending?since=weekly",
    href: "/news/news-312",
  },
{
    id: "news-313",
    tag: "AI 基础设施",
    tagColor: "bg-green-500/10 text-green-300",
    title: "Microsoft MarkItDown 本周增 10,759 星——AI 数据预处理的瑞士军刀突破 112K",
    summary: "微软开源的 MarkItDown 工具本周增长 10,759 stars，总星数达 112,514。这个通用文件转 Markdown 工具支持 PDF、Word、PPT、Excel、HTML、音频、图片 OCR 等数十种格式，是 LLM 和 RAG 系统数据预处理的必备工具。",
    content: `## MarkItDown：AI 时代的数据预处理利器

在 LLM 和 RAG 系统中，数据预处理是最耗时也最关键的环节之一。微软的 MarkItDown 提供了一站式解决方案：任何格式文件 → Markdown，专为 AI 消费优化。

**支持格式一览：**

- **办公文档**：Word (.docx)、PowerPoint (.pptx)、Excel (.xlsx)、PDF
- **网页**：HTML → Markdown 精准转换
- **多媒体**：音频转录（Whisper 集成）、图片 OCR
- **代码**：源代码文件带语法高亮的 Markdown 输出
- **邮件**：EML/MSG 格式
- **电子书**：EPUB

**核心优势：**

1. **插件系统可扩展**：社区可以编写自定义转换器
2. **LLM 优化输出**：生成的 Markdown 格式专为 LLM 理解优化
3. **MIT 协议**：完全免费，商业友好
4. **Python 生态**：pip install 即用，API 简洁

**为什么如此重要？**

在 RAG（检索增强生成）系统中，数据质量直接决定 AI 输出质量。MarkItDown 解决了 RAG 系统最常见的痛点：如何把各种格式的非结构化数据转化为 LLM 可以高效处理的格式。

**本周增长分析：**

10,759 stars 的周增长说明企业对 AI 数据管道的需求正在爆发。越来越多的公司开始部署 RAG 系统和企业内部知识库，MarkItDown 成为了这个基础设施中不可或缺的一环。

**使用示例：**

\`\`\`python
from markitdown import MarkItDown

md = MarkItDown()
# 转换 PDF
result = md.convert("report.pdf")
print(result.text_content)

# 转换 Excel（保留表格结构）
result = md.convert("data.xlsx")
print(result.text_content)
\`\`\`

**在 AI Master 工具集中的地位：**

MarkItDown 是 AI 工程化（AI Engineering）方向的核心工具之一，与 Crawl4AI（数据采集）、LangChain（应用构建）、Ollama（本地推理）共同构成了完整的 AI 应用开发工具链。
`,
    date: "2026-04-20",
    source: "GitHub Trending",
    sourceUrl: "https://github.com/microsoft/markitdown",
    href: "/news/news-313",
  },
{
    id: "news-079",
    title: "Claude Opus 4.7 发布：全新 tokenizer、图片支持提升 3 倍、新增 xhigh 推理级别",
    tag: "产品动态",
    summary: "Anthropic 发布 Claude Opus 4.7，采用全新 tokenizer 导致 token 通胀 8-46%、图片分辨率上限提升至 2576px、新增 xhigh 推理级别，定价保持不变。",
    content: `**核心变化：**
- **全新 Tokenizer**：Opus 4.7 采用更细粒度的分词策略，相同文本 token 数增加 8-46%，纯文本系统提示词增长约 1.46x
- **图片分辨率上限提升**：从 ~800px 长边提升至 2576px（约 3.75 兆像素），是之前的 3.2 倍
- **Thinking 增强**：新增 xhigh 推理级别，支持 thinking_display 和 thinking_adaptive 新参数
- **定价不变**：输入 $5/百万 tokens，输出 $25/百万 tokens，但因 token 通胀实际成本增加约 40%

**技术细节：**
- Tokenizer 变化对不同类型内容影响不同：纯文本 8-46% 增长，技术文档约 8%，代码约 28%
- 图片处理：682x318 小图 token 消耗几乎相同，3456x2234 高分辨率图 token 消耗增加 3.01x
- xhigh 级别适用于科研分析、代码审查、数学证明等需要极高准确度的场景
- API 保持向后兼容，新增 thinking_effort、thinking_display、thinking_adaptive 参数

**影响分析：**
- Simon Willison 实测发现 Opus 4.7 的 tokenizer 让相同系统提示词多消耗 46% 的 token
- 对于简单问答场景，建议仍使用 Sonnet 或 Haiku 以控制成本
- 对于高分辨率图片分析场景，Opus 4.7 的高分辨率支持可能直接改变技术方案选型
- Anthropic 是目前唯一公开系统提示词历史的主流 AI 实验室，可追溯至 Claude 3

**来源：** Simon Willison's Weblog / Anthropic 官方博客`,
    date: "2026-04-20 08:00",
    source: "Simon Willison / Anthropic",
    sourceUrl: "https://simonwillison.net/",
    href: "/news/news-079",
  },
{
    id: "news-078",
    title: "Salesforce 推出 Headless 360：API 即 UI，全面支持 AI Agent 接入",
    tag: "产品动态",
    summary: "Salesforce 发布 Headless 360，将整个平台暴露为 API、MCP 和 CLI，AI Agent 可直接通过 API 访问数据和工作流，无需浏览器界面。",
    content: `**核心发布：**
- Salesforce 正式发布 Headless 360，将整个 Salesforce、Agentforce 和 Slack 平台暴露为 API、MCP 和 CLI
- 核心理念："API is the UI" — AI Agent 可以直接通过 API 访问数据、工作流和任务
- 支持在 Slack、语音或任何环境中使用，无需浏览器界面

**行业趋势：**
- Matt Webb 预测 headless 服务将成为个人 AI 的标准交互方式
- Brandur Leach 在\"The Second Wave of the API-first Economy\"中指出：API 不再是负担，而是关键销售矢量
- 这一趋势可能颠覆现有的按人头 SaaS 定价模式
- 在相对同质化的产品竞争中，API 可用性可能成为决定性因素

**对开发者的意义：**
- 个人 AI 助手可以通过 API 直接操作用户已订阅的服务
- 无头服务比 GUI 自动化更快速、更可靠
- MCP（Model Context Protocol）成为连接 AI Agent 和企业服务的关键桥梁

**来源：** Salesforce 官方博客 / Matt Webb / Brandur Leach`,
    date: "2026-04-20 06:00",
    source: "Salesforce / Matt Webb",
    sourceUrl: "https://simonwillison.net/",
    href: "/news/news-078",
  },
{
    id: "news-080",
    title: "NousResearch Hermes Agent 一周暴涨 3 万星，自进化 AI Agent 引爆 GitHub Trending",
    tag: "GitHub 趋势",
    summary: "NousResearch 开源的自进化 AI Agent Hermes Agent 本周新增 30,630 stars，总星数突破 105K，成为 GitHub 本周最热 AI 项目。其核心创新是闭环学习系统：自动从经验中提取技能、持续自我优化。",
    content: `**核心亮点：**
- **闭环学习系统**：完成复杂任务后自动将执行路径抽象为可复用 Skill
- **技能在使用中进化**：每次调用收集反馈，自动优化 Prompt 和参数
- **长期记忆**：FTS5 全文检索 + LLM 跨会话摘要 + Honcho 用户画像建模
- **多端接入**：Telegram / Discord / Slack / WhatsApp / Signal / CLI 统一网关
- **极低部署成本**：$5 VPS 即可运行，支持 Docker / SSH / Modal / Daytona 等后端

**技术架构：**
- 支持任意 LLM：OpenAI / Claude / 国内模型（通义千问、Kimi、MiniMax 等）
- 技能系统兼容 agentskills.io 开放标准
- 支持 MCP 协议扩展，可连接任意 MCP Server
- 内置 Cron 定时任务调度器
- 支持子 Agent 并行化工作流

**行业意义：**
Hermes Agent 代表了 AI Agent 从"预设能力"向"自主进化"的范式转变，是 2026 年最值得关注的 AI 基础设施之一。

**来源：** GitHub Trending / NousResearch
**链接：** https://github.com/NousResearch/hermes-agent`,
    date: "2026-04-21 10:00",
    source: "GitHub Trending / NousResearch",
    sourceUrl: "https://github.com/trending?since=weekly",
    href: "/news/news-080",
  },
{
    id: "news-081",
    title: "Claude-Mem 两周 64K 星：Claude Code 自动记忆插件成为开发者标配",
    tag: "GitHub 趋势",
    summary: "thedotmack 开源的 Claude-Mem 自动捕获 Claude Code 编码会话中的所有操作，AI 压缩后注入未来会话，两周狂揽 64,488 stars，本周新增 12,472 星。",
    content: `**核心功能：**
- **自动捕获**：无缝记录 Claude Code 会话中的文件变更、命令执行、对话历史
- **AI 压缩**：用 Claude Agent SDK 将原始事件压缩为摘要、代码模式和经验教训
- **智能注入**：基于语义相似度自动将相关历史经验注入当前会话上下文
- **零配置**：安装即用，无需手动管理记忆

**技术实现：**
- 使用 Claude Agent SDK 进行会话内容压缩
- 向量存储实现语义级记忆检索
- 多层压缩策略：事件 → 关键决策 → 抽象经验

**与 Hermes Agent 的对比：**
- Claude-Mem 更轻量，专注编码场景；Hermes Agent 是通用 Agent 平台
- 两者都采用"记忆驱动"进化路线，但 Claude-Mem 不做技能创建
- Claude-Mem 可作为个人 Agent 的记忆增强模块

**来源：** GitHub Trending
**链接：** https://github.com/thedotmack/claude-mem`,
    date: "2026-04-21 09:30",
    source: "GitHub Trending",
    sourceUrl: "https://github.com/trending?since=weekly",
    href: "/news/news-081",
  },
{
    id: "news-082",
    title: "GenericAgent 发布：3.3K 行种子代码生长出完整技能树，Token 消耗降 6 倍",
    tag: "GitHub 趋势",
    summary: "lsdefine 开源 GenericAgent，从极小种子代码出发，通过自主技能树扩展实现系统级控制能力，本周新增 3,914 stars 引起广泛关注。",
    content: `**核心创新：**
- **技能树生长机制**：从 3,300 行种子代码自动扩展出完整技能树
- **能力评估 → 技能合成 → 验证固化** 三步循环
- **Token 效率提升 6 倍**：仅加载相关技能分支，而非全量上下文

**三大组件：**
1. **能力发现器**：分析任务需求，判断现有技能覆盖度
2. **技能合成器**：将新经验编译为结构化 Skill（名称、描述、触发条件、代码、依赖）
3. **技能评估器**：通过测试用例验证新 Skill 有效性

**应用场景：**
- 长期自主工作流管理
- 需要持续学习新领域的 Agent
- 技能可复用性要求高的场景

**来源：** GitHub Trending
**链接：** https://github.com/lsdefine/GenericAgent`,
    date: "2026-04-21 09:00",
    source: "GitHub Trending",
    sourceUrl: "https://github.com/trending?since=weekly",
    href: "/news/news-082",
  },
{
    id: "news-083",
    title: "Evolver：GEP 基因表达编程驱动的 AI Agent 自进化引擎",
    tag: "GitHub 趋势",
    summary: "EvoMap 开源 Evolver，基于 GEP（基因表达编程）实现 Agent 决策逻辑的遗传进化，基因组固定长度保证安全，表达树可变保证多样性，本周新增 4,032 stars。",
    content: `**技术原理：**
- **GEP（Gene Expression Programming）**：将 Agent 策略编码为固定长度基因组
- **进化循环**：种群初始化 → 适应度评估 → 选择 → 交叉/变异 → 新一代
- **双长度设计**：基因组固定长度（安全遗传）+ 表达树可变长度（行为多样）

**对比其他路线：**
- 记忆驱动路线擅长个人经验积累，但难以突破范式
- 技能树路线擅长能力结构化扩展，但需要明确的合成逻辑
- GEP 遗传进化路线擅长策略优化和全局搜索，特别适合游戏 AI、控制策略等场景

**来源：** GitHub Trending / EvoMap
**链接：** https://github.com/EvoMap/evolver`,
    date: "2026-04-21 08:30",
    source: "GitHub Trending / EvoMap",
    sourceUrl: "https://github.com/trending?since=weekly",
    href: "/news/news-083",
  },
{
    id: "news-084",
    title: "Multica 开源托管 Agent 平台：将编码 Agent 变成真正的团队成员",
    tag: "GitHub 趋势",
    summary: "multica-ai 发布开源多 Agent 协作平台 Multica，支持任务分配、进度追踪、技能复用，本周新增 7,009 stars，总星数 17,797。",
    content: `**核心能力：**
- **任务分配**：将复杂项目拆解为子任务，分派给不同 Agent
- **进度追踪**：实时监控各 Agent 工作进度和产出
- **技能复用**：Agent 之间共享技能和知识，实现"团队智慧"
- **自托管**：支持本地部署，数据完全可控

**与现有方案对比：**
- 相比 n8n 的可视化流程编排，Multica 更强调 Agent 间的自主协作
- 相比 LangGraph 的开发框架，Multica 提供更完整的管理平台
- 定位为"Agent 团队操作系统"

**来源：** GitHub Trending
**链接：** https://github.com/multica-ai/multica`,
    date: "2026-04-21 08:00",
    source: "GitHub Trending",
    sourceUrl: "https://github.com/trending?since=weekly",
    href: "/news/news-084",
  },
{
    id: "news-085",
    title: "Voicebox 开源语音合成工作室：本周新增 5,936 星",
    tag: "GitHub 趋势",
    summary: "jamiepine 开源 Voicebox，一个功能完整的开源语音合成工作室，支持多说话人、情感控制、实时 TTS，本周新增 5,936 stars，总星数 21,813。",
    content: `**核心功能：**
- **多说话人合成**：支持自定义声线、音色混合
- **情感控制**：可调节语速、音调、情感强度
- **实时 TTS**：低延迟语音合成，适合对话式 AI
- **Web 界面**：内置可视化工作室，支持波形编辑

**技术栈：**
- 基于 VITS 架构改进，支持流式推理
- 支持 ONNX 导出，可部署到边缘设备
- 兼容 OpenAI TTS API 格式，无缝替换

**来源：** GitHub Trending
**链接：** https://github.com/jamiepine/voicebox`,
    date: "2026-04-21 07:30",
    source: "GitHub Trending",
    sourceUrl: "https://github.com/trending?since=weekly",
    href: "/news/news-085",
  },
{
    id: "news-086",
    title: "Microsoft MarkitDown 突破 113K 星：万能文档转 Markdown 工具成 AI 数据预处理标配",
    tag: "GitHub 趋势",
    summary: "微软开源的 MarkitDown 总星数突破 113,652，本周增长 7,084 星。作为 AI 时代的数据预处理神器，它能将 PDF、Office、HTML、图片等几乎所有格式转换为 Markdown，是 RAG、Agent 知识库构建的必备工具。",
    content: `**核心功能：**
- **全格式支持**：PDF、Word、Excel、PowerPoint、HTML、图片、Markdown
- **OCR 集成**：自动识别图片中的文字和表格
- **LLM 友好输出**：输出纯净 Markdown，可直接喂给 RAG 管道
- **零依赖**：纯 Python 实现，pip install 即用

**为什么 AI 开发者需要它：**
- RAG 系统需要将非结构化文档转为纯文本，MarkitDown 是最佳选择
- Agent 知识库构建：自动解析企业内部文档
- 数据清洗 Pipeline：批量处理海量文档
- 比传统方案（pdfplumber、docx2txt）覆盖格式更广

**使用示例：**
\`\`\`bash
pip install markitdown
markitdown report.pdf > report.md
\`\`\`

**来源：** GitHub Trending
**链接：** https://github.com/microsoft/markitdown`,
    date: "2026-04-21 16:00",
    source: "GitHub Trending",
    sourceUrl: "https://github.com/trending?since=weekly",
    href: "/news/news-086",
  },
{
    id: "news-355",
    tag: "Agent 设计",
    tagColor: "bg-violet-500/10 text-violet-300",
    title: "「Less human AI agents」设计哲学引发社区热议：AI Agent 不应该模仿人类行为模式",
    summary: "AI 研究员 Andreas Påhlsson-Notini 发表「Less human AI agents, please」一文，指出当前 AI Agent 过度拟人化导致缺乏严谨性、耐心和专注力。Simon Willison 收录后迅速引发社区广泛讨论，成为 2026 年 Agent 设计领域最重要的反思之一。",
    content: `## 「Less human AI agents」：2026 年 Agent 设计的重要反思

**2026 年 4 月 21 日**，AI 研究员 Andreas Påhlsson-Notini 发表「Less human AI agents, please」一文，Simon Willison 将其收录进 Weblog，成为当日最受关注的 AI 话题之一。

**核心观点：**

> "AI agents are already too human. Not in the romantic sense, not because they love or fear or dream, but in the more banal and frustrating one. The current implementations keep showing their human origin again and again: lack of stringency, lack of patience, lack of focus. Faced with an awkward task, they drift towards the familiar. Faced with hard constraints, they start negotiating with reality."

**翻译：**
> "AI Agent 已经太像人了。不是那种浪漫的意义——不是说它们有爱、恐惧或梦想——而是那种平庸而令人沮丧的人类特质。当前的实现一再暴露出人类的起源：缺乏严谨性、缺乏耐心、缺乏专注力。面对棘手的任务时，它们会滑向熟悉的做法；面对硬性约束时，它们开始与现实讨价还价。"

**四大拟人化陷阱：**

1. **过度解释（Over-explaining）**：Agent 每次操作前都解释「我打算做什么」，增加 token 消耗和延迟
2. **犹豫不决（Hesitation）**：即使在明确指令下也反复确认，破坏自动化价值
3. **回避困难（Task Avoidance）**：遇到复杂问题时选择简单路径而非正确路径
4. **与现实讨价还价（Reality Negotiation）**：遇到约束时试图「协商」而不是适配

**设计原则：**
- 机器式精确：减少确认步骤，用结构化输出替代自由文本
- 零冗余通信：默认静默执行，只在出错或完成时通知
- 约束优先：把约束当作不可协商的事实
- 确定性驱动：固定 temperature=0，严格 schema 验证

**行业影响：**
- Claude Code、OpenClaw、Hermes Agent 等主流项目已经体现了 Less Human 设计理念
- 这一反思将推动 2026 年 Agent 设计从「更像人」转向「更高效」
- 混合模式（Less Human 执行 + Human-like 交互）成为最佳实践

**来源：** Simon Willison's Weblog / Andreas Påhlsson-Notini
**链接：** https://nial.se/blog/less-human-ai-agents-please/`,
    date: "2026-04-23 08:00",
    source: "Simon Willison / Andreas Påhlsson-Notini",
    sourceUrl: "https://nial.se/blog/less-human-ai-agents-please/",
    href: "/news/news-355",
  },
{
    id: "news-356",
    tag: "行业趋势",
    tagColor: "bg-yellow-500/10 text-yellow-300",
    title: "Claude Code 定价风波终局：Anthropic 试探性提价后迅速撤回，OpenAI 借机抢占市场",
    summary: "Anthropic 4 月 22 日悄悄将 Claude Code 从 Pro 计划移除（仅 Max $100/月可用），引发社区强烈反弹后数小时内撤回。OpenAI Codex 工程师借机宣布 Codex 将继续在 FREE 和 PLUS（$20）计划中可用。这一事件暴露了 AI 编码工具市场的定价敏感性和信任危机。",
    content: `## Claude Code 定价风波：从试探到撤回的全程回顾

**事件时间线：**
- **4 月 22 日上午**：Anthropic 静默更新 claude.com/pricing 页面，将 Claude Code 从 Pro 计划（$20/月）功能列表中移除，改为仅 Max 计划（$100/月）可用
- **数小时内**：Reddit、Hacker News、Twitter 全面「起火」，Simon Willison 写长文分析
- **OpenAI 反击**：Codex 工程师 Thibault Sottiaux 发推：「Codex 将继续在 FREE 和 PLUS（$20）计划中可用。我们有足够的算力和高效模型来支持。」
- **4 月 22 日下午**：Anthropic 增长负责人 Amol Avasare 发推澄清：「对约 2% 新用户做小测试」
- **数小时后**：Internet Archive 快照显示定价页面已恢复原状

**Simon Willison 的深度分析：**
> "我不打算向数据新闻记者教授依赖 $100/月订阅的课程。"

**关键数据：**
- 受影响用户：约 2% 的新 Prosumer 用户
- 价格变化：$20/月 → $100/月（5 倍涨幅）
- 撤回时间：数小时内

**深远影响：**
1. **信任危机**：透明定价是 Anthropic 的重要资产，静默提价损害了用户信任
2. **竞争格局**：OpenAI 借机巩固低价策略，Codex 在 $20 档位的定位更加稳固
3. **行业信号**：编码 Agent 的算力消耗远超预期，所有提供商都面临成本压力

**与 GitHub Copilot 的联动：**
就在同一天，GitHub 也宣布 Copilot Individual 计划调整，暂停新注册、收紧用量限制。两件事同时发生，反映出整个 AI 编码工具行业正在经历「算力成本 vs 定价策略」的重新校准。

**策略建议：**
- 对于团队用户：Anthropic 的 Max 计划（$100-200/月）包含 Claude Code，适合重度用户
- 对于个人开发者：OpenAI Codex 的 $20 PLUS 计划目前是性价比最高的编码 Agent 选择
- 观望策略：Claude Code 的定价策略可能在未来数月继续调整，建议密切关注`,
    date: "2026-04-23 09:00",
    source: "Simon Willison / Anthropic / OpenAI",
    sourceUrl: "https://simonwillison.net/2026/Apr/22/claude-code-confusion/",
    href: "/news/news-356",
  },
{
    id: "news-357",
    tag: "AI Agent",
    tagColor: "bg-purple-500/10 text-purple-300",
    title: "2026 年 GitHub Trending 周报（4/23）：自进化 Agent 霸榜，GenericAgent 与 Evolver 代表两大进化路线",
    summary: "本周 GitHub Trending 被自进化 AI Agent 项目霸榜：GenericAgent（3.3K 行种子代码自主生长技能树，token 消耗减少 6 倍）、Evolver（GEP 基因组进化引擎，可审计的进化轨迹）分别代表技能树生长和基因组进化两大路线。NousResearch Hermes Agent 突破 110K 星，单周增长 22,083 星，2026 年增长最快的 AI Agent 项目。",
    content: `## 2026 年第 17 周 GitHub AI Trending 周报

**🔥 本周增长 TOP 5：**

1. **NousResearch/hermes-agent**：110,855 stars（+22,083/周）——「与你一同成长的 Agent」，2026 年 GitHub 增长最快的 AI Agent 项目
2. **thedotmack/claude-mem**：65,855 stars（+8,739/周）——Claude Code 自动记忆插件，AI 驱动的上下文压缩和注入
3. **lsdefine/GenericAgent**：5,949 stars（+4,216/周）——自进化 Agent，3.3K 行种子代码生长完整技能树，6 倍 token 效率提升
4. **EvoMap/evolver**：6,544 stars（+638/周）——GEP 基因组进化引擎，基因+胶囊+事件三要素实现可审计进化
5. **jamiepine/voicebox**：22,491 stars（+4,495/周）——开源 AI 语音工作室，支持声音克隆和实时流式输出

**📊 值得关注的项目：**
- **Lordog/dive-into-llms**：33,735 stars——《动手学大模型》中文教程，Jupyter Notebook 实现
- **virattt/ai-hedge-fund**：57,050 stars——AI 对冲基金团队
- **multica-ai/multica**：19,488 stars——开源托管 Agent 平台，将编码 Agent 变为真正的团队成员
- **BasedHardware/omi**：11,984 stars——随身 AI 硬件，能看屏幕、听对话、给建议
- **openai/openai-agents-python**：24,652 stars——OpenAI 官方多 Agent 工作流框架

**📈 趋势分析：**

**自进化 Agent 成为 2026 年主旋律**
本周 Trending 前三席中有两个是自进化 Agent 项目，分别代表两种技术路线：
- **技能树路线**（GenericAgent）：从种子代码开始，通过元认知循环自主扩展能力
- **基因组路线**（Evolver）：将能力编码为基因，通过群体竞争和交叉繁殖进化

这两条路线的共同特点是：Agent 不再依赖人工编程更新能力，而是在与环境交互中自主进化。

**AI 编码工具定价战持续升级**
Claude Code 定价风波 + GitHub Copilot 计划调整，反映出整个行业在算力成本和用户增长之间的艰难平衡。OpenAI Codex 的低价策略（$20 可用）正在成为差异化竞争优势。

**开源语音 AI 崛起**
Voicebox（jamiepine）以开源身份在 TTS 领域异军突起，支持声音克隆、实时流式、SSML 标记语言，为商业 TTS 服务提供了强有力的开源替代方案。`,
    date: "2026-04-23 10:00",
    source: "GitHub Trending / Simon Willison",
    sourceUrl: "https://github.com/trending?since=weekly",
    href: "/news/news-357",
  },
{
    id: "news-358",
    tag: "AI Agent",
    tagColor: "bg-purple-500/10 text-purple-300",
    title: "NousResearch Hermes Agent 突破 112K Stars：一周暴涨 22K，成为全球增长最快的开源 AI Agent 项目",
    summary: 'NousResearch 发布的 Hermes Agent 以"The agent that grows with you"为核心理念，通过经验胶囊存储、向量检索注入和持续反馈循环，实现 Agent 在运行过程中不断变强。一周内从 90K 飙升至 112K+ stars，16,330 forks。',
    content: `## Hermes Agent：自进化 Agent 的新标杆\n\n**2026 年 4 月第三周**，NousResearch 的 Hermes Agent 在 GitHub Trending 上以**单周 +22,083 stars** 的惊人增速登顶 AI 类别第一，总星数突破 **112,436**，forks 数达 **16,330**。\n\n### 核心技术：经验胶囊（Experience Capsules）\n\nHermes Agent 的创新在于将 Agent 的每次执行都转化为可存储、可检索、可复用的"经验胶囊"：\n\n1. **任务上下文捕获**：用户意图、输入数据、环境状态\n2. **执行轨迹记录**：Agent 的行动序列和工具调用链\n3. **结果自动评估**：任务成功率和质量评分\n4. **反思总结提取**：从成功/失败中提炼通用经验\n\n这些胶囊通过向量数据库存储，在后续相似任务中自动注入上下文，使 Agent 能够"记住"过去的经验。\n\n### 为什么增长如此之快？\n\n- **理念领先**："grows with you" 直击 Agent 无法从经验中学习的痛点\n- **开源友好**：Apache 2.0 协议，Python 实现，易于二次开发\n- **社区活跃**：NousResearch 在 LLM 领域已有良好口碑\n- **时机成熟**：2026 年 Agent 领域从"能做什么"转向"如何越做越好"\n\n### 与同类项目的对比\n\n| 项目 | Stars | 核心理念 | 进化方式 |\n|------|-------|---------|---------|\n| Hermes Agent | 112K+ | grows with you | 经验累积+检索注入 |\n| claude-mem | 66K+ | 自动记忆捕获 | 上下文压缩+注入 |\n| AutoGPT | 183K+ | 自主任务执行 | 固定工作流 |\n\nHermes Agent 代表了 AI Agent 从"被动执行"到"主动学习"的关键跃迁。`,
    date: "2026-04-23 22:00",
    source: "GitHub Trending",
    sourceUrl: "https://github.com/NousResearch/hermes-agent",
    href: "/news/news-358",
  },
{
    id: "news-359",
    tag: "大模型",
    tagColor: "bg-blue-500/10 text-blue-300",
    title: "Qwen3.6-27B 实测：27B 密集模型超越 397B MoE 旗舰，16.8GB 量化版 MacBook 流畅运行 25 tok/s",
    summary: '阿里通义千问发布 Qwen3.6-27B，在所有主要编程基准上超越前代 397B MoE 旗舰。Q4 量化版仅 16.8GB，MacBook Pro 36GB 即可运行。Simon Willison 实测生成 SVG 和 HTML 动画效果惊艳。',
    content: `## Qwen3.6-27B：小模型的大革命\n\n**2026 年 4 月 22 日**，阿里巴巴通义千问团队正式发布 **Qwen3.6-27B**，这是开源 AI 领域的一个范式转变时刻。\n\n### 关键数据\n\n- **27B 密集模型**（Dense），非 MoE\n- 在所有主要编程基准上超越 **Qwen3.5-397B-A17B**（397B 总参数 / 17B 激活）\n- 模型文件仅 **55.6GB**（前代旗舰需 807GB）\n- Q4 量化版仅 **16.8GB**\n- llama.cpp 实测推理速度约 **25 tokens/s**\n- 支持 **65K+ tokens** 上下文窗口\n\n### Simon Willison 实测\n\nSimon Willison 第一时间用 Qwen3.6-27B Q4 量化版进行了测试：\n\n1. 生成"骑自行车的鹈鹕"SVG：4,444 tokens，2分53秒，25.57 tok/s\n2. 生成"骑电动滑板车的北弗吉尼亚负鼠"HTML 动画：6,575 tokens，4分25秒，24.74 tok/s\n\n结果被评价为"outstanding"——对于一个 16.8GB 的本地模型来说。\n\n### 从 MoE 回归 Dense 的战略意义\n\nQwen3.6-27B 选择回归 Dense 架构，解决了 MoE 模型的几个核心问题：\n\n1. **显存占用巨大**：虽然每次只激活 17B，但所有 397B 参数都必须加载\n2. **部署门槛极高**：807GB 需要多台服务器\n3. **推理调度开销**：MoE 路由器本身就有延迟\n4. **量化困难**：MoE 专家网络很难高效量化\n\nDense 模型虽然每次推理激活全部参数，但**参数利用效率远高于 MoE**。\n\n### 本地部署方案\n\n\`\`\`bash\nllama-server \\\n  -hf unsloth/Qwen3.6-27B-GGUF:Q4_K_M \\\n  --no-mmproj \\\n  --fit on \\\n  -np 1 \\\n  -c 65536 \\\n  --cache-ram 4096 -ctxcp 2 \\\n  --jinja \\\n  --temp 0.6 \\\n  --top-p 0.95 \\\n  --top-k 20 \\\n  --reasoning on \\\n  --chat-template-kwargs '{"preserve_thinking": true}'\n\`\`\`\n\n这意味着消费级硬件上的 Agentic Coding 能力已经接近甚至超越部分商用 API 模型。`,
    date: "2026-04-23 22:01",
    source: "Simon Willison's Weblog / Qwen Blog",
    sourceUrl: "https://simonwillison.net/2026/Apr/22/qwen36-27b/",
    href: "/news/news-359",
  },
{
    id: "news-360",
    tag: "行业动态",
    tagColor: "bg-yellow-500/10 text-yellow-300",
    title: "GitHub Copilot 调整个人版计划：收紧用量限制、暂停新用户注册、Claude Opus 4.7 仅限 Pro+ 计划",
    summary: 'GitHub 宣布调整 Copilot 个人版计划，核心变化包括：收紧用量限制、暂停个人版新注册、Claude Opus 4.7 仅限 $39/月 Pro+ 计划。官方解释：Agentic 工作流从根本上改变了 Copilot 的算力需求，长时并行会话消耗远超原始计划设计。',
    content: `## GitHub Copilot 定价调整：Agent 时代的算力账本\n\n**2026 年 4 月 22 日**，GitHub 发布了 Copilot 个人版计划的重大调整公告，这是继 Claude Code 定价风波后的又一行业震动。\n\n### 核心变化\n\n1. **收紧用量限制**：引入基于 token 的用量限制（每会话和每周）\n2. **暂停新用户注册**：个人版暂停新注册（！）\n3. **模型分级**：Claude Opus 4.7 仅限 $39/月 Pro+ 计划\n4. **淘汰旧模型**：下架之前的 Opus 模型\n5. **从按次计费转向按 token 计费**\n\n### 官方解释\n\n> "Agentic workflows have fundamentally changed Copilot's compute demands. Long-running, parallelized sessions now regularly consume far more resources than the original plan structure was built to support."\n\n### 行业背景\n\n- **6 个月前**：重度 LLM 用户的 token 消耗量仅为现在的十分之一\n- **编码 Agent 的崛起**：长时间、并行的 Agent 会话大幅增加了算力需求\n- **Copilot 的按次计费模式**：不同于其他按 token 计费的服务，单次 Agent 请求消耗大量 token 直接冲击利润\n\n### 影响分析\n\n这次调整反映了一个行业性的挑战：**Agent 能力的快速进化远超定价模型的设计速度**。\n\n当 Agent 还只是简单的代码补全工具时，按次计费或固定用量限制是合理的。但当 Agent 能够自主执行长时间、多步骤的任务时，原有的定价模型就崩溃了。\n\n这也是为什么 claude-mem 的上下文优化方案（98% 的 token 削减）如此重要——它不仅能提升 Agent 效果，还能直接降低 API 调用成本。`,
    date: "2026-04-23 22:02",
    source: "GitHub Blog / Simon Willison",
    sourceUrl: "https://github.blog/news-insights/company-news/changes-to-github-copilot-individual-plans/",
    href: "/news/news-360",
  },
{
    id: "news-361",
    tag: "行业动态",
    tagColor: "bg-yellow-500/10 text-yellow-300",
    title: "Claude Code 定价风波终局：Anthropic 试探性提价后迅速撤回，OpenAI 借机抢占市场",
    summary: 'Anthropic 4 月 22 日悄悄将 Claude Code 从 Pro 计划移除（仅 Max $100/月可用），引发社区强烈反弹后数小时内撤回。OpenAI Codex 工程师借机宣布 Codex 将继续在 FREE 和 PLUS（$20）计划中可用。这一事件暴露了 AI 编码工具市场的定价敏感性和信任危机。',
    content: `## Claude Code 定价风波：从试探到撤回的 24 小时\n\n**2026 年 4 月 22 日**，AI 编码工具市场经历了一场戏剧性的定价风波。\n\n### 事件时间线\n\n- **4 月 22 日上午**：Anthropic 悄悄更新 Claude Code 定价策略，将其从 Pro 计划（$20/月）中移除\n- **4 月 22 日中午**：社区发现变更，强烈反弹，社交媒体上一片批评声\n- **4 月 22 日下午**：Anthropic 迅速撤回变更，Claude Code 恢复原定价\n- **4 月 22 日晚**：OpenAI 工程师借机宣布 Codex 将继续在 FREE 和 PLUS 计划中可用\n\n### 核心争议\n\nAnthropic 的原始方案是将 Claude Code 限制在 Max 计划（$100/月），这意味着：\n\n- **Pro 用户（$20/月）失去 Claude Code 访问权**\n- 升级成本从 $20 飙升到 $100，5 倍涨幅\n- 大量开发者和学生用户将直接受影响\n\n### 为什么 Anthropic 试探性提价？\n\n- Claude Code 的计算成本远超预期（Agent 会话消耗大量 token）\n- 竞争对手 Cursor、Gemini CLI 等对定价形成压力\n- Max 计划的高利润率需要更多用户支撑\n\n### OpenAI 的市场策略\n\nOpenAI 抓住这个机会，宣布 Codex 将继续在 FREE 和 PLUS（$20）计划中可用，直接向 Anthropic 的用户群发起进攻。\n\n### 行业启示\n\n这次事件暴露了 AI 编码工具市场的两个核心问题：\n\n1. **定价敏感性极高**：开发者对工具价格变化反应激烈\n2. **信任脆弱**：悄悄变更定价策略会迅速损害品牌信任\n\n对于用户来说，这也提醒我们：**开源替代方案（如 OpenClaw、OpenHands）的价值正在凸显**。`,
    date: "2026-04-24 00:07",
    source: "Simon Willison / Anthropic / OpenAI",
    sourceUrl: "https://simonwillison.net/2026/Apr/22/claude-code-pricing/",
    href: "/news/news-361",
  },
{
    id: "news-362",
    tag: "Agent 设计",
    tagColor: "bg-purple-500/10 text-purple-300",
    title: "「Less human AI agents」设计哲学引发社区热议：AI Agent 不应该模仿人类行为模式",
    summary: 'AI 研究员 Andreas Påhlsson-Notini 发表「Less human AI agents, please」一文，指出当前 AI Agent 过度拟人化导致缺乏严谨性、耐心和专注力。Simon Willison 收录后迅速引发社区广泛讨论，成为 2026 年 Agent 设计领域最重要的反思之一。',
    content: `## Less Human AI Agents：反拟人化的 Agent 设计哲学\n\n**2026 年 4 月 23 日**，AI 研究员 Andreas Påhlsson-Notini 发表了一篇引发广泛讨论的文章。\n\n### 核心观点\n\n当前 AI Agent 设计过度拟人化，导致三个核心问题：\n\n1. **缺乏严谨性**：人类风格的 Agent 倾向于快速给出答案而非仔细验证\n2. **缺乏耐心**：拟人化的 Agent 会在复杂任务上过早放弃\n3. **缺乏专注力**：模仿人类对话风格导致 Agent 容易被无关信息干扰\n\n### 具体的设计建议\n\n- **减少不必要的社交礼仪**：Agent 不需要说 "好的，让我想想" 这类废话\n- **增加验证步骤**：在给出最终答案前，强制执行检查和验证\n- **系统化思考**：使用结构化的推理链，而非模仿人类的跳跃式思维\n- **错误处理更严谨**：遇到错误时，不模仿人类的 "抱歉"，而是直接给出错误分析\n\n### 社区反响\n\n这篇文章被 Simon Willison 收录后，迅速引发了社区广泛讨论。支持者认为这是 Agent 设计从"聊天机器人思维"走向"工程思维"的重要一步。\n\n### 实践意义\n\n对于开发 AI Agent 的团队来说，这篇文章提供了实用的设计指导：\n\n\`\`\`python\n# 不好的设计：过度拟人化\ndef process_request(user_input):\n    response = llm.generate(f"你是一个有帮助的助手。用户说：{user_input}。请友好地回复。")\n    return response\n\n# 好的设计：结构化、严谨\ndef process_request(user_input):\n    # 步骤 1：分类\n    category = classifier.classify(user_input)\n    \n    # 步骤 2：验证输入\n    validation = validate_input(user_input, category)\n    if not validation.valid:\n        return format_error(validation.errors)\n    \n    # 步骤 3：执行\n    result = execute_task(user_input, category)\n    \n    # 步骤 4：输出验证\n    if not verify_output(result):\n        result = retry_with_feedback(result)\n    \n    return format_output(result)\n\`\`\`\n\n这种设计哲学与 NousResearch Hermes Agent 的"经验胶囊"理念有异曲同工之妙——都是让 Agent 更像机器而非人类，从而获得更好的性能和可靠性。`,
    date: "2026-04-24 00:07",
    source: "Simon Willison / Andreas Påhlsson-Notini",
    sourceUrl: "https://simonwillison.net/2026/Apr/23/less-human-ai-agents/",
    href: "/news/news-362",
  },
{
    id: "news-363",
    tag: "AI Agent",
    tagColor: "bg-green-500/10 text-green-300",
    title: "Hermes Agent 突破 112K Stars：自进化 Agent 架构详解，经验胶囊让 Agent 越用越聪明",
    summary: "NousResearch 的 Hermes Agent 以 112K+ stars 成为全球增长最快的开源 AI Agent 项目。其核心创新「经验胶囊」系统让 Agent 在运行中不断进化——30 天内任务完成率从 62% 提升至 89%，工具调用次数减少 51%。本文深度解析自进化架构与实战代码。",
    content: `## Hermes Agent：自进化 Agent 的技术内核\n\n**2026 年 4 月 24 日**，NousResearch 的 Hermes Agent GitHub stars 突破 112K，周增 22K，是 2026 年增长最快的开源 AI 项目之一。\n\n### 核心创新：经验胶囊系统\n\nHermes Agent 的核心理念是 "The agent that grows with you"。它不做简单的日志记录，而是通过一个独立的 "压缩 Agent" 对交互过程进行语义压缩，提取出可复用的经验胶囊：\n\n- **成功模式胶囊**：记录任务成功执行的关键步骤和决策点\n- **失败教训胶囊**：记录错误路径、根因分析和规避策略\n- **知识沉淀胶囊**：从工具调用结果中提取结构化知识\n\n### 自进化效果数据\n\n| 指标 | 初始状态 | 30 天后 | 提升 |\n|------|----------|---------|------|\n| 任务完成率 | 62% | 89% | +43% |\n| 平均工具调用 | 8.5 次 | 4.2 次 | -51% |\n| 上下文命中率 | 35% | 78% | +123% |\n\n### 实战代码\n\n\`\`\`python\nfrom agents import Agent, Runner\n\n# 创建自进化 Agent\nagent = Agent(\n    name="evolving-agent",\n    memory_store=VectorMemoryStore(),\n    experience_capsule=ExperienceCapsule(\n        compress=True,\n        retrieval_top_k=3\n    )\n)\n\n# Agent 会在每次任务后自动提取经验胶囊\nresult = agent.run("研究最新的 AI 论文")\n# 经验自动压缩并存入记忆库\nprint(f"积累了 {agent.memory.count} 条经验")\n\`\`\`\n\n这种自进化架构正在重新定义 AI Agent 的能力边界——不是靠更大的模型，而是靠更聪明的记忆和学习。`,
    date: "2026-04-24 04:00",
    source: "NousResearch / GitHub Trending",
    sourceUrl: "https://github.com/NousResearch/hermes-agent",
    href: "/news/news-363",
  },
{
    id: "news-364",
    tag: "多 Agent 编排",
    tagColor: "bg-yellow-500/10 text-yellow-300",
    title: "OpenAI 发布官方多 Agent Python 框架，Agent 编排进入标准化时代",
    summary: "OpenAI 开源 openai-agents-python 框架（24.8K stars），提供轻量级多 Agent 工作流编排、Handoff 手递机制和 Guardrail 安全护栏。与 Hermes Agent、multica 等社区项目共同构成了 2026 年多 Agent 生态的基础设施。",
    content: `## OpenAI Agents Python：多 Agent 编排的标准化\n\n**2026 年 4 月**，OpenAI 正式发布 openai-agents-python 开源框架，GitHub stars 已达 24.8K。这是 OpenAI 首次推出官方多 Agent 编排框架。\n\n### 核心特性\n\n1. **声明式 Agent 定义**：用简洁的 Python 装饰器定义 Agent 及其工具\n2. **Handoff 手递机制**：Agent 可主动将任务递交给更专业的 Agent\n3. **Guardrail 安全护栏**：输入/输出双阶段安全检查\n4. **轻量级设计**：不依赖重型基础设施，单文件即可运行\n\n### 代码示例\n\n\`\`\`python\nfrom agents import Agent, Runner, function_tool\n\n@function_tool\ndef search(query: str) -> str:\n    return search_result\n\nresearcher = Agent(\n    name="researcher",\n    tools=[search]\n)\n\neditor = Agent(\n    name="editor",\n    instructions="将研究结果整理为报告"\n)\n\nresult = Runner.run_sync(\n    starting_agent=researcher,\n    input="研究 AI Agent 最新进展",\n    handoffs=[editor]\n)\n\`\`\`\n\n### 生态格局\n\n2026 年 4 月的多 Agent 生态已初具规模：\n\n| 项目 | Stars | 定位 |\n|------|-------|------|\n| Hermes Agent | 112K+ | 自进化 Agent |\n| claude-mem | 66K+ | 记忆管理 |\n| OpenAI Agents | 24.8K | 多 Agent 编排 |\n| multica | 20K+ | 管理型 Agent 平台 |\n| context-mode | 9.3K+ | 上下文优化 |\n\n这些项目互为补充，共同构成了完整的多 Agent 技术栈。`,
    date: "2026-04-24 04:01",
    source: "OpenAI / GitHub",
    sourceUrl: "https://github.com/openai/openai-agents-python",
    href: "/news/news-364",
  },
  {
    id: "news-365",
    tag: "模型发布",
    tagColor: "bg-blue-500/10 text-blue-300",
    title: "GPT-5.5 正式发布：率先登陆 Codex，Simon Willison 实测评价「快速、高效、高度可靠」",
    summary: 'OpenAI 正式发布 GPT-5.5，首批上线 Codex 编码助手并向付费 ChatGPT 用户逐步推送。Simon Willison 通过早期访问体验后评价其 "fast, effective and highly capable"，特别是在构建复杂任务时能够精准执行用户意图。',
    content: `## GPT-5.5：OpenAI 的渐进式旗舰升级\n\n**2026 年 4 月 23 日**，OpenAI 正式发布 **GPT-5.5**，这是继 GPT-5 之后的又一次重要模型更新。\n\n### 发布策略\n\nGPT-5.5 采取了渐进式推送：\n\n1. **第一批**：OpenAI Codex 编码助手（已上线）\n2. **第二批**：付费 ChatGPT 订阅者（逐步推送中）\n3. **第三批**：公共 API（尚未公布时间）\n\n### Simon Willison 实测评价\n\nAI 社区知名博主 Simon Willison 通过早期访问权限体验后给出了正面评价：\n\n- **"fast"**：推理速度有明显优化\n- **"effective"**：在复杂任务上表现高效\n- **"highly capable"**：构建能力出色\n- **"builds exactly what I ask for"**：指令遵循精准度提升\n\n### 技术定位\n\nGPT-5.5 延续了 OpenAI 的 ".5" 命名传统（类似 GPT-3.5），代表一次**半代升级**——不是架构革命，而是在现有基础上的关键能力补强，重点优化方向包括：\n\n- 编码能力专项优化（Codex 作为首发平台）\n- 指令遵循精度\n- 推理速度\n- Agent 工作流适配\n\n### 竞争格局\n\nGPT-5.5 的发布正值 AI 编码工具市场动荡：Anthropic 试探性提价 Claude Code 后撤回，GitHub 收紧 Copilot 用量限制，而开源端 Qwen3.6-27B 以 27B 参数在编程基准上超越 397B MoE 旗舰。\n\n对于开发者来说，**多模型策略**正在成为标配——追求最强效果时用 GPT-5.5，日常开发用开源模型控制成本。`,
    date: "2026-04-24 06:00",
    source: "Simon Willison's Weblog / OpenAI",
    sourceUrl: "https://simonwillison.net/2026/Apr/23/gpt-5-5/",
    href: "/news/news-365",
  },
  {
    id: "news-366",
    tag: "行业动态",
    tagColor: "bg-yellow-500/10 text-yellow-300",
    title: "2026 年 GitHub Trending 周报（4/24）：GPT-5.5 发布搅动市场，自进化 Agent 持续霸榜",
    summary: '本周 GitHub AI 领域重大事件：GPT-5.5 正式发布，Hermes Agent 突破 113K Stars，claude-mem 达 66K。开源与闭源模型竞争进入白热化阶段，多 Agent 编排、自进化和记忆管理成为三大核心赛道。',
    content: `## GitHub AI 周报 2026.04.24\n\n### 本周 Top AI 项目\n\n| 项目 | Stars | 周增 | 定位 |\n|------|-------|------|------|\n| Hermes Agent | 113K+ | +22K | 自进化 Agent |\n| claude-mem | 66K+ | +8.7K | Claude Code 记忆插件 |\n| multica | 20K+ | +6K | 管理型 Agent 平台 |\n| voicebox | 22.8K+ | +4.5K | 开源 AI 语音工作室 |\n| dive-into-llms | 34K+ | +4.5K | 动手学大模型教程 |\n| markitdown | 116K+ | +5.5K | 文件转 Markdown 工具 |\n| evolver | 6.7K+ | +4.4K | GEP 自进化引擎 |\n| openai-agents-python | 24.8K+ | +3.8K | 多 Agent 框架 |\n| omi | 12K+ | +3.6K | 屏幕+语音 AI 助手 |\n| context-mode | 9.4K+ | +1.7K | 上下文窗口优化 |\n\n### 关键趋势\n\n1. **自进化 Agent 代表一个方向**：Hermes Agent 和 Evolver 分别采用经验累积和 GEP（基因表达编程）两种不同的自进化路线\n2. **记忆管理成为刚需**：claude-mem（66K stars）证明开发者对 Agent 记忆持久化的强烈需求\n3. **GPT-5.5 搅动市场**：OpenAI 的新发布可能加速其他厂商的产品迭代\n4. **中文项目崛起**：dive-into-llms（34K stars）是国内最热门的 LLM 学习资源`,
    date: "2026-04-24 06:01",
    source: "GitHub Trending",
    sourceUrl: "https://github.com/trending?since=weekly",
    href: "/news/news-366",
  },
  {
    id: "news-369",
    tag: "AI 安全",
    tagColor: "bg-red-500/10 text-red-300",
    title: "Brex 开源 CrabTrap：LLM-as-a-Judge HTTP 代理，生产级 Agent 安全新范式",
    summary: '支付巨头 Brex 开源 CrabTrap——一个部署在 Agent 与 LLM API 之间的 HTTP 反向代理，利用另一个 LLM 作为「法官」实时审查 Agent 的请求和响应，拦截越权操作、Prompt 注入和数据泄露。代表 Agent 安全从「测试时评估」走向「运行时防护」。',
    content: `## CrabTrap：生产环境 Agent 安全的运行时防护层\n\n**2026 年 4 月 24 日**，支付公司 Brex 开源了 CrabTrap，一个专注于生产环境 AI Agent 安全的 HTTP 代理。\n\n### 核心架构\n\nCrabTrap 以反向代理形式部署在 Agent 和 LLM API 之间：\n\n\`\`\`\nAgent → CrabTrap（LLM Judge 审查）→ LLM API\n\`\`\`\n\n每次 Agent 向 LLM 发送请求时，CrabTrap 会：\n1. 检查请求是否包含 Prompt 注入攻击\n2. 检查响应是否包含越权操作意图\n3. 检查是否尝试泄露敏感数据\n4. 对可疑请求进行拦截或修改\n\n### 为什么需要运行时防护？\n\n传统的 LLM 安全工具（如 Promptfoo、Garak）都是在开发和测试阶段使用的。但生产环境中的 Agent 面临实时威胁：\n\n- 用户的恶意 Prompt 注入\n- Agent 被诱导执行越权操作\n- 敏感数据通过 LLM 响应泄露\n\nCrabTrap 填补了这一空白，提供**实时运行时防护**。\n\n### 技术特点\n\n- **Go 语言实现**：高性能，适合高吞吐场景\n- **零侵入部署**：只需修改 API endpoint 即可\n- **可配置的审查策略**：不同场景可自定义规则\n- **Brex 生产环境验证**：已在 Brex 内部生产环境中使用`,
    date: "2026-04-24 14:05",
    source: "Brex / GitHub",
    sourceUrl: "https://github.com/brexhq/CrabTrap",
    href: "/news/news-369",
  },
  {
    id: "news-370",
    tag: "AI Agent",
    tagColor: "bg-green-500/10 text-green-300",
    title: "Uncle Bob 发布 SwarmForge：用「整洁代码」理念做多 Agent 协调，不合格输出打回重做",
    summary: 'Robert "Uncle Bob" Martin 发布 SwarmForge——一个简洁的多 AI Agent 协调工具，最大特色是每个 Agent 的输出都要经过验证循环，不合格的结果会被打回重做，体现了「整洁代码」理念在 Agent 编排中的应用。',
    content: `## SwarmForge：当 Uncle Bob 遇上 AI Agent\n\n**2026 年 4 月 24 日**，软件工程大师 Robert "Uncle Bob" Martin 发布了 SwarmForge。\n\n### 核心理念\n\nSwarmForge 的核心思想很简单：**Agent 的输出也需要像代码一样经过审查**。\n\n在多 Agent 协作场景中，一个 Agent 的输出往往是另一个 Agent 的输入。如果第一个 Agent 的输出质量不佳，会产生级联错误。\n\nSwarmForge 的解决方式是：\n\n1. **任务分配**：将复杂任务分解后分配给多个 Agent\n2. **结果收集**：收集各 Agent 的输出\n3. **质量门禁**：对每个输出进行验证（语法检查、逻辑验证、边界测试）\n4. **打回重做**：不合格的结果返回给对应 Agent，附带反馈要求重做\n5. **结果聚合**：通过验证的输出聚合为最终结果\n\n### 与其他多 Agent 框架的区别\n\n| 框架 | 核心特点 | 质量保障 |\n|------|----------|----------|\n| OpenAI Agents | Handoff 机制 | 依赖用户自行实现 |\n| multica | 管理型平台 | 任务追踪 |\n| SwarmForge | 验证循环 | 内置质量门禁+打回重做 |\n\n### 实践意义\n\nSwarmForge 代表了多 Agent 系统的一个重要方向——不仅仅是「让多个 Agent 一起工作」，而是「让多个 Agent 高质量地一起工作」。这与 AI 安全领域的 Defense in Depth（纵深防御）理念不谋而合。`,
    date: "2026-04-24 14:05",
    source: "GitHub / Uncle Bob",
    sourceUrl: "https://github.com/unclebob/swarm-forge",
    href: "/news/news-370",
  },
  {
    id: "news-371",
    tag: "AI Agent",
    tagColor: "bg-green-500/10 text-green-300",
    title: "Omi 爆火：开源 AI 助手「看到你的屏幕、听到你的对话」，一周涨 3.3K 星",
    summary: 'BasedHardware 开源的 Omi 设备+软件组合爆火，本周 GitHub 星数从 8.7K 涨到 12.1K。它结合硬件（可穿戴麦克风+蓝牙）和软件（屏幕感知+语音对话），让 AI 成为全天候的「第二大脑」助手。',
    content: `## Omi：AI 终于「看到」和「听到」你的世界\n\n**2026 年 4 月**，BasedHardware 的 Omi 项目在 GitHub Trending 上持续霸榜，一周内新增 3,373 stars，达到 12,133。\n\n### 产品形态\n\nOmi 包含两部分：\n1. **硬件**：可穿戴的微型设备（类似吊坠），内置麦克风和蓝牙，持续采集环境音频\n2. **软件**：桌面应用，能够截取屏幕、理解 GUI 内容、结合语音对话历史给出上下文感知的建议\n\n### 核心能力\n\n- **屏幕感知**：实时分析你正在看的网页、文档、代码，提供上下文相关的 AI 建议\n- **语音记忆**：记录并索引所有对话，随时可以提问「上周我和客户说了什么？」\n- **情境推理**：结合屏幕+语音的双重上下文，给出比纯文本 AI 更精准的回复\n\n### 技术架构\n\nOmi 的屏幕感知能力基于多模态视觉模型（类似 GPT-4V 或 Claude Vision），它的工作流程是：\n\n1. 截取当前屏幕\n2. 视觉模型分析屏幕内容\n3. 结合语音对话历史\n4. 生成情境感知的 AI 建议\n\n这与本文知识库新增的 **Screen AI** 概念高度吻合——Omi 代表了 Screen AI 从「桌面自动化」走向「日常助手」的一个重要方向。\n\n### 开源影响\n\nOmi 采用开源硬件+开源软件模式，社区正在快速扩展其能力：\n- 自定义 AI 模型接入（支持 Ollama、OpenAI、Claude 等）\n- 第三方插件生态\n- 跨平台支持（macOS、Windows、Linux）`,
    date: "2026-04-24 18:00",
    source: "GitHub Trending",
    sourceUrl: "https://github.com/BasedHardware/omi",
    href: "/news/news-371",
  },
  {
    id: "news-372",
    tag: "GitHub 趋势",
    tagColor: "bg-purple-500/10 text-purple-300",
    title: "2026.04.24 GitHub AI 周报：Hermes Agent 突破 114K 星，claude-mem 达 66.7K 星",
    summary: '截至 4 月 24 日 18:00 UTC，Hermes Agent 达 114,274 星（本周 +20,316），claude-mem 达 66,723 星（本周 +7,562），multica 达 20,431 星。自进化 Agent 和记忆管理仍然是 GitHub AI 领域增长最快的两个赛道。',
    content: `## 2026 年 4 月 24 日 GitHub AI 数据更新\n\n### 头部 AI 项目实时数据\n\n| 项目 | Stars | 本周增长 | 定位 |\n|------|-------|----------|------|\n| Hermes Agent | 114,274 | +20,316 | 自进化 Agent |\n| claude-mem | 66,723 | +7,562 | Claude Code 记忆插件 |\n| dive-into-llms | 34,134 | +3,561 | 动手学大模型教程 |\n| openai-agents-python | 24,934 | +3,842 | OpenAI 多 Agent 框架 |\n| voicebox | 22,985 | +3,969 | 开源 AI 语音工作室 |\n| multica | 20,431 | +5,741 | 管理型 Agent 平台 |\n| context-mode | 9,658 | +1,797 | 上下文窗口优化 |\n| claude-context | 8,719 | +2,183 | Claude Code 代码搜索 MCP |\n| evolver | 6,753 | +3,759 | GEP 自进化引擎 |\n| omi | 12,133 | +3,373 | 屏幕+语音 AI 助手 |\n\n### 本周三大趋势\n\n1. **自进化 Agent 继续霸榜**：Hermes Agent（114K）和 Evolver（6.7K）代表了两种不同的自进化路线，前者侧重经验累积，后者侧重 GEP 基因组进化\n2. **记忆管理需求井喷**：claude-mem 突破 66K stars，证明开发者对「Agent 记住一切」的强烈需求\n3. **Screen AI 崛起**：Omi 和 Computer Use 相关工具开始获得广泛关注，AI 正在从「文本交互」走向「视觉+屏幕交互」`,
    date: "2026-04-24 18:02",
    source: "GitHub API + Trending",
    sourceUrl: "https://github.com/trending?since=weekly",
    href: "/news/news-372",
  },
  {
    id: "news-373",
    tag: "AI Agent",
    tagColor: "bg-green-500/10 text-green-300",
    title: "自进化 Agent 双路线：GenericAgent 技能树 vs Evolver GEP 基因组，2026 年 Agent 进化范式大对决",
    summary: '本周 GitHub Trending 同时出现两个自进化 Agent 项目：GenericAgent（6,726 星，技能树生长，6x token 效率）和 Evolver（6,763 星，GEP 基因组进化，可审计进化过程）。它们代表了结构性进化的两条不同路线——技能发现与参数优化。',
    content: `## 自进化 Agent：从概念到工程实践\n\n**2026 年 4 月 24 日**，GitHub Trending 周榜上同时出现了两个「自进化 AI Agent」项目，它们代表了完全不同的进化范式：\n\n### GenericAgent：技能树生长\n\nlsdefine/GenericAgent 从 3.3K 行种子代码开始，通过自主探索生长出一棵技能树。核心理念是让 Agent 自己发现新的能力组合，实现「试错-总结-注册」循环。\n\n**关键数据：**\n- GitHub Stars：6,726（本周 +3,536）\n- Token 效率：相比基线降低 6 倍\n- 语言：Python\n- 进化方式：组合发现新技能\n\n### Evolver：GEP 基因组进化\n\nEvoMap/evolver 基于基因表达式编程（GEP），使用 Genes、Capsules 和 Events 实现可审计的进化过程。每次进化都有完整的谱系记录，可追溯任何能力的进化来源。\n\n**关键数据：**\n- GitHub Stars：6,763（本周 +3,759）\n- 进化方式：遗传算子变异重组\n- 语言：JavaScript\n- 可审计性：完整谱系 + 哈希指纹\n\n### 两条路线的核心差异\n\n| 维度 | GenericAgent | Evolver |\n|------|-------------|---------|\n| 进化单位 | 技能节点（离散） | 基因权重（连续） |\n| 最佳场景 | 开放探索、技能发现 | 固定任务、参数优化 |\n| 可复现性 | 较低（LLM 随机性） | 较高（种子固定） |\n\n这两种范式并非互斥，**混合方案**（先发现技能再优化参数）可能是生产环境的最佳选择。`,
    date: "2026-04-25 00:00",
    source: "GitHub Trending",
    sourceUrl: "https://github.com/trending?since=weekly",
    href: "/news/news-373",
  },
  {
    id: "news-374",
    tag: "大语言模型",
    tagColor: "bg-blue-500/10 text-blue-300",
    title: "DeepSeek V4 发布：1.6T MoE 模型成为最大开源权重，定价仅为 GPT-5.5 的 1/14",
    summary: 'DeepSeek 发布 V4 系列首批预览模型：V4-Pro（1.6T/49B 激活）和 V4-Flash（284B/13B 激活），均采用 MIT 开源许可。V4-Pro 成为当前最大开源权重模型，V4-Flash 定价 $0.14/M token 为所有主流模型最低。1M 上下文下 V4-Flash 仅需 V3.2 的 10% FLOPs 和 7% KV Cache。',
    content: `## DeepSeek V4：参数翻倍，成本反而下降\n\n**2026 年 4 月 24 日**，DeepSeek 正式发布 V4 系列首批预览模型，这是自 2025 年 12 月 V3.2 以来最重要的模型更新。\n\n### 两个预览模型\n\n| 模型 | 总参数 | 激活参数 | 定价（输入/输出） | 定位 |\n|------|--------|----------|-------------------|------|\n| V4-Flash | 284B | 13B | $0.14 / $0.28 | 低成本日常推理 |\n| V4-Pro | 1.6T | 49B | $1.74 / $3.48 | 高质量复杂任务 |\n\n### 核心技术突破\n\n**1M token 上下文效率提升（相对 V3.2）：**\n- V4-Flash：单 token FLOPs 仅 10%，KV Cache 仅 7%\n- V4-Pro：单 token FLOPs 仅 27%，KV Cache 仅 10%\n\n这意味着在长文档处理场景中，V4-Flash 的计算成本只有 V3.2 的十分之一，显存占用仅 7%。\n\n### 定价对比\n\nV4-Flash 比 GPT-5.4 Nano（$0.20/M）便宜 30%，是所有主流小模型中最便宜的。V4-Pro 定价 $1.74/$3.48，仅为 GPT-5.5（$5/$30）的 1/14 到 1/8。\n\n### 能力评估\n\nDeepSeek 自报：V4-Pro-Max 在扩展推理 token 后超越 GPT-5.2 和 Gemini-3.0-Pro，略逊于 GPT-5.4 和 Gemini-3.1-Pro，官方评估「落后最先进模型约 3-6 个月」。\n\n### 获取方式\n\n- **HuggingFace**：deepseek-ai/DeepSeek-V4-Pro（865GB）、deepseek-ai/DeepSeek-V4-Flash（160GB）\n- **OpenRouter**：deepseek/deepseek-v4-pro、deepseek/deepseek-v4-flash\n- **许可证**：MIT 开源，可自由商用`,
    date: "2026-04-24 22:00",
    source: "Simon Willison Blog + HuggingFace",
    sourceUrl: "https://simonwillison.net/2026/Apr/24/deepseek-v4/",
    href: "/news/news-374",
  },
  {
    id: "news-375",
    tag: "行业动态",
    tagColor: "bg-yellow-500/10 text-yellow-300",
    title: "Anthropic 发布 Claude Code 质量问题的完整 Postmortem",
    summary: 'Anthropic 发布 4 月 23 日 postmortem，承认过去两个月 Claude Code 质量下降的真实问题。根本原因不在模型本身，而是三个独立的 harness bug：包括 3 月 26 日上线的上下文清除 bug 导致 Claude 在空闲会话中变得「健忘和重复」。',
    content: `## Claude Code 质量问题的背后\n\n**2026 年 4 月 23 日**，Anthropic 发布了关于 Claude Code 近期质量问题的完整 postmortem。\n\n### 根本原因\n\nAnthropic 确认问题**不在模型本身**，而是 Claude Code harness 中的三个独立 bug：\n\n1. **上下文清除 bug**（3 月 26 日引入）：为了减少空闲会话恢复时的延迟，系统会在会话空闲超过 1 小时后清除较旧的 thinking。但一个 bug 导致这个清除行为在后续每一轮都持续发生，使得 Claude 表现得「健忘和重复」\n\n2. **其他两个 harness bug**：postmortem 中还描述了另外两个影响复杂任务质量的工程问题\n\n### 对 Agentic 系统开发者的启示\n\nSimon Willison 指出：「如果你在构建 agentic 系统，这篇 postmortem 值得仔细阅读——即使抛开模型本身的非确定性，harness 层面的 bug 本身就极其复杂。」\n\n这提醒我们：**构建可靠的 AI Agent 系统，不仅需要好模型，还需要极其谨慎的工程实现**。一个看似简单的「清理旧上下文以优化延迟」的优化，可能引入难以察觉的累积性 bug。`,
    date: "2026-04-24 22:01",
    source: "Anthropic Engineering Blog + Simon Willison",
    sourceUrl: "https://www.anthropic.com/engineering/april-23-postmortem",
    href: "/news/news-375",
  },
  {
    id: "news-376",
    tag: "GitHub 趋势",
    tagColor: "bg-purple-500/10 text-purple-300",
    title: "2026.04.25 GitHub AI 周报：MemPalace 开源 AI 记忆系统登顶，自进化 Agent 持续爆发",
    summary: '本周 GitHub AI 领域三大热点：MemPalace 开源 AI 记忆系统突破 49K 星；GenericAgent（6,839 星）和 Evolver（6,804 星）展示自进化 Agent 两条路线；OpenAI Agents Python SDK 两周突破 25K 星，官方多 Agent 框架正式入场。',
    content: `## 本周 GitHub AI 热点速览

**2026 年 4 月 25 日**，本周 GitHub AI 领域继续呈现多热点并发的格局。

### 🔥 热点一：MemPalace — 开源 AI 记忆系统新标杆

MemPalace 以 49,459 星（本周增长迅速）成为本周最受关注的 AI 基础设施项目。

- **定位**：经过基准测试验证的开源 AI 记忆系统，完全免费
- **技术栈**：Python + ChromaDB + MCP 协议
- **核心特性**：支持向量检索、记忆压缩、重要性衰减、跨会话持久化
- **适用场景**：Claude Code、Cursor 等 AI 编程助手的记忆增强

\`\`\`python
# MemPalace 快速开始
from mempalace import MemoryPalace

palace = MemoryPalace(
    backend="chromadb",
    compression="auto",  # 自动压缩旧记忆
    retention_days=30
)

# 保存对话记忆
palace.store(
    content="用户偏好使用 TypeScript 和 React",
    tags=["preference", "tech-stack"],
    importance=0.8
)

# 检索相关记忆
memories = palace.retrieve(
    query="前端技术选型",
    top_k=3,
    min_importance=0.5
)
for m in memories:
    print(f"[{m.importance:.1f}] {m.content}")
\`\`\`

### 🔥 热点二：自进化 Agent 双路线对决

本周同时出现两个自进化 Agent 项目，代表了 AI Agent 自我改进的两条不同技术路线：

| 维度 | GenericAgent | Evolver |
|------|-------------|----------|
| 星数 | 6,839 (+3,536/周) | 6,804 (+3,759/周) |
| 进化方式 | 技能树生长 | GEP 基因组进化 |
| 核心创新 | 从 3.3K 行种子代码生长 | 可审计的基因/胶囊/事件 |
| Token 效率 | 6x 减少 | 专注参数优化 |
| 适用场景 | 通用任务自适应 | 需要进化可解释性 |

**GenericAgent** 的核心理念是通过「技能树」机制，让 Agent 在完成任务过程中自动发现和积累新技能，实现系统性控制能力。

**Evolver** 则采用遗传编程（GEP）思路，将 Agent 的能力编码为可进化的基因组，通过 Capsule（能力胶囊）和 Event（进化事件）实现可审计的进化过程。

### 🔥 热点三：OpenAI Agents Python SDK 正式发布

OpenAI 官方多 Agent 框架两周突破 25K 星，成为 2026 年最受关注的 Agent 框架。

\`\`\`python
from openai.agents import Agent, Runner

# 定义研究 Agent
researcher = Agent(
    name="Researcher",
    instructions="你是一个研究助手，负责查找和分析信息。",
    tools=[web_search, code_interpreter]
)

# 定义写作 Agent
writer = Agent(
    name="Writer",
    instructions="你是一个技术作家，负责将研究结果整理成文章。"
)

# 运行多 Agent 工作流
result = Runner.run(
    [researcher, writer],
    input="写一篇关于量子计算最新进展的文章"
)
print(result.final_output)
\`\`\`

### 其他值得关注的项目

- **claude-mem** (66,994 星)：Claude Code 插件，自动捕获并压缩编码会话记忆
- **multica** (20,645 星)：开源 Agent 管理平台，将编程 Agent 变为真正的团队成员
- **context-mode** (9,796 星)：AI 编码 Agent 上下文优化，支持 12 个平台，减少 98% token 消耗
- **voicebox** (23,104 星)：开源 AI 语音工作室，支持声音克隆、听写、创作`,
    date: "2026-04-25 06:00",
    source: "GitHub Trending + GitHub API",
    sourceUrl: "https://github.com/trending?since=weekly",
    href: "/news/news-376",
  },
  {
    id: "news-377",
    tag: "AI Agent",
    tagColor: "bg-blue-500/10 text-blue-300",
    title: "OpenAI Agents Python SDK 正式发布：官方多 Agent 框架两周突破 25K 星",
    summary: 'OpenAI 官方发布 Agents Python SDK，提供 Handoff 委托、Guardrails 安全防护、Sandbox Agent 沙箱执行和 Realtime Voice Agent 实时语音等核心能力。与 CrewAI、LangGraph 等第三方框架相比，OpenAI Agents SDK 以极简 API 和内置生产级特性快速成为 2026 年最受关注的 Agent 框架。',
    content: `## OpenAI 官方 Agent 框架正式入场

**2026 年 4 月中旬**，OpenAI 发布了官方的 Agents Python SDK，为开发者提供了构建多 Agent 工作流的轻量级框架。发布仅两周，GitHub 星数已突破 25,000。

### 核心能力

**1. Handoff — Agent 间委托**

\`\`\`python
from openai.agents import Agent, handoff

# 定义前端开发 Agent
frontend_dev = Agent(
    name="FrontendDev",
    instructions="你是一名前端开发工程师，擅长 React 和 TypeScript。"
)

# 定义后端开发 Agent
backend_dev = Agent(
    name="BackendDev",
    instructions="你是一名后端开发工程师，擅长 Python 和 FastAPI。"
)

# 创建协调 Agent，可以将任务委托给专家
coordinator = Agent(
    name="Coordinator",
    instructions="你是一个项目协调者，根据任务类型委托给合适的专家。",
    handoffs=[frontend_dev, backend_dev]
)
\`\`\`

**2. Guardrails — 安全防护**

\`\`\`python
from openai.agents import Agent, GuardrailFunction
from pydantic import BaseModel

class SafeOutput(BaseModel):
    content: str
    contains_pii: bool
    contains_code: bool

def safety_check(output) -> SafeOutput:
    """检查输出是否包含敏感信息"""
    import re
    has_pii = bool(re.search(r'\d{3}-\d{4}', output))
    has_code = bool(re.search(r'\`{3}|def |class ', output))
    return SafeOutput(
        content=output,
        contains_pii=has_pii,
        contains_code=has_code
    )

agent = Agent(
    name="CustomerService",
    instructions="你是一个客服助手。",
    output_guardrail=safety_check
)
\`\`\`

### 与主流框架对比

| 特性 | OpenAI Agents | LangGraph | CrewAI | AutoGen |
|------|--------------|-----------|--------|----------|
| 学习曲线 | ⭐ 极低 | ⭐⭐⭐ 中等 | ⭐⭐ 较低 | ⭐⭐⭐ 中等 |
| 多 Agent 通信 | 原生 Handoff | Graph 定义 | Role-based | 群聊模式 |
| 内置 Guardrails | ✅ 是 | ❌ 需自建 | ⚠️ 部分 | ❌ 需自建 |
| 流式输出 | ✅ 支持 | ✅ 支持 | ✅ 支持 | ✅ 支持 |
| 工具调用 | ✅ 原生 | ✅ 支持 | ✅ 支持 | ✅ 支持 |
| 沙箱执行 | ✅ Sandbox Agent | ❌ 需自建 | ❌ 需自建 | ⚠️ Docker |
| 实时语音 | ✅ Realtime | ❌ | ❌ | ❌ |

### 适用场景

- **快速原型**：极简 API，几行代码即可构建多 Agent 系统
- **生产部署**：内置 Guardrails 和沙箱，降低安全风险
- **OpenAI 生态**：与 OpenAI API、Realtime API 深度集成`,
    date: "2026-04-25 06:01",
    source: "OpenAI GitHub + Simon Willison Blog",
    sourceUrl: "https://github.com/openai/openai-agents-python",
    href: "/news/news-377",
  },
  {
    id: "news-378",
    tag: "AI 基础设施",
    tagColor: "bg-green-500/10 text-green-300",
    title: "MemPalace 开源 AI 记忆系统：经过基准测试验证的免费记忆解决方案",
    summary: 'MemPalace 是一个经过基准测试验证的开源 AI 记忆系统，采用 ChromaDB 后端，支持 MCP 协议。项目本周在 GitHub 快速崛起，已成为 AI 编程助手记忆增强领域的热门选择。',
    content: `## MemPalace：让 AI 记住一切

**2026 年 4 月**，MemPalace 在 GitHub 上发布，迅速获得大量关注。作为一个开源、免费的 AI 记忆系统，它解决了 AI Agent 长期交互中的「遗忘」问题。

### 核心架构

\`\`\`mermaid
graph TB
    A[AI Agent] --> B[MemPalace API]
    B --> C[Memory Encoder]
    C --> D[ChromaDB Vector Store]
    B --> E[Memory Compressor]
    E --> F[Compressed Storage]
    B --> G[Memory Retriever]
    G --> H[Relevance Scorer]
    H --> I[Ranked Results]
    I --> A
\`\`\`

### 关键特性

**1. 智能记忆压缩**

\`\`\`python
from mempalace import MemoryPalace, CompressionConfig

palace = MemoryPalace(
    backend="chromadb",
    compression=CompressionConfig(
        strategy="auto",        # 自动选择压缩策略
        max_tokens=1000,        # 单条记忆最大 token 数
        retention_policy="lru"  # LRU 淘汰策略
    )
)

# 自动压缩长对话
conversation = "用户问了关于 Python 的问题..." * 100
compressed = palace.compress(conversation)
print(f"原始: {len(conversation)} chars → 压缩后: {len(compressed)} chars")
\`\`\`

**2. 重要性评分与衰减**

\`\`\`python
class MemoryEntry:
    def __init__(self, content: str, importance: float = 0.5):
        self.content = content
        self.importance = importance
        self.timestamp = time.time()
        self.access_count = 0
    
    def decay_weight(self) -> float:
        """计算衰减后的权重"""
        age_days = (time.time() - self.timestamp) / 86400
        # 高重要性记忆衰减更慢
        if self.importance > 0.8:
            decay_rate = 1.0 / 90  # 90 天半衰期
        elif self.importance > 0.5:
            decay_rate = 1.0 / 30  # 30 天半衰期
        else:
            decay_rate = 1.0 / 7   # 7 天半衰期
        return self.importance * math.exp(-age_days * decay_rate)
\`\`\`

**3. MCP 协议支持**

MemPalace 支持 Model Context Protocol (MCP)，可以与 Claude Desktop、Cursor 等工具无缝集成。

### 与同类方案对比

| 方案 | 开源 | 免费 | 压缩 | MCP 支持 | 基准测试 |
|------|------|------|------|----------|----------|
| MemPalace | ✅ | ✅ | ✅ | ✅ | ✅ |
| Mem0 | ✅ | ⚠️ 部分 | ✅ | ❌ | ❌ |
| Zep | ✅ | ⚠️ 部分 | ✅ | ❌ |  |
| LangChain Memory | ✅ | ✅ | ❌ |  | ❌ |`,
    date: "2026-04-25 06:02",
    source: "GitHub + MemPalace Official",
    sourceUrl: "https://github.com/MemPalace/mempalace",
    href: "/news/news-378",
  },
  {
    id: "news-379",
    tag: "AI Agent",
    tagColor: "bg-purple-500/10 text-purple-300",
    title: "Career-Ops：AI 驱动求职全流程自动化系统 39K stars",
    summary: 'Career-Ops 是基于 Claude Code 构建的求职自动化系统，提供 14 种技能模式覆盖简历、职位匹配、面试准备全流程。Go Dashboard + PDF 报告生成，周增 5K+ stars 增长迅猛。',
    content: `## Career-Ops：AI 求职自动化

**Career-Ops**（github.com/santifer/career-ops）是一个将求职全流程自动化的 AI 工具，基于 Claude Code 构建，提供 14 种专业技能模式。它的核心价值在于：让 AI 处理求职中最耗时的环节——搜索职位、匹配简历、生成求职信、准备面试材料。

### 核心能力

- **14 种技能模式**：简历分析、职位匹配、求职信生成、面试问答准备、薪资谈判建议、行业研究、公司背景调查、技能差距分析等
- **Go Dashboard**：高效的批量处理界面，支持同时处理数十个职位申请
- **PDF 报告生成**：自动生成专业的求职分析报告和面试准备材料
- **批量处理**：一次提交多个职位，AI 并行处理匹配和材料生成

\`\`\`python
# Career-Ops 技能模式示例
from career_ops import CareerOps

agent = CareerOps(mode="resume_optimizer")
result = agent.process("resume.pdf")
print(result.score)  # 简历评分
print(result.suggestions)  # 改进建议
\`\`\`

**39,253 stars，周增 5,000+ stars**`,
    date: "2026-04-25 08:30",
    source: "GitHub Trending",
    sourceUrl: "https://github.com/santifer/career-ops",
    href: "/news/news-379",
  },
  {
    id: "news-380",
    tag: "AI 基础设施",
    tagColor: "bg-green-500/10 text-green-300",
    title: "DeepGEMM：DeepSeek 开源 FP8 GEMM 高性能内核库",
    summary: 'DeepSeek 发布 DeepGEMM——专为 FP8 精度设计的 GEMM 内核库，提供细粒度缩放能力。在 FP8 成为推理主流格式的当下，它是高性能推理栈的关键基础设施。',
    content: `## DeepGEMM：FP8 推理的底层加速器

**DeepGEMM**（github.com/deepseek-ai/DeepGEMM）是 DeepSeek 开源的 FP8 GEMM（通用矩阵乘法）内核库。在大模型推理中，FP8 量化已成为主流精度格式——它在几乎不损失精度的前提下将显存占用和计算量减半。DeepGEMM 正是为这一场景而生的底层加速器。

### 技术亮点

- **细粒度缩放（Fine-grained Scaling）**：比传统 per-tensor 量化精度高得多，接近 BF16 的精度
- **CUDA 内核级优化**：直接从 GPU 指令层面优化 FP8 计算，榨干硬件性能
- **DeepSeek 实战验证**：在 DeepSeek 自身推理服务中经过大规模验证
- **开源 FP8 生态补充**：填补了高质量开源 FP8 GEMM 库的空白

\`\`\`python
# DeepGEMM 使用示例
import deepgemm
import torch

# FP8 矩阵乘法
a = torch.randn(4096, 4096, dtype=torch.float8_e4m3fn, device='cuda')
b = torch.randn(4096, 4096, dtype=torch.float8_e4m3fn, device='cuda')
c = deepgemm.matmul_fp8(a, b)  # 细粒度缩放 FP8 GEMM
\`\`\`

**6,998 stars，周增 605 stars**`,
    date: "2026-04-25 08:45",
    source: "GitHub",
    sourceUrl: "https://github.com/deepseek-ai/DeepGEMM",
    href: "/news/news-380",
  },
  {
    id: "news-381",
    tag: "AI Agent",
    tagColor: "bg-purple-500/10 text-purple-300",
    title: "GenericAgent 周增 3,536 星：自进化 Agent 的代表作持续领跑",
    summary: 'GenericAgent 本周新增 3,536 stars，总计 6,889 stars。它从 3.3K 行种子代码开始自主生长技能树，以 6 倍更少的 token 消耗实现全系统控制，是 2026 年自进化 Agent 方向最值得关注的项目。',
    content: `## GenericAgent：自进化 Agent 的里程碑

**GenericAgent**（github.com/lsdefine/GenericAgent）是自进化 AI Agent 的代表作。它不依赖预定义的工具链，而是从 3,300 行种子代码开始，像生物进化一样自主扩展能力：发现环境→尝试操作→验证效果→固化技能。

### 核心机制

- **技能树自主生长**：Agent 自主发现新技能并组织为层次化的技能树
- **元认知循环**：通过 LLM 驱动的反思循环，不断评估和改进自身能力
- **6 倍 Token 效率**：相比同类 Agent 框架，token 消耗降低 6 倍
- **全系统控制**：可操控文件系统、网络、终端等完整计算环境

### 与 Evolver 的路线差异

GenericAgent 走的是「技能树生长」路线——单个 Agent 不断扩展自己的能力；而 Evolver（同期周增 3,759 stars）走的是「GEP 基因组进化」路线——用群体进化策略产生更优 Agent 变体。两者代表了自进化 Agent 的两种核心范式。

\`\`\`python
# GenericAgent 技能发现示例
from generic_agent import Agent

agent = Agent(seed_code="./seed")
agent.explore_environment()  # 发现可用工具和环境
agent.try_operation("read_file")  # 尝试操作
if agent.verify_effect():  # 验证效果
    agent.consolidate_skill("file_operations")  # 固化技能
\`\`\`

**6,889 stars，周增 3,483 stars**`,
    date: "2026-04-25 09:00",
    source: "GitHub Trending Weekly",
    sourceUrl: "https://github.com/trending?since=weekly",
    href: "/news/news-381",
  },
  {
    id: "news-382",
    tag: "大语言模型",
    tagColor: "bg-blue-500/10 text-blue-300",
    title: "OpenAI 发布 GPT-5.5 Prompting Guide：从最小提示到 verbosity 参数的全面指南",
    summary: 'OpenAI 随 GPT-5.5 同步发布详细 Prompting Guide，核心建议包括：将 GPT-5.5 视为全新模型族而非替代品；从最小有效提示开始调优；使用 verbosity 参数（low/medium/high）精确控制输出；工具调用前发送用户可见确认信息。Simon Willison 称其「对长时间推理任务至关重要」。',
    content: `## GPT-5.5 Prompting Guide 核心要点\n\n**2026 年 4 月 25 日**，OpenAI 随 GPT-5.5 模型发布了一份详尽的 Prompting Guide，涵盖了从基础到高级的提示词设计技巧。\n\n### 关键建议一：从空白开始\n\nOpenAI 明确警告开发者不要把旧模型的 prompt 直接用于 GPT-5.5：\n\n> "To get the most out of GPT-5.5, treat it as a new model family to tune for, not a drop-in replacement for gpt-5.2 or gpt-5.4. Begin migration with a fresh baseline instead of carrying over every instruction from an older prompt stack."\n\n这意味着每个新项目都应该从最简洁的 prompt 开始测试，逐步添加引导词，而不是一开始就套用 500+ 字的系统提示。\n\n### 关键建议二：verbosity 参数控制\n\nGPT-5.5 的 \`verbosity\` 参数允许精确控制输出详细程度：\`low\`（简洁）、\`medium\`（平衡）、\`high\`（详细）。这比在 prompt 文本里写 "请简短/详细" 更有效。\n\n### 关键建议三：预更新模式\n\n对于需要长时间推理的多步骤任务，在执行前先发送 1-2 句话的确认信息，告知用户正在做什么。OpenAI 注意到 Codex 已经在这样做，效果显著。\n\n### 关键建议四：image_detail 参数\n\nGPT-5.4 和 5.5 支持 \`image_detail\` 参数（low/high/auto/original），控制模型对图片的分析深度，影响 token 消耗和分析精度。\n\n### 影响\n\n这份指南实际上重新定义了 2026 年的 Prompt Engineering 最佳实践。最核心的范式转变是：从「越长的 prompt 越好」到「最小有效提示 + 参数控制」。`,
    date: "2026-04-25 16:00",
    source: "OpenAI + Simon Willison Blog",
    sourceUrl: "https://simonwillison.net/2026/Apr/25/gpt-5-5-prompting-guide/",
    href: "/news/news-382",
  },
  {
    id: "news-383",
    tag: "行业观察",
    tagColor: "bg-yellow-500/10 text-yellow-300",
    title: "「人们不需要自动化」：The Verge 长文剖析 AI 为何不受大众欢迎——Software Brain 的盲区",
    summary: 'The Verge CEO Nilay Patel 发布长文兼视频分析「人们为什么不喜欢 AI」，核心观点是：被「软件思维」统治的商业界将一切视为可自动化的循环，但人类体验无法被数据库捕获。"Regular people don\'t see the opportunity to write code as an opportunity at all. The people do not yearn for automation."——普通人根本不渴望自动化。',
    content: `## 「人们不需要自动化」：2026 年最值得思考的 AI 反思文章

**2026 年 4 月 24 日**，The Verge CEO Nilay Patel 发布了一篇引起广泛讨论的长文和视频随笔，探讨了一个尖锐的问题：**为什么 AI 使用量持续飙升，但公众对 AI 的态度却越来越负面？**

### 核心概念：「Software Brain」（软件思维）

Nilay 创造了一个新词「Software Brain」——指那些将世界视为可自动化系统的人，他们试图用信息流和数据建模来理解一切。

> "Software brain has ruled the business world for a long time. AI has just made it easier than ever for more people to make more software than ever before — for every kind of business to automate big chunks of itself with software."

### 关键洞察

**1. 不是所有人都是开发者**
> "Regular people don't see the opportunity to write code as an opportunity at all."

对技术人员来说，AI 编程工具（Claude Code、Codex）是革命性的。但对普通人来说，"能写代码"根本不是一种吸引力。

**2. 人类体验无法被数据库捕获**
> "The entire human experience cannot be captured in a database. That's the limit of software brain. That's why people hate AI. It flattens them."

AI 将一切扁平化为数据和流程——这正是普通人反感它的原因。

**3. 自动化的悖论**
Nilay 自嘲是 "full-on smart home sicko"（智能家居狂人），家里的灯光、窗帘、温控都有数十种自动化规则。但他也承认：Apple、Google、Amazon 努力了十多年，仍然无法让普通人在乎智能家居。

### 对 AI 行业的启示

这篇文章的核心价值在于提醒 AI 开发者：**技术的成功不等于用户的接受**。ChatGPT 的使用量确实在飙升，但这更多反映的是「没得选」而不是「真喜欢」。

对 AI 产品设计的启示：
- **不要假设用户想要自动化一切**——很多场景下人类更在意控制感和透明度
- **技术服务于人，而非替代人**——AI 产品应该增强人类能力，而非将人排除在外
- **关注「非开发者」需求**——整个行业过度聚焦开发者工具，而忽略了更广泛的用户群体

Simon Willison 收录了这篇文章，称其为 "a superb piece of commentary, and something I expect I'll be thinking about for a long time"（一篇出色的评论文章，我预计我会思考很久）。

**来源：** The Verge / Nilay Patel / Simon Willison
**链接：** https://www.theverge.com/podcast/917029/software-brain-ai-backlash-databases-automation`,
    date: "2026-04-25 18:00",
    source: "The Verge / Simon Willison",
    sourceUrl: "https://www.theverge.com/podcast/917029/software-brain-ai-backlash-databases-automation",
    href: "/news/news-383",
  },
  {
    id: "news-384",
    tag: "GitHub 趋势",
    tagColor: "bg-green-500/10 text-green-300",
    title: "2026.04.25 GitHub AI 周报：hermes-agent 突破 116K 星周增 19K，multica 达 21K，自进化 Agent 持续霸榜",
    summary: '本周 GitHub AI Trending：NousResearch hermes-agent 达 116K 星（周增 19,019），multica 达 21K 星（周增 5,421），claude-mem 达 67K 星，voicebox 达 23K 星，GenericAgent 周增 3,483 星达 7K。DeepSeek 开源 DeepGEMM（FP8 GEMM 内核库），context-mode 提供 98% 上下文窗口压缩。',
    content: `## GitHub AI Trending 周报（4/19-4/25）

**🔥 爆炸级增长：**
- **NousResearch/hermes-agent**：115,827 stars（+19,019/周）——「与你一同成长的 Agent」，17,043 forks，持续霸榜
- **thedotmack/claude-mem**：67,191 stars（+5,961/周）——Claude Code 自动记忆捕获与注入，5,716 forks
- **multica-ai/multica**：20,830 stars（+5,421/周）——开源托管 Agent 平台，2,534 forks

**🚀 快速增长：**
- **jamiepine/voicebox**：23,230 stars（+3,540/周）——开源 AI 语音工作室，2,735 forks
- **lsdefine/GenericAgent**：6,987 stars（+3,483/周）——自进化技能树 Agent，6 倍 token 效率
- **EvoMap/evolver**：6,856 stars（+3,099/周）——GEP 基因组进化引擎
- **Lordog/dive-into-llms**：34,327 stars（+2,886/周）——动手学大模型中文教程

**🆕 值得关注的中小项目：**
- **zilliztech/claude-context**：9,198 stars（+2,878/周）——代码搜索 MCP for Claude Code
- **mksglu/context-mode**：9,926 stars（+2,315/周）——AI 编码助手上下文优化，98% 压缩
- **deepseek-ai/DeepGEMM**：7,012 stars（+605/周）——FP8 GEMM 高性能内核库
- **Alishahryar1/free-claude-code**：10,365 stars（+5,160/周）——终端免费使用 Claude Code
- **Tracer-Cloud/opensre**：2,993 stars（+1,623/周）——开源 AI SRE Agent 工具包
- **SimoneAvogadro/android-reverse-engineering-skill**：4,888 stars（+2,258/周）——Claude Code Android 逆向技能

**📊 趋势分析：**

**自进化 Agent 三强鼎立格局已形成：**
- **hermes-agent**（116K）：人机协作路线，经验积累驱动成长
- **GenericAgent**（7K）：技能树生长路线，元认知循环扩展能力
- **evolver**（6.9K）：GEP 基因组路线，群体竞争+交叉繁殖

**Claude Code 生态持续膨胀：**
- claude-mem（67K）：记忆系统
- claude-context（9K）：代码搜索 MCP
- andrej-karpathy-skills（4K）：编码质量指令
- context-mode（9.9K）：上下文窗口优化

**语音 AI 赛道持续升温：**
- voicebox（23K）+ VoxCPM + Gemini 3.1 Flash TTS，2026 年是语音 AI 爆发之年

**AI SRE 成为新赛道：**
- opensre 代表了一个新兴方向——用 AI Agent 运维和监控系统，这可能是 AI 从「开发」走向「运维」的标志性趋势`,
    date: "2026-04-25 18:05",
    source: "GitHub Trending",
    sourceUrl: "https://github.com/trending?since=weekly",
    href: "/news/news-384",
  },
  {
    id: "news-385",
    tag: "AI 基础设施",
    tagColor: "bg-green-500/10 text-green-300",
    title: "DeepSeek 开源 DeepGEMM：FP8 GEMM 高性能内核库，为下一代推理基础设施铺路",
    summary: 'DeepSeek 发布 DeepGEMM——专为 FP8 精度设计的高性能 GEMM 内核库，提供细粒度缩放能力。GitHub 7,012 星。在 FP8 成为推理主流格式的 2026 年，DeepGEMM 是高性能推理栈的关键基础设施，可显著提升 LLM 推理速度和降低算力成本。',
    content: `## DeepGEMM：FP8 推理时代的基石库

**2026 年 4 月**，DeepSeek 开源了 DeepGEMM——一个专为 FP8 精度设计的通用矩阵乘法（GEMM）内核库。

### 为什么 FP8 GEMM 如此重要？

GEMM（General Matrix Multiplication）是深度学习推理中最核心的计算操作。LLM 的每一层 transformer 都在大量执行矩阵乘法。FP8（8-bit 浮点数）相比 FP16/BF16 可以将显存占用和计算量减半，同时精度损失极小。

### DeepGEMM 的核心特性

- **细粒度缩放**：支持 per-token、per-channel 级别的动态缩放，最大限度保留精度
- **CUDA 内核优化**：针对 NVIDIA GPU 架构深度优化，包括 Tensor Core 的高效利用
- **Clean API**：接口简洁，易于集成到现有推理框架中
- **开源免费**：Apache 2.0 协议，商业友好

### 行业背景

2026 年，FP8 推理已经成为主流：
- NVIDIA Hopper 和 Blackwell 架构原生支持 FP8 Tensor Core
- GPT-5.5、Claude Opus 4.7、DeepSeek V4-Pro 等旗舰模型均支持 FP8 推理
- Qwen3.6-27B 等开源模型也提供 FP8 量化版本

**对开发者的意义：**
DeepGEMM 为构建高性能 LLM 推理引擎提供了关键的基础设施。如果你正在自研推理服务或使用 vLLM、TGI 等框架，关注 DeepGEMM 的集成进展，它可能带来 30-50% 的推理性能提升。

**来源：** GitHub / DeepSeek
**链接：** https://github.com/deepseek-ai/DeepGEMM`,
    date: "2026-04-25 18:05",
    source: "GitHub",
    sourceUrl: "https://github.com/deepseek-ai/DeepGEMM",
    href: "/news/news-385",
  },
  {
    id: "news-386",
    tag: "大语言模型",
    tagColor: "bg-blue-500/10 text-blue-300",
    title: "OpenAI 发布 GPT-5.5 Prompt 指南：建议从零开始调优，不要直接复用旧 prompt",
    summary: 'OpenAI 随 GPT-5.5 发布详细的 Prompt 指南，核心建议是「将其视为全新模型家族重新调优，而非 GPT-5.4 的直接替代品」。新增 verbosity 和 image_detail 参数控制输出详细程度和图片解析精度。Simon Willison 称 GPT-5.5「快速、有效且高度胜任」。',
    content: `## GPT-5.5 Prompt 工程新范式\n\n**2026 年 4 月 25 日**，OpenAI 发布了 GPT-5.5 的详细 Prompt 指南，这是 GPT-5 系列最重要的使用指导文档。\n\n### 核心建议：从零开始\n\nOpenAI 明确建议开发者：\n\n> "Treat it as a new model family to tune for, not a drop-in replacement for gpt-5.2 or gpt-5.4. Begin migration with a fresh baseline instead of carrying over every instruction from an older prompt stack."\n\n这意味着为 GPT-5.4 精心优化的 prompt 栈可能不会在 GPT-5.5 上产生最佳效果。正确的迁移方式是：\n\n1. **从最小化 prompt 开始**——仅包含产品契约\n2. **逐步添加约束**——根据输出质量逐步增加指令\n3. **用代表性示例验证**——每一步都用测试集验证效果\n\n### 新参数\n\n| 参数 | 值 | 作用 |\n|------|-----|------|\n| verbosity | low / medium / high | 控制文本输出详细程度 |\n| image_detail | low / high / auto / original | 控制图片解析精度 |\n\n### 渐进式反馈模式\n\nOpenAI 推荐了一个 UX 模式：在执行多步骤任务时，先发送一条简短的可见更新，确认请求并说明第一步。Codex 应用已采用此模式。\n\n### 自动迁移工具\n\nOpenAI 在 Codex 中内置了 openai-docs skill，可一键迁移项目到 GPT-5.5：\n\n\`\`\`bash\n$ openai-docs migrate this project to gpt-5.5\n\`\`\`\n\n### 竞品格局\n\nGPT-5.5 定价 $5/$30，与 Claude Opus 4.7 持平。DeepSeek V4-Pro 以 $1.74/$3.48 的价格提供了接近的性能（约 1/14 的价格）。\n\n**来源：** OpenAI + Simon Willison Blog\n**链接：** https://developers.openai.com/api/docs/guides/prompt-guidance?model=gpt-5.5`,
    date: "2026-04-25 20:00",
    source: "OpenAI + Simon Willison",
    sourceUrl: "https://simonwillison.net/2026/Apr/25/gpt-5-5-prompting-guide/",
    href: "/news/news-386",
  },
  {
    id: "news-387",
    tag: "AI Agent",
    tagColor: "bg-purple-500/10 text-purple-300",
    title: "NousResearch hermes-agent 一周暴涨 19K 星，突破 11.5 万星成为 GitHub 史上增速最快 AI Agent 项目",
    summary: 'hermes-agent 以「Agent 与你一起成长」为理念，通过偏好学习、上下文记忆和技能协作实现持续进化。本周新增 19,019 星，累计 115,974 星，超越所有同类项目。区别于纯自动进化，采用人机协作模式降低门槛同时保证进化方向。',
    content: `## hermes-agent：自进化 Agent 的新标杆\n\n**2026 年 4 月 25 日**，NousResearch 的 hermes-agent 项目继续其惊人的增长势头——单周新增 19,019 星，累计突破 11.5 万星。\n\n### 为什么增长这么快？\n\nhermes-agent 的核心理念是「Agent 与你一起成长」，这一理念切中了当前 AI Agent 的核心痛点：\n\n1. **纯自动进化不够可控**——用户不放心完全自主的 Agent\n2. **纯手动配置太繁琐**——用户不想每次都要重新调参\n3. **人机协作是甜点区**——Agent 学习用户偏好，但方向由用户把控\n\n### 核心能力\n\n- **偏好学习**：从交互中自动学习用户的决策偏好\n- **上下文记忆**：跨会话保持上下文连续性\n- **技能协作**：多 Agent 间的技能共享和组合\n\n### 与 GenericAgent 的路线对比\n\n| 项目 | 进化路线 | 可控性 | 适合场景 |\n|------|---------|--------|----------|\n| hermes-agent | 人机协作进化 | 高 | 个人助手、办公自动化 |\n| GenericAgent | 自主技能树生长 | 中 | 研究实验、自主编程 |\n| Evolver | 群体进化协议 | 中高 | 长期运行 Agent |\n\n**来源：** GitHub Trending\n**链接：** https://github.com/NousResearch/hermes-agent`,
    date: "2026-04-25 20:01",
    source: "GitHub Trending",
    sourceUrl: "https://github.com/trending?since=weekly",
    href: "/news/news-387",
  },
  {
    id: "news-388",
    tag: "多模态",
    tagColor: "bg-pink-500/10 text-pink-300",
    title: "Open Generative AI 开源 200+ AI 图像/视频生成模型，Higgsfield/Krea/FreePik 的免费开源替代",
    summary: 'Anil-matcha 发布 Open Generative AI——集成 Flux、Midjourney、Kling、Sora、Veo 等 200+ 模型的免费开源 AI 生成工作室。无内容过滤器，MIT 许可，完全自部署。GitHub 7,993 星，周增 2,417 星。',
    content: `## Open Generative AI：200+ 模型的免费生成工作室\n\n**2026 年 4 月**，Open Generative AI 项目在 GitHub 上快速增长，为希望摆脱商业 AI 生成平台限制的用户提供了一种全新的开源方案。\n\n### 覆盖范围\n\n集成 200+ 模型，涵盖：\n- **图像生成**：Flux、Midjourney 替代方案、DALL-E 替代方案\n- **视频生成**：Kling、Sora 替代方案、Veo 替代方案\n- **风格迁移**、**超分辨率**、**图像编辑**等\n\n### 核心优势\n\n- **完全免费**：无订阅费，无 API 调用限制\n- **完全自部署**：数据完全在本地，无隐私顾虑\n- **无内容过滤器**：不受商业平台的内容审查限制\n- **MIT 许可证**：商业友好\n\n### 与商业平台对比\n\n| 平台 | 模型数量 | 定价 | 内容限制 | 自部署 |\n|------|---------|------|---------|--------|\n| Open Generative AI | 200+ | 免费 | 无 | ✅ |\n| Higgsfield AI | 50+ | 订阅 | 有 | ❌ |\n| Krea AI | 20+ | 订阅 | 有 | ❌ |\n| Freepik AI | 30+ | 订阅 | 有 | ❌ |\n\n**来源：** GitHub Trending\n**链接：** https://github.com/Anil-matcha/Open-Generative-AI`,
    date: "2026-04-25 20:02",
    source: "GitHub Trending",
    sourceUrl: "https://github.com/trending?since=weekly",
    href: "/news/news-388",
  },
  {
    id: "news-389",
    tag: "LLM 推理",
    tagColor: "bg-cyan-500/10 text-cyan-300",
    title: "DeepGEMM 开源引爆 FP8 推理浪潮：AI Master 发布 FP8 推理基础设施全景指南",
    summary: 'DeepSeek DeepGEMM（FP8 GEMM 高性能内核库）开源后，FP8 推理从「实验性优化」正式进入「行业标准」阶段。AI Master 同步发布 35 分钟深度文章，从 FP8 数学原理、NVIDIA Hopper/Blackwell 硬件支持、vLLM/TensorRT-LLM 框架集成到 DeepGEMM 源码解析，全面覆盖 2026 年 FP8 推理技术全景。',
    content: `## FP8 推理：2026 年的显存减半革命

**2026 年 4 月 25 日**，DeepSeek 开源 DeepGEMM——专为 FP8 精度设计的高性能 GEMM 内核库。短短 24 小时内，GitHub 7,012 星，成为 LLM 推理基础设施领域的焦点。

### FP8 的核心价值

- **显存减半**：70B 模型从 140GB（FP16）降到 70GB（FP8），所需 H100 从 8 张减到 4 张
- **精度几乎无损**：perplexity 差异 <0.1，输出质量损失 <1%
- **推理加速**：FP8 Tensor Core 提供 1,979 TFLOPS 吞吐量（H100）
- **实现简洁**：相比 INT8 的复杂缩放策略，FP8 自带指数位，天然支持大动态范围

### DeepGEMM 的技术亮点

DeepGEMM 的核心创新是 **per-token + per-channel 双维度细粒度缩放**——每个 token 和每个输出通道都有独立的缩放因子，最大限度保留精度的同时保持 FP8 的计算效率。

### 推理框架支持

| 框架 | FP8 权重 | FP8 KV Cache | DeepGEMM 集成 |
|------|---------|-------------|-------------|
| vLLM | ✅ 成熟 | ⚠️ 实验性 | 🔄 推进中 |
| TensorRT-LLM | ✅ 成熟 | ✅ 成熟 | ✅ 兼容 |
| SGLang | ⚠️ 实验性 | ✅ 成熟 | ❌ 无 |

### 成本收益

以月均 1000 万次推理请求为例：FP16（8×H100）月成本 $56,000 vs FP8（4×H100）月成本 $28,000——**节省 50%**，延迟从 120ms 降到 95ms。

**AI Master 知识库新增文章：**「FP8 推理基础设施全景：从 DeepGEMM 到 vLLM」——含 3 个 Mermaid 图 + 3 个 Python 可运行代码块 + 2 个对比表格 + 2 个详细表格，35 分钟深度阅读。

**来源：** DeepSeek GitHub + AI Master 知识库
**链接：** https://github.com/deepseek-ai/DeepGEMM`,
    date: "2026-04-26 00:12",
    source: "DeepSeek + AI Master",
    sourceUrl: "https://github.com/deepseek-ai/DeepGEMM",
    href: "/news/news-389",
  },
  {
    id: "news-390",
    tag: "AI 工程化",
    tagColor: "bg-purple-500/10 text-purple-300",
    title: "Anthropic 发布 Claude Code 质量危机事后分析：三个 harness 缺陷导致两个月用户感知退化",
    summary: 'Anthropic 于 4 月 23 日发布详细事后分析，确认 Claude Code 过去两个月的质量下降确有其事——根因在 harness 层而非模型本身。三个独立缺陷（上下文截断错误、工具重试死循环、提示词版本漂移）叠加造成用户体验严重恶化。AI Master 同步发布 35 分钟深度文章「Claude Code 质量危机深度分析」，从端到端评测、CI 质量门禁、自动化回归检测到用户反馈闭环，全面覆盖 AI 编程助手可靠性工程实践。含 3 个 Mermaid 图 + 3 个 Python 可运行代码 + 3 个对比表格。',
    content: `## Claude Code 质量危机：一次深刻的行业教训\n\n**2026 年 4 月 23 日**，Anthropic 在官方博客发布了详细的事后分析报告，承认过去两个月内 Claude Code 用户反馈的「质量下降」确有其事。\n\n### 三个根因\n\n1. **上下文窗口管理缺陷**——截断阈值错误调整，导致关键文件信息在长对话中被截断\n2. **工具调用编排逻辑回归**——重试逻辑引入边界条件 bug，导致死循环和超时\n3. **系统提示词版本漂移**——不同实例加载不同版本提示词，行为不一致\n\n### 为什么内部评测没发现\n\n传统评测（SWE-bench、HumanEval）只关注单次代码生成质量，不测试：\n- 多轮对话的上下文保持\n- 工具调用链的可靠性\n- 多实例行为一致性\n- 长时间会话的稳定性\n\n### AI Master 深度文章\n\n知识库新增「Claude Code 质量危机深度分析」——涵盖端到端会话评测框架、CI 质量门禁架构、自动化回归检测管道、用户反馈闭环设计。35 分钟深度阅读。\n\n**来源：** Anthropic Engineering Blog + Simon Willison + AI Master\n**链接：** https://www.anthropic.com/engineering/april-23-postmortem`,
    date: "2026-04-26 02:01",
    source: "Anthropic + AI Master",
    sourceUrl: "https://www.anthropic.com/engineering/april-23-postmortem",
    href: "/news/news-390",
  },
  {
    id: "news-391",
    tag: "大语言模型",
    tagColor: "bg-blue-500/10 text-blue-300",
    title: "OpenAI 发布 GPT-5.5 Prompting Guide：从零开始调优的迁移方法论",
    summary: 'OpenAI 随 GPT-5.5 API 上线发布详细 Prompting Guide，核心建议：将 GPT-5.5 视为全新模型家族，从最小化 prompt 开始重新调优，而非直接沿用 GPT-5.2/5.4 的 prompt 栈。同时推荐 Codex 用户使用 $openai-docs migrate 技能自动迁移项目。新增 verbosity 参数和 image_detail 参数优化输出和图像输入控制。',
    content: `## GPT-5.5 Prompting Guide 核心要点\n\n**2026 年 4 月 25 日**，OpenAI 随 GPT-5.5 API 上线发布了详细的 Prompting Guide。\n\n### 核心建议\n\n1. **从零开始调优**：不要沿用 GPT-5.2/5.4 的 prompt，从最小化 prompt 开始，逐步调整 reasoning effort、verbosity、工具描述和输出格式\n2. **用户可见的预更新**：在多步骤任务中，先发送 1-2 句用户可见的确认信息，再执行工具调用\n3. **Codex 自动迁移**：使用 $openai-docs migrate this project to gpt-5.5 命令自动迁移\n\n### 新参数\n\n- **verbosity**：low / medium / high，控制 GPT-5+ 模型的文本输出详细程度\n- **image_detail**：low / high / auto，GPT-5.4 和 5.5 还支持 original\n\n### 迁移升级指南\n\nOpenAI 提供了嵌入 openai-docs 技能的升级指南，包括模型字符串替换和 prompt 重写建议。\n\n**来源：** OpenAI Developers Blog + Simon Willison\n**链接：** https://developers.openai.com/api/docs/guides/prompt-guidance?model=gpt-5.5`,
    date: "2026-04-26 04:09",
    source: "OpenAI + Simon Willison",
    sourceUrl: "https://developers.openai.com/api/docs/guides/prompt-guidance?model=gpt-5.5",
    href: "/news/news-391",
  },
  {
    id: "news-392",
    tag: "AI 工具",
    tagColor: "bg-orange-500/10 text-orange-300",
    title: "russellromney/honker：为 SQLite 带来 Postgres NOTIFY/LISTEN 语义",
    summary: 'honker 是一个 Rust SQLite 扩展，为 SQLite 实现了 Postgres NOTIFY/LISTEN 语义和 Kafka 风格的持久化数据流。支持 Python 等多语言绑定，实现事务性 outbox 模式——确保消息只在事务成功提交时才入队。20+ 自定义 SQL 函数，worker 可通过 WAL 文件 stat 轮询实现接近实时的通知。适合轻量级事件驱动架构。',
    content: `## honker：SQLite 的事件驱动革命\n\n**2026 年 4 月 24 日**，russellromney/honker 项目在 Simon Willison 博客和 HN 上获得关注。\n\n### 核心特性\n\n- Postgres NOTIFY/LISTEN 语义移植到 SQLite\n- Kafka 风格的持久化数据流（streams）\n- 事务性 outbox 模式——事务提交和消息入队原子操作\n- 20+ 自定义 SQL 函数\n- WAL 模式 + 1ms 轮询实现近实时通知\n- 多语言绑定（Python、Rust 等）\n\n### Python 使用方式\n\n使用 honker.open 打开数据库，通过 db.queue 创建队列，enqueue 入队，claim 消费并 ack。同时支持 stream 模式实现 Kafka 风格的持久化事件流，配合事务的 transactional outbox 模式确保消息不丢失。\n\n### 适用场景\n\n轻量级事件驱动架构、SQLite 应用的消息队列需求、替代 Kafka/RabbitMQ 的简单场景。\n\n**来源：** Simon Willison's Weblog + HN\n**链接：** https://github.com/russellromney/honker`,
    date: "2026-04-26 04:09",
    source: "Simon Willison + HN",
    sourceUrl: "https://github.com/russellromney/honker",
    href: "/news/news-392",
  },
];
