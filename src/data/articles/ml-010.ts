import { Article } from '../knowledge';

export const article: Article = {
    id: "ml-010",
    title: "PCA：主成分分析降维",
    category: "ml",
    tags: ["降维", "特征提取", "PCA"],
    summary: "从协方差矩阵到奇异值分解，理解最常用的降维算法",
    date: "2026-04-12",
    readTime: "18 min",
    level: "进阶",
    content: [
        {
            title: "1. 降维的动机——维度灾难",
            body: `现实世界的数据往往具有极高的维度。一张 224×224 的 RGB 图像有 150,528 维，一个包含 10,000 个基因的表达矩阵有 10,000 维。高维度带来的第一个问题是「维度灾难」：随着维度增加，数据在高维空间中变得极度稀疏，样本之间的欧氏距离趋于收敛，基于距离的算法（如 KNN、K-Means）性能急剧下降。

降维的本质是在信息损失可接受的前提下，将数据投影到一个低维子空间中。降维有三大动机：可视化（降到 2D/3D 方便人类观察）、去噪（丢弃方差小的方向通常对应噪声）、加速计算（减少后续模型的输入维度，降低过拟合风险）。PCA 是其中最经典的方法——它通过线性变换找到数据中方差最大的方向，用尽可能少的主成分来近似表达原始数据。`,
            code: [
                {
                    lang: "python",
                    code: `import numpy as np
import matplotlib.pyplot as plt

# 维度灾难演示：随机点之间的平均距离随维度增长趋于收敛
dims = np.arange(1, 100)
avg_dists = []
rng = np.random.RandomState(42)
for d in dims:
    points = rng.randn(1000, d)
    # 随机采样 5000 对点计算平均欧氏距离
    idx1, idx2 = rng.randint(0, 1000, (2, 5000))
    dists = np.sqrt(np.sum((points[idx1] - points[idx2])**2, axis=1))
    avg_dists.append(dists.mean())

plt.figure(figsize=(8, 4))
plt.plot(dims, avg_dists, 'b-', linewidth=2)
plt.xlabel("Dimension"); plt.ylabel("Average Euclidean Distance")
plt.title("Dimensionality Curse: Distances Converge")
plt.grid(True, alpha=0.3)
plt.show()`
                },
                {
                    lang: "python",
                    code: `# 不同降维算法对比概览
from sklearn.decomposition import PCA, KernelPCA, FastICA
from sklearn.manifold import TSNE, Isomap

# PCA: 线性、保留全局方差、速度快
pca = PCA(n_components=2)

# Kernel PCA: 非线性核技巧
kpca = KernelPCA(n_components=2, kernel='rbf', gamma=15)

# t-SNE: 保留局部邻域结构，适合可视化
tsne = TSNE(n_components=2, perplexity=30, random_state=42)

# Isomap: 基于测地线距离的流形学习
iso = Isomap(n_components=2, n_neighbors=10)

# 选择依据：数据是否有非线性流形结构？
# 线性数据 → PCA；非线性流形 → t-SNE/Isomap
# 计算效率要求高 → PCA；可视化探索 → t-SNE`
                }
            ],
            table: {
                headers: ["算法", "线性/非线性", "保留的结构", "适用场景"],
                rows: [
                    ["PCA", "线性", "全局方差", "通用降维/预处理"],
                    ["t-SNE", "非线性", "局部邻域", "高维数据可视化"],
                    ["UMAP", "非线性", "局部+全局", "大规模可视化"],
                    ["AutoEncoder", "非线性", "重建损失", "复杂特征学习"],
                ]
            },
            mermaid: `graph LR
    A["高维数据"] --> B["维度灾难"]
    B --> C["距离失效"]
    B --> D["计算昂贵"]
    B --> E["过拟合风险"]
    C --> F["降维动机"]
    D --> F
    E --> F
    F --> G["PCA 线性降维"]`,
            tip: "降维前务必标准化数据，否则量纲大的特征会主导方差方向。",
            warning: "降维必然造成信息损失——保留的方差比例越高，损失越小，但维度降低幅度也越小。",
        },
        {
            title: "2. 协方差矩阵与特征值分解",
            body: `PCA 的数学核心是协方差矩阵。假设我们有 n 个样本、d 个特征的数据矩阵 X（已中心化，即每个特征减去均值），协方差矩阵 C = (1/(n-1)) X^T X 是一个 d×d 的对称矩阵。C[i][j] 衡量第 i 个和第 j 个特征之间的线性相关程度：正值表示正相关，负值表示负相关，零表示不相关。

协方差矩阵的关键性质在于它是实对称矩阵，根据谱定理，实对称矩阵一定有 d 个实特征值，且对应的特征向量两两正交。PCA 就是要找到这些特征向量——每个特征向量定义了数据空间中的一个方向，对应的特征值表示数据沿该方向的方差大小。特征值越大，该方向携带的信息越多。将这些特征向量按特征值从大到小排列，就得到了主成分的优先级。`,
            code: [
                {
                    lang: "python",
                    code: `import numpy as np

# 生成二维相关数据
rng = np.random.RandomState(42)
theta = np.pi / 6  # 30 度旋转
R = np.array([[np.cos(theta), -np.sin(theta)],
              [np.sin(theta),  np.cos(theta)]])
s = np.array([[3, 0], [0, 0.5]])  # 拉伸
A = R @ s  # 变换矩阵
X_raw = rng.randn(200, 2) @ A.T

# 中心化
X = X_raw - X_raw.mean(axis=0)

# 计算协方差矩阵
cov_matrix = np.cov(X, rowvar=False)
print("协方差矩阵:")
print(cov_matrix)

# 特征值分解
eigenvalues, eigenvectors = np.linalg.eigh(cov_matrix)
# eigh 返回升序排列，需要反转
idx = np.argsort(eigenvalues)[::-1]
eigenvalues = eigenvalues[idx]
eigenvectors = eigenvectors[:, idx]

print(f"\\n特征值: {eigenvalues}")
print(f"主成分方向(PC1): {eigenvectors[:, 0]}")
print(f"主成分方向(PC2): {eigenvectors[:, 1]}")`
                },
                {
                    lang: "python",
                    code: `import matplotlib.pyplot as plt

# 可视化：数据 + 主成分方向
fig, ax = plt.subplots(figsize=(7, 7))
ax.scatter(X[:, 0], X[:, 1], alpha=0.5, s=20, label='Data')

# 绘制主成分轴（按特征值比例缩放）
for i in range(2):
    v = eigenvectors[:, i] * np.sqrt(eigenvalues[i]) * 3
    ax.arrow(0, 0, v[0], v[1],
             head_width=0.3, head_length=0.3,
             fc=['red', 'green'][i], ec=['red', 'green'][i],
             linewidth=2, label=f'PC{i+1} (λ={eigenvalues[i]:.2f})')

ax.axhline(0, color='gray', lw=0.5)
ax.axvline(0, color='gray', lw=0.5)
ax.set_aspect('equal')
ax.legend()
ax.set_title('PCA: Eigenvectors of Covariance Matrix')
ax.grid(True, alpha=0.3)
plt.show()`
                }
            ],
            table: {
                headers: ["概念", "数学表达", "物理意义"],
                rows: [
                    ["协方差矩阵", "C = X^T X / (n-1)", "特征间的线性相关性"],
                    ["特征值 λ", "Cv = λv", "沿主成分方向的方差"],
                    ["特征向量 v", "单位向量", "主成分的方向"],
                    ["谱分解", "C = VΛV^T", "将矩阵分解为正交基"],
                ]
            },
            mermaid: `graph TD
    A["中心化数据 X"] --> B["协方差矩阵 C"]
    B --> C["特征值分解"]
    C --> D["λ₁ ≥ λ₂ ≥ ... ≥ λ_d"]
    C --> E["v₁, v₂, ..., v_d"]
    D --> F["方差大小排序"]
    E --> G["主成分方向"]
    F --> H["选择前 k 个"]
    G --> H
    H --> I["投影矩阵 W = [v₁...v_k]"]`,
            tip: "使用 np.linalg.eigh 而非 eig，因为 eigh 专门针对对称矩阵，数值稳定性更好。",
            warning: "协方差矩阵对异常值极其敏感——几个极端值就能显著改变特征向量方向，考虑先做异常值检测或鲁棒标准化。",
        },
        {
            title: "3. 最大化方差 vs 最小化重构误差",
            body: `PCA 有两种等价的推导视角，理解这一点能深化对算法本质的认识。第一种视角是「最大化投影方差」：我们寻找一个单位方向向量 w，使得数据投影到 w 上的方差 w^T C w 最大化。通过拉格朗日乘子法，这恰好等价于求协方差矩阵的最大特征值对应的特征向量。第二种视角是「最小化重构误差」：我们寻找一个 k 维子空间，使得所有样本点到该子空间的正交距离平方和最小。

这两个看似不同的目标——一个最大化保留的信息，一个最小化丢失的信息——在数学上被证明是完全等价的。这个等价性是 PCA 优美之处：无论从哪个角度切入，答案都是协方差矩阵的前 k 个特征向量。理解这一点很重要，因为不同的教科书可能从不同角度推导 PCA，但殊途同归。`,
            code: [
                {
                    lang: "python",
                    code: `import numpy as np
from scipy.optimize import minimize

# 视角一：最大化投影方差（数值验证）
rng = np.random.RandomState(42)
X = rng.randn(100, 3)
X = X - X.mean(axis=0)
C = X.T @ X / (X.shape[0] - 1)

def neg_variance(w, C):
    """负方差（因为 minimize 做最小化）"""
    w = w / np.linalg.norm(w)  # 归一化
    return -(w @ C @ w)

# 优化找第一主成分
result = minimize(neg_variance, np.array([1, 0, 0]), args=(C,))
w1_opt = result.x / np.linalg.norm(result.x)

# 对比 eigh 的结果
eigenvalues, eigenvectors = np.linalg.eigh(C)
w1_eig = eigenvectors[:, -1]  # 最大特征值对应的向量

print("优化得到 PC1:", w1_opt)
print("eigh 得到  PC1:", w1_eig)
print("方向一致:", np.abs(np.dot(w1_opt, w1_eig)) > 0.99)`
                },
                {
                    lang: "python",
                    code: `# 视角二：最小化重构误差（数值验证）
from scipy.spatial.distance import cdist

def reconstruction_error(W, X):
    """计算投影到 W 子空间后的重构误差"""
    # W 已正交归一化 (d×k)
    X_proj = X @ W @ W.T  # 投影
    return np.sum((X - X_proj) ** 2)

# 用 eigh 的前 k 个特征向量
k = 2
W_eig = eigenvectors[:, -k:]
error_eig = reconstruction_error(W_eig, X)
print(f"特征向量子空间的重构误差: {error_eig:.4f}")

# 对比随机子空间
W_rand = rng.randn(3, k)
W_rand, _ = np.linalg.qr(W_rand)  # QR 正交化
error_rand = reconstruction_error(W_rand, X)
print(f"随机子空间的重构误差:     {error_rand:.4f}")
print(f"PCA 误差更小: {error_eig < error_rand}")`
                }
            ],
            table: {
                headers: ["视角", "优化目标", "约束", "结论"],
                rows: [
                    ["最大化方差", "max w^T C w", "||w|| = 1", "最大特征向量"],
                    ["最小化重构误差", "min ||X - XWW^T||²", "W^T W = I", "前 k 个特征向量"],
                    ["信息论视角", "max 投影熵", "正交约束", "最大不确定性方向"],
                ]
            },
            mermaid: `graph LR
    A["最大化方差"] -->|"拉格朗日乘子"| B["C w = λ w"]
    C["最小化重构误差"] -->|"正交投影定理"| B
    B --> D["特征值问题"]
    D --> E["前 k 个特征向量"]
    E --> F["PCA 投影矩阵"]`,
            tip: "两个视角的等价性说明 PCA 是一个「帕累托最优」方案——在给定维度下，它同时做到了方差最大和损失最小。",
            warning: "重构误差最小化等价于方差最大化仅在使用正交投影时成立。如果允许斜投影，结论不再保证。",
        },
        {
            title: "4. SVD 实现——数值稳定的 PCA",
            body: `虽然 PCA 的数学推导基于特征值分解，但实际实现中几乎都使用奇异值分解（SVD）。SVD 将数据矩阵 X 分解为 X = UΣV^T，其中 U 是 n×n 正交矩阵（左奇异向量），Σ 是 n×d 对角矩阵（奇异值），V 是 d×d 正交矩阵（右奇异向量）。关键关系是：V 的列就是协方差矩阵 X^T X 的特征向量，Σ 的对角元素 σ_i 与特征值的关系为 λ_i = σ_i² / (n-1)。

为什么用 SVD 而不用直接的特征值分解？原因有三：数值稳定性更好（不需要显式计算 X^T X，避免了条件数平方带来的精度损失）、可以处理 n < d 的情况（此时协方差矩阵是奇异的）、现代线性代数库对 SVD 的优化极为成熟（LAPACK 的 dgesdd 使用分治算法，效率极高）。这也是 scikit-learn 中 PCA 默认使用 SVD 的原因。`,
            code: [
                {
                    lang: "python",
                    code: `import numpy as np

# 从 SVD 推导 PCA
rng = np.random.RandomState(42)
X = rng.randn(50, 5)
X = X - X.mean(axis=0)  # 中心化

# SVD 分解
U, S, Vt = np.linalg.svd(X, full_matrices=False)
# Vt 的行是右奇异向量 = 主成分方向
# S 是奇异值
print("右奇异向量形状:", Vt.shape)  # (5, 5)
print("奇异值:", S)

# 验证 SVD 与特征值分解等价
cov = X.T @ X / (X.shape[0] - 1)
eigenvalues, eigenvectors = np.linalg.eigh(cov)

# 特征值 = σ² / (n-1)
svd_eigenvalues = S**2 / (X.shape[0] - 1)
print(f"\\nSVD 推导特征值: {svd_eigenvalues[::-1]}")
print(f"eigh 计算特征值: {eigenvalues[::-1]}")
print(f"两者一致: {np.allclose(svd_eigenvalues[::-1], eigenvalues[::-1])}")

# 投影数据
X_pca_svd = X @ Vt.T  # 等价于 U @ np.diag(S)
print(f"\\nSVD 投影形状: {X_pca_svd.shape}")`
                },
                {
                    lang: "python",
                    code: `# 对比三种 PCA 实现的数值精度
from sklearn.decomposition import PCA

# 方法一：scikit-learn（SVD 实现）
sklearn_pca = PCA()
X_sklearn = sklearn_pca.fit_transform(X)
variances_sklearn = sklearn_pca.explained_variance_
components_sklearn = sklearn_pca.components_

# 方法二：eigh
idx = np.argsort(eigenvalues)[::-1]
eigenvalues_sorted = eigenvalues[idx]
eigenvectors_sorted = eigenvectors[:, idx]
variances_eigh = eigenvalues_sorted
components_eigh = eigenvectors_sorted.T

# 方法三：SVD
variances_svd = S**2 / (X.shape[0] - 1)
components_svd = Vt

# 验证方差一致性
print("方差对比:")
print(f"  sklearn: {np.round(variances_sklearn, 4)}")
print(f"  eigh:    {np.round(variances_eigh, 4)}")
print(f"  svd:     {np.round(variances_svd, 4)}")
print(f"  全部一致: {np.allclose(variances_sklearn, variances_eigh) and np.allclose(variances_sklearn, variances_svd)}")`
                }
            ],
            table: {
                headers: ["方法", "时间复杂度", "数值稳定性", "适用场景"],
                rows: [
                    ["协方差 + eigh", "O(d²n + d³)", "中（X^T X 条件数平方）", "d 较小的情况"],
                    ["SVD (full)", "O(min(n²d, nd²))", "高", "通用场景"],
                    ["SVD (truncated)", "O(ndk)", "高", "d 很大，只需前 k 个"],
                    ["Randomized SVD", "O(nd log k)", "高", "超大规模数据"],
                ]
            },
            mermaid: `graph LR
    A["数据矩阵 X"] --> B["中心化"]
    B --> C["SVD: X = UΣV^T"]
    C --> D["V^T = 主成分方向"]
    C --> E["Σ²/(n-1) = 特征值"]
    D --> F["投影: Z = X·V"]
    E --> G["方差解释比"]`,
            tip: "scikit-learn 的 PCA 默认使用 SVD，设置 svd_solver='randomized' 可在大数据集上显著加速。",
            warning: "不要显式计算 X^T X 再做特征值分解——条件数会被平方，在病态数据上导致严重的数值不稳定。",
        },
        {
            title: "5. 选择主成分数量——碎石图与累计方差",
            body: `PCA 降维中最关键的超参数是保留多少个主成分 k。选得太大，降维效果不明显；选得太小，会丢失重要信息。实践中有三种常用方法：累计方差解释比例、碎石图（Scree Plot）和交叉验证。累计方差解释比例是最直观的方法——计算前 k 个主成分的累计方差占总方差的比例，通常选择使这个比例超过某个阈值（如 95%）的最小 k 值。

碎石图则提供了更视觉化的判断：绘制每个主成分对应的特征值（或方差解释比例），寻找曲线中的「肘部」（elbow）——肘部之前的主成分携带大量信息，之后的主成分方差贡献急剧下降。肘部对应的 k 就是合理的选择。这个方法源自地质学中的碎石坡比喻——坡上是大石块（高方差主成分），坡下是碎石（低方差主成分）。需要注意的是，并非所有数据集都有明显的肘部，这时应结合业务需求和下游任务的性能来选择。`,
            code: [
                {
                    lang: "python",
                    code: `import numpy as np
import matplotlib.pyplot as plt
from sklearn.datasets import load_digits

# 加载手写数字数据集 (8×8 = 64 维)
X, y = load_digits(return_X_y=True)
X = X - X.mean(axis=0)

# SVD
U, S, Vt = np.linalg.svd(X, full_matrices=False)

# 方差解释比例
explained_variance_ratio = S**2 / np.sum(S**2)
cumulative_variance = np.cumsum(explained_variance_ratio)

fig, axes = plt.subplots(1, 2, figsize=(12, 4))

# 图1: 碎石图
axes[0].plot(range(1, len(explained_variance_ratio) + 1),
             explained_variance_ratio, 'bo-', markersize=4)
axes[0].axvline(x=10, color='r', linestyle='--', alpha=0.7, label='k=10')
axes[0].set_xlabel('Principal Component'); axes[0].set_ylabel('Explained Variance Ratio')
axes[0].set_title('Scree Plot'); axes[0].legend(); axes[0].grid(True, alpha=0.3)

# 图2: 累计方差
axes[1].plot(range(1, len(cumulative_variance) + 1),
             cumulative_variance, 'g-', linewidth=2)
axes[1].axhline(y=0.95, color='r', linestyle='--', alpha=0.7, label='95%')
axes[1].set_xlabel('Number of Components'); axes[1].set_ylabel('Cumulative Variance')
axes[1].set_title('Cumulative Explained Variance'); axes[1].legend()
axes[1].grid(True, alpha=0.3)
plt.tight_layout()
plt.show()

# 自动选择 k（累计方差 >= 95%）
k_95 = np.argmax(cumulative_variance >= 0.95) + 1
print(f"保留 95% 方差需要 {k_95} 个主成分（原始维度 64）")`
                },
                {
                    lang: "python",
                    code: `# 方法三：交叉验证选择 k（基于下游任务性能）
from sklearn.model_selection import cross_val_score
from sklearn.neighbors import KNeighborsClassifier

X, y = load_digits(return_X_y=True)
k_values = [5, 10, 15, 20, 30, 40, 50]
cv_scores = []

for k in k_values:
    pca = PCA(n_components=k)
    X_pca = pca.fit_transform(X)
    knn = KNeighborsClassifier(n_neighbors=5)
    scores = cross_val_score(knn, X_pca, y, cv=5, scoring='accuracy')
    cv_scores.append(scores.mean())
    print(f"k={k:2d}: 交叉验证准确率 = {scores.mean():.4f} (±{scores.std():.4f})")

# 找到最佳 k
best_k = k_values[np.argmax(cv_scores)]
print(f"\\n基于下游任务的最佳主成分数: {best_k}")

plt.figure(figsize=(8, 4))
plt.plot(k_values, cv_scores, 'ro-', linewidth=2, markersize=6)
plt.xlabel('Number of Components'); plt.ylabel('Cross-Val Accuracy')
plt.title('KNN Accuracy vs PCA Components')
plt.grid(True, alpha=0.3)
plt.show()`
                }
            ],
            table: {
                headers: ["方法", "选择标准", "优点", "缺点"],
                rows: [
                    ["累计方差", "≥ 95% 方差", "简单直观", "可能过度保留"],
                    ["碎石图肘部", "方差下降拐点", "可视化判断", "主观、可能无肘部"],
                    ["交叉验证", "下游任务最优", "面向任务", "计算开销大"],
                ]
            },
            mermaid: `graph TD
    A["所有主成分"] --> B["计算累计方差"]
    A --> C["绘制碎石图"]
    A --> D["交叉验证"]
    B --> E["≥ 95%?"]
    C --> F["找到肘部"]
    D --> G["最高准确率"]
    E --> H["确定 k"]
    F --> H
    G --> H
    H --> I["最终降维"]`,
            tip: "对于高维稀疏数据（如 TF-IDF 文本特征），通常前几十个主成分就能解释 90%+ 方差，可以先用累计方差粗筛。",
            warning: "不要盲目追求 99% 方差——在某些场景（如去噪）中，保留 80-90% 方差反而效果更好，因为它丢弃了可能是噪声的小方差方向。",
        },
        {
            title: "6. PCA 的局限性",
            body: `尽管 PCA 应用广泛，但它有几个本质局限。首先是线性假设——PCA 只能发现数据中的线性结构。如果数据分布在一个非线性流形上（如瑞士卷 S-curve），PCA 无法有效展开它。想象一下：把一张弯曲的纸摊平，PCA 只是找到纸在三维空间中的最佳倾斜角度，而不是把纸真正展开。这就是 Kernel PCA、t-SNE、UMAP 等非线性方法存在的理由。

其次，PCA 对异常值极其敏感。协方差矩阵的计算依赖于均值和平方差，几个极端值就能把主成分方向拉偏。这在真实数据中很常见——传感器故障、录入错误、罕见事件都可能产生异常值。解决方案包括使用鲁棒 PCA（RPCA，将数据分解为低秩部分和稀疏异常部分）、先做异常值检测剔除、或使用对异常值不敏感的标准化方法（如分位数标准化）。最后，PCA 假设高方差方向就是「重要」方向，但在分类任务中，最有判别性的方向可能恰恰是方差较小的方向。`,
            code: [
                {
                    lang: "python",
                    code: `import numpy as np
import matplotlib.pyplot as plt

# PCA 在线性 vs 非线性数据上的表现对比
rng = np.random.RandomState(42)

# 线性数据
X_linear = rng.randn(300, 2) @ np.array([[2, 0.5], [0.5, 1]])

# S-curve 非线性流形
t = 1.5 * np.pi * (1 + 2 * rng.rand(300))
x = np.cos(t)
y = rng.rand(300) * 2 - 1
z = np.sin(t)
X_nonlinear = np.column_stack([x, z])  # 投影到 2D 看非线性

# PCA 降维
def pca_1d(X):
    X_c = X - X.mean(axis=0)
    U, S, Vt = np.linalg.svd(X_c, full_matrices=False)
    return X_c @ Vt[0], Vt[0]

z_linear, v1 = pca_1d(X_linear)
z_nonlinear, v2 = pca_1d(X_nonlinear)

fig, axes = plt.subplots(2, 2, figsize=(10, 8))
axes[0, 0].scatter(X_linear[:, 0], X_linear[:, 1], alpha=0.5)
axes[0, 0].arrow(0, 0, v1[0]*3, v1[1]*3, color='red', width=0.05)
axes[0, 0].set_title('Linear Data + PC1'); axes[0, 0].set_aspect('equal')
axes[0, 1].scatter(X_linear[:, 0], X_linear[:, 1], c=z_linear, cmap='viridis')
axes[0, 1].set_title('Linear: PCA Projection')

axes[1, 0].scatter(X_nonlinear[:, 0], X_nonlinear[:, 1], alpha=0.5)
axes[1, 0].arrow(0, 0, v2[0]*3, v2[1]*3, color='red', width=0.05)
axes[1, 0].set_title('S-curve Data + PC1'); axes[1, 0].set_aspect('equal')
axes[1, 1].scatter(X_nonlinear[:, 0], X_nonlinear[:, 1], c=z_nonlinear, cmap='viridis')
axes[1, 1].set_title('S-curve: PCA Fails')
plt.tight_layout()
plt.show()`
                },
                {
                    lang: "python",
                    code: `# 鲁棒 PCA 示例：使用 sklearn 的 RobustScaler + PCA
from sklearn.preprocessing import RobustScaler
from sklearn.decomposition import PCA
from sklearn.datasets import load_iris

X, y = load_iris(return_X_y=True)

# 注入异常值
rng = np.random.RandomState(42)
outlier_idx = rng.choice(len(X), 10, replace=False)
X[outlier_idx] *= 5

# 标准 PCA（受异常值影响）
pca_std = PCA(n_components=2)
X_pca_std = pca_std.fit_transform(X)

# 鲁棒标准化 + PCA
scaler = RobustScaler()  # 使用中位数和四分位距
X_robust = scaler.fit_transform(X)
pca_robust = PCA(n_components=2)
X_pca_robust = pca_robust.fit_transform(X_robust)

# 比较累积方差
print("标准 PCA 方差解释比:", pca_std.explained_variance_ratio_)
print("鲁棒 PCA 方差解释比:", pca_robust.explained_variance_ratio_)
print(f"\\n标准 PCA 总方差保留: {sum(pca_std.explained_variance_ratio_):.4f}")
print(f"鲁棒 PCA 总方差保留: {sum(pca_robust.explained_variance_ratio_):.4f}")`
                }
            ],
            table: {
                headers: ["局限性", "原因", "替代方案"],
                rows: [
                    ["只能捕获线性关系", "基于线性投影", "Kernel PCA / t-SNE / UMAP"],
                    ["对异常值敏感", "协方差使用平方差", "Robust PCA / 先做异常值检测"],
                    ["高方差 ≠ 高判别力", "无监督、不考虑标签", "LDA（线性判别分析）"],
                    ["可解释性差", "主成分是原始特征的组合", "稀疏 PCA / 因子分析"],
                ]
            },
            mermaid: `graph TD
    A["PCA 局限性"] --> B["线性假设"]
    A --> C["异常值敏感"]
    A --> D["方差 ≠ 判别力"]
    B --> E["Kernel PCA"]
    B --> F["t-SNE / UMAP"]
    C --> G["Robust PCA"]
    C --> H["异常值检测 + 剔除"]
    D --> I["LDA 有监督降维"]`,
            tip: "如果数据有明显的类别标签，试试 LDA（线性判别分析）——它在降维的同时最大化类间方差与类内方差的比值。",
            warning: "PCA 不能处理缺失值——数据中如果有 NaN，协方差矩阵计算会失败。需要先做缺失值填充（均值/中位数/KNN 填充）。",
        },
        {
            title: "7. sklearn 实战与可视化",
            body: `scikit-learn 提供了高度优化的 PCA 实现，几行代码即可完成完整的降维流程。实战中有几个关键细节需要注意：PCA 默认在 fit 时自动中心化数据（减去均值），但不会自动标准化——如果你的特征量纲不同（比如一个特征是 0-1 的概率，另一个是 1000-10000 的金额），必须先做 StandardScaler。此外，PCA 的 transform 方法可以处理训练时未见过的数据，这使得 PCA 可以无缝嵌入到 Pipeline 中，避免数据泄露。

下面通过 MNIST 手写数字数据集演示完整的 PCA 流程：降维到 2D 可视化、重建误差分析、以及 Pipeline 集成。这个实战涵盖了 PCA 在真实项目中的典型用法——从数据预处理到模型评估的完整链路。`,
            code: [
                {
                    lang: "python",
                    code: `import numpy as np
import matplotlib.pyplot as plt
from sklearn.datasets import load_digits
from sklearn.decomposition import PCA
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline

# 加载数据
X, y = load_digits(return_X_y=True)
print(f"原始数据形状: {X.shape}")  # (1797, 64)

# Pipeline: 标准化 → PCA
pca_pipeline = Pipeline([
    ('scaler', StandardScaler()),
    ('pca', PCA(n_components=0.95))  # 保留 95% 方差
])

X_reduced = pca_pipeline.fit_transform(X)
pca = pca_pipeline.named_steps['pca']

print(f"降维后形状: {X_reduced.shape}")
print(f"主成分数量: {pca.n_components_}")
print(f"累计方差解释比: {np.sum(pca.explained_variance_ratio_):.4f}")

# 重建误差分析
X_reconstructed = pca_pipeline.inverse_transform(X_reduced)
reconstruction_error = np.mean((X - X_reconstructed)**2)
print(f"平均重构误差: {reconstruction_error:.4f}")`
                },
                {
                    lang: "python",
                    code: `# 2D 可视化 + 重建数字展示
fig, axes = plt.subplots(2, 5, figsize=(14, 6))

# 第一行: 原始数字
for i in range(5):
    axes[0, i].imshow(X[i].reshape(8, 8), cmap='gray')
    axes[0, i].axis('off')
    axes[0, i].set_title(f'Original (label={y[i]})')

# 第二行: PCA 重建（降到 2D 再还原）
pca_2d = PCA(n_components=2)
X_2d = pca_2d.fit_transform(StandardScaler().fit_transform(X))
X_2d_recon = pca_2d.inverse_transform(X_2d)

for i in range(5):
    axes[1, i].imshow(X_2d_recon[i].reshape(8, 8), cmap='gray')
    axes[1, i].axis('off')
    axes[1, i].set_title(f'Reconstructed (2D)')

plt.suptitle('PCA: Original vs 2D Reconstruction', fontsize=14)
plt.tight_layout()
plt.show()

# 降维后可视化
fig, ax = plt.subplots(figsize=(10, 7))
scatter = ax.scatter(X_2d[:, 0], X_2d[:, 1], c=y, cmap='tab10',
                     alpha=0.6, s=30, edgecolors='none')
ax.set_title('MNIST Digits: PCA to 2D')
ax.set_xlabel('PC1')
ax.set_ylabel('PC2')
plt.colorbar(scatter, label='Digit Label')
plt.show()`
                }
            ],
            table: {
                headers: ["Pipeline 步骤", "作用", "关键参数"],
                rows: [
                    ["StandardScaler", "零均值单位方差", "with_mean=True, with_std=True"],
                    ["PCA(n_components=k)", "线性降维", "k=整数/小数(方差比)/'mle'"],
                    ["inverse_transform", "重建回原始空间", "评估信息损失"],
                    ["GridSearchCV", "自动选择最优 k", "param_grid={'pca__n_components': [...]}"],
                ]
            },
            mermaid: `graph LR
    A["原始数据"] --> B["StandardScaler"]
    B --> C["PCA Fit"]
    C --> D["低维表示"]
    C --> E["方差解释分析"]
    D --> F["下游模型"]
    D --> G["可视化"]
    E --> H["调优 k"]
    H --> C
    F --> I["预测/分类"]
    G --> J["洞察发现"]`,
            tip: "将 PCA 嵌入 Pipeline 是最佳实践——它确保交叉验证和测试集只使用训练集计算的变换参数，避免数据泄露。",
            warning: "PCA(n_components='mle') 使用 MLE 自动估计维度，但假设数据来自高斯分布，对非高斯数据可能不准确。",
        },
    ],
};
