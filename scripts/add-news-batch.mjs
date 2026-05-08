// 批量添加新闻条目脚本
import fs from 'fs';

const filePath = './src/data/news.ts';
let content = fs.readFileSync(filePath, 'utf-8');

const newEntries = [
{
    id: "news-1039",
    tag: "AI 安全",
    tagColor: "bg-red-500/10 text-red-300",
    title: "Mozilla 用 Claude Mythos 发现 423 个 Firefox 安全漏洞：AI 辅助安全审计的里程碑",
    summary: "Mozilla 利用 Anthropic Claude Mythos Preview 对 Firefox 进行深度安全审计，4 月份发现并修复了 423 个安全 bug，远超以往每月 20-30 个的水平。其中包括一个 20 年历史的 XSLT 漏洞和一个 15 年历史的 legend 元素 bug。",
    content: `## AI 辅助安全的质变时刻

**2026 年 5 月 7 日**，Mozilla 在 Hacks 博客发布长文，披露了使用 Claude Mythos Preview 对 Firefox 进行安全审计的详细成果。

### 关键数据

- **423 个安全 bug**：4 月份单月发现数量，是以往月均（20-30 个）的 **14 倍**
- **20 年 XSLT 漏洞**：一个隐藏了 20 年的跨站脚本漏洞被发现
- **15 年 legend 元素 bug**：HTML legend 元素中的安全缺陷
- **防御深度验证**：Firefox 现有的纵深防御措施拦截了大量攻击尝试

### 技术方法

Mozilla 采用了"引导-扩展-堆叠"的三阶段方法：
1. **引导**：让 Claude 自主发现潜在漏洞
2. **扩展**：扩大搜索范围，覆盖更多代码路径
3. **堆叠**：多轮分析交叉验证，过滤误报

Mozilla 强调："几个月前，AI 生成的安全报告还被认为是噪音。但现在，模型能力和 harness 技术的结合带来了质的飞跃。"

**来源：** Mozilla Hacks + Simon Willison + TechCrunch + The Verge
**链接：** https://hacks.mozilla.org/2026/05/behind-the-scenes-hardening-firefox/`,
    date: "2026-05-08 08:00",
    source: "Mozilla Hacks + Simon Willison + TechCrunch + The Verge",
    sourceUrl: "https://hacks.mozilla.org/2026/05/behind-the-scenes-hardening-firefox/",
    href: "/news/news-1039",
  },
{
    id: "news-1040",
    tag: "行业",
    tagColor: "bg-yellow-500/10 text-yellow-300",
    title: "Anthropic 与 SpaceX/xAI 达成 Colossus 数据中心合作：竞对之间的算力联盟",
    summary: "Anthropic 在 Code w/ Claude 活动上宣布与 SpaceX/xAI 达成合作，将使用 Colossus 数据中心的全部容量。这一竞对之间的算力交易标志着 AI 基础设施共享的新模式。",
    content: `## 竞对合作：算力即基础设施

**2026 年 5 月 7 日**，Anthropic 在 Code w/ Claude 活动上宣布了一项重大合作——与 SpaceX/xAI 签署协议，使用其 Colossus 数据中心的"全部容量"。

### 合作要点

- **Colossus 数据中心**：xAI 在田纳西州孟菲斯建设的超级计算集群
- **全部容量**：Anthropic 将获得 Colossus 的完整算力使用权
- **竞对关系**：xAI（Grok）与 Anthropic（Claude）是直接的 AI 模型竞争者
- **背景**：Anthropic 同日宣布提高 Claude 使用限制

### 行业意义

这一合作表明：
1. **算力稀缺性**：即使竞争对手之间，算力基础设施也需共享
2. **资本密集性**：AI 模型训练对算力的需求远超单一公司可自建规模
3. **新模式**：未来可能出现更多"竞对之间的基础设施合作"

Simon Willison 评价："这不是简单的商业交易，而是 AI 行业进入基础设施共享时代的信号。"

**来源：** Simon Willison + Anthropic
**链接：** https://simonwillison.net/2026/May/7/xai-anthropic/`,
    date: "2026-05-08 08:00",
    source: "Simon Willison + Anthropic",
    sourceUrl: "https://simonwillison.net/2026/May/7/xai-anthropic/",
    href: "/news/news-1040",
  },
{
    id: "news-1041",
    tag: "产品",
    tagColor: "bg-green-500/10 text-green-300",
    title: "OpenAI 在 ChatGPT 中测试广告：免费用户的商业化探索",
    summary: "OpenAI 宣布开始在 ChatGPT 中测试广告功能，这是 OpenAI 首次在其核心产品中引入广告。此举引发关于 AI 产品商业化路径的广泛讨论。",
    content: `## ChatGPT 广告测试：免费模式的商业闭环

**2026 年 5 月 7 日**，OpenAI 官方博客宣布开始在 ChatGPT 中测试广告功能。

### 广告测试细节

- **目标用户**：ChatGPT 免费用户
- **广告形式**：对话界面中的推荐内容
- **测试范围**：小规模灰度测试
- **付费用户**：Plus/Pro/Team 用户不受影响

### 行业背景

OpenAI 的广告测试与 Anthropic "Claude 将保持无广告"的立场形成鲜明对比。Anthropic 在 2 月的博文中明确表示："广告激励与真正有帮助的 AI 助手不兼容。"

这代表了 AI 行业的两条商业化路径：
1. **OpenAI 模式**：免费+广告+付费升级
2. **Anthropic 模式**：付费订阅，无广告

### 用户反应

广告测试引发了关于隐私、用户体验和 AI 产品信任度的讨论。关键问题在于：广告是否会影响 AI 回答的客观性？

**来源：** OpenAI Blog
**链接：** https://openai.com/index/testing-ads-in-chatgpt/`,
    date: "2026-05-08 08:00",
    source: "OpenAI Blog",
    sourceUrl: "https://openai.com/index/testing-ads-in-chatgpt/",
    href: "/news/news-1041",
  },
{
    id: "news-1042",
    tag: "产品",
    tagColor: "bg-green-500/10 text-green-300",
    title: "OpenAI Codex 推出 Chrome 扩展：AI 可直接操作已登录的网站和应用",
    summary: "OpenAI 发布 Codex Chrome 扩展，允许 Codex 在用户已登录的网站和应用中执行任务。扩展采用任务特定标签组设计，不影响用户正常浏览。",
    content: `## Codex 进入浏览器：AI Agent 的新入口

**2026 年 5 月 7 日**，OpenAI 在 Chrome Web Store 上线了 Codex 浏览器扩展。

### 核心功能

- **已登录网站操作**：Codex 可以直接在用户已登录的网站中完成任务
- **任务标签组**：在"任务特定"标签组中运行，不影响用户的活动标签
- **Chrome 插件依赖**：需要配合 Codex 桌面应用使用
- **应用场景**：填写表单、数据提取、自动化工作流等

### 技术意义

这是 OpenAI 将 Codex 从"代码助手"扩展为"通用 AI Agent"的关键一步。通过在浏览器环境中运行，Codex 可以：
1. 访问用户已授权的所有 Web 应用
2. 执行跨网站的自动化任务
3. 与 SaaS 工具直接交互

**来源：** The Verge + Chrome Web Store
**链接：** https://www.theverge.com/ai-artificial-intelligence/926520/openai-launched-a-codex-extension-for-chrome`,
    date: "2026-05-08 08:00",
    source: "The Verge + Chrome Web Store",
    sourceUrl: "https://www.theverge.com/ai-artificial-intelligence/926520/openai-launched-a-codex-extension-for-chrome",
    href: "/news/news-1042",
  },
{
    id: "news-1043",
    tag: "开源项目",
    tagColor: "bg-purple-500/10 text-purple-300",
    title: "中国 Moonshot AI 融资 20 亿美元，估值达 200 亿美元：开源 AI 需求爆发",
    summary: "中国 AI 公司 Moonshot AI（月之暗面）完成 20 亿美元融资，估值达到 200 亿美元。TechCrunch 报道称，这一轮融资反映了全球对开源 AI 模型的爆炸性需求。",
    content: `## 开源 AI 的资本狂欢

**2026 年 5 月 7 日**，TechCrunch 报道中国 Moonshot AI 完成 20 亿美元融资，估值 200 亿美元。

### 融资详情

- **融资金额**：20 亿美元
- **估值**：200 亿美元
- **公司**：Moonshot AI（月之暗面），Kimi 大模型开发商
- **驱动因素**：全球开源 AI 模型需求爆发

### 行业背景

Moonshot AI 的 Kimi 智能助手在中国市场快速增长，其开源策略吸引了大量开发者。这一轮融资规模在中国 AI 创业公司中名列前茅，表明：

1. **开源路线获资本认可**：与闭源模型相比，开源 AI 的商业模式正在被验证
2. **中国 AI 全球化**：中国 AI 公司正在成为全球 AI 生态的重要参与者
3. **估值回归理性**：200 亿美元估值相比 2023-2024 年的泡沫期更为理性

**来源：** TechCrunch + 36 氪
**链接：** https://techcrunch.com/2026/05/07/chinas-moonshot-ai-raises-2b-at-20b-valuation-as-demand-for-open-source-ai-skyrockets/`,
    date: "2026-05-08 08:00",
    source: "TechCrunch + 36 氪",
    sourceUrl: "https://techcrunch.com/2026/05/07/chinas-moonshot-ai-raises-2b-at-20b-valuation-as-demand-for-open-source-ai-skyrockets/",
    href: "/news/news-1043",
  },
{
    id: "news-1044",
    tag: "行业",
    tagColor: "bg-yellow-500/10 text-yellow-300",
    title: "AI 四小龙估值突破万亿：旷视、商汤、云从、依图身价集体暴涨",
    summary: "中国 AI 四小龙（旷视科技、商汤科技、云从科技、依图科技）整体估值突破万亿人民币，反映 AI 行业价值重估加速。",
    content: `## AI 四小龙：从寒冬到万亿

**2026 年 5 月 7 日**，36 氪报道中国 AI 四龙估值集体突破万亿人民币。

### 四小龙概况

- **旷视科技（Megvii）**：计算机视觉龙头，人脸识别、智慧城市
- **商汤科技（SenseTime）**：AI 大模型、自动驾驶、医疗 AI
- **云从科技（CloudWalk）**：金融 AI、智慧城市解决方案
- **依图科技（Yitu）**：医疗影像、语音识别

### 估值暴涨背后的原因

1. **AI 落地加速**：从实验室到产业的转化速度显著提升
2. **政策支持**：中国对 AI 基础设施建设的持续投入
3. **技术突破**：大模型时代带来新一轮技术红利
4. **资本回归**：经历 2023-2024 年的调整后，资本重新看好 AI 赛道

**来源：** 36 氪
**链接：** https://36kr.com/p/3799166944686857`,
    date: "2026-05-08 08:00",
    source: "36 氪",
    sourceUrl: "https://36kr.com/p/3799166944686857",
    href: "/news/news-1044",
  },
{
    id: "news-1045",
    tag: "行业",
    tagColor: "bg-yellow-500/10 text-yellow-300",
    title: "Cloudflare 裁员 1100 人：AI 使用量增长 600% 背后的人力重构",
    summary: "Cloudflare 宣布裁员 1100 人，同时公司 AI 使用量在过去一年增长了 600%。CEO Matthew Prince 表示这是'人力结构重构'而非简单缩减。",
    content: `## AI 替代人力：Cloudflare 的 600% 增长与 1100 人裁员

**2026 年 5 月 7 日**，The Verge 报道 Cloudflare 大规模裁员消息。

### 核心数据

- **裁员人数**：1,100 人
- **AI 使用量增长**：600%（同比增长）
- **CEO 表态**："人力结构重构"，非简单缩减

### 行业信号

这是 AI 替代人力的又一个标志性事件：
1. **效率提升**：AI 工具使同等产出所需人力大幅减少
2. **技能转型**：被裁岗位多为可被 AI 自动化的重复性工作
3. **行业趋势**：从科技巨头到基础设施公司，AI 替代正在扩散

Cloudflare 作为全球领先的 CDN 和网络安全公司，其裁员决定具有行业风向标意义。

**来源：** The Verge
**链接：** https://www.theverge.com/ai-artificial-intelligence/926457/cloudflare-is-laying-off-1100-workers-as-its-ai-usage-increases-by-600-percent`,
    date: "2026-05-08 08:00",
    source: "The Verge",
    sourceUrl: "https://www.theverge.com/ai-artificial-intelligence/926457/cloudflare-is-laying-off-1100-workers-as-its-ai-usage-increases-by-600-percent",
    href: "/news/news-1045",
  },
{
    id: "news-1046",
    tag: "产品",
    tagColor: "bg-green-500/10 text-green-300",
    title: "Perplexity Personal Computer 正式登陆 Mac：AI 个人电脑的新时代",
    summary: "Perplexity 的 Personal Computer（个人电脑）应用现已对 Mac 用户全面开放。这款 AI 原生应用将搜索、笔记、文件管理整合为统一的个人知识系统。",
    content: `## AI 个人电脑：从概念到产品

**2026 年 5 月 7 日**，TechCrunch 报道 Perplexity Personal Computer 对 Mac 用户全面开放。

### 产品特性

- **AI 原生搜索**：基于 Perplexity 的 AI 搜索引擎
- **知识管理**：整合笔记、书签、文档
- **个人知识图谱**：自动关联用户的信息资产
- **Mac 全面开放**：所有 Mac 用户均可使用

### 产品定位

Perplexity Personal Computer 不同于传统 PC 概念，它是：
1. **AI 优先的信息管理工具**
2. **个人知识的统一入口**
3. **搜索 + 笔记 + 文件的三位一体**

这代表了 AI 时代"个人电脑"概念的重定义——不再是硬件，而是 AI 驱动的知识管理系统。

**来源：** TechCrunch
**链接：** https://techcrunch.com/2026/05/07/perplexitys-personal-computer-is-now-available-everyone-on-mac/`,
    date: "2026-05-08 08:00",
    source: "TechCrunch",
    sourceUrl: "https://techcrunch.com/2026/05/07/perplexitys-personal-computer-is-now-available-everyone-on-mac/",
    href: "/news/news-1046",
  },
{
    id: "news-1047",
    tag: "安全",
    tagColor: "bg-red-500/10 text-red-300",
    title: "OpenAI 推出 Trusted Contact 安全功能：ChatGPT 自害风险防护升级",
    summary: "OpenAI 在 ChatGPT 中引入 Trusted Contact（信任联系人）功能，当检测到用户可能存在自害风险时，系统可联系用户指定的紧急联系人。",
    content: `## AI 安全的新防线

**2026 年 5 月 7 日**，OpenAI 宣布在 ChatGPT 中推出 Trusted Contact 安全功能。

### 功能说明

- **风险检测**：AI 识别用户对话中可能的自害风险信号
- **紧急联系人**：用户可预先指定信任的紧急联系人
- **干预机制**：检测到风险时，系统可联系紧急联系人
- **用户自主**：用户可选择启用或关闭此功能

### 行业意义

这是 AI 公司在产品安全方面的又一重要举措：
1. **AI 心理健康干预**：大语言模型在心理健康领域的应用边界扩展
2. **责任 AI**：从内容安全扩展到人身安全
3. **用户信任**：透明化的安全机制增强用户信任

**来源：** TechCrunch + OpenAI
**链接：** https://techcrunch.com/2026/05/07/openai-introduces-new-trusted-contact-safeguard-for-cases-of-possible-self-harm/`,
    date: "2026-05-08 08:00",
    source: "TechCrunch + OpenAI",
    sourceUrl: "https://techcrunch.com/2026/05/07/openai-introduces-new-trusted-contact-safeguard-for-cases-of-possible-self-harm/",
    href: "/news/news-1047",
  },
{
    id: "news-1048",
    tag: "LLM",
    tagColor: "bg-cyan-500/10 text-cyan-300",
    title: "Google Gemini 3.1 Flash-Lite 正式 GA：轻量级 AI 模型进入生产阶段",
    summary: "Google 宣布 Gemini 3.1 Flash-Lite 结束预览阶段，正式成为通用可用（GA）产品。这是 Google 在轻量级 AI 模型领域的重要布局。",
    content: `## 轻量级模型的量产时刻

**2026 年 5 月 7 日**，Simon Willison 报道 Google Gemini 3.1 Flash-Lite 正式 GA。

### 模型特点

- **定位**：轻量级、低成本、高速推理
- **状态变化**：从 Preview → GA（通用可用）
- **模型一致性**：GA 版本与预览版模型参数未发生变化
- **llm 工具支持**：Simon Willison 的 llm-gemini 插件已同步更新至 0.31

### 为什么重要

Gemini 3.1 Flash-Lite 的 GA 意味着：
1. **成本优势**：比标准 Gemini 模型便宜数倍
2. **速度优势**：推理延迟更低，适合实时场景
3. **生产就绪**：GA 状态意味着 SLA 保障和稳定性承诺
4. **开发者友好**：可大规模用于生产环境

**来源：** Simon Willison + Google Cloud Blog
**链接：** https://simonwillison.net/2026/May/7/llm-gemini/`,
    date: "2026-05-08 08:00",
    source: "Simon Willison + Google Cloud Blog",
    sourceUrl: "https://simonwillison.net/2026/May/7/llm-gemini/",
    href: "/news/news-1048",
  },
{
    id: "news-1049",
    tag: "应用",
    tagColor: "bg-indigo-500/10 text-indigo-300",
    title: "Apple AirPods 摄像头版接近量产：AI 硬件的下一个形态",
    summary: "据 Bloomberg 报道，Apple 正在测试带有摄像头的 AirPods 原型机，测试者已"积极使用"。这款产品将 AI 视觉能力融入可穿戴设备。",
    content: `## AirPods 带摄像头：AI 可穿戴设备的新物种

**2026 年 5 月 7 日**，The Verge 引用 Bloomberg Mark Gurman 报道，Apple 的摄像头版 AirPods 接近量产。

### 产品细节

- **摄像头集成**：AirPods 内置微型摄像头
- **测试阶段**：Apple 内部测试者"积极使用"原型机
- **AI 驱动**：摄像头数据将由 Apple Intelligence 处理
- **量产临近**：据报已接近生产阶段

### 应用场景

带摄像头的 AirPods 可能支持：
1. **第一视角 AI 助手**：看到用户看到的东西，实时提供信息
2. **实时翻译**：看到外文标识即时翻译
3. **物体识别**：识别周围环境中的物品、地标
4. **无障碍辅助**：帮助视障用户理解周围环境

这是 Apple 将 AI 从软件推向硬件的重要一步。

**来源：** The Verge + Bloomberg
**链接：** https://www.theverge.com/tech/926376/apple-airpods-cameras-ai-production`,
    date: "2026-05-08 08:00",
    source: "The Verge + Bloomberg",
    sourceUrl: "https://www.theverge.com/tech/926376/apple-airpods-cameras-ai-production",
    href: "/news/news-1049",
  },
{
    id: "news-1050",
    tag: "应用",
    tagColor: "bg-indigo-500/10 text-indigo-300",
    title: "Gmail AI 写作工具升级：可根据你的语调风格生成个性化邮件",
    summary: "Google 宣布 Gmail 的 Help me write 功能升级，可生成符合用户个人语调和风格的邮件，还能从 Google Drive 和 Gmail 中提取相关上下文。",
    content: `## AI 写作不再"千篇一律"

**2026 年 5 月 8 日**，The Verge 报道 Google 升级 Gmail AI 写作工具。

### 功能升级

- **个性化语调**：AI 生成的邮件符合用户的个人写作风格
- **上下文提取**：可从 Google Drive 和 Gmail 中拉取相关内容
- **提示驱动**：根据用户的提示词调整生成风格
- **逐步推送**：功能正在逐步向用户推送

### 产品意义

这是 AI 写作从"通用"走向"个性化"的关键一步：
1. **风格学习**：AI 学习并模仿用户的写作习惯
2. **场景适配**：商务、社交、正式、休闲等不同场景自动调整
3. **上下文感知**：不只是写邮件，而是理解邮件背后的业务场景

**来源：** The Verge + Google Workspace Blog
**链接：** https://www.theverge.com/tech/926568/gmails-ai-writing-tool-will-be-write-emails-that-sound-more-like-you`,
    date: "2026-05-08 08:00",
    source: "The Verge + Google Workspace Blog",
    sourceUrl: "https://www.theverge.com/tech/926568/gmails-ai-writing-tool-will-be-write-emails-that-sound-more-like-you",
    href: "/news/news-1050",
  },
{
    id: "news-1051",
    tag: "应用",
    tagColor: "bg-indigo-500/10 text-indigo-300",
    title: "Spotify 押注 AI 生成个人音频：从音乐平台到个性化音频生态",
    summary: "Spotify 宣布计划成为 AI 生成个人音频的主阵地，将利用 AI 技术为用户创建高度个性化的音频内容，超越传统音乐流媒体定位。",
    content: `## Spotify 的 AI 音频野心

**2026 年 5 月 7 日**，TechCrunch 报道 Spotify 正在布局 AI 生成个人音频。

### 战略方向

- **AI 生成音频**：利用 AI 创建个性化音频内容
- **超越音乐**：从音乐平台扩展到全品类音频
- **个人化**：根据用户偏好、情绪、场景实时生成
- **内容类型**：可能包括播客、白噪音、冥想、故事等

### 行业影响

Spotify 的这一举措可能重塑音频内容产业：
1. **内容生产民主化**：AI 降低音频内容创作门槛
2. **无限长尾**：每个用户都能获得"为自己定制"的音频
3. **版权新挑战**：AI 生成内容的版权归属问题

**来源：** TechCrunch
**链接：** https://techcrunch.com/2026/05/07/spotify-wants-to-become-the-home-for-ai-generated-personal-audio/`,
    date: "2026-05-08 08:00",
    source: "TechCrunch",
    sourceUrl: "https://techcrunch.com/2026/05/07/spotify-wants-to-become-the-home-for-ai-generated-personal-audio/",
    href: "/news/news-1051",
  },
{
    id: "news-1052",
    tag: "行业",
    tagColor: "bg-yellow-500/10 text-yellow-300",
    title: "卧底 GEO 公司 30 天：每天 1000 篇 AI 自动发稿，正在毁掉互联网品牌",
    summary: "记者卧底一家 GEO（生成引擎优化）公司，揭露其利用 AI 自动发稿机每天生成 1000 篇内容，通过欺骗 AI 搜索引擎来获取品牌曝光。这种行为正在污染互联网内容生态。",
    content: `## GEO 黑产：当 AI 开始欺骗 AI

**2026 年 5 月 7 日**，36 氪发表记者卧底 GEO 公司的深度报道。

### 卧底发现

- **日产量 1000 篇**：自动发稿机每天生成大量 AI 内容
- **目标**：欺骗 AI 搜索引擎（如 Perplexity、ChatGPT 搜索）
- **手段**：SEO 变种——GEO（Generative Engine Optimization）
- **危害**：正在毁掉互联网品牌的可信度

### 什么是 GEO

GEO（生成引擎优化）是 SEO 在 AI 时代的进化：
1. **传统 SEO**：优化内容以被 Google 搜索到
2. **GEO**：优化内容以被 AI 搜索引擎引用和推荐
3. **黑产手法**：大量生成看似权威实则空洞的 AI 内容

### 行业警示

AI 内容农场正在制造"互联网垃圾"，影响：
- AI 搜索结果的准确性
- 品牌声誉和用户信任
- 互联网内容生态的健康

**来源：** 36 氪 + 逐浪 Linkworld
**链接：** https://36kr.com/p/3799141305397761`,
    date: "2026-05-08 08:00",
    source: "36 氪 + 逐浪 Linkworld",
    sourceUrl: "https://36kr.com/p/3799141305397761",
    href: "/news/news-1052",
  },
{
    id: "news-1053",
    tag: "开源项目",
    tagColor: "bg-purple-500/10 text-purple-300",
    title: "DeepSeek 获大基金拟领投，估值 450 亿美元：中国开源 AI 模型资本加速",
    summary: "据新浪财经报道，大基金拟领投 DeepSeek，公司估值达到 450 亿美元。这将是中国 AI 领域最大规模的投资之一。",
    content: `## DeepSeek 450 亿美元：中国 AI 的资本新高

**2026 年 5 月 7 日**，新浪财经报道大基金拟领投 DeepSeek。

### 投资详情

- **估值**：450 亿美元
- **领投方**：大基金（国家集成电路产业投资基金）
- **意义**：中国 AI 领域最大规模投资之一

### DeepSeek 的行业地位

DeepSeek 是中国开源 AI 模型的代表：
1. **DeepGEMM**：开源 FP8 高性能内核库，GitHub 7000+ 星
2. **DeepSeek-R1**：开源推理模型，引发社区广泛关注
3. **开源策略**：坚持开源路线，推动中国 AI 生态全球化

大基金的领投表明国家队对中国开源 AI 战略的坚定支持。

**来源：** 新浪财经
**链接：** https://finance.sina.com.cn/stock/companyt/2026-05-07/doc-inhwzmmn7829269.shtml`,
    date: "2026-05-08 08:00",
    source: "新浪财经",
    sourceUrl: "https://finance.sina.com.cn/stock/companyt/2026-05-07/doc-inhwzmmn7829269.shtml",
    href: "/news/news-1053",
  },
];

// 在 "] as NewsItem[]" 之前插入新条目
const closingPattern = /  \] as NewsItem\[\];/;
const newEntriesStr = newEntries.map(e => {
  return JSON.stringify(e, null, 2)
    .replace(/"content": "([^"]*)"/g, (match, content) => {
      // Restore backticks in content
      return `"content": \`${content}\``;
    });
}).join(',\n');

content = content.replace(closingPattern, `,
${newEntriesStr},
  ] as NewsItem[];`);

fs.writeFileSync(filePath, content, 'utf-8');
console.log(`✅ 成功添加 ${newEntries.length} 条新闻 (news-1039 ~ news-1053)`);
