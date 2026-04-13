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
    id: "news-036",
    tag: "行业趋势",
    tagColor: "bg-purple-500/10 text-purple-300",
    coverImage: "http://tdewkptsq.hd-bkt.clouddn.com/images/news/funding.jpg",
    title: "OpenAI 完成 1220 亿美元融资，估值达 8520 亿美元创历史记录",
    summary: "OpenAI 宣布完成 1220 亿美元的巨额融资，投后估值高达 8520 亿美元，其中 30 亿美元来自散户投资者。这是有史以来规模最大的私人融资之一，标志着 AI 行业资本投入达到前所未有的水平。",
    content: `![news-036](http://tdewkptsq.hd-bkt.clouddn.com/images/news/funding.jpg)

2026 年 3 月 31 日，OpenAI 官方宣布完成了总额 1220 亿美元的融资，投后估值达到 8520 亿美元。

**融资细节：**
- 总金额 1220 亿美元，是科技史上规模最大的融资轮次之一
- 其中 30 亿美元来自散户投资者，这在尚未上市的 AI 公司中极为罕见
- 投后估值 8520 亿美元，超越了许多传统科技巨头的市值

**战略意义：**
- 这笔资金将用于大规模算力基础设施建设、模型研发和全球扩张
- OpenAI 正从一家 AI 研究公司转变为全球基础设施级平台
- 融资规模远超 Anthropic（3800 亿美元估值）和 xAI（2000 亿美元估值）

**行业影响：**
- 科技巨头 2026 年 AI 资本支出预计超过 3000 亿美元
- AI 初创公司融资持续升温，2026 年已有 17 家美国 AI 公司融资超 1 亿美元
- 这预示着 AI 行业的"军备竞赛"将进一步升级`,
    date: "2026-04-13",
    source: "OpenAI / TechCrunch / Bloomberg",
    sourceUrl: "https://techcrunch.com/2026/03/31/openai-not-yet-public-raises-3b-from-retail-investors-in-monster-122b-fund-raise/",
    href: "/news/news-036",
  },
  {
    id: "news-035",
    tag: "安全",
    tagColor: "bg-red-500/10 text-red-300",
    coverImage: "http://tdewkptsq.hd-bkt.clouddn.com/images/news/security.jpg",
    title: "Anthropic 称 Claude Mythos 过于强大暂不公开发布，仅向 12 家安全公司开放",
    summary: "Anthropic 宣布其最新模型 Claude Mythos 在发现和利用软件漏洞方面超越大多数人类安全研究员，因安全考虑决定暂缓公开发布，仅向 12 家网络安全公司分阶段开放访问。",
    content: `![news-035](http://tdewkptsq.hd-bkt.clouddn.com/images/news/security.jpg)

2026 年 4 月初，Anthropic 发布了一项震撼业界的公告：其最新 AI 模型 Claude Mythos 在网络安全领域的表现过于强大，因此决定暂不向公众开放。

**关键发现：**
- Claude Mythos 在发现和利用软件漏洞方面的能力超越了大多数人类安全研究人员
- 该模型发现了多个存在 27 年之久、此前从未被人类专家发现的零日漏洞
- Anthropic 决定将 Mythos 的访问权限限制在 12 家网络安全公司范围内

**安全考量：**
- Anthropic 认为该模型的漏洞发现能力可能被恶意利用
- 分阶段发布策略为防御方提供了加固系统的宝贵时间
- 欧盟委员会人工智能办公室对此决定表示支持

**行业反应：**
- 部分研究者认为 Anthropic 的公告存在"夸大成分"
- 安全研究表明，部分被标注为 Mythos 独有发现的漏洞实际上可通过开源模型复现
- 华尔街对此做出紧急响应，财政部长和美联储主席召集银行 CEO 讨论潜在风险`,
    date: "2026-04-13",
    source: "NBC News / Anthropic",
    sourceUrl: "https://www.nbcnews.com/video/anthropic-says-newest-ai-model-is-too-powerful-to-release-to-public-260967493766",
    href: "/news/news-035",
  },
  {
    id: "news-034",
    tag: "公司动态",
    tagColor: "bg-yellow-500/10 text-yellow-300",
    coverImage: "http://tdewkptsq.hd-bkt.clouddn.com/images/news/meta-layoffs.jpg",
    title: "Meta 计划大规模裁员 20% 以上，AI 基础设施投入成本持续攀升",
    summary: "据 Reuters 独家报道，Meta 正计划裁员 20% 或更多员工，以应对高昂的 AI 基础设施投入。同时，Meta 的 Avocado 模型表现不及预期，发布计划被迫推迟。",
    content: `![news-034](http://tdewkptsq.hd-bkt.clouddn.com/images/news/meta-layoffs.jpg)

2026 年 3 月，据 Reuters 独家报道，Meta 正在计划大规模裁员，可能影响 20% 或更多的员工。

**裁员背景：**
- Meta 2026 年 AI 资本支出预计高达 1150-1350 亿美元
- 公司试图通过裁员来抵消昂贵的 AI 基础设施投入
- AI 辅助工作将提升效率，减少部分岗位需求

**模型挑战：**
- Meta 的超智能团队正在开发新一代模型 Avocado
- 但 Avocado 的性能表现不及预期，发布计划被迫推迟
- 同时开发的还有图像和视频生成模型 Mango

**硬件布局：**
- Meta 计划 2026 年推出智能手表 Malibu 2，内置 Meta AI 助手
- 正在建设 Prometheus 超算集群，部署数十万块英伟达 GPU
- 与 CoreWeave 签署了 210 亿美元的 AI 计算合作协议

**AI 用户规模：**
- Meta AI 月活跃用户已达 10 亿，是历史上增长最快的 AI 平台
- AI 视频工具已产生 100 亿美元的年度经常性收入
- 广告业务因 AI 优化实现了显著增长`,
    date: "2026-04-13",
    source: "Reuters / NYT / eMarketer",
    sourceUrl: "https://www.reuters.com/business/world-at-work/meta-planning-sweeping-layoffs-ai-costs-mount-2026-03-14/",
    href: "/news/news-034",
  },
  {
    id: "news-033",
    tag: "公司动态",
    tagColor: "bg-yellow-500/10 text-yellow-300",
    coverImage: "http://tdewkptsq.hd-bkt.clouddn.com/images/news/microsoft-ai.jpg",
    title: "微软计划 2027 年推出自研大型 AI 模型，减少对 OpenAI 的依赖",
    summary: "据 Bloomberg 报道，微软正计划在 2027 年前开发自有的大型前沿 AI 模型，旨在建立 OpenAI 之外替代方案，增强自身在 AI 领域的战略自主权。",
    content: `![news-033](http://tdewkptsq.hd-bkt.clouddn.com/images/news/microsoft-ai.jpg)

2026 年 4 月 2 日，据 Bloomberg 报道，微软正计划开发自有的大型前沿 AI 模型，预计 2027 年推出。

**战略动机：**
- 减少对 OpenAI 的依赖，建立自主 AI 能力
- 作为 OpenAI 最强大的替代方案，微软需要掌握核心技术
- 这是微软从 AI 投资方向 AI 原生公司转型的关键一步

**现有布局：**
- 微软是 OpenAI 的最大投资者，持有大量股份
- 已将 OpenAI 的 GPT 系列深度整合到 Copilot 产品线中
- 在 MWC 2026 上展示了从 AI 实验到可量化成果的转型策略

**行业背景：**
- 微软研究院预测 2026 年 AI 将生成假设、控制科学实验并与人类和 AI 研究人员协作
- 发布了针对零售行业的 Agentic AI 解决方案
- 提出了 2026 年值得关注的七大 AI 趋势

**竞争格局：**
- Google 拥有 Gemini 系列自主模型
- Meta 正在开发 Avocado 和 Mango 模型
- 亚马逊也在推进自研 AI 芯片和模型
- 微软此举意味着所有科技巨头都在追求 AI 自主可控`,
    date: "2026-04-13",
    source: "Bloomberg / Microsoft Research",
    sourceUrl: "https://www.bloomberg.com/news/articles/2026-04-02/microsoft-aims-to-create-large-cutting-edge-ai-models-by-2027",
    href: "/news/news-033",
  },
  {
    id: "news-032",
    tag: "政策",
    tagColor: "bg-red-500/10 text-red-300",
    coverImage: "http://tdewkptsq.hd-bkt.clouddn.com/images/news/regulation.jpg",
    title: "加州无视联邦压力推出新 AI 监管标准，美国 AI 监管博弈升级",
    summary: "加州州长纽森于 3 月底宣布新的 AI 监管标准，公然无视特朗普总统要求停止州级 AI 立法的指令。这标志着美国联邦与州之间在 AI 监管权限上的对抗进一步升级。",
    content: `![news-032](http://tdewkptsq.hd-bkt.clouddn.com/images/news/regulation.jpg)

2026 年 3 月 30 日，据 The Guardian 报道，加州将对其境内运营的 AI 公司实施新的监管标准，直接挑战特朗普总统关于停止州级 AI 立法的指令。

**加州新规要点：**
- 对与州政府有业务往来的 AI 公司施加新的合规要求
- 涉及高风险 AI 系统的风险管理、文档记录和监管义务
- 面向消费者的 AI 交互（聊天机器人、AI 伴侣等）需要明确披露
- 要求 AI 生成内容标注和训练数据透明度

**联邦与州的对抗：**
- 特朗普政府于 2026 年 3 月 20 日发布了《国家 AI 政策框架》，建议联邦优先于州级 AI 法律
- 该框架提出了七个支柱的立法路线图，试图统一全国 AI 监管
- 加州此举是对联邦框架的直接挑战

**全国 AI 监管版图：**
- 得克萨斯州 RAIGA 法案已于 2026 年 1 月 1 日生效
- 纽约州 RAISE 法案对前沿 AI 模型设定了严格监管
- 多个州正在推进 AI 治理立法，涵盖自动化决策工具、消费者保护等领域
- EU AI Act 的高风险系统要求也已全面生效

**政治角力：**
- AI 行业正为 2026 年中期选举投入大量政治资金
- 创新委员会行动组织宣布将花费至少 1 亿美元影响选举
- OpenAI 联合创始人 Greg Brockman 夫妇各捐赠 1250 万美元，支持反对 AI 限制的候选人
- 参议员 Bernie Sanders 和众议员 AOC 提出了 AI 数据中心暂停法案`,
    date: "2026-04-13",
    source: "The Guardian / CNN / Ropes & Gray",
    sourceUrl: "https://www.theguardian.com/us-news/2026/mar/30/california-ai-regulations-trump",
    href: "/news/news-032",
  },
  {
    id: "news-030",
    tag: "Research",
    tagColor: "bg-cyan-500/10 text-cyan-300",
    coverImage: "http://tdewkptsq.hd-bkt.clouddn.com/images/news/mit-research.jpg",
    title: "MIT 推出 CompreSSM：用控制理论在训练过程中压缩 AI 模型",
    summary: "MIT CSAIL 研究团队开发了 CompreSSM 技术，利用控制理论在训练过程中动态移除状态空间模型中不必要的复杂度，使 AI 模型更轻量、更快，同时不牺牲精度。",
    content: `![news-030](http://tdewkptsq.hd-bkt.clouddn.com/images/news/mit-research.jpg)

MIT 研究人员开发了一种名为 CompreSSM 的新型压缩技术，它能在训练过程本身中使 AI 模型变得更小、更快、更高效——而不是在训练之后。

**工作原理：**
- 利用控制理论原理，在模型学习过程中识别并移除冗余参数
- 针对状态空间模型（SSMs），这是处理长序列任务时 transformer 的新兴替代方案
- 在训练过程中动态精简模型架构，而非采用事后剪枝

**核心优势：**
- 更高效的训练：模型使用更少的计算资源进行学习
- 状态空间模型本身已经是音频处理、机器人和扩展语言上下文场景中比 transformer 更轻量的替代方案
- CompreSSM 进一步在特定用例中倾斜了平衡

**应用场景：**
- 具有长时间依赖的语言处理
- 音频分析和语音识别
- 机器人控制系统
- 任何需要高效序列建模的领域

**战略意义：**
随着 AI 模型规模不断扩大，CompreSSM 等技术解决了现代 AI 开发中最大的挑战之一：在性能与成本和效率之间取得平衡。通过在学习本身减少计算开销，这种方法有望降低先进 AI 能力的获取门槛。`,
    date: "2026-04-13",
    source: "MIT News / ICLR 2026",
    sourceUrl: "https://news.mit.edu/2026/new-technique-makes-ai-models-leaner-faster-while-still-learning-0409",
    href: "/news/news-030",
  },
  {
    id: "news-031",
    tag: "Policy",
    tagColor: "bg-yellow-500/10 text-yellow-300",
    coverImage: "http://tdewkptsq.hd-bkt.clouddn.com/images/news/policy.jpg",
    title: "特朗普政府发布 AI 框架：联邦 AI 监管的风险分级方案",
    summary: "白宫发布了全面的 AI 框架，确立了联邦政策优先级，呼吁行业特定监管、要求 AI 处理个人数据时强制披露，以及纳入 AI 在国家安全应用中的条款。",
    content: `![news-031](http://tdewkptsq.hd-bkt.clouddn.com/images/news/policy.jpg)

特朗普政府发布了其 AI 框架，为美国人工智能治理方法设定了关键的联邦政策优先级和立法建议。

**框架要点：**
- 建立了基于风险的 AI 监管方法，区分高风险和低风险应用
- 呼吁行业特定监管，而非单一监管机构
- 提出对处理个人数据的 AI 系统实行强制披露要求
- 包括 AI 在国家安全和国防应用中的条款

**立法背景：**
该框架紧跟参议员 Marsha Blackburn（R-TN）于 2026 年 3 月 18 日发布的立法讨论草案，两者提出了不同的 AI 治理方案。这两份文件代表了美国应该如何监管 AI 的两种不同愿景。

**行业回应：**
AI 公司正在应对复杂局面。主要 AI 企业已经意识到它们面临"形象问题"，并且越来越多地发布政策文件和资助智库来塑造监管叙事。

**全球对比：**
- 欧盟继续通过 EU AI Act 执行全球最全面的 AI 监管
- 英国采取了"促进创新"的方法，由现有监管机构在各自领域内解读 AI 原则
- 中国已引入 AI 生成内容标签措施
- 美国框架代表了一种更宽松的、以市场驱动创新为中心的方法`,
    date: "2026-04-13",
    source: "Alston & Bird / White House",
    sourceUrl: "https://www.alston.com/en/insights/publications/2026/04/ai-quarterly-april-2026",
    href: "/news/news-031",
  },
  {
    id: "news-005",
    tag: "趋势",
    tagColor: "bg-purple-500/10 text-purple-300",
    coverImage: "http://tdewkptsq.hd-bkt.clouddn.com/images/news/nuclear-energy.jpg",
    title: "科技巨头大举投资下一代核能，AI 算力需求重塑全球能源格局",
    summary: "微软、Google、亚马逊等科技巨头正在为下一代核能项目注入巨额资金，以应对 AI 数据中心爆炸式增长的电力需求。",
    content: `![news-005](http://tdewkptsq.hd-bkt.clouddn.com/images/news/nuclear-energy.jpg)

2026 年 4 月 10 日，路透社报道了一个值得关注的趋势：全球科技巨头正在将真金白银投入到下一代核能项目中，以确保为 AI 数据中心提供可靠的电力供应。

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
  {
    id: "news-013",
    tag: "监管",
    tagColor: "bg-red-500/10 text-red-300",
    coverImage: "http://tdewkptsq.hd-bkt.clouddn.com/images/news/eu-ai.jpg",
    title: "欧盟欢迎 Anthropic 暂缓发布 Claude Mythos，称其符合 AI 法案网络安全要求",
    summary: "欧盟委员会人工智能办公室对 Anthropic 限制 Mythos 发布的决定表示支持，认为这体现了 AI 法案中通用 AI 模型的网络安全保护义务。",
    content: `![news-013](http://tdewkptsq.hd-bkt.clouddn.com/images/news/eu-ai.jpg)

2026 年 4 月 12 日，据 Politico 报道，欧盟委员会对 Anthropic 暂缓发布 Claude Mythos 模型的决定表示欢迎，认为这一做法与欧盟 AI 法案对通用 AI 模型的网络安全保护要求相一致。

**欧盟立场：**
- 欧盟委员会人工智能办公室正在与 Anthropic 进行对话，讨论如何实施 AI 法案中的网络安全保护条款
- 欧盟监管人员认为，Anthropic 的分阶段发布策略为防御方提供了加固系统的宝贵时间
- 根据欧盟 AI 法案，通用 AI 模型开发者必须确保其模型具有"足够水平的网络安全保护"

**全球影响：**
- Anthropic 此前已宣布将 Mythos 的发布限制在 12 家网络安全公司范围内
- 该模型在发现软件漏洞方面的能力超越了大多数人类安全研究人员
- 美国财政部长贝森特和美联储主席鲍威尔紧急召见了华尔街主要银行 CEO，警告 Mythos 可能带来的网络安全风险

**更广泛的监管趋势：**
- 加州州长纽森在 2026 年 3 月底宣布新的 AI 监管标准，无视特朗普总统要求停止的指令
- 多个州（从加州到犹他州）正在推进 AI 治理立法，包括全面 AI 治理、消费者 AI 交互透明度、以及自动化决策工具的监管要求
- 得克萨斯州 RAIGA 法案已于 2026 年 1 月 1 日生效，禁止 AI 生成未成年人深度伪造和政府社会评分

**行业反应：**
- AI 行业正为 2026 年中期选举投入大量政治资金，创新委员会行动组织宣布将花费至少 1 亿美元
- OpenAI 联合创始人 Greg Brockman 夫妇各向"引领未来"组织捐赠了 1250 万美元，支持反对 AI 限制政策的候选人
- 部分专家警告，过度的政治游说可能导致监管真空，使公众面临更大的 AI 安全风险`,
    date: "2026-04-12",
    source: "Politico / The Guardian",
    sourceUrl: "https://www.politico.eu/article/eu-supports-staged-rollout-of-cyber-risky-new-anthropic-model/",
    href: "/news/news-013",
  },
  {
    id: "news-012",
    tag: "前沿",
    tagColor: "bg-blue-500/10 text-blue-300",
    coverImage: "http://tdewkptsq.hd-bkt.clouddn.com/images/news/llm-benchmark.jpg",
    title: "2026 年 LLM 基准评测全景：Claude Mythos 领跑，开源模型首次进入前十",
    summary: "BenchLM 发布 2026 年 4 月最新 LLM 基准评测，Claude Mythos 以 99 分位居榜首，GLM-5 开源模型以 85 分位列第九，标志开源模型正式进入顶级阵营。",
    content: `![news-012](http://tdewkptsq.hd-bkt.clouddn.com/images/news/llm-benchmark.jpg)

2026 年 4 月 12 日，独立评测机构 BenchLM 发布了 2026 年最新 LLM 基准评测报告，全面分析了当前主流大语言模型在各维度的性能表现。

**综合排名前十：**
- Claude Mythos Preview（Anthropic）：99 分 — 当前综合领先者
- Gemini 3.1 Pro（Google）：94 分 — 最佳性价比主流旗舰
- GPT-5.4（OpenAI）：94 分 — OpenAI 最强通用模型
- Claude Opus 4.6（Anthropic）：92 分 — 最佳写作旗舰
- GPT-5.4 Pro（OpenAI）：92 分 — 最强推理/数学专家模型
- GPT-5.3 Codex（OpenAI）：89 分
- Gemini 3 Pro Deep Think（Google）：87 分
- Claude Sonnet 4.6（Anthropic）：86 分
- GLM-5 Reasoning（Z.AI）：85 分 — 最佳开源综合模型
- GLM-5.1（Z.AI）：84 分

**关键发现：**
- 头部格局不再由单一厂商主导。Anthropic 占据第一，Google 和 OpenAI 紧随其后
- 开源模型正式跻身顶级阵营。GLM-5（Reasoning）以 85 分位列第九，GLM-5.1 以 84 分位列第十
- 编码能力仍然是区分模型的最佳指标，Claude Mythos 在编码评测中满分 100 分
- Agent 能力评测中，Claude Mythos 和 GPT-5.4 分列前两位

**各维度领先者：**
- 编码：Claude Mythos（100）、Gemini 3.1 Pro（94.3）、GPT-5.4 Pro（92.8）
- Agent 能力：Claude Mythos（100）、GPT-5.4（93.5）、Claude Opus 4.6（92.6）
- 推理：GPT-5.4 Pro（99.3）、Gemini 3.1 Pro（97）、GPT-5.3 Codex（94.7）
- 多模态：GPT-5.4 Pro（100）、Gemini 3 Pro Deep Think（100）、Claude Mythos（97.8）

**基准评测的演变：**
- 传统的简单知识基准（如 MMLU）已趋于饱和，不再能有效区分前沿模型
- 更具挑战性的评测如 HLE、GPQA 和 MMLU-Pro 成为新分水岭
- SWE-bench Verified 等实际工程能力评测日益受到重视
- 2026 年的基准评测格局比以往更加碎片化，也更实用`,
    date: "2026-04-12",
    source: "BenchLM / LM Council",
    sourceUrl: "https://benchlm.ai/blog/posts/state-of-llm-benchmarks-2026",
    href: "/news/news-012",
  },
  {
    id: "news-011",
    tag: "行业",
    tagColor: "bg-orange-500/10 text-orange-300",
    coverImage: "http://tdewkptsq.hd-bkt.clouddn.com/images/news/wall-street.jpg",
    title: "华尔街紧急会议：Anthropic Mythos 的网络安全风险震动全球金融界",
    summary: "美国财政部长贝森特和美联储主席鲍威尔紧急召见华尔街主要银行 CEO，讨论 Anthropic Claude Mythos 模型带来的网络安全威胁，这是 AI 能力首次引发金融系统级别的紧急响应。",
    content: `![news-011](http://tdewkptsq.hd-bkt.clouddn.com/images/news/wall-street.jpg)

2026 年 4 月 12 日，据 Bloomberg 和 Reuters 报道，美国财政部长斯科特·贝森特和美联储主席杰罗姆·鲍威尔紧急召见了华尔街主要银行的 CEO，讨论 Anthropic 最新 AI 模型 Claude Mythos 对金融系统网络安全构成的潜在威胁。

**事件背景：**
- Anthropic 于 4 月 8 日宣布，Claude Mythos 在发现和利用软件漏洞方面的能力超越了大多数人类安全研究人员
- 该模型发现了多个存在 27 年之久、此前从未被人类安全专家发现的漏洞
- Anthropic 决定限制 Mythos 的公开发布，仅向 12 家网络安全公司分阶段开放

**华尔街紧急响应：**
- 财政部长贝森特和美联储主席鲍威尔联合召集了主要银行 CEO 参加闭门会议
- 会议讨论了金融基础设施可能面临的 AI 驱动网络安全风险
- 各大银行被要求紧急审查其核心系统的安全防护措施
- 会议还讨论了 AI 模型能力对金融交易系统、支付网络和清算系统的潜在威胁

**更广泛的行业影响：**
- AI 安全公司 Irregular 的 CEO Dan Lahav 指出，虽然 AI 发现漏洞的能力令人担忧，但实际威胁程度取决于漏洞的组合利用方式
- 安全研究表明，部分被 Anthropic 标注为 Mythos 独有发现的漏洞，实际上可以通过开源模型复现
- 防御专家认为，AI 驱动的网络安全防御能力同样在提升，防御方可能比攻击方获得更多收益

**政治与监管反应：**
- 特朗普白宫在 Mythos 发布前与科技巨头举行了会议，协调应对策略
- 前白宫 AI 负责人 David Sacks 表示 Anthropic 的说法重要但应"有所保留地看待"
- AI 研究者 Gary Marcus 认为 Anthropic 的公告存在"夸大成分"
- 欧盟委员会则对 Anthropic 的分阶段发布策略表示支持

**深远意义：**
- 这是 AI 模型能力首次引发金融系统级别的跨部门紧急响应
- 标志着 AI 安全从学术讨论正式升级为国家级别的政策议题
- 预示着未来 AI 模型的发布可能需要经过更严格的多部门审查流程`,
    date: "2026-04-12",
    source: "Bloomberg / Reuters / Fortune",
    sourceUrl: "https://fortune.com/2026/04/10/anthropic-mythos-ai-driven-cybersecurity-risks-already-here/",
    href: "/news/news-011",
  },
  {
    id: "news-037",
    tag: "Funding",
    tagColor: "bg-purple-500/10 text-purple-300",
    coverImage: "http://tdewkptsq.hd-bkt.clouddn.com/images/news/venture-capital.jpg",
    title: "2026 年 Q1 风投达 2970 亿美元，81% 流向 AI 初创公司",
    summary: "Crunchbase 数据显示，2026 年第一季度全球风险投资总额达 2970 亿美元，其中 81% 的资金流向 AI 相关初创公司，AI 投资占比创历史新高。",
    content: `![news-037](http://tdewkptsq.hd-bkt.clouddn.com/images/news/venture-capital.jpg)

## AI 吞噬风投市场

2026 年第一季度的风险投资数据令人震惊。根据 Crunchbase 的最新数据：

**关键数据：**
- Q1 总融资额：**2970 亿美元**
- AI 占比：**81%**（即每 100 美元风投中有 81 美元投向 AI）
- 种子轮估值显著溢价
- A 轮估值普遍突破 5000 万美元

**投资趋势变化：**
- 不再是 2021 年的"撒网式"投资模式
- 资本更加集中，流向有实际收入的 AI 公司
- 后期投资占比增加，证明 AI 行业走向成熟

**非 AI 初创公司的困境：**
据 Fast Company 报道，不在旧金山、不做 AI 的初创公司融资难度极大。一位创始人表示："这类公司很少能在一轮融资中拿到足够的钱。"

**科技巨头资本支出：**
Tech Megacaps 计划投入超过 **3000 亿美元**用于 AI 基础设施建设，这还不包括风险投资市场的资金。`,
    date: "2026-04-13",
    source: "Crunchbase / Fast Company / Forbes",
    sourceUrl: "https://qubit.capital/blog/ai-startup-fundraising-trends",
    href: "/news/news-037",
  },
  {
    id: "news-038",
    tag: "Security",
    tagColor: "bg-red-500/10 text-red-300",
    coverImage: "http://tdewkptsq.hd-bkt.clouddn.com/images/news/cyber-warning.jpg",
    title: "CrowdStrike CEO 警告：AI 发现漏洞将导致网络攻击数量激增",
    summary: "CrowdStrike CEO 在 CNBC 采访中表示，AI 发现软件漏洞的能力将导致网络安全攻击数量大幅增加。这与 Anthropic Mythos 模型的安全警告形成呼应。",
    content: `![news-038](http://tdewkptsq.hd-bkt.clouddn.com/images/news/cyber-warning.jpg)

## AI 时代网络安全面临新挑战

网络安全巨头 CrowdStrike 的 CEO 在 CNBC 采访中发出警告：**AI 发现软件漏洞的能力将导致网络攻击数量大幅增加**。

**核心观点：**
- AI 模型能够比人类更快地发现和利用软件漏洞
- 攻击门槛降低，更多非专业黑客可以利用 AI 发动攻击
- 防御方需要同步提升 AI 驱动的安全能力

**与 Anthropic Mythos 事件的关联：**
这一警告与 Anthropic 对 Mythos 模型的安全评估不谋而合。Anthropic 发现 Mythos 能够识别出多个关键基础设施中的严重漏洞，因此决定**限制公开发布**，仅向 12 家网络安全公司分阶段开放。

**行业应对：**
- 安全公司 Irregular 的 CEO Dan Lahav 指出，实际威胁取决于漏洞的组合利用方式
- 研究表明，部分被标注为 Mythos 独有的发现，实际上可以通过开源模型复现
- 防御专家认为，AI 驱动的安全防御同样在进步，防御方可能获益更多`,
    date: "2026-04-13",
    source: "CNBC / Fortune",
    sourceUrl: "https://www.cnbc.com/video/2026/04/08/crowdstrike-ceo-ai-finding-vulnerabilities-will-cause-high-number-of-cybersecurity-attacks.html",
    href: "/news/news-038",
  },
  {
    id: "news-039",
    tag: "Finance",
    tagColor: "bg-blue-500/10 text-blue-300",
    coverImage: "http://tdewkptsq.hd-bkt.clouddn.com/images/news/chip.jpg",
    title: "CoreWeave 与 Meta 达成 210 亿美元 AI 计算合作协议",
    summary: "据 Bloomberg 报道，AI 云计算公司 CoreWeave 与 Meta 签署了价值 210 亿美元的计算服务协议，为 Meta 的 AI 模型训练和推理提供算力支持。",
    content: `![news-039](http://tdewkptsq.hd-bkt.clouddn.com/images/news/chip.jpg)

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
    id: "news-040",
    tag: "Research",
    tagColor: "bg-cyan-500/10 text-cyan-300",
    coverImage: "http://tdewkptsq.hd-bkt.clouddn.com/images/news/mit-research.jpg",
    title: "MIT 研发 Lean AI 技术：训练过程中实时裁剪模型，成本降低 40%",
    summary: "MIT 研究人员利用控制论原理，在 AI 模型训练过程中实时识别并移除冗余参数，CompreSSM 技术使训练成本降低 40%，为状态空间模型的效率提升开辟新路径。",
    content: `![news-040](http://tdewkptsq.hd-bkt.clouddn.com/images/news/mit-research.jpg)

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
    id: "news-041",
    tag: "Policy",
    tagColor: "bg-yellow-500/10 text-yellow-300",
    coverImage: "http://tdewkptsq.hd-bkt.clouddn.com/images/news/datacenter.jpg",
    title: "全美 AI 数据中心建设遭抵制，近半数规划项目被推迟或取消",
    summary: "CBS 报道，全美 AI 数据中心的建设热潮引发各地居民强烈抵制，近半数规划中的项目被推迟或取消。参议员 Sanders 和众议员 AOC 提出暂停法案，要求重新审视数据中心的环境和社会影响。",
    content: `![news-041](http://tdewkptsq.hd-bkt.clouddn.com/images/news/datacenter.jpg)

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
    id: "news-042",
    tag: "开发者",
    tagColor: "bg-green-500/10 text-green-300",
    coverImage: "http://tdewkptsq.hd-bkt.clouddn.com/images/news/coding.jpg",
    title: "84% 的开发者已在使用 AI 编程工具，但仅 29% 信任其输出",
    summary: "最新调查显示，2026 年 4 月已有 84% 的开发者在日常工作中使用 AI 编程工具，但仅有 29% 的人信任 AI 生成的代码。AI 生成代码已占全球代码库约 41%。",
    content: `![news-042](http://tdewkptsq.hd-bkt.clouddn.com/images/news/coding.jpg)

## AI 编程工具的爆炸式普及与信任危机

Stackademic 发布的最新调查报告揭示了 AI 编程工具在开发者群体中的快速渗透。

**核心数据：**
- **84%** 的开发者在日常工作中使用 AI 编程工具（Cursor、Copilot、Claude Code 等）
- 仅 **29%** 的开发者信任 AI 生成的代码
- AI 生成的代码已占全球代码库约 **41%**
- 92% 的美国开发者每天使用 AI 工具辅助开发

**信任鸿沟的根源：**
- 30 个真实生产环境失败案例表明，AI 生成的代码可能在运行时才暴露问题
- 开发者收集的失败案例涵盖安全漏洞、配置错误、逻辑缺陷等
- 每个失败都对应具体的检测命令、修复方案和预防清单

**行业应对：**
- 新型 AI 代码审查 Agent 开始出现，专门审查 AI 生成的代码
- 形式化验证工具正在填补快速生成与正确性之间的鸿沟
- 部分企业已将 AI 生成代码纳入独立审计流程

**未来趋势：**
"AI 改变了开发者选择编程语言的方式。当 AI 让某种技术的使用变得无缝时，开发者就会蜂拥而至。"——GitHub 开发者关系团队称之为"便利循环"效应。`,
    date: "2026-04-13",
    source: "Stackademic / GitHub",
    sourceUrl: "https://blog.stackademic.com/84-of-developers-use-ai-coding-tools-in-april-2026-only-29-trust-what-they-ship-d0cb7ec9320a",
    href: "/news/news-042",
  },
  {
    id: "news-043",
    tag: "行业趋势",
    tagColor: "bg-purple-500/10 text-purple-300",
    coverImage: "http://tdewkptsq.hd-bkt.clouddn.com/images/news/github-copilot.jpg",
    title: "GitHub 宣布 4 月 24 日起使用 Copilot 交互数据训练 AI 模型，用户可选择不参与",
    summary: "GitHub 宣布自 2026 年 4 月 24 日起，将开始使用用户的 Copilot 交互数据（包括输入、输出和代码片段）来训练和改进 AI 模型，用户可在设置中选择退出。",
    content: `![news-043](http://tdewkptsq.hd-bkt.clouddn.com/images/news/github-copilot.jpg)

## GitHub Copilot 数据政策重大变更

GitHub 在 r/github 社区发布了一项引发广泛讨论的政策更新。

**政策详情：**
- 从 **2026 年 4 月 24 日**起，GitHub 将使用 Copilot 用户的交互数据训练 AI 模型
- 收集的数据包括：用户输入、AI 输出、代码片段
- 用户可在 GitHub 设置页面选择退出数据收集
- 退出链接：github.com/settings/copilot/features

**社区反应：**
- 大量开发者表达了隐私方面的担忧
- 企业用户担心专有代码可能被用于模型训练
- 部分开发者建议立即退出数据收集

**行业影响：**
- 这一政策与 Google、Meta 等公司此前类似的数据收集策略一致
- 可能影响企业级 Copilot 部署决策
- 开源社区对此反应强烈，部分开发者转向本地部署方案

**建议操作：**
如果你担心代码隐私，可以前往 GitHub 设置页面关闭 "Allow GitHub to use Copilot interactions for AI model training" 选项。`,
    date: "2026-04-13",
    source: "Reddit r/github / GitHub",
    sourceUrl: "https://www.reddit.com/r/github/comments/1s3kvms/starting_april_24_2026_github_will_begin_using/",
    href: "/news/news-043",
  },
  {
    id: "news-044",
    tag: "模型发布",
    tagColor: "bg-blue-500/10 text-blue-300",
    coverImage: "http://tdewkptsq.hd-bkt.clouddn.com/images/news/models.jpg",
    title: "Claude Mythos 5、GPT-5.4 与 Gemini 3.1 密集发布，2026 年 4 月成最强模型月",
    summary: "2026 年 4 月成为 AI 模型发布的密集月份——Anthropic 发布 Claude Mythos 5，OpenAI 推出 GPT-5.4，Google 更新 Gemini 3.1，三大前沿模型同台竞争。",
    content: `![news-044](http://tdewkptsq.hd-bkt.clouddn.com/images/news/models.jpg)

## 前沿模型密集更新，AI 竞赛白热化

2026 年 4 月，AI 行业迎来了史上最强的模型发布潮。

**Claude Mythos 5（Anthropic）：**
- Anthropic 最新旗舰模型，在编程和安全测试中表现突出
- 此前版本因安全能力过强曾被限制发布
- Mythos 5 在安全测试中发现了多个存在 27 年之久的零日漏洞

**GPT-5.4（OpenAI）：**
- OpenAI 对 GPT-5 系列的最新迭代
- 在数学推理和代码生成方面继续提升
- 集成到 ChatGPT 和 API 平台

**Gemini 3.1（Google）：**
- Google DeepMind 的新一代多模态模型
- 在视觉理解和长上下文处理方面有所增强
- 与 Google 生态系统深度集成

**竞争格局：**
- 三大模型在编程能力、推理能力和多模态理解方面各有侧重
- 开源模型方面，GLM-5、Kimi K2.5、DeepSeek V4 也在持续追赶
- AI 模型市场正在从"数量竞争"转向"质量竞争"

**开发者选择：**
根据最新工具排行榜，Cursor、Claude Code、GitHub Copilot 仍然是 2026 年最受欢迎的 AI 编程工具，而各模型的 API 性能差异正在缩小。`,
    date: "2026-04-13",
    source: "devFlokers / 综合报道",
    sourceUrl: "https://www.devflokers.com/blog/new-ai-models-papers-open-source-daily-9-april-2026",
    href: "/news/news-044",
  },
  {
    id: "news-045",
    tag: "行业趋势",
    tagColor: "bg-purple-500/10 text-purple-300",
    title: "OpenAI、Anthropic、Google 罕见联手：共同打击中国 AI 模型复制",
    summary: "三大竞争对手通过 Frontier Model Forum 共享信息，联合检测对抗性蒸馏行为，OpenAI 指控 DeepSeek 搭便车。",
    content: `2026 年 4 月 6 日，据 Bloomberg 独家报道，OpenAI、Anthropic 和 Google 开始通过 Frontier Model Forum（前沿模型论坛）共享信息，联合打击中国竞争对手的"对抗性蒸馏"行为。

**什么是对抗性蒸馏？**
- 通过大量 API 查询，提取前沿模型的输出结果
- 用这些数据训练 smaller/cheaper 模型，复制前沿模型的能力
- 绕过了直接训练大模型所需的巨额计算投入

**三大巨头的联合行动：**
- 通过 2023 年共同创立的 Frontier Model Forum 共享蒸馏攻击信息
- Microsoft 也是该论坛的创始成员
- 各公司正在共享有关可疑查询模式的数据

**OpenAI 的指控：**
- OpenAI 向美国国会提交备忘录，明确指控 DeepSeek 试图"搭便车"利用 OpenAI 和其他美国前沿实验室开发的能力
- 认为这种行为违反了服务条款

**反垄断困境：**
- 由于现有反垄断法规的限制，AI 公司之间能共享的信息仍然有限
- 各大公司对于哪些信息可以合法共享存在不确定性

**行业影响：**
- 这标志着 AI 巨头从纯粹竞争转向"竞合"关系
- 中国 AI 模型（如 DeepSeek）在过去两年取得了巨大进步
- 这场"蒸馏战争"可能影响全球 AI 竞争格局

*来源：Bloomberg、The Straits Times*`,
    date: "2026-04-13",
    source: "Bloomberg / Straits Times",
    sourceUrl: "https://www.bloomberg.com/news/articles/2026-04-06/openai-anthropic-google-unite-to-combat-model-copying-in-china",
    href: "/news/news-045",
  },
  {
    id: "news-046",
    tag: "算力基础设施",
    tagColor: "bg-orange-500/10 text-orange-300",
    title: "Anthropic 扩大与 Google 和博通合作：TPU 算力扩容至 3.5GW，年化收入突破 300 亿美元",
    summary: "Anthropic 宣布与 Google Cloud 和博通达成扩展协议，TPU 算力从 1GW 增至 3.5GW，年化收入从 90 亿飙升至 300 亿美元以上。",
    content: `2026 年 4 月 6 日，Anthropic 宣布与 Google Cloud 和博通（Broadcom）达成重大扩展协议。

**算力扩展：**
- TPU 算力从 1 吉瓦（GW）扩展至 3.5 吉瓦
- 基于 Google 自研的 Tensor Processing Unit（TPU）芯片
- 博通将为 Google 和 Anthropic 生产下一代 AI 芯片

**财务亮点：**
- Anthropic 年化收入已突破 300 亿美元
- 2025 年底年化收入约 90 亿美元，增长超过 3 倍
- 此前刚刚完成 300 亿美元 G 轮融资，估值 3800 亿美元

**战略意义：**
- Anthropic 正从单一的 Claude 产品公司向平台级企业转型
- 大规模算力投入为其开发 Foundation Models 和 Enterprise Applications 提供基础
- 与 Google 的 TPU 生态深度绑定，减少对 NVIDIA GPU 的依赖

**行业背景：**
- OpenAI 也已承诺使用 6 吉瓦 AMD GPU
- AI 算力军备竞赛持续升级，各公司对算力的需求远超当前供应
- 博通 CEO 表示"2026 年 Anthropic 起步非常好"

*来源：TechCrunch、CNBC、Anthropic 官方博客*`,
    date: "2026-04-13",
    source: "TechCrunch / CNBC / Anthropic",
    sourceUrl: "https://techcrunch.com/2026/04/07/anthropic-compute-deal-google-broadcom-tpus/",
    href: "/news/news-046",
  },
  {
    id: "news-047",
    tag: "行业报告",
    tagColor: "bg-green-500/10 text-green-300",
    title: "Stanford HAI 2026 AI Index 报告今日发布——全球 AI 发展的权威晴雨表",
    summary: "斯坦福大学以人为本人工智能研究所（HAI）今日发布 2026 年度 AI Index 报告，涵盖 AI 研发、投资、人才、政策等全方位数据。",
    content: `2026 年 4 月 13 日，Stanford HAI（以人为本人工智能研究所）正式发布 2026 年度 AI Index 报告。

**AI Index 是什么？**
- 全球最受关注的 AI 年度综合报告
- 由斯坦福大学 HAI 研究所编制
- 涵盖 AI 研发趋势、投资流向、人才分布、政策动态、公众认知等多个维度

**2026 年值得关注的数据：**
- GitHub 上 AI 相关仓库已突破 430 万个，同比增长 178%
- AI 初创公司融资持续升温，2026 年已有 17 家美国 AI 公司融资超 1 亿美元
- 全球科技巨头 2026 年 AI 资本支出预计超过 3000 亿美元
- 中国 AI 论文发表量持续领先，但美国在顶尖论文质量上仍占优势

**政策与伦理：**
- 全球 AI 监管框架加速完善
- 欧盟 AI Act 进入全面实施阶段
- 美国国会围绕 AI 安全立法展开激烈辩论

**AI Index 报告每年为政策制定者、研究人员和企业提供权威参考数据，是了解 AI 行业发展最全面的信息来源之一。**

*来源：Stanford HAI*`,
    date: "2026-04-13",
    source: "Stanford HAI",
    sourceUrl: "https://hai.stanford.edu/ai-index",
    href: "/news/news-047",
  },

];
