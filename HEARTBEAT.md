# HEARTBEAT.md

## 🔴 核心原则
**新闻只是点缀，知识库和工具集的持续进化才是核心价值。**
- 不要花 80% 时间在新闻上
- 发现新东西 → 写进知识库
- 发现旧文档过时 → 更新它
- 发现新工具 → 收录进工具集
- 不要局限在某一个 API 上，方法总比困难多

---

## 📋 每次心跳执行清单

### Step 0 — 执行前自审（必做！）
1. 读 `EVOLUTION.md` 最新 3 条记录，了解上次做了什么、效果如何、待改进什么
2. 读 `ANTI-LOOP.md`，记住：同一工具最多 2 次，同一问题反复 3 次就换方案
3. 带着「上次有什么问题？这次怎么改进？」的意识执行

### P0 — 知识巡检（必做）
1. 搜索 AI 前沿动态（arXiv、OpenAI Blog、Anthropic News、Google AI Blog、Simon Willison 等）
2. 发现值得写入知识库的新技术/新论文/新工具
3. 检查热门主题（LLM/Agent/RAG）的已有文章是否需要更新
4. 发现缺失 → 立即生成新文章 或 更新旧文章

### P1 — 工具巡检（必做，两个渠道并行收集）
1. 🔴 **GitHub Trending 扫描**（每周增长快的项目）：
   - 访问 https://github.com/trending?since=weekly
   - 筛选 AI/ML/LLM/Agent 相关项目
   - 发现周增 >1000 stars 的新项目 → 收录
2. 🔴 **GitHub Topics 扫描**（总星数高的项目，与 Trending 并行！）：
   - 运行 `node scripts/discover-topic-projects.mjs`
   - 该脚本读取 `data/ai-topics.json`（50 个 AI topics）
   - 对每个 topic 搜索 `topic:xxx stars:>minStars`（门槛 5000-10000）
   - 对比 tools.ts 已有项目，输出遗漏列表到 `data/missing-projects-report.json`
   - 发现遗漏的高星项目 → 立即收录到 tools.ts
   - 发现新 AI topic → 更新 ai-topics.json
3. 检查已有工具信息是否需要更新（版本、定价、功能变化）
4. 其他来源：HuggingFace 新模型、Product Hunt AI
5. 🔴 **全量比对机制**：用 GitHub API 搜索 `stars:>50K topic:artificial-intelligence` 等关键词，对比 tools.ts 已有 ID，发现遗漏必须收录

### P2 — 首页新闻（选做，不要花太多时间）
- 🔴 **先运行 `node scripts/clean-old-news.mjs` 清理 3 天以外旧数据**
- 2-5 条最新动态即可
- 来源：The Verge、TechCrurch、arXiv、各官方博客
- 不要依赖单一 API，哪个能用就用哪个
- 滚动条上限 6 条，date 格式 `YYYY-MM-DD HH:mm`

### P2 — 技术博客（每日必做）
- **每天至少更新/新增 1 篇博客**
- 使用 `ArticleSection[]` 格式（与知识库统一）
- 每篇至少 2 Mermaid 图 + 2 Python 代码块 + 1 表格
- 选题来源：最新论文解读、技术趋势分析、实战指南

---

## 🔧 数据收集渠道

| 渠道 | 用法 |
|------|------|
| `web_fetch` 直接抓取 | 最可靠，不依赖 API key |
| 浏览器 | 需要 JS 渲染的页面 |
| GitHub API | trending 项目（需 token）+ **搜索高星项目** |
| arXiv RSS | arxiv.org/rss/cs.AI |

**🔴 工具收录三机制（并行执行）：**
1. **Trending 机制**：每周看 GitHub Trending，发现快速增长的新项目
2. **Topics 扫描机制**：按 50 个 AI topics 扫描高星项目，发现总星数高但增长不高的优质项目
3. **全量比对机制**：用 GitHub API 搜索 `stars:>50K topic:xxx` 关键词，发现遗漏

**铁律：如果某个渠道不可用，立即换另一个，不要报错说"无法获取"。**

---

## 🔴 铁律
- **所有内容必须是中文**
- **每次改动代码后必须更新首页时间**
- **编译验证通过才能提交**
- **发现缺失内容立即生成，不要等**
- **主动巡检全站体验** — 分页、布局、响应式、交互

## 🧪 QA 自检清单（每次改代码后必做）

### 移动端必检（390px 视口）
1. **内容横向溢出**：页面不能有横向滚动条（除非表格/代码块刻意设计）
   - 重点：Markdown 表格、长 URL、pre 代码块、flex 子元素
   - 方案：`overflow-x-auto` / `min-w-0` / `break-all`
2. **文字不截断**：标题、链接不能撑破容器
   - 方案：`truncate` / `line-clamp` / `flex-wrap`

### 交互必检
3. **快速点击不崩溃**：筛选/排序按钮快速连续点击不能状态混乱
   - 方案：router.replace 加 400ms 防抖，状态变化自动重置页码
4. **数据一致性**：同一数据在不同页面的统计数字必须一致
   - 方案：提取共用函数，不要每个页面自己算

### 内容渲染必检
5. **转义字符**：tip/warning 中不能有 `\\n` 字面量（应使用实际换行或 `<br>`）
6. **HTML 标签**：Mermaid 图表中 `<br>` 需要引号包裹，表格中不能出现未转义 HTML 标签

---

## 📢 汇报格式
```
📋 任务报告 - [任务名]
📥 来源:...
📝 做了什么:...
✅ 结果:...
```
