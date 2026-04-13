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
    id: "news-052",
    tag: "融资",
    tagColor: "bg-purple-500/10 text-purple-300",
    coverImage: "/images/news/funding.jpg",
    title: "OpenAI 完成 1220 亿美元史上最大融资，估值达 8520 亿美元",
    summary: "OpenAI 宣布完成 1220 亿美元融资，投后估值 8520 亿美元，其中 30 亿美元来自散户投资者。这是科技史上规模最大的融资轮次，标志着 AI 行业资本投入达到前所未有的水平。",
    content: `![news-052](/images/news/funding.jpg)

## OpenAI 融资刷新历史记录

2026 年 3 月 31 日，OpenAI 官方宣布完成了总额 1220 亿美元的融资，投后估值达到 8520 亿美元。

**融资细节：**
- 总金额 **1220 亿美元**，是科技史上规模最大的融资轮次之一
- 其中 **30 亿美元**来自散户投资者，在尚未上市的 AI 公司中极为罕见
- 投后估值 **8520 亿美元**，超越了许多传统科技巨头的市值

**战略意义：**
- 这笔资金将用于大规模算力基础设施建设、模型研发和全球扩张
- OpenAI 正从一家 AI 研究公司转变为全球基础设施级平台
- 融资规模远超 Anthropic（3800 亿美元估值）和 xAI（2000 亿美元估值）

**行业影响：**
- 科技巨头 2026 年 AI 资本支出预计超过 3000 亿美元
- AI 初创公司融资持续升温，2026 年已有 17 家美国 AI 公司融资超 1 亿美元
- OpenAI 同时计划到 2026 年底将员工从 4500 人扩招至 8000 人`,
    date: "2026-04-13",
    source: "OpenAI / TechCrunch / Bloomberg",
    sourceUrl: "https://techcrunch.com/2026/03/31/openai-not-yet-public-raises-3b-from-retail-investors-in-monster-122b-fund-raise/",
    href: "/news/news-052",
  },
  {
    id: "news-051",
    tag: "安全",
    tagColor: "bg-red-500/10 text-red-300",
    coverImage: "/images/news/security.jpg",
    title: "特朗普政府将 Anthropic 列为供应链风险，联邦机构被令停止使用 Claude",
    summary: "特朗普政府将 Anthropic 标记为供应链风险（通常仅用于中国间谍嫌疑企业的 designation），并下令联邦机构停止使用 Claude 技术。Anthropic 正在与此进行法律抗争。",
    content: `![news-051](/images/news/security.jpg)

## Anthropic 与五角大楼的全面对抗

特朗普政府将 Anthropic 标记为供应链风险——这一 designation 通常仅保留给涉嫌间谍活动的中国企业——并下令联邦机构停止使用 Anthropic 的技术。

**事件要点：**
- Anthropic 因安全立场拒绝接受国防部合同，引发政治反弹
- 联邦机构被要求立即停止使用 Claude 相关技术
- Anthropic 已获得禁令初步胜利，正在与政府进行法律抗争

**企业影响：**
- 美国付费使用 Anthropic 工具的企业比例已从约 4% 飙升至 20%
- Anthropic 软件工程相关岗位自 2025 年 1 月以来增长 170%
- 与 OpenAI 形成鲜明对比——后者与 DOD 签约后遭遇用户卸载量激增 295%

**行业意义：**
这一事件标志着 AI 安全立场已从企业价值观升级为政治议题。Anthropic 因坚持安全原则而被政府针对，反而赢得了更多企业和消费者用户的信任。`,
    date: "2026-04-13",
    source: "Quartz / TechCrunch",
    sourceUrl: "https://qz.com/anthropic-claude-ai-business-revenue-pentagon-openai-chatgpt",
    href: "/news/news-051",
  },
  {
    id: "news-050",
    tag: "公司动态",
    tagColor: "bg-orange-500/10 text-orange-300",
    coverImage: "/images/news/meta-layoffs.jpg",
    title: "Meta 计划裁员 20% 以上，AI 基础设施巨额投入成主因",
    summary: "据 Reuters 独家报道，Meta 正计划裁员 20% 或更多员工，以应对高达 1150-1350 亿美元的 AI 资本支出。同时，其 Avocado 模型表现不及预期，发布计划被迫推迟。",
    content: `![news-050](/images/news/meta-layoffs.jpg)

## Meta 大规模裁员应对 AI 成本

2026 年 3 月，据 Reuters 独家报道，Meta 正在计划大规模裁员，可能影响 20% 或更多的员工。

**裁员背景：**
- Meta 2026 年 AI 资本支出预计高达 **1150-1350 亿美元**
- 公司试图通过裁员来抵消昂贵的 AI 基础设施投入
- AI 辅助工作将提升效率，减少部分岗位需求

**模型挑战：**
- 超智能团队正在开发新一代模型 **Avocado**，但性能不及预期
- 图像和视频生成模型 **Mango** 也在同步开发中
- 发布计划被迫推迟，面临 OpenAI 和 Anthropic 的激烈竞争

**硬件与生态布局：**
- 计划 2026 年推出智能手表 **Malibu 2**，内置 Meta AI 助手
- 建设 **Prometheus** 超算集群，部署数十万块英伟达 GPU
- 与 CoreWeave 签署 **210 亿美元**的 AI 计算合作协议

**用户规模：**
- Meta AI 月活跃用户达 **10 亿**，是历史上增长最快的 AI 平台
- AI 视频工具已产生 **100 亿美元**的年度经常性收入`,
    date: "2026-04-13",
    source: "Reuters / NYT / eMarketer",
    sourceUrl: "https://www.reuters.com/business/world-at-work/meta-planning-sweeping-layoffs-ai-costs-mount-2026-03-14/",
    href: "/news/news-050",
  },
  {
    id: "news-049",
    tag: "公司动态",
    tagColor: "bg-blue-500/10 text-blue-300",
    coverImage: "/images/news/microsoft-ai.jpg",
    title: "微软发布三款自研 AI 基础模型，直接挑战 OpenAI 和 Google",
    summary: "微软 MAI Superintelligence 团队发布 MAI-Transcribe-1、MAI-Voice-1 和 MAI-Image-2 三款自研基础模型，聚焦语音转录、语音生成和图像生成，标志着微软 AI 战略的重大转向。",
    content: `![news-049](/images/news/microsoft-ai.jpg)

## 微软 MAI 基础模型正式发布

2026 年 4 月 2 日，微软 AI 研究实验室正式发布了三款自研基础 AI 模型。

**模型详情：**
- **MAI-Transcribe-1**：专注于高精度语音转录，支持多语言实时识别
- **MAI-Voice-1**：自然语音生成模型，可生成接近真人水平的语音内容
- **MAI-Image-2**：图像生成模型，在质量和速度上对标 DALL-E 和 Imagen

**战略转向：**
- 由 Mustafa Suleyman 领导的 MAI Superintelligence 团队研发
- 这是微软首次大规模推出自研基础模型，而非依赖 OpenAI 的技术
- 微软 CEO Satya Nadella 确认将继续采购 NVIDIA 和 AMD 芯片

**行业影响：**
- 微软同时也在其研究工具中使用 OpenAI 和 Anthropic 的模型，展现多模型并行的务实策略
- Microsoft AI 负责人 Suleyman 预测 18 个月内所有白领工作将被 AI 自动化
- 这预示着科技巨头正从「绑定单一供应商」转向「多模型混合架构」`,
    date: "2026-04-13",
    source: "TechCrunch / VentureBeat",
    sourceUrl: "https://techcrunch.com/2026/04/02/microsoft-takes-on-ai-rivals-with-three-new-foundational-models/",
    href: "/news/news-049",
  },
  {
    id: "news-048",
    tag: "行业趋势",
    tagColor: "bg-purple-500/10 text-purple-300",
    coverImage: "/images/news/venture-capital.jpg",
    title: "2026 年 Q1 全球风投达 2970 亿美元，81% 资金流向 AI 初创公司",
    summary: "Crunchbase 数据显示，2026 年第一季度全球风险投资总额达 2970 亿美元，其中 81% 流向 AI 相关初创公司。种子轮 AI 公司估值中位数达 1790 万美元，比非 AI 公司溢价 42%。",
    content: `![news-048](/images/news/venture-capital.jpg)

## AI 吞噬风投市场

2026 年第一季度的风险投资数据令人震惊。根据 Crunchbase 的最新数据：

**关键数据：**
- Q1 总融资额：**2970 亿美元**
- AI 占比：**81%**（即每 100 美元风投中有 81 美元投向 AI）
- 种子轮 AI 公司估值中位数 **1790 万美元**，比非 AI 公司溢价 42%
- A 轮估值普遍突破 5000 万美元

**投资趋势变化：**
- 不再是 2021 年的「撒网式」投资模式
- 资本更加集中，流向有实际收入的 AI 公司
- 后期投资占比增加，证明 AI 行业走向成熟

**科技巨头资本支出：**
- Alphabet、Microsoft、Amazon 和 Meta 2026 年资本支出预计 **6350-6650 亿美元**
- 加上风险投资市场，AI 领域总资金投入超过 **1 万亿美元**

**非 AI 初创公司的困境：**
据 Fast Company 报道，不在旧金山、不做 AI 的初创公司融资难度极大。`,
    date: "2026-04-13",
    source: "Crunchbase / Fast Company / Yahoo Finance",
    sourceUrl: "https://qubit.capital/blog/ai-startup-fundraising-trends",
    href: "/news/news-048",
  },
  {
    id: "news-047",
    tag: "前沿",
    tagColor: "bg-cyan-500/10 text-cyan-300",
    coverImage: "/images/news/benchmark.jpg",
    title: "2026 年 LLM 基准评测全景：GPT-5.4 领跑编码，GLM-5 开源模型跻身前三",
    summary: "BenchLM 发布 2026 年 4 月最新 LLM 基准评测，GPT-5.4 Pro 在 SWE-bench Verified 达 76.9%，GLM-5 开源模型在编码领域以 49.64 质量指数位列第二，标志开源模型正式进入顶级阵营。",
    content: `![news-047](/images/news/benchmark.jpg)

## LLM 基准评测 2026 年 4 月更新

独立评测机构 BenchLM 和 LM Council 发布了 2026 年最新 LLM 基准评测报告。

**SWE-bench Verified（软件工程）：**
- GPT-5.4 Pro (xhigh)：**76.9%** — 最强工程能力
- Claude 4.6 Opus Thinking：紧随其后
- GPT-5.4 (high)：表现同样出色

**编码质量指数（WhatLLM.org）：**
- GPT-5.2 (xhigh)：**50.5** — LiveCodeBench 89%
- **GLM-5 (Reasoning)：49.64** — 最佳开源综合模型
- Claude Opus 4.5 (high)：49.1 — LiveCodeBench 87%

**LiveBench 综合评测：**
- GPT-5.4 Thinking xHigh：**80.28** — 综合领先
- Claude 4.6 Opus Thinking：**76.33**
- Claude 4.5 Opus Thinking：75.96

**关键趋势：**
- 头部模型差距缩小至 1-2 分，竞争白热化
- 开源模型 GLM-5 正式跻身顶级编码能力前三
- 前沿模型 API 价格同比下降 40-80%，性价比大幅提升`,
    date: "2026-04-13",
    source: "BenchLM / LM Council / WhatLLM",
    sourceUrl: "https://benchlm.ai/blog/posts/state-of-llm-benchmarks-2026",
    href: "/news/news-047",
  },
  {
    id: "news-046",
    tag: "公司动态",
    tagColor: "bg-blue-500/10 text-blue-300",
    coverImage: "/images/news/chips.jpg",
    title: "亚马逊 CEO 提出 AI 芯片新战略，有望挑战英伟达市场主导地位",
    summary: "亚马逊 CEO 提出全新的 AI 芯片发展路线图，通过自研芯片降低对英伟达 GPU 的依赖，这一战略可能重塑 AI 基础设施供应链格局。",
    content: `![news-046](/images/news/chips.jpg)

## 亚马逊 AI 芯片战略浮出水面

亚马逊 CEO 近日公开了公司在 AI 芯片领域的全新战略愿景，标志着这家科技巨头将更积极地挑战英伟达在 AI 加速芯片市场的主导地位。

**战略要点：**
- 亚马逊正在加速自研 AI 芯片（Trainium 和 Inferentia 系列）的迭代
- 目标是降低 AWS 客户对英伟达 GPU 的依赖
- 通过垂直整合降低 AI 训练和推理的成本

**行业影响：**
- 英伟达目前占据 AI 训练芯片市场超过 80% 的份额
- 亚马逊、Google（TPU）和微软（Maia）都在推进自研芯片战略
- 如果亚马逊成功，可能打破英伟达的垄断地位

**供应链重构：**
AI 芯片供应链正在经历重大变革。大型科技公司不再满足于单纯采购英伟达芯片，而是通过自研+定制的方式降低成本、提升性能。这一趋势将对整个半导体产业产生深远影响。`,
    date: "2026-04-13",
    source: "Yahoo Finance",
    sourceUrl: "https://finance.yahoo.com/video/amazon-ceos-ai-chip-vision-could-end-up-challenging-nvidia-200500488.html",
    href: "/news/news-046",
  },
  {
    id: "news-045",
    tag: "公司动态",
    tagColor: "bg-green-500/10 text-green-300",
    coverImage: "/images/news/funding.jpg",
    title: "Anthropic Claude 付费用户今年翻倍，超级碗广告效应持续发酵",
    summary: "据 TechCrunch 报道，Anthropic 确认 Claude 付费订阅用户今年已翻倍增长，Claude Code 和 Claude Cowork 等开发者工具成为主要增长驱动力。",
    content: `![news-045](/images/news/funding.jpg)

## Claude 用户增长势不可挡

Anthropic 的 Claude AI 在 2026 年迎来了爆发式的付费用户增长。

**关键数据：**
- Claude 付费订阅用户今年已**翻倍增长**
- 总用户估计在 **1800 万到 3000 万**之间
- Super Bowl 广告 campaign 效果显著

**增长驱动力：**
- **Claude Code**：开发者 AI 编程工具，深受工程师欢迎
- **Claude Cowork**：1 月发布的 productivity 工具，无需代码即可使用 AI 能力
- **Computer Use**：本周发布的新功能，让 Claude 可以直接操作电脑，引发用户激增

**与 OpenAI 的竞争：**
- 尽管 OpenAI 仍是最的消费者 AI 平台
- 但 Anthropic 在安全方面的立场赢得了大量企业客户
- OpenAI 因与美国国防部（DOD）的合作引发争议后，部分用户转向 Claude

**市场格局变化：**
美国使用 Claude 企业工具的公司比例从一年前的约 4% 飙升至 20%，Anthropic 正在从一家安全至上的 AI 研究公司转变为主要商业平台。`,
    date: "2026-04-13",
    source: "TechCrunch / Indagari",
    sourceUrl: "https://techcrunch.com/2026/03/28/anthropics-claude-popularity-with-paying-consumers-is-skyrocketing/",
    href: "/news/news-045",
  },
  {
    id: "news-044",
    tag: "行业趋势",
    tagColor: "bg-purple-500/10 text-purple-300",
    coverImage: "/images/news/autonomous.jpg",
    title: "摩根士丹利警告：2026 年上半年 AI 将迎重大突破，多数人还没准备好",
    summary: "摩根士丹利发布报告称，人工智能将在 2026 年上半年迎来重大技术突破，但全球大部分地区和企业尚未为此做好准备。",
    content: `![news-044](/images/news/autonomous.jpg)

## AI 突破即将到来

金融巨头摩根士丹利发出警告：一场重大的 AI 突破正在 2026 年上半年酝酿，但大多数人和企业还没有做好准备。

**核心判断：**
- AI 技术正在经历从"辅助工具"到"自主行动"的关键转变
- Agentic AI（智能体 AI）将在 2026 年进入大规模应用阶段
- 企业需要重新思考工作流程和组织结构

**潜在影响：**
- **就业市场**：AI 自动化将影响更多白领岗位
- **行业重构**：软件、金融、医疗等行业面临根本性变革
- **投资方向**：AI 基础设施和应用层将持续获得巨额投资

**准备建议：**
摩根士丹利建议企业和投资者：
- 加速 AI 技能培训
- 重新设计业务流程以适应 AI 驱动的工作模式
- 关注 AI 安全与治理
- 投资 AI 基础设施和相关股票

**行业背景：**
这一判断与当前的 AI 发展趋势高度吻合——Claude 的 Computer Use 功能、Google 的 Agentic AI 能力、以及 92% 的美国开发者日常使用 AI 编码工具，都预示着 AI 正在从"辅助"走向"自主"。`,
    date: "2026-04-13",
    source: "Yahoo Finance / Morgan Stanley",
    sourceUrl: "https://finance.yahoo.com/news/morgan-stanley-warns-ai-breakthrough-072000084.html",
    href: "/news/news-044",
  },
  {
    id: "news-053",
    tag: "行业动态",
    tagColor: "bg-red-500/10 text-red-300",
    coverImage: "/images/news/tech.jpg",
    title: "Vibe Coding 质量危机爆发 — 采用率 92% 但信任度暴跌至 60%",
    summary: "92% 美国开发者每天使用 AI 编程工具，但 45% AI 生成代码含 OWASP Top-10 漏洞。CodeRabbit 分析 470 个 PR 发现 AI 协作代码多 1.7 倍重大问题，三大真实灾难案例暴露安全隐患。",
    content: `这是 2026 年软件开发领域最具爆炸性的趋势反转。Andrej Karpathy 在 2025 年初提出的 "Vibe Coding" 概念（用自然语言描述需求，AI 生成代码，开发者不逐行审查）已全面占领行业。**92% 的美国开发者每天使用 AI 编程工具**，82% 全球开发者每周使用，GitHub 报告 46% 的新代码由 AI 生成。

**但问题出在质量上：**
- **CodeRabbit 分析了 470 个 GitHub PR**，发现 AI 协作代码比纯人工代码多 1.7 倍重大问题
- **45% 的 AI 生成代码样本含 OWASP Top-10 漏洞**（Databricks 研究）
- **安全公司 Tenzai 测试了 5 个 Vibe Coding 工具**（Claude Code、Codex、Cursor、Replit、Devin），构建 15 个相同应用，发现 69 个漏洞，其中 6 个为关键级
- **代码变更率上升 41%，代码重复增加 4 倍**（GitClear 数据：重构从 2021 年占变更行的 25% 降至 2024 年的 10% 以下）
- **63% 的开发者表示调试 AI 生成代码的时间比手写代码还长**
- **开发者信任度从 2023 年的 77% 暴跌至 2026 年的 60%**，仅 33% 信任 AI 代码准确性

**三大真实灾难案例：**
1. **Enrichlead 崩溃** — 独立开发者用 Cursor 零手写代码构建了 SaaS 产品，上线后出现 API 密钥滥用、订阅绕过、数据库异常等问题，最终永久关闭
2. **Lovable 数据暴露** — 1,645 个 Lovable 构建的 Web 应用中，170 个（超 10%）存在允许任何人访问个人信息的漏洞
3. **AI 生成的蜜罐被黑客攻击** — 安全公司 Intruder 用 AI 构建的蜜罐工具本身存在漏洞，攻击者通过伪造 IP Header 获得部分程序执行权

**深度解读：** 这是 AI 行业从"能用"到"好用"的临界点。Vibe Coding 赢得了采用战，但正在输掉质量战。行业正在经历"AI 生成的技术债"的集中爆发期。对内容策略而言，"AI 编程安全审查"和"如何审查 AI 生成代码"是极高流量的话题方向。


---`,
    date: "2026-04-13",
    source: "Hashnode / CodeRabbit / Tenzai / GitClear",
    sourceUrl: "https://hashnode.com",
    href: "/news/news-053",
  },
  {
    id: "news-054",
    tag: "产品动态",
    tagColor: "bg-red-500/10 text-red-300",
    coverImage: "/images/news/tech.jpg",
    title: "OpenAI 关停 Sora 视频生成器 — 10 亿美元 Disney 合作终止",
    summary: "OpenAI 3 月 24 日宣布关停 Sora，终止与 Disney 10 亿美元合作，4 月 26 日正式下线。Google Veo 3 成为质量标杆，AI 视频生成市场格局重置。",
    content: `OpenAI 在 3 月 24 日突然宣布关停 Sora AI 视频生成器，这一决定震惊了整个科技生态。Sora 应用在 2025 年高调上线仅 6 个月后就被叫停。

**关键事实：**
- Sora 1 于 3 月 13 日在美国下架，Sora 2 成为默认体验，但整个应用将在 4 月 26 日完全下线
- OpenAI 终止了与 Disney 价值 10 亿美元的 Sora 合作协议，Disney 对此感到"震惊"
- OpenAI 将资源重新分配到"其他优先级"——结合其 SuperApp 战略，显然在集中力量
- 用户仍可导出生成的内容，但无法创建新视频
- DeepLearning.AI 的 Batch 通讯专门报道了此事件

**AI 视频生成市场格局重置：**
- **Google Veo 3** 已成为质量标杆，支持原生音频生成（Sora 从未提供）
- **Runway Gen-4.5** 在纯视频质量和专业控制方面领先
- **Alibaba Wukong（悟空）** 企业级平台刚刚发布
- **Kling 3.0 Pro**、**Seedance 2.0** 仍在迭代

**深度解读：** Sora 的关停标志着 AI 视频生成领域的" Darwinian moment"——不是所有参与者都能存活。OpenAI 将资源从创意工具转向企业级 SuperApp，反映了行业从"酷炫 demo"向"实际生产力工具"的战略转移。


---`,
    date: "2026-04-13",
    source: "NYT / The Guardian / CNN / Forbes",
    sourceUrl: "https://www.nytimes.com",
    href: "/news/news-054",
  },
  {
    id: "news-055",
    tag: "产品动态",
    tagColor: "bg-green-500/10 text-green-300",
    coverImage: "/images/news/tech.jpg",
    title: "OpenAI SuperApp 战略 — ChatGPT + Codex + Atlas 浏览器三合一",
    summary: "OpenAI 将 ChatGPT、Codex 和 Atlas 浏览器合并为统一桌面应用，打造 AI 超级应用，从聊天工具向全能平台转型。",
    content: `OpenAI 确认正在开发桌面级"SuperApp"，将 ChatGPT、Codex 编码平台和 Atlas 浏览器合并为统一应用。

**关键细节：**
- Greg Brockman（OpenAI 总裁）临时负责此项目
- Codex 应用将首先获得"agentic"能力扩展，涵盖编码之外的生产力任务
- Atlas 浏览器让 ChatGPT 作为 Web Copilot，理解页面内容并完成任务，无需复制粘贴
- 统一的账户、记忆层和任务模型将贯穿所有场景
- 这是 OpenAI 对 Anthropic 企业级优势的回应——Anthropic 目前 80% 收入来自企业客户

**深度解读：** 这是 AI 应用从"独立工具"向"统一工作空间"的范式转变。OpenAI 意识到分散的产品线是其竞争劣势。SuperApp 战略直接对标 Microsoft 365 Copilot 和 Google Workspace AI。如果成功，将重新定义"AI 操作系统"的概念。


---`,
    date: "2026-04-13",
    source: "MacRumors / The Verge / PCMag",
    sourceUrl: "https://www.macrumors.com",
    href: "/news/news-055",
  },
  {
    id: "news-056",
    tag: "前沿技术",
    tagColor: "bg-purple-500/10 text-purple-300",
    coverImage: "/images/news/tech.jpg",
    title: "AI 与量子计算融合突破 — TIME 报道“世界还没准备好”",
    summary: "TIME 报道 AI 帮助催生了量子计算突破，融合技术可能在药物发现、材料科学和密码学领域带来颠覆性变革。",
    content: `TIME 杂志报道了一个被形容为"AI 帮助催生了量子突破"的重大事件，标题直接说"世界还没准备好"。

**关键信息：**
- AI 和量子计算的融合被视为 2026 年的转折点
- 不是渐进式改进，而是"convergence"——两种技术开始相互增强
- 量子计算正在从受控实验室演示走向商业应用
- AI 被用于优化量子纠错、量子电路设计和量子算法发现
- 企业被建议为此转型做准备

**深度解读：** 量子-AI 融合是 2026 年最被低估的叙事。当量子计算解决了经典计算无法处理的优化问题时，AI 模型的训练和推理将进入新的维度。这对药物发现、材料科学和金融建模有革命性影响。


---`,
    date: "2026-04-13",
    source: "TIME / ET Edge Insights / Forbes",
    sourceUrl: "https://time.com",
    href: "/news/news-056",
  },
  {
    id: "news-057",
    tag: "基础设施",
    tagColor: "bg-yellow-500/10 text-yellow-300",
    coverImage: "/images/news/tech.jpg",
    title: "核能成为 AI 数据中心核心能源 — Meta 签署 6.6 GW 核能项目",
    summary: "Meta 签署 6.6 GW 核能项目为全球 4000+ AI 数据中心供电，核能成为 AI 基础设施核心能源选择，但近半数规划项目因居民抵制被推迟。",
    content: `AI 数据中心的能源需求正在引发全球能源格局的重塑。

**关键数据：**
- **Meta 宣布与三家核能供应商（Vistra、TerraPower、Oklo）签署 6.6 GW 核能项目协议**
- 全球 AI 数据中心已超过 4,000 座，引发各地居民抵制
- 核能被定位为"国家战略当务之急"
- SMR（小型模块化反应堆）被视为满足数据中心电力需求的关键
- 数据中心预计到 2030 年电力消耗将翻倍以上
- Constellation Energy 与 GSA 签署核能供应协议

**深度解读：** AI 的能源需求正在从"环境问题"升级为"国家安全问题"。核能复兴不再是气候变化议题，而是 AI 竞争力议题。Vistra、BWX Technologies (BWXT)、GE Vernova (GEV) 等公司成为 AI 能源基础设施的直接受益者。


---`,
    date: "2026-04-13",
    source: "NucNet / Axios / UN News",
    sourceUrl: "https://www.nucnet.org",
    href: "/news/news-057",
  }
];
