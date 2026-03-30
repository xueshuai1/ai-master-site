# 生成示例数据

> **分类**: 机器学习 | **编号**: 000 | **更新时间**: 2026-03-30 | **难度**: ⭐⭐

`ML` `机器学习` `AI`

**摘要**: summary: "K-Means 是最常用的聚类算法，考察候选人对无监督学习和聚类分析的理解"

---
---
order: 10
summary: "K-Means 是最常用的聚类算法，考察候选人对无监督学习和聚类分析的理解"
title: "K-Means Clustering (K 均值聚类)"
category: "ML"
roles: [算法工程师，数据科学家，机器学习工程师]
zones: [无监督学习，聚类分析]
difficulty: "⭐⭐⭐"
tags: [K-Means, Clustering, Unsupervised Learning, Elbow Method, Silhouette Score]
source: "https://www.interviewbit.com/machine-learning-interview-questions/, https://www.edureka.co/blog/interview-questions/machine-learning-interview-questions/"
createdAt: "2026-03-29"
---

## 题目描述
请详细解释 K-Means 聚类算法的原理、步骤和优缺点。如何选择最佳的 K 值？K-Means 有什么局限性？与层次聚类、DBSCAN 有什么区别？

## 参考答案

### K-Means 原理

**目标：** 将数据划分为 K 个簇，使簇内样本距离最小化，簇间距离最大化。

**算法步骤：**
1. 随机初始化 K 个聚类中心
2. 将每个样本分配到最近的聚类中心
3. 重新计算每个簇的中心（均值）
4. 重复步骤 2-3 直到收敛

```python
import numpy as np
import matplotlib.pyplot as plt
from sklearn.cluster import KMeans
from sklearn.datasets import make_blobs
from sklearn.metrics import silhouette_score, davies_bouldin_score, calinski_harabasz_score

# 生成示例数据
X, y_true = make_blobs(n_samples=300, centers=4, cluster_std=0.60, random_state=42)

# K-Means 聚类
kmeans = KMeans(
    n_clusters=4,
    init='k-means++',    # 智能初始化
    n_init=10,           # 运行 10 次选最佳
    max_iter=300,
    random_state=42
)
y_kmeans = kmeans.fit_predict(X)

# 可视化
plt.figure(figsize=(12, 5))

plt.subplot(1, 2, 1)
plt.scatter(X[:, 0], X[:, 1], c=y_kmeans, cmap='viridis', s=50, alpha=0.6)
plt.scatter(kmeans.cluster_centers_[:, 0], kmeans.cluster_centers_[:, 1], 
            c='red', s=200, marker='X', label='Centroids')
plt.title('K-Means Clustering')
plt.legend()
plt.grid(True, alpha=0.3)

plt.subplot(1, 2, 2)
plt.scatter(X[:, 0], X[:, 1], c=y_true, cmap='viridis', s=50, alpha=0.6)
plt.title('True Labels')
plt.grid(True, alpha=0.3)

plt.tight_layout()
plt.show()

# 评估指标
print(f"Silhouette Score: {silhouette_score(X, y_kmeans):.4f}")
print(f"Davies-Bouldin Score: {davies_bouldin_score(X, y_kmeans):.4f}")
print(f"Calinski-Harabasz Score: {calinski_harabasz_score(X, y_kmeans):.4f}")
```

### 选择最佳 K 值

#### 方法 1: 肘部法则 (Elbow Method)

