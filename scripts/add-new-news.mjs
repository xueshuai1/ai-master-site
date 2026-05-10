/**
 * 追加新新闻到 news.ts
 */
import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const newsFile = join(__dirname, '..', 'src', 'data', 'news.ts');

const newNews = [
{
    id: "news-1206",
    tag: "行业",
    tagColor: "bg-yellow-500/10 text-yellow-300",
    title: "Anthropic 计划融资 500 亿美元，估值约 9000 亿：AI 行业史上最大融资轮",
    summary: "据《金融时报》报道，Anthropic 正计划以约 9000 亿美元估值融资 500 亿美元，若完成将成为历史上估值最高的私营公司之一。Claude 年化收入接近 190 亿美元，约 40% 的前 50 大客户来自金融行业。",
    content: `## Anthropic 冲击 9000 亿美元估值

**2026 年 5 月 9 日**，《金融时报》独家报道 Anthropic 正在筹备新一轮融资。

### 核心数据
- **融资金额**：最高 500 亿美元
- **目标估值**：约 9000 亿美元
- **年化收入**：接近 190 亿美元
- **客户结构**：前 50 大客户中约 40% 为金融机构

### 行业意义
若以 9000 亿美元估值成交，Anthropic 将成为历史上估值最高的私营科技公司之一。这一数字甚至超过了众多标普 500 成分股公司的市值。

### CEO 观点
CEO Dario Amodei 在 5 月 5 日的金融服务活动中表示，未能采用 AI 的 SaaS 公司可能面临破产风险，并呼吁对强大模型的发布加强监管。

### 竞争格局
根据 Ramp 平台数据，首次采购 AI 的企业客户选择 Anthropic 的比率是 OpenAI 的 3 倍，显示 Anthropic 在企业市场的强势增长。

**来源：** 金融时报 + AI Tools Recap
**链接：** https://aitoolsrecap.com/Blog/ai-news-may-9-2026`,
    date: "2026-05-10 12:00",
    source: "金融时报 + AI Tools Recap",
    sourceUrl: "https://aitoolsrecap.com/Blog/ai-news-may-9-2026",
    href: "/news/news-1206",
  },
{
    id: "news-1207",
    tag: "大语言模型",
    tagColor: "bg-blue-500/10 text-blue-300",
    title: "Meta 发布 Muse Spark：首个闭源旗舰模型，告别 Llama 开源路线",
    summary: "Meta 在首席 AI 官 Alexandr Wang 领导的新超级智能实验室下推出 Muse Spark，这是 Meta 首个闭源旗舰大模型，标志着从 Llama 开源战略的重大转向。该模型在多模态感知、推理、健康和智能体任务上表现出色，计算成本仅为 Llama 4 中型变体的一小部分。",
    content: `## Meta 的战略转向：从开源到闭源

**2026 年 5 月 9 日**，Meta 正式发布 Muse Spark。

### 关键变化
- **闭源旗舰模型**：Muse Spark 是 Meta 首个闭源旗舰大模型
- **战略转向**：从长期以来的 Llama 开源路线转向闭源
- **新团队**：由首席 AI 官 Alexandr Wang 领导的超级智能实验室开发
- **性能优势**：在多模态感知、推理、健康和智能体任务上表现优异
- **成本效率**：计算成本远低于 Llama 4 中型变体

### 背景
Meta 此前因内部"Avocado"模型在 3 月因性能不佳而推迟发布，Muse Spark 是该团队的另一条产品线。

### 同时宣布
Meta 确认 2026 年 AI 资本支出达 1150-1350 亿美元，几乎是 2025 年的两倍。

**来源：** AI Tools Recap + Meta 官方
**链接：** https://aitoolsrecap.com/Blog/ai-news-may-9-2026`,
    date: "2026-05-10 12:00",
    source: "AI Tools Recap + Meta 官方",
    sourceUrl: "https://aitoolsrecap.com/Blog/ai-news-may-9-2026",
    href: "/news/news-1207",
  },
{
    id: "news-1208",
    tag: "行业",
    tagColor: "bg-green-500/10 text-green-300",
    title: "OpenAI 年化收入突破 250 亿美元，探索 IPO 路径：可能于 2026 年底上市",
    summary: "OpenAI 年化收入已超过 250 亿美元，大幅领先 Anthropic 的 190 亿美元。联合创始人在 Musk 诉讼案中确认 OpenAI 正在探索 IPO，可能于 2026 年底启动公开上市。",
    content: `## OpenAI 走向公开市场

**2026 年 5 月 9 日**，Musk 诉讼案中披露了 OpenAI 的最新财务数据。

### 核心数据
- **年化收入**：超过 250 亿美元
- **对比 Anthropic**：接近 190 亿美元，差距约 60 亿
- **IPO 计划**：可能在 2026 年底启动
- **确认来源**：Greg Brockman 在法庭上确认探索 IPO

### 行业影响
OpenAI 若成功上市，将成为 AI 行业最大的 IPO 之一。250 亿美元的年化收入意味着月均收入超过 20 亿美元，主要来自 ChatGPT 订阅和企业 API 调用。

### 诉讼背景
Musk v. Altman 案中，双方围绕 OpenAI 治理结构和股权分配激烈交锋。

**来源：** AI Tools Recap + Musk 诉讼案报道
**链接：** https://aitoolsrecap.com/Blog/ai-news-may-9-2026`,
    date: "2026-05-10 12:00",
    source: "AI Tools Recap + 诉讼案报道",
    sourceUrl: "https://aitoolsrecap.com/Blog/ai-news-may-9-2026",
    href: "/news/news-1208",
  },
{
    id: "news-1209",
    tag: "AI 工具",
    tagColor: "bg-emerald-500/10 text-emerald-300",
    title: "Anthropic 借助 SpaceX Colossus 算力，Claude Code 速率限制翻倍",
    summary: "Anthropic 与 SpaceX Colossus One 数据中心合作，一夜之间将 Claude Code 的速率限制翻倍，新增超 300 兆瓦算力（相当于 22 万+ NVIDIA GPU）。此前开发者报告高峰时段经常遇到输出限制。",
    content: `## 算力军备战：Anthropic 拥抱 SpaceX

**2026 年 5 月 8 日**，Anthropic 宣布大幅扩展 Claude Code 的算力。

### 核心信息
- **速率限制翻倍**：Claude Code 调用限制一夜之间翻倍
- **算力来源**：SpaceX Colossus One 数据中心
- **新增容量**：超 300 兆瓦，相当于 22 万+ NVIDIA GPU
- **部署速度**：不到一个月完成部署

### 背景
此前开发者频繁报告高峰时段 Claude Code 遇到输出限制，严重影响开发体验。

### Colossus 的转型
Colossus 最初为 xAI 的 Grok 训练而建，现在正为 Anthropic 的开发者产品提供突发算力。这也发生在 xAI 被并入 SpaceX 之后。

**来源：** AI Tools Recap
**链接：** https://aitoolsrecap.com/Blog/ai-news-may-8-2026`,
    date: "2026-05-10 12:00",
    source: "AI Tools Recap",
    sourceUrl: "https://aitoolsrecap.com/Blog/ai-news-may-8-2026",
    href: "/news/news-1209",
  },
{
    id: "news-1210",
    tag: "语音 AI",
    tagColor: "bg-purple-500/10 text-purple-300",
    title: "OpenAI 发布三款语音模型 API：GPT-Realtime-2 将 GPT-5 推理能力带入实时语音",
    summary: "OpenAI 通过 API 发布三款语音模型：GPT-Realtime-2（将 GPT-5 级推理能力带入低延迟语音）、GPT-Realtime-Whisper（专注转录工作负载）、GPT-Realtime-Translate（语音到语音翻译）。这是 OpenAI 在语音 API 市场对抗 ElevenLabs 和 Deepgram 的重要布局。",
    content: `## OpenAI 语音三剑客

**2026 年 5 月 8 日**，OpenAI 发布三款语音模型。

### 三款模型
1. **GPT-Realtime-2**：最关键的产品，将 GPT-5 级推理能力应用于低延迟语音交互，这是此前 Realtime API 模型所缺乏的
2. **GPT-Realtime-Whisper**：专为转录工作负载优化
3. **GPT-Realtime-Translate**：语音到语音翻译

### 竞争格局
OpenAI 在语音 API 市场直接与 ElevenLabs、Deepgram 和 AssemblyAI 竞争。ElevenLabs 同日宣布 ARR 突破 5 亿美元并大幅降价。

### 行业意义
GPT-Realtime-2 的发布意味着 AI 语音助手将迎来一轮智能升级——从简单的语音识别+文字回复，升级为具备深度推理能力的实时对话。

**来源：** OpenAI 官方博客 + AI Tools Recap
**链接：** https://aitoolsrecap.com/Blog/ai-news-may-8-2026`,
    date: "2026-05-10 12:00",
    source: "OpenAI 官方博客 + AI Tools Recap",
    sourceUrl: "https://aitoolsrecap.com/Blog/ai-news-may-8-2026",
    href: "/news/news-1210",
  },
{
    id: "news-1211",
    tag: "AI 安全",
    tagColor: "bg-red-500/10 text-red-300",
    title: "OpenAI 发布 GPT-5.5-Cyber：面向安全团队的专用模型，直接对标 Claude Mythos",
    summary: "OpenAI 向经过审查的网络安全团队发布 GPT-5.5-Cyber 有限预览版，这是 GPT-5.5 的安全专用变体，直接回应 Anthropic 的 Claude Mythos Preview（已被用于 Project Glasswing 识别零日漏洞）。目前未公布公开发布时间表。",
    content: `## AI 安全竞赛升级：OpenAI 推出安全专用模型

**2026 年 5 月 8 日**，OpenAI 发布 GPT-5.5-Cyber。

### 核心信息
- **定位**：GPT-5.5 的安全专用变体
- **目标用户**：经过审查的网络安全团队
- **访问方式**：通过独立申请流程，限 qualifying 安全组织
- **直接竞品**：Anthropic Claude Mythos Preview

### 背景
Claude Mythos Preview 已被 Mozilla 用于发现 Firefox 中 423 个安全漏洞。GPT-5.5-Cyber 的发布标志着 AI 安全工具进入专业化竞争阶段。

### 公开发布
OpenAI 尚未确认 GPT-5.5-Cyber 的公开发布时间表。

**来源：** OpenAI + AI Tools Recap
**链接：** https://aitoolsrecap.com/Blog/ai-news-may-8-2026`,
    date: "2026-05-10 12:00",
    source: "OpenAI + AI Tools Recap",
    sourceUrl: "https://aitoolsrecap.com/Blog/ai-news-may-8-2026",
    href: "/news/news-1211",
  },
{
    id: "news-1212",
    tag: "语音 AI",
    tagColor: "bg-violet-500/10 text-violet-300",
    title: "ElevenLabs 年化收入突破 5 亿美元：语音 AI 价格战全面打响",
    summary: "ElevenLabs 在 D 轮融资后报告年化收入突破 5 亿美元，同时宣布大幅削减语音和智能体 API 服务价格。降价针对大规模构建语音智能体的开发者，直接对标 OpenAI Realtime API 和 PlayAI。",
    content: `## ElevenLabs：语音 AI 的 5 亿美元里程碑

**2026 年 5 月 8 日**，ElevenLabs 报告最新业绩。

### 核心数据
- **年化收入**：突破 5 亿美元
- **融资轮次**：D 轮
- **降价策略**：大幅削减语音和智能体 API 价格
- **降价范围**：按字符和按分钟计费层级均有调整

### 竞争格局
ElevenLabs 正积极对抗 OpenAI Realtime API 和 PlayAI 等竞争对手。语音 AI 市场正在经历价格战，这对开发者和企业是利好消息。

### 行业趋势
随着 OpenAI 同日发布三款语音模型，语音 AI 市场进入白热化竞争阶段。

**来源：** AI Tools Recap
**链接：** https://aitoolsrecap.com/Blog/ai-news-may-8-2026`,
    date: "2026-05-10 12:00",
    source: "AI Tools Recap",
    sourceUrl: "https://aitoolsrecap.com/Blog/ai-news-may-8-2026",
    href: "/news/news-1212",
  },
{
    id: "news-1213",
    tag: "AI 政策",
    tagColor: "bg-orange-500/10 text-orange-300",
    title: "白宫起草行政令：AI 模型发布前需经审核，类比 FDA 药物审批",
    summary: "白宫国家经济委员会主任 Kevin Hassett 确认正在起草行政令，要求 AI 模型在公开发布前必须经过审核，直接类比 FDA 药物审批流程。此举是对 Anthropic Mythos 模型双用途风险的直接回应，商务部已扩大自愿预发布测试计划。",
    content: `## AI 监管升级：白宫推动「FDA 式」模型审核

**2026 年 5 月 7 日**，白宫确认起草 AI 模型预发布审核行政令。

### 核心内容
- **审核机制**：类比 FDA 药物审批流程
- **触发因素**：Anthropic Mythos 模型的双用途风险
- **参与公司**：Google、Microsoft、xAI、OpenAI、Anthropic 均已纳入商务部自愿测试计划
- **紧迫性**：2025-2026 年六支研究团队披露了针对 OpenAI Codex、Claude Code 等工具的安全漏洞

### 行业影响
如果行政令正式生效，将深刻改变 AI 模型的发布流程。模型公司需要在公开发布前提交安全评估，可能延长产品上市时间。

### 同时推进的立法
- 宾夕法尼亚州起诉 Character.AI 误导用户
- 康涅狄格州和艾奥瓦州也在推进 AI 安全立法

**来源：** AI Tools Recap + 白宫新闻
**链接：** https://aitoolsrecap.com/Blog/ai-news-may-8-2026`,
    date: "2026-05-10 12:00",
    source: "AI Tools Recap + 白宫新闻",
    sourceUrl: "https://aitoolsrecap.com/Blog/ai-news-may-8-2026",
    href: "/news/news-1213",
  },
{
    id: "news-1214",
    tag: "行业",
    tagColor: "bg-cyan-500/10 text-cyan-300",
    title: "马斯克宣布 xAI 不再作为独立公司存在：将并入 SpaceX 成为其 AI 产品线",
    summary: "马斯克于 5 月 6 日宣布，xAI 将不再作为独立公司存在，旗下 Grok 等产品将并入 SpaceX 成为其 AI 产品线（SpaceXAI）。同时 SpaceXAI 已与 Anthropic 签署协议，允许后者使用 Colossus 一号超级计算机。不到三年，xAI 作为独立企业的历史画上句号。",
    content: `## xAI 谢幕：马斯克重构 AI 版图

**2026 年 5 月 6-7 日**，马斯克正式宣布 xAI 解散并入 SpaceX。

### 核心变化
- **xAI 不再独立**：成为 SpaceX 的 AI 产品线
- **新名称**：SpaceXAI
- **Grok 定位**：成为太空技术体系中的模块
- **算力资产**：Colossus 等算力资产转为可出租的商业资源
- **与 Anthropic 合作**：SpaceXAI 已签署协议允许 Anthropic 使用 Colossus

### 背景
xAI 于 2023 年 7 月由马斯克创立，推出 Grok 聊天机器人等产品，不到三年即被整合进 SpaceX。

### 行业解读
这一重组反映了马斯克在 AI 算力布局上的战略调整——将算力资产从消耗性投入转为可盈利的商业资源。

**来源：** 新华网 + 北京商报 + 机器之心
**链接：** https://finance.sina.com.cn/tech/2026-05-09/doc-inhxhcxp3800269.shtml`,
    date: "2026-05-10 12:00",
    source: "新华网 + 北京商报 + 机器之心",
    sourceUrl: "https://finance.sina.com.cn/tech/2026-05-09/doc-inhxhcxp3800269.shtml",
    href: "/news/news-1214",
  },
{
    id: "news-1215",
    tag: "AI 工具",
    tagColor: "bg-emerald-500/10 text-emerald-300",
    title: "OpenAI 发布 Codex Chrome 扩展：AI 编程助手可直接在浏览器中操作已登录的网页应用",
    summary: "OpenAI 发布 Codex Chrome 浏览器扩展，允许 Codex 在用户已登录的网站和应用中完成工作任务。支持「任务特定」标签组，用户可同时正常使用活动标签页。需要安装 Chrome 插件才能使用。",
    content: `## Codex 进军浏览器：AI 直接操作 Web 应用

**2026 年 5 月 7 日**，OpenAI 发布 Codex Chrome 扩展。

### 核心功能
- **浏览器内操作**：Codex 可直接在用户已登录的网站中完成任务
- **标签组隔离**：在「任务特定」标签组中工作，不影响用户正常使用
- **身份复用**：利用用户已登录状态，无需重复认证

### 应用场景
- 自动化表单填写
- 数据提取和整理
- 跨平台工作流自动化
- 内部系统操作

### 行业意义
这是 AI 编程工具从「代码生成」向「浏览器操作」的重要扩展。Claude Code 此前已支持浏览器操作，OpenAI 此举跟进。

**来源：** The Verge + Chrome Web Store
**链接：** https://www.theverge.com/ai-artificial-intelligence`,
    date: "2026-05-10 12:00",
    source: "The Verge + Chrome Web Store",
    sourceUrl: "https://www.theverge.com/ai-artificial-intelligence",
    href: "/news/news-1215",
  },
{
    id: "news-1216",
    tag: "AI 政策",
    tagColor: "bg-red-500/10 text-red-300",
    title: "欧盟立法禁止 AI 生成深度伪造色情内容：首次通过立法明确划定「红线」",
    summary: "欧洲议会议员和欧盟成员国就修订《人工智能法案》达成共识，同意禁止 AI 系统生成深度伪造色情内容。这是欧盟首次通过立法明确禁止「脱衣换脸」类应用。同时，高风险 AI 系统的监管实施时间被推迟至 2027 年 12 月。",
    content: `## 欧盟划出 AI 伦理红线

**2026 年 5 月 7 日**，欧盟就 AI 法案修订达成重要共识。

### 核心内容
- **禁止深度伪造色情**：AI 不得生成「脱衣换脸」等色情内容
- **首次立法**：欧盟首次通过立法明确禁止此类应用
- **官方表态**：「AI 绝不能用于羞辱、剥削或危害他人」

### 时间调整
- 独立 AI 系统监管：从 2026 年 8 月推迟至 2027 年 12 月
- 嵌入式 AI 工具：从 2027 年 8 月推迟至 2028 年 8 月

### 行业意义
欧盟正在从两个方向同时推进：加强伦理保护（深度伪造禁令）和给予行业更多缓冲时间（推迟高风险监管）。

**来源：** 新浪 + 欧盟官方
**链接：** https://k.sina.com.cn/article_7857201856_1d45362c00190574pq.html`,
    date: "2026-05-10 12:00",
    source: "新浪 + 欧盟官方",
    sourceUrl: "https://k.sina.com.cn/article_7857201856_1d45362c00190574pq.html",
    href: "/news/news-1216",
  },
{
    id: "news-1217",
    tag: "芯片",
    tagColor: "bg-sky-500/10 text-sky-300",
    title: "英伟达与康宁达成战略合作：最高 27 亿美元投资 AI 光连接，产能提升 10 倍",
    summary: "英伟达与康宁宣布长期战略合作，英伟达通过认股权证方式对康宁最高投资 27 亿美元（首期 5 亿美元）。康宁将在北卡罗来纳州和得克萨斯州新建 3 座先进制造工厂，面向 AI 基础设施的光连接产能提升 10 倍、光纤扩产 50%以上。双方在资本、技术、产能三个层面形成深度绑定。",
    content: `## 英伟达 27 亿美元押注 AI 光连接

**2026 年 5 月 8 日**，英伟达与康宁宣布战略合作。

### 合作细节
- **投资规模**：最高 27 亿美元（首期 5 亿美元）
- **行权价**：每股 180 美元认购 1500 万股康宁普通股
- **新建工厂**：北卡罗来纳州和得克萨斯州共 3 座
- **产能目标**：光连接产能提升 10 倍，光纤扩产 50%+
- **达产时间**：2-3 年内全面达产

### 战略意义
- **深度绑定**：资本、技术、产能三个层面全面合作
- **AI 集群需求**：为 NVIDIA AI 集群供应高性能光纤、连接器及光子组件
- **供应链安全**：减少对单一供应商的依赖

### 行业背景
AI 集群规模不断扩大，光互连成为关键瓶颈。英伟达正在从芯片到光连接构建完整的供应链体系。

**来源：** 新浪 + 英伟达官方
**链接：** https://k.sina.com.cn/article_7857201856_1d45362c00190583fy.html`,
    date: "2026-05-10 12:00",
    source: "新浪 + 英伟达官方",
    sourceUrl: "https://k.sina.com.cn/article_7857201856_1d45362c00190583fy.html",
    href: "/news/news-1217",
  },
{
    id: "news-1218",
    tag: "大语言模型",
    tagColor: "bg-blue-500/10 text-blue-300",
    title: "OpenAI 发布 GPT-5.5 Instant：更智能、更清晰、更个性化",
    summary: "OpenAI 于 5 月 5 日发布 GPT-5.5 Instant，主打「更智能、更清晰、更个性化」。该模型在保持高质量输出的同时提供更快的响应速度和个性化体验。同步发布系统卡，详细说明安全对齐方法。",
    content: `## GPT-5.5 Instant：轻量化但不降质

**2026 年 5 月 5 日**，OpenAI 发布 GPT-5.5 Instant。

### 核心定位
- **更智能**：继承 GPT-5.5 的核心能力
- **更清晰**：输出更精准、简洁
- **更个性化**：支持用户偏好的学习和适配

### 产品组合
OpenAI 当前模型矩阵：
- GPT-5.5：旗舰模型
- GPT-5.5 Instant：快速响应版
- GPT-5.5-Cyber：安全专用版

### 安全对齐
同步发布 GPT-5.5 Instant 系统卡，详细说明安全对齐方法和红队测试结果。

**来源：** OpenAI Blog
**链接：** https://openai.com/index/gpt-5-5-instant/`,
    date: "2026-05-10 12:00",
    source: "OpenAI Blog",
    sourceUrl: "https://openai.com/index/gpt-5-5-instant/",
    href: "/news/news-1218",
  },
{
    id: "news-1219",
    tag: "行业",
    tagColor: "bg-yellow-500/10 text-yellow-300",
    title: "Novo Nordisk 与 OpenAI 达成全面合作：AI 将渗透从药物发现到供应链的所有环节",
    summary: "丹麦制药巨头 Novo Nordisk 宣布与 OpenAI 战略合作，将 AI 整合到全业务链——药物发现、临床试验、制造、供应链和商业运营，计划 2026 年底完成全部部署。目标是加速科学家而非替代科学家，尽管公司承认 AI 将减少某些职能的未来招聘增长。",
    content: `## 制药巨头的全面 AI 转型

**2026 年 5 月 9 日**，Novo Nordisk 宣布与 OpenAI 全面合作。

### 整合范围
- **药物发现**：加速肥胖和糖尿病新疗法识别
- **临床试验**：AI 辅助试验设计和数据分析
- **制造**：生产流程优化
- **供应链**：端到端智能化管理
- **商业运营**：从营销到客户服务的全面 AI 化

### 时间表
2026 年底完成全部部署。

### CEO 表态
CEO Mike Doustdar 强调目标是「加速科学家而非替代科学家」，但公司承认 AI 将减少某些职能的未来招聘增长。

### 竞争背景
Novo Nordisk 正努力夺回被 Eli Lilly 抢占的市场份额，AI 是其关键武器。

**来源：** AI Tools Recap + PYMNTS
**链接：** https://aitoolsrecap.com/Blog/ai-news-may-9-2026`,
    date: "2026-05-10 12:00",
    source: "AI Tools Recap + PYMNTS",
    sourceUrl: "https://aitoolsrecap.com/Blog/ai-news-may-9-2026",
    href: "/news/news-1219",
  },
{
    id: "news-1220",
    tag: "AI 安全",
    tagColor: "bg-rose-500/10 text-rose-300",
    title: "五眼联盟发布智能体 AI 安全指南：关键基础设施部署需渐进式推进 + 严格人工监督",
    summary: "美国、澳大利亚、加拿大、新西兰和英国的情报和网络安全机构联合发布「Careful Adoption of Agentic AI Services」指南，针对关键基础设施和国防中部署的智能体 AI 系统提出安全建议。识别五大风险类别：权限、设计与配置、行为、结构和问责，强调渐进式部署、强治理和严格人工监督。",
    content: `## 五眼联盟：智能体 AI 安全五大风险

**2026 年 5 月 9 日**，五眼联盟联合发布智能体 AI 安全指南。

### 五大风险类别
1. **权限风险**：AI 智能体获得过多系统权限
2. **设计与配置风险**：架构和配置缺陷
3. **行为风险**：不可预测的智能体行为
4. **结构风险**：系统层面的脆弱性
5. **问责风险**：AI 决策的责任归属不清晰

### 核心建议
- **渐进式部署**：不要一步到位全面上线
- **强治理框架**：建立明确的 AI 使用规则
- **严格人工监督**：关键决策必须有人工审核环节

### 背景
本周披露了多起针对 AI 编码工具的凭证和 Token 漏洞利用事件，进一步凸显了智能体 AI 的安全风险。

**来源：** AI Tools Recap + 五眼联盟官方
**链接：** https://aitoolsrecap.com/Blog/ai-news-may-9-2026`,
    date: "2026-05-10 12:00",
    source: "AI Tools Recap + 五眼联盟官方",
    sourceUrl: "https://aitoolsrecap.com/Blog/ai-news-may-9-2026",
    href: "/news/news-1220",
  }
];

const content = readFileSync(newsFile, 'utf-8');

// Find the end of the array
const arrEndIdx = content.lastIndexOf('];');
if (arrEndIdx === -1) {
  console.error('❌ 无法找到 news 数组结尾');
  process.exit(1);
}

// Insert new entries before ];
const before = content.substring(0, arrEndIdx);
const after = content.substring(arrEndIdx);

const newEntries = newNews.map(n => {
  return `{\n    id: "${n.id}",\n    tag: "${n.tag}",\n    tagColor: "${n.tagColor}",\n    title: "${n.title}",\n    summary: "${n.summary}",\n    content: \`${n.content}\`,\n    date: "${n.date}",\n    source: "${n.source}",\n    sourceUrl: "${n.sourceUrl}",\n    href: "${n.href}",\n  }`;
}).join(',\n');

const updated = before + ',\n' + newEntries + '\n' + after;
writeFileSync(newsFile, updated, 'utf-8');

console.log(`✅ 已追加 ${newNews.length} 条新闻 (news-1206 ~ news-1220)`);
