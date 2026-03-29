# t-SNE t-分布随机邻域嵌入

## 1. 概述

t-SNE（t-Distributed Stochastic Neighbor Embedding）是一种**非线性降维算法**，特别适合高维数据的可视化。t-SNE 通过保持局部结构，将高维数据映射到低维空间。

**核心思想：** "保持局部相似性"——相似点在低维空间也相近。

### 1.1 适用场景

- 高维数据可视化
- 探索性数据分析
- 聚类可视化
- 流形学习

### 1.2 与 PCA 对比

| 特性 | PCA | t-SNE |
|------|-----|-------|
| 线性/非线性 | 线性 | 非线性 |
| 全局/局部 | 全局 | 局部 |
| 速度 | 快 | 慢 |
| 可解释性 | 高 | 低 |
| 可视化效果 | 一般 | 优秀 |

## 2. 算法原理

### 2.1 核心思想

1. 高维空间计算点对相似度（高斯分布）
2. 低维空间计算点对相似度（t-分布）
3. 最小化两个分布的 KL 散度

### 2.2 关键参数

- **perplexity**：有效邻居数（5-50）
- **learning_rate**：学习率（通常 200-1000）
- **n_iter**：迭代次数（通常 1000+）

## 3. Python 代码实现

```python
import numpy as np
from sklearn.manifold import TSNE
from sklearn.datasets import load_digits
import matplotlib.pyplot as plt

# 加载数据
digits = load_digits()
X = digits.data
y = digits.target

# t-SNE 降维
tsne = TSNE(
    n_components=2,
    perplexity=30,
    learning_rate=200,
    n_iter=1000,
    random_state=42
)
X_tsne = tsne.fit_transform(X)

# 可视化
plt.figure(figsize=(12, 8))
scatter = plt.scatter(X_tsne[:, 0], X_tsne[:, 1], c=y, cmap='viridis', alpha=0.6)
plt.colorbar(scatter)
plt.title('t-SNE 可视化（手写数字）')
plt.xlabel('t-SNE 1')
plt.ylabel('t-SNE 2')
plt.show()
```

## 4. 参数调优

```python
# 测试不同 perplexity
for perplexity in [5, 15, 30, 50]:
    tsne = TSNE(n_components=2, perplexity=perplexity, random_state=42)
    X_tsne = tsne.fit_transform(X)
    # 可视化比较
```

## 5. 优缺点

**优点：**
- 非线性降维
- 保持局部结构
- 可视化效果好
- 发现流形结构

**缺点：**
- 计算慢
- 参数敏感
- 结果不稳定
- 仅用于可视化

## 6. 总结

t-SNE 是优秀的可视化工具：

**核心价值：**
1. 非线性降维
2. 保持局部结构
3. 优秀可视化
4. 发现聚类

**最佳实践：**
- 先用 PCA 降维到 50 维
- 调整 perplexity（5-50）
- 多次运行检查结果稳定性

**适用场景：**
- 高维数据可视化
- 探索性分析
- 聚类展示
