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
    id: "news-309",
    tag: "AI Agent",
    tagColor: "bg-blue-500/10 text-blue-300",
    title: "NousResearch Hermes Agent 单周暴涨 4.2 万星——可成长型 AI Agent 成本周最火开源项目",
    summary: "NousResearch 的 Hermes Agent 本周增长 42,612 stars，总星数突破 10 万，成为 GitHub 本周增长最快的 AI 项目。该项目的核心理念是「与你一起成长的 Agent」，支持持续学习和能力累积，代表了 AI Agent 从静态工具向进化伙伴的范式转变。",
    content: `## Hermes Agent：AI Agent 的「进化论」

2026 年 4 月，NousResearch 的 Hermes Agent 以爆炸级速度席卷 GitHub，单周增长 42,612 stars，总星数突破 100,757，成为本周最受瞩目的开源 AI 项目。

**核心理念：与你一起成长的 Agent**

不同于传统 AI 工具的「开箱即用」模式，Hermes Agent 强调持续进化能力：

- **经验累积**：Agent 在执行任务过程中积累经验和知识
- **能力叠加**：新能力可以增量添加，不需要重新训练
- **自我优化**：通过反思和反馈不断提升任务执行效率
- **个性化适配**：根据用户的使用习惯和工作场景逐步调优

**技术架构亮点：**

1. **模块化技能系统**：Agent 通过加载不同技能模块来扩展能力边界
2. **记忆持久化**：跨会话记忆保留，避免「每次都是重新开始」
3. **反馈学习循环**：用户反馈直接转化为 Agent 的行为调整
4. **开放生态**：社区可以贡献技能模块，形成能力增长飞轮

**为什么增长如此爆炸？**

Hermes Agent 的爆发式增长反映了市场对「可进化 AI」的强烈需求。当前主流 AI 工具（如 ChatGPT、Claude）虽然能力强，但每次对话都是「失忆」的。Hermes Agent 试图打破这一局限，让 AI 真正成为「越来越懂你的伙伴」。

**与同类项目对比：**

| 项目 | 核心定位 | 增长方式 | 当前 Stars |
|------|---------|---------|------------|
| Hermes Agent | 可成长 AI | 经验累积 | 100,757 |
| GenericAgent | 自进化技能树 | 从种子生长 | 4,375 |
| Evolver (GEP) | 基因组进化引擎 | 遗传算法 | 5,247 |
| OpenManus | 自主任务执行 | 任务驱动 | 419 |

**影响与展望：**

Hermes Agent 的成功验证了一个方向：未来的 AI 不仅仅是「更强」，更是「更懂你」。可成长型 Agent 可能成为 2026 年 AI 领域最重要的技术趋势之一。`,
    date: "2026-04-19",
    source: "GitHub Trending",
    sourceUrl: "https://github.com/trending?since=weekly",
    href: "/news/news-309",
  },
{
    id: "news-310",
    tag: "AI 研究",
    tagColor: "bg-purple-500/10 text-purple-300",
    title: "Kronos 金融基础模型：AI 预测市场的下一个前沿，周增 6,000 星",
    summary: "shiyu-coder 团队发布的 Kronos 是专为金融市场设计的 Foundation Model，将时间序列预测与大语言模型融合理解市场文本数据。一周内增长 6,026 stars，总计 19,460 stars，成为 AI for Finance 领域最受关注的项目。",
    content: `## Kronos：当大模型走进华尔街

金融市场预测一直是 AI 最具挑战性也最具商业价值的应用场景之一。2026 年 4 月，Kronos 项目横空出世，以 19,460 stars 和周增 6,026 的速度成为 AI for Finance 领域的明星。

**核心技术：双模态融合**

Kronos 的创新在于将两种截然不同的数据类型统一到一个模型中：

1. **文本理解**：利用 LLM 处理金融新闻、财报、研报等非结构化文本
2. **时间序列预测**：专用 Transformer 处理价格、成交量等结构化市场数据
3. **交叉注意力融合**：文本语义信号与市场时序信号通过交叉注意力机制深度交互

**应用场景：**

- 多市场覆盖：股票、期货、加密货币
- 多时间粒度：分钟级到月级的灵活预测
- 不确定性量化：不仅给出预测值，还提供置信区间
- 事件驱动分析：重大新闻发布后的市场反应预测

**为什么值得关注？**

传统量化模型（如 ARIMA、LSTM）只能处理数值数据，忽略了金融市场中「信息」的核心作用。Kronos 首次将「读新闻」和「看行情」融合到一个统一框架中，更接近人类交易员的决策方式。`,
    date: "2026-04-19",
    source: "GitHub",
    sourceUrl: "https://github.com/shiyu-coder/Kronos",
    href: "/news/news-310",
  },
{
    id: "news-308",
    tag: "AI Agent",
    tagColor: "bg-blue-500/10 text-blue-300",
    title: "OpenAI 发布 Codex for (almost) everything：AI 从代码生成迈向自主执行计算机操作",
    summary: "OpenAI 宣布 Codex 现在可以自主操控 macOS 应用——打开 Finder、操作 Safari、编辑文档，全程无需人类干预。同时发布新一代 Agents SDK，提供标准化的 Agent 构建工具链。这标志着 AI 编程从「生成代码片段」迈入「自主完成任务」的全新范式。",
    content: `## Codex 自主执行：AI 编程的第三次范式跃迁

2026 年 4 月 16 日，OpenAI 发布「Codex for (almost) everything」，这是 AI 编程领域的里程碑事件。

**核心能力：**
- 自主操控 macOS 应用（Finder、Safari、Pages 等）
- 端到端任务执行：从理解意图到完成操作
- 多步推理与错误恢复
- 视觉感知 + 语义理解 + 操作执行的完整架构

**Agents SDK 同步演进：**
- Agent 编排器：多 Agent 协作管理
- 工具注册中心：标准化接口
- 记忆管理系统：上下文与向量检索
- 沙箱执行环境：安全隔离
- 人类在环接口：关键步骤确认

**与现有工具对比：**
- GitHub Copilot：仅限编辑器内补全
- Cursor：编辑器内对话
- Claude Code：终端命令执行
- **Codex：完整 GUI 操作，任意应用**

**影响：** 开发者工作流将从「编写代码」转向「定义目标」，AI Agent 成为执行主体。`,
    date: "2026-04-19 14:00",
    source: "OpenAI Blog",
    sourceUrl: "https://openai.com/index/codex-for-almost-everything/",
    href: "/news/news-308",
  },
{
    id: "news-307",
    tag: "AI 产品",
    tagColor: "bg-green-500/10 text-green-300",
    title: "Anthropic 发布 Claude Design：AI 驱动的设计协作平台，从创意到代码一站式闭环",
    summary: "Anthropic Labs 推出 Claude Design，支持自然语言生成设计稿、设计系统自动学习、精细化控制和多格式导出。设计完成后一键交由 Claude Code 变为生产代码，实现从设计到开发的全流程自动化。同时发布 Opus 4.7 和 Project Glasswing 安全计划。",
    content: `## Claude Design：Anthropic 的设计革命

2026 年 4 月 17 日，Anthropic 发布 Claude Design，这是 AI 设计领域的重大突破。

**核心功能：**
- 自然语言生成：文本描述 → 完整设计稿
- 设计系统自动学习：读取代码库和设计文件
- 精细化控制：内联评论、直接编辑、自定义滑块
- 多格式导入导出：支持 DOCX/PPTX/Canva/PDF/HTML
- 设计到代码闭环：一键交给 Claude Code 实现

**同时发布：**
- **Opus 4.7**：最强网络安全模型，支持 xhigh 思考强度
- **Project Glasswing**：联合 40+ 科技巨头的防御联盟
- Anthropic 年化收入已达 300 亿美元，IPO 在即

**行业影响：** 直接挑战 Figma（80-90% 市场份额）和 Adobe Creative Cloud，标志着 AI 从「辅助工具」向「创作主体」的转变。`,
    date: "2026-04-19 13:50",
    source: "Anthropic Blog",
    sourceUrl: "https://www.anthropic.com/news/introducing-claude-design",
    href: "/news/news-307",
  },
{
    id: "news-306",
    tag: "AI 研究",
    tagColor: "bg-yellow-500/10 text-yellow-300",
    title: "OpenAI 发布 GPT-Rosalind：专为生命科学研究优化的 AI 模型",
    summary: "OpenAI 推出 GPT-Rosalind，专门针对生命科学研究场景优化。该模型在基因组分析、蛋白质结构预测、药物发现等领域表现出色，将加速生物医学研究进程。",
    content: `## GPT-Rosalind：AI 加速生命科学

2026 年 4 月 16 日，OpenAI 发布 GPT-Rosalind，这是首个专为生命科学研究优化的大语言模型。

**核心能力：**
- 基因组序列分析
- 蛋白质结构预测
- 药物分子设计
- 文献综述与假设生成

**科学意义：** Rosalind 以 DNA 双螺旋结构发现者 Rosalind Franklin 命名，象征着 AI 在基础科学研究中的新角色——不仅是工具，更是科研合作伙伴。`,
    date: "2026-04-19 13:40",
    source: "OpenAI Blog",
    sourceUrl: "https://openai.com/index/introducing-gpt-rosalind/",
    href: "/news/news-306",
  },
{
    id: "news-305",
    tag: "AI Agent",
    tagColor: "bg-blue-500/10 text-blue-300",
    title: "Simon Willison 深度分析：Claude Opus 4.6 到 4.7 的 System Prompt 演进轨迹",
    summary: "Simon Willison 利用 Anthropic 公开的 System Prompt 历史，深入分析了 Opus 4.6 到 4.7 的系统提示词变化。发现 Opus 4.7 在工具调用、错误恢复和多步推理方面做了大量优化，反映了 Anthropic 对 Agent 能力的持续强化。",
    content: `## Opus 4.7 System Prompt 深度分析

2026 年 4 月 18 日，Simon Willison 发布了对 Claude Opus 4.6 和 4.7 系统提示词的详细对比分析。

**分析方法：**
- 利用 Anthropic 公开的 system prompt 历史记录
- 构建 git-based 探索工具追踪变化
- 逐段对比 4.6 和 4.7 的 prompt 差异

**关键发现：**
- 工具调用指令更加精确和结构化
- 错误恢复策略得到显著加强
- 多步推理的指导更加清晰
- 对 Agent 场景的适配明显增强

**启示：** System Prompt 的演进反映了 AI 能力发展的方向——从「回答问题」到「执行任务」。`,
    date: "2026-04-19 13:30",
    source: "Simon Willison's Weblog",
    sourceUrl: "https://simonwillison.net/2026/Apr/18/opus-system-prompt/",
    href: "/news/news-305",
  },
{
    id: "news-304",
    tag: "AI 基础设施",
    tagColor: "bg-purple-500/10 text-purple-300",
    title: "OpenAI 发布新一代 Agents SDK：标准化 Agent 构建工具链全面升级",
    summary: "OpenAI 发布 Agents SDK 的重大更新，提供 Agent 编排器、工具注册中心、记忆管理系统、沙箱执行环境和人类在环接口等核心模块，为开发者构建自主 AI Agent 提供了完整的标准化工具链。",
    content: `## Agents SDK 全面升级

2026 年 4 月 15 日，OpenAI 发布新一代 Agents SDK。

**核心模块：**
- **Agent Orchestrator**：多 Agent 协作管理
- **Tool Registry**：标准化工具注册
- **Memory System**：统一记忆管理
- **Sandbox Runtime**：安全执行环境
- **Human-in-the-Loop**：关键步骤确认

**开发者价值：** 从「手写 Agent 逻辑」到「配置 Agent 工作流」，大幅降低自主 Agent 的开发门槛。`,
    date: "2026-04-19 13:20",
    source: "OpenAI Blog",
    sourceUrl: "https://openai.com/index/the-next-evolution-of-the-agents-sdk/",
    href: "/news/news-304",
  },
{
    id: "news-303",
    tag: "AI 安全",
    tagColor: "bg-red-500/10 text-red-300",
    title: "亲特朗普 AI 虚拟账号泛滥社交媒体 — Instagram、TikTok、Facebook 出现数百个 AI 生成的政治影响者账号",
    summary: "纽约时报调查发现，Instagram、TikTok 和 Facebook 上出现数百个亲特朗普的 AI 虚拟账号，使用相同文案和僵硬措辞，疑似中期选举前的动员行动。账号创建者身份不明，AI 生成内容的政治操纵风险凸显。",
    content: `## AI 政治影响者：社交媒体的新型操纵手段

2026 年 4 月 18 日，纽约时报调查报道揭示 AI 政治账号泛滥现象。

**调查发现：**
- Instagram、TikTok、Facebook 上发现数百个亲特朗普 AI 虚拟账号
- 账号经常使用相同的文案和僵硬措辞
- 疑似中期选举前的保守选民动员行动
- 账号创建者身份不明

**技术特征：**
- AI 生成的头像和照片
- 自动发布政治内容
- 批量操作多个平台
- 使用相似的语言模式和措辞

**风险与影响：**
- **信息操纵**：AI 可以大规模生成看似真实的政治内容
- **选民影响**：可能在关键选举期间影响公众意见
- **平台治理**：社交媒体平台难以检测和删除 AI 生成账号
- **透明度危机**：用户无法分辨内容是真人还是 AI 生成

**行业背景：**
- 2024 年美国大选期间已出现类似 AI 操纵案例
- AI 内容检测技术仍在发展中
- 各平台政策执行力度不一
- 引发了关于 AI 生成内容标签要求的讨论`,
    date: "2026-04-19 07:25",
    source: "The New York Times / The Verge",
    sourceUrl: "https://www.theverge.com/ai-artificial-intelligence",
    href: "/news/news-303",
  },
{
    id: "news-302",
    tag: "AI 基础设施",
    tagColor: "bg-purple-500/10 text-purple-300",
    title: "存储芯片巨头预警：到 2027 年底仅能满足 60% 的 AI 内存需求，HBM 供应危机加剧",
    summary: "全球存储芯片制造商发出警告，预计到 2027 年底也只能满足 AI 行业 60% 的高带宽内存（HBM）需求。HBM 已成为 AI 算力的战略瓶颈，SK 海力士、三星、美光三家寡头的产能直接决定全球 AI 发展速度。",
    content: `## HBM 内存危机：AI 算力的「卡脖子」时刻

2026 年 4 月 18 日，存储行业传来重磅消息：全球主要存储芯片制造商预计，**到 2027 年底也只能满足 AI 行业 60% 的高带宽内存（HBM）需求**。

**这意味着什么？**

HBM（High Bandwidth Memory）是 AI GPU 的核心内存技术。NVIDIA H100 配备 80GB HBM3，B200 配备 192GB HBM3E。没有足够的 HBM，GPU 就只是空壳——算力再强也无法发挥作用。

**供应危机的核心原因：**

**1. 需求爆炸式增长**
- 大模型参数量从 7B 飙升至 1T+
- 推理部署量指数级增长，每个 GPU 都需要 HBM
- 云厂商疯狂采购 GPU，带动 HBM 需求井喷

**2. 产能瓶颈**
- HBM 制造需要精密的 3D 堆叠和 TSV（硅通孔）技术
- 台积电的 CoWoS 封装产能虽已扩大 2-3 倍，仍然供不应求
- HBM 测试时间是传统 DRAM 的 3-5 倍

**3. 三家寡头垄断**
- SK 海力士：技术领先，NVIDIA 核心供应商
- 三星电子：产能最大，但良率长期落后
- 美光科技：起步最晚，功耗和散热有优势

**行业影响：**
- 大型云厂商通过长期合同锁定供应，中小公司面临「无芯可用」
- 推动 MoE、量化等节省内存的技术加速发展
- HBM 价格持续上涨，推高 AI 服务的单位成本
- 韩国在全球 AI 地缘政治中的话语权显著增强`,
    date: "2026-04-19 04:00",
    source: "Reuters / The Verge",
    sourceUrl: "https://www.theverge.com/ai-artificial-intelligence",
    href: "/news/news-302",
  },
{
    id: "news-301",
    tag: "AI 开发",
    tagColor: "bg-green-500/10 text-green-300",
    title: "Google 发布 Android AI Agent 开发工具包 — 让 AI 代理自主操作 Android 应用",
    summary: "Google 推出 Android AI Agent 开发工具包，包含升级的 Android CLI、Android Skills GitHub 仓库和 Android Knowledge Base。开发者可以训练 AI 代理自主操作 Android 应用，实现从 AI 辅助编码到 AI 自主执行的跨越。",
    content: `## Android 成为 AI Agent 的新平台

2026 年 4 月 18 日，Google 发布了 Android AI Agent 开发工具包，标志着移动操作系统正式拥抱 AI Agent 范式。

**工具包内容：**

**1. Android CLI 升级**
- 增强的命令行工具，支持 AI Agent 与 Android 设备交互
- 支持应用安装、权限管理、UI 自动化操作

**2. Android Skills GitHub 仓库**
- 开源的 Android 操作技能库
- 包含 100+ 预定义操作模板
- AI Agent 可以直接调用的标准化接口

**3. Android Knowledge Base**
- 结构化的 Android 系统知识
- 帮助 AI Agent 理解应用生命周期、UI 层级、系统 API

**技术意义：**

这不是简单的「AI 辅助编码」工具，而是让 AI Agent 能够**自主操作 Android 设备**——安装应用、配置权限、执行 UI 操作、测试应用功能。

**与竞品的对比：**

- **vs Apple 的 Appium**：Google 的方案更原生，深度集成 Android 系统
- **vs OpenAI Codex macOS 操作**：从桌面扩展到移动，覆盖更广泛的场景
- **vs 传统 UI 自动化**：AI Agent 能理解意图，而不是机械执行脚本

**应用场景：**
- 自动化应用测试：AI Agent 自主探索应用，发现 bug
- 个性化设备配置：AI 根据用户习惯自动优化手机设置
- 批量设备管理：企业 IT 部门用 AI 管理成百上千台 Android 设备`,
    date: "2026-04-19 02:00",
    source: "Google Developer Blog / The Verge",
    sourceUrl: "https://www.theverge.com/ai-artificial-intelligence",
    href: "/news/news-301",
  },
{
    id: "news-300",
    tag: "AI 安全",
    tagColor: "bg-red-500/10 text-red-300",
    title: "白宫 reportedly 正准备访问 Anthropic Mythos — 最强网络安全 AI 模型进入政府视野",
    summary: "据报道，白宫正在准备访问 Anthropic 的 Mythos 模型——目前已知最强的网络安全专用 AI。Mythos 已自主发现数千个高危漏洞，覆盖所有主流操作系统和浏览器。政府级访问意味着 AI 网络安全将从企业防御扩展到国家基础设施保护。",
    content: `## Mythos：强大到可能改变网络安全格局的 AI 模型

2026 年 4 月 18 日，据多家媒体报道，**白宫正在准备访问 Anthropic 的 Claude Mythos 模型**。

**Mythos 是什么？**

Mythos 是 Anthropic 开发的**专注网络安全的最强模型**，其能力远超任何公开的 AI 系统：

- 已**自主发现数千个高危漏洞**
- 包括一个 **17 年历史的 FreeBSD 远程代码执行漏洞**
- 能够自主将 N-Day 漏洞转化为**复杂利用代码**
- 在编码、推理和安全相关工作中全面超越此前所有系统

**为什么政府需要 Mythos？**

**1. 国家基础设施保护**
- 电力系统、通信网络、金融系统都面临网络攻击威胁
- Mythos 可以主动扫描和修复关键基础设施的漏洞

**2. 攻防能力不对等**
- 攻击者也在使用 AI 寻找漏洞
- 防御方需要同等甚至更强的 AI 能力来应对

**3. Glasswing 计划**
- Anthropic 已启动 Glasswing 网络安全计划
- 40+ 科技巨头加入（AWS、Apple、Google、Microsoft、Nvidia 等）
- 投入 1 亿美元使用额度 + 400 万美元捐赠给开源安全组织

**潜在风险：**
- Mythos 的能力过于强大，可能被用于攻击而非防御
- 政府访问意味着军事用途的可能性
- 需要建立严格的使用规范和监督机制`,
    date: "2026-04-19 00:00",
    source: "The Verge / Vox Media",
    sourceUrl: "https://www.theverge.com/ai-artificial-intelligence",
    href: "/news/news-300",
  },
{
    id: "news-299",
    tag: "AI 政策",
    tagColor: "bg-yellow-500/10 text-yellow-300",
    title: "Sanders 联合劳工领袖呼吁 AI 就业保护 — 要求暂停数据中心建设",
    summary: "Bernie Sanders 联合跨行业工会领袖发布 AI 就业保护倡议，呼吁对 AI 数据中心建设实施暂停令。Sanders 警告如果不加管控，十年内「制造业岗位将不复存在」。这是美国政界对 AI 就业影响最强烈的干预信号。",
    content: `## AI 与就业：政治干预正在加速

2026 年 4 月 18 日，参议员 Bernie Sanders 联合多个行业的工会领袖，发布了一份全面的 AI 就业保护倡议。

**核心诉求：**

**1. 暂停数据中心建设**
- Sanders 已提出《AI 数据中心暂停法案》
- 要求对新建 AI 数据中心进行环境和就业影响评估
- 与 AOC 联合推动立法

**2. 就业保护条款**
- 要求 AI 公司在部署自动化系统前进行就业影响评估
- 为受 AI 影响的工人提供再培训和过渡支持
- 建立 AI 自动化部署的劳工协商机制

**3. 跨行业联盟**
- 制造业工会：担心 AI 取代工厂岗位
- 服务业工会：关注客服、收银等岗位
- 科技行业工会：担心 AI 编程工具取代开发者

**行业反应：**
- AI 公司认为这将阻碍技术创新和竞争力
- 劳工组织认为这是保护工人权益的必要措施
- 学术界对双方的论点都有支持证据

**深层含义：**

这是美国政界对 AI 就业影响最强烈的一次干预。如果立法通过，将对 AI 基础设施建设和应用部署产生深远影响。

值得注意的是，AI 数据中心的**能源消耗**也成为争议焦点——大型数据中心耗电量相当于一个小城市，在电力供应紧张的地区引发社区反对。`,
    date: "2026-04-18 22:00",
    source: "The Verge / Reuters",
    sourceUrl: "https://www.theverge.com/ai-artificial-intelligence",
    href: "/news/news-299",
  },
{
    id: "news-298",
    tag: "AI 产品",
    tagColor: "bg-blue-500/10 text-blue-300",
    title: "Google 正与五角大楼洽谈 Gemini 机密环境使用 — 逆转军事合作立场",
    summary: "据 The Information 报道，Google 正与美国国防部洽谈在机密环境中使用 Gemini 的方案。这标志着 Google 对军事 AI 合作的立场发生重大逆转——此前 Google 仅允许国防部在非机密场景使用 Gemini，且合同限定为「所有合法用途」。",
    content: `## Google 重返军事 AI：Gemini 进入五角大楼机密网络

2026 年 4 月 18 日，据 The Information 独家报道，Google 正在与美国国防部谈判，**允许在机密环境中使用 Gemini AI 模型**。

**立场逆转：**

Google 在军事 AI 合作上的立场经历了戏剧性的变化：

- **2018 年**：Google 员工抗议 Project Maven（AI 用于无人机图像分析），公司承诺不将 AI 用于武器
- **2023 年**：Google 允许国防部在非机密场景使用 Gemini
- **2026 年**：谈判扩展到**机密环境**

**合同细节：**

- 提议的合同语言与 OpenAI 此前与五角大楼签署的协议类似
- 关键条款：技术可用于"所有合法用途"
- 律师指出，这一措辞虽然看似排除了自主致命武器和大规模国内监控，但实际上可能为这些应用留下空间

**行业背景：**

- OpenAI 已于 2026 年初与五角大楼签署 AI 合作协议
- Anthropic 也参与了国防部的 AI 安全项目
- AI 公司从「拒绝军事合作」到「积极拥抱国防」的转变正在加速

**争议焦点：**
- 伦理问题：AI 公司是否应该参与军事应用
- 透明度问题：机密环境下的 AI 使用缺乏公众监督
- 人才流失：部分 Google 员工可能因军事合作而离职`,
    date: "2026-04-18 20:00",
    source: "The Information / The Verge",
    sourceUrl: "https://www.theverge.com/ai-artificial-intelligence",
    href: "/news/news-298",
  },
{
    id: "news-297",
    tag: "AI 产品",
    tagColor: "bg-blue-500/10 text-blue-300",
    title: "OpenAI 发布 Agents SDK 下一代进化：更灵活的多 Agent 协作与工具调用",
    summary: "OpenAI 宣布 Agents SDK 迎来下一代重大升级，AI Agent 编排能力大幅增强，支持更灵活的多 Agent 协作模式、改进的工具调用和状态管理，进一步降低构建复杂 AI 工作流的开发门槛。",
    content: `## OpenAI Agents SDK 下一代进化

2026 年 4 月 15 日，OpenAI 发布 Agents SDK 重大更新。

**核心升级：**

**1. 多 Agent 协作增强**
- 更灵活的 Agent 间通信模式
- 支持动态编排和运行时调整
- 改进的 Agent 生命周期管理

**2. 工具调用升级**
- 更智能的工具选择和调用
- 支持复杂工具链的组合执行
- 改进的错误处理和重试机制

**3. 状态管理改进**
- 更细粒度的会话状态控制
- 支持长时间运行的复杂工作流
- 改进的上下文窗口管理

**4. 开发体验优化**
- 简化的 API 设计
- 更好的调试和可观测性工具
- 降低构建多 Agent 系统的门槛

**行业意义：**
- Agent 编排成为 AI 基础设施的核心能力
- 与 Claude Managed Agents 形成竞争
- 多 Agent 系统开发门槛进一步降低
- 推动 AI Agent 从实验走向生产环境`,
    date: "2026-04-18 13:56",
    source: "OpenAI Blog",
    sourceUrl: "https://openai.com/index/the-next-evolution-of-the-agents-sdk/",
    href: "/news/news-297",
  },
{
    id: "news-296",
    tag: "AI 科研",
    tagColor: "bg-purple-500/10 text-purple-300",
    title: "OpenAI 发布 GPT-Rosalind：专为生命科学研究设计的 AI 模型，覆盖基因组学与药物发现",
    summary: "OpenAI 发布 GPT-Rosalind，以 DNA 结构发现者 Rosalind Franklin 命名的生命科学专用 AI 模型。覆盖基因组学、蛋白质组学、药物发现等领域，能够理解和分析生物医学数据，标志着 AI 从通用模型向垂直专业领域深入拓展。",
    content: `## GPT-Rosalind：AI 深入生命科学研究

2026 年 4 月 16 日，OpenAI 发布 GPT-Rosalind。

**核心能力：**
- 专为生命科学研究场景设计
- 覆盖基因组学、蛋白质组学、药物发现
- 能够理解和分析生物医学数据
- 以 DNA 结构发现者 Rosalind Franklin 命名

**应用场景：**
- **基因组学**：基因序列分析、变异检测
- **蛋白质组学**：蛋白质结构预测、相互作用分析
- **药物发现**：靶点识别、分子筛选、临床试验设计辅助
- **生物医学数据分析**：文献挖掘、实验设计

**行业意义：**
- AI 正在深入垂直领域，从通用走向专业
- 与 RadAgent（AI 医疗影像）形成互补
- 生命科学是 AI 最具潜力的应用领域之一
- 可能加速新药研发和精准医疗发展`,
    date: "2026-04-18 13:56",
    source: "OpenAI Blog",
    sourceUrl: "https://openai.com/index/introducing-gpt-rosalind/",
    href: "/news/news-296",
  },
{
    id: "news-295",
    tag: "AI 身份",
    tagColor: "bg-violet-500/10 text-violet-300",
    title: "World ID 扩展到 Tinder、Zoom 和 Docusign — Orb 身份验证进入主流应用场景",
    summary: "Tools for Humanity 的 World ID 应用（基于 Orb 生物特征验证）扩展到新场景：Tinder 个人资料验证、Zoom 会议身份确认、Docusign 文档签名验证。这是去中心化身份验证从加密货币领域走向日常消费和企业应用的重要一步。",
    content: `## World ID 扩展：Orb 生物特征验证进入主流

2026 年 4 月 17 日，The Verge 报道 World ID 的新应用。

**新应用场景：**

**1. Tinder 个人资料验证**
- 通过 World ID 验证真实身份
- 减少虚假资料和诈骗
- 提升约会平台信任度

**2. Zoom 会议身份确认**
- 会议参与者身份验证
- 防止未授权访问
- 适用于企业级安全会议

**3. Docusign 文档签名验证**
- 电子签名身份绑定
- 确保签名者身份真实性
- 提升法律文件的可信度

**技术背景：**
- World ID 使用 Orb 设备进行虹膜扫描
- 生成唯一的世界 ID 标识符
- 基于零知识证明保护隐私
- 由 Tools for Humanity（Sam Altman 投资）开发

**行业意义：**
- 生物特征身份验证从加密领域走向日常应用
- 去中心化身份（DID）开始被主流平台采用
- 隐私保护的在线身份验证成为可能
- 可能影响未来数字身份标准`,
    date: "2026-04-18 13:56",
    source: "The Verge",
    sourceUrl: "https://www.theverge.com/ai-artificial-intelligence",
    href: "/news/news-295",
  },
{
    id: "news-294",
    tag: "AI 数据",
    tagColor: "bg-cyan-500/10 text-cyan-300",
    title: "SimpleClosure：出售已倒闭企业的数据用于 AI 训练，催生强化学习健身房新产业",
    summary: "SimpleClosure 帮助 struggling 企业关停的同时，推出新工具让企业将旧代码、Slack 消息、邮件和_workspace 信息出售给 AI 公司。真实企业数据需求催生了「强化学习健身房」产业，专门用已倒闭公司数据构建模拟环境训练 AI Agent。",
    content: `## SimpleClosure：已倒闭企业数据成为 AI 训练新金矿

2026 年 4 月 17 日，Forbes 报道 SimpleClosure 新业务模式。

**核心业务：**
- 帮助 struggling 企业有序关停
- 推出工具让企业出售旧代码、Slack 消息、邮件、workspace 信息
- 买方：对真实企业数据饥渴的 AI 公司

**新产业："强化学习健身房"**
- 专门用已倒闭公司数据构建模拟环境
- AI Agent 在这些环境中练习导航真实工作场景
- 提供真实的业务流程、决策路径、组织结构数据

**为什么有价值：**
- 企业真实运营数据极度稀缺
- 公开数据集无法反映真实工作流程
- 已倒闭公司的历史数据无竞争敏感性
- 可用于训练企业级 AI Agent

**行业意义：**
- AI 训练数据从「公开数据」走向「企业私有数据」
- 已倒闭公司数据从「资产清算」变为「高价值商品」
- 可能引发数据隐私和所有权争议
- 代表 AI Agent 训练进入真实企业场景阶段`,
    date: "2026-04-18 13:55",
    source: "Forbes / The Verge",
    sourceUrl: "https://www.forbes.com/sites/annatong/2026/04/16/ais-new-training-data-your-old-work-slacks-and-emails/",
    href: "/news/news-294",
  },
{
    id: "news-293",
    tag: "AI 产品",
    tagColor: "bg-blue-500/10 text-blue-300",
    title: "Chrome AI Mode 升级：可搜索已打开的标签页，浏览器 AI 从「通用问答」进化到「上下文感知」",
    summary: "Google Chrome 的 AI Mode 迎来重要更新，现在可以搜索用户当前打开的所有标签页内容。AI 不再只能回答通用问题，而是能理解用户当前的浏览上下文，跨标签页进行信息整合。这是浏览器原生 AI 从「一次性对话」向「上下文感知助手」的重要进化。",
    content: `## Chrome AI Mode 升级：标签页搜索能力

2026 年 4 月 17 日，The Verge 报道 Chrome AI Mode 新功能。

**新功能：**
- AI Mode 现在可以**搜索用户打开的所有标签页**
- 不再只能回答通用问题，而是理解当前浏览上下文
- 跨标签页信息整合和搜索

**使用场景：**
- 在多个研究标签页中快速定位关键信息
- 跨标签页对比和分析内容
- AI 基于用户当前浏览上下文提供精准回答

**技术实现：**
- AI 分析当前打开的标签页内容
- 建立跨标签页的上下文理解
- 基于用户浏览历史提供个性化搜索

**行业意义：**
- 浏览器 AI 从「通用问答」进化到「上下文感知」
- 与 Chrome AI Skills（可复用工作流）形成互补
- 预示浏览器将成为 AI 代理的核心操作界面
- 用户浏览数据的 AI 利用引发隐私讨论`,
    date: "2026-04-18 13:54",
    source: "The Verge",
    sourceUrl: "https://www.theverge.com/ai-artificial-intelligence",
    href: "/news/news-293",
  },
{
    id: "news-290",
    tag: "AI 人事",
    tagColor: "bg-yellow-500/10 text-yellow-300",
    coverImage: "/images/news/openai.jpg",
    title: "Sora 负责人 Bill Peebles 及 AI for Science 副总裁离职，OpenAI 高层人事变动",
    summary: "OpenAI 视频生成模型 Sora 负责人 Bill Peebles 宣布离开公司，同时 AI for Science 副总裁也一同离职。这是 OpenAI 近期的高层人事调整，引发了关于组织稳定性和项目方向的讨论。",
    content: `## OpenAI 高层人事变动

2026 年 4 月 17 日，OpenAI 确认 Sora 负责人 Bill Peebles 离职。

**关键信息：**
- Bill Peebles 是 Sora 视频生成模型的核心负责人
- 同时 AI for Science 副总裁也离开公司
- OpenAI 未公布继任者安排
- 这是 OpenAI 近期的第二波高层变动

**背景：**
- Sora 是 OpenAI 对标 Runway、Pika 的视频生成产品
- AI for Science 部门负责将大模型应用于科学研究
- 高层变动可能影响项目优先级和资源分配

**行业影响：**
- 视频生成领域竞争加剧（Google Veo、Runway Gen-4）
- 核心人才流失可能拖慢产品迭代
- 但 OpenAI 仍在快速扩张其他领域`,
    date: "2026-04-18 08:42",
    source: "The Verge",
    sourceUrl: "https://www.theverge.com/ai-artificial-intelligence",
    href: "/news/news-290",
  },
{
    id: "news-291",
    tag: "AI 设计",
    tagColor: "bg-pink-500/10 text-pink-300",
    coverImage: "/images/news/anthropic.jpg",
    title: "Anthropic 推出 Claude Design：基于 Opus 4.7 的 AI 设计工具，支持原型/演示文稿/营销材料生成",
    summary: "Anthropic 发布全新设计产品 Claude Design，基于 Opus 4.7 模型，能够创建设计稿、原型、pitch deck、营销材料等。目前以研究预览版向付费订阅用户开放，标志着 Anthropic 从纯对话 AI 向多模态创作工具的拓展。",
    content: `## Claude Design：AI 设计工具新玩家

2026 年 4 月 17 日，Anthropic 发布 Claude Design。

**核心功能：**
- 基于 Opus 4.7 最新模型
- 支持设计稿创建、产品原型制作
- 可生成 pitch deck 演示文稿
- 营销材料自动生成

**使用门槛：**
- 目前为研究预览版
- 仅对 Claude 付费订阅用户开放

**行业意义：**
- Anthropic 从纯对话进入多模态创作领域
- 直接竞品：Canva AI、Figma AI、Adobe Firefly
- Opus 4.7 是 Anthropic 最新旗舰模型，设计能力大幅提升

**对比竞品：**
| 工具 | 核心优势 | 定位 |
|------|---------|------|
| Claude Design | 长文本理解 + 生成 | 全场景创作 |
| Canva AI | 模板丰富 | 大众用户 |
| Figma AI | 设计协作 | 专业设计师 |
| Adobe Firefly | 图像质量 | 创意工作者 |`,
    date: "2026-04-18 08:43",
    source: "The Verge",
    sourceUrl: "https://www.theverge.com/ai-artificial-intelligence",
    href: "/news/news-291",
  },
{
    id: "news-292",
    tag: "AI 政策",
    tagColor: "bg-orange-500/10 text-orange-300",
    coverImage: "/images/news/gaming.jpg",
    title: "Playdate Catalog 禁止使用生成式 AI 创作游戏内容，但允许 AI 辅助编码",
    summary: "游戏厂商 Panic 更新 Playdate Catalog 政策，禁止在游戏美术、音频、音乐、文本、对话中使用生成式 AI，但暂时允许 AI 辅助编码（需标注）。这是游戏行业对生成式 AI 最早的限制政策之一。",
    content: `## Playdate Catalog 禁用生成式 AI

2026 年 4 月 17 日，Playdate 开发商 Panic 更新 Catalog 政策。

**新规要点：**
- 禁止使用生成式 AI 创作：美术、音频、音乐、文本、对话
- 允许 AI 辅助编码，但需特别标注
- 已使用 AI 生成内容的游戏会被标记提示

**公司立场：**
- Panic 联合创始人 Cabel Sasser 表示：对 AI 生成产品"没有任何兴趣"
- 公司自有游戏完全不用 AI 生成内容

**行业背景：**
- Steam 已允许 AI 游戏上架（需披露）
- Epic Games 对 AI 持开放态度
- Panic 采取了最保守的立场

**影响：**
- 独立游戏开发者社区反应不一
- 可能引发更多平台跟进限制
- AI 辅助编码仍被广泛接受`,
    date: "2026-04-18 08:44",
    source: "The Verge",
    sourceUrl: "https://www.theverge.com/ai-artificial-intelligence",
    href: "/news/news-292",
  },
{
    id: "news-289",
    tag: "AI 产品",
    tagColor: "bg-purple-500/10 text-purple-300",
    coverImage: "/images/news/claude.jpg",
    title: "Anthropic 发布 Claude Design：AI 驱动的设计协作平台，基于 Opus 4.7 打造",
    summary: "Anthropic 推出 Claude Design，作为 Anthropic Labs 系列的首款产品，用户可与 Claude 协作创建设计稿、原型、演示文稿、营销材料等视觉作品。基于最新 Opus 4.7 模型，面向付费订阅用户提供研究预览版。",
    content: `## Anthropic 发布 Claude Design：AI 驱动的设计协作平台

2026 年 4 月 17 日，Anthropic 正式发布 Claude Design。

**核心功能：**

**1. AI 协作设计**
- 与 Claude 协作创建专业视觉作品
- 支持设计稿、原型、演示文稿、营销材料等多种格式
- 自然语言驱动，降低设计门槛

**2. 基于 Opus 4.7**
- 搭载 Anthropic 最新 Opus 4.7 模型
- 更强的视觉理解和生成能力
- 更好的设计质量和细节控制

**3. Anthropic Labs 首款产品**
- 标志着 Anthropic 从纯模型公司向应用产品公司扩展
- 研究预览版面向付费订阅用户开放
- 探索 AI 在创意工作流中的新范式

**行业影响：**
- Anthropic 从"模型提供商"走向"应用产品提供商"
- AI 设计工具市场竞争加剧（对标 Canva AI、Figma AI 等）
- Opus 4.7 的首个重磅应用场景，展示模型实力

**竞品对比：**
- Canva Magic Design：侧重模板化设计
- Figma AI：侧重设计辅助和自动化
- Claude Design：侧重自然语言协作，从概念到成品
`,
    date: "2026-04-18 00:01",
    source: "Anthropic News",
    sourceUrl: "https://www.anthropic.com/news",
    href: "/news/news-289",
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
  }
];
