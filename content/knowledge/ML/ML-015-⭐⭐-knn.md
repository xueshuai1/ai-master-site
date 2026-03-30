# 生成数据

> **分类**: 机器学习 | **编号**: 000 | **更新时间**: 2026-03-30 | **难度**: ⭐⭐

`ML` `机器学习` `AI`

**摘要**: summary: "KNN 是简单的惰性学习算法，考察候选人对距离度量和实例学习的理解"

---
---
order: 15
summary: "KNN 是简单的惰性学习算法，考察候选人对距离度量和实例学习的理解"
title: "K-Nearest Neighbors (K 近邻)"
category: "ML"
roles: [算法工程师，数据科学家，机器学习工程师]
zones: [监督学习，惰性学习]
difficulty: "⭐⭐"
tags: [KNN, Distance Metrics, Lazy Learning, Classification, Regression]
source: "https://www.interviewbit.com/machine-learning-interview-questions/"
createdAt: "2026-03-29"
---

## 题目描述
请解释 KNN 算法的原理。如何选择 K 值？常用的距离度量有哪些？KNN 的优缺点是什么？

## 参考答案

### KNN 原理

**核心思想：** "物以类聚"——相似样本有相似标签

**算法步骤：**
1. 计算测试样本与所有训练样本的距离
2. 选择 K 个最近的邻居
3. 分类：多数投票；回归：平均

```python
import numpy as np
from sklearn.neighbors import KNeighborsClassifier, KNeighborsRegressor
from sklearn.datasets import make_classification
from sklearn.model_selection import cross_val_score

# 生成数据
X, y = make_classification(n_samples=200, n_features=5, random_state=42)

# KNN 分类
knn_clf = KNeighborsClassifier(
    n_neighbors=5,
    weights='uniform',      # 或 'distance'
    metric='minkowski',     # 闵可夫斯基距离
    p=2,                    # p=2 为欧氏距离
    n_jobs=-1
)
knn_clf.fit(X, y)

# KNN 回归
knn_reg = KNeighborsRegressor(n_neighbors=5)
knn_reg.fit(X, y)

print(f"Classification accuracy: {knn_clf.score(X, y):.4f}")
```

### 选择 K 值

```python
from sklearn.model_selection import cross_val_score
import matplotlib.pyplot as plt

# 肘部法则选择 K
k_range = range(1, 31)
cv_scores = []

for k in k_range:
    knn = KNeighborsClassifier(n_neighbors=k)
    scores = cross_val_score(knn, X, y, cv=5)
    cv_scores.append(scores.mean())

# 可视化
plt.figure(figsize=(10, 4))
plt.plot(k_range, cv_scores, 'o-')
plt.xlabel('K')
plt.ylabel('CV Accuracy')
plt.title('K Value Selection')
plt.grid(True, alpha=0.3)
plt.xticks(k_range)
plt.tight_layout()
plt.show()

optimal_k = k_range[np.argmax(cv_scores)]
print(f"Optimal K: {optimal_k}")

# 经验法则
# - K 小：低偏差，高方差（复杂边界）
# - K 大：高偏差，低方差（平滑边界）
# - 通常选择 sqrt(n_samples)
# - 使用奇数避免平票
```

### 距离度量

```python
from scipy.spatial import distance

# 1. 欧氏距离 (Euclidean)
# d = sqrt(Σ(xi - yi)²)
d_euclidean = distance.euclidean([1, 2], [4, 6])

# 2. 曼哈顿距离 (Manhattan)
# d = Σ|xi - yi|
d_manhattan = distance.cityblock([1, 2], [4, 6])

# 3. 闵可夫斯基距离 (Minkowski)
# d = (Σ|xi - yi|^p)^(1/p)
d_minkowski = distance.minkowski([1, 2], [4, 6], p=3)

# 4. 余弦相似度 (Cosine)
# similarity = (x·y) / (||x|| × ||y||)
d_cosine = distance.cosine([1, 2], [4, 6])

# 5. 汉明距离 (Hamming)
# 不同位置的比例
d_hamming = distance.hamming([1, 0, 1], [1, 1, 0])

print(f"Euclidean: {d_euclidean:.4f}")
print(f"Manhattan: {d_manhattan:.4f}")
print(f"Cosine: {d_cosine:.4f}")

# 选择建议：
# - 欧氏：连续特征，各向同性
# - 曼哈顿：高维，稀疏
# - 余弦：文本，方向重要
```

### 优缺点

| 优点 | 缺点 |
|------|------|
| 简单易懂 | 计算成本高（预测时） |
| 无需训练 | 内存占用大 |
| 天然多分类 | 需要特征缩放 |
| 对异常值鲁棒 | 高维效果差 |
| 非线性边界 | K 值选择关键 |

## 考察重点
- ✅ 理解 KNN 原理
- ✅ 掌握 K 值选择
- ✅ 了解距离度量
- ✅ 理解优缺点
- ✅ 能够应用 KNN

## 更新历史
- v1 (2026-03-29): 初始版本
