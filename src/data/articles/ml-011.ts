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
            body: `PCA 是最经典的降维方法，但它的线性假设在许多真实场景中严重不足。想象一个瑞士卷（Swiss Roll）数据点集——数据分布在三维空间中弯曲的二维流形上。PCA 只能找到一个最佳的线性投影平面，无法将卷曲的结构「展开」。这意味着原本在流形上相邻的点，经过 PCA 投影后可能相距甚远；而原本相距很远的点，却可能因为投影重叠而看起来很近。

非线性降维的核心思想是：数据通常并非均匀填充整个高维空间，而是集中在某个低维流形（manifold）上。流形学习（Manifold Learning）的目标就是找到这个隐藏的低维结构，并将其展开为我们能够观察的 2D 或 3D 空间。t-SNE 和 UMAP 是这一领域最成功的两种算法。t-SNE（t-Distributed Stochastic Neighbor Embedding）由 Laurens van der Maaten 和 Geoffrey Hinton 于 2008 年提出，专注于保留局部邻域结构。UMAP（Uniform Manifold Approximation and Projection）由 Leland McInnes 等人于 2018 年提出，在保留局部结构的同时也兼顾全局结构，且计算速度更快。理解为什么线性方法不够用，是选择正确降维工具的第一步。`,
            code: [
                {
                    lang: "python",
                    code: `import numpy as np
import matplotlib.pyplot as plt
from sklearn.datasets import make_swiss_roll
from sklearn.decomposition import PCA

# 生成瑞士卷数据
X, color = make_swiss_roll(n_samples=1500, noise=0.1, random_state=42)

# PCA 降维（线性方法失败）
pca = PCA(n_components=2)
X_pca = pca.fit_transform(X)

# 可视化
fig, axes = plt.subplots(1, 3, figsize=(15, 5))
axes[0].scatter(X[:, 0], X[:, 2], c=color, cmap='viridis', s=10)
axes[0].set_title('Original Swiss Roll (side view)')
axes[0].set_aspect('equal')

axes[1].scatter(X[:, 0], X[:, 1], c=color, cmap='viridis', s=10)
axes[1].set_title('Original Swiss Roll (top view)')
axes[1].set_aspect('equal')

axes[2].scatter(X_pca[:, 0], X_pca[:, 1], c=color, cmap='viridis', s=10)
axes[2].set_title('PCA Projection (linear fails)')
axes[2].set_aspect('equal')

plt.tight_layout()
plt.show()`
                },
                {
                    lang: "python",
                    code: `# 非线性方法对比：t-SNE vs UMAP vs Isomap
from sklearn.manifold import TSNE, Isomap
import umap

# 使用瑞士卷测试不同非线性方法
tsne = TSNE(n_components=2, perplexity=30, random_state=42)
X_tsne = tsne.fit_transform(X)

# 注意：瑞士卷的 n_neighbors 需要足够大以覆盖卷的宽度
iso = Isomap(n_components=2, n_neighbors=15)
X_iso = iso.fit_transform(X)

mapper = umap.UMAP(n_components=2, n_neighbors=15, random_state=42)
X_umap = mapper.fit_transform(X)

fig, axes = plt.subplots(1, 3, figsize=(15, 5))
for ax, data, title in [(axes[0], X_tsne, 't-SNE'),
                         (axes[1], X_iso, 'Isomap'),
                         (axes[2], X_umap, 'UMAP')]:
    ax.scatter(data[:, 0], data[:, 1], c=color, cmap='viridis', s=10)
    ax.set_title(f'{title} Unfolds Swiss Roll')
    ax.set_aspect('equal')

plt.tight_layout()
plt.show()`
                }
            ],
            table: {
                headers: ["方法", "线性/非线性", "保留结构", "计算复杂度"],
                rows: [
                    ["PCA", "线性", "全局方差", "O(nd^2 + d^3)"],
                    ["t-SNE", "非线性", "局部邻域", "O(n^2) / O(n log n)"],
                    ["UMAP", "非线性", "局部 + 全局", "O(n^1.15)"],
                    ["Isomap", "非线性", "测地线距离", "O(n^2 ~ n^3)"],
                ]
            },
            mermaid: `graph TD
    A["高维数据"] --> B{"流形结构?"}
    B -->|"是"| C["非线性降维"]
    B -->|"否"| D["PCA 即可"]
    C --> E["t-SNE: 局部结构优先"]
    C --> F["UMAP: 局部+全局均衡"]
    C --> G["Isomap: 测地线距离"]
    E --> H["可视化探索"]
    F --> H
    G --> H
    D --> H`,
            tip: "如果数据是线性子空间（如高斯分布），PCA 足够且更快；如果数据有弯曲结构（如图像、文本嵌入），考虑 t-SNE 或 UMAP。",
            warning: "非线性降维的结果不具备可解释性——2D 坐标轴没有物理含义，不能像 PCA 主成分那样解释每个维度代表什么。",
        },
        {
            title: "2. t-SNE 原理——高斯分布与 KL 散度",
            body: `t-SNE 的核心思想非常优雅：在高维空间和低维空间中分别定义点对之间的「相似度」分布，然后让低维分布尽可能接近高维分布。在高维空间中，对于每个数据点 x_i，t-SNE 以 x_i 为中心构建一个高斯分布，计算所有其他点 x_j 在这个高斯分布下的条件概率 p(j|i)。距离 x_i 越近的点，条件概率越大，意味着它们在高维空间中是「邻居」的可能性越高。

关键技巧在于方差的选择——t-SNE 使用 perplexity（困惑度）来隐式控制每个点的高斯方差。在低维空间中，t-SNE 不使用高斯分布，而是使用自由度为 1 的 t 分布（即柯西分布）。为什么要用 t 分布？因为 t 分布的尾部比高斯分布重得多（heavy-tailed），这使得低维空间中距离较远的点可以被推得更远，从而缓解「拥挤问题」（crowding problem）。最后，t-SNE 使用 KL 散度（Kullback-Leibler Divergence）来衡量高维联合分布 P 和低维联合分布 Q 之间的差异，通过梯度下降最小化这个差异。`,
            code: [
                {
                    lang: "python",
                    code: `import numpy as np
import matplotlib.pyplot as plt

# 对比高斯分布 vs t 分布（柯西）的尾部行为
x = np.linspace(-6, 6, 500)

# 标准高斯分布
gaussian = np.exp(-x**2 / 2) / np.sqrt(2 * np.pi)

# 自由度为 1 的 t 分布（柯西分布）
t_dist = 1 / (np.pi * (1 + x**2))

fig, ax = plt.subplots(figsize=(8, 5))
ax.plot(x, gaussian, 'b-', linewidth=2, label='Gaussian (light tails)')
ax.plot(x, t_dist, 'r-', linewidth=2, label='t-distribution (heavy tails)')
ax.fill_between(x, t_dist, alpha=0.15, color='red',
                label='t-dist pushes far points further')
ax.set_xlim(-4, 4)
ax.set_ylim(0, 0.45)
ax.set_title('Gaussian vs t-Distribution: Why t-SNE Uses t-Dist')
ax.legend()
ax.grid(True, alpha=0.3)
plt.show()`
                },
                {
                    lang: "python",
                    code: `# KL 散度可视化：衡量两个分布的差异
from scipy.stats import norm

def kl_divergence(p, q):
    p = np.asarray(p) + 1e-10
    q = np.asarray(q) + 1e-10
    return np.sum(p * np.log(p / q))

# 两个不同的分布
x = np.linspace(-5, 5, 200)
p_true = norm.pdf(x, loc=0, scale=1)
q_good = norm.pdf(x, loc=0.3, scale=1.1)
q_bad = norm.pdf(x, loc=2, scale=0.5)

p_true /= p_true.sum()
q_good /= q_good.sum()
q_bad /= q_bad.sum()

kl_good = kl_divergence(p_true, q_good)
kl_bad = kl_divergence(p_true, q_bad)

print(f"KL(P || Q_good) = {kl_good:.4f} (分布接近)")
print(f"KL(P || Q_bad)  = {kl_bad:.4f} (分布远离)")

fig, ax = plt.subplots(figsize=(8, 5))
ax.plot(x, p_true, 'k-', linewidth=2, label='P (high-dim truth)')
ax.plot(x, q_good, 'b--', linewidth=2, label=f'Q_good (KL={kl_good:.3f})')
ax.plot(x, q_bad, 'r--', linewidth=2, label=f'Q_bad (KL={kl_bad:.3f})')
ax.set_title('KL Divergence: Measuring Distribution Difference')
ax.legend()
ax.grid(True, alpha=0.3)
plt.show()`
                }
            ],
            table: {
                headers: ["概念", "数学公式", "作用"],
                rows: [
                    ["高斯条件概率", "p(j|i) = exp(-||x_i-x_j||^2 / 2*sigma_i^2) / Z", "高维邻域相似度"],
                    ["t 分布相似度", "q(j|i) = (1 + ||y_i-y_j||^2)^(-1) / Z", "低维邻域相似度（重尾）"],
                    ["联合分布", "p_ij = (p(j|i) + p(i|j)) / 2n", "对称化联合概率"],
                    ["KL 散度", "KL(P||Q) = sum p_ij * log(p_ij / q_ij)", "优化目标函数"],
                ]
            },
            mermaid: `graph TD
    A["高维数据 X"] --> B["高斯分布 p(j|i)"]
    B --> C["对称化 p_ij"]
    D["低维嵌入 Y"] --> E["t 分布 q(j|i)"]
    E --> F["对称化 q_ij"]
    C --> G["KL(P || Q)"]
    F --> G
    G --> H["梯度下降优化 Y"]
    H --> D`,
            tip: "KL 散度是不对称的——KL(P||Q) 不等于 KL(Q||P)。t-SNE 选择 KL(P||Q) 意味着它更关注高维中相邻的点在低维中也相邻。",
            warning: "KL 散度对 q_ij 接近零而 p_ij 不为零的情况惩罚极大——这导致 t-SNE 几乎不会把高维中的邻居在低维中分开，但允许把高维中不近的点在低维中拉近。",
        },
        {
            title: "3. t-SNE 超参数详解——perplexity 与 learning_rate",
            body: `t-SNE 虽然强大，但对超参数相当敏感。最重要的两个参数是 perplexity（困惑度）和 learning_rate（学习率）。perplexity 可以理解为「有效邻居数」——它决定了每个点的高斯分布的宽度。perplexity 越小，高斯越窄，只有最近的邻居才被考虑；perplexity 越大，高斯越宽，更多的远距离点也被纳入邻域。van der Maaten 建议 perplexity 取值在 5 到 50 之间，对于大数据集可以尝试更大的值。经验法则是 perplexity 约等于样本数的平方根。

learning_rate（早期也称为 early_exaggeration 阶段的步长）控制梯度下降的步长。t-SNE 默认值通常是 200，但对于大数据集可能需要调到 10 到 1000 之间。学习率太小会导致收敛极慢，陷入局部最优；学习率太大会导致优化不稳定，点与点之间「弹跳」。此外，early_exaggeration（早期夸大因子，默认 12）在优化初期人为放大高维相似度，帮助形成紧密的簇结构，之后再恢复正常比例。`,
            code: [
                {
                    lang: "python",
                    code: `import numpy as np
import matplotlib.pyplot as plt
from sklearn.datasets import load_digits
from sklearn.manifold import TSNE

X, y = load_digits(return_X_y=True)

# perplexity 对结果的影响
fig, axes = plt.subplots(2, 3, figsize=(15, 10))
perplexities = [2, 5, 15, 30, 50, 80]

for idx, perp in enumerate(perplexities):
    row, col = idx // 3, idx % 3
    tsne = TSNE(n_components=2, perplexity=perp,
                random_state=42, max_iter=500)
    X_embedded = tsne.fit_transform(X)

    scatter = axes[row, col].scatter(
        X_embedded[:, 0], X_embedded[:, 1],
        c=y, cmap='tab10', s=15, alpha=0.7
    )
    axes[row, col].set_title(f'perplexity={perp}')
    axes[row, col].axis('off')

plt.suptitle('t-SNE: Effect of Perplexity on MNIST Digits', fontsize=14)
plt.tight_layout()
plt.show()`
                },
                {
                    lang: "python",
                    code: `# learning_rate 和 early_exaggeration 的影响
from sklearn.manifold import TSNE

fig, axes = plt.subplots(2, 2, figsize=(10, 10))
params = [
    (50, 12, 'lr=50 (too small)'),
    (200, 12, 'lr=200 (default)'),
    (800, 12, 'lr=800 (may overshoot)'),
    (200, 4, 'early_exag=4 (weak clustering)'),
]

for idx, (lr, ee, title) in enumerate(params):
    row, col = idx // 2, idx % 2
    tsne = TSNE(n_components=2, perplexity=30,
                learning_rate=lr, early_exaggeration=ee,
                random_state=42, max_iter=1000)
    X_embedded = tsne.fit_transform(X)

    axes[row, col].scatter(
        X_embedded[:, 0], X_embedded[:, 1],
        c=y, cmap='tab10', s=15, alpha=0.7
    )
    axes[row, col].set_title(title)
    axes[row, col].axis('off')

plt.suptitle('t-SNE: Learning Rate & Early Exaggeration', fontsize=14)
plt.tight_layout()
plt.show()`
                }
            ],
            table: {
                headers: ["超参数", "默认值", "推荐范围", "影响"],
                rows: [
                    ["perplexity", "30", "5~50", "邻居数感知，控制局部/全局平衡"],
                    ["learning_rate", "200", "10~1000", "优化步长，太小收敛慢、太大不稳定"],
                    ["early_exaggeration", "12", "4~24", "初期簇紧凑度"],
                    ["n_iter", "1000", "250~5000", "迭代次数，影响收敛质量"],
                ]
            },
            mermaid: `graph TD
    A["选择 perplexity"] --> B{"样本量?"}
    B -->|"< 300"| C["perplexity = 5~15"]
    B -->|"300~3000"| D["perplexity = 15~50"]
    B -->|"> 3000"| E["perplexity = 30~80"]
    C --> F["设置 learning_rate"]
    D --> F
    E --> F
    F --> G{"优化稳定?"}
    G -->|"震荡"| H["降低 learning_rate"]
    G -->|"收敛慢"| I["增大 learning_rate"]
    G -->|"稳定"| J["调整 early_exaggeration"]
    H --> J
    I --> J
    J --> K["最终可视化结果"]`,
            tip: "perplexity 的选择本质上是在 trade-off 局部和全局结构——小的 perplexity 保留更多局部细节，大的 perplexity 保留更多全局趋势。建议尝试多个值对比。",
            warning: "t-SNE 的随机种子不同会导致完全不同的结果。如果结果看起来不合理，换一个 random_state 试试——这是随机初始化的特性，不是 bug。",
        },
        {
            title: "4. UMAP 原理——流形学习与模糊拓扑",
            body: `UMAP 的理论基础来自代数拓扑和黎曼几何，但它的直觉并不复杂。UMAP 假设数据均匀采样自某个黎曼流形（Riemannian manifold），然后通过两个步骤构建低维嵌入。第一步，在高维空间中构建一个模糊拓扑表示（fuzzy topological representation）：对每个点，找到其 k 近邻，然后用指数衰减函数将距离转换为「连接强度」——距离越近连接越强，距离越远连接越弱。这形成了一个加权图，边的权重代表点对之间的模糊隶属度。

第二步，在低维空间中构建一个类似的加权图，然后使用交叉熵（cross-entropy）作为损失函数，通过随机梯度下降优化低维点的位置，使得低维图的拓扑结构与高维图尽可能一致。UMAP 使用了一个巧妙的参数化：对每个点 x_i，它自适应地选择一个局部尺度 sigma_i（类似于 t-SNE 中的高斯方差），使得以 x_i 为中心、恰好包含 n_neighbors 个邻居的区域有合理的连接强度。这避免了 t-SNE 中需要通过二分搜索确定方差的过程，使 UMAP 的计算效率大幅提升。`,
            code: [
                {
                    lang: "python",
                    code: `import numpy as np
import matplotlib.pyplot as plt

# UMAP 核心概念：局部尺度自适应
rng = np.random.RandomState(42)
n = 200

# 生成两个密度不同的簇
X1 = rng.randn(n, 2) * 0.5 + np.array([0, 0])
X2 = rng.randn(n, 2) * 2.0 + np.array([8, 8])
X = np.vstack([X1, X2])

# 计算每个点的局部距离（到第 k 近邻的距离）
from sklearn.neighbors import NearestNeighbors

k = 15
nn = NearestNeighbors(n_neighbors=k+1)
nn.fit(X)
distances, _ = nn.kneighbors(X)
local_scales = distances[:, -1]

fig, axes = plt.subplots(1, 2, figsize=(12, 5))
axes[0].scatter(X[:, 0], X[:, 1], c=local_scales, cmap='RdYlBu_r', s=15)
axes[0].set_title('Local Scale (distance to k-th neighbor)')
axes[0].set_aspect('equal')
plt.colorbar(axes[0].collections[0], ax=axes[0],
             label='Local rho')

# 连接强度可视化（选一个点）
center = X[0]
dists_to_center = np.sqrt(np.sum((X - center)**2, axis=1))
rho = local_scales[0]
strength = np.exp(-(dists_to_center - rho) / rho)
strength = np.clip(strength, 0, 1)

axes[1].scatter(X[:, 0], X[:, 1], c=strength, cmap='viridis', s=15)
axes[1].scatter(center[0], center[1], c='red', s=50, zorder=5, marker='x')
axes[1].set_title('Connection Strength from Point 0')
axes[1].set_aspect('equal')
plt.colorbar(axes[1].collections[0], ax=axes[1], label='Connection Weight')
plt.tight_layout()
plt.show()`
                },
                {
                    lang: "python",
                    code: `# UMAP 的交叉熵损失 vs t-SNE 的 KL 散度
import numpy as np
import matplotlib.pyplot as plt

def kl_term(p, q):
    if p < 1e-10:
        return 0.0
    return p * np.log(p / max(q, 1e-10))

def cross_entropy_term(p, q):
    p = np.clip(p, 1e-10, 1 - 1e-10)
    q = np.clip(q, 1e-10, 1 - 1e-10)
    return p * np.log(p / q) + (1 - p) * np.log((1 - p) / (1 - q))

q_vals = np.linspace(0.001, 0.5, 100)
p_vals = [0.01, 0.1, 0.3]

fig, axes = plt.subplots(1, 2, figsize=(12, 5))

for p in p_vals:
    kl = [kl_term(p, q) for q in q_vals]
    axes[0].plot(q_vals, kl, label=f'p={p}')
axes[0].set_title('t-SNE: KL Divergence Term')
axes[0].set_xlabel('q (low-dim similarity)')
axes[0].set_ylabel('Contribution to loss')
axes[0].legend()
axes[0].grid(True, alpha=0.3)

for p in p_vals:
    ce = [cross_entropy_term(p, q) for q in q_vals]
    axes[1].plot(q_vals, ce, label=f'p={p}')
axes[1].set_title('UMAP: Cross-Entropy Term')
axes[1].set_xlabel('q (low-dim similarity)')
axes[1].set_ylabel('Contribution to loss')
axes[1].legend()
axes[1].grid(True, alpha=0.3)

plt.tight_layout()
plt.show()`
                }
            ],
            table: {
                headers: ["特性", "t-SNE", "UMAP"],
                rows: [
                    ["损失函数", "KL 散度", "交叉熵（带负采样）"],
                    ["高维相似度", "高斯条件概率", "指数衰减 + 自适应局部尺度"],
                    ["低维相似度", "t 分布（柯西）", "1 / (1 + a * d^(2b))"],
                    ["优化", "全量梯度下降", "随机梯度下降 + 负采样"],
                    ["全局结构", "不保留", "部分保留"],
                ]
            },
            mermaid: `graph TD
    A["高维数据 X"] --> B["构建 k 近邻图"]
    B --> C["自适应局部尺度 rho_i"]
    C --> D["模糊拓扑: p_ij = exp(-max(d-rho, 0)/sigma)"]
    D --> E["对称化: p_ij + p_ji - p_ij*p_ji"]
    A --> F["低维嵌入 Y 初始化"]
    F --> G["低维相似度 q_ij"]
    G --> H["交叉熵损失 CE(P, Q)"]
    E --> H
    H --> I["SGD 优化 Y"]
    I --> F`,
            tip: "UMAP 的 n_neighbors 参数类似于 t-SNE 的 perplexity，但含义更直观——就是每个点的近邻数量。较小的值（5-15）关注局部结构，较大的值（30-100）关注全局结构。",
            warning: "UMAP 的 min_dist 参数（默认 0.1）控制嵌入中点之间的最小距离——设得太小会导致点聚成一团，设得太大又会过度分散，失去邻域信息。",
        },
        {
            title: "5. t-SNE vs UMAP vs PCA 全面对比",
            body: `选择哪种降维方法取决于你的具体需求。PCA 是线性方法，速度最快，结果可解释（主成分有明确的方差含义），适合数据预处理和特征压缩，但在可视化非线性结构时效果不佳。t-SNE 是可视化的黄金标准——它能产生非常清晰的簇分离，特别适合探索性数据分析，但计算成本高（O(n^2)），且几乎不保留全局结构（簇之间的距离没有意义）。UMAP 在速度和全局结构保留上取得了很好的平衡——它比 t-SNE 快数倍，且能更好地保留数据的全局拓扑，但簇分离的「视觉冲击力」有时略逊于 t-SNE。

在实践中，一个常见的工作流程是：先用 PCA 降到中等维度（如 50 维）去除噪声并加速，再用 t-SNE 或 UMAP 降到 2D 进行可视化。这种 PCA + t-SNE/UMAP 的组合既利用了 PCA 的去噪和加速优势，又获得了非线性方法的可视化效果。对于超过 10 万样本的大数据集，UMAP 几乎是唯一可行的选择——t-SNE 的 Barnes-Hut 实现虽然降到了 O(n log n)，但仍然显著慢于 UMAP。`,
            code: [
                {
                    lang: "python",
                    code: `import numpy as np
import matplotlib.pyplot as plt
import time
from sklearn.datasets import load_digits
from sklearn.decomposition import PCA
from sklearn.manifold import TSNE
import umap

X, y = load_digits(return_X_y=True)

methods = {}

# PCA
start = time.time()
pca = PCA(n_components=2)
X_pca = pca.fit_transform(X)
methods['PCA'] = (X_pca, time.time() - start, f'Var: {pca.explained_variance_ratio_.sum():.2%}')

# t-SNE
start = time.time()
tsne = TSNE(n_components=2, perplexity=30, random_state=42)
X_tsne = tsne.fit_transform(X)
methods['t-SNE'] = (X_tsne, time.time() - start, f'KL: {tsne.kl_divergence_:.1f}')

# UMAP
start = time.time()
um = umap.UMAP(n_components=2, n_neighbors=15, random_state=42)
X_umap = um.fit_transform(X)
methods['UMAP'] = (X_umap, time.time() - start, '')

fig, axes = plt.subplots(1, 3, figsize=(15, 5))
for idx, (name, (data, t, metric)) in enumerate(methods.items()):
    axes[idx].scatter(data[:, 0], data[:, 1], c=y, cmap='tab10',
                      s=20, alpha=0.7, edgecolors='none')
    axes[idx].set_title(f'{name}\\n{metric} | Time: {t:.2f}s')
    axes[idx].axis('off')

plt.suptitle('PCA vs t-SNE vs UMAP: MNIST Digits', fontsize=14)
plt.tight_layout()
plt.show()`
                },
                {
                    lang: "python",
                    code: `# 全局结构保留度对比：测量降维后距离与原始距离的相关性
from scipy.spatial.distance import pdist
from scipy.stats import spearmanr

rng = np.random.RandomState(42)
n_pairs = 5000
n_samples = len(X)
idx = rng.choice(n_samples, n_pairs * 2, replace=True).reshape(n_pairs, 2)

high_dim_dists = np.array([
    np.linalg.norm(X[i] - X[j]) for i, j in idx
])

for name, (data, _, _) in methods.items():
    low_dim_dists = np.array([
        np.linalg.norm(data[i] - data[j]) for i, j in idx
    ])
    rho, p_val = spearmanr(high_dim_dists, low_dim_dists)
    print(f"{name}: Spearman rho = {rho:.4f} (p={p_val:.2e})")

# 可视化距离相关性
fig, axes = plt.subplots(1, 3, figsize=(15, 5))
for idx_, (name, (data, _, _)) in enumerate(methods.items()):
    low_dim_dists = np.array([
        np.linalg.norm(data[i] - data[j]) for i, j in idx
    ])
    axes[idx_].scatter(high_dim_dists, low_dim_dists,
                       alpha=0.1, s=2)
    rho, _ = spearmanr(high_dim_dists, low_dim_dists)
    axes[idx_].set_title(f'{name} (rho={rho:.3f})')
    axes[idx_].set_xlabel('High-dim Distance')
    axes[idx_].set_ylabel('Low-dim Distance')
    axes[idx_].grid(True, alpha=0.3)

plt.tight_layout()
plt.show()`
                }
            ],
            table: {
                headers: ["指标", "PCA", "t-SNE", "UMAP"],
                rows: [
                    ["速度（1797 样本）", "~0.01s", "~2s", "~0.5s"],
                    ["全局结构保留", "优秀", "差", "好"],
                    ["局部结构保留", "中等", "优秀", "优秀"],
                    ["可扩展性", "O(nd^2)", "O(n log n)", "O(n^1.15)"],
                    ["结果可解释性", "高（方差含义）", "无", "低"],
                    ["随机性", "确定性", "强随机", "弱随机"],
                    ["适用场景", "预处理/压缩", "探索性可视化", "大规模可视化"],
                ]
            },
            mermaid: `graph TD
    A["选择降维方法"] --> B{"目标是什么?"}
    B -->|"特征压缩/去噪"| C["PCA"]
    B -->|"探索性可视化"| D{"数据量?"}
    D -->|"< 10K"| E["t-SNE (清晰簇)"]
    D -->|"> 10K"| F["UMAP (快速)"]
    D -->|"需保留全局结构"| F
    B -->|"大规模生产环境"| G["UMAP"]
    C --> H["PCA -> UMAP 组合"]
    E --> H
    F --> H
    G --> H`,
            tip: "对于探索性数据分析，先用 PCA 看看数据是否有明显的线性结构——如果有，可能不需要非线性方法；如果 PCA 结果一团糟，再用 t-SNE 或 UMAP。",
            warning: "不要比较不同次运行之间 t-SNE 或 UMAP 的簇间距——每次运行的结果尺度不同，簇之间的距离没有跨运行的可比性。",
        },
        {
            title: "6. 高维数据可视化最佳实践",
            body: `高维数据可视化不仅仅是调用一个 API 那么简单。实践中有很多坑需要注意。首先，降维前必须做数据标准化——如果特征的量纲不同（如一个特征是 0-1 的概率，另一个是 1000-10000 的整数），不标准化的结果会被量纲大的特征主导。其次，对于极高维数据（如词嵌入 300 维、图像 4096 维），建议先用 PCA 降到 50 维左右再做 t-SNE 或 UMAP——这既能去噪又能加速，而且通常可视化效果反而更好。

第三个关键实践是「多尺度观察」——对同一数据集，用不同的 perplexity（t-SNE）或 n_neighbors（UMAP）生成多个可视化结果，观察簇结构在不同尺度下的稳定性。如果一个簇在多个参数设置下都保持完整，说明它是真实的数据结构而非参数伪影。最后，可视化结果一定要结合领域知识解读——算法只是工具，最终的洞察来自你对数据本身的理解。不要过度解读可视化中的小细节，特别是孤立的点或细小的簇结构。`,
            code: [
                {
                    lang: "python",
                    code: `import numpy as np
import matplotlib.pyplot as plt
import umap

# 模拟多尺度观察
rng = np.random.RandomState(42)
X = rng.randn(1000, 50)
# 创建 5 个簇
for i in range(5):
    X[i*200:(i+1)*200] += rng.randn(1, 50) * 3 + i * 5

fig, axes = plt.subplots(2, 3, figsize=(15, 10))
labels = np.repeat(np.arange(5), 200)
neighbors_list = [5, 10, 15, 30, 50, 100]

for idx, n_nei in enumerate(neighbors_list):
    row, col = idx // 3, idx % 3
    um = umap.UMAP(n_components=2, n_neighbors=n_nei,
                   min_dist=0.1, random_state=42)
    X_embed = um.fit_transform(X)

    axes[row, col].scatter(X_embed[:, 0], X_embed[:, 1],
                           c=labels, cmap='tab10', s=10, alpha=0.7)
    axes[row, col].set_title(f'n_neighbors={n_nei}')
    axes[row, col].axis('off')

plt.suptitle('Multi-Scale UMAP: Stability Analysis', fontsize=14)
plt.tight_layout()
plt.show()`
                },
                {
                    lang: "python",
                    code: `# 最佳实践：PCA 预降维 + 标准化 + UMAP 的完整流程
from sklearn.pipeline import Pipeline
from sklearn.decomposition import PCA
from sklearn.preprocessing import StandardScaler
import umap

def create_dim_reduction_pipeline(pca_dims=50,
                                   umap_neighbors=15,
                                   umap_min_dist=0.1,
                                   random_state=42):
    return Pipeline([
        ('scaler', StandardScaler()),
        ('pca', PCA(n_components=pca_dims, random_state=random_state)),
        ('umap', umap.UMAP(
            n_components=2,
            n_neighbors=umap_neighbors,
            min_dist=umap_min_dist,
            random_state=random_state
        ))
    ])

pipeline = create_dim_reduction_pipeline(
    pca_dims=50,
    umap_neighbors=15,
    random_state=42
)
X_embedded = pipeline.fit_transform(X)

pca_step = pipeline.named_steps['pca']
print(f"PCA 保留方差: {pca_step.explained_variance_ratio_.sum():.2%}")
print(f"PCA 降维: {X.shape[1]} -> {pca_step.n_components_}")
print(f"UMAP 输出: {X_embedded.shape}")`
                }
            ],
            table: {
                headers: ["最佳实践", "具体做法", "原因"],
                rows: [
                    ["标准化", "StandardScaler 或 RobustScaler", "消除量纲差异影响"],
                    ["PCA 预降维", "先降到 30-100 维", "去噪 + 加速 + 改善效果"],
                    ["多尺度观察", "尝试多个 perplexity/n_neighbors", "验证簇结构的稳定性"],
                    ["固定随机种子", "random_state 固定", "结果可复现"],
                    ["结合领域知识", "不要仅依赖可视化结论", "避免参数伪影误导"],
                ]
            },
            mermaid: `graph TD
    A["原始高维数据"] --> B["数据清洗"]
    B --> C["缺失值处理"]
    C --> D["标准化/归一化"]
    D --> E{"维度 > 100?"}
    E -->|"是"| F["PCA 降到 30-100 维"]
    E -->|"否"| G["直接使用"]
    F --> H["t-SNE / UMAP"]
    G --> H
    H --> I["多尺度参数扫描"]
    I --> J["结果稳定性分析"]
    J --> K["领域知识解读"]
    K --> L["最终洞察报告"]`,
            tip: "对于文本数据，先用 TF-IDF 或 Word2Vec 提取特征，然后 PCA 降到 50 维，再 UMAP 降到 2D——这是文本可视化的标准流程。",
            warning: "不要将降维可视化结果直接作为下游模型的输入特征——t-SNE 和 UMAP 会为每个新数据点生成不同的嵌入（没有 transform 方法，UMAP 虽有但效果受限）。",
        },
        {
            title: "7. 实战——MNIST 与词嵌入可视化",
            body: `这一章我们将 t-SNE 和 UMAP 应用到两个经典场景：MNIST 手写数字数据集和预训练词嵌入。MNIST 是最常用的可视化基准——1797 张 8×8 的灰度手写数字图片（64 维），包含 10 个类别。虽然维度不高，但数字之间的边界并非线性可分，非常适合展示非线性降维的优势。词嵌入（如 Word2Vec、GloVe）则是另一个经典场景——每个词被表示为一个 300 维的密集向量，语义相近的词在向量空间中距离较近。将 300 维词嵌入降到 2D，可以直观地看到语义空间的拓扑结构。

这两个实战涵盖了降维可视化的两种典型用例：有标签数据的类别分离（MNIST）和无标签数据的语义结构探索（词嵌入）。通过这两个例子，你将掌握从数据加载、预处理、降维到可视化的完整流程。`,
            code: [
                {
                    lang: "python",
                    code: `import numpy as np
import matplotlib.pyplot as plt
from sklearn.datasets import load_digits
from sklearn.decomposition import PCA
import umap
from sklearn.manifold import TSNE

# ========== MNIST Digits 可视化 ==========
X, y = load_digits(return_X_y=True)

# PCA 预降维加速
pca = PCA(n_components=30, random_state=42)
X_pca = pca.fit_transform(X)

# UMAP
um = umap.UMAP(n_components=2, n_neighbors=15,
               min_dist=0.1, random_state=42)
X_umap = um.fit_transform(X_pca)

# t-SNE
tsne = TSNE(n_components=2, perplexity=30, random_state=42)
X_tsne = tsne.fit_transform(X_pca)

fig, axes = plt.subplots(1, 2, figsize=(14, 6))

for ax, data, title in [(axes[0], X_tsne, 't-SNE'),
                         (axes[1], X_umap, 'UMAP')]:
    scatter = ax.scatter(data[:, 0], data[:, 1], c=y,
                         cmap='tab10', s=25, alpha=0.7,
                         edgecolors='none')
    ax.set_title(f'{title} on MNIST Digits', fontsize=14)
    ax.set_xlabel('Dim 1')
    ax.set_ylabel('Dim 2')

plt.colorbar(scatter, label='Digit Label',
             ticks=range(10), ax=axes.ravel().tolist())
plt.tight_layout()
plt.show()`
                },
                {
                    lang: "python",
                    code: `# ========== 词嵌入可视化 ==========
import numpy as np
import matplotlib.pyplot as plt
import umap

rng = np.random.RandomState(42)
vocab = {
    'cat': rng.randn(300) * 0.3 + np.array([2, 0, 0] + [0]*297),
    'dog': rng.randn(300) * 0.3 + np.array([2.2, 0.1, 0] + [0]*297),
    'bird': rng.randn(300) * 0.3 + np.array([1.8, -0.1, 0.5] + [0]*297),
    'fish': rng.randn(300) * 0.3 + np.array([1.5, 0, 0.3] + [0]*297),
    'apple': rng.randn(300) * 0.3 + np.array([-2, 2, 0] + [0]*297),
    'banana': rng.randn(300) * 0.3 + np.array([-2.1, 1.8, 0] + [0]*297),
    'pizza': rng.randn(300) * 0.3 + np.array([-1.5, 2.2, 0] + [0]*297),
    'rice': rng.randn(300) * 0.3 + np.array([-2.2, 1.5, 0] + [0]*297),
    'china': rng.randn(300) * 0.3 + np.array([0, -2, 2] + [0]*297),
    'france': rng.randn(300) * 0.3 + np.array([0.1, -1.8, 1.5] + [0]*297),
    'japan': rng.randn(300) * 0.3 + np.array([-0.2, -2.1, 2.2] + [0]*297),
    'brazil': rng.randn(300) * 0.3 + np.array([0, -1.5, 1.8] + [0]*297),
}

words = list(vocab.keys())
X_words = np.array([vocab[w] for w in words])
categories = ['animal']*4 + ['food']*4 + ['country']*4
cat_colors = {'animal': 'red', 'food': 'green', 'country': 'blue'}

um = umap.UMAP(n_components=2, n_neighbors=3,
               min_dist=0.3, random_state=42)
X_2d = um.fit_transform(X_words)

fig, ax = plt.subplots(figsize=(10, 8))
for word, (x, y), cat in zip(words, X_2d, categories):
    ax.scatter(x, y, c=cat_colors[cat], s=100, alpha=0.8)
    ax.annotate(word, (x, y), fontsize=11,
                ha='center', va='bottom',
                fontweight='bold')

for cat, color in cat_colors.items():
    ax.scatter([], [], c=color, label=cat, s=100)
ax.legend(fontsize=12)
ax.set_title('Word Embedding Visualization (UMAP)', fontsize=14)
ax.grid(True, alpha=0.3)
ax.axis('off')
plt.show()`
                }
            ],
            table: {
                headers: ["数据集", "维度", "样本数", "推荐方法", "关键参数"],
                rows: [
                    ["MNIST Digits", "64", "1797", "t-SNE 或 UMAP", "perplexity=30 / n_neighbors=15"],
                    ["GloVe 词嵌入", "300", "400K", "PCA -> UMAP", "PCA=50, n_neighbors=15"],
                    ["ImageNet 特征", "2048", "1.2M", "PCA -> UMAP", "PCA=100, n_neighbors=30"],
                    ["单细胞 RNA-seq", "20000+", "10K-1M", "PCA -> UMAP", "PCA=50, n_neighbors=10-30"],
                ]
            },
            mermaid: `graph TD
    A["选择数据集"] --> B{"有标签?"}
    B -->|"是"| C["类别着色验证"]
    B -->|"否"| D["语义结构探索"]
    C --> E["MNIST: 簇分离度"]
    D --> F["词嵌入: 语义邻域"]
    E --> G["评估: 轮廓系数 / 视觉检查"]
    F --> G
    G --> H{"结果满意?"}
    H -->|"否"| I["调整参数 / 换方法"]
    H -->|"是"| J["导出可视化"]
    I --> E
    I --> F
    J --> K["报告与洞察"]`,
            tip: "对于大规模词嵌入，不要直接用 UMAP 处理全部词汇——先过滤低频词（出现次数少于 100 次），或者采样 5000-10000 个高频词进行可视化，效果更清晰。",
            warning: "词嵌入可视化中，语义关系的方向性（如 'king' - 'man' + 'woman' ≈ 'queen'）在 2D 降维后可能丢失——降维只保留距离信息，不保留向量运算关系。",
        },
    ],
};
