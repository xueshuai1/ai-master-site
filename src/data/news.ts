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
  }
];
