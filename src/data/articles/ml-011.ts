import { Article } from '../knowledge';

export const article: Article = {
    id: "ml-011",
    title: "t-SNE 与 UMAP：非线性降维可视化",
    category: "ml",
    tags: ["降维", "可视化", "t-SNE"],
    summary: "从高维到二维，掌握非线性降维的原理与实战",
    date: "2026-04-12",
    readTime: "18 min",
    level: "进阶",
    content: [
        {
            title: "1. 为什么需要非线性降维",
            body: `在机器学习中，高维数据无处不在。图像像素、词向量、基因表达矩阵动辄数百上千维。PCA 等线性方法只能发现数据的全局线性结构，面对流形结构（如瑞士卷、螺旋线）时完全失效。非线性降维方法通过在局部保留邻居关系，让高维数据的内在流形在低维空间中自然展开。t-SNE 和 UMAP 是当前最主流的非线性降维算法，前者以概率分布匹配为核心，后者基于流形学习与拓扑理论。理解它们的原理差异，才能在实际项目中做出正确选择。想象一堆缠绕的毛线球，线性方法试图从外部拍扁它，而非线性方法则小心翼翼地解开每一根线。`,
            code: [
                {
                    lang: "python",
                    code: `# PCA 在瑞士卷数据上的失败示例
from sklearn.datasets import make_swiss_roll
from sklearn.decomposition import PCA
import matplotlib.pyplot as plt

X, _ = make_swiss_roll(n_samples=1500, noise=0.05)
pca = PCA(n_components=2)
X_pca = pca.fit_transform(X)

plt.scatter(X_pca[:, 0], X_pca[:, 1], c=_, cmap="viridis")
plt.title("PCA on Swiss Roll: structure destroyed")
plt.show()`
                },
                {
                    lang: "python",
                    code: `# 非线性降维正确展开瑞士卷
from sklearn.manifold import TSNE

tsne = TSNE(n_components=2, perplexity=30, random_state=42)
X_tsne = tsne.fit_transform(X)

plt.scatter(X_tsne[:, 0], X_tsne[:, 1], c=_, cmap="viridis")
plt.title("t-SNE on Swiss Roll: structure preserved")
plt.show()`
                }
            ],
            table: {
                headers: ["方法", "线性/非线性", "保留结构", "适合场景"],
                rows: [
                    ["PCA", "线性", "全局方差", "预处理/降噪"],
                    ["t-SNE", "非线性", "局部邻居", "可视化聚类"],
                    ["UMAP", "非线性", "局部+全局", "大规模可视化"],
                    ["Isomap", "非线性", "测地距离", "流形学习"]
                ]
            },
            mermaid: `graph TD
    A["高维数据"] --> B["数据有流形结构?"]
    B -->|"是"| C["使用非线性降维"]
    B -->|"否"| D["使用 PCA"]
    C --> E["t-SNE: 侧重局部"]
    C --> F["UMAP: 局部+全局"]`,
            tip: "如果数据本身近似线性可分，先用 PCA 降维到 50 维再用 t-SNE，速度提升显著。",
            warning: "不要在降维后做距离比较——降维后的欧氏距离不等于原始距离。"
        },
        {
            title: "2. t-SNE 核心原理：高斯分布与 KL 散度",
            body: `t-SNE 的核心思想非常优雅：用概率分布来描述数据点之间的相似性。在高维空间中，以每个点为中心放置一个高斯分布，计算其他点落在这个分布下的概率——距离越近概率越高。然后在低维空间中，用自由度为 1 的 t 分布（柯西分布）做同样的事。两种分布之间的差异用 KL 散度衡量，通过梯度下降不断优化低维坐标，使得两个分布尽可能一致。选择 t 分布而非高斯分布是关键设计：t 分布的长尾特性解决了拥挤问题，让低维空间中有足够的空间容纳高维中的远距离点。`,
            code: [
                {
                    lang: "python",
                    code: `# 手动实现 t-SNE 的高斯条件概率
import numpy as np
from scipy.spatial.distance import pdist, squareform

def compute_high_dim_affinity(X, sigma):
    """计算高维空间中基于高斯的条件概率 p(j|i)"""
    n = X.shape[0]
    sq_dists = squareform(pdist(X, "sqeuclidean"))
    P = np.exp(-sq_dists / (2 * sigma**2))
    np.fill_diagonal(P, 0)
    P = P / P.sum(axis=1, keepdims=True)
    P = np.maximum(P, 1e-12)
    return P

X = np.random.randn(100, 50)
P = compute_high_dim_affinity(X, sigma=1.0)
print("Per-row probability sums:", P.sum(axis=1)[:5])`
                },
                {
                    lang: "python",
                    code: `# t 分布低维相似度计算
def compute_low_dim_affinity(Y):
    """计算低维空间中基于 t 分布的联合概率 q(j|i)"""
    n = Y.shape[0]
    sq_dists = squareform(pdist(Y, "sqeuclidean"))
    Q_num = 1.0 / (1.0 + sq_dists)
    np.fill_diagonal(Q_num, 0)
    Q = Q_num / Q_num.sum()
    Q = np.maximum(Q, 1e-12)
    return Q

Y = np.random.randn(100, 2)
Q = compute_low_dim_affinity(Y)
print("Q sum (should be ~1.0):", Q.sum())`
                }
            ],
            table: {
                headers: ["分布类型", "公式", "尾部特性", "在 t-SNE 中的作用"],
                rows: [
                    ["高斯分布", "exp(-d^2 / 2sigma^2)", "短尾，快速衰减", "高维相似度"],
                    ["t 分布(df=1)", "1 / (1 + d^2)", "长尾，缓慢衰减", "低维相似度"],
                    ["柯西分布", "1 / (pi * (1 + d^2))", "极长尾", "等价于 t(df=1)"]
                ]
            },
            mermaid: `graph LR
    A["高维数据 X"] --> B["高斯条件概率 P"]
    C["低维嵌入 Y"] --> D["t 分布联合概率 Q"]
    B --> E["KL(P||Q)"]
    D --> E
    E --> F["梯度下降更新 Y"]
    F --> C`,
            tip: "KL 散度不对称，t-SNE 使用 KL(P||Q) 而非 KL(Q||P)，这导致它更关注保留近距离点。",
            warning: "KL 散度可能产生 NaN，务必在概率矩阵中设置极小值下限（如 1e-12）。"
        },
        {
            title: "3. t-SNE 超参数详解：perplexity 与 learning_rate",
            body: `t-SNE 的效果高度依赖超参数调优。perplexity 是最关键的参数，可以理解为每个点有效邻居数的平滑估计，取值范围通常在 5 到 50 之间。较小的 perplexity 关注极局部结构，适合精细聚类；较大的 perplexity 能捕获更大的尺度结构，但可能模糊局部细节。learning_rate 控制优化步长，默认 200 对小型数据集有效，但大数据集需要 100-1000 的范围。Early exaggeration 阶段（默认 12）在优化初期放大高维距离，有助于形成更清晰的簇分离。n_iter 通常需要 1000 以上才能收敛。`,
            code: [
                {
                    lang: "python",
                    code: `# perplexity 网格搜索对比
from sklearn.datasets import load_digits
from sklearn.manifold import TSNE
import matplotlib.pyplot as plt

digits = load_digits()
X, y = digits.data, digits.target

fig, axes = plt.subplots(2, 3, figsize=(15, 10))
for i, perp in enumerate([5, 15, 30, 50, 75, 100]):
    tsne = TSNE(n_components=2, perplexity=perp, 
                random_state=42, n_iter=1000)
    X_emb = tsne.fit_transform(X[:300])
    ax = axes[i // 3, i % 3]
    sc = ax.scatter(X_emb[:, 0], X_emb[:, 1], 
                    c=y[:300], cmap="tab10", s=10)
    ax.set_title(f"perplexity={perp}")
plt.tight_layout()
plt.show()`
                },
                {
                    lang: "python",
                    code: `# learning_rate 与 early_exaggeration 调优
perplexity = 30
results = {}
for lr in [50, 200, 500, 1000]:
    for ee in [4, 12, 24]:
        tsne = TSNE(
            n_components=2, perplexity=perplexity,
            learning_rate=lr, early_exaggeration=ee,
            n_iter=2000, random_state=42
        )
        X_emb = tsne.fit_transform(X[:300])
        # 用 KL divergence 评估质量
        results[(lr, ee)] = tsne.kl_divergence_

best = min(results, key=results.get)
print(f"Best: lr={best[0]}, ee={best[1]}, "
      f"KL={results[best]:.2f}")`
                }
            ],
            table: {
                headers: ["参数", "默认值", "推荐范围", "影响"],
                rows: [
                    ["perplexity", "30", "5-50", "局部 vs 全局结构权衡"],
                    ["learning_rate", "200", "10-1000", "收敛速度与稳定性"],
                    ["early_exaggeration", "12", "4-24", "簇间分离程度"],
                    ["n_iter", "1000", "1000-5000", "收敛充分性"],
                    ["angle", "0.5", "0.2-0.8", "Barnes-Hut 近似精度"]
                ]
            },
            mermaid: `graph TD
    A["调整超参数"] --> B{"perplexity 太小?"}
    B -->|"是"| C["出现碎片化小簇"]
    B -->|"否"| D{"learning_rate 太大?"}
    D -->|"是"| E["优化发散/震荡"]
    D -->|"否"| F["结构清晰稳定"]
    C --> G["增大 perplexity"]
    E --> H["减小 learning_rate"]`,
            tip: "当 perplexity > 样本数/3 时，结果将失去意义——确保样本数至少是 perplexity 的 3 倍。",
            warning: "t-SNE 结果受 random_state 影响很大，同一数据集不同随机种子可能呈现完全不同的簇结构。"
        },
        {
            title: "4. UMAP 原理：流形学习与模糊拓扑",
            body: `UMAP（Uniform Manifold Approximation and Projection）建立在严格的数学基础之上：黎曼几何与代数拓扑。它假设数据均匀采样自一个黎曼流形，通过构建模糊拓扑结构来表示高维数据。具体而言，UMAP 首先为每个点找到 k 个最近邻，然后用局部连通度参数 rho 和 sigma 将距离转换为模糊集合的成员度。低维空间中使用不同的距离函数，通过交叉熵损失优化嵌入坐标。与 t-SNE 相比，UMAP 的理论基础更坚实，计算效率更高，且能更好地保留全局结构。`,
            code: [
                {
                    lang: "python",
                    code: `# UMAP 核心：模糊单形集构建
import numpy as np
from sklearn.neighbors import NearestNeighbors

def compute_fuzzy_simplicial(X, k=15):
    """构建高维模糊单形集（简化版）"""
    n = X.shape[0]
    nn = NearestNeighbors(n_neighbors=k+1).fit(X)
    distances, indices = nn.kneighbors(X)
    distances = distances[:, 1:]  # 去掉自身
    indices = indices[:, 1:]
    
    # 局部连通度 rho 和宽度 sigma
    rho = distances[:, 0]  # 到最近邻的距离
    sigma = np.ones(n)
    for i in range(n):
        lo, hi = 0, 100
        for _ in range(64):  # 二分搜索
            mid = (lo + hi) / 2
            val = np.sum(np.exp(-(distances[i] - rho[i]) / mid))
            if val > np.log2(k):
                hi = mid
            else:
                lo = mid
        sigma[i] = hi
    
    # 成员度计算
    memberships = np.exp(-(distances - rho.reshape(-1,1)) / sigma.reshape(-1,1))
    return memberships, indices

X = np.random.randn(500, 20)
memberships, indices = compute_fuzzy_simplicial(X)
print("Membership matrix shape:", memberships.shape)`
                },
                {
                    lang: "python",
                    code: `# UMAP 实战：完整流程
import umap
from sklearn.datasets import make_moons

X, y = make_moons(n_samples=500, noise=0.1)
reducer = umap.UMAP(
    n_components=2,
    n_neighbors=15,
    min_dist=0.1,
    metric="euclidean",
    random_state=42
)
embedding = reducer.fit_transform(X)

import matplotlib.pyplot as plt
plt.scatter(embedding[:, 0], embedding[:, 1], 
            c=y, cmap="Spectral", s=20)
plt.title("UMAP on Moons Dataset")
plt.show()`
                }
            ],
            table: {
                headers: ["UMAP 参数", "默认值", "含义"],
                rows: [
                    ["n_neighbors", "15", "局部邻域大小，类似 perplexity"],
                    ["min_dist", "0.1", "嵌入中点间最小距离"],
                    ["metric", "euclidean", "距离度量方式"],
                    ["n_components", "2", "目标降维维度"],
                    ["spread", "1.0", "嵌入空间的拉伸程度"]
                ]
            },
            mermaid: `graph LR
    A["高维数据"] --> B["k-NN 图构建"]
    B --> C["模糊单形集"]
    C --> D["交叉熵损失"]
    D --> E["低维嵌入优化"]
    E --> F["可视化结果"]`,
            tip: "n_neighbors 控制局部 vs 全局结构的权衡：较小值（5-10）关注局部，较大值（50-200）关注全局。",
            warning: "UMAP 的随机初始化可能导致不同运行结果有差异，设置 random_state 保证可复现。"
        },
        {
            title: "5. t-SNE vs UMAP vs PCA 全面对比",
            body: `三种方法各有适用场景，理解它们的差异是选择正确工具的关键。PCA 是线性投影，计算最快（O(nd^2 + d^3)），适合预处理和探索性分析，但无法处理流形结构。t-SNE 在局部结构保留上表现优异，簇分离效果极佳，但计算成本高（Barnes-Hut 近似为 O(n log n)），且几乎不保留全局结构。UMAP 在速度和全局结构保留上取得最佳平衡，支持增量更新和逆变换，适合生产环境。从数学角度看，PCA 最大化方差，t-SNE 最小化分布差异，UMAP 最小化拓扑结构差异。`,
            code: [
                {
                    lang: "python",
                    code: `# 三种方法在同一数据集上的对比
from sklearn.datasets import load_digits
from sklearn.decomposition import PCA
from sklearn.manifold import TSNE
import umap
import time

X, y = load_digits().data, load_digits().target

# PCA
t0 = time.time()
X_pca = PCA(n_components=2).fit_transform(X)
print(f"PCA: {time.time()-t0:.2f}s")

# t-SNE
t0 = time.time()
X_tsne = TSNE(n_components=2, perplexity=30, 
              random_state=42).fit_transform(X)
print(f"t-SNE: {time.time()-t0:.2f}s")

# UMAP
t0 = time.time()
X_umap = umap.UMAP(n_components=2, random_state=42
                   ).fit_transform(X)
print(f"UMAP: {time.time()-t0:.2f}s")`
                },
                {
                    lang: "python",
                    code: `# 量化对比：信任度（trustworthiness）评估
from sklearn.metrics import trustworthiness

methods = {
    "PCA": X_pca,
    "t-SNE": X_tsne,
    "UMAP": X_umap
}

for name, emb in methods.items():
    tw = trustworthiness(X, emb, n_neighbors=15)
    print(f"{name}: trustworthiness = {tw:.4f}")

# UMAP 通常获得最高的 trustworthiness
# 因为它同时保留了局部和全局结构`
                }
            ],
            table: {
                headers: ["指标", "PCA", "t-SNE", "UMAP"],
                rows: [
                    ["时间复杂度", "O(nd^2)", "O(n log n)", "O(n^1.14)"],
                    ["局部结构", "差", "优秀", "优秀"],
                    ["全局结构", "优秀", "差", "良好"],
                    ["可扩展性", "百万级", "万级", "百万级"],
                    ["可逆变换", "是", "否", "近似支持"],
                    ["新增数据", "直接变换", "不支持", "transform()"]
                ]
            },
            mermaid: `graph TD
    A["选择降维方法"] --> B{"数据规模?"}
    B -->|"小于1万"| C{"需要全局结构?"}
    B -->|"大于1万"| D["使用 UMAP"]
    C -->|"是"| E["PCA 或 UMAP"]
    C -->|"否"| F["t-SNE 可视化"]
    D --> G{"需要增量学习?"}
    G -->|"是"| H["UMAP transform"]
    G -->|"否"| I["标准 UMAP"]`,
            tip: "大规模数据先用 PCA 降到 50 维，再用 UMAP 降到 2 维，兼顾速度和效果。",
            warning: "t-SNE 的簇大小和簇间距没有绝对意义——簇大不代表方差大，簇远不代表差异大。"
        },
        {
            title: "6. 高维数据可视化最佳实践",
            body: `降维可视化不是跑个算法就完事了，需要系统的方法论。第一步是数据预处理：标准化、归一化、去除异常值，这些对距离敏感的方法至关重要。第二步是降维策略的选择：先用 PCA 了解数据的全局方差分布，再用 t-SNE 或 UMAP 做精细可视化。第三步是参数调优：通过网格搜索或随机搜索找到最优参数组合。第四步是结果验证：使用 silhouette score、trustworthiness 等指标量化评估，同时结合领域知识判断合理性。第五步是可解释性：为可视化添加标签、颜色编码，让非技术人员也能理解。`,
            code: [
                {
                    lang: "python",
                    code: `# 完整的降维可视化 pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.decomposition import PCA
import umap
import matplotlib.pyplot as plt

def visualize_pipeline(X, labels, feature_names=None):
    """完整的降维可视化流程"""
    # Step 1: 标准化
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)
    
    # Step 2: PCA 探索方差
    pca = PCA()
    pca.fit(X_scaled)
    cumvar = np.cumsum(pca.explained_variance_ratio_)
    n_comp = np.argmax(cumvar > 0.95) + 1
    print(f"95% variance explained by {n_comp} components")
    
    # Step 3: PCA 降维预处理
    X_reduced = PCA(n_components=min(n_comp, 50)
                    ).fit_transform(X_scaled)
    
    # Step 4: UMAP 最终可视化
    reducer = umap.UMAP(n_neighbors=15, min_dist=0.1,
                        random_state=42)
    embedding = reducer.fit_transform(X_reduced)
    
    # Step 5: 可视化
    plt.figure(figsize=(10, 8))
    sc = plt.scatter(embedding[:, 0], embedding[:, 1],
                     c=labels, cmap="tab20", s=15, alpha=0.7)
    plt.colorbar(sc, label="Cluster")
    plt.title("UMAP Visualization (PCA preprocessed)")
    plt.tight_layout()
    plt.show()
    
    return embedding`
                },
                {
                    lang: "python",
                    code: `# 量化评估：trustworthiness + silhouette
from sklearn.metrics import (trustworthiness, 
                              silhouette_score)
from sklearn.neighbors import NearestNeighbors

def evaluate_embedding(X_high, X_low, labels):
    """综合评估降维质量"""
    # Trustworthiness: 局部结构保留程度
    tw = trustworthiness(X_high, X_low, n_neighbors=15)
    
    # Silhouette: 聚类清晰度
    sil = silhouette_score(X_low, labels)
    
    # Neighborhood preservation
    nn_high = NearestNeighbors(n_neighbors=15
                               ).fit(X_high).kneighbors()[1]
    nn_low = NearestNeighbors(n_neighbors=15
                              ).fit(X_low).kneighbors()[1]
    preserved = np.mean([
        len(set(nn_high[i]) & set(nn_low[i])) / 15
        for i in range(len(X_high))
    ])
    
    print(f"Trustworthiness: {tw:.4f}")
    print(f"Silhouette: {sil:.4f}")
    print(f"Neighbor preservation: {preserved:.4f}")
    return {"tw": tw, "sil": sil, "np": preserved}`
                }
            ],
            table: {
                headers: ["预处理步骤", "方法", "为什么重要"],
                rows: [
                    ["标准化", "StandardScaler", "消除量纲差异，使距离计算有意义"],
                    ["异常值处理", "IQR / IsolationForest", "t-SNE/UMAP 对异常值敏感"],
                    ["PCA 预处理", "保留 95% 方差", "降噪 + 加速非线性降维"],
                    ["特征选择", "VarianceThreshold", "去除无信息特征，减少噪声"]
                ]
            },
            mermaid: `graph TD
    A["原始高维数据"] --> B["标准化"]
    B --> C["异常值检测与处理"]
    C --> D["PCA 降维预处理"]
    D --> E["UMAP/t-SNE 降维"]
    E --> F["量化评估"]
    F --> G{"质量达标?"}
    G -->|"是"| H["发布可视化"]
    G -->|"否"| I["调整参数"]
    I --> E`,
            tip: "对于文本数据，先用 TF-IDF 或 BERT 提取特征，再用 SVD 降到 100-300 维，最后用 UMAP 可视化。",
            warning: "降维可视化不能用于异常检测——降维过程本身会扭曲距离，远离簇的点不一定是异常值。"
        },
        {
            title: "7. 实战：MNIST 与词嵌入可视化",
            body: `理论再好也需要实战检验。MNIST 手写数字数据集是降维可视化的经典测试集：70000 张 28x28 灰度图像，展平后是 784 维向量。十个数字类别在降维后应该自然形成十个簇，这是验证算法效果的标准方法。另一个重要应用场景是词嵌入可视化：Word2Vec 或 GloVe 训练出的 300 维词向量，降维后语义相近的词应该聚在一起，如动物词、颜色词、数字词各自成簇。这两个实战案例涵盖了图像和文本两大领域，是掌握非线性降维的最佳起点。`,
            code: [
                {
                    lang: "python",
                    code: `# MNIST 可视化：t-SNE + UMAP 对比
from sklearn.datasets import fetch_openml
import umap
from sklearn.manifold import TSNE
import matplotlib.pyplot as plt

# 加载 MNIST
mnist = fetch_openml("mnist_784", version=1, as_frame=False)
X, y = mnist.data, mnist.target.astype(int)

# 随机采样 7000 张（t-SNE 计算量大）
rng = np.random.RandomState(42)
idx = rng.choice(len(X), 7000, replace=False)
X_sample, y_sample = X[idx], y[idx]

# t-SNE（较慢）
tsne = TSNE(n_components=2, perplexity=50, 
            n_iter=1500, random_state=42)
X_tsne = tsne.fit_transform(X_sample)

# UMAP（较快）
umap_model = umap.UMAP(n_neighbors=10, min_dist=0.1,
                       random_state=42)
X_umap = umap_model.fit_transform(X_sample)

# 对比可视化
fig, axes = plt.subplots(1, 2, figsize=(16, 7))
for ax, emb, title in [(axes[0], X_tsne, "t-SNE"),
                        (axes[1], X_umap, "UMAP")]:
    sc = ax.scatter(emb[:, 0], emb[:, 1], 
                    c=y_sample, cmap="tab10", 
                    s=5, alpha=0.6)
    ax.set_title(title, fontsize=14)
    ax.set_xticks([])
    ax.set_yticks([])
plt.tight_layout()
plt.show()`
                },
                {
                    lang: "python",
                    code: `# 词嵌入可视化：GloVe + UMAP
import numpy as np
import umap
import matplotlib.pyplot as plt
from sklearn.metrics.pairwise import cosine_distances

# 加载预训练的 GloVe 词向量（示例简化版）
word_vectors = {
    "king": np.random.randn(50),
    "queen": np.random.randn(50),
    "prince": np.random.randn(50),
    "cat": np.random.randn(50),
    "dog": np.random.randn(50),
    "bird": np.random.randn(50),
    "red": np.random.randn(50),
    "blue": np.random.randn(50),
    "green": np.random.randn(50),
    "one": np.random.randn(50),
    "two": np.random.randn(50),
    "three": np.random.randn(50),
}

words = list(word_vectors.keys())
X = np.array(list(word_vectors.values()))
categories = ["royal"]*3 + ["animal"]*3 + ["color"]*3 + ["number"]*3

# UMAP 降维
reducer = umap.UMAP(n_components=2, n_neighbors=5,
                    min_dist=0.3, metric="cosine",
                    random_state=42)
embedding = reducer.fit_transform(X)

# 可视化 + 标注
fig, ax = plt.subplots(figsize=(12, 8))
cmap = {"royal": "gold", "animal": "forestgreen",
        "color": "crimson", "number": "royalblue"}
for word, (x, y), cat in zip(words, embedding, categories):
    ax.scatter(x, y, c=cmap[cat], s=100)
    ax.annotate(word, (x, y), fontsize=10,
                fontweight="bold")
ax.set_title("Word Embedding UMAP Visualization")
ax.grid(True, alpha=0.3)
plt.show()`
                }
            ],
            table: {
                headers: ["数据集", "维度", "样本数", "推荐方法", "关键参数"],
                rows: [
                    ["MNIST", "784", "70000", "UMAP", "n_neighbors=10, min_dist=0.1"],
                    ["Fashion-MNIST", "784", "70000", "UMAP", "n_neighbors=15, min_dist=0.05"],
                    ["GloVe-6B", "50-300", "400000", "PCA+UMAP", "n_neighbors=20, min_dist=0.3"],
                    ["CIFAR-10 特征", "512-2048", "60000", "t-SNE", "perplexity=50, lr=500"]
                ]
            },
            mermaid: `graph LR
    A["原始数据"] --> B{"数据类型?"}
    B -->|"图像"| C["展平 + 标准化"]
    B -->|"文本"| D["词向量提取"]
    C --> E["PCA 到 50 维"]
    D --> E
    E --> F["UMAP 到 2 维"]
    F --> G["散点图 + 标注"]
    G --> H["语义分析"]`,
            tip: "MNIST 可视化时，n_neighbors=10 通常能最好地分离 10 个数字类别。",
            warning: "词嵌入可视化时，确保使用 cosine 距离而非 euclidean 距离——词向量的方向比模长更重要。"
        }
    ],
};
