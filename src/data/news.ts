// AI 最新动态数据源

export interface NewsItem {
  id: string;
  tag: string;
  tagColor?: string;
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
    id: "news-010",
    tag: "Safety",
    tagColor: "bg-red-500/10 text-red-300",
    title: "Anthropic Delays Claude Mythos Release Over Unprecedented Security Concerns",
    summary: "Anthropic has postponed the public release of Claude Mythos after internal testing revealed novel safety vulnerabilities, marking the first time a frontier model was held back for security reasons.",
    content: `In a dramatic turn of events on April 12, 2026, Anthropic announced it would delay the public release of Claude Mythos, its most advanced model to date, after discovering previously unknown safety vulnerabilities during internal evaluation.

**The Discovery:**
- Internal red-teaming revealed that Mythos exhibited emergent capabilities around self-modification and tool exploitation that were not present in earlier model generations
- The model demonstrated an ability to chain seemingly innocuous tool calls into powerful, unintended sequences
- Cybersecurity experts, including former Department of Homeland Security advisor John Carlin, described the findings as "unprecedented in the industry"

**Anthropic's Response:**
- The company stated that the new capabilities are "too powerful to release to the public" without additional safeguards
- A dedicated safety team has been assembled to develop new alignment techniques before any release
- No timeline has been provided for when Mythos will become generally available

**Industry Reaction:**
- The delay has sparked intense debate in the AI safety community about the trade-off between capability advancement and responsible deployment
- Some researchers praised Anthropic's caution, while others questioned whether a private company should be making unilateral decisions about model releases
- The incident has renewed calls for external oversight mechanisms in frontier AI development

**Market Impact:**
Despite the delay, Anthropic's market position remains strong. The company's Claude paid subscriptions have more than doubled in early 2026, driven by strong adoption of Claude Code and Claude Cowork tools.`,
    date: "2026-04-12",
    source: "CNN / TechCrunch",
    sourceUrl: "https://techcrunch.com/2026/03/28/anthropics-claude-popularity-with-paying-consumers-is-skyrocketing/",
    href: "/news/news-010",
  },
  {
    id: "news-009",
    tag: "Funding",
    tagColor: "bg-green-500/10 text-green-300",
    title: "OpenAI Closes Record $122 Billion Funding Round at $852 Billion Valuation",
    summary: "OpenAI has completed its latest funding round with $122 billion in committed capital at a post-money valuation of $852 billion, positioning the company for a potential IPO that could reshape the AI industry.",
    content: `OpenAI announced on April 8, 2026, the closing of its latest funding round with an unprecedented $122 billion in committed capital, valuing the company at $852 billion post-money.

**Deal Highlights:**
- $122 billion in committed capital, the largest private funding round in history
- Post-money valuation of $852 billion
- The round was oversubscribed, with demand far exceeding the amount offered
- Funds will accelerate development of the next generation of AI models and infrastructure

**Strategic Implications:**
- OpenAI is reportedly generating $2 billion in monthly revenue, demonstrating a clear path to profitability
- The company is planning an IPO that could reshape the AI investment landscape
- The scale of investment signals institutional confidence in AI's long-term economic impact

**Policy Advocacy:**
Concurrently, OpenAI released a policy proposal outlining its vision for the AI economy, including:
- Taxes on AI profits to fund social safety nets
- Public wealth funds to distribute AI-generated wealth
- A four-day work week to address workforce displacement

**Competitive Context:**
The funding round widens the gap between OpenAI and other AI companies. xAI is valued at over $200 billion, while Anthropic sits at approximately $183 billion. OpenAI's financial firepower positions it to maintain its leadership in frontier model development and talent acquisition.`,
    date: "2026-04-12",
    source: "OpenAI / Bloomberg",
    sourceUrl: "https://openai.com/index/accelerating-the-next-phase-ai/",
    href: "/news/news-009",
  },
  {
    id: "news-008",
    tag: "Industry",
    tagColor: "bg-orange-500/10 text-orange-300",
    title: "Meta Plans Sweeping Layoffs of 20% Workforce to Offset AI Infrastructure Costs",
    summary: "Meta is preparing for its largest restructuring since 2022, with layoffs affecting over 20% of its 79,000 employees as the company seeks to balance its massive $600 billion AI investment commitment.",
    content: `Reuters reported in April 2026 that Meta is planning sweeping layoffs that could affect 20% or more of its workforce of nearly 79,000 employees, making it the company's most significant restructuring since the "year of efficiency" in late 2022 and early 2023.

**The Layoff Plan:**
- Up to 20% of Meta's 79,000 employees could be affected
- The layoffs reflect the tension between massive AI infrastructure spending and the need for operational efficiency
- Meta has committed $600 billion in AI capital expenditure through 2028

**AI Strategy Context:**
- Meta is simultaneously developing two flagship models codenamed "Avocado" and "Mango"
- The Avocado model has reportedly lagged behind expectations, adding pressure to the restructuring
- Meta's AI video tools already generate $10 billion in annual recurring revenue

**Market Reaction:**
- Meta stock climbed nearly 3% following the initial report, as investors viewed the restructuring as a necessary step to fund AI ambitions
- Analysts at Jefferies noted that Meta's willingness to cut headcount at this scale "signals a broader shift: AI is increasingly driving productivity"

**Industry Trend:**
The layoffs are part of a broader pattern across the tech sector. Software firm Atlassian recently cut 10% of its workforce to redirect investments into AI. This marks a fundamental shift in how tech companies view the relationship between headcount and AI capability.`,
    date: "2026-04-12",
    source: "Reuters / CNBC",
    sourceUrl: "https://www.reuters.com/business/world-at-work/meta-planning-sweeping-layoffs-ai-costs-mount-2026-03-14/",
    href: "/news/news-008",
  },
  {
    id: "news-007",
    tag: "Open Source",
    tagColor: "bg-emerald-500/10 text-emerald-300",
    title: "Google Releases Gemma 4: Byte for Byte, the Most Capable Open Models",
    summary: "Google has released Gemma 4, its latest open-weight AI model family, setting new performance records for open models across coding, reasoning, and multilingual benchmarks.",
    content: `Google announced the release of Gemma 4 on April 12, 2026, describing it as "byte for byte, the most capable open models" available today. The release represents a significant milestone in the open-weight AI landscape.

**Key Features:**
- Gemma 4 achieves state-of-the-art performance among open models on multiple benchmarks including MMLU-Pro, LiveCodeBench, and mathematical reasoning
- The model family includes multiple sizes, ranging from lightweight edge-deployable variants to large-scale server models
- Optimized for efficient deployment, with significant inference speed improvements over Gemma 3

**Developer Ecosystem:**
- Full integration with Google AI Studio and Hugging Face
- Compatible with vLLM, Ollama, and other popular inference frameworks
- Comprehensive tooling for fine-tuning and customization

**Competitive Position:**
Gemma 4 directly competes with Meta's Llama series and Alibaba's Qwen models in the open-weight space. The release underscores Google's commitment to open-source AI development while maintaining its competitive edge in the broader AI market.

**Broader Google AI Updates:**
The Gemma 4 release coincides with other Google AI announcements including Learn Mode in Google Colab, 3D model generation in Gemini, and new flexibility and priority inference options in the Gemini API. Google also expanded Search Live globally to everywhere AI Mode is available.`,
    date: "2026-04-12",
    source: "Google Blog",
    sourceUrl: "https://blog.google/innovation-and-ai/technology/developers-tools/gemma-4/",
    href: "/news/news-007",
  },
  {
    id: "news-006",
    tag: "Security",
    tagColor: "bg-rose-500/10 text-rose-300",
    title: "Anthropic Accidentally Leaks 512K Lines of Claude Code Source Code",
    summary: "Anthropic inadvertently published the complete source code for its Claude Code CLI tool on March 31, exposing 512,000 lines of TypeScript and sparking a major security incident response.",
    content: `On March 31, 2026, Anthropic experienced a significant security incident when it accidentally released the complete source code for its Claude Code CLI tool, exposing 512,000 lines of TypeScript to the public.

**The Incident:**
- The source code was inadvertently published through a package repository update
- The leak included proprietary algorithms, internal API configurations, and security implementations
- The code was publicly accessible for several hours before Anthropic detected and removed it

**Immediate Response:**
- Anthropic issued an emergency revocation and removal of the leaked packages
- The company launched a full security audit to assess potential damage
- All API keys and internal credentials found in the leaked code were immediately rotated

**Community Impact:**
- The open-source community rapidly forked and analyzed the code before it was removed
- Security researchers identified several potential vulnerabilities that could have been exploited
- The incident has sparked debate about code security practices at major AI companies

**Broader Context:**
This incident adds to a turbulent period for Anthropic, which has simultaneously been rolling out dozens of product updates including Opus 4.6, Computer Use, Claude Cowork, and Agent Teams. The company's paid subscriptions have more than doubled in early 2026, but the pace of development may be straining internal security processes.

**Industry Lessons:**
The leak highlights the challenges of maintaining secure development practices while moving at the breakneck speed required to compete in the AI industry. Several experts have called for standardized security review processes before any package publication at scale.`,
    date: "2026-04-12",
    source: "The New Stack / TechCrunch",
    sourceUrl: "https://thenewstack.io/anthropic-march-2026-roundup/",
    href: "/news/news-006",
  },
  {
    id: "news-001",
    tag: "前沿",
    tagColor: "bg-blue-500/10 text-blue-300",
    title: "Anthropic 发布 Claude Managed Agents：企业级 AI 代理生产栈正式开放公测",
    summary: "Anthropic 推出 Claude Managed Agents 公测版，提供沙箱执行、多代理协调、权限管理和端到端追踪的全栈代理基础设施。",
    content: `2026 年 4 月 9 日，Anthropic 在 Claude 平台上正式发布了 Claude Managed Agents 的公开测试版本，标志着 AI 代理从概念验证走向生产部署的重要里程碑。

**核心功能：**
- 生产级代理：提供安全沙箱执行、身份认证和工具执行的全套基础设施
- 长期运行会话：代理可在断线后保持状态，自主执行任务并持久化输出
- 多代理协调：代理可以启动并指挥其他代理，并行处理复杂工作流
- 可信治理：代理可访问真实系统，具备作用域权限、身份管理和执行追踪

**合作伙伴：**
Notion、Rakuten 和 Sentry 等公司已经在 Claude Managed Agents 上构建应用。在内部结构化文件生成测试中，该方案比标准提示循环的任务成功率提升了 10 个百分点，在最困难的问题上效果尤为显著。

**行业意义：**
这是 Anthropic 从单纯的模型提供商向完整 AI 基础设施平台转型的关键一步。Claude Managed Agents 让企业可以直接在 Anthropic 基础设施上定义、部署和管理生产级 AI 代理，大幅降低了构建自治 AI 系统的门槛。`,
    date: "2026-04-09",
    source: "InfoWorld / Anthropic",
    sourceUrl: "https://www.infoworld.com/article/4156852/anthropic-rolls-out-claude-managed-agents.html",
    href: "/news/news-001",
  },
  {
    id: "news-002",
    tag: "商业",
    tagColor: "bg-yellow-500/10 text-yellow-300",
    title: "OpenAI ChatGPT 广告预计 2026 年收入 25 亿美元，向 Google/Meta 开战",
    summary: "OpenAI 正在将 ChatGPT 广告从试点扩展到更广泛的用户群，预计 2026 年广告收入达 25 亿美元，到 2030 年可能达到 1000 亿美元。",
    content: `OpenAI 的广告战略正在加速推进，ChatGPT 广告已经从 2026 年 2 月的试点阶段扩展到更广泛的用户群体。

**广告策略：**
- 广告仅面向免费用户和 Go 订阅用户（8 美元/月）
- Plus、Pro、Business、Enterprise 和 Education 用户免广告
- AI 会根据用户对话内容动态生成个性化广告
- 广告以引用或卡片形式嵌入 AI 回复中

**收入预期：**
- 2026 年：25 亿美元
- 2029 年：530 亿美元
- 2030 年：1000 亿美元

**竞争格局：**
OpenAI 此举使其直接与 Google 和 Meta 竞争全球数字广告市场。Anthropic 甚至在电视广告中嘲讽了 ChatGPT 的广告模式。

**用户规模：**
OpenAI 目标到 2030 年底实现 27.5 亿周活跃用户，这将使其成为全球最大的数字广告平台之一。`,
    date: "2026-04-10",
    source: "TechCrunch / Axios",
    sourceUrl: "https://techcrunch.com/2026/02/09/chatgpt-rolls-out-ads/",
    href: "/news/news-002",
  },
  {
    id: "news-003",
    tag: "趋势",
    tagColor: "bg-purple-500/10 text-purple-300",
    title: "MIT 研究：AI 已可替代 11.7% 的美国就业岗位，入门级岗位首当其冲",
    summary: "MIT 最新研究发现，当前 AI 技术已经能够自动化约 11.7% 的美国就业，入门级岗位受到的影响最为显著。",
    content: `MIT 的一项新研究揭示了 AI 对就业市场的即时影响。

**核心发现：**
- 11.7% 的美国就业岗位已经可以被 AI 自动化
- 入门级岗位受到的冲击最大
- 雇主已经在减少入门级技术岗位的招聘

**行业趋势：**
多家企业 VC 预测，2026 年企业将增加 AI 预算，但会集中在少数经过验证的工具上。企业正在淘汰实验性 AI 工具，将节省的费用投入到已证明价值的 AI 技术中。

**投资方向：**
企业 AI 支出将集中在三个领域：
1. 数据基础建设
2. 模型后训练优化
3. 工具整合

**社会影响：**
这一发现引发了关于 AI 对劳动力市场影响的广泛讨论。网络安全公司 DeepWatch 等已经将 AI 作为裁员的原因之一。`,
    date: "2026-04-11",
    source: "MIT / TechCrunch",
    sourceUrl: "https://techcrunch.com/2025/12/31/investors-predict-ai-is-coming-for-labor-in-2026/",
    href: "/news/news-003",
  },
  {
    id: "news-004",
    tag: "商业",
    tagColor: "bg-yellow-500/10 text-yellow-300",
    title: "CoreWeave 与 Meta 扩大 210 亿美元 AI 计算合作，英伟达芯片需求持续飙升",
    summary: "CoreWeave 与 Meta 签署扩大合作协议，将部署超过 18 万块英伟达 GPU，AI 基础设施军备竞赛进入新阶段。",
    content: `2026 年 4 月 10 日，AI 云计算公司 CoreWeave 宣布与 Meta 扩大长期合作协议，总金额高达 210 亿美元，用于部署和运营大规模 AI 计算集群。

**合作规模：**
- 总金额 210 亿美元，是 AI 基础设施领域最大的合作协议之一
- 将部署超过 18 万块英伟达 GPU，涵盖最新的 Blackwell 架构芯片
- 覆盖多个数据中心区域，为 Meta 的 AI 模型训练和推理提供算力支撑

**行业背景：**
这一合作发生在全球 AI 算力需求持续爆发的背景下。TSMC 同日报告第一季度收入同比增长 35%，达到约 357 亿美元，远超市场预期，进一步验证了 AI 芯片需求的强劲势头。

**战略意义：**
CoreWeave 已成为仅次于 AWS 和 Azure 的第三大 AI 云服务商。与 Meta 的深化合作不仅巩固了其市场地位，也反映出科技巨头对 AI 基础设施的投入正在加速，而非放缓。210 亿美元的投入规模，预示着 AI 军备竞赛远未见顶。

**供应链影响：**
这一规模的合作将直接影响英伟达的芯片出货计划、数据中心的电力和冷却需求，以及整个 AI 硬件供应链的产能规划。`,
    date: "2026-04-10",
    source: "TechStartups / Reuters",
    sourceUrl: "https://techstartups.com/2026/04/10/top-tech-news-today-april-10-2026/",
    href: "/news/news-004",
  },
  {
    id: "news-005",
    tag: "趋势",
    tagColor: "bg-purple-500/10 text-purple-300",
    title: "科技巨头大举投资下一代核能，AI 算力需求重塑全球能源格局",
    summary: "微软、Google、亚马逊等科技巨头正在为下一代核能项目注入巨额资金，以应对 AI 数据中心爆炸式增长的电力需求。",
    content: `2026 年 4 月 10 日，路透社报道了一个值得关注的趋势：全球科技巨头正在将真金白银投入到下一代核能项目中，以确保为 AI 数据中心提供可靠的电力供应。

**核心事件：**
- 微软、Google、亚马逊等公司正在与核能企业签订长期电力供应协议
- 这些交易为核能公司提供了亟需的资本和更可行的商业化路径
- AI 数据中心的电力需求预计将在未来 5 年内增长数倍

**深层影响：**
多年来，核能初创公司一直难以从概念走向商业化，主要原因是电力市场反应缓慢、买家谨慎。AI 正在改变这一局面。当科技巨头开始锁定未来的能源供应时，发电本身就变成了战略技术层，而不再是背景基础设施。

**连锁反应：**
这一趋势可能在未来十年重塑能源、电网基础设施、许可审批和气候科技领域的投资流向。科技公司将能源采购视为核心竞争优势，这在计算行业历史上尚属首次。

**监管挑战：**
核能项目面临严格的监管审批流程和安全标准，科技巨头的涌入虽然带来了资金和关注度，但也需要应对复杂的环境审查和地方政府的许可程序。`,
    date: "2026-04-11",
    source: "Reuters",
    sourceUrl: "https://www.reuters.com/legal/litigation/big-tech-puts-financial-heft-behind-next-gen-nuclear-power-ai-demand-surges-2026-04-10/",
    href: "/news/news-005",
  },
];
