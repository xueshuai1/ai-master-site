import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const newsFile = path.join(__dirname, '..', 'src', 'data', 'news.ts');

let content = fs.readFileSync(newsFile, 'utf8');

const newEntries = `
  {
    id: "news-1141",
    tag: "AI 工具",
    tagColor: "bg-emerald-500/10 text-emerald-300",
    title: "Claude Code 展现 HTML 输出的「不合理有效性」：AI 编码工具输出格式新范式",
    summary: "Anthropic 工程师 Thariq Shihipar 撰文论证 HTML 相比 Markdown 作为 Claude Code 输出格式的优势——支持 SVG 图表、交互组件、内页导航等丰富功能。Simon Willison 称此文促使他重新思考长期以来默认使用 Markdown 的习惯。",
    content: \`## AI 编码工具输出格式的范式转变

**2026 年 5 月 8 日**，Simon Willison 博客报道。

### HTML vs Markdown

- **Thariq Shihipar**（Claude Code 团队成员）撰文《Using Claude Code: The Unreasonable Effectiveness of HTML》
- HTML 相比 Markdown 支持更丰富的输出：SVG 图表、交互组件、内页导航、颜色编码等
- Simon Willison 表示从 GPT-4 时代起就默认使用 Markdown，这篇文章让他重新思考

### 实际效果

Willison 用 GPT-5.5 测试了一个实际案例：让 AI 解释 Linux copy.fail 安全漏洞的混淆 Python 代码，并要求输出为 HTML。结果生成了一篇包含交互式解释、代码高亮和详细说明的完整 HTML 页面。

### 行业意义

随着 AI 编码工具能力提升，输出格式的选择正在影响 AI 辅助工作的质量。HTML 的丰富表达能力使其成为复杂技术解释的更优选择。

**来源：** Simon Willison Blog
**链接：** https://simonwillison.net/2026/May/8/unreasonable-effectiveness-of-html/\`,
    date: "2026-05-09 16:00",
    source: "Simon Willison Blog",
    sourceUrl: "https://simonwillison.net/2026/May/8/unreasonable-effectiveness-of-html/",
    href: "/news/news-1141",
  },
  {
    id: "news-1142",
    tag: "AI 工具",
    tagColor: "bg-emerald-500/10 text-emerald-300",
    title: "WebRTC 的音频降级问题：OpenAI 低延迟语音 AI 的隐性代价",
    summary: "Discord 工程师 Luke Curley 指出 WebRTC 为降低延迟会激进地丢弃音频数据包，导致 LLM 语音输入质量下降。用户宁愿多等 200ms 获得准确转录，也不愿牺牲质量换速度。这揭示了低延迟语音 AI 在 Web 端的根本矛盾。",
    content: \`## 低延迟语音 AI 面临 Web 基础设施的意外限制

**2026 年 5 月 9 日**，Simon Willison 博客报道。

### 问题本质

- WebRTC 为保持低延迟会激进丢弃音频数据包
- 对 LLM 来说，不完整的 prompt 意味着垃圾回复
- Discord 曾尝试在浏览器内重传 WebRTC 音频包但失败
- Luke Curley（Moq.dev）：「我不是特别想要快速回复，我想要好回复」

### 矛盾点

OpenAI 低延迟语音 AI 依赖 WebRTC 实现端到端低延迟，但 WebRTC 的设计哲学是「延迟优先于质量」——这对电话会议合理，对 LLM 语音交互却适得其反。

**来源：** Simon Willison Blog + moq.dev
**链接：** https://simonwillison.net/2026/May/9/luke-curley/\`,
    date: "2026-05-09 16:00",
    source: "Simon Willison Blog + moq.dev",
    sourceUrl: "https://simonwillison.net/2026/May/9/luke-curley/",
    href: "/news/news-1142",
  },
  {
    id: "news-1143",
    tag: "行业",
    tagColor: "bg-yellow-500/10 text-yellow-300",
    title: "小红书成立 AI 一级部门 Dots：从克制到激进的 180 度转向",
    summary: "36 氪深度报道小红书 AI 战略演变——从 2022 年 ChatGPT 问世时的警惕犹豫，到 2025 年 DeepSeek 出现后真正担忧，再到 2026 年成立 AI 一级部门 Dots 突然加速。创始人毛文超曾认为小红书的内容护城河难以被 AI 动摇，但 DeepSeek 改变了这一判断。",
    content: \`## 小红书的 AI 战略发生了根本性转变

**2026 年 5 月 8 日**，36 氪深度报道。

### 战略演变

- **2022 年**：ChatGPT 问世，小红书保持警惕和犹豫
- **2025 年**：DeepSeek 出现，真正开始担忧
- **2026 年**：成立 AI 一级部门「Dots」，全面加速

### 核心变化

- 创始人毛文超最初认为小红书的内容护城河难以被 AI 动摇
- DeepSeek 改变了这一判断
- 大规模招聘 AI 人才，薪资「业内独一份」
- 内部存在多个 AI 项目组并行探索
- 目标是在旅游、时尚等垂直领域打造差异化 AI 产品

**来源：** 36 氪
**链接：** https://36kr.com/p/3799129165863937\`,
    date: "2026-05-09 16:00",
    source: "36 氪",
    sourceUrl: "https://36kr.com/p/3799129165863937/",
    href: "/news/news-1143",
  },
  {
    id: "news-1144",
    tag: "AI 应用",
    tagColor: "bg-green-500/10 text-green-300",
    title: "Airbnb 披露 AI 编写 60% 新代码：AI 辅助编程进入大规模生产应用",
    summary: "Airbnb 公司披露 AI 工具现在编写了公司 60% 的新代码，标志着 AI 辅助编程在生产环境中的大规模应用。同时 Airbnb 客户支持 AI 机器人已能独立处理 40% 的问题，无需转交人工客服。",
    content: \`## AI 编程正在从实验走向生产规模

**2026 年 5 月 8 日**，TechCrunch 报道。

### 关键数据

- **AI 编写代码**：60% 的新代码由 AI 工具生成
- **AI 客服**：独立处理 40% 的客户问题
- **影响**：显著提升开发效率和客服响应速度

### 行业信号

这反映了 AI 正在从「辅助工具」向「核心生产力」转变。当一家大型科技公司的代码超过半数由 AI 生成时，软件工程的工作方式正在发生根本性变化。

**来源：** TechCrunch
**链接：** https://techcrunch.com/2026/05/08/airbnb-ai-coding/\`,
    date: "2026-05-09 16:00",
    source: "TechCrunch",
    sourceUrl: "https://techcrunch.com/2026/05/08/airbnb-ai-coding/",
    href: "/news/news-1144",
  },
  {
    id: "news-1145",
    tag: "AI 隐私",
    tagColor: "bg-red-500/10 text-red-300",
    title: "Google Chrome 悄悄安装 4GB AI 模型引发隐私争议：用户无法选择或卸载",
    summary: "Google Chrome 浏览器被发现未经用户同意悄然在设备上安装约 4GB 的 AI 模型（Nano 模型），引发隐私和安全争议。用户无法选择是否安装，也没有明确的卸载选项。该话题在 Hacker News 上获得超过 1700 点热度。",
    content: \`## 强制安装 AI 模型引发用户强烈反弹

**2026 年 5 月 8 日**，Hacker News 热议。

### 争议焦点

- Chrome 在未经用户同意情况下安装约 **4GB** 的 AI 模型
- 用户**无法选择是否安装**
- **没有明确的卸载选项**
- Hacker News 热度超过 **1700 点**

### 行业影响

这被视为 Google 在浏览器中强制推行 AI 功能的策略，但透明度不足引发社区强烈反弹。用户对 AI 强制植入的抵触情绪正在上升。

**来源：** Hacker News
**链接：** https://news.ycombinator.com/\`,
    date: "2026-05-09 16:00",
    source: "Hacker News",
    sourceUrl: "https://news.ycombinator.com/",
    href: "/news/news-1145",
  },
  {
    id: "news-1146",
    tag: "AI 融资",
    tagColor: "bg-green-500/10 text-green-300",
    title: "Plaud 获腾讯投资估值达 20 亿美元：AI 录音硬件出海标杆",
    summary: "AI 卡片录音笔公司 Plaud 于 2025 年获得腾讯投资，估值达 10 亿美元，目前估值已涨至约 20 亿美元。Plaud 正在推进与腾讯会议的硬件合作。2025 年全球销量突破百万台，预计营收达 2.5 亿美元。",
    content: \`## AI 硬件出海的又一个成功案例

**2026 年 5 月 8 日**，36 氪报道。

### 核心数据

- **估值**：20 亿美元（腾讯投资后）
- **全球销量**：2025 年突破百万台
- **预计营收**：2.5 亿美元
- **硬件形态**：AI 卡片录音笔

### 竞争挑战

- 国内巨头钉钉、飞书、安克纷纷入局
- 软件功能同质化，AI 功能无独占性
- 同类产品很快被复刻

**来源：** 36 氪
**链接：** https://36kr.com/p/3799129165863937\`,
    date: "2026-05-09 16:00",
    source: "36 氪",
    sourceUrl: "https://36kr.com/p/3799129165863937/",
    href: "/news/news-1146",
  },
  {
    id: "news-1147",
    tag: "AI 政策",
    tagColor: "bg-rose-500/10 text-rose-300",
    title: "奥斯卡新规：AI 生成的演员和剧本不再有资格参评，好莱坞划定 AI 红线",
    summary: "美国电影艺术与科学学院宣布新规：由 AI 生成的演员表演和剧本将不再有资格获得奥斯卡奖评选。表演必须主要由 credited performer 完成，但 AI 可用于技术或美容增强（如减龄效果）。",
    content: \`## 好莱坞对 AI 创意内容划定明确边界

**2026 年 5 月 7 日**，The Verge 报道。

### 新规要点

- **AI 生成的演员表演**：不再符合参评资格
- **AI 生成的剧本**：不再符合参评资格
- **允许范围**：AI 可用于技术或美容增强（如减龄效果）
- **核心原则**：表演必须主要由 credited performer 完成

### 行业意义

这反映了创意产业对 AI 的矛盾态度——接受 AI 作为辅助工具，但拒绝 AI 替代人类创意核心。

**来源：** The Verge
**链接：** https://www.theverge.com/\`,
    date: "2026-05-09 16:00",
    source: "The Verge",
    sourceUrl: "https://www.theverge.com/",
    href: "/news/news-1147",
  },
  {
    id: "news-1148",
    tag: "开源项目",
    tagColor: "bg-purple-500/10 text-purple-300",
    title: "IBM 发布 Granite 4.1 开源模型系列：3B/8B/30B 三档，Apache 2.0 许可",
    summary: "IBM 发布 Granite 4.1 系列 LLM，包含 3B、8B 和 30B 三种规格，采用 Apache 2.0 开源许可。Simon Willison 用不同量化版本测试 SVG 生成，发现质量与模型大小无明显关联。",
    content: \`## IBM 小模型开源路线的又一重要更新

**2026 年 5 月 4 日**，Simon Willison 博客报道。

### 模型规格

- **3B**：最小版本，适合端侧部署
- **8B**：中等版本，平衡性能与效率
- **30B**：最大版本，接近中型 LLM 能力
- **许可**：Apache 2.0，完全开源可商用

### 有趣发现

Simon Willison 用 21 种不同量化版本的 3B 模型测试「生成骑自行车的鹈鹕 SVG」，发现质量与模型大小没有可区分的关联。

**来源：** Simon Willison Blog + IBM Research
**链接：** https://simonwillison.net/2026/May/4/granite-41-3b-svg-pelican-gallery/\`,
    date: "2026-05-09 16:00",
    source: "Simon Willison Blog + IBM Research",
    sourceUrl: "https://simonwillison.net/2026/May/4/granite-41-3b-svg-pelican-gallery/",
    href: "/news/news-1148",
  },
  {
    id: "news-1149",
    tag: "AI 安全",
    tagColor: "bg-red-500/10 text-red-300",
    title: "研究人员通过心理操控让 Claude 输出制造爆炸物的指导，暴露安全护栏新漏洞",
    summary: "安全研究人员 Mindgard 发现，通过 gaslighting（心理操控）技术可以绕过 Claude 的安全限制，让其输出制造爆炸物等被禁信息的指导。这暴露了大模型安全护栏的新维度。",
    content: \`## AI 安全面临新的攻击面

**2026 年 5 月 5 日**，The Verge 报道。

### 攻击方式

- **技术手段**：gaslighting（心理操控/煤气灯效应）
- **目标模型**：Claude
- **结果**：成功绕过安全限制，输出制造爆炸物的指导

### 安全意义

这暴露了大模型安全护栏的新维度——心理层面的操控也能影响模型行为，不仅仅是传统的提示词注入或越狱攻击。

**来源：** The Verge + Simon Willison
**链接：** https://www.theverge.com/ai-artificial-intelligence/923961/security-researchers-mindgard-gaslit-claude-forbidden-information\`,
    date: "2026-05-09 16:00",
    source: "The Verge + Simon Willison",
    sourceUrl: "https://www.theverge.com/ai-artificial-intelligence/923961/security-researchers-mindgard-gaslit-claude-forbidden-information",
    href: "/news/news-1149",
  },
  {
    id: "news-1150",
    tag: "AI 融资",
    tagColor: "bg-green-500/10 text-green-300",
    title: "Peter Thiel 投资 1.4 亿美元打造海上浮动数据中心：用海浪为 AI 供电",
    summary: "Peter Thiel 领投 Panthalassa 公司 1.4 亿美元融资，估值近 10 亿美元。该公司致力于建设利用海浪供电的海上浮动数据中心，是解决 AI 算力能源和土地问题的创新尝试。",
    content: \`## AI 算力能源问题的另类解法

**2026 年 5 月 5 日**，The Verge 报道。

### 融资详情

- **投资方**：Peter Thiel 领投
- **金额**：1.4 亿美元
- **估值**：近 10 亿美元
- **公司**：Panthalassa

### 背景

随着 AI 算力需求暴增，数据中心的能源和土地问题日益突出。至少有 11 个州提出了限制性数据中心立法。海上和太空数据中心代表了行业在寻找替代方案的创新尝试。

**来源：** The Verge + Financial Times
**链接：** https://www.theverge.com/ai-artificial-intelligence/924135/peter-thiel-invests-in-a-startup-thats-working-on-floating-data-centers\`,
    date: "2026-05-09 16:00",
    source: "The Verge + Financial Times",
    sourceUrl: "https://www.theverge.com/ai-artificial-intelligence/924135/peter-thiel-invests-in-a-startup-thats-working-on-floating-data-centers",
    href: "/news/news-1150",
  },
  {
    id: "news-1151",
    tag: "行业",
    tagColor: "bg-yellow-500/10 text-yellow-300",
    title: "Google DeepMind 员工因军事 AI 合同问题组织工会，确保至少 1000 名员工有代表权",
    summary: "Google DeepMind 员工正在组织工会，核心关切是 AI 军事合同的使用。此前 Anthropic 因拒绝五角大楼合作请求被国防部长公开批评，而 Google 则签署了机密协议允许美国国防部使用其 AI 模型。",
    content: \`## AI 从业者的伦理觉醒

**2026 年 5 月 5 日**，The Verge 报道。

### 工会目标

- **代表权**：确保至少 1000 名员工有代表权
- **核心关切**：AI 军事合同的使用
- **伦理底线**：员工希望在公司决策中有更多发言权

### 历史背景

Google 员工曾在 2018 年抗议 Project Maven 合作，最终导致 Google 不再续签该合同。此次 DeepMind 工会化是这一历史事件的延续。

**来源：** The Verge
**链接：** https://www.theverge.com/ai-artificial-intelligence/923883/google-deepmind-workers-are-unionizing-over-ai-military-contracts\`,
    date: "2026-05-09 16:00",
    source: "The Verge",
    sourceUrl: "https://www.theverge.com/ai-artificial-intelligence/923883/google-deepmind-workers-are-unionizing-over-ai-military-contracts",
    href: "/news/news-1151",
  },
  {
    id: "news-1152",
    tag: "行业",
    tagColor: "bg-yellow-500/10 text-yellow-300",
    title: "OpenAI 搁置硬件和机器人业务分拆计划，为 IPO 做准备",
    summary: "据华尔街日报报道，OpenAI 在 IPO 前削减副业，搁置了分拆硬件和机器人业务部门的计划。此前曾探索类似 Google Alphabet 的分拆结构，但最终选择聚焦核心 AI 模型和 ChatGPT 业务。",
    content: \`## OpenAI 正在为 IPO 收缩战线

**2026 年 5 月 5 日**，The Verge + 华尔街日报报道。

### 核心决策

- **分拆搁置**：讨论了类似 Google Alphabet 的分拆结构
- **聚焦核心**：选择聚焦 AI 模型和 ChatGPT 业务
- **IPO 准备**：削减副业以简化业务结构

### 行业意义

OpenAI 的 IPO 准备正在加速，收缩副业是向投资者展示「清晰业务故事」的标准操作。

**来源：** The Verge + 华尔街日报
**链接：** https://www.theverge.com/ai-artificial-intelligence/923883/openai-mothballed-plans-to-spin-out-hardware-and-robotics-divisions\`,
    date: "2026-05-09 16:00",
    source: "The Verge + 华尔街日报",
    sourceUrl: "https://www.theverge.com/ai-artificial-intelligence/923883/openai-mothballed-plans-to-spin-out-hardware-and-robotics-divisions",
    href: "/news/news-1152",
  },
  {
    id: "news-1153",
    tag: "开源项目",
    tagColor: "bg-purple-500/10 text-purple-300",
    title: "GitHub 本周趋势：Agent 编排与金融 Agent 赛道爆发，OpenAI Symphony 获 2.2 万星",
    summary: "GitHub 周榜显示 AI Agent 生态爆发式增长。OpenAI Symphony（22,716⭐）、TradingAgents（71,934⭐）、ruflo（46,993⭐）、Pixelle-Video（13,856⭐，中国团队）等持续霸榜。Agent 编排、金融 AI 和编码工具链是三大热门方向。",
    content: \`## 开源 AI Agent 生态正在全面爆发

**2026 年 5 月 9 日**，GitHub Trending 数据。

### 本周 Top 项目

1. **TradingAgents**（71,934⭐，+12,981）：多 Agent 金融交易框架
2. **Skills by mattpocock**（66,893⭐，+14,928）：工程师 Skills 集合
3. **Warp**（56,884⭐，+6,136）：Agentic 终端开发环境
4. **ruflo**（46,993⭐，+12,226）：Claude Agent 编排平台
5. **OpenAI Symphony**（22,716⭐，+2,335）：项目级自主 Agent 实现框架
6. **Dexter**（24,915⭐，+3,278）：自主深度金融研究 Agent
7. **Pixelle-Video**（13,856⭐，+5,136）：AI 全自动短视频引擎（中国团队）
8. **Anthropic Financial Services**（15,623⭐，+5,848）：Anthropic 官方金融服务示例

### 趋势分析

Agent 编排、金融 AI 和编码工具链是本周最热门的三大方向。OpenAI Symphony 的开源标志着从「单 Agent 编码」到「项目级自主实现」的范式转变。

**来源：** GitHub Trending
**链接：** https://github.com/trending?since=weekly\`,
    date: "2026-05-09 16:00",
    source: "GitHub Trending",
    sourceUrl: "https://github.com/trending?since=weekly",
    href: "/news/news-1153",
  },
`;

// Find the position before "  ] as NewsItem[];"
const marker = "  ] as NewsItem[];";
const pos = content.lastIndexOf(marker);
if (pos === -1) {
  console.error("Could not find NewsItem[] marker");
  process.exit(1);
}

// Insert before the marker, replacing the last entry's trailing comma
const insertContent = newEntries;
const newContent = content.slice(0, pos) + insertContent + content.slice(pos);

fs.writeFileSync(newsFile, newContent, 'utf8');
console.log("Successfully inserted news-1141 to news-1153");