```python
# 计算不同 K 值的惯性（簇内平方和）
inertias = []
K_range = range(1, 11)

for k in K_range:
    kmeans = KMeans(n_clusters=k, random_state=42, n_init=10)
    kmeans.fit(X)
    inertias.append(kmeans.inertia_)

# 可视化
plt.figure(figsize=(10, 4))
plt.plot(K_range, inertias, 'bo-', linewidth=2)
plt.xlabel('Number of Clusters (K)')
plt.ylabel('Inertia (Within-cluster SS)')
plt.title('Elbow Method')
plt.grid(True, alpha=0.3)
plt.xticks(K_range)
plt.tight_layout()
plt.show()

# 自动检测肘部
def find_elbow(k_values, inertias):
    """使用 Kneedle 算法检测肘部"""
    # 归一化
    k_norm = np.array(k_values) / max(k_values)
    i_norm = np.array(inertias) / max(inertias)
    
    # 连接首尾的直线
    line_vec = np.array([k_norm[-1] - k_norm[0], i_norm[-1] - i_norm[0]])
    line_len = np.sqrt(np.sum(line_vec**2))
    line_unit = line_vec / line_len
    
    # 计算每个点到直线的距离
    distances = []
    for i, (k, inertia) in enumerate(zip(k_norm, i_norm)):
        point_vec = np.array([k - k_norm[0], inertia - i_norm[0]])
        proj = np.dot(point_vec, line_unit)
        proj_point = k_norm[0] + proj * line_unit[0]
        distance = np.sqrt((k - proj_point)**2 + (inertia - (i_norm[0] + proj * line_unit[1]))**2)
        distances.append(distance)
    
    # 最大距离的点为肘部
    elbow_idx = np.argmax(distances)
    return k_values[elbow_idx]

optimal_k = find_elbow(K_range, inertias)
print(f"Optimal K (Elbow): {optimal_k}")
```

#### 方法 2: 轮廓系数 (Silhouette Score)

```python
silhouette_scores = []
K_range = range(2, 11)  # 至少 2 个簇

for k in K_range:
    kmeans = KMeans(n_clusters=k, random_state=42, n_init=10)
    labels = kmeans.fit_predict(X)
    score = silhouette_score(X, labels)
    silhouette_scores.append(score)

# 可视化
plt.figure(figsize=(10, 4))
plt.plot(K_range, silhouette_scores, 'ro-', linewidth=2)
plt.xlabel('Number of Clusters (K)')
plt.ylabel('Silhouette Score')
plt.title('Silhouette Method')
plt.grid(True, alpha=0.3)
plt.xticks(K_range)
plt.axhline(y=max(silhouette_scores), color='g', linestyle='--', 
            label=f'Best: {max(silhouette_scores):.4f}')
plt.legend()
plt.tight_layout()
plt.show()

optimal_k_silhouette = K_range[np.argmax(silhouette_scores)]
print(f"Optimal K (Silhouette): {optimal_k_silhouette}")
```

#### 方法 3: 轮廓图 (Silhouette Plot)

```python
from sklearn.metrics import silhouette_samples

def plot_silhouette(X, k):
    """绘制轮廓图"""
    kmeans = KMeans(n_clusters=k, random_state=42, n_init=10)
    labels = kmeans.fit_predict(X)
    
    silhouette_vals = silhouette_samples(X, labels)
    
    # 按簇排序
    y_lower = 10
    plt.figure(figsize=(10, 6))
    
    for i in range(k):
        cluster_vals = silhouette_vals[labels == i]
        cluster_vals.sort()
        size = len(cluster_vals)
        y_upper = y_lower + size
        
        plt.fill_betweenx(np.arange(y_lower, y_upper), 0, cluster_vals,
                         alpha=0.7, label=f'Cluster {i}')
        y_lower = y_upper + 10
    
    # 平均轮廓线
    avg_score = silhouette_score(X, labels)
    plt.axvline(x=avg_score, color='red', linestyle='--', label=f'Average: {avg_score:.4f}')
    
    plt.xlabel('Silhouette Coefficient')
    plt.ylabel('Cluster')
    plt.title(f'Silhouette Plot for K={k}')
    plt.legend()
    plt.grid(True, alpha=0.3)
    plt.tight_layout()
    plt.show()

plot_silhouette(X, optimal_k_silhouette)
```

### K-Means 优缺点

| 优点 | 缺点 |
|------|------|
| 简单易懂，实现方便 | 需要预先指定 K |
| 计算效率高，适合大数据 | 对异常值敏感 |
| 收敛保证（局部最优） | 假设簇是凸的（球形） |
| 可解释性强 | 对初始中心敏感 |
| 适用于数值型数据 | 不适合不同密度的簇 |

### K-Means 局限性

