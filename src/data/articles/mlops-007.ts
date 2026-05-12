import { Article } from '../knowledge';

export const article: Article = {
    id: "mlops-007",
    title: "ML 系统可观测性：从日志到智能告警",
    category: "mlops",
    tags: ["可观测性", "监控", "告警", "生产"],
    summary: "构建 ML 生产系统的全面可观测性体系，覆盖性能、数据、业务三层监控",
    date: "2026-04-12",
    readTime: "20 min",
    level: "进阶",
    content: [
        {
            title: "1. 为什么 ML 系统需要专门的可观测性",
            body: `传统的软件系统可观测性关注三个支柱：日志（Logs）、指标（Metrics）和链路追踪（Traces）。这些工具足以诊断大多数工程问题——服务是否存活、请求延迟是否正常、错误率是否超标。但 ML 系统面临着独特的挑战：一个模型服务可能在所有工程指标上都表现完美（低延迟、零错误、高吞吐），但它的预测质量却在悄悄恶化。

ML 系统的可观测性需要在传统三个支柱之上增加第四个维度：数据与模型质量。这包括输入数据分布的变化、预测结果的统计特性、模型性能的衰减、以及最重要的——业务指标的影响。模型预测准确率的下降可能不会立即触发技术告警，但会逐渐损害业务效果，这种"静默退化"是 ML 生产系统最大的风险之一。

构建 ML 可观测性体系的核心原则是分层监控：基础设施层（计算资源、网络）、服务层（API 延迟、吞吐）、模型层（预测分布、置信度）、数据层（特征分布、数据质量）、以及业务层（转化率、用户满意度）。每一层都有独立的告警阈值和响应流程，但又相互关联，共同构成完整的可观测性视图。`,
            mermaid: `graph TD
    A["业务层"] -->|"转化率下降"| B["模型层"]
    B -->|"预测偏移"| C["数据层"]
    C -->|"分布漂移"| D["服务层"]
    D -->|"延迟增加"| E["基础设施层"]
    E -.->|"根因定位"| A
    F["告警系统"] -.-> A
    F -.-> B
    F -.-> C
    F -.-> D
    F -.-> E`,
            tip: "最佳实践：先监控业务指标，再逐层下钻。业务指标的异常是最有价值的告警信号，因为它直接反映了模型对用户的实际影响。",
        },
        {
            title: "2. 数据漂移检测方法论",
            body: `数据漂移（Data Drift）是 ML 生产系统中最常见的退化原因。当输入数据的统计分布发生变化时，模型的预测性能会随之下降，因为模型是在历史数据分布上训练的。数据漂移分为多种类型：协变量漂移（输入特征分布变化）、概念漂移（输入-输出关系变化）、以及标签漂移（输出分布变化）。

检测数据漂移的统计学方法有很多。对于数值特征，可以使用 Kolmogorov-Smirnov 检验（KS Test）来比较两个分布的差异；对于类别特征，可以使用卡方检验（Chi-Squared Test）；对于高维特征，可以使用最大均值差异（MMD）或 Population Stability Index（PSI）。PSI 是业界最常用的漂移指标之一，PSI < 0.1 表示分布基本稳定，0.1-0.25 表示轻微漂移需要关注，> 0.25 表示显著漂移需要采取行动。

然而，统计显著性不等于业务重要性。一个特征分布的微小变化可能在统计上显著（特别是大数据量时），但对模型预测和业务指标毫无影响。因此，数据漂移检测需要与模型性能监控结合：只有当漂移确实导致模型性能下降时，才需要触发重新训练。这被称为"有意义的漂移"检测。`,
            code: [
                {
                    lang: "python",
                    code: `import numpy as np
from scipy import stats
from typing import Dict, Tuple

class DriftDetector:
    """多维度数据漂移检测器"""
    
    PSI_THRESHOLDS = {
        "stable": 0.1,
        "moderate": 0.25,
    }
    
    @staticmethod
    def compute_psi(expected: np.ndarray, 
                    actual: np.ndarray,
                    n_bins: int = 10) -> float:
        """计算 Population Stability Index"""
        # 基于预期分布构建分箱
        breakpoints = np.linspace(0, 100, n_bins + 1)
        expected_counts = np.percentile(expected, breakpoints)
        
        expected_percents = np.histogram(expected, 
            bins=expected_counts)[0] / len(expected)
        actual_percents = np.histogram(actual, 
            bins=expected_counts)[0] / len(actual)
        
        # 避免除零
        expected_percents = np.clip(expected_percents, 0.0001, None)
        actual_percents = np.clip(actual_percents, 0.0001, None)
        
        psi = np.sum((actual_percents - expected_percents) * 
                     np.log(actual_percents / expected_percents))
        return psi
    
    @staticmethod
    def ks_test(expected: np.ndarray, 
                actual: np.ndarray) -> Tuple[float, float]:
        """Kolmogorov-Smirnov 检验"""
        statistic, p_value = stats.ks_2samp(expected, actual)
        return statistic, p_value
    
    @staticmethod
    def chi_squared_test(expected: np.ndarray,
                         actual: np.ndarray) -> Tuple[float, float]:
        """卡方检验（类别特征）"""
        unique_vals = np.union1d(np.unique(expected), np.unique(actual))
        exp_counts = np.array([(expected == v).sum() for v in unique_vals])
        act_counts = np.array([(actual == v).sum() for v in unique_vals])
        
        # 归一化到相同样本量
        exp_props = exp_counts / exp_counts.sum()
        act_expected = act_counts.sum() * exp_props
        
        statistic, p_value = stats.chisquare(act_counts, 
                                              f_exp=act_expected)
        return statistic, p_value
    
    def detect_feature_drift(self, feature_name: str,
                              reference: np.ndarray,
                              current: np.ndarray,
                              feature_type: str = "numeric") -> Dict:
        """检测单个特征的漂移"""
        result = {
            "feature": feature_name,
            "type": feature_type,
            "drift_detected": False,
            "severity": "none",
        }
        
        if feature_type == "numeric":
            psi = self.compute_psi(reference, current)
            ks_stat, ks_p = self.ks_test(reference, current)
            result["psi"] = round(float(psi), 4)
            result["ks_statistic"] = round(float(ks_stat), 4)
            result["ks_p_value"] = round(float(ks_p), 6)
            
            if psi > self.PSI_THRESHOLDS["moderate"]:
                result["drift_detected"] = True
                result["severity"] = "high"
            elif psi > self.PSI_THRESHOLDS["stable"]:
                result["drift_detected"] = True
                result["severity"] = "medium"
            elif ks_p < 0.01:
                result["drift_detected"] = True
                result["severity"] = "low"
        
        elif feature_type == "categorical":
            chi2_stat, chi2_p = self.chi_squared_test(reference, current)
            result["chi2_statistic"] = round(float(chi2_stat), 4)
            result["chi2_p_value"] = round(float(chi2_p), 6)
            
            if chi2_p < 0.001:
                result["drift_detected"] = True
                result["severity"] = "high"
            elif chi2_p < 0.01:
                result["drift_detected"] = True
                result["severity"] = "medium"
            elif chi2_p < 0.05:
                result["drift_detected"] = True
                result["severity"] = "low"
        
        return result

# 使用示例
detector = DriftDetector()
ref_data = np.random.normal(0, 1, 10000)
curr_data = np.random.normal(0.3, 1.2, 10000)  # 轻微漂移
result = detector.detect_feature_drift(
    "user_age", ref_data, curr_data, "numeric"
)
print(result)`
                }
            ],
            table: {
                headers: ["指标", "适用范围", "阈值建议", "计算复杂度"],
                rows: [
                    ["PSI", "数值/类别", "< 0.1 稳定", "O(n log n)"],
                    ["KS Test", "数值", "p < 0.01 显著", "O(n log n)"],
                    ["卡方检验", "类别", "p < 0.05 显著", "O(n)"],
                    ["MMD", "高维/任意", "需 bootstrap", "O(n^2)"],
                    ["Wasserstein", "数值", "领域特定", "O(n log n)"],
                ]
            },
        },
        {
            title: "3. 模型性能在线监控",
            body: `在生产环境中监控模型性能面临着延迟反馈的挑战。对于推荐系统和广告系统，用户的点击行为可以在几秒到几分钟内提供反馈。但对于信贷审批、医疗诊断等场景，真实标签可能需要数周甚至数月才能获取。这种反馈延迟使得传统的离线评估指标（如准确率、AUC）无法实时计算。

解决反馈延迟的方法有多种。影子模式（Shadow Mode）：将新模型与线上模型并行运行，但不使用新模型的预测结果做决策，而是比较两个模型的预测差异。这种方法可以提前发现模型异常，但不会提供真实标签。代理指标（Proxy Metrics）：使用可快速获取的代理指标替代真实标签，例如用用户的短期行为（页面停留时间、滑动速度）替代长期转化标签。延迟标签对齐：建立一个延迟标签收集管道，当真实标签到达时，将其与历史预测结果对齐，计算延迟的离线指标。

模型性能监控的关键是建立基线（Baseline）和动态阈值。静态阈值（如 AUC > 0.85）容易因为正常波动产生误告警。动态阈值基于历史性能指标的统计特性（如移动平均、标准差），能够区分正常波动和真正的性能下降。常用的动态阈值方法包括：移动平均 + 标准差（如超过 3 个标准差触发告警）、指数加权移动平均（EWMA）、以及 CUSUM（累积和）控制图。`,
            code: [
                {
                    lang: "python",
                    code: `import numpy as np
from collections import deque
from typing import Optional

class OnlineModelMonitor:
    """在线模型性能监控"""
    
    def __init__(self, window_size: int = 1000, 
                 alert_std: float = 3.0):
        self.window_size = window_size
        self.alert_std = alert_std
        
        # 性能指标滑动窗口
        self.metrics_window = deque(maxlen=window_size)
        self.predictions_window = deque(maxlen=window_size)
        
        # 基线统计
        self.baseline_mean: Optional[float] = None
        self.baseline_std: Optional[float] = None
    
    def record_prediction(self, prediction: float, 
                          confidence: float):
        """记录模型预测"""
        self.predictions_window.append({
            "value": prediction,
            "confidence": confidence,
        })
    
    def record_metric(self, metric_value: float):
        """记录性能指标（如准确率、延迟奖励）"""
        self.metrics_window.append(metric_value)
        
        if len(self.metrics_window) >= 30:
            self._update_baseline()
            return self._check_alert()
        return None
    
    def _update_baseline(self):
        """更新动态基线"""
        values = list(self.metrics_window)
        # 使用指数加权移动平均
        weights = np.exp(np.linspace(-1, 0, len(values)))
        weights /= weights.sum()
        self.baseline_mean = np.average(values, weights=weights)
        self.baseline_std = np.std(values[-100:])  # 近期标准差
    
    def _check_alert(self) -> Optional[dict]:
        """检查是否触发告警"""
        if self.baseline_mean is None:
            return None
        
        recent = list(self.metrics_window)[-10:]
        recent_mean = np.mean(recent)
        
        z_score = abs(recent_mean - self.baseline_mean) / (
            self.baseline_std + 1e-8
        )
        
        if z_score > self.alert_std:
            return {
                "alert": True,
                "type": "performance_degradation",
                "z_score": round(float(z_score), 2),
                "baseline": round(float(self.baseline_mean), 4),
                "current": round(float(recent_mean), 4),
                "window_size": len(self.metrics_window),
            }
        return None
    
    def prediction_distribution_stats(self) -> dict:
        """预测分布统计"""
        preds = [p["value"] for p in self.predictions_window]
        if not preds:
            return {}
        return {
            "mean": round(float(np.mean(preds)), 4),
            "std": round(float(np.std(preds)), 4),
            "min": round(float(np.min(preds)), 4),
            "max": round(float(np.max(preds)), 4),
            "p25": round(float(np.percentile(preds, 25)), 4),
            "p50": round(float(np.percentile(preds, 50)), 4),
            "p75": round(float(np.percentile(preds, 75)), 4),
            "count": len(preds),
        }

# 模拟监控流程
monitor = OnlineModelMonitor(window_size=500, alert_std=3.0)
np.random.seed(42)

# 正常阶段
for _ in range(200):
    monitor.record_metric(np.random.normal(0.85, 0.02))

# 性能逐渐下降
for i in range(100):
    degradation = 0.85 - 0.002 * i
    monitor.record_metric(
        np.random.normal(max(degradation, 0.6), 0.03)
    )

alert = monitor.record_metric(0.72)  # 可能触发告警
if alert:
    print(f"ALERT: {alert}")`
                }
            ],
            warning: "告警阈值需要根据业务场景调优。过于敏感的阈值会导致告警疲劳，过于宽松的阈值会错过真正的性能下降。建议从保守的阈值开始，根据历史数据逐步调整。",
        },
        {
            title: "4. 特征服务与数据质量监控",
            body: `特征服务（Feature Store）是 MLOps 架构中的核心组件，它负责特征的存储、共享和一致性管理。但特征服务同时也是数据质量问题的主要来源：训练时使用的特征可能与推理时的特征不一致（训练-服务偏差）、特征计算管道可能因为上游数据源问题而产生错误或延迟、特征的语义可能随着时间推移而悄然改变。

特征监控需要覆盖三个维度。新鲜度（Freshness）：特征数据是否及时更新？如果某个特征的计算管道延迟或失败，模型将使用过时的特征值做预测，这可能导致严重的预测错误。完整性（Completeness）：特征值是否缺失？缺失值的比例是否超过了训练时的水平？一致性（Consistency）：训练环境和推理环境的特征计算逻辑是否一致？同一个特征在不同时间点的计算方式是否相同？

特征血缘（Feature Lineage）是追踪特征质量问题根源的关键工具。它记录了每个特征的来源、计算逻辑、依赖关系和变更记录。当特征质量出现问题时，血缘信息可以帮助快速定位根因：是上游数据源出了问题？是特征计算逻辑被修改了？还是数据存储出现了异常？`,
            code: [
                {
                    lang: "python",
                    code: `from dataclasses import dataclass
from typing import Dict, List, Optional
from datetime import datetime, timedelta

@dataclass
class FeatureMetadata:
    name: str
    type: str               # "numeric", "categorical", "embedding"
    owner: str
    description: str
    source: str             # upstream data source
    computation: str        # computation logic
    freshness_sla: timedelta  # max acceptable staleness
    null_threshold: float   # max acceptable null rate
    version: str = "1.0"

@dataclass
class FeatureHealthCheck:
    feature_name: str
    timestamp: datetime
    freshness: Optional[timedelta] = None
    null_rate: Optional[float] = None
    value_range: Optional[tuple] = None
    is_healthy: bool = True
    issues: List[str] = None
    
    def __post_init__(self):
        if self.issues is None:
            self.issues = []

class FeatureMonitor:
    """特征质量监控系统"""
    
    def __init__(self):
        self.metadata: Dict[str, FeatureMetadata] = {}
        self.health_history: Dict[str, List[FeatureHealthCheck]] = {}
    
    def register_feature(self, meta: FeatureMetadata):
        """注册特征及其元数据"""
        self.metadata[meta.name] = meta
        self.health_history[meta.name] = []
    
    def check_freshness(self, feature_name: str,
                        last_updated: datetime) -> timedelta:
        """检查特征新鲜度"""
        meta = self.metadata[feature_name]
        staleness = datetime.now() - last_updated
        return staleness
    
    def check_feature_health(self, feature_name: str,
                              data_stats: dict) -> FeatureHealthCheck:
        """综合特征健康检查"""
        meta = self.metadata.get(feature_name)
        if not meta:
            return FeatureHealthCheck(
                feature_name=feature_name,
                timestamp=datetime.now(),
                is_healthy=False,
                issues=["Feature not registered"],
            )
        
        check = FeatureHealthCheck(
            feature_name=feature_name,
            timestamp=datetime.now(),
            freshness=data_stats.get("staleness"),
            null_rate=data_stats.get("null_rate"),
            value_range=data_stats.get("value_range"),
        )
        
        # 新鲜度检查
        if check.freshness and check.freshness > meta.freshness_sla:
            check.is_healthy = False
            check.issues.append(
                f"Stale: {check.freshness} > SLA {meta.freshness_sla}"
            )
        
        # 完整性检查
        if check.null_rate is not None:
            if check.null_rate > meta.null_threshold:
                check.is_healthy = False
                check.issues.append(
                    f"Null rate: {check.null_rate:.3f} > "
                    f"threshold {meta.null_threshold:.3f}"
                )
        
        # 值域检查
        if check.value_range and meta.type == "numeric":
            lo, hi = check.value_range
            if hi < lo:
                check.is_healthy = False
                check.issues.append(f"Invalid range: [{lo}, {hi}]")
        
        self.health_history[feature_name].append(check)
        return check
    
    def get_unhealthy_features(self) -> List[str]:
        """获取当前不健康的特征"""
        unhealthy = []
        for name, checks in self.health_history.items():
            if checks and not checks[-1].is_healthy:
                unhealthy.append(name)
        return unhealthy

# 注册特征并检查
monitor = FeatureMonitor()
monitor.register_feature(FeatureMetadata(
    name="user_purchase_history_30d",
    type="numeric",
    owner="data-team",
    description="User purchase count in last 30 days",
    source="transactions_db",
    computation="COUNT(*) FROM transactions WHERE ts > now() - 30d",
    freshness_sla=timedelta(hours=1),
    null_threshold=0.05,
))
print(f"Unhealthy features: {monitor.get_unhealthy_features()}")`
                }
            ],
            table: {
                headers: ["监控维度", "检测内容", "告警条件"],
                rows: [
                    ["新鲜度", "特征更新时间", "超过 SLA 阈值"],
                    ["完整性", "缺失值比例", "超过训练时水平"],
                    ["值域", "最小/最大值", "超出合理范围"],
                    ["分布", "特征分布偏移", "PSI > 0.1"],
                    ["一致性", "训练/推理差异", "差异 > 容忍度"],
                ]
            },
        },
        {
            title: "5. 告警管理与响应流程",
            body: `有效的告警管理是 ML 可观测性的最后一公里。太多的告警会导致告警疲劳（Alert Fatigue），让团队忽略真正重要的信号；太少的告警则可能错过关键问题。设计好的告警体系需要在覆盖率、精确度和可操作性之间找到平衡。

告警分级是基础。P0 级别的告警（如模型服务完全不可用、预测结果全部为 NaN）需要立即响应，通常通过 PagerDuty 或电话通知值班工程师。P1 级别（如性能指标显著下降、数据漂移严重）需要在工作时间内处理。P2 级别（如轻微漂移、非关键特征异常）可以纳入日常工单流程处理。

告警聚合和降噪是关键优化手段。当数据源出现问题时，可能同时触发数十个特征的新鲜度告警和漂移告警。如果不做聚合，值班工程师会被淹没在告警中。告警聚合的思路是：将同一根因触发的多个告警合并为一条综合告警，并附带根因分析。例如，"上游交易数据库延迟" 这一根因可能导致 20 个特征的刷新延迟告警，聚合后只显示一条根因告警，列出受影响的 20 个特征。

响应流程自动化是进阶方向。对于常见的可自动化处理的问题（如回滚到上一个稳定模型版本、切换备用数据源、触发特征重计算），可以设置自动化的响应 Playbook，减少人工介入。`,
            code: [
                {
                    lang: "python",
                    code: `from dataclasses import dataclass
from typing import Dict, List, Optional
from datetime import datetime
from enum import Enum

class AlertSeverity(Enum):
    P0 = "P0 - Immediate"
    P1 = "P1 - Urgent"
    P2 = "P2 - Normal"
    P3 = "P3 - Info"

@dataclass
class Alert:
    id: str
    severity: AlertSeverity
    title: str
    description: str
    source: str           # which monitor triggered
    timestamp: datetime
    root_cause: Optional[str] = None
    affected_models: List[str] = None
    auto_resolved: bool = False
    
    def __post_init__(self):
        if self.affected_models is None:
            self.affected_models = []

class AlertManager:
    """告警管理与响应"""
    
    SEVERITY_CHANNELS = {
        AlertSeverity.P0: ["pagerduty", "phone", "slack-p0"],
        AlertSeverity.P1: ["slack-p1", "email"],
        AlertSeverity.P2: ["slack-p2"],
        AlertSeverity.P3: ["dashboard"],
    }
    
    def __init__(self):
        self.active_alerts: Dict[str, Alert] = {}
        self.alert_history: List[Alert] = []
        self.correlation_rules: List[dict] = []
    
    def receive_alert(self, alert: Alert):
        """接收并处理新告警"""
        # 去重：相同 source 的活跃告警直接更新
        if alert.source in self.active_alerts:
            existing = self.active_alerts[alert.source]
            if alert.severity.value >= existing.severity.value:
                self.active_alerts[alert.source] = alert
            return
        
        # 关联分析：寻找可能的根因
        correlated = self._find_correlations(alert)
        if correlated:
            alert.root_cause = correlated[0].description
            # 将关联告警标记为已解决
            for c in correlated:
                if c.id in self.active_alerts:
                    self.active_alerts[c.id].auto_resolved = True
        
        self.active_alerts[alert.source] = alert
        self._dispatch(alert)
    
    def _find_correlations(self, alert: Alert) -> List[Alert]:
        """查找关联告警"""
        correlated = []
        for existing in self.active_alerts.values():
            # 相同时间窗口内的同类告警
            if (existing.affected_models and alert.affected_models and
                set(existing.affected_models) & set(alert.affected_models)):
                correlated.append(existing)
        return correlated
    
    def _dispatch(self, alert: Alert):
        """分发告警到对应渠道"""
        channels = self.SEVERITY_CHANNELS.get(alert.severity, [])
        print(f"[{alert.severity.value}] {alert.title}")
        print(f"  Channels: {', '.join(channels)}")
        if alert.root_cause:
            print(f"  Root cause: {alert.root_cause}")
        if alert.auto_resolved:
            print(f"  Status: Auto-resolved by correlation")
        print()
    
    def resolve_alert(self, alert_id: str, resolution: str):
        """手动解决告警"""
        if alert_id in self.active_alerts:
            alert = self.active_alerts.pop(alert_id)
            alert.auto_resolved = False
            self.alert_history.append(alert)
            print(f"Resolved: {alert.title} - {resolution}")

# 告警响应 Playbook
PLAYBOOKS = {
    "model_performance_degradation": {
        "steps": [
            "1. Check data drift metrics",
            "2. Compare with last stable version",
            "3. If drift confirmed: trigger retraining pipeline",
            "4. If no drift: check feature freshness",
            "5. If feature stale: restart feature computation",
        ],
        "auto_actions": ["rollback_to_stable_version"],
    },
    "feature_freshness_breach": {
        "steps": [
            "1. Identify affected features",
            "2. Check upstream data source status",
            "3. Restart failed computation pipeline",
            "4. Verify feature values after recovery",
        ],
        "auto_actions": ["restart_feature_pipeline"],
    },
}

print("Alert manager and playbooks initialized")
for name, playbook in PLAYBOOKS.items():
    print(f"  Playbook: {name}")
    for step in playbook["steps"]:
        print(f"    {step}")`
                }
            ],
        },
        {
            title: "6. 可观测性工具链实战",
            body: `ML 可观测性不是单一工具可以解决的问题，而是需要多个工具协同工作。Prometheus + Grafana 是基础设施和服务层监控的事实标准，负责收集和可视化系统指标。MLflow 和 **Weights & Biases** 提供模型实验追踪和性能对比。Evidently AI 和 WhyLabs 专注于 ML 特定的数据漂移和模型质量监控。OpenTelemetry 提供统一的链路追踪标准。

工具链设计的关键原则是：统一的数据模型、灵活的告警路由、以及开放的集成接口。所有监控工具产生的数据应该有一个统一的查询层，让工程师可以用一个界面查看从基础设施到模型性能的全栈指标。告警路由应该支持灵活的规则配置，根据不同的告警类型、严重程度、影响范围路由到不同的响应人和渠道。集成接口应该支持 webhook、API 和消息队列，方便与现有的运维工具链（如 Jira、PagerDuty、Slack）集成。

对于中小型团队，推荐从轻量的开源方案开始：Prometheus + Grafana 做基础设施监控，Evidently 做 ML 特定监控，自定义脚本做告警路由。对于大型团队，可以考虑商业化的 ML 监控平台（如 Arize、Fiddler、WhyLabs），它们提供了开箱即用的漂移检测、根因分析和自动化响应能力。`,
            code: [
                {
                    lang: "yaml",
                    code: `# Prometheus 告警规则配置示例
# prometheus/rules/ml-model-alerts.yml

groups:
  - name: ml-model-monitoring
    rules:
      # 模型推理延迟告警
      - alert: HighModelLatency
        expr: histogram_quantile(0.95, 
          rate(model_inference_latency_seconds_bucket[5m])) > 0.5
        for: 5m
        labels:
          severity: P1
        annotations:
          summary: "Model inference p95 latency > 500ms"
          description: "Service: {{ $labels.service }}, Latency: {{ $value }}s"

      # 模型错误率告警
      - alert: ModelErrorRateHigh
        expr: rate(model_prediction_errors_total[5m]) 
              / rate(model_predictions_total[5m]) > 0.05
        for: 2m
        labels:
          severity: P0
        annotations:
          summary: "Model error rate > 5%"
          description: "Service: {{ $labels.service }}, Rate: {{ $value }}"

      # 预测分布异常告警
      - alert: PredictionDistributionShift
        expr: abs(model_prediction_mean - model_baseline_mean) 
              > 3 * model_baseline_std
        for: 10m
        labels:
          severity: P1
        annotations:
          summary: "Prediction distribution shifted significantly"
          description: "Model: {{ $labels.model_name }}"

  - name: data-quality
    rules:
      # 特征缺失率告警
      - alert: FeatureMissingRateHigh
        expr: feature_missing_ratio > 0.1
        for: 5m
        labels:
          severity: P1
        annotations:
          summary: "Feature missing rate > 10%"
          description: "Feature: {{ $labels.feature_name }}"

      # 特征新鲜度告警
      - alert: FeatureStale
        expr: (time() - feature_last_updated_timestamp) 
              > feature_freshness_sla_seconds
        for: 1m
        labels:
          severity: P2
        annotations:
          summary: "Feature data is stale"
          description: "Feature: {{ $labels.feature_name }}"`
                }
            ],
            table: {
                headers: ["工具", "用途", "类型", "适合团队"],
                rows: [
                    ["Prometheus + Grafana", "系统指标", "开源", "所有规模"],
                    ["Evidently AI", "数据漂移/模型质量", "开源", "中小团队"],
                    ["MLflow", "实验追踪/模型注册", "开源", "所有规模"],
                    ["Arize", "端到端 ML 监控", "商业", "大型团队"],
                    ["WhyLabs", "ML 可观测性平台", "商业/开源", "所有规模"],
                ]
            },
            tip: "不要一开始就追求完美。先从最关键的几个指标开始（服务可用性、预测分布、错误率），逐步扩展监控覆盖范围。可观测性体系是演进而来的，不是设计出来的。",
        },
        {
            title: "7. 构建 ML 可观测性成熟度模型",
            body: `ML 可观测性成熟度可以分为五个等级。等级一（被动响应）：没有系统性监控，问题由用户报告发现，团队被动地排查和修复。等级二（基础监控）：有基本的服务可用性监控（健康检查、延迟、错误率），但没有 ML 特定的监控。等级三（ML 监控）：增加了数据漂移检测、模型性能监控和预测分布跟踪，能够主动发现模型退化。等级四（自动化响应）：监控与自动化响应流程集成，包括自动回滚、自动触发重训练、以及智能告警聚合。等级五（预测性运维）：使用 ML 来监控 ML——预测模型何时会退化、提前触发干预措施，实现预测性的模型生命周期管理。

大多数团队处于等级一到等级二之间。从等级一到等级二的提升相对容易——部署一个监控系统、配置几个关键指标告警。从等级二到等级三需要建立数据质量监控和漂移检测能力，这通常需要一个专门的数据管道来收集和存储推理时的输入数据和预测结果。从等级三到等级四需要深度的流程集成，将监控与 CI/CD 流水线、模型注册表、特征服务等 MLOps 组件打通。

构建 ML 可观测性体系的最大障碍不是技术，而是组织和文化。需要明确的责任分工（谁负责监控、谁负责响应）、持续的投入（监控不是一次性的项目，而是持续的建设）、以及对数据隐私的考虑（推理数据的存储需要符合隐私法规）。`,
            code: [
                {
                    lang: "python",
                    code: `from dataclasses import dataclass
from typing import Dict, List

@dataclass
class MaturityAssessment:
    dimension: str
    level: int  # 1-5
    evidence: str
    gaps: List[str]

class MLOpsObservabilityMaturityModel:
    """ML 可观测性成熟度评估"""
    
    DIMENSIONS = [
        "infrastructure_monitoring",
        "model_performance_tracking",
        "data_quality_monitoring",
        "drift_detection",
        "alert_management",
        "automated_response",
        "predictive_operations",
    ]
    
    LEVEL_DESCRIPTIONS = {
        1: "Reactive - 用户报告驱动的问题发现",
        2: "Basic - 基础服务可用性监控",
        3: "ML-Aware - ML 特定的数据和模型监控",
        4: "Automated - 监控与自动化响应集成",
        5: "Predictive - 预测性运维",
    }
    
    def __init__(self):
        self.assessments: Dict[str, MaturityAssessment] = {}
    
    def assess(self, dimension: str, level: int,
               evidence: str, gaps: List[str]):
        self.assessments[dimension] = MaturityAssessment(
            dimension=dimension,
            level=max(1, min(5, level)),
            evidence=evidence,
            gaps=gaps,
        )
    
    def overall_level(self) -> int:
        if not self.assessments:
            return 0
        # 木桶原理：整体水平由最短板决定
        return min(a.level for a in self.assessments.values())
    
    def roadmap(self) -> List[str]:
        """生成改进路线图"""
        steps = []
        for dim in self.DIMENSIONS:
            assessment = self.assessments.get(dim)
            if not assessment:
                steps.append(f"[TODO] Assess: {dim}")
                continue
            if assessment.level < 5:
                next_level = assessment.level + 1
                steps.append(
                    f"[P{next_level}] {dim}: {assessment.level} -> {next_level} "
                    f"({self.LEVEL_DESCRIPTIONS[next_level]})"
                )
                for gap in assessment.gaps:
                    steps.append(f"       Action: {gap}")
        return steps
    
    def report(self) -> str:
        report = "\\n" + "=" * 60 + "\\n"
        report += f"ML Observability Maturity Assessment\\n"
        report += f"Overall Level: {self.overall_level()}/5\\n"
        report += f"{'='*60}\\n\\n"
        
        for dim in self.DIMENSIONS:
            a = self.assessments.get(dim)
            level_str = f"[{'█' * (a.level)}{'░' * (5 - a.level)}]"
            report += f"{dim.replace('_', ' ').title()}\\n"
            report += f"  {level_str} Level {a.level}/5\\n"
            report += f"  Evidence: {a.evidence}\\n"
            if a.gaps:
                report += f"  Gaps: {'; '.join(a.gaps)}\\n"
            report += "\\n"
        
        report += "--- Improvement Roadmap ---\\n"
        for step in self.roadmap():
            report += f"  {step}\\n"
        
        return report

# 示例评估
model = MLOpsObservabilityMaturityModel()
model.assess("infrastructure_monitoring", 4, 
    "Prometheus + Grafana 覆盖全部服务",
    ["Add SLO tracking"])
model.assess("model_performance_tracking", 2,
    "仅有离线评估，无在线监控",
    ["Deploy online metrics", "Set up prediction logging"])
model.assess("data_quality_monitoring", 1,
    "无系统化的数据质量检查",
    ["Implement feature freshness checks",
     "Add null rate monitoring"])
model.assess("drift_detection", 1,
    "没有漂移检测机制",
    ["Set up PSI/KS monitoring",
     "Configure drift alerts"])
model.assess("alert_management", 3,
    "有基础告警，但存在告警疲劳",
    ["Implement alert correlation",
     "Define severity-based routing"])
model.assess("automated_response", 1,
    "所有响应都是手动的",
    ["Create response playbooks",
     "Auto-rollback capability"])
model.assess("predictive_operations", 1,
    "没有预测性运维能力",
    ["Start collecting degradation patterns"])

print(model.report())`
                }
            ],
            warning: "可观测性建设是一个持续的过程，不是一次性的项目。每季度重新评估成熟度，制定下一季度的改进目标，逐步提升可观测性水平。",
        },
        {
            title: "架构图示",
            mermaid: `graph TD
    A["概述"] --> B["原理"]
    B --> C["实现"]
    C --> D["应用"]
    D --> E["总结"]`,
        },
    ],
};
