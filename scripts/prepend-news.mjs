import { readFileSync, writeFileSync } from 'fs';

const newsPath = new URL('../src/data/news.ts', import.meta.url);
let content = readFileSync(newsPath, 'utf-8');

const newNews = `
{
    id: "news-1350",
    tag: "行业",
    tagColor: "bg-yellow-500/10 text-yellow-300",
    title: "Anthropic 据报同意向 Google 支付 2000 亿美元获取芯片和云计算资源",
    summary: '据 Engadget 报道，Anthropic 与 Google 达成一项价值 2000 亿美元的协议，用于获取 TPU 芯片和 Google Cloud 计算资源。这是 AI 基础设施领域有史以来最大的商业协议之一。',
    content: \`## Anthropic-Google 2000 亿美元算力协议

**2026 年 5 月 5 日**，Engadget 报道了 Anthropic 与 Google 之间的重大协议。

### 核心内容
- **金额**：2000 亿美元，AI 基础设施领域最大规模协议之一
- **内容**：Anthropic 将获得 Google 的 TPU 芯片和 Google Cloud 计算资源
- **背景**：AI 模型训练和推理对算力的需求持续爆炸式增长

### 行业解读
这项协议反映了 AI 行业的核心趋势——算力即竞争力。
Anthropic 需要庞大计算资源来训练和运行 Claude 系列模型，
而 Google 拥有自研 TPU 芯片和全球云计算基础设施。

**来源：** Engadget
**链接：** https://www.engadget.com/2165585/anthropic-reportedly-agrees-to-pay-google-200-billion-for-chips-and-cloud-access/\`,
    date: "2026-05-12 08:00",
    source: "Engadget",
    sourceUrl: "https://www.engadget.com/2165585/anthropic-reportedly-agrees-to-pay-google-200-billion-for-chips-and-cloud-access/",
    href: "/news/news-1350",
  },
{
    id: "news-1351",
    tag: "行业",
    tagColor: "bg-yellow-500/10 text-yellow-300",
    title: "OpenAI 和 Anthropic 分别成立华尔街合资企业，加速企业服务 AI 落地",
    summary: '据 TechCrunch 报道，OpenAI 和 Anthropic 各自与私募股权公司合作成立合资企业，更激进地推广企业级 AI 产品，并正洽谈收购帮助企业部署 AI 的服务公司。',
    content: \`## OpenAI 与 Anthropic 的企业服务新战略

**2026 年 5 月 4 日**，TechCrunch 和 SiliconANGLE 报道了两家 AI 巨头的企业服务布局。

### 合资企业动向
- **OpenAI 合资企业**：与私募股权公司合作成立，推广企业 AI 服务
- **Anthropic 合资企业**：类似结构，专注 Claude Code 和 Cowork 等产品
- **收购洽谈**：两家合资企业正在洽谈收购帮助企业部署 AI 的服务公司

### 行业趋势
2026 年 5 月标志着 AI 行业从实验性试点转向企业部署的关键转折点。
OpenAI 和 Anthropic 都在从「卖模型」转向「卖服务」。

**来源：** TechCrunch + SiliconANGLE + Reuters
**链接：** https://techcrunch.com/2026/05/04/anthropic-and-openai-are-both-launching-joint-ventures-for-enterprise-ai-services/\`,
    date: "2026-05-12 08:00",
    source: "TechCrunch + SiliconANGLE + Reuters",
    sourceUrl: "https://techcrunch.com/2026/05/04/anthropic-and-openai-are-both-launching-joint-ventures-for-enterprise-ai-services/",
    href: "/news/news-1351",
  },
{
    id: "news-1352",
    tag: "AI 安全",
    tagColor: "bg-red-500/10 text-red-300",
    title: "OpenAI 向欧盟开放 GPT-5.5-Cyber 网络安全模型，Anthropic Mythos 仍保持封闭",
    summary: '据 CNBC 报道，OpenAI 宣布将向欧盟开放 GPT-5.5-Cyber 网络安全模型变体，有限度地向经过审查的网络安全专业人员提供预览。',
    content: \`## OpenAI 与 Anthropic 在网络安全模型上的不同策略

**2026 年 5 月 11 日**，CNBC 报道了 OpenAI 与欧盟在网络安全 AI 方面的合作。

### OpenAI 的行动
- **GPT-5.5-Cyber**：GPT-5.5 的网络安全专用变体
- **有限预览**：向经过审查的网络安全专业人员开放

### Anthropic 的立场
- **Mythos 模型**：安全审计模型，此前帮助 Mozilla 发现 423 个 Firefox 漏洞
- **保持封闭**：尚未开放给欧盟或外部机构

**来源：** CNBC
**链接：** https://www.cnbc.com/2026/05/11/openai-eu-cyber-model-anthropic-mythos-gpt.html\`,
    date: "2026-05-12 08:00",
    source: "CNBC",
    sourceUrl: "https://www.cnbc.com/2026/05/11/openai-eu-cyber-model-anthropic-mythos-gpt.html",
    href: "/news/news-1352",
  },
{
    id: "news-1353",
    tag: "AI 军事",
    tagColor: "bg-red-500/10 text-red-300",
    title: "五角大楼与八家科技公司签署 AI 协议，Anthropic 被排除在外",
    summary: '五角大楼已与 OpenAI、Google、Microsoft、Nvidia 等八家公司签署 AI 协议，Anthropic 因拒绝无限制使用其 AI 被排除。',
    content: \`## 五角大楼 AI 联盟：Anthropic 为何被排除？

**2026 年 5 月 4 日**，五角大楼与八家科技公司签署 AI 合作协议。

### Anthropic 被排除的原因
- **拒绝无限制使用**：拒绝允许五角大楼无限制使用其 AI
- **禁止领域**：特别禁止将 AI 用于国内大规模监控和自主武器
- **供应链风险标签**：被标记为「供应链风险」（通常用于外国对手）
- **正在诉讼**：通过法律途径挑战这一标签

### 签署方
OpenAI、Google、Microsoft、Nvidia 等八家公司。

**来源：** ghacks
**链接：** https://www.ghacks.net/2026/05/04/pentagon-signs-ai-deals-with-openai-google-microsoft-nvidia-and-others-cutting-out-anthropic/\`,
    date: "2026-05-12 08:00",
    source: "ghacks",
    sourceUrl: "https://www.ghacks.net/2026/05/04/pentagon-signs-ai-deals-with-openai-google-microsoft-nvidia-and-others-cutting-out-anthropic/",
    href: "/news/news-1353",
  },
{
    id: "news-1354",
    tag: "Agent",
    tagColor: "bg-cyan-500/10 text-cyan-300",
    title: "Google 和 Meta 竞逐个人 AI 助手，代号 Remy 和 Hatch，追赶 Anthropic 和 OpenAI",
    summary: '据 The Decoder 报道，Google 和 Meta 正在内部测试个人 AI 助手（代号 Remy 和 Hatch），Google 已关闭浏览器助手项目 Mariner 转向集成式助手。',
    content: \`## 个人 AI 助手：Google 和 Meta 的追赶之战

**2026 年 5 月**，The Decoder 报道了 Google 和 Meta 在个人 AI 助手领域的动向。

### Google：Remy
- 集成到 Gmail、日历、Google Workspace 中
- 已关闭浏览器助手项目 Mariner

### Meta：Hatch
- 自主处理日常任务的个人 AI 助手
- 通过 WhatsApp 和 Messenger 的海量用户基础

### 市场格局
Anthropic 和 OpenAI 在个人 AI 助手领域已建立领先优势。

**来源：** The Decoder
**链接：** https://the-decoder.com/google-and-meta-race-to-build-personal-ai-agents-as-anthropic-and-openai-pull-further-ahead/\`,
    date: "2026-05-12 08:00",
    source: "The Decoder",
    sourceUrl: "https://the-decoder.com/google-and-meta-race-to-build-personal-ai-agents-as-anthropic-and-openai-pull-further-ahead/",
    href: "/news/news-1354",
  },
{
    id: "news-1355",
    tag: "行业",
    tagColor: "bg-yellow-500/10 text-yellow-300",
    title: "微软-OpenAI 合作重构：为 Anthropic 和 Google 打开合作大门",
    summary: 'OpenAI 与微软重新构建合作关系，结束独家排他协议，为 OpenAI 与 AWS、Google 等云服务商合作打开大门。',
    content: \`## OpenAI-微软合作重构：AI 云竞争新格局

**2026 年 5 月**，OpenAI 与微软合作关系发生结构性变化。

### 关键变化
- **结束独家排他**：OpenAI 不再仅限于 Azure 平台
- **多云开放**：可同时服务 AWS、Google Cloud 等多个云平台

### 连锁反应
- OpenAI 模型上线 AWS Bedrock
- Anthropic 与 Google 达成 2000 亿美元算力协议
- 五角大楼与多家科技公司签署 AI 协议

**来源：** The New Stack
**链接：** https://thenewstack.io/openai-microsoft-partnership-restructured/\`,
    date: "2026-05-12 08:00",
    source: "The New Stack",
    sourceUrl: "https://thenewstack.io/openai-microsoft-partnership-restructured/",
    href: "/news/news-1355",
  },
{
    id: "news-1356",
    tag: "行业",
    tagColor: "bg-yellow-500/10 text-yellow-300",
    title: "2026 年 5 月：AI 行业从实验试点转向企业部署的决定性转折点",
    summary: 'CIO 分析指出，2026 年 5 月标志着 AI 行业从实验性试点转向企业实际部署的关键转折点。',
    content: \`## 2026 年 5 月：企业 AI 的转折点

**2026 年 5 月 6 日**，CIO 发布了对当前 AI 行业趋势的深度分析。

### 核心趋势
- **从试点到部署**：AI 不再停留在概念验证阶段
- **OpenAI 和 Anthropic 的企业服务转型**：从「卖 API」到「卖解决方案」
- **AI 编码工具普及**：Claude Code、Cursor 等在企业中被广泛采用
- **企业 AI 预算 Q1 同比增长超过 60%**

**来源：** CIO
**链接：** https://www.cio.com/article/4167787/openai-anthropic-expand-services-push-signaling-new-phase-in-enterprise-ai-race.html\`,
    date: "2026-05-12 08:00",
    source: "CIO",
    sourceUrl: "https://www.cio.com/article/4167787/openai-anthropic-expand-services-push-signaling-new-phase-in-enterprise-ai-race.html",
    href: "/news/news-1356",
  },
{
    id: "news-1357",
    tag: "开源项目",
    tagColor: "bg-emerald-500/10 text-emerald-300",
    title: "Mastra AI 框架登上 GitHub Trending：Gatsby 团队打造的企业级 AI Agent 平台，23,784 星",
    summary: '由 Gatsby 团队开发的 Mastra AI 框架登上 GitHub Trending，专注构建生产级 AI Agent，已获 23,784 星。',
    content: \`## Mastra：来自 Gatsby 团队的企业级 AI Agent 框架

**2026 年 5 月**，Mastra AI 框架登上 GitHub Trending。

### 项目概况
- **Stars**：23,784
- **团队**：Gatsby 原班人马
- **核心能力**：Agent 编排、工作流管理、工具集成、记忆系统
- **TypeScript 原生**：对前端和全栈开发者友好

**来源：** GitHub Trending
**链接：** https://github.com/mastra-ai/mastra\`,
    date: "2026-05-12 08:00",
    source: "GitHub Trending",
    sourceUrl: "https://github.com/mastra-ai/mastra",
    href: "/news/news-1357",
  },
{
    id: "news-1358",
    tag: "Agent",
    tagColor: "bg-cyan-500/10 text-cyan-300",
    title: "ElizaOS：面向所有人的自主 Agent 框架，18,346 星",
    summary: 'ElizaOS 是面向大众的自主 Agent 框架，致力于降低 AI Agent 开发门槛，已获 18,346 星。',
    content: \`## ElizaOS：民主化的 AI Agent 框架

**2026 年 5 月**，ElizaOS 因其「人人可用的 Agent」理念获得广泛关注。

### 项目概况
- **Stars**：18,346
- **定位**：面向所有人的自主 Agent 框架
- **核心能力**：自主运行、低代码/无代码、社区驱动

**来源：** GitHub Trending
**链接：** https://github.com/elizaos/eliza\`,
    date: "2026-05-12 08:00",
    source: "GitHub Trending",
    sourceUrl: "https://github.com/elizaos/eliza",
    href: "/news/news-1358",
  },
{
    id: "news-1359",
    tag: "Agent",
    tagColor: "bg-cyan-500/10 text-cyan-300",
    title: "12-Factor Agents：LLM 驱动软件开发的 12 要素原则，19,754 星",
    summary: 'humanlayer/12-factor-agents 提出了 LLM 驱动软件开发的 12 条设计原则，为构建可靠可扩展的 AI Agent 应用提供最佳实践指南。',
    content: \`## 12-Factor Agents：AI Agent 的设计原则

**2026 年 5 月**，12-Factor Agents 项目因系统化的 Agent 设计方法论获得 19,754 星。

### 核心原则
- **代码库**：Agent 行为逻辑应有版本化追溯能力
- **依赖**：明确声明 Agent 所需的工具和模型依赖
- **配置**：将 Agent 行为参数与环境配置分离
- **后备处理**：优雅降级和错误恢复机制
- **日志**：Agent 决策过程应可追溯和审计

**来源：** GitHub Trending
**链接：** https://github.com/humanlayer/12-factor-agents\`,
    date: "2026-05-12 08:00",
    source: "GitHub Trending",
    sourceUrl: "https://github.com/humanlayer/12-factor-agents",
    href: "/news/news-1359",
  },
{
    id: "news-1360",
    tag: "行业",
    tagColor: "bg-yellow-500/10 text-yellow-300",
    title: "2026 年 5 月 AI 更新：AI Agent 正在取代 App，开发者工作流被彻底重写",
    summary: 'MSN 综合分析显示，2026 年 5 月 AI 在软件开发中的角色已从「聊天机器人」阶段进入「主动协作」时代。',
    content: \`## AI Agent 取代 App：开发者工作流的范式转移

**2026 年 5 月**，MSN 发布了对当前 AI 开发者工具生态的综合分析。

### 核心趋势
- **从聊天到协作**：AI 不再只是回答问题，而是主动参与开发
- **Claude Design**：Anthropic 推出的视觉设计协作工具
- **OpenAI Codex**：代码生成 Agent 已进入生产级应用
- **Vibe Coding 移动化**：Lovable 等公司将 AI 编程带到移动端

**来源：** MSN
**链接：** https://www.msn.com/en-us/news/other/may-2026-ai-updates-are-rewriting-the-developer-workflow/gm-GM9E2FF8D4\`,
    date: "2026-05-12 08:00",
    source: "MSN",
    sourceUrl: "https://www.msn.com/en-us/news/other/may-2026-ai-updates-are-rewriting-the-developer-workflow/gm-GM9E2FF8D4",
    href: "/news/news-1360",
  },
{
    id: "news-1361",
    tag: "行业",
    tagColor: "bg-yellow-500/10 text-yellow-300",
    title: "OpenAI 和 Anthropic 合资企业洽谈收购 AI 服务公司，加速企业部署能力",
    summary: '据 Reuters 报道，OpenAI 和 Anthropic 的合资企业正在洽谈收购帮助企业部署 AI 的服务公司。',
    content: \`## AI 巨头的「买买买」：通过收购快速获取服务能力

**2026 年 5 月 5 日**，Reuters 报道了 OpenAI 和 Anthropic 合资企业的收购动向。

### 收购逻辑
- **目标**：收购帮助企业部署 AI 的服务公司
- **动机**：快速获取企业级 AI 部署专业知识和客户资源
- **方式**：通过私募股权合资企业进行

**来源：** Reuters
**链接：** https://money.usnews.com/investing/news/articles/2026-05-05/openai-anthropic-ventures-in-talks-to-buy-ai-services-firms-sources-say\`,
    date: "2026-05-12 08:00",
    source: "Reuters",
    sourceUrl: "https://money.usnews.com/investing/news/articles/2026-05-05/openai-anthropic-ventures-in-talks-to-buy-ai-services-firms-sources-say",
    href: "/news/news-1361",
  },
{
    id: "news-1362",
    tag: "大语言模型",
    tagColor: "bg-blue-500/10 text-blue-300",
    title: "2026 年 5 月 AI 模型更新汇总：GPT-5.5 优化、DeepSeek V4、Claude Code 修复、Kimi K2.6",
    summary: 'tldl.io 汇总了 2026 年 5 月的主要 AI 模型更新，包括 GPT-5.5 持续优化、DeepSeek V4 更新、Claude Code 修复、Kimi K2.6 编码能力提升。',
    content: \`## 2026 年 5 月 AI 模型更新汇总

**2026 年 5 月**，tldl.io 持续跟踪了各大模型提供商的最新更新。

### 主要更新
- **OpenAI GPT-5.5**：持续优化中，API 和定价更新
- **DeepSeek V4**：系列更新，性价比持续提升
- **Anthropic Claude Code**：修复多项问题，稳定性提升
- **Kimi K2.6**：编码能力挑战，在多项编程基准中表现优异

**来源：** tldl.io
**链接：** https://www.tldl.io/blog/ai-news-updates-2026\`,
    date: "2026-05-12 08:00",
    source: "tldl.io",
    sourceUrl: "https://www.tldl.io/blog/ai-news-updates-2026",
    href: "/news/news-1362",
  },
`;

content = content.replace('export const news = [\n{', 'export const news = [\n' + newNews + '{');
writeFileSync(newsPath, content, 'utf-8');
console.log('✅ 已写入 13 条新闻 (news-1350 ~ news-1362)');
