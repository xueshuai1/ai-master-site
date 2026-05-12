import { Article } from '../knowledge';

export const article: Article = {
    id: "aieng-005",
    title: "模型监控与漂移检测",
    category: "aieng",
    tags: ["模型监控", "数据漂移", "MLOps"],
    summary: "从数据漂移到性能监控，掌握生产环境中的模型运维",
    date: "2026-04-12",
    readTime: "18 min",
    level: "进阶",
    content: [
      {
        title: "1. 为什么需要模型监控：从训练到上线的鸿沟",
        body: `机器学习模型在训练集和验证集上表现优异，并不意味着它能在生产环境中长期稳定运行。模型部署只是起点，真正的挑战在于持续运维。

**一个经典的案例是**：某电商公司的推荐模型上线首月 CTR 提升 15%，三个月后却跌回基线以下。排查发现，用户行为模式因季节性促销发生了根本性变化，而模型仍然基于历史分布做预测。这就是模型漂移（Model Drift）的典型表现。

模型监控的核心目标有三个：检测数据分布是否发生变化、评估模型预测质量是否退化、在问题影响用户之前发出预警。没有监控的模型就像没有仪表盘的飞机——你不知道它什么时候会坠毁。

生产环境的模型需要持续面对四大挑战：输入数据分布变化、业务逻辑变更、外部事件冲击（如疫情、政策调整）、以及模型自身的累积误差。监控体系必须覆盖从数据流入到预测输出的全链路。`,
        mermaid: `graph TD
    A["训练环境"] -->|离线评估| B["验证集指标优秀"]
    B --> C["模型部署上线"]
    C --> D["生产环境"]
    D --> E["真实数据流入"]
    E --> F{"数据分布是否改变?"}
    F -->|是| G["模型漂移发生"]
    F -->|否| H["模型持续有效"]
    G --> I["预测质量下降"]
    I --> J["业务指标恶化"]
    D -->|监控体系| K["实时检测漂移"]
    K -->|告警| L["触发重训练"]`,
        table: {
          headers: ["失效场景", "根本原因", "检测难度", "业务影响"],
          rows: [
            ["季节性变化", "输入数据分布随时间周期性变化", "低 - 有明显周期规律", "中等 - 可提前预期"],
            ["突发事件", "疫情、政策等导致数据分布骤变", "高 - 无先兆", "严重 - 模型立即失效"],
            ["特征工程过期", "上游数据管道变更导致特征含义改变", "中等 - 需要特征级监控", "严重 - 静默失效"],
            ["概念漂移", "目标变量的定义本身发生变化", "极高 - 需要真实标签", "致命 - 模型完全失效"],
          ],
        },
        code: [
          {
            lang: "python",
            code: `# 模型健康度监控的基础框架
from typing import Dict, List
from dataclasses import dataclass, field
from datetime import datetime
import numpy as np

@dataclass
class ModelHealthReport:
    model_id: str
    timestamp: datetime
    data_drift_score: float        # 数据漂移分数 0-1
    prediction_drift_score: float  # 预测分布漂移分数
    performance_score: float       # 如果有真实标签
    alert_level: str = "green"     # green / yellow / red
    details: Dict = field(default_factory=dict)

class ModelMonitor:
    """模型健康度监控器"""
    
    def __init__(self, model_id: str, drift_threshold: float = 0.15):
        self.model_id = model_id
        self.drift_threshold = drift_threshold
        self.reference_stats: Dict = {}
        self.alerts: List[str] = []
    
    def set_reference(self, train_data: np.ndarray):
        self.reference_stats = {
            "mean": np.mean(train_data, axis=0),
            "std": np.std(train_data, axis=0),
            "min": np.min(train_data, axis=0),
            "max": np.max(train_data, axis=0),
        }
    
    def evaluate(self, production_data: np.ndarray) -> ModelHealthReport:
        report = ModelHealthReport(
            model_id=self.model_id,
            timestamp=datetime.now(),
            data_drift_score=0.0,
            prediction_drift_score=0.0,
            performance_score=1.0,
        )
        # 计算标准化均值差异
        mean_diff = np.abs(np.mean(production_data, axis=0) - self.reference_stats["mean"])
        std_safe = np.where(self.reference_stats["std"] > 0, self.reference_stats["std"], 1.0)
        normalized_diff = mean_diff / std_safe
        report.data_drift_score = float(np.mean(normalized_diff))
        
        if report.data_drift_score > self.drift_threshold:
            report.alert_level = "red"
            self.alerts.append(f"数据漂移超标: {report.data_drift_score:.3f}")
        elif report.data_drift_score > self.drift_threshold * 0.7:
            report.alert_level = "yellow"
        return report`
          },
          {
            lang: "python",
            code: `# 生产环境中的模型监控指标采集
from collections import defaultdict
import time

class MetricsCollector:
    """收集模型推理指标用于监控"""
    
    def __init__(self, window_seconds: int = 3600):
        self.window = window_seconds
        self.latencies: List[float] = []
        self.prediction_counts: Dict[str, int] = defaultdict(int)
        self.error_counts: Dict[str, int] = defaultdict(int)
        self.prediction_values: List[float] = []
    
    def record_prediction(self, prediction: float, latency_ms: float,
                          model_version: str, success: bool = True):
        self.latencies.append(latency_ms)
        self.prediction_values.append(prediction)
        self.prediction_counts[model_version] += 1
        if not success:
            self.error_counts[model_version] += 1
    
    def get_summary(self) -> Dict:
        now = time.time()
        # 清理过期数据（简化版）
        n = len(self.latencies)
        if n == 0:
            return {"status": "no_data"}
        
        p50 = sorted(self.latencies)[n // 2]
        p99 = sorted(self.latencies)[int(n * 0.99)]
        error_rate = sum(self.error_counts.values()) / max(sum(self.prediction_counts.values()), 1)
        
        return {
            "total_predictions": n,
            "latency_p50_ms": round(p50, 2),
            "latency_p99_ms": round(p99, 2),
            "error_rate": round(error_rate, 4),
            "pred_mean": round(np.mean(self.prediction_values), 4),
            "pred_std": round(np.std(self.prediction_values), 4),
            "versions": dict(self.prediction_counts),
        }`
          },
        ],
        tip: "上线前必须建立的监控基线：记录训练数据的统计特征（均值、方差、分位数）、模型在验证集上的表现分布、推理延迟的 P50 和 P99。这些基线数据是后续漂移检测的参考标准。",
      },
      {
        title: "2. 数据漂移的本质：协变量漂移与概念漂移",
        body: `数据漂移是模型失效的最常见原因，但它不是单一现象。理解漂移的类型和机制，是构建有效监控体系的前提。

协变量漂移（Covariate Shift）指的是输入特征的分布发生变化，而输入与输出之间的关系保持不变。比如一个信用评分模型，训练数据主要来自 25-40 岁用户，上线后大量 50 岁以上用户涌入。年龄特征分布变了，但年龄与违约风险之间的映射关系没有变。这种情况下模型可能仍然有效，只是对未见过的特征区间泛化能力不足。

概念漂移（Concept Drift）更为严重——输入与输出之间的映射关系本身发生了变化。比如疫情期间，消费者的购买模式发生了根本性变化：以前的高消费用户可能变为低消费，模型学到的模式不再适用。概念漂移难以检测，因为需要真实的标签才能确认预测是否正确。

此外还有先验概率漂移（Prior Probability Shift），即目标变量的分布发生变化。比如垃圾邮件检测中，垃圾邮件的比例突然从 10% 上升到 40%，模型可能过度预测某一类别。`,
        mermaid: `graph LR
    A["模型输入 X"] -->|训练时学到的| B["映射关系 f(X)"]
    B --> C["预测 Y"]
    
    D["协变量漂移"] -->|P(X) 改变| A
    D -.->|f(X) 不变| B
    
    E["概念漂移"] -->|f(X) 改变| B
    E -.->|P(X) 可能不变| A
    
    F["先验概率漂移"] -->|P(Y) 改变| C
    F -.->|P(X|Y) 不变| A`,
        table: {
          headers: ["漂移类型", "变化内容", "是否需要标签检测", "严重程度", "典型场景"],
          rows: [
            ["协变量漂移", "输入特征 P(X) 变化", "否 - 仅需输入数据", "中等 - 模型可能仍有效", "用户群体变化、季节性"],
            ["概念漂移", "映射关系 P(Y|X) 变化", "是 - 需要真实标签", "严重 - 模型可能完全失效", "市场结构变化、政策调整"],
            ["先验概率漂移", "目标分布 P(Y) 变化", "是 - 需要真实标签", "中等 - 阈值需调整", "垃圾邮件比例变化"],
            ["子群体漂移", "特定子群体分布变化", "部分 - 需分组分析", "局部 - 影响特定用户群", "某地区用户行为突变"],
          ],
        },
        code: [
          {
            lang: "python",
            code: `# 协变量漂移检测：PSI (Population Stability Index)
import numpy as np
from typing import Tuple

def compute_psi(expected: np.ndarray, actual: np.ndarray,
                buckets: int = 10) -> float:
    """计算 PSI 分数，衡量两个分布的差异"""
    def _bin_proportions(data: np.ndarray) -> np.ndarray:
        # 使用 expected 的分位数作为分桶边界
        percentiles = np.linspace(0, 100, buckets + 1)
        bin_edges = np.percentile(expected, percentiles)
        bin_edges[0] -= 1e-10  # 避免边界值问题
        bin_edges[-1] += 1e-10
        counts = np.histogram(data, bins=bin_edges)[0]
        proportions = (counts + 1e-6) / (len(data) + buckets * 1e-6)  # 平滑
        return proportions
    
    exp_props = _bin_proportions(expected)
    act_props = _bin_proportions(actual)
    
    # PSI = sum((actual - expected) * ln(actual / expected))
    psi = np.sum((act_props - exp_props) * np.log(act_props / exp_props))
    return float(psi)

# 使用示例
train_ages = np.random.normal(32, 8, 5000)        # 训练数据年龄
prod_ages_new = np.random.normal(45, 10, 3000)    # 生产数据年龄（漂移了）
prod_ages_old = np.random.normal(33, 8, 3000)     # 生产数据年龄（未漂移）

psi_drifted = compute_psi(train_ages, prod_ages_new)
psi_stable = compute_psi(train_ages, prod_ages_old)
print(f"漂移场景 PSI: {psi_drifted:.4f}")   # 预期 > 0.25
print(f"稳定场景 PSI: {psi_stable:.4f}")    # 预期 < 0.1

# PSI 解读: < 0.1 无漂移, 0.1-0.25 中等漂移, > 0.25 严重漂移`,
          },
          {
            lang: "python",
            code: `# 概念漂移检测：使用滑动窗口的性能监控
from collections import deque
import numpy as np

class ConceptDriftDetector:
    """基于滑动窗口准确率的概念漂移检测"""
    
    def __init__(self, window_size: int = 500, threshold: float = 0.05):
        self.window_size = window_size
        self.threshold = threshold
        self.recent_acc = deque(maxlen=window_size)
        self.reference_acc = None
        self.drift_detected = False
    
    def set_reference_accuracy(self, acc: float):
        self.reference_acc = acc
    
    def update(self, prediction: int, ground_truth: int) -> bool:
        """输入单个预测和真实标签，返回是否检测到漂移"""
        correct = int(prediction == ground_truth)
        self.recent_acc.append(correct)
        
        if len(self.recent_acc) < self.window_size:
            return False
        
        current_acc = np.mean(self.recent_acc)
        if self.reference_acc is None:
            self.reference_acc = current_acc
            return False
        
        acc_drop = self.reference_acc - current_acc
        self.drift_detected = acc_drop > self.threshold
        return self.drift_detected
    
    def get_status(self) -> Dict:
        if not self.recent_acc:
            return {"status": "no_data"}
        current = np.mean(self.recent_acc)
        return {
            "reference_accuracy": round(self.reference_acc, 4) if self.reference_acc else None,
            "current_accuracy": round(current, 4),
            "accuracy_drop": round(self.reference_acc - current, 4) if self.reference_acc else None,
            "drift_detected": self.drift_detected,
            "window_size": len(self.recent_acc),
        }`,
          },
        ],
        warning: "概念漂移的隐蔽性极强：即使数据分布没有明显变化，输入输出之间的映射关系也可能已经改变。比如金融欺诈检测中，欺诈分子不断学习并改变策略，导致模型学到的规则过时。仅监控数据分布是不够的，必须同时监控预测准确率。",
      },
      {
        title: "3. 漂移检测方法：统计学与机器学习工具",
        body: `漂移检测不是单一算法，而是一个工具箱。不同的漂移类型、数据特征和延迟要求，需要选择不同的检测方法。

统计学方法是漂移检测的基础。KS 检验（Kolmogorov-Smirnov Test）用于比较两个连续变量分布的最大差异，适合检测数值特征的协变量漂移。卡方检验用于分类特征的分布比较。PSI（Population Stability Index）是工业界最常用的漂移指标，因为它直观且易于设置阈值。

基于机器学习的方法更加灵活。MMD（Maximum Mean Discrepancy）通过核方法在再生核希尔伯特空间中比较分布差异，对复杂的多维分布变化更敏感。对抗式漂移检测训练一个分类器来区分训练数据和生产数据，如果分类器能轻易区分两者，说明漂移已经发生。

选择检测方法的关键考量：检测灵敏度（能否发现微小但重要的变化）、计算效率（能否实时运行）、可解释性（能否定位漂移的具体特征）、以及假阳性率（过于敏感会导致告警疲劳）。`,
        mermaid: `graph TD
    A["漂移检测方法选择"] --> B{"数据类型?"}
    B -->|连续数值| C["KS 检验 / MMD"]
    B -->|分类变量| D["卡方检验 / PSI"]
    B -->|混合类型| E["对抗式检测"]
    
    C --> F{"需要实时?"}
    D --> F
    E --> F
    
    F -->|是 - 低延迟| G["PSI + 滑动窗口 O(N) 计算"]
    F -->|否 - 离线批处理| H["MMD + 全量数据 更高灵敏度"]
    
    G --> I["告警触发"]
    H --> I`,
        table: {
          headers: ["方法", "适用场景", "计算复杂度", "灵敏度", "是否需要标签"],
          rows: [
            ["KS 检验", "连续变量分布比较", "O(N log N)", "中等", "否"],
            ["PSI", "工业标准，分桶比较", "O(N)", "中等", "否"],
            ["卡方检验", "分类变量分布比较", "O(N)", "中等", "否"],
            ["MMD", "多维复杂分布", "O(N^2)", "高", "否"],
            ["对抗式检测", "高维混合数据", "O(N * epochs)", "高", "否"],
            ["EDDM", "概念漂移（需标签）", "O(N)", "高", "是"],
          ],
        },
        code: [
          {
            lang: "python",
            code: `# 多特征批量漂移检测管道
from scipy import stats
from typing import Dict, List, Tuple
import numpy as np

class DriftDetectionPipeline:
    """多特征批量漂移检测"""
    
    def __init__(self, significance: float = 0.05, psi_threshold: float = 0.1):
        self.significance = significance
        self.psi_threshold = psi_threshold
    
    def ks_test(self, ref: np.ndarray, prod: np.ndarray) -> Dict:
        statistic, p_value = stats.ks_2samp(ref, prod)
        return {"statistic": round(statistic, 4), "p_value": round(p_value, 6),
                "drift": p_value < self.significance}
    
    def psi_score(self, ref: np.ndarray, prod: np.ndarray, buckets: int = 10) -> float:
        edges = np.percentile(ref, np.linspace(0, 100, buckets + 1))
        edges[0] -= 1e-10; edges[-1] += 1e-10
        ref_p = (np.histogram(ref, bins=edges)[0] + 1e-6) / (len(ref) + buckets * 1e-6)
        prod_p = (np.histogram(prod, bins=edges)[0] + 1e-6) / (len(prod) + buckets * 1e-6)
        return float(np.sum((prod_p - ref_p) * np.log(prod_p / ref_p)))
    
    def detect_all(self, ref_data: Dict[str, np.ndarray],
                   prod_data: Dict[str, np.ndarray]) -> Dict:
        """对所有特征执行漂移检测"""
        results = {}
        for feature in ref_data:
            if feature not in prod_data:
                results[feature] = {"status": "missing"}
                continue
            ref, prod = ref_data[feature], prod_data[feature]
            if np.issubdtype(ref.dtype, np.number) and len(np.unique(ref)) > 10:
                ks_result = self.ks_test(ref, prod)
                psi = self.psi_score(ref, prod)
                results[feature] = {
                    "method": "KS + PSI", "ks": ks_result, "psi": round(psi, 4),
                    "drift": ks_result["drift"] or psi > self.psi_threshold,
                }
            else:
                chi2, p_val = stats.chisquare(
                    np.histogram(prod, bins=len(np.unique(ref)))[0] + 1e-6,
                    np.histogram(ref, bins=len(np.unique(ref)))[0] + 1e-6
                )
                results[feature] = {"method": "Chi2", "chi2": round(chi2, 4),
                                    "p_value": round(p_val, 6), "drift": p_val < self.significance}
        return results`
          },
          {
            lang: "python",
            code: `# 对抗式漂移检测：训练分类器区分参考数据和生产数据
import numpy as np
from sklearn.ensemble import GradientBoostingClassifier
from sklearn.model_selection import cross_val_score
from typing import Dict

class AdversarialDriftDetector:
    """对抗式漂移检测器：如果能区分两个数据集，说明发生了漂移"""
    
    def __init__(self, n_estimators: int = 100):
        self.classifier = GradientBoostingClassifier(n_estimators=n_estimators, max_depth=3)
    
    def detect(self, ref_data: np.ndarray, prod_data: np.ndarray) -> Dict:
        # 构造二分类问题：0=参考数据，1=生产数据
        X = np.vstack([ref_data, prod_data])
        y = np.concatenate([np.zeros(len(ref_data)), np.ones(len(prod_data))])
        
        # 交叉验证评估分类器区分能力
        cv_scores = cross_val_score(self.classifier, X, y, cv=5, scoring="roc_auc")
        mean_auc = float(np.mean(cv_scores))
        
        # AUC = 0.5 表示完全无法区分（无漂移）
        # AUC >> 0.5 表示可以区分（存在漂移）
        drift_severity = max(0, (mean_auc - 0.5) * 2)  # 归一化到 0-1
        
        # 特征重要性分析：哪些特征贡献最大
        self.classifier.fit(X, y)
        importances = self.classifier.feature_importances_
        top_features = np.argsort(importances)[::-1][:5]
        
        return {
            "auc_roc": round(mean_auc, 4),
            "drift_severity": round(drift_severity, 4),
            "drift_detected": mean_auc > 0.65,
            "top_drift_features": top_features.tolist(),
            "feature_importances": {i: round(importances[i], 4) for i in top_features},
        }`
          },
        ],
        tip: "组合使用多种检测方法：单一方法总有盲点。推荐组合 PSI（全局漂移趋势）+ KS 检验（逐特征精确检测）+ 对抗式检测（捕捉复杂的联合分布变化）。当至少两种方法同时告警时，漂移的可信度更高。",
      },
      {
        title: "4. 模型性能监控：不只是准确率",
        body: `模型性能监控远比"看看准确率有没有下降"复杂得多。在生产环境中，你需要从多个维度持续评估模型的健康状况。

延迟监控是最直接的性能指标。推理延迟的 P50 反映典型用户体验，P99 反映最差情况。延迟突然升高可能意味着：模型输入数据量异常增大、特征计算管道变慢、或者是模型本身需要更多计算资源。延迟监控是发现基础设施问题的第一道防线。

预测分布监控关注模型输出的统计特性。如果一个二分类模型平时输出均值在 0.3 左右，突然跳到 0.7，即使你暂时没有真实标签来确认准确性，这个变化也值得调查。预测分布的突然变化往往是漂移的早期信号。

业务指标关联是最高阶的监控。模型预测的准确性最终体现在业务结果上：推荐模型的 CTR、风控模型的坏账率、定价模型的利润率。将模型指标与业务指标关联，能帮助你判断"模型变化是否真的影响业务"。`,
        mermaid: `graph TD
    A["模型性能监控体系"] --> B["技术指标"]
    A --> C["预测质量指标"]
    A --> D["业务指标"]
    
    B --> B1["推理延迟 P50/P99"]
    B --> B2["吞吐量 QPS"]
    B --> B3["错误率 / 超时率"]
    B --> B4["资源利用率"]
    
    C --> C1["预测分布均值/方差"]
    C --> C2["置信度分布"]
    C --> C3["类别不平衡检测"]
    C --> C4["准确率/精确率/召回率"]
    
    D --> D1["CTR / 转化率"]
    D --> D2["坏账率 / 欺诈率"]
    D --> D3["用户满意度"]
    D --> D4["ROI / 利润率"]`,
        table: {
          headers: ["监控维度", "关键指标", "告警阈值建议", "检测频率", "数据来源"],
          rows: [
            ["推理延迟", "P50, P99, P99.9", "P99 > 基线 * 2", "实时（每分钟）", "推理服务日志"],
            ["预测分布", "均值、标准差、分位数", "均值偏移 > 2 sigma", "每批次 / 每小时", "预测输出日志"],
            ["模型准确率", "Accuracy, F1, AUC", "下降 > 5%", "每日 / 每周", "标注数据集"],
            ["业务指标", "CTR, 转化率, ROI", "下降 > 10%", "每日", "业务数据库"],
            ["系统健康", "错误率, 超时率, CPU/内存", "错误率 > 1%", "实时", "基础设施监控"],
          ],
        },
        code: [
          {
            lang: "python",
            code: `# 预测分布监控：检测预测输出的统计异常
from typing import List, Dict
import numpy as np
from collections import deque

class PredictionDistributionMonitor:
    """监控模型预测输出的分布变化"""
    
    def __init__(self, baseline_mean: float, baseline_std: float,
                 window_size: int = 1000, z_threshold: float = 3.0):
        self.baseline_mean = baseline_mean
        self.baseline_std = baseline_std if baseline_std > 0 else 0.01
        self.window_size = window_size
        self.z_threshold = z_threshold
        self.predictions = deque(maxlen=window_size)
    
    def add_prediction(self, value: float):
        self.predictions.append(value)
    
    def check(self) -> Dict:
        if len(self.predictions) < self.window_size * 0.5:
            return {"status": "insufficient_data", "count": len(self.predictions)}
        
        preds = np.array(self.predictions)
        current_mean = np.mean(preds)
        current_std = np.std(preds)
        
        # Z-score 检测均值偏移
        z_score = abs(current_mean - self.baseline_mean) / self.baseline_std
        # 标准差变化率
        std_ratio = current_std / self.baseline_std
        # 极值比例
        outlier_ratio = np.sum(np.abs(preds - self.baseline_mean) > 3 * self.baseline_std) / len(preds)
        
        alerts = []
        if z_score > self.z_threshold:
            alerts.append(f"均值漂移: z={z_score:.2f}")
        if std_ratio > 2.0 or std_ratio < 0.5:
            alerts.append(f"方差异常: ratio={std_ratio:.2f}")
        if outlier_ratio > 0.05:
            alerts.append(f"极值过多: {outlier_ratio:.1%}")
        
        return {
            "status": "alert" if alerts else "ok",
            "current_mean": round(current_mean, 4),
            "current_std": round(current_std, 4),
            "z_score": round(z_score, 2),
            "std_ratio": round(std_ratio, 2),
            "outlier_ratio": round(outlier_ratio, 4),
            "alerts": alerts,
        }`,
          },
          {
            lang: "python",
            code: `# 业务指标关联分析：模型预测 vs 实际业务结果
import numpy as np
from typing import Dict, List
from scipy import stats

class BusinessImpactAnalyzer:
    """分析模型预测与业务结果的关联"""
    
    def __init__(self):
        self.prediction_outcome_pairs: List[tuple] = []
    
    def record(self, prediction_score: float, business_outcome: float):
        self.prediction_outcome_pairs.append((prediction_score, business_outcome))
    
    def analyze(self) -> Dict:
        if len(self.prediction_outcome_pairs) < 100:
            return {"status": "insufficient_data"}
        
        preds = np.array([p for p, _ in self.prediction_outcome_pairs])
        outcomes = np.array([o for _, o in self.prediction_outcome_pairs])
        
        # 预测与业务结果的相关性
        correlation, corr_p = stats.pearsonr(preds, outcomes)
        
        # 分桶分析：高预测分 vs 低预测分的业务表现差异
        n_bins = 5
        bin_edges = np.percentile(preds, np.linspace(0, 100, n_bins + 1))
        bin_analysis = []
        for i in range(n_bins):
            mask = (preds >= bin_edges[i]) & (preds < bin_edges[i + 1])
            if np.sum(mask) > 0:
                bin_analysis.append({
                    "bin": f"{bin_edges[i]:.2f}-{bin_edges[i+1]:.2f}",
                    "avg_outcome": round(float(np.mean(outcomes[mask])), 4),
                    "count": int(np.sum(mask)),
                })
        
        return {
            "correlation": round(correlation, 4),
            "correlation_p_value": round(corr_p, 6),
            "correlation_significant": corr_p < 0.05,
            "bin_analysis": bin_analysis,
            "total_samples": len(self.prediction_outcome_pairs),
        }`,
          },
        ],
        warning: "不要只依赖单一指标。准确率下降可能是数据质量问题而非模型问题；延迟升高可能是基础设施问题而非模型退化。建立多维度的监控面板，交叉验证告警信号，避免误判。",
      },
      {
        title: "5. 监控平台架构：从日志到告警的端到端设计",
        body: `一个生产级的模型监控平台需要处理数据采集、存储、分析、可视化和告警的完整流程。设计时需要考虑可扩展性、实时性和成本。

数据采集层是监控的基础。每条推理请求都应该记录：输入特征（或特征的哈希/摘要）、模型版本号、预测输出、置信度、推理时间戳和延迟。这些信息构成后续所有分析的原材料。采集方式可以是在推理服务中嵌入 SDK、使用 Sidecar 代理拦截流量、或在 API 网关层面统一采集。

存储层需要同时支持热数据（实时查询）和冷数据（历史分析）。热数据通常存入时序数据库（如 Prometheus、InfluxDB），支持秒级查询。冷数据可以存入数据仓库（如 Snowflake、BigQuery）或对象存储，用于长期趋势分析和模型审计。

分析和告警层是整个平台的大脑。它消费存储层的数据，执行漂移检测算法、计算性能指标、判断是否触发告警。告警需要分级：信息级（记录但不打扰）、警告级（通知值班人员）、严重级（立即通知并可能触发自动回滚）。`,
        mermaid: `graph LR
    A["推理服务"] -->|记录日志| B["数据采集层"]
    B -->|实时流| C["消息队列 Kafka / PubSub"]
    C --> D["流处理引擎 Flink / Spark"]
    D --> E["时序数据库 Prometheus"]
    D --> F["数据仓库 Snowflake"]
    
    E --> G["实时监控面板 Grafana"]
    F --> H["离线分析 Jupyter"]
    
    D --> I["漂移检测引擎"]
    I -->|告警规则| J["告警系统 PagerDuty / 飞书"]
    J --> K["自动触发重训练"]`,
        table: {
          headers: ["架构层", "组件选择", "延迟要求", "数据量级", "核心职责"],
          rows: [
            ["数据采集", "SDK / Sidecar / API Gateway", "亚毫秒", "每请求一条记录", "无侵入地收集数据"],
            ["消息传输", "Kafka / AWS Kinesis", "毫秒级", "百万条/秒", "解耦采集与分析"],
            ["流处理", "Flink / Spark Streaming", "秒级", "实时窗口聚合", "实时指标计算"],
            ["热存储", "Prometheus / InfluxDB", "秒级查询", "数天到数周", "实时监控面板"],
            ["冷存储", "S3 / BigQuery / Snowflake", "分钟级查询", "数月到数年", "离线分析和审计"],
          ],
        },
        code: [
          {
            lang: "python",
            code: `# 推理服务的监控数据采集 Sidecar 模式
import time
import json
import threading
from typing import Dict, Any
from queue import Queue

class InferenceLogger:
    """推理日志采集器：记录每次预测的元数据"""
    
    def __init__(self, batch_size: int = 100, flush_interval: float = 5.0):
        self.batch_size = batch_size
        self.flush_interval = flush_interval
        self.queue: Queue = Queue(maxsize=10000)
        self.running = True
        self.flush_thread = threading.Thread(target=self._flush_loop, daemon=True)
        self.flush_thread.start()
    
    def log(self, model_id: str, input_hash: str, prediction: float,
            confidence: float, latency_ms: float, metadata: Dict = None):
        record = {
            "timestamp": time.time(),
            "model_id": model_id,
            "input_hash": input_hash,  # 隐私保护：只存哈希
            "prediction": prediction,
            "confidence": confidence,
            "latency_ms": latency_ms,
            "metadata": metadata or {},
        }
        try:
            self.queue.put_nowait(record)
        except Exception:
            pass  # 队列满时丢弃（不应阻塞推理）
    
    def _flush_loop(self):
        while self.running:
            batch = []
            start = time.time()
            while len(batch) < self.batch_size and time.time() - start < self.flush_interval:
                try:
                    batch.append(self.queue.get(timeout=0.1))
                except Exception:
                    continue
            if batch:
                # 写入 Kafka / 文件 / 远程 API
                self._write_to_sink(batch)
    
    def _write_to_sink(self, batch: list):
        # 实际实现：写入 Kafka 或远程日志服务
        pass  # 占位
    
    def stop(self):
        self.running = False`,
          },
          {
            lang: "python",
            code: `# 监控面板的数据聚合器：从原始日志到可视化指标
from collections import defaultdict
from typing import Dict, List
import numpy as np

class MetricsAggregator:
    """将原始推理日志聚合为监控指标"""
    
    def __init__(self, time_window_minutes: int = 5):
        self.window = time_window_minutes * 60
        self.records: List[Dict] = []
    
    def add_records(self, records: List[Dict]):
        self.records.extend(records)
        # 清理过期数据
        cutoff = max(r["timestamp"] for r in self.records) - self.window * 2
        self.records = [r for r in self.records if r["timestamp"] > cutoff]
    
    def aggregate_by_model(self) -> Dict[str, Dict]:
        by_model = defaultdict(list)
        for r in self.records:
            by_model[r["model_id"]].append(r)
        
        result = {}
        for model_id, recs in by_model.items():
            latencies = [r["latency_ms"] for r in recs]
            predictions = [r["prediction"] for r in recs]
            sorted_lat = sorted(latencies)
            n = len(sorted_lat)
            
            result[model_id] = {
                "request_count": len(recs),
                "latency_p50": round(sorted_lat[n // 2], 2),
                "latency_p95": round(sorted_lat[int(n * 0.95)], 2),
                "latency_p99": round(sorted_lat[int(n * 0.99)], 2),
                "pred_mean": round(np.mean(predictions), 4),
                "pred_std": round(np.std(predictions), 4),
                "pred_min": round(min(predictions), 4),
                "pred_max": round(max(predictions), 4),
                "avg_confidence": round(np.mean([r["confidence"] for r in recs]), 4),
            }
        return result`,
          },
        ],
        tip: "日志采集的隐私保护原则：永远不要在日志中存储原始输入数据（可能包含 PII），改用特征哈希或统计摘要。这样既能做漂移检测，又不会违反数据隐私法规。",
      },
      {
        title: "6. 告警与自动化：从发现问题到解决问题",
        body: `告警系统的目标是在问题影响用户之前通知相关人员，但设计不当的告警系统本身就会成为问题——告警疲劳（Alert Fatigue）是 SRE 领域最常见的痛点之一。

告警设计的核心原则是"少而精"。每个告警都必须对应一个具体的、可执行的响应动作。如果你收到告警后只能"再看看"而无法采取任何行动，这个告警就不应该存在。告警应该分级：P1（严重，立即响应）、P2（警告，工作时间内处理）、P3（信息，定期回顾）。

自动化响应是 MLOps 的终极目标。当检测到特定类型的漂移时，系统可以自动触发预定义的响应流程：轻微漂移→增加采样率并通知团队；中等漂移→启动影子模式测试新模型；严重漂移→自动回滚到上一个稳定版本并触发紧急重训练。

告警的降噪（Deduplication）同样重要。同一根因可能触发多个告警，需要聚合和去重。比如数据漂移和预测分布漂移可能源于同一个上游数据管道变更，应该合并为一条告警。`,
        mermaid: `graph TD
    A["检测引擎"] --> B{"漂移严重程度?"}
    
    B -->|轻微 PSI < 0.15| C["P3 信息告警 记录到仪表板"]
    B -->|中等 0.15-0.25| D["P2 警告告警 通知值班人员"]
    B -->|严重 PSI > 0.25| E["P1 严重告警 立即通知 + 自动响应"]
    
    C --> F["定期回顾"]
    D --> G["人工评估 + 计划重训练"]
    E --> H["自动回滚到稳定版本"]
    H --> I["触发紧急重训练"]
    I --> J["新模型验证"]
    J --> K["灰度发布"]
    K --> L["全量上线"]`,
        table: {
          headers: ["告警级别", "触发条件", "响应时间", "响应动作", "通知方式"],
          rows: [
            ["P1 严重", "PSI > 0.25 或准确率下降 > 10%", "立即（< 15 分钟）", "自动回滚 + 通知 + 触发重训练", "电话 + 消息"],
            ["P2 警告", "PSI 0.15-0.25 或延迟 P99 > 基线 * 2", "4 小时内", "人工评估 + 制定应对方案", "消息通知"],
            ["P3 信息", "PSI 0.10-0.15 或轻微趋势变化", "下一工作日", "记录到周报 + 持续观察", "仪表板标记"],
            ["P4 趋势", "连续多日缓慢漂移", "周回顾", "纳入下期优化计划", "周报汇总"],
          ],
        },
        code: [
          {
            lang: "python",
            code: `# 告警路由与去重系统
from typing import Dict, List
from datetime import datetime, timedelta
from collections import defaultdict

class AlertRouter:
    """智能告警路由：去重、分级、分发"""
    
    def __init__(self):
        self.recent_alerts: Dict[str, datetime] = {}  # 防抖动
        self.dedup_window = timedelta(hours=2)
        self.alert_history: List[Dict] = []
    
    def process_alert(self, model_id: str, alert_type: str,
                      severity: str, message: str, details: Dict = None) -> Dict:
        """处理告警：去重、分级、决定是否需要通知"""
        dedup_key = f"{model_id}:{alert_type}"
        now = datetime.now()
        
        # 防抖动：同一模型同一类型告警在窗口内只发一次
        if dedup_key in self.recent_alerts:
            last = self.recent_alerts[dedup_key]
            if now - last < self.dedup_window:
                return {"action": "suppressed", "reason": "within_dedup_window", "last_alert": str(last)}
        
        # 相关告警聚合：检查是否有相关的 P1 告警已经在处理
        related = self._find_related(model_id, alert_type)
        if related and related["severity"] == "P1":
            return {"action": "merged", "reason": f"already_handling_P1: {related['alert_type']}"}
        
        self.recent_alerts[dedup_key] = now
        alert_record = {
            "timestamp": str(now), "model_id": model_id, "type": alert_type,
            "severity": severity, "message": message, "details": details or {},
        }
        self.alert_history.append(alert_record)
        
        # 决定通知方式
        notification = self._get_notification(severity)
        return {"action": "dispatched", "alert": alert_record, "notification": notification}
    
    def _find_related(self, model_id: str, alert_type: str) -> Dict:
        for alert in reversed(self.alert_history[-50:]):
            if alert["model_id"] == model_id and alert["type"] != alert_type:
                if datetime.fromisoformat(alert["timestamp"]) > datetime.now() - self.dedup_window:
                    return alert
        return {}
    
    def _get_notification(self, severity: str) -> Dict:
        channels = {
            "P1": ["phone", "sms", "feishu", "pagerduty"],
            "P2": ["feishu", "email"],
            "P3": ["dashboard"],
        }
        return {"channels": channels.get(severity, ["dashboard"]), "priority": severity}`,
          },
          {
            lang: "python",
            code: `# 自动化响应引擎：检测到漂移后自动执行预定义动作
from enum import Enum
from typing import Callable, Dict, List
import logging

class ResponseAction(Enum):
    LOG_ONLY = "log"
    NOTIFY_TEAM = "notify"
    INCREASE_SAMPLING = "increase_sampling"
    SHADOW_TEST = "shadow_test"
    ROLLBACK = "rollback"
    RETRAIN = "retrain"

class AutomatedResponseEngine:
    """根据漂移检测结果自动执行响应动作"""
    
    def __init__(self):
        self.handlers: Dict[ResponseAction, Callable] = {}
        self.response_log: List[Dict] = []
    
    def register_handler(self, action: ResponseAction, handler: Callable):
        self.handlers[action] = handler
    
    def decide_and_execute(self, model_id: str, psi_score: float,
                           accuracy_drop: float) -> Dict:
        """根据漂移程度决定并执行响应动作"""
        actions = self._decide_actions(psi_score, accuracy_drop)
        results = []
        
        for action in actions:
            handler = self.handlers.get(action)
            if handler:
                try:
                    result = handler(model_id, psi_score, accuracy_drop)
                    results.append({"action": action.value, "status": "success", "result": result})
                except Exception as e:
                    results.append({"action": action.value, "status": "error", "error": str(e)})
        
        response_record = {
            "model_id": model_id, "psi_score": psi_score,
            "accuracy_drop": accuracy_drop, "actions": results,
        }
        self.response_log.append(response_record)
        return response_record
    
    def _decide_actions(self, psi: float, acc_drop: float) -> List[ResponseAction]:
        if psi > 0.25 or acc_drop > 0.10:
            return [ResponseAction.NOTIFY_TEAM, ResponseAction.ROLLBACK, ResponseAction.RETRAIN]
        elif psi > 0.15 or acc_drop > 0.05:
            return [ResponseAction.NOTIFY_TEAM, ResponseAction.INCREASE_SAMPLING, ResponseAction.SHADOW_TEST]
        elif psi > 0.10:
            return [ResponseAction.LOG_ONLY, ResponseAction.INCREASE_SAMPLING]
        return [ResponseAction.LOG_ONLY]`,
          },
        ],
        warning: "自动化回滚是双刃剑。如果漂移检测的假阳性率高，频繁自动回滚会导致服务不稳定。建议：首次部署时只记录和告警，不自动执行；积累足够的历史数据确认检测可靠性后，再逐步开启自动化响应。先从增加采样率和影子测试开始，最后才开启自动回滚。",
      },
      {
        title: "7. MLOps 最佳实践：构建可持续的模型运维体系",
        body: `模型监控不是孤立的技术问题，而是整个 MLOps 体系的重要组成部分。一个可持续的模型运维体系需要将监控、重训练、部署、回滚串联成闭环。

模型版本管理是基础。每次模型变更（包括超参数调整、特征工程修改、训练数据更新）都应该生成新的版本号，并在监控系统中注册。这样当检测到问题时，可以快速定位是哪个版本的变更引入了问题，也可以快速回滚到已知稳定的版本。

影子部署（Shadow Deployment）是降低上线风险的有效策略。新版本模型与当前生产模型并行运行，接收相同的输入但不直接影响用户。通过对比两个模型的预测结果，可以在不影响用户体验的前提下评估新模型的表现。当影子模型的表现稳定超过基线后，再切换到全量发布。

持续重训练（Continuous Retraining）是应对漂移的最终手段。当监控检测到不可逆的漂移时，自动触发使用最新数据重新训练模型。关键在于：重训练管道必须和首次训练管道一致，确保结果可复现；新模型必须通过完整的验证流程才能上线。`,
        mermaid: `graph LR
    A["数据收集"] --> B["特征工程"]
    B --> C["模型训练"]
    C --> D["模型验证"]
    D --> E["模型注册"]
    E --> F["影子部署"]
    F --> G{"表现优于基线?"}
    G -->|是| H["灰度发布"]
    G -->|否| C
    H --> I["全量上线"]
    I --> J["持续监控"]
    J --> K{"检测到漂移?"}
    K -->|是| A
    K -->|否| J`,
        table: {
          headers: ["最佳实践", "具体措施", "频率", "负责角色", "工具建议"],
          rows: [
            ["模型版本管理", "每次变更生成唯一版本，记录训练数据和参数", "每次变更", "ML 工程师", "MLflow / DVC"],
            ["影子部署", "新旧模型并行运行，对比预测结果", "每次上线前", "ML + SRE", "自定义路由层"],
            ["定期模型审计", "全面评估模型性能、公平性、安全性", "每月 / 每季度", "ML 工程师 + 合规", "审计框架"],
            ["重训练自动化", "检测到漂移后自动触发训练管道", "按需触发", "MLOps 工程师", "Airflow / Kubeflow"],
            ["灾难恢复演练", "模拟模型失效场景，测试回滚流程", "每季度", "全体团队", "混沌工程工具"],
          ],
        },
        code: [
          {
            lang: "python",
            code: `# 模型版本管理与回滚系统
import json
import hashlib
from typing import Dict, List, Optional
from datetime import datetime

class ModelRegistry:
    """模型注册表：管理所有模型版本"""
    
    def __init__(self):
        self.models: Dict[str, List[Dict]] = {}
        self.active_models: Dict[str, str] = {}  # model_id -> version_id
    
    def register(self, model_id: str, version: str, metrics: Dict,
                 training_data_hash: str, artifacts_path: str) -> Dict:
        if model_id not in self.models:
            self.models[model_id] = []
        
        model_version = {
            "version": version,
            "registered_at": datetime.now().isoformat(),
            "metrics": metrics,
            "training_data_hash": training_data_hash,
            "artifacts_path": artifacts_path,
            "status": "registered",  # registered / staging / active / rolled_back
        }
        self.models[model_id].append(model_version)
        return model_version
    
    def promote(self, model_id: str, version: str) -> Dict:
        """将模型版本提升为活跃版本"""
        model_list = self.models.get(model_id, [])
        for mv in model_list:
            if mv["version"] == version:
                old_active = self.active_models.get(model_id)
                self.active_models[model_id] = version
                mv["status"] = "active"
                # 将旧版本标记为非活跃
                for other in model_list:
                    if other["version"] != version and other["status"] == "active":
                        other["status"] = "staged_out"
                return {"status": "promoted", "previous": old_active, "current": version}
        return {"status": "error", "message": "version not found"}
    
    def rollback(self, model_id: str) -> Dict:
        """回滚到上一个活跃版本"""
        model_list = self.models.get(model_id, [])
        for mv in reversed(model_list):
            if mv["status"] in ("active", "staged_out"):
                return self.promote(model_id, mv["version"])
        return {"status": "error", "message": "no previous version found"}`,
          },
          {
            lang: "python",
            code: `# 持续重训练管道：检测到漂移后自动触发
import subprocess
import logging
from typing import Dict, Optional

class RetrainingPipeline:
    """自动重训练管道"""
    
    def __init__(self, config_path: str):
        self.config_path = config_path
        self.training_history: List[Dict] = []
    
    def trigger_retraining(self, model_id: str, reason: str,
                           drift_report: Dict) -> Dict:
        logging.info(f"触发重训练: model={model_id}, reason={reason}")
        
        # 1. 获取最新训练数据
        data_path = self._fetch_latest_data(model_id)
        
        # 2. 执行训练
        training_result = self._run_training(model_id, data_path)
        
        # 3. 验证新模型
        validation_result = self._validate_model(model_id, training_result)
        
        # 4. 记录结果
        record = {
            "model_id": model_id,
            "trigger_reason": reason,
            "drift_report": drift_report,
            "training_result": training_result,
            "validation_result": validation_result,
            "timestamp": datetime.now().isoformat(),
        }
        self.training_history.append(record)
        
        if validation_result["passed"]:
            return {"status": "success", "new_model": validation_result["model_path"]}
        else:
            return {"status": "failed", "reason": validation_result["failure_reason"]}
    
    def _fetch_latest_data(self, model_id: str) -> str:
        # 从数据仓库获取最新的标注数据
        return f"/data/latest/{model_id}"
    
    def _run_training(self, model_id: str, data_path: str) -> Dict:
        # 调用训练脚本
        result = subprocess.run(
            ["python", "train.py", "--model", model_id, "--data", data_path,
             "--config", self.config_path],
            capture_output=True, text=True, timeout=3600
        )
        return {"exit_code": result.returncode, "log": result.stdout[-500:]}
    
    def _validate_model(self, model_id: str, training_result: Dict) -> Dict:
        # 在验证集上评估新模型
        # 返回是否达到上线标准
        return {"passed": True, "model_path": f"/models/{model_id}/latest",
                "metrics": {"accuracy": 0.92, "f1": 0.89}}`,
          },
        ],
        tip: "建立模型运维的'消防演练'机制：定期（每季度）模拟模型失效场景，测试团队的响应流程是否顺畅。包括：能否在 15 分钟内回滚？重训练管道是否能正常触发？告警是否送达正确的人？真实的危机中，没有时间临场学习。",
      },
    ],
  };
