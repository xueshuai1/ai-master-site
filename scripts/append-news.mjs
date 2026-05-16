import { readFileSync, writeFileSync } from 'fs';

const newsFile = 'src/data/news.ts';
let content = readFileSync(newsFile, 'utf-8');

// Remove trailing whitespace, then remove the closing `];`
content = content.trimEnd();
content = content.replace(/\];\s*$/, '');

const newNews = `
,
{
    id: "news-1877",
    tag: "行业",
    tagColor: "bg-yellow-500/10 text-yellow-300",
    title: "OpenAI 成立 DeployCo 部署公司：融资 40 亿美元并收购 Tomoro，全力进军企业市场",
    summary: "OpenAI 于 5 月 11 日正式宣布成立 OpenAI Deployment Company（DeployCo），获得 TPG、Brookfield 和贝恩资本超 40 亿美元投资，同时收购 AI 咨询公司 Tomoro，将约 150 名部署专家纳入麾下。",
    content: \`## OpenAI DeployCo：从模型公司到部署公司的战略转型

**2026 年 5 月 11 日**，OpenAI 官方博客 + AI Business 报道。

### 核心要点
- **40 亿美元融资**：TPG、Brookfield 和贝恩资本联合投资，目标打造 100 亿美元规模的企业 AI 部署业务
- **收购 Tomoro**：将约 150 名 AI 部署工程师和咨询专家整合到 DeployCo
- **贝恩资本深度绑定**：建立在 2023 年全球服务联盟基础上，进一步扩展合作关系
- **对标 Anthropic**：Anthropic 此前已成立类似的企业服务部门，两家公司的竞争从模型层延伸到部署层

### 战略意义

OpenAI 的 DeployCo 标志着 AI 行业从"拼模型性能"转向"拼落地能力"。企业客户不再只关心谁有更好的模型，而是谁能真正把 AI 集成到核心业务流程中并产生可衡量的商业价值。

**来源：** OpenAI Blog + AI Business
**链接：** https://openai.com/index/openai-launches-the-deployment-company/\`,
    date: "2026-05-16 16:00",
    source: "OpenAI Blog + AI Business",
    sourceUrl: "https://openai.com/index/openai-launches-the-deployment-company/",
    href: "/news/news-1877",
  },
{
    id: "news-1878",
    tag: "Agent",
    tagColor: "bg-purple-500/10 text-purple-300",
    title: "Google 内部测试 Remy：24/7 全天候个人 AI 智能体，可跨 Gmail、Calendar、Drive 自主操作",
    summary: "Google 正在内部测试代号为 Remy 的个人 AI 智能体，基于 Gemini 平台构建，能够代为执行邮件发送、会议安排、文档处理等日常任务。Google 已关闭此前浏览器智能体项目 Mariner，团队并入 Remy。",
    content: \`## Google Remy：个人 AI 智能体的全天候时代

**2026 年 5 月**，The Decoder + Digital Trends 报道。

### 核心能力
- **24/7 持续运行**：Remy 定位为全天候个人智能体，覆盖工作、学习和日常生活
- **跨应用操作**：可在 Gmail、Calendar、Docs、Drive、WhatsApp、Spotify 等应用间自主执行任务
- **Gemini 平台驱动**：基于 Google Gemini 大模型，深度整合 Google 生态系统
- **Mariner 团队并入**：Google 于 5 月 4 日关闭 Mariner 浏览器智能体项目，核心团队转向 Remy

### 行业背景

Google 的 Remy 和 Meta 的 Hatch 代表了科技巨头对个人 AI 智能体赛道的全面押注。此前 OpenClaw 的爆红证明了 320 万用户对"始终在线"AI 智能体的强烈需求，Google 和 Meta 正在快速跟进。

**来源：** The Decoder + Digital Trends
**链接：** https://the-decoder.com/google-and-meta-race-to-build-personal-ai-agents-as-anthropic-and-openai-pull-further-ahead/\`,
    date: "2026-05-16 16:00",
    source: "The Decoder + Digital Trends",
    sourceUrl: "https://the-decoder.com/google-and-meta-race-to-build-personal-ai-agents-as-anthropic-and-openai-pull-further-ahead/",
    href: "/news/news-1878",
  },
{
    id: "news-1879",
    tag: "Agent",
    tagColor: "bg-purple-500/10 text-purple-300",
    title: "Meta 推出 Hatch 个人 AI 助手：嵌入 Instagram，基于 Claude 运行，Q4 前全面上线",
    summary: "Meta 正在开发代号为 Hatch 的消费级 AI 智能体，目前运行在 Anthropic Claude 模型上，计划后续切换至自研 Muse Spark 模型。Hatch 将首先作为 Instagram 购物工具推出，预计 2026 年第四季度前上线。",
    content: \`## Meta Hatch：Instagram 里的 AI 购物助手

**2026 年 5 月**，CNBC + Financial Times 报道。

### 核心信息
- **Instagram 内置**：Hatch 将嵌入 Instagram 平台，面向 20 亿 + 用户提供 AI 智能体服务
- **购物场景先行**：首个落地场景是 Instagram 购物工具，帮助用户发现和购买产品
- **Claude 过渡，Muse Spark 终态**：当前基于 Anthropic Claude 运行，计划切换至 Meta 自研 Muse Spark 模型
- **内部测试中**：目标在 2026 年 Q4 前完成内部测试并正式上线

### 战略考量

Meta 的 Hatch 策略与 Google Remy 形成差异化：Google 聚焦跨应用的全天候助手，Meta 选择从社交媒体购物场景切入。两条路径代表了个人 AI 智能体的两种主流形态。

**来源：** CNBC + Financial Times
**链接：** https://www.cnbc.com/2026/05/08/ai-agent-meta-google-agentic-wars-tech-download.html\`,
    date: "2026-05-16 16:00",
    source: "CNBC + Financial Times",
    sourceUrl: "https://www.cnbc.com/2026/05/08/ai-agent-meta-google-agentic-wars-tech-download.html",
    href: "/news/news-1879",
  },
{
    id: "news-1880",
    tag: "政策",
    tagColor: "bg-red-500/10 text-red-300",
    title: "五角大楼签署 8 份机密 AI 合作协议：Anthropic 因拒绝修改安全限制被排除在外",
    summary: "美国国防部与 OpenAI、Google、Microsoft、AWS、Nvidia、SpaceX、Oracle 和 Reflection AI 签署机密级别 AI 合作协议，覆盖 IL6/IL7 网络环境。Anthropic 因拒绝修改其使用限制条款而成为唯一被排除的前沿实验室。",
    content: \`## 五角大楼 AI 合作：8 家入选，Anthropic 出局

**2026 年 5 月 1 日**，CNN + DefenseScoop 报道。

### 合作详情
- **8 家入选公司**：OpenAI、Google、Microsoft、AWS、Nvidia、SpaceX、Oracle、Reflection AI
- **机密级别**：覆盖 IL6（机密级）和 IL7（绝密级）网络环境，用于最敏感的军事行动
- **Anthropic 被排除**：因拒绝同意"任何合法用途"条款，被视为供应链风险
- **9000 亿估值落差**：Anthropic 估值高达 9000 亿美元，却是唯一落选的前沿实验室

### 深层影响

这一事件凸显了 AI 安全伦理与国防需求之间的根本冲突。Anthropic 坚持其宪法 AI 原则，拒绝将其模型用于不受限制的军事场景，而五角大楼选择了愿意放宽限制的竞争对手。这可能成为 AI 伦理争议的标志性案例。

**来源：** CNN + DefenseScoop
**链接：** https://www.cnn.com/2026/05/01/tech/pentagon-ai-anthropic\`,
    date: "2026-05-16 16:00",
    source: "CNN + DefenseScoop",
    sourceUrl: "https://www.cnn.com/2026/05/01/tech/pentagon-ai-anthropic",
    href: "/news/news-1880",
  },
{
    id: "news-1881",
    tag: "芯片",
    tagColor: "bg-orange-500/10 text-orange-300",
    title: "Nvidia AI 投资规模突破 400 亿美元：从芯片巨头到 AI 生态投资帝国的蜕变",
    summary: "CNBC 报道显示，Nvidia 在 2026 年的 AI 相关股权投资已超过 400 亿美元，覆盖 Figure AI 等人形机器人公司。Nvidia 正从单一芯片供应商转型为 AI 生态系统的核心投资者和整合者。",
    content: \`## Nvidia：400 亿美金押注 AI 生态

**2026 年 5 月 9 日**，CNBC 报道。

### 投资版图
- **400 亿美元承诺**：2026 年内 AI 相关股权投资总额超过 400 亿美元
- **Figure AI 参投**：参与 Figure AI 超 10 亿美元的 C 轮融资，该公司估值达 390 亿美元
- **人形机器人布局**：投资覆盖多家人形机器人和物理 AI 公司
- **生态战略**：从芯片供应商转型为 AI 生态整合者，构建从硬件到应用的完整闭环

### 行业影响

Nvidia 的 400 亿美元投资规模显示，AI 基础设施的竞争已从技术竞赛升级为资本竞赛。通过投资锁定下游客户和合作伙伴，Nvidia 正在构建一个难以被替代的 AI 生态护城河。

**来源：** CNBC
**链接：** https://www.cnbc.com/2026/05/09/nvidia-embraces-ai-investor-topping-40-billion-in-equity-bets-2026.html\`,
    date: "2026-05-16 16:00",
    source: "CNBC",
    sourceUrl: "https://www.cnbc.com/2026/05/09/nvidia-embraces-ai-investor-topping-40-billion-in-equity-bets-2026.html",
    href: "/news/news-1881",
  },
{
    id: "news-1882",
    tag: "行业",
    tagColor: "bg-yellow-500/10 text-yellow-300",
    title: "1X Technologies 开设人形机器人工厂：年产 1 万台，OpenAI 和 Nvidia 联合支持的消费级机器人",
    summary: "1X Technologies 于 5 月 1 日在加州海沃德开设 58,000 平方英尺的人形机器人工厂，目标年产 1 万台 NEO 机器人，2027 年底达 10 万台。2 万美元的消费级机器人首日 5 天售罄全年产能，由 OpenAI 投资、Nvidia Jetson Thor 驱动。",
    content: \`## 1X NEO：消费级人形机器人元年

**2026 年 5 月 1 日**，Business20Channel 报道。

### 关键数据
- **工厂规模**：58,000 平方英尺，位于加州海沃德
- **产能规划**：第一年 1 万台，2027 年底目标 10 万台
- **定价策略**：2 万美元的消费级定价，首批全年产能 5 天售罄
- **技术底座**：OpenAI 投资支持，Nvidia Jetson Thor 芯片驱动

### 行业意义

1X NEO 的成功标志着人形机器人正式从工业场景走向消费市场。2 万美元的定价低于多数高端汽车，但 5 天售罄全年产能说明市场需求远超预期。2026 年可能是消费级人形机器人的元年。

**来源：** Business20Channel
**链接：** https://business20channel.tv/1x-technologies-factory-2026-100000-humanoid-robots-target-r-2-may-2026\`,
    date: "2026-05-16 16:00",
    source: "Business20Channel",
    sourceUrl: "https://business20channel.tv/1x-technologies-factory-2026-100000-humanoid-robots-target-r-2-may-2026",
    href: "/news/news-1882",
  },
{
    id: "news-1883",
    tag: "行业",
    tagColor: "bg-yellow-500/10 text-yellow-300",
    title: "Skild AI 收购斑马技术机器人业务：整合 Fetch Robotics，打造端到端 AI 仓储自动化平台",
    summary: "Skild AI 收购 Zebra Technologies 的机器人自动化业务，吸收 Symmetry Fulfillment 编排平台和 Fetch Robotics，创建首个 AI 原生的端到端仓储自动化栈，涵盖人形机器人、AMR、机械臂和统一编排系统。",
    content: \`## Skild AI 收购：AI 原生仓储自动化的里程碑

**2026 年 5 月**，Airstreet Press 报道。

### 收购内容
- **Symmetry Fulfillment 平台**：仓储物流编排系统的核心组件
- **Fetch Robotics**：知名的自主移动机器人（AMR）制造商
- **统一技术栈**：人形机器人 + AMR + 机械臂 + AI 编排系统，首次整合到单一平台

### 战略价值

Skild AI 的收购标志着仓储自动化从"单一机器人解决方案"向"AI 原生全栈自动化"的范式转变。通过整合多种机器人形态和统一编排，企业可以实现从入库到出库的完全 AI 驱动物流流程。

**来源：** Airstreet Press
**链接：** https://press.airstreet.com/p/state-of-ai-may-2026\`,
    date: "2026-05-16 16:00",
    source: "Airstreet Press",
    sourceUrl: "https://press.airstreet.com/p/state-of-ai-may-2026",
    href: "/news/news-1883",
  },
{
    id: "news-1884",
    tag: "大语言模型",
    tagColor: "bg-blue-500/10 text-blue-300",
    title: "智谱 GLM-5.1 发布：支持 8 小时长程自主任务执行，编码能力逼近 Claude Opus 4.6",
    summary: "智谱 AI 发布 GLM-5.1 模型升级版，重点提升长程任务执行能力，单次任务可持续自主工作 8 小时，完成规划、执行、测试到修复交付的完整流程。在 Claude Code 编码评测中达到 Opus 4.6 的 94.6%，开源模型编码能力最快逼近闭源头部模型。",
    content: \`## GLM-5.1：8 小时自主智能体的里程碑

**2026 年 5 月**，智谱 AI 官方文档 + 腾讯云开发者社区报道。

### 技术突破
- **8 小时持续执行**：相较于分钟级交互的主流模型，GLM-5.1 可单次自主工作长达 8 小时
- **编码能力 94.6%**：在 Claude Code 评测中达到 Opus 4.6 的 94.6%，开源最快逼近闭源
- **完整工作流闭环**：从任务规划、代码执行、自动化测试到修复和交付的完整流程
- **Agentic Engineering 升级**：延续 GLM-5 的智能体工程方向，进一步增强长程任务能力

### 行业定位

GLM-5.1 的发布进一步强化了智谱在国产大模型中的"全能旗舰"定位。744B 参数、200K 上下文、8 小时自主执行，这些指标使 GLM-5.1 成为国产模型中面向复杂工程任务的最强选手。

**来源：** 智谱 AI + 腾讯云
**链接：** https://docs.bigmodel.cn/cn/guide/models/text/glm-5.1\`,
    date: "2026-05-16 16:00",
    source: "智谱 AI + 腾讯云开发者社区",
    sourceUrl: "https://docs.bigmodel.cn/cn/guide/models/text/glm-5.1",
    href: "/news/news-1884",
  },
{
    id: "news-1885",
    tag: "行业",
    tagColor: "bg-yellow-500/10 text-yellow-300",
    title: "IBM Think 2026 发布「AI 运营模式」蓝图：智能体编排、数据底座与混合云管理三位一体",
    summary: "IBM Think 2026 大会上发布全新「AI 运营模式」蓝图，涵盖智能体编排与开发工具、实时 AI 数据底座、AI 驱动混合云管理三大支柱，为企业提供统一规划、构建、部署和治理 AI 智能体的完整框架。",
    content: \`## IBM Think 2026：AI 运营模式的系统级蓝图

**2026 年 5 月 7 日**，IBM 中国新闻稿报道。

### 三大支柱
- **智能体编排与开发工具**：统一的智能体规划、构建、部署及治理平台
- **实时 AI 数据底座**：受治理、互联互通的信息基础架构，保障智能体快速响应
- **AI 驱动混合云管理**：打通混合环境下的基础设施、安全与运维

### 战略意义

IBM 的 AI 运营模式蓝图代表了企业 AI 从"单点应用"向"体系化运营"的演进方向。当 AI 智能体成为企业基础设施的一部分时，如何统一管理、编排和治理这些智能体，将成为企业 AI 成熟度的核心衡量标准。

**来源：** IBM
**链接：** https://china.newsroom.ibm.com/2026-05-07-Think-2026-IBM-AI-,-AI\`,
    date: "2026-05-16 16:00",
    source: "IBM",
    sourceUrl: "https://china.newsroom.ibm.com/2026-05-07-Think-2026-IBM-AI-,-AI",
    href: "/news/news-1885",
  },
{
    id: "news-1886",
    tag: "开源项目",
    tagColor: "bg-green-500/10 text-green-300",
    title: "AgentMemory 开源发布：基于真实世界基准测试的 AI 编程智能体持久化内存系统",
    summary: "开发者 rohitg00 发布 AgentMemory 开源项目，为 AI 编程智能体提供基于真实世界基准测试的持久化内存解决方案，解决智能体在多轮任务和长时间对话中的上下文记忆丢失问题。",
    content: \`## AgentMemory：给 AI 编程智能体装上持久记忆

**2026 年 5 月 15 日**，GitHub Trending + AIToolly 报道。

### 核心功能
- **持久化记忆**：AI 编程智能体在会话间保持上下文和任务状态
- **真实基准测试**：基于真实世界场景验证的记忆系统有效性
- **多轮任务支持**：解决智能体在长链条任务中的记忆衰减和上下文丢失

### 开发者意义

随着 AI 编程智能体（如 Claude Code、OpenClaw）成为主流开发工具，持久化记忆是提升智能体协作效率的关键基础设施。AgentMemory 的开源为社区提供了一个标准化解决方案。

**来源：** GitHub Trending + AIToolly
**链接：** https://github.com/rohitg00/AgentMemory\`,
    date: "2026-05-16 16:00",
    source: "GitHub Trending + AIToolly",
    sourceUrl: "https://github.com/rohitg00/AgentMemory",
    href: "/news/news-1886",
  },
{
    id: "news-1887",
    tag: "大语言模型",
    tagColor: "bg-blue-500/10 text-blue-300",
    title: "Anthropic 企业客户数首次超越 OpenAI：34.4% vs 32.3%，Ramp AI 指数确认行业格局变化",
    summary: "Ramp AI 指数最新数据显示，Anthropic 在企业客户数量上首次超越 OpenAI（34.4% vs 32.3%），标志着 Claude 在企业 AI 市场的崛起。与此同时 OpenAI 通过 DeployCo 加速追赶，两大巨头的企业市场竞争进入白热化。",
    content: \`## Anthropic 超越 OpenAI：企业客户数的历史性转折

**2026 年 5 月**，Ramp AI Index 报道。

### 数据对比
- **Anthropic 34.4%**：企业客户采用率首次超过 OpenAI
- **OpenAI 32.3%**：尽管在绝对收入上仍有优势，但客户增速放缓
- **Ramp AI 指数**：基于 5000+ 企业用户的真实采购数据分析

### 格局变化

Anthropic 的超越主要得益于其在企业安全和合规方面的优势。Claude 在安全评估和可控输出方面的表现，使其成为金融、医疗等敏感行业的首选。而 OpenAI 通过 DeployCo 的成立，正在从模型层向部署层延伸，试图重建竞争优势。

**来源：** Ramp AI Index
**链接：** https://ramp.com/research/ai-index\`,
    date: "2026-05-16 16:00",
    source: "Ramp AI Index",
    sourceUrl: "https://ramp.com/research/ai-index",
    href: "/news/news-1887",
  },
{
    id: "news-1888",
    tag: "芯片",
    tagColor: "bg-orange-500/10 text-orange-300",
    title: "WIRobotics 获 6800 万美元 B 轮融资：加速人形机器人与物理 AI 开发，JB Investment 领投",
    summary: "日本机器人公司 WIRobotics 完成 6800 万美元 B 轮融资，由 JB Investment 领投，资金将用于人形机器人硬件迭代和物理 AI 算法研发，加速从实验室原型到商业化产品的进程。",
    content: \`## WIRobotics：6800 万美元押注人形机器人

**2026 年 5 月**，InforCapital 报道。

### 融资信息
- **6800 万美元 B 轮**：JB Investment 领投，多家 VC 跟投
- **资金用途**：人形机器人硬件迭代 + 物理 AI 算法研发
- **商业化加速**：从实验室原型向规模化商业产品过渡

### 行业趋势

WIRobotics 的融资反映了全球人形机器人赛道的持续升温。2026 年全球人形机器人公司融资总额已超 81 亿美元，覆盖 100+ 家公司。从 Figure AI 的 390 亿美元估值到 1X 的 2 万美元消费级机器人，人形机器人正从概念验证走向商业现实。

**来源：** InforCapital
**链接：** https://inforcapital.com/news/wirobotics-about-68-million-series-b-raised-to-advance-humanoid-robotics-and-physical-ai/\`,
    date: "2026-05-16 16:00",
    source: "InforCapital",
    sourceUrl: "https://inforcapital.com/news/wirobotics-about-68-million-series-b-raised-to-advance-humanoid-robotics-and-physical-ai/",
    href: "/news/news-1888",
  }
];
`;

const result = content + newNews;
writeFileSync(newsFile, result, 'utf-8');

// Count new articles
const count = (newNews.match(/id: "news-/g) || []).length;
console.log(`Appended ${count} new articles (news-1877 ~ news-1888)`);
console.log(`File size: ${(result.length / 1024).toFixed(1)} KB`);
