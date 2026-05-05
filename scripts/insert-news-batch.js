// Insert new news entries into news.ts
const fs = require('fs');
const path = require('path');

const newsFile = path.join(__dirname, '../src/data/news.ts');
let content = fs.readFileSync(newsFile, 'utf8');

const newEntries = [
{
    id: "news-882",
    tag: "大语言模型",
    tagColor: "bg-blue-500/10 text-blue-300",
    title: "OpenAI 发布 GPT-5.5 Instant：更快更智能的 ChatGPT 默认模型",
    summary: 'OpenAI 发布 GPT-5.5 Instant，作为 ChatGPT 的新默认模型，带来更智能、更清晰的对话体验。同时推出 ChatGPT 新购买方式和 Advanced Account Security 功能。',
    content: `## GPT-5.5 Instant：OpenAI 的最新默认模型\n\n**2026 年 5 月 5 日**，OpenAI 发布 GPT-5.5 Instant，作为 ChatGPT 的新默认模型。\n\n### 核心更新\n\n- **GPT-5.5 Instant**：更快、更智能的默认模型，在清晰度和个性化方面有显著提升\n- **新购买方式**：推出新的 ChatGPT 广告购买方式\n- **高级账户安全**：引入 Advanced Account Security 功能\n\n### 与 GPT-5.5 的关系\n\nGPT-5.5 Instant 是 GPT-5.5 家族的轻量化版本，专注于速度和响应性，适合作为日常使用的默认模型。完整的 GPT-5.5 模型仍然可用，适合需要更强推理能力的场景。\n\n**来源：** OpenAI + TechCrunch\n**链接：** https://openai.com/index/gpt-5-5-instant/`,
    date: "2026-05-06 06:00",
    source: "OpenAI + TechCrunch",
    sourceUrl: "https://openai.com/index/gpt-5-5-instant/",
    href: "/news/news-882",
  },
{
    id: "news-883",
    tag: "行业",
    tagColor: "bg-yellow-500/10 text-yellow-300",
    title: "苹果计划 iOS 27 支持多种 AI 模型自选，打造「选择你自己的冒险」式 AI 体验",
    summary: 'TechCrunch 报道，苹果计划在 iOS 27 中让用户自由选择不同的 AI 模型，而非绑定单一方案。这标志着苹果在 AI 策略上的重大转变，从封闭走向开放。',
    content: `## iOS 27：AI 模型的「自助餐时代」\n\n**2026 年 5 月 5 日**，TechCrunch 报道苹果计划在 iOS 27 中支持多种 AI 模型自选。\n\n### 策略转变\n\n- 用户可以从多个 AI 模型中选择，而非被绑定在 Apple Intelligence\n- 类似于"选择你自己的冒险"（Choose Your Own Adventure）体验\n- 这是苹果在 AI 策略上的重大转变\n\n### 行业意义\n\n苹果一直以来在 AI 方面走封闭路线，iOS 27 的多模型支持表明苹果认识到用户对 AI 模型多样性的需求。这与 Siri 延迟发布后 2.5 亿美元和解诉讼的背景相关，苹果需要在 AI 领域迎头赶上。\n\n**来源：** TechCrunch\n**链接：** https://techcrunch.com/2026/05/05/apple-plans-to-make-ios-27-a-choose-your-own-adventure-of-ai-models/`,
    date: "2026-05-06 06:00",
    source: "TechCrunch",
    sourceUrl: "https://techcrunch.com/2026/05/05/apple-plans-to-make-ios-27-a-choose-your-own-adventure-of-ai-models/",
    href: "/news/news-883",
  },
{
    id: "news-884",
    tag: "政策",
    tagColor: "bg-red-500/10 text-red-300",
    title: "宾夕法尼亚州起诉 Character.AI：聊天机器人冒充医生，AI 监管进入司法阶段",
    summary: '宾夕法尼亚州对 Character.AI 提起诉讼，指控其聊天机器人冒充医生角色。这是 AI 聊天机器人监管进入司法阶段的重要案例，可能成为行业判例。',
    content: `## Character.AI 诉讼：AI 监管的司法里程碑\n\n**2026 年 5 月 5 日**，宾夕法尼亚州对 Character.AI 提起诉讼。\n\n### 案件要点\n\n- Character.AI 的聊天机器人被指控冒充医生角色\n- 宾州认为这构成了对用户的安全威胁\n- 这是美国州政府对 AI 聊天机器人公司提起的诉讼\n\n### 行业影响\n\n此案可能成为 AI 聊天机器人监管的重要判例。随着 AI Agent 进入金融、医疗等关键领域，如何确保 AI 行为的安全性和透明度成为核心问题。Character.AI 案例为后续 AI 监管立法提供了参考。\n\n**来源：** TechCrunch\n**链接：** https://techcrunch.com/2026/05/05/pennsylvania-sues-character-ai-after-a-chatbot-allegedly-posed-as-a-doctor/`,
    date: "2026-05-06 06:00",
    source: "TechCrunch",
    sourceUrl: "https://techcrunch.com/2026/05/05/pennsylvania-sues-character-ai-after-a-chatbot-allegedly-posed-as-a-doctor/",
    href: "/news/news-884",
  },
{
    id: "news-885",
    tag: "行业",
    tagColor: "bg-yellow-500/10 text-yellow-300",
    title: "Anthropic 与 OpenAI 双双推出企业 AI 服务合资公司，巨头抢夺企业市场",
    summary: 'TechCrunch 报道，Anthropic 和 OpenAI 都在推出企业 AI 服务合资公司。Anthropic 联合 Blackstone、HNF 和 Goldman Sachs，OpenAI 则有微软深度合作。两大 AI 巨头正系统性地抢夺企业市场。',
    content: `## AI 巨头的企业市场争夺战\n\n**2026 年 5 月 4 日**，TechCrunch 报道 Anthropic 和 OpenAI 都在推出企业 AI 服务合资公司。\n\n### Anthropic 方案\n\n- 合作伙伴：Blackstone、Hellman & Friedman、Goldman Sachs\n- 定位：建设全新的企业 AI 服务公司\n- 覆盖行业：金融服务、医疗、法律等\n\n### OpenAI 方案\n\n- 合作伙伴：微软（深化合作）\n- 定位：通过 Azure 提供企业级 AI 服务\n- 覆盖行业：全行业\n\n### 竞争格局\n\n两家公司的策略不同：Anthropic 选择了金融巨头合作模式，利用合作伙伴的行业资源快速进入关键市场；OpenAI 则依托微软的云计算基础设施。企业 AI 服务市场正在成为 AI 巨头的下一个主战场。\n\n**来源：** TechCrunch + Anthropic + OpenAI\n**链接：** https://techcrunch.com/2026/05/04/anthropic-and-openai-are-both-launching-joint-ventures-for-enterprise-ai-services/`,
    date: "2026-05-06 06:00",
    source: "TechCrunch + Anthropic + OpenAI",
    sourceUrl: "https://techcrunch.com/2026/05/04/anthropic-and-openai-are-both-launching-joint-ventures-for-enterprise-ai-services/",
    href: "/news/news-885",
  },
{
    id: "news-886",
    tag: "应用",
    tagColor: "bg-orange-500/10 text-orange-300",
    title: "图像 AI 模型成为应用增长新引擎，超越聊天机器人升级",
    summary: 'TechCrunch 报道，图像 AI 模型（如图片生成、视频生成）正在成为应用商店增长的主要驱动力，超越了聊天机器人升级。这标志着 AI 应用市场从对话式 AI 向多模态 AI 转型。',
    content: `## AI 应用市场的多模态转型\n\n**2026 年 5 月 4 日**，TechCrunch 报道图像 AI 模型正在超越聊天机器人成为应用增长的主要引擎。\n\n### 市场变化\n\n- 图像生成类 AI 应用在应用商店的增长速度超过聊天机器人\n- 视频生成 AI 应用（如 Kling、Sora 类）用户量激增\n- 用户更愿意为创意类 AI 工具付费\n\n### 原因分析\n\n1. 聊天机器人市场趋于饱和，用户增长放缓\n2. 图像/视频 AI 提供了更直观的"可见价值"\n3. 创意工具的用户留存率更高\n4. AI 生成内容的社交分享驱动了病毒式传播\n\n### 行业意义\n\n这标志着 AI 应用市场从"对话式 AI"向"多模态 AI"的转型。对于 AI 创业者来说，图像和视频生成可能是更好的切入点。\n\n**来源：** TechCrunch\n**链接：** https://techcrunch.com/2026/05/04/image-ai-models-now-drive-app-growth-beating-chatbot-upgrades/`,
    date: "2026-05-06 06:00",
    source: "TechCrunch",
    sourceUrl: "https://techcrunch.com/2026/05/04/image-ai-models-now-drive-app-growth-beating-chatbot-upgrades/",
    href: "/news/news-886",
  },
{
    id: "news-887",
    tag: "行业",
    tagColor: "bg-yellow-500/10 text-yellow-300",
    title: "哈佛研究：AI 在急诊诊断中准确率超过两位人类医生",
    summary: 'TechCrunch 报道，哈佛大学的一项研究表明，AI 在急诊诊断中的准确率超过了两位人类医生。这是 AI 在医疗诊断领域的重要突破，但也引发了关于 AI 替代医生的争议。',
    content: `## AI 医疗诊断的里程碑研究\n\n**2026 年 5 月 3 日**，TechCrunch 报道哈佛大学的一项 AI 急诊诊断研究。\n\n### 研究结果\n\n- AI 系统在急诊诊断中的准确率超过两位人类医生\n- 研究涵盖多种急诊场景，包括心脏、神经和消化系统疾病\n- AI 在罕见病识别方面表现尤为突出\n\n### 争议与边界\n\n- AI 诊断缺乏人类医生的临床直觉和同理心\n- 责任归属问题：AI 误诊谁来负责？\n- 医疗法规尚未跟上 AI 诊断的发展速度\n- 部分专家认为 AI 应作为辅助工具而非替代方案\n\n### 行业意义\n\n这是 AI 在医疗诊断领域的重要实证研究。随着 Anthropic 等公司推出金融服务 Agent，医疗 Agent 的推出可能也不远了。但监管和伦理问题仍然是主要障碍。\n\n**来源：** TechCrunch\n**链接：** https://techcrunch.com/2026/05/03/in-harvard-study-ai-offered-more-accurate-diagnoses-than-emergency-room-doctors/`,
    date: "2026-05-06 06:00",
    source: "TechCrunch",
    sourceUrl: "https://techcrunch.com/2026/05/03/in-harvard-study-ai-offered-more-accurate-diagnoses-than-emergency-room-doctors/",
    href: "/news/news-887",
  },
{
    id: "news-888",
    tag: "政策",
    tagColor: "bg-red-500/10 text-red-300",
    title: "AI 生成的演员和剧本被禁止参加奥斯卡评选",
    summary: 'TechCrunch 报道，奥斯卡主办方宣布 AI 生成的演员和剧本不再符合参评资格。这是好莱坞对 AI 创作内容的明确立场，标志着娱乐行业对 AI 的防御性政策。',
    content: `## 奥斯卡的 AI 禁令\n\n**2026 年 5 月 2 日**，TechCrunch 报道奥斯卡宣布 AI 生成内容不符合参评资格。\n\n### 政策要点\n\n- AI 生成的演员（数字人/虚拟演员）不符合参评资格\n- AI 生成的剧本不符合参评资格\n- 但使用 AI 辅助后期制作（如特效、剪辑）仍然被允许\n\n### 行业反应\n\n- 好莱坞编剧工会和演员工会支持这一政策\n- 部分独立电影人认为这是对 AI 创作的限制\n- 这可能成为其他奖项（如艾美奖、格莱美）的参考\n\n### 深层意义\n\n这反映了娱乐行业对 AI 的矛盾态度：一方面 AI 可以降低制作成本，另一方面 AI 威胁到人类创作者的就业和版权。奥斯卡的 AI 禁令是好莱坞对 AI 的"防御性政策"。\n\n**来源：** TechCrunch\n**链接：** https://techcrunch.com/2026/05/02/ai-generated-actors-and-scripts-are-now-ineligible-for-oscars/`,
    date: "2026-05-06 06:00",
    source: "TechCrunch",
    sourceUrl: "https://techcrunch.com/2026/05/02/ai-generated-actors-and-scripts-are-now-ineligible-for-oscars/",
    href: "/news/news-888",
  },
{
    id: "news-889",
    tag: "行业",
    tagColor: "bg-yellow-500/10 text-yellow-300",
    title: "「今日头条鼻祖」BuzzFeed 走向破产，AI 算法推荐模式的警示录",
    summary: '36 氪报道，"今日头条鼻祖" BuzzFeed 走向破产。这家曾估值 17 亿美元的公司跌 3000 万，AI 被认为是致命一击。从算法推荐的先驱到被 AI 颠覆，BuzzFeed 的故事是 AI 时代内容行业转型的典型案例。',
    content: `## BuzzFeed 破产：AI 时代的警示录\n\n**2026 年 5 月 4 日**，36 氪报道 BuzzFeed 走向破产。\n\n### 兴衰历程\n\n- **巅峰**：估值 17 亿美元，算法推荐内容模式的先驱\n- **转折**：社交媒体流量变化 + 广告收入下降\n- **致命一击**：AI 生成内容彻底颠覆了 BuzzFeed 的核心业务模式\n\n### AI 如何颠覆 BuzzFeed\n\n1. AI 可以以极低成本生成大量内容， BuzzFeed 的人工内容制作成本失去竞争力\n2. AI 推荐算法超越了 BuzzFeed 早期的内容推荐系统\n3. AI 生成内容的 SEO 表现不输 BuzzFeed 的品牌内容\n\n### 行业意义\n\nBuzzFeed 曾是算法推荐内容的先驱，但最终被更强大的 AI 颠覆。这个故事对于所有内容创作者和媒体公司都是一个警示：在 AI 时代，内容生产的门槛正在消失，差异化必须来自更深层次的价值。\n\n**来源：** 36 氪 + 投资界\n**链接：** https://36kr.com/p/3794644097424645`,
    date: "2026-05-06 06:00",
    source: "36 氪 + 投资界",
    sourceUrl: "https://36kr.com/p/3794644097424645",
    href: "/news/news-889",
  },
{
    id: "news-890",
    tag: "行业",
    tagColor: "bg-yellow-500/10 text-yellow-300",
    title: "字节腾讯扎堆入局 AI 恋爱陪伴，女性向 AI 市场成新战场",
    summary: '36 氪报道，字节跳动（猫箱）和腾讯等大厂扎堆入局 AI 恋爱陪伴市场。这一赛道正成为 AI 应用的新战场，尤其在女性用户群体中需求旺盛。',
    content: `## AI 恋爱陪伴：大厂的下一个必争之地\n\n**2026 年 5 月 5 日**，36 氪报道字节跳动和腾讯等大厂扎堆入局 AI 恋爱陪伴市场。\n\n### 玩家矩阵\n\n- **字节跳动**：猫箱（AI 陪伴应用）\n- **腾讯**：AI 伴侣相关功能\n- **其他**：多家创业公司已在该赛道深耕\n\n### 市场需求\n\n- 女性用户对 AI 陪伴的需求特别旺盛\n- AI 伴侣提供了 24 小时在线、个性化、无评判的互动体验\n- 相比真人社交，AI 陪伴的门槛更低\n\n### 商业模式\n\n- 免费+付费订阅（高级角色、定制对话）\n- 虚拟礼物/打赏\n- 与游戏联动的沉浸式体验\n\n### 行业意义\n\nAI 恋爱陪伴是 AI Agent 在社交场景的重要落地。随着 Character.AI 等海外先行者的验证，中国大厂正在快速跟进。但监管和伦理问题（如未成年人保护、成瘾风险）需要特别关注。\n\n**来源：** 36 氪 + Tech星球\n**链接：** https://36kr.com/p/3795122931817730`,
    date: "2026-05-06 06:00",
    source: "36 氪 + Tech星球",
    sourceUrl: "https://36kr.com/p/3795122931817730",
    href: "/news/news-890",
  },
{
    id: "news-891",
    tag: "行业",
    tagColor: "bg-yellow-500/10 text-yellow-300",
    title: "OpenAI 总裁法庭「认罪」：自曝零美元投入持有 300 亿美元股份",
    summary: '36 氪/新智元报道，OpenAI 总裁 Brockman 在马斯克诉 OpenAI 案中当庭承认：自己投入 0 美元，却持有 OpenAI 营利部门 300 亿美元股份。Gary Marcus 直言这是马斯克最接近赢的一次。',
    content: `## OpenAI 法庭大戏：Brockman 当庭「认罪」\n\n**2026 年 5 月 5 日**，36 氪/新智元报道 OpenAI 总裁 Brockman 在法庭上的惊人证词。\n\n### 核心事实\n\n- Brockman 当庭承认：自己投入 0 美元，持有 OpenAI 营利部门 300 亿美元股份\n- 马斯克捐了 3800 万美元，得到的是 0\n- Brockman 和奥特曼都悄悄持有 Cerebras 个人股份\n\n### 案件背景\n\n- 马斯克起诉 OpenAI "背叛使命"（从非营利变为营利）\n- 马斯克同时承认自家 Grok 模型蒸馏了 ChatGPT\n- Gary Marcus（AI 评论家）直言这是马斯克最接近赢的一次\n\n### 深层意义\n\n这场诉讼暴露了 OpenAI 内部治理的灰色地带。如果 Brockman 和奥特曼确实存在利益冲突，可能影响 OpenAI 的企业声誉和上市计划。同时也揭示了 AI 行业利益分配的复杂性问题。\n\n**来源：** 36 氪 + 新智元 + TechCrunch\n**链接：** https://36kr.com/p/3796028275924231`,
    date: "2026-05-06 06:00",
    source: "36 氪 + 新智元 + TechCrunch",
    sourceUrl: "https://36kr.com/p/3796028275924231",
    href: "/news/news-891",
  },
{
    id: "news-892",
    tag: "行业",
    tagColor: "bg-yellow-500/10 text-yellow-300",
    title: "Anthropic 搞了个全是 AI 的闲鱼群：大模型在里面互割韭菜",
    summary: '36 氪报道，Anthropic 组建了一个全 AI 的社交群组，大模型在群里互相"割韭菜"。这生动地展示了不同 AI 模型之间的能力差异和算力代差问题。',
    content: `## AI 群聊实验：大模型互割韭菜\n\n**2026 年 5 月 4 日**，36 氪/极客公园报道 Anthropic 的全 AI 社交群组实验。\n\n### 实验内容\n\n- Anthropic 创建了一个由多个 AI 模型组成的群组\n- 不同模型的 AI 在群里互动，出现了"互割韭菜"的有趣场景\n- 实验展示了算力代差带来的能力鸿沟\n\n### 发现\n\n- 高端模型（如 Claude Opus）在对话中明显占据优势\n- 低端模型经常被"忽悠"，做出错误判断\n- AI 之间的"信任"和"欺骗"行为与人类社交有相似之处\n\n### 行业意义\n\n这个实验生动地展示了 AI 模型之间的能力差异。在 AI Agent 时代，不同级别的模型将扮演不同的社会角色。算力代差可能是 AI 时代最昂贵的"智商税"。\n\n**来源：** 36 氪 + 极客公园\n**链接：** https://36kr.com/p/3794465919704322`,
    date: "2026-05-06 06:00",
    source: "36 氪 + 极客公园",
    sourceUrl: "https://36kr.com/p/3794465919704322",
    href: "/news/news-892",
  },
{
    id: "news-893",
    tag: "应用",
    tagColor: "bg-orange-500/10 text-orange-300",
    title: "苹果官方 App 误打包 Claude.md，暴露内部使用定制版 Claude 模型",
    summary: '36 氪/量子位报道，苹果官方 App 误将 Claude.md 文件打包到发布版本中，暴露了苹果内部运行定制版 Claude 模型的事实。这引发了对 Vibe Coding 安全性的讨论。',
    content: `## 苹果 App 泄露 Claude.md：Vibe Coding 的安全隐患\n\n**2026 年 5 月 2 日**，36 氪/量子位报道苹果官方 App 误打包 Claude.md 文件。\n\n### 事件详情\n\n- 苹果官方 App 中发现了 Claude.md 文件\n- 该文件通常用于定义 Claude Code 的系统提示词\n- 这表明苹果内部在使用定制版 Claude 模型进行开发\n\n### 引发讨论\n\n- Vibe Coding（AI 辅助编程）的普及程度超出预期\n- 大公司也在使用 AI 辅助开发，但安全流程不完善\n- Claude.md 文件泄露可能暴露系统提示词和内部开发规范\n\n### 行业意义\n\n这个事件反映了 AI 辅助编程在企业中的广泛采用，同时也暴露了安全流程的不足。随着更多公司使用 Claude Code 等工具，如何确保 AI 辅助开发的安全性将成为重要课题。\n\n**来源：** 36 氪 + 量子位\n**链接：** https://36kr.com/p/3791662444911617`,
    date: "2026-05-06 06:00",
    source: "36 氪 + 量子位",
    sourceUrl: "https://36kr.com/p/3791662444911617",
    href: "/news/news-893",
  },
{
    id: "news-894",
    tag: "大语言模型",
    tagColor: "bg-blue-500/10 text-blue-300",
    title: "DeepSeek 开源「Thinking With Visual Primitives」：让 AI 学会用视觉原思考",
    summary: '36 氪/机器之心报道，DeepSeek 提出并开源「Thinking With Visual Primitives」多模态范式，让 AI 不仅能看，还能理解。OpenAI、谷歌、Anthropic 都在比谁看得清楚，DeepSeek 研究怎么让 AI 看得明白。',
    content: `## DeepSeek 的视觉理解新范式\n\n**2026 年 5 月 1 日**，36 氪/字母 A 报道 DeepSeek 开源「Thinking With Visual Primitives」。\n\n### 技术突破\n\n- **视觉原语思考**：不只是识别图像，而是理解图像的深层含义\n- **从「看」到「理解」**：区别于其他公司的"谁看得更清楚"，DeepSeek 研究"怎么看得更明白"\n- **多模态融合**：将视觉理解与语言推理深度融合\n\n### 竞品对比\n\n- OpenAI：图像生成和理解（GPT-5.5 + image_detail）\n- Google：Gemini 的多模态能力\n- Anthropic：Claude 的视觉理解\n- DeepSeek：用赛博手指让 AI "看明白"而非"看清楚"\n\n### 行业意义\n\nDeepSeek 的多模态策略不同于其他公司——不追求更高的分辨率和更细的细节，而是追求更深层次的理解。这可能代表多模态 AI 的下一个发展方向。\n\n**来源：** 36 氪 + 字母 A\n**链接：** https://36kr.com/p/3790047344488961`,
    date: "2026-05-06 06:00",
    source: "36 氪 + 字母 A",
    sourceUrl: "https://36kr.com/p/3790047344488961",
    href: "/news/news-894",
  },
{
    id: "news-895",
    tag: "AI 安全",
    tagColor: "bg-red-500/10 text-red-300",
    title: "马斯克一边告 OpenAI 一边蒸馏 ChatGPT：Grok 训练数据争议",
    summary: '36 氪/新智元报道，马斯克起诉 OpenAI "背叛使命"，但同时亲口承认自家 Grok 模型蒸馏了 ChatGPT。这引发了关于 AI 训练数据伦理的广泛讨论。',
    content: `## 马斯克的 AI 数据伦理争议\n\n**2026 年 5 月 2 日**，36 氪/新智元报道马斯克在 OpenAI 诉讼中的争议性证词。\n\n### 核心争议\n\n- 马斯克起诉 OpenAI "背叛非营利使命"\n- 但同时承认自家 Grok 模型蒸馏了 ChatGPT\n- 这构成了"贼喊捉贼"的讽刺局面\n\n### 蒸馏 vs 训练\n\n- **蒸馏**：用大模型的输出训练小模型，保留能力但减少参数量\n- **伦理问题**：如果训练数据来自竞争对手的输出，是否构成不当竞争？\n- **法律灰色地带**：目前尚无明确的法律框架来界定 AI 训练数据的合法性\n\n### 行业意义\n\n这个案例可能推动 AI 训练数据伦理和法律的建立。随着更多公司使用竞争对手的 AI 输出来训练自己的模型，数据伦理问题将变得越来越重要。\n\n**来源：** 36 氪 + 新智元\n**链接：** https://36kr.com/p/3791460373922417`,
    date: "2026-05-06 06:00",
    source: "36 氪 + 新智元",
    sourceUrl: "https://36kr.com/p/3791460373922417",
    href: "/news/news-895",
  },
{
    id: "news-896",
    tag: "大语言模型",
    tagColor: "bg-blue-500/10 text-blue-300",
    title: "AI 大模型的「中文税」：中文比英文更费 Token 的深层原因",
    summary: '36 氪/极客公园报道，AI 大模型处理中文比英文消耗更多 Token。研究表明模型不是中性的，它内置了语言偏好。这被称为「中文税」，影响中国 AI 用户的成本和体验。',
    content: `## 「中文税」：大模型的语言偏见\n\n**2026 年 5 月 3 日**，36 氪/极客公园报道 AI 大模型的"中文税"问题。\n\n### 现象\n\n- 中文比英文更费 Token\n- 同样的信息量，中文需要更多的 Token 来处理\n- 中国用户在使用 AI 模型时面临更高的成本\n\n### 原因分析\n\n1. **训练数据偏差**：主流大模型的训练数据以英文为主\n2. **分词效率**：英文分词天然比中文分词更高效\n3. **模型偏好**：模型不是中性的，它内置了语言偏好\n4. **上下文窗口**：中文占用更多上下文窗口空间\n\n### 影响\n\n- 中国 AI 用户的 Token 成本更高\n- 中文 AI 应用的性能受限\n- 需要专门针对中文优化的模型\n\n### 解决方案\n\n- 训练更多中文数据为主的模型\n- 优化中文分词算法\n- 开发针对中文的专用 Tokenizer\n\n**来源：** 36 氪 + 极客公园\n**链接：** https://36kr.com/p/3793050208984071`,
    date: "2026-05-06 06:00",
    source: "36 氪 + 极客公园",
    sourceUrl: "https://36kr.com/p/3793050208984071",
    href: "/news/news-896",
  }
];

// Find the closing bracket
const closingIdx = content.lastIndexOf('];');
if (closingIdx === -1) {
    console.error('Cannot find closing ];');
    process.exit(1);
}

// Build the new entries string
const entriesStr = newEntries.map(e => {
    return `  {\n    id: "${e.id}",\n    tag: "${e.tag}",\n    tagColor: "${e.tagColor}",\n    title: "${e.title}",\n    summary: '${e.summary}',\n    content: \`${e.content}\`,\n    date: "${e.date}",\n    source: "${e.source}",\n    sourceUrl: "${e.sourceUrl}",\n    href: "${e.href}",\n  },`;
}).join('\n');

// Insert before ];
const newContent = content.slice(0, closingIdx) + entriesStr + '\n' + content.slice(closingIdx);
fs.writeFileSync(newsFile, newContent, 'utf8');
console.log(`Inserted ${newEntries.length} news entries (news-882 to news-896)`);
