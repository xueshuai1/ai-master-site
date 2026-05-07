// Add new news batch - 2026-05-07 12:00 researcher round
import fs from 'fs';

const filePath = './src/data/news.ts';
let content = fs.readFileSync(filePath, 'utf8');

const newItems = [
{
  id: "news-967",
  tag: "行业",
  title: "马斯克官宣 xAI 解散，22 万张 GPU 算力租给 Anthropic",
  summary: "据 36 氪/机器之心报道，马斯克正式宣布解散 xAI，将旗下 22 万张 GPU 算力租给 Anthropic，标志着 AI 算力格局的重大转变。",
  content: `AI 算力格局巨变——马斯克做出重大战略调整。\n\n- 马斯克正式宣布解散 xAI，结束独立模型竞争\n- 22 万张英伟达 GPU 算力将租给 Anthropic 使用\n- 这 22 万张 GPU 预计本月即可就位\n- OpenAI 的两大竞争对手（Anthropic 和 xAI）从竞争走向合作\n- 算力租赁成为 AI 基础设施的新商业模式\n\n**来源：** 36 氪 + 机器之心 + TechCrunch\n**链接：** https://36kr.com/p/3798593828477955`,
  date: "2026-05-07 12:00",
  source: "36 氪 + 机器之心 + TechCrunch",
  sourceUrl: "https://36kr.com/p/3798593828477955",
  href: "/news/news-967",
},
{
  id: "news-968",
  tag: "开源项目",
  title: "国内最大原生 AGI Infra 融资 7 亿元诞生，AI 基础设施成新价值锚点",
  summary: "据智东西报道，国内诞生最大规模原生 AGI 基础设施融资——7 亿元人民币，标志着 AI Infra 正在成为独立的价值赛道。",
  content: `AGI 基础设施正在成为独立的价值赛道。\n\n- 国内最大原生 AGI Infra 融资达 7 亿元人民币\n- 大厂林立的背景下，独立 Infra 反而价值更大\n- AI 基础设施不再只是大厂的附庸，而是独立赛道\n- 这反映了 AI 产业链的成熟——从模型竞争到基础设施竞争\n\n**来源：** 36 氪（智东西）\n**链接：** https://36kr.com/p/3798647966505992`,
  date: "2026-05-07 12:00",
  source: "36 氪（智东西）",
  sourceUrl: "https://36kr.com/p/3798647966505992",
  href: "/news/news-968",
},
{
  id: "news-969",
  tag: "大语言模型",
  title: "腾讯混元 Hy3 Preview 上线两周，Token 调用量增长 10 倍",
  summary: "新浪科技报道，腾讯混元 Hy3 Preview 上线仅两周时间，Token 调用量增长 10 倍，显示出腾讯大模型的快速增长势头。",
  content: `腾讯在大模型赛道的追赶速度令人瞩目。\n\n- 腾讯混元 Hy3 Preview 上线仅两周\n- Token 调用量增长 10 倍，显示出强劲的采用势头\n- 腾讯正在加速推进其大模型战略\n- 中国大模型竞争格局持续升温\n\n**来源：** 新浪科技\n**链接：** https://finance.sina.com.cn/tech/shenji/2026-05-07/doc-inhwzrtp8521239.shtml`,
  date: "2026-05-07 12:00",
  source: "新浪科技",
  sourceUrl: "https://finance.sina.com.cn/tech/shenji/2026-05-07/doc-inhwzrtp8521239.shtml",
  href: "/news/news-969",
},
{
  id: "news-970",
  tag: "行业",
  title: "SWE-Bench 新基准测试 AI 代码能力：Claude/GPT/Gemini 全部 0% 完成",
  summary: "机器之心报道，SWE-Bench 作者发布全新基准测试，结果显示 Claude、GPT-5.5、Gemini 等顶尖模型的完成率均为 0%，AI 工程智能成为下一个竞争焦点。",
  content: `工程智能——AI 能力评估的下一个前沿。\n\n- SWE-Bench 作者发布全新更严格的基准测试\n- Claude Opus 4.7、GPT-5.5 Instant、Gemini 等顶尖模型全部 0% 完成\n- 新基准聚焦真实工程项目级别的任务，而非单文件代码补全\n- AI 圈陷入沉默：当前模型在工程智能上仍有巨大差距\n- 这表明工程智能将成为下一个核心竞争领域\n\n**来源：** 36 氪（机器之心）\n**链接：** https://36kr.com/p/3798593895930888`,
  date: "2026-05-07 12:00",
  source: "36 氪（机器之心）",
  sourceUrl: "https://36kr.com/p/3798593895930888",
  href: "/news/news-970",
},
{
  id: "news-971",
  tag: "应用",
  title: "千问电脑端上线语音输入法，大模型公司争夺语音入口",
  summary: "卫夕指北分析，千问电脑端正式上线语音输入功能，大模型公司纷纷布局语音入口，'口输'可能才是真正的 AI Native 输入方式。",
  content: `语音正在成为 AI 交互的核心入口。\n\n- 千问（通义千问）电脑端正式上线语音输入法\n- 大模型公司正在激烈争夺语音输入入口\n- 分析认为语音输入可能是真正的 AI Native 交互方式\n- 从打字到说话，AI 交互范式正在发生根本性转变\n\n**来源：** 36 氪（卫夕指北）\n**链接：** https://36kr.com/p/3798585993649153`,
  date: "2026-05-07 12:00",
  source: "36 氪（卫夕指北）",
  sourceUrl: "https://36kr.com/p/3798585993649153",
  href: "/news/news-971",
},
{
  id: "news-972",
  tag: "Agent",
  title: "Anthropic 推出金融服务业专用 AI Agent，加速垂直行业落地",
  summary: "Anthropic 官方宣布推出面向金融服务业的专用 AI Agent，标志着 AI Agent 从通用工具向行业纵深方向推进。",
  content: `AI Agent 正在从通用走向专业。\n\n- Anthropic 正式推出金融服务业专用 AI Agent\n- 这是继 CopilotKit 等通用 Agent 平台之后的行业纵深推进\n- 金融服务业对 AI 的合规性、安全性要求极高\n- 表明 Anthropic 正在从模型公司转型为行业解决方案提供商\n- 与 Blackstone、Goldman Sachs 共建企业 AI 服务公司的战略一致\n\n**来源：** Anthropic News\n**链接：** https://www.anthropic.com/news/finance-agents`,
  date: "2026-05-07 12:00",
  source: "Anthropic News",
  sourceUrl: "https://www.anthropic.com/news/finance-agents",
  href: "/news/news-972",
},
{
  id: "news-973",
  tag: "行业",
  title: "Match Group（Tinder 母公司）放缓招聘以支付 AI 工具费用",
  summary: "TechCrunch 报道，Tinder 母公司 Match Group 正在放缓招聘节奏，将预算转向增加 AI 工具投入，反映了 AI 对传统人力资源配置的实质影响。",
  content: `AI 正在改变企业的人力资源配置策略。\n\n- Match Group（Tinder 母公司）宣布放缓招聘\n- 省下的招聘预算用于增加 AI 工具投入\n- 这是 AI 替代人类工作的真实商业案例\n- 从"AI 辅助"到"AI 替代"，企业正在做出实际决策\n- 经济学家开始讨论对因 AI 裁员的企业征税\n\n**来源：** TechCrunch\n**链接：** https://techcrunch.com/2026/05/06/tinder-owner-match-group-is-slowing-hiring-to-pay-for-its-increased-use-of-ai-tools/`,
  date: "2026-05-07 12:00",
  source: "TechCrunch",
  sourceUrl: "https://techcrunch.com/2026/05/06/tinder-owner-match-group-is-slowing-hiring-to-pay-for-its-increased-use-of-ai-tools/",
  href: "/news/news-973",
},
{
  id: "news-974",
  tag: "行业",
  title: "Kimi 完成 20 亿美元新融资，估值约 1400 亿元",
  summary: "据投资界/36 氪报道，月之暗面（Kimi）新一轮 20 亿美元融资已接近收尾阶段，估值约 1400 亿元人民币，早期投资人大赚。",
  content: `中国大模型融资热潮持续。\n\n- 月之暗面（Kimi）新一轮融资达 20 亿美元\n- 估值约 1400 亿元人民币\n- 融资已接近收尾阶段\n- 早期投资者获得可观回报\n- 与 DeepSeek 450 亿美元估值一起，中国 AI 公司正在吸引全球资本\n\n**来源：** 36 氪（投资界）+ 新浪科技\n**链接：** https://36kr.com/p/3798545988672774`,
  date: "2026-05-07 12:00",
  source: "36 氪（投资界）+ 新浪科技",
  sourceUrl: "https://36kr.com/p/3798545988672774",
  href: "/news/news-974",
},
{
  id: "news-975",
  tag: "行业",
  title: "豆包收费模式引发行业热议：从定价权争夺到平台梦",
  summary: "多篇文章分析字节跳动豆包收费模式的影响，从定价权争夺到商业模式转型，中国 AI 助手商业化进入深水区。",
  content: `豆包收费——中国 AI 商业化的转折点。\n\n- 字节跳动豆包推出付费订阅，引发行业广泛讨论\n- 从"免费获客"到"增值服务变现"的战略转变\n- 分析认为豆包正在重新确立行业定价规则\n- 商业世界里，"逻辑成立"和"真的发生"之间还隔着无数变量\n- 豆包赌自己能圆"平台梦"，但收费后的用户留存是关键考验\n\n**来源：** 36 氪（多篇文章综合分析）\n**链接：** https://36kr.com/p/3798604827898370`,
  date: "2026-05-07 12:00",
  source: "36 氪（多源综合）",
  sourceUrl: "https://36kr.com/p/3798604827898370",
  href: "/news/news-975",
},
{
  id: "news-976",
  tag: "政策",
  title: "经济学家建议对 AI 裁员企业征税，'AI 替岗'引发政策讨论",
  summary: '复旦《管理视野》报道，在“AI 替岗”潮下，经济学家们提出应该对因 AI 裁员的企业征税，引发广泛讨论。',
  content: `AI 替代人类工作，政策如何应对？\n\n- 经济学家提出对因 AI 裁员的企业征税\n- 这并非技术的宿命，而是市场失灵的警示\n- Match Group 等公司已开始用 AI 替代招聘\n- AI 就业影响从理论讨论走向政策制定阶段\n- 复旦学者认为这不是技术必然结果，而是需要政策干预的市场问题\n\n**来源：** 36 氪（复旦《管理视野》）\n**链接：** https://36kr.com/p/3798560580787457`,
  date: "2026-05-07 12:00",
  source: "36 氪（复旦《管理视野》）",
  sourceUrl: "https://36kr.com/p/3798560580787457",
  href: "/news/news-976",
},
{
  id: "news-977",
  tag: "应用",
  title: "Genesis AI 展示全栈机器人能力，Khosla 支持",
  summary: "TechCrunch 报道，Khosla 支持的机器人初创公司 Genesis AI 展示了全栈机器人能力 demo，在具身智能领域迈出重要一步。",
  content: `具身智能正在从实验室走向现实。\n\n- Genesis AI 展示了全栈机器人能力\n- 获 Khosla Ventures 支持\n- 从单一技能到全栈能力，机器人技术正在突破\n- 与 Khosla 在机器人领域的持续投入一致\n- 具身智能是 AI 的下一个前沿\n\n**来源：** TechCrunch\n**链接：** https://techcrunch.com/2026/05/06/khosla-backed-robotics-startup-genesis-ai-has-gone-full-stack-demo-shows/`,
  date: "2026-05-07 12:00",
  source: "TechCrunch",
  sourceUrl: "https://techcrunch.com/2026/05/06/khosla-backed-robotics-startup-genesis-ai-has-gone-full-stack-demo-shows/",
  href: "/news/news-977",
},
{
  id: "news-978",
  tag: "行业",
  title: "PayPal 宣布回归科技公司定位，全面拥抱 AI",
  summary: "TechCrunch 报道，PayPal CEO 宣布公司正在'重新成为一家科技公司'，核心策略是全面拥抱 AI 技术。",
  content: `传统金融科技公司的 AI 转型。\n\n- PayPal 宣布回归科技公司定位\n- 全面拥抱 AI 作为核心战略\n- 从支付公司向 AI 驱动的科技司转型\n- 这反映了 AI 正在重塑金融科技行业的竞争格局\n- PayPal 的转型可能带动更多金融科技公司跟进\n\n**来源：** TechCrunch\n**链接：** https://techcrunch.com/2026/05/05/paypal-says-its-becoming-a-technology-company-again-that-means-ai/`,
  date: "2026-05-07 12:00",
  source: "TechCrunch",
  sourceUrl: "https://techcrunch.com/2026/05/05/paypal-says-its-becoming-a-technology-company-again-that-means-ai/",
  href: "/news/news-978",
},
{
  id: "news-979",
  tag: "政策",
  title: "白宫考虑设立 AI 模型审查机制，防范网络安全风险",
  summary: "新浪科技报道，美国财政部长哈塞特称白宫正考虑设立 AI 模型审查机制，旨在防范前沿 AI 模型可能被用于网络安全的风险。",
  content: `AI 监管正在从讨论走向行动。\n\n- 美国财政部长哈塞特透露白宫考虑设立 AI 模型审查机制\n- 主要目的是防范前沿 AI 模型被用于网络安全攻击\n- 这表明美国政府正在加强对 AI 模型的管控\n- 从行业自律走向政府监管，AI 治理进入新阶段\n- 这对全球 AI 治理格局有重要影响\n\n**来源：** 新浪科技\n**链接：** https://finance.sina.com.cn/stock/usstock/c/2026-05-06/doc-inhwyupx8799668.shtml`,
  date: "2026-05-07 12:00",
  source: "新浪科技",
  sourceUrl: "https://finance.sina.com.cn/stock/usstock/c/2026-05-06/doc-inhwyupx8799668.shtml",
  href: "/news/news-979",
}
];

// Find the closing bracket and insert before it
const closingIdx = content.lastIndexOf('] as NewsItem[];');
if (closingIdx === -1) {
  console.error('Could not find closing bracket');
  process.exit(1);
}

// Build the new entries string
let entriesStr = newItems.map(item => {
  return `  {\n    id: "${item.id}",\n    tag: "${item.tag}",\n    title: "${item.title}",\n    summary: "${item.summary}",\n    content: \`${item.content}\`,\n    date: "${item.date}",\n    source: "${item.source}",\n    sourceUrl: "${item.sourceUrl}",\n    href: "${item.href}",\n  }`;
}).join(',\n');

// Insert before the closing bracket
const before = content.slice(0, closingIdx);
const after = content.slice(closingIdx);

// Remove trailing comma from last existing entry if present
const trimmedBefore = before.replace(/,\s*$/, '');

const newContent = trimmedBefore + ',\n' + entriesStr + '\n' + after;

fs.writeFileSync(filePath, newContent, 'utf8');
console.log(`✅ Added ${newItems.length} news items (news-967 to news-979)`);