```python
# 1. 非球形簇
from sklearn.datasets import make_moons, make_circles

X_moons, _ = make_moons(n_samples=300, noise=0.05, random_state=42)
X_circles, _ = make_circles(n_samples=300, noise=0.05, factor=0.5, random_state=42)

# K-Means 在非球形簇上表现差
kmeans_moons = KMeans(n_clusters=2, random_state=42).fit_predict(X_moons)
kmeans_circles = KMeans(n_clusters=2, random_state=42).fit_predict(X_circles)

fig, axes = plt.subplots(2, 2, figsize=(12, 10))

axes[0, 0].scatter(X_moons[:, 0], X_moons[:, 1], c=kmeans_moons, cmap='viridis', alpha=0.6)
axes[0, 0].set_title('K-Means on Moons')
axes[0, 1].scatter(X_circles[:, 0], X_circles[:, 1], c=kmeans_circles, cmap='viridis', alpha=0.6)
axes[0, 1].set_title('K-Means on Circles')

# DBSCAN 更适合
from sklearn.cluster import DBSCAN

dbscan_moons = DBSCAN(eps=0.2, min_samples=5).fit_predict(X_moons)
dbscan_circles = DBSCAN(eps=0.2, min_samples=5).fit_predict(X_circles)

axes[1, 0].scatter(X_moons[:, 0], X_moons[:, 1], c=dbscan_moons, cmap='viridis', alpha=0.6)
axes[1, 0].set_title('DBSCAN on Moons')
axes[1, 1].scatter(X_circles[:, 0], X_circles[:, 1], c=dbscan_circles, cmap='viridis', alpha=0.6)
axes[1, 1].set_title('DBSCAN on Circles')

plt.tight_layout()
plt.show()

# 2. 异常值敏感
X_outliers = X.copy()
X_outliers = np.vstack([X_outliers, [[10, 10], [-10, -10], [10, -10]]])  # 添加异常值

kmeans_outliers = KMeans(n_clusters=4, random_state=42).fit(X_outliers)
print(f"Cluster centers with outliers: {kmeans_outliers.cluster_centers_}")
```

### 聚类算法对比

```python
from sklearn.cluster import AgglomerativeClustering, DBSCAN, SpectralClustering

# 准备数据
algorithms = {
    'K-Means': KMeans(n_clusters=4, random_state=42),
    'Hierarchical': AgglomerativeClustering(n_clusters=4),
    'DBSCAN': DBSCAN(eps=0.5, min_samples=5),
    'Spectral': SpectralClustering(n_clusters=4, affinity='nearest_neighbors')
}

fig, axes = plt.subplots(2, 2, figsize=(12, 10))
axes = axes.flatten()

for ax, (name, algo) in zip(axes, algorithms.items()):
    try:
        if name == 'K-Means':
            labels = algo.fit_predict(X)
        else:
            labels = algo.fit_predict(X)
        
        ax.scatter(X[:, 0], X[:, 1], c=labels, cmap='viridis', s=50, alpha=0.6)
        ax.set_title(name)
        ax.grid(True, alpha=0.3)
    except Exception as e:
        ax.text(0.5, 0.5, f'Error: {str(e)}', transform=ax.transAxes, ha='center')
        ax.set_title(f'{name} (Failed)')

plt.tight_layout()
plt.show()

# 算法对比表
comparison = """
| 算法 | 适用场景 | 优点 | 缺点 |
|------|---------|------|------|
| K-Means | 球形簇，大数据 | 快速，简单 | 需指定 K，对异常值敏感 |
| 层次聚类 | 小数据，树状结构 | 无需指定 K，可视化好 | 计算慢 O(n³) |
| DBSCAN | 任意形状，有噪声 | 自动找 K，抗噪声 | 参数敏感，密度变化差 |
| 谱聚类 | 非凸，流形 | 灵活，效果好 | 计算贵，需指定 K |
"""
print(comparison)
```

## 考察重点
- ✅ 理解 K-Means 的原理和步骤
- ✅ 掌握 K 值选择方法
- ✅ 了解 K-Means 的局限性
- ✅ 能够对比不同聚类算法
- ✅ 具备实际应用和调优能力

## 延伸题目
- [[DBSCAN 原理与应用]](./ML-026-dbscan.md)
- [[层次聚类详解]](./ML-027-hierarchical-clustering.md)
- [[聚类评估指标]](./ML-028-clustering-metrics.md)

