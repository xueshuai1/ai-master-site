// Prompt 优化与评估：生产级提示词的量化测试与持续改进

import { Article } from '../knowledge';

export const article: Article = {
  id: "prompt-002",
  title: "Prompt 优化与评估：生产级提示词的量化测试与持续改进",
  category: "prompt",
  tags: ["Prompt 优化", "Prompt 评估", "A/B 测试", "自动化评估", "成本优化", "Prompt 管理", "生产级 Prompt"],
  summary: "写得好不如测得好。本文聚焦 Prompt 工程中最容易被忽视的环节——系统化评估与持续优化。从评估指标设计、自动化测试流水线、A/B 对比实验到成本控制，提供完整的 Python 实现代码和实战框架，帮助你将 Prompt 从「能用」提升到「生产可用」。",
  date: "2026-04-23",
  readTime: "35 min",
  level: "进阶",
  content: [
    {
      title: "一、为什么需要系统化评估 Prompt？",
      body: `在 AI Master 的 [Prompt Engineering 学习导览](/knowledge/prompt-guide) 和 [高级 Prompt 工程技术](/knowledge/prompt-001) 中，我们已经学习了如何编写好的 Prompt。但当你把 Prompt 投入生产环境时，一个关键问题浮出水面：

**你怎么知道这个 Prompt 是「好」的？**

如果你靠人工看一眼输出就觉得「不错」，那至少存在三个致命问题：

**1. 评估标准主观且不一致**
不同人、不同时间对「好」的定义不同。今天你觉得输出很好，明天换个场景可能完全不行。

**2. 无法量化改进效果**
你改了 Prompt 中的几个词，输出变了，但你不知道是变好了 5% 还是 50%，甚至可能变差了但你没发现。

**3. 回归问题无法检测**
模型升级了、系统上下文变了、输入分布偏移了——你的 Prompt 可能悄然失效，而你毫无察觉。

**生产级 Prompt 的核心原则：不能量化就不能优化。**

> 在工业界，Prompt 被视为**代码的一种形式**。就像你不会在生产环境中部署没有测试的代码一样，也不应该部署没有经过系统评估的 Prompt。

**量化评估带来的直接收益：**
- 找到性价比最高的 Prompt 变体，**成本降低 30-70%**
- 发现边缘案例，**准确率提升 10-40%**
- 建立回归检测，**防止线上事故**
- 为团队提供统一标准，**减少沟通成本**`,
      mermaid: `graph TD
    A[编写初始 Prompt] --> B[设计评估标准]
    B --> C[构建测试数据集]
    C --> D[自动化批量评估]
    D --> E{达标?}
    E -->|否| F[分析失败案例]
    F --> G[修改 Prompt]
    G --> D
    E -->|是| H[部署上线]
    H --> I[持续监控]
    I --> J{性能下降?}
    J -->|是| F
    J -->|否| I`
    },
    {
      title: "二、Prompt 评估的四大维度",
      body: `一个完整的 Prompt 评估体系应该覆盖以下四个维度，缺一不可：

**1. 准确性（Accuracy）——「输出对吗？」**

这是最直观的指标，衡量输出是否符合预期。根据任务类型，准确性可以用不同方式定义：

- **分类任务**：输出标签与标准答案的匹配率
- **提取任务**：提取内容与标准答案的 F1 分数
- **生成任务**：语义相似度、事实一致性、幻觉率

**2. 稳定性（Consistency）——「每次输出都靠谱吗？」**

同一个 Prompt + 相同输入，多次运行的结果是否一致？这对于生产系统至关重要。

- 运行 10 次，结果的方差有多大？
- 温度（temperature）参数对稳定性的影响？
- 哪些场景下模型会「偶尔犯错」？

**3. 效率（Efficiency）——「用得够省吗？」**

Prompt 的效率直接影响成本和延迟：

- **Token 消耗**：Prompt 本身用了多少 token？输出用了多少？
- **响应时间**：从发送请求到获得响应的延迟
- **成本效益比**：每单位准确性的 token 消耗

**4. 鲁棒性（Robustness）——「遇到奇怪输入会怎样？」**

- **对抗测试**：恶意构造的输入会导致什么行为？
- **边界情况**：空输入、超长输入、多语言混合输入的处理
- **分布外样本（OOD）**：训练数据之外的输入表现如何？

**四大维度的优先级排序：**

对于不同场景，四个维度的权重不同。以下是典型场景的权重分配：`,
      table: {
        headers: ["场景", "准确性", "稳定性", "效率", "鲁棒性"],
        rows: [
          ["医疗诊断辅助", "50%", "30%", "5%", "15%"],
          ["客服自动回复", "25%", "30%", "25%", "20%"],
          ["代码生成", "35%", "20%", "25%", "20%"],
          ["内容摘要", "30%", "25%", "25%", "20%"],
          ["数据提取", "40%", "35%", "15%", "10%"],
        ],
      },
    },
    {
      title: "三、构建自动化 Prompt 评估流水线",
      body: `手动评估 100 个测试用例需要数小时，而且结果不可复现。自动化评估流水线是生产级 Prompt 工程的基石。

下面是一个完整的 Python 评估框架，支持批量测试、评分计算、结果可视化：`,
      code: [
        {
          lang: "python",
          title: "测试数据集定义",
          code: `import json
from typing import List, Dict, Any
from dataclasses import dataclass

@dataclass
class TestCase:
    """单个测试用例"""
    id: str
    input: str
    expected_output: str
    category: str
    difficulty: str  # easy/medium/hard
    notes: str = ""

def load_test_suite(filepath: str) -> List[TestCase]:
    """从 JSON 文件加载测试数据集"""
    with open(filepath, 'r', encoding='utf-8') as f:
        data = json.load(f)
    return [TestCase(**item) for item in data]

# 测试数据集示例
test_cases = [
    TestCase(
        id="extract-001",
        input="John Smith, born March 15, 1990, works at Google as a Senior Engineer. Contact: john@google.com",
        expected_output='{"name":"John Smith","birth_date":"1990-03-15","company":"Google","role":"Senior Engineer","email":"john@google.com"}',
        category="信息提取",
        difficulty="easy",
    ),
    TestCase(
        id="extract-002",
        input="Dr. Sarah Johnson-Williams（出生于1985年7月22日）目前在 Meta Platforms, Inc. 担任 AI Research Scientist。",
        expected_output='{"name":"Sarah Johnson-Williams","birth_date":"1985-07-22","company":"Meta Platforms, Inc.","role":"AI Research Scientist","email":"sarah.jw@meta.com"}',
        category="信息提取",
        difficulty="medium",
        notes="包含连字符姓名、中文日期格式",
    ),
    TestCase(
        id="extract-003",
        input="张三 / 李四 / 王五 三人于 2023-01-15 共同创立了 XYZ 科技有限公司，注册资本 1000 万元。",
        expected_output='{"company":"XYZ 科技有限公司","founding_date":"2023-01-15","capital":"1000 万元"}',
        category="信息提取",
        difficulty="hard",
        notes="多条实体、结构化数据提取",
    ),
]`,
        },
        {
          lang: "python",
          title: "Prompt 评估器核心实现",
          code: `import re
import json
from typing import Dict, List, Tuple

class PromptEvaluator:
    """Prompt 评估器"""

    def __init__(self, api_client, prompt_template: str):
        self.api = api_client
        self.prompt_template = prompt_template
        self.results: List[Dict] = []

    def run_test(self, test_case: TestCase, temperature: float = 0.0) -> Dict[str, Any]:
        """运行单个测试用例"""
        prompt = self.prompt_template.format(input=test_case.input)
        response = self.api.generate(
            prompt=prompt,
            temperature=temperature,
            max_tokens=1024
        )
        score = self._score_output(response.text, test_case.expected_output)
        result = {
            "test_id": test_case.id,
            "category": test_case.category,
            "difficulty": test_case.difficulty,
            "prompt_tokens": response.usage.prompt_tokens,
            "completion_tokens": response.usage.completion_tokens,
            "total_tokens": response.usage.total_tokens,
            "latency_ms": response.latency_ms,
            "score": score,
            "output": response.text,
        }
        self.results.append(result)
        return result

    def _score_output(self, actual: str, expected: str) -> Dict[str, float]:
        """计算输出评分"""
        try:
            actual_data = json.loads(actual.strip())
            expected_data = json.loads(expected.strip())
        except json.JSONDecodeError:
            return {"accuracy": 0.0, "parse_success": False}

        scores = {}
        for key in expected_data:
            if key in actual_data:
                exact_match = 1.0 if str(actual_data[key]) == str(expected_data[key]) else 0.0
                fuzzy_match = self._fuzzy_match(str(actual_data[key]), str(expected_data[key]))
                scores[key] = max(exact_match, fuzzy_match)
            else:
                scores[key] = 0.0

        extra_fields = set(actual_data.keys()) - set(expected_data.keys())
        penalty = len(extra_fields) * 0.05
        overall = (sum(scores.values()) / len(scores)) - penalty
        return {
            "accuracy": max(0.0, min(1.0, overall)),
            "parse_success": True,
            "field_scores": scores,
            "extra_fields": list(extra_fields),
        }

    def _fuzzy_match(self, a: str, b: str) -> float:
        """模糊匹配：处理格式差异"""
        a_norm = re.sub(r'[^\\w]', '', a.lower())
        b_norm = re.sub(r'[^\\w]', '', b.lower())
        if a_norm == b_norm: return 1.0
        if a_norm in b_norm or b_norm in a_norm: return 0.8
        return 0.0

    def run_stability_test(self, test_case: TestCase, n_runs: int = 10) -> Dict:
        """稳定性测试：同一输入多次运行"""
        scores = []
        for _ in range(n_runs):
            result = self.run_test(test_case, temperature=0.7)
            scores.append(result["score"]["accuracy"])
        import statistics
        return {
            "test_id": test_case.id,
            "mean_score": statistics.mean(scores),
            "std_dev": statistics.stdev(scores) if len(scores) > 1 else 0,
            "min_score": min(scores),
            "max_score": max(scores),
        }`,
        },
      ],
      mermaid: `graph TD
    A[测试数据集 JSON] --> B[PromptEvaluator]
    C[Prompt 模板] --> B
    B --> D[批量执行测试]
    D --> E[计算评分]
    E --> F[生成报告]
    F --> G{是否达标?}
    G -->|否| H[分析失败案例]
    H --> I[修改 Prompt]
    I --> C
    G -->|是| J[部署上线]
    J --> K[持续监控]
    K --> L{发现性能下降?}
    L -->|是| H
    L -->|否| K`,
    },
    {
      title: "四、Prompt A/B 测试实战",
      body: `当你在两个（或多个）Prompt 变体之间犹豫不决时，A/B 测试是唯一科学的决策方法。

**A/B 测试的核心逻辑：用同一批测试数据，跑同一个 Prompt 的两个版本，比较评分分布。**

**实战：优化一个信息提取 Prompt**

**版本 A（简单）**：请从以下文本中提取人物信息，包括姓名、出生日期、公司名称、职位和邮箱。以 JSON 格式输出。

**版本 B（精细）**：你是一个专业的信息提取助手。请从以下文本中精确提取以下字段：name（人物全名，去除头衔）、birth_date（YYYY-MM-DD 格式）、company（公司完整名称）、role（职位）、email（电子邮箱地址）。严格输出 JSON 格式，不要包含任何额外文字。如果某个字段无法确定，设为 null。

**A/B 测试结果对比：**`,
      table: {
        headers: ["指标", "版本 A（简单）", "版本 B（精细）", "改善"],
        rows: [
          ["平均准确率", "72.3%", "89.1%", "+16.8%"],
          ["通过率（≥80%）", "45% (9/20)", "85% (17/20)", "+40%"],
          ["平均 Token 消耗", "180", "245", "+36%"],
          ["平均延迟", "320ms", "380ms", "+18%"],
          ["JSON 解析成功率", "65%", "95%", "+30%"],
        ],
      },
    },
    {
      title: "五、Prompt 成本优化策略",
      body: `在生产环境中，Prompt 的 token 消耗直接转化为真金白银。优化 Prompt 成本不是「省几个 token」的小把戏，而是可以带来 **30-70% 成本降低** 的系统工程。

**成本优化的三个层次：**

**层次 1：Prompt 精简（立即可做，节省 10-30%）**

最常见的浪费是 Prompt 中包含了不必要的信息：

> ❌ 浪费的 Prompt（320 tokens）：你是一个 AI 助手，你的任务是从用户提供的文本中提取特定的信息。用户会给你一段文本，你需要从中提取出相关的信息。请仔细阅读文本，然后提取以下信息...

> ✅ 精简后的 Prompt（180 tokens，节省 44%）：从以下文本中提取：name, birth_date (YYYY-MM-DD), company, role, email。输出 JSON 格式。缺失字段设为 null。不添加额外文字。

**层次 2：Few-Shot 优化（需要测试，节省 20-50%）**

Few-Shot（少样本）提示虽然能提高准确性，但每个示例都会消耗大量 token。优化策略包括：选择最具代表性的示例、选择最能区分困难场景的示例、选择最简洁的示例。`,
      code: [
        {
          lang: "python",
          title: "智能 Few-Shot 示例选择",
          code: `def optimize_few_shot_examples(
    examples: List[Dict],
    target_count: int = 3,
    api_client=None
) -> List[Dict]:
    """智能选择最优的 Few-Shot 示例"""
    if api_client:
        # 使用模型自己评估每个示例的价值
        scores = []
        for ex in examples:
            eval_prompt = f"评估以下示例对信息提取任务的帮助程度（1-10分）：\\n输入: {ex['input']}\\n输出: {ex['output']}"
            response = api_client.generate(eval_prompt)
            scores.append(int(response.text.strip()))
        ranked = sorted(zip(examples, scores), key=lambda x: x[1], reverse=True)
        return [ex for ex, _ in ranked[:target_count]]
    
    # 无模型时，按输入长度和复杂度排序
    examples_by_complexity = sorted(
        examples,
        key=lambda x: len(x['input']) + len(x['output']),
        reverse=True
    )
    return examples_by_complexity[:target_count]`,
        },
        {
          lang: "python",
          title: "动态 Prompt 路由（根据输入特征选择最优策略）",
          code: `class DynamicPromptRouter:
    """根据输入特征动态选择最优 Prompt 策略"""
    
    def __init__(self):
        self.strategies = {
            "simple": {
                "prompt": "提取以下文本中的关键信息，输出 JSON：{input}",
                "temperature": 0.0,
                "max_tokens": 256,
            },
            "complex": {
                "prompt": "你是一个专业信息提取器。请从以下文本中提取：name, birth_date, company, role, email。严格输出 JSON 格式。缺失字段设为 null。日期统一 YYYY-MM-DD。{text}",
                "temperature": 0.0,
                "max_tokens": 512,
            },
            "ambiguous": {
                "prompt": "请仔细分析以下文本，提取人物信息。注意文本可能包含歧义。输出 JSON，如不确定请在 uncertainty 字段标注原因。{text}",
                "temperature": 0.3,
                "max_tokens": 768,
            },
        }
    
    def classify_input(self, text: str) -> str:
        """分类输入复杂度"""
        word_count = len(text.split())
        has_multiple = text.count(',') > 3 or text.count('、') > 2
        has_dates = bool(re.search(r'\\d{4}[-/]\\d{1,2}[-/]\\d{1,2}', text))
        complexity = min(word_count / 50, 3) + (2 if has_multiple else 0) + (1 if has_dates else 0)
        if complexity <= 2: return "simple"
        if complexity <= 5: return "complex"
        return "ambiguous"
    
    def route(self, text: str) -> Dict:
        """根据输入选择最优策略"""
        strategy_name = self.classify_input(text)
        strategy = self.strategies[strategy_name]
        return {
            "strategy": strategy_name,
            "prompt": strategy["prompt"].format(text=text),
            "temperature": strategy["temperature"],
            "max_tokens": strategy["max_tokens"],
        }

# 动态路由的成本效益
# simple (60% 占比): 180 tokens -> 加权 108
# complex (30% 占比): 350 tokens -> 加权 105
# ambiguous (10% 占比): 520 tokens -> 加权 52
# 总计: 265 tokens (对比固定 complex 策略 350 tokens，节省 24%)`,
        },
      ],
    },
    {
      title: "六、Prompt 版本管理与回归检测",
      body: `当你的 Prompt 投入生产后，最大的风险不是「Prompt 不够好」，而是「昨天还好好的 Prompt 今天突然不行了」。

**导致 Prompt 失效的常见原因：**
1. **模型版本更新**：API 提供商更新了模型，行为发生变化
2. **系统上下文变化**：你的应用逻辑变了，输入分布变了
3. **数据分布偏移**：用户输入的模式发生了改变
4. **累积的技术债务**：多人修改后，Prompt 变得不一致

**Prompt 版本管理的核心实践：**`,
      code: [
        {
          lang: "python",
          title: "Prompt 版本管理器",
          code: `import hashlib
import json
from datetime import datetime
from pathlib import Path

class PromptVersionManager:
    """Prompt 版本管理器"""
    
    def __init__(self, prompts_dir: str = "prompts"):
        self.prompts_dir = Path(prompts_dir)
        self.prompts_dir.mkdir(exist_ok=True)
        self.history = self._load_history()
    
    def register(self, name: str, template: str, metadata: Dict = None) -> str:
        """注册新版本的 Prompt"""
        version_id = hashlib.md5(f"{name}:{template}".encode()).hexdigest()[:8]
        record = {
            "name": name, "version": version_id,
            "template": template, "metadata": metadata or {},
            "created_at": datetime.now().isoformat(),
        }
        filepath = self.prompts_dir / f"{name}_{version_id}.txt"
        filepath.write_text(template, encoding='utf-8')
        if name not in self.history:
            self.history[name] = []
        self.history[name].append(record)
        self._save_history()
        return version_id
    
    def rollback(self, name: str, version_id: str) -> Dict:
        """回滚到指定版本"""
        if name not in self.history:
            raise ValueError(f"Prompt '{name}' not found")
        for record in self.history[name]:
            if record["version"] == version_id:
                return self.register(name, record["template"], {
                    **record["metadata"],
                    "rolled_back_from": self.history[name][-1]["version"],
                })
        raise ValueError(f"Version '{version_id}' not found")`,
        },
        {
          lang: "python",
          title: "回归检测器",
          code: `class RegressionDetector:
    """Prompt 回归检测器"""
    
    def __init__(self, evaluator: PromptEvaluator, test_suite: List[TestCase]):
        self.evaluator = evaluator
        self.test_suite = test_suite
        self.baseline_file = Path("baseline_scores.json")
    
    def save_baseline(self, prompt_name: str):
        """保存当前 Prompt 的基线分数"""
        results = self._run_all_tests(prompt_name)
        baseline = {
            "prompt_name": prompt_name,
            "timestamp": datetime.now().isoformat(),
            "per_test_scores": {r["test_id"]: r["score"]["accuracy"] for r in results},
            "overall_accuracy": sum(r["score"]["accuracy"] for r in results) / len(results),
        }
        self.baseline_file.write_text(json.dumps(baseline, indent=2))
        return baseline
    
    def check_regression(self, prompt_name: str) -> Dict:
        """检查是否有回归"""
        if not self.baseline_file.exists():
            return {"status": "no_baseline"}
        baseline = json.loads(self.baseline_file.read_text())
        current_results = self._run_all_tests(prompt_name)
        current_scores = {r["test_id"]: r["score"]["accuracy"] for r in current_results}
        regressions = []
        for test_id, baseline_score in baseline["per_test_scores"].items():
            current_score = current_scores.get(test_id, 0)
            diff = current_score - baseline_score
            if diff < -0.1:  # 下降超过 10%
                regressions.append({"test_id": test_id, "baseline": baseline_score, "current": current_score, "diff": diff})
        return {
            "status": "regression" if regressions else "ok",
            "regressions": regressions,
            "current_accuracy": sum(current_scores.values()) / len(current_scores),
            "baseline_accuracy": baseline["overall_accuracy"],
        }`,
        },
      ],
      mermaid: `graph TD
    A[开发者修改 Prompt] --> B[提交 PR]
    B --> C[CI 触发回归检测]
    C --> D{与基线对比}
    D -->|无回归| E[✅ 合并]
    D -->|有回归| F[❌ 阻塞合并]
    F --> G[分析回归原因]
    G --> H{是预期变更?}
    H -->|是| I[更新基线 → E]
    H -->|否| J[修复 Prompt → B]

    K[每日定时任务] --> L[自动回归检测]
    L --> M{性能正常?}
    M -->|是| N[🟢 记录日志]
    M -->|否| O[🔴 发送告警]
    O --> P[自动回滚到上一版本]
    P --> Q[通知团队审查]`,
    },
    {
      title: "七、2026 年 Prompt 工程最佳实践总结",
      body: `经过前面六个部分的系统学习，以下是 2026 年 Prompt 工程的核心最佳实践清单：

**1. 写 Prompt 之前，先写测试**
- 不要先写 Prompt 再想怎么测试
- 先定义「什么是好的输出」，再写 Prompt 去达到这个标准
- 测试数据集应该覆盖：常见场景、边界情况、对抗输入

**2. 用数据说话，不用直觉**
- 「我觉得这个 Prompt 更好」→ 「A/B 测试显示准确率高 12%」
- 所有重要决策都应该有评估数据支撑
- 定期回顾评估结果，寻找优化空间

**3. 精简不是目的，准确才是**
- Prompt 越短越好？不一定
- 关键信息（格式要求、字段定义、边界处理）宁可多花 token 也要写清楚
- 精简应该发生在**冗余和重复**上，而不是**关键指令**上

**4. 把 Prompt 当代码管理**
- 版本控制：每个 Prompt 变更都应有记录
- 代码审查：重要 Prompt 的变更需要团队 review
- 回滚能力：随时可以回到上一个稳定版本
- 文档：每个 Prompt 都应该有清晰的使用说明

**5. 持续监控，不要设了就不管**
- 模型会变、数据会变、需求会变
- 设置自动化回归检测
- 定期检查生产环境的实际表现
- 建立「Prompt 健康度」指标面板

**6. 成本意识要贯穿始终**
- 每个 Prompt 决策都要考虑 token 成本
- 动态路由是性价比最高的优化手段
- Few-Shot 示例要精挑细选，不要贪多
- 定期审计 Prompt 的 token 消耗

> 好的 Prompt 工程师和差的 Prompt 工程师之间的区别，不在于「能不能写出好用的 Prompt」，而在于**「能不能持续写出、测试、优化、维护高质量的 Prompt」**。`,
    },
  ],
};
