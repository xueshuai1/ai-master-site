import { Article } from '../knowledge';

export const article: Article = {
    id: "aieng-007",
    title: "A/B 测试与模型迭代",
    category: "aieng",
    tags: ["A/B测试", "模型迭代", "实验"],
    summary: "从 A/B 测试到灰度发布，掌握模型迭代的最佳实践",
    date: "2026-04-12",
    readTime: "16 min",
    level: "进阶",
    content: [
        {
            title: "1. 为什么需要 A/B 测试",
            body: `在机器学习工程化中，模型上线只是开始，真正的挑战在于持续验证和优化。A/B 测试是验证模型改进效果的黄金标准，它通过将用户随机分流到不同版本，在真实生产环境中比较各版本的核心指标。与离线评估不同，A/B 测试能够捕捉到离线指标无法反映的复杂用户行为：比如一个新推荐模型可能在 NDCG 上提升了 2%，但用户停留时长却下降了，这种 tradeoff 只有通过线上实验才能发现。很多团队在模型迭代中踩过这样的坑：离线指标全线飘红，上线后核心业务指标反而下降。原因可能包括训练数据与线上数据分布不一致、离线评估指标与业务目标不匹配、或者模型在特定用户群体上存在严重偏差。A/B 测试的价值就在于它是最终的裁判，无论离线实验结果多么漂亮，线上 A/B 测试的结论才具有最终说服力。建立完善的 A/B 测试文化，是每个成熟 ML 团队的必修课。`,
            code: [
                {
                    lang: "python",
                    code: `from enum import Enum\nfrom dataclasses import dataclass\nfrom typing import Dict, Optional\n\nclass ExperimentStatus(Enum):\n    DRAFT = "draft"\n    RUNNING = "running"\n    STOPPED = "stopped"\n    CONCLUDED = "concluded"\n\n\n@dataclass\nclass ExperimentConfig:\n    """A/B 测试实验配置"""\n    experiment_id: str\n    name: str\n    hypothesis: str\n    metric_primary: str\n    metrics_secondary: list[str]\n    traffic_split: Dict[str, float]  # {"control": 0.5, "variant": 0.5}\n    min_sample_size: int\n    duration_days: int\n    status: ExperimentStatus = ExperimentStatus.DRAFT\n\n    def validate(self) -> bool:\n        total = sum(self.traffic_split.values())\n        return abs(total - 1.0) < 1e-6 and self.min_sample_size > 0`
                },
                {
                    lang: "python",
                    code: `import hashlib\nfrom typing import List\n\n\ndef consistent_hash(user_id: str, buckets: int = 100) -> int:\n    """为同一用户始终返回相同的分桶结果"""\n    return int(hashlib.md5(user_id.encode()).hexdigest(), 16) % buckets\n\n\ndef assign_variant(user_id: str, config: ExperimentConfig) -> Optional[str]:\n    """根据流量分配配置为用户分配实验变体"""\n    if config.status != ExperimentStatus.RUNNING:\n        return None\n    bucket = consistent_hash(user_id)\n    cumulative = 0.0\n    for variant, proportion in config.traffic_split.items():\n        cumulative += proportion * 100\n        if bucket < cumulative:\n            return variant\n    return None`
                }
            ],
            table: {
                headers: ["评估方式", "速度", "成本", "可靠性", "适用阶段"],
                rows: [
                    ["离线评估", "分钟级", "低", "依赖数据质量", "模型开发"],
                    ["Shadow 模式", "小时级", "中", "高（不暴露用户）", "集成测试"],
                    ["A/B 测试", "天级", "高", "最高", "生产验证"],
                    ["多臂老虎机", "天级", "中", "高", "持续优化"],
                    ["灰度发布", "天级", "中", "高", "渐进上线"]
                ]
            },
            mermaid: `graph TD
    A[模型改进想法] --> B[离线评估]
    B --> C{离线指标达标?}
    C -->|"No"| A
    C -->|"Yes"| D[Shadow 模式运行]
    D --> E{Shadow 指标达标?}
    E -->|"No"| A
    E -->|"Yes"| F[设计 A/B 实验]
    F --> G[线上 A/B 测试]
    G --> H{实验结论显著?}
    H -->|"Yes"| I[全量发布]
    H -->|"No"| J[分析原因]`,
            tip: "在启动 A/B 测试之前，先用 Shadow 模式跑几天，在不影响用户的前提下验证新模型是否正常运行。",
            warning: "不要在 A/B 测试中途随意修改实验配置或提前查看结果做决策，这会严重 inflate Type I error。"
        },
        {
            title: "2. 实验设计基础",
            body: `一个好的 A/B 测试实验始于严谨的设计。首先需要明确实验的核心假设：你相信新模型会比旧模型更好，具体好在哪里？这个假设必须是可量化的，比如 "新排序模型能将点击率提升至少 3%"。接下来要选定主指标和辅助指标。主指标是实验成败的判定标准，通常只有一个，避免多指标测试带来的多重比较问题。辅助指标用于观察新模型的副作用，比如转化率提升了但退货率是否也上升了。样本量计算是实验设计中最关键的步骤之一。样本量过小会导致统计功效不足，即使模型真的有效也检测不出来；样本量过大则会浪费资源并延长实验周期。样本量取决于基线转化率、期望检测的最小效应量、显著性水平和统计功效。随机化策略同样重要，必须确保用户被公平且一致地分配到各个实验组。常用的方法是基于用户 ID 的哈希分桶，保证同一个用户在整个实验期间始终看到同一个版本。此外，还需要考虑新奇效应，即用户因为看到新界面而产生的短期行为变化，这需要在分析时通过设置足够长的预热期来排除。`,
            code: [
                {
                    lang: "python",
                    code: `import math\nfrom scipy.stats import norm\n\n\ndef calculate_sample_size(\n    baseline_rate: float,\n    min_detectable_effect: float,\n    alpha: float = 0.05,\n    power: float = 0.80\n) -> int:\n    """计算每组所需的最小样本量（比例检验）"""\n    z_alpha = norm.ppf(1 - alpha / 2)\n    z_beta = norm.ppf(power)\n    p1 = baseline_rate\n    p2 = baseline_rate * (1 + min_detectable_effect)\n    p_bar = (p1 + p2) / 2\n    numerator = (z_alpha * math.sqrt(2 * p_bar * (1 - p_bar)) +\n                 z_beta * math.sqrt(p1 * (1 - p1) + p2 * (1 - p2)))  2\n    denominator = (p2 - p1)  2\n    return int(math.ceil(numerator / denominator))\n\n# 基线转化率 10%，期望检测 5% 相对提升\nn = calculate_sample_size(0.10, 0.05)\nprint(f"Each group needs: {n} samples")`
                },
                {
                    lang: "python",
                    code: `import pandas as pd\nimport numpy as np\n\n\ndef generate_experiment_data(\n    n_control: int,\n    n_variant: int,\n    conversion_rate_control: float = 0.10,\n    conversion_rate_variant: float = 0.108\n) -> pd.DataFrame:\n    """生成模拟实验数据"""\n    np.random.seed(42)\n    control = pd.DataFrame({\n        "user_id": [f"u_{i}" for i in range(n_control)],\n        "group": "control",\n        "converted": np.random.binomial(1, conversion_rate_control, n_control)\n    })\n    variant = pd.DataFrame({\n        "user_id": [f"u_{i + n_control}" for i in range(n_variant)],\n        "group": "variant",\n        "converted": np.random.binomial(1, conversion_rate_variant, n_variant)\n    })\n    return pd.concat([control, variant], ignore_index=True)\n\ndata = generate_experiment_data(50000, 50000)\nprint(data.groupby("group")["converted"].mean())`
                }
            ],
            table: {
                headers: ["参数", "典型值", "说明"],
                rows: [
                    ["显著性水平 alpha", "0.05", "Type I error 容忍度"],
                    ["统计功效 power", "0.80", "检测到真实效应的概率"],
                    ["最小可检测效应", "2%-10%", "业务上认为有意义的变化"],
                    ["预热期", "1-3 天", "排除新奇效应"],
                    ["实验周期", "7-14 天", "覆盖完整的用户行为周期"]
                ]
            },
            mermaid: `graph LR
    A[假设定义] --> B[指标选择]
    B --> C[样本量计算]
    C --> D[随机化策略]
    D --> E[预热期设置]
    E --> F[实验启动]
    F --> G[数据收集]
    G --> H{达到最小样本量?}
    H -->|"No"| G
    H -->|"Yes"| I[统计分析]`,
            tip: "实验周期至少覆盖一个完整的业务周期（比如一周），以消除周末效应等周期性波动。",
            warning: "样本量计算基于的基线率和效应量是估计值，实际运行中需要持续监控并确保数据质量。"
        },
        {
            title: "3. 统计显著性与功效",
            body: `统计显著性是 A/B 测试分析的核心概念，它回答了一个关键问题：观察到的差异有多大可能是真实存在的，而非随机波动造成的。p 值是最常用的显著性指标，它表示在原假设（两组无差异）为真的情况下，观察到当前差异或更极端差异的概率。当 p 值小于预设的显著性水平（通常 0.05）时，我们拒绝原假设，认为实验结果统计显著。然而，统计显著不等于业务显著。一个拥有百万级样本的实验可能检测出 0.01% 的差异并判定为显著，但这个差异在业务上可能毫无意义。因此，除了 p 值，还需要关注效应量（effect size）和置信区间。置信区间提供了效应量可能范围的估计，比单一的 p 值包含更多信息。统计功效是另一个常被忽视的重要概念，它表示当真实效应存在时，实验能够检测到的概率。功效不足是 A/B 测试失败的最常见原因之一。当功效只有 50% 时，即使新模型真的更好，你也有 50% 的概率得出 "无显著差异" 的错误结论。在实践中，建议在实验设计阶段就确保功效不低于 80%，这通常意味着需要足够的样本量和合理的实验周期。贝叶斯方法近年来在 A/B 测试中也越来越流行，它直接给出 "B 版本优于 A 版本的概率"，比频率派的 p 值更直观易懂。`,
            code: [
                {
                    lang: "python",
                    code: `from scipy import stats\nimport numpy as np\n\n\ndef analyze_ab_test(\n    conversions_control: int,\n    n_control: int,\n    conversions_variant: int,\n    n_variant: int,\n    alpha: float = 0.05\n) -> dict:\n    """频率派 A/B 测试分析"""\n    p1 = conversions_control / n_control\n    p2 = conversions_variant / n_variant\n    lift = (p2 - p1) / p1 * 100\n\n    z_stat, p_value = stats.proportions_ztest(\n        [conversions_variant, conversions_control],\n        [n_variant, n_control],\n        alternative="two-sided"\n    )\n\n    # 计算效应量 (Cohen's h)\n    h = 2 * np.arcsin(np.sqrt(p2)) - 2 * np.arcsin(np.sqrt(p1))\n\n    # 计算 95% 置信区间\n    se = np.sqrt(p1 * (1 - p1) / n_control + p2 * (1 - p2) / n_variant)\n    ci_low = (p2 - p1) - 1.96 * se\n    ci_high = (p2 - p1) + 1.96 * se\n\n    return {\n        "p_value": round(p_value, 6),\n        "significant": p_value < alpha,\n        "lift_pct": round(lift, 2),\n        "effect_size_h": round(h, 4),\n        "ci_95": [round(ci_low, 6), round(ci_high, 6)]\n    }\n\nresult = analyze_ab_test(5000, 50000, 5400, 50000)\nprint(result)`
                },
                {
                    lang: "python",
                    code: `import numpy as np\nfrom scipy.stats import beta\n\n\ndef bayesian_ab_analysis(\n    conversions_a: int, n_a: int,\n    conversions_b: int, n_b: int,\n    n_samples: int = 100000\n) -> dict:\n    """贝叶斯 A/B 测试分析"""\n    # 使用 Beta 先验 (Jeffreys prior)\n    posterior_a = beta.rvs(\n        conversions_a + 0.5, n_a - conversions_a + 0.5,\n        size=n_samples\n    )\n    posterior_b = beta.rvs(\n        conversions_b + 0.5, n_b - conversions_b + 0.5,\n        size=n_samples\n    )\n\n    prob_b_better = (posterior_b > posterior_a).mean()\n    expected_lift = ((posterior_b - posterior_a) / posterior_a).mean() * 100\n    ci_lift = np.percentile(\n        (posterior_b - posterior_a) / posterior_a * 100,\n        [2.5, 97.5]\n    )\n\n    return {\n        "prob_b_better": round(prob_b_better, 4),\n        "expected_lift_pct": round(expected_lift, 2),\n        "credible_interval_95": [round(ci_lift[0], 2), round(ci_lift[1], 2)]\n    }\n\nresult = bayesian_ab_analysis(5000, 50000, 5400, 50000)\nprint(result)`
                }
            ],
            table: {
                headers: ["概念", "频率派解释", "贝叶斯解释", "实际含义"],
                rows: [
                    ["p 值", "H0 为真时观察到此结果的概率", "不适用", "越小越支持有差异"],
                    ["置信区间", "95% CI 覆盖真实值的频率", "真实值在此区间的概率", "区间不含 0 则显著"],
                    ["功效", "真实效应存在时检测到的概率", "不适用", "建议不低于 80%"],
                    ["效应量", "标准化差异大小", "后验差异分布", "区分统计与业务显著性"],
                    ["先验", "无", "实验前的信念", "可用历史数据构建"]
                ]
            },
            mermaid: `graph TD
    A[收集数据] --> B[计算 p 值]
    B --> C{p < 0.05?}
    C -->|"Yes"| D[检查效应量]
    C -->|"No"| E[统计不显著]
    D --> F{效应量有业务意义?}
    F -->|"Yes"| G[发布新版本]
    F -->|"No"| H[继续优化]
    E --> I[检查功效是否充足]
    I --> J{样本量够吗?}
    J -->|"No"| K[延长实验]
    J -->|"Yes"| L[接受无差异结论]`,
            tip: "始终同时报告 p 值、效应量和置信区间，三者结合才能给出完整的实验结论。",
            warning: "不要 peeking——在实验未达到预定样本量之前就反复查看结果并提前终止，这会严重扭曲 p 值。"
        },
        {
            title: "4. 多臂老虎机算法",
            body: `传统的 A/B 测试在实验期间对各个版本分配固定比例的流量，这意味着即使某个版本明显更差，它仍然会持续浪费流量。多臂老虎机（Multi-Armed Bandit, MAB）算法通过在探索（exploration）和利用（exploitation）之间动态平衡，解决了这个效率问题。想象你在赌场面对多台老虎机，每台机器的中奖概率不同但你不知道。如果你一直尝试同一台机器（纯利用），可能错过更好的选择；如果你不停地换机器尝试（纯探索），又会浪费很多筹码。MAB 算法就是帮你在这两者之间找到最优平衡。最常用的算法包括 Epsilon-Greedy、Thompson Sampling 和 Upper Confidence Bound。Epsilon-Greedy 最简单：以概率 epsilon 随机探索，以概率 1-epsilon 选择当前最优版本。Thompson Sampling 则是贝叶斯方法，它维护每个版本转化率的后验分布，每次从后验中采样，选择采样值最大的版本。MAB 特别适合需要持续优化的场景，比如推荐系统中的算法切换、广告投放策略优化等。与固定流量的 A/B 测试相比，MAB 可以在实验期间自动将更多流量分配给表现更好的版本，从而在实验过程中就获得更高的整体收益。但 MAB 也有局限性：它的统计推断不如传统 A/B 测试严谨，难以给出明确的 "哪个版本更好" 的结论；同时，如果环境发生变化（比如季节性波动），算法需要时间来适应。`,
            code: [
                {
                    lang: "python",
                    code: `import numpy as np\nfrom typing import List\n\n\nclass ThompsonSampling:\n    """Thompson Sampling 多臂老虎机"""\n\n    def __init__(self, n_arms: int, alpha_prior: float = 1.0,\n                 beta_prior: float = 1.0):\n        self.n_arms = n_arms\n        self.alpha = np.full(n_arms, alpha_prior)  #  successes + prior\n        self.beta = np.full(n_arms, beta_prior)     #  failures + prior\n\n    def select_arm(self) -> int:\n        """从 Beta 后验采样，选择值最大的 arm"""\n        samples = np.random.beta(self.alpha, self.beta)\n        return int(np.argmax(samples))\n\n    def update(self, arm: int, reward: float):\n        """更新指定 arm 的后验分布"""\n        if reward > 0:\n            self.alpha[arm] += 1\n        else:\n            self.beta[arm] += 1\n\n    def get_estimates(self) -> np.ndarray:\n        """返回各 arm 的期望估计"""\n        return self.alpha / (self.alpha + self.beta)\n\n\n# 模拟: 3 个版本,真实转化率分别为 10%, 12%, 8%\nts = ThompsonSampling(3)\ntrue_rates = [0.10, 0.12, 0.08]\nfor _ in range(10000):\n    arm = ts.select_arm()\n    reward = float(np.random.random() < true_rates[arm])\n    ts.update(arm, reward)\nprint(f"Estimates: {ts.get_estimates()}")`
                },
                {
                    lang: "python",
                    code: `import numpy as np\nfrom typing import Tuple\n\n\nclass EpsilonGreedy:\n    """Epsilon-Greedy 多臂老虎机"""\n\n    def __init__(self, n_arms: int, epsilon: float = 0.1,\n                 decay: float = 0.999):\n        self.n_arms = n_arms\n        self.epsilon = epsilon\n        self.decay = decay\n        self.counts = np.zeros(n_arms)\n        self.values = np.zeros(n_arms)\n\n    def select_arm(self) -> int:\n        if np.random.random() < self.epsilon:\n            return int(np.random.randint(self.n_arms))\n        # 打破平局: 随机选择最优的\n        max_val = np.max(self.values)\n        best_arms = np.where(self.values == max_val)[0]\n        return int(np.random.choice(best_arms))\n\n    def update(self, arm: int, reward: float):\n        self.counts[arm] += 1\n        n = self.counts[arm]\n        self.values[arm] += (reward - self.values[arm]) / n\n        self.epsilon *= self.decay\n\n    def regret(self, true_rates: np.ndarray) -> float:\n        """计算累积 regret"""\n        best_rate = np.max(true_rates)\n        total_reward = np.sum(self.counts * self.values)\n        optimal_reward = np.sum(self.counts) * best_rate\n        return optimal_reward - total_reward`
                }
            ],
            table: {
                headers: ["算法", "探索策略", "计算复杂度", "适用场景", "优势"],
                rows: [
                    ["Epsilon-Greedy", "固定概率随机", "O(1)", "简单快速决策", "实现简单，易调试"],
                    ["Thompson Sampling", "后验采样", "O(n)", "转化率优化", "自动平衡探索/利用"],
                    ["UCB", "置信上界", "O(n)", "有明确置信区间", "理论保证强"],
                    ["Softmax", "Boltzmann 分布", "O(n)", "需要平滑选择", "概率分配更精细"],
                    ["固定 A/B", "无探索", "O(1)", "严谨统计推断", "结论明确可靠"]
                ]
            },
            mermaid: `graph LR
    A[用户到达] --> B[算法选择版本]
    B --> C[用户交互]
    C --> D[收集反馈]
    D --> E{奖励为正?}
    E -->|"Yes"| F[增加该版本权重]
    E -->|"No"| G[降低该版本权重]
    F --> H[更新后验分布]
    G --> H
    H --> A`,
            tip: "Thompson Sampling 在大多数实际场景中表现最优，特别是当你有多次实验机会时，它的 regret 增长是对数级的。",
            warning: 'MAB 算法不适合需要明确统计结论的场景。如果你需要向管理层汇报 "A 比 B 好 X%，p<0.05"，还是用传统 A/B 测试。'
        },
        {
            title: "5. 灰度发布与渐进式部署",
            body: `灰度发布是模型从测试环境走向全量生产的关键过渡阶段。即使 A/B 测试结果显示新模型显著优于旧模型，直接 100% 切换仍然存在风险：新模型可能在某些极端场景下表现异常，或者在特定用户群体上存在未发现的偏差。灰度发布的核心思想是 "小步快跑"：先让 1% 的用户使用新模型，确认没有严重问题后逐步扩大到 5%、10%、25%、50%，最终全量。每个阶段都需要密切监控关键指标，包括业务指标和技术指标。业务指标关注转化率、用户满意度等，技术指标关注延迟、错误率、资源消耗等。渐进式部署需要强大的基础设施支持，包括流量路由、实时指标监控、快速回滚能力和自动化告警。现代云原生架构中的 Service Mesh（如 Istio）和 API Gateway 都提供了精细的流量控制能力，可以实现基于用户属性、地域、设备类型等维度的灰度策略。一个典型的灰度发布流程通常需要 1-2 周，每个阶段至少运行 24-48 小时以覆盖完整的业务周期。在灰度期间，如果发现新模型在某些场景下表现不佳，可以立即暂停扩展并回退到上一阶段，而不需要完全回滚。这种渐进式的方法既保证了发布的安全性，又不影响迭代的速度。`,
            code: [
                {
                    lang: "python",
                    code: `from dataclasses import dataclass\nfrom typing import Dict, List\nimport time\n\n\n@dataclass\nclass CanaryStage:\n    """灰度发布的一个阶段"""\n    traffic_pct: float\n    min_duration_hours: int\n    success_criteria: Dict[str, float]\n\n\nclass CanaryDeployment:\n    """管理灰度发布流程"""\n\n    def __init__(self, model_name: str):\n        self.model_name = model_name\n        self.stages: List[CanaryStage] = [\n            CanaryStage(1, 24, {"error_rate": 0.01, "latency_p99": 500}),\n            CanaryStage(5, 24, {"error_rate": 0.01, "latency_p99": 500}),\n            CanaryStage(25, 48, {"error_rate": 0.005, "latency_p99": 450}),\n            CanaryStage(50, 48, {"error_rate": 0.005, "latency_p99": 450}),\n            CanaryStage(100, 24, {"error_rate": 0.005, "latency_p99": 400}),\n        ]\n        self.current_stage = 0\n\n    def check_stage_health(self, metrics: Dict[str, float]) -> bool:\n        """检查当前阶段的健康指标"""\n        criteria = self.stages[self.current_stage].success_criteria\n        return all(\n            metrics.get(k, float("inf")) <= v\n            for k, v in criteria.items()\n        )\n\n    def promote(self) -> bool:\n        """推进到下一个阶段"""\n        if self.current_stage >= len(self.stages) - 1:\n            return False\n        self.current_stage += 1\n        return True`
                },
                {
                    lang: "yaml",
                    code: `# Istio VirtualService 灰度流量配置\napiVersion: networking.istio.io/v1beta3\nkind: VirtualService\nmetadata:\n  name: model-serving-route\nspec:\n  hosts:\n    - model-api.example.com\n  http:\n    - route:\n        - destination:\n            host: model-api\n            subset: stable\n          weight: 95\n        - destination:\n            host: model-api\n            subset: canary\n          weight: 5\n      timeout: 2s\n      retries:\n        attempts: 3\n        perTryTimeout: 500ms\n---\napiVersion: networking.istio.io/v1beta3\nkind: DestinationRule\nmetadata:\n  name: model-api-versions\nspec:\n  host: model-api.example.com\n  subsets:\n    - name: stable\n      labels:\n        version: v1.2.0\n    - name: canary\n      labels:\n        version: v1.3.0`
                }
            ],
            table: {
                headers: ["阶段", "流量比例", "持续时间", "关注重点", "回滚策略"],
                rows: [
                    ["Canary 1%", "1%", "24h", "致命错误", "立即回滚到 0%"],
                    ["Canary 5%", "5%", "24h", "性能与错误率", "回滚到 1%"],
                    ["Canary 25%", "25%", "48h", "业务指标趋势", "回滚到 5%"],
                    ["Canary 50%", "50%", "48h", "用户反馈", "回滚到 25%"],
                    ["Full Rollout", "100%", "24h", "全量稳定性", "回滚到 50%"]
                ]
            },
            mermaid: `graph LR
    A[新模型通过 A/B] --> B[Canary 1％]
    B --> C{监控 24h}
    C -->|"OK"| D[Canary 5％]
    C -->|"Alert"| E[立即回滚]
    D --> F{监控 24h}
    F -->|"OK"| G[Canary 25％]
    F -->|"Alert"| H[回滚到 1％]
    G --> I{监控 48h}
    I -->|"OK"| J[Canary 50％]
    I -->|"Alert"| K[回滚到 5％]
    J --> L{监控 48h}
    L -->|"OK"| M[Full 100％]
    L -->|"Alert"| N[回滚到 25％]`,
            tip: "灰度发布的每个阶段都应该有明确的退出标准（success criteria）和回滚触发条件，提前写好 Runbook。",
            warning: "不要在非工作时间推进灰度阶段，万一出问题需要团队快速响应。选择工作日的上午推进新阶段。"
        },
        {
            title: "6. 模型回滚策略",
            body: `即使有了完善的 A/B 测试和灰度发布流程，模型上线后仍然可能出现意外问题：数据分布的突然变化、依赖服务的故障、或者某个边界场景下的推理错误。因此，建立快速可靠的模型回滚机制是 ML 工程化的最后一道安全防线。回滚策略需要在问题发生之前就设计好，而不是临时应对。首先需要定义清晰的回滚触发条件：哪些指标异常到什么程度需要回滚？这通常包括技术指标（错误率飙升、延迟超标）和业务指标（转化率下降、用户投诉激增）。其次，回滚操作本身必须足够快，理想情况下应该在分钟级别完成。这就要求模型服务架构支持蓝绿部署或多版本共存，新的请求可以瞬间切换到旧版本模型。回滚不仅仅是切换模型版本，还需要考虑数据一致性、用户状态和缓存清理等问题。比如，如果新模型修改了用户的推荐队列，回滚时是否需要恢复旧队列？如果新模型写入了特定的用户画像标签，这些标签是否需要清理？最后，每次回滚都应该被视为一次学习机会。进行根因分析，找到模型失败的原因，改进训练流程或数据质量，然后重新迭代。一个成熟的 ML 团队不会因为回滚而感到挫败，他们会因为快速发现问题并安全回滚而感到自豪。`,
            code: [
                {
                    lang: "python",
                    code: `import time\nfrom enum import Enum\nfrom typing import Optional\nimport threading\n\n\nclass ModelState(Enum):\n    ACTIVE = "active"\n    ROLLED_BACK = "rolled_back"\n    ROLLING_BACK = "rolling_back"\n\n\nclass ModelRollbackManager:\n    """模型回滚管理器"""\n\n    def __init__(self, model_name: str):\n        self.model_name = model_name\n        self.state = ModelState.ACTIVE\n        self.current_version: Optional[str] = None\n        self.previous_version: Optional[str] = None\n        self.rollback_thresholds = {\n            "error_rate": 0.05,\n            "latency_p99_ms": 1000,\n            "conversion_drop_pct": -10,\n        }\n        self._lock = threading.Lock()\n\n    def check_and_trigger_rollback(self, metrics: dict) -> bool:\n        """检查指标，必要时触发回滚"""\n        with self._lock:\n            if self.state == ModelState.ROLLING_BACK:\n                return False\n            triggered = False\n            if metrics.get("error_rate", 0) > self.rollback_thresholds["error_rate"]:\n                triggered = True\n            if metrics.get("latency_p99_ms", 0) > self.rollback_thresholds["latency_p99_ms"]:\n                triggered = True\n            if metrics.get("conversion_drop_pct", 0) < self.rollback_thresholds["conversion_drop_pct"]:\n                triggered = True\n            if triggered:\n                return self._execute_rollback()\n            return False\n\n    def _execute_rollback(self) -> bool:\n        if not self.previous_version:\n            return False\n        self.state = ModelState.ROLLING_BACK\n        # 切换流量到旧版本\n        time.sleep(1)  # 模拟流量切换\n        self.current_version, self.previous_version = (\n            self.previous_version, self.current_version\n        )\n        self.state = ModelState.ROLLED_BACK\n        return True`
                },
                {
                    lang: "python",
                    code: `from dataclasses import dataclass\nfrom typing import List\nimport json\n\n\n@dataclass\nclass RollbackEvent:\n    """回滚事件记录"""\n    model_name: str\n    from_version: str\n    to_version: str\n    trigger_reason: str\n    metrics_snapshot: dict\n    timestamp: str\n    operator: str\n\n\nclass RollbackHistory:\n    """维护回滚历史并生成分析报告"""\n\n    def __init__(self):\n        self.events: List[RollbackEvent] = []\n\n    def record(self, event: RollbackEvent):\n        self.events.append(event)\n\n    def get_rollback_rate(self, model_name: str) -> float:\n        total = sum(1 for e in self.events if e.model_name == model_name)\n        return total / max(1, 10)  # 假设 10 次发布\n\n    def common_reasons(self) -> List[str]:\n        reasons = [e.trigger_reason for e in self.events]\n        from collections import Counter\n        return [r for r, _ in Counter(reasons).most_common(5)]\n\n    def generate_report(self) -> dict:\n        return {\n            "total_rollbacks": len(self.events),\n            "common_reasons": self.common_reasons(),\n            "recent_events": [\n                json.dumps({\n                    "model": e.model_name,\n                    "from": e.from_version,\n                    "to": e.to_version,\n                    "reason": e.trigger_reason\n                })\n                for e in self.events[-5:]\n            ]\n        }`
                }
            ],
            table: {
                headers: ["回滚触发条件", "阈值建议", "响应时间要求", "自动化程度"],
                rows: [
                    ["错误率飙升", "超过 5%", "1 分钟内", "全自动"],
                    ["延迟超标", "P99 超过 1s", "1 分钟内", "全自动"],
                    ["转化率下降", "相对下降 10%", "15 分钟内", "半自动"],
                    ["数据漂移", "PSI 超过 0.25", "1 小时内", "告警+人工"],
                    ["用户投诉激增", "工单量翻倍", "30 分钟内", "告警+人工"]
                ]
            },
            mermaid: `graph TD
    A[监控指标异常] --> B{超过阈值?}
    B -->|"No"| C[继续观察]
    B -->|"Yes"| D[触发告警]
    D --> E{错误率或延迟?}
    E -->|"Yes"| F[自动回滚]
    E -->|"No"| G[人工评估]
    G --> H{需要回滚?}
    H -->|"Yes"| I[手动回滚]
    H -->|"No"| J[调整阈值]
    F --> K[记录回滚事件]
    I --> K
    K --> L[根因分析]
    L --> M[改进模型]`,
            tip: "定期进行回滚演练（Chaos Engineering），验证回滚流程的可靠性和速度，就像消防演习一样重要。",
            warning: "回滚不等于放弃。每次回滚后必须做根因分析，否则同样的问题会在下次发布时重现。"
        },
        {
            title: "7. 实战：MLflow + A/B 测试框架",
            body: `理论终究要落实到代码。本节通过一个完整的实战案例，演示如何将 MLflow 与 A/B 测试框架结合，构建端到端的模型迭代流水线。MLflow 是 Databricks 开源的 ML 生命周期管理平台，提供了模型注册、版本管理、实验追踪和模型服务部署等功能。在我们的实战方案中，MLflow 负责模型版本的注册和追踪，A/B 测试框架负责流量分配和效果评估，两者通过 API 集成形成完整的迭代闭环。首先需要搭建 MLflow Model Registry，将训练好的模型注册为版本化的 "Model" 对象。每个模型版本都有明确的生命周期状态：None（开发中）、Staging（测试中）、Production（生产中）、Archived（归档）。当新模型通过离线评估后，注册为 Staging 状态，然后通过 A/B 测试验证其线上效果。验证通过后，自动将模型版本标记为 Production，触发灰度发布流程。这个流程可以通过 MLflow 的 Webhook 与 CI/CD 流水线集成，实现从模型注册到线上部署的完全自动化。A/B 测试的流量分配可以通过自定义中间件实现，该中间件查询实验配置，根据用户 ID 决定路由到哪个模型版本。评估指标通过日志系统收集，定期运行统计分析脚本，自动生成实验报告。整个闭环的关键在于自动化：从模型注册、实验创建、流量分配到结果分析，每一步都应该是可编程的、可追溯的、可复现的。`,
            code: [
                {
                    lang: "python",
                    code: `import mlflow\nfrom mlflow.tracking import MlflowClient\n\n\nclass MLflowModelRegistry:\n    """基于 MLflow 的模型注册与部署管理"""\n\n    def __init__(self, tracking_uri: str = "http://localhost:5000"):\n        self.client = MlflowClient(tracking_uri=tracking_uri)\n\n    def register_model(\n        self,\n        model_name: str,\n        run_id: str,\n        description: str = ""\n    ) -> str:\n        """注册模型并返回版本号"""\n        result = self.client.create_model_version(\n            name=model_name,\n            source=f"runs:/{run_id}/model",\n            run_id=run_id,\n            description=description\n        )\n        return result.version\n\n    def promote_to_staging(self, model_name: str, version: str):\n        """将模型版本推进到 Staging"""\n        self.client.transition_model_version_stage(\n            name=model_name, version=version, stage="Staging"\n        )\n\n    def promote_to_production(self, model_name: str, version: str):\n        """将模型版本推进到 Production"""\n        self.client.transition_model_version_stage(\n            name=model_name, version=version, stage="Production"\n        )\n\n    def get_production_version(self, model_name: str) -> str:\n        versions = self.client.get_latest_versions(\n            model_name, stages=["Production"]\n        )\n        return versions[0].version if versions else None`
                },
                {
                    lang: "python",
                    code: `import mlflow\nimport requests\nfrom typing import Optional\n\n\nclass ABTestModelRouter:\n    """集成 MLflow 的 A/B 测试模型路由器"""\n\n    def __init__(self, model_name: str, experiment_id: str):\n        self.model_name = model_name\n        self.experiment_id = experiment_id\n        self.client = mlflow.tracking.MlflowClient()\n        self._model_cache = {}\n\n    def get_model_uri(self, stage: str = "Production") -> Optional[str]:\n        """获取指定阶段模型的 Serving URI"""\n        versions = self.client.get_latest_versions(\n            self.model_name, stages=[stage]\n        )\n        if not versions:\n            return None\n        return versions[0].source\n\n    def predict(self, user_id: str, features: dict) -> dict:\n        """根据实验配置路由到对应模型并返回预测结果"""\n        variant = self._get_assigned_variant(user_id)\n        if variant == "control":\n            uri = self.get_model_uri("Production")\n        else:\n            uri = self.get_model_uri("Staging")\n\n        if not uri:\n            raise RuntimeError(f"No model found for variant: {variant}")\n\n        response = requests.post(\n            f"{uri}/invocations",\n            json={"inputs": [features]},\n            timeout=5\n        )\n        prediction = response.json()\n        self._log_prediction(user_id, variant, prediction)\n        return prediction\n\n    def _log_prediction(self, user_id, variant, prediction):\n        pass  # 记录到实验分析系统\n\n    def _get_assigned_variant(self, user_id: str) -> str:\n        import hashlib\n        bucket = int(hashlib.md5(user_id.encode()).hexdigest(), 16) % 100\n        return "variant" if bucket < 10 else "control"  # 10% 流量`
                }
            ],
            table: {
                headers: ["组件", "职责", "工具选择", "关键指标"],
                rows: [
                    ["模型注册", "版本管理与状态追踪", "MLflow Registry", "注册成功率"],
                    ["流量分配", "用户分流与一致性", "自定义中间件", "分流均匀性"],
                    ["指标收集", "业务与技术指标日志", "ELK / DataDog", "数据完整性"],
                    ["统计分析", "显著性检验与报告", "自定义脚本", "分析准确率"],
                    ["部署编排", "版本切换与回滚", "K8s + Istio", "部署成功率"]
                ]
            },
            mermaid: `sequenceDiagram
    participant DS as 数据科学家
    participant ML as MLflow Registry
    participant AB as A/B 测试服务
    participant API as 模型服务 API
    participant U as 用户

    DS->>ML: 训练模型并注册为 Staging
    ML->>AB: 创建实验 (控制组 vs Staging)
    U->>API: 发送请求
    API->>AB: 查询用户实验分组
    AB-->>API: 返回 variant (control/variant)
    API->>API: 路由到对应模型版本
    API-->>U: 返回预测结果
    API->>AB: 记录预测结果与指标
    AB->>AB: 定期运行统计分析
    AB->>DS: 发送实验报告
    DS->>ML: 实验通过，推进到 Production`,
            tip: "将 MLflow Webhook 与 Slack/飞书集成，模型版本状态变更时自动通知团队，保持信息透明。",
            warning: "MLflow Model Registry 的 stage 转换是异步操作，在高并发场景下需要加锁防止并发冲突。"
        }
    ],
};
