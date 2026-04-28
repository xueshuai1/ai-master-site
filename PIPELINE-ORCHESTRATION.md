# 🔄 ai-master.cc 流水线编排机制

> v2 — 2026-04-28 定稿。4 角色每小时轮换，通过文档传递上下文。

---

## 一、执行时间表

```
:00 🔍 内容研究员（Stage1）
:01 📝 PM/内容生产（Stage2）
:02 🛠️ 开发工程师（Stage3）
:03 🧪 QA 验证（Stage4）
:04 🔍 内容研究员（新周期）
:05 📝 PM
:06 🛠️ 开发
:07 🧪 QA
...每 4 小时一个完整周期，每天 6 轮
```

每个 cron 独立 isolated session，互不阻塞。

---

## 二、文档流转

### 环形传递链

```
Stage1 研究员 ──写 findings.md──→ Stage2 PM
                                      │
                                  写 production.md
                                      ↓
Stage4 QA ←──读 dev-log.md ←── Stage3 开发
   │                              ↑
   │ 写 qa-report.md              │ 读 qa-report.md（上轮 QA 结果）
   ↓                              │
Stage1 研究员（读 qa-report 了解网站质量）
```

### 文件清单

| 文件 | 谁写 | 谁读 | 有效期 | 过期 fallback |
|------|------|------|--------|---------------|
| `reports/latest-content-findings.md` | Stage1 | Stage2 | 3h | Stage2 自己收集内容 |
| `reports/latest-production-report.md` | Stage2 | Stage3 | 3h | Stage3 读 `git log --oneline -10` |
| `reports/latest-dev-log.md` | Stage3 | Stage4 | 3h | Stage4 全面测试 |
| `reports/latest-qa-report.md` | Stage4 | Stage1 + Stage3 | 5h | Stage1/3 忽略，正常执行 |
| `reports/pipeline-status.md` | 所有阶段追加 | 所有阶段 | — | — |

### pipeline-status.md

每个阶段追加一行，读最近 24 行（= 完整 24 小时历史 = 6 个周期），保留 48 行（2 天）。
如果文件不存在 → 创建新文件，写入表头。

### ⚠️ 过期时间分析

**Stage1** 在 :00/:04/:08... 读 qa-report → 最近的 QA 在 :23/:03/:07... → **1 小时内，始终新鲜** ✅

**Stage2** 在 :01/:05/:09... 读 findings → 最近的研究在 :00/:04/:08... → **1 小时内，始终新鲜** ✅

**Stage3** 在 :02 读 production-report（来自 :01，1h 新鲜）和 qa-report（来自 :23，3h，在 5h 内）
在 :06 读 production-report（来自 :05，1h 新鲜）和 qa-report（来自 :03，3h，在 5h 内）
→ qa-report 始终在 5h 内。但如果 Stage4 崩溃没写报告，Stage3 fallback 自己跑 QA 脚本。

**Stage4** 在 :03/:07/:11... 读 dev-log → 最近的开发在 :02/:06/:10... → **1 小时内，始终新鲜** ✅

---

## 三、各阶段步骤

### 🔍 Stage1：内容研究员

**职责：** 收集 AI 前沿动态，写入 findings.md。

1. **同步**：git pull + 获取 token + 时间戳
2. **读 3 个文件**：qa-report.md（网站质量，过期/不存在忽略）+ pipeline-status 24 行（历史）+ KNOWLEDGE-BASE-PLAN.md（缺口）
3. **内容收集（⛔ 不可跳过，至少 6 来源）**：GitHub Trending / Topics / API、arXiv cs.AI、Simon Willison、OpenAI Blog、Anthropic News、Google AI、TechCrunch AI、Hacker News
4. **AI Topic 自生长**：tools.ts 提取 GitHub topics → 补充 ai-topics.json
5. **写报告**：覆盖 findings.md + 追加 pipeline-status 一行
6. **飞书汇报** → 结束

### 📝 Stage2：PM

**职责：** 根据 findings 决策写什么，生成文章。

1. **同步**：git pull + 获取 token
2. **读 3 个文件**：findings.md（≤ 3h，过期/不存在→自己收集）+ pipeline-status 24 行 + KNOWLEDGE-BASE-PLAN.md
3. **选题决策（严格按优先级）**：
   - P0: 知识库基础知识补缺（KNOWLEDGE-BASE-PLAN.md 找 [ ]）
   - P0: 技术博客热点解读（1 篇深度博客）
   - P1: 知识库旧文更新
   - P2: 新闻更新（**先 clean-old-news.mjs**，再写 10-15 条）
4. **⛔ 铁律**：
   - 博客 ≥ 5000 中文字、≥ 8 章、≥ 2 代码块、≥ 1 图表
   - 知识库 ≥ 4000 中文字、≥ 7 章、≥ 2 代码块
   - 写前查重：`grep -i '关键词' src/data/articles/*.ts src/data/blogs/*.ts`
   - 已有同话题 → 更新旧文，不另写
   - 代码块放 `code: [{ lang, code }]` 数组，Mermaid 用 800-900 色阶
