import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const newsFile = join(__dirname, '..', 'src', 'data', 'news.ts');
let content = readFileSync(newsFile, 'utf-8');

const newEntries = `
  {
    id: "news-1079",
    tag: "大语言模型",
    title: "Anthropic Code w/ Claude 2026 大会：Colossus 数据中心合作 + Claude 应用爆发",
    summary: "Anthropic 举办年度 Code w/ Claude 大会，宣布与 SpaceX/xAI 合作使用 Colossus 数据中心全部容量，同时披露 ARR 同比增速达 80 倍，已触发系统过载保护。",
    content: \`Anthropic 在 Code w/ Claude 2026 大会上发布了多项重磅消息。

### 核心发布

- **Colossus 合作**：Anthropic 与 SpaceX/xAI 达成合作，将使用 Colossus 数据中心的"全部容量"
- **ARR 80 倍增速**：CEO Dario Amodei 披露公司年度经常性收入同比增长 80 倍，增速之快触发系统过载保护
- **Claude Mythos 安全成果**：Mozilla 借助 Claude Mythos 预览版在 4 月修复了 423 个 Firefox 安全漏洞（此前每月仅 20-30 个）

### 安全领域突破

- Mozilla 分享了使用 AI 进行安全审计的详细经验
- 发现 20 年历史的 XSLT 漏洞和 15 年历史的 <legend> 元素漏洞
- AI 安全报告质量从"看似正确但错误"转变为"信号丰富"，得益于模型能力提升和提示技术改进

### 行业影响

- Anthropic 正以惊人速度侵蚀 OpenAI 市场份额
- 从"AI 辅助编程"到"AI 发现安全漏洞"的应用范式扩展
- 与 Anthropic 此前 9000 亿美元估值、谷歌承诺 400 亿美元投资形成完整图景

**来源：** Simon Willison + The Verge + Hacker News + Mozilla Blog
**链接：** https://simonwillison.net/2026/May/7/xai-anthropic/\`,
    date: "2026-05-08 23:00",
    source: "Simon Willison + The Verge + Mozilla",
    sourceUrl: "https://simonwillison.net/2026/May/7/xai-anthropic/",
    href: "/news/news-1079",
  },
  {
    id: "news-1080",
    tag: "大语言模型",
    title: "DeepSeek 拟融资 500 亿元：6 月推出 V4.1 重大升级",
    summary: "据新浪科技、凤凰网等多家信源确认，DeepSeek 正启动新一轮融资，目标约 500 亿元人民币，同时 V4.1 大模型计划 6 月发布。",
    content: \`DeepSeek 的融资进程正在加速推进。

### 融资详情

- **融资金额**：目标约 500 亿元人民币（约 70 亿美元）
- **背景**：此前已启动首轮外部融资，估值约 450 亿美元
- **投资方**：国家集成电路产业投资基金参与洽谈

### 产品路线图

- **V4.1 计划**：6 月推出重大升级版本
- **V4 预览版**：此前发布 1.6 万亿参数版本，支持 100 万 Token 上下文
- **开源策略**：继续坚持开源路线，降低行业使用门槛

### 市场动态

- DeepSeek 网页及 API 服务近期出现异常，官方称正在修复
- 与 Kimi（月之暗面）20 亿美元融资、Anthropic 9000 亿美元估值共同构成中国 + 全球 AI 融资热潮
- 中国 AI 公司正式进入"千亿美元俱乐部"备战期

**来源：** 新浪科技 + 凤凰网科技 + 机器之心
**链接：** https://finance.sina.com.cn/tech/2026-05-08/doc-inhxewec4337137.shtml\`,
    date: "2026-05-08 23:00",
    source: "新浪科技 + 凤凰网科技",
    sourceUrl: "https://finance.sina.com.cn/tech/2026-05-08/doc-inhxewec4337137.shtml",
    href: "/news/news-1080",
  },
  {
    id: "news-1081",
    tag: "行业",
    title: "OpenAI 推出 GPT-5.5 网络安全版：联合 Trusted Access for Cyber 计划",
    summary: "OpenAI 发布 GPT-5.5 网络安全专用版本，与 Trusted Access for Cyber 计划结合，面向网络安全行业提供增强能力。",
    content: \`OpenAI 在 5 月 7 日连续发布多项产品更新。

### GPT-5.5 Cybersecurity

- **专用版本**：针对网络安全场景优化的 GPT-5.5
- **Trusted Access**：与 Trusted Access for Cyber 计划整合
- **应用场景**：威胁检测、安全审计、漏洞分析

### 同日其他发布

- **语音 API 新模型**：推进语音智能化，新增 API 模型
- **Trusted Contact 功能**：ChatGPT 新增"可信联系人"安全功能
- **ChatGPT Futures Class of 2026**：年度会员回顾，展示 ChatGPT 生态年度发展

### 行业动态

- OpenAI 同日测试 ChatGPT 广告（5 月 7 日发布），探索商业化新路径
- GPT-5.5 Instant 此前已全量上线，幻觉率降低 52%，速度提升 30%

**来源：** OpenAI Blog
**链接：** https://openai.com/index/gpt-5-5-with-trusted-access-for-cyber/\`,
    date: "2026-05-08 23:00",
    source: "OpenAI Blog",
    sourceUrl: "https://openai.com/index/gpt-5-5-with-trusted-access-for-cyber/",
    href: "/news/news-1081",
  },
  {
    id: "news-1082",
    tag: "行业",
    title: "OpenAI 开始在 ChatGPT 中测试广告：商业化探索迈出关键一步",
    summary: "OpenAI 官方宣布在 ChatGPT 中测试广告功能，这是 ChatGPT 首次引入广告，标志着 OpenAI 在商业化道路上的重要转变。",
    content: \`OpenAI 的商业模式正在发生重要变化。

### 广告测试

- **官方确认**：5 月 7 日通过公司博客正式宣布
- **测试阶段**：初期在 ChatGPT 中测试广告展示
- **目的**：探索免费用户的变现路径

### 背景

- ChatGPT 拥有数亿月活用户，免费用户占比巨大
- 此前主要依赖订阅收入（Plus/Pro/Enterprise）
- 北美科技巨头 AI 投资达 7250 亿美元，回报压力增大

### 行业反应

- 广告模式可能影响用户体验，需要谨慎平衡
- 与 Google Gemini 的免费广告模式竞争加剧
- 引发对 AI 聊天机器人是否应该展示广告的伦理讨论

**来源：** OpenAI Blog + The Verge
**链接：** https://openai.com/index/testing-ads-in-chatgpt/\`,
    date: "2026-05-08 23:00",
    source: "OpenAI Blog + The Verge",
    sourceUrl: "https://openai.com/index/testing-ads-in-chatgpt/",
    href: "/news/news-1082",
  },
  {
    id: "news-1083",
    tag: "芯片",
    title: "索尼与 TSMC 合资成立图像传感器公司：探索物理 AI 应用",
    summary: "索尼与台积电宣布成立合资企业，结合索尼的传感器设计能力和 TSMC 的制造优势，重点开发下一代图像传感器并探索机器人和汽车领域的物理 AI 应用。",
    content: \`两大半导体巨头联手布局物理 AI。

### 合资详情

- **索尼主导**：合资企业由索尼控股多数
- **分工**：索尼负责传感器设计，TSMC 负责制造
- **应用方向**：下一代图像传感器 + 物理 AI（机器人 + 汽车）

### 物理 AI 趋势

- 物理 AI 指 AI 与物理世界的交互（自动驾驶、机器人视觉）
- 图像传感器是物理 AI 的"眼睛"
- 与 Anthropic CEO 所述"空间智能是 AI 下一个前沿"观点呼应

### 行业背景

- 多家企业为确保芯片产能，正提出为 SK 海力士提供产能扩充资金
- AI 芯片需求持续爆发，从 GPU 扩展到传感器等专用芯片
- CoreWeave Q4 业绩显示 AI 算力公司增收不增利，行业面临盈利挑战

**来源：** The Verge + TSMC 官方新闻
**链接：** https://pr.tsmc.com/english/news/3308\`,
    date: "2026-05-08 23:00",
    source: "The Verge + TSMC",
    sourceUrl: "https://pr.tsmc.com/english/news/3308",
    href: "/news/news-1083",
  },
  {
    id: "news-1084",
    tag: "应用",
    title: "Google 升级 Gmail '帮我写'：AI 可根据你的语气和风格个性化生成邮件",
    summary: "Google 宣布升级 Gmail 中的'帮我写'AI 功能，新能力可根据用户的写作语气和风格生成个性化邮件，并可从 Google Drive 和 Gmail 中提取相关上下文。",
    content: \`Google 正在让 Gmail 的 AI 写作更个性化。

### 新功能

- **语气匹配**：AI 学习用户的写作风格，生成更贴近个人的邮件
- **上下文提取**：根据提示从 Google Drive 和 Gmail 自动提取相关信息
- **正式发布**：Google Workspace 官方博客宣布推广

### 产品意义

- 从"通用 AI 写作"到"个性化 AI 写作"的范式转变
- 企业用户对邮件个性化需求强烈
- 与 OpenAI Codex Chrome 扩展形成对比：Google 做内置 AI，OpenAI 做浏览器级 AI

### Google AI 生态

- Gemini Enterprise Agent Platform 已在 Google Cloud Next 2026 发布
- Gemini 3.1 / Lyria 3 / Nano Banana 2 同步推出
- Google AI 搜索开始引用 Reddit 等社区内容

**来源：** The Verge + Google Workspace Blog
**链接：** https://workspaceupdates.googleblog.com/2026/05/improvements-to-help-me-write-in-gmail.html\`,
    date: "2026-05-08 23:00",
    source: "The Verge + Google Workspace",
    sourceUrl: "https://workspaceupdates.googleblog.com/2026/05/improvements-to-help-me-write-in-gmail.html",
    href: "/news/news-1084",
  },
  {
    id: "news-1085",
    tag: "行业",
    title: "CoreWeave Q4 增收不增利：手握 6800 亿订单但股价一天跌掉 300 亿",
    summary: "AI 算力公司 CoreWeave 四季度营收增长但利润不佳，疲软业绩指引导致股价大幅下挫，反映 AI 基础设施投资回报面临挑战。",
    content: \`AI 算力投资的回报问题日益受到关注。

### 业绩表现

- **营收增长**：Q4 营收持续增长
- **利润不佳**：增收不增利，盈利能力承压
- **指引疲软**：未来业绩展望低于市场预期
- **股价暴跌**：单日市值蒸发约 300 亿元

### 行业背景

- 手握 6800 亿订单，但市场关注实际利润
- 与 Cloudflare 裁员 1100 人（AI 使用增长 600%）共同反映 AI 效率提升带来的用工结构变化
- 北美科技巨头 7250 亿美元 AI 投资正在挤压利润空间

### 对比分析

- Datadog Q1 业绩超预期并大幅上调全年指引（受益于 AI 需求激增）
- AI 监控和运维类公司表现优于纯算力公司
- 市场开始区分"真赚钱的 AI 公司"和"只花钱的 AI 公司"

**来源：** 新浪科技 + 凤凰网科技
**链接：** https://finance.sina.com.cn/stock/usstock/c/2026-05-08/doc-inhxewcz2151759.shtml\`,
    date: "2026-05-08 23:00",
    source: "新浪科技 + 凤凰网科技",
    sourceUrl: "https://tech.ifeng.com/c/8sxsphyJHzH",
    href: "/news/news-1085",
  },
  {
    id: "news-1086",
    tag: "开源项目",
    title: "GitHub 周榜爆发：TradingAgents 7.1 万星 + OpenAI Symphony 2.2 万星",
    summary: "GitHub 周趋势榜单显示 AI Agent 项目爆发：TradingAgents 以 71,606 星领跑，OpenAI 新开源项目 Symphony 首周即获 22,586 星，Agent 编排平台 ruflo 一周增长 11,930 星。",
    content: \`本周 GitHub 趋势榜被 AI Agent 项目全面占领。

### Top 项目

- **TradingAgents**（71,606 ★）：多 Agent LLM 金融交易框架，本周新增 14,322 星
- **mattpocock/skills**（66,130 ★）：工程师实战技能库，本周新增 16,579 星
- **warp**（56,672 ★）：Agentic 终端开发环境，本周新增 8,625 星
- **maigret**（26,494 ★）：用户名 OSINT 信息收集工具，本周新增 5,580 星
- **dexter**（24,833 ★）：自主深度金融研究 Agent
- **OpenAI Symphony**（22,586 ★）：OpenAI 新开源项目，将项目工作转化为自主实现运行
- **financial-services**（13,994 ★）：Anthropic 官方金融服务业示例
- **Pixelle-Video**（13,676 ★）：AI 全自动短视频引擎（AIDC-AI）

### 趋势分析

- AI Agent 从"聊天机器人"进化为"自主执行任务的工作流"
- 金融领域成为 AI Agent 落地最活跃的赛道
- OpenAI 开源策略加速（Symphony 是其首个大规模开源编排项目）
- 中国 AI 项目 Pixelle-Video 进入全球趋势榜

**来源：** GitHub Trending
**链接：** https://github.com/trending?since=weekly\`,
    date: "2026-05-08 23:00",
    source: "GitHub Trending",
    sourceUrl: "https://github.com/trending?since=weekly",
    href: "/news/news-1086",
  },
  {
    id: "news-1087",
    tag: "行业",
    title: "美国政府涉 AI 监管释放混乱信号：科技界表达担忧",
    summary: "美国政府在人工智能监管方面释放混乱信号，政策方向不明确引发科技行业担忧，可能影响 AI 创新和安全之间的平衡。",
    content: \`美国 AI 监管政策方向引发行业关注。

### 政策动态

- **信号混乱**：不同政府部门对 AI 监管态度不一
- **科技界担忧**：行业担忧政策不确定性影响创新
- **联邦层面**：要求月活超 1 亿的 AI 平台向政府报备训练数据来源

### 对比中国

- 中国 AI 治理路径日益清晰，国务院 2025 年 8 月印发"人工智能+"行动意见
- 上海启动国家数据领域国际合作首批试点
- 世界经济论坛称"中国正在引领全球 AI 治理"

### 全球监管趋势

- 欧盟《人工智能法案》大部分规则将于 2026 年 8 月生效
- 宾夕法尼亚州起诉 Character.AI，指控其 AI 聊天机器人冒充医生
- 金球奖发布 AI 使用规则：表演须主要由真人完成，但 AI 可用于技术增强

**来源：** 新浪科技 + The Verge
**链接：** https://finance.sina.com.cn/stock/usstock/c/2026-05-08/doc-inhxewcz7580729.shtml\`,
    date: "2026-05-08 23:00",
    source: "新浪科技 + The Verge",
    sourceUrl: "https://finance.sina.com.cn/stock/usstock/c/2026-05-08/doc-inhxewcz7580729.shtml",
    href: "/news/news-1087",
  },
  {
    id: "news-1088",
    tag: "行业",
    title: "美图 Q1 财报证伪'模型吞噬'论：本周涨超 25%，AI 应用商业化成功",
    summary: "美图发布超预期的一季报后股价本周涨超 25%，市场认为这证伪了'大模型将吞噬应用层公司'的论断，AI 应用公司商业化能力得到验证。",
    content: \`美图用业绩回应了 AI 行业的一个核心争议。

### 业绩表现

- **股价涨幅**：本周涨超 25%
- **核心逻辑**：一季报证伪"模型吞噬"论
- **市场反应**：投资者重新评估 AI 应用层公司价值

### 行业意义

- "模型吞噬应用"曾是市场主流担忧：大模型公司直接做应用
- 美图证明垂直 AI 应用有独立商业价值
- 与豆包推出付费订阅（68 元/月）共同验证中国 AI 商业化转型

### 相关动态

- Datadog Q1 业绩超预期（AI 需求驱动）
- AI 监控运维公司表现优于纯算力公司
- 市场开始区分"AI 工具"和"AI 平台"的投资价值

**来源：** 新浪科技
**链接：** https://finance.sina.com.cn/tech/2026-05-08/doc-inhxerwc7615040.shtml\`,
    date: "2026-05-08 23:00",
    source: "新浪科技",
    sourceUrl: "https://finance.sina.com.cn/tech/2026-05-08/doc-inhxerwc7615040.shtml",
    href: "/news/news-1088",
  },
`;

// Find the position to insert: before "  ] as NewsItem[];"
const insertMarker = '  ] as NewsItem[];';
const insertPos = content.lastIndexOf(insertMarker);

if (insertPos === -1) {
  console.error('❌ 找不到插入位置');
  process.exit(1);
}

const before = content.substring(0, insertPos);
const after = content.substring(insertPos);

const newContent = before + newEntries + after;
writeFileSync(newsFile, newContent, 'utf-8');

console.log('✅ 成功添加 10 条新闻（news-1079 ~ news-1088）');
