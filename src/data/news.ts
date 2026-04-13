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
    id: "news-043",
    tag: "公司动态",
    tagColor: "bg-orange-500/10 text-orange-300",
    coverImage: "/images/news/robotics.jpg",
    title: "Google Gemini 推出个性化智能与跨平台迁移功能，全面对标 ChatGPT 和 Claude",
    summary: "Google Gemini 四月更新引入个性化智能、跨平台聊天记录迁移、3D 模型与图表生成等功能，直接吸引 ChatGPT 和 Claude 用户切换平台。",
    content: `![news-043](/images/news/robotics.jpg)

## Gemini 四月大更新：全方位进化

Google 在 2026 年 4 月为 Gemini 带来了一系列重磅更新，意图在激烈的 AI 助手竞争中占据优势。

**核心新功能：**
- **个性化智能**：自动从 Gmail、Calendar 和 Drive 提取洞察，帮助用户自动化重复性任务
- **跨平台迁移**：用户可将 ChatGPT 和 Claude 的聊天记录与记忆一键导入 Gemini
- **3D 模型与图表生成**：将复杂问题转化为交互式可视化内容
- **Notebooks 功能**：在 Gemini 中轻松管理项目，整合 NotebookLM

**生态整合优势：**
- 深度整合 Google 生态系统（Maps、YouTube、Workspace）
- Search Live 扩展到全球 200 多个国家
- Google Colab 推出 Learn Mode：个人编程学习助手

**竞争策略：**
- 通过迁移工具降低用户切换门槛
- 利用 Google 生态系统的独特优势
- 针对初创企业推出 AI 优化方案

**行业意义：**
Google 正在从"跟随者"转变为"引领者"。Gemini 3.1 模型的强大能力加上生态整合，使其成为 2026 年 AI 市场最有力的竞争者之一。`,
    date: "2026-04-13",
    source: "Google Blog / eWeek",
    sourceUrl: "https://blog.google/innovation-and-ai/products/gemini-app/gemini-drop-updates-march-2026/",
    href: "/news/news-043",
  },
  {
    id: "news-042",
    tag: "前沿",
    tagColor: "bg-cyan-500/10 text-cyan-300",
    coverImage: "/images/news/research.jpg",
    title: "Google CEO 桑达尔·皮查伊：美国必须在 AI 领域保持领先地位",
    summary: "Google CEO 桑达尔·皮查伊在 CBS 60 分钟节目中表示，美国必须在全球 AI 竞赛中保持领导地位，这关乎国家竞争力和创新能力。",
    content: `![news-042](/images/news/research.jpg)

## 皮查伊发声：美国 AI 领导力不容忽视

Google CEO 桑达尔·皮查伊近日接受 CBS《60 分钟》采访，就美国在全球 AI 竞赛中的地位发表了重要观点。

**核心观点：**
- **"美国必须引领 AI 发展"**——皮查伊强调美国在全球 AI 竞争中的领导地位至关重要
- 这不仅关乎商业竞争力，更关乎国家的创新能力和战略安全
- Google 将继续在美国 AI 研发中扮演关键角色

**Google 的 AI 战略：**
- Gemini 系列模型持续迭代，3.1 版本已展现出强大的多模态能力
- 在 Search、Workspace、Android 等平台深度整合 AI 功能
- 企业级 AI 应用持续扩展

**全球竞争格局：**
- 中国在 AI 领域快速追赶
- 欧盟通过 EU AI Act 加强监管
- 美国科技巨头（Google、OpenAI、Anthropic、Meta）占据技术前沿

**政策含义：**
皮查伊的表态反映了科技行业对 AI 监管政策的关切。在特朗普政府提出联邦 AI 框架、加州推出州级监管的背景下，如何平衡创新与监管成为关键议题。`,
    date: "2026-04-13",
    source: "CBS News",
    sourceUrl: "https://www.cbsnews.com/video/sundar-pichai-us-ai-60-minutes-video-2026-04-12/",
    href: "/news/news-042",
  },
  {
    id: "news-041",
    tag: "Policy",
    tagColor: "bg-yellow-500/10 text-yellow-300",
    coverImage: "/images/news/datacenter.jpg",
    title: "全美 AI 数据中心建设遭抵制，近半数规划项目被推迟或取消",
    summary: "CBS 报道，全美 AI 数据中心的建设热潮引发各地居民强烈抵制，近半数规划中的项目被推迟或取消。参议员 Sanders 和众议员 AOC 提出暂停法案，要求重新审视数据中心的环境和社会影响。",
    content: `![news-041](/images/news/datacenter.jpg)

## AI 基础设施遭遇地方阻力

尽管科技巨头投入数千亿美元建设 AI 数据中心，但全美范围内的地方抵制正在成为不可忽视的力量。

**现状：**
- 全美目前有超过 **4000 个** AI 数据中心在运营或规划中
- 近**半数规划项目**被推迟或取消
- 主要阻力来自：噪音、水资源消耗、电力占用、环境影响

**政治响应：**
- **参议员 Bernie Sanders** 和 **众议员 AOC** 提出暂停数据中心建设的法案
- 要求对新数据中心进行更严格的环境和社会影响评估
- 部分地方政府开始限制数据中心的用水和用电

**行业影响：**
- Meta 甚至资助燃气发电厂为路易斯安那州大型数据中心供电
- 科技公司被迫寻找更隐蔽的选址
- 可能影响 AI 模型的训练时间表和成本

**深层矛盾：**
AI 发展需要 massive 算力，但算力的物理基础设施（数据中心）正在与当地社区利益产生直接冲突。这场博弈将深刻影响 AI 行业的未来布局。`,
    date: "2026-04-13",
    source: "CBS News",
    sourceUrl: "https://www.cbsnews.com/video/nationwide-boom-in-ai-data-centers-stirs-resistance/",
    href: "/news/news-041",
  },
  {
    id: "news-040",
    tag: "Research",
    tagColor: "bg-cyan-500/10 text-cyan-300",
    coverImage: "/images/news/mit-research.jpg",
    title: "MIT 研发 Lean AI 技术：训练过程中实时裁剪模型，成本降低 40%",
    summary: "MIT 研究人员利用控制论原理，在 AI 模型训练过程中实时识别并移除冗余参数，CompreSSM 技术使训练成本降低 40%，为状态空间模型的效率提升开辟新路径。",
    content: `![news-040](/images/news/mit-research.jpg)

## MIT 突破性模型压缩技术

MIT 研究人员提出了一种创新的 AI 模型优化方法，利用**控制论**原理在训练过程中实时裁剪冗余参数。

**核心技术：CompreSSM**
- 针对**状态空间模型（State Space Models, SSMs）**的压缩技术
- 在训练过程中**实时识别并移除**不必要的参数
- 训练成本降低 **40%**
- 模型性能基本保持不变

**技术原理：**
传统模型压缩通常在训练完成后进行（剪枝、量化等）。MIT 的方法不同：
- 在训练**过程中**动态评估每个参数的重要性
- 利用控制论的反馈机制实时调整模型结构
- 模型"边学边瘦"，而非先学胖再减肥

**行业意义：**
- 降低 AI 模型的训练门槛
- 减少对大规模算力的依赖
- 为开源模型社区提供新的优化工具
- 可能影响 AI 基础设施的投资回报率计算`,
    date: "2026-04-13",
    source: "MIT / Radical Data Science",
    sourceUrl: "https://radicaldatascience.wordpress.com/2026/04/09/ai-news-briefs-bulletin-board-for-april-2026/",
    href: "/news/news-040",
  },
  {
    id: "news-039",
    tag: "Finance",
    tagColor: "bg-blue-500/10 text-blue-300",
    coverImage: "/images/news/chip.jpg",
    title: "CoreWeave 与 Meta 达成 210 亿美元 AI 计算合作协议",
    summary: "据 Bloomberg 报道，AI 云计算公司 CoreWeave 与 Meta 签署了价值 210 亿美元的计算服务协议，为 Meta 的 AI 模型训练和推理提供算力支持。",
    content: `![news-039](/images/news/chip.jpg)

## AI 算力军备竞赛持续升级

Bloomberg Technology 报道，AI 云计算公司 **CoreWeave** 与 **Meta** 签署了一项价值 **210 亿美元**的计算服务协议。

**交易细节：**
- 金额：210 亿美元
- 用途：为 Meta 的 AI 模型训练和推理提供算力
- CoreWeave 是 Nvidia 支持的 AI 云计算公司

**行业背景：**
这一交易是 AI 基础设施投资热潮的缩影。科技巨头正在竞相构建大规模计算能力：

- **Meta**：2026 年资本支出 1150-1350 亿美元
- **OpenAI**：融资 1220 亿美元用于基础设施
- **Google**：持续扩展数据中心和 TPU 集群
- **Microsoft**：Azure AI 服务持续扩张

**CoreWeave 的崛起：**
CoreWeave 从一家加密货币挖矿公司转型为 AI 算力提供商，现已成为 AI 基础设施领域的重要参与者。其与 Nvidia 的紧密关系使其能够获得最新 GPU 供应。`,
    date: "2026-04-13",
    source: "Bloomberg / eWeek",
    sourceUrl: "https://www.eweek.com/news/meta-coreweave-21b-ai-cloud-deal/",
    href: "/news/news-039",
  },

  {
    id: "news-047",
    tag: "政策法规",
    tagColor: "bg-orange-500/10 text-orange-300",
    coverImage: "http://tdewkptsq.hd-bkt.clouddn.com/images/news/news-047.jpg",
    title: "白宫发布《国家 AI 政策框架》：推动联邦统一标准，限制各州独立监管",
    summary: "2026 年 3 月 20 日，白宫正式发布《国家人工智能政策框架》，建议国会制定统一的联邦 AI 监管标准，并限制各州出台碎片化的 AI 法规。框架涵盖数字复制品保护、儿童隐私、透明度披露等七大支柱。",
    content: `2026 年 3 月 20 日，白宫发布了备受瞩目的**《国家人工智能政策框架》**（National Policy Framework for Artificial Intelligence），为美国 AI 监管指明了方向。

**七大核心支柱：**
- **联邦统一标准**：建立全国性 AI 监管框架，避免各州法规碎片化
- **数字复制品保护**：禁止未经授权的商业用途使用 AI 生成的声音、肖像等数字复制品
- **儿童隐私保护**：确保现有儿童隐私法适用于 AI 系统，限制数据收集用于模型训练
- **透明度与披露**：要求 AI 开发者公开模型能力、局限性和风险评估
- **创新优先**：在安全与监管之间寻求平衡，避免过度监管扼杀创新
- **国家安全**：加强 AI 在国防和安全领域的应用规范
- **国际竞争力**：确保美国在全球 AI 竞赛中保持领先地位

**政策背景：**
- 2025 年 12 月，特朗普政府签署第 14365 号行政令，要求制定国家 AI 政策框架
- 此前加州等州已出台自己的前沿 AI 透明度法案（SB 53）
- 参议员 Markey 提出立法反对特朗普政府阻止各州 AI 监管的行政令

**行业影响：**
- 如果联邦框架通过，加州 SB 53 等州级 AI 法规可能被取代
- AI 公司将面临更统一但可能更宽松的监管环境
- 安全倡导者担忧联邦标准可能低于加州等州的严格要求`,
    date: "2026-04-13",
    source: "White House / WilmerHale",
    sourceUrl: "https://www.whitehouse.gov/wp-content/uploads/2026/03/03.20.26-National-Policy-Framework-for-Artificial-Intelligence-Legislative-Recommendations.pdf",
    href: "/news/news-047",
  },

  {
    id: "news-048",
    tag: "行业动态",
    tagColor: "bg-red-500/10 text-red-300",
    coverImage: "http://tdewkptsq.hd-bkt.clouddn.com/images/news/news-048.jpg",
    title: "Meta 计划大规模裁员 20%，为高昂 AI 基础设施投资腾出资金",
    summary: "据路透社报道，Meta 正计划裁减 20% 以上员工，这是自 2022-2023 年「效率之年」以来最大规模裁员。扎克伯格希望通过 AI 辅助工作提升效率，同时为每年超千亿美元的 AI 基础设施投入节省成本。",
    content: `2026 年 3 月，多家媒体援引知情人士消息报道，Meta 正在计划一轮大规模裁员。

**裁员计划：**
- 裁员比例可能达到 **20% 或更高**
- 涉及约 **15,800 人**（基于 79,000 名员工基数）
- 这将是 Meta 自 2022-2023 年「效率之年」以来最大规模裁员

**背后原因：**
- **AI 基础设施投资巨大**：2026 年资本支出预计 1,150-1,350 亿美元
- **AI 替代人力**：Meta 相信 AI 辅助工具可以显著提升员工效率
- **Avocado 模型进展缓慢**：新模型「Avocado」的性能未达预期，Superintelligence Lab 正在奋力追赶

**战略背景：**
扎克伯格正全力推动 Meta 在 AI 领域的竞争力：
- 2025 年 6 月投资 **143 亿美元**入股 Scale AI
- 组建「超级智能实验室」（Superintelligence Lab）
- 同时开发两款旗舰模型：Avocado 和 Mango
- 计划建设 **30 个数据中心**

**行业趋势：**
Meta 的裁员反映了科技行业的一个更广泛趋势：随着 AI 能力增强，大公司正在用 AI 替代部分人力，同时将节省下来的资金投入 AI 基础设施竞赛。`,
    date: "2026-04-13",
    source: "Reuters / The Guardian",
    sourceUrl: "https://www.reuters.com/business/world-at-work/meta-planning-sweeping-layoffs-ai-costs-mount-2026-03-14/",
    href: "/news/news-048",
  },

  {
    id: "news-049",
    tag: "军事应用",
    tagColor: "bg-red-500/10 text-red-300",
    coverImage: "http://tdewkptsq.hd-bkt.clouddn.com/images/news/news-049.jpg",
    title: "OpenAI 与美国国防部达成协议，五角大楼将全面采用 AI 模型",
    summary: "OpenAI CEO Sam Altman 宣布公司与美国国防部达成协议，五角大楼将获准使用 OpenAI 的 AI 模型。此举与 Anthropic 此前拒绝国防部合作形成鲜明对比，标志着 AI 行业对军事应用态度的分化。",
    content: `2026 年 4 月，OpenAI CEO Sam Altman 正式宣布公司与美国国防部达成合作协议。

**协议内容：**
- 五角大楼将获准使用 OpenAI 的 AI 模型
- 应用场景包括情报分析、网络安全和行政管理
- 由「战争部」（Department of War，即国防部）主导

**行业对比——两种截然不同的立场：**
- **OpenAI**：积极拥抱国防合作，视军事应用为重要商业化方向
- **Anthropic**：拒绝与国防部合作，甚至通过诉讼获胜坚持安全立场

**历史回响：**
- 2018 年 Google 员工因 Project Maven（为军方提供无人机图像识别 AI）大规模抗议，最终 Google 不续签合同
- OpenAI 的此次合作预示着 AI 行业对军事应用的态度正在分化

**争议与担忧：**
- AI 军事化应用引发伦理和安全方面的广泛讨论
- 部分研究者担心军事用途可能导致 AI 被用于自主武器系统
- 与此同时，中美俄三国正在加速 AI 驱动的自主武器竞赛
- 美国国防科技初创公司 Anduril 已开始制造 AI 自主飞行无人机`,
    date: "2026-04-13",
    source: "PBS / New York Times",
    sourceUrl: "https://www.pbs.org/newshour/show/anthropics-powerful-new-ai-model-raises-concerns-about-high-tech-risks",
    href: "/news/news-049",
  },

  {
    id: "news-050",
    tag: "产品更新",
    tagColor: "bg-green-500/10 text-green-300",
    coverImage: "http://tdewkptsq.hd-bkt.clouddn.com/images/news/news-050.jpg",
    title: "Salesforce 重磅升级 Slackbot：30 项 AI 功能打造自主工作助手",
    summary: "Salesforce 宣布对 Slackbot 进行重大升级，新增 30 项 AI 功能，将其从简单聊天机器人转变为自主工作助手。新 Slackbot 可自主执行工作流、管理任务、协调团队，标志着企业 AI 助手进入自主代理时代。",
    content: `2026 年 4 月，Salesforce 宣布了对 Slackbot 的大规模升级计划。

**30 项新 AI 功能亮点：**
- **自主工作流执行**：Slackbot 可自主完成多步骤工作流程
- **任务管理**：自动创建、跟踪和更新任务状态
- **团队协调**：智能调度会议、分配任务、跟进进度
- **数据分析**：自动从对话中提取洞察并生成报告
- **跨应用集成**：连接 Salesforce CRM、Tableau 等企业内部系统

**战略意义：**
- 将 Slack 从「沟通工具」升级为「自主工作平台」
- 直接对标 Microsoft Copilot 和 Google Gemini 的企业 AI 战略
- Salesforce 正将 AI 深度融入其整个产品生态

**企业 AI 助手趋势：**
2026 年，企业 AI 助手正从「被动响应」向「自主执行」转型：
- Anthropic 推出 Claude Cowork（桌面知识工作者应用）
- OpenAI Codex 周活跃用户达 300 万
- Salesforce Slackbot 加入自主代理战局`,
    date: "2026-04-13",
    source: "MarketingProfs / Salesforce",
    sourceUrl: "https://www.marketingprofs.com/opinions/2026/54505/ai-update-april-3-2026-ai-news-and-views-from-the-past-week",
    href: "/news/news-050",
  },

  {
    id: "news-051",
    tag: "融资动态",
    tagColor: "bg-amber-500/10 text-amber-300",
    coverImage: "http://tdewkptsq.hd-bkt.clouddn.com/images/news/news-051.jpg",
    title: "OpenAI 追加 120 亿美元融资，总融资额达 1,220 亿美元，估值突破 8,520 亿",
    summary: "OpenAI 在最新一轮融资中追加 120 亿美元，使总融资额达到创纪录的 1,220 亿美元，投后估值高达 8,520 亿美元。其中 30 亿美元来自散户投资者，标志着 AI 投资正在向更广泛的投资者群体扩展。",
    content: `2026 年 3 月底，OpenAI 完成了其历史上规模最大的融资轮次之一。

**融资详情：**
- **总融资额**：**1,220 亿美元**（包含此前轮次）
- **本轮追加**：**120 亿美元**
- **投后估值**：**8,520 亿美元**
- **散户参与**：30 亿美元来自散户投资者（通过特殊渠道）

**资金用途：**
- 大规模 AI 基础设施建设
- 数据中心扩展和算力采购
- GPT 系列模型研发
-  Codex 产品商业化

**行业背景：**
2026 年 Q1 AI 行业融资数据令人震惊：
- **AI 核心公司总融资**：3,000 亿美元，环比和同比均增长 **150%**
- **Anthropic**：G 轮融资估值 **3,800 亿美元**
- **xAI/SpaceX**：以 **1.75 万亿美元**估值秘密提交 IPO
- AI 种子轮估值中位数达 **1,790 万美元**，较非 AI 公司高出 42%

**市场信号：**
AI 竞争已经进入了一个只有国家级预算才能参与的阶段。科技巨头 Alphabet、Microsoft、Amazon 和 Meta 在 2026 财年的 AI 相关支出预计在 **6,350-6,650 亿美元**之间。`,
    date: "2026-04-13",
    source: "NY Times / TechCrunch / OpenAI",
    sourceUrl: "https://www.nytimes.com/2026/03/31/technology/openai-12-billion-latest-funding-round.html",
    href: "/news/news-051",
  },

];
