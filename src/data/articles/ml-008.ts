import { Article } from '../knowledge';

export const article: Article = {
    id: "ml-008",
    title: "K-Means：无监督聚类基础",
    category: "ml",
    tags: ["聚类", "无监督学习", "K-Means"],
    summary: "从 K 值选择到 K-Means++，掌握最基础的聚类算法",
    date: "2026-04-12",
    readTime: "16 min",
    level: "入门",
    content: [
        {
            title: "1. 聚类概念与直觉：让数据自己说话",
            body: `监督学习需要一个「老师」——标注好的标签告诉模型什么是对的。但现实世界中，大部分数据是没有标签的。你有一百万个用户的购买记录，但没人告诉你这些用户分几类；你有一万张商品图片，但没人告诉你该分成多少个品类。这就是无监督学习的舞台。

聚类（Clustering）是无监督学习中最核心的任务：把相似的数据点归为一组，让组内尽可能相似、组间尽可能不同。想象你在整理一堆混在一起的水果——苹果放一起、橙子放一起，虽然你没见过「苹果」这个词的定义，但你直觉上知道哪些水果「看起来像」。

K-Means 是最经典的聚类算法。它的名字已经揭示了两个关键信息：K 代表你要分成几组，Means 代表用均值（质心）来描述每一组。它的核心直觉极其简单：找到 K 个点作为「中心」，把每个数据点分给最近的中心，然后重新计算中心的位置，反复迭代直到稳定。`,
            code: [
                {
                    lang: "python",
                    code: `import numpy as np
import matplotlib.pyplot as plt

# 生成三个自然簇用于演示
np.random.seed(42)
cluster1 = np.random.randn(100, 2) + [2, 2]
cluster2 = np.random.randn(100, 2) + [-2, -2]
cluster3 = np.random.randn(100, 2) + [2, -2]
X = np.vstack([cluster1, cluster2, cluster3])

plt.figure(figsize=(8, 6))
plt.scatter(X[:, 0], X[:, 1], s=30, alpha=0.6, edgecolors='w', linewidth=0.5)
plt.title('未标注的数据——你能看出几个簇？', fontsize=14)
plt.xlabel('Feature 1')
plt.ylabel('Feature 2')
plt.grid(True, alpha=0.3)
plt.show()`
                },
                {
                    lang: "python",
                    code: `# 计算数据点之间的距离矩阵（直觉：相似=距离近）
from scipy.spatial.distance import pdist, squareform

# 抽取 50 个样本可视化距离矩阵
sample_idx = np.random.choice(len(X), 50, replace=False)
X_sample = X[sample_idx]
dist_matrix = squareform(pdist(X_sample, metric='euclidean'))

plt.figure(figsize=(8, 6))
plt.imshow(dist_matrix, cmap='YlOrRd', aspect='auto')
plt.colorbar(label='欧氏距离')
plt.title('距离热力图——对角线上的暗块=自然簇', fontsize=12)
plt.xlabel('样本索引')
plt.ylabel('样本索引')
plt.show()`
                }
            ],
            table: {
                headers: ["学习类型", "需要标签?", "典型任务", "代表算法"],
                rows: [
                    ["监督学习", "是", "分类、回归", "线性回归、SVM、决策树"],
                    ["无监督学习", "否", "聚类、降维", "K-Means、PCA、DBSCAN"],
                    ["半监督学习", "部分", "少量标注+大量无标注", "自训练、协同训练"],
                    ["强化学习", "奖励信号", "决策、控制", "Q-Learning、PPO"],
                ]
            },
            mermaid: `graph TD
    A["数据世界"] --> B{"有标签吗?"}
    B -->|是| C["监督学习"]
    B -->|否| D["无监督学习"]
    B -->|部分| E["半监督学习"]
    C --> F["预测/分类"]
    D --> G["聚类"]
    D --> H["降维"]
    D --> I["异常检测"]
    G --> J["K-Means"]
    G --> K["DBSCAN"]
    G --> L["层次聚类"]`,
            tip: "聚类的黄金法则是「先可视化，再聚类」。用散点图、PCA 降维或 t-SNE 先看一眼数据，对簇的数量和形状有个直觉判断。",
            warning: "聚类结果没有「标准答案」。同一个数据集，不同的算法、不同的参数可能给出完全不同但都合理的分组。聚类是探索性分析，不是真理。"
        },
        {
            title: "2. K-Means 算法流程：简单而优雅",
            body: `K-Means 的算法流程可以用四句话概括：随机选 K 个初始中心 → 把每个点分给最近的中心 → 用每组点的均值更新中心 → 重复直到中心不再变化。这个算法由 Stuart Lloyd 在 1957 年提出（1982 年发表），至今仍是最广泛使用的聚类算法之一。

理解 K-Means 的关键在于它优化的目标函数：惯性（Inertia），也叫组内平方和（WCSS）。惯性衡量的是每个点到其所属簇中心的距离平方之和。K-Means 的每一步迭代都在减小这个值——分配步骤把每个点分给最近的中心（最小化该点的贡献），更新步骤把中心移到组内均值（均值是使组内平方和最小的点）。

K-Means 保证收敛吗？是的，因为惯性有下界（≥ 0），且每次迭代都在严格减小惯性。但由于它只保证收敛到局部最优，不同的初始中心可能得到完全不同的结果。这也是为什么实践中我们会多次运行、取最优。`,
            code: [
                {
                    lang: "python",
                    code: `def kmeans_from_scratch(X, k, max_iters=100, random_state=None):
    """从零实现 K-Means 算法"""
    rng = np.random.RandomState(random_state)
    n_samples, n_features = X.shape

    # 步骤 1: 随机初始化 K 个中心
    centers = X[rng.choice(n_samples, k, replace=False)]

    for iteration in range(max_iters):
        # 步骤 2: 分配——把每个点分给最近的中心
        distances = np.zeros((n_samples, k))
        for j in range(k):
            distances[:, j] = np.sum((X - centers[j]) ** 2, axis=1)
        labels = np.argmin(distances, axis=1)

        # 步骤 3: 更新——用均值重新计算中心
        new_centers = np.zeros_like(centers)
        for j in range(k):
            new_centers[j] = X[labels == j].mean(axis=0)

        # 步骤 4: 检查收敛
        if np.allclose(centers, new_centers, atol=1e-6):
            print(f"第 {iteration + 1} 次迭代后收敛")
            break
        centers = new_centers

    # 计算最终惯性
    inertia = sum(np.sum((X[labels == j] - centers[j]) ** 2)
                  for j in range(k))
    return labels, centers, inertia

labels, centers, inertia = kmeans_from_scratch(X, k=3, random_state=42)
print(f"惯性 (WCSS): {inertia:.2f}")`
                },
                {
                    lang: "python",
                    code: `# 可视化 K-Means 迭代过程
def plot_kmeans_iteration(X, centers, labels, k, title):
    plt.figure(figsize=(6, 5))
    colors = ['r', 'g', 'b']
    for j in range(k):
        mask = labels == j
        plt.scatter(X[mask, 0], X[mask, 1], c=colors[j], s=30, alpha=0.6, label=f'Cluster {j}')
    plt.scatter(centers[:, 0], centers[:, 1], c='black', marker='X', s=300, label='Centers')
    plt.title(title, fontsize=13)
    plt.legend()
    plt.grid(True, alpha=0.3)
    plt.show()

# 展示前 3 次迭代
rng = np.random.RandomState(42)
init_centers = X[rng.choice(len(X), 3, replace=False)]

for i in range(3):
    dists = np.array([[np.sum((X - init_centers[j]) ** 2, axis=1)] for j in range(3)]).reshape(-1, 3)
    temp_labels = np.argmin(dists, axis=1)
    plot_kmeans_iteration(X, init_centers, temp_labels, 3, f'迭代 {i + 1}')
    init_centers = np.array([X[temp_labels == j].mean(axis=0) for j in range(3)])`
                }
            ],
            table: {
                headers: ["步骤", "操作", "数学表达", "目的"],
                rows: [
                    ["初始化", "随机选择 K 个中心", "μ₁, μ₂, ..., μₖ ∈ 数据点", "启动算法"],
                    ["分配", "每个点分给最近中心", "label(i) = argmin‖xᵢ - μⱼ‖²", "最小化点到中心距离"],
                    ["更新", "重新计算每组均值", "μⱼ = mean({xᵢ | label(i)=j})", "找到使 WCSS 最小的新中心"],
                    ["收敛", "中心不再变化", "‖μⱼ_new - μⱼ_old‖ < ε", "达到局部最优"],
                ]
            },
            mermaid: `graph TD
    A["开始"] --> B["随机选 K 个初始中心"]
    B --> C["计算每个点到各中心距离"]
    C --> D["分配每个点到最近的中心"]
    D --> E["用组内均值更新中心"]
    E --> F{"中心是否变化?"}
    F -->|是| C
    F -->|否| G["输出聚类结果 + 惯性"]
    G --> H["结束"]`,
            tip: "K-Means 对特征尺度非常敏感。如果某个特征的数值范围远大于其他特征，它会主导距离计算。聚类前一定要做标准化（StandardScaler）。",
            warning: "K-Means 假设簇是球形且大小相近的。如果数据中的簇形状不规则（如月牙形、环形）或大小差异很大，K-Means 会给出错误的结果。"
        },
        {
            title: "3. K 值选择：肘部法与轮廓系数",
            body: `K-Means 算法本身不会告诉你该分几个簇——K 必须预先指定。这是 K-Means 最大的痛点之一。如果 K 选得太小，不同的自然簇会被强行合并；如果 K 选得太大，一个自然簇会被拆成碎片。

肘部法（Elbow Method）是最直观的选择 K 的方法。它的逻辑是：尝试一系列 K 值，画出每个 K 对应的惯性曲线。随着 K 增大，惯性必然减小（极端情况 K=N 时惯性为零）。但你会看到惯性下降的速度在某个点突然变缓——这个「拐点」就是肘部。肘部之前，增加 K 能大幅改善聚类质量；肘部之后，增加 K 带来的边际收益很小。

轮廓系数（Silhouette Score）是更精细的评估指标。对每个样本，计算它与自己簇内其他样本的平均距离（a）和与最近的其他簇的平均距离（b），轮廓系数 s = (b - a) / max(a, b)。s 的范围是 [-1, 1]，越接近 1 表示样本被正确且清晰地分到了合适的簇。所有样本的轮廓系数均值就是整体评分。`,
            code: [
                {
                    lang: "python",
                    code: `from sklearn.cluster import KMeans
import matplotlib.pyplot as plt

# 肘部法：尝试 K=1~10
inertias = []
for k in range(1, 11):
    km = KMeans(n_clusters=k, random_state=42, n_init=10)
    km.fit(X)
    inertias.append(km.inertia_)

plt.figure(figsize=(8, 5))
plt.plot(range(1, 11), inertias, 'bo-', linewidth=2, markersize=8)
plt.xlabel('K（簇的数量）', fontsize=13)
plt.ylabel('惯性 (WCSS)', fontsize=13)
plt.title('肘部法：寻找惯性下降的拐点', fontsize=14)
plt.grid(True, alpha=0.3)
plt.axvline(x=3, color='r', linestyle='--', alpha=0.7, label='肘部: K=3')
plt.legend()
plt.show()`
                },
                {
                    lang: "python",
                    code: `from sklearn.metrics import silhouette_score
from sklearn.preprocessing import StandardScaler

# 轮廓系数法
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

sil_scores = []
for k in range(2, 11):  # K=1 没有轮廓系数
    km = KMeans(n_clusters=k, random_state=42, n_init=10)
    labels = km.fit_predict(X_scaled)
    score = silhouette_score(X_scaled, labels)
    sil_scores.append(score)
    print(f"K={k}: 轮廓系数={score:.4f}")

plt.figure(figsize=(8, 5))
plt.plot(range(2, 11), sil_scores, 'rs-', linewidth=2, markersize=8)
plt.xlabel('K（簇的数量）', fontsize=13)
plt.ylabel('轮廓系数', fontsize=13)
plt.title('轮廓系数 vs K 值', fontsize=14)
plt.grid(True, alpha=0.3)
plt.axhline(y=max(sil_scores), color='g', linestyle='--', alpha=0.5)
plt.show()`
                }
            ],
            table: {
                headers: ["方法", "取值范围", "最优标志", "优点", "缺点"],
                rows: [
                    ["肘部法", "惯性 ↓", "曲线拐点（肘部）", "直观、计算快", "肘部不明显时难以判断"],
                    ["轮廓系数", "[-1, 1]", "越大越好（接近 1）", "有明确数值标准", "对凸形簇偏好，计算较慢"],
                    ["Gap 统计量", "Gap(k) ↑", "最大 Gap 对应的 K", "统计学基础扎实", "计算开销很大"],
                    ["BIC/AIC", "越小越好", "最小值对应的 K", "考虑模型复杂度", "假设数据符合高斯混合"],
                ]
            },
            mermaid: `graph TD
    A["尝试 K=2,3,4,..."] --> B["计算每个 K 的惯性"]
    B --> C["绘制惯性曲线"]
    C --> D{"肘部明显吗?"}
    D -->|是| E["肘部 = 最佳 K"]
    D -->|否| F["计算轮廓系数"]
    F --> G["选轮廓系数最大的 K"]
    G --> H{"轮廓系数合理吗?"}
    H -->|是| I["确认 K"]
    H -->|否| J["考虑其他算法"]`,
            tip: "在实际应用中，肘部法和轮廓系数可以结合使用。先用肘部法快速缩小 K 的范围，再用轮廓系数精细比较候选 K 值。",
            warning: "惯性单调递减——K 越大惯性越小。所以不能简单地选惯性最小的 K，否则 K=N 时惯性为零（每个点一个簇），但这毫无意义。"
        },
        {
            title: "4. K-Means++ 初始化：聪明地选择起点",
            body: `标准 K-Means 的最大问题是：随机初始化中心可能导致极差的结果。想象一下，如果 K=3，但三个随机中心全落在了同一个自然簇内部，那么算法很可能只找到这个簇的子结构，而完全忽略其他两个簇。这就是局部最优的陷阱。

K-Means++ 是 David Arthur 和 Sergei Vassilvitskii 在 2007 年提出的初始化策略，它用一种概率化的贪心策略来选择初始中心。第一个中心随机选择。第二个中心倾向于选择距离第一个中心最远的点。第三个中心倾向于选择距离已有中心集合最远的点。以此类推。

**关键公式**：每个数据点 x 被选为下一个中心的概率 P(x) = D(x)² / Σ D(xᵢ)²，其中 D(x) 是 x 到最近已有中心的距离。距离越远的点，被选中的概率越大。这确保了初始中心尽可能分散在整个数据空间中。

**理论保证**：K-Means++ 的期望惯性不超过最优解的 8·(ln K + 2) 倍。这是一个对数级别的近似保证，远优于完全随机初始化。sklearn 中的 KMeans 默认使用 n_init=10，也就是用 K-Means++ 初始化运行 10 次取最优。`,
            code: [
                {
                    lang: "python",
                    code: `def kmeans_plus_plus_init(X, k, random_state=None):
    """K-Means++ 初始化"""
    rng = np.random.RandomState(random_state)
    n_samples = X.shape[0]
    centers = []

    # 第 1 个中心：随机选择
    idx = rng.randint(n_samples)
    centers.append(X[idx])

    for _ in range(1, k):
        # 计算每个点到最近中心的距离平方
        dists = np.array([
            min(np.sum((x - c) ** 2) for c in centers)
            for x in X
        ])

        # 概率与距离平方成正比
        probs = dists / dists.sum()

        # 按概率选择下一个中心
        idx = rng.choice(n_samples, p=probs)
        centers.append(X[idx])

    return np.array(centers)

# 对比随机初始化和 K-Means++ 初始化
random_centers = X[np.random.RandomState(42).choice(len(X), 3, replace=False)]
kmpp_centers = kmeans_plus_plus_init(X, 3, random_state=42)

print("随机初始化中心:")
print(random_centers)
print(f"\\nK-Means++ 初始化中心:")
print(kmpp_centers)`
                },
                {
                    lang: "python",
                    code: `# 多次运行对比：随机初始化 vs K-Means++
from sklearn.cluster import KMeans
import matplotlib.pyplot as plt

n_runs = 50
random_inertias = []
kmpp_inertias = []

for i in range(n_runs):
    # 随机初始化
    km_rand = KMeans(n_clusters=3, init='random', n_init=1,
                     random_state=i, max_iter=300)
    km_rand.fit(X)
    random_inertias.append(km_rand.inertia_)

    # K-Means++ 初始化
    km_plus = KMeans(n_clusters=3, init='k-means++', n_init=1,
                     random_state=i, max_iter=300)
    km_plus.fit(X)
    kmpp_inertias.append(km_plus.inertia_)

fig, axes = plt.subplots(1, 2, figsize=(14, 5))
axes[0].hist(random_inertias, bins=15, color='skyblue', edgecolor='black', alpha=0.7)
axes[0].axvline(np.mean(random_inertias), color='red', linestyle='--', label=f'均值={np.mean(random_inertias):.0f}')
axes[0].set_title('随机初始化惯性分布')
axes[0].legend()

axes[1].hist(kmpp_inertias, bins=15, color='lightgreen', edgecolor='black', alpha=0.7)
axes[1].axvline(np.mean(kmpp_inertias), color='red', linestyle='--', label=f'均值={np.mean(kmpp_inertias):.0f}')
axes[1].set_title('K-Means++ 初始化惯性分布')
axes[1].legend()
plt.tight_layout()
plt.show()`
                }
            ],
            table: {
                headers: ["初始化方法", "原理", "速度", "稳定性", "sklearn 默认"],
                rows: [
                    ["随机", "完全随机选 K 个点", "最快", "差（方差大）", "否"],
                    ["K-Means++", "概率化分散选择", "稍慢", "好（有理论保证）", "是"],
                    ["手动指定", "用户提供初始中心", "取决于用户", "完全可控", "否"],
                    ["k-means||", "分布式并行初始化", "适合大数据", "好", "Spark 中使用"],
                ]
            },
            mermaid: `graph TD
    A["开始初始化"] --> B["随机选第 1 个中心"]
    B --> C{"已选中心数 = K?"}
    C -->|否| D["计算每个点到最近中心的距离 D"]
    D --> E["P(x) = D²(x) / ΣD²"]
    E --> F["按概率选下一个中心"]
    F --> C
    C -->|是| G["返回 K 个初始中心"]
    G --> H["开始 K-Means 迭代"]`,
            tip: "sklearn 1.2+ 中 n_init 默认从 10 改为 'auto'（即 10 次），但会警告。建议显式设置 n_init=10 或更多以获得稳定结果。",
            warning: "K-Means++ 仍然不能保证全局最优。对于关键应用，建议设置较大的 n_init 值（如 20-50），多次运行取最优。"
        },
        {
            title: "5. 优缺点与局限性：什么时候该用，什么时候不该用",
            body: `K-Means 之所以经久不衰，原因在于它的简洁和高效。时间复杂度约为 O(n·K·d·i)，其中 n 是样本数、K 是簇数、d 是特征维度、i 是迭代次数。对于中等规模的数据集（百万级以下），K-Means 可以在几秒钟内完成。它的空间复杂度是 O(n·d + K·d)，只需要存储数据和中心点。

但 K-Means 的局限性同样不容忽视。它假设簇是球形的——更准确地说，它用欧氏距离作为相似度度量，这隐含着各向同性的球形假设。如果真实簇是拉长的椭圆，K-Means 会错误地切割它们。如果簇是月牙形或环形，K-Means 完全无能为力。

另一个严重的问题是它对异常值敏感。均值是最容易受极端值影响的统计量——一个远离簇的异常点可以显著地把中心拉向自己。此外，K-Means 只能用于数值型特征。如果你的数据包含类别变量，需要先做编码处理，而编码本身可能引入偏差。`,
            code: [
                {
                    lang: "python",
                    code: `# 演示 K-Means 在非球形簇上的失败
from sklearn.datasets import make_moons, make_blobs
from sklearn.cluster import KMeans
import matplotlib.pyplot as plt

fig, axes = plt.subplots(2, 3, figsize=(15, 10))

# 情况 1: 球形簇（K-Means 擅长）
X_blobs, _ = make_blobs(n_samples=300, centers=3, random_state=42)
km = KMeans(n_clusters=3, random_state=42, n_init=10)
labels = km.fit_predict(X_blobs)
axes[0, 0].scatter(X_blobs[:, 0], X_blobs[:, 1], c=labels, cmap='viridis', s=30)
axes[0, 0].scatter(km.cluster_centers_[:, 0], km.cluster_centers_[:, 1],
                    c='red', marker='X', s=200, label='Centers')
axes[0, 0].set_title('球形簇 ✓')

# 情况 2: 月牙形（K-Means 失败）
X_moons, _ = make_moons(n_samples=300, noise=0.05, random_state=42)
km = KMeans(n_clusters=2, random_state=42, n_init=10)
labels = km.fit_predict(X_moons)
axes[0, 1].scatter(X_moons[:, 0], X_moons[:, 1], c=labels, cmap='viridis', s=30)
axes[0, 1].set_title('月牙形 ✗')

# 情况 3: 含异常值的球形簇
X_with_outliers = np.vstack([X_blobs, np.random.uniform(-10, 10, (10, 2))])
km = KMeans(n_clusters=3, random_state=42, n_init=10)
labels = km.fit_predict(X_with_outliers)
axes[0, 2].scatter(X_with_outliers[:, 0], X_with_outliers[:, 1], c=labels,
                    cmap='viridis', s=30, alpha=0.7)
axes[0, 2].set_title('含异常值 ✗')
plt.tight_layout()
plt.show()`
                },
                {
                    lang: "python",
                    code: `# 处理类别特征的方案：K-Prototypes
# K-Means 无法直接处理类别特征，有以下几种解决方案：

# 方案 1: One-Hot 编码 + K-Means（简单但有维度爆炸风险）
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline

numeric_features = ['age', 'income', 'score']
categorical_features = ['gender', 'city', 'education']

preprocessor = ColumnTransformer([
    ('num', StandardScaler(), numeric_features),
    ('cat', OneHotEncoder(sparse_output=False, drop='first'), categorical_features)
])

# 方案 2: K-Prototypes（专为混合数据设计）
# pip install kmodes
try:
    from kmodes.kprototypes import KPrototypes
    # kproto = KPrototypes(n_clusters=3, init='Cao')
    # kproto.fit_predict(data, categorical=[3, 4, 5])
    print("K-Prototypes 可用于混合数据类型")
except ImportError:
    print("需安装 kmodes: pip install kmodes")

# 方案 3: Gower 距离 + 层次聚类
# pip install gower
# import gower
# dist_matrix = gower.gower_matrix(data)`
                }
            ],
            table: {
                headers: ["局限性", "具体表现", "影响程度", "缓解方案"],
                rows: [
                    ["球形假设", "无法识别非凸形簇", "高", "改用 DBSCAN 或谱聚类"],
                    ["异常值敏感", "均值被极端值拉扯", "中高", "用 K-Medians 或提前清洗"],
                    ["K 需预设", "不知道该分几组", "中", "用肘部法/轮廓系数估计"],
                    ["类别特征不支持", "只能处理数值型", "中", "One-Hot 编码或 K-Prototypes"],
                    ["等方差假设", "各方向散布相同", "中", "改用高斯混合模型"],
                    ["大数据扩展性差", "O(n·K·d·i)", "低", "Mini-Batch K-Means"],
                ]
            },
            mermaid: `graph TD
    A["评估数据特征"] --> B{"簇的形状?"}
    B -->|球形/紧凑| C{"有异常值吗?"}
    B -->|不规则/任意形状| D["→ 用 DBSCAN"]
    C -->|否| E["→ K-Means ✓"]
    C -->|是| F{"异常值多吗?"}
    F -->|少| E
    F -->|多| G["→ 清洗数据或 K-Medians"]
    A --> H{"数据类型?"}
    H -->|纯数值| B
    H -->|混合类型| I["→ K-Prototypes 或 Gower+层次聚类"]`,
            tip: "K-Means 在图像压缩、客户分群、文档聚类等场景中表现优异。这些场景的共同点是：数据天然呈球形簇分布，且你只需要一个快速、可解释的结果。",
            warning: "不要在不理解数据结构的情况下盲目使用 K-Means。先做探索性数据分析（EDA），了解特征分布、异常值情况和潜在的簇形状。"
        },
        {
            title: "6. 与层次聚类/DBSCAN 对比：算法选型指南",
            body: `聚类算法家族中，K-Means、层次聚类和 DBSCAN 是最常用的三员大将。理解它们的差异，是做出正确算法选择的前提。

层次聚类（Hierarchical Clustering）的核心优势是不需要预设 K。它自底向上（凝聚式）或自顶向下（分裂式）构建一棵树状结构（Dendrogram），你可以在任意高度切割这棵树得到不同粒度的聚类。但它的致命弱点是计算复杂度 O(n²·d)——对于超过万条的数据集就非常慢了。而且一旦一个样本被分配到某个簇，这个分配就固定了，不可更改。

DBSCAN（Density-Based Spatial Clustering）基于密度的直觉：簇是数据空间中密度较高的区域。它只需要两个参数：eps（邻域半径）和 min_samples（形成稠密区域的最小点数）。DBSCAN 的最大亮点是可以识别任意形状的簇，并且能自动检测异常值（标记为 -1）。但它对参数敏感，且在高维空间中效果下降（维度灾难导致距离变得无意义）。

三者的选择不是非此即彼的。在实际项目中，建议的流程是：先用 K-Means 做快速基线，再用 DBSCAN 检查是否有非球形簇，最后用层次聚类做小规模精细分析。`,
            code: [
                {
                    lang: "python",
                    code: `from sklearn.cluster import DBSCAN, AgglomerativeClustering, KMeans
from sklearn.datasets import make_moons
import matplotlib.pyplot as plt

X_moons, _ = make_moons(n_samples=300, noise=0.05, random_state=42)

fig, axes = plt.subplots(1, 3, figsize=(16, 5))

# K-Means
km = KMeans(n_clusters=2, random_state=42, n_init=10)
km_labels = km.fit_predict(X_moons)
axes[0].scatter(X_moons[:, 0], X_moons[:, 1], c=km_labels, cmap='viridis', s=30)
axes[0].set_title(f'K-Means (ARI={silhouette_score(X_moons, km_labels):.3f})')

# 层次聚类
hc = AgglomerativeClustering(n_clusters=2, linkage='ward')
hc_labels = hc.fit_predict(X_moons)
axes[1].scatter(X_moons[:, 0], X_moons[:, 1], c=hc_labels, cmap='viridis', s=30)
axes[1].set_title(f'层次聚类 (Ward)')

# DBSCAN
db = DBSCAN(eps=0.3, min_samples=5)
db_labels = db.fit_predict(X_moons)
n_clusters = len(set(db_labels)) - (1 if -1 in db_labels else 0)
n_noise = list(db_labels).count(-1)
axes[2].scatter(X_moons[:, 0], X_moons[:, 1], c=db_labels, cmap='viridis', s=30)
axes[2].set_title(f'DBSCAN ({n_clusters} 簇, {n_noise} 噪声点)')

for ax in axes:
    ax.grid(True, alpha=0.3)
plt.tight_layout()
plt.show()`
                },
                {
                    lang: "python",
                    code: `# 可视化层次聚类的树状图
from scipy.cluster.hierarchy import dendrogram, linkage
import matplotlib.pyplot as plt

# 取 50 个样本做树状图（完整数据太慢）
sample_idx = np.random.choice(len(X), 50, replace=False)
X_sample = X[sample_idx]

# 用 Ward  linkage
Z = linkage(X_sample, method='ward')

plt.figure(figsize=(12, 6))
dendrogram(Z, leaf_rotation=90, leaf_font_size=8)
plt.axhline(y=15, color='r', linestyle='--', alpha=0.5, label='切割线: K=3')
plt.title('层次聚类树状图（Ward 连接）', fontsize=14)
plt.xlabel('样本')
plt.ylabel('距离')
plt.legend()
plt.grid(True, alpha=0.3)
plt.show()

# 在不同高度切割得到不同 K
from scipy.cluster.hierarchy import fcluster
for dist in [10, 15, 25]:
    labels = fcluster(Z, t=dist, criterion='distance')
    print(f"切割距离={dist}: {len(set(labels))} 个簇")`
                }
            ],
            table: {
                headers: ["特性", "K-Means", "层次聚类", "DBSCAN"],
                rows: [
                    ["需要预设 K", "是", "否（可后切割）", "否（需 eps, min_samples）"],
                    ["簇形状假设", "球形", "取决于 linkage", "任意形状"],
                    ["异常值处理", "敏感（影响中心）", "敏感", "自动标记为噪声"],
                    ["时间复杂度", "O(n·K·d·i)", "O(n²·d)", "O(n·log n)~O(n²)"],
                    ["可扩展性", "好（支持 Mini-Batch）", "差（>10K 很慢）", "中"],
                    ["可重复性", "否（需固定 seed）", "是（确定性）", "是（确定性）"],
                ]
            },
            mermaid: `graph TD
    A["选择聚类算法"] --> B{"数据量大小?"}
    B -->|< 10K| C{"簇形状已知吗?"}
    B -->|> 10K| D{"需要速度吗?"}
    C -->|球形| E["→ K-Means"]
    C -->|任意形状| F["→ DBSCAN"]
    C -->|不确定| G["→ 都试一遍对比"]
    D -->|是| E
    D -->|否| H{"需要树状图吗?"}
    H -->|是| I["→ 层次聚类"]
    H -->|否| E
    E --> J["快速基线"]
    F --> K["发现复杂结构"]
    I --> L["探索性分析"]`,
            tip: "对于中等规模数据集（1K-10K 条），建议并行运行三种算法，用轮廓系数和 Calinski-Harabasz 指数对比结果，选择最优的。",
            warning: "DBSCAN 在高维数据（>50 维）上效果通常不好。高维空间中所有点的距离趋于相近，密度概念失效。先用 PCA 降维再用 DBSCAN。"
        },
        {
            title: "7. sklearn 实战：从数据到可视化的完整流程",
            body: `理论学习再多，不如动手跑一遍。本节用一个完整的实战流程，把前面所有的知识串联起来。我们将使用经典的 Iris 数据集，但故意只用两个特征来做二维可视化，这样你能直观地看到聚类效果。

完整的聚类流程包括六个步骤：数据加载与探索 → 数据预处理（标准化） → 确定最佳 K 值 → 训练 K-Means 模型 → 评估聚类质量 → 可视化结果。每一步都有其最佳实践。

**实战中最容易踩的坑是**：忘记标准化。Iris 数据集的花瓣长度和花萼长度单位相同但数值范围不同，不标准化的话，范围大的特征会主导聚类结果。另一个常见的坑是用训练集的标签来「作弊」评估聚类——无监督聚类时你不应该使用真实标签来选择 K，那相当于偷看了答案。`,
            code: [
                {
                    lang: "python",
                    code: `from sklearn.datasets import load_iris
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import silhouette_score, calinski_harabasz_score
import matplotlib.pyplot as plt
import numpy as np

# 步骤 1: 加载数据
iris = load_iris()
X = iris.data  # 4 个特征
y_true = iris.target  # 真实标签（仅用于最后对比）
feature_names = iris.feature_names

print(f"数据集: {X.shape[0]} 样本, {X.shape[1]} 特征")
print(f"特征: {feature_names}")

# 步骤 2: 标准化
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

# 步骤 3: 确定最佳 K
scores_sil = []
scores_ch = []
inertias = []
for k in range(2, 8):
    km = KMeans(n_clusters=k, random_state=42, n_init=10)
    labels = km.fit_predict(X_scaled)
    scores_sil.append(silhouette_score(X_scaled, labels))
    scores_ch.append(calinski_harabasz_score(X_scaled, labels))
    inertias.append(km.inertia_)

best_k_sil = np.argmax(scores_sil) + 2
print(f"轮廓系数最佳 K: {best_k_sil}")
print(f"轮廓系数: {max(scores_sil):.4f}")`
                },
                {
                    lang: "python",
                    code: `# 步骤 4: 训练最终模型
best_k = 3  # Iris 已知有 3 类
km_final = KMeans(n_clusters=best_k, random_state=42, n_init=10)
km_labels = km_final.fit_predict(X_scaled)

# 步骤 5: 评估
print(f"惯性: {km_final.inertia_:.2f}")
print(f"轮廓系数: {silhouette_score(X_scaled, km_labels):.4f}")
print(f"Calinski-Harabasz: {calinski_harabasz_score(X_scaled, km_labels):.2f}")

# 与真实标签对比（仅用于学习，实际应用中不可用）
from sklearn.metrics import adjusted_rand_score, normalized_mutual_info_score
ari = adjusted_rand_score(y_true, km_labels)
nmi = normalized_mutual_info_score(y_true, km_labels)
print(f"调整兰德指数 (ARI): {ari:.4f} (越接近 1 越好)")
print(f"归一化互信息 (NMI): {nmi:.4f} (越接近 1 越好)")

# 步骤 6: 可视化
fig, axes = plt.subplots(1, 3, figsize=(18, 5))

# 图 1: 聚类结果
colors = ['#FF6B6B', '#4ECDC4', '#45B7D1']
for i in range(best_k):
    mask = km_labels == i
    axes[0].scatter(X_scaled[mask, 2], X_scaled[mask, 3],
                     c=colors[i], s=50, alpha=0.7, label=f'Cluster {i}')
axes[0].scatter(km_final.cluster_centers_[:, 2], km_final.cluster_centers_[:, 3],
                 c='black', marker='X', s=200, label='Centers')
axes[0].set_xlabel(feature_names[2])
axes[0].set_ylabel(feature_names[3])
axes[0].set_title('K-Means 聚类结果')
axes[0].legend()

# 图 2: 真实标签
for i in range(3):
    mask = y_true == i
    axes[1].scatter(X_scaled[mask, 2], X_scaled[mask, 3],
                     c=colors[i], s=50, alpha=0.7, label=iris.target_names[i])
axes[1].set_xlabel(feature_names[2])
axes[1].set_ylabel(feature_names[3])
axes[1].set_title('真实分类')
axes[1].legend()

# 图 3: 指标对比
axes[2].bar(['ARI', 'NMI', 'Silhouette'], [ari, nmi, silhouette_score(X_scaled, km_labels)],
             color=colors[:3], alpha=0.7)
axes[2].set_ylim(0, 1)
axes[2].set_title('聚类质量指标')
axes[2].grid(True, alpha=0.3, axis='y')

plt.tight_layout()
plt.show()`
                }
            ],
            table: {
                headers: ["指标", "含义", "取值范围", "Iris 表现", "解读"],
                rows: [
                    ["惯性 (WCSS)", "组内平方和", "[0, ∞)", "越小越好", "无绝对标准，用于对比不同 K"],
                    ["轮廓系数", "样本聚类紧密度", "[-1, 1]", "0.55-0.65", ">0.5 表示合理的聚类"],
                    ["Calinski-Harabasz", "簇间/簇内方差比", "[0, ∞)", "越高越好", ">100 表示好的聚类"],
                    ["调整兰德指数", "与真实标签一致性", "[-1, 1]", "0.73-0.82", "越接近 1 越一致"],
                    ["NMI", "互信息归一化", "[0, 1]", "0.75-0.85", "越接近 1 信息保留越多"],
                ]
            },
            mermaid: `graph TD
    A["原始数据"] --> B["标准化 StandardScaler"]
    B --> C["肘部法 + 轮廓系数选 K"]
    C --> D["K-Means++ 初始化"]
    D --> E["K-Means 迭代"]
    E --> F["输出聚类标签"]
    F --> G["轮廓系数评估"]
    F --> H["Calinski-Harabasz 评估"]
    G --> I["质量达标?"]
    H --> I
    I -->|是| J["可视化 + 业务解读"]
    I -->|否| K["调整 K 或换算法"]
    K --> C`,
            tip: "在真实项目中，聚类结果最终要落地到业务决策。不要只看指标数字，要看聚类后的每个簇是否有实际的业务含义——比如「高消费低频用户」「低消费高频用户」。",
            warning: "聚类是一种探索性分析，不是预测模型。对新的数据点做预测时（predict 方法），K-Means 只是计算它到各个中心的距离。如果新数据的分布和训练数据不同，预测可能没有意义。"
        }
    ],
};
