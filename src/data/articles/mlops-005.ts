import { Article } from '../knowledge';

export const article: Article = {
    id: "mlops-005",
    title: "A/B 测试与灰度发布",
    category: "mlops",
    tags: ["A/B测试", "灰度发布", "实验"],
    summary: "从 A/B 测试到渐进式部署，掌握模型发布的最佳实践",
    date: "2026-04-12",
    readTime: "16 min",
    level: "进阶",
    content: [
        {
            title: "1. 为什么需要 A/B 测试",
            body: `在机器学习系统的生产环境中，模型迭代是持续进行的过程。每次更新模型架构、调整超参数或引入新的特征工程策略后，你都必须回答一个关键问题：新模型真的比旧模型好吗？离线评估指标（如准确率、AUC、F1 分数）只能反映模型在历史数据上的表现，而真实生产环境中的数据分布、用户行为和流量模式可能与训练数据存在显著差异。A/B 测试通过在真实流量上同时运行两个或多个模型版本，收集用户行为数据并进行统计比较，从而提供决策依据。与离线评估相比，A/B 测试能够捕捉到模型对业务指标（如转化率、留存率、收入）的真实影响，这些指标往往无法从纯技术指标中推导出来。在推荐系统、搜索排序、风险定价等场景中，A/B 测试已经成为模型发布的标准流程。Google、Netflix、Amazon 等公司每年运行数万次 A/B 测试实验，将数据驱动的决策文化深入到产品迭代的每一个环节。对于 ML 团队而言，建立标准化的 A/B 测试基础设施是模型走向规模化部署的必经之路。`,
            code: [
                {
                    lang: "python",
                    code: `from dataclasses import dataclass\nfrom typing import List\nimport hashlib\n\n@dataclass\nclass ExperimentConfig:\n    experiment_id: str\n    variants: List[str]\n    traffic_split: List[float]  # 例如 [0.5, 0.5]\n    primary_metric: str\n    guardrail_metrics: List[str]\n\n    def validate(self) -> bool:\n        if len(self.variants) != len(self.traffic_split):\n            raise ValueError("Variants and split must match")\n        if abs(sum(self.traffic_split) - 1.0) > 1e-6:\n            raise ValueError("Traffic split must sum to 1.0")\n        return True\n\ndef assign_variant(user_id: str, config: ExperimentConfig) -> str:\n    hash_val = int(hashlib.md5(user_id.encode()).hexdigest(), 16)\n    bucket = hash_val % 10000  # 0-9999\n    cumulative = 0.0\n    for i, split in enumerate(config.traffic_split):\n        cumulative += split * 10000\n        if bucket < cumulative:\n            return config.variants[i]\n    return config.variants[-1]`
                },
                {
                    lang: "python",
                    code: `# 离线评估与在线评估的对比\nclass ModelEvaluation:\n    def __init__(self, model, train_data, test_data):\n        self.model = model\n        self.train_data = train_data\n        self.test_data = test_data\n\n    def offline_eval(self) -> dict:\n        metrics = {}\n        metrics["accuracy"] = self.model.score(self.test_data.X, self.test_data.y)\n        metrics["auc"] = roc_auc_score(self.test_data.y, self.model.predict_proba(self.test_data.X)[:, 1])\n        return metrics\n\n    def online_eval(self, experiment_config: ExperimentConfig) -> dict:\n        online_metrics = {\n            "click_through_rate": 0.0,\n            "conversion_rate": 0.0,\n            "revenue_per_user": 0.0,\n            "latency_p99_ms": 0\n        }\n        return online_metrics\n\neval_system = ModelEvaluation(model, train_df, test_df)\nprint(f"Offline: {eval_system.offline_eval()}")`
                }
            ],
            table: {
                headers: ["评估方式", "数据源", "指标类型", "反映能力", "成本"],
                rows: [
                    ["离线评估", "历史数据", "AUC/F1/准确率", "预测准确性", "低"],
                    ["Shadow 模式", "实时流量（只读）", "延迟/吞吐", "系统性能", "中"],
                    ["A/B 测试", "实时流量（分流）", "业务指标", "真实业务影响", "高"],
                    ["多变量测试", "实时流量（多维分流）", "交叉影响", "特征交互效应", "很高"]
                ]
            },
            mermaid: `graph TD
    A[新模型开发完成] --> B{离线评估达标?}
    B -->|否| C[继续优化模型]
    B -->|是| D[Shadow 模式验证]
    D --> E{系统性能达标?}
    E -->|否| C
    E -->|是| F[A/B 测试上线]
    F --> G{统计显著?}
    G -->|否| H[延长实验周期]
    G -->|是| I{指标提升?}
    I -->|否| C
    I -->|是| J[全量发布]
    C --> A`,
            tip: "在启动 A/B 测试之前，先用 Shadow 模式让新模型在不影响用户体验的情况下处理真实流量，提前发现性能问题和异常行为。",
            warning: "不要仅依赖离线指标决定是否发布。离线表现好的模型在线上可能因为数据分布变化而表现糟糕，A/B 测试是唯一可靠的决策依据。"
        },
        {
            title: "2. 实验设计基础",
            body: `一个设计良好的 A/B 测试实验需要明确定义多个关键要素。首先是假设检验的框架：你需要提出零假设（新模型和旧模型没有差异）和备择假设（新模型优于旧模型），然后选择合适的统计检验方法。其次是流量分配策略，最常见的做法是将用户随机分配到对照组和实验组，确保两组在统计上是可比的。随机化单元的选择也非常重要，可以是用户 ID、会话 ID 或请求 ID，不同粒度的随机化会影响实验结果的解读。第三是实验持续时间的确定，需要考虑流量的周期性波动（如工作日与周末的差异）以及指标收敛所需的时间。一个常见的错误是在实验启动后过早地检查结果并做出决策，这会显著增加假阳性率。最后，实验的统计功效（Power）决定了你检测到真实差异的能力，功效不足会导致假阴性，即错过了真正有效的模型改进。在设计阶段，你需要根据预期的效应大小（Effect Size）、显著性水平（Alpha）和统计功效来计算所需的最小样本量，确保实验有足够的统计效力来做出可靠决策。`,
            code: [
                {
                    lang: "python",
                    code: `import math\nfrom scipy import stats\n\ndef calculate_sample_size(\n    baseline_rate: float,\n    minimum_detectable_effect: float,\n    alpha: float = 0.05,\n    power: float = 0.80\n) -> int:\n    beta = 1 - power\n    z_alpha = stats.norm.ppf(1 - alpha / 2)\n    z_beta = stats.norm.ppf(power)\n    p1 = baseline_rate\n    p2 = baseline_rate + minimum_detectable_effect\n    p_bar = (p1 + p2) / 2\n    n = ((z_alpha * math.sqrt(2 * p_bar * (1 - p_bar)) +\n          z_beta * math.sqrt(p1 * (1 - p1) + p2 * (1 - p2)))  2 /\n         (p2 - p1)  2)\n    return math.ceil(n)\n\nn = calculate_sample_size(\n    baseline_rate=0.05,\n    minimum_detectable_effect=0.005,\n    alpha=0.05,\n    power=0.80\n)\nprint(f"Required sample size per group: {n:,}")`
                },
                {
                    lang: "python",
                    code: `from enum import Enum\nimport random\n\nclass RandomizationUnit(Enum):\n    USER_ID = "user_id"\n    SESSION_ID = "session_id"\n    REQUEST_ID = "request_id"\n\nclass ExperimentDesigner:\n    def __init__(self, alpha=0.05, power=0.80):\n        self.alpha = alpha\n        self.power = power\n\n    def design_experiment(\n        self,\n        baseline_rate: float,\n        mde: float,\n        daily_traffic: int,\n        randomization_unit: RandomizationUnit\n    ) -> dict:\n        n_per_group = calculate_sample_size(baseline_rate, mde, self.alpha, self.power)\n        total_n = n_per_group * 2\n        duration_days = math.ceil(total_n / daily_traffic)\n        return {\n            "sample_size_per_group": n_per_group,\n            "total_sample_size": total_n,\n            "estimated_duration_days": duration_days,\n            "randomization_unit": randomization_unit.value,\n            "significance_level": self.alpha,\n            "statistical_power": self.power\n        }\n\ndesigner = ExperimentDesigner()\nconfig = designer.design_experiment(\n    baseline_rate=0.03, mde=0.003, daily_traffic=50000,\n    randomization_unit=RandomizationUnit.USER_ID\n)\nfor k, v in config.items():\n    print(f"  {k}: {v}")`
                }
            ],
            table: {
                headers: ["实验要素", "定义", "典型取值", "影响"],
                rows: [
                    ["显著性水平 (Alpha)", "假阳性率上限", "0.05 或 0.01", "越低越保守"],
                    ["统计功效 (Power)", "检测到真实差异的概率", "0.80 或 0.90", "越高样本量越大"],
                    ["最小可检测效应 (MDE)", "能检测到的最小差异", "1%-5%", "越小样本量越大"],
                    ["随机化单元", "分配变体的最小粒度", "用户/会话/请求", "影响独立性假设"],
                    ["实验持续时间", "收集足够样本的天数", "7-28 天", "需覆盖完整周期"]
                ]
            },
            mermaid: `graph LR
    A[提出假设] --> B[确定 Alpha 和 Power]
    B --> C[估算 MDE]
    C --> D[计算样本量]
    D --> E[确定随机化单元]
    E --> F[评估流量和时长]
    F --> G{时长可接受?}
    G -->|否| H[调整 MDE 或 Power]
    H --> C
    G -->|是| I[启动实验]`,
            tip: "在实验设计文档中记录所有假设和参数选择，包括为什么选择特定的 Alpha、Power 和 MDE 值。这为后续的复盘和审计提供了完整依据。",
            warning: "避免在实验运行期间根据中间结果修改实验参数（如延长时长或调整 MDE）。这会破坏统计推断的前提假设，导致结果不可信。"
        },
        {
            title: "3. 统计显著性与功效分析",
            body: `统计显著性检验是 A/B 测试结果解读的核心工具。当实验运行一段时间后，你需要判断观察到的指标差异是真实的模型改进还是随机波动。常用的检验方法包括 t 检验（适用于连续指标如收入、延迟）和卡方检验（适用于比例指标如转化率、点击率）。p 值是最常见的显著性度量，它表示在零假设成立的前提下，观察到当前差异或更大差异的概率。当 p 值小于预设的显著性水平（通常为 0.05）时，我们拒绝零假设，认为差异具有统计显著性。然而，p 值本身不能告诉我们效应的大小或实际业务价值。置信区间提供了更丰富的信息，它给出了真实效应值的可能范围。除了显著性，统计功效同样重要。功效不足是 A/B 测试中最常见的陷阱之一：如果你的实验功效只有 50%，那么即使新模型确实更好，你也有一半的概率无法检测到这个差异。在 ML 场景中，效应大小往往较小（例如转化率从 5.0% 提升到 5.2%），因此需要更大的样本量来确保足够的功效。贝叶斯方法近年来也受到关注，它提供了一种更直观的方式来量化我们对不同假设的置信程度，但在工业界的应用仍然不如频率学派方法广泛。`,
            code: [
                {
                    lang: "python",
                    code: `from scipy import stats\nimport numpy as np\n\ndef ab_test_analysis(control_conversions, control_total,\n                     treatment_conversions, treatment_total):\n    control_rate = control_conversions / control_total\n    treatment_rate = treatment_conversions / treatment_total\n    # Z 检验\n    p_pool = (control_conversions + treatment_conversions) / (control_total + treatment_total)\n    se = math.sqrt(p_pool * (1 - p_pool) * (1/control_total + 1/treatment_total))\n    z_stat = (treatment_rate - control_rate) / se\n    p_value = 2 * (1 - stats.norm.cdf(abs(z_stat)))\n    # 置信区间\n    diff = treatment_rate - control_rate\n    margin = 1.96 * se\n    ci_lower = diff - margin\n    ci_upper = diff + margin\n    # 效应量 (Cohen's h)\n    h = 2 * np.arcsin(np.sqrt(treatment_rate)) - 2 * np.arcsin(np.sqrt(control_rate))\n    return {\n        "control_rate": control_rate,\n        "treatment_rate": treatment_rate,\n        "lift": (treatment_rate - control_rate) / control_rate,\n        "z_statistic": z_stat,\n        "p_value": p_value,\n        "ci_95": (ci_lower, ci_upper),\n        "effect_size_cohens_h": h,\n        "significant": p_value < 0.05\n    }\n\nresult = ab_test_analysis(250, 5000, 290, 5000)\nfor k, v in result.items():\n    print(f"  {k}: {v}")`
                },
                {
                    lang: "python",
                    code: `def sequential_analysis(control_metrics, treatment_metrics, alpha=0.05):\n    sequential_results = []\n    for day in range(1, len(control_metrics) + 1):\n        c_sum = sum(control_metrics[:day])\n        c_total = day * 1000\n        t_sum = sum(treatment_metrics[:day])\n        t_total = day * 1000\n        result = ab_test_analysis(c_sum, c_total, t_sum, t_total)\n        result["day"] = day\n        result["cumulative_samples"] = day * 2000\n        sequential_results.append(result)\n        if result["significant"] and day >= 7:\n            print(f"Day {day}: Significant! p={result['p_value']:.4f}")\n            break\n    return sequential_results\n\ndef check_power_post_hoc(effect_size, n_per_group, alpha=0.05):\n    z_alpha = stats.norm.ppf(1 - alpha / 2)\n    z_beta = effect_size * math.sqrt(n_per_group / 2) - z_alpha\n    achieved_power = stats.norm.cdf(z_beta)\n    return achieved_power\n\npower = check_power_post_hoc(0.02, 50000)\nprint(f"Achieved power: {power:.2%}")`
                }
            ],
            table: {
                headers: ["统计概念", "含义", "误用场景", "正确做法"],
                rows: [
                    ["p 值", "零假设下观察到当前差异的概率", "p 值 = 新模型更好的概率", "p 值仅衡量证据强度"],
                    ["置信区间", "真实效应值的可信范围", "95% CI 表示 95% 落在区间内", "应理解为长期频率覆盖"],
                    ["统计功效", "检测到真实差异的概率", "事后功效分析有意义", "应在设计阶段计算"],
                    ["效应量", "差异的实际大小", "仅看显著性不看效应量", "结合业务价值判断"],
                    ["多重比较", "同时检验多个指标", "每个指标独立用 alpha=0.05", "使用 Bonferroni 或 FDR 校正"]
                ]
            },
            mermaid: `graph TD
    A[收集实验数据] --> B[计算检验统计量]
    B --> C{p 值 < Alpha?}
    C -->|是| D[拒绝零假设]
    C -->|否| E[不拒绝零假设]
    D --> F[检查效应量大小]
    F --> G{业务上显著?}
    G -->|是| H[采纳新模型]
    G -->|否| I[统计显著但业务价值不足]
    E --> J{功效充足?}
    J -->|否| K[增加样本量或调整 MDE]
    J -->|是| L[接受零假设 - 无显著差异]`,
            tip: "在报告实验结果时，同时提供 p 值、置信区间和效应量三个指标。仅报告 p 值是否显著是不完整的，决策者需要知道差异有多大以及有多确定。",
            warning: "避免 peeking 问题：不要在实验运行期间反复检查 p 值并在首次显著时停止实验。这会使实际的假阳性率远高于设定的 Alpha 水平。如果必须顺序检验，请使用序贯分析方法。"
        },
        {
            title: "4. 多臂老虎机算法",
            body: `传统的 A/B 测试在整个实验期间保持固定的流量分配（如 50/50），这意味着即使某个变体明显优于其他变体，你仍然将一半的流量分配给表现较差的模型。在多模型候选或推荐系统场景中，这种固定分配策略可能造成可观的业务损失。多臂老虎机（Multi-Armed Bandit, MAB）算法提供了一种动态流量分配的替代方案：它在探索（尝试不同模型以收集信息）和利用（将更多流量分配给表现更好的模型）之间取得平衡。常见的 MAB 算法包括 Epsilon-Greedy（以固定概率随机探索）、UCB（Upper Confidence Bound，基于置信上界选择）和 Thompson Sampling（基于贝叶斯后验采样）。在 ML 模型发布的上下文中，MAB 特别适用于以下场景：你有多个候选模型需要同时评估、流量成本很高（每个错误推荐都意味着收入损失）、或者你希望在实验期间就最大化总体收益。与固定 A/B 测试相比，MAB 能够在实验进行过程中自动将流量倾斜到表现更好的模型，减少次优模型造成的累积损失。然而，MAB 也有其局限性：它不直接提供统计显著性检验，难以给出精确的置信区间，且在某些监管严格的行业（如医疗、金融）中，固定 A/B 测试仍然是合规要求的标准做法。`,
            code: [
                {
                    lang: "python",
                    code: `import numpy as np\nfrom scipy.stats import beta\n\nclass ThompsonSampling:\n    def __init__(self, n_arms):\n        self.n_arms = n_arms\n        self.successes = np.ones(n_arms)  # Beta 先验 alpha\n        self.failures = np.ones(n_arms)   # Beta 先验 beta\n\n    def select_arm(self) -> int:\n        samples = np.random.beta(self.successes, self.failures)\n        return int(np.argmax(samples))\n\n    def update(self, arm: int, reward: float):\n        if reward > 0:\n            self.successes[arm] += 1\n        else:\n            self.failures[arm] += 1\n\n    def get_traffic_allocation(self) -> np.ndarray:\n        means = self.successes / (self.successes + self.failures)\n        return means / means.sum()\n\nts = ThompsonSampling(n_arms=3)\nfor round_idx in range(1000):\n    arm = ts.select_arm()\n    reward = np.random.random() < [0.03, 0.05, 0.04][arm]\n    ts.update(arm, float(reward))\nprint(f"Traffic allocation: {ts.get_traffic_allocation()}")`
                },
                {
                    lang: "python",
                    code: `class UCB:\n    def __init__(self, n_arms, c=2.0):\n        self.n_arms = n_arms\n        self.c = c\n        self.counts = np.zeros(n_arms)\n        self.total_reward = np.zeros(n_arms)\n        self.total_pulls = 0\n\n    def select_arm(self) -> int:\n        untried = np.where(self.counts == 0)[0]\n        if len(untried) > 0:\n            return int(untried[0])\n        mean_rewards = self.total_reward / self.counts\n        confidence = self.c * np.sqrt(\n            np.log(self.total_pulls) / self.counts\n        )\n        ucb_values = mean_rewards + confidence\n        return int(np.argmax(ucb_values))\n\n    def update(self, arm: int, reward: float):\n        self.counts[arm] += 1\n        self.total_reward[arm] += reward\n        self.total_pulls += 1\n\n    def regret(self, optimal_rate: float) -> float:\n        return optimal_rate * self.total_pulls - self.total_reward.sum()\n\nucb = UCB(n_arms=3)\nfor _ in range(1000):\n    arm = ucb.select_arm()\n    reward = np.random.random() < [0.03, 0.05, 0.04][arm]\n    ucb.update(arm, float(reward))\nprint(f"Cumulative regret: {ucb.regret(0.05):.2f}")`
                }
            ],
            table: {
                headers: ["算法", "探索策略", "优点", "缺点", "适用场景"],
                rows: [
                    ["Epsilon-Greedy", "固定概率随机选择", "实现简单、易于理解", "探索效率低", "快速原型验证"],
                    ["UCB", "选择置信上界最大的臂", "理论保证强、无需先验", "对非平稳环境敏感", "稳定的推荐场景"],
                    ["Thompson Sampling", "贝叶斯后验采样", "探索效率高、自适应", "计算开销较大", "多模型并发评估"],
                    ["固定 A/B", "固定流量分配", "统计推断严谨", "实验期间损失大", "需要严格统计结论的场景"]
                ]
            },
            mermaid: `graph TD
    A[多个候选模型] --> B{选择算法}
    B -->|固定分配| C[标准 A/B 测试]
    B -->|动态分配| D[多臂老虎机]
    D --> E[Epsilon-Greedy]
    D --> F[UCB]
    D --> G[Thompson Sampling]
    C --> H[实验结束后选最优]
    D --> I[实验中自动倾斜流量]
    H --> J[全量发布]
    I --> J`,
            tip: "如果你的业务对实验期间的收益损失敏感（如电商推荐），优先考虑 Thompson Sampling。它在大多数场景下提供了最佳的探索-利用权衡，并且实现复杂度适中。",
            warning: "多臂老虎机不适合需要严格统计推断的场景。如果你需要向管理层提供 p 值和置信区间，MAB 的结果解读会比传统 A/B 测试困难得多。"
        },
        {
            title: "5. 灰度发布与渐进式部署",
            body: `灰度发布（Canary Release）是一种渐进式的模型部署策略，它允许你在控制风险的同时逐步将新模型推向全量用户。与 A/B 测试不同，灰度发布的核心目标是安全部署而非统计比较。基本流程是：首先将新模型部署到一小部分用户（如 1% 或 5%），密切监控关键指标（错误率、延迟、业务指标），确认一切正常后再逐步扩大流量比例（10% -> 25% -> 50% -> 100%）。如果在任何阶段发现异常，可以立即回滚到之前的稳定版本。灰度发布特别适合以下场景：新模型的基础设施变更较大（如从 CPU 推理切换到 GPU）、模型架构发生重大变化、或者你对新模型在极端流量条件下的表现不够确定。在 ML 系统中，灰度发布通常与特征服务、模型注册表和监控告警系统集成，形成完整的部署流水线。关键的监控指标包括：预测延迟（P50、P95、P99）、错误率、特征缺失率、预测值分布漂移以及下游业务指标。现代部署平台（如 Istio、Kubernetes + 服务网格）支持基于请求头、用户属性或地理区域的精细流量控制，使得灰度发布更加灵活和可控。`,
            code: [
                {
                    lang: "python",
                    code: `from dataclasses import dataclass\nfrom enum import Enum\nimport time\n\nclass CanaryStage(Enum):\n    BASELINE = "1% 基线流量"\n    EARLY = "5% 早期用户"\n    GROWING = "25% 增长阶段"\n    MAJORITY = "50% 大部分用户"\n    FULL = "100% 全量发布"\n\n@dataclass\nclass CanaryConfig:\n    stages: list = None\n    stage_duration_min: int = 30\n    auto_promote: bool = True\n    auto_rollback: bool = True\n    max_error_rate: float = 0.01\n    max_latency_p99_ms: int = 500\n\n    def __post_init__(self):\n        if self.stages is None:\n            self.stages = [1, 5, 25, 50, 100]\n\nclass CanaryDeployer:\n    def __init__(self, config: CanaryConfig):\n        self.config = config\n        self.current_stage = 0\n        self.current_traffic_pct = 0\n\n    def deploy_next_stage(self, health_metrics: dict) -> bool:\n        if self.current_traffic_pct == 0:\n            self.current_traffic_pct = self.config.stages[0]\n            self.current_stage = 0\n            return True\n\n        if health_metrics["error_rate"] > self.config.max_error_rate:\n            return False\n        if health_metrics["latency_p99"] > self.config.max_latency_p99_ms:\n            return False\n\n        self.current_stage += 1\n        if self.current_stage >= len(self.config.stages):\n            self.current_traffic_pct = 100\n            print("Full rollout complete!")\n            return True\n\n        self.current_traffic_pct = self.config.stages[self.current_stage]\n        print(f"Promoting to {self.current_traffic_pct}% traffic")\n        return True`
                },
                {
                    lang: "yaml",
                    code: `# istio-virtual-service-canary.yaml\napiVersion: networking.istio.io/v1beta1\nkind: VirtualService\nmetadata:\n  name: model-serving-canary\nspec:\n  hosts:\n    - model-api.internal\n  http:\n    - route:\n        - destination:\n            host: model-serving\n            subset: stable\n          weight: 90\n        - destination:\n            host: model-serving\n            subset: canary\n          weight: 10\n      timeout: 2s\n      retries:\n        attempts: 3\n        perTryTimeout: 500ms\n---\napiVersion: networking.istio.io/v1beta1\nkind: DestinationRule\nmetadata:\n  name: model-serving-versions\nspec:\n  host: model-serving\n  subsets:\n    - name: stable\n      labels:\n        version: v1.2.0\n    - name: canary\n      labels:\n        version: v1.3.0-rc1`
                }
            ],
            table: {
                headers: ["灰度阶段", "流量比例", "持续时间", "关注重点", "决策条件"],
                rows: [
                    ["基线 (1%)", "1%", "30 分钟", "错误率、崩溃", "无 P0 告警"],
                    ["早期 (5%)", "5%", "2-4 小时", "延迟、特征覆盖", "P99 延迟达标"],
                    ["增长 (25%)", "25%", "6-12 小时", "业务指标、漂移", "核心指标无退化"],
                    ["大部分 (50%)", "50%", "12-24 小时", "长期稳定性", "所有 SLO 满足"],
                    ["全量 (100%)", "100%", "持续", "常规监控", "正式完成发布"]
                ]
            },
            mermaid: `graph LR
    A[新模型 v1.3 构建完成] --> B[部署到 1％ 流量]
    B --> C{健康检查通过?}
    C -->|否| D[立即回滚到 v1.2]
    C -->|是| E[扩展到 5％]
    E --> F{业务指标正常?}
    F -->|否| D
    F -->|是| G[扩展到 25％]
    G --> H{数据漂移检测?}
    H -->|是| D
    H -->|否| I[扩展到 50％]
    I --> J{全面评估通过?}
    J -->|否| D
    J -->|是| K[100％ 全量发布]
    D --> L[根因分析]`,
            tip: "在灰度发布中，设置自动回滚规则比手动回滚更安全。当错误率或延迟超过阈值时，系统应能自动将流量切回稳定版本，而不是等待人工确认。",
            warning: "灰度发布不能完全替代 A/B 测试。灰度关注的是安全部署，而 A/B 测试关注的是效果比较。最佳实践是先通过 A/B 测试验证新模型的效果，再通过灰度发布安全地全量部署。"
        },
        {
            title: "6. 模型回滚策略",
            body: `即使经过了充分的离线评估和 A/B 测试，模型在生产环境中仍然可能出现问题。数据漂移、概念漂移、基础设施变更或依赖服务故障都可能导致模型表现急剧下降。因此，建立完善的模型回滚策略是 MLOps 实践中的最后一道安全网。回滚策略的核心原则是快速和可逆：当检测到异常时，你应该能够在几分钟内将流量从问题模型切回之前的稳定版本。实现这一点需要几个关键前提：首先，旧版本的模型必须保持在线可用状态，不能在发布新版本后立即销毁旧版本；其次，你需要实时监控系统来快速检测异常，而不是依赖事后的人工发现；第三，回滚流程应该是自动化的，减少人为操作的延迟和出错概率。在 ML 系统中，回滚的复杂度通常高于传统软件，因为除了模型权重外，还需要考虑特征管道版本、预处理逻辑变更以及下游依赖的兼容性。因此，模型版本控制不仅包括模型文件本身，还应该包含完整的特征定义、预处理代码和环境配置，确保回滚时能够完全还原之前的状态。`,
            code: [
                {
                    lang: "python",
                    code: `import time\nimport logging\nfrom typing import Optional\n\nlogging.basicConfig(level=logging.INFO)\nlogger = logging.getLogger("model_rollback")\n\nclass ModelRollbackManager:\n    def __init__(self):\n        self.active_version: Optional[str] = None\n        self.previous_version: Optional[str] = None\n        self.version_history = []\n        self.rollback_thresholds = {\n            "error_rate": 0.05,\n            "latency_p99_ms": 1000,\n            "prediction_drift_psi": 0.25,\n            "business_metric_drop_pct": 5.0\n        }\n\n    def check_and_rollback(self, metrics: dict) -> bool:\n        violations = []\n        if metrics.get("error_rate", 0) > self.rollback_thresholds["error_rate"]:\n            violations.append(f"Error rate {metrics['error_rate']:.2%} exceeds threshold")\n        if metrics.get("latency_p99_ms", 0) > self.rollback_thresholds["latency_p99_ms"]:\n            violations.append(f"Latency {metrics['latency_p99_ms']}ms exceeds threshold")\n        if metrics.get("prediction_drift_psi", 0) > self.rollback_thresholds["prediction_drift_psi"]:\n            violations.append(f"PSI {metrics['prediction_drift_psi']:.3f} exceeds threshold")\n        if violations:\n            logger.warning(f"Rollback triggered: {violations}")\n            return self.execute_rollback()\n        return True\n\n    def execute_rollback(self) -> bool:\n        if not self.previous_version:\n            logger.error("No previous version to rollback to")\n            return False\n        logger.info(f"Rolling back from {self.active_version} to {self.previous_version}")\n        self.active_version, self.previous_version = self.previous_version, self.active_version\n        logger.info(f"Rollback complete. Active version: {self.active_version}")\n        return True`
                },
                {
                    lang: "python",
                    code: `import numpy as np\n\ndef calculate_psi(expected: np.ndarray, actual: np.ndarray, bins=10) -> float:\n    psi_values = []\n    min_val = min(expected.min(), actual.min())\n    max_val = max(expected.max(), actual.max())\n    bin_edges = np.linspace(min_val, max_val, bins + 1)\n    for i in range(bins):\n        expected_pct = ((expected >= bin_edges[i]) & (expected < bin_edges[i+1])).mean()\n        actual_pct = ((actual >= bin_edges[i]) & (actual < bin_edges[i+1])).mean()\n        expected_pct = max(expected_pct, 1e-6)\n        actual_pct = max(actual_pct, 1e-6)\n        psi = (expected_pct - actual_pct) * np.log(expected_pct / actual_pct)\n        psi_values.append(psi)\n    return sum(psi_values)\n\nbaseline_preds = np.random.beta(2, 5, 10000)\ncurrent_preds = np.random.beta(2.5, 5.5, 10000)\npsi = calculate_psi(baseline_preds, current_preds)\nprint(f"PSI: {psi:.4f}")\nif psi > 0.25:\n    print("Warning: Significant prediction distribution drift detected!")\nelif psi > 0.1:\n    print("Caution: Moderate drift detected")\nelse:\n    print("OK: Prediction distribution is stable")`
                }
            ],
            table: {
                headers: ["回滚触发条件", "检测方式", "严重级别", "响应时间", "回滚策略"],
                rows: [
                    ["错误率飙升", "实时日志监控", "P0 - 紧急", "< 5 分钟", "自动立即回滚"],
                    ["P99 延迟超标", "APM 监控", "P1 - 高", "< 15 分钟", "自动回滚"],
                    ["预测分布漂移 (PSI)", "定期批量计算", "P2 - 中", "< 1 小时", "告警 + 人工评估"],
                    ["业务指标下降", "BI 仪表板", "P2 - 中", "< 2 小时", "A/B 测试对比确认"],
                    ["特征数据缺失", "数据质量监控", "P1 - 高", "< 15 分钟", "自动回滚 + 数据修复"]
                ]
            },
            mermaid: `graph TD
    A[实时监控系统] --> B{检测到异常?}
    B -->|否| C[继续监控]
    B -->|是| D{严重程度?}
    D -->|P0 紧急| E[自动立即回滚]
    D -->|P1 高| F[自动回滚 + 告警]
    D -->|P2 中| G[告警 + 人工评估]
    E --> H[通知团队]
    F --> H
    G --> I{人工确认需要回滚?}
    I -->|是| J[手动回滚]
    I -->|否| K[持续观察]
    H --> L[根因分析]
    J --> L
    C --> A`,
            tip: "定期进行回滚演练（Game Day），模拟模型故障场景并验证回滚流程的实际执行时间。回滚策略只有在真正执行过之后才是可信的。",
            warning: "回滚到旧版本模型时，确保旧版本的特征管道和依赖服务仍然可用。如果旧版本依赖的某个数据源已经下线，回滚可能无法正常执行。"
        },
        {
            title: "7. 实战：MLflow 与 A/B 测试框架集成",
            body: `将 MLflow 的实验追踪能力与 A/B 测试框架集成，可以构建端到端的模型发布流水线。在这个实战方案中，我们使用 MLflow 来管理和比较多个候选模型，使用自定义的 A/B 测试框架来进行在线流量分流和指标收集，最终基于实验结果自动决定模型的推广或回滚。整个流程从模型训练阶段开始：数据科学家使用 MLflow 记录每次实验的参数、指标和模型文件，并通过 MLflow Model Registry 将表现最好的模型注册为候选版本。当候选模型准备好进行在线验证时，A/B 测试框架将其部署到生产环境并分配一小部分流量。测试期间，框架实时收集各版本的业务指标，并通过统计检验判断差异是否显著。实验结束后，如果新模型通过所有质量检查，系统会自动将其推进到 Production 阶段并触发灰度发布流程。如果实验结果不理想，模型保持在 Staging 阶段，团队可以分析失败原因并继续优化。这种集成方案的关键优势在于将模型实验、在线验证和部署发布串联成一个自动化的闭环，减少了手动操作带来的风险和延迟。`,
            code: [
                {
                    lang: "python",
                    code: `import mlflow\nfrom mlflow.tracking import MlflowClient\n\nclass MLPipelineWithABTest:\n    def __init__(self, tracking_uri, experiment_name):\n        mlflow.set_tracking_uri(tracking_uri)\n        mlflow.set_experiment(experiment_name)\n        self.client = MlflowClient()\n\n    def register_candidate(self, run_id, model_name):\n        model_uri = f"runs:/{run_id}/model"\n        result = mlflow.register_model(model_uri, model_name)\n        self.client.transition_model_version_stage(\n            name=model_name, version=result.version, stage="Staging"\n        )\n        print(f"Registered {model_name} v{result.version} as Staging")\n        return result.version\n\n    def get_production_model(self, model_name):\n        versions = self.client.search_model_versions(\n            f"name='{model_name}'"\n        )\n        for v in versions:\n            if v.current_stage == "Production":\n                return v.version\n        return None\n\n    def promote_after_ab_test(self, model_name, version):\n        self.client.transition_model_version_stage(\n            name=model_name, version=version, stage="Production"\n        )\n        print(f"Promoted {model_name} v{version} to Production")\n\npipeline = MLPipelineWithABTest(\n    tracking_uri="http://localhost:5000",\n    experiment_name="recommendation_model"\n)\nversion = pipeline.register_candidate("abc123def456", "rec_model")`
                },
                {
                    lang: "python",
                    code: `# 完整的 A/B 测试 + 灰度发布流水线\nimport json\nfrom datetime import datetime\n\nclass FullReleasePipeline:\n    def __init__(self, ml_pipeline: MLPipelineWithABTest):\n        self.ml = ml_pipeline\n        self.ab_results = {}\n        self.canary_stage = 0\n\n    def run_full_pipeline(self, model_name, candidate_version):\n        print(f"=== Starting release pipeline for {model_name} v{candidate_version} ===")\n        # Step 1: Shadow mode validation\n        print("[1/4] Shadow mode validation...")\n        shadow_metrics = self._run_shadow_test(model_name, candidate_version)\n        if not self._check_shadow_metrics(shadow_metrics):\n            print("Shadow test failed. Aborting.")\n            return False\n        # Step 2: A/B testing\n        print("[2/4] Running A/B test...")\n        ab_result = self._run_ab_test(model_name, candidate_version)\n        self.ab_results = ab_result\n        if not ab_result["significant"] or ab_result["lift"] <= 0:\n            print(f"A/B test not significant. Lift: {ab_result['lift']:.2%}")\n            return False\n        # Step 3: Canary deployment\n        print("[3/4] Canary deployment...")\n        canary_ok = self._run_canary_deployment(model_name, candidate_version)\n        if not canary_ok:\n            print("Canary deployment failed. Rolling back.")\n            return False\n        # Step 4: Full rollout\n        print("[4/4] Full rollout...")\n        self.ml.promote_after_ab_test(model_name, candidate_version)\n        print("Release pipeline completed successfully!")\n        return True\n\n    def _run_shadow_test(self, model_name, version):\n        return {"latency_p99": 120, "error_rate": 0.001}\n\n    def _check_shadow_metrics(self, metrics):\n        return metrics["error_rate"] < 0.01\n\n    def _run_ab_test(self, model_name, version):\n        return {"significant": True, "lift": 0.08, "p_value": 0.003}\n\n    def _run_canary_deployment(self, model_name, version):\n        return True`
                }
            ],
            table: {
                headers: ["流水线阶段", "输入", "输出", "工具", "自动/手动"],
                rows: [
                    ["模型训练", "数据 + 特征", "MLflow 注册的模型", "MLflow Tracking", "自动"],
                    ["Shadow 测试", "候选模型 + 真实流量", "性能指标报告", "自定义监控", "自动"],
                    ["A/B 测试", "候选模型 + 分流流量", "统计显著性报告", "A/B 框架 + 统计检验", "自动"],
                    ["灰度发布", "通过的模型", "逐步扩大的流量", "Istio/K8s", "自动"],
                    ["全量发布", "稳定的模型", "Production 状态", "MLflow Registry", "自动"],
                    ["回滚", "异常检测", "旧版本模型", "Rollback Manager", "自动/手动"]
                ]
            },
            mermaid: `graph TD
    A[数据科学家提交模型] --> B[MLflow 训练 + 注册]
    B --> C[自动选择最佳候选]
    C --> D[Shadow 模式验证]
    D --> E{性能达标?}
    E -->|否| F[通知数据科学家]
    E -->|是| G[A/B 测试分流]
    G --> H{统计显著且正向?}
    H -->|否| F
    H -->|是| I[灰度发布 1％]
    I --> J{监控正常?}
    J -->|否| K[自动回滚]
    J -->|是| L[逐步扩展到 100％]
    L --> M[标记 Production]
    M --> N[持续监控]
    K --> F
    N --> O{数据漂移?}
    O -->|是| P[触发重训练]
    O -->|否| N
    P --> A`,
            tip: "将整个发布流水线配置为 GitOps 流程：用 Git 仓库管理所有发布配置（流量比例、回滚阈值、监控规则），这样每次变更都有完整的审计记录和版本历史。",
            warning: "不要在流水线中硬编码任何密钥或凭据。MLflow Tracking Server 的 URL、S3 Bucket 名称、监控告警的 Webhook 地址都应该通过环境变量或配置管理工具注入。"
        },
    ],
};
