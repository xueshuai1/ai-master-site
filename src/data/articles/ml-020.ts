import { Article } from '../knowledge';

export const article: Article = {
    id: "ml-020",
    title: "异常检测：识别数据中的离群点",
    category: "ml",
    tags: ["异常检测", "离群点", "无监督"],
    summary: "从 Isolation Forest 到 One-Class SVM，掌握异常检测技术",
    date: "2026-04-12",
    readTime: "18 min",
    level: "进阶",
    content: [
        {
            title: "1. 异常检测的任务定义与应用场景",
            body: `异常检测（Anomaly Detection），也叫离群点检测（Outlier Detection），是机器学习中一类无监督学习任务。其核心目标是识别数据集中与大多数样本显著不同的异常观测。这些"异常"往往不是噪声，而是真正有意义的稀有事件——信用卡欺诈交易、工业设备故障的早期信号、网络入侵流量，甚至罕见疾病的临床指标。

**异常检测的难点在于**：异常样本极其稀少（可能不到 0.1%），且我们通常没有异常标签可供监督学习。因此，异常检测算法必须能够在无标签的条件下，仅基于正常数据的分布特征来判定什么是"异常"。

从技术角度看，异常检测可以分为三类方法：基于统计的方法（假设正常数据服从某种概率分布）、基于距离/密度的方法（异常点远离高密度区域）和基于模型的方法（学习正常数据的表示，无法被良好表示的即为异常）。理解每种方法的假设和适用场景，是选择正确算法的关键。`,
            code: [
                {
                    lang: "python",
                    code: `import numpy as np
import matplotlib.pyplot as plt

# 模拟正常数据和异常点
np.random.seed(42)
n_normal = 500
n_outliers = 15

# 正常数据：二维高斯分布
normal = np.random.randn(n_normal, 2) * 0.5 + np.array([2, 3])

# 异常点：来自不同分布
outliers = np.random.uniform(low=-2, high=8, size=(n_outliers, 2))

plt.figure(figsize=(8, 6))
plt.scatter(normal[:, 0], normal[:, 1], c='steelblue', alpha=0.6, label='Normal')
plt.scatter(outliers[:, 0], outliers[:, 1], c='red', marker='x', s=100, label='Outlier')
plt.xlabel('Feature 1')
plt.ylabel('Feature 2')
plt.legend()
plt.title('Anomaly Detection: Finding Needles in a Haystack')
plt.show()`,
                },
                {
                    lang: "python",
                    code: `from sklearn.datasets import make_classification
from sklearn.model_selection import train_test_split

def generate_anomaly_dataset(n_samples=1000, contamination=0.05):
    """生成带有异常样本的分类数据集"""
    n_outliers = int(n_samples * contamination)
    n_inliers = n_samples - n_outliers

    # 正常样本
    inliers = np.random.randn(n_inliers, 2) * 0.3 + np.array([0, 0])

    # 异常样本（远离中心）
    angle = np.random.uniform(0, 2 * np.pi, n_outliers)
    radius = np.random.uniform(3, 6, n_outliers)
    outliers = np.column_stack([radius * np.cos(angle), radius * np.sin(angle)])

    X = np.vstack([inliers, outliers])
    y = np.array([0] * n_inliers + [1] * n_outliers)  # 1 = anomaly

    return X, y

X, y = generate_anomaly_dataset(n_samples=2000, contamination=0.03)
print(f"正常样本: {np.sum(y == 0)}, 异常样本: {np.sum(y == 1)}")
print(f"污染率: {np.mean(y):.4f}")`,
                },
            ],
            table: {
                headers: ["应用领域", "正常数据", "异常数据", "检测目标"],
                rows: [
                    ["金融欺诈", "合法交易", "盗刷/洗钱", "保护用户资金安全"],
                    ["工业监控", "设备正常运行数据", "故障前兆信号", "预测性维护"],
                    ["网络安全", "正常网络流量", "入侵/DDoS 攻击", "实时威胁检测"],
                    ["医疗健康", "健康指标", "罕见病/异常体征", "早期疾病筛查"],
                    ["数据清洗", "有效数据记录", "传感器故障/录入错误", "提高数据质量"],
                ],
            },
            mermaid: `graph TD
    A["数据输入"] --> B{"异常检测方法"}
    B --> C["基于统计"]
    B --> D["基于距离/密度"]
    B --> E["基于模型"]
    C --> F["Z-Score / Grubbs"]
    D --> G["LOF / DBSCAN"]
    E --> H["Isolation Forest"]
    E --> I["One-Class SVM"]
    E --> J["AutoEncoder"]
    F --> K["异常得分"]
    G --> K
    H --> K
    I --> K
    J --> K
    K --> L["阈值判定"]
    L --> M["正常"]
    L --> N["异常"]`,
            tip: "选择异常检测方法时，先问三个问题：数据维度高低？异常比例多少？需要可解释性还是只需检测精度？这三个问题会迅速缩小候选算法范围。",
            warning: "异常检测没有标准答案。同一个样本在业务 A 中是异常，在业务 B 中可能是正常。务必与领域专家确认检测结果的合理性。",
        },
        {
            title: "2. 统计方法：Z-Score 与 Grubbs 检验",
            body: `基于统计的异常检测是最经典的方法之一，其基本假设是：正常数据服从某种已知的概率分布（通常是正态分布），偏离该分布的极端观测即为异常。

Z-Score 方法是最直观的实现：对每个数据点计算其距离均值的标准差倍数。Z-Score 超过 3（即超过 3σ）的点被认为是异常，因为根据正态分布的性质，99.7% 的数据应落在 3σ 范围内。这种方法计算简单、速度快，但只适用于低维数据且对分布假设敏感。

Grubbs 检验是 Z-Score 的统计推断版本，它不仅计算偏离程度，还给出统计显著性。其检验统计量 G = max|xᵢ - x̄| / s，在给定显著性水平 α 下与临界值比较。Grubbs 检验可以迭代使用，每次移除最异常的点后重新检验。

**统计方法的局限在于**：多维数据中很难假设联合分布形式；真实数据往往不服从完美的正态分布；高维情况下"维度诅咒"使得距离度量失效。因此统计方法更适合低维（1-3 维）、分布近似正态的数据。`,
            code: [
                {
                    lang: "python",
                    code: `import numpy as np
from scipy import stats

def zscore_anomaly_detection(data, threshold=3.0):
    """基于 Z-Score 的异常检测"""
    z_scores = np.abs(stats.zscore(data))
    anomalies = np.where(z_scores > threshold)[0]
    return anomalies, z_scores

# 一维示例
data = np.random.randn(1000) * 10 + 50
# 注入 5 个异常值
data[[100, 250, 500, 750, 900]] = [200, -50, 150, -30, 180]

anomalies, scores = zscore_anomaly_detection(data, threshold=3.0)
print(f"检测到 {len(anomalies)} 个异常点")
print(f"异常索引: {anomalies}")
print(f"异常值: {data[anomalies]}")
print(f"对应 Z-Score: {scores[anomalies]:.2f}")`,
                },
                {
                    lang: "python",
                    code: `from scipy import stats
import numpy as np

def grubbs_test(data, alpha=0.05):
    """Grubbs 检验：迭代检测最极端异常值"""
    n = len(data)
    results = []

    while n > 3:  # 至少保留 3 个样本
        mean = np.mean(data)
        std = np.std(data, ddof=1)
        if std == 0:
            break

        # 找到最偏离的点
        deviations = np.abs(data - mean)
        idx = np.argmax(deviations)
        G = deviations[idx] / std

        # 临界值（基于 t 分布）
        t_crit = stats.t.ppf(1 - alpha / (2 * n), n - 2)
        G_crit = ((n - 1) / np.sqrt(n)) * np.sqrt(t_crit  2 / (n - 2 + t_crit  2))

        if G > G_crit:
            results.append({
                "index": idx, "value": data[idx],
                "G_statistic": G, "G_critical": G_crit,
                "significant": True
            })
            data = np.delete(data, idx)
            n -= 1
        else:
            break

    return results

# 测试
np.random.seed(42)
sample = np.random.randn(50) * 5 + 100
sample[10] = 200
sample[30] = -50

outliers = grubbs_test(sample, alpha=0.01)
for o in outliers:
    print(f"异常值: {o['value']:.1f} (G={o['G_statistic']:.3f} > {o['G_critical']:.3f})")`,
                },
            ],
            table: {
                headers: ["方法", "假设", "维度", "计算复杂度", "适用场景"],
                rows: [
                    ["Z-Score", "正态分布", "1-3 维", "O(n)", "快速筛查，低维数据"],
                    ["Grubbs 检验", "正态分布", "1 维", "O(n*k)", "统计显著的异常判定"],
                    ["Modified Z-Score", "近似对称分布", "1-3 维", "O(n)", "含多个异常值的稳健检测"],
                    ["IQR 方法", "无分布假设", "1 维", "O(n)", "箱线图异常检测"],
                ],
            },
            mermaid: `graph LR
    A["输入数据"] --> B["计算均值和标准差"]
    B --> C["计算每个点的 Z-Score"]
    C --> D{"|Z| > 3?"}
    D -->|是| E["标记为异常"]
    D -->|否| F["标记为正常"]
    E --> G["迭代: 移除异常点"]
    G --> B
    F --> H["输出结果"]`,
            tip: "Modified Z-Score 使用 median 和 MAD（中位数绝对偏差）替代 mean 和 std，对异常值更鲁棒。当数据中异常比例超过 5% 时，优先使用 Modified Z-Score。",
            warning: "统计方法严重依赖分布假设。如果数据不服从正态分布（比如偏态分布、多峰分布），Z-Score 的 3σ 准则会给出大量误报。务必先做分布检验（Shapiro-Wilk / K-S 检验）。",
        },
        {
            title: "3. Isolation Forest：隔离森林算法",
            body: `Isolation Forest（iForest）是异常检测领域最流行、最高效的算法之一，由 Liu 等人在 2008 年提出。它的核心思想极其巧妙：异常样本"少而不同"，因此它们更容易被随机划分的超平面隔离。

算法通过构建多棵隔离树（iTree）来实现。每棵树的构建过程是：从训练样本中随机抽取子样本，然后在特征空间中随机选择一个特征和一个分割值，将样本分成两部分，递归进行直到每个样本被单独隔离或达到最大深度。异常点的隔离路径更短（因为它们"容易"被分开），正常点需要更多次划分。

最终，每个样本的异常得分由其平均路径长度决定：路径越短，异常得分越高。Isolation Forest 的优势在于：不需要对数据分布做任何假设、对高维数据友好、计算效率高（O(n log n)）、且对线性可分的复杂异常模式有效。

在 sklearn 中，IsolationForest 的实现还支持 contamination 参数（预先指定异常比例）和 max_samples（子采样大小），使其在大数据集上依然高效。`,
            code: [
                {
                    lang: "python",
                    code: `from sklearn.ensemble import IsolationForest
from sklearn.datasets import make_blobs
import numpy as np

# 生成测试数据
X, _ = make_blobs(n_samples=500, centers=1, cluster_std=0.5, random_state=42)
# 添加异常点
outliers_X = np.random.uniform(low=-6, high=6, size=(25, 2))
X_all = np.vstack([X, outliers_X])

# Isolation Forest
iso_forest = IsolationForest(
    n_estimators=100,
    contamination=0.05,
    max_samples='auto',
    random_state=42
)
iso_forest.fit(X_all)

# 预测：-1 为异常，1 为正常
predictions = iso_forest.predict(X_all)
scores = iso_forest.decision_function(X_all)

n_anomalies = np.sum(predictions == -1)
print(f"检测到 {n_anomalies} 个异常点")
print(f"异常得分范围: [{scores.min():.4f}, {scores.max():.4f}]")

# 查看异常点的平均路径长度
print(f"平均路径长度: {iso_forest.decision_function(X_all).mean():.4f}")`,
                },
                {
                    lang: "python",
                    code: `import numpy as np

class IsolationTree:
    """单棵隔离树的简化实现"""

    def __init__(self, height_limit):
        self.height_limit = height_limit
        self.split_feature = None
        self.split_value = None
        self.left = None
        self.right = None
        self.size = 0
        self.is_leaf = False

    def fit(self, X, height=0):
        self.size = len(X)

        if height >= self.height_limit or len(X) <= 1:
            self.is_leaf = True
            return self

        n_features = X.shape[1]
        self.split_feature = np.random.randint(0, n_features)
        f_min, f_max = X[:, self.split_feature].min(), X[:, self.split_feature].max()

        if f_min == f_max:
            self.is_leaf = True
            return self

        self.split_value = np.random.uniform(f_min, f_max)

        left_mask = X[:, self.split_feature] < self.split_value
        self.left = IsolationTree(self.height_limit)
        self.right = IsolationTree(self.height_limit)
        self.left.fit(X[left_mask], height + 1)
        self.right.fit(X[~left_mask], height + 1)
        return self

    def path_length(self, x, height=0):
        if self.is_leaf:
            return height + _c(self.size)
        if x[self.split_feature] < self.split_value:
            return self.left.path_length(x, height + 1)
        return self.right.path_length(x, height + 1)

def _c(n):
    """二叉搜索树平均路径长度估计"""
    if n <= 1:
        return 0
    if n == 2:
        return 1
    return 2.0 * (np.log(n - 1) + 0.5772156649) - 2.0 * (n - 1) / n`,
                },
            ],
            table: {
                headers: ["参数", "默认值", "影响", "调优建议"],
                rows: [
                    ["n_estimators", "100", "树的数量，越多越稳定", "100-500，通常 100 足够"],
                    ["max_samples", "256", "每棵树的子采样大小", "256-1024，大数据集可增大"],
                    ["contamination", "auto", "预估异常比例", "根据领域知识设定 0.01-0.1"],
                    ["max_features", "全部", "每棵树使用的特征数", "高维数据时可子采样特征"],
                    ["bootstrap", "False", "是否有放回抽样", "通常保持 False"],
                ],
            },
            mermaid: `graph TD
    A["全部数据"] --> B["随机子采样 256 个"]
    B --> C["随机选特征 f"]
    C --> D["随机选分割值 v"]
    D --> E{f < v?}
    E -->|左子树| F["继续递归划分"]
    E -->|右子树| G["继续递归划分"]
    F --> H["达到叶节点"]
    G --> H
    H --> I["记录路径长度 h(x)"]
    I --> J["构建 100 棵树"]
    J --> K["平均路径长度 E[h(x)]"]
    K --> L["异常得分 s(x,n)"]`,
            tip: "Isolation Forest 的 max_samples 默认 256 是经验值。论文证明：对于检测全局异常，子采样 256 个样本已经足够。增大它不一定提升效果，但会增加计算成本。",
            warning: "Isolation Forest 对局部异常（locally anomalous）的检测能力有限。如果异常点聚集在一起形成小簇，它们可能在隔离树中表现出类似正常点的路径长度。此时应考虑 LOF。",
        },
        {
            title: "4. One-Class SVM：单类支持向量机",
            body: `One-Class SVM 是 Scholkopf 等人在 2001 年提出的无监督异常检测算法。与标准 SVM 学习两类之间的分类边界不同，One-Class SVM 的目标是学习一个能够"包围"正常数据的紧凑边界。

**算法的核心思想是**：在高维特征空间中，找到一个超平面能够将正常数据点与原点尽可能分开。通过核技巧（通常是 RBF 核），算法可以在原始空间中学习到一个非线性的决策边界。落在边界之外的样本被判定为异常。

One-Class SVM 有两个关键参数：nu（控制异常比例的上界和支持向量的比例下界）和 gamma（RBF 核的宽度参数，控制决策边界的复杂度）。nu 是更直观的参数——如果设为 0.05，则算法会将大约 5% 的训练样本判定为异常。

与 Isolation Forest 相比，One-Class SVM 在中小规模数据集上往往精度更高，特别是在正常数据的边界形状复杂时。但它对 gamma 参数极其敏感，且在大数据集上计算成本较高（O(n²) 到 O(n³)）。`,
            code: [
                {
                    lang: "python",
                    code: `from sklearn.svm import OneClassSVM
from sklearn.preprocessing import StandardScaler
import numpy as np

# 生成正常训练数据（训练时不应包含异常样本）
np.random.seed(42)
X_train = np.random.randn(500, 2) * 0.5

# 标准化（OC-SVM 对尺度敏感）
scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)

# 训练 One-Class SVM
oc_svm = OneClassSVM(
    kernel='rbf',
    gamma='auto',
    nu=0.05  # 期望的异常比例
)
oc_svm.fit(X_train_scaled)

# 测试数据（含异常点）
X_test = np.random.randn(100, 2) * 0.5
X_test = np.vstack([X_test, np.random.uniform(-3, 3, (10, 2))])
X_test_scaled = scaler.transform(X_test)

predictions = oc_svm.predict(X_test_scaled)
scores = oc_svm.decision_function(X_test_scaled)

print(f"正常点: {np.sum(predictions == 1)}, 异常点: {np.sum(predictions == -1)}")
print(f"支持向量数量: {np.sum(oc_svm.n_support_)}")
print(f"决策函数范围: [{scores.min():.4f}, {scores.max():.4f}]")`,
                },
                {
                    lang: "python",
                    code: `from sklearn.svm import OneClassSVM
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import GridSearchCV
import numpy as np

# 使用已标注的异常数据进行参数搜索（半监督设置）
np.random.seed(42)
X_normal = np.random.randn(300, 2) * 0.5
X_anomaly = np.random.uniform(-3, 3, (15, 2))
X = np.vstack([X_normal, X_anomaly])
y = np.array([1] * 300 + [-1] * 15)  # 1=正常, -1=异常

scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

# 网格搜索最优参数
param_grid = {
    'nu': [0.01, 0.05, 0.1],
    'gamma': [0.01, 0.1, 1.0, 'auto', 'scale']
}

from sklearn.metrics import f1_score

best_score = 0
best_params = None

for nu in param_grid['nu']:
    for gamma in param_grid['gamma']:
        model = OneClassSVM(kernel='rbf', nu=nu, gamma=gamma)
        model.fit(X_scaled[:300])  # 仅用正常数据训练

        preds = model.predict(X_scaled)
        score = f1_score(y, preds, pos_label=-1)  # 以异常为正类

        if score > best_score:
            best_score = score
            best_params = {'nu': nu, 'gamma': gamma}

print(f"最优参数: {best_params}")
print(f"最优 F1 (异常类): {best_score:.4f}")`,
                },
            ],
            table: {
                headers: ["核函数", "决策边界形状", "适用场景", "计算复杂度"],
                rows: [
                    ["RBF (径向基)", "非线性、灵活", "大多数场景，推荐默认", "O(n²) ~ O(n³)"],
                    ["Linear", "超平面", "高维线性可分", "O(n)"],
                    ["Polynomial", "多项式曲面", "已知多项式关系", "O(n²) ~ O(n³)"],
                    ["Sigmoid", "类神经网络边界", "特定领域", "O(n²) ~ O(n³)"],
                ],
            },
            mermaid: `graph TD
    A["正常训练数据"] --> B["标准化处理"]
    B --> C["RBF 核映射到高维空间"]
    C --> D["寻找最优超平面"]
    D --> E["最大化正常数据与原点的间隔"]
    E --> F["学习决策边界"]
    F --> G["新样本映射到同一空间"]
    G --> H{"在边界内?"}
    H -->|是| I["判定为正常"]
    H -->|否| J["判定为异常"]
    I --> K["decision_function > 0"]
    J --> L["decision_function < 0"]`,
            tip: "nu 参数的物理含义很清晰：它是异常比例的上界，也是支持向量比例的下界。如果你的数据中异常约占 3%，nu 设为 0.03 到 0.05 是一个合理的起点。",
            warning: "One-Class SVM 对 gamma 极其敏感。gamma 太大 → 决策边界过度拟合正常数据（大量正常点被判为异常）；gamma 太小 → 边界过于宽松（异常点无法被检测）。务必用网格搜索或基于领域知识仔细调参。",
        },
        {
            title: "5. Local Outlier Factor (LOF)：局部离群因子",
            body: `Local Outlier Factor（LOF）是 Breunig 等人在 2000 年提出的基于密度的异常检测算法。与全局方法不同，LOF 的核心洞察是：异常是局部概念——一个点是否异常，取决于它与其邻居的密度对比。

LOF 的计算分为四步：首先计算每个点的 k 距离（到第 k 近邻的距离），然后计算可达距离（考虑密度差异的距离度量），接着计算局部可达密度（LRD，可达距离的倒数），最后计算 LOF 分数（该点邻居的平均 LRD 除以该点自身的 LRD）。

LOF 分数的含义很直观：LOF ≈ 1 说明该点的密度与其邻居相似，是正常点；LOF >> 1 说明该点的密度远低于邻居，是异常点；LOF < 1 说明该点密度高于邻居，位于密集区域内部。

LOF 的最大优势是能够检测"局部异常"——即相对于局部环境而言的异常点，即使该点在全局范围内并不极端。但它的计算复杂度较高（O(n²)），且 k 值的选择对结果影响显著。`,
            code: [
                {
                    lang: "python",
                    code: `from sklearn.neighbors import LocalOutlierFactor
import numpy as np

# 创建局部异常场景：两个密度不同的簇
np.random.seed(42)
# 密集簇
dense_cluster = np.random.randn(200, 2) * 0.3 + np.array([0, 0])
# 稀疏簇
sparse_cluster = np.random.randn(100, 2) * 1.0 + np.array([5, 5])
# 稀疏簇中的异常点
local_outlier = np.array([[5.0, 5.0], [5.2, 4.8], [4.8, 5.2]])

X = np.vstack([dense_cluster, sparse_cluster, local_outlier])

# LOF 检测
lof = LocalOutlierFactor(
    n_neighbors=20,
    contamination=0.02,
    metric='minkowski',
    novelty=False  # 训练和检测同时进行
)
predictions = lof.fit_predict(X)
scores = lof.negative_outlier_factor_

print(f"检测到 {np.sum(predictions == -1)} 个异常点")
print(f"LOF 分数范围: [{scores.min():.4f}, {scores.max():.4f}]")
print(f"异常点的 LOF 分数: {scores[predictions == -1]}")`,
                },
                {
                    lang: "python",
                    code: `import numpy as np
from sklearn.neighbors import NearestNeighbors

def compute_lof(X, k=20):
    """LOF 算法的简化实现"""
    n = len(X)

    # 1. 计算 k 近邻
    nn = NearestNeighbors(n_neighbors=k + 1)
    nn.fit(X)
    distances, indices = nn.kneighbors(X)

    # 排除自身（第一个邻居是自己）
    k_distances = distances[:, k]  # k 距离
    neighborhoods = indices[:, 1:]  # k 个邻居

    # 2. 计算可达距离
    reach_dist = np.zeros((n, n))
    for i in range(n):
        for j in neighborhoods[i]:
            actual_dist = np.linalg.norm(X[i] - X[j])
            reach_dist[i, j] = max(k_distances[j], actual_dist)

    # 3. 计算局部可达密度
    lrd = np.zeros(n)
    for i in range(n):
        avg_reach_dist = np.mean([reach_dist[i, j] for j in neighborhoods[i]])
        lrd[i] = 1.0 / max(avg_reach_dist, 1e-10)

    # 4. 计算 LOF 分数
    lof_scores = np.zeros(n)
    for i in range(n):
        neighbor_lrd = np.mean([lrd[j] for j in neighborhoods[i]])
        lof_scores[i] = neighbor_lrd / max(lrd[i], 1e-10)

    return lof_scores

# 测试
np.random.seed(42)
X_test = np.vstack([
    np.random.randn(100, 2) * 0.5,
    np.array([[3, 3], [3.5, 3.5]])
])
scores = compute_lof(X_test, k=10)
anomalies = np.where(scores > 2.0)[0]
print(f"异常索引: {anomalies}, LOF 分数: {scores[anomalies]}")`,
                },
            ],
            table: {
                headers: ["参数", "含义", "影响", "调优建议"],
                rows: [
                    ["n_neighbors (k)", "邻域大小", "太小 → 噪声敏感；太大 → 掩盖局部异常", "20 是好的起点，尝试 10-50"],
                    ["contamination", "预估异常比例", "影响判定阈值", "根据领域知识设定"],
                    ["metric", "距离度量", "影响邻居关系", "欧式距离（minkowski p=2）最常用"],
                    ["novelty", "是否新异模式", "True 时可检测新数据", "半监督场景设为 True"],
                ],
            },
            mermaid: `graph TD
    A["输入数据 X"] --> B["对每个点 x 计算 k 近邻"]
    B --> C["计算 k 距离 kd(x)"]
    C --> D["计算可达距离 reach-dist(x,y)"]
    D --> E["计算局部可达密度 lrd(x)"]
    E --> F["LOF(x) = mean(lrd(邻居)) / lrd(x)"]
    F --> G{"LOF >> 1?"}
    G -->|是| H["局部异常"]
    G -->|≈ 1| I["正常点"]
    G -->|< 1| J["密度高于邻居"]`,
            tip: "LOF 的 k 值选择有一个实用技巧：绘制 k 距离图（按距离排序），找到肘点 elbow point，这通常是一个合理的 k 值。k 值过小受噪声影响大，过大则掩盖局部异常。",
            warning: "LOF 的计算复杂度是 O(n²)，在大数据集（n > 10000）上非常慢。如果数据量大，先用 Isolation Forest 做粗筛，再用 LOF 对候选异常点做精细分析。",
        },
        {
            title: "6. 深度异常检测：AutoEncoder 方法",
            body: `基于深度学习的异常检测利用神经网络的表示学习能力，其中最主流的方法是 AutoEncoder（自编码器）。AutoEncoder 由编码器（Encoder）和解码器（Decoder）组成，编码器将输入压缩为低维隐表示，解码器从隐表示重建原始输入。

**异常检测的逻辑很简单**：用正常数据训练 AutoEncoder，使其学会准确重建正常模式。当输入异常数据时，由于 AutoEncoder 从未见过这种模式，重建误差会显著增大。因此，重建误差可以直接作为异常得分。

**深度方法的优势在于**：自动学习复杂的非线性特征表示，不需要手工设计特征；能够处理高维数据（如图像、文本、时间序列）；通过不同架构（VAE、LSTM-AE、Convolutional AE）可以适配不同类型的数据。

但深度方法也有明显缺点：需要大量正常数据来训练；训练成本高；重建误差不一定是好的异常得分（某些简单但异常的样本可能被很好地重建）；模型的可解释性差。`,
            code: [
                {
                    lang: "python",
                    code: `import torch
import torch.nn as nn
import torch.optim as optim
import numpy as np

class AnomalyAutoEncoder(nn.Module):
    """用于异常检测的自编码器"""

    def __init__(self, input_dim, hidden_dim=64, latent_dim=16):
        super().__init__()
        self.encoder = nn.Sequential(
            nn.Linear(input_dim, hidden_dim),
            nn.ReLU(),
            nn.Linear(hidden_dim, hidden_dim // 2),
            nn.ReLU(),
            nn.Linear(hidden_dim // 2, latent_dim)
        )
        self.decoder = nn.Sequential(
            nn.Linear(latent_dim, hidden_dim // 2),
            nn.ReLU(),
            nn.Linear(hidden_dim // 2, hidden_dim),
            nn.ReLU(),
            nn.Linear(hidden_dim, input_dim)
        )

    def forward(self, x):
        z = self.encoder(x)
        x_recon = self.decoder(z)
        return x_recon

    def anomaly_score(self, x):
        """计算重建误差作为异常得分"""
        x_recon = self(x)
        return torch.mean((x - x_recon) ** 2, dim=1)

# 训练示例
model = AnomalyAutoEncoder(input_dim=10)
optimizer = optim.Adam(model.parameters(), lr=0.001)
criterion = nn.MSELoss()

# 仅用正常数据训练
X_normal = torch.randn(500, 10)
for epoch in range(100):
    optimizer.zero_grad()
    recon = model(X_normal)
    loss = criterion(recon, X_normal)
    loss.backward()
    optimizer.step()
    if (epoch + 1) % 20 == 0:
        print(f"Epoch {epoch+1}, Loss: {loss.item():.6f}")`,
                },
                {
                    lang: "python",
                    code: `import numpy as np
from sklearn.preprocessing import StandardScaler

class DeepAnomalyDetector:
    """完整的深度异常检测流程"""

    def __init__(self, input_dim, threshold_percentile=95):
        self.input_dim = input_dim
        self.threshold_percentile = threshold_percentile
        self.model = AnomalyAutoEncoder(input_dim)
        self.scaler = StandardScaler()
        self.threshold = None

    def fit(self, X_normal):
        """仅用正常数据训练"""
        X_scaled = self.scaler.fit_transform(X_normal)
        X_tensor = torch.FloatTensor(X_scaled)

        optimizer = optim.Adam(self.model.parameters(), lr=0.001, weight_decay=1e-5)
        criterion = nn.MSELoss()

        # 训练
        for epoch in range(200):
            optimizer.zero_grad()
            recon = self.model(X_tensor)
            loss = criterion(recon, X_tensor)
            loss.backward()
            optimizer.step()

        # 在训练集上设定阈值
        train_errors = self.model.anomaly_score(X_tensor).detach().numpy()
        self.threshold = np.percentile(train_errors, self.threshold_percentile)
        print(f"异常阈值 (P{self.threshold_percentile}): {self.threshold:.6f}")

    def predict(self, X):
        """检测新数据中的异常"""
        X_scaled = self.scaler.transform(X)
        X_tensor = torch.FloatTensor(X_scaled)
        scores = self.model.anomaly_score(X_tensor).detach().numpy()
        return (scores > self.threshold).astype(int), scores

# 使用示例
detector = DeepAnomalyDetector(input_dim=10, threshold_percentile=95)
X_train = np.random.randn(1000, 10)
detector.fit(X_train)

X_test = np.vstack([np.random.randn(50, 10), np.random.uniform(-5, 5, (5, 10))])
preds, scores = detector.predict(X_test)
print(f"检测到 {preds.sum()} 个异常点")`,
                },
            ],
            table: {
                headers: ["架构", "特点", "适用数据类型", "异常得分"],
                rows: [
                    ["Vanilla AE", "标准编解码器", "表格数据", "MSE 重建误差"],
                    ["VAE (变分)", "概率建模，隐变量有分布", "表格/图像", "重建误差 + KL 散度"],
                    ["LSTM-AE", "时序编解码器", "时间序列", "时序重建误差"],
                    ["Convolutional AE", "卷积编解码器", "图像数据", "像素级重建误差"],
                    ["GAN-based (AnoGAN)", "生成对抗网络", "高维复杂数据", "判别器分数 + 重建误差"],
                ],
            },
            mermaid: `graph LR
    A["正常数据输入"] --> B["编码器 Encoder"]
    B --> C["低维隐表示 z"]
    C --> D["解码器 Decoder"]
    D --> E["重建输出 x'"]
    E --> F["计算重建误差 ||x - x'||²"]
    F --> G{"误差 > 阈值?"}
    G -->|是| H["异常"]
    G -->|否| I["正常"]
    C -.->|隐空间可视化| J["t-SNE / PCA 降维"]`,
            tip: "AutoEncoder 的隐层维度是关键的超参数。太大 → 模型可能记住输入（包括噪声），重建误差对异常不敏感；太小 → 正常数据也无法被很好地重建。建议从输入维度的 1/4 到 1/10 开始尝试。",
            warning: "用 AutoEncoder 做异常检测时，训练数据必须尽可能纯净（不含异常样本）。如果训练数据中混入异常，模型可能学会重建异常模式，导致检测失效。训练前先用简单方法（如 Isolation Forest）做一轮清洗。",
        },
        {
            title: "7. sklearn 与 PyOD 实战：端到端异常检测",
            body: `PyOD（Python Outlier Detection）是目前最全面的异常检测 Python 库，由 Yue Zhao 等人开发，集成了 40+ 种异常检测算法。它提供了统一的 API、可视化支持、以及多种组合策略（如使用多个检测器的共识结果）。

本节通过一个完整的端到端示例，展示如何使用 sklearn 和 PyOD 完成一个实际的异常检测任务。流程包括：数据加载与预处理 → 多算法对比 → 结果可视化 → 模型评估 → 部署建议。

在实际项目中，建议始终使用多个算法进行交叉验证。没有一种算法在所有场景下都是最优的：Isolation Forest 适合全局异常，LOF 擅长局部异常，One-Class SVM 在边界复杂时表现好，而深度方法适合高维非线性数据。通过对比多个算法的结果，可以获得更可靠的检测结论。

最后，异常检测的评估本身就是一个挑战。在没有真实标签的情况下，我们只能依赖业务反馈和启发式验证（如检查异常样本是否确实"不同"）。当有少量标注数据时，可以使用 Precision@K、ROC-AUC 等指标进行定量评估。`,
            code: [
                {
                    lang: "python",
                    code: `# pip install pyod
from pyod.models.iforest import IForest
from pyod.models.lof import LOF
from pyod.models.ocsvm import OCSVM
from pyod.models.cof import COF
from pyod.utils.data import generate_data
from pyod.utils.metric import evaluate_print
import numpy as np

# 1. 生成带有真实标签的测试数据
X_train, y_train, X_test, y_test = generate_data(
    n_train=1000,
    n_test=500,
    n_features=10,
    contamination=0.05,
    random_state=42,
    behaviour='new'
)

# 2. 定义多个检测器
detectors = {
    "Isolation Forest": IForest(contamination=0.05, random_state=42),
    "LOF": LOF(contamination=0.05, n_neighbors=20),
    "One-Class SVM": OCSVM(contamination=0.05, kernel='rbf'),
    "Connectivity-Based": COF(contamination=0.05, n_neighbors=20),
}

# 3. 训练并评估每个检测器
for name, clf in detectors.items():
    clf.fit(X_train)
    # 预测
    y_pred_train = clf.predict(X_train)
    y_pred_test = clf.predict(X_test)

    # 异常得分
    train_scores = clf.decision_function(X_train)
    test_scores = clf.decision_function(X_test)

    print(f"\\n{'='*40}")
    print(f"算法: {name}")
    print(f"训练集异常比例: {np.mean(y_pred_train == 1):.4f}")
    print(f"测试集异常比例: {np.mean(y_pred_test == 1):.4f}")
    print(f"平均异常得分: {np.mean(test_scores):.4f}")`,
                },
                {
                    lang: "python",
                    code: `from pyod.models.combination import aom, moa, average, maximization
from pyod.utils.data import generate_data
import numpy as np

# 生成数据
X_train, y_train, X_test, y_test = generate_data(
    n_train=1000, n_test=500, n_features=10,
    contamination=0.05, random_state=42, behaviour='new'
)

# 训练多个基础检测器
from pyod.models.iforest import IForest
from pyod.models.lof import LOF
from pyod.models.ocsvm import OCSVM
from pyod.models.pca import PCA as PCA_OD

clf1 = IForest(contamination=0.05, random_state=42).fit(X_train)
clf2 = LOF(contamination=0.05).fit(X_train)
clf3 = OCSVM(contamination=0.05).fit(X_train)
clf4 = PCA_OD(contamination=0.05).fit(X_train)

# 获取所有检测器的异常得分
scores = np.column_stack([
    clf1.decision_function(X_test),
    clf2.decision_function(X_test),
    clf3.decision_function(X_test),
    clf4.decision_function(X_test),
])

# 组合策略对比
comb_methods = {
    "Average": average(scores),
    "AOM (Average of Max)": aom(scores, n_buckets=5),
    "MOA (Max of Average)": moa(scores, n_buckets=5),
    "Maximization": maximization(scores),
}

from sklearn.metrics import roc_auc_score

for method, combined_scores in comb_methods.items():
    auc = roc_auc_score(y_test, combined_scores)
    print(f"{method:20s} ROC-AUC: {auc:.4f}")

# 最佳组合策略
best_method = max(comb_methods, key=lambda m: roc_auc_score(y_test, comb_methods[m]))
print(f"\\n最佳组合策略: {best_method}")`,
                },
            ],
            table: {
                headers: ["算法", "优势", "劣势", "推荐场景"],
                rows: [
                    ["Isolation Forest", "快速、无需分布假设、适合高维", "局部异常检测弱", "通用首选，大数据集"],
                    ["LOF", "局部异常检测强、密度自适应", "慢（O(n²)）、k 值敏感", "局部异常、密度不均"],
                    ["One-Class SVM", "非线性边界、中小数据集精度高", "gamma 敏感、大数据集慢", "边界复杂、中小数据集"],
                    ["AutoEncoder", "高维非线性、端到端特征学习", "需要大量数据、训练慢", "图像/文本/时序高维数据"],
                    ["PyOD 组合方法", "多模型融合、鲁棒性强", "计算成本高、调参复杂", "关键场景、需要高可靠性"],
                ],
            },
            mermaid: `graph TD
    A["原始数据"] --> B["数据预处理"]
    B --> C["特征工程 / 标准化"]
    C --> D{"选择检测策略"}
    D --> E["Isolation Forest"]
    D --> F["LOF"]
    D --> G["One-Class SVM"]
    D --> H["AutoEncoder"]
    E --> I["异常得分"]
    F --> I
    G --> I
    H --> I
    I --> J["组合策略 (AOM/MOA)"]
    J --> K["最终异常得分"]
    K --> L["阈值判定"]
    L --> M["输出异常报告"]
    M --> N["业务验证与反馈"]
    N -.->|闭环优化| D`,
            tip: "PyOD 的组合方法（Combination Frameworks）是提升检测鲁棒性的利器。AOM（Average of Maximum）通常表现最好——将多个检测器的得分分组取最大，再平均，这能有效减少单一算法的偏差。",
            warning: "异常检测模型部署到生产环境后，数据分布可能随时间漂移（Concept Drift）。务必定期用最新数据重新评估模型性能，并考虑设置自动重训练机制。一个 6 个月前表现良好的异常检测模型，今天可能已经失效。",
        },
    ],
};
