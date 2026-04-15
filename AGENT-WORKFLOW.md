# AI Master Site 多 Agent 自主维护工作流

> 每 2 小时执行，由 Cron 自动触发
> 版本：v4.0 | 2026-04-16
> **铁律：24 小时不间断，内容全中文，每次必须更新首页时间，严格按流程执行**

---

## 🔄 编排架构（文件驱动，零耦合）

```
┌─────────────────────────────────────────────────┐
│                   Cron 触发                      │
│              每 2 小时整点执行                     │
└──────────────────┬──────────────────────────────┘
                   │
                   ▼
        ┌──────────────────────┐
        │  Unified Agent (主)   │
        │  1. 拉取代码           │
        │  2. 全面评估现状        │
        │  3. 自主决策做一件事    │
        │  4. 执行 → build → 测试│
        │  5. 提交推送 → 结束     │
        └──────────────────────┘

并行角色（通过报告文件传递信息）：
- Content Researcher → reports/latest-content-report.md
- QA Tester         → reports/latest-qa-report.md
- Dev/PM (Unified)  → 读取两份报告 + 自主判断 → 执行
```

## 📋 每次执行的标准流程

### Phase 1: Content Researcher（内容研究员）
```
读取 prompt: content-agent-prompt.txt
执行研究：
  - 9 层研究体系（新闻/论文/工具/框架/方法论/意见领袖/GitHub/公司/教育）
  - 至少搜索 15 个关键词
  - 至少发现 10 条热门信息
  - 至少分析 3 个竞品
  - 至少发现 5 个新工具
输出：reports/latest-content-report.md
```

### Phase 2: QA Tester（测试员）
```
读取 prompt: qa-tester-prompt.txt
执行测试：
  - 全局扫描 → 逐页深度测试 → 回归测试
  - 每个页面 PC + 移动端截图
  - 控制台检查
  - 交互功能逐项测试
  - 内容质量抽查
输出：reports/latest-qa-report.md
```

### Phase 3: Dev/PM (Unified Agent - 主 Agent)
```
读取 prompt: unified-agent-prompt.txt

深度分析：
  1. 读取 content-report → 研究员发现了什么？哪些最值得做？
  2. 读取 qa-report → 有哪些 bug？体验问题？
  3. 扫描代码库 → 内容现状？新闻新旧？知识库覆盖？
  4. 快速浏览网站 → 第一印象如何？

自主决策（按价值优先级）：
  🔴 P0: bug / 网站不可用 → 立即修复
  🟠 P1: 新闻过期 >24h / QA P1 问题 → 高优先处理
  🟡 P2: 知识库缺失热门内容 / 工具集更新 → 中优先处理
  🟢 P3: 体验优化 / 技术债 → 低优先处理

执行 → build → 自测 → 提交推送 → 结束
```

## 📦 交付产物清单

| 角色 | 交付产物 | 验收标准 |
|------|----------|----------|
| Content Researcher | `reports/latest-content-report.md` | 10+ 热门、10+ 工具、5+ 论文、3+ 竞品、5+ 开发建议 |
| QA Tester | `reports/latest-qa-report.md` + `reports/screenshots/*` | 每个页面 PC+移动截图、控制台检查、交互测试表 |
| Dev/PM | Git commit + push | build 通过、自测通过、commit message 清晰 |
| 每次必做 | `src/data/update-time.ts` 已更新 | 时间戳为当前时间 |

## 📊 执行策略

**统一 Agent 自主决策模式：**
- 不再拆分为多个子 Agent 串行执行（效率低、容易超时）
- 主 Agent 读取两份报告 + 自主判断 → 做最有价值的一件事
- 研究员和 QA 的职责通过 prompt 文件定义，主 Agent 按需调用

**研究员要求（内容采集必须广泛）：**
- 搜索关键词越多越好，9 层研究体系全覆盖
- 不要只搜固定关键词，发现新概念立即扩展搜索
- 每条信息要有深度摘要，不是简单标题

**PM 要求（决策必须有理有据）：**
- 研究员的报告是参考，不是命令
- 要结合代码现状、QA 报告、研究员建议，综合判断
- 要有自己的产品直觉，不完全依赖报告

## 🛡️ 质量控制

1. **编译验证** — 每次提交前 `npm run build` 通过
2. **自测验证** — browser 打开改动页面，截图确认
3. **已有内容保护** — 只新增，不修改已有文章（除非事实错误）
4. **中文内容** — 所有 title/summary/content 必须是中文
5. **回滚机制** — 验证失败立即 `git checkout` 恢复
6. **内容渲染检查** — 遍历所有文章检查 Markdown 渲染是否正常

## 📢 汇报格式

```
📋 任务报告 - [时间]
📥 收集来源：...
📝 生成内容：...
✅ 测试结果：...
📦 提交状态：...
📅 下次计划：...
```
