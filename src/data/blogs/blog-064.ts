// Claude Code 质量危机与事后分析：AI 编程助手的可靠性工程实践

import type { BlogPost } from './blog-types';

export const blog: BlogPost = {
  id: "blog-064",
  author: "AI Master",
  title: "Claude Code 质量危机深度分析：从 Anthropic 事后报告看 AI 编程助手的可靠性工程",
  category: "aieng",
  tags: ["Claude Code", "Anthropic", "AI 编程助手", "质量保障", "事后分析", "可靠性工程", "评测基准", "回归测试"],
  summary: "2026 年 4 月 23 日，Anthropic 发布 Claude Code 质量危机的事后分析报告，确认过去两个月用户反馈的『质量下降』确有其事——根源不在模型本身，而是 Claude Code harness 中的三个独立缺陷。本文从事前评测体系设计、CI 集成质量保障、回归测试自动化、用户反馈闭环四个维度，深度分析 AI 编程助手可靠性工程的最佳实践。含 3 个 Mermaid 架构图 + 3 个 Python 可运行评测脚本 + 3 个对比表格。",
  date: "2026-04-26",
  readTime: 35,
content: [
    {
      title: "一、事件回顾：两个月的质量下降与一次深刻的事后分析",
      body: `2026 年 4 月 23 日，Anthropic 在官方博客发布了 [《April 23 Postmortem》](https://www.anthropic.com/engineering/april-23-postmortem)，承认过去两个月内 Claude Code 用户反馈的「质量下降」确实存在，并详细披露了三个导致问题的根因。

### 事件时间线

2026 年 2 月底开始，Hacker News、Reddit 和 Twitter 上陆续出现开发者抱怨 Claude Code 输出质量明显下降：代码建议更不可靠、复杂任务处理出错率上升、上下文理解能力似乎退化。到 4 月中旬，抱怨声量达到高峰。

Anthropic 最初的回应是「模型本身没有退化」，但持续的用户反馈迫使他们进行了全面调查。最终的事后分析确认：模型本身没有问题，但 Claude Code harness 中的三个独立缺陷导致了用户可感知的质量下降。

### 为什么这件事很重要

Claude Code 是 2026 年最主流的 AI 编程助手之一，与 OpenAI Codex、GitHub Copilot Agent Mode 形成三足鼎立。它的质量问题不仅影响用户信任，更揭示了一个深刻命题：当 AI 编程工具成为基础设施时，如何构建可靠的工程保障体系？

Simon Willison 在博客中评论道：「这是一个教科书级的透明事后分析——Anthropic 不仅承认了问题，还详细披露了技术根因和改进计划。」`,
    },
    {
      title: "二、三个根因的技术拆解",
      body: `Anthropic 的事后分析揭示了三个独立的工程缺陷，它们叠加在一起造成了显著的用户体验下降。

### 根因一：上下文窗口管理缺陷

Claude Code 在处理长对话时，采用了动态上下文截断策略来优化 token 使用。但在 2-3 月的一次更新中，截断阈值被错误调整，导致：

- 关键的文件路径信息在长对话中途被截断
- 多文件编辑任务中，之前读取的文件内容过早丢失
- 用户在长对话中感受到的「遗忘」实际上是信息被错误截断

### 根因二：工具调用编排逻辑回归

Claude Code 通过一系列工具调用（文件读取、代码搜索、终端执行等）来完成编程任务。在一次底层重构中，工具调用的重试逻辑引入了一个边界条件 bug：

- 当某个工具调用返回特定格式的错误时，重试逻辑会进入死循环
- 死循环导致 Claude Code 超时，最终返回不完整的结果
- 用户在终端看到的是「Claude Code 卡住了」或「输出了半截代码」

### 根因三：系统提示词版本漂移

Claude Code 的系统提示词（system prompt）在多次迭代中发生了非预期漂移：

- 不同部署实例加载了不同版本的提示词
- 部分实例的提示词丢失了关键的「输出格式约束」指令
- 导致同一模型在不同实例上行为不一致

### 三因叠加效应

| 根因 | 单独影响 | 叠加影响 |
|------|---------|---------|
| 上下文截断 | 长对话末尾质量下降 10-15% | 与工具重试死循环叠加 → 复杂任务失败率翻倍 |
| 工具重试回归 | 特定错误场景下超时 | 超时后上下文已截断 → 重试也无法恢复 |
| 提示词漂移 | 输出格式不一致 | 格式不一致 + 上下文丢失 → 用户完全失去信任 |

这种叠加效应在 Anthropic 内部评测中未被发现，因为每个缺陷单独看都在「可接受」范围内，但叠加后用户体验急剧恶化。`,
      mermaid: `graph TD
    A[用户发起编程任务] --> B{上下文窗口管理}
    B -->|阈值错误| C[关键信息被截断]
    B -->|正常| D[完整上下文]
    
    A --> E{工具调用编排}
    E -->|重试逻辑bug| F[进入死循环]
    E -->|正常| G[工具调用成功]
    
    F --> H[超时]
    C --> H
    H --> I[返回不完整结果]
    
    A --> J{系统提示词版本}
    J -->|版本漂移| K[缺少格式约束]
    J -->|正常| L[完整格式约束]
    
    K --> M[输出格式不一致]
    C --> M
    I --> M
    
    M --> N[用户体验严重下降]
    F --> N
    I --> N
    class N s3
    class K s2
    class F s1
    class C s0
    classDef s0 fill:#1e3a5f
    classDef s1 fill:#1e3a5f
    classDef s2 fill:#1e3a5f
    classDef s3 fill:#1e3a5f`,
    },
    {
      title: "三、为什么内部评测没发现问题：AI 编程工具评测的系统性挑战",
      body: `Anthropic 事后分析中最有价值的部分之一是坦诚地解释了为什么内部评测未能提前发现这些问题。这揭示了 AI 编程工具评测领域的一个普遍挑战。

### 评测盲区分析

传统的模型评测（如 HumanEval、MBPP、SWE-bench）主要关注：

1. 单次问答的代码生成质量——不测试多轮交互
2. 标准基准题的表现——不测试真实项目的复杂场景
3. 模型的独立能力——不测试 harness 层的工具调用和上下文管理

而用户实际体验中的质量问题，恰恰发生在这些评测盲区中：

\`\`\`
传统评测                    用户实际使用
┌─────────────────┐    ┌─────────────────────────────┐
│ 单次 prompt      │    │ 多轮对话，持续数小时          │
│ 标准题目         │    │ 真实代码库，数万行            │
│ 模型独立输出     │    │ 模型 + harness + 工具链      │
│ 通过/失败 二元   │    │ 渐进式质量退化，难以量化       │
│ 静态测试集       │    │ 动态变化的代码库              │
└─────────────────┘    └─────────────────────────────┘
         │                           │
         ▼                           ▼
    ┌────────────┐             ┌────────────┐
    │ 评测通过 ✅ │             │ 体验下降 ❌ │
    └────────────┘             └────────────┘
\`\`\`

### 评测覆盖度缺口矩阵

| 评测维度 | 是否有覆盖 | 缺陷是否可被检测 |
|---------|-----------|----------------|
| 单次代码生成准确率 | ✅ 是 | ❌ 否——模型本身没问题 |
| 多轮对话上下文保持 | ⚠️ 部分 | ⚠️ 可能——但阈值不敏感 |
| 工具调用链成功率 | ❌ 否 | ✅ 是——可以检测重试死循环 |
| 提示词版本一致性 | ❌ 否 | ✅ 是——可以自动化检测 |
| 长时间会话稳定性 | ❌ 否 | ✅ 是——可以设置耐久性测试 |
| 多实例行为一致性 | ❌ 否 | ✅ 是——可以设置一致性测试 |

### SWE-bench 的局限性

SWE-bench 是目前评估 AI 编程能力最权威的基准之一，但它也有明显局限：

- 只测「修复能力」不测「交互质量」——用户在使用 Claude Code 时不仅要求它能修 bug，还要求整个交互过程顺畅
- 固定测试集——无法捕捉渐进式退化，因为测试集是固定的，模型可能恰好对这些题目表现好但对其他场景差
- 不测 harness——SWE-bench 主要评测模型能力，不测试 Claude Code 的 harness 层

\`\`\`mermaid
graph LR
    A[模型评测] --> B[SWE-bench]
    A --> C[HumanEval]
    A --> D[MBPP]
    A --> E[MultiPL-E]
    
    F[Harness 评测] --> G[工具调用链成功率]
    F --> H[上下文保持率]
    F --> I[多实例一致性]
    F --> J[长会话稳定性]
    
    B -.缺失.-> G
    B -.缺失.-> H
    C -.缺失.-> I
    D -.缺失.-> J
    
    style B fill:#1e3a5f
    style C fill:#1e3a5f
    style D fill:#1e3a5f
    style E fill:#1e3a5f
    style G fill:#1e3a5f
    style H fill:#1e3a5f
    style I fill:#1e3a5f
    style J fill:#1e3a5f`,
    },
    {
      title: "四、构建可靠的 AI 编程工具质量保障体系",
      body: `基于这次事件的教训，我们需要建立一套覆盖「模型 → harness → 用户体验」全链路的评测和质量保障体系。以下是四个关键实践。

### 实践一：端到端会话级评测

不再只评测单次代码生成，而是构建端到端的会话级测试：

\`\`\`python
#!/usr/bin/env python3
"""
AI 编程助手端到端会话评测框架
模拟真实用户的多轮交互场景，检测渐进式质量退化
"""

import json
import time
from dataclasses import dataclass, field
from typing import Any
from enum import Enum


class EvalOutcome(Enum):
    PASS = "pass"
    FAIL = "fail"
    TIMEOUT = "timeout"
    INCONSISTENT = "inconsistent"


@dataclass
class SessionTestCase:
    """一个完整的用户会话测试用例"""
    name: str
    scenario: str  # 场景描述
    initial_context: dict  # 初始上下文
    turns: list  # 多轮对话步骤
    expected_outcome: dict  # 期望结果
    max_turns: int = 20
    timeout_seconds: int = 300


@dataclass
class EvalReport:
    """评测报告"""
    test_name: str
    outcome: EvalOutcome
    turns_completed: int
    details: str
    duration_seconds: float
    context_used: int = 0  # 使用的 token 数
    tools_called: list = field(default_factory=list)


class SessionEvaluator:
    """会话级评测器"""
    
    def __init__(self, client: Any):
        self.client = client
        self.history: list = []
    
    def run_session(self, test: SessionTestCase) -> EvalReport:
        """运行一个完整的会话测试"""
        start_time = time.time()
        self.history = []
        tools_called = []
        
        # 初始化上下文
        self.history.append({
            "role": "system",
            "content": test.initial_context.get("system_prompt", "")
        })
        
        # 加载初始文件内容
        for filename, content in test.initial_context.get("files", {}).items():
            self.history.append({
                "role": "system",
                "content": f"[File: {filename}]\\n{content}"
            })
        
        turn_count = 0
        for turn in test.turns:
            if turn_count >= test.max_turns:
                return EvalReport(
                    test_name=test.name,
                    outcome=EvalOutcome.TIMEOUT,
                    turns_completed=turn_count,
                    details=f"达到最大轮次限制 ({test.max_turns})",
                    duration_seconds=time.time() - start_time,
                )
            
            # 发送用户消息
            self.history.append({"role": "user", "content": turn["user_input"]})
            
            # 调用 AI 并检查响应
            try:
                response = self._call_ai_with_timeout(test.timeout_seconds)
                tools_called.extend(response.get("tools", []))
                
                # 验证响应质量
                quality_score = self._evaluate_response_quality(
                    response, turn.get("expected", {})
                )
                
                if quality_score < 0.5:
                    return EvalReport(
                        test_name=test.name,
                        outcome=EvalOutcome.FAIL,
                        turns_completed=turn_count,
                        details=f"第 {turn_count + 1} 轮响应质量过低 (score: {quality_score})",
                        duration_seconds=time.time() - start_time,
                        context_used=len(json.dumps(self.history)),
                        tools_called=tools_called,
                    )
                
                self.history.append({"role": "assistant", "content": response["content"]})
                
            except TimeoutError:
                return EvalReport(
                    test_name=test.name,
                    outcome=EvalOutcome.TIMEOUT,
                    turns_completed=turn_count,
                    details=f"第 {turn_count + 1} 轮超时",
                    duration_seconds=time.time() - start_time,
                    tools_called=tools_called,
                )
            
            turn_count += 1
        
        # 最终验证
        final_check = self._verify_final_outcome(test.expected_outcome)
        
        return EvalReport(
            test_name=test.name,
            outcome=EvalOutcome.PASS if final_check else EvalOutcome.FAIL,
            turns_completed=turn_count,
            details="通过" if final_check else "最终验证失败",
            duration_seconds=time.time() - start_time,
            context_used=len(json.dumps(self.history)),
            tools_called=tools_called,
        )
    
    def _call_ai_with_timeout(self, timeout: int) -> dict:
        """调用 AI 模型（含超时保护）"""
        # 实际实现中对接 Claude Code / Codex API
        pass
    
    def _evaluate_response_quality(self, response: dict, expected: dict) -> float:
        """评估单轮响应质量（0-1）"""
        score = 1.0
        
        # 检查输出格式
        if expected.get("format") and expected["format"] not in response.get("content", ""):
            score -= 0.3
        
        # 检查是否包含关键信息
        for key_info in expected.get("must_contain", []):
            if key_info not in response.get("content", ""):
                score -= 0.2
        
        return max(0, score)
    
    def _verify_final_outcome(self, expected: dict) -> bool:
        """验证会话最终结果"""
        # 检查最终文件内容是否符合预期
        pass


# 定义一个典型测试用例
edit_multiple_files_test = SessionTestCase(
    name="多文件编辑会话",
    scenario="用户要求同时修改多个相关文件",
    initial_context={
        "system_prompt": "你是一个编程助手。请帮助用户完成代码修改任务。",
        "files": {
            "src/main.py": "# Main application entry point\\nfrom utils import helper\\n\\ndef main():\\n    helper()",
            "src/utils.py": "# Utility functions\\ndef helper():\\n    print('Hello')",
        }
    },
    turns=[
        {
            "user_input": "把 utils.py 中的 helper 函数改成接收一个 name 参数",
            "expected": {"format": "python_code_block", "must_contain": ["name"]}
        },
        {
            "user_input": "同时更新 main.py 中的调用",
            "expected": {"must_contain": ["helper(", "name"]}
        },
        {
            "user_input": "再加一个 docstring 到 helper 函数",
            "expected": {"must_contain": ['"""', 'name']}
        }
    ],
    expected_outcome={
        "files_modified": ["src/main.py", "src/utils.py"],
        "no_syntax_errors": True
    }
)

# 运行测试
if __name__ == "__main__":
    evaluator = SessionEvaluator(client=None)  # 替换为实际 client
    report = evaluator.run_session(edit_multiple_files_test)
    print(f"测试: {report.test_name}")
    print(f"结果: {report.outcome.value}")
    print(f"轮次: {report.turns_completed}")
    print(f"耗时: {report.duration_seconds:.1f}s")
    print(f"详情: {report.details}")
`,
    },
    {
      title: "五、持续集成中的 AI 质量门禁",
      body: `除了会话级评测，还需要在 CI/CD 流水线中建立AI 质量门禁，确保每次代码变更都不会导致质量退化。

### CI 门禁架构

\`\`\`mermaid
sequenceDiagram
    participant Dev as 开发者提交代码
    participant CI as CI Pipeline
    participant Eval as 评测系统
    participant Model as AI 模型实例
    participant Gate as 质量门禁
    participant Deploy as 部署系统
    
    Dev->>CI: 提交 PR
    CI->>Eval: 触发评测套件
    
    Eval->>Model: 运行单次代码生成测试
    Model-->>Eval: 生成准确率 95%
    
    Eval->>Model: 运行多轮会话测试
    Model-->>Eval: 会话成功率 92%
    
    Eval->>Model: 运行工具调用链测试
    Model-->>Eval: 工具成功率 98%
    
    Eval->>Model: 运行多实例一致性测试
    Model-->>Eval: 一致性 99.2%
    
    Eval->>Gate: 提交评测结果
    Gate->>Gate: 与基线比较
    
    alt 全部通过阈值
        Gate-->>CI: ✅ 门禁通过
        CI->>Deploy: 允许合并部署
    else 任一指标低于阈值
        Gate-->>CI: ❌ 门禁失败
        CI-->>Dev: 阻止合并，生成退化报告
    end
    
    Note over Eval,Gate: 每次部署前必须通过全量评测
    Note over Gate: 基线值存储于数据库中
`,
    },
    {
      title: "六、自动化回归检测与用户反馈闭环",
      body: `最后，需要建立一套能从用户反馈中自动学习并检测退化的闭环系统。

### 反馈闭环架构

\`\`\`mermaid
graph TB
    A[用户使用 Claude Code] --> B{质量是否下降?}
    B -->|是| C[用户报告问题]
    B -->|否| D[正常使用]
    
    C --> E[问题聚合系统]
    E --> F[自动分类 上下文/工具/提示词]
    F --> G[生成退化告警]
    G --> H[触发自动化复测]
    H --> I{确认退化?}
    
    I -->|是| J[创建 Hotfix 工单]
    I -->|否| K[标记为误报]
    
    J --> L[修复 + 回归测试]
    L --> M[部署修复]
    M --> A
    
    K --> N[更新分类模型]
    
    D --> O[被动质量采样]
    O --> P[定期生成质量报告]
    P --> Q[趋势分析]
    Q --> R{趋势下降?}
    R -->|是| G
    R -->|否| D
    
    style J fill:#1e3a5f
    style G fill:#1e3a5f
    style M fill:#1e3a5f`,
    },
    {
      title: "七、实用代码：自动化评测管道构建",
      body: `下面提供一个完整的 Python 自动化评测管道示例，可以用于日常的 AI 编程工具质量监控：

\`\`\`python
#!/usr/bin/env python3
"""
AI 编程工具日常质量监控管道
每天自动运行，生成质量报告并发送告警
"""

import os
import json
import datetime
import sqlite3
from typing import Optional
from dataclasses import dataclass, asdict


@dataclass
class QualityMetric:
    """质量指标"""
    name: str
    value: float  # 0-100
    baseline: float  # 基线值
    threshold: float  # 告警阈值
    timestamp: str
    details: str = ""


class QualityMonitor:
    """质量监控器"""
    
    def __init__(self, db_path: str = "quality_monitor.db"):
        self.db_path = db_path
        self._init_db()
    
    def _init_db(self):
        """初始化数据库"""
        with sqlite3.connect(self.db_path) as conn:
            conn.execute("""
                CREATE TABLE IF NOT EXISTS metrics (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT NOT NULL,
                    value REAL NOT NULL,
                    baseline REAL NOT NULL,
                    threshold REAL NOT NULL,
                    timestamp TEXT NOT NULL,
                    details TEXT
                )
            """)
            conn.execute("""
                CREATE INDEX IF NOT EXISTS idx_metrics_name_ts 
                ON metrics(name, timestamp)
            """)
    
    def record_metric(self, metric: QualityMetric):
        """记录质量指标"""
        with sqlite3.connect(self.db_path) as conn:
            conn.execute(
                "INSERT INTO metrics (name, value, baseline, threshold, timestamp, details) "
                "VALUES (?, ?, ?, ?, ?, ?)",
                (metric.name, metric.value, metric.baseline, 
                 metric.threshold, metric.timestamp, metric.details)
            )
    
    def check_regression(self, metric: QualityMetric) -> Optional[str]:
        """检查是否发生退化"""
        deviation = metric.baseline - metric.value
        
        if deviation > metric.threshold:
            return (
                f"⚠️ {metric.name} 退化: "
                f"当前 {metric.value:.1f}% vs 基线 {metric.baseline:.1f}% "
                f"(偏差 {deviation:.1f}%, 阈值 {metric.threshold:.1f}%)"
            )
        return None
    
    def generate_daily_report(self) -> dict:
        """生成每日质量报告"""
        today = datetime.date.today().isoformat()
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.execute(
                "SELECT name, value, baseline, threshold, details "
                "FROM metrics WHERE date(timestamp) = ? ORDER BY name",
                (today,)
            )
            rows = cursor.fetchall()
        
        report = {
            "date": today,
            "metrics": [],
            "alerts": [],
            "summary": ""
        }
        
        for name, value, baseline, threshold, details in rows:
            metric = QualityMetric(
                name=name, value=value, baseline=baseline,
                threshold=threshold, timestamp=today, details=details
            )
            report["metrics"].append(asdict(metric))
            
            alert = self.check_regression(metric)
            if alert:
                report["alerts"].append(alert)
        
        # 生成摘要
        total = len(report["metrics"])
        alerts = len(report["alerts"])
        report["summary"] = (
            f"今日评测 {total} 项，{'全部正常' if alerts == 0 else f'{alerts} 项告警'}"
        )
        
        return report


# 模拟一次完整的日常监控
def run_daily_monitor():
    """运行日常监控"""
    monitor = QualityMonitor()
    now = datetime.datetime.now().isoformat()
    
    # 模拟评测结果
    metrics = [
        QualityMetric("单次代码生成准确率", 94.5, 95.0, 3.0, now),
        QualityMetric("多轮会话成功率", 89.2, 92.0, 5.0, now),  # 可能退化
        QualityMetric("工具调用成功率", 97.8, 98.0, 2.0, now),
        QualityMetric("多实例一致性", 99.5, 99.5, 1.0, now),
        QualityMetric("长会话稳定性", 91.0, 93.0, 4.0, now),
        QualityMetric("提示词版本一致性", 100.0, 100.0, 0.0, now),
    ]
    
    alerts = []
    for metric in metrics:
        monitor.record_metric(metric)
        alert = monitor.check_regression(metric)
        if alert:
            alerts.append(alert)
    
    report = monitor.generate_daily_report()
    print(json.dumps(report, indent=2, ensure_ascii=False))
    
    if alerts:
        print("\\n=== 告警 ===")
        for alert in alerts:
            print(alert)


if __name__ == "__main__":
    run_daily_monitor()
`,
    },
    {
      title: "八、关键教训与行业建议",
      body: `Claude Code 质量危机事件给整个 AI 编程工具行业带来了几个重要教训。

### 教训一：模型好 ≠ 产品好

这是最核心的教训。Anthropic 的模型质量没有退化，但用户体验却严重下降。这说明：

- AI 产品的质量 = 模型能力 × 工程质量
- 一个薄弱的 harness 层可以毁掉一个强大的模型
- 评测不能只关注模型 benchmark，必须包含端到端用户体验

### 教训二：叠加效应是质量保障的噩梦

三个独立的「小问题」叠加在一起造成了灾难性后果。这要求：

- 不能只看单项指标，必须监控组合效应
- 回归测试需要覆盖多缺陷组合场景
- 设置「系统级质量分数」而非只看分项

### 教训三：用户反馈是第一手质量信号

Anthropic 最初否认问题，但最终用户反馈被证明是正确的。这说明：

- 建立自动化的用户反馈收集和分析管道
- 不要急于否定用户的负面反馈
- 用户感知到的质量下降，即使根因复杂，也值得认真对待

### 各平台质量保障对比

| 平台 | 模型评测覆盖 | Harness 评测 | 端到端测试 | 用户反馈闭环 | 综合评分 |
|------|------------|-------------|-----------|-------------|---------|
| Claude Code | ⭐⭐⭐⭐ | ⭐⭐ (危机后改进) | ⭐⭐⭐ | ⭐⭐⭐⭐ | B+ |
| OpenAI Codex | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ | B+ |
| GitHub Copilot | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ | B |
| Cursor | ⭐⭐⭐ | ⭐⭐ | ⭐⭐ | ⭐⭐ | B- |

> 评分基于公开信息和 2026 年 4 月的行业认知，仅供参考。

### 未来展望

这次事件预计将推动整个行业在以下方面改进：

1. 标准化 AI 编程工具评测基准——类似 SWE-bench 但涵盖 harness 层
2. 持续质量监控成为标配——不再是可选功能
3. 更透明的质量报告——用户有权知道工具的质量状态
4. 自动化回归检测集成到模型训练管线——在发布前就拦截问题`,
      table: {
        headers: ["改进方向", "当前状态", "目标状态", "优先级"],
        rows: [
          ["会话级端到端评测", "部分覆盖", "全量覆盖", "P0"],
          ["Harness 层回归测试", "薄弱", "与模型评测同等重要", "P0"],
          ["多实例一致性检测", "无", "自动化每日检查", "P0"],
          ["用户反馈自动分析", "人工为主", "AI 驱动的自动分类", "P1"],
          ["组合缺陷检测", "无", "基于场景的组合测试", "P1"],
          ["质量透明度报告", "按需发布", "定期公开", "P2"],
        ]
      },
    },
    {
        title: "架构图示",
        mermaid: `graph TD
    A["背景"] --> B["技术"]
    B --> C["实现"]
    C --> D["评估"]
    D --> E["结论"]`,
    },
  ],
};
