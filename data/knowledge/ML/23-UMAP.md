# UMAP 统一流形逼近与投影

## 1. 概述

UMAP（Uniform Manifold Approximation and Projection）是一种现代**非线性降维算法**，基于流形学习和拓扑理论。相比 t-SNE，UMAP 更快且能更好地保持全局结构。

**核心思想：** "流形学习"——假设数据是高维流形的采样。

### 1.1 与 t-SNE 对比

| 特性 | t-SNE | UMAP |
|------|-------|------|
| 速度 | 慢 | 快 |
| 全局结构 | 差 | 好 |
| 可扩展性 | 差 | 好 |
| 理论支持 | 启发式 | 流形理论 |

### 1.2 适用场景

- 高维数据可视化
- 降维预处理
- 聚类分析
- 大规模数据

## 2. Python 代码实现

```python
import numpy as np
import umap
from sklearn.datasets import load_digits
import matplotlib.pyplot as plt

# 加载数据
digits = load_digits()
X = digits.data
y = digits.target

# UMAP 降维
reducer = umap.UMAP(
    n_components=2,
    n_neighbors=15,
    min_dist=0.1,
    random_state=42
)
X_umap = reducer.fit_transform(X)

# 可视化
plt.figure(figsize=(12, 8))
scatter = plt.scatter(X_umap[:, 0], X_umap[:, 1], c=y, cmap='viridis', alpha=0.6)
plt.colorbar(scatter)
plt.title('UMAP 可视化')
plt.show()
```

## 3. 参数说明

| 参数 | 说明 | 推荐值 |
|------|------|--------|
| `n_neighbors` | 邻居数 | 5-50 |
| `min_dist` | 最小距离 | 0.01-0.5 |
| `n_components` | 目标维度 | 2-3 |
| `metric` | 距离度量 | 'euclidean' |

## 4. 优缺点

**优点：**
- 速度快
- 保持全局结构
- 可扩展性好
- 理论支持强

**缺点：**
- 参数需要调优
- 结果有随机性
- 需要安装额外库

## 5. 总结

UMAP 是现代降维算法：

**核心价值：**
1. 快速非线性降维
2. 保持全局和局部结构
3. 可扩展到大数据
4. 理论支持强

**适用场景：**
- 高维可视化
- 降维预处理
- 大规模数据
