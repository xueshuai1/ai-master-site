# LDA 线性判别分析

## 1. 概述

LDA（Linear Discriminant Analysis，线性判别分析）是一种**监督降维算法**，通过最大化类间方差与类内方差的比值，找到最佳投影方向。

**核心思想：** "最大化可分性"——让不同类别尽可能分开。

### 1.1 与 PCA 对比

| 特性 | PCA | LDA |
|------|-----|-----|
| 监督/无监督 | 无监督 | 监督 |
| 目标 | 最大方差 | 最大可分性 |
| 类别信息 | 不使用 | 使用 |
| 降维上限 | 特征数 | 类别数 -1 |

### 1.2 适用场景

- 有监督降维
- 分类预处理
- 特征提取
- 维度压缩

## 2. Python 代码实现

```python
import numpy as np
from sklearn.discriminant_analysis import LinearDiscriminantAnalysis
from sklearn.datasets import load_iris
from sklearn.model_selection import cross_val_score
import matplotlib.pyplot as plt

# 加载数据
iris = load_iris()
X = iris.data
y = iris.target

# LDA 降维
lda = LDA(n_components=2)
X_lda = lda.fit_transform(X, y)

# 可视化
plt.figure(figsize=(10, 6))
for i, color, label in zip(range(3), ['r', 'g', 'b'], iris.target_names):
    plt.scatter(X_lda[y == i, 0], X_lda[y == i, 1], 
               c=color, label=label, alpha=0.6)
plt.xlabel('LD1')
plt.ylabel('LD2')
plt.title('LDA 降维可视化')
plt.legend()
plt.show()

# 作为分类器
lda_clf = LinearDiscriminantAnalysis()
scores = cross_val_score(lda_clf, X, y, cv=5)
print(f"LDA 分类准确率：{scores.mean():.4f}")
```

## 3. 优缺点

**优点：**
- 监督降维
- 增强可分性
- 可用作分类器
- 计算高效

**缺点：**
- 降维上限 C-1
- 假设正态分布
- 对异常值敏感

## 4. 总结

LDA 是监督降维经典算法：

**核心价值：**
1. 最大化类间可分性
2. 监督降维
3. 可用作分类器
4. 计算高效

**适用场景：**
- 有监督降维
- 分类预处理
- 特征提取
