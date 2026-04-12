# AI Master Site 多 Agent 维护工作流

> 每小时执行，由 Cron 自动触发
> 版本：v3.0 | 2026-04-12
> **铁律：每次维护必须更新首页更新时间，严格按多 Agent 编排流程执行，按交付产物验收**
> **更新：v3.0 — 不轮换，每次全量执行 A+B+C+D，新闻源 8+ 关键词，发现缺失立即生成**

---

**⚠️ 铁律：**
- **24 小时不间断** — 包括 23:00-07:00（这是国外工作时间）
- **每次维护必须更新首页更新时间** — 无论执行了什么任务，最后一步必须是 `bash scripts/update-time.sh`
- **严格按多 Agent 编排流程** — 总指挥 → Spawn → 并行 → 整合 → 验证 → 提交，不可跳步
- **按交付产物验收** — 每个子 Agent 必须有明确的交付产物（文件/代码），否则视为失败

---

## 🔄 编排流程（总指挥模式）

```
┌─────────────────────────────────────────────────┐
│                   Cron 触发                      │
│               每小时整点执行                      │
└──────────────────┬──────────────────────────────┘
                   │
                   ▼
        ┌──────────────────────┐
        │   总指挥 (Main)       │
        │  分析当前状态          │
        │  决定本轮任务          │
        └──────────┬───────────┘
                   │
    ┌──────────────┼──────────────┐
    ▼              ▼              ▼
┌────────┐    ┌────────┐    ┌────────┐
│Agent 1 │    │Agent 2 │    │Agent 3 │
│新闻采集│    │博客研究│    │知识库  │
│+更新首页│    │+生成文章│    │检查扩展│
└───┬────┘    └───┬────┘    └───┬────┘
    │             │             │
    ▼             ▼             ▼
┌─────────────────────────────────────┐
│         总指挥整合结果               │
│     验证 → 编译 → 提交 → 汇报       │
└─────────────────────────────────────┘
```

---

## 📋 每次执行的标准流程

### Step 1: 状态检查 (Main Agent)
```
1. 检查 git status — 有没有未提交的变更
2. 检查上次更新时间 — src/data/update-time.ts
3. 检查上次执行的任务 — heartbeat-state.json
4. 决定本轮执行哪些任务
```

### Step 2: 并行 Spawn 子 Agent (Main Agent)
根据任务类型，spawn 1-3 个子 Agent 并行执行：

#### Agent A — 新闻采集与首页更新
```
任务：扫描 AI 新闻源，更新首页
来源（至少 8+ 关键词组合）：
  - "AI news today" + 日期
  - "arXiv AI papers" + 最新
  - "OpenAI latest news"
  - "Google AI blog"
  - "Meta AI news"
  - "Anthropic news"
  - "Microsoft AI"
  - "AI startup funding"
  - 补充：AI cybersecurity, LLM benchmark, AI regulation
抓取页面：TechCrunch AI, arXiv cs.AI, alphaXiv, OpenAI blog
输出：更新 src/data/news.ts 数据源
验证：npx tsc --noEmit + npm run build
```

#### Agent B — 博客文章生成
```
任务：生成一篇深度技术博客
来源：arXiv 最新重要论文、技术博客
输出：src/app/blog/[id].tsx + src/data/blogs.ts
验证：npx tsc --noEmit + npm run build
```

#### Agent C — 知识库检查与扩展
```
任务：检查是否有新技术方向需要补充文章
来源：新技术发布、论文、框架更新
输出：src/data/articles/[id].ts + knowledge.ts
验证：npx tsc --noEmit + npm run build
```

### Step 3: 整合与提交 (Main Agent)
```
1. 等待所有子 Agent 完成
2. 逐一验收交付产物（文件是否存在、格式是否正确）
3. 运行 scripts/update-time.sh 更新时间戳（必须！）
4. npx tsc --noEmit 全量验证
5. git add -A && git commit && git push
6. 生成任务报告到 reports/ 目录
```

---

## 📦 交付产物清单

每个子 Agent 执行后必须产出明确文件：

| 任务 | 交付产物 | 验收标准 |
|------|----------|----------|
| A. 首页新闻 | `src/app/page.tsx` 已修改 | news 数组有 5 条最新新闻，日期为今日或昨日 |
| B. 博客文章 | `src/app/blog/[id].tsx` + 数据文件 | 文件存在，编译通过，内容深度 ≥ 1000 字 |
| C. 知识库扩展 | `src/data/articles/[id].ts` + `knowledge.ts` 更新 | 文件存在，7 章完整，编译通过 |
| D. 工具集更新 | `src/app/tools/page.tsx` 已修改 | 新增至少 1 个工具 |
| **每次必做** | `src/data/update-time.ts` 已更新 | 时间戳为当前时间，精确到分钟 |

---

## 📊 执行策略

**不轮换，每次全量执行 A+B+C+D。**

| 任务 | 搜索要求 | 说明 |
|------|----------|------|
| A. 新闻 | **8+ 关键词组合** | 不要只搜一两个关键词 |
| B. 博客 | arXiv + 技术博客 | 有值得解读的内容就生成 |
| C. 知识库 | 对比 KNOWLEDGE-BASE-PLAN | **发现缺失立即生成** |
| D. 工具集 | GitHub trending + HF | 有新工具就更新 |

**⛔ 禁止轻量检查：24 小时全量执行，不分时段。**

---

## 🛡️ 质量控制

1. **编译验证** — 每次提交前必须 `npx tsc --noEmit` 通过
2. **构建验证** — 重大更新后 `npm run build` 通过
3. **已有内容保护** — 不修改已提交的文章文件，只新增
4. **中文引号检查** — 新文件必须无中文引号
5. **回滚机制** — 验证失败立即 `git checkout` 恢复

---

## 📢 汇报格式

每次执行完毕后向用户汇报：

```
📋 任务报告 - [时间]
📥 收集来源：...
📝 生成内容：...
✅ 测试结果：...
📦 提交状态：...
📅 下次执行：...
```
