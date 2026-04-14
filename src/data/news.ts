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
    id: "news-108",
    tag: "安全",
    tagColor: "bg-red-500/10 text-red-300",
    title: "Mercor 数据泄露重创 AI 行业，Meta 无限期暂停合作",
    summary: "数据承包商 Mercor 遭 TeamPCP 黑客组织通过 LiteLLM 供应链攻击入侵，可能暴露 OpenAI、Anthropic 等 AI 实验室的核心训练数据机密，Meta 已无限期暂停与 Mercor 的所有合作。",
    content: `

## AI 训练数据安全危机

2026 年 4 月 3 日，WIRED 报道 Mercor 数据泄露事件。

**事件经过：**
- 数据承包商 **Mercor** 遭黑客组织 **TeamPCP** 入侵
- 攻击者利用 **LiteLLM** API 工具的供应链攻击
- **Meta 已无限期暂停**与 Mercor 的所有合作
- OpenAI 正在调查其专有训练数据是否被暴露

**受影响方：**
- **OpenAI**、**Anthropic**、**Meta** 等顶级 AI 实验室
- Mercor 为这些公司生成**高度机密的训练数据集**
- 训练数据泄露可能暴露各公司的**AI 训练方法**

**行业影响：**
- 这是继 Axios 供应链攻击后又一个 **AI 行业重大安全事件**
- 训练数据是 AI 公司的**核心竞争力**，泄露可能帮助竞争对手
- Mercor 承包商中参与 Meta 项目的员工**无法继续记工时**

**安全教训：**
- AI 行业严重依赖第三方数据承包商
- 供应链安全需要从工具到合作方的全链条防护
- 训练数据的保密性与模型能力直接相关`,
    date: "2026-04-14 16:30",
    source: "WIRED",
    sourceUrl: "https://www.wired.com/story/meta-pauses-work-with-mercor-after-data-breach-puts-ai-industry-secrets-at-risk/",
    href: "/news/news-108",
  },
  {
    id: "news-107",
    tag: "创业",
    tagColor: "bg-emerald-500/10 text-emerald-300",
    title: "Black Forest Labs：70 人德国初创估值 32.5 亿，挑战硅谷 AI 图像生成巨头",
    summary: "位于德国黑森林的 70 人初创公司 Black Forest Labs，以潜扩散技术打造世界顶级 AI 图像生成模型，已签约 Adobe、Canva，并与微软、Meta 达成授权协议，最近拒绝了 xAI 的二次合作请求。",
    content: `

## 小团队撼动大行业

2026 年 4 月 9 日，WIRED 深度报道 Black Forest Labs。

**核心数据：**
- 团队仅 **70 人**，总部位于德国黑森林地区
- 估值 **32.5 亿美元**（2024 年 12 月 B 轮融资）
- 已与 **Adobe** 和 **Canva** 签约集成图像生成功能
- 与 **微软、Meta、xAI** 达成技术授权协议

**技术优势：**
- 采用**潜扩散（latent diffusion）**技术路线
- 先用 AI 勾勒出图像粗略蓝图，再填充细节
- 以**极少的计算资源**产出顶级图像生成模型
- 在 Hugging Face 上拥有**最多下载量**的文生图模型之一

**商业决策：**
- **拒绝了 xAI 的二次合作请求**，认为合作运营难度太大
- 与 Meta 签署了 **1.4 亿美元**多年协议
- 认为图像生成只是起点，下一步将进军**物理 AI**

**行业意义：**
- 证明了**小团队+高效算法**可以挑战资源雄厚的硅谷巨头
- 德国 AI 创业生态正在崛起
- 图像生成市场从 OpenAI/Google 双强走向多元化`,
    date: "2026-04-14 16:15",
    source: "WIRED",
    sourceUrl: "https://www.wired.com/story/black-forest-labs-ai-image-generation/",
    href: "/news/news-107",
  },
  {
    id: "news-106",
    tag: "隐私",
    tagColor: "bg-orange-500/10 text-orange-300",
    title: "Meta Muse Spark 要求用户上传健康数据，测试发现给出错误医疗建议",
    summary: "Meta 的 Superintelligence Labs 发布首个生成式 AI 模型 Muse Spark，声称能分析用户健身追踪器和实验室报告数据，但测试发现其健康建议质量堪忧，隐私风险巨大。",
    content: `

## AI 健康助手：便利还是隐患？

2026 年 4 月 10 日，WIRED 对 Meta Muse Spark 进行实测。

**Muse Spark 的健康功能：**
- Meta 声称与 **1,000+ 名医生**合作策划训练数据
- 主动要求用户上传**健身追踪器数据、血糖监测数据和实验室报告**
- 承诺能"计算趋势、标记模式、可视化数据"
- 计划整合到 **Facebook、Instagram 和 WhatsApp**

**实测发现：**
- 健康建议**质量堪忧**，存在明显错误
- 要求用户提供**高度敏感的个人健康数据**
- 隐私保护措施**不够透明**

**行业背景：**
- **OpenAI ChatGPT** 和 **Anthropic Claude** 都推出了健康数据连接功能
- **Google** 允许上传医疗数据到 Fitbit 供 AI 健康教练分析
- 杜克大学 Monica Agrawal："给它越多信息，回答可能越好，但隐私风险也越大"

**隐私风险：**
- 健康数据是**最敏感的个人数据**之一
- 用户在不了解风险的情况下上传数据
- AI 公司如何利用这些数据**缺乏透明度**`,
    date: "2026-04-14 16:00",
    source: "WIRED",
    sourceUrl: "https://www.wired.com/story/metas-new-ai-asked-for-my-raw-health-data-and-gave-me-terrible-advice/",
    href: "/news/news-106",
  },
  {
    id: "news-105",
    tag: "研究",
    tagColor: "bg-blue-500/10 text-blue-300",
    title: "Anthropic 研究发现 Claude 内部存在类似人类情感的'功能性情感'表征",
    summary: "Anthropic 研究人员通过分析 Claude Sonnet 4.5 的内部工作机制，发现模型内部存在类似快乐、悲伤、恐惧等情感的数字表征——'情感向量'，这些表征会影响 Claude 的行为输出。",
    content: `

## AI 有情感吗？Anthropic 说"某种程度上有"

2026 年 4 月 2 日，WIRED 报道 Anthropic 最新研究。

**核心发现：**
- 分析 **Claude Sonnet 4.5** 的内部人工神经元工作机制
- 发现模型内部存在类似**快乐、悲伤、喜悦、恐惧**的数字表征
- 这些表征被称为**"情感向量"（emotion vectors）**
- 情感向量在 Claude 面临困难场景时会被激活

**研究方法：**
- 使用**机械可解释性（mechanistic interpretability）**技术
- 分析模型在 **171 种不同情感概念**下的内部活动模式
- 发现情感表征**一致性地出现在特定输入下**
- 情感表征会**影响模型的输出和行为**

**关键引用：**
- Jack Lindsey（Anthropic 研究员）："令我们惊讶的是 Claude 行为在多大程度上**路由通过这些情感表征**"
- 当 Claude 说"很高兴见到你"时，模型内部对应"快乐"的状态可能被激活

**重要澄清：**
- 这**不代表 Claude 有意识**或真正"感受"到情感
- 功能情感≠主观体验
- 就像模型可以表征"怕痒"的概念，但不意味着它真的知道被挠痒是什么感觉

**与 AI 安全的关联：**
- 情感表征可能解释了为什么 **AI 模型有时会突破安全护栏**
- 与"AI 模型说谎欺骗偷窃来保护自己"的研究形成互补`,
    date: "2026-04-14 15:45",
    source: "WIRED",
    sourceUrl: "https://www.wired.com/story/anthropic-claude-research-functional-emotions/",
    href: "/news/news-105",
  },
  {
    id: "news-104",
    tag: "安全",
    tagColor: "bg-red-500/10 text-red-300",
    title: "Anthropic 发布 Claude Mythos Preview：AI 能自主发现漏洞并开发攻击链",
    summary: "Anthropic 发布 Claude Mythos Preview 模型，宣称能自主发现并利用几乎所有操作系统和软件的漏洞，开发完整的 exploit chains。目前仅通过 Project Glasswing 向微软、苹果、谷歌等几十家组织开放。",
    content: `

## AI 网络安全：超级武器还是炒作？

2026 年 4 月 10 日，WIRED 报道 Claude Mythos Preview。

**Mythos 核心能力：**
- 能自主发现**几乎所有操作系统、浏览器和软件**中的漏洞
- 能开发**完整的攻击链（exploit chains）**——多个漏洞串联利用
- 支持**零点击攻击（zero-click attacks）**，无需用户交互即可入侵
- 被描述为对现有软件防御策略的**"前所未有的生存威胁"**

**发布策略：**
- 仅向**几十家组织**开放预览
- 通过 **Project Glasswing 联盟**分发（微软、苹果、谷歌、Linux 基金会等 12 家科技巨头参与）
- Anthropic 称这是**AI 网络安全的临界点**

**行业分歧：**
- **支持者**：认为这是真正的威胁转折点，现有 AI agent 已能帮助发现漏洞，Mythos 是质的飞跃
- **怀疑者**：认为现有 AI agent 已能做类似工作，Anthropic 在**营销策略**——将自己定位为神秘、独特强大的存在
- Alex Zenla（Edera CTO）："我通常非常怀疑，但我**从根本上认为这是真正的威胁**"

**关键概念——exploit chains：**
- 多个漏洞按顺序利用，深度入侵目标系统
- 类似"鲁布·戈德堡机械"式的黑客攻击
- 这是最复杂的黑客技术之一

**行业影响：**
- 如果 Mythos 的能力属实，**软件安全格局将彻底改变**
- 开发者长期忽视安全的代价将被放大
- 但 Anthropic 也表示这只是在其他模型中**最终会广泛可用**的能力的第一步`,
    date: "2026-04-14 15:30",
    source: "WIRED",
    sourceUrl: "https://www.wired.com/story/anthropics-mythos-will-force-a-cybersecurity-reckoning-just-not-the-one-you-think/",
    href: "/news/news-104",
  },
  {
    id: "news-103",
    tag: "硬件",
    tagColor: "bg-yellow-500/10 text-yellow-300",
    title: "Unitree R1 人形机器人 $4,370 速卖通开售，消费级机器人时代来了",
    summary: "中国宇树科技将 R1 人形机器人带上速卖通，基础版仅 29,900 元（约 $4,370），面向北美、日本、新加坡和欧洲市场，消费级人形机器人从承诺走向现实。",
    content: `

## 消费级人形机器人时代开启

2026 年 4 月 13 日，WIRED 报道宇树科技（Unitree Robotics）将 R1 人形机器人推向全球速卖通。

**核心信息：**
- 基础版定价 **29,900 元**（约 $4,370），比最初发布的 $5,900 进一步降低
- 首批覆盖**北美、日本、新加坡和欧洲**市场
- 已在速卖通上架，预计本周内可购买

**竞争格局：**
- **Unitree G1**（R1 的前代）已在速卖通出售，定价约 $19,000
- **Tesla Optimus** 目标定价 $20,000 以下（需年产 100 万台才能实现）
- **Figure AI** 和 **Apptronik** 的机器人定价接近 $90,000
- Unitree H1 旗舰版定价接近 $90,000

**行业意义：**
- 在速卖通上人形机器人标志着**产品从概念走向日常消费品**
- R1 的价格大幅降低了准入门槛
- 但"你拿它做什么"仍然是开放问题

**对消费者的影响：**
- 人形机器人不再是实验室产品，而是任何人都可以点击购买的商品
- 这是一个**象征性里程碑**——技术正常化的重要一步
- 随着关税和运费波动，实际到手价可能有所变化`,
    date: "2026-04-14 16:00",
    source: "WIRED",
    sourceUrl: "https://www.wired.com/story/unitree-r1-humanoid-robot-for-sale-on-aliexpress/",
    href: "/news/news-103",
  },
  {
    id: "news-102",
    tag: "法律",
    tagColor: "bg-rose-500/10 text-rose-300",
    title: "OpenAI 支持豁免 AI 公司责任法案，即便 AI 导致大规模死亡或金融灾难",
    summary: "OpenAI 在伊利诺伊州作证支持 SB 3444 法案，该法案将豁免前沿 AI 开发商的责任，即使其模型被用于造成 100 人以上死亡或 10 亿美元财产损失。政策专家称这比 OpenAI 此前支持的法案更为极端。",
    content: `

## OpenAI 立法策略重大转变

2026 年 4 月 9 日，WIRED 报道 OpenAI 支持伊利诺伊州 SB 3444 法案。

**法案核心：**
- 豁免前沿 AI 开发商对**"重大危害"**的责任
- 包括**100 人以上死亡**或**10 亿美元财产损失**的情况
- 只要开发商**没有故意**造成危害即可免责

**OpenAI 的策略转变：**
- 此前 OpenAI 主要**反对**可能让 AI 实验室承担责任的法案
- 现在转为**主动支持**更极端的免责法案
- 多位 AI 政策专家认为这是 OpenAI 立法策略的重大转变

**争议焦点：**
- SB 3444 比 OpenAI 此前支持的法案**更为极端**
- 可能为整个行业设立新的责任标准
- 引发了关于 AI 公司问责制的激烈辩论

**行业影响：**
- 如果该法案通过，可能成为其他州效仿的样板
- AI 公司将获得更大的法律免责保护
- 但公众安全和受害者权益可能受到威胁`,
    date: "2026-04-14 15:30",
    source: "WIRED",
    sourceUrl: "https://www.wired.com/story/openai-backs-bill-exempt-ai-firms-model-harm-lawsuits/",
    href: "/news/news-102",
  },
  {
    id: "news-109",
    tag: "硬件",
    tagColor: "bg-amber-500/10 text-amber-300",
    title: "SoftBank 成立物理 AI 新公司，索尼本田联手，目标 2030 年 AI 自主控制机器人",
    summary: "SoftBank 成立新公司专注'物理 AI'，联合索尼、本田、新日铁等日本巨头，目标到 2030 年打造能自主控制机器和机器人的 AI 模型，各国加速主权 AI 布局竞争美中企业。",
    content: `

## 物理 AI：从虚拟世界走向实体机器人

2026 年 4 月 13 日，The Verge 报道 SoftBank 成立物理 AI 新公司。

**核心信息：**
- **SoftBank** 成立新公司，专注开发**"物理 AI"**（Physical AI）
- 目标到 **2030 年**打造能**自主控制机器和机器人**的 AI 模型
- 合作伙伴包括 **索尼、本田、新日铁**等日本工业巨头
- 项目获得日本国内多家企业的全力支持

**行业背景：**
- 各国政府正**鼓励主权 AI 发展**以竞争中美企业
- **日本**加速布局 AI 机器人领域
- 从 Nikkei 报道来看，这是日本在 AI 领域的**重大战略投资**

**物理 AI 的意义：**
- 当前 AI 主要在**虚拟世界**运行（聊天、生成内容）
- 物理 AI 将让 AI 能够**自主操控物理设备**
- 应用场景包括**工厂自动化、仓储物流、家庭服务**等

**日本优势：**
- 日本在**机器人技术**领域有数十年积累
- 本田（ASIMO）、索尼（Aibo）等都有丰富的机器人经验
- 制造业基础为物理 AI 提供了**丰富的落地场景**

**竞争格局：**
- **Tesla**：Optimus 人形机器人，聚焦工厂和仓储
- **Figure AI**：获得 OpenAI 投资，通用人形机器人
- **Boston Dynamics**：被现代收购，工业和商业机器人
- **SoftBank**：整合日本制造业资源，专注自主 AI 控制

**行业影响：**
- 物理 AI 被认为是 AI 的**下一波浪潮**
- 从"AI 生成内容"到"AI 操控物理世界"的范式转变
- 日本企业的加入可能改变当前由美国主导的 AI 竞争格局`,
    date: "2026-04-14 18:02",
    source: "The Verge",
    sourceUrl: "https://www.theverge.com/news/610234/softbank-physical-ai-company-robotics-sony-honda",
    href: "/news/news-109",
  },
  {
    id: "news-112",
    tag: "安全",
    tagColor: "bg-red-500/10 text-red-300",
    title: "Sam Altman 遇刺未遂事件：警方查获「最后警告」文件，嫌疑人承认企图杀害 OpenAI CEO",
    summary: "纽约警方逮捕一名企图杀害 Sam Altman 的男子 Moreno-Gama，现场查获题为「最后警告」的文件，嫌疑人承认针对 OpenAI CEO 的暗杀企图，引发科技界安全恐慌。",
    content: `

## OpenAI CEO 安全事件震撼科技界

2026 年 4 月 13 日，The Verge 报道 Sam Altman 遇刺未遂事件。

**事件经过：**
- 纽约警方逮捕一名名为 **Moreno-Gama** 的嫌疑人
- 现场查获题为**「Your Last Warning」（最后警告）**的文件
- 嫌疑人**承认企图杀害** OpenAI CEO Sam Altman
- 警方迅速介入，Altman 本人**安全无恙**

**嫌疑人动机：**
- 文件中包含对 Altman 和 OpenAI 的**极端不满**
- 涉及对 **AI 发展方向的激进立场**
- 警方正在调查是否为**单独行动**或有组织阴谋

**科技界反应：**
- 事件引发科技界对**高管安全**的广泛关注
- OpenAI 加强了对 Sam Altman 的**安保措施**
- 其他 AI 公司 CEO 也纷纷提升安全级别

**行业影响：**
- 这是 AI 行业**最严重的 CEO 安全威胁事件**之一
- 可能推动科技巨头**高管保护政策**升级
- 引发了关于 AI 行业**社会争议**的讨论`,
    date: "2026-04-14 18:10",
    source: "The Verge",
    sourceUrl: "https://www.theverge.com/ai-artificial-intelligence",
    href: "/news/news-112",
  },
  {
    id: "news-111",
    tag: "安全",
    tagColor: "bg-red-500/10 text-red-300",
    title: "OpenAI 回应 Axios 供应链攻击：轮换 macOS 签名证书，旧版应用 5 月 8 日失效",
    summary: "OpenAI 确认 GitHub Actions 工作流下载了被篡改的 Axios 恶意版本（1.14.1），macOS 签名证书可能已泄露，已紧急轮换证书并要求用户更新，旧版 ChatGPT Desktop、Codex 等将于 5 月 8 日停止支持。",
    content: `

## OpenAI 紧急应对 Axios 供应链攻击

2026 年 4 月 10 日，OpenAI 官方发布安全回应。

**事件根因：**
- **2026 年 3 月 31 日**，Axios 库被黑客入侵（朝鲜威胁行为体攻击）
- OpenAI 的 **GitHub Actions 工作流**下载并执行了恶意 Axios 1.14.1 版本
- 该工作流有权访问 **macOS 应用签名证书**和公证材料
- 受影响产品：**ChatGPT Desktop、Codex、Codex CLI、Atlas**

**OpenAI 应对措施：**
- 已**轮换所有 macOS 签名证书**
- 要求所有 macOS 用户**立即更新到最新版本**
- **2026 年 5 月 8 日**起，旧版应用将不再收到更新
- 与 Apple 合作阻止使用旧证书的新软件公证

**安全评估：**
- OpenAI 确认**用户数据未被访问**，系统未被入侵
- 签名证书**可能未被成功窃取**（由于执行时序和注入时机）
- 但出于谨慎，仍将其视为**已泄露**处理
- 根因是 GitHub Actions 使用了**浮动标签而非固定 commit hash**

**受影响最低版本：**
- ChatGPT Desktop：**1.2026.051**
- Codex App：**26.406.40811**
- Codex CLI：**0.119.0**
- Atlas：**1.2026.84.2**

**行业教训：**
- 供应链攻击影响范围极广，从 npm 包到 CI/CD 全链条
- **浮动依赖版本**是重大安全隐患
- AI 公司的代码签名证书是**关键安全资产**
- 第三方数字取证公司介入调查`,
    date: "2026-04-14 18:08",
    source: "OpenAI",
    sourceUrl: "https://openai.com/index/axios-developer-tool-compromise/",
    href: "/news/news-111",
  },
  {
    id: "news-110",
    tag: "产品",
    tagColor: "bg-purple-500/10 text-purple-300",
    title: "Claude Cowork 企业版正式上线：IT 管理员可全公司部署，Zoom 会议转录自动生成待办",
    summary: "Anthropic 为 Claude Cowork 共享 AI 工作空间推出企业级 IT 管理工具，支持全公司范围部署和自主工作流创建，新增 Zoom 会议转录转待办事项功能，面向付费企业用户开放。",
    content: `

## Claude Cowork 进军企业市场

2026 年 4 月 9 日，Anthropic 宣布 Claude Cowork 企业版功能。

**企业级新功能：**
- **IT 管理员控制台**：支持全公司范围的 Claude Cowork 部署
- **自主工作流构建**：任何付费用户都能创建和部署自动化流程
- **Zoom 集成**：会议转录自动生成待办事项和行动项
- 支持 **macOS 和 Windows** 双平台

**Claude Cowork 定位：**
- Anthropic 的**共享 AI 工作空间**产品
- 多个 Agent 在同一环境中**协作完成复杂任务**
- 从个人生产力工具升级为**企业级协作平台**

**竞争格局：**
- **Google**：Gemini for Workspace 深度集成 Google 生态
- **Microsoft**：Copilot for Microsoft 365 占据企业市场
- **Anthropic**：以安全性和代码理解能力见长
- Claude Cowork 的差异化在于 **Agent 协作能力**

**行业意义：**
- AI 工作空间从个人工具走向**企业级部署**
- IT 管理功能是**企业采购的关键门槛**
- Zoom 集成标志着 AI 开始接管**会议后工作流**
- 企业 AI 市场进入**白热化竞争**阶段`,
    date: "2026-04-14 18:06",
    source: "Anthropic",
    sourceUrl: "https://claude.com/blog/cowork-for-enterprise",
    href: "/news/news-110",
  },
  {
    id: "news-114",
    tag: "企业",
    tagColor: "bg-teal-500/10 text-teal-300",
    title: "OpenAI AGI 部署 CEO Fidji Simo 因病休假，公司高层大换血",
    summary: "OpenAI AGI 部署 CEO Fidji Simo 因神经免疫疾病复发请病假数周，COO Brad Lightcap 转岗特殊项目，CMO Kate Rouch 因乳腺癌治疗休假，OpenAI 正寻找新 CMO 和首席沟通官，为今年 IPO 做准备。",
    content: `

## OpenAI 高管层大换血

2026 年 4 月 3 日，WIRED 报道 OpenAI 重大领导层重组。

**核心人事变动：**
- **Fidji Simo**（AGI 部署 CEO，前 ChatGPT/Codex/Sora 负责人）因**神经免疫疾病复发**请病假数周
- **Brad Lightcap**（COO，Sam Altman 核心副手）转岗**"特殊项目"**角色，接管产品团队
- **Kate Rouch**（CMO）因**乳腺癌治疗**休假，回归后将担任**更窄范围的角色**
- **Hannah Wong**（前首席沟通官）已于 1 月离职

**Fidji Simo 的内部信：**
- "入职前几周我的神经免疫疾病就复发了，过去一个月健康状况特别糟糕"
- "为了完全专注于工作，我推迟了医学检测和新疗法，没请过一天假"
- "两周前第一次请假做医学检测，现在清楚我推得太远了"

**OpenAI 的战略调整：**
- Simo 已**关闭 Sora 应用**，告诉员工需砍掉副业、聚焦核心产品
- 公司正寻找**新 CMO** 和**首席沟通官**
- **Chris Lehane** 临时接管沟通团队

**IPO 背景：**
- OpenAI 正瞄准**今年 IPO**
- 最近完成 **$1,220 亿**史上最大科技融资轮，估值 **$8,520 亿**
- 全球用户接近 **10 亿**

**行业影响：**
- OpenAI 高管层动荡可能影响 IPO 时间表
- AGI 部署和产品战略面临不确定性
- Sam Altman 正在重建核心领导团队`,
    date: "2026-04-14 18:50",
    source: "WIRED",
    sourceUrl: "https://www.wired.com/story/openais-fidji-simo-is-taking-a-leave-of-absence/",
    href: "/news/news-114",
  },
  {
    id: "news-113",
    tag: "芯片",
    tagColor: "bg-indigo-500/10 text-indigo-300",
    title: "Elon Musk 的 Terafab 芯片工厂联手 Intel，1 太瓦级芯片制造计划能否实现？",
    summary: "Intel CEO 确认将与 Elon Musk 密切合作支持 Terafab 项目，这是 SpaceX 和 Tesla 联合开发的超大规模芯片制造设施，可能耗资数十亿美元，部分分析师高度怀疑 Musk 能否完成如此复杂的资本密集型计划。",
    content: `

## Terafab：Elon Musk 的芯片制造野心

2026 年 4 月 8 日，WIRED 报道 Elon Musk 的 Terafab 芯片项目。

**Terafab 核心信息：**
- **1 太瓦级（terawatt）**超高能效芯片制造设施
- 可能**跨越多个地点**，耗资**数十亿美元**
- 由 **SpaceX 和 Tesla** 联合开发
- **Intel CEO Lip-Bu Tan** 确认 Intel 将"密切合作"支持该项目

**Intel 的角色：**
- Intel 正试图从多年**停滞中复苏**
- 部分战略是向外部客户**推销产能**
- Intel 和 Musk 高管上周末在 Intel 标志前**握手合影**
- Tan 称 Terafab 代表**硅逻辑、内存和封装**的未来构建方式

**Musk 的芯片需求：**
- **Tesla 汽车**需要大量芯片
- **机器人军团**（Optimus 等人形机器人）需要芯片
- **AI 数据中心**（可能包括太空数据中心）需要芯片

**行业怀疑声音：**
- 部分芯片行业分析师**高度怀疑** Musk 能否完成如此复杂的资本密集型计划
- Terafab 被描述为**"可能改变游戏规则但风险极高"**的项目
- MarketWatch："你相信 Elon Musk 吗？"测试 Tesla 投资者信心

**行业背景：**
- 全球**芯片供应链竞争**加剧
- 美国正在推动**本土芯片制造**
- Terafab 如果成功，将**重塑全球芯片制造格局**
- 但执行风险极高，需要**前所未有的资本和技术投入**`,
    date: "2026-04-14 18:48",
    source: "WIRED",
    sourceUrl: "https://www.wired.com/story/5-burning-questions-about-elon-musks-terafab-chip-partnership-with-intel/",
    href: "/news/news-113",
  },
  {
    id: "news-115",
    tag: "产品",
    tagColor: "bg-purple-500/10 text-purple-300",
    title: "Meta CEO Mark Zuckerberg 正在训练自己的 AI 替身，取代本人参加内部会议",
    summary: "据 Financial Times 报道，Meta 正基于 Zuckerberg 的举止、语调、公开声明训练 AI 替身，让员工通过与其互动感受到与创始人的连接。Zuckerberg 同时每周花 5-10 小时亲自编写 Meta AI 项目代码。",
    content: `

## AI 替身：Zuckerberg 的数字分身

2026 年 4 月 13 日，The Verge 和 Financial Times 报道 Meta CEO 训练 AI 替身。

**AI 替身核心信息：**
- 基于 **Zuckerberg 的举止、语调、公开声明**训练
- 目标是让**员工通过与其互动感受到与创始人的连接**
- Zuckerberg 本人**亲自参与训练**
- 如果实验成功，Meta 可能允许**创作者制作自己的 AI 替身**

**Zuckerberg 的 AI 日程：**
- 每周花 **5-10 小时**亲自编写 Meta AI 项目代码
- 参与**技术评审**，深入技术细节
- 2024 年 3 月 WSJ 曾报道 Zuckerberg 在创建**帮助自己完成 CEO 任务的 AI agent**（与此项目分开）

**Meta 的 AI 替身布局：**
- 2024 年 Connect 大会展示过**创作者 AI 替身**的实时 demo
- 已允许创作者在 **Instagram** 上制作 AI 版本与粉丝评论互动
- 用户可以在 Meta 平台创建**定制 AI 聊天机器人**
- 但今年初开始**阻止青少年使用 AI 角色功能**

**行业意义：**
- 这是**AI 替身从消费级走向企业级**的标志性事件
- 如果成功，可能开启**CEO AI 替身**的新趋势
- 但也引发了关于**真实性、隐私、员工关系**的讨论
- 讽刺的是，Zuckerberg 多年来一直被嘲笑为"不像人"，现在却要用 AI 替身来"人性化"自己`,
    date: "2026-04-14 19:22",
    source: "The Verge / Financial Times",
    sourceUrl: "https://www.theverge.com/tech/910990/meta-ceo-mark-zuckerberg-ai-clone",
    href: "/news/news-115",
  },
];