5. **深度校验**：写新文章后跑 `node scripts/validate-article-depth.mjs`，不通过 = 补充
6. **提交前检查**：build + tsc
7. **提交推送** + 写 production-report + 追加 pipeline-status + 追加 daily.md
8. **飞书汇报** → 结束

### 🛠️ Stage3：开发

**职责：** 修 bug + 功能开发。

1. **同步**：git pull + 获取 token
2. **读 3 个文件**：production-report.md（≤ 3h，过期/不存在→`git log --oneline -10`）+ qa-report.md（≤ 5h，过期/不存在→自己跑 `node scripts/qa-scan.mjs`）+ pipeline-status 24 行
3. **开发任务**：
   - P0: 修 PM 报告的紧急 bug
   - P1: 修 QA 发现的 bug
   - P2: 功能优化（移动端 390px、PC 1440px、快速点击防抖）
   - P3: 工具集更新（discover-topic-projects.mjs + 更新 tools.ts）
   - P4: 新闻更新（先 clean-old-news.mjs，再写 10-15 条）
4. **规范**：中文、Mermaid 800-900 色阶、无 \\n 字面量
5. **提交前检查**：build + tsc
6. **提交推送** + 写 dev-log + 追加 pipeline-status + 追加 daily.md
7. **飞书汇报** → 结束

### 🧪 Stage4：QA

**职责：** 全面测试，发现并修复 bug。

1. **同步**：git pull + 获取 token
2. **读 2 个文件**：dev-log.md（≤ 3h，知道改了啥重点测，过期/不存在→全面测试不限区域）+ pipeline-status 24 行
3. **脚本扫描**：`node scripts/qa-scan.mjs`
4. **Browser 验证**：首页 → 知识库 → 工具页 → 博客页 → 交互压力 → 控制台
5. **修复 bug**：P0 立即修，P1 修，P2 有时间修
6. **提交前检查**：build + tsc
7. **提交推送** + 写 qa-report + 追加 pipeline-status + 追加 daily.md
8. **飞书汇报** → 结束

---

## 四、报告模板

### findings.md（Stage1 → Stage2）
```
⏰ 写入时间：YYYY-MM-DD HH:MM (Asia/Shanghai)
🔥 热点（X 条）：标题 + 摘要 + 适合板块
🆕 新工具（X 个）：名称 + 描述 + URL
💡 知识缺口（X 项）：待补分类
```

### production-report.md（Stage2 → Stage3）
```
⏰ 写入时间：YYYY-MM-DD HH:MM (Asia/Shanghai)
📄 知识库：[ID] 标题（新写/更新）
📄 博客：[ID] 标题（X字/Y章/Z代码）
📰 新闻：X 条
🛠️ 需开发配合：（如有）
```

### dev-log.md（Stage3 → Stage4）
```
⏰ 写入时间：YYYY-MM-DD HH:MM (Asia/Shanghai)
🐛 修复：X 个 bug（描述）
✨ 新增：Y 个功能
🔧 优化：Z 项
已知问题：（修不了的）
```

### qa-report.md（Stage4 → Stage1 + Stage3）
```
⏰ 写入时间：YYYY-MM-DD HH:MM (Asia/Shanghai)
脚本：通过X / 失败Y / 警告Z
Browser：首页✅ 知识库✅ 工具页✅ 博客页✅/❌
P0（阻断）：X → 已修复/待修复
P1（重要）：X → 已修复/待修复
P2（建议）：X
```

### pipeline-status.md（所有阶段）
```markdown
# 流水线状态（保留最近 48 行）
| 时间 | 阶段 | 做了什么 | 状态 |
| 04-28 00:00 | 🔍 研究员 | 扫描8来源,12热点,3新工具,2缺口 | ✅ |
| 04-28 01:00 | 📝 PM | 博客blog-081(5200字/9章),新闻12条 | ✅ |
| 04-28 02:00 | 🛠️ 开发 | 修复P1x2,优化移动端表格 | ✅ |
| 04-28 03:00 | 🧪 QA | 通过45/失败2/P1已修复 | ✅ |
```

---

## 五、异常处理

| 情况 | 处理 |
|------|------|
| 某阶段崩溃/跳过 | 下游读 report 发现过期/不存在 → 自己收集数据，流水线继续 |
| git pull 冲突 | `git stash && git pull && git stash pop` |
| build 失败修不好 | `git checkout HEAD~1` 回滚 |
| findings.md 为空 | PM 自己扫描至少 3 个来源 |
| QA 报告全是历史遗留 | Stage3 只修新 bug，不反复修同一个 |
| Stage2 和 Stage3 同时 push | 各自先 pull，冲突自动解决 |
| pipeline-status.md 不存在 | 创建新文件，写入表头 + 第一行 |

## 六、设计原则

1. 每个报告 ≤ 500 字
2. pipeline-status 读 24 行 = 24 小时历史，保留 48 行 = 2 天
3. 每个阶段只读 2-3 个文件，不复现之前 12 个文件的 token 爆炸
4. 过期/不存在 fallback：报告过期或不存在就自己收集
5. 原执行意图不变：收集→写作→开发→验证，一个不少
6. Stage3 读上轮 QA 报告，修复上一轮发现的 bug
