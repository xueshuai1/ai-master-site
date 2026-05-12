import { Article } from '../knowledge';

export const article: Article = {
    id: "ml-012",
    title: "KNN：K 近邻算法",
    category: "ml",
    tags: ["KNN", "分类", "惰性学习"],
    summary: "从距离度量到 K 值选择，理解最简单的分类算法",
    date: "2026-04-12",
    readTime: "14 min",
    level: "入门",
    content: [
        {
            title: "1. 直觉：近朱者赤，近墨者黑",
            body: `KNN（K-Nearest Neighbors）的核心思想可以归结为一句中国古话——「近朱者赤，近墨者黑」。当你遇到一个新样本时，算法会在训练集中找到离它最近的 K 个样本，然后让这些「邻居」投票决定新样本的类别。

KNN 之所以被称为「惰性学习」（Lazy Learning）或「基于实例的学习」（Instance-based Learning），是因为它在训练阶段什么都不做——仅仅是把数据存储起来。所有计算都推迟到预测阶段，这也是它和逻辑回归、决策树等「 eager learning」算法的本质区别。

这种「延迟计算」策略带来了两大优势：模型天然支持在线学习（新数据直接加入训练集即可）和能够学习任意形状的决策边界。但代价也很明显：预测速度慢、内存消耗大，因为每个预测都要遍历全部训练数据。`,
            code: [
                {
                    lang: "python",
                    code: `import numpy as np
from collections import Counter

class SimpleKNN:
    """从零实现 KNN 分类器——理解核心逻辑"""

    def __init__(self, k=3):
        self.k = k
        self.X_train = None
        self.y_train = None

    def fit(self, X, y):
        """KNN 的"训练"：仅仅是记住数据"""
        self.X_train = np.array(X)
        self.y_train = np.array(y)
        print(f"已存储 {len(self.X_train)} 个训练样本")

    def _euclidean_distance(self, x1, x2):
        """计算两个样本之间的欧氏距离"""
        return np.sqrt(np.sum((x1 - x2) ** 2))

    def predict(self, X):
        """对每个新样本，找 K 个最近邻居并投票"""
        predictions = []
        for x in X:
            # 计算到所有训练样本的距离
            distances = [self._euclidean_distance(x, xt)
                         for xt in self.X_train]
            # 取距离最小的 K 个索引
            k_indices = np.argsort(distances)[:self.k]
            # 投票：选出出现次数最多的类别
            k_labels = [self.y_train[i] for i in k_indices]
            most_common = Counter(k_labels).most_common(1)[0][0]
            predictions.append(most_common)
        return np.array(predictions)`,
                },
                {
                    lang: "python",
                    code: `from sklearn.datasets import make_blobs
import matplotlib.pyplot as plt

# 生成 3 类二维数据
X, y = make_blobs(n_samples=300, centers=3,
                  cluster_std=1.5, random_state=42)

knn = SimpleKNN(k=5)
knn.fit(X, y)

# 生成网格用于绘制决策边界
x_min, x_max = X[:, 0].min() - 1, X[:, 0].max() + 1
y_min, y_max = X[:, 1].min() - 1, X[:, 1].max() + 1
xx, yy = np.meshgrid(np.linspace(x_min, x_max, 100),
                     np.linspace(y_min, y_max, 100))
grid_points = np.c_[xx.ravel(), yy.ravel()]
Z = knn.predict(grid_points).reshape(xx.shape)

plt.contourf(xx, yy, Z, alpha=0.3, cmap='viridis')
plt.scatter(X[:, 0], X[:, 1], c=y, cmap='viridis', edgecolors='k')
plt.title("KNN 决策边界 (K=5)")
plt.show()`,
                },
            ],
            table: {
                headers: ["特性", "KNN", "逻辑回归", "决策树"],
                rows: [
                    ["训练阶段", "无计算，仅存储", "迭代优化权重", "递归分裂节点"],
                    ["预测阶段", "遍历全部数据", "一次矩阵乘法", "沿树路径查找"],
                    ["决策边界", "任意形状", "线性", "轴平行分段"],
                    ["超参数", "K 值、距离度量", "正则化强度", "树深度、分裂准则"],
                ],
            },
            mermaid: `graph TD
    A["新样本 x"] --> B["计算到所有训练样本的距离"]
    B --> C["排序并取 K 个最近邻居"]
    C --> D["邻居投票"]
    D --> E["多数表决 → 预测类别"]
    class E s1
    class A s0
    classDef s0 fill:#0c4a6e
    classDef s1 fill:#14532d`,
            tip: "KNN 是理解机器学习「距离」概念的最佳起点——它不拟合任何参数，纯粹依赖样本间的几何关系做决策。",
        },
        {
            title: "2. 距离度量：如何定义「近」",
            body: `KNN 的灵魂在于距离度量。不同的距离公式会导致完全不同的「近邻」集合，从而直接影响分类结果。最常用的是闵可夫斯基距离（Minkowski Distance），它是多种距离的统一框架：D(x,y) = (Σ|xᵢ - yᵢ|ᵖ)^(1/p)。

当 p=2 时就是欧氏距离（Euclidean Distance），对应空间中两点之间的直线距离，是最直观的距离概念。当 p=1 时是曼哈顿距离（Manhattan Distance），也称城市街区距离，模拟在网格状城市中只能沿坐标轴行走的路径长度。

余弦相似度（Cosine Similarity）则从另一个角度衡量「相似」：它不看绝对距离，而是看两个向量的夹角。cos(θ) = (x·y) / (||x||·||y||)。这在文本分类中特别有用，因为文档长度不应影响相似性判断。`,
            code: [
                {
                    lang: "python",
                    code: `import numpy as np
from scipy.spatial.distance import euclidean, cityblock, cosine

def minkowski_distance(x1, x2, p=2):
    """闵可夫斯基距离：统一框架"""
    return np.sum(np.abs(x1 - x2)  p)  (1/p)

# 测试不同距离度量
x = np.array([1.0, 2.0, 3.0])
y = np.array([4.0, 0.0, 3.0])

print(f"欧氏距离 (p=2):   {minkowski_distance(x, y, 2):.4f}")
print(f"曼哈顿距离 (p=1): {minkowski_distance(x, y, 1):.4f}")
print(f"切比雪夫距离:     {max(np.abs(x - y)):.4f}")

# 用 scipy 验证
print(f"scipy 欧氏:       {euclidean(x, y):.4f}")
print(f"scipy 曼哈顿:     {cityblock(x, y):.4f}")
print(f"余弦距离:         {cosine(x, y):.4f}")`,
                },
                {
                    lang: "python",
                    code: `import numpy as np
import matplotlib.pyplot as plt

def visualize_distance_shapes():
    """可视化不同距离度量的单位圆形状"""
    fig, axes = plt.subplots(1, 3, figsize=(12, 4))
    theta = np.linspace(0, 2*np.pi, 200)

    # L1 (曼哈顿)：菱形
    ax = axes[0]
    r = 1.0 / (np.abs(np.cos(theta)) + np.abs(np.sin(theta)))
    ax.plot(r * np.cos(theta), r * np.sin(theta))
    ax.set_title("L1 距离（菱形）")
    ax.set_aspect('equal')

    # L2 (欧氏)：圆形
    ax = axes[1]
    ax.plot(np.cos(theta), np.sin(theta))
    ax.set_title("L2 距离（圆形）")
    ax.set_aspect('equal')

    # L∞ (切比雪夫)：正方形
    ax = axes[2]
    r = 1.0 / np.maximum(np.abs(np.cos(theta)), np.abs(np.sin(theta)))
    ax.plot(r * np.cos(theta), r * np.sin(theta))
    ax.set_title("L∞ 距离（正方形）")
    ax.set_aspect('equal')

    plt.tight_layout()
    plt.show()

visualize_distance_shapes()`,
                },
            ],
            table: {
                headers: ["距离度量", "p 值", "公式", "几何形状", "适用场景"],
                rows: [
                    ["欧氏距离", "2", "√Σ(xᵢ-yᵢ)²", "圆形/球面", "连续数值特征"],
                    ["曼哈顿距离", "1", "Σ|xᵢ-yᵢ|", "菱形/菱形面", "网格数据、稀疏特征"],
                    ["切比雪夫距离", "∞", "max|xᵢ-yᵢ|", "正方形/立方体", "棋盘、最坏情况分析"],
                    ["余弦距离", "—", "1-cos(θ)", "锥面", "文本、高维稀疏向量"],
                ],
            },
            mermaid: `graph LR
    A["闵可夫斯基距离"] --> B["p=1 曼哈顿"]
    A --> C["p=2 欧氏"]
    A --> D["p=∞ 切比雪夫"]
    A --> E["余弦相似度"]
    B --> F["网格/稀疏数据"]
    C --> G["通用连续数据"]
    D --> H["极值场景"]
    E --> I["文本/方向比较"]`,
            warning: "距离度量的选择对 KNN 性能影响极大。不要盲目使用默认欧氏距离——先分析数据特性：文本用余弦，网格用曼哈顿，连续数值用欧氏。",
        },
        {
            title: "3. K 值选择：太多与太少的艺术",
            body: `K 值是 KNN 中最重要的超参数，它直接控制模型的复杂度。K 太小会导致模型过度敏感——一个噪声点就能改变预测结果，这就是过拟合。K 太大则会使决策边界过于平滑，小类别的特征被大类别「淹没」，这就是欠拟合。

选择 K 值有两类方法。经验法则：K 通常取奇数（避免二分类时平票），且 K ≈ √n（n 为训练样本数）是一个合理的起点。更科学的方法是交叉验证：尝试 K = 1, 3, 5, ..., 21，用 K-fold 交叉验证评估每个 K 的准确率，选择验证集表现最好的那个。

实际应用中，K 的选择还受类别不平衡影响。如果某个类别占 80%，K 值较大时该类别将占据压倒性优势，此时需要考虑加权投票或欠采样。`,
            code: [
                {
                    lang: "python",
                    code: `from sklearn.neighbors import KNeighborsClassifier
from sklearn.model_selection import cross_val_score
import numpy as np
import matplotlib.pyplot as plt
from sklearn.datasets import make_classification

# 生成数据
X, y = make_classification(n_samples=500, n_features=10,
                           n_informative=5, random_state=42)

# 交叉验证选择最优 K
k_range = range(1, 31)
cv_scores = []
for k in k_range:
    knn = KNeighborsClassifier(n_neighbors=k)
    scores = cross_val_score(knn, X, y, cv=5, scoring='accuracy')
    cv_scores.append(scores.mean())

# 绘制 K-准确率曲线
plt.figure(figsize=(8, 5))
plt.plot(k_range, cv_scores, marker='o', linewidth=2)
best_k = k_range[np.argmax(cv_scores)]
plt.axvline(x=best_k, color='r', linestyle='--',
            label=f'最佳 K={best_k}')
plt.xlabel('K 值')
plt.ylabel('交叉验证准确率')
plt.title('K 值选择：交叉验证')
plt.legend()
plt.grid(alpha=0.3)
plt.show()

print(f"最佳 K 值: {best_k}")
print(f"最高准确率: {max(cv_scores):.4f}")`,
                },
                {
                    lang: "python",
                    code: `import numpy as np

def empirical_k_rule(n_samples, n_classes=2):
    """经验法则估算 K 值范围"""
    k_sqrt = int(np.sqrt(n_samples))
    # 调整为奇数
    if k_sqrt % 2 == 0:
        k_sqrt += 1
    k_min = max(1, k_sqrt - 2)
    k_max = k_sqrt + 4
    print(f"样本数: {n_samples}")
    print(f"建议 K 范围: [{k_min}, {k_max}]")
    print(f"起点 K={k_sqrt}")
    return k_min, k_max, k_sqrt

# 不同数据规模下的经验 K 值
for n in [100, 500, 1000, 5000]:
    empirical_k_rule(n)
    print("-" * 30)`,
                },
            ],
            table: {
                headers: ["K 值范围", "偏差", "方差", "决策边界", "风险"],
                rows: [
                    ["K=1", "极低", "极高", "极度不规则", "严重过拟合"],
                    ["K 较小 (3-5)", "低", "较高", "不规则但合理", "可能过拟合"],
                    ["K 适中 (√n)", "适中", "适中", "平滑但灵活", "通常最优"],
                    ["K 较大", "较高", "低", "过于平滑", "欠拟合"],
                ],
            },
            mermaid: `graph TD
    A["K 值选择"] --> B["K 太小"]
    A --> C["K 适中"]
    A --> D["K 太大"]
    B --> E["过拟合 | 高方差"]
    C --> F["偏差-方差平衡 | 最优"]
    D --> G["欠拟合 | 高偏差"]
    E --> H["噪声敏感"]
    F --> I["泛化能力强"]
    G --> J["丢失细节"]`,
            tip: "交叉验证选择 K 值时，建议 K 取奇数（二分类避免平票），搜索范围从 1 到 √n 的 2 倍，步长为 2。",
        },
        {
            title: "4. 加权投票：让近邻更有发言权",
            body: `标准 KNN 使用多数表决（Majority Voting），即 K 个邻居每人一票。但这有一个隐含问题：距离为 0.01 的邻居和距离为 10.0 的邻居拥有同等投票权，这显然不合理。

加权投票（Weighted Voting）通过距离的倒数赋予不同权重：wᵢ = 1 / dᵢ（或 wᵢ = 1 / (dᵢ + ε) 防止除零）。这样，距离越近的邻居对最终决策的影响越大。sklearn 中只需设置 weights='distance' 即可启用。

除了距离倒数，还可以使用高斯核权重：wᵢ = exp(-dᵢ² / (2σ²))，这种方式对远邻的衰减更剧烈，适合高维数据。加权投票在类别不平衡场景下效果尤为明显。`,
            code: [
                {
                    lang: "python",
                    code: `import numpy as np
from collections import defaultdict

class WeightedKNN:
    """加权 KNN 分类器——距离越近，权重越大"""

    def __init__(self, k=5, weight_type='distance'):
        self.k = k
        self.weight_type = weight_type  # 'uniform', 'distance', 'gaussian'
        self.X_train = None
        self.y_train = None

    def fit(self, X, y):
        self.X_train = np.array(X)
        self.y_train = np.array(y)

    def _get_weight(self, distances):
        """根据距离计算权重"""
        if self.weight_type == 'uniform':
            return np.ones_like(distances)
        elif self.weight_type == 'distance':
            epsilon = 1e-8
            return 1.0 / (distances + epsilon)
        elif self.weight_type == 'gaussian':
            sigma = np.mean(distances)
            return np.exp(-(distances  2) / (2 * sigma  2 + 1e-8))

    def predict(self, X):
        predictions = []
        for x in X:
            dists = np.sqrt(np.sum((self.X_train - x) ** 2, axis=1))
            k_idx = np.argsort(dists)[:self.k]
            k_dists = dists[k_idx]
            k_labels = self.y_train[k_idx]
            weights = self._get_weight(k_dists)

            # 加权投票
            class_votes = defaultdict(float)
            for label, weight in zip(k_labels, weights):
                class_votes[label] += weight
            predictions.append(max(class_votes, key=class_votes.get))
        return np.array(predictions)`,
                },
                {
                    lang: "python",
                    code: `from sklearn.datasets import make_classification
from sklearn.model_selection import train_test_split
from sklearn.neighbors import KNeighborsClassifier
from sklearn.metrics import accuracy_score

# 生成类别不平衡数据
X, y = make_classification(n_samples=1000, n_features=5,
                           n_informative=3, weights=[0.85, 0.15],
                           random_state=42)
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.3, random_state=42, stratify=y)

# 对比三种加权策略
for w in ['uniform', 'distance']:
    knn = KNeighborsClassifier(n_neighbors=7, weights=w)
    knn.fit(X_train, y_train)
    y_pred = knn.predict(X_test)
    acc = accuracy_score(y_test, y_pred)
    print(f"weights={w:>10s} | 准确率: {acc:.4f}")

# 查看不同 K 值下的加权效果
print("\ 不同 K 值的加权效果:")
print(f"{'K':>3s} | {'uniform':>8s} | {'distance':>8s}")
print("-" * 28)
for k in [1, 3, 5, 7, 9, 11, 15]:
    for w in ['uniform', 'distance']:
        knn = KNeighborsClassifier(n_neighbors=k, weights=w)
        knn.fit(X_train, y_train)
        acc = accuracy_score(y_test, knn.predict(X_test))
        if w == 'uniform':
            print(f"{k:3d} | {acc:.4f}", end="")
        else:
            print(f" | {acc:.4f}")`,
                },
            ],
            table: {
                headers: ["加权策略", "权重公式", "优势", "劣势", "适用场景"],
                rows: [
                    ["均匀投票", "wᵢ = 1", "简单、快速", "远邻和近邻等权", "数据干净、K 适中"],
                    ["距离倒数", "wᵢ = 1/dᵢ", "近邻影响更大", "距离为 0 时需处理", "大多数场景默认选择"],
                    ["高斯核", "wᵢ = exp(-d²/2σ²)", "对远邻衰减剧烈", "需调 σ 参数", "高维数据、噪声多"],
                ],
            },
            mermaid: `graph TD
    A["K 个近邻"] --> B["计算各自距离 d₁, d₂, ..., dₖ"]
    B --> C["选择加权策略"]
    C --> D["uniform: 等权"]
    C --> E["distance: 1/d"]
    C --> F["gaussian: exp(-d²/2σ²)"]
    D --> G["简单计数"]
    E --> H["距离倒数加权"]
    F --> I["指数衰减加权"]
    G --> J["投票结果"]
    H --> J
    I --> J`,
            warning: "距离倒数加权在测试样本恰好与某个训练样本重合时会出现除零问题。务必添加极小值 ε 或使用 sklearn 的内置实现（已自动处理）。",
        },
        {
            title: "5. 特征标准化：为什么它至关重要",
            body: `KNN 对特征的尺度极其敏感。想象一下：一个特征是房屋面积（50-500 平方米），另一个是房间数（1-10 间）。计算欧氏距离时，面积差异（几百）会完全淹没房间数差异（个位数），导致算法完全忽略后者。

这不仅仅是「不太理想」——它会导致模型完全失效。未标准化的特征会使距离度量失去意义，KNN 实际上变成了只看最大尺度特征的「单特征分类器」。

标准化有两种主流方法：Z-Score 标准化（StandardScaler）将特征缩放到均值 0、标准差 1；Min-Max 归一化（MinMaxScaler）将特征缩放到 [0, 1] 区间。对 KNN 而言，Z-Score 通常是更好的选择，因为它对异常值更鲁棒。`,
            code: [
                {
                    lang: "python",
                    code: `from sklearn.preprocessing import StandardScaler, MinMaxScaler
from sklearn.neighbors import KNeighborsClassifier
from sklearn.model_selection import train_test_split
from sklearn.datasets import load_wine
from sklearn.metrics import accuracy_score
import numpy as np

# 加载数据（特征尺度差异很大）
wine = load_wine()
X, y = wine.data, wine.target
print(f"原始特征范围:")
for i, name in enumerate(wine.feature_names[:4]):
    print(f"  {name:>20s}: [{X[:, i].min():.1f}, {X[:, i].max():.1f}]")

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.3, random_state=42)

# 对比标准化前后的效果
for scaler_name, scaler in [("无标准化", None),
                             ("StandardScaler", StandardScaler()),
                             ("MinMaxScaler", MinMaxScaler())]:
    if scaler:
        X_train_s = scaler.fit_transform(X_train)
        X_test_s = scaler.transform(X_test)
    else:
        X_train_s, X_test_s = X_train, X_test

    knn = KNeighborsClassifier(n_neighbors=5)
    knn.fit(X_train_s, y_train)
    acc = accuracy_score(y_test, knn.predict(X_test_s))
    print(f"{scaler_name:>20s}: 准确率 = {acc:.4f}")`,
                },
                {
                    lang: "python",
                    code: `import numpy as np
import matplotlib.pyplot as plt

def demonstrate_scaling_impact():
    """可视化标准化对 KNN 决策边界的影响"""
    from sklearn.datasets import make_classification
    from sklearn.preprocessing import StandardScaler

    # 创建尺度差异巨大的数据
    np.random.seed(42)
    X1 = np.random.randn(100, 2)
    X1[:, 0] *= 100  # 特征 1 尺度大
    X1[:, 1] *= 1    # 特征 2 尺度小
    y1 = np.zeros(100)

    X2 = np.random.randn(100, 2) + np.array([300, 1])
    X2[:, 0] *= 100
    X2[:, 1] *= 1
    y2 = np.ones(100)

    X = np.vstack([X1, X2])
    y = np.concatenate([y1, y2])

    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)

    fig, axes = plt.subplots(1, 2, figsize=(12, 5))

    for ax, data, title in [
        (axes[0], X, "未标准化"),
        (axes[1], X_scaled, "标准化后")
    ]:
        ax.scatter(data[:100, 0], data[:100, 1],
                   c='blue', label='类别 0', alpha=0.7)
        ax.scatter(data[100:, 0], data[100:, 1],
                   c='red', label='类别 1', alpha=0.7)
        ax.set_title(title)
        ax.legend()
        ax.set_xlabel("特征 1")
        ax.set_ylabel("特征 2")

    plt.tight_layout()
    plt.show()

demonstrate_scaling_impact()`,
                },
            ],
            table: {
                headers: ["标准化方法", "公式", "输出范围", "对异常值", "推荐度"],
                rows: [
                    ["Z-Score", "(x-μ)/σ", "无界 (≈[-3,3])", "✅ 鲁棒", "★★★★★ KNN 首选"],
                    ["Min-Max", "(x-min)/(max-min)", "[0, 1]", "❌ 敏感", "★★★ 数据干净时可用"],
                    ["RobustScaler", "(x-中位数)/IQR", "无界", "✅ 最鲁棒", "★★★★ 异常值极多时"],
                    ["不标准化", "原始值", "取决于数据", "—", "★ 绝不推荐"],
                ],
            },
            mermaid: `graph TD
    A["原始数据"] --> B{"特征尺度差异大？"}
    B -->|是| C["⚠️ 必须标准化"]
    B -->|否| D["可跳过（罕见）"]
    C --> E["选择标准化方法"]
    E --> F["StandardScaler 默认"]
    E --> G["RobustScaler 异常值多"]
    F --> H["KNN 正常工作"]
    G --> H
    D -.->|风险| H`,
            tip: "KNN 实战铁律：永远先标准化再训练！pipeline = Pipeline([('scaler', StandardScaler()), ('knn', KNeighborsClassifier())]) 是最安全的写法。",
        },
        {
            title: "6. KNN vs 其他分类器：何时选择它",
            body: `KNN 是最简单的分类算法，但「简单」不等于「无用」。理解 KNN 与其他算法的对比，有助于你在实际问题中做出正确的选择。

与决策树相比，KNN 的决策边界更加灵活，能捕捉复杂的非线性模式，但决策树的预测速度更快且更具可解释性。与支持向量机相比，KNN 在高维空间中的表现通常不如 SVM（维度诅咒），但 KNN 不需要调复杂的核函数参数。

与神经网络相比，KNN 无需训练、无需调学习率、不存在局部最优问题，但它无法学习特征的抽象表示。在实际工程中，KNN 常作为 Baseline 模型：先跑一个 KNN 看看基线准确率，再决定是否需要更复杂的模型。`,
            code: [
                {
                    lang: "python",
                    code: `from sklearn.datasets import make_moons, make_circles
from sklearn.neighbors import KNeighborsClassifier
from sklearn.tree import DecisionTreeClassifier
from sklearn.svm import SVC
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score
import matplotlib.pyplot as plt
import numpy as np

# 在非线性数据上对比多种分类器
datasets = {
    "moons": make_moons(n_samples=500, noise=0.3, random_state=42),
    "circles": make_circles(n_samples=500, noise=0.15, random_state=42),
}

classifiers = {
    "KNN (k=7)": KNeighborsClassifier(n_neighbors=7),
    "决策树": DecisionTreeClassifier(max_depth=5, random_state=42),
    "SVM (RBF)": SVC(kernel='rbf', gamma='scale', random_state=42),
    "逻辑回归": LogisticRegression(max_iter=1000, random_state=42),
}

for name, (X, y) in datasets.items():
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.3, random_state=42)
    print(f"\ === {name.upper()} 数据集 ===")
    for clf_name, clf in classifiers.items():
        clf.fit(X_train, y_train)
        acc = accuracy_score(y_test, clf.predict(X_test))
        print(f"  {clf_name:>15s}: {acc:.4f}")`,
                },
                {
                    lang: "python",
                    code: `import numpy as np
import time
from sklearn.neighbors import KNeighborsClassifier
from sklearn.tree import DecisionTreeClassifier
from sklearn.datasets import make_classification

# 训练速度和预测速度对比
print(f"{'样本数':>8s} | {'KNN训练':>8s} | {'KNN预测':>8s} | {'树训练':>8s} | {'树预测':>8s}")
print("-" * 60)

for n in [1000, 5000, 10000, 50000]:
    X, y = make_classification(n_samples=n, n_features=10,
                               random_state=42)

    # KNN
    knn = KNeighborsClassifier(n_neighbors=5)
    t0 = time.time()
    knn.fit(X, y)
    t_train = time.time() - t0
    t0 = time.time()
    knn.predict(X[:100])
    t_predict = time.time() - t0

    # 决策树
    tree = DecisionTreeClassifier(random_state=42)
    t0 = time.time()
    tree.fit(X, y)
    t_train_tree = time.time() - t0
    t0 = time.time()
    tree.predict(X[:100])
    t_predict_tree = time.time() - t0

    print(f"{n:8d} | {t_train:8.4f}s | {t_predict:8.4f}s | "
          f"{t_train_tree:8.4f}s | {t_predict_tree:8.4f}s")`,
                },
            ],
            table: {
                headers: ["算法", "训练速度", "预测速度", "可解释性", "非线性能力", "高维表现"],
                rows: [
                    ["KNN", "O(1) 仅存储", "O(n·d) 慢", "中等", "强", "❌ 维度诅咒"],
                    ["决策树", "O(n·log n·d)", "O(log n) 快", "✅ 强", "中等", "中等"],
                    ["SVM", "O(n²~n³)", "O(n_s·d)", "❌ 弱", "强 (核技巧)", "✅ 好"],
                    ["逻辑回归", "O(n·d·迭代)", "O(d) 极快", "✅ 强", "❌ 仅线性", "✅ 好"],
                    ["随机森林", "O(T·n·log n)", "O(T·log n)", "中等", "强", "中等"],
                ],
            },
            mermaid: `graph TD
    A["选择分类器"] --> B{"数据规模？"}
    B -->|小/中 (n<10K)| C{"决策边界形状？"}
    B -->|大 (n>50K)| D["避免 KNN 考虑随机森林/线性模型"]
    C -->|线性可分| E["逻辑回归"]
    C -->|复杂非线性| F["KNN / SVM / 树模型"]
    F --> G{"需要解释性？"}
    G -->|是| H["决策树"]
    G -->|否| I["KNN / SVM"]
    D --> J["随机森林 梯度提升"]`,
            warning: "KNN 在高维数据（d > 100）中会遭遇「维度诅咒」：所有样本之间的距离趋于相同，KNN 退化为随机猜测。遇到高维数据先用 PCA 降维，或直接换用其他算法。",
        },
        {
            title: "7. sklearn 实战与优化：从基础到 KD 树",
            body: `scikit-learn 提供了高度优化的 KNN 实现，支持多种距离度量、加权策略和加速算法。理解底层优化原理，能帮助你更好地使用这个工具。

朴素 KNN 的预测时间复杂度是 O(n·d)，当训练集很大时极其缓慢。sklearn 提供了两种空间索引加速方法：KD 树（KD-Tree）和球树（Ball-Tree）。KD 树通过递归地沿某个维度切分空间，将搜索复杂度从 O(n) 降低到 O(log n)，但仅适用于低维数据（d < 20）。球树用超球体包围数据点，在高维数据上表现更好。

algorithm='auto' 会根据数据维度自动选择最优算法，这也是默认的推荐设置。当 n_samples > 30 且维度不高时，通常选择 KD 树。`,
            code: [
                {
                    lang: "python",
                    code: `from sklearn.neighbors import KNeighborsClassifier
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline
from sklearn.model_selection import train_test_split, GridSearchCV
from sklearn.datasets import load_breast_cancer
from sklearn.metrics import classification_report
import time

# 加载乳腺癌数据集
data = load_breast_cancer()
X_train, X_test, y_train, y_test = train_test_split(
    data.data, data.target, test_size=0.2, random_state=42, stratify=data.target)

# 使用 Pipeline 确保标准化在交叉验证内部执行
pipeline = Pipeline([
    ('scaler', StandardScaler()),
    ('knn', KNeighborsClassifier())
])

# 网格搜索最优超参数
param_grid = {
    'knn__n_neighbors': [3, 5, 7, 9, 11, 15],
    'knn__weights': ['uniform', 'distance'],
    'knn__metric': ['euclidean', 'manhattan'],
    'knn__algorithm': ['auto', 'kd_tree', 'ball_tree'],
}

grid_search = GridSearchCV(pipeline, param_grid, cv=5,
                           scoring='accuracy', n_jobs=-1)
grid_search.fit(X_train, y_train)

print(f"最佳参数: {grid_search.best_params_}")
print(f"最佳准确率: {grid_search.best_score_:.4f}")
print(f"\ 测试集报告:")
print(classification_report(y_test, grid_search.predict(X_test),
                            target_names=data.target_names))`,
                },
                {
                    lang: "python",
                    code: `from sklearn.neighbors import KDTree, BallTree
import numpy as np
import time

# 手动演示 KD 树加速原理
np.random.seed(42)
X = np.random.randn(10000, 5)
query = np.random.randn(1, 5)

# 方法 1：暴力搜索（Brute Force）
t0 = time.time()
dists_brute = np.sqrt(np.sum((X - query) ** 2, axis=1))
k_indices_brute = np.argsort(dists_brute)[:5]
t_brute = time.time() - t0

# 方法 2：KD 树
t0 = time.time()
kdt = KDTree(X, leaf_size=30, metric='euclidean')
dists_kd, indices_kd = kdt.query(query, k=5)
t_kd = time.time() - t0

# 方法 3：Ball 树
t0 = time.time()
bt = BallTree(X, leaf_size=30, metric='euclidean')
dists_bt, indices_bt = bt.query(query, k=5)
t_bt = time.time() - t0

print(f"查询时间对比 (10000 样本, 5 维):")
print(f"  暴力搜索: {t_brute*1000:.2f} ms")
print(f"  KD 树:    {t_kd*1000:.2f} ms  ({t_brute/t_kd:.1f}x 加速)")
print(f"  Ball 树:  {t_bt*1000:.2f} ms  ({t_brute/t_bt:.1f}x 加速)")

# 验证结果一致性
print(f"\ KD 树最近邻索引: {indices_kd[0]}")
print(f"暴力搜索最近邻:    {k_indices_brute}")
print(f"结果一致: {set(indices_kd[0]) == set(k_indices_brute)}"
)`,
                },
            ],
            table: {
                headers: ["算法参数", "选项", "适用场景", "性能影响"],
                rows: [
                    ["algorithm", "auto/kd_tree/ball_tree/brute", "低维用 kd_tree，高维用 ball_tree", "预测速度 10-100x 差异"],
                    ["leaf_size", "10-50", "KD 树/球树的叶子节点大小", "太小→树深，太大→退化为暴力"],
                    ["n_jobs", "-1 (全核)", "并行查询", "预测速度线性加速"],
                    ["metric", "euclidean/manhattan/cosine", "距离度量", "直接影响分类准确率"],
                ],
            },
            mermaid: `graph TD
    A["KNN 预测"] --> B{"选择算法"}
    B -->|暴力搜索 brute| C["遍历全部 n 个样本"]
    B -->|KD 树 kd_tree| D["递归空间分割"]
    B -->|Ball 树 ball_tree| E["超球体包围"]
    C --> F["O(n·d)"]
    D --> G["平均 O(log n)"]
    E --> H["平均 O(log n)"]
    F --> I["适用于任意维度和度量"]
    G --> J["仅适用于低维 <20"]
    H --> K["支持更多度量方式"]`,
            tip: "sklearn 实战黄金组合：Pipeline + StandardScaler + GridSearchCV。永远把标准化放在 Pipeline 里，确保交叉验证时数据泄露不会发生。",
        },
    ],
};