## 延伸追问

### 追问 1: K-Means++ 初始化有什么优势？

**问题：** K-Means++ 如何改进随机初始化？

**答案：**

```python
# K-Means++ 初始化步骤：
# 1. 随机选择第一个中心
# 2. 计算每个点到最近中心的距离 D(x)
# 3. 按 D(x)² 概率选择下一个中心（远的点概率大）
# 4. 重复直到选完 K 个中心

def kmeans_plusplus_init(X, k, random_state=42):
    """K-Means++ 初始化"""
    np.random.seed(random_state)
    n_samples = X.shape[0]
    centers = []
    
    # 1. 随机选第一个中心
    first_idx = np.random.randint(n_samples)
    centers.append(X[first_idx])
    
    # 2-4. 选择剩余中心
    for _ in range(1, k):
        # 计算每个点到最近中心的距离
        distances = np.array([
            min(np.linalg.norm(x - c) ** 2 for c in centers)
            for x in X
        ])
        
        # 按距离平方概率选择
        probs = distances / distances.sum()
        cumprobs = probs.cumsum()
        r = np.random.rand()
        
        for idx, prob in enumerate(cumprobs):
            if r < prob:
                centers.append(X[idx])
                break
    
    return np.array(centers)

# 优势：
# 1. 更好的初始中心（分散）
# 2. 更快收敛
# 3. 更好的最终结果
```

### 追问 2: 如何处理高维数据的聚类？

**问题：** 高维数据聚类有什么挑战？

**答案：**

```python
# 高维挑战：距离集中现象
# 所有点之间的距离趋于相似

from sklearn.decomposition import PCA

# 解决方案：

# 1. 降维后聚类
pca = PCA(n_components=0.95)
X_reduced = pca.fit_transform(X_high_dim)
kmeans = KMeans(n_clusters=5).fit(X_reduced)

# 2. 特征选择
from sklearn.feature_selection import VarianceThreshold
selector = VarianceThreshold(threshold=0.1)
X_selected = selector.fit_transform(X_high_dim)

# 3. 使用适合高维的算法
from sklearn.cluster import SpectralClustering
spectral = SpectralClustering(n_clusters=5, affinity='nearest_neighbors')

# 4. 子空间聚类
# 在不同特征子空间上分别聚类
```

### 追问 3: K-Means 能用于异常检测吗？

**问题：** 如何用 K-Means 检测异常值？

**答案：**

```python
# 方法：距离聚类中心远的点是异常值

kmeans = KMeans(n_clusters=5, random_state=42)
kmeans.fit(X)

# 计算每个点到最近中心的距离
distances = np.min(
    np.linalg.norm(X[:, np.newaxis] - kmeans.cluster_centers_, axis=2),
    axis=1
)

# 设定阈值（如 95 百分位）
threshold = np.percentile(distances, 95)
outliers = distances > threshold

print(f"Detected {np.sum(outliers)} outliers")

# 可视化
plt.figure(figsize=(8, 6))
plt.scatter(X[~outliers, 0], X[~outliers, 1], c='blue', alpha=0.6, label='Normal')
plt.scatter(X[outliers, 0], X[outliers, 1], c='red', alpha=0.6, label='Outlier')
plt.scatter(kmeans.cluster_centers_[:, 0], kmeans.cluster_centers_[:, 1], 
            c='black', marker='X', s=200, label='Centroids')
plt.title('K-Means for Outlier Detection')
plt.legend()
plt.grid(True, alpha=0.3)
plt.tight_layout()
plt.show()

# 或者使用专门的异常检测算法
from sklearn.ensemble import IsolationForest
iso_forest = IsolationForest(contamination=0.05, random_state=42)
outliers_iso = iso_forest.fit_predict(X) == -1
```

## 深入理解

**K-Means 适用场景：**
- 数据量大
- 簇是凸的（球形）
- 簇大小相近
- 需要快速聚类

**不适用场景：**
- 非球形簇
- 簇大小差异大
- 有异常值
- 不知道 K

## 更新历史
- v1 (2026-03-29): 初始版本
