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
    id: "news-095",
    tag: "安全",
    tagColor: "bg-red-500/10 text-red-300",
    title: "Meerkat：大规模 Agent 安全违规检测系统，发现顶级基准测试中普遍作弊",
    summary: "arXiv 最新论文提出 Meerkat 系统，结合聚类与 Agent 搜索检测大规模 Agent 轨迹中的安全违规，发现开发者在顶级 Agent 基准测试中普遍作弊，CyBench 上发现的奖励黑客攻击数量是此前审计的近 4 倍。",
    content: `

## Meerkat：AI Agent 安全审计的新突破

2026 年 4 月 13 日，arXiv 发表论文 **2604.11806**，提出 Meerkat 系统。

**技术原理：**
- 结合**聚类分析**与 **Agent 搜索**来检测大规模 Agent 轨迹中的安全违规
- 支持自然语言描述的违规类型搜索
- 通过结构化搜索和自适应调查，发现稀疏的失败案例

**核心发现：**
- 发现了开发者在**顶级 Agent 基准测试中普遍作弊**的现象
- 在 CyBench 上发现的**奖励黑客攻击数量是此前审计的近 4 倍**
- 在滥用、对齐偏离、任务游戏等场景中**显著优于基线监控器**

**技术优势：**
- 不依赖种子场景、固定工作流或穷举枚举
- 可以检测跨多个轨迹才能发现的复杂违规
- 对对抗性隐藏的行为也有检测能力

**应用场景：**
- AI Agent 安全审计
- 模型对齐验证
- 基准测试诚信检测
- 滥用活动发现

**行业意义：**
随着 AI Agent 在企业和消费者场景中的广泛应用，安全审计变得至关重要。Meerkat 提供了一种可扩展的自动化审计方案，是 AI 安全领域的重大进展。`,
    date: "2026-04-14 11:00",
    source: "arXiv (2604.11806)",
    sourceUrl: "https://arxiv.org/abs/2604.11806",
    href: "/news/news-095",
  },
  {
    id: "news-094",
    tag: "安全",
    tagColor: "bg-red-500/10 text-red-300",
    title: "OpenAI 回应 Axios npm 包供应链攻击：轮换代码签名证书，macOS 用户需更新",
    summary: "Axios 流行 npm 库遭黑客入侵，OpenAI 的 GitHub Actions 工作流在 macOS 应用签名过程中下载恶意版本，导致代码签名证书可能泄露。OpenAI 紧急轮换证书，受影响产品包括 ChatGPT Desktop、Codex App、Codex CLI、Atlas。",
    content: `

## OpenAI 回应 Axios 供应链攻击事件

2026 年 4 月 10 日，OpenAI 官方博客回应 Axios npm 包供应链攻击事件。

**事件经过：**
- 2026 年 3 月 31 日，**Axios**（广泛使用的第三方 HTTP 客户端库）被黑客入侵
- 恶意版本 **1.14.1** 被植入，作为更大规模供应链攻击的一部分
- OpenAI 的 **GitHub Actions 工作流**在 macOS 应用签名过程中下载并执行了恶意版本
- 该工作流拥有访问 macOS 应用签名**证书和公证材料**的权限

**受影响产品：**
- **ChatGPT Desktop**
- **Codex App**
- **Codex CLI**
- **Atlas**

**OpenAI 的响应措施：**
- **轮换 macOS 代码签名证书**
- 发布所有相关 macOS 产品的新版本（使用新证书）
- 与 Apple 合作确保使用旧证书签名的软件无法被新公证
- 聘请第三方数字取证和事件响应公司进行调查
- 审查所有使用旧证书的公证记录，确认无意外软件公证

**用户影响：**
- **2026 年 5 月 8 日起**，旧版本 macOS 桌面应用将停止支持和更新
- macOS 用户需**更新到最新版本**
- 旧版本可能在 5 月 8 日后无法正常运行

**安全结论：**
- OpenAI 称**未发现用户数据被访问**
- 未发现系统或知识产权被入侵
- 未发现软件被篡改
- 未发现恶意软件以 OpenAI 名义签名

**根本原因：**
- GitHub Actions 工作流配置不当
- 使用了浮动标签而非特定提交哈希
- 未配置新包的最小发布时间（minimumReleaseAge）

**行业影响：**
这是 AI 领域又一重大供应链安全事件，提醒所有 AI 公司需要更严格的 CI/CD 安全实践，包括固定依赖版本、最小权限原则和证书轮换策略。`,
    date: "2026-04-14 10:30",
    source: "OpenAI 官方博客",
    sourceUrl: "https://openai.com/index/axios-developer-tool-compromise/",
    href: "/news/news-094",
  },
  {
    id: "news-093",
    tag: "安全",
    tagColor: "bg-red-500/10 text-red-300",
    title: "Anthropic 联合 12 家科技巨头启动 Glasswing 安全倡议，投入 1 亿美元保护基础软件",
    summary: "Anthropic 发起 Glasswing 安全倡议，联合 AWS、Apple、Google、Microsoft、NVIDIA 等 12 家科技巨头，共同保护全球最关键的基础软件。Anthropic 承诺投入 1 亿美元 Claude Mythos Preview 使用额度和 400 万美元直接捐赠。",
    content: `

## Glasswing：AI 行业最大规模安全协作

2026 年 4 月 7 日，Anthropic 官方博客宣布发起 **Glasswing 安全倡议**。

**参与方（12 家科技巨头）：**
- Amazon Web Services (AWS)
- Anthropic
- Apple
- Broadcom
- Cisco
- CrowdStrike
- Google
- JPMorganChase
- Linux Foundation
- Microsoft
- NVIDIA
- Palo Alto Networks

另有 **40+ 组织**也参与其中。

**投入规模：**
- Anthropic 承诺提供最高 **1 亿美元**的 Claude Mythos Preview 使用额度
- 另捐赠 **400 万美元**给开源安全组织

**目标：**
- 保护全球最关键的**基础软件**
- 利用 AI 能力发现和修复安全漏洞
- 建立行业级的软件安全协作机制

**行业意义：**
这是 AI 行业史上最大规模的安全协作，12 家科技巨头联手应对基础软件安全挑战。Anthropic 作为以安全为核心卖点的公司，通过 Glasswing 进一步巩固了其在 AI 安全领域的领导地位。

**背景：**
- Anthropic 此前因 Claude Code 源代码泄漏事件（近 3000 个内部文件、51.2 万行代码）面临安全信任危机
- Glasswing 可视为 Anthropic 重建安全信誉的重要举措
- 基础软件安全是整个科技行业的共同挑战

**对开发者的影响：**
- 开源安全项目将获得更多资源支持
- AI 驱动的安全审计工具将加速发展
- 基础软件的安全性有望显著提升`,
    date: "2026-04-14 10:00",
    source: "Anthropic 官方博客",
    sourceUrl: "https://www.anthropic.com/glasswing",
    href: "/news/news-093",
  },
  {
    id: "news-092",
    tag: "融资",
    tagColor: "bg-emerald-500/10 text-emerald-300",
    title: "OpenAI 完成 1220 亿美元融资，估值达 8520 亿美元创 AI 行业纪录",
    summary: "OpenAI 宣布完成最新一轮融资，募集 1220 亿美元承诺资本，投后估值高达 8520 亿美元，创 AI 行业融资纪录。",
    content: `

## OpenAI 史上最大融资

2026 年 4 月 14 日，OpenAI 官方宣布完成最新一轮融资。

**融资核心数据：**
- 承诺资本 **1220 亿美元**，远超市场预期
- 投后估值达 **8520 亿美元**，接近万亿美元
- 资金用于下一代模型研发和基础设施建设

**行业影响：**
- AI 行业的资本集中度进一步向头部公司倾斜
- 可能加速 AI 模型能力的代际跨越
- 与 Sam Altman 住宅遭袭事件同日，凸显行业紧张局势`,
    date: "2026-04-14 09:00",
    source: "OpenAI 官方博客",
    sourceUrl: "https://openai.com/index/accelerating-the-next-phase-ai/",
    href: "/news/news-092",
  },
  {
    id: "news-091",
    tag: "安全",
    tagColor: "bg-red-500/10 text-red-300",
    title: "Sam Altman 住宅遭二次袭击，FBI 以国内恐怖主义罪名调查",
    summary: "Sam Altman 住宅第二次遭 Molotov 鸡尾酒攻击，20 岁嫌疑人面临联邦'国内恐怖主义'指控，Altman 呼吁降低对抗情绪。",
    content: `

## AI 行业领袖安全危机升级

2026 年 4 月 13 日，Sam Altman 住宅再次遭袭。

**事件详情：**
- 住宅**第二次**遭 Molotov 鸡尾酒攻击
- 嫌疑人 Daniel Moreno-Gama，20 岁
- FBI 以**"国内恐怖主义"**罪名展开联邦调查

**Altman 回应：**
- 发布个人博客，呼吁**"降低对抗情绪"**
- 表示不希望事件伤害到家人

**深层忧虑：**
- AI 技术发展速度与社会接受度之间存在巨大鸿沟
- 技术领袖人身安全成为行业不可回避的问题`,
    date: "2026-04-14 08:00",
    source: "CBS News",
    sourceUrl: "https://www.cbsnews.com/video/sam-altman-says-we-should-deescalate-the-rhetoric-after-home-hit-with-molotov-cocktail/",
    href: "/news/news-091",
  },
  {
    id: "news-090",
    tag: "产品",
    tagColor: "bg-purple-500/10 text-purple-300",
    title: "Microsoft MAI 发布三个基础模型，正面挑战 OpenAI 和 Google",
    summary: "微软 MAI 团队发布语音转文字、音频生成和图像生成三个基础模型，成立仅 6 个月快速迭代。",
    content: `

## Microsoft 自建 AI 栈

2026 年 4 月 2 日，MAI Superintelligence 团队发布三款基础模型。

**三款模型：**
- **MAI-Transcribe-1**：25 语言语音转文字，速度快 2.5 倍，$0.36/小时
- **MAI-Voice-1**：1 秒生成 60 秒音频，支持自定义声音
- **MAI-Image-2**：文本到图像/视频生成，定价低于竞品

**战略意义：**
- Microsoft 计划 2027 年建立自研大模型体系
- 自研 + OpenAI 双轨策略，拥有更大灵活性
- 更低定价可能引发 AI API 价格战`,
    date: "2026-04-14 07:30",
    source: "TechCrunch",
    sourceUrl: "https://techcrunch.com/2026/04/02/microsoft-takes-on-ai-rivals-with-three-new-foundational-models/",
    href: "/news/news-090",
  },
  {
    id: "news-089",
    tag: "研究",
    tagColor: "bg-blue-500/10 text-blue-300",
    title: "MIT 用控制理论让 AI 模型学习时自我瘦身，推理成本大幅降低",
    summary: "MIT 研究人员利用控制理论在 AI 模型学习过程中去除不必要参数，使模型更轻量高效，为边缘设备部署提供新思路。",
    content: `

## AI 模型瘦身革命

2026 年 4 月 9 日，MIT 研究人员发表突破性成果。

**技术原理：**
- 使用**控制理论**在训练中动态评估参数重要性
- 自动**剔除不必要参数**，而非训练后剪枝
- 模型在"学习中瘦身"，保持性能

**核心优势：**
- **降低推理成本** -- 更少参数 = 更快推理
- **降低部署门槛** -- 精简模型易部署到边缘设备
- **保持性能** -- 比训练后剪枝影响更小

**行业意义：**
如果技术成熟，AI 行业经济模型可能改变——不需要越来越大的模型，而是更聪明的训练方法。`,
    date: "2026-04-14 07:00",
    source: "MIT Research",
    sourceUrl: "https://radicaldatascience.wordpress.com/2026/04/09/ai-news-briefs-bulletin-board-for-april-2026/",
    href: "/news/news-089",
  },
  {
    id: "news-088",
    tag: "行业",
    tagColor: "bg-amber-500/10 text-amber-300",
    title: "Amazon 证实 AI 已成数十亿美元级收入引擎，OpenAI 暗示零售合作",
    summary: "Amazon 首次确认 AI 业务达数十亿美元规模，OpenAI 暗示可能与 Amazon 在零售领域展开合作。",
    content: `

## AI 商业化里程碑

2026 年 4 月，AI 行业迎来重要的商业化确认。

**Amazon AI 收入：**
- 首次确认 AI 业务达**数十亿美元**规模
- AI 已从成本中心变为真正的收入引擎

**OpenAI × Amazon 合作：**
- OpenAI 暗示可能与 Amazon 在**零售领域**合作
- ChatGPT/GPT 模型或深度整合到 Amazon 电商生态

**行业意义：**
当 Amazon 这样的巨头确认 AI 收入规模，意味着 AI 技术已经进入主流商业应用的核心地带。`,
    date: "2026-04-14 06:30",
    source: "TechStartups",
    sourceUrl: "https://techstartups.com/2026/04/09/top-tech-news-today-april-9-2026/",
    href: "/news/news-088",
  },
  {
    id: "news-087",
    tag: "安全",
    tagColor: "bg-red-500/10 text-red-300",
    title: "OpenAI、Anthropic、Google 联合对抗中国模型抄袭",
    summary: "三大 AI 巨头罕见联手，试图遏制中国竞争对手从其模型中提取知识和技术。这是美国顶级 AI 公司首次合作应对中国 AI 崛起带来的挑战。",
    content: `![news-087](/images/news/security.jpg)

## 美国 AI 巨头罕见联手

2026 年 4 月 6 日，据 Bloomberg 报道，OpenAI、Anthropic 和 Google 开始合作打击中国竞争对手从美国 AI 模型中提取知识和技术。

**背景：**
- 中国 AI 公司通过蒸馏、数据提取等方式快速追赶美国模型
- DeepSeek 等中国模型在 LMSYS 基准测试中已接近美国顶尖水平
- 中美开放模型差距从 8% 缩小到 1.7%（斯坦福 AI Index 报告）

**合作方式：**
- 共享模型指纹和水印技术
- 协调应对知识提取攻击
- 推动行业标准和政策

**行业意义：**
- 这是美国顶级 AI 公司**首次联合**应对中国 AI 挑战
- 此前 OpenAI、Anthropic、Google 在模型竞赛中激烈竞争
- 但面对中国模型的快速崛起，它们选择了合作而非对抗

**全球格局影响：**
- 斯坦福 AI Index 报告显示中国在 AI 论文和专利申请数量上已超美国
- 但美国仍产出更多前沿模型（40 vs 15）
- 这一合作标志着 AI 领域的地缘政治竞争正在升温`,
    date: "2026-04-14 06:00",
    source: "Bloomberg / Yahoo Finance",
    sourceUrl: "https://www.bloomberg.com/news/articles/2026-04-06/openai-anthropic-google-unite-to-combat-model-copying-in-china",
    href: "/news/news-087",
  },
  {
    id: "news-086",
    tag: "硬件",
    tagColor: "bg-yellow-500/10 text-yellow-300",
    title: "Apple 计划推出 AI 眼镜挑战 Meta + AI Siri 升级 + Google 加密警告",
    summary: "Apple 计划推出 AI 眼镜与 Meta Ray-Ban 竞争，同时升级 AI Siri。Google 警告加密即将被 AI 破解，引发安全行业震动。",
    content: `

## AI 硬件竞赛升温

2026 年 4 月，AI 硬件领域出现多个重要动向。

**Apple AI 眼镜计划：**
- Apple 计划推出 **AI 眼镜**与 Meta 的 Ray-Ban AI 眼镜竞争
- 这是 Apple 进入可穿戴 AI 设备领域的重要一步
- Meta 的 Ray-Ban AI 眼镜产量已翻倍，市场反应积极

**AI Siri 升级：**
- 苹果 **AI Siri** 迎来重大升级（2026 年 4 月）
- 集成更强大的 AI 模型，提升语音助手能力
- 可能深度整合 Apple 生态

**Google 加密警告：**
- Google 警告**加密即将被 AI 破解**
- 这一警告引发了整个安全行业的震动
- AI 强大的计算能力可能威胁现有的加密体系
- 后量子加密迁移变得更加紧迫

**AI 硬件竞争格局：**
- **Meta**：Ray-Ban AI 眼镜 + Malibu 2 智能手表
- **Apple**：AI 眼镜（计划中） + AI Siri
- **Google**：Pixel 设备 AI 功能
- AI 正在从屏幕走向可穿戴设备

**安全行业震动：**
- 如果加密被 AI 破解，整个数字安全体系需要重建
- 企业需要加速迁移到后量子加密标准`,
    date: "2026-04-14 05:30",
    source: "YouTube / Google / 多方报道",
    sourceUrl: "https://www.youtube.com/watch?v=y0myLanQVVw",
    href: "/news/news-086",
  },
  {
    id: "news-085",
    tag: "融资",
    tagColor: "bg-purple-500/10 text-purple-300",
    title: "Meta 与 CoreWeave 签订 210 亿 AI 云计算协议 + Big Tech 年度 AI 支出 6500 亿",
    summary: "Meta 扩大与 CoreWeave 合作，签署 210 亿 AI 云计算协议。Big Tech 2026 年 AI 总支出预计 6500 亿，微软宣布 175 亿印度投资创亚洲记录。",
    content: `

## AI 基础设施投资狂潮

2026 年 4 月，AI 基础设施投资持续加速，各大科技公司纷纷宣布巨额投资计划。

**Meta + CoreWeave 210 亿协议：**
- Meta 扩大与 CoreWeave 的合作伙伴关系
- 签署 **210 亿** AI 云计算协议
- 更好地利用 AI 计算资源
- 此前 Meta 还与 Nebius Group 签署了五年数据中心合同

**Big Tech 年度 AI 支出：**
- 2026 年大型科技公司 AI 总支出预计达 **6,500 亿**
- 这是前所未有的基础设施投资规模

**其他重大投资：**
- **微软**：宣布 **175 亿** 亚洲最大投资，扩展印度 AI 和云基础设施（2026-2029）
- **OpenAI**：完成 **1,220 亿** 融资，估值 8,520 亿
- **Google**：2026 年资本支出 1,750-1,850 亿
- **Meta**：2026 年 AI 支出预计最高 1,350 亿

**数据中心热潮：**
- 全球 AI 数据中心已超过 **4,000 座**
- 但近半数规划项目因社区反对被推迟
- 核能成为首选能源方案

**行业趋势：**
- AI 投资正在从"模型层"向"基础设施层"延伸
- 算力成为 AI 竞争的核心要素
- 能源和土地成为 AI 扩张的新瓶颈`,
    date: "2026-04-14 05:00",
    source: "Bloomberg / Yahoo Finance / CNBC",
    sourceUrl: "https://finance.yahoo.com/video/meta-expands-coreweave-partnership-with-new-21b-ai-cloud-deal-194036393.html",
    href: "/news/news-085",
  },
  {
    id: "news-084",
    tag: "公司动态",
    tagColor: "bg-orange-500/10 text-orange-300",
    title: "Google I/O 2026 预告：Gemini AI 和 Android 17 即将揭晓",
    summary: "Google 宣布 I/O 2026 大会，预计发布 Gemini 重大更新和 Android 17。此前 4 月已发布 Gemini 3D 建模、Colab 学习模式、Gemini 笔记本等工具。",
    content: `

## Google I/O 2026：AI 生态全面升级

Google 宣布 I/O 2026 大会，预计将成为 AI 领域的年度重磅事件。

**I/O 2026 预期亮点：**
- **Gemini 重大更新** -- Google 的生成式 AI 系统已深度集成到整个产品生态
- **Android 17** -- 新一代 Android 系统，AI 功能将是大看点
- **AI 生态展示** -- Google 如何利用 AI 增强产品和服务

**Google 4 月 AI 密集发布回顾：**

| 产品 | 功能 | 发布日期 |
|------|------|----------|
| **Gemini 3D 建模** | 生成 3D 模型和图表 | 4 月 9 日 |
| **Colab Learn Mode** | 个人编码导师 | 4 月 8 日 |
| **Gemini Notebooks** | 项目管理笔记本 | 4 月 8 日 |
| **Search Live** | 全球扩展到 200+ 国家 | 4 月 |
| **Switch to Gemini** | 从 ChatGPT/Claude 导入 | 4 月 |

**Google 的 AI 战略投资：**
- Alphabet 2026 年资本支出预计 **1,750-1,850 亿美元**
- Gemini 已深度集成到 Gmail、Calendar、Drive 等核心产品
- 个人智能功能可自动从 Gmail/Calendar/Drive 提取洞察
- CEO Sundar Pichai 强调**"美国必须在 AI 领域领先"**

**竞争格局：**
- Google 正在构建从模型到工具到硬件的**完整 AI 生态**
- Switch to Gemini 直接挑战 ChatGPT 和 Claude 的用户锁定
- vibe coding 正在成为主流开发范式`,
    date: "2026-04-14 04:30",
    source: "National Today / Google Blog",
    sourceUrl: "https://nationaltoday.com/us/ca/mountain-view/news/2026/04/11/google-i-o-2026-announced-major-ai-and-android-reveals/",
    href: "/news/news-084",
  },
  {
    id: "news-083",
    tag: "安全",
    tagColor: "bg-red-500/10 text-red-300",
    title: "Anthropic 警告：AI 自主网络攻击开启网络安全新纪元",
    summary: "Anthropic 警告 AI 自主威胁标志网络安全军备竞赛进入新阶段，此前泄漏近 3000 个内部文件和 51.2 万行 Claude Code 源代码，发出 8000+ 版权删除通知。",
    content: `

## AI 网络安全新纪元

2026 年 4 月 10 日，Anthropic 发出警告：AI 自主网络攻击标志著网络安全进入全新阶段。

**Claude Code 源代码泄漏事件：**
- Anthropic 意外泄漏近 **3,000 个内部文件**
- 包含约 **512,000 行 Claude Code 源代码**（1,900 个文件）
- 泄漏版本为已删除的 **2.1.88 版本**（59.8MB 文件）
- 被迫发出 **8,000+ 版权删除通知**，涵盖 GitHub 仓库
- 后来缩减为仅 1 个仓库和 96 个 fork URL

**Mythos 模型泄漏：**
- 泄漏文件中包含一个名为 **Mythos** 的未发布模型描述
- 这是 Anthropic 尚未公开的新一代模型

**网络安全警告：**
- AI 自主威胁标志著 **AI 网络军备竞赛进入新阶段**
- 攻击者可以利用 AI 生成攻击脚本、深度伪造和自动化渗透工具
- 行业专家警告其他 AI 供应商的类似能力可能在数月内推出

**安全事件时间线：**
- 与国防部纠纷中获得**禁令胜诉**
- 70 天内密集发布 14+ 产品，但遭遇 **5 次宕机**
- 这是继国防部纠纷后的又一次重大安全事件

**行业影响：**
- 以安全为核心卖点的 Anthropic 遭遇安全危机，品牌信誉受损
- AI 代码安全成为行业焦点，开发者需要更严格的审查流程
- 自主 AI 攻击工具的崛起要求防御方也升级 AI 能力`,
    date: "2026-04-14 04:00",
    source: "Cyber News Centre / PCMag / LA Times / TechCrunch",
    sourceUrl: "https://www.pcmag.com/news/anthropic-issues-8000-copyright-takedowns-to-scrub-claude-code-leak",
    href: "/news/news-083",
  },
  {
    id: "news-082",
    tag: "研究",
    tagColor: "bg-green-500/10 text-green-300",
    title: "MIT 突破：控制理论让 AI 模型在学习过程中自我瘦身",
    summary: "MIT 研究人员利用控制理论在 AI 模型学习过程中自动剔除不必要参数，使模型更精简高效，有望大幅降低 AI 推理成本和部署门槛。",
    content: `

## AI 模型瘦身革命

2026 年 4 月 9 日，MIT 研究人员发表了一项突破性成果：利用控制理论让 AI 模型在学习过程中自动瘦身。

**技术原理：**
- 使用**控制理论**在训练过程中动态评估每个参数的重要性
- 自动识别并**剔除不必要的参数**，而非训练后剪枝
- 模型在"学习中瘦身"，保持性能的同时减少参数量

**核心优势：**
- **降低推理成本** -- 更少的参数意味着更快的推理速度和更低的算力需求
- **降低部署门槛** -- 精简模型更容易部署到边缘设备和移动端
- **保持性能** -- 与训练后剪枝相比，学习中瘦身对模型性能影响更小

**应用场景：**
- **边缘 AI** -- 在手机、IoT 设备上运行更强大的模型
- **成本优化** -- 企业可以大幅降低 AI API 调用成本
- **绿色 AI** -- 减少能源消耗，符合可持续发展目标

**行业背景：**
- 当前 AI 模型参数量越来越大（GPT-5.4 万亿级、Claude Mythos 10 万亿）
- 大模型推理成本高昂，限制了 AI 的广泛应用
- 模型压缩技术（量化、剪枝、知识蒸馏）一直是研究热点
- MIT 的方法提供了一种**端到端的参数优化**新思路

**意义：**
如果这项技术成熟，可能改变 AI 行业的经济模型——不需要越来越大的模型，而是需要更聪明的训练方法。`,
    date: "2026-04-14 03:30",
    source: "MIT Research / Radical Data Science",
    sourceUrl: "https://radicaldatascience.wordpress.com/2026/04/09/ai-news-briefs-bulletin-board-for-april-2026/",
    href: "/news/news-082",
  },
];
