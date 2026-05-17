// batch-add-news.mjs — 追加 12 条新新闻到 news.ts
import fs from 'fs';

const newsPath = 'src/data/news.ts';
let content = fs.readFileSync(newsPath, 'utf-8');

const newNews = [
  {
    id: "news-2045",
    tag: "大语言模型",
    tagColor: "bg-blue-500/10 text-blue-300",
    title: "Greg Brockman 正式接管 OpenAI 产品战略：全面主导 ChatGPT 和 Codex 方向",
    summary: "据 WIRED 报道，Greg Brockman 已在 OpenAI 最新一轮重组中正式接管产品部门，全面主导 ChatGPT、Codex 等核心产品战略。这标志着 OpenAI 从研究驱动向产品驱动的重大转向。",
    content: `## Greg Brockman 正式接管 OpenAI 产品战略

**2026 年 5 月 15 日**，WIRED 报道。

### 重组背景
- **Greg Brockman 接管产品**：OpenAI 联合创始人 Greg Brockman 在最新一轮重组中正式接管产品部门
- **产品线整合**：ChatGPT、Codex 等核心产品线统一归口管理
- **战略转向**：从研究驱动向产品驱动的重大组织转变

### 影响分析
- **Codex 加速**：Brockman 对开发者工具的重视可能加速 Codex 的迭代
- **ChatGPT 进化**：个人理财、企业工作流等新功能方向更加清晰
- **组织效率**：统一管理减少产品线之间的资源竞争

这一重组发生在 OpenAI 与苹果合作关系出现裂痕、面临多重外部压力的背景下，被视为 OpenAI 内部应对竞争的关键举措。

**来源:** WIRED + OpenAI Blog
**链接:** https://www.wired.com/story/openai-reorg-greg-brockman-product/`,
    date: "2026-05-17 16:15",
    source: "WIRED + OpenAI Blog",
    sourceUrl: "https://www.wired.com/story/openai-reorg-greg-brockman-product/",
    href: "/news/news-2045",
  },
  {
    id: "news-2046",
    tag: "应用",
    tagColor: "bg-green-500/10 text-green-300",
    title: "OpenAI 与马耳他达成全国协议：所有公民可免费使用 ChatGPT Plus",
    summary: "OpenAI 与马耳他政府达成历史性合作，为全国所有公民免费提供 ChatGPT Plus 订阅。这是首个国家级 AI 普及计划，标志着 AI 技术正在从个人消费走向公共基础设施。",
    content: `## OpenAI 与马耳他达成全国 AI 普及协议

**2026 年 5 月 16 日**，OpenAI 官方博客宣布。

### 合作内容
- **全民 ChatGPT Plus**：马耳他所有公民可免费获得 ChatGPT Plus 订阅
- **首个国家级 AI 计划**：这是全球首个由国家政府与 AI 公司合作的全民 AI 普及项目
- **教育优先**：优先覆盖教育、医疗和公共服务领域

### 战略意义
- **公共基础设施化**：AI 正在从消费品转变为社会基础设施
- **小国先行**：马耳他作为欧盟小国，率先推进全民 AI 普及
- **示范效应**：可能引发其他欧盟国家的跟进

此前 OpenAI 还与马耳他就 AI 治理达成了更广泛的合作框架，包括数据保护、伦理审查等配套措施。

**来源:** OpenAI Blog
**链接:** https://openai.com/index/malta-chatgpt-plus-partnership`,
    date: "2026-05-17 16:15",
    source: "OpenAI Blog",
    sourceUrl: "https://openai.com/index/malta-chatgpt-plus-partnership",
    href: "/news/news-2046",
  },
  {
    id: "news-2047",
    tag: "大语言模型",
    tagColor: "bg-blue-500/10 text-blue-300",
    title: "Databricks 将 GPT-5.5 引入企业 Agent 工作流：开源与企业级 AI 融合新范式",
    summary: "Databricks 宣布将 GPT-5.5 集成到企业级 Agent 工作流中，企业可以在自有数据湖上直接运行 AI 代理。这标志着开源数据平台与闭源大模型的深度整合。",
    content: `## Databricks 将 GPT-5.5 引入企业 Agent 工作流

**2026 年 5 月 15 日**，OpenAI 官方宣布与 Databricks 的深度合作。

### 合作要点
- **GPT-5.5 企业集成**：Databricks 平台直接接入 GPT-5.5 能力
- **Agent 工作流**：企业可在自有数据湖上构建和运行 AI 代理
- **数据主权**：企业数据不出自有环境，满足合规要求

### 技术架构
- **企业数据 + GPT-5.5**：结合 Databricks 的企业数据治理能力与 GPT-5.5 的智能推理
- **安全沙箱**：Agent 在隔离环境中执行任务，确保数据安全
- **可观测性**：完整的 Agent 行为日志和审计追踪

这代表了企业 AI 落地的新范式：开源数据平台 + 闭源大模型 = 安全、可控、可审计的企业 AI 解决方案。

**来源:** OpenAI Blog
**链接:** https://openai.com/index/databricks`,
    date: "2026-05-17 16:15",
    source: "OpenAI Blog",
    sourceUrl: "https://openai.com/index/databricks",
    href: "/news/news-2047",
  },
  {
    id: "news-2048",
    tag: "应用",
    tagColor: "bg-green-500/10 text-green-300",
    title: "ChatGPT 全新个人理财体验上线：支持银行账户连接与智能财务规划",
    summary: "OpenAI 推出 ChatGPT 全新个人理财功能，支持连接银行账户、分析消费模式、生成个性化理财建议。AI 正式进入个人金融服务领域。",
    content: `## ChatGPT 推出全新个人理财功能

**2026 年 5 月 15 日**，OpenAI 官方宣布。

### 核心功能
- **银行账户连接**：用户可安全连接银行账户，实时同步财务数据
- **消费分析**：AI 自动分析消费模式，识别可优化的支出
- **个性化建议**：基于用户财务状况提供定制化理财建议
- **预算规划**：AI 辅助制定和管理月度/年度预算

### 安全与隐私
- **银行级加密**：金融数据传输和存储采用最高安全标准
- **数据最小化**：仅处理必要的财务信息
- **用户可控**：用户可随时断开连接或删除财务数据

这是 OpenAI 将 ChatGPT 从通用助手扩展为垂直领域专业服务的重要一步。AI 金融助手的市场竞争正在加剧。

**来源:** OpenAI Blog
**链接:** https://openai.com/index/personal-finance-chatgpt`,
    date: "2026-05-17 16:15",
    source: "OpenAI Blog",
    sourceUrl: "https://openai.com/index/personal-finance-chatgpt",
    href: "/news/news-2048",
  },
  {
    id: "news-2049",
    tag: "芯片",
    tagColor: "bg-orange-500/10 text-orange-300",
    title: "联发科天玑 AI 开发套件下载量飙升 440%：端侧 AI 芯片生态加速布局",
    summary: "据新浪科技报道，联发科在 MDDC 2026 开发者大会上宣布天玑 AI 开发套件下载量增长 440%，并发布了多项端侧 AI 新技术。端侧 AI 正成为芯片厂商竞争的新战场。",
    content: `## 联发科天玑 AI 开发套件下载量飙升 440%

**2026 年 5 月 17 日**，新浪科技报道 MDDC 2026 开发者大会。

### 核心数据
- **下载量增长 440%**：天玑 AI 开发套件受到开发者广泛欢迎
- **多项新技术发布**：涵盖端侧推理、边缘 AI 优化等方向
- **生态加速**：越来越多的开发者在天玑平台上构建 AI 应用

### 端侧 AI 趋势
- **隐私优先**：端侧推理避免数据传输到云端
- **低延迟**：本地 AI 推理实现毫秒级响应
- **成本优化**：减少对云端算力的依赖
- **离线可用**：无网络环境下仍能提供 AI 功能

联发科正在从传统芯片供应商向 AI 生态平台转型，与高通、苹果在端侧 AI 领域的竞争日趋激烈。

**来源:** 新浪科技
**链接:** https://tech.sina.com.cn/`,
    date: "2026-05-17 16:15",
    source: "新浪科技",
    sourceUrl: "https://tech.sina.com.cn/",
    href: "/news/news-2049",
  },
  {
    id: "news-2050",
    tag: "行业",
    tagColor: "bg-gray-500/10 text-gray-300",
    title: "亚马逊豪赌 AI 回报初显：市值逼近 3 万亿美元，AWS AI 服务收入激增",
    summary: "据新浪科技报道，亚马逊在 AI 领域的大规模投资开始显现回报，公司市值逼近 3 万亿美元。AWS AI 和云基础设施服务成为核心增长引擎。",
    content: `## 亚马逊 AI 投资回报：市值逼近 3 万亿美元

**2026 年 5 月 17 日**，新浪科技报道。

### 市值里程碑
- **逼近 3 万亿美元**：亚马逊市值持续增长，距离 3 万亿大关仅一步之遥
- **AI 驱动增长**：AWS AI 服务和云基础设施是核心增长引擎
- **投资回报兑现**：此前大规模 AI 基础设施投资开始产生显著回报

### AWS AI 布局
- **Bedrock 平台**：企业级 AI 模型托管和推理服务
- **Trainium/Inferentia**：自研 AI 芯片降低训练和推理成本
- **AI Agent 服务**：企业可直接在 AWS 上部署和管理 AI 代理

亚马逊的 AI 战略核心是通过 AWS 将 AI 能力作为基础设施提供给全球企业，这种平台化策略使其在 AI 基础设施市场占据重要地位。

**来源:** 新浪科技
**链接:** https://tech.sina.com.cn/`,
    date: "2026-05-17 16:15",
    source: "新浪科技",
    sourceUrl: "https://tech.sina.com.cn/",
    href: "/news/news-2050",
  },
  {
    id: "news-2051",
    tag: "开源项目",
    tagColor: "bg-purple-500/10 text-purple-300",
    title: "html-anything：AI 智能 HTML 编辑器爆发增长，75 项技能覆盖前端全场景",
    summary: "GitHub 新开源项目 html-anything 在短短一周内获得 2591 星，定位为 Agentic HTML 编辑器——让 AI 代理直接编写和修改 HTML，覆盖 75 种前端技能。",
    content: `## html-anything：AI 智能 HTML 编辑器

**2026 年 5 月 17 日**，GitHub Trending 项目。

### 项目亮点
- **2591 星**：发布仅一周即获得大量关注
- **75 项技能**：覆盖 HTML/CSS/JS 前端开发的广泛场景
- **9 种交互界面**：多种前端组件和交互模式支持

### 核心能力
- **Agentic 编辑**：AI 代理可直接理解和修改 HTML 结构
- **即时预览**：修改即时反映在编辑器中
- **技能扩展**：开发者可自定义和扩展技能模块

这代表了 AI 编码工具的新方向：从通用代码助手向垂直领域专用工具演进。前端开发可能成为 AI 辅助编程最先实现全面自动化的领域之一。

**来源:** GitHub Trending
**链接:** https://github.com/nexu-io/html-anything`,
    date: "2026-05-17 16:15",
    source: "GitHub Trending",
    sourceUrl: "https://github.com/nexu-io/html-anything",
    href: "/news/news-2051",
  },
  {
    id: "news-2052",
    tag: "行业",
    tagColor: "bg-gray-500/10 text-gray-300",
    title: "理想汽车李想：普通人用 AI 就是民科水平，专业人士才能放大 10 倍价值",
    summary: "据凤凰科技报道，理想汽车创始人李想公开发表观点，认为普通人使用 AI 工具的产出质量仅停留在"民科水平"，只有专业人士才能将 AI 效能放大 10 倍。引发广泛讨论。",
    content: `## 李想谈 AI：普通人用 AI 是"民科水平"

**2026 年 5 月 17 日**，凤凰科技报道。

### 核心观点
- **"民科水平"论断**：李想认为没有专业背景的人使用 AI，产出质量相当于"民间科学"
- **专业放大器**：只有具备专业知识的用户，才能将 AI 的能力放大 10 倍
- **工具 vs 能力**：AI 是工具放大器，不能替代专业知识和判断力

### 行业反响
- **支持者认为**：AI 确实无法弥补专业知识和经验的差距
- **反对者认为**：AI 正在降低专业门槛，让普通人也能产出高质量内容
- **中性观点**：AI 的"民主化"效应和专业性的关系是动态演进的

这场讨论触及了 AI 普及的核心问题：AI 是让专业知识更民主化，还是让专业人士更高效？

**来源:** 凤凰科技
**链接:** https://tech.ifeng.com/`,
    date: "2026-05-17 16:15",
    source: "凤凰科技",
    sourceUrl: "https://tech.ifeng.com/",
    href: "/news/news-2052",
  },
  {
    id: "news-2053",
    tag: "行业",
    tagColor: "bg-gray-500/10 text-gray-300",
    title: "Anthropic 发布报告警告中国 AI 竞争威胁：呼吁美国政府采取更积极的 AI 战略",
    summary: "据凤凰科技报道，Anthropic 在其最新报告中明确将中国 AI 发展列为核心竞争威胁，呼吁美国政府加大 AI 投资和政策支持力度。专家批评此举为"自私自利"的商业游说。",
    content: `## Anthropic 警告中国 AI 竞争威胁

**2026 年 5 月 17 日**，凤凰科技报道。

### 报告要点
- **中国 AI 威胁论**：Anthropic 在其最新企业报告中将中国 AI 发展列为核心竞争威胁
- **政策游说**：呼吁美国政府加大 AI 研发投资和政策支持
- **行业焦虑**：反映了美国 AI 企业对中国快速崛起的竞争焦虑

### 各方反应
- **专家批评**：多位 AI 学者批评此举为"自私自利"的商业利益游说
- **行业背景**：Anthropic 自身正在寻求巨额融资（据报道估值达 9000 亿美元）
- **地缘博弈**：AI 正成为中美科技竞争的核心战场

这一事件反映了 AI 行业的深层矛盾：一方面强调 AI 安全和伦理，另一方面积极参与地缘政治博弈。

**来源:** 凤凰科技
**链接:** https://tech.ifeng.com/`,
    date: "2026-05-17 16:15",
    source: "凤凰科技",
    sourceUrl: "https://tech.ifeng.com/",
    href: "/news/news-2053",
  },
  {
    id: "news-2054",
    tag: "开源项目",
    tagColor: "bg-purple-500/10 text-purple-300",
    title: "6400 星开源项目：用 Claude Code 写论文的全套流水线完整开源",
    summary: "GitHub 上一个使用 Claude Code 自动化写论文的项目获得 6400 星，包含从文献检索、大纲生成到论文撰写的全套 AI 学术流水线。但这也引发了 arXiv 禁止 AI 代写论文的讨论。",
    content: `## Claude Code 论文流水线全面开源

**2026 年 5 月 17 日**，凤凰科技报道。

### 项目亮点
- **6400 星**：短时间内获得大量关注
- **全套流水线**：从文献检索、大纲生成、文献综述到论文撰写，全流程自动化
- **Claude Code 驱动**：利用 Claude Code 的编程和推理能力构建自动化流程

### 功能模块
- **文献检索**：自动搜索和筛选相关文献
- **大纲生成**：基于研究主题自动生成论文结构
- **内容撰写**：AI 辅助生成各章节内容
- **格式校验**：自动检查学术格式和引用规范

### 学术伦理争议

与此同时，arXiv 正在考虑禁止 AI 代写论文的政策。这一开源项目的流行可能加速学术界对 AI 辅助写作的规范制定。AI 在学术写作中的角色正在从辅助工具向自主生成演变，学术界需要重新定义"作者"的概念。

**来源:** 凤凰科技 + GitHub
**链接:** https://tech.ifeng.com/`,
    date: "2026-05-17 16:15",
    source: "凤凰科技 + GitHub",
    sourceUrl: "https://tech.ifeng.com/",
    href: "/news/news-2054",
  },
  {
    id: "news-2055",
    tag: "大语言模型",
    tagColor: "bg-blue-500/10 text-blue-300",
    title: "MIT 科技评论警告：AI 聊天机器人正在泄露用户真实电话号码",
    summary: "MIT Technology Review 深度调查报道发现，多个主流 AI 聊天机器人在对话中会意外泄露用户的真实电话号码等个人信息，引发严重隐私安全担忧。",
    content: `## AI 聊天机器人泄露用户隐私调查

**2026 年 5 月 13-14 日**，MIT Technology Review 连续发布深度调查报道。

### 调查发现
- **电话号码泄露**：多个 AI 聊天机器人在对话中意外输出用户的真实电话号码
- **深度伪造关联**：AI 生成的深度伪造内容中包含了真实人物的联系方式
- **训练数据污染**：部分泄露信息来源于训练数据中的个人信息

### 安全影响
- **隐私风险升级**：从数据泄露升级为主动泄露
- **信任危机**：用户对企业级 AI 产品的信任度可能受到冲击
- **监管压力**：可能加速欧盟 AI 法案等隐私法规的执行

### 行业应对

报道发布后，多家 AI 公司已开始审查其模型的隐私保护机制。安全研究者呼吁在模型训练阶段增加更强的个人信息过滤层，并在推理阶段实施更严格的输出审查。

**来源:** MIT Technology Review
**链接:** https://www.technologyreview.com/2026/05/13/1137203/ai-chatbots-are-giving-out-peoples-real-phone-numbers/`,
    date: "2026-05-17 16:15",
    source: "MIT Technology Review",
    sourceUrl: "https://www.technologyreview.com/2026/05/13/1137203/ai-chatbots-are-giving-out-peoples-real-phone-numbers/",
    href: "/news/news-2055",
  },
  {
    id: "news-2056",
    tag: "行业",
    tagColor: "bg-gray-500/10 text-gray-300",
    title: "贝佐斯 380 亿美元押注"物理 AI"：联手斯坦福科学家打造 AI 实体化新赛道",
    summary: "据凤凰科技报道，贝佐斯投入 380 亿美元布局"物理 AI"赛道，联手斯坦福科学家推进具身智能和机器人技术。不走 OpenAI 的大模型路线，而是聚焦 AI 与物理世界的交互。",
    content: `## 贝佐斯 380 亿美元押注"物理 AI"

**2026 年 5 月 17 日**，凤凰科技报道。

### 投资规模
- **380 亿美元**：贝佐斯个人财富大规模投入物理 AI 领域
- **联手斯坦福**：与斯坦福大学顶尖科学家团队合作
- **差异化路线**：不卷 OpenAI 式的大语言模型，聚焦 AI 与物理世界交互

### 物理 AI 赛道
- **具身智能**：让 AI 具备物理身体的感知和行动能力
- **机器人技术**：从工业机器到家用服务机器人的全栈布局
- **Sim-to-Real**：从仿真环境到真实世界的迁移技术

### 行业意义

贝佐斯的入局标志着"物理 AI"正式成为与"数字 AI"平行的第二大赛道。当 OpenAI、Anthropic 等在大语言模型上激烈竞争时，物理 AI 代表了一个同样广阔但尚未充分开发的蓝海市场。

**来源:** 凤凰科技
**链接:** https://tech.ifeng.com/`,
    date: "2026-05-17 16:15",
    source: "凤凰科技",
    sourceUrl: "https://tech.ifeng.com/",
    href: "/news/news-2056",
  }
];

// Remove trailing ];
const trimmed = content.replace(/\];\s*$/, '');

// Append new entries
let appended = trimmed;
newNews.forEach((n, i) => {
  appended += `,
  {
    id: "${n.id}",
    tag: "${n.tag}",
    tagColor: "${n.tagColor}",
    title: "${n.title}",
    summary: "${n.summary}",
    content: \`${n.content}\`,
    date: "${n.date}",
    source: "${n.source}",
    sourceUrl: "${n.sourceUrl}",
    href: "${n.href}",
  }`;
});

appended += '\n];\n';

fs.writeFileSync(newsPath, appended, 'utf-8');
console.log(`✅ Appended ${newNews.length} news items (news-2045 ~ news-2056)`);
