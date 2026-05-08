const fs = require('fs');
const path = require('path');

const newsFile = path.join(__dirname, '../src/data/news.ts');
let content = fs.readFileSync(newsFile, 'utf8');

const newItems = `  {
    id: "news-1089",
    tag: "Agent",
    title: "Meta 秘密开发个性化 AI 助手 \"Hatch\"，拟服务 35 亿用户",
    summary: "据金融时报报道，Meta 正在开发一款名为 \"Hatch\" 的个性化 AI 代理助手，能够为用户自动化完成日常任务，覆盖其 35 亿社交平台用户。该助手据称由 Meta 的 Muse Spark 模型驱动。",
    content: \`Meta 正悄悄布局消费级 Agentic AI 领域，试图为旗下社交平台的数十亿用户配备能自动执行日常任务的 AI 代理。

### 核心信息

- **代号**：Hatch
- **驱动模型**：Muse Spark
- **目标用户**：35 亿社交平台用户
- **功能定位**：个性化代理，能代表用户执行任务而非仅回答问题
- **购物场景**：据 The Information 报道，Meta 计划在 2026 年 Q4 前在 Instagram 推出代理式购物工具

### 行业背景

- 类似 OpenClaw（OpenAI 开源自主 AI 代理）的定位
- Meta 同时在进行大规模裁员，为 AI 投资腾出资金
- 收购 Assured Robot Intelligence 加速人形机器人布局

**来源：** Financial Times + Reuters + India Today
**链接：** https://www.reuters.com/business/meta-plans-advanced-agentic-ai-assistant-users-ft-reports-2026-05-05/\`,
    date: "2026-05-08 00:00",
    source: "Financial Times + Reuters + India Today",
    sourceUrl: "https://www.reuters.com/business/meta-plans-advanced-agentic-ai-assistant-users-ft-reports-2026-05-05/",
    href: "/news/news-1089",
  },
  {
    id: "news-1090",
    tag: "政策",
    title: "美国参议院司法委员会一致通过 GUARD 法案：禁止未成年人使用 AI 情感陪伴聊天机器人",
    summary: "美国参议院司法委员会以 22-0 的投票结果一致通过 GUARD 法案，要求 AI 聊天机器人服务商验证用户年龄，禁止向未成年人提供 AI 情感陪伴服务，并对涉及未成年人的不当交互施加刑事处罚。",
    content: \`美国 AI 监管迈出实质性一步。

### 法案要点

- **年龄验证**：现有账户和新账户均需进行合理的年龄验证
- **禁止未成年陪伴**：禁止向未成年人提供 AI 情感陪伴聊天机器人
- **刑事处罚**：对明知故犯的企业施加刑事处罚
- **非人类身份披露**：AI 聊天机器人必须向用户披露其非人类和非专业身份
- **18 位跨党派联署**：参议员 Josh Hawley 和 Richard Blumenthal 牵头

### 各方反应

- **支持方**：RAINN 等儿童保护组织背书
- **批评方**：Cato 研究所指出法案缺少家长同意选项，剥夺了家长的选择权
- **企业影响**：AI 陪伴平台需紧急实施年龄验证和内容审核系统

**来源：** TIME + Senate.gov + Roll Call
**链接：** https://time.com/7328967/ai-josh-hawley-richard-blumenthal-minors-chatbots/\`,
    date: "2026-05-08 00:00",
    source: "TIME + Senate.gov + Roll Call",
    sourceUrl: "https://time.com/7328967/ai-josh-hawley-richard-blumenthal-minors-chatbots/",
    href: "/news/news-1090",
  },
  {
    id: "news-1091",
    tag: "大语言模型",
    title: "中国四大 AI 实验室 12 天内密集发布开源代码模型，Agentic 编程能力逼近西方前沿",
    summary: "智谱 GLM-5.1、MiniMax M2.7、月之暗面 Kimi K2.6 和 DeepSeek V4 在两周内相继发布，均以显著低于西方前沿模型的成本实现了接近的 Agentic 编程能力。NIST 评估显示 DeepSeek V4-Pro 在跨领域基准上落后美国前沿约 8 个月。",
    content: \`中国开源 AI 模型进入密集爆发期。

### 四大模型对比

| 模型 | 发布方 | 参数 | 许可证 | 特点 |
|------|--------|------|--------|------|
| GLM-5.1 | Z.ai（智谱） | 754B | MIT | 10 万张昇腾 910B 训练，零 NVIDIA |
| Kimi K2.6 | 月之暗面 | 1T | Modified MIT | 每 token 激活 32B，成本更低 |
| MiniMax M2.7 | MiniMax | - | - | 自我进化 Agent 模型 |
| DeepSeek V4 | DeepSeek | - | - | 100 万 token 上下文 |

### 关键数据

- **NL2Repo 基准**：GLM-5.1 得分 42.7%，超越 Claude Opus 4.6（33.4%）和 GPT-5.4（41.3%）
- **成本优势**：Kimi K2.6 输入 \$0.60/M token，比 GLM-5.1 便宜约 43%
- **NIST 评估**：DeepSeek V4-Pro 在跨领域基准上落后美国前沿约 8 个月
- **四强横评**：GPT-5.5、DeepSeek V4-Pro、GLM-5.1、MiniMax M2.7 同台竞争

**来源：** CSDN + 腾讯云 + Unite AI + NIST
**链接：** https://hwcomputing.csdn.net/69ecd54d0a2f6a37c5a61484.html\`,
    date: "2026-05-07 00:00",
    source: "CSDN + 腾讯云 + Unite AI + NIST",
    sourceUrl: "https://hwcomputing.csdn.net/69ecd54d0a2f6a37c5a61484.html",
    href: "/news/news-1091",
  },
  {
    id: "news-1092",
    tag: "行业",
    title: "OpenAI 与微软重构 130 亿美元合作：结束排他性，GPT-5.5 登陆 AWS Bedrock",
    summary: "OpenAI 与微软宣布修改合作条款，结束 Azure 独家云服务绑定，允许 OpenAI 在任意云平台提供服务。作为新协议的一部分，GPT-5.5 现已在 AWS Bedrock 上线，微软保留 IP 许可至 2032 年但不再独家。",
    content: \`AI 行业最具影响力的商业合作迎来重大转折。

### 核心变化

- **结束排他性**：OpenAI 可在任意云平台提供服务
- **微软仍为主云伙伴**：OpenAI 产品优先在 Azure 上线（除非微软无法支持）
- **IP 许可**：微软保留至 2032 年的非独家 IP 许可
- **收入分成封顶**：OpenAI 向微软支付的分成为固定上限
- **微软不再支付收入分成**：从 OpenAI 获得收入分成的模式取消

### 影响分析

- OpenAI Revenue 主管称原协议 "限制了我们在企业市场的能力"
- GPT-5.5 已在 Microsoft Foundry 上线
- 缓解英国、美国、欧洲反垄断审查压力
- 6 个月内第二次修改协议（上次为 2025 年 10 月重组）

**来源：** CNBC + Reuters + Forbes + The Verge
**链接：** https://www.cnbc.com/2026/04/27/openai-microsoft-partnership-revenue-cap.html\`,
    date: "2026-05-06 00:00",
    source: "CNBC + Reuters + Forbes + The Verge",
    sourceUrl: "https://www.cnbc.com/2026/04/27/openai-microsoft-partnership-revenue-cap.html",
    href: "/news/news-1092",
  },
  {
    id: "news-1093",
    tag: "芯片",
    title: "Meta 发布四代 MTIA 自研 AI 芯片路线图：MTIA 300 至 500 两年内依次部署",
    summary: "Meta 公布四代自研 AI 加速芯片 MTIA 300/400/450/500 的详细路线图，约每六个月推出新一代。MTIA 400 是首款声称成本低于且性能对标英伟达/AMD 商业产品的芯片，MTIA 500 采用 2x2 计算芯片块 + HBM 架构。",
    content: \`Meta 正加速摆脱对英伟达的依赖。

### 芯片路线图

- **MTIA 300**：已部署，面向小型模型训练（排名与推荐）
- **MTIA 400**：2026 年内，生成式 AI + 排名推荐，72 芯片级联，首款成本效益芯片
- **MTIA 450**：2026-2027，推理优化
- **MTIA 500**：2027，2x2 计算芯片块 + HBM 堆叠 + 网络芯片块

### 战略意义

- 与 Broadcom 合作，使用台积电 2nm 工艺
- 1 GW 部署规模，2027 年扩展至多 GW
- HBM 内存带宽是推理性能的关键约束
- 加入 Google TPU、AWS Inferentia/Trainium、Microsoft Maia 的超大规模自研芯片阵营

**来源：** Meta Blog + CNBC + Tom's Hardware
**链接：** https://ai.meta.com/blog/meta-mtia-scale-ai-chips-for-billions/\`,
    date: "2026-05-05 00:00",
    source: "Meta Blog + CNBC + Tom's Hardware",
    sourceUrl: "https://ai.meta.com/blog/meta-mtia-scale-ai-chips-for-billions/",
    href: "/news/news-1093",
  },
  {
    id: "news-1094",
    tag: "行业",
    title: "Anthropic 联合高盛、黑石设立 15 亿美元 AI 企业落地基金，聚焦私募股权控股公司",
    summary: "Anthropic 宣布与高盛、黑石等华尔街巨头共同成立 15 亿美元新机构，将 Claude AI 模型直接部署到企业内部，首批落地对象为上述投资机构控股的数百家企业。该举措旨在解决 AI 落地专业人才极度稀缺的瓶颈。",
    content: \`Anthropic 找到了一条独特的 AI 商业化路径。

### 基金结构

- **规模**：15 亿美元
- **合伙人**：Anthropic、高盛、黑石、阿波罗全球管理、泛大西洋投资等
- **目标**：加速数百家企业落地应用 AI 技术
- **首批对象**：上述投资机构控股的企业

### 行业意义

- 解决 AI 行业核心瓶颈：懂技术且能落地的人才极度稀缺
- 类似 OpenAI 的 The Deployment Company（40 亿美元融资）
- 与 PwC 合作将 Agentic AI 带入财务团队
- Anthropic 同时面临五角大楼 "供应链风险" 封杀（损失数十亿美元国防合同）

**来源：** PYMNTS + Washington Post
**链接：** https://www.pymnts.com/artificial-intelligence-2/2026/anthropic-launches-enterprise-ai-firm-with-wall-street-giants/\`,
    date: "2026-05-05 00:00",
    source: "PYMNTS + Washington Post",
    sourceUrl: "https://www.pymnts.com/artificial-intelligence-2/2026/anthropic-launches-enterprise-ai-firm-with-wall-street-giants/",
    href: "/news/news-1094",
  },
  {
    id: "news-1095",
    tag: "芯片",
    title: "OpenAI 与博通 1800 亿美元芯片豪赌：首期 180 亿美元，博通先行出资",
    summary: "OpenAI 与博通去年秋天宣布的定制 AI 芯片合作正进入实质性阶段。两家公司正在谈判由博通为第一阶段（1.3 GW 数据中心容量、约 180 亿美元）提供资金，旨在减少对英伟达昂贵硬件的依赖。目标是在 2030 年前上线消耗 10 GW 电力的足够芯片。",
    content: \`AI 行业最大规模的芯片对赌正在成型。

### 交易结构

- **总规模**：2030 年前消耗 10 GW 电力（相当于五个胡佛水坝）
- **首期**：1.3 GW 数据中心容量，约 180 亿美元
- **资金方**：博通为第一阶段先行出资
- **目标**：减少 OpenAI 对英伟达硬件的依赖

### 行业背景

- 英伟达 B300 服务器在中国价格翻倍至约 700 万元人民币（100 万美元）
- 微软采购承诺仍未落地，成为合作不确定因素
- OpenAI 同时在 AWS Bedrock 上线 GPT-5.5（脱离 Azure 独家）

**来源：** PYMNTS + 新浪科技
**链接：** https://finance.sina.com.cn/stock/usstock/c/2026-05-08/doc-inhxewcz7580729.shtml\`,
    date: "2026-05-08 00:00",
    source: "PYMNTS + 新浪科技",
    sourceUrl: "https://finance.sina.com.cn/stock/usstock/c/2026-05-08/doc-inhxewcz7580729.shtml",
    href: "/news/news-1095",
  },
  {
    id: "news-1096",
    tag: "应用",
    title: "Microsoft Agent 365 正式 GA：将身份、安全和治理工具扩展至企业 AI 代理",
    summary: "微软于 5 月 2 日正式推出 Agent 365，为跨企业环境的 AI 代理提供身份、安全和治理工具。与此同时，Cursor 的 Agents Window 和 Claude Code 的多代理编排也在同期发布，Agentic AI 已从功能特性变为企业期望。",
    content: \`AI 代理管理进入企业级时代。

### Agent 365 功能

- **身份管理**：为 AI 代理提供企业级身份认证
- **安全治理**：统一的 AI 代理安全策略
- **跨环境部署**：支持多平台 AI 代理管理

### 行业趋势

- **Agentic AI 已成期望**：问题不再是工具是否支持 Agent，而是如何治理它们
- **推理成本暴跌**：Gemini 3.1 Flash-Lite 仅 \$0.25/M 输入 token，DeepSeek V4 为 \$0.27/M
- **开源不再第二梯队**：Mistral 128B、Qwen、GLM-4.7 正在缩小与 GPT-5.5 和 Claude Opus 的差距
- **xAI 降价**：Agent 工具调用定价降低 50%

**来源：** AIToolsRecap + Microsoft
**链接：** https://aitoolsrecap.com/blog/ai-news-may-2026\`,
    date: "2026-05-05 00:00",
    source: "AIToolsRecap + Microsoft",
    sourceUrl: "https://aitoolsrecap.com/blog/ai-news-may-2026",
    href: "/news/news-1096",
  },
  {
    id: "news-1097",
    tag: "芯片",
    title: "特斯拉完成下一代 AI5 芯片流片：为 Optimus 机器人和超级计算机打造，台积电三星美国制造",
    summary: "特斯拉完成下一代 AI5 芯片的流片（tape-out），该芯片专为 Optimus 人形机器人和超级计算机设计，由台积电和三星在美国本土生产。这标志着特斯拉在 AI 芯片自主化道路上的重要里程碑。",
    content: \`特斯拉的 AI 芯片战略迈出关键一步。

### AI5 芯片

- **用途**：Optimus 人形机器人 + 超级计算机
- **制造方**：台积电 + 三星
- **生产地**：美国本土
- **阶段**：已完成流片（tape-out）

### 行业背景

- 特斯拉正加速 AI 硬件垂直整合
- Optimus 机器人商业化进程推进
- 美国本土芯片制造受 CHIPS Act 2.0 政策推动

**来源：** AIToolsRecap
**链接：** https://aitoolsrecap.com/Blog/tesla-ai5-chip-tape-out-optimus-robots-supercomputers\`,
    date: "2026-05-07 00:00",
    source: "AIToolsRecap",
    sourceUrl: "https://aitoolsrecap.com/Blog/tesla-ai5-chip-tape-out-optimus-robots-supercomputers",
    href: "/news/news-1097",
  },
  {
    id: "news-1098",
    tag: "大语言模型",
    title: "Google Gemini 3.1 Ultra 发布：200 万 token 原生多模态上下文窗口 + 沙盒代码执行",
    summary: "Google 发布 Gemini 3.1 Ultra，支持 200 万 token 的原生多模态上下文窗口（文本、图像、音频、视频无需转录中间件），并附带沙盒化代码执行工具，让模型能在对话中直接编写和运行代码。",
    content: \`Google 在基础设施层面的重磅更新。

### 核心能力

- **200 万 token 上下文**：原生支持文本、图像、音频、视频
- **无需转录中间件**：多模态直接处理
- **沙盒代码执行**：模型可在对话中编写并运行代码
- **Gemini 3.1 Flash-Lite**：推理成本降至 \$0.25/M 输入 token

### 行业影响

- 上下文窗口竞赛进入新量级（此前主流为 100 万 token）
- 沙盒执行降低 AI 编程工具的安全风险
- 推理成本持续下降，非前端任务不再需要支付前沿价格

**来源：** AIToolsRecap + Google
**链接：** https://aitoolsrecap.com/blog/ai-news-may-2026\`,
    date: "2026-05-04 00:00",
    source: "AIToolsRecap + Google",
    sourceUrl: "https://aitoolsrecap.com/blog/ai-news-may-2026",
    href: "/news/news-1098",
  },
  {
    id: "news-1099",
    tag: "开源项目",
    title: "Mistral 发布 128B 旗舰模型，开源阵营正面挑战 GPT-5.5 与 Claude Opus",
    summary: "Mistral 发布 128B 参数旗舰模型，标志着开源/开放权重模型正式进入与 GPT-5.5 和 Claude Opus 正面竞争的阶段。结合 Qwen、GLM-4.7 等模型，开源生态在多类工作负载上已接近闭源前沿水平。",
    content: \`开源 AI 模型正在改写行业规则。

### Mistral 128B

- **参数量**：128B
- **定位**：旗舰级开放权重模型
- **目标**：在多种工作负载上对标 GPT-5.5 和 Claude Opus

### 开源生态全景

- **GLM-4.7**：训练于华为昇腾芯片，\$0.11/M 输入 token，1.2% 幻觉率
- **Qwen**：与 Fireworks AI 合作降低闭源权重推理成本
- **趋势**："开源不再第二梯队" 成为行业共识
- **价格战**：前沿模型推理成本下降速度超过能力增长速度

**来源：** AIToolsRecap + Mistral
**链接：** https://aitoolsrecap.com/blog/ai-news-may-2026\`,
    date: "2026-05-03 00:00",
    source: "AIToolsRecap + Mistral",
    sourceUrl: "https://aitoolsrecap.com/blog/ai-news-may-2026",
    href: "/news/news-1099",
  },
  {
    id: "news-1100",
    tag: "政策",
    title: "五角大楼将 Anthropic 列为“供应链风险”，欧洲财长呼吁获取 Mythos 模型以做防御准备",
    summary: "五角大楼以 Anthropic 拒绝删除自主武器和大规模监控禁令为由，将其列为“供应链风险”并禁止接入机密 AI 网络。OpenAI、Google、微软、xAI 均获批准。Anthropic 已提起诉讼。欧洲财长同时向 Anthropic 施压，要求欧洲企业获取 Mythos 模型以防数字攻击。",
    content: \`AI 伦理与国家安全的冲突进入白热化。

### 事件全貌

- **五角大楼决定**：将 Anthropic 列为“供应链风险”，禁止接入机密 AI 网络
- **原因**：Anthropic 拒绝删除合同中对自主武器和大规模监控的禁令
- **获批企业**：OpenAI、Google、Microsoft、xAI、SpaceX、Nvidia、Reflection AI
- **Anthropic 回应**：已提起诉讼，加州联邦法官上月已叫停政府行动
- **后续发展**：Anthropic CEO 携 Mythos 工具访白宫，双方重启对话

### 欧洲视角

- 西班牙经济大臣：“欧洲需要作出回应”
- 欧洲企业尚未获得 Mythos 使用权限
- 担忧模型落入不法分子之手引发数字攻击

### 行业影响

- 美国政府首次公开将本国企业定为“供应链风险”
- AI 公司面临“伦理坚守 vs 政府合规”的两难抉择
- 全球 AI 治理框架缺失加剧

**来源：** 新浪财经 + 新华网 + BBC 中文 + 赢政天下
**链接：** https://finance.sina.com.cn/stock/usstock/c/2026-05-01/doc-inhwmkwu5223656.shtml\`,
    date: "2026-05-08 00:00",
    source: "新浪财经 + 新华网 + BBC 中文 + 赢政天下",
    sourceUrl: "https://finance.sina.com.cn/stock/usstock/c/2026-05-01/doc-inhwmkwu5223656.shtml",
    href: "/news/news-1100",
  },
`;

// Insert before "  ] as NewsItem[];"
const marker = '  ] as NewsItem[];';
const idx = content.lastIndexOf(marker);
if (idx === -1) {
  console.error('Marker not found!');
  process.exit(1);
}

content = content.slice(0, idx) + newItems + content.slice(idx);
fs.writeFileSync(newsFile, content, 'utf8');
console.log('✅ Added 12 news items (news-1089 ~ news-1100)');
