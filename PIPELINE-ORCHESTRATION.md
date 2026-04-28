# 🔄 ai-master.cc 四阶段编排流程

> 2026-04-28 设计，4 个角色每小时轮换，通过文档传递上下文。

---

## 执行时间表

```
每小时执行一个阶段，4 小时一个完整周期：

:00 → 🔍 内容研究员 (Stage1)
:01 → 📝 PM/内容生产 (Stage2)
:02 → 🛠️ 开发工程师 (Stage3)
:03 → 🧪 QA 验证 (Stage4)
:04 → 🔍 内容研究员（新周期）
:05 → 📝 PM/内容生产
...以此类推
```

---

## 文档流转机制

### 核心原则
每个阶段**只写一个报告文件**，下一个阶段**只读上一个阶段的报告 + 全局状态**。用精简语言，大模型能理解就行。

### 文档清单

| 文件 | 谁写 | 谁读 | 内容 |
|------|------|------|------|
| `reports/latest-content-findings.md` | Stage1 研究员 | Stage2 PM | 本轮发现的热点/工具/知识缺口 |
| `reports/latest-production-report.md` | Stage2 PM | Stage3 开发 | 本轮写了什么文章、还需什么开发配合 |
| `reports/latest-dev-log.md` | Stage3 开发 | Stage4 QA | 本轮改了哪些代码、修了什么 bug |
| `reports/latest-qa-report.md` | Stage4 QA | Stage1 研究员 | 本轮 QA 发现的问题、网站状态 |

### 全局状态文件（所有阶段都读）
- `reports/pipeline-status.md` — 每个阶段追加一行，记录本轮做了什么
- `memory/ai-master-daily.md` — 追加日志

---

## 各阶段报告格式（精简版）

### Stage1 → Stage2: `reports/latest-content-findings.md`
```
⏰ 写入时间：2026-04-28 00:00 (Asia/Shanghai)
## 本轮发现
🔥 热点（X 条）：
1. [标题] 一句话摘要 → 适合：博客/新闻/知识库
2. ...
🆕 新工具（X 个）：
1. [名称] 一句话描述 + GitHub URL
💡 知识缺口（X 项）：
1. KNOWLEDGE-BASE-PLAN.md 待补：[分类]
## 上轮遗留
- 上轮 PM 还需要：（如有）
```

### Stage2 → Stage3: `reports/latest-production-report.md`
```
⏰ 写入时间：2026-04-28 01:00 (Asia/Shanghai)
## 本轮写了什么
📄 知识库：[ID] 标题（新写/更新）
📄 博客：[ID] 标题（字数/章节/代码块数）
📰 新闻：X 条
## 需要开发配合
🛠️ P0: （如有需要开发紧急修复的）
🛠️ P1: （如有）
## 上轮遗留
- 上轮开发还需要：（如有）
```

### Stage3 → Stage4: `reports/latest-dev-log.md`
```
⏰ 写入时间：2026-04-28 02:00 (Asia/Shanghai)
## 本轮改了什么
🐛 修复：X 个 bug（简短描述）
✨ 新增：Y 个功能
🔧 优化：Z 项
## 已知问题（修不了的留给 QA 记录）
- ...
## 上轮遗留
- 上轮 QA 还需要：（如有）
```

### Stage4 → Stage1: `reports/latest-qa-report.md`
```
⏰ 写入时间：2026-04-28 03:00 (Asia/Shanghai)
## QA 结果
脚本：通过 X / 失败 Y / 警告 Z
Browser：首页✅ 知识库✅ 工具页✅ 博客页✅/❌
## 发现问题
P0（阻断）：X 个 → 已修复/待修复
P1（重要）：X 个 → 已修复/待修复
P2（建议）：X 个
## 上轮遗留
- 上轮研究员还需要关注：（如有）
```

### 全局状态: `reports/pipeline-status.md`
```
# 流水线状态（每个阶段追加一行，保留最近 48 行）

| 时间 | 阶段 | 做了什么 | 状态 |
|------|------|---------|------|
| 04-28 00:00 | 🔍 研究员 | 扫描 8 来源，12 热点，3 新工具，2 知识缺口 | ✅ |
| 04-28 01:00 | 📝 PM | 博客 blog-081（5200字/9章/3代码），新闻 12 条 | ✅ |
| 04-28 02:00 | 🛠️ 开发 | 修复 P1 x2，优化移动端表格溢出 | ✅ |
| 04-28 03:00 | 🧪 QA | 通过 45/失败 2/P1 已修复 | ✅ |
```

---

## 每个阶段的「读取清单」

**Stage1 研究员（:00 / :04 / ...）：**
1. `reports/latest-qa-report.md`（Stage4 上一轮结果）— 了解网站当前质量状态
2. `reports/pipeline-status.md`（最近 24 行）— 完整 24 小时历史（6 个周期）
3. `KNOWLEDGE-BASE-PLAN.md` — 知识缺口
→ 写 `reports/latest-content-findings.md`
→ 追加到 `reports/pipeline-status.md`

**Stage2 PM（:01 / :05 / ...）：**
1. `reports/latest-content-findings.md`（Stage1 本轮发现）— 本轮素材
2. `reports/pipeline-status.md`（最近 24 行）— 完整 24 小时历史
→ 写文章 → 写 `reports/latest-production-report.md`
→ 追加到 `reports/pipeline-status.md`

**Stage3 开发（:02 / :06 / ...）：**
1. `reports/latest-production-report.md`（Stage2 本轮需求）— 开发需求
2. `reports/latest-qa-report.md`（Stage4 上一轮问题）— bug 列表
3. `reports/pipeline-status.md`（最近 24 行）— 完整 24 小时历史
→ 写 `reports/latest-dev-log.md`
→ 追加到 `reports/pipeline-status.md`

**Stage4 QA（:03 / :07 / ...）：**
1. `reports/latest-dev-log.md`（Stage3 本轮改动）— 知道改了啥，重点测
2. `reports/pipeline-status.md`（最近 24 行）— 完整 24 小时历史
→ 跑 QA → 写 `reports/latest-qa-report.md`
→ 追加到 `reports/pipeline-status.md`

---

## 设计原则
1. **每个报告 ≤ 500 字** — 精简、只保留关键信息
2. **上下文通过 pipeline-status.md 传递** — 每个阶段追加一行，读 24 行 = 完整 24 小时历史（6 个完整周期），保留 48 行 = 2 天
3. **每个阶段只读 2-3 个文件** — 控制上下文，不读 12 个
4. **不改变原执行意图** — 内容收集、文章写作、开发修复、QA 验证，一个不少
